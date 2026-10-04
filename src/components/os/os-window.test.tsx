import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OsWindow } from './os-window';
import type { OsWindowState, Rect } from './os-window-geometry';
import { findProgramForPath } from './programs';

// jsdom has no PointerEvent: without it fireEvent.pointerDown drops `button` and coordinates.
beforeAll(() => {
  if (!('PointerEvent' in window))
    Object.defineProperty(window, 'PointerEvent', { configurable: true, value: MouseEvent });
});
afterAll(() => {
  if (window.PointerEvent === (MouseEvent as unknown))
    delete (window as { PointerEvent?: unknown }).PointerEvent;
});

const baseWin: OsWindowState = {
  id: 'win-1',
  src: '/eventos',
  path: '/eventos/meetup',
  title: 'cat ~/eventos/meetup · pcn',
  minimized: false,
  maximized: false,
  x: 100,
  y: 50,
  w: 800,
  h: 600,
};

const setup = (overrides: Partial<React.ComponentProps<typeof OsWindow>> = {}) => {
  const win = overrides.win ?? baseWin;
  const props = {
    win,
    program: findProgramForPath('/eventos'),
    rect: { x: win.x, y: win.y, w: win.w, h: win.h },
    zIndex: 11,
    focused: true,
    clampRect: jest.fn((rect: Rect) => rect),
    onFocus: jest.fn(),
    onClose: jest.fn(),
    onMinimize: jest.fn(),
    onToggleMaximize: jest.fn(),
    onRectChange: jest.fn(),
    onInteractionChange: jest.fn(),
    registerIframe: jest.fn(),
    onIframeLoad: jest.fn(),
    ...overrides,
  };
  const utils = render(<OsWindow {...props} />);
  return { ...utils, props };
};

/** Pointer events on window carry coordinates as plain mouse events in jsdom. */
const pointer = (type: string, clientX: number, clientY: number) =>
  act(() => {
    window.dispatchEvent(new MouseEvent(type, { clientX, clientY }));
  });

const dialog = () => screen.getByRole('dialog', { name: 'Eventos' });
const header = () => dialog().querySelector('header')!;
const handles = () => [...dialog().querySelectorAll(':scope > div[aria-hidden]')];

describe('OsWindow', () => {
  it('shows the program path, the page subtitle, a loader and an iframe of the page', () => {
    const { props } = setup();
    expect(dialog()).toHaveAttribute('data-focused', 'true');
    expect(dialog()).toHaveStyle({ left: '100px', top: '50px', width: '800px', zIndex: '11' });
    expect(screen.getByText('~/eventos')).toHaveTextContent('~/eventos — meetup');
    const iframe = screen.getByTitle('Eventos');
    expect(iframe).toHaveAttribute('src', '/eventos');
    expect(props.registerIframe).toHaveBeenCalledWith(iframe);
    expect(screen.getByRole('link', { name: 'Abrir en una pestaña nueva' })).toHaveAttribute(
      'href',
      '/eventos/meetup',
    );
    expect(handles()).toHaveLength(8);
  });

  it('drops the loader once the iframe loads', () => {
    const { props, container } = setup();
    const loaderCount = () => container.querySelectorAll('.absolute.inset-0.flex').length;
    expect(loaderCount()).toBe(1);
    fireEvent.load(screen.getByTitle('Eventos'));
    expect(props.onIframeLoad).toHaveBeenCalled();
    expect(loaderCount()).toBe(0);
  });

  it('drops the loader as soon as the embedded page paints something', () => {
    jest.useFakeTimers();
    try {
      const { container } = setup();
      const iframe = screen.getByTitle('Eventos') as HTMLIFrameElement;
      const doc = document.implementation.createHTMLDocument('x');
      doc.body.appendChild(doc.createElement('main'));
      Object.defineProperty(doc, 'URL', { value: 'http://localhost/eventos' });
      Object.defineProperty(iframe, 'contentDocument', { configurable: true, value: doc });
      act(() => jest.advanceTimersByTime(60));
      expect(container.querySelectorAll('.absolute.inset-0.flex')).toHaveLength(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps polling when the iframe is cross-origin', () => {
    jest.useFakeTimers();
    try {
      const { container } = setup();
      Object.defineProperty(screen.getByTitle('Eventos'), 'contentDocument', {
        configurable: true,
        get: () => {
          throw new Error('cross-origin');
        },
      });
      act(() => jest.advanceTimersByTime(120));
      expect(container.querySelectorAll('.absolute.inset-0.flex')).toHaveLength(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('wires the title bar buttons', async () => {
    const { props } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Maximizar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Minimizar' }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.onToggleMaximize).toHaveBeenCalledTimes(1);
    expect(props.onMinimize).toHaveBeenCalledTimes(1);

    const reload = jest.fn();
    Object.defineProperty(screen.getByTitle('Eventos'), 'contentWindow', {
      configurable: true,
      value: { location: { reload } },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Recargar' }));
    expect(reload).toHaveBeenCalled();
  });

  it('toggles maximize with a double click on the title bar', () => {
    const { props } = setup();
    // Like a browser: the first press starts a drag whose release lands on the desktop's shield,
    // so the native dblclick never reaches the header. The second press must do it.
    fireEvent.pointerDown(header(), { button: 0, clientX: 300, clientY: 60 });
    pointer('pointerup', 300, 60);
    expect(props.onToggleMaximize).not.toHaveBeenCalled();
    fireEvent.pointerDown(header(), { button: 0, clientX: 301, clientY: 61 });
    expect(props.onToggleMaximize).toHaveBeenCalledTimes(1);
    // That press doesn't start another drag (no shield to swallow the release)
    expect(props.onInteractionChange).toHaveBeenCalledTimes(2);
    pointer('pointerup', 301, 61);
    // A native dblclick that does reach the header doesn't toggle it back
    fireEvent.doubleClick(header());
    expect(props.onToggleMaximize).toHaveBeenCalledTimes(1);
  });

  it('treats slow or distant second presses as new drags, not a double click', () => {
    const now = jest.spyOn(performance, 'now').mockReturnValue(1_000);
    const { props } = setup();
    fireEvent.pointerDown(header(), { button: 0, clientX: 300, clientY: 60 });
    pointer('pointerup', 300, 60);
    now.mockReturnValue(1_800);
    fireEvent.pointerDown(header(), { button: 0, clientX: 300, clientY: 60 });
    pointer('pointerup', 300, 60);
    now.mockReturnValue(1_900);
    fireEvent.pointerDown(header(), { button: 0, clientX: 340, clientY: 60 });
    pointer('pointerup', 340, 60);
    expect(props.onToggleMaximize).not.toHaveBeenCalled();
    expect(props.onInteractionChange).toHaveBeenCalledTimes(6);
    now.mockRestore();
  });

  it('focuses on any pointer down inside', () => {
    const { props } = setup({ focused: false });
    expect(dialog()).toHaveAttribute('data-focused', 'false');
    fireEvent.pointerDown(screen.getByTitle('Eventos'));
    expect(props.onFocus).toHaveBeenCalled();
  });

  it('moves the window by dragging the title bar, clamped to the desktop', () => {
    const clampRect = jest.fn((rect: Rect) => ({ ...rect, y: Math.max(rect.y, 28) }));
    const { props } = setup({ clampRect });

    fireEvent.pointerDown(header(), { button: 0, clientX: 300, clientY: 60 });
    expect(props.onInteractionChange).toHaveBeenLastCalledWith('default');
    pointer('pointermove', 340, 0);
    pointer('pointerup', 340, 0);

    expect(clampRect).toHaveBeenLastCalledWith({ x: 140, y: -10, w: 800, h: 600 }, 'move');
    expect(props.onRectChange).toHaveBeenCalledWith(
      expect.objectContaining({ x: 140, y: 28, w: 800, h: 600 }),
    );
    expect(props.onInteractionChange).toHaveBeenLastCalledWith(null);
  });

  it('ignores secondary buttons and clicks without movement', () => {
    const { props } = setup();
    fireEvent.pointerDown(header(), { button: 2, clientX: 300, clientY: 60 });
    expect(props.onInteractionChange).not.toHaveBeenCalled();

    fireEvent.pointerDown(header(), { button: 0, clientX: 300, clientY: 60 });
    pointer('pointercancel', 300, 60);
    expect(props.onRectChange).not.toHaveBeenCalled();
    expect(props.onInteractionChange).toHaveBeenLastCalledWith(null);
  });

  it('settles the DOM back to the rect React renders after a drag', () => {
    const { props, rerender } = setup();
    fireEvent.pointerDown(header(), { button: 0, clientX: 300, clientY: 60 });
    pointer('pointermove', 310, 70);
    pointer('pointerup', 310, 70);
    const next = (props.onRectChange as jest.Mock).mock.calls[0][0] as Rect;
    rerender(<OsWindow {...props} rect={next} />);
    expect(dialog()).toHaveStyle({ left: '110px', top: '60px' });
    expect(dialog().style.translate).toBe('');
  });

  it('restores a maximized window under the pointer when dragged', () => {
    const win = { ...baseWin, maximized: true };
    const { props } = setup({ win, rect: { x: 0, y: 28, w: 1600, h: 800 } });
    expect(handles()).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Restaurar' })).toBeInTheDocument();

    // Grabbed at the middle of the screen: the restored window keeps the pointer at its middle.
    fireEvent.pointerDown(header(), { button: 0, clientX: 800, clientY: 40 });
    pointer('pointermove', 800, 40);
    pointer('pointerup', 800, 40);
    expect(props.onRectChange).toHaveBeenCalledWith(
      expect.objectContaining({ x: 400, y: 28, w: 800, h: 600 }),
    );
  });

  it.each([
    ['se', 50, 40, { x: 100, y: 50, w: 850, h: 640 }, 'nwse-resize'],
    ['nw', 50, 40, { x: 150, y: 90, w: 750, h: 560 }, 'nwse-resize'],
    ['n', 0, -30, { x: 100, y: 20, w: 800, h: 630 }, 'ns-resize'],
    ['e', -1000, 0, { x: 100, y: 50, w: 420, h: 600 }, 'ew-resize'],
  ])('resizes from the %s edge', (direction, dx, dy, expected, cursor) => {
    const { props } = setup();
    const index = ['n', 'e', 'w', 's', 'nw', 'ne', 'se', 'sw'].indexOf(direction);
    fireEvent.pointerDown(handles()[index], { button: 0, clientX: 500, clientY: 500 });
    expect(props.onInteractionChange).toHaveBeenLastCalledWith(cursor);
    pointer('pointermove', 500 + dx, 500 + dy);
    pointer('pointerup', 500 + dx, 500 + dy);
    expect(props.clampRect).toHaveBeenLastCalledWith(expected, 'resize');
    expect(props.onRectChange).toHaveBeenCalledWith(expected);
    expect(dialog()).toHaveStyle({ width: `${expected.w}px` });
  });

  it('ignores a resize with a secondary button', () => {
    const { props } = setup();
    fireEvent.pointerDown(handles()[0], { button: 2 });
    expect(props.onInteractionChange).not.toHaveBeenCalled();
  });

  it('sleeps while suspended and resumes at the page it was on', () => {
    const { props, rerender } = setup();
    rerender(<OsWindow {...props} suspended />);
    expect(screen.getByText('[ en pausa ]')).toBeInTheDocument();
    expect(screen.queryByTitle('Eventos')).not.toBeInTheDocument();

    rerender(<OsWindow {...props} suspended={false} />);
    expect(screen.getByTitle('Eventos')).toHaveAttribute('src', '/eventos/meetup');
  });

  it('renders minimized and lite windows without blocking the desktop', () => {
    setup({ win: { ...baseWin, minimized: true, title: null }, lite: true, focused: false });
    expect(dialog()).toHaveClass('pointer-events-none', 'shadow-none');
    expect(screen.getByText('~/eventos')).toHaveTextContent(/^~\/eventos$/);
  });
});
