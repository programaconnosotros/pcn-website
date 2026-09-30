'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

// Esta función permite obtener eventos incluso si están eliminados
// para que los admins puedan editarlos
export const fetchEventForEdit = async (id: string) => {
  await requireAdmin();
  return prisma.event.findUnique({
    where: {
      id: id,
    },
    include: {
      images: true,
      sponsors: true,
    },
  });
};
