import prisma from '@/lib/prisma';

// The first steps a new member is invited to take on /bienvenida. Each one checks itself off from
// what the person already did, so the list is the same whether they come from the sign-up, the
// welcome email or the notification.

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  /** The button, as a function call like the rest of the site. */
  cta: string;
  done: boolean;
};

export type OnboardingFacts = {
  hasPhoto: boolean;
  hasIntro: boolean;
  hasStack: boolean;
  events: number;
  forumPosts: number;
  advice: number;
};

export const onboardingSteps = (facts: OnboardingFacts): OnboardingStep[] => [
  {
    id: 'foto',
    title: 'Poné una foto',
    description: 'Así te reconocen en los eventos, los comentarios y las fotos donde te etiqueten.',
    href: '/perfil#identidad',
    cta: 'subirFoto();',
    done: facts.hasPhoto,
  },
  {
    id: 'presentacion',
    title: 'Contá quién sos',
    description: 'Una frase sobre vos y de dónde sos: es lo primero que ven en tu perfil.',
    href: '/perfil#identidad',
    cta: 'editarPerfil();',
    done: facts.hasIntro,
  },
  {
    id: 'stack',
    title: 'Sumá tu stack',
    description: 'Los lenguajes con los que trabajás, para encontrar gente que usa lo mismo.',
    href: '/perfil#stack',
    cta: 'agregarLenguajes();',
    done: facts.hasStack,
  },
  {
    id: 'evento',
    title: 'Anotate a un evento',
    description: 'Charlas, meetups y juntadas: la mejor forma de conocer a la comunidad.',
    href: '/eventos',
    cta: 'verEventos();',
    done: facts.events > 0,
  },
  {
    id: 'foro',
    title: 'Presentate en el foro',
    description: 'Contá en qué andás, qué querés aprender o en qué podés dar una mano.',
    href: '/foro/nuevo',
    cta: 'abrirTema();',
    done: facts.forumPosts > 0,
  },
  {
    id: 'consejo',
    title: 'Compartí un consejo',
    description: 'Algo que te hubiera gustado saber cuando arrancaste.',
    href: '/consejos',
    cta: 'compartirConsejo();',
    done: facts.advice > 0,
  },
];

/** The steps for `userId`, checked against what they already did. */
export const getOnboardingSteps = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      image: true,
      slogan: true,
      countryOfOrigin: true,
      _count: {
        select: {
          languages: true,
          eventRegistrations: { where: { cancelledAt: null } },
          forumPosts: true,
          advice: true,
        },
      },
    },
  });
  return onboardingSteps({
    hasPhoto: !!user.image,
    hasIntro: !!user.slogan && !!user.countryOfOrigin,
    hasStack: user._count.languages > 0,
    events: user._count.eventRegistrations,
    forumPosts: user._count.forumPosts,
    advice: user._count.advice,
  });
};
