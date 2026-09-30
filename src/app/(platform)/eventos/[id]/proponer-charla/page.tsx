import { PageTitle } from '@/components/ui/page-title';
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
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitle
            path={[
              { label: 'eventos', href: '/eventos' },
              { label: event.name, href: `/eventos/${id}` },
              { label: 'proponer-charla' },
            ]}
          />

          <NewTalkProposalForm eventId={id} defaults={defaults} />
        </div>
      </div>
    </>
  );
};

export default ProponerCharlaPage;
