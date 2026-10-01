import { cn } from '@/lib/utils';

export type PhotoLike = {
  id: string;
  src: string;
  takenAt: Date;
  description: string | null;
  event: { name: string } | null;
};

/** `2024-07-30`, the date the photo was taken. */
export const formatPhotoDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

/**
 * The photo's terminal-style label and download name: the original file name for the photos
 * that live in /public, `pcn-2024-07-30-x1y2z3.webp` for uploaded ones.
 */
export const photoFileName = (photo: PhotoLike) =>
  photo.src.startsWith('/')
    ? photo.src.split('/').pop() ?? `${photo.id}.webp`
    : `pcn-${formatPhotoDate(photo.takenAt)}-${photo.id.slice(-6)}.webp`;

/** What the photo shows: its description, or the event it's from. */
export const photoCaption = (photo: PhotoLike) =>
  photo.description ?? photo.event?.name ?? 'Foto de la comunidad';

/** Zero-pads an index so counters keep their width: `007/094`. */
export const padIndex = (value: number, total: number) =>
  String(value).padStart(String(total).length, '0');

// Square key-cap button shared by the photo tiles and the photo page.
export const keyCapClassName = cn(
  'flex size-7 shrink-0 items-center justify-center rounded-sm border border-pcnGreen-200 bg-black/70 text-pcnGreen-600 backdrop-blur-sm transition-all',
  'hover:border-pcnGreen hover:text-pcnGreen hover:shadow-[0_0_14px_-2px_rgba(4,244,190,0.7)]',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen',
  'disabled:pointer-events-none disabled:opacity-50',
);
