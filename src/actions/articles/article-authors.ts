'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

const revalidateWriter = (userId: string) => {
  revalidatePath('/lectura');
  revalidatePath(`/perfil/${userId}`);
};

/** Marca a un usuario como escritor de un artículo de /lectura. Solo admins. */
export async function addArticleAuthor(articleId: string, userId: string) {
  const admin = await requireAdmin();
  const article = await prisma.recommendation.findUnique({
    where: { kind_slug: { kind: 'ARTICLE', slug: String(articleId) } },
    select: { status: true },
  });
  if (article?.status !== 'APPROVED') {
    throw new Error('Artículo no encontrado');
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new Error('Usuario no encontrado');

  await prisma.articleAuthor.upsert({
    where: { articleId_userId: { articleId, userId } },
    create: { articleId, userId, addedById: admin.id },
    update: {},
  });
  revalidateWriter(userId);
  return { success: true };
}

/** Quita a un escritor de un artículo. Solo admins. */
export async function removeArticleAuthor(articleId: string, userId: string) {
  await requireAdmin();

  await prisma.articleAuthor.deleteMany({ where: { articleId, userId } });
  revalidateWriter(userId);
  return { success: true };
}
