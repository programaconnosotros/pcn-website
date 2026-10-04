'use server';

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

export const fetchTestimonial = async (id: string) => findTestimonial(id);

const findTestimonial = cached(
  'testimonial',
  (id: string) =>
    prisma.testimonial.findUnique({
      where: { id },
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
