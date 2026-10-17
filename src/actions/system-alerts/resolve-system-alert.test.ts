import { prismaMock } from '@/test/prisma';
import { requireAdmin } from '@/lib/admin';
import { resolveSystemAlert } from './resolve-system-alert';

jest.mock('@/lib/admin', () => ({ requireAdmin: jest.fn() }));

describe('resolveSystemAlert', () => {
  it('refuses anyone but an admin', async () => {
    jest.mocked(requireAdmin).mockRejectedValue(new Error('No autorizado'));

    await expect(resolveSystemAlert('alert-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.systemAlert.updateMany).not.toHaveBeenCalled();
  });

  it('marks the open alert as resolved by the admin', async () => {
    jest.mocked(requireAdmin).mockResolvedValue({ id: 'admin-1' } as any);

    await resolveSystemAlert('alert-1');

    expect(prismaMock.systemAlert.updateMany).toHaveBeenCalledWith({
      where: { id: 'alert-1', resolvedAt: null },
      data: { resolvedAt: expect.any(Date), resolvedBy: 'admin-1' },
    });
  });

  it('validates the id', async () => {
    jest.mocked(requireAdmin).mockResolvedValue({ id: 'admin-1' } as any);

    await expect(resolveSystemAlert('')).rejects.toThrow();
  });
});
