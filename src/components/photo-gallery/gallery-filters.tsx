'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GalleryFilterOptions } from '@/lib/gallery';
import { GALLERY_TYPES, galleryQuery, isFiltered, type GalleryFilter } from '@/lib/gallery-filters';
import { cn } from '@/lib/utils';
import { EventOptionLabel } from '@/components/events/event-option-label';

const ALL = 'all';

function OptionName({ option }: { option: { name: string; date?: Date } }) {
  return option.date ? <EventOptionLabel name={option.name} date={option.date} /> : option.name;
}

// One select of the filter bar; picking "all" clears that filter.
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  // Events carry their date, shown next to the name so same-named events can be told apart.
  options: { id: string; name: string; count: number; date?: Date }[];
  onChange: (_value: string | undefined) => void;
}) {
  const selected = options.find((option) => option.id === value);
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? undefined : next)}
    >
      <SelectTrigger
        aria-label={`Filtrar por ${label}`}
        className={cn('h-8 w-full font-mono text-xs sm:w-56', selected && 'border-pcnGreen-500')}
      >
        <SelectValue>
          <span className="truncate">
            <span className="text-muted-foreground">{label}:</span>{' '}
            {selected ? <OptionName option={selected} /> : 'todos'}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL} className="font-mono text-xs">
          todos
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id} className="font-mono text-xs">
            <OptionName option={option} />{' '}
            <span className="text-muted-foreground">({option.count})</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// `[todo] fotos videos` + event and person selects. Every change is a navigation, so the
// filtered gallery has its own shareable URL.
export function GalleryFilters({
  filter,
  options,
}: {
  filter: GalleryFilter;
  options: GalleryFilterOptions;
}) {
  const router = useRouter();
  const go = (next: Partial<GalleryFilter>) =>
    router.push(`/galeria${galleryQuery({ ...filter, ...next })}`, { scroll: false });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <nav
        aria-label="Tipo"
        className="flex h-8 border border-pcnGreen-200 font-mono text-xs"
        role="group"
      >
        {GALLERY_TYPES.map(({ value, label }) => {
          const active = filter.type === value;
          return (
            <Link
              key={value}
              href={`/galeria${galleryQuery({ ...filter, type: value })}`}
              scroll={false}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center border-r border-pcnGreen-200 px-2.5 transition-colors last:border-r-0',
                active
                  ? 'bg-pcnGreen text-black'
                  : 'text-muted-foreground hover:bg-pcnGreen/[0.06] hover:text-pcnGreen',
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <FilterSelect
        label="evento"
        value={filter.eventId}
        options={options.events}
        onChange={(eventId) => go({ eventId })}
      />
      <FilterSelect
        label="persona"
        value={filter.userId}
        options={options.people}
        onChange={(userId) => go({ userId })}
      />

      {isFiltered(filter) && (
        <Link
          href="/galeria"
          scroll={false}
          className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="size-3" />
          limpiar filtros
        </Link>
      )}
    </div>
  );
}
