import {
  AREAS,
  TRACKS,
  trackQuestionCount,
  type InterviewArea,
} from '@/app/(platform)/entrevistas/questions';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { SectionHeader } from './section-header';

const questionCount = (area: InterviewArea) =>
  TRACKS.filter((track) => track.area === area).reduce(
    (total, { id }) => total + trackQuestionCount(id),
    0,
  );

export const InterviewsSection = () => (
  <section>
    <SectionHeader
      eyebrow="Entrevistas"
      title={
        <>
          Practicá para tu próxima <span className="text-pcnGreen">entrevista técnica</span>
        </>
      }
      description="Simulá entrevistas para junior, semi-senior y senior con active recall: preguntas de a una y en orden aleatorio. Respondé en voz alta y después compará con la respuesta."
      action={{ label: 'Empezar a practicar', href: '/entrevistas' }}
    />

    <RuledGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      {AREAS.map(({ id, label, stack }) => (
        <Link
          key={id}
          href={`/entrevistas?tipo=${id}`}
          className={cn(ruledCellClassName, 'group flex flex-col gap-1 p-3 font-mono')}
        >
          <span className="flex items-center gap-2 text-sm font-semibold group-hover:text-pcnGreen">
            {label}
            <ArrowUpRight className="ml-auto size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pcnGreen" />
          </span>
          <span className="text-[11px] text-muted-foreground">{stack}</span>
          <span className="text-[11px] text-muted-foreground/70">
            <span className="text-pcnGreen-500"># </span>
            {questionCount(id)} preguntas
          </span>
        </Link>
      ))}
    </RuledGrid>
  </section>
);
