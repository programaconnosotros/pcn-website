'use client';

import type { TechOption } from '@/lib/tech-stack';
import { cn } from '@/lib/utils';

// Toggle chips over a fixed list: click to mark or unmark each option.
export const OptionChips = ({
  options,
  selected,
  onChange,
  label,
}: {
  options: readonly TechOption[];
  selected: readonly string[];
  onChange: (_ids: string[]) => void;
  /** Names the group for screen readers. */
  label: string;
}) => (
  <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
    {options.map((option) => {
      const isSelected = selected.includes(option.id);
      return (
        <button
          key={option.id}
          type="button"
          aria-pressed={isSelected}
          onClick={() =>
            onChange(
              isSelected ? selected.filter((id) => id !== option.id) : [...selected, option.id],
            )
          }
          className={cn(
            'flex h-7 items-center rounded-sm border px-2 font-mono text-[11px] transition-colors',
            isSelected
              ? 'border-pcnGreen-600 bg-pcnGreen/10 text-pcnGreen'
              : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-500 hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
