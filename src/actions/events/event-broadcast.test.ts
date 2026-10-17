import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { sendEmail } from '@/lib/email';
import { getBroadcastAudienceCounts, sendEventBroadcast } from './event-broadcast';

jest.mock('@/lib/email', () => ({ sendEmail: jest.fn() }));
jest.mock('@react-email/render', () => ({ render: jest.fn(async () => '<html></html>') }));

const admin = { id: 'admin-1', role: 'ADMIN' as const };
const loginAs = (user: { id: string; role: 'ADMIN' | 'REGULAR' }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

const person = (name: string, email: string) => ({ user: { name, email } });

beforeEach(() => {
  prismaMock.eventRegistration.findMany.mockResolvedValue([
    person('Ana López', 'ana@x.dev'),
    person('Beto', 'beto@x.dev'),
  ] as any);
  prismaMock.eventWaitlistEntry.findMany.mockResolvedValue([
    person('Caro', 'caro@x.dev'),
    person('Ana López', 'ANA@x.dev'),
  ] as any);
  prismaMock.event.findFirst.mockResolvedValue({ id: 'e1', name: 'Meetup' } as any);
});

const input = {
  audience: 'todos' as const,
  subject: 'Cambio de aula',
  message: 'Nos vemos en el aula 3.',
};

describe('sendEventBroadcast', () => {
  it('mails each person once and keeps a record', async () => {
    loginAs(admin);
    jest.mocked(sendEmail).mockResolvedValue(undefined);

    await expect(sendEventBroadcast('e1', input)).resolves.toEqual({ sent: 3, failed: 0 });
    expect(sendEmail).toHaveBeenCalledTimes(3);
    expect(jest.mocked(sendEmail).mock.calls[0][0]).toMatchObject({
      to: 'ana@x.dev',
      subject: 'Meetup: Cambio de aula',
    });
    expect(prismaMock.eventBroadcast.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ eventId: 'e1', audience: 'todos', recipients: 3, failed: 0 }),
    });
  });

  it('only mails the chosen group and counts what failed', async () => {
    loginAs(admin);
    jest.mocked(sendEmail).mockRejectedValueOnce(new Error('down')).mockResolvedValue(undefined);

    await expect(sendEventBroadcast('e1', { ...input, audience: 'confirmados' })).resolves.toEqual({
      sent: 1,
      failed: 1,
    });
    expect(prismaMock.eventWaitlistEntry.findMany).not.toHaveBeenCalled();
  });

  it('rejects people who do not manage the event and bad input', async () => {
    loginAs({ id: 'u1', role: 'REGULAR' });
    prismaMock.event.findUnique.mockResolvedValue({
      createdById: 'x',
      deletedAt: null,
      organizers: [],
    } as any);
    await expect(sendEventBroadcast('e1', input)).rejects.toThrow('No autorizado');

    loginAs(admin);
    await expect(sendEventBroadcast('e1', { ...input, subject: 'no' })).rejects.toThrow(
      'al menos 3 caracteres',
    );
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe('getBroadcastAudienceCounts', () => {
  it('counts each group without duplicates', async () => {
    loginAs(admin);
    await expect(getBroadcastAudienceCounts('e1')).resolves.toEqual({
      confirmados: 2,
      'lista-de-espera': 2,
      todos: 3,
    });
  });
});
