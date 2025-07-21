'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import * as z from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
});

export async function createPost(data: z.infer<typeof createPostSchema>) {
  try {
    // Validar datos de entrada
    const validatedData = createPostSchema.parse(data);

    // Obtener el ID del usuario desde las cookies/sesión
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;

    if (!sessionId) {
      throw new Error('No hay sesión activa');
    }

    // Buscar la sesión para obtener el userId
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session) {
      throw new Error('Sesión inválida');
    }

    // Verificar que la categoría existe
    const category = await prisma.postCategory.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      throw new Error('La categoría seleccionada no existe');
    }

    // Crear el post
    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        authorId: session.userId,
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

    // Revalidar las páginas del foro
    revalidatePath('/foro');
    revalidatePath(`/foro/categoria/${category.slug}`);

    return {
      success: true,
      post,
    };
  } catch (error) {
    console.error('Error creating post:', error);

    if (error instanceof z.ZodError) {
      throw new Error('Datos de entrada inválidos');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error interno del servidor');
  }
}
