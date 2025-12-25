'use server';

import prisma from '@/lib/prisma';

export const fetchFeaturedTestimonials = () =>
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
          email: true,
        },
      },
    },
  });

