'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

const SUGGESTIONS = [
  { command: 'cd ~', href: '/', label: 'volver al inicio' },
  { command: 'cd ~/eventos', href: '/eventos', label: 'ver los próximos eventos' },
  { command: 'cd ~/cursos', href: '/cursos', label: 'explorar los cursos' },
];

interface TerminalErrorScreenProps {
  /** Exit status shown in the corner, e.g. `404` or `500`. */
  code: string;
  /** The command the visitor "ran". */
  command: string;
  /** stderr lines printed under the command. */
  output: string[];
  /** Extra actions rendered before the suggested `cd` commands. */
  action?: ReactNode;
}

// Full-panel error rendered as a failed shell session: the command, its stderr, and a few
// `cd` commands that link back into the site.
export const TerminalErrorScreen = ({
  code,
  command,
  output,
  action,
}: TerminalErrorScreenProps) => (
  <div className="flex flex-1 items-center justify-center p-4 py-16 font-mono">
    <section className="w-full max-w-xl border border-pcnGreen-300 bg-black/60 shadow-[0_0_48px_-16px_rgba(4,244,190,0.45)]">
      <header className="flex items-center justify-between border-b border-dashed border-pcnGreen-200 px-3 py-2 text-xs">
        <span className="text-pcnGreen-500">pcn@programaconnosotros: ~</span>
        <span className="tabular-nums text-red-400">[exit {code}]</span>
      </header>

      <div className="flex flex-col gap-4 p-4 text-sm sm:p-6">
        <div>
          <p className="break-all">
            <span className="text-pcnGreen-600">$ </span>
            {command}
          </p>
          {output.map((line) => (
            <p key={line} className="break-all text-red-400/90">
              {line}
            </p>
          ))}
        </div>

        <p className="text-glow text-6xl font-bold tabular-nums text-pcnGreen sm:text-7xl">
          {code}
        </p>

        {action}

        <ul className="flex flex-col gap-1 border-t border-dashed border-pcnGreen-200 pt-4 text-xs">
          <li className="text-muted-foreground"># probá con alguno de estos:</li>
          {SUGGESTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex gap-3 transition-colors hover:bg-pcnGreen/[0.06]"
              >
                <span className="group-hover:text-glow text-pcnGreen">
                  <span className="text-pcnGreen-600">$ </span>
                  {s.command}
                </span>
                <span className="text-muted-foreground"># {s.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="cursor-blink text-pcnGreen-600">$</p>
      </div>
    </section>
  </div>
);
