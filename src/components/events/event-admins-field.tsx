'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { searchAmbassadors } from '@/actions/users/search-ambassadors';
import type { CommunityMemberOption } from '@/actions/users/search-community-members';

type Props = {
  value: string[];
  onChange: (_adminIds: string[]) => void;
  // Datos de los administradores ya cargados (modo edición).
  initialAdmins?: CommunityMemberOption[];
  // Usuarios que no se pueden agregar (quien creó el evento ya lo administra).
  excludedUserIds?: string[];
};

const MemberAvatar = ({ user, size }: { user: CommunityMemberOption; size: string }) => (
  <Avatar className={`${size} rounded-sm`}>
    <AvatarImage src={user.image ?? undefined} alt="" />
    <AvatarFallback className="rounded-sm text-[10px] uppercase">
      {user.name.charAt(0)}
    </AvatarFallback>
  </Avatar>
);

// Buscador de ambassadors para asignarlos como administradores de un evento.
export function EventAdminsField({
  value,
  onChange,
  initialAdmins = [],
  excludedUserIds = [],
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommunityMemberOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [known, setKnown] = useState<Record<string, CommunityMemberOption>>(() =>
    Object.fromEntries(initialAdmins.map((user) => [user.id, user])),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const taken = new Set([...excludedUserIds, ...value]);
  const visibleResults = results.filter((user) => !taken.has(user.id));
  const trimmedQuery = query.trim();

  // Búsqueda con debounce
  useEffect(() => {
    if (!isOpen || trimmedQuery.length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        setResults(await searchAmbassadors(trimmedQuery));
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [trimmedQuery, isOpen]);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function add(user: CommunityMemberOption) {
    setKnown((prev) => ({ ...prev, [user.id]: user }));
    onChange([...value, user.id]);
    setQuery('');
    setResults([]);
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      {value.length > 0 && (
        <ul className="divide-y divide-dashed divide-pcnGreen-200 border border-dashed border-pcnGreen-200">
          {value.map((id) => {
            const user = known[id] ?? { id, name: 'Usuario', image: null };
            return (
              <li key={id} className="flex items-center gap-2 px-2 py-1.5">
                <MemberAvatar user={user} size="size-[22px]" />
                <span className="min-w-0 flex-1 truncate text-sm">{user.name}</span>
                <button
                  type="button"
                  aria-label={`Quitar a ${user.name}`}
                  onClick={() => onChange(value.filter((adminId) => adminId !== id))}
                  className="shrink-0 rounded-sm p-1 opacity-70 hover:bg-muted hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar ambassadors por nombre..."
          value={query}
          className="pl-9"
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            // Enter no debe enviar el formulario desde el buscador
            if (e.key === 'Enter') e.preventDefault();
          }}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && trimmedQuery.length >= 2 && !isLoading && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background shadow-md">
          {visibleResults.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(user)}
              >
                <MemberAvatar user={user} size="size-7" />
                <span className="truncate font-medium">{user.name}</span>
              </button>
            </li>
          ))}
          {visibleResults.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No hay ambassadors con ese nombre.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
