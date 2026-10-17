import type { Metadata } from 'next';
import { NotFoundScreen } from '@/components/errors/not-found-screen';
import { NOT_FOUND_TAB_TITLE } from '@/lib/tab-title';

export const metadata: Metadata = {
  title: { absolute: NOT_FOUND_TAB_TITLE },
  robots: { index: false },
};

// Unmatched URLs render here, outside the platform layout, so fill the viewport.
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col">
      <NotFoundScreen />
    </main>
  );
}
