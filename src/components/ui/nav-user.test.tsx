import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { signOut } from '@/actions/auth/sign-out';
import { notifyOsSessionChange } from '@/components/os/os-env';
import type { SessionUser } from '@/lib/session';
import { mockRouter } from '@/test/dom';
import { NavUser } from './nav-user';
import { SidebarProvider } from './sidebar';

jest.mock('@/actions/auth/sign-out', () => ({ signOut: jest.fn() }));
jest.mock('@/components/os/os-env', () => ({ notifyOsSessionChange: jest.fn() }));
jest.mock('sonner', () => ({ toast: { promise: jest.fn() } }));

let mockIsMobile = false;
jest.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => mockIsMobile }));

const user = {
  id: 'u1',
  name: 'Ada  Lovelace Byron',
  email: 'ada@pcn.dev',
  image: null,
  role: 'ADMIN',
} as unknown as SessionUser;

const renderNav = (value: SessionUser | null, open = true) =>
  render(
    <SidebarProvider defaultOpen={open}>
      <NavUser user={value} />
    </SidebarProvider>,
  );

beforeEach(() => {
  mockIsMobile = false;
});

describe('NavUser', () => {
  it('offers sign in and sign up to visitors', () => {
    renderNav(null);
    expect(screen.getByRole('link', { name: /iniciarSesion\(\);/ })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion',
    );
    expect(screen.getByRole('link', { name: /Crear cuenta/ })).toHaveAttribute(
      'href',
      '/autenticacion/registro',
    );
  });

  it('shows only icons to visitors in a collapsed sidebar', () => {
    renderNav(null, false);
    expect(screen.queryByText(/iniciarSesion/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Crear cuenta/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('shows the member with initials and admin badge and navigates from the menu', async () => {
    renderNav(user);
    const trigger = screen.getByRole('button', { name: /Ada Lovelace Byron/ });
    expect(trigger).toHaveTextContent('AL');
    expect(trigger).toHaveTextContent('Admin');
    expect(trigger).toHaveTextContent('ada@pcn.dev');

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Ver mi perfil' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/perfil/u1');

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Editar perfil' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/perfil');
  });

  it('signs out and then tells PCN OS the session changed', async () => {
    let reject!: (_error: Error) => void;
    jest.mocked(signOut).mockReturnValue(
      new Promise<never>((_resolve, rej) => {
        reject = rej;
      }),
    );
    renderNav({ ...user, role: 'USER' } as unknown as SessionUser);
    const trigger = screen.getByRole('button', { name: /Ada/ });
    expect(trigger).not.toHaveTextContent('Admin');

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

    expect(toast.promise).toHaveBeenCalledWith(expect.any(Promise), {
      loading: 'Cerrando sesión...',
      success: 'Sesión cerrada correctamente',
      error: 'Error al cerrar sesión',
    });
    const promise = jest.mocked(toast.promise).mock.calls[0][0] as Promise<unknown>;
    expect(notifyOsSessionChange).not.toHaveBeenCalled();
    await act(async () => {
      reject(new Error('NEXT_REDIRECT'));
      await promise.catch(() => {});
    });
    expect(notifyOsSessionChange).toHaveBeenCalled();
  });

  it('shows only the avatar without a menu in a collapsed desktop sidebar', async () => {
    renderNav(user, false);
    const trigger = screen.getByRole('button', { name: 'AL' });
    await userEvent.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the menu below on mobile even when collapsed', async () => {
    mockIsMobile = true;
    renderNav(user, false);
    await userEvent.click(screen.getByRole('button', { name: /Ada/ }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
