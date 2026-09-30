'use client';

import { useEffect, type RefObject } from 'react';

// One scroll listener for every photo on the page; only the ones on screen get updated.
const visible = new Set<HTMLElement>();
let observer: IntersectionObserver | null = null;
let frame = 0;
let listening = false;

const update = () => {
  frame = 0;
  const half = window.innerHeight / 2;
  for (const element of visible) {
    const rect = element.getBoundingClientRect();
    // -1 when the photo enters from the bottom of the viewport, 1 when it leaves at the top.
    const progress = (half - (rect.top + rect.height / 2)) / (half + rect.height / 2);
    element.style.setProperty('--parallax', Math.max(-1, Math.min(1, progress)).toFixed(3));
  }
};

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(update);
};

const startListening = () => {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
};

const stopListening = () => {
  if (!listening || visible.size > 0) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
};

const getObserver = () =>
  (observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      if (entry.isIntersecting) visible.add(element);
      else visible.delete(element);
    }
    if (visible.size > 0) startListening();
    else stopListening();
    schedule();
  }));

/**
 * Sets `--parallax` (-1…1) on the element as it scrolls through the viewport, and `--px`/`--py`
 * (-1…1) while the pointer moves over it, for the photo inside to drift with some depth.
 */
export function useParallax(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    getObserver().observe(element);

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty(
        '--px',
        (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3),
      );
      element.style.setProperty(
        '--py',
        (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3),
      );
    };
    const onPointerLeave = () => {
      element.style.setProperty('--px', '0');
      element.style.setProperty('--py', '0');
    };
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerleave', onPointerLeave);

    return () => {
      observer?.unobserve(element);
      visible.delete(element);
      stopListening();
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [ref]);
}
