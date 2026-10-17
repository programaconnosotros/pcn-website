'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { keyCapClassName, photoCaption } from './photo-utils';
import { DownloadKey } from './download-key';
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
  const [isSharing, setIsSharing] = useState(false);

  return (
    <div className="flex gap-1">
      <DownloadKey photoId={photo.id} />
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
