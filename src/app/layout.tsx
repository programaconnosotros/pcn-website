import { ReactQueryProvider } from '@/components/react-query-provider';
import { ThemeProvider } from '@/components/themes/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { ScrollIndicator } from '@/components/ui/scroll-indicator';
import { HackerCursor } from '@/components/ui/hacker-cursor';
import { TerminalCaret } from '@/components/ui/terminal-caret';
import { VimNavigation } from '@/components/ui/vim-navigation';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import type { Metadata, Viewport } from 'next';
import { EMBED_DETECTION_SCRIPT } from '@/components/os/os-env';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'programaConNosotros',
    template: '%s - PCN',
  },
  description: 'Comunidad de apasionados por la ingeniería de software.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  alternates: {
    types: { 'application/rss+xml': [{ url: '/feed.xml', title: 'programaConNosotros' }] },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'programaConNosotros',
    title: 'programaConNosotros',
    description: 'Comunidad de apasionados por la ingeniería de software.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'programaConNosotros',
    description: 'Comunidad de apasionados por la ingeniería de software.',
  },
};

// `cover` lets fixed bottom UI (the mobile tab bar) extend under the iOS home indicator /
// Safari toolbar; without it `env(safe-area-inset-*)` is always 0.
export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: '#000000',
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: EMBED_DETECTION_SCRIPT }} />
      </head>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster closeButton position="top-right" />
          <ScrollToTop />
          <ScrollIndicator />
          <HackerCursor />
          <TerminalCaret />
          <VimNavigation />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
