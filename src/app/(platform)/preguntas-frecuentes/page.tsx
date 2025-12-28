import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';
import { Heading2 } from '@/components/ui/heading-2';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQPage = async () => {
  const sessionId = cookies().get('sessionId')?.value;
  let session: (Session & { user: User }) | null = null;

  if (sessionId) {
    session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
  }

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
        'Regularmente compartimos oportunidades laborales en nuestros grupos de WhatsApp y Discord. También tenemos una sección de trabajos en la plataforma donde las empresas pueden publicar ofertas.',
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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Preguntas frecuentes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full flex-row items-center justify-between">
              <Heading2 className="m-0 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
                  <HelpCircle className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
                </div>
                <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Preguntas frecuentes</span>
              </Heading2>
            </div>
          </div>

          <div className="mb-14 max-w-3xl">
            <p className="mb-6 text-center text-muted-foreground">
              Encontrá respuestas a las preguntas más comunes sobre nuestra comunidad
            </p>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
