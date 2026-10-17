import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { WorkPlacesClient } from '@/components/work-places/work-places-client';
import { findSession } from '@/lib/session';
import { listWorkPlaces } from '@/lib/work-places';
import { tabTitle } from '@/lib/tab-title';

export const metadata: Metadata = {
  title: tabTitle.ls('lugares'),
  description:
    'Cafés, coworks y bibliotecas copados para laburar que recomienda la comunidad: qué tal el wifi, si hay enchufes, si se puede tener llamadas y qué tal la comida.',
};

const LugaresPage = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  const [places, session] = await Promise.all([
    listWorkPlaces(),
    sessionId ? findSession(sessionId) : null,
  ]);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <WorkPlacesClient
        places={places}
        viewer={session ? { id: session.userId, isAdmin: session.user.role === 'ADMIN' } : null}
      />
    </div>
  );
};

export default LugaresPage;
