'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signUpActionSchema } from '@/lib/validations/auth-schemas';

export const signUp = async (data: z.infer<typeof signUpActionSchema>) => {
  const {
    confirmPassword,
    redirectTo,
    country,
    profession,
    studyField,
    enterprise,
    studyPlace,
    ...cleanedData
  } = signUpActionSchema.parse(data);

  const hashedPassword = await bcrypt.hash(cleanedData.password, 10);

  const user = await prisma.user.create({
    data: {
      ...cleanedData,
      password: hashedPassword,
      countryOfOrigin: country,
      jobTitle: profession || null,
      career: studyField || null,
      enterprise: enterprise || null,
      studyPlace: studyPlace || null,
    },
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

  // Redirigir a la URL especificada o a home por defecto
  const redirectPath = redirectTo || '/';
  redirect(redirectPath);
};
