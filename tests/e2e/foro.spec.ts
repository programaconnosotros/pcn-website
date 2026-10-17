import type { PrismaClient } from '../../src/generated/prisma/client';
import type { Browser, Page } from '@playwright/test';
import { createUser, expireCachedReads, signIn, uniqueId } from './support/content-helpers';
import { expect as baseExpect, test } from './support/fixtures';

// El servidor e2e es un build de producción compartido: con carga, cada paso puede tardar.
test.describe.configure({ timeout: 120_000 });
const expect = baseExpect.configure({ timeout: 30_000 });

// Foro: abrir temas con markdown, que el contenido peligroso quede como texto, responder y anidar,
// editar/borrar/moderar y leer sin sesión. Cada test usa usuarios y temas propios (`e2e-for-…`).

const CONTENT_MIN = 'Un contenido con suficiente texto para pasar la validación del foro.';

/** Un tema creado directo en la base (más rápido que el formulario), visible para la app. */
const seedThread = async (
  db: PrismaClient,
  browser: Browser,
  authorId: string,
  data: Partial<{ title: string; content: string; isLocked: boolean }> = {},
) => {
  const post = await db.forumPost.create({
    data: {
      title: data.title ?? `Tema ${uniqueId('e2e-for')}`,
      content: data.content ?? CONTENT_MIN,
      isLocked: data.isLocked ?? false,
      authorId,
      categoryId: 'forum-cat-general',
    },
  });
  // La base del test no pasa por la extensión de Prisma que vence el cache del sitio.
  await expireCachedReads(browser, db);
  return post;
};

/** The list of threads of /foro or a category (not the footer's or the ticker's links). */
const threadList = (page: Page) =>
  page
    .locator('ol')
    .filter({ has: page.locator('a[href^="/foro/tema/"]') })
    .first();

/** Sends a reply and waits until it's saved (the box empties once the action answers). */
const reply = async (
  page: Page,
  text: string,
  box = page.getByRole('textbox', { name: 'Tu respuesta' }),
) => {
  await box.fill(text);
  // The button of the same form: a nested reply's form sits above the thread's one.
  await box.locator('xpath=ancestor::form').getByRole('button', { name: 'responder();' }).click();
  // The top-level box empties; a nested one closes. Either way the reply was saved.
  await expect(async () => {
    if ((await box.count()) > 0) await expect(box).toHaveValue('', { timeout: 1_000 });
  }).toPass();
};

/** A reply in the thread, by its text. */
const replyText = (page: Page, text: string) => page.locator('article').getByText(text);

test('TC-FOR-001 Abrir un tema con markdown', async ({ page, db }) => {
  const user = await createUser(db, 'e2e-for');
  await signIn(page, user);
  await page.goto('/foro');
  await page.getByRole('link', { name: /nuevoTema/ }).click();
  await expect(page).toHaveURL(/\/foro\/nuevo/);

  const title = `Monorepos ${uniqueId('e2e-for')}`;
  await page.getByLabel('Título').fill(title);
  await page.getByRole('combobox', { name: 'Categoría' }).click();
  await page.getByRole('option', { name: 'Ayuda' }).click();
  await page
    .getByRole('textbox', { name: 'Contenido' })
    .fill(
      'Uso **pnpm** con workspaces:\n\n- un paquete\n- otro paquete\n\n```\npnpm -r build\n```',
    );

  await page.getByRole('tab', { name: 'vista-previa' }).click();
  await expect(page.getByText('pnpm', { exact: true }).locator('xpath=self::strong')).toBeVisible();

  await page.getByRole('button', { name: 'publicarTema();' }).click();
  await expect(page).toHaveURL(/\/foro\/tema\//);
  await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible();
  await expect(page.locator('strong', { hasText: 'pnpm' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'otro paquete' })).toBeVisible();
  await expect(page.locator('pre code', { hasText: 'pnpm -r build' })).toBeVisible();

  // Primero en /foro y en su categoría.
  await page.goto('/foro/categoria/ayuda');
  // The news ticker links new threads too: the first link is the one in the list.
  await expect(threadList(page).getByRole('link', { name: new RegExp(`^${title}`) })).toBeVisible();
});

test('TC-FOR-002 Contenido peligroso se muestra como texto', async ({ page, db, browser }) => {
  const user = await createUser(db, 'e2e-for');
  const post = await seedThread(db, browser, user.id, {
    content:
      'Probá esto <script>window.__pwned = true</script> y [x](javascript:alert(1)) también.',
  });

  let dialogs = 0;
  page.on('dialog', (dialog) => {
    dialogs += 1;
    void dialog.dismiss();
  });
  await page.goto(`/foro/tema/${post.id}`);

  await expect(
    page.getByText('<script>window.__pwned = true</script>', { exact: false }),
  ).toBeVisible();
  expect(await page.evaluate(() => (window as { __pwned?: boolean }).__pwned)).toBeUndefined();
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
  expect(dialogs).toBe(0);
});

test('TC-FOR-003 Responder y anidar respuestas', async ({ page, db, browser }) => {
  const [author, replier] = [await createUser(db, 'e2e-for'), await createUser(db, 'e2e-for')];
  const post = await seedThread(db, browser, author.id);
  await signIn(page, replier);
  await page.goto(`/foro/tema/${post.id}`);

  await reply(page, 'Primera respuesta del e2e');
  await expect(replyText(page, 'Primera respuesta del e2e')).toBeVisible();
  await expect(page.getByRole('heading', { name: /^\/\/ 1 respuesta$/ })).toBeVisible();

  await page
    .getByRole('button', { name: /^responder$/ })
    .first()
    .click();
  await reply(
    page,
    'Respuesta anidada del e2e',
    page.getByRole('textbox', { name: 'Tu respuesta al comentario' }),
  );
  await expect(replyText(page, 'Respuesta anidada del e2e')).toBeVisible();
  await expect(page.getByRole('heading', { name: /^\/\/ 2 respuestas$/ })).toBeVisible();

  const nested = await db.forumComment.findFirstOrThrow({
    where: { postId: post.id, content: 'Respuesta anidada del e2e' },
  });
  expect(nested.parentCommentId).not.toBeNull();
  // Quien abrió el tema se entera de la respuesta.
  await expect
    .poll(() => db.notification.count({ where: { userId: author.id, type: 'forum_post_replied' } }))
    .toBeGreaterThan(0);
});

test('TC-FOR-004 Editar, borrar y moderar', async ({ page, db, browser }) => {
  const [author, other, admin] = [
    await createUser(db, 'e2e-for'),
    await createUser(db, 'e2e-for'),
    await createUser(db, 'e2e-for', { role: 'ADMIN' }),
  ];
  const own = await seedThread(db, browser, author.id);
  const moderated = await seedThread(db, browser, other.id);

  await signIn(page, other);
  await page.goto(`/foro/tema/${own.id}`);
  await expect(page.getByRole('heading', { level: 2, name: own.title })).toBeVisible();
  await expect(page.getByRole('link', { name: 'editar' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'eliminar' })).toHaveCount(0);

  await page.context().clearCookies();
  await signIn(page, author);
  await page.goto(`/foro/tema/${own.id}`);
  await page.getByRole('link', { name: 'editar' }).click();
  const edited = `${own.title} (editado)`;
  await page.getByLabel('Título').fill(edited);
  await page.getByRole('button', { name: 'guardarCambios();' }).click();
  await expect(page.getByRole('heading', { level: 2, name: edited })).toBeVisible();
  await page.getByRole('button', { name: 'eliminar' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click();
  await expect(page).toHaveURL(/\/foro$/);
  await expect.poll(() => db.forumPost.count({ where: { id: own.id } })).toBe(0);

  await page.context().clearCookies();
  await signIn(page, admin);
  await page.goto(`/foro/tema/${moderated.id}`);
  await page.getByRole('button', { name: 'fijar' }).click();
  await expect(page.getByRole('button', { name: 'desfijar' })).toBeVisible();
  await page.getByRole('button', { name: 'cerrar' }).click();
  await expect(page.getByText('Este tema está cerrado', { exact: false })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Tu respuesta' })).toHaveCount(0);

  // Pinned, it's first in the list.
  await page.goto('/foro');
  await expect(threadList(page).getByRole('listitem').first()).toContainText(moderated.title);
});

test('TC-FOR-005 Visitantes sin sesión', async ({ page, db, browser }) => {
  const author = await createUser(db, 'e2e-for');
  const post = await seedThread(db, browser, author.id);

  await page.goto(`/foro/tema/${post.id}`);
  await expect(page.getByRole('heading', { level: 2, name: post.title })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Iniciá sesión' })).toHaveAttribute(
    'href',
    `/iniciar-sesion?redirect=/foro/tema/${post.id}`,
  );

  await page.goto('/foro');
  await page.getByRole('link', { name: /nuevoTema/ }).click();
  await expect(page).toHaveURL(/\/iniciar-sesion\?redirect=/);
});
