'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isEmbedded, opensInOwnWindow, postToOsHost as post } from './os-env';

/**
 * Runs inside a PCN OS window. Tells the desktop host where the window navigated to and when
 * the user interacts with it, so the host can update the title bar and bring it to the front.
 * Links to profiles and event details are handed to the host so they open in a new window, and
 * so is every link clicked on the home page, which stays open as the desktop's starting point.
 */
export function OsBridge() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isEmbedded()) return;
    // Wait a frame so Next.js has applied the new page metadata to document.title.
    const timeout = window.setTimeout(() => {
      post({
        type: 'location',
        path: `${window.location.pathname}${window.location.search}`,
        title: document.title,
      });
    }, 50);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    if (!isEmbedded()) return;
    const onPointerDown = () => post({ type: 'focus' });
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, []);

  useEffect(() => {
    if (!isEmbedded()) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank') return;
      if (anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return;
      if (url.pathname === window.location.pathname) return;
      const fromHome = window.location.pathname === '/';
      if (!fromHome && !opensInOwnWindow(url.pathname)) return;
      event.preventDefault();
      post({ type: 'open', path: `${url.pathname}${url.search}` });
    };
    // Capture phase, so this runs before Next.js' <Link> starts a client-side navigation.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
