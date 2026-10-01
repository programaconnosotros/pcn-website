import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { NewEventForm } from '@/components/events/new-event-form';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { canCreateEvents } from '@/lib/event-permissions';
import { redirect } from 'next/navigation';

const NewEventPage = async () => {
  const session = await getCurrentSession();

  // Admins y ambassadors crean eventos
  if (!canCreateEvents(session?.user)) {
    redirect('/eventos');
  }

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <PageTitle path="eventos/nuevo" />
          </StickyHeader>

          <NewEventForm />
        </div>
      </div>
    </>
  );
};

export default NewEventPage;
