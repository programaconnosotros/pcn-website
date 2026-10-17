'use client';

import type { InterviewTrack } from '@/app/(platform)/entrevistas/questions/types';
import { guideSectionKey } from '@/app/(platform)/entrevistas/guias/guides/types';
import { GuideProgressBar } from '@/components/interviews/guide-progress-bar';
import { InterviewsPanel } from '@/components/interviews/interviews-layout';
import { useContentMarks } from '@/hooks/use-content-marks';
import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

/** How much of a track's preparation guide the user read, linking to where they left off. */
export function GuideProgressPanel({
  track,
  label,
  sectionIds,
}: {
  track: InterviewTrack;
  label: string;
  sectionIds: string[];
}) {
  const readIds = useContentMarks('interview-guide').ids('read');
  const unread = sectionIds.filter((id) => !readIds.has(guideSectionKey(track, id)));
  const read = sectionIds.length - unread.length;
  const href =
    read > 0 && unread.length
      ? `/entrevistas/guias/${track}#${unread[0]}`
      : `/entrevistas/guias/${track}`;

  return (
    <InterviewsPanel command={`cat guias/${track}`} meta={`${read}/${sectionIds.length}`}>
      <p className="mb-2 text-xs text-muted-foreground">Guía de preparación · {label}</p>
      <GuideProgressBar read={read} total={sectionIds.length} className="mb-3" />
      <Link
        href={href}
        className="flex items-center gap-2 text-xs text-pcnGreen transition-colors hover:text-pcnGreen-800"
      >
        <BookOpen className="size-3.5 shrink-0" />
        {read === 0 ? 'empezar la guía' : unread.length ? 'seguir leyendo' : 'repasar la guía'}
        <ArrowRight className="ml-auto size-3.5 shrink-0" />
      </Link>
    </InterviewsPanel>
  );
}
