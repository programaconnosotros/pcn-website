import bcrypt from 'bcryptjs';
import { BCRYPT_COST, DUMMY_PASSWORD_HASH, hashPassword, needsRehash } from './password';

describe('password hashing', () => {
  it('hashes with the current cost', async () => {
    const hash = await hashPassword('secret-password');

    expect(bcrypt.getRounds(hash)).toBe(BCRYPT_COST);
    await expect(bcrypt.compare('secret-password', hash)).resolves.toBe(true);
  });

  it('flags hashes made with a lower cost, which still verify', async () => {
    const oldHash = await bcrypt.hash('secret-password', 4);

    expect(needsRehash(oldHash)).toBe(true);
    await expect(bcrypt.compare('secret-password', oldHash)).resolves.toBe(true);
  });

  it('leaves current hashes alone', () => {
    const currentHash = bcrypt.hashSync('secret-password', BCRYPT_COST);

    expect(needsRehash(currentHash)).toBe(false);
  });

  it('keeps the dummy hash at the current cost, so unknown emails take as long as real ones', () => {
    expect(bcrypt.getRounds(DUMMY_PASSWORD_HASH)).toBe(BCRYPT_COST);
  });
});
