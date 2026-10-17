import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import { createComment } from './create-comment';

const baseSession = {
  id: 'session-1',
  userId: 'user-1',
  expires: new Date('2027-01-01'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockComment = {
  id: 'comment-1',
  content: 'Un comentario válido',
  authorId: 'user-1',
  adviceId: 'advice-1',
  parentCommentId: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  author: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
  },
};

const validInput = {
  content: 'Un comentario válido',
  adviceId: 'advice-1',
  parentCommentId: null,
};

describe('createComment', () => {
  it('throws a ZodError when content is empty', async () => {
    mockCookies({ sessionId: 'session-1' });

    await expect(
      createComment({ content: '', adviceId: 'advice-1', parentCommentId: null }),
    ).rejects.toThrow('El comentario no puede estar vacío');

    expect(prismaMock.comment.create).not.toHaveBeenCalled();
  });

  it('throws a ZodError when content exceeds 500 characters', async () => {
    mockCookies({ sessionId: 'session-1' });
    const longContent = 'a'.repeat(501);

    await expect(
      createComment({ content: longContent, adviceId: 'advice-1', parentCommentId: null }),
    ).rejects.toThrow('El comentario no puede tener más de 500 caracteres');

    expect(prismaMock.comment.create).not.toHaveBeenCalled();
  });

  it('throws when there is no sessionId cookie', async () => {
    mockCookies();

    await expect(createComment(validInput)).rejects.toThrow('No autenticado');

    expect(prismaMock.comment.create).not.toHaveBeenCalled();
  });

  it('throws when the session is not found in the database', async () => {
    mockCookies({ sessionId: 'ghost-session' });
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(createComment(validInput)).rejects.toThrow('Sesión no encontrada');

    expect(prismaMock.comment.create).not.toHaveBeenCalled();
  });

  it('creates the comment, revalidates the path, and returns the comment', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.comment.create.mockResolvedValue(mockComment as any);

    const result = await createComment(validInput);

    expect(result).toEqual(mockComment);
    expect(prismaMock.comment.create).toHaveBeenCalledWith({
      data: {
        content: validInput.content,
        authorId: 'user-1',
        adviceId: 'advice-1',
        parentCommentId: null,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/consejos/advice-1');
  });

  it('creates a reply when parentCommentId is provided', async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.comment.findUnique.mockResolvedValue({ adviceId: validInput.adviceId } as any);
    prismaMock.comment.create.mockResolvedValue({
      ...mockComment,
      parentCommentId: 'comment-parent',
    } as any);

    const result = await createComment({
      ...validInput,
      parentCommentId: 'comment-parent',
    });

    expect(result).toMatchObject({ parentCommentId: 'comment-parent' });
    expect(prismaMock.comment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ parentCommentId: 'comment-parent' }),
      }),
    );
  });

  it.each([
    ['belongs to another advice', { adviceId: 'otro-consejo' }],
    ['does not exist', null],
  ])('rejects a reply whose parent comment %s', async (_case, parent) => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.comment.findUnique.mockResolvedValue(parent as any);

    await expect(
      createComment({ ...validInput, parentCommentId: 'comment-parent' }),
    ).rejects.toThrow('El comentario al que respondés no es de este consejo');
    expect(prismaMock.comment.create).not.toHaveBeenCalled();
  });

  it("notifies the consejo's author, but not about their own comments", async () => {
    mockCookies({ sessionId: 'session-1' });
    prismaMock.session.findUnique.mockResolvedValue(baseSession as any);
    prismaMock.comment.create.mockResolvedValue(mockComment as any);
    prismaMock.advice.findUnique.mockResolvedValue({ authorId: 'author-1' } as any);

    await createComment(validInput);

    expect(prismaMock.notification.createMany).toHaveBeenCalledWith({
      data: [
        {
          type: 'advice_commented',
          title: 'Comentaron tu consejo',
          message: 'Test User comentó tu consejo: "Un comentario válido".',
          userId: 'author-1',
          metadata: JSON.stringify({
            adviceId: 'advice-1',
            commentId: 'comment-1',
            userId: 'user-1',
            href: '/consejos/advice-1',
          }),
        },
      ],
    });

    prismaMock.notification.createMany.mockClear();
    prismaMock.advice.findUnique.mockResolvedValue({ authorId: 'user-1' } as any);
    await createComment(validInput);
    expect(prismaMock.notification.createMany).not.toHaveBeenCalled();
  });
});
