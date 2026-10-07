import { prismaMock } from '@/test/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createForumPost, deleteForumPost, moderateForumPost, updateForumPost } from './posts';
import { createForumComment, deleteForumComment, toggleForumPostLike } from './engagement';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/rate-limit', () => ({ enforceRateLimit: jest.fn() }));

const as = (user: { id: string; role?: string } | null) =>
  jest
    .mocked(getCurrentSession)
    .mockResolvedValue(user ? ({ user: { role: 'USER', ...user } } as never) : null);

const input = {
  title: 'Un tema de prueba',
  categoryId: 'cat-1',
  content: 'Un contenido con más de veinte caracteres.',
};

beforeEach(() => {
  prismaMock.forumCategory.findUnique.mockResolvedValue({ id: 'cat-1' } as never);
  prismaMock.forumPost.create.mockResolvedValue({ id: 'p1' } as never);
});

describe('forum posts', () => {
  it('creates a thread for the session user, rate limited', async () => {
    as({ id: 'u1' });
    await expect(createForumPost(input)).resolves.toEqual({ id: 'p1' });
    expect(enforceRateLimit).toHaveBeenCalledWith('createContent');
    expect(prismaMock.forumPost.create).toHaveBeenCalledWith({
      data: { ...input, authorId: 'u1' },
      select: { id: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/foro', 'layout');
  });

  it('rejects anonymous visitors, invalid input and unknown categories', async () => {
    as(null);
    await expect(createForumPost(input)).rejects.toThrow('Debes estar autenticado');
    as({ id: 'u1' });
    await expect(createForumPost({ ...input, title: 'no' })).rejects.toThrow(/al menos 5/);
    prismaMock.forumCategory.findUnique.mockResolvedValue(null);
    await expect(createForumPost(input)).rejects.toThrow('La categoría no existe');
    expect(prismaMock.forumPost.create).not.toHaveBeenCalled();
  });

  it('lets only the author or an admin edit and delete', async () => {
    prismaMock.forumPost.findUnique.mockResolvedValue({ id: 'p1', authorId: 'u1' } as never);

    as({ id: 'u2' });
    await expect(updateForumPost('p1', input)).rejects.toThrow(/Solo quien escribió/);
    await expect(deleteForumPost('p1')).rejects.toThrow(/Solo quien escribió/);

    as({ id: 'u1' });
    await updateForumPost('p1', input);
    expect(prismaMock.forumPost.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { ...input, activeAt: expect.any(Date) },
    });

    as({ id: 'admin', role: 'ADMIN' });
    await deleteForumPost('p1');
    expect(prismaMock.forumPost.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });

  it('says when the thread is gone', async () => {
    as({ id: 'u1' });
    prismaMock.forumPost.findUnique.mockResolvedValue(null);
    await expect(deleteForumPost('nope')).rejects.toThrow('El tema no existe');
  });

  it('leaves pinning and locking to admins', async () => {
    as({ id: 'u1' });
    await expect(moderateForumPost('p1', { isPinned: true })).rejects.toThrow(/Solo un admin/);
    as({ id: 'admin', role: 'ADMIN' });
    await moderateForumPost('p1', { isLocked: true });
    expect(prismaMock.forumPost.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { isLocked: true },
    });
  });
});

describe('forum engagement', () => {
  it('toggles a like', async () => {
    as({ id: 'u1' });
    prismaMock.forumPostLike.findUnique.mockResolvedValue(null);
    await expect(toggleForumPostLike('p1')).resolves.toEqual({ liked: true });
    expect(prismaMock.forumPostLike.create).toHaveBeenCalledWith({
      data: { userId: 'u1', postId: 'p1' },
    });

    prismaMock.forumPostLike.findUnique.mockResolvedValue({ id: 'l1' } as never);
    await expect(toggleForumPostLike('p1')).resolves.toEqual({ liked: false });
    expect(prismaMock.forumPostLike.delete).toHaveBeenCalledWith({ where: { id: 'l1' } });
  });

  it('replies and bumps the thread, but not on locked threads or across threads', async () => {
    as({ id: 'u1' });
    prismaMock.$transaction.mockResolvedValue([{ id: 'c1' }, {}] as never);
    prismaMock.forumPost.findUnique.mockResolvedValue({ isLocked: false } as never);
    await expect(
      createForumComment('p1', { content: 'Buenísimo', parentCommentId: null }),
    ).resolves.toEqual({ id: 'c1' });
    expect(enforceRateLimit).toHaveBeenCalledWith('comment');
    expect(prismaMock.forumComment.create).toHaveBeenCalledWith({
      data: { content: 'Buenísimo', parentCommentId: null, postId: 'p1', authorId: 'u1' },
      select: { id: true },
    });
    expect(prismaMock.forumPost.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { activeAt: expect.any(Date) },
    });

    prismaMock.forumComment.findUnique.mockResolvedValue({ postId: 'other' } as never);
    await expect(
      createForumComment('p1', { content: 'Hola', parentCommentId: 'c9' }),
    ).rejects.toThrow(/no es de este tema/);

    prismaMock.forumPost.findUnique.mockResolvedValue({ isLocked: true } as never);
    await expect(
      createForumComment('p1', { content: 'Hola', parentCommentId: null }),
    ).rejects.toThrow(/está cerrado/);

    prismaMock.forumPost.findUnique.mockResolvedValue(null);
    await expect(
      createForumComment('p1', { content: 'Hola', parentCommentId: null }),
    ).rejects.toThrow('El tema no existe');
    await expect(
      createForumComment('p1', { content: '  ', parentCommentId: null }),
    ).rejects.toThrow(/vacía/);
  });

  it('lets the author or an admin delete a comment', async () => {
    prismaMock.forumComment.findUnique.mockResolvedValue({
      id: 'c1',
      authorId: 'u1',
      postId: 'p1',
    } as never);
    as({ id: 'u2' });
    await expect(deleteForumComment('c1')).rejects.toThrow(/Solo quien escribió/);
    as({ id: 'u1' });
    await deleteForumComment('c1');
    expect(prismaMock.forumComment.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
    expect(revalidatePath).toHaveBeenCalledWith('/foro/tema/p1');

    prismaMock.forumComment.findUnique.mockResolvedValue(null);
    await expect(deleteForumComment('c1')).rejects.toThrow('El comentario no existe');
  });

  it('requires a session for everything', async () => {
    as(null);
    await expect(toggleForumPostLike('p1')).rejects.toThrow('Debes estar autenticado');
    await expect(deleteForumComment('c1')).rejects.toThrow('Debes estar autenticado');
  });
});
