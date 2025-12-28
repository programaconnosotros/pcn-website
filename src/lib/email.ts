import nodemailer from 'nodemailer';

// Constantes de configuración
export const RATE_LIMIT_SECONDS = 60; // 1 minuto entre envíos
export const CODE_EXPIRATION_MINUTES = 15; // 15 minutos de expiración

/**
 * Crea un transporter de nodemailer para enviar emails
 * @throws Error si las credenciales SMTP no están configuradas
 */
export const getEmailTransporter = () => {
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

/**
 * Genera un código numérico de 6 dígitos
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calcula la fecha de expiración para un código
 */
export const getCodeExpirationDate = (): Date => {
  return new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000);
};

/**
 * Verifica rate limiting basado en la fecha del último token
 * @returns Segundos restantes de espera, o 0 si no hay rate limit
 */
export const checkRateLimit = (lastTokenCreatedAt: Date | null): number => {
  if (!lastTokenCreatedAt) return 0;

  const secondsSinceLastToken = Math.floor(
    (Date.now() - lastTokenCreatedAt.getTime()) / 1000,
  );

  if (secondsSinceLastToken < RATE_LIMIT_SECONDS) {
    return RATE_LIMIT_SECONDS - secondsSinceLastToken;
  }

  return 0;
};

/**
 * Envía un email usando el transporter configurado
 * @throws Error si falla el envío
 */
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const transporter = getEmailTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(
      'Failed to send email:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    if (error instanceof Error && error.message.includes('SMTP credentials not configured')) {
      throw new Error('Error de configuración: Las credenciales de email no están configuradas');
    }

    throw new Error('Error al enviar el email. Por favor, contactá al administrador.');
  }
};

