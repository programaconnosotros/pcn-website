import { PageTitle } from '@/components/ui/page-title';
import { NewEventForm } from '@/components/events/new-event-form';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const NewEventPage = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    redirect('/eventos');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    redirect('/eventos');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/eventos');
  }

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitle path="eventos/nuevo" />

          <NewEventForm />
        </div>
      </div>
    </>
  );
};

export default NewEventPage;
