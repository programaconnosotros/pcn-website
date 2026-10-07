import { checkSecondFactor, consumeSecondFactor } from './two-factor';
import { generateTotpSecret, hashRecoveryCode, timeStep, totpAt } from './totp';

const secret = generateTotpSecret();
const user = (overrides = {}) => ({
  twoFactorSecret: secret,
  twoFactorRecoveryCodes: [hashRecoveryCode('abcd-efgh'), hashRecoveryCode('ijkl-mnop')],
  twoFactorLastStep: null as number | null,
  ...overrides,
});

describe('checkSecondFactor', () => {
  it('takes a fresh app code and remembers its step', () => {
    const step = timeStep();
    const check = checkSecondFactor(user(), totpAt(secret, step));
    expect(check).toEqual({ ok: true, kind: 'totp', step });
    expect(consumeSecondFactor(check as never)).toEqual({ twoFactorLastStep: step });
  });

  it('refuses a code from a step already used', () => {
    const step = timeStep();
    expect(checkSecondFactor(user({ twoFactorLastStep: step }), totpAt(secret, step))).toEqual({
      ok: false,
    });
  });

  it('takes a recovery code once, whatever its case or dashes', () => {
    const check = checkSecondFactor(user(), 'ABCDEFGH');
    expect(check).toEqual({
      ok: true,
      kind: 'recovery',
      remaining: [hashRecoveryCode('ijkl-mnop')],
    });
    expect(consumeSecondFactor(check as never)).toEqual({
      twoFactorRecoveryCodes: [hashRecoveryCode('ijkl-mnop')],
    });
    expect(checkSecondFactor(user(), 'zzzz-zzzz')).toEqual({ ok: false });
  });

  it('fails without a secret or a code', () => {
    expect(checkSecondFactor(user({ twoFactorSecret: null }), '123456')).toEqual({ ok: false });
    expect(checkSecondFactor(user(), '   ')).toEqual({ ok: false });
  });
});
