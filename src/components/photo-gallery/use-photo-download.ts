import { useState } from 'react';
import { downloadImage } from '@/lib/download-helper';
import { photoFileName, type PhotoLike } from './photo-utils';

export const usePhotoDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async (photo: PhotoLike) => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadImage(photo.src, photoFileName(photo));
    } finally {
      setIsDownloading(false);
    }
  };

  return { download, isDownloading };
};
