'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { createTalkFromPhoto } from '@/actions/talks/create-talk-from-photo';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import type { TalkFormData } from '@/schemas/talk-schema';

type Props = {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  // Al agente le faltaron datos: se sigue en el form de charla nueva, precargado.
  onDraft: (_draft: TalkFormData) => void;
};

/** El admin sube solo la foto de la charla; el agente deduce el resto y la carga. */
export function TalkFromPhotoDialog({ open, onOpenChange, onDraft }: Props) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const reset = () => {
    setPhotoUrl('');
    setFailure(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (isRunning) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const run = async (url: string) => {
    setPhotoUrl(url);
    setFailure(null);
    if (!url) return;

    setIsRunning(true);
    try {
      const result = await createTalkFromPhoto(url);
      if (result.status === 'created') {
        toast.success(`Charla cargada: ${result.title}`, { description: result.reason });
        reset();
        onOpenChange(false);
      } else if (result.status === 'draft') {
        toast.info('Completá los datos que faltan', { description: result.reason });
        reset();
        onOpenChange(false);
        onDraft(result.draft);
      } else {
        setFailure(result.reason);
      }
    } catch (error) {
      setFailure(actionErrorMessage(error, 'No se pudo cargar la charla'));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Cargar charla con IA</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Subí una foto de la charla. El agente busca el evento, la propuesta y los oradores, y la
          carga sola.
        </p>

        <FileUpload
          value={photoUrl}
          onChange={(url) => void run(url)}
          folder="talks/portraits"
          disabled={isRunning}
        />

        {isRunning && (
          <p role="status" className="flex items-center gap-2 font-mono text-xs text-pcnGreen">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            analizando la foto y buscando el evento…
          </p>
        )}

        {failure && (
          <p role="alert" className="font-mono text-xs text-destructive">
            {failure}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
