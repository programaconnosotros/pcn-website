'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteProjectMedia } from '@/actions/projects/project-media';
import { VideoBadge } from '@/components/photo-gallery/video-badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';

export type ProjectMediaItem = {
  id: string;
  kind: 'PHOTO' | 'VIDEO';
  src: string;
  thumbSrc: string;
  width: number | null;
  height: number | null;
};

/**
 * A project's photos and videos as square thumbnails; each opens full size (videos play there).
 * Whoever can edit the project also gets a button to remove each one.
 */
export function ProjectMediaGrid({
  media,
  title,
  canEdit,
}: {
  media: ProjectMediaItem[];
  title: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<ProjectMediaItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const remove = async (item: ProjectMediaItem) => {
    setDeleting(item.id);
    try {
      await deleteProjectMedia(item.id);
      toast.success(item.kind === 'VIDEO' ? 'Video eliminado' : 'Foto eliminada');
      router.refresh();
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No se pudo eliminar', true));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <RuledGrid className="grid-cols-2 sm:grid-cols-3">
        {media.map((item, index) => (
          <div key={item.id} className={cn(ruledCellClassName, 'relative group p-1')}>
            <button
              type="button"
              onClick={() => setOpen(item)}
              className="relative block aspect-square w-full overflow-hidden bg-black"
              aria-label={`${item.kind === 'VIDEO' ? 'Ver video' : 'Ver foto'} ${index + 1} de ${title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbSrc}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover brightness-[0.85] transition duration-300 group-hover:scale-[1.04] group-hover:brightness-100"
              />
              {item.kind === 'VIDEO' && <VideoBadge />}
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => remove(item)}
                disabled={deleting === item.id}
                title="Eliminar"
                className="absolute top-2 right-2 rounded-sm bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100 disabled:opacity-50 max-md:opacity-100"
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Eliminar {item.kind === 'VIDEO' ? 'video' : 'foto'}</span>
              </button>
            )}
          </div>
        ))}
      </RuledGrid>

      <Dialog open={!!open} onOpenChange={(value) => !value && setOpen(null)}>
        <DialogContent className="max-w-5xl border-pcnGreen-200 bg-black p-2 sm:p-3">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {open?.kind === 'VIDEO' ? (
            <video
              key={open.id}
              src={open.src}
              poster={open.thumbSrc}
              controls
              autoPlay
              playsInline
              className="max-h-[80dvh] w-full"
            />
          ) : (
            open && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={open.src}
                alt={title}
                width={open.width ?? undefined}
                height={open.height ?? undefined}
                className="mx-auto max-h-[80dvh] w-auto max-w-full object-contain"
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
