'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { forumPostSchema, type ForumPostFormData } from '@/schemas/forum-schema';

const idSchema = z.string().min(1).max(64);

async function requireUser() {
  const session = await getCurrentSession();
  if (!session) throw new Error('Debes estar autenticado');
  return session.user;
}

const parsePost = async (input: ForumPostFormData) => {
  const parsed = forumPostSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos');
  const category = await prisma.forumCategory.findUnique({
    where: { id: parsed.data.categoryId },
    select: { id: true },
  });
  if (!category) throw new Error('La categoría no existe');
  return parsed.data;
};

/** The thread, if the user wrote it or is an admin. */
const findOwnPost = async (id: string, user: { id: string; role: string }) => {
  const post = await prisma.forumPost.findUnique({
    where: { id: idSchema.parse(id) },
    select: { id: true, authorId: true },
  });
  if (!post) throw new Error('El tema no existe');
  if (post.authorId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Solo quien escribió el tema puede cambiarlo');
  }
  return post;
};

const revalidateForum = (postId?: string) => {
  revalidatePath('/foro', 'layout');
  if (postId) revalidatePath(`/foro/tema/${postId}`);
};

export async function createForumPost(input: ForumPostFormData) {
  const user = await requireUser();
  await enforceRateLimit('createContent');
  const data = await parsePost(input);
  const post = await prisma.forumPost.create({
    data: { ...data, authorId: user.id },
    select: { id: true },
  });
  revalidateForum();
  return post;
}

export async function updateForumPost(id: string, input: ForumPostFormData) {
  const user = await requireUser();
  await enforceRateLimit('editContent');
  const post = await findOwnPost(id, user);
  const data = await parsePost(input);
  await prisma.forumPost.update({
    where: { id: post.id },
    data: { ...data, activeAt: new Date() },
  });
  revalidateForum(post.id);
}

export async function deleteForumPost(id: string) {
  const user = await requireUser();
  const post = await findOwnPost(id, user);
  await prisma.forumPost.delete({ where: { id: post.id } });
  revalidateForum(post.id);
}

const flagsSchema = z.object({ isPinned: z.boolean(), isLocked: z.boolean() }).partial();

/** Admins pin a thread to the top or lock it so it takes no new replies. */
export async function moderateForumPost(
  id: string,
  flags: { isPinned?: boolean; isLocked?: boolean },
) {
  const user = await requireUser();
  if (user.role !== 'ADMIN') throw new Error('Solo un admin puede fijar o cerrar temas');
  const postId = idSchema.parse(id);
  await prisma.forumPost.update({ where: { id: postId }, data: flagsSchema.parse(flags) });
  revalidateForum(postId);
}
