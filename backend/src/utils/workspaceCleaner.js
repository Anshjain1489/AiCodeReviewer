const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

function cleanTemporaryWorkspace(dirPath) {
  if (!dirPath || !dirPath.includes('temp_workspaces')) return;
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      logger.info(`Successfully cleaned isolated temporary workspace: ${dirPath}`);
    }
  } catch (err) {
    logger.warn(`Failed to clean temporary workspace ${dirPath}:`, err.message);
  }
}

module.exports = {
  cleanTemporaryWorkspace,
};
