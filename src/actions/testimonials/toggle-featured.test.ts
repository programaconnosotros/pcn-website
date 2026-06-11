import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { toggleFeatured } from './toggle-featured';

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

const unfeaturedTestimonial = {
  id: 'test-1',
  body: 'A testimonial body for testing.',
  userId: 'user-regular',
  featured: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const featuredTestimonial = { ...unfeaturedTestimonial, featured: true };

describe('toggleFeatured', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(toggleFeatured('test-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.testimonial.update).not.toHaveBeenCalled();
  });

  it('throws when the session belongs to a non-admin user', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);

    await expect(toggleFeatured('test-1')).rejects.toThrow(
      'Solo los administradores pueden marcar testimonios como destacados',
    );
    expect(prismaMock.testimonial.update).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(toggleFeatured('test-1')).rejects.toThrow(
      'Solo los administradores pueden marcar testimonios como destacados',
    );
    expect(prismaMock.testimonial.update).not.toHaveBeenCalled();
  });

  it('throws when the testimonial does not exist', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(null);

    await expect(toggleFeatured('test-1')).rejects.toThrow('Testimonio no encontrado');
    expect(prismaMock.testimonial.update).not.toHaveBeenCalled();
  });

  it('sets featured to true when it was false and revalidates both paths', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(unfeaturedTestimonial as any);
    prismaMock.testimonial.update.mockResolvedValue({
      ...unfeaturedTestimonial,
      featured: true,
    } as any);

    await toggleFeatured('test-1');

    expect(prismaMock.testimonial.update).toHaveBeenCalledWith({
      where: { id: 'test-1' },
      data: { featured: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/testimonios');
    expect(revalidatePath).toHaveBeenCalledWith('/home');
  });

  it('sets featured to false when it was true and revalidates both paths', async () => {
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(featuredTestimonial as any);
    prismaMock.testimonial.update.mockResolvedValue({
      ...featuredTestimonial,
      featured: false,
    } as any);

    await toggleFeatured('test-1');

    expect(prismaMock.testimonial.update).toHaveBeenCalledWith({
      where: { id: 'test-1' },
      data: { featured: false },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/testimonios');
    expect(revalidatePath).toHaveBeenCalledWith('/home');
  });
});
