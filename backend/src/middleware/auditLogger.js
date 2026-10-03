const { db, admin } = require('../config/database');
const logger = require('../config/logger');

async function logAuditAction({ userId = null, action, resourceType, resourceId = null, ipHash = null, metadata = {} }) {
  try {
    const now = admin.firestore.Timestamp.now();
    await db.collection('auditLogs').add({
      userId,
      action,
      resourceType,
      resourceId,
      ipHash,
      metadata,
      createdAt: now,
    });
  } catch (err) {
    logger.error('Failed to create audit log entry in Firestore:', err);
  }
}

module.exports = {
  logAuditAction,
};
