import { Button } from '@/components/ui/button';
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
import { WHATSAPP_GROUP_URL } from './home-hero';
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
      'El historial de charlas de la comunidad, con diapositivas y grabaciones para volver a verlas.',
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
      'Club de lectura con libros y artículos sobre programación, tecnología y carrera profesional.',
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

const FeatureCard = ({ feature, className }: { feature: Feature; className?: string }) => (
  <Link
    href={feature.href}
    className={cn(
      'group relative flex flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-pcnGreen/40 hover:bg-white/[0.04] hover:shadow-[0_20px_60px_-30px_rgba(4,244,190,0.35)]',
      className,
    )}
  >
    <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-pcnGreen/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

    <div className="flex items-start justify-between">
      <span className="flex size-10 items-center justify-center rounded-lg bg-pcnGreen/10 text-pcnGreen ring-1 ring-inset ring-pcnGreen/20">
        <feature.icon className="size-5" strokeWidth={1.75} />
      </span>
      <ArrowUpRight className="size-4 text-muted-foreground/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pcnGreen" />
    </div>

    <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{feature.title}</h3>
    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
  </Link>
);

const WhatsAppCard = () => (
  <div className="group relative flex flex-col overflow-hidden rounded-lg border border-pcnGreen/25 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(4,244,190,0.16),transparent_55%)] p-6 transition-all duration-300 hover:border-pcnGreen/50 md:col-span-4 md:p-8">
    <MessageCircle
      className="pointer-events-none absolute -bottom-10 -right-10 size-56 text-pcnGreen/[0.06] transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-105"
      strokeWidth={1}
    />

    <div className="relative flex flex-1 flex-col">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-pcnGreen text-black shadow-[0_0_24px_rgba(4,244,190,0.45)]">
          <MessageCircle className="size-5" strokeWidth={2} />
        </span>
        <span className="rounded-full border border-pcnGreen/30 bg-pcnGreen/10 px-2.5 py-0.5 text-[11px] font-medium text-pcnGreen">
          El corazón de la comunidad
        </span>
      </div>

      <h3 className="mt-5 max-w-md text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        Un grupo de WhatsApp que realmente suma.
      </h3>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
        Conversaciones técnicas de verdad, oportunidades laborales, mentores de primer nivel y gente
        de todas las áreas y niveles. Todo pasa primero acá.
      </p>

      <ul className="mt-6 grid gap-2 text-sm text-foreground/80 sm:grid-cols-3">
        {[
          { icon: Briefcase, label: 'Oportunidades' },
          { icon: Users, label: 'Contactos y mentores' },
          { icon: Code2, label: 'Discusiones técnicas' },
        ].map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <item.icon className="size-4 text-pcnGreen" strokeWidth={1.75} />
            {item.label}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <Button asChild className="rounded-full px-6">
          <Link href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer">
            Unirme al grupo
            <ArrowUpRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  </div>
);

const ComingSoonCard = () => (
  <div className="relative flex flex-col rounded-lg border border-dashed border-white/10 bg-transparent p-6 md:col-span-2">
    <span className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      Próximamente
    </span>
    <ul className="mt-5 flex flex-col gap-4">
      {[
        {
          icon: MessageSquare,
          title: 'Foro',
          description: 'Preguntas y discusiones que quedan para siempre.',
        },
        {
          icon: Monitor,
          title: 'Setups',
          description: 'Los espacios de trabajo de la comunidad.',
        },
      ].map((item) => (
        <li key={item.title} className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-muted-foreground ring-1 ring-inset ring-white/10">
            <item.icon className="size-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground/90">{item.title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
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

    <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
      <WhatsAppCard />
      <FeatureCard feature={features[0]} className="md:col-span-2" />
      {features.slice(1).map((feature) => (
        <FeatureCard key={feature.title} feature={feature} className="md:col-span-2" />
      ))}
      <ComingSoonCard />
    </div>
  </section>
);
