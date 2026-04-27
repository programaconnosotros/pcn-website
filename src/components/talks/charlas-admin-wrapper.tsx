'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Heading2 } from '@/components/ui/heading-2';
import {
  Calendar,
  Edit,
  FileText,
  MapPin,
  MicVocal,
  MoreVertical,
  Plus,
  Trash2,
  User,
  Youtube,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { TalkForm } from './talk-form';
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

  return (
    <div className="mt-4">
      <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full flex-row items-center justify-between">
          <Heading2 className="m-0 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
              <MicVocal className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
            </div>
            <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Charlas</span>
          </Heading2>

          {isAdmin ? (
            <Button variant="pcn" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva charla
            </Button>
          ) : (
            <Link href="https://wa.me/5493815777562">
              <Button variant="pcn" className="flex flex-row items-center gap-2">
                Quiero dar una charla
                <MicVocal className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="my-5 ml-0 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {talks.map((talk) => {
          const location = [talk.event?.placeName, talk.event?.city].filter(Boolean).join(', ');
          return (
            <Card
              key={talk.id}
              className="flex flex-col overflow-hidden border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 md:flex-row"
            >
              {talk.portraitUrl && (
                <div className="relative aspect-square w-full shrink-0 md:aspect-auto md:h-auto md:w-64">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={talk.portraitUrl}
                    alt={`${talk.speakerName}'s photo`}
                    className="h-full w-full object-cover grayscale"
                  />
                  <div className="absolute inset-0 bg-pcnPurple/20 mix-blend-multiply dark:bg-pcnGreen/30 dark:mix-blend-screen" />
                </div>
              )}

              <div className="flex flex-1 flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{talk.title}</CardTitle>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
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
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                    <p className="text-sm text-muted-foreground">{talk.speakerName}</p>
                  </div>

                  {talk.event?.date && (
                    <div className="mt-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                      <p className="text-sm text-muted-foreground">
                        {new Date(talk.event.date)
                          .toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                          .replace(/\//g, '/')}
                      </p>
                    </div>
                  )}

                  {location && (
                    <div className="mt-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                      <p className="text-sm text-muted-foreground">{location}</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="mt-auto flex flex-col items-start gap-2">
                  {talk.videoUrl && (
                    <Link href={talk.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="flex items-center gap-2" variant="youtube">
                        Ver en YouTube
                        <Youtube className="h-4 w-4 text-white" />
                      </Button>
                    </Link>
                  )}

                  {talk.slideImages.length > 0 ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2" variant="outline">
                          Ver slides
                          <FileText className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                        </Button>
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
                    <Link href={talk.slidesUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="flex items-center gap-2" variant="outline">
                        Ver slides
                        <FileText className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                      </Button>
                    </Link>
                  ) : null}
                </CardFooter>
              </div>
            </Card>
          );
        })}
      </div>

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
