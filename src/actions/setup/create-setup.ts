'use server';

import prisma from '@/lib/prisma';
import { setupSchema } from '@/schemas/setup-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const createSetup = async (formData: FormData, imageUrl: string) => {
  const validatedData = setupSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    imageUrl: imageUrl,
  });

  const sessionId = cookies().get('sessionId');

  if (!sessionId) throw new Error('Not authenticated');

  const session = await prisma.session.findUnique({
    where: { id: sessionId.value },
  });

  if (!session) throw new Error('Session not found');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) throw new Error('User not found');

  const setup = await prisma.setup.create({
    data: {
      title: validatedData.title,
      content: validatedData.description!,
      imageUrl: validatedData.imageUrl,
      author: { connect: { id: user.id } },
    },
  });
  revalidatePath('/setups');
  revalidatePath('/');
  return setup.id;
};
