import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

// The TOTP secret has to be readable to check a code, so it can't be hashed like a password: it's
// stored encrypted (AES-256-GCM) with TWO_FACTOR_ENCRYPTION_KEY, which lives in the deploy secrets
// and never in the database. A leaked database or backup alone doesn't give the codes away.
// The user's id goes in as associated data, so a ciphertext copied onto another row won't open.

export const TWO_FACTOR_KEY_ENV = 'TWO_FACTOR_ENCRYPTION_KEY';
const VERSION = 'v1';
const IV_BYTES = 12;

/** Outside production, a fixed key so dev, worktrees and tests work with no setup. */
const DEV_KEY = createHash('sha256').update('pcn-dev-two-factor-key').digest();

/** The configured key: 32 bytes in base64 (`openssl rand -base64 32`). Null if missing or bad. */
export const configuredTwoFactorKey = (value = process.env[TWO_FACTOR_KEY_ENV]) => {
  if (!value) return null;
  const key = Buffer.from(value, 'base64');
  return key.length === 32 ? key : null;
};

const encryptionKey = () => {
  const key = configuredTwoFactorKey();
  if (key) return key;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${TWO_FACTOR_KEY_ENV} is missing or isn't 32 bytes in base64`);
  }
  return DEV_KEY;
};

/** `v1:<iv>:<tag>:<ciphertext>`, each part base64url. */
export const encryptTwoFactorSecret = (secret: string, userId: string) => {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  cipher.setAAD(Buffer.from(userId));
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return [VERSION, iv, cipher.getAuthTag(), ciphertext]
    .map((part) => (typeof part === 'string' ? part : part.toString('base64url')))
    .join(':');
};

/** The secret back, or null if it was tampered with, belongs to another user or used another key. */
export const decryptTwoFactorSecret = (stored: string, userId: string) => {
  const [version, iv, tag, ciphertext, ...rest] = stored.split(':');
  if (version !== VERSION || !iv || !tag || !ciphertext || rest.length) return null;
  // Outside the try: a missing key must fail loudly, not look like a wrong code.
  const key = encryptionKey();
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
    decipher.setAAD(Buffer.from(userId));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return null;
  }
};
