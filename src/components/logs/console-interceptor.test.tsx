import { render, screen } from '@testing-library/react';
import { logClient } from '@/actions/logs/log-client';
import { ConsoleInterceptor } from './console-interceptor';

jest.mock('@/actions/logs/log-client', () => ({ logClient: jest.fn() }));

const logMock = logClient as jest.Mock;
const LEVELS = [
  ['log', 'info'],
  ['warn', 'warn'],
  ['error', 'error'],
  ['debug', 'debug'],
] as const;

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('ConsoleInterceptor', () => {
  const originals = { ...console };
  const silent = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(() => {
    Object.assign(console, silent);
    logMock.mockResolvedValue(undefined);
  });
  afterEach(() => Object.assign(console, originals));

  it('renders its children', () => {
    render(
      <ConsoleInterceptor>
        <p>app</p>
      </ConsoleInterceptor>,
    );

    expect(screen.getByText('app')).toBeInTheDocument();
  });

  it.each(LEVELS)('forwards console.%s as %s and still prints it', (method, level) => {
    render(<ConsoleInterceptor>{null}</ConsoleInterceptor>);

    console[method]('hola', 2);

    expect(silent[method]).toHaveBeenCalledWith('hola', 2);
    expect(logMock).toHaveBeenCalledWith({
      level,
      message: 'hola 2',
      path: '/',
      metadata: { args: ['hola', 2] },
    });
  });

  it('serializes nulls, DOM elements, circular objects and nested elements', () => {
    render(<ConsoleInterceptor>{null}</ConsoleInterceptor>);
    const div = document.createElement('div');
    div.id = 'root';
    div.className = 'main';
    const circular: Record<string, unknown> = { name: 'a' };
    circular.self = circular;

    console.log(null, undefined, div, document.createElement('span'), circular, {
      el: document.createElement('p'),
    });

    expect(logMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          'null undefined <div id="root" class="main" /> <span /> {"name":"a","self":"[Circular]"} {"el":"<p />"}',
      }),
    );
  });

  it('falls back to String() when JSON serialization throws', () => {
    render(<ConsoleInterceptor>{null}</ConsoleInterceptor>);

    console.warn({ big: BigInt(1) });

    expect(logMock).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'warn', message: '[object Object]', metadata: {} }),
    );
  });

  it.each(LEVELS)('swallows logging failures for console.%s', async (method) => {
    logMock.mockRejectedValue(new Error('offline'));
    render(<ConsoleInterceptor>{null}</ConsoleInterceptor>);

    console[method]('x');
    await Promise.resolve();

    expect(logMock).toHaveBeenCalledTimes(1);
  });

  it.each(LEVELS)('swallows synchronous failures for console.%s', (method) => {
    logMock.mockImplementation(() => {
      throw new Error('sync');
    });
    render(<ConsoleInterceptor>{null}</ConsoleInterceptor>);

    expect(() => console[method]('x')).not.toThrow();
  });

  it('restores the original console on unmount', () => {
    const { unmount } = render(<ConsoleInterceptor>{null}</ConsoleInterceptor>);
    expect(console.log).not.toBe(silent.log);

    unmount();

    expect(console.log).toBe(silent.log);
    expect(console.error).toBe(silent.error);
  });
});
