import { GET } from './route';

describe('GET /api/captcha', () => {
  it('hands out a new signed challenge that is never cached', async () => {
    const response = await GET();
    const challenge = await response.json();

    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(challenge.parameters).toMatchObject({ algorithm: 'PBKDF2/SHA-256' });
    expect(challenge.signature).toEqual(expect.any(String));
    expect((await (await GET()).json()).parameters.nonce).not.toBe(challenge.parameters.nonce);
  });
});
