import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Usuarios (PCN)',
  description: 'Conocé a los miembros de programaConNosotros.',
  openGraph: {
    title: 'Usuarios (PCN)',
    description: 'Conocé a los miembros de programaConNosotros.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/usuarios`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Usuarios (PCN)',
    description: 'Conocé a los miembros de programaConNosotros.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

export default async function UsuariosLayout({ children }: { children: React.ReactNode }) {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    redirect('/home');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/home');
  }

  return <>{children}</>;
}
