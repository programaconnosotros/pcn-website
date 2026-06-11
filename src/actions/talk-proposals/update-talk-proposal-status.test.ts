import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { updateTalkProposalStatus } from './update-talk-proposal-status';

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

describe('updateTalkProposalStatus', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(updateTalkProposalStatus('proposal-1', 'APPROVED')).rejects.toThrow(
      'Debes estar autenticado',
    );

    expect(prismaMock.talkProposal.update).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(updateTalkProposalStatus('proposal-1', 'APPROVED')).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );

    expect(prismaMock.talkProposal.update).not.toHaveBeenCalled();
  });

  it('throws when the user does not have ADMIN role', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    await expect(updateTalkProposalStatus('proposal-1', 'APPROVED')).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );

    expect(prismaMock.talkProposal.update).not.toHaveBeenCalled();
  });

  it('updates the status, revalidates the path, and returns success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talkProposal.update.mockResolvedValue({
      id: 'proposal-1',
      eventId: 'event-1',
      status: 'APPROVED',
    } as any);

    const result = await updateTalkProposalStatus('proposal-1', 'APPROVED');

    expect(result).toEqual({ success: true });
    expect(prismaMock.talkProposal.update).toHaveBeenCalledWith({
      where: { id: 'proposal-1' },
      data: { status: 'APPROVED' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1/propuestas-de-charlas');
  });

  it('updates to REJECTED status', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talkProposal.update.mockResolvedValue({
      id: 'proposal-2',
      eventId: 'event-2',
      status: 'REJECTED',
    } as any);

    const result = await updateTalkProposalStatus('proposal-2', 'REJECTED');

    expect(result).toEqual({ success: true });
    expect(prismaMock.talkProposal.update).toHaveBeenCalledWith({
      where: { id: 'proposal-2' },
      data: { status: 'REJECTED' },
    });
  });
});
