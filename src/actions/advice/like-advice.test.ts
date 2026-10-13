import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { extractedConsejos } from '@/data/consejos-extraidos';
import { toggleLike } from './like-advice';

const baseSession = {
  id: 'session-1',
  userId: 'user-1',
  user: { id: 'user-1', name: 'Ana' },
  expires: new Date('2027-01-01'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const existingLike = {
  id: 'like-1',
  userId: 'user-1',
  adviceId: 'advice-1',
  createdAt: new Date('2025-01-01'),
};

describe('toggleLike', () => {
  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(toggleLike('advice-1')).rejects.toThrow('User not authenticated');

    expect(prismaMock.like.create).not.toHaveBeenCalled();
    expect(prismaMock.like.delete).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(toggleLike('advice-1')).rejects.toThrow('Session not found');

    expect(prismaMock.like.create).not.toHaveBeenCalled();
    expect(prismaMock.like.delete).not.toHaveBeenCalled();
  });

  it('creates a like when none exists and returns success', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.like.findFirst.mockResolvedValue(null);
    prismaMock.like.create.mockResolvedValue(existingLike as any);

    const result = await toggleLike('advice-1');

    expect(result).toEqual({ success: true });
    expect(prismaMock.like.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', adviceId: 'advice-1' },
    });
    expect(prismaMock.like.delete).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/consejos');
    expect(revalidatePath).toHaveBeenCalledWith('/consejos/advice-1');
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  it("notifies the consejo's author about a new like, but not about their own", async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.like.findFirst.mockResolvedValue(null);
    prismaMock.advice.findUnique.mockResolvedValue({
      authorId: 'author-1',
      content: 'Leé el código de otros',
    } as any);

    await toggleLike('advice-1');

    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: [
        {
          type: 'advice_liked',
          title: 'Le gustó tu consejo',
          message: 'A Ana le gustó tu consejo "Leé el código de otros".',
          userId: 'author-1',
          metadata: JSON.stringify({
            adviceId: 'advice-1',
            userId: 'user-1',
            href: '/consejos/advice-1',
          }),
        },
      ],
    });

    prismaMock.notification.createMany.mockClear();
    prismaMock.advice.findUnique.mockResolvedValue({ authorId: 'user-1', content: 'x' } as any);
    await toggleLike('advice-1');
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
  });

  it('deletes the like when one already exists and returns success', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.like.findFirst.mockResolvedValue(existingLike as any);
    prismaMock.like.delete.mockResolvedValue(existingLike as any);

    const result = await toggleLike('advice-1');

    expect(result).toEqual({ success: true });
    expect(prismaMock.like.delete).toHaveBeenCalledWith({ where: { id: 'like-1' } });
    expect(prismaMock.like.create).not.toHaveBeenCalled();
  });

  it('likes a consejo extracted from a conversation by its id', async () => {
    const [extracted] = extractedConsejos;
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.like.findFirst.mockResolvedValue(null);

    await toggleLike(extracted.id);

    expect(prismaMock.like.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', extractedId: extracted.id },
    });
    expect(prismaMock.like.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', extractedId: extracted.id },
    });
  });

  it('refuses extracted ids that do not exist', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);

    await expect(toggleLike('auto-inventado')).rejects.toThrow('Consejo no encontrado');
    expect(prismaMock.like.create).not.toHaveBeenCalled();
  });
});
