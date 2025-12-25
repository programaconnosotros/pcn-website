'use server';

import prisma from '@/lib/prisma';

export const fetchTestimonial = async (id: string) => {
  return prisma.testimonial.findUnique({
    where: { id },
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
};

