'use server'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import EventLocation from "@/components/events/event-location";
import EventFlyer from "@/components/events/event-flyer";
import EventDetails from "@/components/events/event-details";
import EventPhotos from "@/components/events/event-photos";
import { Image as Images, Event } from '@prisma/client';
import { fetchEvent } from '@/actions/events/fetch-event';

type EventWithImages = Event & {
    images: Images[];
};

// TODO: implement the map using iframe to avoid Google maps pricing?
// TODO: Should we wait to implement link with talks? Because that section doesn't exist yet 
// TODO: Add a textual address for the event location, I think I should rename location in
// eventlist to event city?
// TODO: Connection with talks => The code related to these is commented by now

const EventDetailPage = async ({ params }: { params: { id: string } }) => {

    const id: string = params.id;

    const event: EventWithImages | null = await fetchEvent(id);

    if (!event) return <p className="w-full text-center text-sm text-muted-foreground">
        No se encontró el evento solicitado.
    </p>

    return (
        <>
            {
                event && (
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

                        <div className="max-w-screen-xl mx-auto px-4 py-8">

                            <div className="mt-4 text-center">

                                <EventFlyer name={event.name} flyerSrc={event.flyerSrc} date={event.date} endDate={event.endDate} />

                                <EventDetails description={event.description} />

                                <EventLocation latitude={event.latitude} longitude={event.longitude} />

                                {/* 
                                <Heading3 className="text-2xl font-semibold mt-4 mb-4">
                                    Charlas del evento
                                </Heading3> */}

                                <EventPhotos images={event.images}></EventPhotos>

                            </div>
                        </div>
                    </>
                )
            }
        </>
    )
}

export default EventDetailPage;
