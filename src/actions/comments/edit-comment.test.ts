import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { editComment } from './edit-comment';

const session = (role: 'REGULAR' | 'ADMIN' = 'REGULAR') =>
  ({
    id: 'session-1',
    userId: 'user-1',
    expires: new Date('2027-01-01'),
    user: { id: 'user-1', role },
  }) as any;

const input = { commentId: 'comment-1', content: '  Texto corregido  ' };

describe('editComment', () => {
  it('rejects an empty comment', async () => {
    mockCookies({ sessionId: 'session-1' });

    await expect(editComment({ commentId: 'comment-1', content: '   ' })).rejects.toThrow(
      'El comentario no puede estar vacío',
    );
    expect(prismaMock.comment.update).not.toHaveBeenCalled();
  });

  it('throws when there is no session', async () => {
    mockCookies();

    await expect(editComment(input)).rejects.toThrow('No autenticado');
    expect(prismaMock.comment.update).not.toHaveBeenCalled();
  });

  it('throws when the comment does not exist', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session());
    prismaMock.comment.findUnique.mockResolvedValue(null);

    await expect(editComment(input)).rejects.toThrow('Comentario no encontrado');
  });

  it("refuses to edit someone else's comment, even for an admin", async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session('ADMIN'));
    prismaMock.comment.findUnique.mockResolvedValue({
      authorId: 'other',
      adviceId: 'advice-1',
      extractedId: null,
    } as any);

    await expect(editComment(input)).rejects.toThrow(
      'Solo quien escribió el comentario puede editarlo',
    );
    expect(prismaMock.comment.update).not.toHaveBeenCalled();
  });

  it('saves the trimmed text and revalidates the consejo', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(session());
    prismaMock.comment.findUnique.mockResolvedValue({
      authorId: 'user-1',
      adviceId: null,
      extractedId: 'auto-1',
    } as any);
    prismaMock.comment.update.mockResolvedValue({ id: 'comment-1' } as any);

    await editComment(input);

    expect(prismaMock.comment.update).toHaveBeenCalledWith({
      where: { id: 'comment-1' },
      data: { content: 'Texto corregido' },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/consejos/auto-1');
  });
});
