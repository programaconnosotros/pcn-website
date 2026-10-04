import { GET } from './route';

describe('GET /up', () => {
  it('answers OK for the health check', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'OK' });
  });
});
