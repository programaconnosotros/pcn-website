import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { setEventCoverFraming } from './set-event-cover-framing';

const loginAs = (user: { id: string; role: 'ADMIN' | 'REGULAR' }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('setEventCoverFraming', () => {
  it('lets an organizer frame the cover', async () => {
    loginAs({ id: 'u1', role: 'REGULAR' });
    prismaMock.event.findUnique.mockResolvedValue({
      createdById: 'x',
      deletedAt: null,
      organizers: [{ userId: 'u1' }],
    } as any);
    prismaMock.event.findFirst.mockResolvedValue({ id: 'event-1' } as any);

    await setEventCoverFraming('event-1', { x: 20, y: 70, zoom: 150 });

    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { coverFocusX: 20, coverFocusY: 70, coverZoom: 150 },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1');
  });

  it('rejects people who cannot edit the event', async () => {
    loginAs({ id: 'u2', role: 'REGULAR' });
    prismaMock.event.findUnique.mockResolvedValue({
      createdById: 'x',
      deletedAt: null,
      organizers: [],
    } as any);

    await expect(setEventCoverFraming('event-1', { x: 50, y: 50, zoom: 100 })).rejects.toThrow(
      'No autorizado',
    );
    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });

  it('rejects framing out of range', async () => {
    loginAs({ id: 'a', role: 'ADMIN' });
    for (const framing of [
      { x: -1, y: 50, zoom: 100 },
      { x: 50, y: 101, zoom: 100 },
      { x: 50, y: 50, zoom: 90 },
      { x: 50, y: 50, zoom: 900 },
    ])
      await expect(setEventCoverFraming('event-1', framing)).rejects.toThrow('Encuadre inválido');
    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });
});
