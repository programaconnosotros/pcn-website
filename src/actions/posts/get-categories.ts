'use server';

import prisma from '@/lib/prisma';

export async function getPostCategories() {
  try {
    const categories = await prisma.postCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  } catch (error) {
    console.error('Error fetching post categories:', error);
    throw new Error('Error al obtener las categorías');
  }
}
