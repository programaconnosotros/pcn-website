import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { createWorkPlace, deleteWorkPlace, updateWorkPlace } from './work-places';

jest.mock('@/lib/s3', () => ({
  keyFromPublicUrl: (url: string) =>
    url.startsWith('https://cdn.pcn.dev/') ? url.slice('https://cdn.pcn.dev/'.length) : null,
}));

const loginAs = (user: { id: string; role: 'ADMIN' | 'REGULAR' }) => {
  mockCookies({ sessionId: 's1' });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's1', userId: user.id, user } as any);
};

const place = {
  name: 'Café Tortoni',
  city: 'Buenos Aires',
  wifi: 4,
  plugs: 3,
  calls: 2,
  foodQuality: 5,
  foodVariety: 4,
  photoUrl: 'https://cdn.pcn.dev/work-places/1.webp',
};

describe('createWorkPlace', () => {
  it('asks for a session', async () => {
    mockCookies();
    await expect(createWorkPlace(place)).rejects.toThrow('No autenticado');
    expect(prismaMock.workPlace.create).not.toHaveBeenCalled();
  });

  it('saves the place for whoever adds it', async () => {
    loginAs({ id: 'u1', role: 'REGULAR' });
    prismaMock.workPlace.create.mockResolvedValue({ id: 'wp1' } as any);

    await expect(createWorkPlace(place)).resolves.toEqual({ id: 'wp1' });

    expect(prismaMock.workPlace.create).toHaveBeenCalledWith({
      data: {
        ...place,
        address: null,
        googleMapsUrl: null,
        notes: null,
        authorId: 'u1',
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/lugares');
  });

  it('only takes photos uploaded to the site for a place', async () => {
    loginAs({ id: 'u1', role: 'REGULAR' });

    for (const photoUrl of [
      'https://otro-sitio.dev/foto.webp',
      'https://cdn.pcn.dev/profiles/1.webp',
    ]) {
      await expect(createWorkPlace({ ...place, photoUrl })).rejects.toThrow(
        'La foto tiene que estar subida al sitio',
      );
    }
    expect(prismaMock.workPlace.create).not.toHaveBeenCalled();
  });
});

describe('updateWorkPlace and deleteWorkPlace', () => {
  it("refuse someone else's place", async () => {
    loginAs({ id: 'u2', role: 'REGULAR' });
    prismaMock.workPlace.findUnique.mockResolvedValue({ authorId: 'u1' } as any);

    await expect(updateWorkPlace('wp1', place)).rejects.toThrow(
      'No tenés permisos para cambiar este lugar',
    );
    await expect(deleteWorkPlace('wp1')).rejects.toThrow(
      'No tenés permisos para cambiar este lugar',
    );
    expect(prismaMock.workPlace.update).not.toHaveBeenCalled();
    expect(prismaMock.workPlace.delete).not.toHaveBeenCalled();
  });

  it('let the author edit it and an admin delete it', async () => {
    prismaMock.workPlace.findUnique.mockResolvedValue({ authorId: 'u1' } as any);

    loginAs({ id: 'u1', role: 'REGULAR' });
    await updateWorkPlace('wp1', { ...place, wifi: 5 });
    expect(prismaMock.workPlace.update).toHaveBeenCalledWith({
      where: { id: 'wp1' },
      data: expect.objectContaining({ wifi: 5 }),
    });

    loginAs({ id: 'admin', role: 'ADMIN' });
    await deleteWorkPlace('wp1');
    expect(prismaMock.workPlace.delete).toHaveBeenCalledWith({ where: { id: 'wp1' } });
  });

  it('say when the place does not exist', async () => {
    loginAs({ id: 'u1', role: 'REGULAR' });
    prismaMock.workPlace.findUnique.mockResolvedValue(null);
    await expect(deleteWorkPlace('nada')).rejects.toThrow('Lugar no encontrado');
  });
});
