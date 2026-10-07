import {
  base32Decode,
  base32Encode,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  otpauthUri,
  totpAt,
  verifyTotp,
} from './totp';

// RFC 6238 appendix B: the ASCII secret "12345678901234567890" with SHA-1
const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890'));

describe('totp', () => {
  it('matches the RFC 6238 test vectors', () => {
    expect(totpAt(RFC_SECRET, Math.floor(59 / 30), 8)).toBe('94287082');
    expect(totpAt(RFC_SECRET, Math.floor(1111111109 / 30), 8)).toBe('07081804');
    expect(totpAt(RFC_SECRET, Math.floor(2000000000 / 30), 8)).toBe('69279037');
    expect(totpAt(RFC_SECRET, Math.floor(59 / 30))).toBe('287082');
  });

  it('round-trips base32 and makes 160-bit secrets', () => {
    const bytes = Buffer.from('hola mundo!');
    expect(base32Decode(base32Encode(bytes))).toEqual(bytes);
    expect(base32Decode('jbsw y3dp')).toEqual(Buffer.from('Hello'));
    expect(() => base32Decode('no!')).toThrow('Invalid base32');
    expect(generateTotpSecret()).toMatch(/^[A-Z2-7]{32}$/);
  });

  it('accepts the current code and its neighbours, returning the step it matched', () => {
    const secret = generateTotpSecret();
    const now = 1_700_000_000_000;
    const step = Math.floor(now / 30_000);
    expect(verifyTotp(secret, totpAt(secret, step), now)).toBe(step);
    expect(verifyTotp(secret, totpAt(secret, step - 1), now)).toBe(step - 1);
    expect(verifyTotp(secret, totpAt(secret, step + 1).replace(/(\d{3})/, '$1 '), now)).toBe(
      step + 1,
    );
    expect(verifyTotp(secret, totpAt(secret, step - 2), now)).toBeNull();
    expect(verifyTotp(secret, '12345', now)).toBeNull();
    expect(verifyTotp(secret, 'abcdef', now)).toBeNull();
  });

  it('builds the otpauth URI apps scan', () => {
    const uri = otpauthUri('ABC', 'ana@pcn.com');
    expect(uri).toMatch(/^otpauth:\/\/totp\/programaConNosotros%3Aana%40pcn\.com\?/);
    expect(new URL(uri).searchParams.get('secret')).toBe('ABC');
  });

  it('makes distinct recovery codes and hashes them ignoring case and dashes', () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
    for (const code of codes) expect(code).toMatch(/^[a-z2-7]{4}-[a-z2-7]{4}$/);
    expect(hashRecoveryCode('ABCD-efgh')).toBe(hashRecoveryCode('abcdefgh'));
  });
});
