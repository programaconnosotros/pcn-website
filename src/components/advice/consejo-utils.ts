import { cn } from '@/lib/utils';

/** A stable, git-like short hash per consejo, for the `~/consejos/<hash>` path bars. */
export const consejoHash = (id: string) => {
  let hash = 5381;
  for (const char of id) hash = (Math.imul(hash, 33) ^ char.charCodeAt(0)) >>> 0;
  return hash.toString(16).padStart(8, '0').slice(0, 7);
};

/** /consejos/<id>: a modal over the list when navigating from it, a full page otherwise. */
export const consejoHref = (id: string) => `/consejos/${id}`;

export const consejoUrl = (id: string) =>
  new URL(consejoHref(id), window.location.origin).toString();

// The terminal key caps of the detail's path bar, shared with the conversaciones reader.
export const keyCapClassName = cn(
  'flex size-7 shrink-0 items-center justify-center rounded-sm border border-pcnGreen-200 bg-black/70 text-pcnGreen-600 transition-all',
  'hover:border-pcnGreen hover:text-pcnGreen hover:shadow-[0_0_14px_-2px_rgba(4,244,190,0.7)]',
  'focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-pcnGreen',
  'disabled:pointer-events-none disabled:opacity-40',
);
