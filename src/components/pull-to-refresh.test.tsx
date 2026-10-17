import { act, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockRouter, setLocation } from '@/test/dom';
import { PullToRefresh } from './pull-to-refresh';

const touch = (type: string, y?: number, x = 100, target: EventTarget = window) => {
  const event = new Event(type, { cancelable: true, bubbles: true });
  Object.defineProperty(event, 'touches', {
    value: y === undefined ? [] : [{ clientX: x, clientY: y }],
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
};

const pull = (from: number, to: number, x = 100) => {
  touch('touchstart', from, x);
  return touch('touchmove', to, x);
};

const originalMatchMedia = window.matchMedia;
const setDevice = ({ standalone = true, coarse = true } = {}) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches:
      (query === '(display-mode: standalone)' && standalone) ||
      (query === '(pointer: coarse)' && coarse),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

let queryClient: QueryClient;
const renderPull = () => {
  queryClient = new QueryClient();
  jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
  return render(
    <QueryClientProvider client={queryClient}>
      <PullToRefresh />
    </QueryClientProvider>,
  );
};

const indicator = () => screen.getByRole('status', { hidden: true });

beforeEach(() => {
  setDevice();
  setLocation('/eventos');
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  jest.useRealTimers();
  document.body.innerHTML = '';
});

describe('PullToRefresh', () => {
  it('renders nothing in a browser tab', () => {
    setDevice({ standalone: false });
    renderPull();
    expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
  });

  it('renders nothing on a desktop pointer', () => {
    setDevice({ coarse: false });
    renderPull();
    expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
  });

  it('renders nothing on routes with only committed content', () => {
    setLocation('/cursos/react');
    renderPull();
    expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
  });

  it('refreshes the page and its queries when pulled past the threshold', async () => {
    jest.useFakeTimers();
    const vibrate = jest.fn();
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true });
    renderPull();
    expect(indicator()).toHaveAttribute('aria-hidden', 'true');

    const move = pull(0, 300);
    expect(move.defaultPrevented).toBe(true);
    expect(indicator().style.transform).toContain('+ 76px'); // capped at MAX_PULL (120) - 44
    touch('touchend');

    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(vibrate).toHaveBeenCalledWith(10);
    expect(queryClient.invalidateQueries).toHaveBeenCalled();
    expect(indicator()).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText('Actualizando…')).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(600);
    });

    expect(indicator()).toHaveAttribute('aria-hidden', 'true');
    expect(indicator().style.transform).toContain('-44px');
  });

  it('springs back without refreshing on a short pull', () => {
    renderPull();
    pull(0, 60);
    expect(indicator().style.transform).toContain('-18px'); // (60 - 8) * 0.5 - 44
    touch('touchcancel');
    expect(mockRouter.refresh).not.toHaveBeenCalled();
    expect(indicator().style.transform).toContain('-44px');
  });

  it('ignores tiny moves until the drag is clearly downward', () => {
    renderPull();
    const move = pull(0, 5);
    expect(move.defaultPrevented).toBe(false);
    touch('touchend');
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it('leaves horizontal and upward drags to the page', () => {
    renderPull();
    touch('touchstart', 0, 100);
    expect(touch('touchmove', 10, 200).defaultPrevented).toBe(false);
    // The gesture was dropped: moving down later doesn't start a pull.
    expect(touch('touchmove', 300).defaultPrevented).toBe(false);

    expect(pull(100, 50).defaultPrevented).toBe(false);
    expect(touch('touchmove', 300).defaultPrevented).toBe(false);
  });

  it('does not start when the page is scrolled', () => {
    renderPull();
    window.scrollY = 50;
    expect(pull(0, 300).defaultPrevented).toBe(false);
  });

  it('does not start with multiple fingers', () => {
    renderPull();
    const event = new Event('touchstart');
    Object.defineProperty(event, 'touches', { value: [{}, {}] });
    act(() => {
      window.dispatchEvent(event);
    });
    expect(touch('touchmove', 300).defaultPrevented).toBe(false);
  });

  it('does not start while a dialog is open', () => {
    renderPull();
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('data-state', 'open');
    document.body.appendChild(dialog);
    expect(pull(0, 300).defaultPrevented).toBe(false);
  });

  it('does not start inside a scrolled container', () => {
    renderPull();
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    Object.defineProperty(scroller, 'scrollTop', { value: 40 });
    const child = document.createElement('p');
    scroller.appendChild(child);
    document.body.appendChild(scroller);

    touch('touchstart', 0, 100, child);
    expect(touch('touchmove', 300).defaultPrevented).toBe(false);
  });

  it('starts inside a scrolled element that does not scroll on its own', () => {
    renderPull();
    const box = document.createElement('div');
    Object.defineProperty(box, 'scrollTop', { value: 40 });
    document.body.appendChild(box);

    touch('touchstart', 0, 100, box);
    expect(touch('touchmove', 300).defaultPrevented).toBe(true);
  });
});
