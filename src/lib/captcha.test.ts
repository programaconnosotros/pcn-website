import { solveChallenge } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { createCaptchaChallenge, verifyCaptcha } from './captcha';

// What the widget submits: the challenge and its solution, as base64 JSON.
const solve = async () => {
  const challenge = await createCaptchaChallenge();
  const solution = await solveChallenge({ challenge, deriveKey });
  return Buffer.from(JSON.stringify({ challenge, solution })).toString('base64');
};

jest.setTimeout(30_000);

describe('captcha', () => {
  it('accepts a solved challenge only once', async () => {
    const payload = await solve();

    await expect(verifyCaptcha(payload)).resolves.toBe(true);
    // Replaying it for another sign-in doesn't work
    await expect(verifyCaptcha(payload)).resolves.toBe(false);
  });

  it('rejects missing, garbage and tampered payloads', async () => {
    await expect(verifyCaptcha(undefined)).resolves.toBe(false);
    await expect(verifyCaptcha('no-es-base64-json')).resolves.toBe(false);
    await expect(verifyCaptcha('x'.repeat(20_000))).resolves.toBe(false);

    const { challenge, solution } = JSON.parse(Buffer.from(await solve(), 'base64').toString());
    // A cheaper challenge than the one we signed
    const tampered = { ...challenge, parameters: { ...challenge.parameters, cost: 1 } };
    await expect(
      verifyCaptcha(
        Buffer.from(JSON.stringify({ challenge: tampered, solution })).toString('base64'),
      ),
    ).resolves.toBe(false);
  });
});
