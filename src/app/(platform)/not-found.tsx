import type { Metadata } from 'next';
import { NotFoundScreen } from '@/components/errors/not-found-screen';
import { NOT_FOUND_TAB_TITLE } from '@/lib/tab-title';

export const metadata: Metadata = {
  title: { absolute: NOT_FOUND_TAB_TITLE },
  robots: { index: false },
};

// `notFound()` inside a platform page renders here, keeping the sidebar and tab bar.
export default function PlatformNotFound() {
  return <NotFoundScreen />;
}
