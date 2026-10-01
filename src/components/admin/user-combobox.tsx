'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  searchUsersForSpeaker,
  type SpeakerUserOption,
} from '@/actions/users/search-users-for-speaker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type UserOption = { id: string; name: string; image: string | null; email?: string };

interface UserComboboxProps<T extends UserOption> {
  onSelect: (_user: T) => void;
  // Server action that finds users; by default, the event managers' speaker search.
  search?: (_query: string) => Promise<T[]>;
  // Users already picked, left out of the results.
  excludeIds?: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const searchSpeakers = (query: string) => searchUsersForSpeaker(query, 8);

// A one-line `$ usuario…` prompt that searches platform users as you type (the search action
// checks who may) and lists matches in a small dropdown. Arrows + Enter pick one.
export function UserCombobox<T extends UserOption = SpeakerUserOption>({
  onSelect,
  search = searchSpeakers as unknown as (_query: string) => Promise<T[]>,
  excludeIds,
  placeholder = 'buscar usuario',
  disabled,
  className,
}: UserComboboxProps<T>) {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        setFound(await search(query));
        setHighlighted(0);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query, open, search]);

  const results = excludeIds ? found.filter((user) => !excludeIds.includes(user.id)) : found;

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const pick = (user: T) => {
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
