'use client';

import { cn } from '@/lib/utils';

/** The language a recommended video, talk, article or book is in. */
export type Language = 'es' | 'en';

export type LanguageFilterValue = 'todos' | Language;

const LANGUAGE_FILTERS: { value: LanguageFilterValue; label: string; title: string }[] = [
  { value: 'todos', label: 'todos', title: 'Todos los idiomas' },
  { value: 'es', label: 'es', title: 'Solo en español' },
  { value: 'en', label: 'en', title: 'Solo en inglés' },
];

export const matchesLanguage = (language: Language, filter: LanguageFilterValue) =>
  filter === 'todos' || language === filter;

/** Terminal-style segmented control to narrow a list down to Spanish or English content. */
export function LanguageFilter({
  value,
  onChange,
  className,
}: {
  value: LanguageFilterValue;
  onChange: (value: LanguageFilterValue) => void;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-2 font-mono text-[11px]', className)}>
      <span className="text-muted-foreground">idioma</span>
      <span
        className="flex h-8 border border-pcnGreen-200"
        role="group"
        aria-label="Filtrar por idioma"
      >
        {LANGUAGE_FILTERS.map(({ value: option, label, title }) => (
          <button
            key={option}
            type="button"
            title={title}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={cn(
              'border-r border-pcnGreen-200 px-2 transition-colors last:border-r-0',
              value === option
                ? 'bg-pcnGreen text-black'
                : 'text-muted-foreground hover:bg-pcnGreen/[0.06] hover:text-pcnGreen',
            )}
          >
            {label}
          </button>
        ))}
      </span>
    </span>
  );
}
