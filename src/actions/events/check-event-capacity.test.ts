import { prismaMock } from '@/test/prisma';
import { checkEventCapacity } from './check-event-capacity';

const eventWithoutCapacity = {
  id: 'event-1',
  name: 'Tech Talk',
  deletedAt: null,
  capacity: null,
};

const eventWithCapacity = {
  id: 'event-2',
  name: 'Workshop',
  deletedAt: null,
  capacity: 10,
};

describe('checkEventCapacity', () => {
  it('returns available: false when the event is not found', async () => {
    prismaMock.event.findFirst.mockResolvedValue(null);

    const result = await checkEventCapacity('non-existent');

    expect(result).toEqual({ available: false, message: 'Evento no encontrado' });
  });

  it('returns available: true with null capacity when the event has no capacity limit', async () => {
    prismaMock.event.findFirst.mockResolvedValue(eventWithoutCapacity as any);

    const result = await checkEventCapacity('event-1');

    expect(result).toEqual({ available: true, current: 0, capacity: null });
    expect(prismaMock.eventRegistration.count).not.toHaveBeenCalled();
  });

  it('returns available: true when there are spots remaining', async () => {
    prismaMock.event.findFirst.mockResolvedValue(eventWithCapacity as any);
    prismaMock.eventRegistration.count.mockResolvedValue(6);

    const result = await checkEventCapacity('event-2');

    expect(result).toEqual({
      available: true,
      current: 6,
      capacity: 10,
      message: 'Quedan 4 lugares disponibles.',
    });
  });

  it('returns available: false when the event is full', async () => {
    prismaMock.event.findFirst.mockResolvedValue(eventWithCapacity as any);
    prismaMock.eventRegistration.count.mockResolvedValue(10);

    const result = await checkEventCapacity('event-2');

    expect(result).toEqual({
      available: false,
      current: 10,
      capacity: 10,
      message: 'El cupo del evento está completo',
    });
  });
});
