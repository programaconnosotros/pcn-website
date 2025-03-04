import { User } from '@prisma/client';

export const ResetPasswordEmail = ({ user, newPassword }: { user: User; newPassword: string }) => (
  <div>
    <p>Hola!</p>

    <p>
      Esta es tu nueva contraseña: <strong>{newPassword}</strong>
    </p>

    <p>
      Podés iniciar sesión con ella clickeando{' '}
      <a
        href={`https://programaconnosotros.com/auth/sign-in?email=${user.email}&password=${newPassword}`}
      >
        acá
      </a>{' '}
      y cambiarla en el perfil.
    </p>

    <p>Si no has solicitado este cambio, por favor contacta con el administrador del sistema.</p>
  </div>
);
