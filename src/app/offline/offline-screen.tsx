'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TRIVIA_QUESTIONS } from './trivia-questions';

interface ShuffledQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const newGame = (): ShuffledQuestion[] =>
  shuffle(TRIVIA_QUESTIONS).map(({ question, options, explanation }) => {
    const shuffled = shuffle(options);
    return { question, options: shuffled, answer: shuffled.indexOf(options[0]), explanation };
  });

const rank = (ratio: number) => {
  if (ratio === 1) return 'principal engineer';
  if (ratio >= 0.8) return 'senior';
  if (ratio >= 0.5) return 'semi-senior';
  return 'junior';
};

const pad = (n: number) => String(n).padStart(2, '0');

const Prompt = ({ children }: { children: React.ReactNode }) => (
  <p className="break-all">
    <span className="text-pcnGreen-600">$ </span>
    {children}
  </p>
);

const TerminalButton = ({ className, ...props }: React.ComponentProps<'button'>) => (
  <button
    type="button"
    className={cn(
      'border border-pcnGreen-300 px-3 py-1.5 text-xs text-pcnGreen transition-colors hover:bg-pcnGreen/[0.08] disabled:opacity-50',
      className,
    )}
    {...props}
  />
);

const Trivia = () => {
  const [questions, setQuestions] = useState<ShuffledQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const start = () => {
    setQuestions(newGame());
    setIndex(0);
    setScore(0);
    setSelected(null);
  };

  if (!questions)
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-muted-foreground"># mientras vuelve la red, probá tus conocimientos:</p>
        <TerminalButton onClick={start}>
          ./trivia --preguntas {TRIVIA_QUESTIONS.length}
        </TerminalButton>
      </div>
    );

  if (index === questions.length)
    return (
      <div className="flex flex-col items-start gap-3">
        <Prompt>./trivia --resultado</Prompt>
        <p>
          <span className="text-glow text-3xl font-bold tabular-nums text-pcnGreen">
            {pad(score)}/{pad(questions.length)}
          </span>
          <span className="ml-3 text-muted-foreground">
            # nivel: {rank(score / questions.length)}
          </span>
        </p>
        <TerminalButton onClick={start}>./trivia --otra-vez</TerminalButton>
      </div>
    );

  const current = questions[index];
  const answered = selected !== null;

  return (
    <div className="flex flex-col gap-3">
      <p className="flex justify-between text-xs text-pcnGreen-500">
        <span className="tabular-nums">
          [{pad(index + 1)}/{pad(questions.length)}]
        </span>
        <span className="tabular-nums">puntaje {pad(score)}</span>
      </p>
      <p className="text-foreground">{current.question}</p>

      <ol className="flex flex-col">
        {current.options.map((option, i) => {
          const isAnswer = i === current.answer;
          const isWrongPick = i === selected && !isAnswer;
          return (
            <li key={option}>
              <button
                type="button"
                disabled={answered}
                onClick={() => {
                  setSelected(i);
                  if (isAnswer) setScore((s) => s + 1);
                }}
                className={cn(
                  'flex w-full gap-3 px-2 py-1.5 text-left transition-colors',
                  !answered && 'hover:bg-pcnGreen/[0.06]',
                  answered && isAnswer && 'text-pcnGreen',
                  isWrongPick && 'text-red-400',
                  answered && !isAnswer && !isWrongPick && 'text-muted-foreground/60',
                )}
              >
                <span className="w-6 shrink-0 text-center tabular-nums text-pcnGreen-600">
                  {answered && isAnswer ? '✓' : isWrongPick ? '✗' : `[${i + 1}]`}
                </span>
                <span>{option}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {answered && (
        <div className="flex flex-col items-start gap-3 border-t border-dashed border-pcnGreen-200 pt-3">
          <p className="text-muted-foreground"># {current.explanation}</p>
          <TerminalButton
            onClick={() => {
              setSelected(null);
              setIndex((i) => i + 1);
            }}
          >
            siguiente →
          </TerminalButton>
        </div>
      )}
    </div>
  );
};

// What the service worker shows when a page can't load. It's served at the URL the visitor
// asked for, so reloading takes them back there once the network returns.
export const OfflineScreen = () => {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const reload = () => window.location.reload();
    window.addEventListener('online', reload);
    return () => window.removeEventListener('online', reload);
  }, []);

  const retry = () => {
    setChecking(true);
    if (navigator.onLine) window.location.reload();
    else setTimeout(() => setChecking(false), 800);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4 py-16 font-mono">
      <section className="w-full max-w-xl border border-pcnGreen-300 bg-black/60 shadow-[0_0_48px_-16px_rgba(4,244,190,0.45)]">
        <header className="flex items-center justify-between border-b border-dashed border-pcnGreen-200 px-3 py-2 text-xs">
          <span className="text-pcnGreen-500">pcn@programaconnosotros: ~</span>
          <span className="text-red-400">[sin conexión]</span>
        </header>

        <div className="flex flex-col gap-4 p-4 text-sm sm:p-6">
          <div>
            <Prompt>ping programaconnosotros.com</Prompt>
            <p className="text-red-400/90">ping: sendto: Network is unreachable</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <TerminalButton onClick={retry} disabled={checking}>
              {checking ? 'reintentando…' : './reintentar'}
            </TerminalButton>
            <span className="text-xs text-muted-foreground">
              # la página se recarga sola cuando vuelve la red
            </span>
          </div>

          <div className="border-t border-dashed border-pcnGreen-200 pt-4">
            <Trivia />
          </div>

          <p className="cursor-blink text-pcnGreen-600">$</p>
        </div>
      </section>
    </div>
  );
};
