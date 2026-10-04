import { screen } from '@testing-library/react';
import { ProfileForm } from '@components/profile/profile-form';
import prisma from '@/lib/prisma';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import { expectOnlyPlaceholders, renderPage, sessionRow, thrownBy } from '@/test/pages-m-z';
import Loading from './loading';
import Profile, { metadata } from './page';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: { user: { findUnique: jest.fn() } },
}));
jest.mock('@components/profile/profile-form', () => ({
  ProfileForm: jest.fn(() => <form aria-label="perfil" />),
}));

const findUser = prisma.user.findUnique as unknown as jest.Mock;

describe('/perfil', () => {
  beforeEach(() => {
    // The page logs why it redirects; silence just those lines.
    const log = console.error;
    jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      if (!/^Usuario no (autenticado|encontr)/.test(String(args[0]))) log(...args);
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('is titled whoami', () => {
    expect(metadata.title).toBe('whoami');
  });

  it('sends visitors without a valid session home', async () => {
    mockCookies();
    expect(await thrownBy(() => Profile())).toBe('NEXT_REDIRECT:/');

    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(null);
    expect(await thrownBy(() => Profile())).toBe('NEXT_REDIRECT:/');
    expect(findUser).not.toHaveBeenCalled();
  });

  it('sends the session home if its user no longer exists', async () => {
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(sessionRow({ id: 'gone' }));
    findUser.mockResolvedValue(null);

    expect(await thrownBy(() => Profile())).toBe('NEXT_REDIRECT:/');
    expect(findUser).toHaveBeenCalledWith({
      where: { id: 'gone' },
      include: { languages: true, positions: { orderBy: { order: 'asc' } } },
    });
  });

  it('opens the form with the user and their languages', async () => {
    const user = {
      id: 'user-1',
      email: 'ana@example.com',
      languages: [{ language: 'ts', color: '#3178c6', logo: '/ts.svg', userId: 'user-1' }],
      positions: [],
    };
    mockCookies({ sessionId: 'token' });
    jest.mocked(findSession).mockResolvedValue(sessionRow());
    findUser.mockResolvedValue(user);

    await renderPage(Profile());

    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'perfil' })).toBeInTheDocument();
    expect(jest.mocked(ProfileForm).mock.calls[0][0]).toEqual({
      user,
      languages: [{ languageId: 'ts', color: '#3178c6', logo: '/ts.svg' }],
    });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
