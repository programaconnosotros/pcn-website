import { EmailButton, EmailLayout, EmailPanel, EmailText } from '@/components/email/email-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

/** A message from an event's organizers to the people signed up (or waiting) for it. */
export const EventBroadcastEmail = ({
  userName,
  eventName,
  eventId,
  subject,
  message,
}: {
  userName: string;
  eventName: string;
  eventId: string;
  subject: string;
  message: string;
}) => (
  <EmailLayout path="eventos/novedades" title={subject} preview={`${eventName}: ${subject}`}>
    <EmailText>¡Hola {userName}!</EmailText>
    <EmailPanel command={`pcn eventos novedades "${eventName}"`}>
      {message
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <EmailText key={index}>
            {paragraph
              .split('\n')
              .flatMap((line, i) => (i === 0 ? [line] : [<br key={i} />, line]))}
          </EmailText>
        ))}
    </EmailPanel>
    <EmailButton href={`${SITE_URL}/eventos/${eventId}`} label="verEvento();" />
    <EmailText>— El equipo que organiza {eventName}</EmailText>
  </EmailLayout>
);
