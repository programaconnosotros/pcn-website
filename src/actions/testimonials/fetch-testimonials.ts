'use server';

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

export const fetchTestimonials = async () => listTestimonials();

const listTestimonials = cached(
  'testimonials',
  () =>
    prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
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
