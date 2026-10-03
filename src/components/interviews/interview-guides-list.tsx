'use client';

import { guideSectionKey, type GuideId } from '@/app/(platform)/entrevistas/guias/guides/types';
import { GuideProgressBar } from '@/components/interviews/guide-progress-bar';
import { InterviewsLayout, InterviewsPanel } from '@/components/interviews/interviews-layout';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { useContentMarks } from '@/hooks/use-content-marks';
import { cn } from '@/lib/utils';
import { ArrowRight, BookOpen, Terminal } from 'lucide-react';
import Link from 'next/link';

export interface GuideListItem {
  track: GuideId;
  label: string;
  /** Full name, including the area for tracks that share one (`Frontend · iOS`). */
  fullLabel: string;
  stack: string;
  summary: string;
  sectionIds: string[];
}

export interface GuideGroup {
  label: string;
  guides: GuideListItem[];
  /** Fills the two-column grid's hole when the group has an odd number of guides. */
  cta: { href: string; hint: string; label: string };
}

const GuideCell = ({ guide, read }: { guide: GuideListItem; read: number }) => {
  const total = guide.sectionIds.length;
  const done = read === total;
  return (
    <Link
      href={`/entrevistas/guias/${guide.track}`}
      className={cn(ruledCellClassName, 'group flex flex-col gap-2 p-3')}
    >
      <span className="flex items-baseline gap-2 font-mono text-sm">
        <span className="font-semibold group-hover:text-pcnGreen">{guide.label}</span>
        <span
          className={cn(
            'ml-auto shrink-0 text-[11px] tabular-nums',
            done ? 'text-pcnGreen' : 'text-muted-foreground',
          )}
        >
          {done ? '✓ ' : ''}
          {read}/{total}
        </span>
      </span>
      <span className="font-mono text-[11px] text-muted-foreground">{guide.stack}</span>
      <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {guide.summary}
      </span>
      <GuideProgressBar read={read} total={total} className="mt-auto" />
    </Link>
  );
};

/** Every preparation guide grouped by area, with how much of each the user already read. */
export function InterviewGuidesList({ groups }: { groups: GuideGroup[] }) {
  const marks = useContentMarks('interview-guide');
  const readIds = marks.ids('read');
  const unreadOf = (guide: GuideListItem) =>
    guide.sectionIds.filter((id) => !readIds.has(guideSectionKey(guide.track, id)));

  const guides = groups.flatMap((group) => group.guides);
  const totalSections = guides.reduce((count, guide) => count + guide.sectionIds.length, 0);
  const totalRead = guides.reduce(
    (count, guide) => count + guide.sectionIds.length - unreadOf(guide).length,
    0,
  );
  const completed = guides.filter((guide) => !unreadOf(guide).length).length;
  // Where to keep reading: the first guide already started but not finished.
  const inProgress = guides.find(
    (guide) => unreadOf(guide).length && unreadOf(guide).length < guide.sectionIds.length,
  );

  return (
    <InterviewsLayout
      main={groups.map((group) => {
        // An odd number of guides leaves a hole in the two-column grid; a shortcut fills it.
        const fillsHole = group.guides.length % 2 === 1;
        return (
          <section key={group.label} className="mb-6">
            <h2 className="mb-2 font-mono text-xs text-pcnGreen-500"># {group.label}</h2>
            <RuledGrid className="grid-cols-1 md:grid-cols-2">
              {group.guides.map((guide) => (
                <GuideCell
                  key={guide.track}
                  guide={guide}
                  read={guide.sectionIds.length - unreadOf(guide).length}
                />
              ))}
              {fillsHole && (
                <Link
                  href={group.cta.href}
                  className={cn(
                    ruledCellClassName,
                    'group flex flex-col justify-between gap-3 bg-pcnGreen/[0.04] p-3 font-mono max-md:hidden',
                  )}
                >
                  <span className="text-[11px] text-muted-foreground">
                    <span className="text-pcnGreen-500">&gt; </span>
                    {group.cta.hint}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-pcnGreen [text-shadow:0_0_10px_rgba(4,244,190,0.5)]">
                    {group.cta.label}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )}
            </RuledGrid>
          </section>
        );
      })}
      aside={
        <>
          <InterviewsPanel command="progreso --guias" meta={`${totalRead}/${totalSections}`}>
            <GuideProgressBar read={totalRead} total={totalSections} className="mb-3" />
            <div className="mb-3 grid grid-cols-2 gap-2 text-center">
              <div className="border border-pcnGreen-200 px-1 py-2">
                <p className="text-lg font-semibold tabular-nums text-pcnGreen">{totalRead}</p>
                <p className="text-[10px] text-muted-foreground">secciones leídas</p>
              </div>
              <div className="border border-pcnGreen-200 px-1 py-2">
                <p className="text-lg font-semibold tabular-nums text-pcnGreen">
                  {completed}/{guides.length}
                </p>
                <p className="text-[10px] text-muted-foreground">guías completas</p>
              </div>
            </div>
            {inProgress ? (
              <Link
                href={`/entrevistas/guias/${inProgress.track}#${unreadOf(inProgress)[0]}`}
                className="flex items-center gap-2 text-xs text-pcnGreen transition-colors hover:text-pcnGreen-800"
              >
                <BookOpen className="size-3.5 shrink-0" />
                <span className="truncate">seguir con {inProgress.fullLabel}</span>
                <ArrowRight className="ml-auto size-3.5 shrink-0" />
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">
                {!marks.isLoading && !marks.isAuthenticated ? (
                  <>
                    <Link
                      href="/autenticacion/iniciar-sesion"
                      className="text-pcnGreen hover:underline"
                    >
                      Iniciá sesión
                    </Link>{' '}
                    para marcar las secciones como leídas y seguir tu progreso.
                  </>
                ) : (
                  'Elegí una guía y marcá cada sección como leída a medida que avanzás.'
                )}
              </p>
            )}
          </InterviewsPanel>

          <InterviewsPanel command="./simular-entrevista">
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Cuando termines una guía, ponete a prueba con preguntas de a una y en orden aleatorio,
              para junior, semi-senior y senior.
            </p>
            <Link
              href="/entrevistas"
              className="flex w-full items-center justify-center gap-1.5 border border-pcnGreen bg-pcnGreen/15 px-3 py-1.5 text-xs lowercase text-pcnGreen transition-colors hover:bg-pcnGreen/25"
            >
              <Terminal className="size-3.5" />
              simular entrevista
            </Link>
          </InterviewsPanel>
        </>
      }
    />
  );
}
