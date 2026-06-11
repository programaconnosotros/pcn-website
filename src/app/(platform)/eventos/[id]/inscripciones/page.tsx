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
import { Heading2 } from '@/components/ui/heading-2';
import { ArrowLeft, Briefcase, GraduationCap, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchEvent } from '@/actions/events/fetch-event';
import { getEventRegistrations } from '@/actions/events/get-event-registrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationsDataTable } from '@/components/events/registrations-data-table';

const EventRegistrationsPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;

  // Verificar autenticación y permisos de admin
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    redirect(`/eventos/${id}`);
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect(`/eventos/${id}`);
  }

  // Obtener evento
  const event = await fetchEvent(id);

  if (!event) {
    redirect('/eventos');
  }

  // Obtener todas las inscripciones
  const registrations = await getEventRegistrations(id);

  const activeRegistrations = registrations.filter((r) => r.cancelledAt === null);
  const cancelledRegistrations = registrations.filter((r) => r.cancelledAt !== null);

  // Contar estudiantes y profesionales (solo inscripciones activas)
  const studentsCount = activeRegistrations.filter((r) => r.career && r.studyPlace).length;
  const professionalsCount = activeRegistrations.filter((r) => r.jobTitle && r.enterprise).length;

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
                <BreadcrumbPage>Inscripciones</BreadcrumbPage>
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
              <Heading2 className="m-0">Inscripciones - {event.name}</Heading2>
            </div>
          </div>

          {/* Tarjetas resumen */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inscripciones activas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{activeRegistrations.length}</p>
                <p className="text-xs text-muted-foreground">
                  {cancelledRegistrations.length} cancelada
                  {cancelledRegistrations.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{studentsCount}</p>
                <p className="text-xs text-muted-foreground">con carrera y lugar de estudio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profesionales</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{professionalsCount}</p>
                <p className="text-xs text-muted-foreground">con cargo y empresa</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de inscripciones */}
          <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Inscripciones ({registrations.length} total — {activeRegistrations.length} activas,{' '}
                {cancelledRegistrations.length} canceladas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RegistrationsDataTable data={registrations} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EventRegistrationsPage;
