import type { Page } from '@playwright/test';
import { EVENTS } from './support/data';
import { expect as baseExpect, test } from './support/fixtures';
import {
  createEvent,
  createUser,
  gotoReady,
  register,
  signIn,
  waitlist,
} from './support/eventos-helpers';

// Eventos: inscripción, lista de espera y bajas. Cada test usa un evento y personas propias: los
// eventos sembrados se comparten con otros specs y no se tocan (solo se leen).

const PREFIX = 'e2e-evt';

// El servidor e2e lo comparten varios specs a la vez: las server actions pueden tardar
const expect = baseExpect.configure({ timeout: 25_000 });
test.describe.configure({ timeout: 120_000 });

/** El aviso de "Cupo completo" del panel de inscripción (el badge del título es aparte). */
const fullNotice = (page: Page) =>
  page.getByRole('paragraph').filter({ hasText: /^Cupo completo$/ });

/** "Ya estás registrado" del panel de inscripción. */
const registeredNotice = (page: Page) =>
  page.getByText('Ya estás registrado', { exact: true }).first();

/** Inicia sesión y abre el evento, ya hidratado. */
const openEventAs = async (page: Page, user: { email: string }, eventId: string) => {
  await signIn(page, user, `/eventos/${eventId}`);
  await page.waitForLoadState('networkidle');
};

const activeRegistration = (eventId: string, userId: string) => ({
  where: { eventId, userId, cancelledAt: null },
});

test('TC-EVT-001 Inscribirse a un evento con cupo', async ({ page, db }) => {
  const [user, other] = [await createUser(db, PREFIX), await createUser(db, PREFIX)];
  const event = await createEvent(db, PREFIX, { capacity: 5 });
  await register(db, event.id, [other]);

  await openEventAs(page, user, event.id);
  await expect(page.getByText('Quedan 4 lugares disponibles.')).toBeVisible();

  await page.getByRole('button', { name: 'inscribirme();' }).click();

  const dialog = page.getByRole('dialog', { name: '¡Te has inscrito exitosamente! 🎉' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(event.name);
  await dialog.getByRole('button', { name: 'entendido();' }).click();
  await expect(dialog).toBeHidden();

  await expect(registeredNotice(page)).toBeVisible();
  await expect(page.getByRole('button', { name: 'cancelarInscripcion();' })).toBeVisible();
  expect(await db.eventRegistration.count(activeRegistration(event.id, user.id))).toBe(1);

  // Para cualquier otra persona, el contador ya bajó en uno
  await page.context().clearCookies();
  await page.goto(`/eventos/${event.id}`);
  await expect(page.getByText('Quedan 3 lugares disponibles.')).toBeVisible();
});

test('TC-EVT-002 Inscripción automática después del login', async ({ page, db }) => {
  const user = await createUser(db, PREFIX);
  const event = await createEvent(db, PREFIX, { capacity: 10 });

  await gotoReady(page, `/eventos/${event.id}`);
  await page.getByRole('button', { name: 'inscribirme();' }).click();

  await page.waitForURL(/\/autenticacion\/iniciar-sesion/);
  const loginUrl = new URL(page.url());
  expect(loginUrl.searchParams.get('redirect')).toBe(`/eventos/${event.id}`);
  expect(loginUrl.searchParams.get('autoRegister')).toBe('true');

  await page.getByLabel('Correo electrónico').fill(user.email);
  await page.getByLabel('Contraseña').fill('contraseña-e2e-segura');
  await page.getByRole('button', { name: /ingresar/ }).click();

  await expect(
    page.getByRole('dialog', { name: '¡Te has inscrito exitosamente! 🎉' }),
  ).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/eventos/${event.id}$`));
  await expect(registeredNotice(page)).toBeVisible();
  expect(await db.eventRegistration.count(activeRegistration(event.id, user.id))).toBe(1);
});

test('TC-EVT-003 Evento lleno: sumarse a la lista de espera', async ({ page, db }) => {
  const [user, registered, waiting] = [
    await createUser(db, PREFIX),
    await createUser(db, PREFIX),
    await createUser(db, PREFIX),
  ];
  const event = await createEvent(db, PREFIX, { capacity: 1 });
  await register(db, event.id, [registered]);
  await waitlist(db, event.id, [waiting]);

  await openEventAs(page, user, event.id);
  await expect(fullNotice(page)).toBeVisible();
  await expect(page.getByText('1 persona espera un lugar.', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'unirmeAListaDeEspera();' }).click();

  // La página de detalle confirma con un diálogo (el toast "Te sumaste a la lista de espera (#N)"
  // del caso manual solo sale cuando el botón se usa sin diálogo)
  const dialog = page.getByRole('dialog', { name: 'Estás en la lista de espera' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('#2');
  await dialog.getByRole('button', { name: 'entendido();' }).click();

  await expect(page.getByText('Estás en la lista de espera · lugar #2')).toBeVisible();
  await expect(page.getByRole('button', { name: 'salirDeLaListaDeEspera();' })).toBeVisible();

  const entry = await db.eventWaitlistEntry.findFirstOrThrow({
    where: { eventId: event.id, userId: user.id },
  });
  expect(entry.cancelledAt).toBeNull();
  expect(entry.promotedAt).toBeNull();
  expect(await db.eventRegistration.count(activeRegistration(event.id, user.id))).toBe(0);
});

test('TC-EVT-004 Al cancelar una inscripción sube el primero de la lista de espera', async ({
  page,
  db,
}) => {
  const [user, first, second, third] = [
    await createUser(db, PREFIX),
    await createUser(db, PREFIX),
    await createUser(db, PREFIX),
    await createUser(db, PREFIX),
  ];
  const event = await createEvent(db, PREFIX, { capacity: 1 });
  await register(db, event.id, [user]);
  await waitlist(db, event.id, [first, second, third]);

  await openEventAs(page, user, event.id);
  await page.getByRole('button', { name: 'cancelarInscripcion();' }).click();
  await expect(page.getByText('Inscripción cancelada exitosamente')).toBeVisible();

  // FIFO: el #1 queda inscripto, los demás siguen esperando
  await expect
    .poll(() => db.eventRegistration.count(activeRegistration(event.id, first.id)))
    .toBe(1);
  expect(await db.eventRegistration.count(activeRegistration(event.id, user.id))).toBe(0);
  expect(await db.eventRegistration.count(activeRegistration(event.id, second.id))).toBe(0);
  const promoted = await db.eventWaitlistEntry.findFirstOrThrow({
    where: { eventId: event.id, userId: first.id },
  });
  expect(promoted.promotedAt).not.toBeNull();

  // El email de "Conseguiste un lugar" no se puede leer en la suite (EMAIL_TRANSPORT=json); los
  // admins sí reciben la notificación de la promoción
  await expect
    .poll(() =>
      db.notification.count({
        where: { type: 'event_waitlist_promoted', message: { contains: first.name } },
      }),
    )
    .toBeGreaterThan(0);

  // El resto de la lista avanza un lugar: second es ahora el #1 y third el #2
  const stillWaiting = await db.eventWaitlistEntry.findMany({
    where: { eventId: event.id, cancelledAt: null, promotedAt: null },
    orderBy: { createdAt: 'asc' },
  });
  expect(stillWaiting.map((entry) => entry.userId)).toEqual([second.id, third.id]);

  // El lugar liberado ya lo tomó el #1: el evento sigue lleno para quien canceló
  await expect(page.getByRole('button', { name: 'unirmeAListaDeEspera();' })).toBeVisible();
  await page.context().clearCookies();
  await page.goto(`/eventos/${event.id}`);
  await expect(page.getByText(/^2 personas esperan un lugar\./)).toBeVisible();
});

test('TC-EVT-006 Doble clic en inscribirme no duplica la inscripción', async ({ page, db }) => {
  const user = await createUser(db, PREFIX);
  const event = await createEvent(db, PREFIX, { capacity: 10 });

  await openEventAs(page, user, event.id);
  await page.getByRole('button', { name: 'inscribirme();' }).dblclick();

  await expect(
    page.getByRole('dialog', { name: '¡Te has inscrito exitosamente! 🎉' }),
  ).toBeVisible();
  expect(await db.eventRegistration.count({ where: { eventId: event.id, userId: user.id } })).toBe(
    1,
  );
  expect(await db.eventWaitlistEntry.count({ where: { eventId: event.id } })).toBe(0);
});

test('TC-EVT-007 Evento con inscripción externa', async ({ page, db }) => {
  const externalUrl = 'https://example.com/e2e-evt-inscripcion-externa';
  const user = await createUser(db, PREFIX);
  const event = await createEvent(db, PREFIX, { externalRegistrationUrl: externalUrl });
  // La pestaña externa no sale a internet: responde una página fija
  await page
    .context()
    .route('https://example.com/**', (route) =>
      route.fulfill({ contentType: 'text/html', body: '<h1>Inscripción externa</h1>' }),
    );

  await openEventAs(page, user, event.id);

  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'inscribirme();' }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(externalUrl);
  await popup.close();

  // /inscripcion redirige a la URL externa
  await page.goto(`/eventos/${event.id}/inscripcion`);
  await expect(page).toHaveURL(externalUrl);

  // No se crea inscripción interna
  expect(await db.eventRegistration.count({ where: { eventId: event.id } })).toBe(0);
});

test('TC-EVT-008 Evento terminado se muestra como recuerdo', async ({ page }) => {
  await page.goto(`/eventos/${EVENTS.past.id}`);

  await expect(page.getByText(/así fue/)).toBeVisible();
  await expect(page.getByRole('heading', { name: EVENTS.past.name }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'inscribirme();' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'unirmeAListaDeEspera();' })).toHaveCount(0);
  await expect(page.getByText(/lista de espera/i)).toHaveCount(0);
});

test.describe('registration: alternative paths', () => {
  test('anonymous visitors see the register button but no cancel option', async ({ page, db }) => {
    const event = await createEvent(db, PREFIX, { capacity: 3 });
    await page.goto(`/eventos/${event.id}`);

    await expect(page.getByRole('button', { name: 'inscribirme();' })).toBeVisible();
    await expect(page.getByText('Quedan 3 lugares disponibles.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'cancelarInscripcion();' })).toHaveCount(0);
  });

  test('an event without capacity does not show the remaining spots', async ({ page, db }) => {
    const user = await createUser(db, PREFIX);
    const event = await createEvent(db, PREFIX);

    await openEventAs(page, user, event.id);
    await expect(page.getByRole('button', { name: 'inscribirme();' })).toBeVisible();
    await expect(page.getByText(/lugares disponibles/)).toHaveCount(0);
    await expect(fullNotice(page)).toHaveCount(0);
  });

  test('cancelling and registering again reactivates the same registration', async ({
    page,
    db,
  }) => {
    const user = await createUser(db, PREFIX);
    const event = await createEvent(db, PREFIX, { capacity: 4 });
    await register(db, event.id, [user]);

    await openEventAs(page, user, event.id);
    await page.getByRole('button', { name: 'cancelarInscripcion();' }).click();
    await expect(page.getByText('Inscripción cancelada exitosamente')).toBeVisible();
    await expect(page.getByRole('button', { name: 'inscribirme();' })).toBeVisible();

    const cancelled = await db.eventRegistration.findFirstOrThrow({
      where: { eventId: event.id, userId: user.id },
    });
    expect(cancelled.cancelledAt).not.toBeNull();

    await page.getByRole('button', { name: 'inscribirme();' }).click();
    await expect(
      page.getByRole('dialog', { name: '¡Te has inscrito exitosamente! 🎉' }),
    ).toBeVisible();

    const rows = await db.eventRegistration.findMany({
      where: { eventId: event.id, userId: user.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(cancelled.id);
    expect(rows[0].cancelledAt).toBeNull();
  });

  test('leaving the waitlist frees the place in line', async ({ page, db }) => {
    const [user, registered, behind] = [
      await createUser(db, PREFIX),
      await createUser(db, PREFIX),
      await createUser(db, PREFIX),
    ];
    const event = await createEvent(db, PREFIX, { capacity: 1 });
    await register(db, event.id, [registered]);
    await waitlist(db, event.id, [user, behind]);

    await openEventAs(page, user, event.id);
    await expect(page.getByText('Estás en la lista de espera · lugar #1')).toBeVisible();
    await page.getByRole('button', { name: 'salirDeLaListaDeEspera();' }).click();
    await expect(page.getByText('Saliste de la lista de espera')).toBeVisible();
    await expect(page.getByRole('button', { name: 'unirmeAListaDeEspera();' })).toBeVisible();

    const entry = await db.eventWaitlistEntry.findFirstOrThrow({
      where: { eventId: event.id, userId: user.id },
    });
    expect(entry.cancelledAt).not.toBeNull();
    // Nadie se promueve: el cupo sigue lleno
    expect(
      await db.eventRegistration.count({ where: { eventId: event.id, cancelledAt: null } }),
    ).toBe(1);

    await page.context().clearCookies();
    await page.goto(`/eventos/${event.id}`);
    await expect(page.getByText(/^1 persona espera un lugar\./)).toBeVisible();
  });

  test('an event marked as full sends new people to the waitlist even with free spots', async ({
    page,
    db,
  }) => {
    const user = await createUser(db, PREFIX);
    const event = await createEvent(db, PREFIX, { capacity: 50 });
    await db.event.update({ where: { id: event.id }, data: { markedAsFull: true } });

    await openEventAs(page, user, event.id);
    await expect(fullNotice(page)).toBeVisible();
    await page.getByRole('button', { name: 'unirmeAListaDeEspera();' }).click();

    await expect(page.getByRole('dialog', { name: 'Estás en la lista de espera' })).toBeVisible();
    expect(await db.eventRegistration.count({ where: { eventId: event.id } })).toBe(0);
    expect(
      await db.eventWaitlistEntry.count({ where: { eventId: event.id, userId: user.id } }),
    ).toBe(1);
  });

  test('a past event with an external registration still shows as a memory', async ({
    page,
    db,
  }) => {
    const event = await createEvent(db, PREFIX, {
      daysFromNow: -3,
      externalRegistrationUrl: 'https://example.com/e2e-evt-pasado',
    });
    await page.goto(`/eventos/${event.id}`);
    await expect(page.getByText(/así fue/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'inscribirme();' })).toHaveCount(0);
  });

  test('a missing event shows the not-found message', async ({ page }) => {
    await page.goto('/eventos/e2e-evt-no-existe');
    await expect(page.getByText('No se encontró el evento solicitado.')).toBeVisible();
  });
});
