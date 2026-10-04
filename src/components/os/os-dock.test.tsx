import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { OsDock } from './os-dock';
import { OS_PROGRAMS, visiblePrograms, type OsProgram } from './programs';

const programs = visiblePrograms(false);
const pinned = programs.filter((program) => program.pinned);
const unpinned = programs.filter((program) => !program.pinned);
const feed = programs.find((program) => program.id === 'feed')!;

const originalMatchMedia = window.matchMedia;

const setNoHover = (noHover: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: query === '(hover: none)' ? noHover : false,
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia;
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
  window.matchMedia = originalMatchMedia;
});

const renderDock = (props: Partial<React.ComponentProps<typeof OsDock>> = {}) => {
  const onOpenProgram = jest.fn<void, [OsProgram]>();
  const onOpenLauncher = jest.fn();
  const utils = render(
    <OsDock
      programs={programs}
      runningPrograms={[]}
      runningProgramIds={new Set()}
      focusedProgramId={null}
      onOpenProgram={onOpenProgram}
      onOpenLauncher={onOpenLauncher}
      {...props}
    />,
  );
  return { ...utils, onOpenProgram, onOpenLauncher };
};

const dock = () => screen.getByRole('navigation', { name: 'Dock' });

describe('OsDock', () => {
  it('shows the pinned programs and the launcher, with no process running', () => {
    renderDock();
    const buttons = within(dock()).getAllByRole('button');
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      ...pinned.map((program) => program.name),
      'Programas',
    ]);
    expect(dock()).toHaveTextContent('00 proc');
  });

  it('adds running programs that are not pinned after a divider', () => {
    const extra = unpinned[0];
    renderDock({
      runningPrograms: [feed, extra],
      runningProgramIds: new Set([feed.id, extra.id]),
      focusedProgramId: extra.id,
    });
    expect(within(dock()).getByRole('button', { name: extra.name })).toBeInTheDocument();
    expect(dock()).toHaveTextContent('02 proc');
  });

  it('launches programs and opens the launcher', () => {
    const { onOpenProgram, onOpenLauncher } = renderDock();
    fireEvent.click(screen.getByRole('button', { name: feed.name }));
    expect(onOpenProgram).toHaveBeenCalledWith(feed);
    // A second launch replays the burst.
    fireEvent.click(screen.getByRole('button', { name: feed.name }));
    expect(onOpenProgram).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', { name: 'Programas' }));
    expect(onOpenLauncher).toHaveBeenCalled();
  });

  it('types the command and shows a tooltip for the hovered program', () => {
    renderDock();
    const button = screen.getByRole('button', { name: feed.name });
    fireEvent.mouseEnter(button);
    act(() => jest.advanceTimersByTime(1000));
    expect(dock()).toHaveTextContent(`~/pcn $open ${feed.url}`);
    expect(document.body).toHaveTextContent(/\[ feed \]pid:[0-9a-f]{4}/);

    fireEvent.mouseLeave(button);
    expect(document.body).not.toHaveTextContent(/pid:/);

    const launcher = screen.getByRole('button', { name: 'Programas' });
    fireEvent.focus(launcher);
    act(() => jest.advanceTimersByTime(1000));
    expect(dock()).toHaveTextContent('~/pcn $ls ~/programas');
    fireEvent.blur(launcher);
    expect(dock()).not.toHaveTextContent('ls ~/programas');
  });

  it('magnifies under the cursor and resets when it leaves', () => {
    const { container } = renderDock();
    const strip = container.querySelector('nav > div > div:last-child') as HTMLElement;
    fireEvent.mouseMove(strip, { clientX: 100 });
    act(() => jest.advanceTimersByTime(500));
    fireEvent.mouseLeave(strip);
    act(() => jest.advanceTimersByTime(500));
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('shows names under the icons on devices without hover', () => {
    setNoHover(true);
    renderDock({ focusedProgramId: feed.id, lite: true });
    const button = screen.getByRole('button', { name: feed.name });
    expect(within(button).getByText(feed.name)).toHaveClass('text-pcnGreen');
    expect(within(screen.getByRole('button', { name: 'Programas' })).getByText('Programas'));
  });

  it('fits many open programs on a narrow screen', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 600 });
    const running = OS_PROGRAMS.filter((program) => !program.pinned);
    renderDock({ runningPrograms: running, runningProgramIds: new Set(running.map((p) => p.id)) });
    expect(within(dock()).getAllByRole('button')).toHaveLength(pinned.length + running.length + 1);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
  });
});
