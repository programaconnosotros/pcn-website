import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge reads any `text-*` it doesn't know as a text color (and `bg-*` as a background),
 * so `text-glow` would drop `text-pcnGreen`, or the other way round, depending on the order. The
 * site's own utilities from globals.css get groups of their own, so they combine with the rest.
 */
const twMerge = extendTailwindMerge<'text-glow' | 'bg-grid-fade'>({
  extend: {
    classGroups: {
      'text-glow': ['text-glow'],
      'bg-grid-fade': ['bg-grid-fade'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
}
