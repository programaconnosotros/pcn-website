'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Crop, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { setEventCoverFraming } from '@/actions/events/set-event-cover-framing';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DEFAULT_COVER_FRAMING,
  MAX_COVER_ZOOM,
  coverFramingStyle,
  type CoverFraming,
} from '@/lib/cover-framing';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * For whoever can edit the event: frame the chosen cover photo of its memorial. Drag the
 * preview (shaped like the header) to move the focal point and use the slider to zoom in.
 */
export function MemoryCoverFraming({
  eventId,
  photo,
  framing,
}: {
  eventId: string;
  /** The chosen cover, full size. */
  photo: string;
  framing: CoverFraming;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(framing);
  const [isPending, startTransition] = useTransition();
  const previewRef = useRef<HTMLDivElement>(null);

  const openEditor = () => {
    setDraft(framing);
    setOpen(true);
  };

  // Dragging moves the photo with the pointer, so the focal point moves the other way.
  const startDrag = (event: React.PointerEvent) => {
    const box = previewRef.current?.getBoundingClientRect();
    if (!box) return;
    event.preventDefault();
    const start = { px: event.clientX, py: event.clientY, ...draft };
    const move = (e: PointerEvent) => {
      const scale = draft.zoom / 100;
      setDraft((current) => ({
        ...current,
        x: Math.round(
          clamp(start.x - (((e.clientX - start.px) / box.width) * 100) / scale, 0, 100),
        ),
        y: Math.round(
          clamp(start.y - (((e.clientY - start.py) / box.height) * 100) / scale, 0, 100),
        ),
      }));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const save = () =>
    startTransition(async () => {
      try {
        await setEventCoverFraming(eventId, draft);
        toast.success('Encuadre guardado');
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo guardar el encuadre'));
      }
    });

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        className="flex items-center gap-1.5 rounded-[3px] border border-white/20 bg-black/50 px-2 py-1 font-mono text-[11px] text-white/80 backdrop-blur-sm transition-colors hover:border-pcnGreen hover:text-pcnGreen"
      >
        <Crop className="size-3.5" />
        encuadre
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-mono">encuadre de la portada</DialogTitle>
            <DialogDescription>
              Arrastrá la foto para elegir qué parte se ve en el encabezado y acercala con el zoom.
            </DialogDescription>
          </DialogHeader>

          <div
            ref={previewRef}
            onPointerDown={startDrag}
            role="img"
            aria-label={`Vista previa: foco en ${draft.x}% ${draft.y}%, zoom ${draft.zoom}%`}
            className="relative aspect-[21/9] cursor-grab touch-none select-none overflow-hidden rounded-sm bg-black ring-1 ring-pcnGreen-300 active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              style={coverFramingStyle(draft)}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-pcnGreen bg-black/40 shadow-[0_0_10px_#04f4be]"
              style={{ left: '50%', top: '50%' }}
            />
          </div>

          <label className="flex items-center gap-3 font-mono text-xs">
            <span className="w-12 text-muted-foreground">zoom</span>
            <input
              type="range"
              min={100}
              max={MAX_COVER_ZOOM}
              step={5}
              value={draft.zoom}
              onChange={(event) => setDraft({ ...draft, zoom: Number(event.target.value) })}
              aria-label="Zoom"
              className="flex-1 accent-[#04f4be]"
            />
            <span className="w-12 text-right tabular-nums text-pcnGreen">{draft.zoom}%</span>
          </label>

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDraft(DEFAULT_COVER_FRAMING)}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              centrar
            </Button>
            <Button type="button" variant="pcn" size="sm" onClick={save} loading={isPending}>
              guardarEncuadre();
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
