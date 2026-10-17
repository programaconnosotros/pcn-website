import { randomBytes } from 'node:crypto';
import {
  TWO_FACTOR_KEY_ENV,
  configuredTwoFactorKey,
  decryptTwoFactorSecret,
  encryptTwoFactorSecret,
} from './two-factor-crypto';

const env = process.env as Record<string, string | undefined>;
const original = { key: env[TWO_FACTOR_KEY_ENV], nodeEnv: env.NODE_ENV };

afterEach(() => {
  env[TWO_FACTOR_KEY_ENV] = original.key;
  env.NODE_ENV = original.nodeEnv;
});

describe('two-factor secret encryption', () => {
  it('round-trips, with a fresh IV each time', () => {
    const a = encryptTwoFactorSecret('JBSWY3DPEHPK3PXP', 'user-1');
    const b = encryptTwoFactorSecret('JBSWY3DPEHPK3PXP', 'user-1');
    expect(a).toMatch(/^v1:[\w-]+:[\w-]+:[\w-]+$/);
    expect(a).not.toBe(b);
    expect(a).not.toContain('JBSWY3DPEHPK3PXP');
    expect(decryptTwoFactorSecret(a, 'user-1')).toBe('JBSWY3DPEHPK3PXP');
    expect(decryptTwoFactorSecret(b, 'user-1')).toBe('JBSWY3DPEHPK3PXP');
  });

  it("doesn't open for another user, a tampered value, another key or plain text", () => {
    const stored = encryptTwoFactorSecret('JBSWY3DPEHPK3PXP', 'user-1');
    expect(decryptTwoFactorSecret(stored, 'user-2')).toBeNull();

    const [version, iv, tag, ciphertext] = stored.split(':');
    const flipped = Buffer.from(ciphertext, 'base64url');
    flipped[0] ^= 1;
    expect(
      decryptTwoFactorSecret([version, iv, tag, flipped.toString('base64url')].join(':'), 'user-1'),
    ).toBeNull();

    env[TWO_FACTOR_KEY_ENV] = randomBytes(32).toString('base64');
    expect(decryptTwoFactorSecret(stored, 'user-1')).toBeNull();

    expect(decryptTwoFactorSecret('JBSWY3DPEHPK3PXP', 'user-1')).toBeNull();
  });

  it('uses the configured key when there is one', () => {
    env[TWO_FACTOR_KEY_ENV] = randomBytes(32).toString('base64');
    const stored = encryptTwoFactorSecret('JBSWY3DPEHPK3PXP', 'user-1');
    expect(decryptTwoFactorSecret(stored, 'user-1')).toBe('JBSWY3DPEHPK3PXP');
  });

  it('accepts only 32-byte base64 keys', () => {
    expect(configuredTwoFactorKey(randomBytes(32).toString('base64'))).toHaveLength(32);
    expect(configuredTwoFactorKey(randomBytes(16).toString('base64'))).toBeNull();
    expect(configuredTwoFactorKey('')).toBeNull();
    expect(configuredTwoFactorKey(undefined)).toBeNull();
  });

  it('refuses to work in production without a key, loudly', () => {
    const stored = encryptTwoFactorSecret('JBSWY3DPEHPK3PXP', 'user-1');
    delete env[TWO_FACTOR_KEY_ENV];
    env.NODE_ENV = 'production';
    expect(() => encryptTwoFactorSecret('JBSWY3DPEHPK3PXP', 'user-1')).toThrow(TWO_FACTOR_KEY_ENV);
    expect(() => decryptTwoFactorSecret(stored, 'user-1')).toThrow(TWO_FACTOR_KEY_ENV);
  });
});
