'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { signUpActionSchema } from '@/lib/validations/auth-schemas';
import { EmailVerificationEmail } from '@/components/auth/verification-email';
import { render } from '@react-email/render';
import { generateVerificationCode, getCodeExpirationDate, sendEmail } from '@/lib/email';

export const signUp = async (
  data: z.infer<typeof signUpActionSchema>,
): Promise<
  | { success: true; redirectUrl: string }
  | { success: false; error: 'EMAIL_ALREADY_EXISTS' }
  | { success: false; error: 'UNKNOWN_ERROR' }
> => {
  const {
    confirmPassword: _confirmPassword,
    redirectTo,
    country,
    profession,
    studyField,
    enterprise,
    studyPlace,
    image,
    phoneNumber,
    ...cleanedData
  } = signUpActionSchema.parse(data);

  try {
    // Verificar si el email ya existe antes de intentar crear
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanedData.email },
    });

    if (existingUser) {
      return { success: false, error: 'EMAIL_ALREADY_EXISTS' };
    }

    const hashedPassword = await bcrypt.hash(cleanedData.password, 10);

    // Crear usuario con emailVerified = false (por defecto)
    const user = await prisma.user.create({
      data: {
        ...cleanedData,
        password: hashedPassword,
        countryOfOrigin: country,
        jobTitle: profession || null,
        career: studyField || null,
        enterprise: enterprise || null,
        studyPlace: studyPlace || null,
        image: image || null,
        phoneNumber: phoneNumber || null,
        emailVerified: false,
      },
    });

    // Generar código de verificación
    const code = generateVerificationCode();
    const expiresAt = getCodeExpirationDate();

    // Guardar token de verificación
    await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        code,
        expiresAt,
      },
    });

    // Enviar email con el código
    try {
      const emailHtml = await render(EmailVerificationEmail({ userName: user.name, code }));
      await sendEmail({
        to: user.email,
        subject: 'Verificá tu correo electrónico - Programa Con Nosotros',
        html: emailHtml,
      });
    } catch (error) {
      console.error(
        'Failed to send verification email:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      // No lanzar error para no bloquear el registro
      // El usuario podrá reenviar el código desde la página de verificación
    }

    // Devolver la URL de verificación para que el cliente redirija
    const verifyUrl = `/autenticacion/verificar-email?email=${encodeURIComponent(user.email)}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`;
    return { success: true, redirectUrl: verifyUrl };
  } catch (error: any) {
    // Capturar error de Prisma P2002 (unique constraint) como fallback
    if (error?.code === 'P2002' && error?.meta?.target?.includes('email')) {
      return { success: false, error: 'EMAIL_ALREADY_EXISTS' };
    }
    console.error('Error en signUp:', error);
    return { success: false, error: 'UNKNOWN_ERROR' };
  }
};
