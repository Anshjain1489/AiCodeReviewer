const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp: RealTimestamp, FieldValue: RealFieldValue } = require('firebase-admin/firestore');
const logger = require('./logger');

let app;
let db;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const hasLiveCredentials = Boolean(serviceAccountPath || (projectId && clientEmail && privateKey) || process.env.FIRESTORE_EMULATOR_HOST);

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
      } else if (projectId && clientEmail && privateKey) {
        app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        logger.info(`Firebase Admin SDK initialized successfully for project [${projectId}].`);
      } else {
        app = initializeApp({
          projectId: projectId || 'demo-ai-code-reviewer',
        });
        logger.info('Firebase Admin SDK initialized for Firestore Emulator.');
      }
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);

  try {
    db.settings({
      ignoreUndefinedProperties: true,
    });
  } catch (e) {
    // Settings already applied
  }
} else {
  logger.info('Using isolated In-Memory Firestore Store for test/development mode (No live GCP credentials provided).');
  db = createInMemoryFirestore();
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

admin.firestore.Timestamp = hasLiveCredentials ? RealTimestamp : MockTimestamp;
admin.firestore.FieldValue = hasLiveCredentials ? RealFieldValue : MockFieldValue;

module.exports = {
  admin,
  db,
};
