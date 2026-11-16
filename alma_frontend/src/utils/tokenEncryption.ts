/**
 * Token Encryption Utilities
 *
 * Uses the Web Crypto API (available in Next.js Edge / Node.js 18+) to
 * AES-GCM encrypt/decrypt the backend JWT before it is stored in the
 * next-auth session cookie. This means the raw JWT is never exposed to
 * the browser — only the opaque encrypted blob is in the cookie, and the
 * decryption key lives exclusively in the server environment.
 */

const KEY_ENV = "TOKEN_ENCRYPTION_KEY";

/**
 * Derive a CryptoKey from the plaintext env string.
 * The key is cached per process lifetime.
 */
let _cachedKey: CryptoKey | null = null;

async function getDerivedKey(): Promise<CryptoKey> {
  if (_cachedKey) return _cachedKey;

  const rawKey = process.env[KEY_ENV];
  if (!rawKey) {
    throw new Error(
      `[tokenEncryption] ${KEY_ENV} is not set in environment variables.`
    );
  }

  // Use the first 32 bytes of the UTF-8 encoded key string
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(rawKey.padEnd(32, "0").slice(0, 32));

  _cachedKey = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );

  return _cachedKey;
}

/**
 * Encrypt a plaintext string (e.g. a JWT) with AES-256-GCM.
 * Returns a base64url-encoded string of  iv(12 bytes) + ciphertext.
 */
export async function encryptToken(plaintext: string): Promise<string> {
  const key = await getDerivedKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // Combine iv + ciphertext into a single Uint8Array
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);

  // Encode as base64url (safe for cookies / JSON)
  return Buffer.from(combined).toString("base64url");
}

/**
 * Decrypt a base64url-encoded AES-256-GCM blob back to plaintext.
 * Returns the original plaintext JWT string, or null on failure.
 */
export async function decryptToken(encrypted: string): Promise<string | null> {
  try {
    const key = await getDerivedKey();
    const combined = Buffer.from(encrypted, "base64url");

    const iv = combined.subarray(0, 12);
    const ciphertext = combined.subarray(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}
