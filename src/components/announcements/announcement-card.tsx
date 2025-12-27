'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { MoreVertical, Edit, Trash2, Pin, Calendar, User as UserIcon } from 'lucide-react';
import { Announcement, User } from '@prisma/client';
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
  general: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20',
  evento: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20',
  noticia: 'bg-green-500/10 text-green-500 dark:bg-green-500/20',
  importante: 'bg-red-500/10 text-red-500 dark:bg-red-500/20',
  actualizacion: 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20',
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  evento: 'Evento',
  noticia: 'Noticia',
  importante: 'Importante',
  actualizacion: 'Actualización',
};

export function AnnouncementCard({ announcement, events = [], isAdmin = false }: AnnouncementCardProps) {
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

  const categoryColor = CATEGORY_COLORS[announcement.category] || CATEGORY_COLORS.general;
  const categoryLabel = CATEGORY_LABELS[announcement.category] || announcement.category;

  return (
    <>
      <Card className={`flex h-full w-full flex-col border-2 bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20 ${announcement.pinned ? 'border-pcnPurple dark:border-pcnGreen' : 'border-transparent dark:border-neutral-800'} ${!announcement.published ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${categoryColor} border-0`}>
                {categoryLabel}
              </Badge>
              {announcement.pinned && (
                <Badge variant="outline" className="gap-1">
                  <Pin className="h-3 w-3" />
                  Destacado
                </Badge>
              )}
              {!announcement.published && (
                <Badge variant="secondary">Borrador</Badge>
              )}
            </div>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
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
          <h3 className="text-xl font-semibold leading-tight">{announcement.title}</h3>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <p className="mb-4 flex-1 whitespace-pre-wrap text-sm text-muted-foreground">
            {announcement.content}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {announcement.author.image ? (
                  <AvatarImage src={announcement.author.image} alt={announcement.author.name} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {announcement.author.name?.charAt(0).toUpperCase() || <UserIcon className="h-3 w-3" />}
                </AvatarFallback>
              </Avatar>
              <span>{announcement.author.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(announcement.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de edición */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar anuncio</DialogTitle>
            <DialogDescription>
              Modifica los datos del anuncio.
            </DialogDescription>
          </DialogHeader>
          <AnnouncementForm
            defaultValues={announcement}
            events={events}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
            isLoading={isUpdating}
            submitLabel="Actualizar"
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

