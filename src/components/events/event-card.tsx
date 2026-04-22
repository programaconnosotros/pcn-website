'use server';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Event } from '@prisma/client';
import { Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

export const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const now = new Date();
  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : start;
  const status: 'upcoming' | 'in-progress' | 'ended' =
    now < start ? 'upcoming' : now <= end ? 'in-progress' : 'ended';

  return (
    <Link href={`/eventos/${event.id}`}>
      <Card className="flex h-full flex-col overflow-hidden border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800">
        {event.flyerSrc && (
          <div className="relative aspect-square w-full shrink-0 overflow-hidden">
            <img
              src={event.flyerSrc}
              alt={`Flyer de ${event.name}`}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle className="flex items-start justify-between gap-2 text-lg">
              <span>{event.name}</span>
              {status !== 'ended' && <EventStatusBadge status={status} />}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1">
            {event.description && (
              <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{event.description}</p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
              <p className="text-sm text-muted-foreground">
                {formatDate(event.date)}
                {event.date && ` - ${formatTime(event.date)}`}
              </p>
            </div>

            {(event.city || event.placeName) && (
              <div className="mt-2 flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                <p className="text-sm text-muted-foreground">
                  {event.placeName && `${event.placeName}, `}
                  {event.city}, Argentina
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="mt-auto">
            <Button variant="pcn" className="w-full">
              Ver evento
            </Button>
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
};

const EventStatusBadge: React.FC<{ status: 'upcoming' | 'in-progress' }> = ({ status }) => {
  if (status === 'in-progress') {
    return (
      <Badge className="shrink-0 whitespace-nowrap border-transparent bg-red-500 text-white hover:bg-red-500">
        <span className="relative mr-1.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        En vivo
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="shrink-0 animate-pulse whitespace-nowrap border-pcnPurple/40 text-pcnPurple dark:border-pcnGreen/40 dark:text-pcnGreen"
    >
      Inscripciones abiertas
    </Badge>
  );
};
