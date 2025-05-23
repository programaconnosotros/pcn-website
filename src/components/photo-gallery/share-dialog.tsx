'use client';

import { useState, useRef } from 'react';
import { Check, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareDialog({ isOpen, onClose, url, title }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    try {
      if (inputRef.current) {
        inputRef.current.select();
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleSelectAll = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir foto</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-gray-500">
            Compartí el link directo a la foto &quot;{title}&quot;
          </p>
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={url}
              readOnly
              className="flex-1"
              onClick={handleSelectAll}
            />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">{copied ? 'Copiado' : 'Copiar'}</span>
            </Button>
          </div>
          {copied && (
            <p className="text-sm font-medium text-green-600">¡Link copiado al portapapeles!</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
