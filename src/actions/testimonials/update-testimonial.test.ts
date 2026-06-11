import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { updateTestimonial } from './update-testimonial';

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
  body: 'Original testimonial body here.',
  userId: 'user-regular',
  featured: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  user: { name: 'Regular' },
};

const testimonialOwnedByOther = { ...testimonialOwnedByRegular, userId: 'user-other' };

const validData = { body: 'Updated testimonial body content.' };

describe('updateTestimonial', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(updateTestimonial('test-1', validData)).rejects.toThrow('No autorizado');
    expect(prismaMock.testimonial.update).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(updateTestimonial('test-1', validData)).rejects.toThrow('No autorizado');
    expect(prismaMock.testimonial.update).not.toHaveBeenCalled();
  });

  it('throws when the testimonial does not exist', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(null);

    await expect(updateTestimonial('test-1', validData)).rejects.toThrow(
      'Testimonio no encontrado',
    );
    expect(prismaMock.testimonial.update).not.toHaveBeenCalled();
  });

  it('throws when the user is neither the author nor an admin', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(testimonialOwnedByOther as any);

    await expect(updateTestimonial('test-1', validData)).rejects.toThrow(
      'No tienes permisos para editar este testimonio',
    );
    expect(prismaMock.testimonial.update).not.toHaveBeenCalled();
  });

  it('updates the testimonial and revalidates the path when user is the author', async () => {
    mockCookies({ sessionId: 'session-regular' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(testimonialOwnedByRegular as any);
    prismaMock.testimonial.update.mockResolvedValue({
      ...testimonialOwnedByRegular,
      body: validData.body,
    } as any);

    await updateTestimonial('test-1', validData);

    expect(prismaMock.testimonial.update).toHaveBeenCalledWith({
      where: { id: 'test-1' },
      data: { body: validData.body },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/testimonios');
  });

  it('updates the testimonial without notifying when an admin edits', async () => {
    const { notifyAdmins } = jest.requireMock('@/actions/notifications/notify-admins');
    mockCookies({ sessionId: 'session-admin' });
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.testimonial.findUnique.mockResolvedValue(testimonialOwnedByRegular as any);
    prismaMock.testimonial.update.mockResolvedValue({
      ...testimonialOwnedByRegular,
      body: validData.body,
    } as any);

    await updateTestimonial('test-1', validData);

    expect(prismaMock.testimonial.update).toHaveBeenCalled();
    expect(notifyAdmins).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/testimonios');
  });
});
