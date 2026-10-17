import { safeFetch } from '@/lib/safe-fetch';

// What a recommended YouTube video's page says about it (title, channel, length, upload day), so
// admins don't have to look it up by hand. Best effort: YouTube can answer with a consent page or
// change its markup, and then the admin fills in what's missing when reviewing it.

const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 6_000;

export type YoutubeMetadata = {
  title?: string;
  channel?: string;
  durationSeconds?: number;
  publishedAt?: Date;
};

const decodeJsonString = (raw: string) => {
  try {
    return JSON.parse(`"${raw}"`) as string;
  } catch {
    return undefined;
  }
};

const decodeHtml = (raw: string) =>
  raw
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** Reads the metadata out of a watch page's HTML. */
export const parseYoutubePage = (html: string): YoutubeMetadata => {
  const metadata: YoutubeMetadata = {};
  const title =
    html.match(/<meta name="title" content="([^"]*)"/)?.[1] ??
    html.match(/<meta property="og:title" content="([^"]*)"/)?.[1];
  if (title) metadata.title = decodeHtml(title);

  const channel = html.match(/"ownerChannelName":"((?:[^"\\]|\\.)*)"/)?.[1];
  const channelName = channel ? decodeJsonString(channel) : undefined;
  if (channelName) metadata.channel = channelName;

  const length = Number(html.match(/"lengthSeconds":"(\d+)"/)?.[1]);
  if (length > 0) metadata.durationSeconds = length;

  const day =
    html.match(/<meta itemprop="uploadDate" content="(\d{4}-\d{2}-\d{2})/)?.[1] ??
    html.match(/"(?:uploadDate|publishDate)":"(\d{4}-\d{2}-\d{2})/)?.[1];
  if (day) metadata.publishedAt = new Date(`${day}T00:00:00.000Z`);
  return metadata;
};

/** The metadata of the YouTube video `id`; empty if the page can't be read. */
export const fetchYoutubeMetadata = async (id: string): Promise<YoutubeMetadata> => {
  try {
    const response = await safeFetch(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`, {
      maxBytes: MAX_BYTES,
      timeoutMs: TIMEOUT_MS,
      headers: { 'Accept-Language': 'es,en;q=0.8', Cookie: 'CONSENT=YES+1' },
    });
    if (!response.ok || !response.body) return {};
    return parseYoutubePage(response.body.toString('utf8'));
  } catch {
    return {};
  }
};
