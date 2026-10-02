import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { editAdvise } from './edit-advise';

const adminUser = {
  id: 'user-admin',
  name: 'Admin',
  email: 'admin@pcn.com',
  password: 'hash',
  emailVerified: true,
  role: 'ADMIN' as const,
  phoneNumber: null,
  image: null,
  countryOfOrigin: null,
  province: null,
  xAccountUrl: null,
  linkedinUrl: null,
  gitHubUrl: null,
  slogan: null,
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const adminSession = {
  id: 'session-admin',
  userId: 'user-admin',
  expires: new Date('2027-01-01'),
  user: adminUser,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const regularUser = { ...adminUser, id: 'user-regular', role: 'REGULAR' as const };
const regularSession = {
  ...adminSession,
  id: 'session-regular',
  userId: 'user-regular',
  user: regularUser,
};

const mockAdvise = { id: 'advise-1', authorId: 'user-regular', content: 'Contenido original' };
const validContent = 'Contenido actualizado con más de 10 caracteres.';

describe('editAdvise', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(editAdvise({ id: 'advise-1', content: validContent })).rejects.toThrow(
      'User not authenticated',
    );

    expect(prismaMock.advise.update).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(editAdvise({ id: 'advise-1', content: validContent })).rejects.toThrow(
      'Session not found',
    );

    expect(prismaMock.advise.update).not.toHaveBeenCalled();
  });

  it('throws when the advise is not found', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.advise.findUnique.mockResolvedValue(null);

    await expect(editAdvise({ id: 'advise-1', content: validContent })).rejects.toThrow(
      'Consejo no encontrado',
    );

    expect(prismaMock.advise.update).not.toHaveBeenCalled();
  });

  it('throws when the user is not the author and not an admin', async () => {
    const otherUserSession = {
      ...regularSession,
      userId: 'user-other',
      user: { ...regularUser, id: 'user-other' },
    };
    mockCookies({ sessionId: 'session-other' });
    prismaMock.session.findUnique.mockResolvedValue(otherUserSession as any);
    prismaMock.advise.findUnique.mockResolvedValue(mockAdvise as any);

    await expect(editAdvise({ id: 'advise-1', content: validContent })).rejects.toThrow(
      'No tienes permisos para editar este consejo',
    );

    expect(prismaMock.advise.update).not.toHaveBeenCalled();
  });

  it('allows the author to edit their own advise', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.advise.findUnique.mockResolvedValue(mockAdvise as any);
    prismaMock.advise.update.mockResolvedValue({ ...mockAdvise, content: validContent } as any);

    await editAdvise({ id: 'advise-1', content: validContent });

    expect(prismaMock.advise.update).toHaveBeenCalledWith({
      where: { id: 'advise-1' },
      data: { content: validContent },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/consejos');
  });

  it('allows an admin to edit any advise', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.advise.findUnique.mockResolvedValue(mockAdvise as any);
    prismaMock.advise.update.mockResolvedValue({ ...mockAdvise, content: validContent } as any);

    await editAdvise({ id: 'advise-1', content: validContent });

    expect(prismaMock.advise.update).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith('/consejos');
  });
});
