import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { deleteTestimonial } from './delete-testimonial';

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

const regularUser = { ...adminUser, id: 'user-regular', role: 'REGULAR' as const };
const regularSession = {
  ...adminSession,
  id: 'session-regular',
  userId: 'user-regular',
  user: regularUser,
};

const testimonialOwnedByRegular = {
  id: 'test-1',
  body: 'A testimonial body for testing.',
  userId: 'user-regular',
  featured: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  user: { name: 'Regular' },
};

const testimonialOwnedByOther = { ...testimonialOwnedByRegular, userId: 'user-other' };

describe('deleteTestimonial', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(deleteTestimonial('test-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.testimonial.delete).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(deleteTestimonial('test-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.testimonial.delete).not.toHaveBeenCalled();
  });

  it('throws when the testimonial does not exist', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(null);

    await expect(deleteTestimonial('test-1')).rejects.toThrow('Testimonio no encontrado');
    expect(prismaMock.testimonial.delete).not.toHaveBeenCalled();
  });

  it('throws when the user is neither the author nor an admin', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(testimonialOwnedByOther as any);

    await expect(deleteTestimonial('test-1')).rejects.toThrow(
      'No tienes permisos para eliminar este testimonio',
    );
    expect(prismaMock.testimonial.delete).not.toHaveBeenCalled();
  });

  it('deletes the testimonial and revalidates the path when user is the author', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(testimonialOwnedByRegular as any);
    prismaMock.testimonial.delete.mockResolvedValue(testimonialOwnedByRegular as any);

    await deleteTestimonial('test-1');

    expect(prismaMock.testimonial.delete).toHaveBeenCalledWith({ where: { id: 'test-1' } });
    expect(revalidatePath).toHaveBeenCalledWith('/testimonios');
  });

  it('allows an admin to delete any testimonial', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(testimonialOwnedByOther as any);
    prismaMock.testimonial.delete.mockResolvedValue(testimonialOwnedByOther as any);

    await deleteTestimonial('test-1');

    expect(prismaMock.testimonial.delete).toHaveBeenCalledWith({ where: { id: 'test-1' } });
    expect(revalidatePath).toHaveBeenCalledWith('/testimonios');
  });
});
