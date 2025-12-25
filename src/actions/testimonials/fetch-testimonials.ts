'use server';

import prisma from '@/lib/prisma';

export const fetchTestimonials = () =>
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

