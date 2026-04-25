import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_STORAGE_ENCRYPTION_KEY || 'default-secret-key';

export const secureStorage = {
  setItem: (key: string, value: string) => {
    const encrypted = CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
    localStorage.setItem(key, encrypted);
  },
  getItem: (key: string): string | null => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      return null; // Handle decryption failure
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};