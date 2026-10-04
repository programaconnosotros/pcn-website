import { randomInt } from 'node:crypto';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Constantes de configuración
export const RATE_LIMIT_SECONDS = 60; // 1 minuto entre envíos
export const CODE_EXPIRATION_MINUTES = 15; // 15 minutos de expiración

/**
 * Transporte para desarrollo y la suite e2e. En producción los emails salen por Resend
 * (`sendEmail`), no por acá.
 * - `EMAIL_TRANSPORT=json`: no se manda nada (e2e, o desarrollo sin servidor de mail).
 * - `SMTP_HOST`: un servidor SMTP local como MailHog, sin credenciales.
 * @throws Error si no hay ni uno ni otro configurado
 */
export const getEmailTransporter = () => {
  // Nunca se define en producción: los tests leen el código de la base
  if (process.env.EMAIL_TRANSPORT === 'json') {
    return nodemailer.createTransport({ jsonTransport: true });
  }

  const smtpHost = process.env.SMTP_HOST;
  if (smtpHost) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: false,
    });
  }

  throw new Error(
    'Email not configured. Set RESEND_API_KEY (production) or SMTP_HOST (local MailHog).',
  );
};

/**
 * Genera un código numérico de 6 dígitos
 */
export const generateVerificationCode = (): string => {
  // randomInt usa el generador criptográfico; Math.random() es predecible
  return randomInt(100000, 1000000).toString();
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

  const secondsSinceLastToken = Math.floor((Date.now() - lastTokenCreatedAt.getTime()) / 1000);

  if (secondsSinceLastToken < RATE_LIMIT_SECONDS) {
    return RATE_LIMIT_SECONDS - secondsSinceLastToken;
  }

  return 0;
};

const SENDER_NAME = 'Agus de PCN';
const DEFAULT_SENDER_ADDRESS = 'no-reply@programaconnosotros.com';

/**
 * Remitente de los emails: siempre con una dirección (un nombre solo es un `MAIL FROM` inválido
 * que MailHog rechaza). Con Resend tiene que ser de un dominio verificado en la cuenta;
 * `EMAIL_FROM` permite cambiarla sin tocar el código.
 */
export const getSender = () => ({
  name: SENDER_NAME,
  address: process.env.EMAIL_FROM || DEFAULT_SENDER_ADDRESS,
});

const formatSender = ({ name, address }: { name: string; address: string }) =>
  `${name} <${address}>`;

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
    const apiKey = process.env.RESEND_API_KEY;
    // Producción: la API de Resend. Desarrollo y e2e: MailHog o nada (getEmailTransporter).
    if (apiKey && process.env.EMAIL_TRANSPORT !== 'json') {
      const { error } = await new Resend(apiKey).emails.send({
        from: formatSender(getSender()),
        to,
        subject,
        html,
      });
      if (error) throw new Error(`Resend: ${error.message}`);
      return;
    }

    await getEmailTransporter().sendMail({ from: getSender(), to, subject, html });
  } catch (error) {
    console.error(
      'Failed to send email:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    if (error instanceof Error && error.message.startsWith('Email not configured')) {
      throw new Error('Error de configuración: el envío de emails no está configurado');
    }

    throw new Error('Error al enviar el email. Por favor, contactá al administrador.');
  }
};
