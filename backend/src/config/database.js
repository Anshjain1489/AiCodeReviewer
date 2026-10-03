const { db, admin } = require('./firebase');
const logger = require('./logger');

async function connectDatabase() {
  try {
    // Perform a lightweight Firestore operation to verify connectivity
    await db.collection('healthcheck').limit(1).get();
    logger.info('Successfully verified connectivity to Firebase Firestore.');
  } catch (error) {
    if (error.code === 16 || (error.message && error.message.includes('UNAUTHENTICATED'))) {
      logger.error('-----------------------------------------------------------------------');
      logger.error('FIREBASE AUTHENTICATION ERROR (16 UNAUTHENTICATED)');
      logger.error('Google Cloud rejected the provided Firebase credentials.');
      logger.error('Please verify FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY on Render.');
      logger.error('-----------------------------------------------------------------------');
    } else {
      logger.error('Failed to connect to Firebase Firestore:', error.message || error);
    }
  }
}

module.exports = {
  db,
  admin,
  connectDatabase,
};
