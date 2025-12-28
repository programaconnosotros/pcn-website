export const PasswordResetCodeEmail = ({
  userName,
  code,
}: {
  userName: string;
  code: string;
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
        Código de verificación
      </h1>
    </div>

    {/* Contenido principal */}
    <div style={{ padding: '10px 0' }}>
      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        ¡Hola {userName || ''}!
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usá el siguiente código
        para verificar tu identidad:
      </p>

      <div
        style={{
          backgroundColor: '#0d1b2a',
          padding: '25px',
          borderRadius: '5px',
          margin: '25px 0',
          textAlign: 'center',
          borderLeft: '4px solid #04f4be',
        }}
      >
        <p
          style={{
            fontFamily: 'monospace',
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0',
            color: '#04f4be',
            letterSpacing: '8px',
          }}
        >
          {code}
        </p>
      </div>

      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        Este código expira en <strong style={{ color: '#04f4be' }}>15 minutos</strong>.
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        Si no solicitaste este cambio, podés ignorar este correo. Tu contraseña no va a
        ser modificada.
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
        &copy; {new Date().getFullYear()} programaConNosotros: la comunidad que necesitas para llevar tu carrera al siguiente nivel.
      </p>
    </div>
  </div>
);
