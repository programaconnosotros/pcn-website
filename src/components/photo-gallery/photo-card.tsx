'use client';

import type React from 'react';

import { useState } from 'react';
import { Maximize2, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '@/components/photo-gallery/share-dialog';
import { downloadImage } from '@/lib/download-helper';

interface PhotoCardProps {
  photo: {
    id: number;
    title: string;
    image: string;
    date?: Date;
  };
  getShareUrl: (photoId: number) => string;
  onCardClick: () => void;
}

export function PhotoCard({ photo, getShareUrl, onCardClick }: PhotoCardProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    setIsShareDialogOpen(true);
  };

  const handleCloseShareDialog = () => {
    setIsShareDialogOpen(false);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      // Crear un nombre de archivo basado en el título de la foto
      const fileName = photo.title
        .toLowerCase()
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .replace(/[^\w-]/g, '') // Eliminar caracteres especiales
        .concat('.jpg'); // Añadir extensión

      await downloadImage(photo.image, fileName);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="group relative aspect-square w-full overflow-hidden">
        <img
          src={photo.image || '/placeholder.svg'}
          alt={photo.title}
          className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-80"
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/30 text-white hover:bg-black/50"
              onClick={handleDownloadClick}
              disabled={isDownloading}
            >
              <Download className="h-5 w-5" />
              <span className="sr-only">Descargar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/30 text-white hover:bg-black/50"
              onClick={handleShareClick}
            >
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Compartir</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/30 text-white hover:bg-black/50"
              onClick={onCardClick}
            >
              <Maximize2 className="h-5 w-5" />
              <span className="sr-only">Ver</span>
            </Button>
          </div>
        </div>
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={handleCloseShareDialog}
        url={getShareUrl(photo.id)}
        title={photo.title}
      />
    </>
  );
}
