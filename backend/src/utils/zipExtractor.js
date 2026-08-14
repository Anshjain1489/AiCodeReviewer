const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { AppError } = require('./responseFormatter');

const MAX_EXTRACTED_FILES = 500;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50MB

function extractZipSafely(zipBuffer, targetDir) {
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();

  if (zipEntries.length > MAX_EXTRACTED_FILES) {
    throw new AppError(`Archive contains too many files (max ${MAX_EXTRACTED_FILES}).`, 400, 'FILE_COUNT_EXCEEDED');
  }

  let totalSize = 0;
  for (const entry of zipEntries) {
    totalSize += entry.header.size;
    if (totalSize > MAX_TOTAL_BYTES) {
      throw new AppError(`Extracted archive exceeds size limit of 50MB.`, 400, 'FILE_SIZE_EXCEEDED');
    }

    // Zip slip path traversal protection
    const targetFilePath = path.join(targetDir, entry.entryName);
    if (!targetFilePath.startsWith(path.resolve(targetDir))) {
      throw new AppError('Illegal zip path traversal detected in archive.', 400, 'PATH_TRAVERSAL_DETECTED');
    }
  }

  zip.extractAllTo(targetDir, true);
}

module.exports = {
  extractZipSafely,
};
