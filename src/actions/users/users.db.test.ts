import prisma from '@/lib/prisma';
import { setUserRole } from '@/actions/users/set-user-role';
import { setAmbassador } from '@/actions/users/set-ambassador';
import { setCofounder } from '@/actions/users/set-cofounder';
import { getUsers } from '@/actions/users/get-users';
import { fetchCommunityMembers } from '@/actions/users/fetch-community-members';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import { getUserForSpeaker, searchUsersForSpeaker } from '@/actions/users/search-users-for-speaker';
import { getUserSummary } from '@/actions/users/get-user-summary';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, makeAdvice, quickUser, uid } from '@/test/db/actions-fixtures';

// Administración de usuarios, directorio y búsquedas contra Postgres real.

const roleOf = async (id: string) => (await prisma.user.findUniqueOrThrow({ where: { id } })).role;

describe('setUserRole', () => {
  it('lets an admin promote and demote another user', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const user = await quickUser();
    await actAs(admin.id);

    await expect(setUserRole(user.id, 'ADMIN')).resolves.toEqual({ success: true });
    expect(await roleOf(user.id)).toBe('ADMIN');
    expect(expiredModel('User')).toBe(true);

    await setUserRole(user.id, 'REGULAR');
    expect(await roleOf(user.id)).toBe('REGULAR');
  });

  it('does not let an admin demote themselves', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);

    await expect(setUserRole(admin.id, 'REGULAR')).resolves.toEqual({
      success: false,
      error: 'No podés quitarte el rol de admin a vos mismo',
    });
    expect(await roleOf(admin.id)).toBe('ADMIN');
  });

  it('rejects a role that does not exist', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const user = await quickUser();
    await actAs(admin.id);

    await expect(setUserRole(user.id, 'SUPERADMIN' as 'ADMIN')).rejects.toThrow('Rol inválido');
    expect(await roleOf(user.id)).toBe('REGULAR');
  });

  it.each([
    ['a regular user', 'REGULAR' as const],
    ['an anonymous visitor', null],
  ])('forbids %s, even promoting themselves', async (_case, role) => {
    const caller = await quickUser();
    await actAs(role ? caller.id : undefined);

    await expect(setUserRole(caller.id, 'ADMIN')).rejects.toThrow('No autorizado');
    expect(await roleOf(caller.id)).toBe('REGULAR');
  });

  it('fails for a user that does not exist', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);

    await expect(setUserRole('no-existe', 'ADMIN')).rejects.toThrow('Usuario no encontrado');
  });
});

describe.each([
  ['setAmbassador', setAmbassador, 'isAmbassador'],
  ['setCofounder', setCofounder, 'isCofounder'],
] as const)('%s', (_name, action, field) => {
  const flagOf = async (id: string) =>
    (await prisma.user.findUniqueOrThrow({ where: { id } }))[field];

  it('lets an admin turn the flag on and off', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const user = await quickUser();
    await actAs(admin.id);

    await expect(action(user.id, true)).resolves.toEqual({ success: true });
    expect(await flagOf(user.id)).toBe(true);
    await action(user.id, false);
    expect(await flagOf(user.id)).toBe(false);
  });

  it('forbids a regular user', async () => {
    const user = await quickUser();
    await actAs(user.id);

    await expect(action(user.id, true)).rejects.toThrow('No autorizado');
    expect(await flagOf(user.id)).toBe(false);
  });

  it('fails for a user that does not exist', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);

    await expect(action('no-existe', true)).rejects.toThrow('Usuario no encontrado');
  });
});

describe('getUsers', () => {
  it('lists every user, newest first, without password hashes', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const older = await prisma.user.create({
      data: {
        name: 'Más vieja',
        email: `vieja-${uid()}@test.pcn`,
        password: 'x',
        createdAt: new Date('2020-01-01'),
        languages: { create: { language: 'ts', color: '#00f', logo: 'ts.svg' } },
      },
    });
    await actAs(admin.id);

    const users = await getUsers();

    const ids = users.map((user) => user.id);
    expect(ids.indexOf(admin.id)).toBeLessThan(ids.indexOf(older.id));
    const dates = users.map((user) => user.createdAt.getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
    expect(users.find((user) => user.id === older.id)?.languages).toEqual([
      { language: 'ts', color: '#00f', logo: 'ts.svg' },
    ]);
    expect(users.every((user) => !('password' in user))).toBe(true);
  });

  it('forbids regular users and anonymous visitors', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await expect(getUsers()).rejects.toThrow('No autorizado');
    await actAs();
    await expect(getUsers()).rejects.toThrow('No autorizado');
  });
});

describe('fetchCommunityMembers', () => {
  it('counts each project once even when the user authored it and is listed as a member', async () => {
    const user = await quickUser();
    const other = await quickUser();
    await prisma.project.create({
      data: {
        title: 'Propio',
        description: 'Un proyecto propio',
        url: 'https://example.com',
        logoUrl: '',
        authorId: user.id,
        members: { create: { userId: user.id, memberName: user.name } },
      },
    });
    await prisma.project.create({
      data: {
        title: 'Ajeno',
        description: 'Un proyecto ajeno',
        url: 'https://example.com',
        logoUrl: '',
        authorId: other.id,
        members: { create: { userId: user.id, memberName: user.name } },
      },
    });

    const members = await fetchCommunityMembers();

    const entry = members.find((member) => member.id === user.id);
    expect(entry).toMatchObject({ projects: 2, talks: 0, events: 0 });
    expect(entry?.createdAt).toBeInstanceOf(Date);
    // Nada de datos de contacto
    expect(entry).not.toHaveProperty('email');
    expect(entry).not.toHaveProperty('phoneNumber');
  });

  it('lists members oldest first', async () => {
    const members = await fetchCommunityMembers();
    const dates = members.map((member) => member.createdAt.getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });
});

describe('searchCommunityMembers', () => {
  it('finds people by name, slogan and position, returning only public fields', async () => {
    const token = uid();
    const target = await quickUser({ name: `Zelda ${token}` });
    await prisma.userPosition.create({
      data: { userId: target.id, jobTitle: 'Dev', enterprise: `Empresa${token}` },
    });
    const searcher = await quickUser();
    await actAs(searcher.id);

    await expect(searchCommunityMembers(`zelda ${token}`)).resolves.toEqual([
      { id: target.id, name: target.name, image: null },
    ]);
    await expect(searchCommunityMembers(`empresa${token}`)).resolves.toEqual([
      { id: target.id, name: target.name, image: null },
    ]);
  });

  it('only matches emails when an admin searches', async () => {
    const token = uid();
    const target = await quickUser({ email: `secreto-${token}@test.pcn` });
    const regular = await quickUser();
    const admin = await quickUser({ role: 'ADMIN' });

    await actAs(regular.id);
    await expect(searchCommunityMembers(`secreto-${token}`)).resolves.toEqual([]);

    await actAs(admin.id);
    const found = await searchCommunityMembers(`secreto-${token}`);
    expect(found.map((person) => person.id)).toEqual([target.id]);
    expect(found[0]).not.toHaveProperty('email');
  });

  it('ignores queries shorter than two characters and needs a session', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await expect(searchCommunityMembers(' a ')).resolves.toEqual([]);

    await actAs();
    await expect(searchCommunityMembers('ana')).rejects.toThrow('Debes estar autenticado');
  });
});

describe('searchUsersForSpeaker', () => {
  it('lets an event organizer search people, with contact data, capping the limit', async () => {
    const token = uid();
    const organizer = await quickUser();
    await prisma.event.create({
      data: {
        name: `Evento ${token}`,
        description: 'Un evento',
        date: new Date(),
        organizers: { create: { userId: organizer.id } },
      },
    });
    const speaker = await quickUser({ name: `Oradora ${token}` });
    await prisma.user.update({ where: { id: speaker.id }, data: { phoneNumber: '+5491111' } });
    await actAs(organizer.id);

    const found = await searchUsersForSpeaker(`oradora ${token}`);
    expect(found).toEqual([
      expect.objectContaining({ id: speaker.id, email: speaker.email, phoneNumber: '+5491111' }),
    ]);
    expect(found[0]).not.toHaveProperty('slogan');

    await expect(searchUsersForSpeaker('', 1000)).resolves.toHaveLength(
      Math.min(20, await prisma.user.count()),
    );
    await expect(getUserForSpeaker(speaker.id)).resolves.toMatchObject({ id: speaker.id });
  });

  it('lets an ambassador search too', async () => {
    const ambassador = await quickUser({ isAmbassador: true });
    await actAs(ambassador.id);

    await expect(searchUsersForSpeaker('', 2)).resolves.toHaveLength(2);
  });

  it('forbids a regular user who manages no event and anonymous visitors', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await expect(searchUsersForSpeaker('a')).rejects.toThrow('No autorizado');
    await expect(getUserForSpeaker(user.id)).rejects.toThrow('No autorizado');

    await actAs();
    await expect(searchUsersForSpeaker('a')).rejects.toThrow('No autorizado');
  });
});

describe('getUserSummary', () => {
  it('summarizes a user’s public profile and activity', async () => {
    const user = await quickUser({ name: 'Grace Hopper' });
    await prisma.user.update({
      where: { id: user.id },
      data: {
        slogan: 'Bugs are features',
        province: 'Córdoba',
        countryOfOrigin: 'Argentina',
        career: 'Sistemas',
        studyPlace: 'UTN',
        isCofounder: true,
        positions: {
          create: [
            { jobTitle: 'Staff Engineer', enterprise: 'Acme', order: 0 },
            { jobTitle: 'Mentora', enterprise: null, order: 1 },
          ],
        },
        languages: { create: [{ language: 'Go', color: '#0af', logo: 'go.svg' }] },
      },
    });
    await makeAdvice(user.id);
    await makeAdvice(user.id);

    const summary = await getUserSummary(user.id);

    expect(summary).toMatchObject({
      id: user.id,
      name: 'Grace Hopper',
      slogan: 'Bugs are features',
      role: 'Staff Engineer @ Acme',
      location: 'Córdoba, Argentina',
      isCofounder: true,
      isAmbassador: false,
      languages: ['Go'],
      stats: expect.objectContaining({ advice: 2, talks: 0, projects: 0 }),
    });
    expect(summary?.memberSince).toBe(user.createdAt.toISOString());
    expect(summary).not.toHaveProperty('email');
  });

  it('falls back to career @ study place without positions', async () => {
    const user = await quickUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { career: 'Sistemas', studyPlace: 'UTN' },
    });

    await expect(getUserSummary(user.id)).resolves.toMatchObject({
      role: 'Sistemas @ UTN',
      location: null,
    });
  });

  it('returns null for unknown or malformed ids', async () => {
    await expect(getUserSummary('no-existe')).resolves.toBeNull();
    await expect(getUserSummary('')).resolves.toBeNull();
    await expect(getUserSummary('x'.repeat(65))).resolves.toBeNull();
  });
});
