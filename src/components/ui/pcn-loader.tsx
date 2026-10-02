'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Boot log lines cycled under the logo while the page loads. */
const BOOT_STEPS = [
  'resolviendo ruta',
  'abriendo socket',
  'compilando módulos',
  'descifrando payload',
  'hidratando componentes',
  'montando interfaz',
];

const HEX = '0123456789abcdef';

const randomHex = (length: number) =>
  Array.from({ length }, () => HEX[Math.floor(Math.random() * HEX.length)]).join('');

/**
 * Fake progress that never finishes on its own: it eases towards 99% so a slow page keeps
 * moving, and the loader simply disappears once the real page is ready.
 */
const useFakeProgress = () => {
  const [progress, setProgress] = useState(0);
  const [address, setAddress] = useState('00000000');

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(99, current + Math.max(0.4, (99 - current) * 0.03)));
      setAddress(randomHex(8));
    }, 70);
    return () => window.clearInterval(interval);
  }, []);

  return { progress: Math.floor(progress), address };
};

/**
 * The PCN logo booting up: the two chevrons slide in and lock together once, then the joined
 * logo turns a little with the same RGB glitch as the /proyectos titles, inside a spinning
 * targeting ring, while a scan beam sweeps it and a boot log counts up underneath. Everything
 * visual lives in the `.pcn-loader*` rules in globals.css.
 */
export function PcnLoader({ label, className }: { label?: string; className?: string }) {
  const { progress, address } = useFakeProgress();
  const step = BOOT_STEPS[Math.min(BOOT_STEPS.length - 1, Math.floor(progress / 17))];

  return (
    <div
      role="status"
      aria-label={label ? `Cargando ${label}` : 'Cargando'}
      className={cn('flex flex-col items-center gap-5 font-mono', className)}
    >
      <div aria-hidden className="pcn-loader">
        <span className="pcn-loader-core" />
        <span className="pcn-loader-ring" />
        <svg viewBox="0 0 100 100" className="pcn-loader-ticks">
          <circle cx="50" cy="50" r="47" />
        </svg>
        <span className="pcn-loader-orbit">
          <span />
        </span>
        <span className="pcn-loader-orbit pcn-loader-orbit--reverse">
          <span />
        </span>
        <span className="pcn-loader-logo">
          <img src="/logo.webp" alt="" className="pcn-loader-half pcn-loader-half--left" />
          <img src="/logo.webp" alt="" className="pcn-loader-half pcn-loader-half--right" />
          <img src="/logo.webp" alt="" className="pcn-loader-ghost pcn-loader-ghost--a" />
          <img src="/logo.webp" alt="" className="pcn-loader-ghost pcn-loader-ghost--b" />
          <span className="pcn-loader-beam" />
        </span>
      </div>

      <div aria-hidden className="flex w-56 flex-col gap-1.5 text-[10px] leading-none">
        <div className="flex items-center justify-between text-pcnGreen-700">
          <span className="cursor-blink text-pcnGreen">
            $ {label ? `open ${label}` : 'boot pcn'}
          </span>
          <span className="tabular-nums text-pcnGreen-500">0x{address}</span>
        </div>
        <div className="relative h-px overflow-hidden bg-pcnGreen-200">
          <span
            className="absolute inset-y-0 left-0 bg-pcnGreen shadow-[0_0_6px_#04f4be] transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-pcnGreen-600">
          <span>{step}…</span>
          <span className="tabular-nums text-pcnGreen">{String(progress).padStart(2, '0')}%</span>
        </div>
      </div>
    </div>
  );
}
