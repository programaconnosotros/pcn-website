'use client';

import { useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { keyCapClassName, photoCaption } from './photo-utils';
import { usePhotoDownload } from './use-photo-download';
import { ShareDialog } from './share-dialog';

type Props = {
  photo: {
    id: string;
    src: string;
    takenAt: Date;
    description: string | null;
    event: { name: string } | null;
  };
};

// Download and share keys for a photo's page.
export function PhotoActionsBar({ photo }: Props) {
  const { download, isDownloading } = usePhotoDownload();
  const [isSharing, setIsSharing] = useState(false);

  return (
    <div className="flex gap-1">
      <button
        type="button"
        className={keyCapClassName}
        onClick={() => download(photo)}
        disabled={isDownloading}
        title="Descargar"
      >
        <Download className="size-3.5" />
        <span className="sr-only">Descargar</span>
      </button>
      <button
        type="button"
        className={keyCapClassName}
        onClick={() => setIsSharing(true)}
        title="Compartir"
      >
        <Share2 className="size-3.5" />
        <span className="sr-only">Compartir</span>
      </button>
      {isSharing && (
        <ShareDialog
          isOpen
          onClose={() => setIsSharing(false)}
          url={`${window.location.origin}/galeria/${photo.id}`}
          title={photoCaption(photo)}
        />
      )}
    </div>
  );
}
