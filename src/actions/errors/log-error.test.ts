import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { mockHeaders } from '@/test/headers';
import { logError, logClientError } from './log-error';

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

describe('logError', () => {
  it('creates an error log without userId for an anonymous request', async () => {
    mockCookies();
    mockHeaders({ 'user-agent': 'Jest/1.0', 'x-forwarded-for': '1.2.3.4' });
    prismaMock.errorLog.create.mockResolvedValue({} as any);

    const error = new Error('Something went wrong');
    await logError(error, { path: '/api/test' });

    expect(prismaMock.errorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          message: 'Something went wrong',
          stack: expect.stringContaining('Something went wrong'),
          path: '/api/test',
          userId: null,
          userAgent: 'Jest/1.0',
          ipAddress: '1.2.3.4',
        }),
      }),
    );
  });

  it('does not log errors for admin users', async () => {
    mockCookies({ sessionId: adminSession.id });
    mockHeaders({});
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);

    await logError(new Error('Admin error'));

    expect(prismaMock.errorLog.create).not.toHaveBeenCalled();
  });

  it('creates an error log with userId for a regular user session', async () => {
    mockCookies({ sessionId: regularSession.id });
    mockHeaders({ 'user-agent': 'Chrome/100', 'x-forwarded-for': '10.0.0.1' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.errorLog.create.mockResolvedValue({} as any);

    await logError(new Error('User error'));

    expect(prismaMock.errorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-regular',
          userAgent: 'Chrome/100',
          ipAddress: '10.0.0.1',
        }),
      }),
    );
  });

  it('handles non-Error objects by converting them to string', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.errorLog.create.mockResolvedValue({} as any);

    await logError('plain string error');

    expect(prismaMock.errorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          message: 'plain string error',
          stack: undefined,
        }),
      }),
    );
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
    mockCookies();
    mockHeaders({ 'x-real-ip': '172.16.0.1' });
    prismaMock.errorLog.create.mockResolvedValue({} as any);

    await logError(new Error('IP fallback'));

    expect(prismaMock.errorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ipAddress: '172.16.0.1' }),
      }),
    );
  });

  it('serialises metadata to JSON when provided', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.errorLog.create.mockResolvedValue({} as any);

    await logError(new Error('Meta error'), { metadata: { component: 'Header' } });

    expect(prismaMock.errorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: JSON.stringify({ component: 'Header' }),
        }),
      }),
    );
  });

  it('silences errors and does not throw', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.errorLog.create.mockRejectedValue(new Error('DB error'));

    await expect(logError(new Error('Original'))).resolves.toBeUndefined();
  });
});

describe('logClientError', () => {
  it('creates an error log without userId for an anonymous request', async () => {
    mockCookies();
    mockHeaders({ 'user-agent': 'Jest/1.0', 'x-forwarded-for': '5.6.7.8' });
    prismaMock.errorLog.create.mockResolvedValue({} as any);

    await logClientError({
      message: 'Client error',
      stack: 'Error: Client error\n  at Component',
      path: '/page',
    });

    expect(prismaMock.errorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          message: 'Client error',
          stack: 'Error: Client error\n  at Component',
          path: '/page',
          userId: null,
          userAgent: 'Jest/1.0',
          ipAddress: '5.6.7.8',
        }),
      }),
    );
  });

  it('does not log client errors for admin users', async () => {
    mockCookies({ sessionId: adminSession.id });
    mockHeaders({});
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);

    await logClientError({ message: 'Admin client error' });

    expect(prismaMock.errorLog.create).not.toHaveBeenCalled();
  });

  it('creates an error log with userId for a regular user session', async () => {
    mockCookies({ sessionId: regularSession.id });
    mockHeaders({ 'user-agent': 'Firefox/99' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.errorLog.create.mockResolvedValue({} as any);

    await logClientError({ message: 'Regular client error' });

    expect(prismaMock.errorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-regular' }),
      }),
    );
  });

  it('stores null for stack when not provided', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.errorLog.create.mockResolvedValue({} as any);

    await logClientError({ message: 'No stack' });

    expect(prismaMock.errorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stack: null }),
      }),
    );
  });

  it('serialises metadata to JSON when provided', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.errorLog.create.mockResolvedValue({} as any);

    await logClientError({ message: 'Meta', metadata: { browser: 'Chrome' } });

    expect(prismaMock.errorLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ metadata: JSON.stringify({ browser: 'Chrome' }) }),
      }),
    );
  });

  it('silences errors and does not throw', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.errorLog.create.mockRejectedValue(new Error('DB error'));

    await expect(logClientError({ message: 'Fail' })).resolves.toBeUndefined();
  });
});
