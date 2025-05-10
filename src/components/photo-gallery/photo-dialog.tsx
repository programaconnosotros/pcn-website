'use client';

import { useState } from 'react';
import type React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Share2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShareDialog } from '@/components/photo-gallery/share-dialog';
import { formatDate } from '@/lib/date-formatter';
import { downloadImage } from '@/lib/download-helper';

interface Photo {
  id: number;
  title: string;
  image: string;
  date?: Date;
}

interface PhotoDialogProps {
  photos: Photo[];
  currentPhotoIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  getShareUrl: (photoId: number) => string;
}

export function PhotoDialog({
  photos,
  currentPhotoIndex,
  isOpen,
  onClose,
  onNavigate,
  getShareUrl,
}: PhotoDialogProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const currentPhoto = photos[currentPhotoIndex];

  const handlePrevious = () => {
    const newIndex = currentPhotoIndex === 0 ? photos.length - 1 : currentPhotoIndex - 1;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentPhotoIndex === photos.length - 1 ? 0 : currentPhotoIndex + 1;
    onNavigate(newIndex);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  const handleCloseShareDialog = () => {
    setIsShareDialogOpen(false);
  };

  const handleDownload = async () => {
    if (!currentPhoto || isDownloading) return;

    setIsDownloading(true);
    try {
      // Crear un nombre de archivo basado en el título de la foto
      const fileName = currentPhoto.title
        .toLowerCase()
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .replace(/[^\w-]/g, '') // Eliminar caracteres especiales
        .concat('.jpg'); // Añadir extensión

      await downloadImage(currentPhoto.image, fileName);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!currentPhoto) return null;

  const shareUrl = getShareUrl(currentPhoto.id);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="w-[90vw] max-w-4xl overflow-hidden border-none bg-black/90 p-0"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative flex h-[80vh] items-center justify-center">
            <div className="absolute right-2 top-2 z-10 flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={handleDownload}
                      disabled={isDownloading}
                    >
                      <Download className="h-5 w-5" />
                      <span className="sr-only">Descargar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Descargar foto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={handleShare}
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="sr-only">Compartir</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Compartir foto</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Cerrar</span>
              </Button>
            </div>

            <div className="absolute left-2 top-1/2 z-10 -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Anterior</span>
              </Button>
            </div>

            <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Siguiente</span>
              </Button>
            </div>

            <div className="relative flex h-full w-full items-center justify-center">
              <Image
                src={currentPhoto.image || '/placeholder.svg'}
                alt={currentPhoto.title}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>
          </div>

          <div className="p-4 text-center">
            <DialogTitle className="text-lg font-medium">{currentPhoto.title}</DialogTitle>
            {currentPhoto.date && (
              <p className="mt-1 text-sm text-gray-500">{formatDate(currentPhoto.date)}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={handleCloseShareDialog}
        url={shareUrl}
        title={currentPhoto.title}
      />
    </>
  );
}
