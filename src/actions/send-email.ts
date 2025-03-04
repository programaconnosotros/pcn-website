'use server';

import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (input: {
  title: string;
  email: string;
  name: string;
  message: string;
}) => {
  const { data, error } = await resend.emails.send({
    from: 'Agus (ASZ Software) <agus@asz.software>',
    to: ['agus@asz.software'],
    subject: input.title,
    react: EmailTemplate(input),
  });

  if (error) {
    console.error('Error sending email', error);
    return Response.json({ error }, { status: 500 });
  }

  console.log('Email sent successfully', Response.json(data));
};
