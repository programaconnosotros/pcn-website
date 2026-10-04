import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logClientError } from '@/actions/errors/log-error';
import { setLocation } from '@/test/dom';
import { ErrorBoundary } from './error-boundary';
import { NotFoundScreen } from './not-found-screen';
import { TerminalErrorScreen } from './terminal-error-screen';

jest.mock('@/actions/errors/log-error', () => ({ logClientError: jest.fn() }));

const Boom = (): never => {
  throw new Error('kaboom');
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs caught render errors; keep the output clean
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (logClientError as jest.Mock).mockResolvedValue(undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>todo bien</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('todo bien')).toBeInTheDocument();
  });

  it('shows the default fallback and logs the error', async () => {
    window.history.replaceState(null, '', '/eventos');
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: 'Algo salió mal' })).toBeInTheDocument();
    await waitFor(() =>
      expect(logClientError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'kaboom',
          path: '/eventos',
          metadata: { componentStack: expect.any(String) },
        }),
      ),
    );
    expect(screen.getByRole('button', { name: 'Recargar página' })).toBeInTheDocument();
    window.history.replaceState(null, '', '/');
  });

  it('renders a custom fallback', async () => {
    render(
      <ErrorBoundary fallback={<p>fallback propio</p>}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('fallback propio')).toBeInTheDocument();
    await waitFor(() => expect(logClientError).toHaveBeenCalled());
  });

  it('reloads the page from the default fallback', async () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Recargar página' }));

    // jsdom can't reload; it reports the attempt as a "not implemented" navigation
    expect(console.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Not implemented') }),
    );
  });
});

describe('TerminalErrorScreen', () => {
  it('prints the command, output, code, action and suggestions', () => {
    render(
      <TerminalErrorScreen
        code="418"
        command="brew coffee"
        output={['soy una tetera', 'segunda línea']}
        action={<button type="button">acción</button>}
      />,
    );

    expect(screen.getByText('brew coffee')).toBeInTheDocument();
    expect(screen.getByText('soy una tetera')).toBeInTheDocument();
    expect(screen.getByText('segunda línea')).toBeInTheDocument();
    expect(screen.getByText('[exit 418]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'acción' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cd ~\/eventos/ })).toHaveAttribute('href', '/eventos');
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });
});

describe('NotFoundScreen', () => {
  it('shows the missing path as a failed cd', () => {
    setLocation('/no-existe');
    render(<NotFoundScreen />);

    expect(screen.getByText('cd /no-existe')).toBeInTheDocument();
    expect(screen.getByText('bash: cd: /no-existe: No such file or directory')).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
