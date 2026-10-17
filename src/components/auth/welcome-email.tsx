import {
  EmailButton,
  EmailLayout,
  EmailMeta,
  EmailPanel,
  EmailText,
} from '@/components/email/email-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

/** Sent once, right after a new member verifies their email: what to do first. */
export const WelcomeEmail = ({ userName }: { userName: string }) => (
  <EmailLayout
    path="bienvenida"
    title="¡Ya sos parte de programaConNosotros!"
    preview="Tu cuenta está lista: estos son tus primeros pasos en la comunidad"
    log={['email verificado', 'cuenta activa', 'bienvenida enviada']}
  >
    <EmailText>¡Hola {userName || ''}!</EmailText>
    <EmailText>
      Tu cuenta ya está activa. Somos una comunidad sin fronteras de gente que programa: charlas,
      eventos, un foro, consejos y proyectos hechos entre todos.
    </EmailText>

    <EmailPanel command="pcn bienvenida --primeros-pasos">
      <EmailMeta
        rows={[
          { label: '01', value: 'completá tu perfil: foto, presentación y stack' },
          { label: '02', value: 'anotate a un evento' },
          { label: '03', value: 'presentate en el foro' },
          { label: '04', value: 'compartí un consejo', tone: 'muted' },
        ]}
      />
    </EmailPanel>

    <EmailButton href={`${SITE_URL}/bienvenida`} label="empezar();" />

    <EmailText>¡Nos vemos adentro!</EmailText>
  </EmailLayout>
);
