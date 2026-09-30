'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState, type ReactNode } from 'react';

/*
 * Decorative "processes" running on the PCN OS wallpaper: htop, a coding agent, an event
 * stream and a network monitor. Everything is generated on the client (no requests), each
 * pane ticks on a slow interval, and all of them stop when nobody can see them: hidden tab,
 * a maximized window covering the desktop, reduced motion, or a few idle minutes.
 */

const IDLE_AFTER_MS = 3 * 60 * 1000;

const random = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const hex = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const clock = (offsetMs = 0) =>
  new Date(Date.now() - offsetMs).toLocaleTimeString('es-AR', { hour12: false });

/** Whether the background animations should run right now. */
export function useBackgroundActive(covered: boolean) {
  const [visible, setVisible] = useState(true);
  const [idle, setIdle] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReducedMotion(motion.matches);
    const onVisibility = () => setVisible(document.visibilityState === 'visible');
    onMotion();
    onVisibility();

    let lastActivity = Date.now();
    const onActivity = () => {
      lastActivity = Date.now();
      setIdle(false);
    };
    // Pointer events inside windows stay in their iframes; the bridge's focus messages
    // bubble up here as `message` events, so they count as activity too.
    const activityEvents = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'message'] as const;
    activityEvents.forEach((type) => window.addEventListener(type, onActivity, { passive: true }));
    const idleCheck = window.setInterval(() => {
      if (Date.now() - lastActivity > IDLE_AFTER_MS) setIdle(true);
    }, 30_000);

    motion.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      activityEvents.forEach((type) => window.removeEventListener(type, onActivity));
      window.clearInterval(idleCheck);
      motion.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return visible && !idle && !reducedMotion && !covered;
}

/** Calls `onTick` every `ms` while `active`; nothing is scheduled while paused. */
function useTicker(ms: number, active: boolean, onTick: () => void) {
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(onTick, ms);
    return () => window.clearInterval(id);
    // `onTick` only calls state setters, so a stale closure is fine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms, active]);
}

const Pane = ({
  title,
  status,
  active,
  className,
  children,
}: {
  title: string;
  status: ReactNode;
  active: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <section
    className={cn(
      'absolute overflow-hidden border border-pcnGreen-200 bg-black/70 font-mono text-[10px] leading-[1.45] text-pcnGreen-700 shadow-[0_0_40px_-18px_rgba(4,244,190,0.5)] [contain:paint]',
      className,
    )}
  >
    <header className="flex items-center gap-2 border-b border-pcnGreen-200 px-2 py-1 text-pcnGreen-600">
      <span className="flex gap-1">
        <span className="size-1.5 bg-pcnGreen-300" />
        <span className="size-1.5 bg-pcnGreen-400" />
        <span className="size-1.5 bg-pcnGreen" />
      </span>
      <span className="flex-1 truncate">{title}</span>
      <span className={active ? 'text-pcnGreen' : 'text-pcnGreen-500'}>{status}</span>
    </header>
    <div className="relative p-2">{children}</div>
    {/* Scan line: a transform-only animation, so it never triggers layout. */}
    <div
      className={cn(
        'os-scan pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-pcnGreen/[0.07] to-transparent',
        !active && '[animation-play-state:paused]',
      )}
    />
  </section>
);

/* ── htop ─────────────────────────────────────────────────────────────── */

const PROCESSES = [
  { pid: 1337, user: 'pcn', command: 'next-server --turbo' },
  { pid: 2048, user: 'postgres', command: 'postgres: pcn_prod' },
  { pid: 4096, user: 'agent', command: 'claude --task feature' },
  { pid: 512, user: 'pcn', command: 'node events-worker.js' },
  { pid: 8080, user: 'root', command: 'kamal-proxy' },
  { pid: 3000, user: 'pcn', command: 'prisma query-engine' },
  { pid: 9229, user: 'pcn', command: 'mailer --queue=high' },
];

const initialCores = () => Array.from({ length: 8 }, () => random(10, 70));

function Htop({ active }: { active: boolean }) {
  const [cores, setCores] = useState(initialCores);
  const [memory, setMemory] = useState(41);
  const [uptime, setUptime] = useState(() => Math.floor(random(200_000, 900_000)));
  const [cpu, setCpu] = useState(() => PROCESSES.map(() => random(0, 30)));

  useTicker(1500, active, () => {
    setCores((prev) => prev.map((value) => clamp(value + random(-18, 18), 3, 98)));
    setMemory((prev) => clamp(prev + random(-2, 2), 30, 72));
    setUptime((prev) => prev + 1.5);
    setCpu((prev) => prev.map((value) => clamp(value + random(-8, 8), 0.1, 60)));
  });

  const hours = Math.floor(uptime / 3600);
  const load = (cores.reduce((a, b) => a + b, 0) / 100).toFixed(2);
  const rows = PROCESSES.map((process, index) => ({ ...process, cpu: cpu[index] })).sort(
    (a, b) => b.cpu - a.cpu,
  );

  return (
    <Pane
      title="htop — pcn-prod-01"
      status={`load ${load}`}
      active={active}
      className="left-6 top-12 w-[330px]"
    >
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {cores.map((value, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="w-3 text-pcnGreen-500">{index}</span>
            <span className="relative h-1.5 flex-1 overflow-hidden bg-pcnGreen-100">
              <span
                className={cn(
                  'absolute inset-0 origin-left transition-transform duration-1000 ease-out',
                  value > 80 ? 'bg-red-400' : value > 55 ? 'bg-yellow-300' : 'bg-pcnGreen',
                )}
                style={{ transform: `scaleX(${value / 100})` }}
              />
            </span>
            <span className="w-7 text-right tabular-nums">{value.toFixed(0)}%</span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="w-6 text-pcnGreen-500">Mem</span>
        <span className="relative h-1.5 flex-1 overflow-hidden bg-pcnGreen-100">
          <span
            className="absolute inset-0 origin-left bg-pcnGreen-600 transition-transform duration-1000 ease-out"
            style={{ transform: `scaleX(${memory / 100})` }}
          />
        </span>
        <span className="tabular-nums">{((memory / 100) * 16).toFixed(1)}G/16G</span>
      </div>
      <p className="mt-1 text-pcnGreen-500">
        Tasks: 142 · up {Math.floor(hours / 24)}d {hours % 24}h
      </p>
      <table className="mt-1.5 w-full table-fixed">
        <thead>
          <tr className="bg-pcnGreen/15 text-left text-pcnGreen">
            <th className="w-10 font-normal">PID</th>
            <th className="w-14 font-normal">USER</th>
            <th className="w-10 text-right font-normal">CPU%</th>
            <th className="pl-2 font-normal">COMMAND</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.pid}>
              <td className="tabular-nums">{row.pid}</td>
              <td className="truncate text-pcnGreen-500">{row.user}</td>
              <td className="text-right tabular-nums">{row.cpu.toFixed(1)}</td>
              <td className="truncate pl-2 text-foreground/70">{row.command}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Pane>
  );
}

/* ── coding agent ─────────────────────────────────────────────────────── */

type AgentLine = { kind: 'prompt' | 'think' | 'tool' | 'add' | 'del' | 'ok'; text: string };

const AGENT_TASKS: AgentLine[][] = [
  [
    { kind: 'prompt', text: 'implementá lista de espera para eventos llenos' },
    { kind: 'think', text: 'leyendo el flujo de inscripciones…' },
    { kind: 'tool', text: 'Read src/actions/events/register.ts' },
    { kind: 'tool', text: 'Edit prisma/schema.prisma' },
    { kind: 'add', text: '+ model Waitlist { id String @id eventId String }' },
    { kind: 'tool', text: 'Bash pnpm prisma migrate dev' },
    { kind: 'tool', text: 'Edit src/components/events/event-row.tsx' },
    { kind: 'del', text: '- <Button disabled>Cupo lleno</Button>' },
    { kind: 'add', text: '+ <WaitlistButton eventId={event.id} />' },
    { kind: 'tool', text: 'Bash pnpm test waitlist' },
    { kind: 'ok', text: '✓ 12 tests passed · 0 failed' },
    { kind: 'ok', text: '✓ feat(events): add waitlist for full events' },
  ],
  [
    { kind: 'prompt', text: 'optimizá la query del home' },
    { kind: 'think', text: 'perfilando fetchRecentEvents…' },
    { kind: 'tool', text: 'Bash EXPLAIN ANALYZE SELECT * FROM "Event"' },
    { kind: 'think', text: 'seq scan en date · falta índice' },
    { kind: 'tool', text: 'Edit prisma/schema.prisma' },
    { kind: 'add', text: '+ @@index([date(sort: Desc)])' },
    { kind: 'tool', text: 'Edit src/actions/events/fetch-recent.ts' },
    { kind: 'del', text: '- include: { talks: true, sponsors: true }' },
    { kind: 'add', text: '+ select: { id: true, name: true, date: true }' },
    { kind: 'ok', text: '✓ p95 212ms → 18ms' },
    { kind: 'ok', text: '✓ perf(home): index events by date' },
  ],
  [
    { kind: 'prompt', text: 'agregá badges a los perfiles de speakers' },
    { kind: 'tool', text: 'Grep "speakerName" src/' },
    { kind: 'think', text: '7 matches en 4 archivos' },
    { kind: 'tool', text: 'Write src/components/profile/speaker-badge.tsx' },
    { kind: 'add', text: '+ export const SpeakerBadge = ({ talks }) =>' },
    { kind: 'tool', text: 'Edit src/app/(platform)/perfil/[id]/page.tsx' },
    { kind: 'add', text: '+ {talks.length > 0 && <SpeakerBadge talks={talks} />}' },
    { kind: 'tool', text: 'Bash pnpm lint && pnpm build' },
    { kind: 'ok', text: '✓ compiled in 4.2s' },
    { kind: 'ok', text: '✓ feat(profile): show speaker badge' },
  ],
];

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const VISIBLE_AGENT_LINES = 11;

const agentLineClassName: Record<AgentLine['kind'], string> = {
  prompt: 'text-foreground',
  think: 'italic text-pcnGreen-500',
  tool: 'text-pcnGreen-700',
  add: 'text-pcnGreen',
  del: 'text-red-400/80',
  ok: 'text-pcnGreen text-glow',
};

function Agent({ active }: { active: boolean }) {
  // `step` counts lines shown; values past the script length hold the finished task on screen.
  const [{ task, step }, setProgress] = useState({ task: 0, step: 1 });

  useTicker(800, active, () => {
    setProgress((prev) =>
      prev.step < AGENT_TASKS[prev.task].length + 4
        ? { ...prev, step: prev.step + 1 }
        : { task: (prev.task + 1) % AGENT_TASKS.length, step: 1 },
    );
  });

  const script = AGENT_TASKS[task];
  const shown = script.slice(0, Math.min(step, script.length));
  const done = step >= script.length;

  return (
    <Pane
      title="agent@pcn — ~/pcn-website"
      status={done ? '● idle' : `${SPINNER[step % SPINNER.length]} working`}
      active={active}
      className="right-6 top-12 w-[390px]"
    >
      <ol className="h-[176px] overflow-hidden">
        {shown.slice(-VISIBLE_AGENT_LINES).map((line, index, visible) => (
          <li
            key={`${task}-${shown.length - visible.length + index}`}
            className={cn('os-line-in truncate', agentLineClassName[line.kind])}
          >
            {line.kind === 'prompt' && <span className="text-pcnGreen">❯ </span>}
            {line.kind === 'tool' && <span className="text-pcnGreen-500">⏺ </span>}
            {line.text}
            {index === visible.length - 1 && !done && (
              <span className="ml-0.5 inline-block h-2.5 w-1.5 translate-y-0.5 animate-blink bg-pcnGreen" />
            )}
          </li>
        ))}
      </ol>
      <div className="mt-1 flex justify-between border-t border-pcnGreen-200 pt-1 text-pcnGreen-500">
        <span>
          task {task + 1}/{AGENT_TASKS.length}
        </span>
        <span className="tabular-nums">
          {Math.min(step, script.length)}/{script.length} steps
        </span>
      </div>
    </Pane>
  );
}

/* ── event stream ─────────────────────────────────────────────────────── */

const EVENT_TEMPLATES = [
  () => ['registration.created', `user=#${hex(4)} evt=lightning-talks`],
  () => ['talk.published', `id=${hex(6)} speaker=#${hex(4)}`],
  () => ['email.sent', `to=***@${pick(['gmail.com', 'outlook.com', 'pcn.dev'])} tpl=reminder`],
  () => ['checkin.scanned', `evt=meetup-${Math.floor(random(10, 60))} seat=${hex(3)}`],
  () => ['member.joined', `country=${pick(['AR', 'UY', 'MX', 'CL', 'ES', 'CO', 'PE'])}`],
  () => ['proposal.received', `evt=${hex(5)} status=review`],
  () => ['webhook.delivered', `discord #anuncios ${Math.floor(random(40, 180))}ms`],
];

type StreamLine = { id: number; time: string; type: string; detail: string };

const makeLine = (id: number, agoMs = 0): StreamLine => {
  const [type, detail] = pick(EVENT_TEMPLATES)();
  return { id, time: clock(agoMs), type, detail };
};

function EventStream({ active }: { active: boolean }) {
  const [lines, setLines] = useState<StreamLine[]>(() =>
    Array.from({ length: 8 }, (_, index) => makeLine(index, (8 - index) * 1200)),
  );
  const [processed, setProcessed] = useState(() => Math.floor(random(18_000, 24_000)));

  useTicker(1200, active, () => {
    setLines((prev) => [...prev.slice(-8), makeLine((prev.at(-1)?.id ?? 0) + 1)]);
    setProcessed((prev) => prev + 1);
  });

  return (
    <Pane
      title="pcn-events --tail -f"
      status={`${processed.toLocaleString('es-AR')} procesados`}
      active={active}
      className="bottom-28 left-6 hidden w-[380px] xl:block"
    >
      <ol className="h-[128px] overflow-hidden">
        {lines.map((line) => (
          <li key={line.id} className="os-line-in flex gap-2 whitespace-nowrap">
            <span className="tabular-nums text-pcnGreen-500">{line.time}</span>
            <span className="text-pcnGreen">{line.type}</span>
            <span className="truncate text-foreground/60">{line.detail}</span>
          </li>
        ))}
      </ol>
    </Pane>
  );
}

/* ── network monitor ──────────────────────────────────────────────────── */

const SAMPLES = 48;
const CHART_W = 300;
const CHART_H = 56;

function NetMonitor({ active }: { active: boolean }) {
  const [samples, setSamples] = useState(() =>
    Array.from({ length: SAMPLES }, (_, index) => 40 + Math.sin(index / 4) * 14 + random(-6, 6)),
  );

  useTicker(1000, active, () => {
    setSamples((prev) => {
      const last = prev.at(-1) ?? 40;
      const spike = Math.random() < 0.06 ? random(20, 35) : 0;
      return [...prev.slice(1), clamp(last + random(-7, 7) + spike, 8, 95)];
    });
  });

  const step = CHART_W / (SAMPLES - 1);
  const points = samples.map(
    (value, index) => `${index * step},${CHART_H - (value / 100) * CHART_H}`,
  );
  const current = samples.at(-1) ?? 0;

  return (
    <Pane
      title="netmon — edge"
      status={`${Math.round(current * 4.2)} req/s`}
      active={active}
      className="bottom-28 right-6 hidden w-[320px] xl:block"
    >
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none" className="h-14 w-full">
        <polygon
          points={`0,${CHART_H} ${points.join(' ')} ${CHART_W},${CHART_H}`}
          className="fill-pcnGreen/10"
        />
        <polyline
          points={points.join(' ')}
          fill="none"
          className="stroke-pcnGreen"
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-1.5 grid grid-cols-3 border-t border-pcnGreen-200 pt-1.5 tabular-nums">
        <span>p95 {Math.round(18 + current * 0.9)}ms</span>
        <span className="text-center">err 0.0{Math.floor(current / 30)}%</span>
        <span className="text-right text-pcnGreen">uptime 99.98%</span>
      </div>
    </Pane>
  );
}

/** The whole set of background processes. `covered` pauses them behind a maximized window. */
export function OsProcesses({ covered }: { covered: boolean }) {
  const active = useBackgroundActive(covered);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none opacity-80">
      <Htop active={active} />
      <Agent active={active} />
      <EventStream active={active} />
      <NetMonitor active={active} />
    </div>
  );
}
