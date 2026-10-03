import type { Metadata } from 'next';
import { OfflineScreen } from './offline-screen';
import { OFFLINE_TAB_TITLE } from '@/lib/tab-title';

export const metadata: Metadata = {
  title: { absolute: OFFLINE_TAB_TITLE },
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
