const { prisma } = require('../config/database');
const logger = require('../config/logger');

async function logAuditAction({ userId = null, action, resourceType, resourceId = null, ipHash = null, metadata = {} }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        ipHash,
        metadata,
      },
    });
  } catch (err) {
    logger.error('Failed to create audit log entry:', err);
  }
}

module.exports = {
  logAuditAction,
};
