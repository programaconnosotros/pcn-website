import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { getCurrentSession } from './get-current-session';

const stubUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hash',
  emailVerified: true,
  role: 'REGULAR' as const,
  phoneNumber: null,
  image: null,
  countryOfOrigin: null,
  province: null,
  xAccountUrl: null,
  linkedinUrl: null,
  gitHubUrl: null,
  slogan: null,
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const stubSession = {
  id: 'session-1',
  userId: 'user-1',
  expires: new Date('2027-01-01'),
  user: stubUser,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('getCurrentSession', () => {
  it('returns null when there is no sessionId cookie', async () => {
    mockCookies(); // no sessionId

    const result = await getCurrentSession();

    expect(result).toBeNull();
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('queries the database and returns the session when sessionId is present', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(stubSession as any);

    const result = await getCurrentSession();

    expect(result).toEqual(stubSession);
    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      include: { user: true },
    });
  });

  it('returns null when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'expired-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    const result = await getCurrentSession();

    expect(result).toBeNull();
  });
});
