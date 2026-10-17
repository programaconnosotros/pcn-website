import { safeFetch } from '@/lib/safe-fetch';
import { loadCardImage } from './load-image';

jest.mock('@/lib/safe-fetch', () => ({ safeFetch: jest.fn() }));

const safeFetchMock = safeFetch as jest.Mock;

const remote = (contentType: string, body: Buffer | null, status = 200) => ({
  status,
  ok: status === 200,
  headers: new Headers({ 'content-type': contentType }),
  body,
  url: 'https://cdn.test/foto.png',
});

describe('loadCardImage', () => {
  it('returns null without a picture', async () => {
    await expect(loadCardImage(null)).resolves.toBeNull();
    await expect(loadCardImage('')).resolves.toBeNull();
  });

  it('turns a remote PNG into a data URL, fetched through safeFetch with a size cap', async () => {
    safeFetchMock.mockResolvedValue(remote('image/png', Buffer.from('png')));

    await expect(loadCardImage('https://cdn.test/foto.png')).resolves.toBe(
      `data:image/png;base64,${Buffer.from('png').toString('base64')}`,
    );
    expect(safeFetchMock).toHaveBeenCalledWith('https://cdn.test/foto.png', {
      timeoutMs: 3000,
      maxBytes: 3 * 1024 * 1024,
    });
  });

  it('falls back when the remote file is not PNG/JPEG, too big or an error', async () => {
    safeFetchMock.mockResolvedValueOnce(remote('image/webp', Buffer.from('webp')));
    await expect(loadCardImage('https://cdn.test/a.webp')).resolves.toBeNull();

    safeFetchMock.mockResolvedValueOnce(remote('image/png', null));
    await expect(loadCardImage('https://cdn.test/huge.png')).resolves.toBeNull();

    safeFetchMock.mockResolvedValueOnce(remote('text/html', null, 404));
    await expect(loadCardImage('https://cdn.test/missing.png')).resolves.toBeNull();
  });

  it('falls back when safeFetch refuses an internal address', async () => {
    safeFetchMock.mockRejectedValue(new Error('apunta a una dirección interna'));

    await expect(loadCardImage('http://169.254.169.254/latest/meta-data')).resolves.toBeNull();
  });

  it('reads site pictures from public/', async () => {
    await expect(loadCardImage('/pwa-icon-192.png')).resolves.toMatch(/^data:image\/png;base64,/);
  });

  it('never reads files outside public/', async () => {
    await expect(loadCardImage('/../package.json.png')).resolves.toBeNull();
    await expect(loadCardImage('/%2e%2e/%2e%2e/etc/passwd.png')).resolves.toBeNull();
  });
});
