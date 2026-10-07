'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getUserSummary, type UserSummary } from '@/actions/users/get-user-summary';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** What the trigger already knows about the user, shown while the full summary loads. */
export type HoverCardUser = { id: string; name: string; image: string | null };

const OPEN_DELAY = 350;
const FOCUS_OPEN_DELAY = 150;
const CLOSE_DELAY = 180;
const LONG_PRESS = 450;
const CARD_WIDTH = 320;
const GAP = 6;
const MARGIN = 8;

// One request per user for the whole page visit, shared by every mention of them. A failed
// request is forgotten so the next hover retries.
const summaries = new Map<string, Promise<UserSummary | null>>();
const loadSummary = (userId: string) => {
  let pending = summaries.get(userId);
  if (!pending) {
    pending = getUserSummary(userId).catch((error) => {
      summaries.delete(userId);
      throw error;
    });
    summaries.set(userId, pending);
  }
  return pending;
};

type SummaryState =
  | { status: 'loading' }
  | { status: 'ready'; summary: UserSummary }
  | { status: 'missing' }
  | { status: 'error' };

function useUserSummary(userId: string, enabled: boolean): SummaryState {
  const [state, setState] = useState<SummaryState>({ status: 'loading' });
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    loadSummary(userId).then(
      (summary) =>
        active && setState(summary ? { status: 'ready', summary } : { status: 'missing' }),
      () => active && setState({ status: 'error' }),
    );
    return () => {
      active = false;
    };
  }, [userId, enabled]);
  return state;
}

/** "Agustín Sánchez" → "agustin-sanchez", the handle the card prints in its prompt. */
const handleOf = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'user';

const memberSince = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });

interface UserHoverCardProps {
  user: HoverCardUser;
  /** The mention itself, usually a link to the profile. Must be inline content. */
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a mention of a platform user and shows a terminal-styled summary of them (avatar, role,
 * activity counts and a link to the full profile) after hovering it for a moment, focusing it
 * with the keyboard, or long-pressing it on touch screens. The summary is fetched the first
 * time it's needed and reused for the rest of the visit.
 */
export function UserHoverCard({ user, children, className }: UserHoverCardProps) {
  const cardId = useId();
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Set when a long press opened the card, so the click that follows doesn't navigate away.
  const longPressed = useRef(false);
  const state = useUserSummary(user.id, requested);

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    clearTimeout(pressTimer.current);
  };

  const scheduleOpen = (delay: number) => {
    clearTimeout(closeTimer.current);
    clearTimeout(openTimer.current);
    // Start fetching right away so the data is usually there by the time the card shows.
    setRequested(true);
    openTimer.current = setTimeout(() => setOpen(true), delay);
  };

  const scheduleClose = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }, []);

  const cancelClose = () => clearTimeout(closeTimer.current);

  useEffect(() => clearTimers, []);

  // Fixed under the mention, or above it when there's no room below, kept inside the viewport.
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const place = () => {
      const trigger = triggerRef.current;
      const card = cardRef.current;
      if (!trigger || !card) return;
      // A mention that wraps has several boxes; anchor to the first one.
      const rect = trigger.getClientRects()[0] ?? trigger.getBoundingClientRect();
      const width = Math.min(CARD_WIDTH, window.innerWidth - MARGIN * 2);
      const height = card.offsetHeight;
      const fitsBelow = rect.bottom + GAP + height <= window.innerHeight - MARGIN;
      const top =
        fitsBelow || rect.top - GAP - height < MARGIN ? rect.bottom + GAP : rect.top - GAP - height;
      const left = Math.max(MARGIN, Math.min(rect.left, window.innerWidth - width - MARGIN));
      setPosition({ top, left });
    };
    place();
    const observer = new ResizeObserver(place);
    if (cardRef.current) observer.observe(cardRef.current);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  // Escape or a tap/click anywhere else closes it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !cardRef.current?.contains(target)) {
        clearTimers();
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearTimers();
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const isTouch = (event: ReactPointerEvent) => event.pointerType === 'touch';

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('[-webkit-touch-callout:none]', className)}
        aria-describedby={open ? cardId : undefined}
        onPointerEnter={(event) => !isTouch(event) && scheduleOpen(OPEN_DELAY)}
        onPointerLeave={(event) => !isTouch(event) && scheduleClose()}
        onPointerDown={(event) => {
          if (!isTouch(event)) return;
          longPressed.current = false;
          setRequested(true);
          clearTimeout(pressTimer.current);
          pressTimer.current = setTimeout(() => {
            longPressed.current = true;
            setOpen(true);
          }, LONG_PRESS);
        }}
        onPointerUp={() => clearTimeout(pressTimer.current)}
        onPointerCancel={() => clearTimeout(pressTimer.current)}
        onClickCapture={(event) => {
          if (!longPressed.current) return;
          longPressed.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
        onContextMenu={(event) => {
          // Android opens the link menu on long press; the card replaces it.
          if (longPressed.current || open) event.preventDefault();
        }}
        onFocus={(event) => {
          // Only keyboard focus; a mouse click already went through hover.
          if (event.target.matches(':focus-visible')) scheduleOpen(FOCUS_OPEN_DELAY);
        }}
        onBlur={(event) => {
          if (!cardRef.current?.contains(event.relatedTarget as Node | null)) scheduleClose();
        }}
      >
        {children}
      </span>

      {open &&
        createPortal(
          <div
            ref={cardRef}
            id={cardId}
            role="dialog"
            aria-label={`Resumen de ${user.name}`}
            style={{
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              width: `min(${CARD_WIDTH}px, calc(100vw - ${MARGIN * 2}px))`,
              visibility: position ? 'visible' : 'hidden',
            }}
            onPointerEnter={cancelClose}
            onPointerLeave={(event) => !isTouch(event) && scheduleClose()}
            onBlur={(event) => {
              const next = event.relatedTarget as Node | null;
              if (!cardRef.current?.contains(next) && !triggerRef.current?.contains(next)) {
                scheduleClose();
              }
            }}
            className="fixed z-50 overflow-hidden border border-pcnGreen-400 bg-background/95 font-mono text-xs shadow-[0_0_32px_-10px_rgba(4,244,190,0.65)] backdrop-blur animate-in fade-in-0 zoom-in-95 motion-reduce:animate-none"
          >
            <UserSummaryCard user={user} state={state} />
          </div>,
          document.body,
        )}
    </>
  );
}

function UserSummaryCard({ user, state }: { user: HoverCardUser; state: SummaryState }) {
  const summary = state.status === 'ready' ? state.summary : null;
  const handle = handleOf(user.name);
  const image = summary?.image ?? user.image;

  return (
    <>
      {/* Title bar: the "command" that printed this card. */}
      <div className="flex items-center gap-2 border-b border-pcnGreen-200 bg-pcnGreen/[0.06] px-2.5 py-1.5 text-[10px]">
        <span aria-hidden className="flex gap-1">
          <span className="size-1.5 rounded-full bg-red-400/70" />
          <span className="size-1.5 rounded-full bg-yellow-400/70" />
          <span className="size-1.5 rounded-full bg-pcnGreen/80" />
        </span>
        <span className="min-w-0 truncate text-muted-foreground">
          <span className="text-pcnGreen-600">$ </span>
          finger <span className="text-foreground">@{handle}</span>
        </span>
        <span className="ml-auto shrink-0 text-[9px] uppercase tracking-wider text-pcnGreen-500">
          {state.status === 'loading' ? 'fetching…' : 'tty/pcn'}
        </span>
      </div>

      <div className="flex gap-3 p-2.5">
        <Avatar className="size-14 rounded-sm border border-pcnGreen-300">
          <AvatarImage src={image ?? undefined} alt="" />
          <AvatarFallback className="rounded-sm bg-pcnGreen/10 text-lg text-pcnGreen">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {summary?.name ?? user.name}
          </p>
          <p className="truncate text-[11px] text-pcnGreen-700">~/users/{handle}</p>
          {state.status === 'loading' && (
            <div className="space-y-1 pt-1" aria-hidden>
              <Skeleton className="h-2.5 w-4/5" />
              <Skeleton className="h-2.5 w-3/5" />
            </div>
          )}
          {summary?.role && (
            <p className="truncate text-[11px] text-muted-foreground" title={summary.role}>
              {summary.role}
            </p>
          )}
          {summary && (summary.isCofounder || summary.isAmbassador) && (
            <p className="flex flex-wrap gap-1 pt-0.5 text-[9px] uppercase tracking-wider">
              {summary.isCofounder && (
                <span className="border border-pcnGreen-400 px-1 text-pcnGreen">co-founder</span>
              )}
              {summary.isAmbassador && (
                <span className="border border-pcnGreen-400 px-1 text-pcnGreen">ambassador</span>
              )}
            </p>
          )}
        </div>
      </div>

      {summary?.slogan && (
        <p className="border-t border-dashed border-pcnGreen-200 px-2.5 py-1.5 text-[11px] italic text-muted-foreground">
          <span className="not-italic text-pcnGreen-600"># </span>
          {summary.slogan}
        </p>
      )}

      {state.status === 'loading' && <StatsSkeleton />}
      {summary && <SummaryBody summary={summary} />}
      {state.status === 'missing' && (
        <p className="border-t border-pcnGreen-200 px-2.5 py-2 text-[11px] text-muted-foreground">
          <span className="text-red-400">err: </span>usuario no encontrado
        </p>
      )}
      {state.status === 'error' && (
        <p className="border-t border-pcnGreen-200 px-2.5 py-2 text-[11px] text-muted-foreground">
          <span className="text-red-400">err: </span>no se pudo cargar el resumen
        </p>
      )}

      {state.status !== 'missing' && (
        <Link
          href={`/perfil/${user.id}`}
          className="group flex items-center justify-between border-t border-pcnGreen-300 px-2.5 py-2 text-[11px] text-pcnGreen transition-colors hover:bg-pcnGreen/10 focus-visible:bg-pcnGreen/10 focus-visible:outline-none"
        >
          <span>
            <span className="text-pcnGreen-600">&gt; </span>ver perfil completo
          </span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </>
  );
}

function SummaryBody({ summary }: { summary: UserSummary }) {
  const { stats } = summary;
  const cells: { label: string; value: string | number }[] = [
    { label: 'charlas', value: stats.talks },
    { label: 'eventos', value: stats.eventsAttended },
    { label: 'organizó', value: stats.eventsOrganized },
    { label: 'consejos', value: stats.advice },
    { label: 'proyectos', value: stats.projects },
    { label: 'fotos', value: stats.photos },
  ];

  return (
    <>
      <dl className="grid grid-cols-3 border-t border-pcnGreen-200">
        {cells.map(({ label, value }, index) => (
          <div
            key={label}
            className={cn(
              // Value on top, label under it, keeping <dt> before <dd> in the markup.
              'flex flex-col-reverse px-2.5 py-1.5',
              index % 3 !== 2 && 'border-r border-pcnGreen-200',
              index >= 3 && 'border-t border-pcnGreen-200',
            )}
          >
            <dt className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</dt>
            <dd
              className={cn(
                'text-sm tabular-nums',
                value ? 'text-foreground' : 'text-muted-foreground/50',
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="space-y-0.5 border-t border-pcnGreen-200 px-2.5 py-1.5 text-[11px]">
        <Row label="logros">
          <span className="text-pcnGreen">{summary.achievements.earned}</span>
          <span className="text-muted-foreground">/{summary.achievements.total}</span>
          <AchievementBar {...summary.achievements} />
        </Row>
        {stats.commits > 0 && (
          <Row label="commits">
            <span className="text-foreground">{stats.commits}</span>
            {stats.contributorRank && (
              <span className="text-muted-foreground"> · #{stats.contributorRank} en el repo</span>
            )}
          </Row>
        )}
        {summary.languages.length > 0 && (
          <Row label="stack">
            <span className="text-foreground">{summary.languages.join(' ')}</span>
          </Row>
        )}
        {summary.location && (
          <Row label="loc">
            <span className="text-foreground">{summary.location}</span>
          </Row>
        )}
        <Row label="since">
          <span className="text-foreground">{memberSince(summary.memberSince)}</span>
        </Row>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="flex min-w-0 items-center gap-2">
      <span className="w-14 shrink-0 text-muted-foreground">{label}:</span>
      <span className="flex min-w-0 items-center truncate">{children}</span>
    </p>
  );
}

/** `[####------]`, the achievements progress as an ASCII bar. */
function AchievementBar({ earned, total }: { earned: number; total: number }) {
  const slots = 10;
  const filled = total > 0 ? Math.round((earned / total) * slots) : 0;
  return (
    <span aria-hidden className="ml-2 tracking-tighter">
      <span className="text-muted-foreground">[</span>
      <span className="text-pcnGreen">{'#'.repeat(filled)}</span>
      <span className="text-pcnGreen-300">{'-'.repeat(slots - filled)}</span>
      <span className="text-muted-foreground">]</span>
    </span>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-3 border-t border-pcnGreen-200">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          aria-hidden
          className={cn(
            'space-y-1 px-2.5 py-1.5',
            index % 3 !== 2 && 'border-r border-pcnGreen-200',
            index >= 3 && 'border-t border-pcnGreen-200',
          )}
        >
          <Skeleton className="h-3.5 w-6" />
          <Skeleton className="h-2 w-12" />
        </div>
      ))}
      <span className="sr-only">Cargando resumen…</span>
    </div>
  );
}
