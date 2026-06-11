import { prismaMock } from '@/test/prisma';
import { fetchTestimonial } from './fetch-testimonial';

const testimonialWithUser = {
  id: 'test-1',
  body: 'A testimonial body.',
  userId: 'user-1',
  featured: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  user: { id: 'user-1', name: 'User One', email: 'user1@pcn.com', image: null },
};

describe('fetchTestimonial', () => {
  it('returns the testimonial when it exists', async () => {
    prismaMock.testimonial.findUnique.mockResolvedValue(testimonialWithUser as any);

    const result = await fetchTestimonial('test-1');

    expect(result).toEqual(testimonialWithUser);
    expect(prismaMock.testimonial.findUnique).toHaveBeenCalledWith({
      where: { id: 'test-1' },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  });

  it('returns null when the testimonial does not exist', async () => {
    prismaMock.testimonial.findUnique.mockResolvedValue(null);

    const result = await fetchTestimonial('nonexistent');

    expect(result).toBeNull();
  });
});
