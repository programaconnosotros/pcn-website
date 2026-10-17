import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { toggleCommentLike } from './toggle-comment-like';

const session = {
  id: 'session-1',
  userId: 'user-1',
  expires: new Date('2027-01-01'),
  user: { id: 'user-1', name: 'Ana', role: 'REGULAR' },
} as any;

const comment = {
  authorId: 'author',
  content: 'Muy buen consejo',
  adviceId: 'advice-1',
  extractedId: null,
} as any;

const where = { userId_commentId: { userId: 'user-1', commentId: 'comment-1' } };

describe('toggleCommentLike', () => {
  it('throws when there is no session', async () => {
    mockCookies();

    await expect(toggleCommentLike('comment-1')).rejects.toThrow('No autenticado');
    expect(prismaMock.commentLike.create).not.toHaveBeenCalled();
  });

  it('throws when the session or the comment do not exist', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValueOnce(null);
    await expect(toggleCommentLike('comment-1')).rejects.toThrow('Sesión no encontrada');

    prismaMock.session.findUnique.mockResolvedValue(session);
    prismaMock.comment.findUnique.mockResolvedValue(null);
    await expect(toggleCommentLike('comment-1')).rejects.toThrow('Comentario no encontrado');
    expect(prismaMock.commentLike.create).not.toHaveBeenCalled();
  });

  it('likes a comment and tells its author', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session);
    prismaMock.comment.findUnique.mockResolvedValue(comment);
    prismaMock.commentLike.findUnique.mockResolvedValue(null);

    await expect(toggleCommentLike('comment-1')).resolves.toEqual({ liked: true });

    expect(prismaMock.commentLike.findUnique).toHaveBeenCalledWith({ where, select: { id: true } });
    expect(prismaMock.commentLike.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', commentId: 'comment-1' },
    });
    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          type: 'comment_liked',
          userId: 'author',
          message: 'A Ana le gustó tu comentario "Muy buen consejo".',
        }),
      ],
    });
    expect(revalidatePath).toHaveBeenCalledWith('/consejos/advice-1');
  });

  it('unlikes a comment already liked, on an extracted consejo too', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session);
    prismaMock.comment.findUnique.mockResolvedValue({
      ...comment,
      adviceId: null,
      extractedId: 'auto-1',
    });
    prismaMock.commentLike.findUnique.mockResolvedValue({ id: 'like-1' } as any);

    await expect(toggleCommentLike('comment-1')).resolves.toEqual({ liked: false });

    expect(prismaMock.commentLike.delete).toHaveBeenCalledWith({ where });
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/consejos/auto-1');
  });
});
