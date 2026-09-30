import { ReactQueryProvider } from '@/components/react-query-provider';
import { ThemeProvider } from '@/components/themes/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { ScrollIndicator } from '@/components/ui/scroll-indicator';
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
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'programaConNosotros',
    title: 'programaConNosotros',
    description: 'Comunidad de apasionados por la ingeniería de software.',
    images: ['/pcn-link-preview.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'programaConNosotros',
    description: 'Comunidad de apasionados por la ingeniería de software.',
    images: ['/pcn-link-preview.png'],
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
        {/* Opaque strip under the iOS status bar. With `viewport-fit=cover` the page scrolls
            behind it, and Safari 26 tints the status bar from whatever fixed element touches
            the top edge, so page content would otherwise show above the first row. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[max(env(safe-area-inset-top),1px)] bg-background embedded:hidden md:hidden"
        />
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
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
