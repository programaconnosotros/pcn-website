import { prismaMock } from '@/test/prisma';
import { notifyAdmins } from './notify-admins';

const notificationData = {
  type: 'NEW_EVENT',
  title: 'New event created',
  message: 'A new event has been added.',
};

const notificationDataWithMetadata = {
  ...notificationData,
  metadata: { eventId: 'event-1' },
};

describe('notifyAdmins', () => {
  it('creates a notification for each admin user', async () => {
    prismaMock.user.findMany.mockResolvedValue([{ id: 'admin-1' }, { id: 'admin-2' }] as any);
    prismaMock.notification.createMany.mockResolvedValue({ count: 2 });

    await notifyAdmins(notificationData);

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: [
        {
          type: 'NEW_EVENT',
          title: 'New event created',
          message: 'A new event has been added.',
          userId: 'admin-1',
          metadata: null,
        },
        {
          type: 'NEW_EVENT',
          title: 'New event created',
          message: 'A new event has been added.',
          userId: 'admin-2',
          metadata: null,
        },
      ],
    });
  });

  it('serialises metadata as JSON string when provided', async () => {
    prismaMock.user.findMany.mockResolvedValue([{ id: 'admin-1' }] as any);
    prismaMock.notification.createMany.mockResolvedValue({ count: 1 });

    await notifyAdmins(notificationDataWithMetadata);

    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: 'admin-1',
          metadata: JSON.stringify({ eventId: 'event-1' }),
        }),
      ],
    });
  });

  it('calls createMany with an empty array when there are no admins', async () => {
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.notification.createMany.mockResolvedValue({ count: 0 });

    await notifyAdmins(notificationData);

    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({ data: [] });
  });
});
