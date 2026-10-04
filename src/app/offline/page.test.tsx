import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OfflinePage, { metadata } from './page';
import { TRIVIA_QUESTIONS } from './trivia-questions';

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(30_000);

let online = false;
let consoleError: jest.SpyInstance;

// jsdom's `location` can't be replaced or spied on, and `location.reload()` reports "Not
// implemented: navigation" to the console instead of navigating: count those reports.
const reloads = () =>
  consoleError.mock.calls.filter(([error]) => /Not implemented: navigation/.test(String(error)))
    .length;

beforeAll(() => {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => online });
});

beforeEach(() => {
  online = false;
  const log = console.error;
  // Silence only jsdom's navigation reports; anything else (e.g. act() warnings) still shows.
  consoleError = jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    if (!/Not implemented: navigation/.test(String(args[0]))) log(...args);
  });
  // Keep the questions and their options in order: the right answer is always the first option.
  jest.spyOn(Math, 'random').mockReturnValue(0.999);
});

afterEach(() => {
  jest.restoreAllMocks();
});

const total = TRIVIA_QUESTIONS.length;
const pad = (n: number) => String(n).padStart(2, '0');

/** The option button holding `text`. */
const option = (text: string) => screen.getByText(text, { selector: 'span' }).closest('button')!;

describe('/offline', () => {
  it('has the network-unreachable title and is never indexed', () => {
    expect(metadata).toEqual({
      title: { absolute: 'ping: network unreachable' },
      robots: { index: false },
    });
  });

  it('reloads by itself when the network comes back', () => {
    const { unmount } = render(<OfflinePage />);

    expect(screen.getByText('[sin conexión]')).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(reloads()).toBe(1);

    unmount();
    window.dispatchEvent(new Event('online'));
    expect(reloads()).toBe(1);
  });

  it('retries: reloads when online, otherwise checks for a moment', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<OfflinePage />);

    await user.click(screen.getByRole('button', { name: './reintentar' }));
    expect(screen.getByRole('button', { name: 'reintentando…' })).toBeDisabled();
    expect(reloads()).toBe(0);
    act(() => {
      jest.advanceTimersByTime(800);
    });
    expect(screen.getByRole('button', { name: './reintentar' })).toBeEnabled();

    online = true;
    await user.click(screen.getByRole('button', { name: './reintentar' }));
    expect(reloads()).toBe(1);
    jest.useRealTimers();
  });

  it('plays a trivia round, scoring right and wrong answers', async () => {
    const user = userEvent.setup();
    render(<OfflinePage />);

    await user.click(screen.getByRole('button', { name: `./trivia --preguntas ${total}` }));
    expect(screen.getByText(`[01/${pad(total)}]`)).toBeInTheDocument();

    // Math.random ≈ 1 keeps every shuffle in place: the questions in order, the answer first.
    const [first, second] = TRIVIA_QUESTIONS;
    expect(screen.getByText(first.question)).toBeInTheDocument();
    await user.click(option(first.options[1]));
    expect(option(first.options[1])).toHaveTextContent('✗');
    expect(option(first.options[0])).toHaveTextContent('✓');
    expect(option(first.options[0])).toBeDisabled();
    expect(screen.getByText(`# ${first.explanation}`)).toBeInTheDocument();
    expect(screen.getByText('puntaje 00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'siguiente →' }));
    expect(screen.getByText(second.question)).toBeInTheDocument();
    await user.click(option(second.options[0]));
    expect(screen.getByText('puntaje 01')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'siguiente →' }));

    for (const question of TRIVIA_QUESTIONS.slice(2)) {
      await user.click(option(question.options[0]));
      await user.click(screen.getByRole('button', { name: 'siguiente →' }));
    }

    expect(screen.getByText(`${pad(total - 1)}/${pad(total)}`)).toBeInTheDocument();
    expect(screen.getByText(/# nivel: senior/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: './trivia --otra-vez' }));
    expect(screen.getByText(`[01/${pad(total)}]`)).toBeInTheDocument();
  });

  it.each([
    [1, 'principal engineer'],
    [0.5, 'semi-senior'],
    [0, 'junior'],
  ])('ranks a %d ratio of right answers as %s', async (ratio, rank) => {
    const user = userEvent.setup();
    render(<OfflinePage />);
    await user.click(screen.getByRole('button', { name: /trivia --preguntas/ }));

    const right = Math.round(total * ratio);
    for (const [i, question] of TRIVIA_QUESTIONS.entries()) {
      await user.click(option(question.options[i < right ? 0 : 1]));
      await user.click(screen.getByRole('button', { name: 'siguiente →' }));
    }

    expect(screen.getByText(`# nivel: ${rank}`)).toBeInTheDocument();
  });
});
