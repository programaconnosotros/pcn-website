'use client';

import {
  interviewQuestions,
  SENIORITIES,
  TRACKS,
  type InterviewTrack,
  type Seniority,
} from '@/app/(platform)/entrevistas/questions';
import { MarkToggle } from '@/components/ui/mark-toggle';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { StickyHeader } from '@/components/ui/sticky-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Check, Eye, EyeOff, RotateCcw, Shuffle, X } from 'lucide-react';
import { Fragment, useState } from 'react';

type Grade = 'known' | 'review';

// Answers mark code with backticks, like Markdown inline code.
const renderInlineCode = (text: string) =>
  text.split(/`([^`]+)`/).map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="rounded-sm bg-pcnGreen/10 px-1 font-mono text-[11px] text-pcnGreen">
        {part}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );

const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const actionClassName =
  'inline-flex items-center gap-1 border border-pcnGreen-200 bg-black/40 px-2 py-1 font-mono text-[11px] lowercase text-muted-foreground transition-colors hover:border-pcnGreen-500 hover:text-pcnGreen focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen';

export function InterviewSimulator() {
  const [track, setTrack] = useState<InterviewTrack>('frontend');
  const [seniority, setSeniority] = useState<Seniority>('junior');

  const questions = interviewQuestions[track][seniority];
  const [order, setOrder] = useState(() => questions.map((_, i) => i));
  // Revealed answers and self-grades are keyed by the question's original index.
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [grades, setGrades] = useState<Record<number, Grade>>({});

  const reset = (count = questions.length) => {
    setOrder(Array.from({ length: count }, (_, i) => i));
    setRevealed(new Set());
    setGrades({});
  };

  const changeInterview = (nextTrack: InterviewTrack, nextSeniority: Seniority) => {
    setTrack(nextTrack);
    setSeniority(nextSeniority);
    reset(interviewQuestions[nextTrack][nextSeniority].length);
  };

  const toggleRevealed = (index: number) =>
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const toggleGrade = (index: number, grade: Grade) =>
    setGrades((current) => {
      const next = { ...current };
      if (next[index] === grade) delete next[index];
      else next[index] = grade;
      return next;
    });

  const allRevealed = revealed.size === questions.length;
  const knownCount = Object.values(grades).filter((grade) => grade === 'known').length;
  const reviewCount = Object.values(grades).filter((grade) => grade === 'review').length;
  const activeTrack = TRACKS.find(({ id }) => id === track)!;

  return (
    <>
      <StickyHeader>
        <PageTitle
          path="entrevistas"
          meta={`${revealed.size}/${questions.length} reveladas · ${knownCount} la sabía · ${reviewCount} a repasar`}
        />

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Tabs
            value={track}
            onValueChange={(value) => changeInterview(value as InterviewTrack, seniority)}
          >
            <TabsList>
              {TRACKS.map(({ id, label }) => (
                <TabsTrigger key={id} value={id}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tabs
            value={seniority}
            onValueChange={(value) => changeInterview(track, value as Seniority)}
          >
            <TabsList>
              {SENIORITIES.map(({ id, label }) => (
                <TabsTrigger key={id} value={id}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <p className="mr-auto font-mono text-xs text-muted-foreground">
            <span className="text-pcnGreen-500"># </span>
            {activeTrack.stack} · {seniority} — respondé en voz alta antes de ver la respuesta
          </p>
          <button type="button" className={actionClassName} onClick={() => setOrder(shuffle)}>
            <Shuffle className="size-3" />
            mezclar
          </button>
          <button
            type="button"
            className={actionClassName}
            onClick={() =>
              setRevealed(allRevealed ? new Set() : new Set(questions.map((_, i) => i)))
            }
          >
            {allRevealed ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
            {allRevealed ? 'ocultar todas' : 'mostrar todas'}
          </button>
          <button type="button" className={actionClassName} onClick={() => reset()}>
            <RotateCcw className="size-3" />
            reiniciar
          </button>
        </div>
      </StickyHeader>

      <RuledGrid className="mb-14 grid-cols-1">
        {order.map((index, position) => {
          const { question, answer, topic } = questions[index];
          const isRevealed = revealed.has(index);
          const grade = grades[index];

          return (
            <div
              key={`${track}-${seniority}-${index}`}
              className={cn(ruledCellClassName, 'flex flex-col gap-2 p-3')}
            >
              <div className="flex items-start gap-3">
                <h2 className="flex-1 font-mono text-sm font-semibold">
                  <span className="text-pcnGreen-500">
                    {String(position + 1).padStart(2, '0')}{' '}
                  </span>
                  {renderInlineCode(question)}
                </h2>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground/70">
                  {topic}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-expanded={isRevealed}
                  className={actionClassName}
                  onClick={() => toggleRevealed(index)}
                >
                  {isRevealed ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                  {isRevealed ? 'ocultar respuesta' : 'mostrar respuesta'}
                </button>
                {isRevealed && (
                  <>
                    <MarkToggle
                      active={grade === 'known'}
                      onToggle={() => toggleGrade(index, 'known')}
                      icon={Check}
                      label="la sabía"
                      title="Marcar como respondida correctamente"
                    />
                    <MarkToggle
                      active={grade === 'review'}
                      onToggle={() => toggleGrade(index, 'review')}
                      icon={X}
                      label="a repasar"
                      title="Marcar para repasar"
                    />
                  </>
                )}
              </div>

              {isRevealed && (
                <p className="border-l-2 border-pcnGreen-500 pl-3 text-xs leading-relaxed text-muted-foreground">
                  {renderInlineCode(answer)}
                </p>
              )}
            </div>
          );
        })}
      </RuledGrid>
    </>
  );
}
