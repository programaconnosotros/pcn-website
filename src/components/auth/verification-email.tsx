import {
  EmailCode,
  EmailHighlight,
  EmailLayout,
  EmailMeta,
  EmailPanel,
  EmailText,
} from '@/components/email/email-layout';

export const EmailVerificationEmail = ({ userName, code }: { userName: string; code: string }) => (
  <EmailLayout
    path="verificar-email"
    title="¡Bienvenido a programaConNosotros!"
    preview={`Tu código de verificación es ${code}`}
    log={['cuenta creada', 'código de verificación generado', 'email enviado']}
  >
    <EmailText>¡Hola {userName || ''}!</EmailText>
    <EmailText>
      Gracias por registrarte. Para completar tu registro y acceder a la plataforma, ingresá el
      siguiente código de verificación:
    </EmailText>

    <EmailPanel command="pcn auth verify --email">
      <EmailCode code={code} />
      <EmailMeta
        rows={[
          { label: 'estado', value: 'pendiente', tone: 'amber' },
          { label: 'expira', value: 'en 15 minutos' },
          { label: 'uso', value: 'único', tone: 'muted' },
        ]}
      />
    </EmailPanel>

    <EmailText>
      Este código expira en <EmailHighlight>15 minutos</EmailHighlight>.
    </EmailText>
    <EmailText>
      Si no creaste una cuenta en programaConNosotros, podés ignorar este correo.
    </EmailText>
  </EmailLayout>
);
