import type { Metadata } from 'next';

// Admin-only page: keep it out of search results. Lives in a layout because the page is a
// 'use server' module, which can only export async functions.
export const metadata: Metadata = {
  title: 'Visitas',
  robots: { index: false, follow: false },
};

export default function VisitasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
