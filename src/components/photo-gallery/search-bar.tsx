'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (_query: string) => void;
  placeholder?: string;
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// A shell prompt (`$ grep`) instead of a boxed input. `/` focuses it from anywhere on the page
// and Escape clears it.
export function SearchBar({
  searchQuery,
  setSearchQuery,
  placeholder = 'Buscar fotos...',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <label className="flex h-9 w-full max-w-md cursor-text items-center gap-2 rounded-sm border border-pcnGreen-200 bg-black/40 px-3 font-mono text-sm transition-all focus-within:border-pcnGreen-600 focus-within:shadow-[0_0_18px_-6px_rgba(4,244,190,0.6)]">
      <span aria-hidden className="shrink-0 select-none text-pcnGreen-600">
        $ grep -i
      </span>
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
        placeholder={placeholder}
        aria-label="Buscar fotos"
        spellCheck={false}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-pcnGreen caret-pcnGreen outline-none placeholder:text-muted-foreground/60"
      />
      {searchQuery ? (
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            inputRef.current?.focus();
          }}
          className="shrink-0 text-muted-foreground transition-colors hover:text-pcnGreen"
        >
          <X className="size-4" />
          <span className="sr-only">Limpiar búsqueda</span>
        </button>
      ) : (
        <kbd className="shrink-0 rounded-sm border border-pcnGreen-200 px-1.5 text-[10px] leading-4 text-muted-foreground max-sm:hidden">
          /
        </kbd>
      )}
    </label>
  );
}
