'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { ProgramIcon } from './program-icon';
import { OS_PROGRAM_GROUPS, type OsProgram } from './programs';

interface OsLauncherProps {
  open: boolean;
  programs: OsProgram[];
  onOpenProgram: (_program: OsProgram) => void;
  onClose: () => void;
}

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Full-screen grid with every program, grouped like the classic sidebar and searchable. */
export function OsLauncher({ open, programs, onOpenProgram, onClose }: OsLauncherProps) {
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

  const matches = programs.filter((program) =>
    normalize(program.name).includes(normalize(query.trim())),
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label="Todos los programas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-6000 overflow-y-auto bg-black/80 px-10 pt-16 pb-32 font-mono backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Salir"
            className="fixed top-10 right-4 z-10 flex group items-center gap-2 border border-pcnGreen-300 bg-black/80 px-2.5 py-1 text-xs text-pcnGreen-700 outline-hidden transition-all duration-200 [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,6px_100%,0_calc(100%-6px))] hover:border-red-500 hover:bg-red-500 hover:text-black hover:shadow-[0_0_14px_#ef4444] focus-visible:border-pcnGreen"
          >
            <span className="text-pcnGreen-500 group-hover:text-black">[esc]</span>
            salir
            <X className="size-3.5 transition-transform duration-200 group-hover:rotate-90" />
          </button>

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
              <span className="text-pcnGreen-700 select-none">$</span>
              <Search className="size-4 text-pcnGreen-600" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && matches[0]) onOpenProgram(matches[0]);
                }}
                placeholder="buscar programas…"
                className="w-full bg-transparent outline-hidden placeholder:text-pcnGreen-500"
              />
            </label>

            {OS_PROGRAM_GROUPS.map((group) => {
              const groupPrograms = matches.filter((program) => program.group === group);
              if (groupPrograms.length === 0) return null;
              return (
                <section key={group} className="flex flex-col gap-4">
                  <h2 className="flex items-center gap-3 text-xs tracking-[0.2em] text-pcnGreen-600 uppercase">
                    <span className="text-pcnGreen-400">##</span>
                    {group}
                    <span aria-hidden className="h-px flex-1 bg-pcnGreen-200" />
                  </h2>
                  <div className="grid grid-cols-6 gap-y-6">
                    {groupPrograms.map((program) => (
                      <button
                        key={program.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProgram(program);
                        }}
                        className="flex group flex-col items-center gap-2 rounded-md p-2 outline-hidden focus-visible:ring-1 focus-visible:ring-pcnGreen"
                      >
                        <ProgramIcon program={program} className="size-16" />
                        <span className="text-center text-xs text-pcnGreen-700 lowercase transition-colors group-hover:text-pcnGreen">
                          {program.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}

            {matches.length === 0 && (
              <p className="text-center text-sm text-pcnGreen-600">
                <span className="text-red-400">error:</span> no hay programas que coincidan con “
                {query}
                ”.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
