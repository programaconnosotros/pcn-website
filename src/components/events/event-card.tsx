'use server';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Event } from '@prisma/client';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  return (
    <Card className="flex flex-col overflow-hidden border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
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
          <CardTitle className="text-lg">{event.name}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1">
          {event.description && (
            <p className="mb-4 text-sm text-muted-foreground">{event.description}</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
            <p className="text-sm text-muted-foreground">
              {formatDate(event.date)}
              {event.endDate && ` - ${formatTime(event.endDate)}`}
            </p>
          </div>

          {(event.city || event.placeName) && (
            <div className="mt-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
              <p className="text-sm text-muted-foreground">
                {event.placeName && `${event.placeName}, `}
                {event.city}, Argentina
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="mt-auto">
          <Link href={`/eventos/${event.id}`} className="w-full">
            <Button variant="pcn" className="w-full">
              Ver evento
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
};
