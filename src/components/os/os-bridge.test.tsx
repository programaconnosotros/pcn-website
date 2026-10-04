/* eslint-disable @next/next/no-html-link-for-pages -- the bridge sees the plain anchors <Link> renders */
import { act, render, screen } from '@testing-library/react';
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

  it('hands profile and event links to the desktop', () => {
    renderBridge(
      <>
        <a href="/perfil/abc?tab=1">perfil</a>
        <a href="/eventos/meetup">evento</a>
      </>,
    );
    expect(click(screen.getByText('perfil'))).toBe(true);
    expect(sent()).toContainEqual({
      source: OS_MESSAGE_SOURCE,
      type: 'open',
      path: '/perfil/abc?tab=1',
    });
    expect(click(screen.getByText('evento'))).toBe(true);
  });

  it('opens every link from the home page in a new window', () => {
    window.history.replaceState(null, '', '/');
    renderBridge(<a href="/feed">feed</a>);
    expect(click(screen.getByText('feed'))).toBe(true);
    expect(sent()).toContainEqual({ source: OS_MESSAGE_SOURCE, type: 'open', path: '/feed' });
  });

  it('lets the window navigate itself otherwise', () => {
    renderBridge(
      <>
        <a href="/eventos">listado</a>
        <a href="/perfil/abc" target="_blank">
          nueva pestaña
        </a>
        <a href="/perfil/abc" download>
          descarga
        </a>
        <a href="https://example.com/perfil/abc">externo</a>
        <a href="/api/perfil/abc">api</a>
        <a href="/feed">misma página</a>
        <nav aria-label="breadcrumb">
          <a href="/perfil/abc">miga</a>
        </nav>
        <span>sin link</span>
      </>,
    );
    for (const text of [
      'listado',
      'nueva pestaña',
      'descarga',
      'externo',
      'api',
      'misma página',
      'miga',
      'sin link',
    ])
      expect(click(screen.getByText(text))).toBe(false);

    const profile = screen.getByText('miga');
    expect(click(profile, { metaKey: true })).toBe(false);
    expect(click(profile, { button: 1 })).toBe(false);
    expect(sent().filter((m) => m.type === 'open')).toEqual([]);
  });

  it('ignores clicks something else already handled', () => {
    renderBridge(<a href="/perfil/abc">perfil</a>);
    const link = screen.getByText('perfil');
    // A capture listener on window runs before the bridge's one on document.
    const handled = (e: Event) => e.preventDefault();
    window.addEventListener('click', handled, { capture: true });
    click(link);
    window.removeEventListener('click', handled, { capture: true });
    expect(sent().filter((m) => m.type === 'open')).toEqual([]);
  });
});
