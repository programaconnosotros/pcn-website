import { ReactQueryProvider } from '@/components/react-query-provider';
import { ThemeProvider } from '@/components/themes/theme-provider';
import { PwaProvider } from '@/components/pwa-provider';
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
import { OS_MODE_SCRIPT } from '@/components/os/os-display-mode-script';
import { AppSplash } from '@/components/app-splash';
import { APPLE_STARTUP_IMAGES } from '@/lib/apple-splash';
import './globals.css';
import { HOME_TAB_TITLE, TAB_TITLE_TEMPLATE } from '@/lib/tab-title';
import { headers } from 'next/headers';
import { NONCE_HEADER } from '@/lib/csp';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TAB_TITLE,
    template: TAB_TITLE_TEMPLATE,
  },
  description: 'Comunidad de apasionados por la ingeniería de software.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  // Installed from Safari (Compartir → Agregar a inicio) it opens full screen, like on Android.
  appleWebApp: {
    capable: true,
    title: 'PCN',
    statusBarStyle: 'black',
    // Launch screens so the installed app doesn't open on a black screen.
    startupImage: APPLE_STARTUP_IMAGES,
  },
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
  // El nonce de la CSP de este request (src/proxy.ts): sin él, el navegador no corre el script
  // inline del <head>.
  const nonce = (await headers()).get(NONCE_HEADER) ?? undefined;

  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: EMBED_DETECTION_SCRIPT + OS_MODE_SCRIPT }}
        />
      </head>
      <body className={GeistSans.className}>
        <AppSplash />
        <ThemeProvider
          nonce={nonce}
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <PwaProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
            <Toaster closeButton position="top-right" />
            <ScrollToTop />
            <ScrollIndicator />
            <HackerCursor />
            <TerminalCaret />
            <VimNavigation />
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
