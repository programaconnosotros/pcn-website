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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchEvent } from '@/actions/events/fetch-event';
import { NewTalkProposalForm } from '@/components/talk-proposals/new-talk-proposal-form';

const ProponerCharlaPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;

  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    redirect(`/autenticacion/iniciar-sesion?redirect=/eventos/${id}/proponer-charla`);
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    redirect(`/autenticacion/iniciar-sesion?redirect=/eventos/${id}/proponer-charla`);
  }

  const event = await fetchEvent(id);

  if (!event || !event.callForTalksEnabled) {
    redirect(`/eventos/${id}`);
  }

  const user = session.user;

  const defaults = {
    speakerName: user.name,
    speakerPhone: user.phoneNumber ?? '',
    isProfessional: !!(user.jobTitle && user.enterprise),
    jobTitle: user.jobTitle ?? '',
    enterprise: user.enterprise ?? '',
    isStudent: !!(user.career && user.studyPlace),
    career: user.career ?? '',
    studyPlace: user.studyPlace ?? '',
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
                <BreadcrumbPage>Proponer charla</BreadcrumbPage>
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
            <Heading2 className="m-0">Proponer charla — {event.name}</Heading2>
          </div>

          <NewTalkProposalForm eventId={id} defaults={defaults} />
        </div>
      </div>
    </>
  );
};

export default ProponerCharlaPage;
