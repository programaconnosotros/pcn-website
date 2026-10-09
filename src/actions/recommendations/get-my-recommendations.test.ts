import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { getMyRecommendations } from './get-my-recommendations';

const loginAs = (user: { id: string; role: 'REGULAR' | 'ADMIN' }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('getMyRecommendations', () => {
  it('has nothing for anonymous visitors', async () => {
    mockCookies();
    await expect(getMyRecommendations('VIDEO')).resolves.toEqual({
      isAuthenticated: false,
      isAdmin: false,
      items: [],
    });
    expect(prismaMock.recommendation.findMany).not.toHaveBeenCalled();
  });

  it('lists only the user’s own pending and rejected ones of that kind', async () => {
    loginAs({ id: 'user-1', role: 'REGULAR' });
    const items = [{ id: 'r1', title: 'Charla', status: 'PENDING', createdAt: new Date() }];
    prismaMock.recommendation.findMany.mockResolvedValue(items as any);

    await expect(getMyRecommendations('BOOK')).resolves.toEqual({
      isAuthenticated: true,
      isAdmin: false,
      items,
    });
    expect(prismaMock.recommendation.findMany).toHaveBeenCalledWith({
      where: { submittedById: 'user-1', kind: 'BOOK', status: { in: ['PENDING', 'REJECTED'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, title: true, status: true, createdAt: true },
    });
  });

  it('tells admins apart, and refuses unknown kinds', async () => {
    loginAs({ id: 'admin-1', role: 'ADMIN' });
    prismaMock.recommendation.findMany.mockResolvedValue([]);
    await expect(getMyRecommendations('COURSE')).resolves.toMatchObject({ isAdmin: true });
    await expect(getMyRecommendations('USER')).rejects.toThrow('Tipo de recomendación inválido');
  });
});
