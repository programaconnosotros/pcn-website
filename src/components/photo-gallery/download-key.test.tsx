import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { DownloadKey } from './download-key';

jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

const response = (init: { status?: number; headers?: Record<string, string>; body?: unknown }) => ({
  status: init.status ?? 200,
  ok: (init.status ?? 200) < 400,
  headers: new Headers(init.headers),
  text: async () => String(init.body),
  json: async () => init.body,
  blob: async () => new Blob(['x']),
});

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('DownloadKey', () => {
  beforeAll(() => {
    URL.createObjectURL = jest.fn(() => 'blob:x');
    URL.revokeObjectURL = jest.fn();
  });
  afterEach(() => window.history.replaceState(null, '', '/'));

  const click = async () => {
    render(<DownloadKey photoId="p1" />);
    const link = screen.getByRole('link', { name: 'Descargar' });
    expect(link).toHaveAttribute('href', '/api/galeria/p1/descargar');
    await userEvent.click(link);
  };

  it('opens the signed S3 url of uploaded files', async () => {
    // A same-page url, the only navigation jsdom performs
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ headers: { 'content-type': 'application/json' }, body: { url: '#s3-signed' } }),
      );

    await click();

    await waitFor(() => expect(window.location.hash).toBe('#s3-signed'));
  });

  it('saves public files with their name', async () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const clicked = clickSpy.mock.contexts as HTMLAnchorElement[];
    global.fetch = jest.fn().mockResolvedValue(
      response({
        headers: {
          'content-type': 'image/jpeg',
          'content-disposition': 'attachment; filename="a.jpg"',
        },
      }),
    );

    await click();

    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x'));
    expect(clicked[0].download).toBe('a.jpg');
    expect(clicked[0].href).toBe('blob:x');
    clickSpy.mockRestore();
  });

  it('downloads without a name when the server sends none', async () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const clicked = clickSpy.mock.contexts as HTMLAnchorElement[];
    global.fetch = jest.fn().mockResolvedValue(response({}));

    await click();

    await waitFor(() => expect(clicked).toHaveLength(1));
    expect(clicked[0].download).toBe('');
    clickSpy.mockRestore();
  });

  it('shows the rate limit message', async () => {
    global.fetch = jest.fn().mockResolvedValue(response({ status: 429, body: 'Esperá 1 minuto' }));

    await click();

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Esperá 1 minuto'));
  });

  it('opens the route itself on other errors or network failures', async () => {
    // jsdom can't navigate to another page: it reports it instead
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    await click();

    await waitFor(() => expect(String(error.mock.calls.flat().join(' '))).toMatch(/navigation/i));
  });
});
