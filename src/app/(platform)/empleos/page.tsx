import type { Metadata } from 'next';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { JobOffersClient } from '@/components/job-offers/job-offers-client';
import { listOpenJobOffers } from '@/lib/job-offers';
import { tabTitle } from '@/lib/tab-title';

export const metadata: Metadata = {
  title: tabTitle.ls('empleos'),
  description:
    'Búsquedas laborales que comparte la comunidad de programaConNosotros: puestos de desarrollo, QA, diseño y más, remotos, híbridos y presenciales.',
};

export default async function EmpleosPage() {
  const [offers, session] = await Promise.all([listOpenJobOffers(), getCurrentSession()]);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <JobOffersClient
        offers={offers}
        viewer={session ? { id: session.user.id, isAdmin: session.user.role === 'ADMIN' } : null}
      />
    </div>
  );
}
