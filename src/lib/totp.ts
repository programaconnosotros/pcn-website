import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Time-based one-time passwords (RFC 6238, the 6-digit codes of Google Authenticator, 1Password,
// Authy...) for the optional second factor, with node:crypto only.

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const TOTP_PERIOD_SECONDS = 30;
const DIGITS = 6;
/** Steps accepted on each side of now, for phones whose clock drifts a little. */
const WINDOW = 1;

export const base32Encode = (bytes: Buffer) => {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
};

export const base32Decode = (text: string) => {
  const clean = text.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index === -1) throw new Error('Invalid base32');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
};

/** A new 160-bit secret, base32 as authenticator apps expect it. */
export const generateTotpSecret = () => base32Encode(randomBytes(20));

export const timeStep = (now = Date.now()) => Math.floor(now / 1000 / TOTP_PERIOD_SECONDS);

/** The code for one time step (HOTP, RFC 4226). */
export const totpAt = (secret: string, step: number, digits = DIGITS) => {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 10 ** digits).padStart(digits, '0');
};

const sameCode = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/**
 * The time step `code` matches around now, or null. Callers store the step and reject any code at
 * or before it, so a code can't be used twice.
 */
export const verifyTotp = (secret: string, code: string, now = Date.now()) => {
  const digits = code.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(digits)) return null;
  const current = timeStep(now);
  for (let offset = -WINDOW; offset <= WINDOW; offset++) {
    if (sameCode(totpAt(secret, current + offset), digits)) return current + offset;
  }
  return null;
};

/** The URI authenticator apps read from the QR code. */
export const otpauthUri = (secret: string, account: string, issuer = 'programaConNosotros') =>
  `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?${new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  })}`;

/** Ten single-use recovery codes like `k7f2-9qxm`, for when the phone is lost. */
export const generateRecoveryCodes = (count = 10) =>
  Array.from({ length: count }, () => {
    const raw = base32Encode(randomBytes(5)).toLowerCase();
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
  });

/** How recovery codes are stored: hashed, normalized so dashes and case don't matter. */
export const hashRecoveryCode = (code: string) =>
  createHash('sha256')
    .update(code.replace(/[^a-z0-9]/gi, '').toLowerCase())
    .digest('hex');
