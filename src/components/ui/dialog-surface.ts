import { cn } from '@/lib/utils';

// Shared look for every modal (Dialog and AlertDialog). Radix only provides the behaviour
// (focus trap, escape, scroll lock, aria); everything visual lives here and in the
// `.dialog-surface` / `.dialog-overlay` rules in globals.css.

// A dimmed backdrop with faint scanlines and a vignette that fades in behind the panel.
export const dialogOverlayClassName = 'dialog-overlay fixed inset-0 z-50 backdrop-blur-[3px]';

// A dark glass terminal panel with four lit corner brackets and scanlines (drawn as fixed
// backgrounds so they stay put while the panel scrolls) that switches on like a CRT: a bright
// horizontal line that snaps open vertically, then a scan beam sweeps down once.
export const dialogContentClassName = cn(
  'dialog-surface fixed left-1/2 top-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-sm border border-pcnGreen-400 p-6 font-mono backdrop-blur-xl',
  'shadow-[inset_0_1px_0_rgba(4,244,190,0.45),0_24px_60px_-16px_rgba(0,0,0,0.95),0_0_48px_-12px_rgba(4,244,190,0.55)]',
  'focus-visible:outline-none',
);

// Header: title reads as a prompt, with a dashed rule separating it from the body.
export const dialogHeaderClassName =
  'flex flex-col gap-1.5 border-b border-dashed border-pcnGreen-200 pb-3 pr-10 text-left';

export const dialogFooterClassName =
  'flex flex-col-reverse gap-2 border-t border-dashed border-pcnGreen-200 pt-4 sm:flex-row sm:justify-end';

export const dialogTitleClassName = cn(
  'font-mono text-base font-semibold leading-snug tracking-tight text-pcnGreen text-glow',
  "before:mr-2 before:text-pcnGreen-500 before:content-['>']",
);

export const dialogDescriptionClassName = 'font-mono text-xs leading-relaxed text-pcnGreen-700';

// Square key-cap that closes the dialog; its X spins a quarter turn on hover. It stays the
// content's last direct child <button> so callers can restyle or hide it with
// `[&>button:last-child]` / `[&>button]` selectors.
export const dialogCloseClassName = cn(
  'group absolute right-3 top-3 flex size-7 items-center justify-center rounded-sm border border-pcnGreen-200 bg-black/70 text-pcnGreen-600 transition-all',
  'hover:border-pcnGreen hover:text-pcnGreen hover:shadow-[0_0_14px_-2px_rgba(4,244,190,0.7)]',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen',
  'disabled:pointer-events-none',
);
