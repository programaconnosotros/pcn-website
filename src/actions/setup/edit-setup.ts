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
  console.log('Starting editSetup function with data:', { id, formData, imageUrl });
  const validatedData = setupSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
    imageUrl: imageUrl,
  });

  console.log('Data validated successfully:', validatedData);

  const sessionId = await cookies().get('sessionId');
  console.log('Session ID retrieved:', sessionId?.value);

  if (!sessionId) throw new Error('User not authenticated');

  const session = await prisma.session.findUnique({
    where: { id: sessionId.value },
  });
  console.log('Session found:', session?.id);

  if (!session) throw new Error('Session not found');

  console.log('Attempting to update setup with ID:', id);
  await prisma.setup.update({
    where: { id, authorId: session.userId },
    data: {
      title: validatedData.title,
      content: validatedData.description!,
      imageUrl: validatedData.imageUrl,
    },
  });
  console.log('Setup updated successfully');

  revalidatePath('/setups');
  console.log('Path revalidated: /setups');
};
