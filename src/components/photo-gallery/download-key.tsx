'use client';

import type { MouseEvent } from 'react';
import { Download } from 'lucide-react';
import { keyCapClassName } from './photo-utils';
import { toast } from 'sonner';
import { galleryDownloadUrl } from '@/lib/gallery-urls';

// Download key for a gallery photo or video. Uploaded files come back as a short-lived S3 URL that
// the browser opens as an attachment; files in /public come back as the file itself. Errors (rate
// not found) open the route so its message shows; the rate limit shows its message in a toast.
export function DownloadKey({ photoId }: { photoId: string }) {
  const href = galleryDownloadUrl(photoId);

  const download = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const response = await fetch(href).catch(() => null);
    if (response?.status === 429) {
      // El cuerpo es el aviso del rate limit, con el motivo y cuánto falta
      toast.error(await response.text());
      return;
    }
    if (!response?.ok) {
      window.location.assign(href);
      return;
    }

    if (response.headers.get('content-type')?.includes('application/json')) {
      const { url } = (await response.json()) as { url: string };
      window.location.assign(url);
      return;
    }

    const fileName =
      /filename="([^"]+)"/.exec(response.headers.get('content-disposition') ?? '')?.[1] ?? '';
    const objectUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <a href={href} onClick={download} className={keyCapClassName} title="Descargar">
      <Download className="size-3.5" />
      <span className="sr-only">Descargar</span>
    </a>
  );
}
