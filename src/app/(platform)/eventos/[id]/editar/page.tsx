import { SubPageTitle } from '@/components/events/sub-page-title';
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
    flyerImages: event.flyerImages,
    latitude: event.latitude?.toString() || '',
    longitude: event.longitude?.toString() || '',
    capacity: event.capacity?.toString() || '',
    externalRegistrationUrl: event.externalRegistrationUrl ?? '',
    shortcut: event.shortcut ?? '',
    isOnline: event.isOnline ?? false,
    streamingUrl: event.streamingUrl ?? '',
    markedAsFull: event.markedAsFull ?? false,
    callForSpeakersEnabled: event.callForSpeakersEnabled ?? false,
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
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <SubPageTitle
            backHref={`/eventos/${id}`}
            path="eventos/"
            title="editar"
            action={<DeleteEventButton eventId={id} eventName={event.name} />}
          />

          <EditEventForm eventId={id} defaultValues={defaultValues} />
        </div>
      </div>
    </>
  );
};

export default EditEventPage;
