import { prismaMock } from '@/test/prisma';
import { getIdentityMap, getUserIdentities } from './identity-links';

const ana = { id: 'u1', name: 'Ana', image: null };

describe('getIdentityMap', () => {
  it('maps each external name of the source to its linked user', async () => {
    prismaMock.identityLink.findMany.mockResolvedValue([
      { externalName: 'Ana WA', user: ana },
      { externalName: 'Beto', user: { id: 'u2', name: 'Beto', image: 'b.png' } },
    ] as any);

    await expect(getIdentityMap('whatsapp')).resolves.toEqual({
      'Ana WA': ana,
      Beto: { id: 'u2', name: 'Beto', image: 'b.png' },
    });
    expect(prismaMock.identityLink.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'whatsapp' } }),
    );
  });

  it('is empty when nothing is linked', async () => {
    prismaMock.identityLink.findMany.mockResolvedValue([]);
    await expect(getIdentityMap('github')).resolves.toEqual({});
  });
});

describe('getUserIdentities', () => {
  it('groups the names linked to a user by source, ignoring /historia mentions', async () => {
    prismaMock.identityLink.findMany.mockResolvedValue([
      { source: 'whatsapp', externalName: 'Ana WA' },
      { source: 'github', externalName: 'ana-dev' },
      { source: 'whatsapp', externalName: 'Ana 2' },
      { source: 'articulos', externalName: 'Ana Pérez' },
      { source: 'historia', externalName: 'Ana' },
      { source: 'videos', externalName: 'Ana P.' },
    ] as any);

    await expect(getUserIdentities('u1')).resolves.toEqual({
      whatsapp: ['Ana WA', 'Ana 2'],
      github: ['ana-dev'],
      articulos: ['Ana Pérez'],
      videos: ['Ana P.'],
      cursos: [],
    });
    expect(prismaMock.identityLink.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      select: { source: true, externalName: true },
    });
  });

  it('returns empty lists for a user without links', async () => {
    prismaMock.identityLink.findMany.mockResolvedValue([]);
    await expect(getUserIdentities('u9')).resolves.toEqual({
      whatsapp: [],
      github: [],
      articulos: [],
      videos: [],
      cursos: [],
    });
  });
});
