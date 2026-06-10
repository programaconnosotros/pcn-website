'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface HistoriaImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function HistoriaImage({ src, alt, className = 'h-auto max-w-full self-center rounded-lg' }: HistoriaImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-pointer transition-opacity hover:opacity-90`}
        onClick={() => setIsOpen(true)}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-4xl overflow-hidden border-none p-0 [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:hover:bg-black/70 [&>button]:top-2 [&>button]:right-2">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="flex h-[85vh] items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-full max-w-full object-contain"
              loading="eager"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
