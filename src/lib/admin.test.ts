import { getCurrentSession } from '@/actions/auth/get-current-session';
import { getAdminUser, requireAdmin, requireAdminPage } from './admin';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));

const mockSession = getCurrentSession as jest.Mock;
const admin = { id: 'a', role: 'ADMIN' };
const regular = { id: 'r', role: 'REGULAR' };

describe('getAdminUser', () => {
  it('returns the user when they are an admin', async () => {
    mockSession.mockResolvedValue({ user: admin });
    await expect(getAdminUser()).resolves.toBe(admin);
  });

  it('returns null for other roles and for visitors', async () => {
    mockSession.mockResolvedValue({ user: regular });
    await expect(getAdminUser()).resolves.toBeNull();
    mockSession.mockResolvedValue(null);
    await expect(getAdminUser()).resolves.toBeNull();
  });
});

describe('requireAdmin', () => {
  it('returns the admin', async () => {
    mockSession.mockResolvedValue({ user: admin });
    await expect(requireAdmin()).resolves.toBe(admin);
  });

  it('throws for everyone else', async () => {
    mockSession.mockResolvedValue({ user: regular });
    await expect(requireAdmin()).rejects.toThrow('No autorizado');
  });
});

describe('requireAdminPage', () => {
  it('returns the admin', async () => {
    mockSession.mockResolvedValue({ user: admin });
    await expect(requireAdminPage()).resolves.toBe(admin);
  });

  it('redirects everyone else to the home page', async () => {
    mockSession.mockResolvedValue(null);
    await expect(requireAdminPage()).rejects.toThrow('NEXT_REDIRECT:/');
  });
});
