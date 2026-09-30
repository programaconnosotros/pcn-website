'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageTitle } from '@/components/ui/page-title';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import {
  ArrowUpRight,
  Construction,
  Edit,
  FileText,
  MicVocal,
  MoreVertical,
  Plus,
  Trash2,
  Youtube,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { TalkForm } from './talk-form';
import { VideoGrid } from '@/components/videos/video-grid';
import { externalTalks } from '@/components/videos/videos';
import { deleteTalk } from '@/actions/talks/delete-talk';
import { fetchPublicTalks } from '@/actions/talks/fetch-public-talks';

type TalkWithEvent = Awaited<ReturnType<typeof fetchPublicTalks>>[number];

interface Props {
  talks: TalkWithEvent[];
  isAdmin: boolean;
}

export function CharlasAdminWrapper({ talks, isAdmin }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingTalk, setEditingTalk] = useState<TalkWithEvent | null>(null);
  const [deletingTalk, setDeletingTalk] = useState<TalkWithEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tab, setTab] = useState('comunidad');

  // `/charlas?tab=externas` (linked from the home) opens the recommended external talks.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'externas') setTab('externas');
  }, []);

  const handleDelete = async () => {
    if (!deletingTalk) return;
    setIsDeleting(true);
    try {
      await deleteTalk(deletingTalk.id);
      toast.success('Charla eliminada');
      setDeletingTalk(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar la charla');
    } finally {
      setIsDeleting(false);
    }
  };

  const linkClass =
    'inline-flex items-center gap-1 font-mono text-[11px] text-pcnGreen-700 hover:text-pcnGreen';

  return (
    <div className="mt-4">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <PageTitle
          path="charlas"
          meta={`${talks.length} charlas de la comunidad · ${externalTalks.length} externas`}
          className="mb-0 flex-1"
        />
        {isAdmin ? (
          <Button variant="pcn" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva charla
          </Button>
        ) : (
          <Link
            href="https://wa.me/5493815777562"
            className="flex items-center gap-1.5 font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
          >
            <MicVocal className="h-3.5 w-3.5" />
            quiero dar una charla
          </Link>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="comunidad">Comunidad</TabsTrigger>
          <TabsTrigger value="externas">Externas</TabsTrigger>
        </TabsList>

        <TabsContent value="comunidad">
          <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {talks.map((talk) => {
              const eventTitle = talk.event?.name ?? talk.manualEventTitle;
              const eventDate = talk.event?.date ?? talk.manualEventDate;
              const location = talk.event
                ? talk.event.isOnline
                  ? 'online'
                  : [talk.event.placeName, talk.event.city].filter(Boolean).join(', ')
                : talk.manualEventLocation ?? '';
              const eventMeta = [
                eventDate &&
                  new Date(eventDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }),
                location,
              ]
                .filter(Boolean)
                .join(' · ');

              return (
                <div key={talk.id} className={cn(ruledCellClassName, 'flex gap-3 p-3')}>
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-pcnGreen-200 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={talk.portraitUrl ?? '/logo.webp'}
                      alt={`Foto de la charla "${talk.title}"`}
                      className={cn(
                        'h-full w-full object-cover',
                        !talk.portraitUrl && 'p-3 opacity-30',
                      )}
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start gap-2">
                      <h2 className="line-clamp-2 flex-1 font-mono text-sm font-semibold">
                        {talk.title}
                      </h2>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="-mr-1 -mt-1 h-6 w-6 shrink-0"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingTalk(talk)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingTalk(talk)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {talk.speakers.length > 0 && (
                      <p className="truncate font-mono text-[11px] text-muted-foreground">
                        <span className="text-pcnGreen-500">@ </span>
                        {talk.speakers.map((speaker, index) => (
                          <span key={speaker.id}>
                            {index > 0 && ', '}
                            {speaker.user ? (
                              <Link
                                href={`/perfil/${speaker.user.id}`}
                                className="hover:text-pcnGreen hover:underline"
                              >
                                {speaker.speakerName}
                              </Link>
                            ) : (
                              speaker.speakerName
                            )}
                          </span>
                        ))}
                      </p>
                    )}

                    {(eventTitle || eventMeta) && (
                      <p className="truncate font-mono text-[11px] text-muted-foreground/70">
                        <span className="text-pcnGreen-500">$ </span>
                        {eventTitle &&
                          (talk.event?.id ? (
                            <Link
                              href={`/eventos/${talk.event.id}`}
                              className="hover:text-pcnGreen hover:underline"
                            >
                              {eventTitle}
                            </Link>
                          ) : (
                            eventTitle
                          ))}
                        {eventTitle && eventMeta && ' · '}
                        {eventMeta}
                      </p>
                    )}

                    {(talk.videoUrl || talk.slideImages.length > 0 || talk.slidesUrl) && (
                      <div className="mt-auto flex gap-3 pt-1">
                        {talk.videoUrl && (
                          <Link
                            href={talk.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                          >
                            <Youtube className="h-3 w-3" />
                            video
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        )}

                        {talk.slideImages.length > 0 ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button type="button" className={linkClass}>
                                <FileText className="h-3 w-3" />
                                slides
                              </button>
                            </DialogTrigger>

                            <DialogContent className="max-w-4xl px-16">
                              <DialogHeader>
                                <DialogTitle>{talk.title}</DialogTitle>
                              </DialogHeader>

                              <Carousel>
                                <CarouselContent>
                                  {talk.slideImages.map((slide, index) => (
                                    <CarouselItem key={index}>
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={slide}
                                        alt={`Slide ${index + 1}`}
                                        className="h-auto w-full"
                                      />
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>

                                <CarouselPrevious />
                                <CarouselNext />
                              </Carousel>
                            </DialogContent>
                          </Dialog>
                        ) : talk.slidesUrl ? (
                          <Link
                            href={talk.slidesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                          >
                            <FileText className="h-3 w-3" />
                            slides
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </RuledGrid>

          <div
            role="status"
            className="mb-14 flex items-start gap-3 border border-t-0 border-dashed border-pcnGreen-200 px-3 py-2.5 font-mono text-xs text-muted-foreground"
          >
            <Construction className="mt-px h-3.5 w-3.5 shrink-0 text-pcnGreen" />
            <p>
              <span className="text-pcnGreen">[mantenimiento]</span> Estamos cargando todo el
              historial de charlas de la comunidad. Todavía faltan algunas, así que si no encontrás
              la tuya, probablemente esté en camino
              <span className="ml-0.5 animate-blink text-pcnGreen">_</span>
            </p>
          </div>
        </TabsContent>

        {/* Talks from other conferences that the community recommends watching. */}
        <TabsContent value="externas" className="mb-14">
          <VideoGrid videos={externalTalks} />
        </TabsContent>
      </Tabs>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nueva charla</DialogTitle>
          </DialogHeader>
          <TalkForm onSuccess={() => setShowCreate(false)} onCancel={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingTalk} onOpenChange={(open) => !open && setEditingTalk(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar charla</DialogTitle>
          </DialogHeader>
          {editingTalk && (
            <TalkForm
              talk={editingTalk}
              onSuccess={() => setEditingTalk(null)}
              onCancel={() => setEditingTalk(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingTalk} onOpenChange={(open) => !open && setDeletingTalk(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar charla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente &quot;{deletingTalk?.title}&quot;. No se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
