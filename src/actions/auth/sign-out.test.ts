import { redirect } from 'next/navigation';
import { mockCookies } from '@/test/cookies';
import { signOut } from './sign-out';

describe('signOut', () => {
  it('deletes the sessionId cookie and redirects to the sign-in page', async () => {
    const store = mockCookies({ sessionId: 'abc' });

    await expect(signOut()).rejects.toThrow('NEXT_REDIRECT:/autenticacion/iniciar-sesion');

    expect(store.delete).toHaveBeenCalledWith('sessionId');
    expect(redirect).toHaveBeenCalledWith('/autenticacion/iniciar-sesion');
  });

  it('still redirects even when there is no sessionId cookie', async () => {
    const store = mockCookies();

    await expect(signOut()).rejects.toThrow('NEXT_REDIRECT:/autenticacion/iniciar-sesion');

    expect(store.delete).toHaveBeenCalledWith('sessionId');
  });
});
