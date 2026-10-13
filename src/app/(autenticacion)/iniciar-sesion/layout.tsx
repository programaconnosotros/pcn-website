import type { Metadata } from 'next';

// The page is a client component, so its tab title lives here.
export const metadata: Metadata = { title: 'login' };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
