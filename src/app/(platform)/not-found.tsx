import type { Metadata } from 'next';
import { NotFoundScreen } from '@/components/errors/not-found-screen';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false },
};

// `notFound()` inside a platform page renders here, keeping the sidebar and tab bar.
export default function PlatformNotFound() {
  return <NotFoundScreen />;
}
