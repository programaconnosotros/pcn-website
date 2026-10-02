import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { createTalkProposal } from './create-talk-proposal';
import type { TalkProposalFormData } from '@/schemas/talk-proposal-schema';

jest.mock('@/actions/notifications/notify-admins', () => ({
  notifyAdmins: jest.fn().mockResolvedValue(undefined),
}));

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

const mockEvent = {
  id: 'event-1',
  name: 'Tech Talk BA',
  deletedAt: null,
  callForSpeakersEnabled: true,
};

const validData: TalkProposalFormData = {
  title: 'Mi charla sobre testing',
  description: 'Una descripción detallada sobre testing en Next.js con Jest.',
  speakers: [
    {
      userId: null,
      speakerName: 'Juan Pérez',
      speakerPhone: '5493815123456',
      isProfessional: true,
      jobTitle: 'Engineer',
      enterprise: 'Acme',
      isStudent: false,
      career: undefined,
      studyPlace: undefined,
    },
  ],
};

describe('createTalkProposal', () => {
  it('throws when the event is not found', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.event.findFirst.mockResolvedValue(null);

    await expect(createTalkProposal('event-1', validData)).rejects.toThrow('Evento no encontrado');

    expect(prismaMock.talkProposal.create).not.toHaveBeenCalled();
  });

  it('throws when call for speakers is not enabled', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.event.findFirst.mockResolvedValue({
      ...mockEvent,
      callForSpeakersEnabled: false,
    } as any);

    await expect(createTalkProposal('event-1', validData)).rejects.toThrow(
      'Este evento no tiene call for speakers habilitado',
    );

    expect(prismaMock.talkProposal.create).not.toHaveBeenCalled();
  });

  it('throws when there is no sessionId cookie', async () => {
    mockCookies();
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);

    await expect(createTalkProposal('event-1', validData)).rejects.toThrow(
      'Debes estar autenticado para proponer una charla',
    );

    expect(prismaMock.talkProposal.create).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(createTalkProposal('event-1', validData)).rejects.toThrow(
      'Sesión no válida. Por favor, inicia sesión nuevamente',
    );

    expect(prismaMock.talkProposal.create).not.toHaveBeenCalled();
  });

  it('throws when data fails schema validation', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);

    const invalidData: TalkProposalFormData = {
      title: 'ok',
      description: 'short',
      speakers: [],
    };

    await expect(createTalkProposal('event-1', invalidData)).rejects.toThrow();

    expect(prismaMock.talkProposal.create).not.toHaveBeenCalled();
  });

  it('creates the proposal, revalidates the path, and returns success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talkProposal.create.mockResolvedValue({ id: 'proposal-1' } as any);

    const result = await createTalkProposal('event-1', validData);

    expect(result).toEqual({ success: true, proposalId: 'proposal-1' });
    expect(prismaMock.talkProposal.create).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1/propuestas-de-charlas');
  });
});
