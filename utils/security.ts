import { v4 as uuidv4 } from 'uuid';
import Cryptr from 'cryptr';

/**
 * SecureStorage class for encrypting and decrypting values.
 * This class ensures a single instance of encryption keys and generates a secret key using uuid.
 */
export class SecureStorage {
  private static instance: SecureStorage | null = null;
  private cryptr: Cryptr;

  /**
   * Private constructor to prevent multiple instances. 
   * The secret key is generated using uuid when the instance is first created.
   */
  private constructor() {
    const secretKey = uuidv4();
    this.cryptr = new Cryptr(secretKey);
  }

  /**
   * Returns the singleton instance of SecureStorage. If no instance exists, it creates one.
   * @returns The singleton instance of SecureStorage.
   */
  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Encrypts a given value and returns the encrypted value.
   * @param key - The identifier for the data (e.g., 'AWS_ACCESS_KEY_ID').
   * @param value - The sensitive value to be encrypted (e.g., actual AWS key).
   * @returns The encrypted value.
   */
  store(key: string, value: string): string {
    return this.cryptr.encrypt(value);
  }

  /**
   * Retrieves and decrypts a value using the provided key.
   * @param key - The encrypted value to be decrypted.
   * @returns The decrypted value.
   * @throws Error if the decryption fails or the key is invalid.
   */
  retrieve(key: string): string {
    if (!key) {
      throw new Error('Key must be provided');
    }

    try {
      return this.cryptr.decrypt(key);
    } catch (error) {
      throw new Error('Failed to decrypt the value. The key might be invalid or tampered with.');
    }
  }
}
