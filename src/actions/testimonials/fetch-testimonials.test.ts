import { prismaMock } from '@/test/prisma';
import { fetchTestimonials } from './fetch-testimonials';

const testimonialWithUser = {
  id: 'test-1',
  body: 'A testimonial body.',
  userId: 'user-1',
  featured: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  user: { id: 'user-1', name: 'User One', email: 'user1@pcn.com', image: null },
};

describe('fetchTestimonials', () => {
  it('returns the list of testimonials ordered by creation date', async () => {
    prismaMock.testimonial.findMany.mockResolvedValue([testimonialWithUser] as any);

    const result = await fetchTestimonials();

    expect(result).toEqual([testimonialWithUser]);
    expect(prismaMock.testimonial.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  });

  it('returns an empty array when there are no testimonials', async () => {
    prismaMock.testimonial.findMany.mockResolvedValue([]);

    const result = await fetchTestimonials();

    expect(result).toEqual([]);
  });
});
