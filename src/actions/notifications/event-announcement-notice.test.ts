import { prismaMock } from '@/test/prisma';
import { sendEmails } from '@/lib/email';
import { notifyEventAnnouncement } from './event-announcement-notice';

jest.mock('@/lib/email', () => ({ sendEmails: jest.fn(async () => 0) }));
jest.mock('@react-email/render', () => ({
  render: async (element: React.ReactElement) =>
    require('react-dom/server').renderToStaticMarkup(element),
}));

const event = { id: 'e1', name: 'Meetup' };
const announcement = { id: 'a1', title: 'Cambio de aula', content: 'Vamos al aula 204.' };

describe('notifyEventAnnouncement', () => {
  it('reaches nobody when nobody else is signed up', async () => {
    prismaMock.eventRegistration.findMany.mockResolvedValue([]);

    expect(await notifyEventAnnouncement(event, announcement, 'org')).toBe(0);
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
    expect(sendEmails).not.toHaveBeenCalled();
  });

  it('never throws', async () => {
    prismaMock.eventRegistration.findMany.mockRejectedValue(new Error('db down'));

    expect(await notifyEventAnnouncement(event, announcement, 'org')).toBe(0);
  });
});
