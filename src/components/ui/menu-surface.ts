import { cn } from '@/lib/utils';

// Shared look for every floating menu (dropdowns, submenus and selects): a dark glass panel
// with scanlines and lit corner brackets that boots open like a CRT (see `.menu-surface` in
// globals.css) while its items stream in one after another.
export const menuContentClassName = cn(
  'menu-surface relative z-50 min-w-[8rem] overflow-hidden rounded-sm border border-pcnGreen-400 p-1 font-mono text-popover-foreground backdrop-blur-xl',
  'bg-black/90 bg-[repeating-linear-gradient(0deg,rgba(4,244,190,0.03)_0_1px,transparent_1px_3px)]',
  'shadow-[inset_0_1px_0_rgba(4,244,190,0.45),0_18px_40px_-12px_rgba(0,0,0,0.95),0_0_32px_-10px_rgba(4,244,190,0.6)]',
  'before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-10 before:size-2 before:border-l-2 before:border-t-2 before:border-pcnGreen',
  'after:pointer-events-none after:absolute after:bottom-0 after:right-0 after:z-10 after:size-2 after:border-b-2 after:border-r-2 after:border-pcnGreen',
);

// The highlighted item lights a glowing bar on its left edge and fades a green trail behind it.
export const menuItemClassName = cn(
  'relative flex cursor-default select-none items-center rounded-none px-2 py-1.5 text-[13px] outline-none transition-colors duration-150',
  'before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:origin-center before:scale-y-0 before:bg-pcnGreen before:shadow-[0_0_8px_rgba(4,244,190,0.9)] before:transition-transform before:duration-200',
  'focus:bg-gradient-to-r focus:from-pcnGreen/20 focus:via-pcnGreen/[0.06] focus:to-transparent focus:text-pcnGreen focus:text-glow focus:before:scale-y-100',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
);

export const menuSeparatorClassName =
  '-mx-1 my-1 h-px bg-gradient-to-r from-transparent via-pcnGreen-500 to-transparent';
