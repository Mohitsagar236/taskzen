import CryptoJS from 'crypto-js';

export function encryptData(data: any, password: string): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
}

export function decryptData(encryptedData: string, password: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    throw new Error('Failed to decrypt data. Invalid password.');
  }
}

export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}