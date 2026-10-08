import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { NewEventForm } from '@/components/events/new-event-form';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { canCreateEvents } from '@/lib/event-permissions';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { tabTitle } from '@/lib/tab-title';

export const metadata: Metadata = { title: tabTitle.touch('eventos/nuevo') };

const NewEventPage = async () => {
  const session = await getCurrentSession();

  // Admins y ambassadors crean eventos
  const user = session?.user;
  if (!canCreateEvents(user)) {
    redirect('/eventos');
  }

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <PageTitle path="eventos/nuevo" />
          </StickyHeader>

          <NewEventForm flyerAgent={user?.role === 'ADMIN'} />
        </div>
      </div>
    </>
  );
};

export default NewEventPage;
