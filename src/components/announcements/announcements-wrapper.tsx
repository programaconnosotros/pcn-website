'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Rss } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid } from '@/components/ui/ruled-grid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AnnouncementCard } from './announcement-card';
import { AnnouncementForm } from './announcement-form';
import { Announcement, User } from '@/generated/prisma/browser';
import { createAnnouncement } from '@/actions/announcements/create-announcement';
import { AnnouncementFormData } from '@/schemas/announcement-schema';
import { toast } from 'sonner';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type AnnouncementWithAuthor = Announcement & {
  author: Pick<User, 'id' | 'name' | 'image'>;
};

interface EventOption {
  id: string;
  name: string;
  date: Date;
}

interface AnnouncementsWrapperProps {
  announcements: AnnouncementWithAuthor[];
  events?: EventOption[];
  isAdmin?: boolean;
}

export function AnnouncementsWrapper({
  announcements,
  events = [],
  isAdmin = false,
}: AnnouncementsWrapperProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (data: AnnouncementFormData) => {
    setIsCreating(true);
    try {
      await createAnnouncement(data);
      toast.success('Anuncio creado exitosamente');
      setIsCreateOpen(false);
    } catch (error: any) {
      toast.error(actionErrorMessage(error, 'Error al crear el anuncio', true));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <StickyHeader>
        <div className="mb-4 flex items-start justify-between gap-4">
          <PageTitle
            path="anuncios"
            meta={`${announcements.length} anuncios de la comunidad`}
            className="mb-0 flex-1"
          />
          <a
            href="/feed.xml"
            title="Suscribite a las novedades con tu lector de RSS"
            className="inline-flex shrink-0 items-center gap-1.5 self-center font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
          >
            <Rss className="h-3.5 w-3.5" />
            rss
          </a>
          {isAdmin && (
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              nuevoAnuncio();
            </Button>
          )}
        </div>
      </StickyHeader>

      {announcements.length > 0 ? (
        <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              events={events}
              isAdmin={isAdmin}
            />
          ))}
        </RuledGrid>
      ) : (
        <p className="border border-pcnGreen-200 p-4 font-mono text-xs text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>
          Aún no se han publicado anuncios en la comunidad.
        </p>
      )}

      {/* Dialog para crear nuevo anuncio */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo anuncio</DialogTitle>
            <DialogDescription>Crea un nuevo anuncio para la comunidad.</DialogDescription>
          </DialogHeader>
          <AnnouncementForm
            events={events}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={isCreating}
            submitLabel="crearAnuncio();"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
