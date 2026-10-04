'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MoreVertical, Edit, Trash2, Pin, User as UserIcon } from 'lucide-react';
import { Announcement, User } from '@/generated/prisma/browser';
import { AnnouncementForm } from './announcement-form';
import { DeleteAnnouncementDialog } from './delete-announcement-dialog';
import { updateAnnouncement } from '@/actions/announcements/update-announcement';
import { AnnouncementFormData } from '@/schemas/announcement-schema';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type AnnouncementWithAuthor = Announcement & {
  author: Pick<User, 'id' | 'name' | 'image'>;
};

interface EventOption {
  id: string;
  name: string;
  date: Date;
}

interface AnnouncementCardProps {
  announcement: AnnouncementWithAuthor;
  events?: EventOption[];
  isAdmin?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  general: 'text-blue-400',
  evento: 'text-purple-400',
  noticia: 'text-pcnGreen',
  importante: 'text-red-400',
  actualizacion: 'text-orange-400',
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  evento: 'Evento',
  noticia: 'Noticia',
  importante: 'Importante',
  actualizacion: 'Actualización',
};

export function AnnouncementCard({
  announcement,
  events = [],
  isAdmin = false,
}: AnnouncementCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (data: AnnouncementFormData) => {
    setIsUpdating(true);
    try {
      await updateAnnouncement(announcement.id, data);
      toast.success('Anuncio actualizado exitosamente');
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el anuncio');
    } finally {
      setIsUpdating(false);
    }
  };

  const categoryLabel = CATEGORY_LABELS[announcement.category] || announcement.category;

  return (
    <>
      <div
        className={cn(
          ruledCellClassName,
          'flex flex-col gap-1.5 p-3',
          announcement.pinned && 'bg-pcnGreen-50 shadow-[inset_2px_0_0_0_#04f4be]',
          !announcement.published && 'opacity-60',
        )}
      >
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className={CATEGORY_COLORS[announcement.category] || CATEGORY_COLORS.general}>
            [{categoryLabel.toLowerCase()}]
          </span>
          {announcement.pinned && (
            <span className="flex items-center gap-1 text-pcnGreen">
              <Pin className="h-3 w-3" />
              destacado
            </span>
          )}
          {!announcement.published && <span className="text-muted-foreground">borrador</span>}
          <span className="ml-auto shrink-0 text-muted-foreground">
            {formatDistanceToNow(new Date(announcement.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </span>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <h3 className="font-mono text-sm font-semibold leading-snug">{announcement.title}</h3>

        <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
          {announcement.content}
        </p>

        <div className="mt-auto flex items-center gap-1.5 pt-1 font-mono text-[11px] text-muted-foreground/70">
          <Avatar className="h-4 w-4 rounded-sm">
            {announcement.author.image ? (
              <AvatarImage src={announcement.author.image} alt={announcement.author.name} />
            ) : null}
            <AvatarFallback className="rounded-sm text-[8px]">
              {announcement.author.name?.charAt(0).toUpperCase() || (
                <UserIcon className="h-2.5 w-2.5" />
              )}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">
            <span className="text-pcnGreen-500">@ </span>
            {announcement.author.name}
          </span>
        </div>
      </div>

      {/* Dialog de edición */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar anuncio</DialogTitle>
            <DialogDescription>Modifica los datos del anuncio.</DialogDescription>
          </DialogHeader>
          <AnnouncementForm
            defaultValues={announcement}
            events={events}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
            isLoading={isUpdating}
            submitLabel="actualizar();"
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de eliminación */}
      <DeleteAnnouncementDialog
        announcementId={announcement.id}
        announcementTitle={announcement.title}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
