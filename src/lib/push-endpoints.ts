/**
 * The push services of the browsers that support Web Push. A subscription's endpoint comes from
 * the browser, and the server POSTs to it on every notification: accepting any URL would let
 * someone point it at an internal address (SSRF). Only these hosts, over HTTPS.
 */
const EXACT_HOSTS = new Set([
  // Chrome, Edge, Opera, Samsung Internet and the rest of Chromium.
  'fcm.googleapis.com',
  // Firefox.
  'updates.push.services.mozilla.com',
]);
const HOST_SUFFIXES = [
  // Safari, on macOS and on iOS/iPadOS (web.push.apple.com).
  '.push.apple.com',
  // Edge before Chromium and Windows apps (wns2-*.notify.windows.com).
  '.notify.windows.com',
];

export const isPushServiceEndpoint = (endpoint: string) => {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.port || url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  return EXACT_HOSTS.has(host) || HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
};
