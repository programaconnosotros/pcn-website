'use client';

import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

type ScrollHudButtonProps = {
  onClick: () => void;
  label: string;
  code: string;
  icon: ReactNode;
  // 0–1; renders a thin progress rail along the bottom edge.
  progress?: number;
  className?: string;
};

const corners = [
  'left-0 top-0 border-l border-t group-hover:-translate-x-0.5 group-hover:-translate-y-0.5',
  'right-0 top-0 border-r border-t group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
  'bottom-0 left-0 border-b border-l group-hover:-translate-x-0.5 group-hover:translate-y-0.5',
  'bottom-0 right-0 border-b border-r group-hover:translate-x-0.5 group-hover:translate-y-0.5',
];

// Compact terminal/HUD-style floating control shared by the scroll up/down buttons.
export const ScrollHudButton = ({
  onClick,
  label,
  code,
  icon,
  progress,
  className,
}: ScrollHudButtonProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className={cn(
      'fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-50 embedded:bottom-4 md:bottom-6 md:right-6',
      className,
    )}
  >
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group relative flex h-9 w-9 items-center justify-center overflow-hidden bg-background/70 text-pcnPurple outline-none ring-1 ring-pcnPurple/25 backdrop-blur-md transition-[box-shadow,color] duration-200 hover:shadow-[0_0_18px_-2px_rgba(80,56,189,0.5)] hover:ring-pcnPurple/60 focus-visible:ring-2 focus-visible:ring-pcnPurple dark:text-pcnGreen dark:ring-pcnGreen/25 dark:hover:shadow-[0_0_18px_-2px_rgba(4,244,190,0.45)] dark:hover:ring-pcnGreen/60 dark:focus-visible:ring-pcnGreen"
    >
      {/* scanlines */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_3px)] opacity-[0.07]"
      />
      {/* sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-full h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-0 transition-none group-hover:top-full group-hover:opacity-20 group-hover:transition-[top,opacity] group-hover:duration-500"
      />
      {/* HUD corner brackets */}
      {corners.map((c) => (
        <span
          key={c}
          aria-hidden
          className={cn(
            'pointer-events-none absolute h-2 w-2 border-current transition-transform duration-200',
            c,
          )}
        />
      ))}
      {/* status code */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1 top-0.5 font-mono text-[6px] leading-none tracking-wider opacity-60"
      >
        {code}
      </span>
      <span className="relative transition-transform duration-200 group-active:scale-90">
        {icon}
      </span>
      {progress !== undefined && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-px bg-current shadow-[0_0_4px_currentColor]"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      )}
    </button>
  </motion.div>
);
