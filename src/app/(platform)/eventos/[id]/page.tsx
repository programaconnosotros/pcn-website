'use server';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/eventos">Eventos</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{event.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mx-auto flex items-center justify-center">
            <div className="w-full text-center">
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
        </div>
      </div>
    </>
  );
};

export default EventDetailPage;
