import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { createAnnouncement } from './create-announcement';

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

const validData = {
  title: 'Test Announcement Title',
  content: 'This is valid announcement content for testing.',
  category: 'general',
  pinned: false,
  published: true,
  eventId: null,
};

const createdAnnouncement = {
  id: 'ann-1',
  ...validData,
  authorId: 'user-admin',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('createAnnouncement', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(createAnnouncement(validData)).rejects.toThrow('No autorizado');
    expect(prismaMock.announcement.create).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(createAnnouncement(validData)).rejects.toThrow(
      'No tienes permisos para crear anuncios',
    );
    expect(prismaMock.announcement.create).not.toHaveBeenCalled();
  });

  it('throws when the session belongs to a non-admin user', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    await expect(createAnnouncement(validData)).rejects.toThrow(
      'No tienes permisos para crear anuncios',
    );
    expect(prismaMock.announcement.create).not.toHaveBeenCalled();
  });

  it('creates the announcement and revalidates /anuncios on success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.announcement.create.mockResolvedValue(createdAnnouncement as any);

    const result = await createAnnouncement(validData);

    expect(prismaMock.announcement.create).toHaveBeenCalledWith({
      data: {
        title: validData.title,
        content: validData.content,
        category: validData.category,
        pinned: validData.pinned,
        published: validData.published,
        authorId: 'user-admin',
        eventId: null,
      },
    });
    expect(result).toEqual(createdAnnouncement);
    expect(revalidatePath).toHaveBeenCalledWith('/anuncios');
  });

  it('sets eventId and revalidates the event path when category is "evento"', async () => {
    const eventData = { ...validData, category: 'evento', eventId: 'event-1' };
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.announcement.create.mockResolvedValue({
      ...createdAnnouncement,
      category: 'evento',
      eventId: 'event-1',
    } as any);

    await createAnnouncement(eventData);

    expect(prismaMock.announcement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ category: 'evento', eventId: 'event-1' }),
    });
    expect(revalidatePath).toHaveBeenCalledWith('/anuncios');
    expect(revalidatePath).toHaveBeenCalledWith('/eventos/event-1');
  });
});
