'use server';

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

export const fetchFeaturedTestimonials = async () => listFeaturedTestimonials();

const listFeaturedTestimonials = cached(
  'featured-testimonials',
  () =>
    prisma.testimonial.findMany({
      where: {
        featured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 3, // Solo los 3 más recientes
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),
  { models: ['Testimonial', 'User'] },
);
