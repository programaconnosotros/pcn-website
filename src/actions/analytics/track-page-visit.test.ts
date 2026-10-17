import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { mockHeaders } from '@/test/headers';
import { enforceRateLimit } from '@/lib/rate-limit';
import { trackPageVisit } from './track-page-visit';

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

describe('trackPageVisit', () => {
  it('records an anonymous visit when there is no session cookie', async () => {
    mockCookies();
    mockHeaders({
      'user-agent': 'Jest/1.0',
      'x-forwarded-for': '1.2.3.4',
      referer: 'https://google.com',
    });
    prismaMock.pageVisit.create.mockResolvedValue({} as any);

    await trackPageVisit('/eventos');

    expect(prismaMock.pageVisit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          path: '/eventos',
          userId: null,
          userAgent: 'Jest/1.0',
          ipAddress: '1.2.3.4',
          referer: 'https://google.com',
        }),
      }),
    );
  });

  it("records admins' visits with their user, so the metrics can leave them out or count them", async () => {
    mockCookies({ sessionId: adminSession.id });
    mockHeaders({});
    prismaMock.session.findUnique.mockResolvedValue(adminSession as any);
    prismaMock.pageVisit.create.mockResolvedValue({} as any);

    await trackPageVisit('/admin');

    expect(prismaMock.pageVisit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ path: '/admin', userId: adminSession.userId }),
      }),
    );
  });

  it('records a visit with userId for a regular user session', async () => {
    mockCookies({ sessionId: regularSession.id });
    mockHeaders({ 'user-agent': 'Chrome/100', 'x-forwarded-for': '10.0.0.2' });
    prismaMock.session.findUnique.mockResolvedValue(regularSession as any);
    prismaMock.pageVisit.create.mockResolvedValue({} as any);

    await trackPageVisit('/charlas');

    expect(prismaMock.pageVisit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          path: '/charlas',
          userId: 'user-regular',
          userAgent: 'Chrome/100',
          ipAddress: '10.0.0.2',
        }),
      }),
    );
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
    mockCookies();
    mockHeaders({ 'x-real-ip': '192.168.0.50' });
    prismaMock.pageVisit.create.mockResolvedValue({} as any);

    await trackPageVisit('/miembros');

    expect(prismaMock.pageVisit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ipAddress: '192.168.0.50' }),
      }),
    );
  });

  it('stores null for referer when the header is absent', async () => {
    mockCookies();
    mockHeaders({ 'user-agent': 'Jest/1.0' });
    prismaMock.pageVisit.create.mockResolvedValue({} as any);

    await trackPageVisit('/foro');

    expect(prismaMock.pageVisit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ referer: null }),
      }),
    );
  });

  it('records a visit even when the session cookie exists but session is not found in DB', async () => {
    mockCookies({ sessionId: 'stale-session' });
    mockHeaders({});
    prismaMock.session.findUnique.mockResolvedValue(null);
    prismaMock.pageVisit.create.mockResolvedValue({} as any);

    await trackPageVisit('/feed');

    expect(prismaMock.pageVisit.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: null }),
      }),
    );
  });

  it('silences errors and does not throw', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.pageVisit.create.mockRejectedValue(new Error('DB error'));

    await expect(trackPageVisit('/galeria')).resolves.toBeUndefined();
  });

  it('clips long headers so nobody can fill the table', async () => {
    mockCookies();
    mockHeaders({ 'user-agent': 'U'.repeat(5000), referer: 'R'.repeat(5000) });
    prismaMock.pageVisit.create.mockResolvedValue({} as any);

    await trackPageVisit('/eventos');

    const { data } = prismaMock.pageVisit.create.mock.calls[0][0];
    expect(data.userAgent).toHaveLength(500);
    expect(data.referer).toHaveLength(500);
  });

  it('ignores anything that is not a path of the site', async () => {
    for (const path of [
      'https://evil.test',
      '',
      42 as unknown as string,
      // `//` y `/\` los navegadores los toman como otro dominio: terminarían linkeados en /metricas
      '//open-redirect-landing.vercel.app/',
      '/\\open-redirect-landing.vercel.app/',
      '/eventos?x=1',
      '/eventos#x',
      '/a b',
      'javascript:alert(1)',
      `/${'A'.repeat(900_000)}`,
    ]) {
      await trackPageVisit(path);
    }

    expect(enforceRateLimit).not.toHaveBeenCalled();
    expect(prismaMock.pageVisit.create).not.toHaveBeenCalled();
  });

  it("ignores made-up paths of the site without spending the visitor's rate limit", async () => {
    for (const path of ['/estafa-reclama-tu-premio/ya', '/eventos/abc/inventado']) {
      await trackPageVisit(path);
    }

    expect(enforceRateLimit).not.toHaveBeenCalled();
    expect(prismaMock.pageVisit.create).not.toHaveBeenCalled();
  });

  it('ignores pages of things that do not exist, like a made-up event or shortcut', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.event.findUnique.mockResolvedValue(null);
    prismaMock.event.findFirst.mockResolvedValue(null);

    await trackPageVisit('/eventos/estafa-reclama-tu-premio');
    await trackPageVisit('/estafa-reclama-tu-premio');

    expect(prismaMock.pageVisit.create).not.toHaveBeenCalled();
  });

  it('records the page of an event that exists, and its shortcut', async () => {
    mockCookies();
    mockHeaders({});
    prismaMock.event.findUnique.mockResolvedValue({ id: 'cev1' } as any);
    prismaMock.event.findFirst.mockResolvedValue({ id: 'cev1' } as any);
    prismaMock.pageVisit.create.mockResolvedValue({} as any);

    await trackPageVisit('/eventos/cev1/charlas');
    await trackPageVisit('/cowork');

    expect(prismaMock.event.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { shortcut: 'cowork', deletedAt: null } }),
    );
    const paths = prismaMock.pageVisit.create.mock.calls.map(([args]) => args.data.path);
    expect(paths).toEqual(['/eventos/cev1/charlas', '/cowork']);
  });

  it('drops visits silently past the rate limit', async () => {
    (enforceRateLimit as jest.Mock).mockRejectedValueOnce(new Error('RATE_LIMIT'));

    await expect(trackPageVisit('/eventos')).resolves.toBeUndefined();

    expect(enforceRateLimit).toHaveBeenCalledWith('pageVisit');
    expect(prismaMock.pageVisit.create).not.toHaveBeenCalled();
  });
});
