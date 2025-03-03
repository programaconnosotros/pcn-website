import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/themes/theme-provider';
import { ReactQueryProvider } from '@/components/react-query-provider';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { User } from '@prisma/client';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
export const metadata: Metadata = {
  title: 'programaConNosotros',
  description: 'Desarrollado y mantenido para y por la comunidad.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
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
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
