'use server';

import prisma from '@/lib/prisma';

// Esta función permite obtener eventos incluso si están eliminados
// para que los admins puedan editarlos
export const fetchEventForEdit = (id: string) =>
  prisma.event.findUnique({
    where: {
      id: id,
    },
    include: {
      images: true,
      sponsors: true,
    },
  });


