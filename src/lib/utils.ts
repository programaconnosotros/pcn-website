import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
}
