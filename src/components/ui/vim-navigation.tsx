'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/** Distance (px) a single `j`/`k` scrolls. */
const LINE_STEP = 80;

/** How long (ms) the first key of a two-key sequence (`gg`, `yy`) waits for the second. */
const SEQUENCE_TIMEOUT_MS = 600;

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-sm border border-pcnGreen-200 px-1 text-pcnGreen-600">{children}</kbd>
);

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['j', 'k'], description: 'Bajar / subir' },
  { keys: ['d', 'u'], description: 'Media página abajo / arriba' },
  { keys: ['f', 'b'], description: 'Página completa abajo / arriba' },
  { keys: ['gg'], description: 'Ir al principio' },
  { keys: ['G'], description: 'Ir al final' },
  { keys: [']', '['], description: 'Sección siguiente / anterior (índice)' },
  { keys: ['H', 'L'], description: 'Atrás / adelante en el historial' },
  { keys: ['yy'], description: 'Copiar el link de la página' },
  { keys: ['/'], description: 'Buscar en la página' },
  { keys: ['⌘K'], description: 'Búsqueda global' },
  { keys: ['?'], description: 'Mostrar esta ayuda' },
];

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
 * Site-wide vim-style keyboard navigation: `j`/`k` scroll, `d`/`u` and `f`/`b` scroll by half
 * or whole pages, `gg`/`G` jump to the top/bottom, `H`/`L` walk the history, `yy` copies the
 * URL and `?` lists every shortcut. Inside a PCN OS window it drives that window's page.
 */
export function VimNavigation() {
  const [helpOpen, setHelpOpen] = useState(false);

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
        setHelpOpen(true);
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

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>atajos de teclado</DialogTitle>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-xs">
          {SHORTCUTS.map(({ keys, description }) => (
            <div key={description} className="contents">
              <dt className="flex gap-1">
                {keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </dt>
              <dd className="text-pcnGreen-700">{description}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
