const { db, admin } = require('./firebase');
const logger = require('./logger');

async function connectDatabase() {
  try {
    // Perform a lightweight Firestore operation to verify connectivity
    await db.collection('healthcheck').limit(1).get();
    logger.info('Successfully verified connectivity to Firebase Firestore.');
  } catch (error) {
    logger.error('Failed to connect to Firebase Firestore:', error);
    // Don't throw fatal crash during dev if offline mock mode is active, but log error
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

module.exports = {
  db,
  admin,
  connectDatabase,
};
