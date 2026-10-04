import type { Page } from '@playwright/test';
import { expect as baseExpect, test } from './support/fixtures';
import {
  createEvent,
  createUser,
  openBrowserAs,
  signIn,
  uniqueId,
} from './support/eventos-helpers';

// Notificaciones de admins (/notificaciones y el badge del sidebar). Cada test usa un admin propio:
// las notificaciones le llegan a todos los admins y otros specs marcan las del admin sembrado.

const PREFIX = 'e2e-evt-not';

// El servidor e2e lo comparten varios specs a la vez: las server actions pueden tardar
const expect = baseExpect.configure({ timeout: 25_000 });
test.describe.configure({ timeout: 120_000 });

/** El link "Notificaciones" del sidebar; con notificaciones sin leer, su nombre suma el número. */
const sidebarLink = (page: Page) => page.getByRole('link', { name: /^Notificaciones/ });

/** El número del badge del sidebar (0 si no hay badge). */
const badgeCount = async (page: Page) => {
  const name = (await sidebarLink(page).textContent()) ?? '';
  const match = /(\d+)\+?$/.exec(name.trim());
  return match ? Number(match[1]) : 0;
};

/** La fila de una notificación (con su botón "Marcar como leída"), a partir de su mensaje. */
const notificationRow = (page: Page, message: string) =>
  page.getByText(message, { exact: true }).locator('..').locator('..');

test('TC-NOT-001 Notificación de nueva inscripción', async ({ page, db, browser, clientIp }) => {
  const admin = await createUser(db, PREFIX, { role: 'ADMIN' });
  const attendee = await createUser(db, PREFIX);
  const event = await createEvent(db, PREFIX, { capacity: 20 });

  await signIn(page, admin, '/notificaciones');
  await expect(sidebarLink(page)).toBeVisible();
  const before = await badgeCount(page);

  // Otra persona, en otro navegador, se inscribe
  const attendeePage = await openBrowserAs(browser, clientIp, attendee, `/eventos/${event.id}`);
  await attendeePage.waitForLoadState('networkidle');
  await attendeePage.getByRole('button', { name: 'inscribirme();' }).click();
  await expect(
    attendeePage.getByRole('dialog', { name: '¡Te has inscrito exitosamente! 🎉' }),
  ).toBeVisible();
  await attendeePage.context().close();

  await page.reload();
  const message = `${attendee.name} se ha inscrito al evento "${event.name}"`;
  const row = notificationRow(page, message);
  await expect(row.getByRole('heading', { name: 'Nueva inscripción a evento' })).toBeVisible();
  await expect(row.getByRole('button', { name: 'Marcar como leída' })).toBeVisible();
  await expect(row.getByRole('link', { name: 'ver inscripciones' })).toHaveAttribute(
    'href',
    `/eventos/${event.id}/inscripciones`,
  );
  await expect(page.getByText(/sin leer \[\d+\]/)).toBeVisible();
  expect(await badgeCount(page)).toBeGreaterThanOrEqual(before + 1);

  const saved = await db.notification.findFirstOrThrow({
    where: { userId: admin.id, type: 'event_registration_created', message },
  });
  expect(saved.read).toBe(false);
});

test('TC-NOT-002 Marcar como leídas', async ({ page, db }) => {
  const admin = await createUser(db, PREFIX, { role: 'ADMIN' });
  const [first, second] = [`Aviso ${uniqueId(PREFIX)}`, `Aviso ${uniqueId(PREFIX)}`];
  for (const title of [first, second]) {
    await db.notification.create({
      data: { userId: admin.id, type: 'e2e_test', title, message: `Mensaje de ${title}` },
    });
  }

  await signIn(page, admin, '/notificaciones');
  await page.waitForLoadState('networkidle');
  expect(await badgeCount(page)).toBeGreaterThanOrEqual(2);

  await notificationRow(page, `Mensaje de ${first}`)
    .getByRole('button', { name: 'Marcar como leída' })
    .click();
  await expect(page.getByText('Notificación marcada como leída')).toBeVisible();
  await expect(notificationRow(page, `Mensaje de ${first}`).getByRole('button')).toHaveCount(0);
  expect(
    (await db.notification.findFirstOrThrow({ where: { userId: admin.id, title: first } })).read,
  ).toBe(true);

  await page.getByRole('button', { name: 'marcar todas' }).click();
  await expect(page.getByText('Todas las notificaciones marcadas como leídas')).toBeVisible();
  await expect(page.getByRole('button', { name: 'marcar todas' })).toHaveCount(0);
  await expect(page.getByText(/leídas \[\d+\]/)).toBeVisible();
  // El badge vuelve a cero (desaparece)
  await expect(sidebarLink(page)).toHaveAccessibleName('Notificaciones');
  expect(
    (await db.notification.findFirstOrThrow({ where: { userId: admin.id, title: second } })).read,
  ).toBe(true);
});

test('a notification about an event links to the event and its registrations', async ({
  page,
  db,
}) => {
  const admin = await createUser(db, PREFIX, { role: 'ADMIN' });
  const event = await createEvent(db, PREFIX);
  const message = `Alguien salió de la lista de espera de ${uniqueId(PREFIX)}`;
  await db.notification.create({
    data: {
      userId: admin.id,
      type: 'event_waitlist_cancelled',
      title: 'Salida de lista de espera',
      message,
      metadata: JSON.stringify({ eventId: event.id, eventName: event.name }),
    },
  });

  await signIn(page, admin, '/notificaciones');
  await page.waitForLoadState('networkidle');
  const row = notificationRow(page, message);
  await row.getByRole('link', { name: 'ver inscripciones' }).click();
  await page.waitForURL(`**/eventos/${event.id}/inscripciones`);
  await expect(page.getByText('// activas', { exact: true })).toBeVisible();
});

test('a notification without a link to an event shows no event links', async ({ page, db }) => {
  const admin = await createUser(db, PREFIX, { role: 'ADMIN' });
  const message = `Aviso suelto ${uniqueId(PREFIX)}`;
  await db.notification.create({
    data: { userId: admin.id, type: 'e2e_test', title: 'Aviso suelto', message },
  });

  await signIn(page, admin, '/notificaciones');
  const row = notificationRow(page, message);
  await expect(row.getByRole('heading', { name: 'Aviso suelto' })).toBeVisible();
  await expect(row.getByRole('link')).toHaveCount(0);
});

test.describe('as a regular member', () => {
  test.use({ as: 'member' });

  test('TC-NOT-003 Notificaciones solo para admins', async ({ page }) => {
    await page.goto('/eventos');
    // El sidebar ya cargó (Changelog es uno de sus links), pero sin la sección de administración
    await expect(page.getByRole('link', { name: 'Changelog', exact: true })).toBeVisible();
    await expect(sidebarLink(page)).toHaveCount(0);

    // El caso manual espera "No tienes notificaciones"; la página manda a quien no es admin al
    // inicio, sin mostrar ninguna notificación
    await page.goto('/notificaciones');
    await page.waitForURL((url) => url.pathname === '/');
    await expect(page.getByText(/sin leer \[\d+\]/)).toHaveCount(0);
  });
});

test('anonymous visitors are sent home from /notificaciones', async ({ page }) => {
  await page.goto('/notificaciones');
  await page.waitForURL((url) => url.pathname === '/');
  await expect(sidebarLink(page)).toHaveCount(0);
});
