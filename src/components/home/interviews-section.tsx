import {
  AREAS,
  QA_TOOLS,
  SENIORITIES,
  TRACK_TOOLS,
  TRACKS,
  trackQuestionCount,
  type InterviewArea,
} from '@/app/(platform)/entrevistas/questions';
import { orderedGuides } from '@/app/(platform)/entrevistas/guias/guides';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  Container,
  LockKeyhole,
  MonitorSmartphone,
  Server,
  ShieldCheck,
  PenTool,
  SquareKanban,
  Target,
  Terminal,
  Workflow,
  HeartHandshake,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { SectionHeader } from './section-header';

const AREA_ICONS: Record<InterviewArea, LucideIcon> = {
  frontend: MonitorSmartphone,
  backend: Server,
  ai: Bot,
  agentic: Workflow,
  qa: ShieldCheck,
  security: LockKeyhole,
  devops: Container,
  'ux-ui': PenTool,
  'product-engineering': Target,
  'project-manager': SquareKanban,
  'soft-skills': HeartHandshake,
};

const questionCount = (area: InterviewArea) =>
  TRACKS.filter((track) => track.area === area).reduce(
    (total, { id }) => total + trackQuestionCount(id),
    0,
  );

const totalQuestions = AREAS.reduce((total, { id }) => total + questionCount(id), 0);
const totalGuideSections = orderedGuides.reduce(
  (total, { guide }) => total + guide.sections.length,
  0,
);

/** An area's guide, or the guide list when the area has one guide per technology. */
const guideHref = (area: InterviewArea) => {
  const tracks = TRACKS.filter((track) => track.area === area);
  return tracks.length === 1 ? `/entrevistas/guias/${tracks[0].id}` : '/entrevistas/guias';
};

/** What to practice inside an area: its technologies (linked to each track) or its tools. */
const areaChips = (area: InterviewArea) => {
  if (area === 'qa')
    return QA_TOOLS.map(({ id, label }) => ({ id, label, href: '/entrevistas?tipo=qa' }));
  const tools = TRACKS.flatMap(
    (track) => (track.area === area && TRACK_TOOLS[track.id]?.tools) || [],
  );
  if (tools.length)
    return tools.map(({ id, label }) => ({ id, label, href: `/entrevistas?tipo=${id}` }));
  const technologies = TRACKS.filter((track) => track.area === area && track.technology);
  return technologies.map(({ id, technology }) => ({
    id,
    label: technology!,
    href: `/entrevistas?tipo=${id}`,
  }));
};

export const InterviewsSection = () => (
  <section>
    <SectionHeader
      eyebrow="Entrevistas"
      title={
        <>
          Practicá para tu próxima <span className="text-pcnGreen">entrevista</span>
        </>
      }
      description="Estudiá con las guías de preparación de cada área y después simulá la entrevista para junior, semi-senior y senior con active recall: preguntas de a una y en orden aleatorio, respondés en voz alta y comparás con la respuesta."
      action={{ label: 'Empezar a practicar', href: '/entrevistas' }}
    />

    {/* Terminal status line: what the simulator has loaded. */}
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-b-0 border-pcnGreen-200 bg-pcnGreen/[0.03] px-3 py-2 font-mono text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Terminal className="size-3.5 text-pcnGreen" />
        <span className="text-pcnGreen-500">$</span> ./simular-entrevista --active-recall
      </span>
      <span className="ml-auto flex flex-wrap gap-x-3">
        <span>
          <span className="text-pcnGreen [text-shadow:0_0_8px_rgba(4,244,190,0.6)]">
            {AREAS.length}
          </span>{' '}
          tipos
        </span>
        <span>
          <span className="text-pcnGreen [text-shadow:0_0_8px_rgba(4,244,190,0.6)]">
            {totalQuestions}
          </span>{' '}
          preguntas
        </span>
        <span>
          <span className="text-pcnGreen [text-shadow:0_0_8px_rgba(4,244,190,0.6)]">
            {orderedGuides.length}
          </span>{' '}
          guías
        </span>
        <span className="hidden sm:inline">
          {SENIORITIES.map(({ label }) => label.toLowerCase()).join(' · ')}
        </span>
      </span>
    </div>

    <RuledGrid className="grid-cols-2 lg:grid-cols-3">
      {AREAS.map(({ id, label, stack }, index) => {
        const Icon = AREA_ICONS[id];
        const chips = areaChips(id);
        return (
          <div
            key={id}
            className={cn(
              ruledCellClassName,
              'group relative flex flex-col gap-3 p-3 font-mono sm:p-4',
            )}
          >
            <div className="flex items-start justify-between">
              <span className="flex size-9 items-center justify-center border border-pcnGreen-200 bg-pcnGreen/[0.06] text-pcnGreen-600 transition-all group-hover:border-pcnGreen group-hover:text-pcnGreen group-hover:shadow-[0_0_14px_rgba(4,244,190,0.35)]">
                <Icon className="size-4.5 transition-[filter] group-hover:drop-shadow-[0_0_4px_rgba(4,244,190,0.9)]" />
              </span>
              <span className="text-[10px] tabular-nums text-muted-foreground/50">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              {/* The whole cell is clickable through this link; chips sit above it. */}
              <Link
                href={`/entrevistas?tipo=${id}`}
                className="text-sm font-semibold after:absolute after:inset-0 group-hover:text-pcnGreen"
              >
                {label}{' '}
                <ArrowUpRight className="inline size-3.5 align-[-2px] text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pcnGreen" />
              </Link>
              {chips.length === 0 && (
                <span className="text-[11px] text-muted-foreground">{stack}</span>
              )}
            </div>

            {chips.length > 0 && (
              <div className="relative z-10 flex flex-wrap gap-1">
                {chips.map((chip) => (
                  <Link
                    key={chip.id}
                    href={chip.href}
                    className="border border-pcnGreen-200 px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-pcnGreen hover:bg-pcnGreen/10 hover:text-pcnGreen"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            )}

            <span className="mt-auto flex items-center justify-between gap-2 text-[11px] text-muted-foreground/70">
              <span>
                <span className="text-pcnGreen-500"># </span>
                {questionCount(id)} preguntas
              </span>
              <Link
                href={guideHref(id)}
                className="relative z-10 flex items-center gap-1 text-pcnGreen-600 transition-colors hover:text-pcnGreen"
              >
                <BookOpen className="size-3" />
                guía
              </Link>
            </span>
          </div>
        );
      })}

      <Link
        href="/entrevistas"
        className={cn(
          ruledCellClassName,
          'group col-span-2 flex flex-col justify-between gap-3 bg-pcnGreen/[0.04] p-3 font-mono sm:p-4',
          // Fill the last row of the three-column grid, whatever the number of areas.
          ['lg:col-span-3', 'lg:col-span-2', 'lg:col-span-1'][AREAS.length % 3],
        )}
      >
        <span className="text-[11px] text-muted-foreground">
          <span className="text-pcnGreen-500">&gt; </span>elegí tipo, tecnología y seniority
        </span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-pcnGreen [text-shadow:0_0_10px_rgba(4,244,190,0.5)]">
          empezar();
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        <span className="text-[11px] text-muted-foreground/70">
          <span className="animate-pulse text-pcnGreen">▍</span> listo para practicar
        </span>
      </Link>
    </RuledGrid>

    {/* Study first, then practice: the guides get their own band under the simulator. */}
    <Link
      href="/entrevistas/guias"
      className="group flex flex-col gap-3 border border-t-0 border-pcnGreen-200 bg-pcnGreen/[0.03] p-3 font-mono transition-colors hover:bg-pcnGreen/[0.07] sm:flex-row sm:items-center sm:gap-4 sm:p-4"
    >
      <span className="flex size-9 shrink-0 items-center justify-center border border-pcnGreen-200 bg-pcnGreen/[0.06] text-pcnGreen-600 transition-all group-hover:border-pcnGreen group-hover:text-pcnGreen group-hover:shadow-[0_0_14px_rgba(4,244,190,0.35)]">
        <BookOpen className="size-4.5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-semibold group-hover:text-pcnGreen">
          Guías de preparación para entrevistas
        </span>
        <span className="text-[11px] leading-relaxed text-muted-foreground">
          {orderedGuides.length} guías · {totalGuideSections} secciones: cómo es el proceso, qué te
          van a preguntar de junior a senior y qué tenés que saber explicar. Marcá cada sección como
          leída y seguí tu progreso.
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-pcnGreen [text-shadow:0_0_10px_rgba(4,244,190,0.5)]">
        leerGuias();
        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  </section>
);
