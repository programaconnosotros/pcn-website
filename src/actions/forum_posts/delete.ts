'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function deletePost(postId: string) {
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
        authorId: true,
        category: {
          select: { slug: true },
        },
      },
    });

    if (!post) {
      throw new Error('El post no existe');
    }

    if (post.authorId !== session.userId) {
      throw new Error('No tienes permisos para eliminar este post');
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath('/foro');
    revalidatePath(`/foro/categoria/${post.category.slug}`);

    return {
      success: true,
      message: 'Post eliminado exitosamente',
    };
  } catch (error) {
    console.error('Error deleting post:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error interno del servidor');
  }
}
