import {
  EmailButton,
  EmailLayout,
  EmailMeta,
  EmailPanel,
  EmailText,
  emailColors,
  emailSans,
} from '@/components/email/email-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

/**
 * An automatic notice about an event: that it was published, that its date or place changed, or
 * a new announcement on it. `message` keeps its paragraphs and line breaks.
 */
export const EventNoticeEmail = ({
  userName,
  eventName,
  eventId,
  path,
  title,
  preview,
  command,
  intro,
  rows = [],
  message,
}: {
  userName: string;
  eventName: string;
  eventId: string;
  path: string;
  title: string;
  preview: string;
  command: string;
  intro: string;
  rows?: { label: string; value: string; tone?: 'green' | 'amber' | 'muted' }[];
  message?: string;
}) => (
  <EmailLayout path={path} title={title} preview={preview}>
    <EmailText>¡Hola {userName}!</EmailText>
    <EmailText>{intro}</EmailText>
    <EmailPanel command={command}>
      <p
        style={{
          fontFamily: emailSans,
          fontSize: '20px',
          fontWeight: 600,
          lineHeight: '1.3',
          color: emailColors.foreground,
          margin: 0,
        }}
      >
        {eventName}
      </p>
      {rows.length > 0 && <EmailMeta rows={rows} />}
      {message
        ?.split(/\n{2,}/)
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
    <EmailText>— El equipo de programaConNosotros</EmailText>
  </EmailLayout>
);
