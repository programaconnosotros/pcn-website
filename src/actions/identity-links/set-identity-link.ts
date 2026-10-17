'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { members } from '@/data/whatsapp-conversations/members';
import { articleAuthors } from '@/app/(platform)/lectura/articles';
import { IDENTITY_SOURCES, type IdentitySource } from '@/lib/identity-links';
import { HISTORIA_PEOPLE } from '@/components/historia/people';
import { videoSpeakers } from '@/components/videos/videos';
import { courseTeachers } from '@/app/(platform)/cursos/courses';
import { getAllCourses, getArticles, getVideos } from '@/lib/recommendations';

const memberNames = new Set(members.map((member) => member.name));
const historiaNames = new Set<string>(HISTORIA_PEOPLE);
const GITHUB_LOGIN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/** Whether the site knows `name` from `source`: a member, an author, a speaker… */
const isKnownName = async (source: IdentitySource, name: string) => {
  switch (source) {
    case 'whatsapp':
      return memberNames.has(name);
    case 'articulos':
      return (await getArticles()).some((article) => articleAuthors(article).includes(name));
    case 'historia':
      return historiaNames.has(name);
    case 'videos':
      return (await getVideos()).some((video) => videoSpeakers(video).includes(name));
    case 'cursos':
      return (await getAllCourses()).some((course) => courseTeachers(course).includes(name));
    default:
      return GITHUB_LOGIN.test(name);
  }
};

const REVALIDATED_PAGE = {
  whatsapp: '/conversaciones',
  github: '/desarrollo',
  articulos: '/lectura',
  historia: '/historia',
  videos: '/videos',
  cursos: '/cursos',
};

const linkSchema = z.object({
  source: z.enum(IDENTITY_SOURCES),
  externalName: z.string().min(1).max(100),
  userId: z.string().min(1).nullable(),
});

/**
 * Links a WhatsApp member, a GitHub login, an article author, a person mentioned in /historia or
 * someone credited in a video or a course to a platform user, or unlinks it when `userId` is null. Admins only.
 */
export const setIdentityLink = async (input: z.input<typeof linkSchema>) => {
  await requireAdmin();

  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos');
  }
  const { source, externalName, userId } = parsed.data;
  if (!(await isKnownName(source, externalName))) throw new Error('Nombre desconocido');

  const previous = await prisma.identityLink.findUnique({
    where: { source_externalName: { source, externalName } },
    select: { userId: true },
  });

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new Error('Usuario no encontrado');
    await prisma.identityLink.upsert({
      where: { source_externalName: { source, externalName } },
      create: { source, externalName, userId },
      update: { userId },
    });
  } else if (previous) {
    await prisma.identityLink.delete({
      where: { source_externalName: { source, externalName } },
    });
  }

  revalidatePath('/vinculos');
  revalidatePath(REVALIDATED_PAGE[source]);
  for (const id of new Set([previous?.userId, userId])) {
    if (id) revalidatePath(`/perfil/${id}`);
  }

  return { success: true };
};
