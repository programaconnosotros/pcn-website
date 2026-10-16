'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTransition } from 'react';
import { Megaphone, User as UserIcon, Pin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteEventAnnouncement } from '@/actions/announcements/event-announcement';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { EventAnnouncementForm } from './event-announcement-form';
import { cn } from '@/lib/utils';
import { Announcement, User } from '@/generated/prisma/browser';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type AnnouncementWithAuthor = Announcement & {
  author: Pick<User, 'id' | 'name' | 'image'>;
};

interface EventAnnouncementsProps {
  announcements: AnnouncementWithAuthor[];
  eventId: string;
  /** Whoever manages the event can post announcements (notifying everyone signed up) and delete them. */
  canManage?: boolean;
}

const DeleteAnnouncementButton = ({ id }: { id: string }) => {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      aria-label="Eliminar anuncio"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await deleteEventAnnouncement(id);
            toast.success('Anuncio eliminado');
          } catch (error) {
            toast.error(actionErrorMessage(error, 'Error al eliminar el anuncio'));
          }
        })
      }
      className="shrink-0 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
};

export function EventAnnouncements({
  announcements,
  eventId,
  canManage = false,
}: EventAnnouncementsProps) {
  if (announcements.length === 0 && !canManage) return null;

  return (
    <section className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
      <h3 className="flex items-center gap-2 px-3 py-2 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
        <Megaphone className="h-3.5 w-3.5 text-pcnGreen" />
        anuncios del evento
        <span className="text-muted-foreground/60">[{announcements.length}]</span>
      </h3>
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className={cn(
            'flex flex-col gap-1.5 p-3',
            announcement.pinned && 'bg-pcnGreen-50 shadow-[inset_2px_0_0_0_#04f4be]',
          )}
        >
          <div className="flex items-baseline gap-2 font-mono">
            <h4 className="text-sm font-semibold">{announcement.title}</h4>
            {announcement.pinned && (
              <span className="flex shrink-0 items-center gap-1 text-[11px] text-pcnGreen">
                <Pin className="h-3 w-3" />
                destacado
              </span>
            )}
            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(announcement.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </span>
            {canManage && <DeleteAnnouncementButton id={announcement.id} />}
          </div>
          <p className="text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {announcement.content}
          </p>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/70">
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
            <span>
              <span className="text-pcnGreen-500">@ </span>
              {announcement.author.name}
            </span>
          </div>
        </div>
      ))}
      {canManage && <EventAnnouncementForm eventId={eventId} />}
    </section>
  );
}
