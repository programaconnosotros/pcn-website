// Which image URLs next/image can resize through /_next/image: the same hosts as `images.remotePatterns`
// in next.config.mjs (keep both in sync), plus the site's own files. Anything else (a Google
// account photo, an old link) has to be shown as a plain <img>, or next/image throws.

const FIXED_HOSTS = [
  'avatars.githubusercontent.com',
  'assets.aceternity.com',
  'images.unsplash.com',
];

type Env = Partial<Record<'AWS_CLOUDFRONT_URL' | 'AWS_S3_BUCKET', string>>;

const hostnameOf = (url: string | undefined) => {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

/** Whether next/image is allowed to optimize `src` (server side: it reads the AWS env vars). */
export function canOptimizeImage(
  src: string | null | undefined,
  env: Env = process.env as Env,
): boolean {
  if (!src) return false;
  // A file of the site itself (public/), not a protocol-relative URL.
  if (src.startsWith('/')) return !src.startsWith('//');

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;

  const { hostname } = url;
  if (FIXED_HOSTS.includes(hostname)) return true;
  if (hostname === hostnameOf(env.AWS_CLOUDFRONT_URL)) return true;

  const bucket = env.AWS_S3_BUCKET;
  if (!bucket) return false;
  if (hostname === `${bucket}.s3.amazonaws.com`) return true;
  // `${bucket}.s3.*.amazonaws.com`: the `*` of a remote pattern is one label (the region).
  const prefix = `${bucket}.s3.`;
  const suffix = '.amazonaws.com';
  if (!hostname.startsWith(prefix) || !hostname.endsWith(suffix)) return false;
  const region = hostname.slice(prefix.length, -suffix.length);
  return region.length > 0 && !region.includes('.');
}
