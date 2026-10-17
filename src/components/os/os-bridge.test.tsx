/* eslint-disable @next/next/no-html-link-for-pages -- the bridge sees the plain anchors <Link> renders */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockRouter, setLocation } from '@/test/dom';
import { OsBridge } from './os-bridge';
import { OS_MESSAGE_SOURCE } from './os-env';

const root = document.documentElement;

const renderBridge = (links: React.ReactNode = null) =>
  render(
    <>
      <OsBridge />
      {links}
    </>,
  );

/** Clicks a link and returns whether the bridge took the click over. */
const click = (element: Element, init: MouseEventInit = {}) => {
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
  element.dispatchEvent(event);
  return event.defaultPrevented;
};

/** Right-clicks an element and returns whether the bridge replaced the browser's menu. */
const contextMenu = (element: Element, init: MouseEventInit = {}) => {
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, ...init });
  act(() => {
    element.dispatchEvent(event);
  });
  return event.defaultPrevented;
};

let post: jest.SpyInstance;

beforeEach(() => {
  root.setAttribute('data-embedded', '');
  post = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  window.history.replaceState(null, '', '/feed');
});

afterEach(() => {
  root.removeAttribute('data-embedded');
  window.history.replaceState(null, '', '/');
  jest.useRealTimers();
  post.mockRestore();
});

const sent = () => post.mock.calls.map(([message]) => message);

describe('OsBridge', () => {
  it('does nothing outside a PCN OS window', () => {
    root.removeAttribute('data-embedded');
    renderBridge(<a href="/perfil/abc">perfil</a>);
    window.dispatchEvent(new Event('pointerdown'));
    expect(click(screen.getByText('perfil'))).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it('reports the location and title after navigating', () => {
    jest.useFakeTimers();
    document.title = 'cat ~/feed · pcn';
    setLocation('/feed');
    renderBridge();
    act(() => jest.advanceTimersByTime(50));
    expect(sent()).toContainEqual({
      source: OS_MESSAGE_SOURCE,
      type: 'location',
      path: '/feed',
      title: 'cat ~/feed · pcn',
    });
  });

  it('asks the desktop for focus on pointer down', () => {
    renderBridge();
    window.dispatchEvent(new Event('pointerdown'));
    expect(sent()).toContainEqual({ source: OS_MESSAGE_SOURCE, type: 'focus' });
  });

  it('refreshes when the desktop relays a session change from its parent', () => {
    renderBridge();
    const message = (data: unknown, source: MessageEventSource | null, origin: string) =>
      act(() => {
        window.dispatchEvent(new MessageEvent('message', { data, source, origin }));
      });
    const session = { source: OS_MESSAGE_SOURCE, type: 'session' };

    message(session, window.parent, 'https://evil.example');
    message({ source: OS_MESSAGE_SOURCE, type: 'focus' }, window.parent, window.location.origin);
    expect(mockRouter.refresh).not.toHaveBeenCalled();

    message(session, window.parent, window.location.origin);
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
  });

  it('lets every link navigate the window it was clicked in', () => {
    window.history.replaceState(null, '', '/');
    renderBridge(
      <>
        <a href="/perfil/abc">perfil</a>
        <a href="/eventos/meetup">evento</a>
        <a href="/feed">feed</a>
      </>,
    );
    for (const text of ['perfil', 'evento', 'feed'])
      expect(click(screen.getByText(text))).toBe(false);
    expect(sent().filter((m) => m.type === 'open')).toEqual([]);
  });

  it('offers to open a link in a new window from its right-click menu', async () => {
    renderBridge(<a href="/perfil/abc?tab=1">perfil</a>);
    expect(contextMenu(screen.getByText('perfil'))).toBe(true);

    await userEvent.click(screen.getByRole('menuitem', { name: 'Abrir en nueva ventana' }));
    expect(sent()).toContainEqual({
      source: OS_MESSAGE_SOURCE,
      type: 'open',
      path: '/perfil/abc?tab=1',
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('can open the link in a browser tab or copy it instead', async () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderBridge(<a href="/eventos/meetup">evento</a>);

    contextMenu(screen.getByText('evento'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Abrir en una pestaña nueva' }));
    expect(open).toHaveBeenCalledWith(
      `${window.location.origin}/eventos/meetup`,
      '_blank',
      'noopener,noreferrer',
    );

    contextMenu(screen.getByText('evento'));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Copiar enlace' }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/eventos/meetup`);
    open.mockRestore();
  });

  it('closes the menu with Escape', async () => {
    renderBridge(<a href="/perfil/abc">perfil</a>);
    contextMenu(screen.getByText('perfil'));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('keeps the browser menu for anything that is not a link of the site', () => {
    renderBridge(
      <>
        <a href="https://example.com/perfil/abc">externo</a>
        <a href="/api/perfil/abc">api</a>
        <a href="/perfil/abc" download>
          descarga
        </a>
        <a href="/perfil/abc">perfil</a>
        <span>sin link</span>
      </>,
    );
    for (const text of ['externo', 'api', 'descarga', 'sin link'])
      expect(contextMenu(screen.getByText(text))).toBe(false);
    expect(contextMenu(screen.getByText('perfil'), { shiftKey: true })).toBe(false);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('leaves alone a right click something else already handled', () => {
    renderBridge(<a href="/perfil/abc">perfil</a>);
    // A capture listener on window runs before the bridge's one on document.
    const handled = (e: Event) => e.preventDefault();
    window.addEventListener('contextmenu', handled, { capture: true });
    contextMenu(screen.getByText('perfil'));
    window.removeEventListener('contextmenu', handled, { capture: true });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
