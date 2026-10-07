import { createTalkFromProposal } from './create-talk-from-proposal';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';

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

const PROPOSAL_ID = 'proposal-1';
const EVENT_ID = 'ctesteventid1234';

const baseProposal = {
  id: PROPOSAL_ID,
  eventId: EVENT_ID,
  title: 'Proposal Title',
  description: 'Proposal description.',
  talk: null,
  speakers: [
    {
      id: 'speaker-1',
      userId: null,
      speakerName: 'Alice',
      speakerPhone: '+54 9 11 5555-0000',
      isProfessional: true,
      jobTitle: 'Dev',
      enterprise: 'Corp',
      isStudent: false,
      career: null,
      studyPlace: null,
      order: 0,
    },
  ],
};

describe('createTalkFromProposal', () => {
  it('throws when no sessionId cookie is present', async () => {
    mockCookies();
    await expect(createTalkFromProposal(PROPOSAL_ID)).rejects.toThrow('Debes estar autenticado');
  });

  it('throws when session is not found in db', async () => {
    mockCookies({ sessionId: 'session-x' });
    prismaMock.session.findUnique.mockResolvedValue(null);
    await expect(createTalkFromProposal(PROPOSAL_ID)).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );
  });

  it('throws when user role is not ADMIN', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    await expect(createTalkFromProposal(PROPOSAL_ID)).rejects.toThrow(
      'No tenés permisos para realizar esta acción',
    );
  });

  it('throws when proposal is not found', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talkProposal.findUnique.mockResolvedValue(null);
    await expect(createTalkFromProposal(PROPOSAL_ID)).rejects.toThrow('Propuesta no encontrada');
  });

  it('returns alreadyExists true when proposal already has a talk', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talkProposal.findUnique.mockResolvedValue({
      ...baseProposal,
      talk: { id: 'existing-talk' },
    } as any);

    const result = await createTalkFromProposal(PROPOSAL_ID);

    expect(result).toEqual({ success: true, talkId: 'existing-talk', alreadyExists: true });
    expect(prismaMock.talk.create).not.toHaveBeenCalled();
  });

  it('creates talk and revalidates paths on success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talkProposal.findUnique.mockResolvedValue(baseProposal as any);
    prismaMock.talk.create.mockResolvedValue({ id: 'new-talk' } as any);

    const result = await createTalkFromProposal(PROPOSAL_ID);

    expect(result).toEqual({ success: true, talkId: 'new-talk', alreadyExists: false });
    expect(revalidatePath).toHaveBeenCalledWith(`/eventos/${EVENT_ID}/charlas`);
    expect(revalidatePath).toHaveBeenCalledWith(`/eventos/${EVENT_ID}/propuestas-de-charlas`);
    expect(revalidatePath).toHaveBeenCalledWith('/charlas');
  });

  it("copies the speakers' phones, which the client omits unless asked for", async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.talkProposal.findUnique.mockResolvedValue(baseProposal as any);
    prismaMock.talk.create.mockResolvedValue({ id: 'new-talk' } as any);

    await createTalkFromProposal(PROPOSAL_ID);

    expect(prismaMock.talkProposal.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          speakers: expect.objectContaining({ omit: { speakerPhone: false } }),
        }),
      }),
    );
    expect(prismaMock.talk.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        speakers: {
          create: [expect.objectContaining({ speakerPhone: '+54 9 11 5555-0000' })],
        },
      }),
    });
  });
});
