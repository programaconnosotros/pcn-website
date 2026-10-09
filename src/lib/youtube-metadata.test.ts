import { safeFetch } from '@/lib/safe-fetch';
import { fetchYoutubeMetadata, parseYoutubePage } from './youtube-metadata';

jest.mock('@/lib/safe-fetch', () => ({ safeFetch: jest.fn() }));

const PAGE = `<html><head>
<meta name="title" content="AI Won&#39;t Replace Craftsmanship &amp; more">
<meta itemprop="uploadDate" content="2026-10-06T03:00:00-07:00">
</head><body><script>var ytInitialPlayerResponse = {"videoDetails":{"lengthSeconds":"2071",
"ownerChannelName":"Manfred \\u0026 Co"}};</script></body></html>`;

describe('parseYoutubePage', () => {
  it('reads the title, channel, length and upload day', () => {
    expect(parseYoutubePage(PAGE)).toEqual({
      title: "AI Won't Replace Craftsmanship & more",
      channel: 'Manfred & Co',
      durationSeconds: 2071,
      publishedAt: new Date('2026-10-06T00:00:00.000Z'),
    });
  });

  it('falls back to og:title and publishDate', () => {
    expect(
      parseYoutubePage(
        '<meta property="og:title" content="Otro"> "publishDate":"2025-01-02T00:00:00"',
      ),
    ).toEqual({ title: 'Otro', publishedAt: new Date('2025-01-02T00:00:00.000Z') });
  });

  it('returns nothing it cannot find', () => {
    expect(parseYoutubePage('<html>consent</html>')).toEqual({});
  });
});

describe('fetchYoutubeMetadata', () => {
  it('fetches the watch page of the id through safeFetch, with a size limit', async () => {
    jest.mocked(safeFetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      body: Buffer.from(PAGE),
      url: '',
    });

    await expect(fetchYoutubeMetadata('HqB3t7046QE')).resolves.toMatchObject({
      durationSeconds: 2071,
    });
    expect(safeFetch).toHaveBeenCalledWith(
      'https://www.youtube.com/watch?v=HqB3t7046QE',
      expect.objectContaining({ maxBytes: expect.any(Number), timeoutMs: expect.any(Number) }),
    );
  });

  it('gives up quietly when the page fails or is too big', async () => {
    jest
      .mocked(safeFetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers(),
        body: null,
        url: '',
      })
      .mockResolvedValueOnce({ ok: true, status: 200, headers: new Headers(), body: null, url: '' })
      .mockRejectedValueOnce(new Error('timeout'));

    await expect(fetchYoutubeMetadata('a')).resolves.toEqual({});
    await expect(fetchYoutubeMetadata('a')).resolves.toEqual({});
    await expect(fetchYoutubeMetadata('a')).resolves.toEqual({});
  });
});
