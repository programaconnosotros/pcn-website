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
import { Construction, MicVocal, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { TalkForm } from './talk-form';
import { VideoGrid } from '@/components/videos/video-grid';
import { externalTalks } from '@/components/videos/videos';
import { deleteTalk } from '@/actions/talks/delete-talk';
import { CommunityTalks, type TalkWithEvent } from './community-talks';

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

          <TabsList className="mb-4">
            <TabsTrigger value="comunidad">Comunidad</TabsTrigger>
            <TabsTrigger value="externas">Externas</TabsTrigger>
          </TabsList>
        </StickyHeader>

        <TabsContent value="comunidad">
          <CommunityTalks
            talks={talks}
            isAdmin={isAdmin}
            onEdit={setEditingTalk}
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
