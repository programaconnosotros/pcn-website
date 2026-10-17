import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { deleteComment } from './delete-comment';

const session = (role: 'REGULAR' | 'ADMIN' = 'REGULAR') =>
  ({
    id: 'session-1',
    userId: 'user-1',
    expires: new Date('2027-01-01'),
    user: { id: 'user-1', role },
  }) as any;

describe('deleteComment', () => {
  it('throws when there is no session', async () => {
    mockCookies();

    await expect(deleteComment('comment-1')).rejects.toThrow('No autenticado');
    expect(prismaMock.comment.delete).not.toHaveBeenCalled();
  });

  it('throws when the comment does not exist', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session());
    prismaMock.comment.findUnique.mockResolvedValue(null);

    await expect(deleteComment('comment-1')).rejects.toThrow('Comentario no encontrado');
    expect(prismaMock.comment.delete).not.toHaveBeenCalled();
  });

  it("refuses to delete someone else's comment", async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session());
    prismaMock.comment.findUnique.mockResolvedValue({
      authorId: 'other',
      adviceId: 'advice-1',
      extractedId: null,
      advice: { authorId: 'consejo-author' },
    } as any);

    await expect(deleteComment('comment-1')).rejects.toThrow(
      'No tenés permisos para eliminar este comentario',
    );
    expect(prismaMock.comment.delete).not.toHaveBeenCalled();
  });

  it('lets whoever published the consejo delete any comment on it', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session());
    prismaMock.comment.findUnique.mockResolvedValue({
      authorId: 'other',
      adviceId: 'advice-1',
      extractedId: null,
      advice: { authorId: 'user-1' },
    } as any);

    await deleteComment('comment-1');

    expect(prismaMock.comment.findUnique).toHaveBeenCalledWith({
      where: { id: 'comment-1' },
      select: {
        authorId: true,
        adviceId: true,
        extractedId: true,
        advice: { select: { authorId: true } },
      },
    });
    expect(prismaMock.comment.delete).toHaveBeenCalledWith({ where: { id: 'comment-1' } });
  });

  it('lets the author delete their comment and revalidates the consejo', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session());
    prismaMock.comment.findUnique.mockResolvedValue({
      authorId: 'user-1',
      adviceId: 'advice-1',
      extractedId: null,
    } as any);

    await deleteComment('comment-1');

    expect(prismaMock.comment.delete).toHaveBeenCalledWith({ where: { id: 'comment-1' } });
    expect(revalidatePath).toHaveBeenCalledWith('/consejos/advice-1');
  });

  it("lets an admin delete anyone's comment on an extracted consejo", async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session('ADMIN'));
    prismaMock.comment.findUnique.mockResolvedValue({
      authorId: 'other',
      adviceId: null,
      extractedId: 'auto-1',
    } as any);

    await deleteComment('comment-1');

    expect(prismaMock.comment.delete).toHaveBeenCalledWith({ where: { id: 'comment-1' } });
    expect(revalidatePath).toHaveBeenCalledWith('/consejos/auto-1');
  });
});
