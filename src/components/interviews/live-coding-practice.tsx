'use client';

import type { InterviewTrack } from '@/app/(platform)/entrevistas/questions/types';
import {
  exerciseKey,
  leetCodeUrl,
  type CodingExercise,
  type LeetCodeDifficulty,
  type LeetCodeProblem,
} from '@/app/(platform)/entrevistas/live-coding/exercises/types';
import { GuideProgressBar } from '@/components/interviews/guide-progress-bar';
import { renderInlineCode } from '@/components/interviews/inline-code';
import { InterviewsLayout, InterviewsPanel } from '@/components/interviews/interviews-layout';
import { MarkToggle } from '@/components/ui/mark-toggle';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { useContentMarks } from '@/hooks/use-content-marks';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowUpRight, BookOpen, CircleCheck, Clock } from 'lucide-react';
import Link from 'next/link';

const DIFFICULTY_CLASSES: Record<LeetCodeDifficulty, string> = {
  Easy: 'border-emerald-500/40 text-emerald-400',
  Medium: 'border-amber-500/40 text-amber-400',
  Hard: 'border-red-500/40 text-red-400',
};

const ListBlock = ({ label, items }: { label: string; items: string[] }) => (
  <div className="mt-3">
    <p className="mb-1 font-mono text-[11px] text-pcnGreen-500"># {label}</p>
    <ul className="space-y-1 text-[13px] text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="shrink-0 font-mono text-pcnGreen/70">-</span>
          <span>{renderInlineCode(item)}</span>
        </li>
      ))}
    </ul>
  </div>
);

interface LiveCodingPracticeProps {
  track: InterviewTrack;
  label: string;
  seniorityLabel: string;
  exercises: CodingExercise[];
  leetcode: LeetCodeProblem[];
}

/** One technology and seniority's statements to solve on your own, plus LeetCode practice. */
export function LiveCodingPractice({
  track,
  label,
  seniorityLabel,
  exercises,
  leetcode,
}: LiveCodingPracticeProps) {
  const exerciseMarks = useContentMarks('coding-exercise');
  const leetcodeMarks = useContentMarks('leetcode-problem');
  const solvedExercises = exerciseMarks.ids('solved');
  const solvedProblems = leetcodeMarks.ids('solved');
  const exercisesDone = exercises.filter(({ id }) => solvedExercises.has(exerciseKey(track, id)));
  const problemsDone = leetcode.filter(({ slug }) => solvedProblems.has(slug));

  return (
    <InterviewsLayout
      main={
        <>
          <h2 className="mb-2 font-mono text-xs text-pcnGreen-500">
            # ejercicios{' '}
            <span className="text-muted-foreground">
              (resolvelos por tu cuenta, con el tiempo que darían en la entrevista)
            </span>
          </h2>
          <div className="mb-8 space-y-3">
            {exercises.map((exercise, index) => {
              const solved = solvedExercises.has(exerciseKey(track, exercise.id));
              return (
                <details
                  key={exercise.id}
                  className="group border border-pcnGreen-200 open:border-pcnGreen-400"
                >
                  <summary className="flex cursor-pointer list-none items-start gap-3 p-3 transition-colors hover:bg-pcnGreen/[0.04] [&::-webkit-details-marker]:hidden">
                    <span className="mt-0.5 font-mono text-xs text-pcnGreen-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span
                        className={cn(
                          'font-mono text-sm font-semibold group-hover:text-pcnGreen',
                          solved && 'text-muted-foreground',
                        )}
                      >
                        {exercise.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {renderInlineCode(exercise.evaluates)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      {exercise.duration}
                    </span>
                    <MarkToggle
                      active={solved}
                      onToggle={() =>
                        exerciseMarks.toggle(exerciseKey(track, exercise.id), 'solved')
                      }
                      icon={CircleCheck}
                      label="resuelto"
                      title={solved ? 'Desmarcar como resuelto' : 'Marcar como resuelto'}
                    />
                  </summary>
                  <div className="border-t border-pcnGreen-200 p-3 pl-10">
                    <div className="space-y-2 text-sm leading-relaxed">
                      {exercise.statement.map((paragraph, i) => (
                        <p key={i}>{renderInlineCode(paragraph)}</p>
                      ))}
                    </div>
                    <ListBlock label="requisitos" items={exercise.requirements} />
                    <ListBlock
                      label="si te sobra tiempo, te van a preguntar"
                      items={exercise.followUps}
                    />
                  </div>
                </details>
              );
            })}
          </div>

          <h2 className="mb-2 font-mono text-xs text-pcnGreen-500">
            # leetcode recomendado{' '}
            <span className="text-muted-foreground">
              ({label} · {seniorityLabel})
            </span>
          </h2>
          <RuledGrid className="grid-cols-1">
            {leetcode.map((problem) => {
              const solved = solvedProblems.has(problem.slug);
              return (
                <div
                  key={problem.slug}
                  className={cn(ruledCellClassName, 'flex items-start gap-3 p-3')}
                >
                  <span
                    className={cn(
                      'mt-0.5 w-16 shrink-0 border px-1 text-center font-mono text-[10px]',
                      DIFFICULTY_CLASSES[problem.difficulty],
                    )}
                  >
                    {problem.difficulty}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <a
                      href={leetCodeUrl(problem.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center gap-1 font-mono text-sm font-semibold transition-colors hover:text-pcnGreen',
                        solved && 'text-muted-foreground',
                      )}
                    >
                      {problem.title}
                      <ArrowUpRight className="size-3.5 shrink-0 text-pcnGreen-500" />
                    </a>
                    <span className="text-xs text-muted-foreground">
                      {renderInlineCode(problem.why)}
                    </span>
                  </span>
                  <MarkToggle
                    active={solved}
                    onToggle={() => leetcodeMarks.toggle(problem.slug, 'solved')}
                    icon={CircleCheck}
                    label="resuelto"
                    title={solved ? 'Desmarcar como resuelto' : 'Marcar como resuelto'}
                  />
                </div>
              );
            })}
          </RuledGrid>
        </>
      }
      aside={
        <>
          <InterviewsPanel command="progreso --live-coding" meta={`${label} · ${seniorityLabel}`}>
            <p className="mb-1 flex justify-between text-xs text-muted-foreground">
              ejercicios
              <span className="text-pcnGreen tabular-nums">
                {exercisesDone.length}/{exercises.length}
              </span>
            </p>
            <GuideProgressBar
              read={exercisesDone.length}
              total={exercises.length}
              className="mb-3"
            />
            <p className="mb-1 flex justify-between text-xs text-muted-foreground">
              leetcode
              <span className="text-pcnGreen tabular-nums">
                {problemsDone.length}/{leetcode.length}
              </span>
            </p>
            <GuideProgressBar read={problemsDone.length} total={leetcode.length} />
            {!exerciseMarks.isLoading && !exerciseMarks.isAuthenticated && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                <Link
                  href="/autenticacion/iniciar-sesion"
                  className="text-pcnGreen hover:underline"
                >
                  Iniciá sesión
                </Link>{' '}
                para marcar lo que resolviste.
              </p>
            )}
          </InterviewsPanel>
          <InterviewsPanel command="cat guias/live-coding">
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Cómo encarar un live coding: el método para resolver en voz alta, complejidad, los
              patrones más frecuentes y cómo practicar.
            </p>
            <Link
              href="/entrevistas/guias/live-coding"
              className="flex items-center gap-2 text-xs text-pcnGreen transition-colors hover:text-pcnGreen-800"
            >
              <BookOpen className="size-3.5 shrink-0" />
              leer la guía de live coding
              <ArrowRight className="ml-auto size-3.5 shrink-0" />
            </Link>
          </InterviewsPanel>
        </>
      }
    />
  );
}
