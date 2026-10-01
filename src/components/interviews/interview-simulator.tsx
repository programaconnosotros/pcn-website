'use client';

import {
  AREAS,
  getInterviewQuestions,
  QA_TOOLS,
  SENIORITIES,
  TRACKS,
  type InterviewArea,
  type InterviewQuestion,
  type InterviewTrack,
  type QaTool,
  type Seniority,
} from '@/app/(platform)/entrevistas/questions';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ArrowRight, Check, Eye, RotateCcw, Square, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

type Phase = 'setup' | 'running' | 'done';

// Answers mark code with backticks, like Markdown inline code.
const renderInlineCode = (text: string) =>
  text.split(/`([^`]+)`/).map((part, i) =>
    i % 2 === 1 ? (
      <code key={i} className="rounded-sm bg-pcnGreen/10 px-1 font-mono text-[0.9em] text-pcnGreen">
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

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const buttonClassName =
  'inline-flex items-center justify-center gap-1.5 border px-3 py-1.5 font-mono text-xs lowercase transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen disabled:pointer-events-none disabled:opacity-40';
const primaryButtonClassName = cn(
  buttonClassName,
  'border-pcnGreen bg-pcnGreen/15 text-pcnGreen hover:bg-pcnGreen/25',
);
const secondaryButtonClassName = cn(
  buttonClassName,
  'border-pcnGreen-200 bg-black/40 text-muted-foreground hover:border-pcnGreen-500 hover:text-pcnGreen',
);

const Kbd = ({ children }: { children: string }) => (
  <kbd className="hidden border border-current px-1 text-[10px] opacity-50 md:inline">
    {children}
  </kbd>
);

interface OptionProps {
  selected: boolean;
  onSelect: () => void;
  label: string;
  hint?: string;
}

const Option = ({ selected, onSelect, label, hint }: OptionProps) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onSelect}
    className={cn(
      ruledCellClassName,
      'flex items-center gap-3 p-3 text-left font-mono text-sm',
      selected && 'bg-pcnGreen/10 text-pcnGreen hover:bg-pcnGreen/10',
    )}
  >
    <span className={cn('shrink-0', selected ? 'text-pcnGreen' : 'text-pcnGreen-500/50')}>
      {selected ? '[x]' : '[ ]'}
    </span>
    <span className="font-semibold">{label}</span>
    {hint && <span className="ml-auto text-[11px] text-muted-foreground">{hint}</span>}
  </button>
);

export function InterviewSimulator() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [area, setArea] = useState<InterviewArea | null>(null);
  const [track, setTrack] = useState<InterviewTrack | null>(null);
  const [seniority, setSeniority] = useState<Seniority | null>(null);
  // Quality engineering only: whether the role includes automated testing and with which tools.
  const [qaAutomated, setQaAutomated] = useState<boolean | null>(null);
  const [qaTools, setQaTools] = useState<QaTool[]>([]);
  const [deck, setDeck] = useState<InterviewQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [toReview, setToReview] = useState<InterviewQuestion[]>([]);
  const [answered, setAnswered] = useState(0);

  const selectArea = (nextArea: InterviewArea) => {
    const areaTracks = TRACKS.filter((option) => option.area === nextArea);
    setArea(nextArea);
    // Areas with a single track select it right away; the rest ask for the technology next.
    setTrack(areaTracks.length === 1 ? areaTracks[0].id : null);
  };

  // Links from the home page preselect the area (`?tipo=backend`) or a track (`?tipo=python`).
  useEffect(() => {
    const tipo = new URLSearchParams(window.location.search).get('tipo');
    const linkedTrack = TRACKS.find(({ id }) => id === tipo);
    if (linkedTrack) {
      setArea(linkedTrack.area);
      setTrack(linkedTrack.id);
    } else if (AREAS.some(({ id }) => id === tipo)) {
      selectArea(tipo as InterviewArea);
    }
  }, []);

  const toggleQaTool = (tool: QaTool) =>
    setQaTools((tools) =>
      tools.includes(tool) ? tools.filter((t) => t !== tool) : [...tools, tool],
    );

  const qaReady = qaAutomated === false || (qaAutomated === true && qaTools.length > 0);
  const interviewDeck =
    track && seniority && (track !== 'qa' || qaReady)
      ? getInterviewQuestions(track, seniority, {
          automated: !!qaAutomated,
          // Keep the tools in display order regardless of the order they were clicked.
          tools: QA_TOOLS.map(({ id }) => id).filter((id) => qaTools.includes(id)),
        })
      : [];

  const start = (questions: InterviewQuestion[]) => {
    setDeck(shuffle(questions));
    setCurrent(0);
    setRevealed(false);
    setToReview([]);
    setAnswered(0);
    setPhase('running');
  };

  const grade = (knewIt: boolean) => {
    if (!knewIt) setToReview((list) => [...list, deck[current]]);
    setAnswered((count) => count + 1);
    if (current + 1 < deck.length) {
      setCurrent(current + 1);
      setRevealed(false);
    } else {
      setPhase('done');
    }
  };

  // Space or Enter reveals the answer; 1 and 2 grade it.
  useEffect(() => {
    if (phase !== 'running') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && (e.key === '1' || e.key === '2')) {
        e.preventDefault();
        grade(e.key === '1');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const trackInfo = TRACKS.find(({ id }) => id === track);
  const seniorityInfo = SENIORITIES.find(({ id }) => id === seniority);
  const qaLabel =
    track === 'qa' &&
    (qaAutomated
      ? QA_TOOLS.filter(({ id }) => qaTools.includes(id))
          .map(({ label }) => label)
          .join(' + ')
      : 'manual');
  const interviewName =
    trackInfo &&
    seniorityInfo &&
    [trackInfo.label, qaLabel, seniorityInfo.label].filter(Boolean).join(' · ');

  if (phase === 'setup' || !track || !seniority) {
    const count = interviewDeck.length;
    const technologies = TRACKS.filter((option) => option.technology && option.area === area);
    const isQa = area === 'qa';
    const extraSteps = (technologies.length ? 1 : 0) + (isQa ? (qaAutomated ? 2 : 1) : 0);
    const pendingHint =
      technologies.length && !track
        ? 'elegí la tecnología y la seniority'
        : isQa && qaAutomated === null
          ? 'elegí el tipo de testing y la seniority'
          : isQa && qaAutomated && !qaTools.length
            ? 'elegí al menos una herramienta'
            : 'elegí el tipo y la seniority';

    return (
      <div className="mb-14 max-w-2xl">
        <PageTitle path="entrevistas" meta="active recall" />
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Practicá para tu próxima entrevista técnica. Las preguntas aparecen de a una y en orden
          aleatorio: respondé en voz alta y recién después mirá la respuesta.
        </p>

        <h2 className="mb-2 font-mono text-xs text-pcnGreen-500"># 1. tipo de entrevista</h2>
        <RuledGrid className="mb-6 grid-cols-1">
          {AREAS.map(({ id, label, stack }) => (
            <Option
              key={id}
              selected={area === id}
              onSelect={() => selectArea(id)}
              label={label}
              hint={stack}
            />
          ))}
        </RuledGrid>

        {technologies.length > 0 && (
          <>
            <h2 className="mb-2 font-mono text-xs text-pcnGreen-500"># 2. tecnología</h2>
            <RuledGrid className="mb-6 grid-cols-1 sm:grid-cols-2">
              {technologies.map(({ id, technology, stack }) => (
                <Option
                  key={id}
                  selected={track === id}
                  onSelect={() => setTrack(id)}
                  label={technology!}
                  hint={stack}
                />
              ))}
            </RuledGrid>
          </>
        )}

        {isQa && (
          <>
            <h2 className="mb-2 font-mono text-xs text-pcnGreen-500"># 2. testing</h2>
            <RuledGrid className="mb-6 grid-cols-1 sm:grid-cols-2">
              <Option
                selected={qaAutomated === false}
                onSelect={() => setQaAutomated(false)}
                label="Solo manual"
              />
              <Option
                selected={qaAutomated === true}
                onSelect={() => setQaAutomated(true)}
                label="Incluye automatizado"
              />
            </RuledGrid>
          </>
        )}

        {isQa && qaAutomated && (
          <>
            <h2 className="mb-2 font-mono text-xs text-pcnGreen-500">
              # 3. herramientas{' '}
              <span className="text-muted-foreground">(podés elegir más de una)</span>
            </h2>
            <RuledGrid className="mb-6 grid-cols-1 sm:grid-cols-3">
              {QA_TOOLS.map(({ id, label, stack }) => (
                <Option
                  key={id}
                  selected={qaTools.includes(id)}
                  onSelect={() => toggleQaTool(id)}
                  label={label}
                  hint={stack}
                />
              ))}
            </RuledGrid>
          </>
        )}

        <h2 className="mb-2 font-mono text-xs text-pcnGreen-500"># {2 + extraSteps}. seniority</h2>
        <RuledGrid className="mb-6 grid-cols-1 sm:grid-cols-3">
          {SENIORITIES.map(({ id, label }) => (
            <Option
              key={id}
              selected={seniority === id}
              onSelect={() => setSeniority(id)}
              label={label}
            />
          ))}
        </RuledGrid>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!count}
            onClick={() => start(interviewDeck)}
            className={primaryButtonClassName}
          >
            comenzar entrevista
            <ArrowRight className="size-3.5" />
          </button>
          <span className="font-mono text-[11px] text-muted-foreground">
            {count ? `${count} preguntas` : pendingHint}
          </span>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    const knownCount = answered - toReview.length;
    const endedEarly = answered < deck.length;

    return (
      <div className="mb-14 max-w-3xl">
        <PageTitle path="entrevistas" meta={interviewName} />
        <div className="mb-6 font-mono">
          <p className="text-sm text-muted-foreground">
            entrevista terminada
            {endedEarly && ` · respondiste ${answered} de ${deck.length} preguntas`}
          </p>
          {answered > 0 && (
            <p className="text-3xl font-semibold text-pcnGreen">
              {knownCount}/{answered}
              <span className="ml-2 text-sm font-normal text-muted-foreground">la sabía</span>
            </p>
          )}
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {toReview.length > 0 && (
            <button
              type="button"
              onClick={() => start(toReview)}
              className={primaryButtonClassName}
            >
              <RotateCcw className="size-3.5" />
              repasar {toReview.length} {toReview.length === 1 ? 'pregunta' : 'preguntas'}
            </button>
          )}
          <button
            type="button"
            onClick={() => start(interviewDeck)}
            className={toReview.length ? secondaryButtonClassName : primaryButtonClassName}
          >
            <RotateCcw className="size-3.5" />
            repetir entrevista
          </button>
          <button
            type="button"
            onClick={() => setPhase('setup')}
            className={secondaryButtonClassName}
          >
            elegir otra entrevista
          </button>
        </div>

        {toReview.length > 0 && (
          <>
            <h2 className="mb-2 font-mono text-xs text-pcnGreen-500"># a repasar</h2>
            <RuledGrid className="grid-cols-1">
              {toReview.map(({ question, answer }) => (
                <div key={question} className={cn(ruledCellClassName, 'flex flex-col gap-1 p-3')}>
                  <h3 className="font-mono text-sm font-semibold">{renderInlineCode(question)}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {renderInlineCode(answer)}
                  </p>
                </div>
              ))}
            </RuledGrid>
          </>
        )}
      </div>
    );
  }

  const { question, answer, topic } = deck[current];

  return (
    <div className="mb-14 max-w-3xl">
      <PageTitle
        path="entrevistas"
        meta={interviewName}
        action={
          <button
            type="button"
            onClick={() => setPhase('done')}
            className={secondaryButtonClassName}
          >
            <Square className="size-3" />
            terminar entrevista
          </button>
        }
      />

      <div className="mb-6 font-mono text-[11px] text-muted-foreground">
        <div className="mb-1 flex justify-between">
          <span>
            pregunta {current + 1}/{deck.length}
          </span>
          <span># {topic}</span>
        </div>
        <div className="h-px bg-pcnGreen-200">
          <div
            className="h-px bg-pcnGreen shadow-[0_0_8px_rgba(4,244,190,0.8)] transition-[width] duration-300"
            style={{ width: `${(current / deck.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="mb-6 font-mono text-lg font-semibold leading-snug md:text-xl">
        <span className="text-pcnGreen-500">&gt; </span>
        {renderInlineCode(question)}
      </h2>

      {revealed ? (
        <>
          <p className="mb-6 border-l-2 border-pcnGreen-500 pl-4 text-sm leading-relaxed text-muted-foreground">
            {renderInlineCode(answer)}
          </p>
          <p className="mb-2 font-mono text-xs text-muted-foreground">¿la sabías?</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => grade(true)} className={primaryButtonClassName}>
              <Check className="size-3.5" />
              la sabía
              <Kbd>1</Kbd>
            </button>
            <button type="button" onClick={() => grade(false)} className={secondaryButtonClassName}>
              <X className="size-3.5" />a repasar
              <Kbd>2</Kbd>
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            pensá tu respuesta y decila en voz alta
          </p>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className={primaryButtonClassName}
          >
            <Eye className="size-3.5" />
            mostrar respuesta
            <Kbd>espacio</Kbd>
          </button>
        </>
      )}
    </div>
  );
}
