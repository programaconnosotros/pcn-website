import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Heading2 } from '@/components/ui/heading-2';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchEventForEdit } from '@/actions/events/fetch-event-for-edit';
import { EditEventForm } from '@/components/events/edit-event-form';
import { DeleteEventButton } from '@/components/events/delete-event-button';

const EditEventPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;

  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    redirect(`/eventos/${id}`);
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    redirect(`/eventos/${id}`);
  }

  if (session.user.role !== 'ADMIN') {
    redirect(`/eventos/${id}`);
  }

  const event = await fetchEventForEdit(id);

  if (!event) {
    redirect('/eventos');
  }

  const defaultValues = {
    name: event.name,
    description: event.description,
    date: event.date.toISOString(),
    endDate: event.endDate?.toISOString() ?? '',
    city: event.city ?? '',
    address: event.address ?? '',
    placeName: event.placeName ?? '',
    flyerSrc: event.flyerSrc,
    latitude: event.latitude?.toString() || '',
    longitude: event.longitude?.toString() || '',
    capacity: event.capacity?.toString() || '',
    externalRegistrationUrl: event.externalRegistrationUrl ?? '',
    isOnline: event.isOnline ?? false,
    streamingUrl: event.streamingUrl ?? '',
    markedAsFull: event.markedAsFull ?? false,
    sponsors:
      event.sponsors?.map((sponsor) => ({
        name: sponsor.name,
        website: sponsor.website || '',
      })) || [],
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/eventos">Eventos</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/eventos/${id}`}>{event.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Editar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/eventos/${id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Heading2 className="m-0">Editar evento</Heading2>
            </div>
            <DeleteEventButton eventId={id} eventName={event.name} />
          </div>

          <EditEventForm eventId={id} defaultValues={defaultValues} />
        </div>
      </div>
    </>
  );
};

export default EditEventPage;
