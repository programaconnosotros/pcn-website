import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { deleteTalkProposal } from './delete-talk-proposal';

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

const mockProposal = { id: 'proposal-1', eventId: 'event-1' };

describe('deleteTalkProposal', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(deleteTalkProposal('proposal-1')).rejects.toThrow('Debes estar autenticado');

    expect(prismaMock.talkProposal.delete).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(deleteTalkProposal('proposal-1')).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );

    expect(prismaMock.talkProposal.delete).not.toHaveBeenCalled();
  });

  it('throws when the user does not have ADMIN role', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    await expect(deleteTalkProposal('proposal-1')).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );

    expect(prismaMock.talkProposal.delete).not.toHaveBeenCalled();
  });

  it('throws when the proposal is not found', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talkProposal.findUnique.mockResolvedValue(null);

    await expect(deleteTalkProposal('proposal-1')).rejects.toThrow('Propuesta no encontrada');

    expect(prismaMock.talkProposal.delete).not.toHaveBeenCalled();
  });

  it('deletes the proposal, revalidates the path, and returns success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talkProposal.findUnique.mockResolvedValue(mockProposal as any);
    prismaMock.talkProposal.delete.mockResolvedValue(mockProposal as any);

    const result = await deleteTalkProposal('proposal-1');

    expect(result).toEqual({ success: true });
    expect(prismaMock.talkProposal.delete).toHaveBeenCalledWith({ where: { id: 'proposal-1' } });
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1/propuestas-de-charlas');
  });
});
