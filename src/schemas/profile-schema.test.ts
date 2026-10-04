import { profileSchema } from './profile-schema';

const profile = {
  name: 'Ana Pérez',
  email: 'ana@example.com',
  positions: [],
  programmingLanguages: [],
};

const messages = (input: unknown) =>
  profileSchema.safeParse(input).error?.issues.map((issue) => issue.message) ?? [];

describe('profileSchema', () => {
  it('accepts a minimal profile', () => {
    expect(profileSchema.safeParse(profile).success).toBe(true);
  });

  it('turns empty or missing social links into null', () => {
    const parsed = profileSchema.parse({ ...profile, gitHubUrl: '', linkedinUrl: null });
    expect(parsed.gitHubUrl).toBeNull();
    expect(parsed.linkedinUrl).toBeNull();
    expect(parsed.xAccountUrl).toBeNull();
  });

  it('keeps valid social links and rejects invalid ones', () => {
    expect(
      profileSchema.parse({ ...profile, youtubeUrl: 'https://youtube.com/@pcn' }).youtubeUrl,
    ).toBe('https://youtube.com/@pcn');
    expect(messages({ ...profile, twitchUrl: 'no es url' })).toEqual(['La URL debe ser válida']);
  });

  it('only accepts https images', () => {
    expect(profileSchema.safeParse({ ...profile, image: '' }).success).toBe(true);
    expect(profileSchema.safeParse({ ...profile, image: 'https://cdn/x.png' }).success).toBe(true);
    expect(messages({ ...profile, image: 'javascript:alert(1)' })).toEqual([
      'La imagen debe ser una URL https',
    ]);
  });

  it('caps free texts and the number of positions', () => {
    expect(messages({ ...profile, slogan: 'a'.repeat(501) })).toEqual(['Máximo 500 caracteres']);
    const position = { jobTitle: 'Dev', enterprise: 'ACME' };
    expect(messages({ ...profile, positions: Array(6).fill(position) })).toEqual([
      'Podés cargar hasta 5 puestos',
    ]);
    expect(
      messages({ ...profile, positions: [{ jobTitle: 'a'.repeat(81), enterprise: '' }] }),
    ).toEqual(['Máximo 80 caracteres']);
  });

  it('rejects a short name and an invalid email', () => {
    expect(messages({ ...profile, name: 'Al', email: 'ana' })).toEqual([
      'El nombre debe tener al menos 3 caracteres',
      'El email debe ser válido',
    ]);
  });
});
