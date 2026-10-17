'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventOptionLabel } from '@/components/events/event-option-label';

export type EventOption = { id: string; name: string; date: Date; endDate?: Date | null };

const NONE = 'none';

// Picks the event a photo is from (or none), newest events first.
export function PhotoEventSelect({
  events,
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: {
  events: EventOption[];
  value: string | null;
  onChange: (_eventId: string | null) => void;
  disabled?: boolean;
  'aria-label'?: string;
}) {
  const selected = events.find((event) => event.id === value);

  return (
    <Select
      value={value ?? NONE}
      onValueChange={(next) => onChange(next === NONE ? null : next)}
      disabled={disabled}
    >
      <SelectTrigger className="font-mono text-xs" aria-label={ariaLabel}>
        <SelectValue>
          <span className="truncate">
            {selected ? (
              <EventOptionLabel name={selected.name} date={selected.date} />
            ) : (
              'sin evento'
            )}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE} className="font-mono text-xs">
          sin evento
        </SelectItem>
        {events.map((event) => (
          <SelectItem key={event.id} value={event.id} className="font-mono text-xs">
            <EventOptionLabel name={event.name} date={event.date} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
