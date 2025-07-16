import { EncryptionService } from "../encryption";

describe("EncryptionService", () => {
  const testData = "sensitive-data-123";
  const testObject = {
    password: "my-secret-password",
    apiKey: "sk_test_123456789",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  };

  describe("encrypt and decrypt", () => {
    it("should encrypt and decrypt a string correctly", () => {
      const encrypted = EncryptionService.encrypt(testData);
      const decrypted = EncryptionService.decrypt(encrypted);

      expect(encrypted).not.toBe(testData);
      expect(decrypted).toBe(testData);
    });

    it("should handle empty strings", () => {
      const encrypted = EncryptionService.encrypt("");
      const decrypted = EncryptionService.decrypt("");

      expect(encrypted).toBe("");
      expect(decrypted).toBe("");
    });

    it("should handle null/undefined gracefully", () => {
      const encrypted = EncryptionService.encrypt(null as any);
      const decrypted = EncryptionService.decrypt(null as any);

      expect(encrypted).toBe("");
      expect(decrypted).toBe("");
    });
  });

  describe("encryptObject and decryptObject", () => {
    it("should encrypt and decrypt object fields correctly", () => {
      const fieldsToEncrypt: (keyof typeof testObject)[] = ["password", "apiKey", "token"];

      const encrypted = EncryptionService.encryptObject(testObject, fieldsToEncrypt);
      const decrypted = EncryptionService.decryptObject(encrypted, fieldsToEncrypt);

      // Check that sensitive fields are encrypted
      expect(encrypted.password).not.toBe(testObject.password);
      expect(encrypted.apiKey).not.toBe(testObject.apiKey);
      expect(encrypted.token).not.toBe(testObject.token);

      // Check that decrypted fields match original
      expect(decrypted.password).toBe(testObject.password);
      expect(decrypted.apiKey).toBe(testObject.apiKey);
      expect(decrypted.token).toBe(testObject.token);
    });

    // it("should handle objects with missing fields", () => {
    //   const partialObject = { password: "secret" };
    //   const fieldsToEncrypt = ["password", "apiKey"] as string[];

    //   const encrypted = EncryptionService.encryptObject(partialObject, fieldsToEncrypt);
    //   const decrypted = EncryptionService.decryptObject(encrypted, fieldsToEncrypt);

    //   expect(encrypted.password).not.toBe(partialObject.password);
    //   expect(decrypted.password).toBe(partialObject.password);
    //   expect((encrypted as any).apiKey).toBeUndefined();
    //   expect((decrypted as any).apiKey).toBeUndefined();
    // });
  });

  describe("error handling", () => {
    it("should handle invalid encrypted data gracefully", () => {
      const decrypted = EncryptionService.decrypt("invalid-encrypted-data");
      expect(decrypted).toBe("");
    });

    it("should handle corrupted encrypted data gracefully", () => {
      const encrypted = EncryptionService.encrypt(testData);
      const corrupted = encrypted.slice(0, -10); // Remove last 10 characters
      const decrypted = EncryptionService.decrypt(corrupted);
      expect(decrypted).toBe("");
    });
  });
});
