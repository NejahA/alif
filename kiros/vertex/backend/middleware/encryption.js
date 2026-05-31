import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

export function generateIV() {
  return crypto.randomBytes(16).toString('hex');
}

export function encryptFile(fileBuffer, key, iv) {
  const keyBuffer = Buffer.from(key, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, ivBuffer);
  
  let encrypted = cipher.update(fileBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return encrypted;
}

export function decryptFile(encryptedBuffer, key, iv) {
  const keyBuffer = Buffer.from(key, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, ivBuffer);
  
  let decrypted = decipher.update(encryptedBuffer);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted;
}
