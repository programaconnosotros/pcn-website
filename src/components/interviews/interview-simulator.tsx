'use client';

import {
  AREAS,
  getInterviewQuestions,
  QA_TOOLS,
  SENIORITIES,
  TRACK_TOOLS,
  TRACKS,
  type InterviewArea,
  type InterviewQuestion,
  type InterviewTrack,
  type QaTool,
  type Seniority,
  type TrackTool,
} from '@/app/(platform)/entrevistas/questions';
import { GuideProgressPanel } from '@/components/interviews/guide-progress-panel';
import { renderInlineCode } from '@/components/interviews/inline-code';
import { InterviewsLayout, InterviewsPanel } from '@/components/interviews/interviews-layout';
import { InterviewsTabs } from '@/components/interviews/interviews-tabs';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ArrowRight, Check, Eye, RotateCcw, Square, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Phase = 'setup' | 'running' | 'done';

interface Result {
  question: InterviewQuestion;
  knewIt: boolean;
}

/** How many questions of each topic a deck has, most frequent first. */
const countTopics = (questions: InterviewQuestion[]) => {
  const counts = new Map<string, number>();
  for (const { topic } of questions) counts.set(topic, (counts.get(topic) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
};

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

interface InterviewSimulatorProps {
  /** Section ids of each track's preparation guide, to show how much of it was read. */
  guideSections: Record<InterviewTrack, string[]>;
  /** The `?tipo=` the page was opened with, read on the server. */
  tipo?: string;
}

const ConfigRow = ({ label, value }: { label: string; value?: string | false | null }) => (
  <div className="flex gap-3 py-0.5 text-xs">
    <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
    <span className={cn('min-w-0 truncate', value ? 'text-pcnGreen' : 'text-muted-foreground/50')}>
      {value || '—'}
    </span>
  </div>
);

const TopicChips = ({ topics }: { topics: [string, number][] }) => (
  <div className="flex flex-wrap gap-1">
    {topics.map(([topic, count]) => (
      <span
        key={topic}
        className="border border-pcnGreen-200 px-1.5 py-0.5 text-[10px] text-muted-foreground"
      >
        # {topic} <span className="tabular-nums text-pcnGreen-600">{count}</span>
      </span>
    ))}
  </div>
);

// Links from the home page and the guides preselect the area (`?tipo=backend`), a track
// (`?tipo=python`) or a track's tool (`?tipo=figma`). Areas with a single track select it right away.
const preselection = (
  tipo?: string,
): { area: InterviewArea | null; track: InterviewTrack | null; tools: TrackTool[] } => {
  const linkedTrack = TRACKS.find(({ id }) => id === tipo);
  if (linkedTrack) return { area: linkedTrack.area, track: linkedTrack.id, tools: [] };
  const toolTrack = TRACKS.find(({ id }) =>
    TRACK_TOOLS[id]?.tools.some((tool) => tool.id === tipo),
  );
  if (toolTrack) return { area: toolTrack.area, track: toolTrack.id, tools: [tipo as TrackTool] };
  const linkedArea = AREAS.find(({ id }) => id === tipo)?.id;
  if (!linkedArea) return { area: null, track: null, tools: [] };
  const areaTracks = TRACKS.filter((option) => option.area === linkedArea);
  return {
    area: linkedArea,
    track: areaTracks.length === 1 ? areaTracks[0].id : null,
    tools: [],
  };
};

export function InterviewSimulator({ guideSections, tipo }: InterviewSimulatorProps) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [area, setArea] = useState<InterviewArea | null>(() => preselection(tipo).area);
  const [track, setTrack] = useState<InterviewTrack | null>(() => preselection(tipo).track);
  const [seniority, setSeniority] = useState<Seniority | null>(null);
  // Quality engineering only: whether the role includes automated testing and with which tools.
  const [qaAutomated, setQaAutomated] = useState<boolean | null>(null);
  const [qaTools, setQaTools] = useState<QaTool[]>([]);
  // Tracks with tools (UX/UI, DevOps): which ones the role uses.
  const [tools, setTools] = useState<TrackTool[]>(() => preselection(tipo).tools);
  const [deck, setDeck] = useState<InterviewQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const toReview = results.filter((result) => !result.knewIt).map((result) => result.question);
  const answered = results.length;

  const selectArea = (nextArea: InterviewArea) => {
    const areaTracks = TRACKS.filter((option) => option.area === nextArea);
    setArea(nextArea);
    // Areas with a single track select it right away; the rest ask for the technology next.
    setTrack(areaTracks.length === 1 ? areaTracks[0].id : null);
    setTools([]);
  };

  const toggleQaTool = (tool: QaTool) =>
    setQaTools((tools) =>
      tools.includes(tool) ? tools.filter((t) => t !== tool) : [...tools, tool],
    );

  const toggleTool = (tool: TrackTool) =>
    setTools((selected) =>
      selected.includes(tool) ? selected.filter((t) => t !== tool) : [...selected, tool],
    );

  const trackTools = track ? TRACK_TOOLS[track] : undefined;
  // Keep the tools in display order regardless of the order they were clicked.
  const selectedTools = trackTools?.tools.filter(({ id }) => tools.includes(id)) ?? [];
  const toolsReady = !trackTools?.required || selectedTools.length > 0;
  const qaReady = qaAutomated === false || (qaAutomated === true && qaTools.length > 0);
  const interviewDeck =
    track && seniority && (track !== 'qa' || qaReady) && toolsReady
      ? getInterviewQuestions(
          track,
          seniority,
          {
            automated: !!qaAutomated,
            tools: QA_TOOLS.map(({ id }) => id).filter((id) => qaTools.includes(id)),
          },
          selectedTools.map(({ id }) => id),
        )
      : [];

  const start = (questions: InterviewQuestion[]) => {
    setDeck(shuffle(questions));
    setCurrent(0);
    setRevealed(false);
    setResults([]);
    setPhase('running');
  };

  const grade = (knewIt: boolean) => {
    setResults((list) => [...list, { question: deck[current], knewIt }]);
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
  const toolsLabel = selectedTools.map(({ label }) => label).join(' + ');
  const interviewName =
    trackInfo &&
    seniorityInfo &&
    [trackInfo.label, qaLabel, toolsLabel, seniorityInfo.label].filter(Boolean).join(' · ');

  const guidePanel = trackInfo ? (
    <GuideProgressPanel
      track={trackInfo.id}
      label={trackInfo.label}
      sectionIds={guideSections[trackInfo.id]}
    />
  ) : (
    <InterviewsPanel command="ls guias/" meta={`${TRACKS.length} guías`}>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Cada tipo de entrevista tiene su guía de preparación. Elegí uno para ver tu progreso en la
        suya, o{' '}
        <Link href="/entrevistas/guias" className="text-pcnGreen hover:underline">
          mirá todas las guías
        </Link>
        .
      </p>
    </InterviewsPanel>
  );

  if (phase === 'setup' || !track || !seniority) {
    const count = interviewDeck.length;
    const technologies = TRACKS.filter((option) => option.technology && option.area === area);
    const isQa = area === 'qa';
    const extraSteps =
      (technologies.length ? 1 : 0) + (isQa ? (qaAutomated ? 2 : 1) : 0) + (trackTools ? 1 : 0);
    const missing = [
      !area && 'el tipo',
      technologies.length > 0 && !track && 'la tecnología',
      isQa && qaAutomated === null && 'el tipo de testing',
      isQa && qaAutomated && !qaTools.length && 'al menos una herramienta',
      trackTools?.required && !selectedTools.length && `al menos una de las ${trackTools.title}`,
      !seniority && 'la seniority',
    ].filter(Boolean) as string[];
    const pendingHint = `elegí ${
      missing.length > 1 ? `${missing.slice(0, -1).join(', ')} y ${missing.at(-1)}` : missing[0]
    }`;
    const areaInfo = AREAS.find(({ id }) => id === area);

    return (
      <div className="mb-14">
        <PageTitle
          path="entrevistas"
          meta="active recall"
          action={<InterviewsTabs active="simulador" />}
        />
        <InterviewsLayout
          main={
            <>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Practicá para tu próxima entrevista técnica. Las preguntas aparecen de a una y en
                orden aleatorio: respondé en voz alta y recién después mirá la respuesta.
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

              {trackTools && (
                <>
                  <h2 className="mb-2 font-mono text-xs text-pcnGreen-500">
                    # {technologies.length ? 3 : 2}. {trackTools.title}{' '}
                    <span className="text-muted-foreground">
                      (
                      {trackTools.required
                        ? 'podés elegir más de una'
                        : trackTools.tools.length > 1
                          ? 'opcional, podés elegir más de una'
                          : 'opcional, suma sus preguntas'}
                      )
                    </span>
                  </h2>
                  <RuledGrid
                    className={cn(
                      'mb-6 grid-cols-1',
                      trackTools.tools.length > 1 && 'sm:grid-cols-2',
                    )}
                  >
                    {trackTools.tools.map(({ id, label, stack }) => (
                      <Option
                        key={id}
                        selected={tools.includes(id)}
                        onSelect={() => toggleTool(id)}
                        label={label}
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

              <h2 className="mb-2 font-mono text-xs text-pcnGreen-500">
                # {2 + extraSteps}. seniority
              </h2>
              <RuledGrid className="grid-cols-1 sm:grid-cols-3">
                {SENIORITIES.map(({ id, label }) => (
                  <Option
                    key={id}
                    selected={seniority === id}
                    onSelect={() => setSeniority(id)}
                    label={label}
                  />
                ))}
              </RuledGrid>
            </>
          }
          aside={
            <>
              <InterviewsPanel
                command="cat entrevista.conf"
                meta={count ? `${count} preguntas` : undefined}
              >
                <ConfigRow label="tipo" value={areaInfo?.label} />
                {technologies.length > 0 && (
                  <ConfigRow label="tecnología" value={trackInfo?.technology} />
                )}
                {isQa && (
                  <ConfigRow
                    label="testing"
                    value={qaAutomated === null ? null : qaAutomated ? qaLabel : 'manual'}
                  />
                )}
                {trackTools && (
                  <ConfigRow
                    label={trackTools.title}
                    value={toolsLabel || (trackTools.required ? null : 'ninguna')}
                  />
                )}
                <ConfigRow label="seniority" value={seniorityInfo?.label} />

                {count > 0 && (
                  <div className="mt-3 border-t border-dashed border-pcnGreen-200 pt-3">
                    <p className="mb-1.5 text-[11px] text-muted-foreground">temas que entran</p>
                    <TopicChips topics={countTopics(interviewDeck)} />
                  </div>
                )}

                <button
                  type="button"
                  disabled={!count}
                  onClick={() => start(interviewDeck)}
                  className={cn(primaryButtonClassName, 'mt-4 w-full')}
                >
                  comenzar entrevista
                  <ArrowRight className="size-3.5" />
                </button>
                {!count && (
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    {pendingHint}
                  </p>
                )}
              </InterviewsPanel>
              {guidePanel}
            </>
          }
        />
      </div>
    );
  }

  if (phase === 'done') {
    const knownCount = answered - toReview.length;
    const endedEarly = answered < deck.length;
    // Topics ordered from the weakest, so what to study next comes first.
    const byTopic = [
      ...results.reduce((topics, { question, knewIt }) => {
        const entry = topics.get(question.topic) ?? { known: 0, total: 0 };
        topics.set(question.topic, {
          known: entry.known + (knewIt ? 1 : 0),
          total: entry.total + 1,
        });
        return topics;
      }, new Map<string, { known: number; total: number }>()),
    ].sort((a, b) => a[1].known / a[1].total - b[1].known / b[1].total);

    return (
      <div className="mb-14">
        <PageTitle path="entrevistas" meta={interviewName} />
        <InterviewsLayout
          main={
            <>
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
                  <RuledGrid className="grid-cols-1 xl:grid-cols-2">
                    {toReview.map(({ question, answer }) => (
                      <div
                        key={question}
                        className={cn(ruledCellClassName, 'flex flex-col gap-1 p-3')}
                      >
                        <h3 className="font-mono text-sm font-semibold">
                          {renderInlineCode(question)}
                        </h3>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {renderInlineCode(answer)}
                        </p>
                      </div>
                    ))}
                  </RuledGrid>
                </>
              )}
            </>
          }
          aside={
            <>
              {byTopic.length > 0 && (
                <InterviewsPanel command="grep --count temas" meta={`${byTopic.length} temas`}>
                  <ul className="space-y-1.5 text-xs">
                    {byTopic.map(([topic, { known, total }]) => (
                      <li key={topic}>
                        <div className="mb-0.5 flex justify-between gap-2">
                          <span className="truncate text-muted-foreground"># {topic}</span>
                          <span
                            className={cn(
                              'shrink-0 tabular-nums',
                              known === total ? 'text-pcnGreen' : 'text-muted-foreground',
                            )}
                          >
                            {known}/{total}
                          </span>
                        </div>
                        <div className="h-px bg-pcnGreen-200">
                          <div
                            className="h-px bg-pcnGreen"
                            style={{ width: `${(known / total) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </InterviewsPanel>
              )}
              {guidePanel}
            </>
          }
        />
      </div>
    );
  }

  const { question, answer, topic } = deck[current];

  return (
    <div className="mb-14">
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

      <InterviewsLayout
        main={
          <>
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
                  <button
                    type="button"
                    onClick={() => grade(true)}
                    className={primaryButtonClassName}
                  >
                    <Check className="size-3.5" />
                    la sabía
                    <Kbd>1</Kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => grade(false)}
                    className={secondaryButtonClassName}
                  >
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
          </>
        }
        aside={
          <InterviewsPanel command="watch sesion" meta={`${answered}/${deck.length}`}>
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'la sabía', value: answered - toReview.length, lit: true },
                { label: 'a repasar', value: toReview.length },
                { label: 'faltan', value: deck.length - answered },
              ].map(({ label, value, lit }) => (
                <div key={label} className="border border-pcnGreen-200 px-1 py-2">
                  <p
                    className={cn(
                      'text-lg font-semibold tabular-nums',
                      lit ? 'text-pcnGreen' : 'text-foreground',
                    )}
                  >
                    {value}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            {/* One cell per question: lit if you knew it, outlined if to review. */}
            <div className="flex flex-wrap gap-1" aria-hidden>
              {deck.map((item, i) => (
                <span
                  key={item.question}
                  className={cn(
                    'size-2.5 border',
                    i < answered
                      ? results[i].knewIt
                        ? 'border-pcnGreen bg-pcnGreen'
                        : 'border-pcnGreen-500 bg-transparent'
                      : i === current
                        ? 'animate-pulse border-pcnGreen bg-pcnGreen/30'
                        : 'border-pcnGreen-200 bg-transparent',
                  )}
                />
              ))}
            </div>
            <p className="mt-3 hidden text-[11px] text-muted-foreground md:block">
              <span className="text-pcnGreen-500">espacio</span> muestra la respuesta ·{' '}
              <span className="text-pcnGreen-500">1</span> la sabía ·{' '}
              <span className="text-pcnGreen-500">2</span> a repasar
            </p>
          </InterviewsPanel>
        }
      />
    </div>
  );
}
