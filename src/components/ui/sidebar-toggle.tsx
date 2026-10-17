'use client';

import { useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useSearchShortcutLabel } from '@/components/search/global-search';
import { cn } from '@/lib/utils';

/**
 * The classic layout's show/hide sidebar control, as a tiny terminal widget: a drawing of the
 * window whose side panel slides open or shut with the sidebar, a `$ sidebar --hide` flag typed
 * out on hover and a glitch when pressed. ⌘B / Ctrl+B toggles it too.
 */
export function SidebarToggle({ className }: { className?: string }) {
  const { open, toggleSidebar } = useSidebar();
  const [glitching, setGlitching] = useState(false);
  // `⌘K` → `⌘B`: same modifier as the search shortcut.
  const shortcut = useSearchShortcutLabel().replace('K', 'B');
  const label = open ? 'Ocultar barra lateral' : 'Mostrar barra lateral';

  return (
    <button
      type="button"
      data-sidebar="trigger"
      aria-label={label}
      aria-expanded={open}
      title={`${label} (${shortcut})`}
      onClick={() => {
        toggleSidebar();
        setGlitching(true);
      }}
      onAnimationEnd={() => setGlitching(false)}
      className={cn(
        'group/toggle relative flex h-7 shrink-0 items-center overflow-hidden rounded-sm border border-pcnGreen-300 bg-black/60 px-1.5 font-mono text-[11px] text-pcnGreen-600 outline-hidden transition-[border-color,box-shadow,color] duration-200',
        'hover:border-pcnGreen hover:text-pcnGreen hover:shadow-[0_0_14px_-4px_rgba(4,244,190,0.7)] focus-visible:border-pcnGreen focus-visible:text-pcnGreen',
        glitching && 'sidebar-toggle-glitch',
        className,
      )}
    >
      {/* A window with its side panel, drawn in the terminal's green. The label's spacing is a
          margin that only opens with it, so the closed button stays centered on the icon. */}
      <span
        aria-hidden
        className="relative flex h-3.5 w-[18px] shrink-0 overflow-hidden rounded-[2px] border border-current"
      >
        <span
          className={cn(
            'h-full border-r border-current bg-pcnGreen/40 transition-[width] duration-300 ease-out',
            open ? 'w-[7px]' : 'w-0 border-r-0',
          )}
        />
        <span className="mt-0.5 mr-0.5 ml-auto size-[3px] animate-pulse bg-current" />
      </span>
      <span
        aria-hidden
        className="max-w-0 overflow-hidden whitespace-nowrap transition-[max-width,margin] duration-300 ease-out group-hover/toggle:ml-1.5 group-hover/toggle:max-w-[16ch] group-focus-visible/toggle:ml-1.5 group-focus-visible/toggle:max-w-[16ch]"
      >
        <span className="text-pcnGreen-500">$ </span>
        sidebar {open ? '--hide' : '--show'}
      </span>
    </button>
  );
}
