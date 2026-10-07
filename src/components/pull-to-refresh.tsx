'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Pages built only from content committed to the repo: refreshing them would fetch nothing new.
// Everything else reads the database, so new pages get pull to refresh by default.
const STATIC_ROUTES = [
  '/code-warfare',
  '/cursos',
  '/entrevistas',
  '/especialidades',
  '/influencers',
  '/music',
  '/partners',
  '/podcast',
  '/preguntas-frecuentes',
  '/series-y-peliculas',
  '/software-recomendado',
  '/videos',
];

const isStaticRoute = (pathname: string) =>
  STATIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

/** Pull distance (after resistance) that triggers a refresh on release. */
const THRESHOLD = 72;
const MAX_PULL = 120;
/** Keeps the spinner up long enough to read as "it refreshed" even when the data is instant. */
const MIN_SPIN_MS = 600;

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** A dialog, sheet or the mobile menu is open: the gesture belongs to it, not to the page. */
const isOverlayOpen = () =>
  document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"]') !== null;

/** The touch started inside something that scrolls on its own and isn't at its top. */
const insideScrolledElement = (target: EventTarget | null) => {
  for (let el = target as HTMLElement | null; el && el !== document.body; el = el.parentElement) {
    if (el.scrollTop > 0) {
      const { overflowY } = getComputedStyle(el);
      if (overflowY === 'auto' || overflowY === 'scroll') return true;
    }
  }
  return false;
};

/**
 * Pull to refresh for the installed app, where there is no browser reload gesture. Pulling down
 * from the top of the page re-renders its server components (`router.refresh()`, which keeps
 * scroll and client state) and refetches any React Query data. Browsers keep their own gesture.
 */
export function PullToRefresh() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(false);
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pullRef = useRef(0);

  useEffect(() => {
    setEnabled(isStandalone() && window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const active = enabled && !isStaticRoute(pathname);

  useEffect(() => {
    if (!active) return;

    let startY: number | null = null;
    let startX = 0;
    let tracking = false;

    const setDistance = (value: number) => {
      pullRef.current = value;
      setPull(value);
    };

    const onTouchStart = (event: TouchEvent) => {
      startY = null;
      if (event.touches.length !== 1 || window.scrollY > 0) return;
      if (isOverlayOpen() || insideScrolledElement(event.target)) return;
      startY = event.touches[0].clientY;
      startX = event.touches[0].clientX;
      tracking = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (startY === null) return;
      const dy = event.touches[0].clientY - startY;
      const dx = event.touches[0].clientX - startX;
      if (!tracking) {
        // Only claim clearly vertical, downward drags that start at the very top.
        if (Math.abs(dx) > Math.abs(dy) || dy <= 0 || window.scrollY > 0) {
          if (Math.abs(dx) > 8 || dy < -8) startY = null;
          return;
        }
        if (dy < 8) return;
        tracking = true;
        setDragging(true);
      }
      if (event.cancelable) event.preventDefault();
      // Resistance: the indicator moves less the further it's pulled.
      setDistance(Math.min(MAX_PULL, Math.max(0, dy - 8) * 0.5));
    };

    const onTouchEnd = () => {
      if (!tracking) {
        startY = null;
        return;
      }
      tracking = false;
      startY = null;
      setDragging(false);
      if (pullRef.current >= THRESHOLD) {
        setDistance(THRESHOLD);
        if (navigator.vibrate) navigator.vibrate(10);
        startTransition(async () => {
          router.refresh();
          await Promise.all([
            queryClient.invalidateQueries(),
            new Promise((resolve) => window.setTimeout(resolve, MIN_SPIN_MS)),
          ]);
        });
      } else {
        setDistance(0);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [active, queryClient, router]);

  // The refresh finished: tuck the indicator back up.
  useEffect(() => {
    if (!isPending && !dragging && pullRef.current >= THRESHOLD) {
      pullRef.current = 0;
      setPull(0);
    }
  }, [isPending, dragging]);

  if (!active) return null;

  const progress = Math.min(1, pull / THRESHOLD);
  const ready = progress >= 1;

  return (
    <div
      aria-hidden={!isPending}
      role="status"
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-70 flex justify-center md:hidden embedded:hidden',
        !dragging && 'transition-transform duration-300 ease-out',
      )}
      style={{
        transform: `translateY(calc(env(safe-area-inset-top) + ${pull - 44}px))`,
      }}
    >
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-full border bg-black transition-[border-color,box-shadow]',
          ready || isPending
            ? 'border-pcnGreen shadow-[0_0_14px_rgba(4,244,190,0.5)]'
            : 'border-pcnGreen-300',
        )}
        style={{ opacity: isPending ? 1 : progress }}
      >
        <RotateCw
          className={cn('size-4 text-pcnGreen', isPending && 'animate-spin')}
          strokeWidth={2.25}
          style={isPending ? undefined : { transform: `rotate(${progress * 270}deg)` }}
        />
        <span className="sr-only">{isPending ? 'Actualizando…' : ''}</span>
      </span>
    </div>
  );
}
