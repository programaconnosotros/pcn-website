export interface Faq {
  question: string;
  answer: string;
  /** Shown in the short FAQ on the home. */
  featured?: boolean;
}

export const faqs: Faq[] = [
  {
    question: '¿Qué es programaConNosotros?',
    answer:
      'programaConNosotros es una comunidad de desarrolladores apasionados por el software que se ayudan mutuamente para crecer profesionalmente. Ofrecemos recursos, eventos, cursos, y un espacio para compartir conocimiento y oportunidades.',
  },
  {
    question: '¿Cómo puedo unirme a la comunidad?',
    featured: true,
    answer:
      'Podés unirte registrándote en nuestra plataforma web o sumándote a nuestros grupos de WhatsApp y Discord. También podés seguirnos en nuestras redes sociales para estar al tanto de todas las actividades.',
  },
  {
    question: '¿Hay algún costo para ser miembro?',
    featured: true,
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
    featured: true,
    answer:
      '¡Por supuesto! Animamos a todos los miembros a compartir sus conocimientos. Podés dar charlas, escribir consejos, compartir recursos, o ayudar a otros miembros de la comunidad.',
  },
  {
    question: '¿Cómo puedo encontrar oportunidades laborales?',
    featured: true,
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
