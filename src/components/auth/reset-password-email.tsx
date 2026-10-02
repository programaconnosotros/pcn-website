import {
  EmailCode,
  EmailHighlight,
  EmailLayout,
  EmailPanel,
  EmailText,
} from '@/components/email/email-layout';

export const PasswordResetCodeEmail = ({ userName, code }: { userName: string; code: string }) => (
  <EmailLayout
    path="restablecer-contrasena"
    title="Código de verificación"
    preview={`Tu código para restablecer la contraseña es ${code}`}
  >
    <EmailText>¡Hola {userName || ''}!</EmailText>
    <EmailText>
      Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usá el siguiente código
      para verificar tu identidad:
    </EmailText>

    <EmailPanel command="cat codigo.txt">
      <EmailCode code={code} />
    </EmailPanel>

    <EmailText>
      Este código expira en <EmailHighlight>15 minutos</EmailHighlight>.
    </EmailText>
    <EmailText>
      Si no solicitaste este cambio, podés ignorar este correo. Tu contraseña no va a ser
      modificada.
    </EmailText>
  </EmailLayout>
);
