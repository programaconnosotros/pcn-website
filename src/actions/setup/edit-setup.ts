'use server';

import prisma from '@/lib/prisma';
import { setupSchema } from '@/schemas/setup-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const editSetup = async ({
  id,
  formData,
  imageUrl,
}: {
  id: string;
  formData: FormData;
  imageUrl: string;
}) => {
  const validatedData = setupSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    imageUrl
  });

  const sessionId = await cookies().get('sessionId');

  if (!sessionId) throw new Error('User not authenticated');

  const session = await prisma.session.findUnique({
    where: { id: sessionId.value },
  });

  if (!session) throw new Error('Session not found');

  await prisma.setup.update({
    where: { id, authorId: session.userId },
    data: {
      title: validatedData.title,
      content: validatedData.description!,
      imageUrl: validatedData.imageUrl,
    },
  });

  revalidatePath('/setups');
};
