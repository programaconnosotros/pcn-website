'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type HeaderState = 'rest' | 'shown' | 'hidden';

// Upward speed (px/ms, smoothed) that brings the header back. Slow reading scrolls leave it out
// of the way; a quick flick up means "take me back to the controls".
const REVEAL_SPEED = 0.5;
const HIDE_DISTANCE = 8;
// Scroll events further apart than this (ms) start a new gesture.
const GESTURE_GAP = 100;

interface StickyHeaderProps {
  children: ReactNode;
  className?: string;
}

// Page header (breadcrumb title plus the page's search and filters) that scrolls away with the
// content and slides back in, pinned to the top, when scrolling up fast. It must be a direct
// child of the page's main column so it can stay pinned for the whole page.
export const StickyHeader = ({ children, className }: StickyHeaderProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<HeaderState>('rest');
  // Only slide when leaving or entering the `shown` state; a header that scrolled away naturally
  // goes straight to `hidden` without flashing back in first.
  const [animate, setAnimate] = useState(false);
  const stateRef = useRef<HeaderState>('rest');

  const setHeaderState = (next: HeaderState) => {
    if (next === stateRef.current) return;
    setAnimate(next === 'shown' || stateRef.current === 'shown');
    stateRef.current = next;
    setState(next);
  };

  useEffect(() => {
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let speed = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      const sentinel = sentinelRef.current;
      const header = headerRef.current;
      if (!sentinel || !header) return;

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
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden />
      <div
        ref={headerRef}
        data-state={state}
        // Tabbing into a hidden header brings it back.
        onFocus={() => state === 'hidden' && setHeaderState('shown')}
        className={cn(
          'relative z-30 -mx-4 px-4 [display:flow-root]',
          // Pinned 0.75rem down, with the backdrop reaching up to the edge, so a title with no top
          // margin still gets breathing room without changing the header's height in the flow.
          state !== 'rest' &&
            'sticky top-3 before:absolute before:inset-x-0 before:-top-3 before:bottom-0 before:-z-10 before:bg-background/90 before:backdrop-blur',
          state === 'shown' && 'before:shadow-[0_1px_0] before:shadow-pcnGreen-200',
          state !== 'rest' && animate && 'transition-transform duration-200 ease-out',
          state === 'hidden' && '-translate-y-[calc(100%+0.75rem)]',
          className,
        )}
      >
        {children}
      </div>
    </>
  );
};
