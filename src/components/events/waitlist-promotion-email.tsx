import {
  EmailButton,
  EmailLayout,
  EmailPanel,
  EmailText,
  emailColors,
  emailMono,
  emailSans,
} from '@/components/email/email-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const WaitlistPromotionEmail = ({
  userName,
  eventName,
  eventDate,
  eventId,
}: {
  userName: string;
  eventName: string;
  eventDate: string;
  eventId: string;
}) => (
  <EmailLayout
    path="eventos/lista-de-espera"
    title="¡Conseguiste un lugar!"
    preview={`Tu inscripción a ${eventName} quedó confirmada`}
  >
    <EmailText>¡Hola {userName || ''}!</EmailText>
    <EmailText>
      Se liberó un lugar en el evento y, como estabas en la lista de espera, tu inscripción ya quedó
      confirmada.
    </EmailText>

    <EmailPanel command="inscripcion --estado">
      <p
        style={{
          fontFamily: emailMono,
          fontSize: '12px',
          color: emailColors.green,
          margin: '0 0 8px 0',
        }}
      >
        [confirmada]
      </p>
      <p
        style={{
          fontFamily: emailSans,
          fontSize: '18px',
          fontWeight: 600,
          lineHeight: '1.3',
          color: emailColors.foreground,
          margin: '0 0 6px 0',
        }}
      >
        {eventName}
      </p>
      <p
        style={{
          fontFamily: emailMono,
          fontSize: '13px',
          color: emailColors.muted,
          margin: 0,
        }}
      >
        {eventDate}
      </p>
    </EmailPanel>

    <EmailText>
      Si al final no podés ir, cancelá tu inscripción desde la página del evento así el lugar le
      llega a la próxima persona de la lista.
    </EmailText>

    <EmailButton href={`${SITE_URL}/eventos/${eventId}`} label="verEvento();" />

    <EmailText>¡Te esperamos!</EmailText>
  </EmailLayout>
);
