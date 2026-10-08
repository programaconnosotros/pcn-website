'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Laptop, X } from 'lucide-react';
import { toast } from 'sonner';
import { approveGalleryItems, rejectGalleryItems } from '@/actions/gallery/gallery-actions';
import { Button } from '@/components/ui/button';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import type { PendingGalleryItem } from '@/lib/gallery';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

// The review queue: each photo with who uploaded it and where it would go, to publish or reject
// one by one or all at once. Rejecting deletes the photo and its files.
export function PendingGalleryReview({ items }: { items: PendingGalleryItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const review = async (ids: string[], approve: boolean) => {
    setBusy((current) => new Set([...current, ...ids]));
    try {
      if (approve) {
        const { approved } = await approveGalleryItems(ids);
        toast.success(approved === 1 ? 'Foto publicada' : `${approved} fotos publicadas`);
      } else {
        const { rejected } = await rejectGalleryItems(ids);
        toast.success(rejected === 1 ? 'Foto rechazada' : `${rejected} fotos rechazadas`);
      }
      router.refresh();
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No se pudo revisar la foto'));
    } finally {
      setBusy((current) => new Set([...current].filter((id) => !ids.includes(id))));
    }
  };

  if (!items.length) {
    return (
      <p className="mb-14 border border-dashed border-pcnGreen-200 px-3 py-6 text-center font-mono text-xs text-muted-foreground">
        No hay fotos para revisar.{' '}
        <Link href="/galeria" className="text-pcnGreen hover:underline">
          volver a la galería
        </Link>
      </p>
    );
  }

  const allIds = items.map((item) => item.id);

  return (
    <div className="mb-14 space-y-4">
      <div className="flex justify-end">
        <Button
          variant="pcn"
          size="sm"
          onClick={() => void review(allIds, true)}
          disabled={busy.size > 0}
          className="flex items-center gap-1.5"
        >
          <Check className="h-4 w-4" />
          aprobarTodas();
        </Button>
      </div>

      <RuledGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const isBusy = busy.has(item.id);
          return (
            <article
              key={item.id}
              className={cn(ruledCellClassName, 'flex flex-col', isBusy && 'opacity-50')}
            >
              <a
                href={item.fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-4/3 overflow-hidden bg-black"
                aria-label="Ver la foto en grande"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbUrl}
                  alt={item.description ?? ''}
                  loading="lazy"
                  className="size-full object-contain"
                />
                {item.working && (
                  <span className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-pcnGreen">
                    <Laptop className="size-3" />
                    trabajando
                  </span>
                )}
              </a>

              <div className="flex flex-1 flex-col gap-2 p-3 font-mono text-xs">
                <p>
                  {item.uploadedBy ? (
                    <Link
                      href={`/perfil/${item.uploadedBy.id}`}
                      className="font-semibold text-pcnGreen hover:underline"
                    >
                      {item.uploadedBy.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">sin autor</span>
                  )}
                  <span className="text-muted-foreground">
                    {' '}
                    · subida el {formatDate(item.createdAt)}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  sacada el {formatDate(item.takenAt)}
                  {item.event && <> · {item.event.name}</>}
                </p>
                {item.description && (
                  <p className="line-clamp-3 font-sans text-sm">{item.description}</p>
                )}

                <div className="mt-auto flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="pcn"
                    onClick={() => void review([item.id], true)}
                    disabled={isBusy}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void review([item.id], false)}
                    disabled={isBusy}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                    rechazar
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </RuledGrid>
    </div>
  );
}
