'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, X } from 'lucide-react';
import {
  SpeakerUserOption,
  getUserForSpeaker,
  searchUsersForSpeaker,
} from '@/actions/users/search-users-for-speaker';
import Image from 'next/image';

type Props = {
  value: string | null;
  onSelect: (user: SpeakerUserOption | null) => void;
};

export function SpeakerUserPicker({ value, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpeakerUserOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<SpeakerUserOption | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolve existing speakerId on mount (edit mode)
  useEffect(() => {
    if (!value) return;
    getUserForSpeaker(value).then((user) => {
      if (user) setSelected(user);
    });
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!isOpen) return;
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const users = await searchUsersForSpeaker(query);
        setResults(users);
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSelect(user: SpeakerUserOption) {
    setSelected(user);
    onSelect(user);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }

  function handleClear() {
    setSelected(null);
    onSelect(null);
    setQuery('');
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      {selected && (
        <div className="flex items-center gap-3 rounded-md border border-input bg-muted/40 px-3 py-2">
          {selected.image ? (
            <Image
              src={selected.image}
              alt={selected.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase text-muted-foreground">
              {selected.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selected.name}</p>
            <p className="truncate text-xs text-muted-foreground">{selected.email}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!selected && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={query}
            className="pl-9"
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {isOpen && !selected && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-md">
          {results.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(user)}
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase text-muted-foreground">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !selected && !isLoading && query.length > 0 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background px-3 py-2 shadow-md">
          <p className="text-sm text-muted-foreground">Sin resultados para &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
