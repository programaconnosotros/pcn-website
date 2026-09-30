'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  searchUsersForSpeaker,
  type SpeakerUserOption,
} from '@/actions/users/search-users-for-speaker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserComboboxProps {
  onSelect: (_user: SpeakerUserOption) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// A one-line `$ usuario…` prompt that searches platform users as you type (admins only, the
// search action checks it) and lists matches in a small dropdown. Arrows + Enter pick one.
export function UserCombobox({
  onSelect,
  placeholder = 'buscar usuario',
  disabled,
  className,
}: UserComboboxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpeakerUserOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchUsersForSpeaker(query, 8));
        setHighlighted(0);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query, open]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const pick = (user: SpeakerUserOption) => {
    onSelect(user);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <label className="flex h-7 items-center gap-1.5 rounded-sm border border-pcnGreen-200 bg-black/40 px-2 font-mono text-xs focus-within:border-pcnGreen-600">
        <span aria-hidden className="text-pcnGreen-600">
          $
        </span>
        <input
          value={query}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setHighlighted((index) => Math.min(index + 1, results.length - 1));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setHighlighted((index) => Math.max(index - 1, 0));
            } else if (event.key === 'Enter' && results[highlighted]) {
              event.preventDefault();
              pick(results[highlighted]);
            } else if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          spellCheck={false}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-pcnGreen outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
        />
        {loading && <Loader2 className="size-3 animate-spin text-pcnGreen-600" />}
      </label>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-sm border border-pcnGreen-400 bg-background/95 py-1 shadow-[0_0_24px_-8px_rgba(4,244,190,0.6)] backdrop-blur"
        >
          {results.map((user, index) => (
            <li key={user.id} role="option" aria-selected={index === highlighted}>
              <button
                type="button"
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => pick(user)}
                onMouseEnter={() => setHighlighted(index)}
                className={cn(
                  'flex w-full items-center gap-2 px-2 py-1 text-left font-mono text-xs',
                  index === highlighted && 'bg-pcnGreen/10 text-pcnGreen',
                )}
              >
                <Avatar className="size-5 rounded-sm">
                  <AvatarImage src={user.image ?? undefined} alt="" />
                  <AvatarFallback className="rounded-sm text-[9px]">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{user.name}</span>
                <span className="ml-auto truncate text-[10px] text-muted-foreground">
                  {user.email}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
