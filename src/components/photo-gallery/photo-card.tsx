'use client';

import type React from 'react';

import { useState } from 'react';
import { Maximize2, Share2, Download, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '@/components/photo-gallery/share-dialog';
import { GalleryPhotoFormDialog } from '@/components/photo-gallery/gallery-photo-form-dialog';
import { DeletePhotoDialog } from '@/components/photo-gallery/delete-photo-dialog';
import { downloadImage } from '@/lib/download-helper';
import { GalleryPhoto } from '@prisma/client';

interface PhotoCardProps {
  photo: GalleryPhoto;
  isAdmin?: boolean;
  getShareUrl: (photoId: string) => string;
  onCardClick: () => void;
}

export function PhotoCard({ photo, isAdmin, getShareUrl, onCardClick }: PhotoCardProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareDialogOpen(true);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const fileName = photo.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .concat('.jpg');

      await downloadImage(photo.imageUrl, fileName);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteOpen(true);
  };

  return (
    <>
      <div className="group relative aspect-square w-full overflow-hidden">
        <img
          src={photo.imageUrl || '/placeholder.svg'}
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
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-black/30 text-white hover:bg-black/50"
                  onClick={handleEditClick}
                >
                  <Pencil className="h-5 w-5" />
                  <span className="sr-only">Editar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-black/30 text-white hover:bg-destructive/80"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        url={getShareUrl(photo.id)}
        title={photo.title}
      />

      {isAdmin && (
        <>
          <GalleryPhotoFormDialog
            mode="edit"
            photo={photo}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          />
          <DeletePhotoDialog
            photoId={photo.id}
            photoTitle={photo.title}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
          />
        </>
      )}
    </>
  );
}
