'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppWindow, ExternalLink, Link2 } from 'lucide-react';
import { isEmbedded, isOsMessage, postToOsHost as post } from './os-env';

/** A link of this site that a PCN OS window can show, as `/path?query`; null for anything else. */
export const osLinkPath = (target: EventTarget | null) => {
  const anchor = (target as Element | null)?.closest?.('a[href]');
  if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute('download')) return null;
  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return null;
  return `${url.pathname}${url.search}`;
};

interface LinkMenu {
  x: number;
  y: number;
  path: string;
  /** The page it was opened on: navigating away drops it. */
  from: string;
}

const MENU_WIDTH = 232;
const MENU_HEIGHT = 124;

const itemClassName =
  'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-foreground/85 outline-none transition-colors hover:bg-pcnGreen/15 hover:text-pcnGreen focus-visible:bg-pcnGreen/15 focus-visible:text-pcnGreen';

/** The right-click menu for links inside a window, in the desktop's terminal style. */
function LinkContextMenu({ menu, onClose }: { menu: LinkMenu; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector('button')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('blur', onClose);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('blur', onClose);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  const run = (action: () => void) => () => {
    action();
    onClose();
  };
  const absolute = `${window.location.origin}${menu.path}`;

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Opciones del enlace"
      className="fixed z-[2147483647] overflow-hidden rounded-sm border border-pcnGreen-300 bg-black/95 py-1 font-mono shadow-[0_12px_40px_-12px_rgba(4,244,190,0.45)] backdrop-blur"
      style={{
        width: MENU_WIDTH,
        left: Math.max(4, Math.min(menu.x, window.innerWidth - MENU_WIDTH - 4)),
        top: Math.max(4, Math.min(menu.y, window.innerHeight - MENU_HEIGHT - 4)),
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <p className="truncate border-b border-pcnGreen-200 px-3 pb-1.5 pt-0.5 text-[10px] text-pcnGreen-600">
        ~{menu.path}
      </p>
      <button
        type="button"
        role="menuitem"
        className={itemClassName}
        onClick={run(() => post({ type: 'open', path: menu.path }))}
      >
        <AppWindow className="size-3.5 shrink-0" />
        Abrir en nueva ventana
      </button>
      <button
        type="button"
        role="menuitem"
        className={itemClassName}
        onClick={run(() => window.open(absolute, '_blank', 'noopener,noreferrer'))}
      >
        <ExternalLink className="size-3.5 shrink-0" />
        Abrir en una pestaña nueva
      </button>
      <button
        type="button"
        role="menuitem"
        className={itemClassName}
        onClick={run(() => void navigator.clipboard?.writeText(absolute).catch(() => {}))}
      >
        <Link2 className="size-3.5 shrink-0" />
        Copiar enlace
      </button>
    </div>
  );
}

/**
 * Runs inside a PCN OS window. Tells the desktop host where the window navigated to and when
 * the user interacts with it, so the host can update the title bar and bring it to the front.
 * Links navigate the window they're clicked in, like a browser tab; right-clicking one opens a
 * menu to show it in a new window instead. When the user signs in or out in another window, the
 * desktop relays it and this window re-renders so it stops showing the old session.
 */
export function OsBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState<LinkMenu | null>(null);

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
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== window.location.origin) return;
      if (isOsMessage(event.data) && event.data.type === 'session') router.refresh();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router]);

  useEffect(() => {
    if (!isEmbedded()) return;
    const onContextMenu = (event: MouseEvent) => {
      // Shift + right click keeps the browser's own menu, for "inspect" and friends.
      if (event.defaultPrevented || event.shiftKey) return;
      const path = osLinkPath(event.target);
      if (!path) return;
      event.preventDefault();
      setMenu({ x: event.clientX, y: event.clientY, path, from: window.location.pathname });
    };
    document.addEventListener('contextmenu', onContextMenu, true);
    return () => document.removeEventListener('contextmenu', onContextMenu, true);
  }, []);

  return menu && menu.from === pathname ? (
    <LinkContextMenu menu={menu} onClose={() => setMenu(null)} />
  ) : null;
}
