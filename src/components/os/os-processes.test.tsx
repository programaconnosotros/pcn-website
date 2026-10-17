import { act, render, renderHook, screen } from '@testing-library/react';
import { OsProcesses, useBackgroundActive } from './os-processes';

const originalMatchMedia = window.matchMedia;

const setVisibility = (state: 'visible' | 'hidden') => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state });
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  window.matchMedia = originalMatchMedia;
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
});

describe('useBackgroundActive', () => {
  it('runs while visible and pauses when covered or hidden', () => {
    const { result, rerender } = renderHook(({ covered }) => useBackgroundActive(covered), {
      initialProps: { covered: false },
    });
    expect(result.current).toBe(true);

    rerender({ covered: true });
    expect(result.current).toBe(false);

    rerender({ covered: false });
    setVisibility('hidden');
    expect(result.current).toBe(false);
    setVisibility('visible');
    expect(result.current).toBe(true);
  });

  it('pauses after a few idle minutes and resumes on activity', () => {
    const { result } = renderHook(() => useBackgroundActive(false));
    act(() => jest.advanceTimersByTime(3.5 * 60 * 1000));
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('pointermove'));
    });
    expect(result.current).toBe(true);
  });

  it('never runs with reduced motion', () => {
    window.matchMedia = ((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    const { result } = renderHook(() => useBackgroundActive(false));
    expect(result.current).toBe(false);
  });
});

describe('OsProcesses', () => {
  it('renders the four panes and keeps them ticking', () => {
    const { container } = render(<OsProcesses covered={false} />);
    expect(screen.getByText('htop — pcn-prod-01')).toBeInTheDocument();
    expect(screen.getByText('agent@pcn — ~/pcn-website')).toBeInTheDocument();
    expect(screen.getByText('pcn-events --tail -f')).toBeInTheDocument();
    expect(screen.getByText('netmon — edge')).toBeInTheDocument();
    expect(screen.getByText('task 1/3')).toBeInTheDocument();
    expect(screen.getByText(/^1\/12 steps$/)).toBeInTheDocument();

    const eventLines = () => container.querySelectorAll('ol')[1].children.length;
    expect(eventLines()).toBe(8);

    // The first task finishes (12 lines), lingers a few ticks, then the agent starts the next one.
    for (let i = 0; i < 16; i += 1) act(() => jest.advanceTimersByTime(800));
    expect(screen.getByText('task 2/3')).toBeInTheDocument();
    expect(eventLines()).toBe(9);

    // Run every task through to wrap back around to the first.
    for (let i = 0; i < 40; i += 1) act(() => jest.advanceTimersByTime(800));
    expect(screen.getByText(/task \d\/3/)).toBeInTheDocument();
  });

  it('shows the idle status once a task is done', () => {
    render(<OsProcesses covered={false} />);
    for (let i = 0; i < 12; i += 1) act(() => jest.advanceTimersByTime(800));
    expect(screen.getByText('● idle')).toBeInTheDocument();
    expect(screen.getByText('12/12 steps')).toBeInTheDocument();
  });

  it('freezes while covered', () => {
    render(<OsProcesses covered />);
    act(() => jest.advanceTimersByTime(10_000));
    expect(screen.getByText('task 1/3')).toBeInTheDocument();
    expect(screen.getByText(/^1\/12 steps$/)).toBeInTheDocument();
  });
});
