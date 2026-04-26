'use server';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EventStatusBadge } from '@/components/events/event-status-badge';
import { fetchEvents } from '@/actions/events/fetch-events';
import { Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

type EventWithCount = Awaited<ReturnType<typeof fetchEvents>>[number];

export const EventCard: React.FC<{ event: EventWithCount }> = ({ event }) => {
  const isFull =
    event.markedAsFull || (event.capacity !== null && event._count.registrations >= event.capacity);
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

  return (
    <Link href={`/eventos/${event.id}`}>
      <Card className="flex h-full flex-col overflow-hidden border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800">
        {event.flyerSrc && (
          <div className="relative aspect-square w-full shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
              <EventStatusBadge date={event.date} endDate={event.endDate} isFull={isFull} />
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
