'use client';

import { useRef } from 'react';

/**
 * Returns focus to whatever opened a Radix dialog when it closes. Radix only gives focus back to
 * its own `Trigger`; dialogs opened from a plain button (controlled `open`, or mounted on demand)
 * would otherwise leave it on <body>. Remembers the element focused when the dialog opens and
 * focuses it again on close, if it is still on the page; otherwise Radix's default runs.
 */
export function useRestoreFocus({
  onOpenAutoFocus,
  onCloseAutoFocus,
}: {
  onOpenAutoFocus?: (_event: Event) => void;
  onCloseAutoFocus?: (_event: Event) => void;
} = {}) {
  const opener = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus: (event: Event) => {
      // Radix fires this before moving focus into the dialog, so this is still the opener.
      const active = document.activeElement;
      opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
      onOpenAutoFocus?.(event);
    },
    onCloseAutoFocus: (event: Event) => {
      onCloseAutoFocus?.(event);
      const target = opener.current;
      opener.current = null;
      if (event.defaultPrevented || !target?.isConnected) return;
      event.preventDefault();
      target.focus({ preventScroll: true });
    },
  };
}
