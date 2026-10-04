import { postUploadForm } from './upload-form';

describe('postUploadForm', () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    global.fetch = fetchMock;
  });

  it('posts the signed fields followed by the file', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const file = new File(['hola'], 'foto.jpg', { type: 'image/jpeg' });

    await postUploadForm('https://bucket.s3.amazonaws.com', { key: 'k', Policy: 'p' }, file);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://bucket.s3.amazonaws.com');
    expect(init.method).toBe('POST');
    const body = init.body as FormData;
    expect([...body.keys()]).toEqual(['key', 'Policy', 'file']);
    expect(body.get('key')).toBe('k');
    expect((body.get('file') as File).name).toBe('foto.jpg');
  });

  it('throws when S3 rejects the upload (e.g. too large)', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400 });
    await expect(postUploadForm('https://s3', {}, new File([], 'x'))).rejects.toThrow(
      'Error al subir el archivo',
    );
  });
});
