'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { OS_MESSAGE_SOURCE, isEmbedded, type OsMessage } from './os-env';

type OutgoingMessage = OsMessage extends infer M
  ? M extends OsMessage
    ? Omit<M, 'source'>
    : never
  : never;

const post = (message: OutgoingMessage) =>
  window.parent.postMessage({ source: OS_MESSAGE_SOURCE, ...message }, window.location.origin);

/**
 * Runs inside a PCN OS window. Tells the desktop host where the window navigated to and when
 * the user interacts with it, so the host can update the title bar and bring it to the front.
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

  return null;
}
