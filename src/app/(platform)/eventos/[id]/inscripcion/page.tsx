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
import { fetchEvent } from '@/actions/events/fetch-event';
import { EventRegistrationForm } from '@/components/events/event-registration-form';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { checkEventCapacity } from '@/actions/events/check-event-capacity';

const EventRegistrationPage = async ({ params }: { params: { id: string } }) => {
  const id = params.id;

  const event = await fetchEvent(id);

  if (!event) {
    redirect('/eventos');
  }

  // Verificar cupo disponible
  const capacityCheck = await checkEventCapacity(id);

  // Obtener datos del usuario si está logueado
  const sessionId = cookies().get('sessionId')?.value;
  let userData = null;
  let isRegistered = false;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (session?.user) {
      const nameParts = session.user.name.split(' ');
      userData = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: session.user.email,
        jobTitle: session.user.jobTitle || '',
        enterprise: session.user.enterprise || '',
        university: session.user.university || '',
        career: session.user.career || '',
      };

      // Verificar si el usuario ya está registrado en este evento
      const registration = await prisma.eventRegistration.findFirst({
        where: {
          eventId: id,
          userId: session.userId,
        },
      });
      isRegistered = !!registration;

      // Si no está registrado por userId, verificar por email
      if (!isRegistered && userData.email) {
        const registrationByEmail = await prisma.eventRegistration.findUnique({
          where: {
            eventId_email: {
              eventId: id,
              email: userData.email,
            },
          },
        });
        isRegistered = !!registrationByEmail;
      }
    }
  }

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
                <BreadcrumbPage>Inscripción</BreadcrumbPage>
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
            <Heading2 className="m-0">Inscripción a {event.name}</Heading2>
          </div>

          {isRegistered ? (
            <div className="mx-auto max-w-2xl">
              <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                    <CheckCircle2 className="h-16 w-16 text-pcnPurple dark:text-pcnGreen" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Ya estás inscrito</h3>
                      <p className="text-muted-foreground">
                        Ya estás registrado en este evento. ¡Te esperamos!
                      </p>
                    </div>
                    <Link href={`/eventos/${id}`}>
                      <Button variant="pcn">Volver al evento</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : !capacityCheck.available ? (
            <div className="mx-auto max-w-2xl">
              <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                    <AlertCircle className="h-16 w-16 text-destructive" />
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Cupo completo</h3>
                      <p className="text-muted-foreground">
                        Lo sentimos, el cupo del evento está completo. No se pueden aceptar más
                        inscripciones.
                      </p>
                      {capacityCheck.capacity && (
                        <p className="text-sm text-muted-foreground">
                          {capacityCheck.current} de {capacityCheck.capacity} cupos ocupados
                        </p>
                      )}
                    </div>
                    <Link href={`/eventos/${id}`}>
                      <Button variant="outline">Volver al evento</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <EventRegistrationForm
              eventId={id}
              userData={userData}
              capacityInfo={capacityCheck}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default EventRegistrationPage;


