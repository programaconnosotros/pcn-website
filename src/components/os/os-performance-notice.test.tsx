import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AUTO_ATTR, AUTO_KEY, MODE_ATTR, STORAGE_KEY } from './os-display-mode-script';
import { OsPerformanceNotice } from './os-performance-notice';

const root = document.documentElement;

/** Manual animation frames: `play` runs the queued callbacks at the given timestamps. */
let queued: FrameRequestCallback[] = [];
const play = (times: number[]) => {
  for (const time of times) {
    const callbacks = queued;
    queued = [];
    act(() => callbacks.forEach((callback) => callback(time)));
  }
};
/** One frame every `step` ms for the whole 5 s sample. */
const sample = (step: number) => play(Array.from({ length: 5000 / step + 2 }, (_, i) => i * step));

const originalRaf = window.requestAnimationFrame;
const originalCancel = window.cancelAnimationFrame;

beforeEach(() => {
  jest.useFakeTimers();
  queued = [];
  window.requestAnimationFrame = (callback) => {
    queued.push(callback);
    return queued.length;
  };
  window.cancelAnimationFrame = () => {
    queued = [];
  };
});

afterEach(() => {
  jest.useRealTimers();
  window.requestAnimationFrame = originalRaf;
  window.cancelAnimationFrame = originalCancel;
  root.removeAttribute(MODE_ATTR);
  root.removeAttribute(AUTO_ATTR);
  localStorage.clear();
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
});

const settle = () => act(() => jest.advanceTimersByTime(4000));

describe('OsPerformanceNotice', () => {
  it('stays quiet on a smooth full desktop', () => {
    const { container } = render(<OsPerformanceNotice />);
    settle();
    sample(16);
    expect(root.hasAttribute(MODE_ATTR)).toBe(false);
    expect(container).toBeEmptyDOMElement();
  });

  it('falls back to liviano when the full desktop stutters, then explains why', async () => {
    render(<OsPerformanceNotice />);
    settle();
    sample(100);
    expect(root.getAttribute(MODE_ATTR)).toBe('lite');
    expect(localStorage.getItem(AUTO_KEY)).toBe('lite');
    expect(screen.getByRole('status')).toHaveTextContent('Detectamos que tu compu tiene pocos');

    // Accepting keeps liviano as the visitor's own choice, and the notice goes away.
    await act(async () => {
      screen.getByRole('button', { name: 'entendido' }).click();
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('lite');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('suggests the classic layout when even liviano stutters', () => {
    root.setAttribute(MODE_ATTR, 'lite');
    root.setAttribute(AUTO_ATTR, '');
    render(<OsPerformanceNotice />);
    settle();
    sample(100);
    expect(screen.getByRole('status')).toHaveTextContent('Aun en modo liviano');

    act(() => screen.getByRole('button', { name: 'usar versión clásica' }).click());
    expect(root.getAttribute(MODE_ATTR)).toBe('classic');
  });

  it('offers to stay in liviano after suggesting classic', () => {
    root.setAttribute(MODE_ATTR, 'lite');
    root.setAttribute(AUTO_ATTR, '');
    render(<OsPerformanceNotice />);
    settle();
    sample(100);
    act(() => screen.getByRole('button', { name: 'seguir en liviano' }).click());
    expect(localStorage.getItem(STORAGE_KEY)).toBe('lite');
    expect(root.hasAttribute(AUTO_ATTR)).toBe(false);
  });

  it('lets the visitor pick the full or classic experience, or hide the notice', async () => {
    jest.useRealTimers();
    root.setAttribute(MODE_ATTR, 'lite');
    root.setAttribute(AUTO_ATTR, '');
    const { unmount } = render(<OsPerformanceNotice />);
    await userEvent.click(screen.getByRole('button', { name: 'versión clásica' }));
    expect(root.getAttribute(MODE_ATTR)).toBe('classic');
    unmount();

    root.setAttribute(MODE_ATTR, 'lite');
    root.setAttribute(AUTO_ATTR, '');
    const second = render(<OsPerformanceNotice />);
    await userEvent.click(screen.getByRole('button', { name: 'experiencia completa' }));
    expect(root.hasAttribute(MODE_ATTR)).toBe(false);
    second.unmount();

    root.setAttribute(MODE_ATTR, 'lite');
    root.setAttribute(AUTO_ATTR, '');
    render(<OsPerformanceNotice />);
    await userEvent.click(screen.getByRole('button', { name: 'Ocultar aviso' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(root.getAttribute(MODE_ATTR)).toBe('lite');
  });

  it('does not measure once the visitor chose a mode', () => {
    localStorage.setItem(STORAGE_KEY, 'full');
    render(<OsPerformanceNotice />);
    settle();
    expect(queued).toHaveLength(0);
  });

  it('does not start measuring in a hidden tab', () => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    render(<OsPerformanceNotice />);
    settle();
    expect(queued).toHaveLength(0);
  });

  it('aborts the measurement if the tab gets hidden meanwhile', () => {
    render(<OsPerformanceNotice />);
    settle();
    play([0, 100, 200]);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(queued).toHaveLength(0);
    expect(root.hasAttribute(MODE_ATTR)).toBe(false);
  });

  it('keeps measuring through a visibility change that leaves the tab visible', () => {
    render(<OsPerformanceNotice />);
    settle();
    play([0]);
    document.dispatchEvent(new Event('visibilitychange'));
    sample(100);
    expect(root.getAttribute(MODE_ATTR)).toBe('lite');
  });
});
