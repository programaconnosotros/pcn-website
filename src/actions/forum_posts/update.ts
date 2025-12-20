'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import * as z from 'zod';

const updatePostSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
});

export async function updatePost(postId: string, data: z.infer<typeof updatePostSchema>) {
  try {
    const validatedData = updatePostSchema.parse(data);

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

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { 
        authorId: true,
        category: {
          select: { slug: true }
        }
      },
    });

    if (!existingPost) {
      throw new Error('El post no existe');
    }

    if (existingPost.authorId !== session.userId) {
      throw new Error('No tienes permisos para editar este post');
    }

    const category = await prisma.postCategory.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      throw new Error('La categoría seleccionada no existe');
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        categoryId: validatedData.categoryId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            name: true,
            color: true,
            icon: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    revalidatePath('/foro');
    revalidatePath(`/foro/categoria/${existingPost.category.slug}`);
    revalidatePath(`/foro/categoria/${category.slug}`);
    revalidatePath(`/foro/tema/${postId}`);

    return {
      success: true,
      post: updatedPost,
    };
  } catch (error) {
    console.error('Error updating post:', error);
    
    if (error instanceof z.ZodError) {
      throw new Error('Datos de entrada inválidos');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error interno del servidor');
  }
}
