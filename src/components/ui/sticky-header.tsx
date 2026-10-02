'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

type HeaderState = 'rest' | 'shown' | 'hidden';

// Upward speed (px/ms, smoothed) that brings the header back. Slow reading scrolls leave it out
// of the way; a quick flick up means "take me back to the controls".
const REVEAL_SPEED = 0.5;
const HIDE_DISTANCE = 8;
// Scroll events further apart than this (ms) start a new gesture.
const GESTURE_GAP = 100;
// Pinned offset from the top (top-3), included in the space reserved below the shown header.
const PINNED_TOP = 12;
// Tailwind's `lg` breakpoint, where `pinnedOnDesktop` headers stay put.
const DESKTOP_QUERY = '(min-width: 1024px)';

interface StickyHeaderProps {
  children: ReactNode;
  className?: string;
  /**
   * On large screens, keep the header pinned to the top the whole time instead of letting it
   * scroll away. Its height is published as `--sticky-header-offset` so the page's own sticky
   * bits can sit below it.
   */
  pinnedOnDesktop?: boolean;
}

// Page header (breadcrumb title plus the page's search and filters) that scrolls away with the
// content and slides back in, pinned to the top, when scrolling up fast. It must be a direct
// child of the page's main column so it can stay pinned for the whole page.
export const StickyHeader = ({ children, className, pinnedOnDesktop }: StickyHeaderProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<HeaderState>('rest');
  // Only slide when leaving or entering the `shown` state; a header that scrolled away naturally
  // goes straight to `hidden` without flashing back in first.
  const [animate, setAnimate] = useState(false);
  const stateRef = useRef<HeaderState>('rest');
  const [isDesktop, setIsDesktop] = useState(false);
  const isPinned = !!pinnedOnDesktop && isDesktop;
  // Distance from the top of the page to where the header sits at rest. A pinned header sticks
  // right there, so it doesn't shift up when the page starts scrolling.
  const [restTop, setRestTop] = useState(0);

  const setHeaderState = (next: HeaderState) => {
    if (next === stateRef.current) return;
    setAnimate(next === 'shown' || stateRef.current === 'shown');
    stateRef.current = next;
    setState(next);
  };

  // While shown, publish the space the header takes so other sticky bars (the mobile table of
  // contents) pin below it instead of covering it.
  useEffect(() => {
    const header = headerRef.current;
    if (!header || (state !== 'shown' && !isPinned)) return;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty(
        '--sticky-header-offset',
        `${header.offsetHeight + (isPinned ? restTop : PINNED_TOP)}px`,
      );
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--sticky-header-offset');
    };
  }, [state, isPinned, restTop]);

  useEffect(() => {
    if (!isPinned) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const measure = () => setRestTop(sentinel.getBoundingClientRect().top + window.scrollY);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [isPinned]);

  useEffect(() => {
    if (!pinnedOnDesktop) return;
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      setIsDesktop(query.matches);
      if (query.matches) setHeaderState('rest');
    };
    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [pinnedOnDesktop]);

  useEffect(() => {
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let speed = 0;
    let frame = 0;
    const desktop = window.matchMedia(DESKTOP_QUERY);

    const update = () => {
      frame = 0;
      const sentinel = sentinelRef.current;
      const header = headerRef.current;
      if (!sentinel || !header || (pinnedOnDesktop && desktop.matches)) return;

      const now = performance.now();
      const y = window.scrollY;
      // iOS rubber-banding past the bottom reads as a flick up; ignore it.
      const maxY = document.documentElement.scrollHeight - window.innerHeight;
      if (y > maxY) return;
      const dy = y - lastY;
      const elapsed = now - lastTime;
      lastY = y;
      lastTime = now;
      // After a pause, the first jump counts on its own instead of being averaged over the idle
      // time before it (which would make every flick look slow).
      if (elapsed > GESTURE_GAP) speed = dy / GESTURE_GAP;
      else speed = speed * 0.5 + (dy / Math.max(elapsed, 1)) * 0.5;

      const top = sentinel.getBoundingClientRect().top;
      const height = header.offsetHeight;

      if (top >= 0) return setHeaderState('rest');
      // Still partly in its natural spot: let it scroll away (or back) with the page.
      if (stateRef.current !== 'shown' && top > -height) return setHeaderState('rest');

      if (speed < -REVEAL_SPEED) setHeaderState('shown');
      else if (dy > HIDE_DISTANCE && !header.contains(document.activeElement))
        setHeaderState('hidden');
      else if (stateRef.current === 'rest') setHeaderState('hidden');
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pinnedOnDesktop]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden />
      <div
        ref={headerRef}
        data-state={state}
        // Tabbing into a hidden header brings it back.
        onFocus={() => state === 'hidden' && setHeaderState('shown')}
        style={isPinned ? ({ '--rest-top': `${restTop}px` } as CSSProperties) : undefined}
        className={cn(
          'relative z-40 -mx-4 px-4 [display:flow-root]',
          // Pinned 0.75rem down, with the backdrop reaching up to the edge, so a title with no top
          // margin still gets breathing room without changing the header's height in the flow.
          state !== 'rest' &&
            'sticky top-3 before:absolute before:inset-x-0 before:-top-3 before:bottom-0 before:-z-10 before:bg-background/90 before:backdrop-blur',
          state === 'shown' && 'before:shadow-[0_1px_0] before:shadow-pcnGreen-200',
          state !== 'rest' && animate && 'transition-transform duration-200 ease-out',
          state === 'hidden' && '-translate-y-[calc(100%+0.75rem)]',
          isPinned &&
            'sticky top-[var(--rest-top)] before:absolute before:inset-x-0 before:bottom-0 before:top-[calc(-1*var(--rest-top))] before:-z-10 before:bg-background/90 before:shadow-[0_1px_0] before:shadow-pcnGreen-200 before:backdrop-blur',
          className,
        )}
      >
        {children}
      </div>
    </>
  );
};
