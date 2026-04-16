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
  <div
    style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      border: '1px solid #e1e1e1',
      borderRadius: '5px',
      backgroundColor: '#1b263b',
    }}
  >
    {/* Encabezado */}
    <div
      style={{
        textAlign: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #04f4be',
        paddingBottom: '20px',
      }}
    >
      <h1
        style={{
          color: '#04f4be',
          fontSize: '24px',
          margin: '10px 0',
          fontWeight: 'bold',
          letterSpacing: '-0.025em',
        }}
      >
        ¡Conseguiste un lugar!
      </h1>
    </div>

    {/* Contenido principal */}
    <div style={{ padding: '10px 0' }}>
      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        ¡Hola {userName}!
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        Te informamos que se ha liberado un lugar en el evento y has sido inscrito
        automáticamente desde la lista de espera.
      </p>

      <div
        style={{
          backgroundColor: '#0d1b2a',
          padding: '25px',
          borderRadius: '5px',
          margin: '25px 0',
          borderLeft: '4px solid #04f4be',
        }}
      >
        <p
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: '#04f4be',
          }}
        >
          {eventName}
        </p>
        <p style={{ fontSize: '14px', margin: '0', color: '#a2a9b9' }}>{eventDate}</p>
      </div>

      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        Tu inscripción está confirmada. Podés ver los detalles del evento en el siguiente
        enlace:
      </p>

      <div style={{ textAlign: 'center', margin: '25px 0' }}>
        <a
          href={`${SITE_URL}/eventos/${eventId}`}
          style={{
            backgroundColor: '#04f4be',
            color: '#0d1b2a',
            padding: '12px 24px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          Ver evento
        </a>
      </div>

      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        ¡Te esperamos!
      </p>
    </div>

    {/* Pie de página */}
    <div
      style={{
        borderTop: '1px solid #415a77',
        paddingTop: '15px',
        marginTop: '20px',
        fontSize: '12px',
        color: '#a2a9b9',
        textAlign: 'center',
      }}
    >
      <p>Este es un mensaje automático. Por favor, no respondas a este correo.</p>
      <p style={{ margin: '5px 0' }}>
        &copy; {new Date().getFullYear()} programaConNosotros: la comunidad que necesitas para
        llevar tu carrera al siguiente nivel.
      </p>
    </div>
  </div>
);
