'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Heading2 } from '@/components/ui/heading-2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AnnouncementCard } from './announcement-card';
import { AnnouncementForm } from './announcement-form';
import { Announcement, User } from '@prisma/client';
import { createAnnouncement } from '@/actions/announcements/create-announcement';
import { AnnouncementFormData } from '@/schemas/announcement-schema';
import { toast } from 'sonner';

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
      toast.error(error.message || 'Error al crear el anuncio');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Heading2 className="m-0">Anuncios</Heading2>
        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo anuncio
          </Button>
        )}
      </div>

      {/* Announcements list */}
      {announcements.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              events={events}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          Aún no se han publicado anuncios en la comunidad.
        </p>
      )}

      {/* Dialog para crear nuevo anuncio */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo anuncio</DialogTitle>
            <DialogDescription>Crea un nuevo anuncio para la comunidad.</DialogDescription>
          </DialogHeader>
          <AnnouncementForm
            events={events}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={isCreating}
            submitLabel="Crear anuncio"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
