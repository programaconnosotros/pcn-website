import { Button } from '@/components/ui/button';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  Code2,
  GraduationCap,
  Handshake,
  MessageCircle,
  MessageSquare,
  MicVocal,
  Monitor,
  Podcast,
  Rocket,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { WHATSAPP_GROUP_URL } from '@/data/whatsapp-group';
import { SectionHeader } from './section-header';

interface Feature {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const features: Feature[] = [
  {
    title: 'Eventos',
    description:
      'Meetups, lightning talks y jornadas técnicas para aprender, compartir y conocer gente increíble.',
    href: '/eventos',
    icon: CalendarDays,
  },
  {
    title: 'Charlas',
    description:
      'El historial de charlas de la comunidad con diapositivas y grabaciones, y charlas externas que recomendamos ver.',
    href: '/charlas',
    icon: MicVocal,
  },
  {
    title: 'Cursos',
    description: 'Cursos sobre herramientas y tecnologías esenciales, armados por la comunidad.',
    href: '/cursos',
    icon: GraduationCap,
  },
  {
    title: 'Lectura',
    description:
      'Artículos y libros recomendados sobre programación, tecnología y carrera, con registro de lo que leíste.',
    href: '/lectura',
    icon: BookOpen,
  },
  {
    title: 'Podcast',
    description:
      'Conversaciones sobre software, carreras y tecnología con miembros de la comunidad.',
    href: '/podcast',
    icon: Podcast,
  },
  {
    title: 'Consejos',
    description:
      'Uno de los mejores repositorios de consejos sobre ingeniería de software, escrito entre todos.',
    href: '/consejos',
    icon: Handshake,
  },
  {
    title: 'Herramientas',
    description:
      'Software y herramientas recomendadas por la comunidad para mejorar tu flujo de trabajo.',
    href: '/herramientas',
    icon: Wrench,
  },
  {
    title: 'Proyectos',
    description: 'Los proyectos de software que construyen los miembros de la comunidad.',
    href: '/proyectos',
    icon: Rocket,
  },
  {
    title: 'Conversaciones',
    description: 'Resúmenes de las mejores discusiones técnicas que pasaron por el grupo.',
    href: '/conversaciones',
    icon: Code2,
  },
];

const FeatureCard = ({ feature }: { feature: Feature }) => (
  <Link href={feature.href} className={cn(ruledCellClassName, 'group flex gap-3 p-4')}>
    <feature.icon className="mt-0.5 size-4 shrink-0 text-pcnGreen" strokeWidth={1.75} />
    <div className="min-w-0 flex-1">
      <h3 className="flex items-center justify-between gap-2 font-mono text-sm font-semibold tracking-tight text-foreground group-hover:text-pcnGreen">
        <span>
          <span className="text-pcnGreen-500">&gt; </span>
          {feature.title.toLowerCase()}
        </span>
        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/60 group-hover:text-pcnGreen" />
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </div>
  </Link>
);

const WhatsAppCell = () => (
  <div
    className={cn(
      ruledCellClassName,
      'flex flex-col gap-4 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(4,244,190,0.10),transparent_55%)] p-4 sm:col-span-2 md:col-span-3 md:flex-row md:items-center md:justify-between md:p-5',
    )}
  >
    <div className="min-w-0">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-pcnGreen">
        <MessageCircle className="size-3.5" strokeWidth={2} />
        El corazón de la comunidad
      </p>
      <h3 className="mt-2 font-mono text-lg font-semibold tracking-tight text-foreground md:text-xl">
        Un grupo de WhatsApp que realmente suma.
      </h3>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Conversaciones técnicas de verdad, oportunidades laborales, mentores de primer nivel y gente
        de todas las áreas y niveles. Todo pasa primero acá.
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-foreground/80">
        {[
          { icon: Briefcase, label: 'oportunidades' },
          { icon: Users, label: 'contactos y mentores' },
          { icon: Code2, label: 'discusiones técnicas' },
        ].map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <item.icon className="size-3.5 text-pcnGreen" strokeWidth={1.75} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>

    <Button asChild size="sm" className="w-fit shrink-0 px-4">
      <Link href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer">
        unirmeAlGrupo();
        <ArrowUpRight className="ml-2 size-4" />
      </Link>
    </Button>
  </div>
);

const comingSoon = [
  { icon: MessageSquare, title: 'Foro', description: 'Preguntas y discusiones que quedan.' },
  { icon: Monitor, title: 'Setups', description: 'Los espacios de trabajo de la comunidad.' },
];

const ComingSoonCell = () => (
  <div
    className={cn(
      ruledCellClassName,
      'flex flex-col gap-2 p-4 text-muted-foreground hover:bg-transparent sm:col-span-2 md:col-span-3 md:flex-row md:items-center md:gap-6',
    )}
  >
    <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{'// próximamente'}</span>
    {comingSoon.map((item) => (
      <p key={item.title} className="flex items-center gap-2 text-xs">
        <item.icon className="size-3.5" strokeWidth={1.75} />
        <span className="font-mono text-foreground/80">{item.title.toLowerCase()}</span>
        <span className="hidden sm:inline">— {item.description}</span>
      </p>
    ))}
  </div>
);

export const FeatureBento = () => (
  <section>
    <SectionHeader
      eyebrow="Recursos"
      title={
        <>
          Todo lo que necesitás para <span className="text-pcnGreen">impulsar tu carrera</span>
        </>
      }
      description="Una plataforma construida por y para la comunidad. Elegí por dónde empezar."
    />

    <RuledGrid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <WhatsAppCell />
      {features.map((feature) => (
        <FeatureCard key={feature.title} feature={feature} />
      ))}
      <ComingSoonCell />
    </RuledGrid>
  </section>
);
