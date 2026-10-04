import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/themes/theme-provider';
import { OS_MODE_SCRIPT } from '@/components/os/os-display-mode-script';
import { EMBED_DETECTION_SCRIPT } from '@/components/os/os-env';
import { renderSectionCard } from '@/lib/og/section-cards';
import { mockHeaders } from '@/test/headers';
import { setLocation } from '@/test/dom';
import RootLayout, { metadata, viewport } from './layout';
import NotFound, { metadata as notFoundMetadata } from './not-found';
import Image, { alt } from './opengraph-image';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('geist/font/sans', () => ({
  GeistSans: { variable: 'geist-sans-var', className: 'geist-sans' },
}));
jest.mock('geist/font/mono', () => ({ GeistMono: { variable: 'geist-mono-var' } }));
jest.mock('@/components/themes/theme-provider', () => ({
  ThemeProvider: jest.fn(({ children }: { children: ReactNode }) => <>{children}</>),
}));
jest.mock('@/components/pwa-provider', () => ({
  PwaProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
jest.mock('@/components/react-query-provider', () => ({
  ReactQueryProvider: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
jest.mock('@/components/app-splash', () => ({ AppSplash: () => null }));
jest.mock('@/components/ui/sonner', () => ({ Toaster: () => null }));
jest.mock('@/components/ui/scroll-to-top', () => ({ ScrollToTop: () => null }));
jest.mock('@/components/ui/scroll-indicator', () => ({ ScrollIndicator: () => null }));
jest.mock('@/components/ui/hacker-cursor', () => ({ HackerCursor: () => null }));
jest.mock('@/components/ui/terminal-caret', () => ({ TerminalCaret: () => null }));
jest.mock('@/components/ui/vim-navigation', () => ({ VimNavigation: () => null }));
jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

const renderLayout = async () =>
  render(await RootLayout({ children: <p>contenido</p> }), { container: document });

describe('RootLayout', () => {
  it('sets the site-wide metadata: title template, PWA, RSS and share cards', () => {
    expect(metadata.title).toEqual({
      default: 'programaConNosotros:~$',
      template: '%s · pcn',
    });
    expect(metadata.metadataBase).toBeInstanceOf(URL);
    expect(metadata.appleWebApp).toMatchObject({ capable: true, title: 'PCN' });
    expect(metadata.alternates?.types).toEqual({
      'application/rss+xml': [{ url: '/feed.xml', title: 'programaConNosotros' }],
    });
    expect(metadata.openGraph).toMatchObject({ locale: 'es_AR', siteName: 'programaConNosotros' });
    expect(viewport).toEqual({ viewportFit: 'cover', themeColor: '#000000' });
  });

  it('passes the CSP nonce to the inline head script and the theme provider', async () => {
    mockHeaders({ 'x-nonce': 'abc123' });

    await renderLayout();

    expect(headers).toHaveBeenCalled();
    const script = document.head.querySelector('script')!;
    expect(script).toHaveAttribute('nonce', 'abc123');
    expect(script.innerHTML).toBe(EMBED_DETECTION_SCRIPT + OS_MODE_SCRIPT);
    expect(jest.mocked(ThemeProvider).mock.calls[0][0]).toMatchObject({
      nonce: 'abc123',
      attribute: 'class',
      forcedTheme: 'dark',
    });
  });

  it('renders without a nonce when the request has none', async () => {
    mockHeaders();

    await renderLayout();

    expect(document.head.querySelector('script')).not.toHaveAttribute('nonce');
    expect(jest.mocked(ThemeProvider).mock.calls[0][0].nonce).toBeUndefined();
  });

  it('wraps the page in Spanish with the Geist fonts', async () => {
    mockHeaders();

    await renderLayout();

    expect(document.documentElement).toHaveAttribute('lang', 'es');
    expect(document.documentElement).toHaveClass('geist-sans-var', 'geist-mono-var');
    expect(document.body).toHaveClass('geist-sans');
    expect(screen.getByRole('main')).toHaveTextContent('contenido');
  });
});

describe('NotFound', () => {
  it('tells which path does not exist and stays out of search engines', () => {
    setLocation('/no-existe');
    render(<NotFound />);

    expect(notFoundMetadata).toEqual({
      title: { absolute: '404: command not found' },
      robots: { index: false },
    });
    expect(screen.getByRole('main')).toHaveTextContent('/no-existe: No such file or directory');
  });
});

describe('default link preview', () => {
  it('uses the home card', async () => {
    expect(alt).toBe('inicio · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'inicio' });
    expect(renderSectionCard).toHaveBeenCalledWith('inicio');
  });
});
