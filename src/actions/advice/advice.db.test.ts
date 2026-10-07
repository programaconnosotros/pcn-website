import prisma from '@/lib/prisma';
import { createAdvice } from '@/actions/advice/create-advice';
import { editAdvice } from '@/actions/advice/edit-advice';
import { deleteAdvice } from '@/actions/advice/delete-advice';
import { toggleLike } from '@/actions/advice/like-advice';
import { getBestAdvice } from '@/actions/advice/get-best-advice';
import { getAdviceById } from '@/actions/advice/get-advice';
import { getRandomAdvice } from '@/actions/advice/get-random-advice';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, makeAdvice, quickUser, uid } from '@/test/db/actions-fixtures';

// Consejos contra Postgres real: quién puede crear, editar, borrar y dar like, qué queda en la
// base y qué arrastra el borrado en cascada.

jest.spyOn(console, 'error').mockImplementation(() => {});

describe('createAdvice', () => {
  it('stores the advice with the session user as author and expires the Advice cache', async () => {
    const author = await quickUser();
    await actAs(author.id);
    const content = `Leé la documentación antes de preguntar ${uid()}`;

    await createAdvice(content);

    const rows = await prisma.advice.findMany({ where: { content } });
    expect(rows).toHaveLength(1);
    expect(rows[0].authorId).toBe(author.id);
    expect(expiredModel('Advice')).toBe(true);
  });

  it('rejects anonymous visitors without writing anything', async () => {
    await actAs();
    const content = `Consejo anónimo que no debería guardarse ${uid()}`;

    await expect(createAdvice(content)).rejects.toThrow('User not authenticated');
    expect(await prisma.advice.count({ where: { content } })).toBe(0);
  });

  it('rejects a cookie whose session no longer exists', async () => {
    const author = await quickUser();
    await actAs(author.id);
    await prisma.session.deleteMany({ where: { userId: author.id } });
    const content = `Consejo con sesión borrada ${uid()}`;

    await expect(createAdvice(content)).rejects.toThrow('Session not found');
    expect(await prisma.advice.count({ where: { content } })).toBe(0);
  });

  it.each([
    ['too short', 'corto'],
    ['too long', 'x'.repeat(1001)],
  ])('rejects content that is %s before touching the database', async (_case, content) => {
    const author = await quickUser();
    await actAs(author.id);

    await expect(createAdvice(content)).rejects.toThrow();
    expect(await prisma.advice.count({ where: { authorId: author.id } })).toBe(0);
  });
});

describe('editAdvice', () => {
  it('lets the author change the content', async () => {
    const author = await quickUser();
    const advice = await makeAdvice(author.id);
    await actAs(author.id);

    await editAdvice({ id: advice.id, content: 'Contenido editado por el autor' });

    const stored = await prisma.advice.findUniqueOrThrow({ where: { id: advice.id } });
    expect(stored.content).toBe('Contenido editado por el autor');
    expect(stored.authorId).toBe(author.id);
    expect(stored.updatedAt.getTime()).toBeGreaterThanOrEqual(advice.updatedAt.getTime());
  });

  it('lets an admin edit someone else’s advice without taking authorship', async () => {
    const author = await quickUser();
    const admin = await quickUser({ role: 'ADMIN' });
    const advice = await makeAdvice(author.id);
    await actAs(admin.id);

    await editAdvice({ id: advice.id, content: 'Moderado por un admin' });

    const stored = await prisma.advice.findUniqueOrThrow({ where: { id: advice.id } });
    expect(stored.content).toBe('Moderado por un admin');
    expect(stored.authorId).toBe(author.id);
  });

  it('forbids another regular user and leaves the content untouched', async () => {
    const author = await quickUser();
    const other = await quickUser();
    const advice = await makeAdvice(author.id, 'El contenido original del consejo');
    await actAs(other.id);

    await expect(editAdvice({ id: advice.id, content: 'Intento de vandalismo' })).rejects.toThrow(
      'No tienes permisos para editar este consejo',
    );
    const stored = await prisma.advice.findUniqueOrThrow({ where: { id: advice.id } });
    expect(stored.content).toBe('El contenido original del consejo');
  });

  it('rejects anonymous visitors', async () => {
    const author = await quickUser();
    const advice = await makeAdvice(author.id, 'El contenido original del consejo');
    await actAs();

    await expect(editAdvice({ id: advice.id, content: 'Contenido anónimo' })).rejects.toThrow(
      'User not authenticated',
    );
    expect((await prisma.advice.findUniqueOrThrow({ where: { id: advice.id } })).content).toBe(
      'El contenido original del consejo',
    );
  });

  it('fails for an advice that does not exist', async () => {
    const author = await quickUser();
    await actAs(author.id);

    await expect(editAdvice({ id: 'no-existe', content: 'Contenido para nadie' })).rejects.toThrow(
      'Consejo no encontrado',
    );
  });

  it('rejects invalid content even from the author', async () => {
    const author = await quickUser();
    const advice = await makeAdvice(author.id, 'El contenido original del consejo');
    await actAs(author.id);

    await expect(editAdvice({ id: advice.id, content: 'corto' })).rejects.toThrow();
    expect((await prisma.advice.findUniqueOrThrow({ where: { id: advice.id } })).content).toBe(
      'El contenido original del consejo',
    );
  });
});

describe('deleteAdvice', () => {
  const adviceWithActivity = async () => {
    const author = await quickUser();
    const fan = await quickUser();
    const advice = await makeAdvice(author.id);
    await prisma.like.create({ data: { userId: fan.id, adviceId: advice.id } });
    const comment = await prisma.comment.create({
      data: { content: 'Muy bueno', authorId: fan.id, adviceId: advice.id },
    });
    await prisma.comment.create({
      data: {
        content: 'Gracias',
        authorId: author.id,
        adviceId: advice.id,
        parentCommentId: comment.id,
      },
    });
    return { author, fan, advice };
  };

  it('lets the author delete it, cascading its likes, comments and replies', async () => {
    const { author, fan, advice } = await adviceWithActivity();
    await actAs(author.id);

    await deleteAdvice(advice.id);

    expect(await prisma.advice.findUnique({ where: { id: advice.id } })).toBeNull();
    expect(await prisma.like.count({ where: { adviceId: advice.id } })).toBe(0);
    expect(await prisma.comment.count({ where: { adviceId: advice.id } })).toBe(0);
    // Los usuarios no se tocan
    expect(await prisma.user.count({ where: { id: { in: [author.id, fan.id] } } })).toBe(2);
    expect(expiredModel('Advice')).toBe(true);
    expect(expiredModel('Like')).toBe(true);
    expect(expiredModel('Comment')).toBe(true);
  });

  it('lets an admin delete someone else’s advice', async () => {
    const { advice } = await adviceWithActivity();
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);

    await deleteAdvice(advice.id);

    expect(await prisma.advice.findUnique({ where: { id: advice.id } })).toBeNull();
  });

  it('forbids another regular user, leaving the advice and its activity intact', async () => {
    const { fan, advice } = await adviceWithActivity();
    await actAs(fan.id);

    await expect(deleteAdvice(advice.id)).rejects.toThrow(
      'No tienes permisos para eliminar este consejo',
    );
    expect(await prisma.advice.findUnique({ where: { id: advice.id } })).not.toBeNull();
    expect(await prisma.like.count({ where: { adviceId: advice.id } })).toBe(1);
    expect(await prisma.comment.count({ where: { adviceId: advice.id } })).toBe(2);
  });

  it('rejects anonymous visitors', async () => {
    const { advice } = await adviceWithActivity();
    await actAs();

    await expect(deleteAdvice(advice.id)).rejects.toThrow('User not authenticated');
    expect(await prisma.advice.findUnique({ where: { id: advice.id } })).not.toBeNull();
  });

  it('fails for an advice that does not exist', async () => {
    const user = await quickUser();
    await actAs(user.id);

    await expect(deleteAdvice('no-existe')).rejects.toThrow('Consejo no encontrado');
  });
});

describe('toggleLike', () => {
  it('adds a like on the first call and removes it on the second', async () => {
    const author = await quickUser();
    const fan = await quickUser();
    const advice = await makeAdvice(author.id);
    await actAs(fan.id);

    await expect(toggleLike(advice.id)).resolves.toEqual({ success: true });
    const likes = await prisma.like.findMany({ where: { adviceId: advice.id } });
    expect(likes).toHaveLength(1);
    expect(likes[0].userId).toBe(fan.id);

    await toggleLike(advice.id);
    expect(await prisma.like.count({ where: { adviceId: advice.id } })).toBe(0);
  });

  it('counts one like per user', async () => {
    const author = await quickUser();
    const [a, b, c] = await Promise.all([quickUser(), quickUser(), quickUser()]);
    const advice = await makeAdvice(author.id);

    for (const user of [a, b, c]) {
      await actAs(user.id);
      await toggleLike(advice.id);
    }
    await actAs(b.id);
    await toggleLike(advice.id);

    const likers = await prisma.like.findMany({ where: { adviceId: advice.id } });
    expect(likers.map((like) => like.userId).sort()).toEqual([a.id, c.id].sort());
  });

  it('cannot store two likes from the same user (unique constraint)', async () => {
    const author = await quickUser();
    const fan = await quickUser();
    const advice = await makeAdvice(author.id);
    await prisma.like.create({ data: { userId: fan.id, adviceId: advice.id } });

    await expect(
      prisma.like.create({ data: { userId: fan.id, adviceId: advice.id } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('rejects anonymous visitors', async () => {
    const author = await quickUser();
    const advice = await makeAdvice(author.id);
    await actAs();

    await expect(toggleLike(advice.id)).rejects.toThrow('User not authenticated');
    expect(await prisma.like.count({ where: { adviceId: advice.id } })).toBe(0);
  });

  it('fails on an advice that does not exist without leaving a like behind', async () => {
    const fan = await quickUser();
    await actAs(fan.id);

    await expect(toggleLike('no-existe')).rejects.toThrow();
    expect(await prisma.like.count({ where: { userId: fan.id } })).toBe(0);
  });
});

describe('getAdviceById', () => {
  it('returns the advice with its likes and threaded comments, newest first', async () => {
    const author = await quickUser();
    const fan = await quickUser();
    const advice = await makeAdvice(author.id);
    await prisma.like.create({ data: { userId: fan.id, adviceId: advice.id } });
    const older = await prisma.comment.create({
      data: {
        content: 'Primero',
        authorId: fan.id,
        adviceId: advice.id,
        createdAt: new Date('2024-01-01'),
      },
    });
    await prisma.comment.create({
      data: {
        content: 'Segundo',
        authorId: author.id,
        adviceId: advice.id,
        createdAt: new Date('2024-01-02'),
      },
    });
    const reply = await prisma.comment.create({
      data: {
        content: 'Respuesta',
        authorId: author.id,
        adviceId: advice.id,
        parentCommentId: older.id,
      },
    });
    await prisma.comment.create({
      data: {
        content: 'Respuesta anidada',
        authorId: fan.id,
        adviceId: advice.id,
        parentCommentId: reply.id,
      },
    });

    const result = await getAdviceById(advice.id);

    expect(result?.author).toEqual({ id: author.id, name: author.name, image: null });
    expect(result?.likes.map((like) => like.userId)).toEqual([fan.id]);
    expect(result?.comments?.map((comment) => comment.content)).toEqual(['Segundo', 'Primero']);
    const first = result?.comments?.[1];
    expect(first?.replies.map((r) => r.content)).toEqual(['Respuesta']);
    expect(first?.replies[0].replies.map((r) => r.content)).toEqual(['Respuesta anidada']);
    // El autor solo lleva datos públicos
    expect(first?.author).toEqual({ id: fan.id, name: fan.name, image: null });
  });

  it('skips the comments when asked to', async () => {
    const author = await quickUser();
    const advice = await makeAdvice(author.id);
    await prisma.comment.create({
      data: { content: 'Hola', authorId: author.id, adviceId: advice.id },
    });

    const result = await getAdviceById(advice.id, { includeComments: false });

    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty('comments');
  });

  it('returns null for an advice that does not exist', async () => {
    await expect(getAdviceById('no-existe')).resolves.toBeNull();
  });
});

describe('getBestAdvice', () => {
  it('returns the three most liked advice, most liked first', async () => {
    const author = await quickUser();
    const likers = await Promise.all(Array.from({ length: 30 }, () => quickUser()));
    // Más likes que cualquier otro consejo de esta corrida, así ocupan el podio
    const counts = [28, 30, 29, 27];
    const made = [];
    for (const count of counts) {
      const advice = await makeAdvice(author.id);
      await prisma.like.createMany({
        data: likers.slice(0, count).map((user) => ({ userId: user.id, adviceId: advice.id })),
      });
      made.push(advice);
    }

    const best = await getBestAdvice();

    expect(best.map((advice) => advice.id)).toEqual([made[1].id, made[2].id, made[0].id]);
    expect(best.map((advice) => advice.likes.length)).toEqual([30, 29, 28]);
    expect(best[0].author).toEqual({ id: author.id, name: author.name, image: null });
  });
});

describe('getRandomAdvice', () => {
  it('returns an existing advice with its public author', async () => {
    const author = await quickUser();
    await makeAdvice(author.id);

    const advice = await getRandomAdvice();

    expect(advice).not.toBeNull();
    expect(await prisma.advice.findUnique({ where: { id: advice!.id } })).not.toBeNull();
    expect(Object.keys(advice!.author).sort()).toEqual(['id', 'image', 'name']);
  });
});
