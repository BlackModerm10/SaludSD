import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'saludsd_encryption_secret_key_32_bytes_long_primary_care';
const IV_KEY = process.env.ENCRYPTION_IV || 'saludsd_fixed_iv';

// Derive 32-byte key and 16-byte IV deterministically
const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
const iv = crypto.createHash('md5').update(IV_KEY).digest(); // md5 returns 16 bytes

/**
 * Encrypts a string deterministically using AES-256-CBC.
 */
export function encrypt(text: string): string {
  if (!text) return text;
  const normalized = text.trim();
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(normalized, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypts a hex string. Falls back to original text if not encrypted.
 */
export function decrypt(hexText: string): string {
  if (!hexText) return hexText;
  
  // Hex matching check
  if (!/^[0-9a-fA-F]+$/.test(hexText) || hexText.length % 2 !== 0) {
    return hexText;
  }
  
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(hexText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return hexText; // Fallback
  }
}
