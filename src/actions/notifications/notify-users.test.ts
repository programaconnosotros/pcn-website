import { prismaMock } from '@/test/prisma';
import { notifyEveryone, notifyUsers } from './notify-users';

const notification = {
  type: 'advice_liked',
  title: 'Le gustó tu consejo',
  message: 'A Ana le gustó tu consejo',
  href: '/consejos/a1',
};

describe('notifyUsers', () => {
  it('notifies each recipient once, never the actor, with where it leads in the metadata', async () => {
    await notifyUsers(['u1', 'u2', 'u1', null, 'actor'], notification, 'actor');

    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: ['u1', 'u2'].map((userId) => ({
        type: 'advice_liked',
        title: 'Le gustó tu consejo',
        message: 'A Ana le gustó tu consejo',
        userId,
        metadata: JSON.stringify({ href: '/consejos/a1' }),
      })),
    });
  });

  it('does nothing without recipients', async () => {
    await notifyUsers(['actor', undefined], notification, 'actor');
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
  });

  it('never throws: the action that caused it already happened', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.notification.createMany.mockRejectedValue(new Error('db down'));
    await expect(notifyUsers(['u1'], notification)).resolves.toBeUndefined();

    prismaMock.user.findMany.mockRejectedValue(new Error('db down'));
    await expect(notifyEveryone(notification)).resolves.toBeUndefined();
  });
});

describe('notifyEveryone', () => {
  it('notifies every active user but the actor', async () => {
    prismaMock.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'actor' }] as never);

    await notifyEveryone(notification, 'actor');

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: { suspendedAt: null, deactivatedAt: null },
      select: { id: true },
    });
    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ userId: 'u1' })],
    });
  });
});
