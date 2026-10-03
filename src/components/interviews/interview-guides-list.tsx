'use client';

import type { InterviewArea, InterviewTrack } from '@/app/(platform)/entrevistas/questions/types';
import { guideSectionKey } from '@/app/(platform)/entrevistas/guias/guides/types';
import { GuideProgressBar } from '@/components/interviews/guide-progress-bar';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { useContentMarks } from '@/hooks/use-content-marks';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface GuideListItem {
  track: InterviewTrack;
  area: InterviewArea;
  label: string;
  stack: string;
  summary: string;
  sectionIds: string[];
}

interface InterviewGuidesListProps {
  areas: { id: InterviewArea; label: string }[];
  guides: GuideListItem[];
}

/** Every preparation guide grouped by area, with how much of each the user already read. */
export function InterviewGuidesList({ areas, guides }: InterviewGuidesListProps) {
  const marks = useContentMarks('interview-guide');
  const readIds = marks.ids('read');
  const readCount = (guide: GuideListItem) =>
    guide.sectionIds.filter((id) => readIds.has(guideSectionKey(guide.track, id))).length;

  return (
    <>
      {!marks.isLoading && !marks.isAuthenticated && (
        <p className="mb-6 font-mono text-[11px] text-muted-foreground">
          <Link href="/autenticacion/iniciar-sesion" className="text-pcnGreen hover:underline">
            iniciá sesión
          </Link>{' '}
          para marcar las secciones como leídas y seguir tu progreso
        </p>
      )}

      {areas.map((area) => {
        const areaGuides = guides.filter((guide) => guide.area === area.id);
        if (!areaGuides.length) return null;
        return (
          <section key={area.id} className="mb-6">
            <h2 className="mb-2 font-mono text-xs text-pcnGreen-500"># {area.label}</h2>
            <RuledGrid className="grid-cols-1">
              {areaGuides.map((guide) => {
                const read = readCount(guide);
                const total = guide.sectionIds.length;
                const done = read === total;
                return (
                  <Link
                    key={guide.track}
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
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {guide.stack}
                    </span>
                    <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {guide.summary}
                    </span>
                    <GuideProgressBar read={read} total={total} className="mt-auto" />
                  </Link>
                );
              })}
            </RuledGrid>
          </section>
        );
      })}
    </>
  );
}
