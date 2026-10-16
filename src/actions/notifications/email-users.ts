// Server-only helper for other server actions. Not a server action itself, so nobody can call it
// from the browser to mail other users.

import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { sendEmails } from '@/lib/email';

const NAME_SLOT = '%%PCN_NOMBRE%%';

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

/**
 * Mails the same email to each of `users` once (by address), greeting each by first name.
 * The template renders once, with a slot for the name, so mailing every member stays cheap.
 * Never throws: an email that couldn't go out shouldn't undo what caused it. Returns how many
 * failed.
 */
export const emailUsers = async (
  users: { name: string; email: string }[],
  subject: string,
  email: (_firstName: string) => ReactElement,
) => {
  const byEmail = new Map<string, { name: string; email: string }>();
  for (const user of users) {
    const key = user.email.toLowerCase();
    if (!byEmail.has(key)) byEmail.set(key, user);
  }
  const recipients = [...byEmail.values()];
  if (recipients.length === 0) return 0;

  try {
    const html = await render(email(NAME_SLOT));
    return await sendEmails(
      recipients.map((user) => ({
        to: user.email,
        subject,
        html: html.replaceAll(NAME_SLOT, escapeHtml(user.name.trim().split(/\s+/)[0] ?? '')),
      })),
    );
  } catch (error) {
    console.error(`Error emailing users (${subject}):`, error);
    return recipients.length;
  }
};
