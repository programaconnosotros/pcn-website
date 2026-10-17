import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { deleteAdvice } from './delete-advice';

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

const mockAdvice = { id: 'advice-1', authorId: 'user-regular', content: 'Un consejo cualquiera' };

describe('deleteAdvice', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(deleteAdvice('advice-1')).rejects.toThrow('User not authenticated');

    expect(prismaMock.advice.delete).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(deleteAdvice('advice-1')).rejects.toThrow('Session not found');

    expect(prismaMock.advice.delete).not.toHaveBeenCalled();
  });

  it('throws when the advice is not found', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.advice.findUnique.mockResolvedValue(null);

    await expect(deleteAdvice('advice-1')).rejects.toThrow('Consejo no encontrado');

    expect(prismaMock.advice.delete).not.toHaveBeenCalled();
  });

  it('throws when the user is not the author and not an admin', async () => {
    const otherUserSession = {
      ...regularSession,
      userId: 'user-other',
      user: { ...regularUser, id: 'user-other' },
    };
    mockCookies({ sessionId: 'session-other' });
    prismaMock.session.findUnique.mockResolvedValue(otherUserSession as any);
    prismaMock.advice.findUnique.mockResolvedValue(mockAdvice as any);

    await expect(deleteAdvice('advice-1')).rejects.toThrow(
      'No tienes permisos para eliminar este consejo',
    );

    expect(prismaMock.advice.delete).not.toHaveBeenCalled();
  });

  it('allows the author to delete their own advice and revalidates paths', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.advice.findUnique.mockResolvedValue(mockAdvice as any);
    prismaMock.advice.delete.mockResolvedValue(mockAdvice as any);

    await deleteAdvice('advice-1');

    expect(prismaMock.advice.delete).toHaveBeenCalledWith({ where: { id: 'advice-1' } });
    expect(revalidatePath).toHaveBeenCalledWith('/consejos');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('allows an admin to delete any advice', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.advice.findUnique.mockResolvedValue(mockAdvice as any);
    prismaMock.advice.delete.mockResolvedValue(mockAdvice as any);

    await deleteAdvice('advice-1');

    expect(prismaMock.advice.delete).toHaveBeenCalledTimes(1);
  });
});
