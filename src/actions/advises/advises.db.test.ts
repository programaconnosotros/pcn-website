import prisma from '@/lib/prisma';
import { createAdvise } from '@/actions/advises/create-advise';
import { editAdvise } from '@/actions/advises/edit-advise';
import { deleteAdvise } from '@/actions/advises/delete-advise';
import { toggleLike } from '@/actions/advises/like-advise';
import { getBestAdvises } from '@/actions/advises/get-best-advises';
import { getAdviseById } from '@/actions/advises/get-advise';
import { getRandomAdvise } from '@/actions/advises/get-random-advise';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, makeAdvise, quickUser, uid } from '@/test/db/actions-fixtures';

// Consejos contra Postgres real: quién puede crear, editar, borrar y dar like, qué queda en la
// base y qué arrastra el borrado en cascada.

jest.spyOn(console, 'error').mockImplementation(() => {});

describe('createAdvise', () => {
  it('stores the advise with the session user as author and expires the Advise cache', async () => {
    const author = await quickUser();
    await actAs(author.id);
    const content = `Leé la documentación antes de preguntar ${uid()}`;

    await createAdvise(content);

    const rows = await prisma.advise.findMany({ where: { content } });
    expect(rows).toHaveLength(1);
    expect(rows[0].authorId).toBe(author.id);
    expect(expiredModel('Advise')).toBe(true);
  });

  it('rejects anonymous visitors without writing anything', async () => {
    await actAs();
    const content = `Consejo anónimo que no debería guardarse ${uid()}`;

    await expect(createAdvise(content)).rejects.toThrow('User not authenticated');
    expect(await prisma.advise.count({ where: { content } })).toBe(0);
  });

  it('rejects a cookie whose session no longer exists', async () => {
    const author = await quickUser();
    await actAs(author.id);
    await prisma.session.deleteMany({ where: { userId: author.id } });
    const content = `Consejo con sesión borrada ${uid()}`;

    await expect(createAdvise(content)).rejects.toThrow('Session not found');
    expect(await prisma.advise.count({ where: { content } })).toBe(0);
  });

  it.each([
    ['too short', 'corto'],
    ['too long', 'x'.repeat(1001)],
  ])('rejects content that is %s before touching the database', async (_case, content) => {
    const author = await quickUser();
    await actAs(author.id);

    await expect(createAdvise(content)).rejects.toThrow();
    expect(await prisma.advise.count({ where: { authorId: author.id } })).toBe(0);
  });
});

describe('editAdvise', () => {
  it('lets the author change the content', async () => {
    const author = await quickUser();
    const advise = await makeAdvise(author.id);
    await actAs(author.id);

    await editAdvise({ id: advise.id, content: 'Contenido editado por el autor' });

    const stored = await prisma.advise.findUniqueOrThrow({ where: { id: advise.id } });
    expect(stored.content).toBe('Contenido editado por el autor');
    expect(stored.authorId).toBe(author.id);
    expect(stored.updatedAt.getTime()).toBeGreaterThanOrEqual(advise.updatedAt.getTime());
  });

  it('lets an admin edit someone else’s advise without taking authorship', async () => {
    const author = await quickUser();
    const admin = await quickUser({ role: 'ADMIN' });
    const advise = await makeAdvise(author.id);
    await actAs(admin.id);

    await editAdvise({ id: advise.id, content: 'Moderado por un admin' });

    const stored = await prisma.advise.findUniqueOrThrow({ where: { id: advise.id } });
    expect(stored.content).toBe('Moderado por un admin');
    expect(stored.authorId).toBe(author.id);
  });

  it('forbids another regular user and leaves the content untouched', async () => {
    const author = await quickUser();
    const other = await quickUser();
    const advise = await makeAdvise(author.id, 'El contenido original del consejo');
    await actAs(other.id);

    await expect(editAdvise({ id: advise.id, content: 'Intento de vandalismo' })).rejects.toThrow(
      'No tienes permisos para editar este consejo',
    );
    const stored = await prisma.advise.findUniqueOrThrow({ where: { id: advise.id } });
    expect(stored.content).toBe('El contenido original del consejo');
  });

  it('rejects anonymous visitors', async () => {
    const author = await quickUser();
    const advise = await makeAdvise(author.id, 'El contenido original del consejo');
    await actAs();

    await expect(editAdvise({ id: advise.id, content: 'Contenido anónimo' })).rejects.toThrow(
      'User not authenticated',
    );
    expect((await prisma.advise.findUniqueOrThrow({ where: { id: advise.id } })).content).toBe(
      'El contenido original del consejo',
    );
  });

  it('fails for an advise that does not exist', async () => {
    const author = await quickUser();
    await actAs(author.id);

    await expect(editAdvise({ id: 'no-existe', content: 'Contenido para nadie' })).rejects.toThrow(
      'Consejo no encontrado',
    );
  });

  it('rejects invalid content even from the author', async () => {
    const author = await quickUser();
    const advise = await makeAdvise(author.id, 'El contenido original del consejo');
    await actAs(author.id);

    await expect(editAdvise({ id: advise.id, content: 'corto' })).rejects.toThrow();
    expect((await prisma.advise.findUniqueOrThrow({ where: { id: advise.id } })).content).toBe(
      'El contenido original del consejo',
    );
  });
});

describe('deleteAdvise', () => {
  const adviseWithActivity = async () => {
    const author = await quickUser();
    const fan = await quickUser();
    const advise = await makeAdvise(author.id);
    await prisma.like.create({ data: { userId: fan.id, adviseId: advise.id } });
    const comment = await prisma.comment.create({
      data: { content: 'Muy bueno', authorId: fan.id, adviseId: advise.id },
    });
    await prisma.comment.create({
      data: {
        content: 'Gracias',
        authorId: author.id,
        adviseId: advise.id,
        parentCommentId: comment.id,
      },
    });
    return { author, fan, advise };
  };

  it('lets the author delete it, cascading its likes, comments and replies', async () => {
    const { author, fan, advise } = await adviseWithActivity();
    await actAs(author.id);

    await deleteAdvise(advise.id);

    expect(await prisma.advise.findUnique({ where: { id: advise.id } })).toBeNull();
    expect(await prisma.like.count({ where: { adviseId: advise.id } })).toBe(0);
    expect(await prisma.comment.count({ where: { adviseId: advise.id } })).toBe(0);
    // Los usuarios no se tocan
    expect(await prisma.user.count({ where: { id: { in: [author.id, fan.id] } } })).toBe(2);
    expect(expiredModel('Advise')).toBe(true);
    expect(expiredModel('Like')).toBe(true);
    expect(expiredModel('Comment')).toBe(true);
  });

  it('lets an admin delete someone else’s advise', async () => {
    const { advise } = await adviseWithActivity();
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);

    await deleteAdvise(advise.id);

    expect(await prisma.advise.findUnique({ where: { id: advise.id } })).toBeNull();
  });

  it('forbids another regular user, leaving the advise and its activity intact', async () => {
    const { fan, advise } = await adviseWithActivity();
    await actAs(fan.id);

    await expect(deleteAdvise(advise.id)).rejects.toThrow(
      'No tienes permisos para eliminar este consejo',
    );
    expect(await prisma.advise.findUnique({ where: { id: advise.id } })).not.toBeNull();
    expect(await prisma.like.count({ where: { adviseId: advise.id } })).toBe(1);
    expect(await prisma.comment.count({ where: { adviseId: advise.id } })).toBe(2);
  });

  it('rejects anonymous visitors', async () => {
    const { advise } = await adviseWithActivity();
    await actAs();

    await expect(deleteAdvise(advise.id)).rejects.toThrow('User not authenticated');
    expect(await prisma.advise.findUnique({ where: { id: advise.id } })).not.toBeNull();
  });

  it('fails for an advise that does not exist', async () => {
    const user = await quickUser();
    await actAs(user.id);

    await expect(deleteAdvise('no-existe')).rejects.toThrow('Consejo no encontrado');
  });
});

describe('toggleLike', () => {
  it('adds a like on the first call and removes it on the second', async () => {
    const author = await quickUser();
    const fan = await quickUser();
    const advise = await makeAdvise(author.id);
    await actAs(fan.id);

    await expect(toggleLike(advise.id)).resolves.toEqual({ success: true });
    const likes = await prisma.like.findMany({ where: { adviseId: advise.id } });
    expect(likes).toHaveLength(1);
    expect(likes[0].userId).toBe(fan.id);

    await toggleLike(advise.id);
    expect(await prisma.like.count({ where: { adviseId: advise.id } })).toBe(0);
  });

  it('counts one like per user', async () => {
    const author = await quickUser();
    const [a, b, c] = await Promise.all([quickUser(), quickUser(), quickUser()]);
    const advise = await makeAdvise(author.id);

    for (const user of [a, b, c]) {
      await actAs(user.id);
      await toggleLike(advise.id);
    }
    await actAs(b.id);
    await toggleLike(advise.id);

    const likers = await prisma.like.findMany({ where: { adviseId: advise.id } });
    expect(likers.map((like) => like.userId).sort()).toEqual([a.id, c.id].sort());
  });

  it('cannot store two likes from the same user (unique constraint)', async () => {
    const author = await quickUser();
    const fan = await quickUser();
    const advise = await makeAdvise(author.id);
    await prisma.like.create({ data: { userId: fan.id, adviseId: advise.id } });

    await expect(
      prisma.like.create({ data: { userId: fan.id, adviseId: advise.id } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('rejects anonymous visitors', async () => {
    const author = await quickUser();
    const advise = await makeAdvise(author.id);
    await actAs();

    await expect(toggleLike(advise.id)).rejects.toThrow('User not authenticated');
    expect(await prisma.like.count({ where: { adviseId: advise.id } })).toBe(0);
  });

  it('fails on an advise that does not exist without leaving a like behind', async () => {
    const fan = await quickUser();
    await actAs(fan.id);

    await expect(toggleLike('no-existe')).rejects.toThrow();
    expect(await prisma.like.count({ where: { userId: fan.id } })).toBe(0);
  });
});

describe('getAdviseById', () => {
  it('returns the advise with its likes and threaded comments, newest first', async () => {
    const author = await quickUser();
    const fan = await quickUser();
    const advise = await makeAdvise(author.id);
    await prisma.like.create({ data: { userId: fan.id, adviseId: advise.id } });
    const older = await prisma.comment.create({
      data: {
        content: 'Primero',
        authorId: fan.id,
        adviseId: advise.id,
        createdAt: new Date('2024-01-01'),
      },
    });
    await prisma.comment.create({
      data: {
        content: 'Segundo',
        authorId: author.id,
        adviseId: advise.id,
        createdAt: new Date('2024-01-02'),
      },
    });
    const reply = await prisma.comment.create({
      data: {
        content: 'Respuesta',
        authorId: author.id,
        adviseId: advise.id,
        parentCommentId: older.id,
      },
    });
    await prisma.comment.create({
      data: {
        content: 'Respuesta anidada',
        authorId: fan.id,
        adviseId: advise.id,
        parentCommentId: reply.id,
      },
    });

    const result = await getAdviseById(advise.id);

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
    const advise = await makeAdvise(author.id);
    await prisma.comment.create({
      data: { content: 'Hola', authorId: author.id, adviseId: advise.id },
    });

    const result = await getAdviseById(advise.id, { includeComments: false });

    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty('comments');
  });

  it('returns null for an advise that does not exist', async () => {
    await expect(getAdviseById('no-existe')).resolves.toBeNull();
  });
});

describe('getBestAdvises', () => {
  it('returns the three most liked advises, most liked first', async () => {
    const author = await quickUser();
    const likers = await Promise.all(Array.from({ length: 30 }, () => quickUser()));
    // Más likes que cualquier otro consejo de esta corrida, así ocupan el podio
    const counts = [28, 30, 29, 27];
    const advises = [];
    for (const count of counts) {
      const advise = await makeAdvise(author.id);
      await prisma.like.createMany({
        data: likers.slice(0, count).map((user) => ({ userId: user.id, adviseId: advise.id })),
      });
      advises.push(advise);
    }

    const best = await getBestAdvises();

    expect(best.map((advise) => advise.id)).toEqual([advises[1].id, advises[2].id, advises[0].id]);
    expect(best.map((advise) => advise.likes.length)).toEqual([30, 29, 28]);
    expect(best[0].author).toEqual({ id: author.id, name: author.name, image: null });
  });
});

describe('getRandomAdvise', () => {
  it('returns an existing advise with its public author', async () => {
    const author = await quickUser();
    await makeAdvise(author.id);

    const advise = await getRandomAdvise();

    expect(advise).not.toBeNull();
    expect(await prisma.advise.findUnique({ where: { id: advise!.id } })).not.toBeNull();
    expect(Object.keys(advise!.author).sort()).toEqual(['id', 'image', 'name']);
  });
});
