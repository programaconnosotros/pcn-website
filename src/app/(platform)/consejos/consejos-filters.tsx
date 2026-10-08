'use client';

import { CollapsibleFilters } from '@/components/ui/collapsible-filters';
import { SearchBar } from '@/components/ui/search-bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEFAULT_CONSEJO_FILTERS,
  type ConsejoFilters,
  type ConsejoOrigin,
  type ConsejoSort,
} from '@/lib/consejos';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const ALL = '__all__';

const ORIGINS: { value: ConsejoOrigin; label: string; title: string }[] = [
  { value: 'todos', label: 'todos', title: 'Todos los consejos' },
  { value: 'manual', label: 'manual', title: 'Publicados por su autor' },
  { value: 'auto', label: 'auto', title: 'Auto-extraídos de conversaciones' },
];

const SORTS: { value: ConsejoSort; label: string }[] = [
  { value: 'recientes', label: 'recientes' },
  { value: 'antiguos', label: 'antiguos' },
  { value: 'likes', label: 'likes' },
  { value: 'comentados', label: 'comentados' },
];

export type FilterOption = { value: string; label: string; count: number };

interface ConsejosFiltersProps {
  filters: ConsejoFilters;
  onChange: (_filters: ConsejoFilters) => void;
  topics: FilterOption[];
  authors: FilterOption[];
  results: number;
  total: number;
}

const triggerClassName = 'h-8 font-mono text-xs';

// The header row: `$ grep` always visible, then tema / autor / origen / orden. On phones those
// fold behind the shared `filtros` toggle so the sticky header stays one line tall.
export function ConsejosFilters({
  filters,
  onChange,
  topics,
  authors,
  results,
  total,
}: ConsejosFiltersProps) {
  const set = (patch: Partial<ConsejoFilters>) => onChange({ ...filters, ...patch });

  const activeCount = [
    filters.topic,
    filters.author,
    filters.origin !== 'todos',
    filters.sort !== 'recientes',
  ].filter(Boolean).length;
  const isFiltering = activeCount > 0 || filters.query.trim() !== '';

  return (
    <CollapsibleFilters
      className="mb-4"
      panelClassName="max-md:*:grow max-md:*:basis-[calc(50%-0.25rem)]"
      activeCount={activeCount}
      search={
        <SearchBar
          searchQuery={filters.query}
          setSearchQuery={(query) => set({ query })}
          placeholder="texto o autor"
          label="Buscar consejos por texto o autor"
          className="min-w-0 flex-1 md:w-56 md:flex-none"
        />
      }
      aside={
        <p className="font-mono text-xs text-muted-foreground tabular-nums" aria-live="polite">
          <span className={cn(isFiltering ? 'text-pcnGreen' : 'text-foreground')}>{results}</span>/
          {total}
          <span className="max-sm:hidden"> resultados</span>
        </p>
      }
    >
      <Select
        value={filters.topic ?? ALL}
        onValueChange={(value) => set({ topic: value === ALL ? null : value })}
      >
        <SelectTrigger className={cn(triggerClassName, 'md:w-[150px]')} aria-label="Tema">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>--tema=*</SelectItem>
          {topics.map((topic) => (
            <SelectItem key={topic.value} value={topic.value}>
              #{topic.label} <span className="text-muted-foreground">{topic.count}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.author ?? ALL}
        onValueChange={(value) => set({ author: value === ALL ? null : value })}
      >
        <SelectTrigger className={cn(triggerClassName, 'md:w-[170px]')} aria-label="Autor">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>--autor=*</SelectItem>
          {authors.map((author) => (
            <SelectItem key={author.value} value={author.value}>
              @{author.label} <span className="text-muted-foreground">{author.count}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div
        role="radiogroup"
        aria-label="Origen"
        className="flex h-8 items-stretch overflow-hidden rounded-sm border border-pcnGreen-200 font-mono text-[11px]"
      >
        {ORIGINS.map((origin) => (
          <button
            key={origin.value}
            type="button"
            role="radio"
            aria-checked={filters.origin === origin.value}
            title={origin.title}
            onClick={() => set({ origin: origin.value })}
            className={cn(
              'flex-1 px-2.5 transition-colors not-first:border-l [&:not(:first-child)]:border-pcnGreen-200',
              filters.origin === origin.value
                ? 'bg-pcnGreen/10 text-pcnGreen shadow-[inset_0_0_12px_-4px_rgba(4,244,190,0.6)]'
                : 'text-muted-foreground hover:text-pcnGreen',
            )}
          >
            {origin.label}
          </button>
        ))}
      </div>

      <Select value={filters.sort} onValueChange={(value) => set({ sort: value as ConsejoSort })}>
        <SelectTrigger className={cn(triggerClassName, 'md:w-[170px]')} aria-label="Orden">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORTS.map((sort) => (
            <SelectItem key={sort.value} value={sort.value}>
              --sort={sort.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isFiltering && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_CONSEJO_FILTERS)}
          className="flex h-8 items-center gap-1.5 rounded-sm border border-pcnGreen-200 px-2.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-pcnGreen-600 hover:text-pcnGreen"
        >
          <X className="size-3.5" />
          reset
        </button>
      )}
    </CollapsibleFilters>
  );
}
