import { act, render } from '@testing-library/react';
import { HackerCursor } from './hacker-cursor';

const root = document.documentElement;

const media = (fine: boolean, reduced = false) =>
  ((query: string) => ({
    matches: query.includes('pointer: fine') ? fine : query.includes('reduce') ? reduced : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia;

const pointer = (
  type: string,
  { x = 0, y = 0, pointerType = 'mouse' }: { x?: number; y?: number; pointerType?: string } = {},
  target: EventTarget = document.body,
) => {
  const event = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  act(() => {
    target.dispatchEvent(event);
  });
};

let frames: FrameRequestCallback[] = [];
let now = 0;
const flushFrames = (limit = 200) => {
  for (let i = 0; i < limit && frames.length; i++) {
    const queue = frames;
    frames = [];
    now += 16;
    queue.forEach((cb) => cb(now));
  }
};

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  frames = [];
  now = 0;
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.push(cb);
    return frames.length;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  window.matchMedia = media(true);
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  root.removeAttribute('data-embedded');
  root.removeAttribute('data-os-mode');
  root.className = '';
  jest.restoreAllMocks();
});

const parts = (container: HTMLElement) => ({
  ring: container.querySelector<HTMLElement>('.pcn-cursor-ring')!,
  dot: container.querySelector<HTMLElement>('.pcn-cursor-dot')!,
  label: container.querySelector<HTMLElement>('.pcn-cursor-label')!,
  burst: container.querySelectorAll<HTMLElement>('.pcn-cursor-layer')[1].firstElementChild!,
});

describe('HackerCursor', () => {
  it('stays off for touch screens, reduced motion and the lite mode', () => {
    window.matchMedia = media(false);
    const { unmount } = render(<HackerCursor />);
    expect(root).not.toHaveClass('pcn-cursor');
    unmount();

    window.matchMedia = media(true, true);
    const second = render(<HackerCursor />);
    expect(root).not.toHaveClass('pcn-cursor');
    second.unmount();

    root.setAttribute('data-os-mode', 'lite');
    render(<HackerCursor />);
    expect(root).not.toHaveClass('pcn-cursor');
  });

  it('follows the mouse and hides until it moves', () => {
    const { container, unmount } = render(<HackerCursor />);
    const { dot, ring } = parts(container);
    expect(root).toHaveClass('pcn-cursor');
    expect(dot.style.transform).toBe('');

    pointer('pointermove', { x: 100, y: 50 });
    expect(root).not.toHaveClass('pcn-cursor-hidden');
    flushFrames();
    expect(dot.style.transform).toContain('translate3d(100px, 50px, 0)');
    expect(ring.style.transform).toContain('translate3d(100px, 50px, 0)');

    // The brackets trail behind and settle on the pointer.
    pointer('pointermove', { x: 300, y: 50 });
    frames.shift()!(now + 16);
    expect(ring.style.transform).not.toContain('translate3d(300px');
    flushFrames();
    expect(ring.style.transform).toContain('translate3d(300px, 50px, 0)');

    unmount();
    expect(root).not.toHaveClass('pcn-cursor');
    expect(root).not.toHaveClass('pcn-cursor-hidden');
  });

  it('labels links, buttons and custom targets, and keeps the I-beam in text fields', () => {
    const { container } = render(
      <div>
        <HackerCursor />
        <a href="#eventos">interno</a>
        <a href="https://example.com/x">externo</a>
        <button type="button">acción</button>
        <div data-cursor="play">
          <span>custom</span>
        </div>
        <input aria-label="nombre" />
      </div>,
    );
    const { label, ring } = parts(container);
    const get = (text: string) =>
      [...container.querySelectorAll('a, button, span')].find((el) => el.textContent === text)!;

    pointer('pointermove', { x: 1, y: 1 }, get('interno'));
    expect(label.textContent).toBe('cd');
    expect(ring.dataset.hover).toBe('true');

    pointer('pointermove', { x: 1, y: 1 }, get('externo'));
    expect(label.textContent).toBe('open ↗');

    pointer('pointermove', { x: 1, y: 1 }, get('acción'));
    expect(label.textContent).toBe('exec');

    pointer('pointermove', { x: 1, y: 1 }, get('custom'));
    expect(label.textContent).toBe('play');

    pointer('pointermove', { x: 1, y: 1 }, container.querySelector('input')!);
    expect(root).toHaveClass('pcn-cursor-hidden');
    expect(label.textContent).toBe('');
    expect(ring.dataset.hover).toBe('false');
  });

  it('hides for touch pointers and when the mouse leaves the window', () => {
    render(<HackerCursor />);
    pointer('pointermove', { x: 5, y: 5 });
    expect(root).not.toHaveClass('pcn-cursor-hidden');
    pointer('pointermove', { pointerType: 'touch' });
    expect(root).toHaveClass('pcn-cursor-hidden');

    pointer('pointermove', { x: 5, y: 5 });
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(root).toHaveClass('pcn-cursor-hidden');
  });

  it('presses on mouse down and bursts hex particles on release', () => {
    const { container } = render(<HackerCursor />);
    const { ring, burst } = parts(container);

    // Releasing while hidden draws nothing.
    pointer('pointerup', { x: 5, y: 5 });
    expect(burst.childElementCount).toBe(0);

    pointer('pointermove', { x: 5, y: 5 });
    pointer('pointerdown', { pointerType: 'touch' });
    expect(ring.dataset.pressed).toBe('false');
    pointer('pointerdown');
    expect(ring.dataset.pressed).toBe('true');
    flushFrames();
    expect(ring.style.transform).toContain('scale(0.8)');

    pointer('pointerup', { x: 5, y: 5, pointerType: 'pen' });
    expect(ring.dataset.pressed).toBe('true');
    pointer('pointerup', { x: 5, y: 5 });
    expect(ring.dataset.pressed).toBe('false');
    expect(burst.querySelectorAll('.pcn-cursor-pulse')).toHaveLength(1);
    const particles = burst.querySelectorAll('.pcn-cursor-particle');
    expect(particles).toHaveLength(10);
    particles.forEach((particle) => expect(particle.textContent).toMatch(/^[0-9A-F]$/));

    // Each piece removes itself when its animation ends.
    Array.from(burst.childNodes).forEach((node) => node.dispatchEvent(new Event('animationend')));
    expect(burst.childElementCount).toBe(0);
  });

  it('draws the pointer reported by a PCN OS window, shifted onto the desktop', () => {
    const { container } = render(<HackerCursor />);
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.getBoundingClientRect = () => ({ left: 100, top: 40 }) as DOMRect;
    const source = iframe.contentWindow!;
    const { dot, ring, label } = parts(container);

    const send = (data: unknown, origin = window.location.origin, from: Window | null = source) =>
      act(() => {
        window.dispatchEvent(new MessageEvent('message', { data, origin, source: from }));
      });
    const cursor = (phase: string, extra = {}) => ({
      source: 'pcn-os',
      type: 'cursor',
      phase,
      x: 10,
      y: 20,
      label: 'cd',
      inText: false,
      ...extra,
    });

    // Moving over the iframe itself is left to the window's own report.
    pointer('pointermove', { x: 1, y: 1 }, iframe);
    flushFrames();
    expect(dot.style.transform).toBe('');

    send(cursor('move'), 'https://evil.test');
    send({ source: 'other' });
    send({ source: 'pcn-os', type: 'focus' });
    send(cursor('move'), window.location.origin, null);
    flushFrames();
    expect(dot.style.transform).toBe('');

    send(cursor('move'));
    flushFrames();
    expect(root).not.toHaveClass('pcn-cursor-hidden');
    expect(dot.style.transform).toContain('translate3d(110px, 60px, 0)');
    expect(label.textContent).toBe('cd');

    send(cursor('down'));
    expect(ring.dataset.pressed).toBe('true');
    send(cursor('up'));
    expect(ring.dataset.pressed).toBe('false');

    // A late leave from another window doesn't hide it; one from the current window does.
    send(cursor('leave'), window.location.origin, window);
    expect(root).not.toHaveClass('pcn-cursor-hidden');
    send(cursor('leave'));
    expect(root).toHaveClass('pcn-cursor-hidden');
    iframe.remove();
  });

  it('inside a PCN OS window only reports the pointer to the desktop', () => {
    root.setAttribute('data-embedded', '');
    const postMessage = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
    const { container, unmount } = render(
      <>
        <a href="#x">
          <span>link</span>
        </a>
        <HackerCursor />
      </>,
    );
    expect(root).toHaveClass('pcn-cursor');

    pointer('pointermove', { x: 3, y: 4 }, container.querySelector('span')!);
    expect(postMessage).toHaveBeenLastCalledWith(
      {
        source: 'pcn-os',
        type: 'cursor',
        phase: 'move',
        x: 3,
        y: 4,
        inText: false,
        label: 'cd',
      },
      window.location.origin,
    );
    pointer('pointerdown', { x: 3, y: 4 });
    expect(postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ phase: 'down', label: null }),
      window.location.origin,
    );
    pointer('pointerup', { x: 3, y: 4 });
    expect(postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ phase: 'up' }),
      window.location.origin,
    );
    const calls = postMessage.mock.calls.length;
    pointer('pointermove', { pointerType: 'touch' });
    expect(postMessage).toHaveBeenCalledTimes(calls);

    act(() => {
      root.dispatchEvent(new Event('pointerleave'));
    });
    expect(postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ phase: 'leave', x: 0, y: 0 }),
      window.location.origin,
    );

    unmount();
    expect(root).not.toHaveClass('pcn-cursor');
    pointer('pointermove', { x: 1, y: 1 });
    expect(postMessage).toHaveBeenCalledTimes(calls + 1);
  });
});
