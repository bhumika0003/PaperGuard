import crypto from 'crypto';
import fs from 'fs';

/**
 * Generate SHA-256 hash string for a file buffer or stream
 * @param {Buffer} fileBuffer 
 * @returns {string} SHA-256 hex string
 */
export const generateFileHash = (fileBuffer) => {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

/**
 * Generate SHA-256 hash string for text content
 * @param {string} text 
 * @returns {string} SHA-256 hex string
 */
export const generateTextHash = (text) => {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
};

/**
 * Verify if a given file buffer matches an expected SHA-256 hash
 * @param {Buffer} fileBuffer 
 * @param {string} expectedHash 
 * @returns {boolean}
 */
export const verifyIntegrity = (fileBuffer, expectedHash) => {
  const currentHash = generateFileHash(fileBuffer);
  return currentHash.toLowerCase() === expectedHash.toLowerCase();
};
