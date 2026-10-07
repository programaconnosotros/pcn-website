'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { SHORTCUT_GROUPS, filterShortcuts, keyLabel } from './shortcuts';

const OPEN_SHORTCUTS_EVENT = 'pcn:open-shortcuts';

/** Opens the keyboard shortcuts dialog from anywhere (a menu item, a button…). */
export const openShortcutsDialog = () => window.dispatchEvent(new Event(OPEN_SHORTCUTS_EVENT));

const noopSubscribe = () => () => {};
const useIsApple = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );

const Kbd = ({ children, wide }: { children: React.ReactNode; wide?: boolean }) => (
  <kbd
    className={cn(
      'inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-b-2 border-pcnGreen-300 bg-black px-1 font-mono text-[10px] text-pcnGreen',
      wide && 'px-1.5',
    )}
  >
    {children}
  </kbd>
);

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  /** Classes for the modal's layers, e.g. to sit above PCN OS windows. */
  layerClassName?: string;
}

/** Every keyboard shortcut of the site, grouped and filterable, like `man pcn`. */
export function ShortcutsDialog({ open, onOpenChange, layerClassName }: ShortcutsDialogProps) {
  const apple = useIsApple();
  const [query, setQuery] = useState('');
  const groups = filterShortcuts(SHORTCUT_GROUPS, query);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery('');
        onOpenChange(next);
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        overlayClassName={layerClassName}
        className={cn('max-w-xl gap-3', layerClassName)}
      >
        <DialogHeader>
          <DialogTitle>atajos de teclado</DialogTitle>
          <p className="text-[11px] text-muted-foreground">
            $ man pcn · apretá <Kbd>?</Kbd> en cualquier página para volver acá
          </p>
        </DialogHeader>

        <label className="flex h-8 items-center gap-2 rounded-sm border border-pcnGreen-300 bg-black/60 px-2 text-xs focus-within:border-pcnGreen-600">
          <span className="text-pcnGreen">$ grep -i</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="atajo, tecla o acción…"
            aria-label="Filtrar atajos"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-foreground caret-pcnGreen outline-none placeholder:text-foreground/25"
          />
        </label>

        <div className="flex max-h-[min(60vh,32rem)] flex-col gap-4 overflow-y-auto pr-1">
          {groups.length === 0 && (
            <p className="py-4 text-xs text-red-400/90">
              grep: ‘{query.trim()}’: sin coincidencias
            </p>
          )}
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`shortcuts-${group.id}`}>
              <h3
                id={`shortcuts-${group.id}`}
                className="mb-1.5 flex items-baseline gap-2 text-[10px] uppercase tracking-[0.2em] text-pcnGreen-600"
              >
                <span className="text-pcnGreen-300">{'//'}</span>
                {group.title}
                {group.scope && (
                  <span className="normal-case tracking-normal text-muted-foreground">
                    · {group.scope}
                  </span>
                )}
              </h3>
              <dl className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={`${group.id}-${shortcut.description}`}
                    className="flex items-center justify-between gap-4 px-3 py-1.5"
                  >
                    <dt className="order-last flex shrink-0 items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <Kbd key={key} wide={key.length > 1}>
                          {keyLabel(key, apple)}
                        </Kbd>
                      ))}
                    </dt>
                    <dd className="text-xs text-foreground/85">{shortcut.description}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The shortcuts dialog wired to `openShortcutsDialog()`. VimNavigation opens it with `?`.
 */
export function GlobalShortcutsDialog({ layerClassName }: { layerClassName?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_SHORTCUTS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SHORTCUTS_EVENT, onOpen);
  }, []);
  return <ShortcutsDialog open={open} onOpenChange={setOpen} layerClassName={layerClassName} />;
}
