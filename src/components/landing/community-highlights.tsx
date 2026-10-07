import { cn } from '@/lib/utils';
import { IconHeart, IconRouteAltLeft } from '@tabler/icons-react';
import { Blend, Brain, Gem, Handshake, Speech, Zap } from 'lucide-react';

export const CommunityHighlights = () => {
  const features = [
    {
      title: 'Para aprender cosas nuevas',
      description: 'Todos los días tenemos conversaciones interesantes para aprender más.',
      icon: <Brain />,
    },
    {
      title: 'Para conocer mentores',
      description: 'Conocé a personas que te van a ayudar a crecer como profesional o estudiante.',
      icon: <Speech />,
    },
    {
      title: 'Para encontrar oportunidades laborales',
      description: 'Siempre estamos compartiendo info sobre nuevas ofertas de trabajo y proyectos.',
      icon: <Handshake />,
    },
    {
      title: 'Para mantenerte al día',
      description:
        'Facilitamos que puedas mantenerte al día con las últimas tecnologías y tendencias.',
      icon: <Gem />,
    },
    {
      title: 'Para compartir conocimiento',
      description: 'Podés dar charlas, clases o cursos sobre cualquier tema que te apasione.',
      icon: <Blend />,
    },
    {
      title: 'Para entretenerte',
      description: 'Si sos un apasionado por la tecnología, la vas a pasar bien con nosotros.',
      icon: <Zap />,
    },
    {
      title: 'Para ver perspectivas diferentes',
      description: 'Escuchar diferentes perspectivas puede cambiarte la vida.',
      icon: <IconRouteAltLeft />,
    },
    {
      title: 'Para compartir experiencias',
      description:
        'Podés contar tus experiencias o escuchar a los demás para aprender y estar más informado.',
      icon: <IconHeart />,
    },
  ];

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:px-24 dark:bg-black">
      <div className="container px-4 md:px-6">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
          ¿Por qué deberías unirte?
        </h2>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        'group/feature relative flex flex-col py-10 lg:border-r dark:border-pcnGreen-200',
        (index === 0 || index === 4) && 'lg:border-l dark:border-pcnGreen-200',
        index < 4 && 'lg:border-b dark:border-pcnGreen-200',
      )}
    >
      {index < 4 && (
        <div className="pointer-events-none absolute inset-0 h-full w-full bg-linear-to-t from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-[#04130f]" />
      )}

      {index >= 4 && (
        <div className="pointer-events-none absolute inset-0 h-full w-full bg-linear-to-b from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-[#04130f]" />
      )}

      <div className="relative z-10 mb-4 px-10 text-neutral-600 dark:text-neutral-400">{icon}</div>

      <div className="relative z-10 mb-2 px-10 text-lg font-bold">
        <div className="absolute inset-y-0 left-0 h-6 w-1 origin-center rounded-tr-full rounded-br-full bg-neutral-300 transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-pcnGreen dark:bg-pcnGreen-100 dark:text-pcnGreen" />

        <span className="inline-block text-neutral-800 transition duration-200 group-hover/feature:translate-x-2 dark:text-neutral-100">
          {title}
        </span>
      </div>

      <p className="relative z-10 max-w-xs px-10 text-sm text-neutral-600 dark:text-neutral-300">
        {description}
      </p>
    </div>
  );
};
