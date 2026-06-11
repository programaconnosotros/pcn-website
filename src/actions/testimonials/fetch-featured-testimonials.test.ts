import { prismaMock } from '@/test/prisma';
import { fetchFeaturedTestimonials } from './fetch-featured-testimonials';

const featuredTestimonial = {
  id: 'test-1',
  body: 'A featured testimonial body.',
  userId: 'user-1',
  featured: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  user: { id: 'user-1', name: 'User One', email: 'user1@pcn.com', image: null },
};

describe('fetchFeaturedTestimonials', () => {
  it('returns featured testimonials ordered by creation date', async () => {
    prismaMock.testimonial.findMany.mockResolvedValue([featuredTestimonial] as any);

    const result = await fetchFeaturedTestimonials();

    expect(result).toEqual([featuredTestimonial]);
    expect(prismaMock.testimonial.findMany).toHaveBeenCalledWith({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  });

  it('returns an empty array when there are no featured testimonials', async () => {
    prismaMock.testimonial.findMany.mockResolvedValue([]);

    const result = await fetchFeaturedTestimonials();

    expect(result).toEqual([]);
  });
});
