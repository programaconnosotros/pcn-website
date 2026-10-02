import {
  EmailCode,
  EmailHighlight,
  EmailLayout,
  EmailPanel,
  EmailText,
} from '@/components/email/email-layout';

export const EmailVerificationEmail = ({ userName, code }: { userName: string; code: string }) => (
  <EmailLayout
    path="verificar-email"
    title="¡Bienvenido a programaConNosotros!"
    preview={`Tu código de verificación es ${code}`}
  >
    <EmailText>¡Hola {userName || ''}!</EmailText>
    <EmailText>
      Gracias por registrarte. Para completar tu registro y acceder a la plataforma, ingresá el
      siguiente código de verificación:
    </EmailText>

    <EmailPanel command="cat codigo.txt">
      <EmailCode code={code} />
    </EmailPanel>

    <EmailText>
      Este código expira en <EmailHighlight>15 minutos</EmailHighlight>.
    </EmailText>
    <EmailText>
      Si no creaste una cuenta en programaConNosotros, podés ignorar este correo.
    </EmailText>
  </EmailLayout>
);
