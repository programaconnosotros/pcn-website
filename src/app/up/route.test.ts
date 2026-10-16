import { prismaMock } from '@/test/prisma';
import { GET } from './route';

describe('GET /up', () => {
  it('answers OK when the database answers', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }] as never);
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'OK', database: 'OK' });
  });

  it('fails the health check when the database is down, so a deploy does not go live', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.$queryRaw.mockRejectedValue(new Error('ECONNREFUSED'));
    const response = await GET();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ status: 'ERROR', database: 'DOWN' });
  });

  it('gives up on a database that hangs', async () => {
    jest.useFakeTimers();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.$queryRaw.mockReturnValue(new Promise(() => {}) as never);
    const pending = GET();
    await jest.advanceTimersByTimeAsync(3000);
    expect((await pending).status).toBe(503);
    jest.useRealTimers();
  });
});
