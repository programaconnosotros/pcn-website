import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/themes/theme-provider';
import { ReactQueryProvider } from '@/components/react-query-provider';

export const metadata: Metadata = {
  title: 'programaConNosotros',
  description: 'Desarrollado y mantenido para y por la comunidad.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="es">
    <body className={GeistSans.className}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster closeButton position="top-center" />
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
