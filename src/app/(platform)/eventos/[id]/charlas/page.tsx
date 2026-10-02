'use server';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';

import { getEventManager } from '@/lib/event-access';
import { redirect } from 'next/navigation';
import { fetchEvent } from '@/actions/events/fetch-event';
import { fetchTalks } from '@/actions/talks/fetch-talks';
import { TalksList } from '@/components/talks/talks-list';

const TalksPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;

  // Admins del sitio y quienes gestionan este evento
  if (!(await getEventManager(id))) {
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
          <StickyHeader>
            <PageTitle
              path={[
                { label: 'eventos', href: '/eventos' },
                { label: event.name, href: `/eventos/${id}` },
                { label: 'charlas' },
              ]}
            />
          </StickyHeader>

          <TalksList talks={talks} eventId={id} />
        </div>
      </div>
    </>
  );
};

export default TalksPage;
