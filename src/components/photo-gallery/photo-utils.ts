import { downloadImage } from '@/lib/download-helper';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { photos } from './photos';

export type Photo = (typeof photos)[number];

/** `agus-chelo-talk.webp`: the photo's file name, shown as its terminal-style label. */
export const photoFileName = (photo: Photo) => photo.image.split('/').pop() ?? `${photo.id}.webp`;

/** `2024-07-30`, or `----------` when the photo has no date. */
export const formatPhotoDate = (date?: Date) =>
  date
    ? [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-')
    : '----------';

/** Zero-pads an index so counters keep their width: `007/094`. */
export const padIndex = (value: number, total: number) =>
  String(value).padStart(String(total).length, '0');

export const usePhotoDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async (photo: Photo) => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadImage(photo.image, photoFileName(photo));
    } finally {
      setIsDownloading(false);
    }
  };

  return { download, isDownloading };
};

// Square key-cap button shared by the photo tiles and the viewer (same look as the dialog's
// close key).
export const keyCapClassName = cn(
  'flex size-7 shrink-0 items-center justify-center rounded-sm border border-pcnGreen-200 bg-black/70 text-pcnGreen-600 backdrop-blur-sm transition-all',
  'hover:border-pcnGreen hover:text-pcnGreen hover:shadow-[0_0_14px_-2px_rgba(4,244,190,0.7)]',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen',
  'disabled:pointer-events-none disabled:opacity-50',
);
