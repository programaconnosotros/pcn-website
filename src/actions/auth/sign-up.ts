'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signUpSchema } from '@/lib/validations/auth-schemas';

const formSchema = signUpSchema;

export const signUp = async (data: z.infer<typeof formSchema>) => {
  const { confirmPassword, ...cleanedData } = formSchema.parse(data);

  const hashedPassword = await bcrypt.hash(cleanedData.password, 10);

  const user = await prisma.user.create({
    data: { ...cleanedData, password: hashedPassword },
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });

  cookies().set('sessionId', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect('/');
};
