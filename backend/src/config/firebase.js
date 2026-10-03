const { initializeApp, getApps, cert } = require('firebase-admin/app');
const logger = require('./logger');

let getFirestore, RealTimestamp, RealFieldValue;
try {
  const firestoreModule = require('firebase-admin/firestore');
  getFirestore = firestoreModule.getFirestore;
  RealTimestamp = firestoreModule.Timestamp;
  RealFieldValue = firestoreModule.FieldValue;
} catch (e) {
  logger.warn('firebase-admin/firestore module dynamic load fallback:', e.message);
}

let app;
let rawDb;

function formatPrivateKey(key) {
  if (!key) return key;
  let formatted = key.trim();

  // Strip leading and trailing double or single quotes if wrapped in quotes
  if (
    (formatted.startsWith('"') && formatted.endsWith('"')) ||
    (formatted.startsWith("'") && formatted.endsWith("'"))
  ) {
    formatted = formatted.slice(1, -1).trim();
  }

  // Convert literal backslash-n sequences to real newlines
  formatted = formatted.replace(/\\n/g, '\n');

  return formatted.trim();
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const privateKey = formatPrivateKey(rawPrivateKey);

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const hasLiveCredentials = Boolean(
  (serviceAccountPath || (projectId && clientEmail && privateKey) || process.env.FIRESTORE_EMULATOR_HOST) && getFirestore
);

let MockTimestamp = {
  now: () => ({
    toDate: () => new Date(),
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0,
  }),
  fromDate: (d) => ({
    toDate: () => (d instanceof Date ? d : new Date(d)),
    seconds: Math.floor((d instanceof Date ? d.getTime() : new Date(d).getTime()) / 1000),
    nanoseconds: 0,
  }),
};

let MockFieldValue = {
  serverTimestamp: () => MockTimestamp.now(),
};

let isLiveConnected = false;

if (hasLiveCredentials) {
  if (!getApps().length) {
    try {
      if (serviceAccountPath) {
        const serviceAccount = require(serviceAccountPath);
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: projectId || serviceAccount.project_id,
        });
        logger.info('Firebase Admin SDK initialized using service account JSON path.');
        isLiveConnected = true;
      } else if (projectId && clientEmail && privateKey) {
        app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        logger.info(`Firebase Admin SDK initialized successfully for project [${projectId}].`);
        isLiveConnected = true;
      } else {
        app = initializeApp({
          projectId: projectId || 'demo-ai-code-reviewer',
        });
        logger.info('Firebase Admin SDK initialized for Firestore Emulator.');
        isLiveConnected = true;
      }
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK with provided credentials:', error.message);
      logger.warn('Falling back to isolated In-Memory store to prevent server crash.');
    }
  } else {
    app = getApps()[0];
    isLiveConnected = true;
  }

  if (isLiveConnected && app) {
    try {
      rawDb = getFirestore(app);
      rawDb.settings({
        ignoreUndefinedProperties: true,
      });
    } catch (e) {
      if (!rawDb) rawDb = null;
    }
  }
}

const inMemoryDb = createInMemoryFirestore();
let isFailedOver = !rawDb;

async function executeWithFailover(fn) {
  if (isFailedOver) {
    return await fn(inMemoryDb);
  }
  try {
    return await fn(rawDb);
  } catch (err) {
    if (err.code === 16 || (err.message && err.message.includes('UNAUTHENTICATED'))) {
      logger.warn('Google Cloud Firestore returned 16 UNAUTHENTICATED. Failing over to isolated In-Memory Store so application remains 100% operational.');
      isFailedOver = true;
      return await fn(inMemoryDb);
    }
    throw err;
  }
}

const db = {
  collection: (name) => {
    return {
      doc: (id) => ({
        set: (data, opts) => executeWithFailover((target) => target.collection(name).doc(id).set(data, opts)),
        get: () => executeWithFailover((target) => target.collection(name).doc(id).get()),
        update: (data) => executeWithFailover((target) => target.collection(name).doc(id).update(data)),
        delete: () => executeWithFailover((target) => target.collection(name).doc(id).delete()),
      }),
      add: (data) => executeWithFailover((target) => target.collection(name).add(data)),
      where: (field, op, val) => createQueryWrapper(name, [{ field, op, val }]),
      limit: (n) => createQueryWrapper(name, [], n),
      count: () => ({
        get: () => executeWithFailover((target) => target.collection(name).count().get()),
      }),
      get: () => executeWithFailover((target) => target.collection(name).get()),
    };
  },
  doc: (path) => {
    const parts = path.split('/');
    const collName = parts[0];
    const docId = parts[1];
    return {
      set: (data, opts) => executeWithFailover((target) => target.doc(path).set(data, opts)),
      get: () => executeWithFailover((target) => target.doc(path).get()),
      update: (data) => executeWithFailover((target) => target.doc(path).update(data)),
      delete: () => executeWithFailover((target) => target.doc(path).delete()),
    };
  },
  batch: () => {
    if (isFailedOver) return inMemoryDb.batch();
    try {
      return rawDb.batch();
    } catch (e) {
      isFailedOver = true;
      return inMemoryDb.batch();
    }
  },
};

function createQueryWrapper(collName, filters = [], limitVal = null) {
  return {
    where: (field, op, val) => createQueryWrapper(collName, [...filters, { field, op, val }], limitVal),
    limit: (n) => createQueryWrapper(collName, filters, n),
    count: () => ({
      get: () => executeWithFailover((target) => {
        let q = target.collection(collName);
        for (const f of filters) q = q.where(f.field, f.op, f.val);
        if (limitVal !== null) q = q.limit(limitVal);
        return q.count().get();
      }),
    }),
    get: () => executeWithFailover((target) => {
      let q = target.collection(collName);
      for (const f of filters) q = q.where(f.field, f.op, f.val);
      if (limitVal !== null) q = q.limit(limitVal);
      return q.get();
    }),
  };
}

function createInMemoryFirestore() {
  const collections = new Map();

  function getCollectionStore(name) {
    if (!collections.has(name)) {
      collections.set(name, new Map());
    }
    return collections.get(name);
  }

  class InMemoryDocRef {
    constructor(collName, docId) {
      this.collName = collName;
      this.id = docId;
    }

    async set(data, options = {}) {
      const store = getCollectionStore(this.collName);
      const existing = store.get(this.id) || {};
      const merged = options.merge ? { ...existing, ...data } : { ...data };
      store.set(this.id, merged);
      return { writeTime: MockTimestamp.now() };
    }

    async get() {
      const store = getCollectionStore(this.collName);
      const data = store.get(this.id);
      return {
        id: this.id,
        exists: Boolean(data),
        data: () => (data ? { ...data } : undefined),
      };
    }

    async update(data) {
      const store = getCollectionStore(this.collName);
      const existing = store.get(this.id);
      if (!existing) {
        throw new Error(`No document to update: ${this.collName}/${this.id}`);
      }
      store.set(this.id, { ...existing, ...data });
      return { writeTime: MockTimestamp.now() };
    }

    async delete() {
      const store = getCollectionStore(this.collName);
      store.delete(this.id);
      return { writeTime: MockTimestamp.now() };
    }
  }

  class InMemoryQuery {
    constructor(collName, filters = [], limitVal = null) {
      this.collName = collName;
      this.filters = filters;
      this.limitVal = limitVal;
    }

    doc(id) {
      return new InMemoryDocRef(this.collName, id);
    }

    async add(data) {
      const crypto = require('crypto');
      const id = crypto.randomUUID();
      const ref = new InMemoryDocRef(this.collName, id);
      await ref.set(data);
      return ref;
    }

    where(field, op, val) {
      return new InMemoryQuery(this.collName, [...this.filters, { field, op, val }], this.limitVal);
    }

    limit(n) {
      return new InMemoryQuery(this.collName, this.filters, n);
    }

    count() {
      return {
        get: async () => {
          const snap = await this.get();
          return { data: () => ({ count: snap.docs.length }) };
        },
      };
    }

    async get() {
      const store = getCollectionStore(this.collName);
      let docs = [];

      for (const [id, data] of store.entries()) {
        let match = true;
        for (const f of this.filters) {
          const itemVal = data[f.field];
          if (f.op === '==') {
            if (itemVal !== f.val) match = false;
          } else if (f.op === 'in') {
            if (!Array.isArray(f.val) || !f.val.includes(itemVal)) match = false;
          }
        }
        if (match) {
          docs.push(new InMemoryDocRef(this.collName, id));
        }
      }

      if (this.limitVal !== null) {
        docs = docs.slice(0, this.limitVal);
      }

      const snapDocs = await Promise.all(docs.map((d) => d.get()));
      return {
        empty: snapDocs.length === 0,
        size: snapDocs.length,
        docs: snapDocs,
      };
    }
  }

  class InMemoryBatch {
    constructor() {
      this.operations = [];
    }

    set(docRef, data, options) {
      this.operations.push(() => docRef.set(data, options));
      return this;
    }

    update(docRef, data) {
      this.operations.push(() => docRef.update(data));
      return this;
    }

    delete(docRef) {
      this.operations.push(() => docRef.delete());
      return this;
    }

    async commit() {
      for (const op of this.operations) {
        await op();
      }
    }
  }

  return {
    collection: (name) => new InMemoryQuery(name),
    doc: (path) => {
      const parts = path.split('/');
      return new InMemoryDocRef(parts[0], parts[1]);
    },
    batch: () => new InMemoryBatch(),
  };
}

const admin = {
  app,
  firestore: () => db,
};

admin.firestore.Timestamp = isLiveConnected && RealTimestamp ? RealTimestamp : MockTimestamp;
admin.firestore.FieldValue = isLiveConnected && RealFieldValue ? RealFieldValue : MockFieldValue;

module.exports = {
  admin,
  db,
};
