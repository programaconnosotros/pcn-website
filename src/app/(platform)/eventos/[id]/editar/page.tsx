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
import { EventForm } from '@/components/events/event-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchEvent } from '@/actions/events/fetch-event';
import { EventFormData } from '@/schemas/event-schema';
import { EditEventForm } from '@/components/events/edit-event-form';

const EditEventPage = async ({ params }: { params: { id: string } }) => {
  const id = params.id;

  const sessionId = cookies().get('sessionId')?.value;

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

  const event = await fetchEvent(id);

  if (!event) {
    redirect('/eventos');
  }

  // Convertir las fechas a formato datetime-local
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const defaultValues: EventFormData = {
    name: event.name,
    description: event.description,
    date: formatDateForInput(event.date),
    endDate: event.endDate ? formatDateForInput(event.endDate) : '',
    city: event.city,
    address: event.address,
    placeName: event.placeName,
    flyerSrc: event.flyerSrc,
    latitude: event.latitude?.toString() || '',
    longitude: event.longitude?.toString() || '',
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
                <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
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
          <div className="mb-6 flex items-center gap-4">
            <Link href={`/eventos/${id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Heading2 className="m-0">Editar evento</Heading2>
          </div>

          <EditEventForm eventId={id} defaultValues={defaultValues} />
        </div>
      </div>
    </>
  );
};

export default EditEventPage;

