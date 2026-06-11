import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { mockHeaders } from '@/test/headers';
import { logClient } from './log-client';

const adminUser = {
  id: 'user-admin',
  name: 'Admin',
  email: 'admin@pcn.com',
  password: 'hash',
  emailVerified: true,
  role: 'ADMIN' as const,
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
const adminSession = {
  id: 'session-admin',
  userId: 'user-admin',
  expires: new Date('2027-01-01'),
  user: adminUser,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};
const regularUser = { ...adminUser, id: 'user-regular', role: 'REGULAR' as const };
const regularSession = {
  ...adminSession,
  id: 'session-regular',
  userId: 'user-regular',
  user: regularUser,
};

const logData = { level: 'info' as const, message: 'Test message', path: '/home' };

describe('logClient', () => {
  it('creates an anonymous log when there is no session cookie', async () => {
    mockCookies();
    mockHeaders({ 'user-agent': 'Jest/1.0', 'x-forwarded-for': '1.2.3.4' });
    prismaMock.appLog.create.mockResolvedValue({} as any);

    await logClient(logData);

    expect(prismaMock.appLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: null,
          userAgent: 'Jest/1.0',
          ipAddress: '1.2.3.4',
        }),
      }),
    );
  });

  it('does not create a log for admin users', async () => {
    mockCookies({ sessionId: adminSession.id });
    mockHeaders({});
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);

    await logClient(logData);

    expect(prismaMock.appLog.create).not.toHaveBeenCalled();
  });

  it('creates a log with userId for a regular user', async () => {
    mockCookies({ sessionId: regularSession.id });
    mockHeaders({ 'user-agent': 'Chrome/100', 'x-forwarded-for': '10.0.0.1' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.appLog.create.mockResolvedValue({} as any);

    await logClient(logData);

    expect(prismaMock.appLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-regular',
          userAgent: 'Chrome/100',
          ipAddress: '10.0.0.1',
        }),
      }),
    );
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
    mockCookies();
    mockHeaders({ 'x-real-ip': '192.168.1.1' });
    prismaMock.appLog.create.mockResolvedValue({} as any);

    await logClient(logData);

    expect(prismaMock.appLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ipAddress: '192.168.1.1' }),
      }),
    );
  });

  it('stores null for user-agent and ip when headers are missing', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.appLog.create.mockResolvedValue({} as any);

    await logClient(logData);

    expect(prismaMock.appLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userAgent: null, ipAddress: null }),
      }),
    );
  });

  it('serialises metadata to JSON when provided', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.appLog.create.mockResolvedValue({} as any);

    await logClient({ ...logData, metadata: { key: 'value' } });

    expect(prismaMock.appLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ metadata: JSON.stringify({ key: 'value' }) }),
      }),
    );
  });

  it('silences errors and does not throw', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.appLog.create.mockRejectedValue(new Error('DB error'));

    await expect(logClient(logData)).resolves.toBeUndefined();
  });
});
