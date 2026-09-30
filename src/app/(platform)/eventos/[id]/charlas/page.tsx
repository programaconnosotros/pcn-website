'use server';
import { PageTitle } from '@/components/ui/page-title';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchEvent } from '@/actions/events/fetch-event';
import { fetchTalks } from '@/actions/talks/fetch-talks';
import { TalksList } from '@/components/talks/talks-list';

const TalksPage = async (props: { params: Promise<{ id: string }> }) => {
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

  if (!session || session.user.role !== 'ADMIN') {
    redirect(`/eventos/${id}`);
  }

  const event = await fetchEvent(id);

  if (!event) {
    redirect('/eventos');
  }

  const talks = await fetchTalks(id);

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitle
            path={[
              { label: 'eventos', href: '/eventos' },
              { label: event.name, href: `/eventos/${id}` },
              { label: 'charlas' },
            ]}
          />

          <TalksList talks={talks} eventId={id} />
        </div>
      </div>
    </>
  );
};

export default TalksPage;
