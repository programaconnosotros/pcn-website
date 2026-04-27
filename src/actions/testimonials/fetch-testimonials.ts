'use server';

import prisma from '@/lib/prisma';

export const fetchTestimonials = async () =>
  prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
