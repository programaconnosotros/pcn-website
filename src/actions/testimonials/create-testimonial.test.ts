import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { createTestimonial } from './create-testimonial';

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

const validData = { body: 'This is a valid testimonial body.' };

describe('createTestimonial', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(createTestimonial(validData)).rejects.toThrow(
      'Debes estar autenticado para crear un testimonio',
    );
    expect(prismaMock.testimonial.create).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(createTestimonial(validData)).rejects.toThrow('Sesión no encontrada');
    expect(prismaMock.testimonial.create).not.toHaveBeenCalled();
  });

  it('creates the testimonial and revalidates the path on success', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    const createdTestimonial = { id: 'test-1', body: validData.body, userId: 'user-admin' };
    prismaMock.testimonial.create.mockResolvedValue(createdTestimonial as any);
    prismaMock.user.findUnique.mockResolvedValue(adminUser as any);

    await createTestimonial(validData);

    expect(prismaMock.testimonial.create).toHaveBeenCalledWith({
      data: { body: validData.body, userId: 'user-admin' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/testimonios');
  });
});
