import { isPushServiceEndpoint } from './push-endpoints';

it.each([
  'https://fcm.googleapis.com/fcm/send/abc:def',
  'https://updates.push.services.mozilla.com/wpush/v2/gAAA',
  'https://web.push.apple.com/QGuQyavXutnMJ',
  'https://wns2-par02p.notify.windows.com/w/?token=BQYAAA',
])('accepts the push service at %s', (endpoint) => {
  expect(isPushServiceEndpoint(endpoint)).toBe(true);
});

it.each([
  ['plain http', 'http://fcm.googleapis.com/fcm/send/abc'],
  ['another host', 'https://evil.example/fcm.googleapis.com'],
  ['a look-alike suffix', 'https://fcm.googleapis.com.evil.example/send'],
  ['a host ending like Apple without the dot', 'https://evilpush.apple.com.example'],
  ['an internal address', 'https://169.254.169.254/latest/meta-data'],
  ['another port', 'https://fcm.googleapis.com:8443/fcm/send/abc'],
  ['credentials', 'https://user:pass@fcm.googleapis.com/fcm/send/abc'],
  ['not a URL', 'fcm.googleapis.com/fcm/send/abc'],
])('rejects %s', (_case, endpoint) => {
  expect(isPushServiceEndpoint(endpoint)).toBe(false);
});
