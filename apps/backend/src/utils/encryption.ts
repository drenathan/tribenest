import crypto from "crypto";
import { JWT_SECRET } from "@src/config/secrets";

export class EncryptionService {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  static encrypt(text: string): string {
    if (!text) return "";

    const iv = crypto.randomBytes(this.IV_LENGTH);
    const key = crypto.scryptSync(JWT_SECRET, "salt", 32);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Combine IV + Tag + Encrypted data
    return iv.toString("hex") + tag.toString("hex") + encrypted;
  }

  /**
   * Decrypt sensitive data using AES-256-GCM
   */
  static decrypt(encryptedText: string): string {
    if (!encryptedText) return "";

    try {
      const key = crypto.scryptSync(JWT_SECRET, "salt", 32);

      // Extract IV, tag, and encrypted data
      const iv = Buffer.from(encryptedText.slice(0, this.IV_LENGTH * 2), "hex");
      const tag = Buffer.from(encryptedText.slice(this.IV_LENGTH * 2, (this.IV_LENGTH + this.TAG_LENGTH) * 2), "hex");
      const encrypted = encryptedText.slice((this.IV_LENGTH + this.TAG_LENGTH) * 2);

      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Decryption failed:", error);
      return "";
    }
  }

  /**
   * Encrypt an object's sensitive fields
   */
  static encryptObject<T extends Record<string, string | null>>(obj: T, fieldsToEncrypt: (keyof T)[]): T {
    const encrypted = { ...obj };

    for (const field of fieldsToEncrypt) {
      if (encrypted[field]) {
        encrypted[field] = this.encrypt(encrypted[field]) as any;
      }
    }

    return encrypted;
  }

  /**
   * Decrypt an object's sensitive fields
   */
  static decryptObject<T extends Record<string, string | null>>(obj: T, fieldsToDecrypt: (keyof T)[]): T {
    const decrypted = { ...obj };

    for (const field of fieldsToDecrypt) {
      if (decrypted[field]) {
        decrypted[field] = this.decrypt(decrypted[field]) as any;
      }
    }

    return decrypted;
  }
}
