'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ← / → step through the gallery from a photo's page (ignored while typing).
export function PhotoKeyboardNav({
  previousHref,
  nextHref,
}: {
  previousHref: string | null;
  nextHref: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, video, [contenteditable="true"]')) return;
      const href =
        event.key === 'ArrowLeft' ? previousHref : event.key === 'ArrowRight' ? nextHref : null;
      if (!href) return;
      event.preventDefault();
      router.push(href, { scroll: false });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router, previousHref, nextHref]);

  // Warm the neighbours so stepping is instant.
  useEffect(() => {
    if (previousHref) router.prefetch(previousHref);
    if (nextHref) router.prefetch(nextHref);
  }, [router, previousHref, nextHref]);

  return null;
}
