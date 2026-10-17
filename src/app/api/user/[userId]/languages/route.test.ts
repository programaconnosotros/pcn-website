import { prismaMock } from '@/test/prisma';
import { GET } from './route';

const get = (userId: string) =>
  GET(new Request(`http://localhost/api/user/${userId}/languages`), {
    params: Promise.resolve({ userId }),
  });

describe('GET /api/user/[userId]/languages', () => {
  it("returns the user's languages", async () => {
    const languages = [{ id: 'l1', userId: 'u1', languageId: 'ts' }];
    prismaMock.userLanguage.findMany.mockResolvedValue(languages as any);

    const response = await get('u1');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(languages);
    expect(prismaMock.userLanguage.findMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });
  });

  it('returns an empty list for a user without languages', async () => {
    prismaMock.userLanguage.findMany.mockResolvedValue([]);
    await expect((await get('nobody')).json()).resolves.toEqual([]);
  });

  it('answers 500 when the database fails', async () => {
    prismaMock.userLanguage.findMany.mockRejectedValue(new Error('db down'));

    const response = await get('u1');

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Error fetching user languages' });
  });
});
