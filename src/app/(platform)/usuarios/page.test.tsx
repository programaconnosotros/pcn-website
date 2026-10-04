import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { getUsers, type UserWithoutPassword } from '@/actions/users/get-users';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import {
  adminRow,
  expectOnlyPlaceholders,
  renderPage,
  sessionRow,
  thrownBy,
} from '@/test/pages-m-z';
import UsuariosLayout, { metadata } from './layout';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import CommunityPage from './page';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/users/get-users', () => ({ getUsers: jest.fn() }));
jest.mock('@/components/comunity/users-columns', () => ({ columns: [] }));
jest.mock('@/components/comunity/data-table', () => ({
  DataTable: ({
    header,
    intro,
    data,
  }: {
    header: ReactNode;
    intro: ReactNode;
    data: unknown[];
  }) => (
    <div>
      {header}
      {intro}
      <p>{data.length} filas</p>
    </div>
  ),
}));
jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

const NOW = new Date('2026-05-10T12:00:00Z');
const DAY = 86_400_000;

const user = (overrides: Partial<UserWithoutPassword> = {}) =>
  ({
    id: 'u',
    name: 'Ana',
    emailVerified: false,
    role: 'REGULAR',
    isAmbassador: false,
    jobTitle: null,
    career: null,
    slogan: null,
    languages: [],
    createdAt: new Date(NOW.getTime() - 90 * DAY),
    ...overrides,
  }) as UserWithoutPassword;

const stat = (label: string) => screen.getByText(label).nextElementSibling;

describe('/usuarios layout', () => {
  it('is an admin listing', () => {
    expect(metadata.title).toBe('sudo ls ~/usuarios');
    expect(metadata.openGraph).toMatchObject({ title: 'Usuarios' });
  });

  it('sends anyone who is not an admin to the public member directory', async () => {
    mockCookies();
    expect(await thrownBy(() => UsuariosLayout({ children: null }))).toBe(
      'NEXT_REDIRECT:/miembros',
    );

    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValueOnce(null);
    expect(await thrownBy(() => UsuariosLayout({ children: null }))).toBe(
      'NEXT_REDIRECT:/miembros',
    );

    jest.mocked(findSession).mockResolvedValueOnce(sessionRow());
    expect(await thrownBy(() => UsuariosLayout({ children: null }))).toBe(
      'NEXT_REDIRECT:/miembros',
    );
  });

  it('lets admins in', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(adminRow());

    render(await UsuariosLayout({ children: <p>tabla de usuarios</p> }));

    expect(findSession).toHaveBeenCalledWith('token');
    expect(screen.getByText('tabla de usuarios')).toBeInTheDocument();
  });
});

describe('/usuarios', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW, doNotFake: ['setTimeout', 'setInterval', 'queueMicrotask'] });
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('summarizes the users above the table', async () => {
    jest
      .mocked(getUsers)
      .mockResolvedValue([
        user({ id: '1', createdAt: new Date(NOW.getTime() - 2 * DAY), emailVerified: true }),
        user({ id: '2', role: 'ADMIN', emailVerified: true, jobTitle: 'Dev' }),
        user({ id: '3', isAmbassador: true, languages: [{ language: 'ts', color: '', logo: '' }] }),
        user({ id: '4', slogan: 'hola' }),
      ]);

    await renderPage(CommunityPage());

    expect(screen.getByText('4 usuarios registrados')).toBeInTheDocument();
    expect(screen.getByText('4 filas')).toBeInTheDocument();
    expect(stat('nuevos')).toHaveTextContent('+1');
    expect(stat('verificados')).toHaveTextContent('50%');
    expect(screen.getByText('2 emails')).toBeInTheDocument();
    expect(stat('perfil completo')).toHaveTextContent('75%');
    expect(stat('admins')).toHaveTextContent('1');
    expect(stat('ambassadors')).toHaveTextContent('1');
  });

  it('shows dashes instead of percentages without users', async () => {
    jest.mocked(getUsers).mockResolvedValue([]);

    await renderPage(CommunityPage());

    expect(stat('verificados')).toHaveTextContent('—');
    expect(stat('perfil completo')).toHaveTextContent('—');
    expect(stat('nuevos')).toHaveTextContent('+0');
  });

  it('uses the users section card for link previews', async () => {
    expect(alt).toBe('usuarios · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'usuarios' });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
