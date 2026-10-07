'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ImageIcon, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { setEventCoverPhoto } from '@/actions/events/set-event-cover-photo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';

type Photo = { id: string; thumbUrl: string; width: number | null; height: number | null };

const isLandscape = ({ width, height }: Photo) => !!width && !!height && width / height >= 1.3;

const tileClassName =
  'group relative aspect-3/2 overflow-hidden rounded-[3px] bg-black ring-1 ring-inset ring-white/10 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pcnGreen disabled:opacity-60';

/**
 * For whoever can edit the event, on a past event's hero: pick which of the event's photos opens its page, or go
 * back to cycling through random landscape ones. Landscape photos come first, since they are
 * the ones that fill the header well.
 */
export function MemoryCoverPicker({
  eventId,
  chosenId,
  photos,
}: {
  eventId: string;
  chosenId: string | null;
  photos: Photo[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const sorted = [...photos.filter(isLandscape), ...photos.filter((photo) => !isLandscape(photo))];

  const choose = (photoId: string | null) =>
    startTransition(async () => {
      try {
        await setEventCoverPhoto(eventId, photoId);
        toast.success(photoId ? 'Portada actualizada' : 'La portada vuelve a ser aleatoria');
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo cambiar la portada'));
      }
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-[3px] border border-white/20 bg-black/50 px-2 py-1 font-mono text-[11px] text-white/80 backdrop-blur-xs transition-colors hover:border-pcnGreen hover:text-pcnGreen"
      >
        <ImageIcon className="size-3.5" />
        portada: {chosenId ? 'elegida' : 'aleatoria'}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">portada del evento</DialogTitle>
            <DialogDescription>
              Elegí la foto que abre la página. Sin elegir, el encabezado va alternando fotos
              horizontales del evento al azar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
            <button
              type="button"
              disabled={isPending}
              onClick={() => choose(null)}
              className={cn(
                tileClassName,
                'flex flex-col items-center justify-center gap-1 bg-pcnGreen/[0.06] font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen',
                !chosenId && 'ring-2 ring-pcnGreen',
              )}
            >
              <Shuffle className="size-5" />
              aleatoria
            </button>
            {sorted.map((photo) => {
              const selected = photo.id === chosenId;
              return (
                <button
                  key={photo.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => choose(photo.id)}
                  className={cn(tileClassName, selected && 'ring-2 ring-pcnGreen')}
                  aria-pressed={selected}
                  aria-label={selected ? 'Portada actual' : 'Usar como portada'}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbUrl}
                    alt=""
                    loading="lazy"
                    className={cn(
                      'h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]',
                      !isLandscape(photo) && 'opacity-60',
                    )}
                  />
                  {selected && (
                    <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-pcnGreen text-black">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {photos.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground">
              Este evento todavía no tiene fotos.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
