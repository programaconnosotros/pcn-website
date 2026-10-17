import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { findSession } from '@/lib/session';
import { tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: tabTitle.sudo('usuarios'),
  description: 'Conocé a los miembros de programaConNosotros.',
  openGraph: {
    title: 'Usuarios',
    description: 'Conocé a los miembros de programaConNosotros.',
    url: `${SITE_URL}/usuarios`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Usuarios',
    description: 'Conocé a los miembros de programaConNosotros.',
  },
};

export default async function UsuariosLayout({ children }: { children: React.ReactNode }) {
  const sessionId = (await cookies()).get('sessionId')?.value;

  // Non-admins land on the public member directory instead.
  if (!sessionId) {
    redirect('/miembros');
  }

  const session = await findSession(sessionId);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/miembros');
  }

  return <>{children}</>;
}
