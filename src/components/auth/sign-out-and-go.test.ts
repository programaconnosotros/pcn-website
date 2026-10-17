import { toast } from 'sonner';
import { signOut } from '@/actions/auth/sign-out';
import { pushSupport, turnOffPush } from '@/lib/push-client';
import { signOutAndGo } from './sign-out-and-go';

jest.mock('@/actions/auth/sign-out', () => ({
  signOut: jest.fn(() => Promise.resolve({ success: true })),
}));
jest.mock('@/components/os/os-env', () => ({ notifyOsSessionChange: jest.fn() }));
jest.mock('@/lib/push-client', () => ({ pushSupport: jest.fn(), turnOffPush: jest.fn() }));
jest.mock('sonner', () => ({ toast: { promise: jest.fn() } }));

const router = { push: jest.fn(), refresh: jest.fn() };
const signOutPromise = () => jest.mocked(toast.promise).mock.calls[0][0] as Promise<unknown>;

it('turns push off in this browser while still signed in, then signs out', async () => {
  jest.mocked(pushSupport).mockReturnValue('supported');
  const order: string[] = [];
  jest.mocked(turnOffPush).mockImplementation(async () => void order.push('push off'));
  jest.mocked(signOut).mockImplementation(async () => {
    order.push('sign out');
    return { success: true };
  });

  signOutAndGo(router);
  await signOutPromise();

  expect(order).toEqual(['push off', 'sign out']);
  expect(router.push).toHaveBeenCalledWith('/iniciar-sesion');
});

it('signs out even when turning push off fails', async () => {
  jest.mocked(pushSupport).mockReturnValue('supported');
  jest.mocked(turnOffPush).mockRejectedValue(new Error('offline'));

  signOutAndGo(router);
  await signOutPromise();

  expect(signOut).toHaveBeenCalled();
});

it('skips push where the browser has none', async () => {
  jest.mocked(pushSupport).mockReturnValue('unsupported');

  signOutAndGo(router);
  await signOutPromise();

  expect(turnOffPush).not.toHaveBeenCalled();
  expect(signOut).toHaveBeenCalled();
});
