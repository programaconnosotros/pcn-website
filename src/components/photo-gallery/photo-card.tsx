'use client';

import type React from 'react';

import { useState } from 'react';
import { Maximize2, Share2, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '@/components/photo-gallery/share-dialog';
import { formatDate } from '@/lib/date-formatter';
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
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        <div className="group relative aspect-[4/3]">
          <img
            src={photo.image || '/placeholder.svg'}
            alt={photo.title}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-80"
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
        <CardContent className="p-3">
          <h3 className="text-center text-sm font-medium">{photo.title}</h3>
          {photo.date && (
            <p className="mt-1 text-center text-xs text-gray-500">{formatDate(photo.date)}</p>
          )}
        </CardContent>
      </Card>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={handleCloseShareDialog}
        url={getShareUrl(photo.id)}
        title={photo.title}
      />
    </>
  );
}
