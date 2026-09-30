import type { Metadata } from 'next';
import { NotFoundScreen } from '@/components/errors/not-found-screen';

export const metadata: Metadata = {
  title: 'Página no encontrada',
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
