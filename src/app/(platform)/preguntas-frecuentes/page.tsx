import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description:
    'Todo lo que necesitás saber sobre programaConNosotros: cómo unirte, cómo participar y qué ofrecemos.',
  openGraph: {
    title: 'Preguntas frecuentes | programaConNosotros',
    description:
      'Todo lo que necesitás saber sobre programaConNosotros: cómo unirte, cómo participar y qué ofrecemos.',
    url: `${SITE_URL}/preguntas-frecuentes`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preguntas frecuentes | programaConNosotros',
    description:
      'Todo lo que necesitás saber sobre programaConNosotros: cómo unirte, cómo participar y qué ofrecemos.',
  },
};

const FAQPage = async () => {
  const faqs = [
    {
      question: '¿Qué es programaConNosotros?',
      answer:
        'programaConNosotros es una comunidad de desarrolladores apasionados por el software que se ayudan mutuamente para crecer profesionalmente. Ofrecemos recursos, eventos, cursos, y un espacio para compartir conocimiento y oportunidades.',
    },
    {
      question: '¿Cómo puedo unirme a la comunidad?',
      answer:
        'Podés unirte registrándote en nuestra plataforma web o sumándote a nuestros grupos de WhatsApp y Discord. También podés seguirnos en nuestras redes sociales para estar al tanto de todas las actividades.',
    },
    {
      question: '¿Hay algún costo para ser miembro?',
      answer:
        'No, la membresía en programaConNosotros es completamente gratuita. Todos nuestros recursos, eventos y contenido están disponibles sin costo alguno.',
    },
    {
      question: '¿Qué tipo de eventos organizan?',
      answer:
        'Organizamos charlas técnicas, Lightning Talks, eventos presenciales, hackathons, y muchas otras actividades para aprender y conectar con otros desarrolladores.',
    },
    {
      question: '¿Puedo contribuir con contenido?',
      answer:
        '¡Por supuesto! Animamos a todos los miembros a compartir sus conocimientos. Podés dar charlas, escribir consejos, compartir recursos, o ayudar a otros miembros de la comunidad.',
    },
    {
      question: '¿Cómo puedo encontrar oportunidades laborales?',
      answer:
        'Regularmente compartimos oportunidades laborales en nuestros grupos de WhatsApp y Discord.',
    },
    {
      question: '¿Ofrecen mentorías?',
      answer:
        'Sí, tenemos un programa de mentores donde podés encontrar mentores experimentados o convertirte en mentor para ayudar a otros miembros de la comunidad.',
    },
    {
      question: '¿Dónde puedo obtener ayuda o soporte?',
      answer:
        'Podés contactarnos a través de WhatsApp, Discord, o usando el botón de soporte en el sidebar. Estamos siempre dispuestos a ayudarte.',
    },
  ];

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitle path="preguntas-frecuentes" meta={`${faqs.length} preguntas`} />

          <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2">
            {faqs.map((faq, index) => (
              <div key={index} className={cn(ruledCellClassName, 'flex flex-col gap-1 p-3')}>
                <h2 className="font-mono text-sm font-semibold">
                  <span className="text-pcnGreen-500">{String(index + 1).padStart(2, '0')} </span>
                  {faq.question}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </RuledGrid>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
