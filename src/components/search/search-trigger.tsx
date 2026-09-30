'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { openGlobalSearch, useSearchShortcutLabel } from './global-search';

/** A fake prompt that opens the global search, with the keyboard shortcut as a hint. */
export function SearchTrigger({ className }: { className?: string }) {
  const shortcutLabel = useSearchShortcutLabel();

  return (
    <button
      type="button"
      onClick={() => openGlobalSearch()}
      className={cn(
        'flex h-8 w-full items-center gap-2 rounded-sm border border-pcnGreen-200 bg-black/40 px-2.5 font-mono text-xs text-muted-foreground transition-all hover:border-pcnGreen-600 hover:text-foreground hover:shadow-[0_0_18px_-6px_rgba(4,244,190,0.6)]',
        className,
      )}
    >
      <Search className="size-3.5 shrink-0 text-pcnGreen-600" />
      <span className="flex-1 truncate text-left">buscar en el sitio…</span>
      <kbd className="shrink-0 rounded-sm border border-pcnGreen-200 px-1 text-[10px] text-pcnGreen-600">
        {shortcutLabel}
      </kbd>
    </button>
  );
}
