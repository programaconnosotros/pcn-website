import { User } from '@prisma/client';

export const ResetPasswordEmail = ({ user, newPassword }: { user: User; newPassword: string }) => (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #e1e1e1',
    borderRadius: '5px',
    backgroundColor: '#1b263b'
  }}>
    {/* Encabezado */}
    <div style={{
      textAlign: 'center',
      marginBottom: '20px',
      borderBottom: '1px solid #415a77',
      paddingBottom: '20px'
    }}>

      <h1 style={{
        color: '#60a5fa',
        fontSize: '24px',
        margin: '10px 0',
        fontWeight: 'bold',
        letterSpacing: '-0.025em',
      }}>
        Restablecimiento de Contraseña
      </h1>
    </div>

    {/* Contenido principal */}
    <div style={{ padding: '10px 0' }}>
      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        ¡Hola {user.name || ''}!
      </p>

      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        Tu cuenta ha sido actualizada con una nueva contraseña temporal:
      </p>

      <div style={{
        backgroundColor: '#0d1b2a',
        padding: '15px',
        borderRadius: '5px',
        margin: '20px 0',
        textAlign: 'center',
        borderLeft: '4px solid #60a5fa'
      }}>
        <p style={{
          fontFamily: 'monospace',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '0',
          color: '#e5e7eb',
          letterSpacing: '1px'
        }}>
          {newPassword}
        </p>
      </div>

      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        Por motivos de seguridad, te recomendamos iniciar sesión y cambiar esta contraseña por una que puedas recordar fácilmente.
      </p>

      {/* Botón de acción */}
      <div style={{
        textAlign: 'center',
        margin: '25px 0'
      }}>
        <a
          href={`https://programaconnosotros.com/auth/sign-in?email=${encodeURIComponent(user.email)}`}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block',
            textAlign: 'center',
            fontSize: '16px'
          }}
        >
          Iniciar Sesión
        </a>
      </div>

      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#ffffff' }}>
        Si no has solicitado este cambio, por favor contacta inmediatamente con el administrador del sistema.
      </p>
    </div>

    {/* Pie de página */}
    <div style={{
      borderTop: '1px solid #415a77',
      paddingTop: '15px',
      marginTop: '20px',
      fontSize: '12px',
      color: '#a2a9b9',
      textAlign: 'center'
    }}>
      <p>Este es un mensaje automático. Por favor, no respondas a este correo.</p>
      <p style={{ margin: '5px 0' }}>
        &copy; {new Date().getFullYear()} Programa Con Nosotros. Todos los derechos reservados.
      </p>
    </div>
  </div>
);
