import type { Page } from '@playwright/test';
import { ADVISE, USERS } from './support/data';
import {
  createUser,
  expireCachedReads,
  seededUserId,
  signIn,
  uniqueId,
} from './support/content-helpers';
import { expect as baseExpect, test } from './support/fixtures';

// El servidor e2e es un build de producción compartido: con carga, cada paso puede tardar.
test.describe.configure({ timeout: 120_000 });
const expect = baseExpect.configure({ timeout: 30_000 });

// Consejos: publicar, validar, editar/borrar lo propio, likes y comentarios. Cada test que publica
// usa un usuario propio (el rate limit de publicaciones es por usuario) y consejos con ids
// `e2e-con-…`, así no toca el consejo sembrado (ADVISE) salvo para leerlo.

/** La tarjeta de un consejo en /consejos, por su texto. */
const card = (page: Page, text: string) => page.getByRole('article').filter({ hasText: text });

const openPublishDialog = async (page: Page) => {
  await page.getByRole('button', { name: 'publicarConsejo();' }).click();
  const dialog = page.getByRole('dialog', { name: 'Publicar un consejo' });
  await expect(dialog).toBeVisible();
  return dialog;
};

const publish = async (page: Page, content: string, { invalid = false } = {}) => {
  const dialog = await openPublishDialog(page);
  const textbox = dialog.getByPlaceholder('Escribí acá tu consejo...');
  // El diálogo recién abierto puede re-renderizarse con el refresh del servidor: reintenta el texto
  await expect(async () => {
    await textbox.fill(content);
    await expect(textbox).toHaveValue(content, { timeout: 1_000 });
  }).toPass();
  // Un texto inválido lo frena el form: no hay action que esperar
  if (invalid) {
    await dialog.getByRole('button', { name: 'publicar();' }).click();
    return dialog;
  }
  // Espera la respuesta de la action: el formulario se limpia recién ahí
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && !!response.request().headers()['next-action'],
    ),
    dialog.getByRole('button', { name: 'publicar();' }).click(),
  ]);
  return dialog;
};

test.describe('con un usuario propio', () => {
  test('TC-CON-001 Publicar un consejo', async ({ page, db }) => {
    const user = await createUser(db, 'e2e-con');
    await signIn(page, user);
    await page.goto('/consejos');

    const content = `Consejo ${uniqueId('e2e-con')}`; // ~20 caracteres
    const dialog = await publish(page, content);

    // El toast de carga ya pasó a éxito cuando publish() vuelve (espera la respuesta de la action)
    await expect(page.getByText('Consejo publicado! 👏')).toBeVisible();
    await expect(dialog).toBeHidden();

    // Primero en la lista (orden por defecto: recientes)
    await expect(page.getByRole('article').first()).toContainText(content);
    const saved = await db.advise.findFirstOrThrow({ where: { authorId: user.id } });
    expect(saved.content).toBe(content);
  });

  test('TC-CON-002 Largo del consejo', async ({ page, db }) => {
    const user = await createUser(db, 'e2e-con');
    await signIn(page, user);
    await page.goto('/consejos');

    const dialog = await publish(page, '123456789', { invalid: true });
    await expect(dialog.getByText('Tenés que escribir al menos 10 caracteres')).toBeVisible();

    await dialog.getByPlaceholder('Escribí acá tu consejo...').fill('a'.repeat(1001));
    await dialog.getByRole('button', { name: 'publicar();' }).click();
    await expect(dialog.getByText('Podés escribir 1000 caracteres como máximo')).toBeVisible();

    // Nada llegó a la base
    expect(await db.advise.count({ where: { authorId: user.id } })).toBe(0);
  });

  test('TC-CON-003 Editar y borrar solo lo propio', async ({ page, db }) => {
    const author = await createUser(db, 'e2e-con');
    const other = await createUser(db, 'e2e-con');
    const content = `Consejo de A para editar ${uniqueId('e2e-con')}`;
    const advise = await db.advise.create({
      data: { id: uniqueId('e2e-con'), content, authorId: author.id },
    });

    // B no ve el menú de opciones (ni en la lista ni en el detalle)
    await signIn(page, other);
    await page.goto('/consejos');
    await expect(card(page, content)).toBeVisible();
    await expect(card(page, content).getByRole('button', { name: 'Opciones' })).toHaveCount(0);
    await page.goto(`/consejos/${advise.id}`);
    await expect(page.getByRole('heading', { name: /consejo\.txt/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Opciones' })).toHaveCount(0);

    // A edita y elimina
    await page.context().clearCookies();
    await signIn(page, author);
    await page.goto('/consejos');
    await card(page, content).getByRole('button', { name: 'Opciones' }).click();
    await page.getByRole('menuitem', { name: 'Editar' }).click();
    const edit = page.getByRole('dialog', { name: 'Editar consejo' });
    const edited = `${content} (editado)`;
    await edit.getByRole('textbox').fill(edited);
    await edit.getByRole('button', { name: 'guardarCambios();' }).click();
    await expect(page.getByText('Tu consejo fue editado exitosamente.')).toBeVisible();
    await expect(card(page, edited)).toBeVisible();
    await expect
      .poll(async () => (await db.advise.findUnique({ where: { id: advise.id } }))?.content)
      .toBe(edited);

    await card(page, edited).getByRole('button', { name: 'Opciones' }).click();
    await page.getByRole('menuitem', { name: 'Eliminar' }).click();
    const confirm = page.getByRole('alertdialog', {
      name: '¿Estás seguro de eliminar este consejo?',
    });
    await confirm.getByRole('button', { name: 'Confirmar' }).click();
    await expect(page.getByText('Consejo eliminado correctamente')).toBeVisible();
    await expect(card(page, edited)).toHaveCount(0);
    expect(await db.advise.findUnique({ where: { id: advise.id } })).toBeNull();
  });

  test('si publicar falla, el diálogo queda abierto con el texto', async ({ page, db }) => {
    const user = await createUser(db, 'e2e-con');
    await signIn(page, user);
    await page.goto('/consejos');

    await page.route('**/consejos', (route) =>
      route.request().method() === 'POST' ? route.abort() : route.continue(),
    );
    const content = `Consejo que no llega ${uniqueId('e2e-con')}`;
    const dialog = await openPublishDialog(page);
    await dialog.getByPlaceholder('Escribí acá tu consejo...').fill(content);
    await dialog.getByRole('button', { name: 'publicar();' }).click();
    await expect(page.getByText('Ocurrió un error al publicar el consejo')).toBeVisible();
    // Abierto de verdad: durante la animación de cierre Radix lo deja visible con data-state=closed
    await expect(dialog).toHaveAttribute('data-state', 'open', { timeout: 2_000 });
    await expect(dialog.getByPlaceholder('Escribí acá tu consejo...')).toHaveValue(content);
  });

  test('editar con un texto demasiado corto muestra el error y no guarda', async ({ page, db }) => {
    const author = await createUser(db, 'e2e-con');
    const content = `Consejo para validar la edición ${uniqueId('e2e-con')}`;
    const advise = await db.advise.create({
      data: { id: uniqueId('e2e-con'), content, authorId: author.id },
    });
    await signIn(page, author);
    await page.goto('/consejos');

    await card(page, content).getByRole('button', { name: 'Opciones' }).click();
    await page.getByRole('menuitem', { name: 'Editar' }).click();
    const edit = page.getByRole('dialog', { name: 'Editar consejo' });
    await edit.getByRole('textbox').fill('corto');
    await edit.getByRole('button', { name: 'guardarCambios();' }).click();
    await expect(edit.getByText('Tenés que escribir al menos 10 caracteres')).toBeVisible();
    expect((await db.advise.findUniqueOrThrow({ where: { id: advise.id } })).content).toBe(content);
  });

  test('cancelar el borrado deja el consejo', async ({ page, db }) => {
    const author = await createUser(db, 'e2e-con');
    const content = `Consejo que no se borra ${uniqueId('e2e-con')}`;
    const advise = await db.advise.create({
      data: { id: uniqueId('e2e-con'), content, authorId: author.id },
    });
    await signIn(page, author);
    await page.goto('/consejos');

    await card(page, content).getByRole('button', { name: 'Opciones' }).click();
    await page.getByRole('menuitem', { name: 'Eliminar' }).click();
    const confirm = page.getByRole('alertdialog');
    await confirm.getByRole('button', { name: 'Cancelar' }).click();
    await expect(confirm).toBeHidden();
    await expect(card(page, content)).toBeVisible();
    expect(await db.advise.findUnique({ where: { id: advise.id } })).not.toBeNull();
  });

  test('TC-CON-004 Like optimista', async ({ page, db }) => {
    const user = await createUser(db, 'e2e-con');
    const author = await createUser(db, 'e2e-con');
    const liked = `Consejo para likear ${uniqueId('e2e-con')}`;
    const failing = `Consejo con la red cortada ${uniqueId('e2e-con')}`;
    const [likedAdvise] = await Promise.all([
      db.advise.create({ data: { id: uniqueId('e2e-con'), content: liked, authorId: author.id } }),
      db.advise.create({
        data: { id: uniqueId('e2e-con'), content: failing, authorId: author.id },
      }),
    ]);
    await signIn(page, user);
    await page.goto('/consejos');

    const like = card(page, liked).getByRole('button', { name: /Me gusta/ });
    await expect(like).toHaveAttribute('aria-pressed', 'false');
    await like.click();
    await expect(like).toHaveAttribute('aria-pressed', 'true');
    await expect(like).toContainText('1');
    await expect
      .poll(() => db.like.count({ where: { adviseId: likedAdvise.id, userId: user.id } }))
      .toBe(1);

    // Persiste al recargar
    await page.reload();
    await expect(card(page, liked).getByRole('button', { name: /Me gusta/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Sin red: el corazón cambia y, cuando falla el request, vuelve al estado anterior
    const failingLike = card(page, failing).getByRole('button', { name: /Me gusta/ });
    await expect(failingLike).toHaveAttribute('aria-pressed', 'false');
    await page.route('**/consejos**', (route) =>
      route.request().method() === 'POST' ? route.abort() : route.continue(),
    );
    await failingLike.click();
    await expect(failingLike).toHaveAttribute('aria-pressed', 'false');
    await expect(failingLike).toContainText('0');
    await page.unrouteAll();
  });

  test('quitar el like resta uno', async ({ page, db }) => {
    const user = await createUser(db, 'e2e-con');
    const author = await createUser(db, 'e2e-con');
    const content = `Consejo con like previo ${uniqueId('e2e-con')}`;
    const advise = await db.advise.create({
      data: {
        id: uniqueId('e2e-con'),
        content,
        authorId: author.id,
        likes: { create: [{ userId: user.id }, { userId: author.id }] },
      },
    });
    await signIn(page, user);
    await page.goto('/consejos');

    const like = card(page, content).getByRole('button', { name: /Me gusta/ });
    await expect(like).toHaveAttribute('aria-pressed', 'true');
    await expect(like).toContainText('2');
    await like.click();
    await expect(like).toHaveAttribute('aria-pressed', 'false');
    await expect(like).toContainText('1');
    await expect.poll(() => db.like.count({ where: { adviseId: advise.id } })).toBe(1);
  });

  test('TC-CON-005 Comentar y responder', async ({ page, db }) => {
    const user = await createUser(db, 'e2e-con');
    const advise = await db.advise.create({
      data: {
        id: uniqueId('e2e-con'),
        content: `Consejo para comentar ${uniqueId('e2e-con')}`,
        authorId: await seededUserId(db, 'member'),
      },
    });
    await signIn(page, user);
    await page.goto(`/consejos/${advise.id}`);

    const comment = `Comentario ${uniqueId('e2e-con')}`;
    // Next puede dejar oculta una copia de la página anterior: solo el campo visible
    await page.getByPlaceholder('Escribe tu comentario...').filter({ visible: true }).fill(comment);
    await page
      .getByRole('button', { name: 'enviarComentario();' })
      .filter({ visible: true })
      .click();
    await expect(page.getByText('Comentario creado')).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: comment })).toBeVisible();

    await page.getByRole('button', { name: 'Responder' }).first().click();
    const reply = `Respuesta ${uniqueId('e2e-con')}`;
    await page.getByPlaceholder('Escribe tu respuesta...').filter({ visible: true }).fill(reply);
    await page.getByRole('button', { name: 'enviarRespuesta();' }).click();
    await expect(page.getByRole('paragraph').filter({ hasText: reply })).toBeVisible();

    const saved = await db.comment.findFirstOrThrow({ where: { content: reply } });
    const parent = await db.comment.findFirstOrThrow({ where: { content: comment } });
    expect(saved.parentCommentId).toBe(parent.id);
    expect(parent.parentCommentId).toBeNull();
  });

  test('un comentario vacío no se envía', async ({ page, db }) => {
    const user = await createUser(db, 'e2e-con');
    const advise = await db.advise.create({
      data: {
        id: uniqueId('e2e-con'),
        content: `Consejo sin comentarios ${uniqueId('e2e-con')}`,
        authorId: user.id,
      },
    });
    await signIn(page, user);
    await page.goto(`/consejos/${advise.id}`);

    await page.getByRole('button', { name: 'enviarComentario();' }).click();
    await expect(page.getByText('El comentario no puede estar vacío')).toBeVisible();
    expect(await db.comment.count({ where: { adviseId: advise.id } })).toBe(0);
  });

  test('responder a una respuesta queda visible en el consejo', async ({ page, db }) => {
    const user = await createUser(db, 'e2e-con');
    const id = uniqueId('e2e-con');
    const parentContent = `Raíz ${uniqueId('e2e-con')}`;
    const replyContent = `Respuesta ${uniqueId('e2e-con')}`;
    await db.advise.create({
      data: {
        id,
        content: `Consejo con hilo ${uniqueId('e2e-con')}`,
        authorId: user.id,
        comments: {
          create: { content: parentContent, authorId: user.id },
        },
      },
    });
    const root = await db.comment.findFirstOrThrow({ where: { adviseId: id } });
    await db.comment.create({
      data: { content: replyContent, authorId: user.id, adviseId: id, parentCommentId: root.id },
    });

    await signIn(page, user);
    await page.goto(`/consejos/${id}`);
    await expect(page.getByRole('paragraph').filter({ hasText: replyContent })).toBeVisible();
    // El segundo "Responder" es el de la respuesta
    await page.getByRole('button', { name: 'Responder' }).nth(1).click();
    const nested = `Respuesta a la respuesta ${uniqueId('e2e-con')}`;
    await page.getByPlaceholder('Escribe tu respuesta...').fill(nested);
    await page.getByRole('button', { name: 'enviarRespuesta();' }).click();
    await expect(page.getByText('Comentario creado')).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: nested })).toBeVisible({
      timeout: 5_000,
    });
  });

  test('TC-CON-006 Rate limit de publicaciones', async ({ page, db }) => {
    test.setTimeout(240_000);
    const user = await createUser(db, 'e2e-con');
    await signIn(page, user);
    await page.goto('/consejos');

    for (let i = 1; i <= 10; i++) {
      const dialog = await publish(page, `Consejo número ${i} de la ráfaga ${user.id}`);
      await expect.poll(() => db.advise.count({ where: { authorId: user.id } })).toBe(i);
      await expect(dialog).toBeHidden();
    }
    await expect.poll(() => db.advise.count({ where: { authorId: user.id } })).toBe(10);

    await publish(page, `Consejo número 11 de la ráfaga ${user.id}`);
    await expect(
      page.getByText(
        /Publicaste mucho contenido en poco tiempo\..*vas a poder publicar de nuevo en (1 hora|\d+ minutos?)\./,
      ),
    ).toBeVisible();
    expect(await db.advise.count({ where: { authorId: user.id } })).toBe(10);
  });
});

test.describe('como admin', () => {
  test.use({ as: 'admin' });

  test('un admin puede editar el consejo de otra persona', async ({ page, db, browser }) => {
    const author = await createUser(db, 'e2e-con');
    const content = `Consejo que modera el admin ${uniqueId('e2e-con')}`;
    const advise = await db.advise.create({
      data: { id: uniqueId('e2e-con'), content, authorId: author.id },
    });
    await expireCachedReads(browser, db);
    await page.goto('/consejos');
    await card(page, content).getByRole('button', { name: 'Opciones' }).click();
    await page.getByRole('menuitem', { name: 'Editar' }).click();
    const edit = page.getByRole('dialog', { name: 'Editar consejo' });
    await edit.getByRole('textbox').fill(`${content} [moderado]`);
    await edit.getByRole('button', { name: 'guardarCambios();' }).click();
    await expect(page.getByText('Tu consejo fue editado exitosamente.')).toBeVisible();
    await expect
      .poll(async () => (await db.advise.findUnique({ where: { id: advise.id } }))?.content)
      .toBe(`${content} [moderado]`);
  });
});

test.describe('como miembro', () => {
  test.use({ as: 'member' });

  test('el autor ve las opciones de su consejo sembrado', async ({ page }) => {
    await page.goto('/consejos');
    await expect(
      card(page, ADVISE.content).getByRole('button', { name: 'Opciones' }),
    ).toBeVisible();
  });
});

test.describe('sin sesión', () => {
  test('no ve publicar ni opciones y el like pide iniciar sesión', async ({ page, db }) => {
    await page.goto('/consejos');
    await expect(card(page, ADVISE.content)).toBeVisible();
    await expect(page.getByRole('button', { name: 'publicarConsejo();' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Opciones' })).toHaveCount(0);

    const likesBefore = await db.like.count({ where: { adviseId: ADVISE.id } });
    const like = card(page, ADVISE.content).getByRole('button', { name: /Me gusta/ });
    await like.click();
    await expect(page.getByText('Iniciá sesión para dar me gusta')).toBeVisible();
    await expect(like).toHaveAttribute('aria-pressed', 'false');
    expect(await db.like.count({ where: { adviseId: ADVISE.id } })).toBe(likesBefore);
  });

  test('el detalle pide iniciar sesión para comentar', async ({ page }) => {
    await page.goto(`/consejos/${ADVISE.id}`);
    await expect(page.getByText(ADVISE.content.split(':')[0])).toBeVisible();
    await expect(page.getByText(/Debes\s+iniciar sesión\s+para poder comentar\./)).toBeVisible();
    await expect(page.getByPlaceholder('Escribe tu comentario...')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Responder' })).toHaveCount(0);
    await page.getByRole('link', { name: 'iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/autenticacion\/iniciar-sesion/);
  });

  test('un consejo inexistente muestra el aviso', async ({ page }) => {
    await page.goto('/consejos/e2e-con-no-existe');
    await expect(page.getByText('no existe ese consejo.')).toBeVisible();
    await page.getByRole('link', { name: 'cd ~/consejos →' }).click();
    await expect(page).toHaveURL(/\/consejos$/);
  });

  test('abrir un consejo desde la lista lo muestra en un modal', async ({ page }) => {
    await page.goto('/consejos');
    await card(page, ADVISE.content).getByRole('link', { name: ADVISE.content }).click();
    await expect(page).toHaveURL(new RegExp(`/consejos/${ADVISE.id}$`));
    const modal = page.getByRole('dialog');
    await expect(modal).toContainText(USERS.member.name);
    await modal.getByRole('button', { name: 'Cerrar' }).click();
    await expect(page).toHaveURL(/\/consejos$/);
  });

  test('buscar filtra por texto y por autor', async ({ page }) => {
    await page.goto('/consejos');
    const search = page.getByRole('textbox', { name: 'Buscar consejos por texto o autor' });
    await search.fill('Escribí tests antes de refactorizar');
    await expect(card(page, ADVISE.content)).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(1);

    await search.fill(USERS.member.name);
    await expect(card(page, ADVISE.content)).toBeVisible();

    await search.fill('zzz-nada-coincide-e2e');
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByText(/0 resultados para/)).toBeVisible();

    await page.getByRole('button', { name: 'reset' }).click();
    await expect(search).toHaveValue('');
    await expect(card(page, ADVISE.content)).toBeVisible();
  });

  test('el filtro de origen separa los publicados de los auto-extraídos', async ({ page }) => {
    await page.goto('/consejos');
    const origin = page.getByRole('radiogroup', { name: 'Origen' });

    await origin.getByRole('radio', { name: 'auto' }).click();
    await expect(origin.getByRole('radio', { name: 'auto' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(card(page, ADVISE.content)).toHaveCount(0);
    await expect(page.getByRole('article').first()).toContainText('auto');

    await origin.getByRole('radio', { name: 'manual' }).click();
    await expect(card(page, ADVISE.content)).toBeVisible();
  });

  test('el filtro de autor muestra solo sus consejos', async ({ page }) => {
    await page.goto('/consejos');
    await page.getByRole('combobox', { name: 'Autor' }).click();
    await page.getByRole('option', { name: new RegExp(`^@${USERS.member.name}`) }).click();
    await expect(card(page, ADVISE.content)).toBeVisible();
    const articles = page.getByRole('article');
    const count = await articles.count();
    for (let i = 0; i < count; i++) {
      await expect(articles.nth(i)).toContainText(USERS.member.name);
    }
  });
});
