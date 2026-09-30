'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search } from 'lucide-react';
import { AppIcon } from './app-icon';
import { OS_APP_GROUPS, type OsApp } from './apps';

interface OsLauncherProps {
  open: boolean;
  apps: OsApp[];
  onOpenApp: (app: OsApp) => void;
  onClose: () => void;
}

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Full-screen grid with every app, grouped like the classic sidebar and searchable. */
export function OsLauncher({ open, apps, onOpenApp, onClose }: OsLauncherProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const matches = apps.filter((app) => normalize(app.name).includes(normalize(query.trim())));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Todas las apps"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-[6000] overflow-y-auto bg-black/80 px-10 pb-32 pt-16 font-mono backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 1.04 }}
            animate={{ scale: 1 }}
            exit={{ scale: 1.04 }}
            transition={{ duration: 0.18 }}
            className="mx-auto flex max-w-4xl flex-col gap-10"
          >
            <label
              onClick={(e) => e.stopPropagation()}
              className="mx-auto flex w-full max-w-sm items-center gap-2 rounded-sm border border-pcnGreen-400 bg-black/80 px-3 py-1.5 text-sm text-pcnGreen shadow-[0_0_24px_-8px_#04f4be99] focus-within:border-pcnGreen"
            >
              <span className="select-none text-pcnGreen-700">$</span>
              <Search className="size-4 text-pcnGreen-600" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && matches[0]) onOpenApp(matches[0]);
                }}
                placeholder="buscar apps…"
                className="w-full bg-transparent outline-none placeholder:text-pcnGreen-500"
              />
            </label>

            {OS_APP_GROUPS.map((group) => {
              const groupApps = matches.filter((app) => app.group === group);
              if (groupApps.length === 0) return null;
              return (
                <section key={group} className="flex flex-col gap-4">
                  <h2 className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-pcnGreen-600">
                    <span className="text-pcnGreen-400">##</span>
                    {group}
                    <span aria-hidden className="h-px flex-1 bg-pcnGreen-200" />
                  </h2>
                  <div className="grid grid-cols-6 gap-y-6">
                    {groupApps.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenApp(app);
                        }}
                        className="group flex flex-col items-center gap-2 rounded-md p-2 outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen"
                      >
                        <AppIcon app={app} className="size-16" />
                        <span className="text-center text-xs lowercase text-pcnGreen-700 transition-colors group-hover:text-pcnGreen">
                          {app.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}

            {matches.length === 0 && (
              <p className="text-center text-sm text-pcnGreen-600">
                <span className="text-red-400">error:</span> no hay apps que coincidan con “{query}
                ”.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
