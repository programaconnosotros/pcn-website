import prisma from '@/lib/prisma';
import { updateProfile } from '@/actions/update-profile';
import type { ProfileFormData } from '@/schemas/profile-schema';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, quickUser } from '@/test/db/actions-fixtures';

// Edición del perfil contra Postgres real: qué columnas cambian, cómo se reemplazan los puestos y
// lenguajes, y qué campos sensibles nunca se tocan aunque lleguen en el payload.

jest.spyOn(console, 'error').mockImplementation(() => {});

const profile = (overrides: Partial<ProfileFormData> = {}): ProfileFormData => ({
  name: 'Nombre Editado',
  email: 'ignorado@test.pcn',
  phoneNumber: '+54 9 11 5555',
  image: 'https://cdn.example.com/foto.webp',
  countryOfOrigin: 'Argentina',
  province: 'Mendoza',
  xAccountUrl: '',
  linkedinUrl: 'https://linkedin.com/in/alguien',
  gitHubUrl: 'https://github.com/alguien',
  instagramUrl: '',
  youtubeUrl: '',
  twitchUrl: '',
  kickUrl: '',
  slogan: 'Aprendiendo todos los días',
  positions: [
    { jobTitle: 'Backend Dev', enterprise: 'Acme' },
    { jobTitle: '', enterprise: 'Sin cargo, se descarta' },
    { jobTitle: 'Docente', enterprise: '' },
  ],
  career: 'Sistemas',
  studyPlace: 'UTN',
  programmingLanguages: [
    { languageId: 'typescript', color: '#3178c6', logo: 'ts.svg' },
    { languageId: 'go', color: '#00add8', logo: 'go.svg' },
  ],
  ...overrides,
});

describe('updateProfile', () => {
  it('saves the profile, mirrors the first position and replaces positions and languages', async () => {
    const user = await quickUser();
    await prisma.userPosition.create({
      data: { userId: user.id, jobTitle: 'Puesto viejo', order: 0 },
    });
    await prisma.userLanguage.create({
      data: { userId: user.id, language: 'cobol', color: '#000', logo: 'cobol.svg' },
    });
    await actAs(user.id);

    await updateProfile(profile());

    const stored = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        positions: { orderBy: { order: 'asc' } },
        languages: { orderBy: { language: 'asc' } },
      },
    });
    expect(stored).toMatchObject({
      name: 'Nombre Editado',
      email: user.email,
      phoneNumber: '+54 9 11 5555',
      province: 'Mendoza',
      xAccountUrl: null,
      linkedinUrl: 'https://linkedin.com/in/alguien',
      jobTitle: 'Backend Dev',
      enterprise: 'Acme',
      slogan: 'Aprendiendo todos los días',
    });
    expect(
      stored.positions.map(({ jobTitle, enterprise, order }) => ({ jobTitle, enterprise, order })),
    ).toEqual([
      { jobTitle: 'Backend Dev', enterprise: 'Acme', order: 0 },
      { jobTitle: 'Docente', enterprise: null, order: 1 },
    ]);
    expect(stored.languages.map((language) => language.language)).toEqual(['go', 'typescript']);
    expect(expiredModel('User')).toBe(true);
    expect(expiredModel('UserPosition')).toBe(true);
  });

  it('clears positions and languages, and the mirrored job, when none are sent', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await updateProfile(profile());

    await updateProfile(profile({ positions: [], programmingLanguages: [] }));

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(stored.jobTitle).toBeNull();
    expect(stored.enterprise).toBeNull();
    expect(await prisma.userPosition.count({ where: { userId: user.id } })).toBe(0);
    expect(await prisma.userLanguage.count({ where: { userId: user.id } })).toBe(0);
  });

  it('only touches the session user’s rows', async () => {
    const user = await quickUser();
    const other = await quickUser();
    await prisma.userPosition.create({
      data: { userId: other.id, jobTitle: 'Intacto', order: 0 },
    });
    await actAs(user.id);

    await updateProfile(profile());

    expect(await prisma.userPosition.count({ where: { userId: other.id } })).toBe(1);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: other.id } })).name).toBe(
      other.name,
    );
  });

  it('ignores role, emailVerified, password and the email sent in the payload', async () => {
    const user = await quickUser();
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: false } });
    const before = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      omit: { password: false },
    });
    await actAs(user.id);

    await updateProfile({
      ...profile({ email: `robado-${user.id}@test.pcn` }),
      role: 'ADMIN',
      emailVerified: true,
      password: 'hackeado',
      isCofounder: true,
    } as unknown as ProfileFormData);

    const after = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      omit: { password: false },
    });
    expect(after).toMatchObject({
      role: 'REGULAR',
      emailVerified: false,
      isCofounder: false,
      email: before.email,
      password: before.password,
      name: 'Nombre Editado',
    });
  });

  it.each([
    ['a too short name', { name: 'Al' }],
    ['a non-https image', { image: 'javascript:alert(1)' }],
    ['an invalid social URL', { gitHubUrl: 'no es una url' }],
    ['more than five positions', { positions: Array(6).fill({ jobTitle: 'X', enterprise: '' }) }],
    ['a slogan over 500 characters', { slogan: 'x'.repeat(501) }],
  ])('rejects %s without changing anything', async (_case, override) => {
    const user = await quickUser();
    await prisma.userPosition.create({
      data: { userId: user.id, jobTitle: 'Original', order: 0 },
    });
    await actAs(user.id);

    await expect(updateProfile(profile(override as Partial<ProfileFormData>))).rejects.toThrow();

    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).name).toBe(user.name);
    expect(
      (await prisma.userPosition.findMany({ where: { userId: user.id } })).map((p) => p.jobTitle),
    ).toEqual(['Original']);
  });

  it('redirects anonymous visitors home without writing', async () => {
    await actAs();
    const slogan = `Anónimo ${Date.now()}`;

    await expect(updateProfile(profile({ slogan }))).rejects.toThrow('NEXT_REDIRECT:/');
    expect(await prisma.user.count({ where: { slogan } })).toBe(0);
  });

  it('redirects a revoked session home without writing', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await prisma.session.deleteMany({ where: { userId: user.id } });

    await expect(updateProfile(profile())).rejects.toThrow('NEXT_REDIRECT:/');
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).name).toBe(user.name);
  });
});
