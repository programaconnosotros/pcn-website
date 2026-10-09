'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { StickyHeader } from '@/components/ui/sticky-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Construction, MicVocal, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { TalkForm } from './talk-form';
import { TalkFromPhotoDialog } from './talk-from-photo-dialog';
import type { TalkFormData } from '@/schemas/talk-schema';
import { VideoGrid } from '@/components/videos/video-grid';
import type { Video } from '@/components/videos/videos';
import { RecommendButton } from '@/components/recommendations/recommend-button';
import { deleteTalk } from '@/actions/talks/delete-talk';
import { fetchTalkForEdit } from '@/actions/talks/fetch-talks';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { CommunityTalks, type TalkWithEvent } from './community-talks';

interface Props {
  talks: TalkWithEvent[];
  /** Talks from other conferences the community recommends, newest first. */
  externalTalks: Video[];
  isAdmin: boolean;
}

export function CharlasAdminWrapper({ talks, externalTalks, isAdmin }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [showFromPhoto, setShowFromPhoto] = useState(false);
  const [draft, setDraft] = useState<TalkFormData | undefined>();
  const [editingTalk, setEditingTalk] = useState<Awaited<
    ReturnType<typeof fetchTalkForEdit>
  > | null>(null);
  const [deletingTalk, setDeletingTalk] = useState<TalkWithEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tab, setTab] = useState('comunidad');

  // `/charlas?tab=externas` (linked from the home) opens the recommended external talks.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'externas') setTab('externas');
  }, []);

  // El listado no trae los teléfonos de los oradores y el form los reescribe: se piden al editar
  const handleEdit = async (talk: TalkWithEvent) => {
    try {
      setEditingTalk(await fetchTalkForEdit(talk.id));
    } catch (error) {
      toast.error(actionErrorMessage(error, 'Error al abrir la charla'));
    }
  };

  const handleDelete = async () => {
    if (!deletingTalk) return;
    setIsDeleting(true);
    try {
      await deleteTalk(deletingTalk.id);
      toast.success('Charla eliminada');
      setDeletingTalk(null);
    } catch (error: any) {
      toast.error(actionErrorMessage(error, 'Error al eliminar la charla', true));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-4">
      <Tabs value={tab} onValueChange={setTab}>
        <StickyHeader>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <PageTitle
              path="charlas"
              meta={`${talks.length} de la comunidad · ${externalTalks.length} recomendadas`}
              className="mb-0 flex-1"
            />
            {/* External talks are recommended like any video; community ones are given at PCN. */}
            {tab === 'externas' ? (
              <RecommendButton kind="VIDEO" defaults={{ isTalk: true }} label="recomendar charla" />
            ) : isAdmin ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowFromPhoto(true)}>
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  cargarConFoto();
                </Button>
                <Button variant="pcn" size="sm" onClick={() => setShowCreate(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  nuevaCharla();
                </Button>
              </div>
            ) : (
              <Link
                href="https://wa.me/5493815777562"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
              >
                <MicVocal className="h-3.5 w-3.5" />
                quiero dar una charla
              </Link>
            )}
          </div>

          <TabsList className="mb-4">
            <TabsTrigger value="comunidad">Comunidad</TabsTrigger>
            <TabsTrigger value="externas">Externas</TabsTrigger>
          </TabsList>
        </StickyHeader>

        <TabsContent value="comunidad">
          <CommunityTalks
            talks={talks}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onDelete={setDeletingTalk}
          />

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
          <VideoGrid videos={externalTalks} searchable />
        </TabsContent>
      </Tabs>

      <TalkFromPhotoDialog
        open={showFromPhoto}
        onOpenChange={setShowFromPhoto}
        onDraft={(next) => {
          setDraft(next);
          setShowCreate(true);
        }}
      />

      {/* Create dialog */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) setDraft(undefined);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nueva charla</DialogTitle>
          </DialogHeader>
          <TalkForm
            draft={draft}
            onSuccess={() => {
              setShowCreate(false);
              setDraft(undefined);
            }}
            onCancel={() => {
              setShowCreate(false);
              setDraft(undefined);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingTalk} onOpenChange={(open) => !open && setEditingTalk(null)}>
        <DialogContent className="sm:max-w-[600px]">
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
              // Sin preventDefault el diálogo se cierra al click: no se ve el estado de carga y, si
              // falla, se pierde. Se cierra solo cuando termina bien.
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
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
