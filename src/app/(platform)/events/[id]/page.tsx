'use server';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import EventLocation from '@/components/events/event-location';
import EventFlyer from '@/components/events/event-flyer';
import EventDetails from '@/components/events/event-details';
import EventPhotos from '@/components/events/event-photos';
import { Image as Images, Event } from '@prisma/client';
import { fetchEvent } from '@/actions/events/fetch-event';

type EventWithImages = Event & {
  images: Images[];
};

// TODO: Implement integration with talks

const EventDetailPage: React.FC<{ params: { id: string } }> = async ({ params }) => {
  const id: string = params.id;

  const event: EventWithImages | null = await fetchEvent(id);

  if (!event)
    return (
      <p className="w-full text-center text-sm text-muted-foreground">
        No se encontró el evento solicitado.
      </p>
    );

  return (
    <>
      <Breadcrumb className="mt-4 md:px-20">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href="/events">Eventos</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{event.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mx-auto flex items-center justify-center px-6 py-8 md:px-2">
        <div className="mt-4 w-[90vw] text-center md:w-[85vw]">
          <EventFlyer
            name={event.name}
            flyerSrc={event.flyerSrc}
            date={event.date}
            endDate={event.endDate}
          />

          <EventDetails description={event.description} />

          <EventLocation
            latitude={event.latitude}
            longitude={event.longitude}
            city={event.city}
            address={event.address}
            placeName={event.placeName}
          />

          <EventPhotos images={event.images}></EventPhotos>
        </div>
      </div>
    </>
  );
};

export default EventDetailPage;
