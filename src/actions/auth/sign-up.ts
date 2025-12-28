'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { signUpActionSchema } from '@/lib/validations/auth-schemas';
import { EmailVerificationEmail } from '@/components/auth/verification-email';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';

const getTransporter = () => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error(
      'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.',
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

// Genera un código de 6 dígitos
const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
      emailVerified: false,
    },
  });

  // Generar código de verificación
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

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
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
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

  // Redirigir a la página de verificación
  const verifyUrl = `/autenticacion/verificar-email?email=${encodeURIComponent(user.email)}${redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ''}`;
  redirect(verifyUrl);
};
