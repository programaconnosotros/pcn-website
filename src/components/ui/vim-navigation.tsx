'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  GlobalShortcutsDialog,
  openShortcutsDialog,
} from '@/components/shortcuts/shortcuts-dialog';

/** Distance (px) a single `j`/`k` scrolls. */
const LINE_STEP = 80;

/** How long (ms) the first key of a two-key sequence (`gg`, `yy`) waits for the second. */
const SEQUENCE_TIMEOUT_MS = 600;

/** Keys typed into fields, or handled by menus, listboxes and dialogs, are never shortcuts. */
const shouldIgnore = (event: KeyboardEvent) => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return true;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
    return true;
  }
  return Boolean(
    target.closest('[role="dialog"],[role="menu"],[role="listbox"],[role="combobox"]'),
  );
};

const scrollByAmount = (top: number, event: KeyboardEvent) =>
  // Held keys repeat fast: an instant step keeps the scroll from lagging behind the key.
  window.scrollBy({ top, behavior: event.repeat ? 'instant' : 'smooth' });

/**
 * `h`/`l` behave like the ← / → keys: whatever listens for arrows (the gallery's previous/next
 * photo, carousels) gets one, and if nothing takes it the page scrolls sideways.
 */
const pressArrow = (key: 'ArrowLeft' | 'ArrowRight', event: KeyboardEvent) => {
  const target =
    document.activeElement instanceof HTMLElement ? document.activeElement : document.body;
  const arrow = new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true });
  target.dispatchEvent(arrow);
  if (!arrow.defaultPrevented) {
    window.scrollBy({
      left: key === 'ArrowLeft' ? -LINE_STEP : LINE_STEP,
      behavior: event.repeat ? 'instant' : 'smooth',
    });
  }
};

/**
 * Site-wide vim-style keyboard navigation: `j`/`k` scroll, `h`/`l` act as ← / →, `d`/`u` and `f`/`b` scroll by half
 * or whole pages, `gg`/`G` jump to the top/bottom, `H`/`L` walk the history, `yy` copies the
 * URL and `?` opens the shortcuts dialog. Inside a PCN OS window it drives that window's page.
 */
export function VimNavigation() {
  useEffect(() => {
    let pending: string | null = null;
    let pendingTimeout: number | undefined;

    const clearPending = () => {
      pending = null;
      window.clearTimeout(pendingTimeout);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnore(event)) {
        clearPending();
        return;
      }

      const { key } = event;
      const sequence = pending ? pending + key : null;
      clearPending();

      if (sequence === 'gg') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (sequence === 'yy') {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => toast.success('Link copiado'))
          .catch(() => toast.error('No se pudo copiar el link'));
      } else if (key === 'g' || key === 'y') {
        pending = key;
        pendingTimeout = window.setTimeout(clearPending, SEQUENCE_TIMEOUT_MS);
      } else if (key === 'j') {
        scrollByAmount(LINE_STEP, event);
      } else if (key === 'k') {
        scrollByAmount(-LINE_STEP, event);
      } else if (key === 'h') {
        pressArrow('ArrowLeft', event);
      } else if (key === 'l') {
        pressArrow('ArrowRight', event);
      } else if (key === 'd') {
        scrollByAmount(window.innerHeight / 2, event);
      } else if (key === 'u') {
        scrollByAmount(-window.innerHeight / 2, event);
      } else if (key === 'f') {
        scrollByAmount(window.innerHeight * 0.9, event);
      } else if (key === 'b') {
        scrollByAmount(-window.innerHeight * 0.9, event);
      } else if (key === 'G') {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      } else if (key === 'H') {
        window.history.back();
      } else if (key === 'L') {
        window.history.forward();
      } else if (key === '?') {
        openShortcutsDialog();
      } else {
        return;
      }
      event.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      clearPending();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // On the PCN OS desktop the dialog goes above the windows, like the search.
  return <GlobalShortcutsDialog layerClassName="os:z-[6500]" />;
}
