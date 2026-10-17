import {
  deletePushSubscription,
  savePushSubscription,
} from '@/actions/notifications/push-subscriptions';

/** Browser side of Web Push (server side in src/lib/web-push.ts). */

export type PushSupport = 'supported' | 'unsupported' | 'needs-install';

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const pushSupport = (): PushSupport => {
  const apis = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  // Safari on iPhone and iPad only offers push to the site added to the home screen.
  if (isIos() && !isStandalone()) return 'needs-install';
  return apis ? 'supported' : 'unsupported';
};

// PwaProvider registers public/sw.js; in development it doesn't (unless the URL has ?sw), and
// then `ready` never resolves.
const READY_TIMEOUT_MS = 4000;

export const serviceWorker = () =>
  Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), READY_TIMEOUT_MS)),
  ]);

export const currentSubscription = async () => {
  const registration = await serviceWorker();
  return registration ? registration.pushManager.getSubscription() : null;
};

const toUint8Array = (base64url: string) => {
  const base64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
};

/** Asks for permission, subscribes this browser and saves it for the signed-in member. */
export const turnOnPush = async (publicKey: string) => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission;

  const registration = await serviceWorker();
  if (!registration)
    throw new Error('El sitio todavía no terminó de instalarse: recargá la página');

  const options = { userVisibleOnly: true, applicationServerKey: toUint8Array(publicKey) };
  let subscription: PushSubscription;
  try {
    subscription = await registration.pushManager.subscribe(options);
  } catch (error) {
    // A subscription made with a previous key: drop it and subscribe again.
    if ((error as DOMException).name !== 'InvalidStateError') throw error;
    await (await registration.pushManager.getSubscription())?.unsubscribe();
    subscription = await registration.pushManager.subscribe(options);
  }
  await savePushSubscription(subscription.toJSON());
  return permission;
};

/** Unsubscribes this browser and forgets it on the server. Must run while still signed in. */
export const turnOffPush = async () => {
  const subscription = await currentSubscription();
  if (!subscription) return;
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  await deletePushSubscription(endpoint);
};
