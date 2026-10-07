'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  CommunityMemberOption,
  searchCommunityMembers,
} from '@/actions/users/search-community-members';
import type { ProjectMemberFormData } from '@/schemas/project-schema';

type Props = {
  value: ProjectMemberFormData[];
  onChange: (_members: ProjectMemberFormData[]) => void;
  // Usuarios que no se pueden agregar como compañeros (el autor del proyecto).
  excludedUserIds?: string[];
  // Fotos de los compañeros ya cargados (modo edición).
  initialImages?: Record<string, string | null>;
};

function Avatar({ name, image, size }: { name: string; image: string | null; size: number }) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-muted text-[10px] font-medium uppercase text-muted-foreground"
      style={{ width: size, height: size }}
    >
      {name.charAt(0)}
    </div>
  );
}

export function CollaboratorsField({
  value,
  onChange,
  excludedUserIds = [],
  initialImages = {},
}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommunityMemberOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<Record<string, string | null>>(initialImages);
  const containerRef = useRef<HTMLDivElement>(null);

  const takenUserIds = new Set([
    ...excludedUserIds,
    ...value.map((member) => member.userId).filter((id): id is string => !!id),
  ]);
  const visibleResults = results.filter((user) => !takenUserIds.has(user.id));
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
        setResults(await searchCommunityMembers(trimmedQuery));
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

  function add(member: ProjectMemberFormData) {
    onChange([...value, member]);
    setQuery('');
    setResults([]);
  }

  function updateRole(index: number, role: string) {
    onChange(value.map((member, i) => (i === index ? { ...member, role } : member)));
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div ref={containerRef} className="relative space-y-2">
      {value.length > 0 && (
        <ul className="divide-y divide-dashed divide-pcnGreen-200 border border-dashed border-pcnGreen-200">
          {value.map((member, index) => (
            <li
              key={member.userId ?? `name-${index}`}
              className="flex items-center gap-2 px-2 py-1.5"
            >
              <Avatar
                name={member.memberName}
                image={member.userId ? (images[member.userId] ?? null) : null}
                size={22}
              />
              <span className="min-w-0 flex-1 truncate text-sm">
                {member.memberName}
                {!member.userId && (
                  <span className="text-xs text-muted-foreground"> (sin cuenta)</span>
                )}
              </span>
              <Input
                aria-label={`Rol de ${member.memberName}`}
                placeholder="Rol (opcional)"
                value={member.role ?? ''}
                maxLength={100}
                onChange={(e) => updateRole(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                className="h-8 w-40 shrink-0 text-xs sm:w-48"
              />
              <button
                type="button"
                aria-label={`Quitar a ${member.memberName}`}
                onClick={() => removeAt(index)}
                className="shrink-0 rounded-sm p-1 opacity-70 hover:bg-muted hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar compañeros por nombre..."
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
                onClick={() => {
                  setImages((prev) => ({ ...prev, [user.id]: user.image }));
                  add({ userId: user.id, memberName: user.name });
                }}
              >
                <Avatar name={user.name} image={user.image} size={28} />
                <span className="truncate font-medium">{user.name}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add({ userId: null, memberName: trimmedQuery })}
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="truncate">
                Agregar &quot;{trimmedQuery}&quot; (no tiene cuenta en PCN)
              </span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
