const { db, admin } = require('../config/database');
const crypto = require('crypto');

function formatUser(doc) {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : new Date()),
  };
}

class UserRepository {
  async findByEmail(email) {
    if (!email) return null;
    const normalizedEmail = email.toLowerCase().trim();
    const snapshot = await db.collection('users').where('email', '==', normalizedEmail).limit(1).get();
    if (snapshot.empty) return null;
    return formatUser(snapshot.docs[0]);
  }

  async findById(id) {
    if (!id) return null;
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return null;
    const user = formatUser(doc);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      provider: user.provider || 'email',
      role: user.role || 'USER',
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create({ name, email, passwordHash, avatarUrl, provider = 'email', role = 'USER' }) {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Explicit email uniqueness check for Firestore
    const existing = await this.findByEmail(normalizedEmail);
    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const userId = crypto.randomUUID();
    const now = admin.firestore.Timestamp.now();
    const userData = {
      name,
      email: normalizedEmail,
      passwordHash: passwordHash || null,
      avatarUrl: avatarUrl || null,
      provider,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection('users').doc(userId).set(userData);

    return {
      id: userId,
      name,
      email: normalizedEmail,
      avatarUrl: userData.avatarUrl,
      provider,
      role,
      createdAt: now.toDate(),
    };
  }

  async update(id, data) {
    const userRef = db.collection('users').doc(id);
    const updatePayload = {
      ...data,
      updatedAt: admin.firestore.Timestamp.now(),
    };
    await userRef.update(updatePayload);

    const updatedDoc = await userRef.get();
    const user = formatUser(updatedDoc);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      updatedAt: user.updatedAt,
    };
  }
}

module.exports = new UserRepository();
