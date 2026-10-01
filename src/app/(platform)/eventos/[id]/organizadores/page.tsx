import { redirect } from 'next/navigation';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { EventOrganizersManager } from '@/components/events/event-organizers-manager';
import { fetchEvent } from '@/actions/events/fetch-event';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { canEditEvent, canManageEventOrganizers } from '@/lib/event-permissions';

const OrganizersPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  const [event, session] = await Promise.all([fetchEvent(id), getCurrentSession()]);
  if (!event) redirect('/eventos');

  // Quienes gestionan el evento ven al equipo; sumarlo o quitarlo queda para quien lo creó.
  if (!session || !canEditEvent(session.user, event)) redirect(`/eventos/${id}`);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path={[
              { label: 'eventos', href: '/eventos' },
              { label: event.name, href: `/eventos/${id}` },
              { label: 'organizadores' },
            ]}
            meta={`${event.organizers.length} organizadores`}
          />
        </StickyHeader>

        <EventOrganizersManager
          eventId={id}
          organizers={event.organizers.map(({ user }) => user)}
          canManage={canManageEventOrganizers(session.user, event)}
        />
      </div>
    </div>
  );
};

export default OrganizersPage;
