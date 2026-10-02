import type { Metadata } from 'next';
import { OfflineScreen } from './offline-screen';

export const metadata: Metadata = {
  title: 'Sin conexión',
  robots: { index: false },
};

// The service worker serves this page, precached, whenever a navigation fails for lack of
// network. It must stay static: no session, no database.
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <OfflineScreen />
    </main>
  );
}
