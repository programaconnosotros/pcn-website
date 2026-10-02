import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { toggleLike } from './like-advise';

const baseSession = {
  id: 'session-1',
  userId: 'user-1',
  expires: new Date('2027-01-01'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const existingLike = {
  id: 'like-1',
  userId: 'user-1',
  adviseId: 'advise-1',
  createdAt: new Date('2025-01-01'),
};

describe('toggleLike', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(toggleLike('advise-1')).rejects.toThrow('User not authenticated');

    expect(prismaMock.like.create).not.toHaveBeenCalled();
    expect(prismaMock.like.delete).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(toggleLike('advise-1')).rejects.toThrow('Session not found');

    expect(prismaMock.like.create).not.toHaveBeenCalled();
    expect(prismaMock.like.delete).not.toHaveBeenCalled();
  });

  it('creates a like when none exists and returns success', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.like.findUnique.mockResolvedValue(null);
    prismaMock.like.create.mockResolvedValue(existingLike as any);

    const result = await toggleLike('advise-1');

    expect(result).toEqual({ success: true });
    expect(prismaMock.like.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', adviseId: 'advise-1' },
    });
    expect(prismaMock.like.delete).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/consejos');
    expect(revalidatePath).toHaveBeenCalledWith('/consejos/advise-1');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it('deletes the like when one already exists and returns success', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.like.findUnique.mockResolvedValue(existingLike as any);
    prismaMock.like.delete.mockResolvedValue(existingLike as any);

    const result = await toggleLike('advise-1');

    expect(result).toEqual({ success: true });
    expect(prismaMock.like.delete).toHaveBeenCalledWith({ where: { id: 'like-1' } });
    expect(prismaMock.like.create).not.toHaveBeenCalled();
  });
});
