import { ReactQueryProvider } from '@/components/react-query-provider';
import { ThemeProvider } from '@/components/themes/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { ScrollIndicator } from '@/components/ui/scroll-indicator';
import prisma from '@/lib/prisma';
import { User } from '@prisma/client';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: {
    default: 'programaConNosotros',
    template: '%s - PCN',
  },
  description: 'Comunidad de apasionados por la ingeniería de software.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'programaConNosotros',
    title: 'programaConNosotros (PCN)',
    description: 'Comunidad de apasionados por la ingeniería de software.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'programaConNosotros (PCN)',
    description: 'Comunidad de apasionados por la ingeniería de software.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const defaultOpen = (await cookies().get('sidebar_state')?.value) === 'true';
  const sessionId = await cookies().get('sessionId')?.value;

  let user: User | null = null;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (session) {
      user = session.user;
    }
  }

  return (
    <html lang="es">
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster closeButton position="top-center" />
          <ScrollToTop />
          <ScrollIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
