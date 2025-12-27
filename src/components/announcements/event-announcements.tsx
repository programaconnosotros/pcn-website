'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Megaphone, Calendar, User as UserIcon, Pin } from 'lucide-react';
import { Announcement, User } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type AnnouncementWithAuthor = Announcement & {
  author: Pick<User, 'id' | 'name' | 'image'>;
};

interface EventAnnouncementsProps {
  announcements: AnnouncementWithAuthor[];
}

export function EventAnnouncements({ announcements }: EventAnnouncementsProps) {
  if (announcements.length === 0) return null;

  return (
    <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Anuncios del evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="font-semibold">{announcement.title}</h4>
              {announcement.pinned && (
                <Badge variant="outline" className="shrink-0 gap-1">
                  <Pin className="h-3 w-3" />
                  Destacado
                </Badge>
              )}
            </div>
            <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {announcement.content}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  {announcement.author.image ? (
                    <AvatarImage src={announcement.author.image} alt={announcement.author.name} />
                  ) : null}
                  <AvatarFallback className="text-[10px]">
                    {announcement.author.name?.charAt(0).toUpperCase() || (
                      <UserIcon className="h-3 w-3" />
                    )}
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
