import { revalidatePath } from 'next/cache';
import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { setEventCoverPhoto } from './set-event-cover-photo';

const admin = { id: 'admin-1', role: 'ADMIN' as const };
const regular = { id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: { id: string }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('setEventCoverPhoto', () => {
  it('only lets admins and the event organizers choose the cover', async () => {
    loginAs(regular);
    prismaMock.event.findUnique.mockResolvedValue({
      createdById: 'someone',
      deletedAt: null,
      organizers: [],
    } as any);

    await expect(setEventCoverPhoto('event-1', 'photo-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.event.update).not.toHaveBeenCalled();

    prismaMock.event.findUnique.mockResolvedValue({
      createdById: 'someone',
      deletedAt: null,
      organizers: [{ userId: regular.id }],
    } as any);
    prismaMock.event.findFirst.mockResolvedValue({ id: 'event-1', coverPhotoId: null } as any);
    await setEventCoverPhoto('event-1', null);
    expect(prismaMock.event.update).toHaveBeenCalled();
  });

  it('rejects a photo that is not from the event', async () => {
    loginAs(admin);
    prismaMock.event.findFirst.mockResolvedValue({ id: 'event-1', coverPhotoId: null } as any);
    prismaMock.galleryItem.findFirst.mockResolvedValue(null);

    await expect(setEventCoverPhoto('event-1', 'photo-9')).rejects.toThrow(
      'La foto no es de este evento',
    );
    expect(prismaMock.galleryItem.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'photo-9', eventId: 'event-1', kind: 'PHOTO' }),
      }),
    );
    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });

  it('sets the cover and refreshes the event and both photos', async () => {
    loginAs(admin);
    prismaMock.event.findFirst.mockResolvedValue({ id: 'event-1', coverPhotoId: 'photo-0' } as any);
    prismaMock.galleryItem.findFirst.mockResolvedValue({ id: 'photo-1' } as any);

    await setEventCoverPhoto('event-1', 'photo-1');

    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      // A new cover starts without framing.
      data: { coverPhotoId: 'photo-1', coverFocusX: 50, coverFocusY: 50, coverZoom: 100 },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1');
    expect(revalidatePath).toHaveBeenCalledWith('/galeria/photo-1');
    expect(revalidatePath).toHaveBeenCalledWith('/galeria/photo-0');
  });

  it('goes back to the random cover with null', async () => {
    loginAs(admin);
    prismaMock.event.findFirst.mockResolvedValue({ id: 'event-1', coverPhotoId: 'photo-0' } as any);

    await setEventCoverPhoto('event-1', null);

    expect(prismaMock.galleryItem.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { coverPhotoId: null, coverFocusX: 50, coverFocusY: 50, coverZoom: 100 },
    });
  });

  it('keeps the framing when the same cover is chosen again', async () => {
    loginAs(admin);
    prismaMock.event.findFirst.mockResolvedValue({ id: 'event-1', coverPhotoId: 'photo-1' } as any);
    prismaMock.galleryItem.findFirst.mockResolvedValue({ id: 'photo-1' } as any);

    await setEventCoverPhoto('event-1', 'photo-1');
    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { coverPhotoId: 'photo-1' },
    });
  });
});
