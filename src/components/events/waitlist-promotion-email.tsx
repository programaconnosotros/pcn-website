import {
  EmailButton,
  EmailLayout,
  EmailMeta,
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
    log={['se liberó un lugar', 'lista de espera procesada', 'inscripción confirmada']}
  >
    <EmailText>¡Hola {userName || ''}!</EmailText>
    <EmailText>
      Se liberó un lugar en el evento y, como estabas en la lista de espera, tu inscripción ya quedó
      confirmada.
    </EmailText>

    <EmailPanel command="pcn eventos inscripcion --estado">
      <p
        style={{
          fontFamily: emailMono,
          fontSize: '11px',
          letterSpacing: '0.08em',
          color: emailColors.green,
          margin: '0 0 10px 0',
        }}
      >
        ● CONFIRMADA
      </p>
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
      <EmailMeta
        rows={[
          { label: 'fecha', value: eventDate },
          { label: 'origen', value: 'lista de espera', tone: 'muted' },
          { label: 'estado', value: 'lugar asignado', tone: 'green' },
        ]}
      />
    </EmailPanel>

    <EmailText>
      Si al final no podés ir, cancelá tu inscripción desde la página del evento así el lugar le
      llega a la próxima persona de la lista.
    </EmailText>

    <EmailButton href={`${SITE_URL}/eventos/${eventId}`} label="verEvento();" />

    <EmailText>¡Te esperamos!</EmailText>
  </EmailLayout>
);
