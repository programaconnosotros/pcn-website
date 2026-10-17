import { prismaMock } from '@/test/prisma';
import { reportEmailQuotaExceeded, getOpenSystemAlerts } from './system-alerts';

jest.mock('@/lib/cache', () => ({
  cached: (_name: string, fn: (..._args: unknown[]) => unknown) => fn,
}));

describe('reportEmailQuotaExceeded', () => {
  it('opens the alert and tells every active admin in the app', async () => {
    prismaMock.systemAlert.findFirst.mockResolvedValue(null);
    prismaMock.user.findMany.mockResolvedValue([{ id: 'admin-1' }, { id: 'admin-2' }] as any);

    await reportEmailQuotaExceeded('Monthly quota reached');

    expect(prismaMock.systemAlert.create).toHaveBeenCalledWith({
      data: { kind: 'email_quota', detail: 'Monthly quota reached' },
    });
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: { role: 'ADMIN', suspendedAt: null, deactivatedAt: null },
      select: { id: true },
    });
    const { data } = prismaMock.notification.createMany.mock.calls[0][0] as {
      data: { userId: string; type: string; title: string }[];
    };
    expect(data.map((notification) => notification.userId)).toEqual(['admin-1', 'admin-2']);
    expect(data[0]).toMatchObject({
      type: 'email_quota_exceeded',
      title: 'Resend se quedó sin cuota de emails',
    });
  });

  it('adds nothing while the alert is already open', async () => {
    prismaMock.systemAlert.findFirst.mockResolvedValue({ id: 'alert-1' } as any);

    await reportEmailQuotaExceeded('again');

    expect(prismaMock.systemAlert.create).not.toHaveBeenCalled();
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
  });

  it('never throws', async () => {
    prismaMock.systemAlert.findFirst.mockRejectedValue(new Error('db down'));

    await expect(reportEmailQuotaExceeded('x')).resolves.toBeUndefined();
  });
});

describe('getOpenSystemAlerts', () => {
  it('reads the open alerts, oldest first', async () => {
    prismaMock.systemAlert.findMany.mockResolvedValue([]);

    await getOpenSystemAlerts();

    expect(prismaMock.systemAlert.findMany).toHaveBeenCalledWith({
      where: { resolvedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true, kind: true, detail: true, createdAt: true },
    });
  });
});
