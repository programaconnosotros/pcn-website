'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function getPostForEdit(postId: string) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    if (!sessionId) {
      throw new Error('No hay sesión activa');
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session) {
      throw new Error('Sesión inválida');
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        categoryId: true,
        authorId: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('El post no existe');
    }

    if (post.authorId !== session.userId) {
      throw new Error('No tienes permisos para editar este post');
    }

    return {
      success: true,
      post,
    };
  } catch (error) {
    console.error('Error fetching post for edit:', error);
    
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error interno del servidor');
  }
}
