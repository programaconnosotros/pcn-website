import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import { createUser, signIn, type CreatedUser } from './support/content-helpers';
import { storageStatePath, TESTIMONIAL, USERS, type SignedInRole } from './support/data';
import { expect as baseExpect, test } from './support/fixtures';

// Testimonios: uno por persona. Cada test crea sus usuarios y sus testimonios desde la UI (la
// lista está cacheada y solo se refresca con escrituras de la app), nunca toca el sembrado.

// La base y el servidor se comparten con el resto de la suite: con la máquina cargada, un flujo
// con login y varias acciones del servidor puede pasar los 45 s por defecto.
test.describe.configure({ timeout: 120_000 });
const expect = baseExpect.configure({ timeout: 20_000 });

const body = (label: string) =>
  `Testimonio e2e ${label} ${Date.now()}: la comunidad me ayudó un montón a crecer.`;

/** Cambia la sesión de la página a la de un rol sembrado (storage state de auth.setup). */
const switchTo = async (page: Page, role: SignedInRole) => {
  const state = JSON.parse(readFileSync(storageStatePath(role), 'utf8')) as {
    cookies: Parameters<ReturnType<Page['context']>['addCookies']>[0];
  };
  await page.context().clearCookies();
  await page.context().addCookies(state.cookies);
};

const openNewForm = async (page: Page) => {
  await page.goto('/testimonios');
  await page.getByRole('button', { name: 'agregarTestimonio();' }).click();
  const dialog = page.getByRole('dialog', { name: 'Nuevo testimonio' });
  await expect(dialog).toBeVisible();
  return dialog;
};

/** Crea el testimonio del usuario logueado desde el formulario y espera el toast. */
const createThroughForm = async (page: Page, text: string) => {
  const dialog = await openNewForm(page);
  await dialog.getByLabel('Testimonio', { exact: true }).fill(text);
  await dialog.getByRole('button', { name: 'crear();' }).click();
  await expect(page.getByText('Testimonio creado exitosamente')).toBeVisible();
  await expect(dialog).toBeHidden();
};

/** El párrafo con el texto de un testimonio (`> texto`). */
const quote = (page: Page, text: string) => page.getByRole('paragraph').filter({ hasText: text });

/** La tarjeta del testimonio en la lista: el padre de su párrafo. */
const cardOf = (page: Page, text: string) => quote(page, text).locator('..');

const signedInAuthor = async (page: Page, db: Parameters<typeof createUser>[0]) => {
  const author = await createUser(db, 'e2e-tes');
  await signIn(page, author);
  return author;
};

const testimonialOf = (db: Parameters<typeof createUser>[0], user: CreatedUser) =>
  db.testimonial.findMany({ where: { userId: user.id } });

test('TC-TES-001 Dejar un testimonio', async ({ page, db }) => {
  const author = await signedInAuthor(page, db);
  const text = body('nuevo');

  const dialog = await openNewForm(page);
  const field = dialog.getByLabel('Testimonio', { exact: true });
  await field.fill('123456789');
  await dialog.getByRole('button', { name: 'crear();' }).click();
  await expect(dialog.getByText('El testimonio debe tener al menos 10 caracteres')).toBeVisible();
  expect(await testimonialOf(db, author)).toHaveLength(0);

  await field.fill(text);
  await dialog.getByRole('button', { name: 'crear();' }).click();
  await expect(page.getByText('Testimonio creado exitosamente')).toBeVisible();

  // Aparece primero en la lista, marcado como propio
  await expect(cardOf(page, text)).toContainText('(vos)');
  const ownBox = await cardOf(page, text).boundingBox();
  const seededBox = await cardOf(page, TESTIMONIAL.body).boundingBox();
  // En la grilla, "primero" es más arriba o, en la misma fila, más a la izquierda
  expect(ownBox!.y < seededBox!.y || (ownBox!.y === seededBox!.y && ownBox!.x < seededBox!.x)).toBe(
    true,
  );

  const [saved] = await testimonialOf(db, author);
  expect(saved.body).toBe(text);
  expect(saved.featured).toBe(false);

  // Los admins reciben la notificación
  const admin = await db.user.findUniqueOrThrow({ where: { email: USERS.admin.email } });
  const notification = await db.notification.findFirst({
    where: { userId: admin.id, title: 'Nuevo testimonio creado', metadata: { contains: saved.id } },
  });
  expect(notification?.message).toBe(`${author.name} ha creado un nuevo testimonio`);
});

test('TC-TES-002 Un testimonio por persona', async ({ page, db }) => {
  const author = await signedInAuthor(page, db);
  const text = body('único');
  await createThroughForm(page, text);

  await page.reload();
  await expect(page.getByRole('button', { name: 'agregarTestimonio();' })).toBeHidden();
  await page.getByRole('button', { name: 'editarTestimonio();' }).click();

  const dialog = page.getByRole('dialog', { name: 'Editar testimonio' });
  const field = dialog.getByLabel('Testimonio', { exact: true });
  await expect(field).toHaveValue(text);

  const edited = `${text} Editado.`;
  await field.fill(edited);
  await dialog.getByRole('button', { name: 'actualizar();' }).click();
  await expect(page.getByText('Testimonio actualizado exitosamente')).toBeVisible();
  await expect(quote(page, edited)).toBeVisible();

  const rows = await testimonialOf(db, author);
  expect(rows).toHaveLength(1);
  expect(rows[0].body).toBe(edited);
});

test('TC-TES-003 Destacar en la home', async ({ page, db }) => {
  const author = await signedInAuthor(page, db);
  const text = body('destacado');
  await createThroughForm(page, text);

  // Una persona común no ve la opción, ni en su propio testimonio
  await cardOf(page, text).getByRole('button').click();
  await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Mostrar en home page' })).toHaveCount(0);
  await page.keyboard.press('Escape');

  await switchTo(page, 'admin');
  await page.goto('/testimonios');
  await cardOf(page, text).getByRole('button').click();
  await page.getByRole('menuitem', { name: 'Mostrar en home page' }).click();
  await expect(page.getByText('Testimonio agregado a la home page')).toBeVisible();
  const [saved] = await testimonialOf(db, author);
  await expect
    .poll(async () => (await db.testimonial.findUnique({ where: { id: saved.id } }))?.featured)
    .toBe(true);

  try {
    await page.goto('/');
    await expect(page.getByRole('figure').filter({ hasText: text })).toBeVisible();
  } finally {
    // No dejar el testimonio destacado en la home de los demás specs
    await page.goto(`/testimonios/${saved.id}`);
    await page.getByRole('button', { name: 'quitarDestacado();' }).click();
    await expect(page.getByText('Testimonio removido de la home page')).toBeVisible();
  }
  await page.goto('/');
  await expect(page.getByRole('figure').filter({ hasText: TESTIMONIAL.body })).toBeVisible();
  await expect(page.getByRole('figure').filter({ hasText: text })).toHaveCount(0);
});

test.describe('anonymous visitors', () => {
  test('see testimonials read-only, without actions', async ({ page }) => {
    await page.goto('/testimonios');
    await expect(quote(page, TESTIMONIAL.body)).toBeVisible();
    await expect(page.getByRole('button', { name: 'agregarTestimonio();' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'editarTestimonio();' })).toHaveCount(0);
    await expect(cardOf(page, TESTIMONIAL.body).getByRole('button')).toHaveCount(0);
    await expect(page.getByRole('link', { name: USERS.member.name }).first()).toBeVisible();
  });

  test('the detail page has no edit or delete actions', async ({ page }) => {
    await page.goto(`/testimonios/${TESTIMONIAL.id}`);
    await expect(quote(page, TESTIMONIAL.body)).toBeVisible();
    await expect(page.getByRole('button', { name: 'editar();' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'eliminar();' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'destacar();' })).toHaveCount(0);
  });
});

test('an unknown testimonial id redirects to the list', async ({ page }) => {
  await page.goto('/testimonios/no-existe-e2e');
  await expect(page).toHaveURL(/\/testimonios$/);
});

test("another member can't edit or delete someone else's testimonial", async ({ page, db }) => {
  await signedInAuthor(page, db);
  await page.goto('/testimonios');
  await expect(quote(page, TESTIMONIAL.body)).toBeVisible();
  await expect(cardOf(page, TESTIMONIAL.body).getByRole('button')).toHaveCount(0);

  await page.goto(`/testimonios/${TESTIMONIAL.id}`);
  await expect(quote(page, TESTIMONIAL.body)).toBeVisible();
  await expect(page.getByRole('button', { name: 'editar();' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'eliminar();' })).toHaveCount(0);
});

test('cancelling the form saves nothing', async ({ page, db }) => {
  const author = await signedInAuthor(page, db);
  const dialog = await openNewForm(page);
  await dialog.getByLabel('Testimonio', { exact: true }).fill(body('cancelado'));
  await dialog.getByRole('button', { name: 'cancelar();' }).click();
  await expect(dialog).toBeHidden();
  expect(await testimonialOf(db, author)).toHaveLength(0);
});

test('the author edits and deletes their testimonial from its page', async ({ page, db }) => {
  const author = await signedInAuthor(page, db);
  const text = body('detalle');
  await createThroughForm(page, text);
  const [saved] = await testimonialOf(db, author);

  await page.goto(`/testimonios/${saved.id}`);
  await page.getByRole('button', { name: 'editar();' }).click();
  const dialog = page.getByRole('dialog', { name: 'Editar testimonio' });
  const edited = `${text} Desde el detalle.`;
  await dialog.getByLabel('Testimonio', { exact: true }).fill(edited);
  await dialog.getByRole('button', { name: 'actualizar();' }).click();
  await expect(page.getByText('Testimonio actualizado exitosamente')).toBeVisible();
  await expect(quote(page, edited)).toBeVisible();
  await expect(page.getByText(/actualizado \d/)).toBeVisible();

  await page.getByRole('button', { name: 'eliminar();' }).click();
  await page
    .getByRole('alertdialog', { name: '¿Estás seguro de que quieres eliminar este testimonio?' })
    .getByRole('button', { name: 'eliminar();' })
    .click();
  await expect(page.getByText('Testimonio eliminado exitosamente')).toBeVisible();
  await expect(page).toHaveURL(/\/testimonios$/);
  await expect(page.getByRole('button', { name: 'agregarTestimonio();' })).toBeVisible();
  expect(await testimonialOf(db, author)).toHaveLength(0);
});

test('deleting from the list asks for confirmation first', async ({ page, db }) => {
  const author = await signedInAuthor(page, db);
  const text = body('borrar');
  await createThroughForm(page, text);

  await cardOf(page, text).getByRole('button').click();
  await page.getByRole('menuitem', { name: 'Eliminar' }).click();
  const confirm = page.getByRole('alertdialog');
  await confirm.getByRole('button', { name: 'cancelar();' }).click();
  await expect(confirm).toBeHidden();
  expect(await testimonialOf(db, author)).toHaveLength(1);

  await cardOf(page, text).getByRole('button').click();
  await page.getByRole('menuitem', { name: 'Eliminar' }).click();
  await confirm.getByRole('button', { name: 'eliminar();' }).click();
  await expect(page.getByText('Testimonio eliminado exitosamente')).toBeVisible();
  await expect.poll(async () => (await testimonialOf(db, author)).length).toBe(0);
  // La lista se refresca sola (revalidatePath); bajo carga puede tardar más que el toast
  await expect(quote(page, text)).toBeHidden();
  await expect(page.getByRole('button', { name: 'agregarTestimonio();' })).toBeVisible();
});
