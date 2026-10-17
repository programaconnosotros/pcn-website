'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

/**
 * Counts from 0 up to `value` in CSS (an animated, registered custom property shown through a
 * CSS counter; see `.count-up` in globals.css), so the figure is in the server HTML. A custom
 * property animates on the main thread, so it only starts once the page has hydrated and is
 * idle: started on first paint, it ran while hydration blocked every frame and jumped from 0 to
 * the final number. Browsers without `@property` just show the final number.
 */
export const CountUp = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const start = () => ref.current?.setAttribute('data-counting', '');
    if (typeof requestIdleCallback === 'undefined') {
      const timeout = setTimeout(start, 200);
      return () => clearTimeout(timeout);
    }
    const id = requestIdleCallback(start, { timeout: 1000 });
    return () => cancelIdleCallback(id);
  }, []);

  return (
    <span className="tracking-tight tabular-nums">
      <span
        ref={ref}
        aria-hidden
        className="count-up"
        style={{ '--count-to': value } as CSSProperties}
      />
      <span className="sr-only">{value}</span>
    </span>
  );
};
