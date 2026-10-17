import { cn } from '@/lib/utils';

// Shared look for every text field (Input, Textarea and the Select trigger): a terminal prompt
// with mono text, a block caret, scanlines and lit corner brackets that locks on when focused
// (see `.field-surface` in globals.css). Layout lives here so callers can still override it.
export const fieldClassName = cn(
  'field-surface w-full rounded-sm border border-input px-3 py-2 text-[13px] text-foreground',
  'disabled:cursor-not-allowed disabled:opacity-60',
);

// Terminal checkbox for native `<input type="checkbox">`s.
export const checkboxClassName = 'field-check';
