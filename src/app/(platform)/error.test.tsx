import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logClientError } from '@/actions/errors/log-error';
import { ERROR_TAB_TITLE, NOT_FOUND_TAB_TITLE } from '@/lib/tab-title';
import { setLocation } from '@/test/dom';
import PlatformError from './error';
import PlatformNotFound, { metadata } from './not-found';

jest.mock('@/actions/errors/log-error', () => ({ logClientError: jest.fn() }));

const logMock = logClientError as jest.Mock;

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('PlatformError', () => {
  beforeEach(() => {
    setLocation('/eventos/9');
    document.title = 'Eventos';
  });

  it('logs the error, shows the digest and retries', async () => {
    logMock.mockResolvedValue(undefined);
    const reset = jest.fn();
    const error = Object.assign(new Error('falló'), { digest: 'abc123' });
    render(<PlatformError error={error} reset={reset} />);

    expect(screen.getByText('./render /eventos/9')).toBeInTheDocument();
    expect(screen.getByText('digest: abc123')).toBeInTheDocument();
    expect(document.title).toBe(ERROR_TAB_TITLE);
    await waitFor(() =>
      expect(logMock).toHaveBeenCalledWith({
        message: 'falló',
        stack: error.stack,
        path: '/eventos/9',
        metadata: { digest: 'abc123', boundary: 'app/(platform)/error.tsx' },
      }),
    );

    await userEvent.click(screen.getByRole('button', { name: /reintentar/ }));
    expect(reset).toHaveBeenCalled();
  });

  it('shows a generic message without a digest and ignores logging failures', async () => {
    logMock.mockRejectedValue(new Error('offline'));
    render(<PlatformError error={new Error('x')} reset={jest.fn()} />);

    expect(screen.getByText('Algo salió mal al cargar esta página.')).toBeInTheDocument();
    await waitFor(() => expect(logMock).toHaveBeenCalled());
  });

  it('restores the previous tab title on unmount', () => {
    logMock.mockResolvedValue(undefined);
    const { unmount } = render(<PlatformError error={new Error('x')} reset={jest.fn()} />);

    unmount();

    expect(document.title).toBe('Eventos');
  });

  it('keeps a title set by a navigation', () => {
    logMock.mockResolvedValue(undefined);
    const { unmount } = render(<PlatformError error={new Error('x')} reset={jest.fn()} />);
    document.title = 'Cursos';

    unmount();

    expect(document.title).toBe('Cursos');
  });
});

describe('PlatformNotFound', () => {
  it('renders the 404 screen and is not indexed', () => {
    setLocation('/perdido');
    render(<PlatformNotFound />);

    expect(screen.getByText('cd /perdido')).toBeInTheDocument();
    expect(metadata).toEqual({
      title: { absolute: NOT_FOUND_TAB_TITLE },
      robots: { index: false },
    });
  });
});
