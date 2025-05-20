'use server';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Event } from '@prisma/client';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BreadcrumbLink } from '../ui/breadcrumb';

export const EventCard: React.FC<{ event: Event }> = ({ event }) => (
  <Card key={event.id} className="flex h-full flex-col">
    <img
      src={event.flyerSrc}
      alt={`Flyer for ${event.name}`}
      className="h-[200px] w-full object-cover"
    />

    <CardContent className="px-4 py-2">
      <div className="mt-1 flex justify-between">
        <p className="mt-2 text-xs text-gray-500">
          {format(new Date(event.date), 'EEE, d MMM, HH:mm', { locale: es })}
          {event.endDate && ` - ${format(new Date(event.endDate), 'HH:mm', { locale: es })}`}
        </p>
      </div>

      <CardHeader className="px-0 py-2">{event.name}</CardHeader>

      <div className="flex">
        <MapPin className="mt-4 h-4 w-4 text-gray-500" />
        <p className="ml-1 mt-4 text-xs text-gray-500">{event.city}, AR</p>
      </div>
    </CardContent>

    <BreadcrumbLink href={`events/${event.id}`} className="mt-auto">
      <Button className="mb-4 ml-4 mt-1">Ver evento</Button>
    </BreadcrumbLink>
  </Card>
);
