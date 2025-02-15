import Cryptr from 'cryptr';
/**
 * SecureStorage class for encrypting and decrypting values.
 * Used for securely storing sensitive information like environment keys.
 */
export class SecureStorage {
  private cryptr: Cryptr;

  /**
   * Constructor to initialize the Cryptr instance with a secret key.
   * @param secretKey - The key used for encryption and decryption. 
   * It must be kept secure and not hardcoded in production.
   */
  constructor(secretKey: string) {
    this.cryptr = new Cryptr(secretKey); // Initialize Cryptr with the secret key
  }

  /**
   * Encrypts a given value and stores it in memory.
   * @param key - The identifier for the data (e.g., 'AWS_ACCESS_KEY_ID').
   * @param value - The sensitive value to be encrypted (e.g., actual AWS key).
   * @returns The encrypted value.
   */
  store(key: string, value: string): string {
    return this.cryptr.encrypt(value); // Encrypt and return the encrypted value
  }

  /**
   * Retrieves and decrypts a value using the provided key.
   * @param key - The encrypted value to be decrypted.
   * @returns The decrypted value.
   * @throws Error if the decryption fails or the key is invalid.
   */
  retrieve(key: string): string {
    if (!key) {
      throw new Error('Key must be provided'); // Throw error if key is not provided
    }

    try {
      return this.cryptr.decrypt(key); // Attempt to decrypt the value
    } catch (error) {
      // If decryption fails, throw an error with a descriptive message
      throw new Error('Failed to decrypt the value. The key might be invalid or tampered with.');
    }
  }
}
