import { act, render, screen } from '@testing-library/react';
import { StickyHeader } from './sticky-header';

let frames: FrameRequestCallback[] = [];
let now = 0;
let sentinelTop = 0;

const originalRect = Element.prototype.getBoundingClientRect;
const originalMatchMedia = window.matchMedia;
let desktopMatches = false;
let mediaListeners: (() => void)[] = [];

/** Scrolls to `y` `elapsed` ms after the last scroll, with the header's slot at `top`. */
const scroll = (y: number, top: number, elapsed = 16) => {
  now += elapsed;
  sentinelTop = top;
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
    // A second event in the same frame is coalesced.
    window.dispatchEvent(new Event('scroll'));
  });
  act(() => {
    const pending = frames;
    frames = [];
    pending.forEach((callback) => callback(now));
  });
};

const header = () => screen.getByText('título').parentElement as HTMLElement;
const offset = () => document.documentElement.style.getPropertyValue('--sticky-header-offset');

beforeEach(() => {
  frames = [];
  now = 1000;
  sentinelTop = 0;
  desktopMatches = false;
  mediaListeners = [];
  jest.spyOn(performance, 'now').mockImplementation(() => now);
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 5000,
    configurable: true,
  });
  jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(50);
  // eslint-disable-next-line no-unused-vars -- `this` is only a type annotation
  Element.prototype.getBoundingClientRect = function getRect(this: Element) {
    if (this.getAttribute('aria-hidden') === 'true' && !this.hasAttribute('data-state'))
      return { top: sentinelTop } as DOMRect;
    return originalRect.call(this);
  };
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    get matches() {
      return desktopMatches;
    },
    media: query,
    addEventListener: (_type: string, listener: () => void) => mediaListeners.push(listener),
    removeEventListener: jest.fn(),
  }));
});

afterEach(() => {
  jest.restoreAllMocks();
  Element.prototype.getBoundingClientRect = originalRect;
  window.matchMedia = originalMatchMedia;
  document.documentElement.style.removeProperty('--sticky-header-offset');
});

const renderHeader = (pinnedOnDesktop?: boolean) =>
  render(
    <StickyHeader className="extra" pinnedOnDesktop={pinnedOnDesktop}>
      <h1>título</h1>
      <input aria-label="buscar" />
    </StickyHeader>,
  );

describe('StickyHeader', () => {
  it('starts at rest in the flow', () => {
    renderHeader();
    expect(header()).toHaveAttribute('data-state', 'rest');
    expect(header()).toHaveClass('extra');
    scroll(0, 0);
    expect(header()).toHaveAttribute('data-state', 'rest');
  });

  it('scrolls away, slides back on a quick flick up and hides again scrolling down', () => {
    renderHeader();

    // Still partly in its natural spot: it just scrolls with the page.
    scroll(20, -20);
    expect(header()).toHaveAttribute('data-state', 'rest');

    scroll(400, -400);
    expect(header()).toHaveAttribute('data-state', 'hidden');
    expect(header()).not.toHaveClass('transition-transform');

    // A slow scroll up leaves it hidden.
    scroll(398, -398, 50);
    expect(header()).toHaveAttribute('data-state', 'hidden');

    // A quick flick up brings it back and publishes the room it takes.
    scroll(300, -300, 10);
    scroll(200, -200, 10);
    expect(header()).toHaveAttribute('data-state', 'shown');
    expect(header()).toHaveClass('transition-transform');
    expect(offset()).toBe('62px');

    // Small moves keep it shown.
    scroll(204, -204, 150);
    expect(header()).toHaveAttribute('data-state', 'shown');

    // Scrolling down hides it and clears the offset.
    scroll(260, -260, 150);
    expect(header()).toHaveAttribute('data-state', 'hidden');
    expect(offset()).toBe('');

    // Back at the top it rests again.
    scroll(0, 10, 200);
    expect(header()).toHaveAttribute('data-state', 'rest');
  });

  it('treats the first jump after a pause as its own gesture', () => {
    renderHeader();
    scroll(1000, -1000);
    expect(header()).toHaveAttribute('data-state', 'hidden');
    // 300px up after a pause: speed = -300 / 100 → shown.
    scroll(700, -700, 500);
    expect(header()).toHaveAttribute('data-state', 'shown');
  });

  it('stays shown while focus is inside it', () => {
    renderHeader();
    scroll(1000, -1000);
    scroll(700, -700, 500);
    act(() => screen.getByRole('textbox', { name: 'buscar' }).focus());
    scroll(800, -800, 50);
    expect(header()).toHaveAttribute('data-state', 'shown');
  });

  it('comes back when tabbing into it while hidden', () => {
    renderHeader();
    scroll(1000, -1000);
    expect(header()).toHaveAttribute('data-state', 'hidden');
    act(() => screen.getByRole('textbox', { name: 'buscar' }).focus());
    expect(header()).toHaveAttribute('data-state', 'shown');
  });

  it('ignores rubber-banding past the bottom', () => {
    renderHeader();
    scroll(1000, -1000);
    scroll(6000, -6000, 10);
    expect(header()).toHaveAttribute('data-state', 'hidden');
  });

  it('only hides on phones when pinnedOnDesktop is set', () => {
    renderHeader(true);
    scroll(1000, -1000);
    expect(header()).toHaveAttribute('data-state', 'hidden');
  });

  it('stays pinned on desktop and publishes its height plus its resting offset', () => {
    desktopMatches = true;
    sentinelTop = 80;
    renderHeader(true);

    expect(header()).toHaveClass('top-(--rest-top)');
    expect(header().style.getPropertyValue('--rest-top')).toBe('80px');
    expect(offset()).toBe('130px');

    // Scrolling doesn't move it.
    scroll(1000, -1000);
    expect(header()).toHaveAttribute('data-state', 'rest');
  });

  it('returns to rest when the window grows to desktop size', () => {
    renderHeader(true);
    scroll(1000, -1000);
    expect(header()).toHaveAttribute('data-state', 'hidden');

    desktopMatches = true;
    act(() => mediaListeners.forEach((listener) => listener()));
    expect(header()).toHaveAttribute('data-state', 'rest');
    expect(header()).toHaveClass('top-(--rest-top)');
  });

  it('stops listening once unmounted', () => {
    const { unmount } = renderHeader();
    window.dispatchEvent(new Event('scroll'));
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
