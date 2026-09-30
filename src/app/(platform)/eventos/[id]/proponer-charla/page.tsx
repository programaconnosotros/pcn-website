import { SubPageTitle } from '@/components/events/sub-page-title';
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

  if (!event || !event.callForSpeakersEnabled) {
    redirect(`/eventos/${id}`);
  }

  const user = session.user;

  const defaults = {
    firstSpeaker: {
      userId: user.id,
      speakerName: user.name,
      speakerPhone: user.phoneNumber ?? '',
      isProfessional: !!(user.jobTitle && user.enterprise),
      jobTitle: user.jobTitle ?? '',
      enterprise: user.enterprise ?? '',
      isStudent: !!(user.career && user.studyPlace),
      career: user.career ?? '',
      studyPlace: user.studyPlace ?? '',
    },
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
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <SubPageTitle
            backHref={`/eventos/${id}`}
            path="eventos/proponer-charla · "
            title={event.name}
          />

          <NewTalkProposalForm eventId={id} defaults={defaults} />
        </div>
      </div>
    </>
  );
};

export default ProponerCharlaPage;
