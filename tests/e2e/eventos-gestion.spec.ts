import type { Page } from '@playwright/test';
import { storageStatePath, USERS } from './support/data';
import { expect as baseExpect, test } from './support/fixtures';
import {
  createEvent,
  createUser,
  gotoReady,
  register,
  seededUserId,
  signIn,
  uniqueId,
  waitlist,
} from './support/eventos-helpers';

// Eventos: crear, editar, eliminar y gestionar (organizadores, inscripciones, anuncios) con cada
// rol. Los eventos que se tocan son propios del test; los sembrados solo se leen.

const PREFIX = 'e2e-evt';

// El servidor e2e lo comparten varios specs a la vez: las server actions pueden tardar
const expect = baseExpect.configure({ timeout: 25_000 });
test.describe.configure({ timeout: 120_000 });

const DAY = 86_400_000;

/** `YYYY-MM-DDTHH:mm` en la hora local del navegador (Buenos Aires), para un datetime-local. */
const localInput = (date: Date) =>
  new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(date)
    .replace(' ', 'T');

/** Completa los campos obligatorios de un evento presencial. */
const fillInPersonEvent = async (page: Page, name: string) => {
  await page.getByLabel('Nombre del evento').fill(name);
  await page.getByLabel('Descripción').fill('Un evento creado por la suite e2e de eventos.');
  await page
    .getByLabel('Inicio', { exact: true })
    .fill(localInput(new Date(Date.now() + 20 * DAY)));
  await page.getByLabel('Ciudad').fill('Córdoba');
  await page.getByLabel('Nombre del lugar').fill('Cowork E2E');
  await page.getByLabel('Dirección').fill('Calle Falsa 123');
};

/** Espera a que la edición termine y vuelva al detalle del evento. */
const waitForDetail = (page: Page, eventId: string) =>
  page.waitForURL((url) => url.pathname === `/eventos/${eventId}`);

test.describe('as an admin', () => {
  test.use({ as: 'admin' });

  test('TC-EVT-009 Crear un evento presencial', async ({ page, db }) => {
    const name = `Meetup ${uniqueId(PREFIX)}`;
    await gotoReady(page, '/eventos');
    await page.getByRole('link', { name: 'crearEvento();' }).click();
    await page.waitForURL('**/eventos/nuevo');
    await page.waitForLoadState('networkidle');

    await fillInPersonEvent(page, name);
    await page.getByLabel('Cupo máximo').fill('30');
    await page.getByRole('button', { name: 'crearEvento();' }).click();

    await page.waitForURL((url) => /^\/eventos\/(?!nuevo)[^/]+$/.test(url.pathname));
    const eventId = new URL(page.url()).pathname.split('/').pop()!;
    await expect(page.getByRole('heading', { name }).first()).toBeVisible();
    await expect(page.getByText('Quedan 30 lugares disponibles.')).toBeVisible();
    await expect(page.getByRole('link', { name: USERS.admin.name }).first()).toBeVisible();

    const adminId = await seededUserId(db, 'admin');
    const event = await db.event.findUniqueOrThrow({
      where: { id: eventId },
      include: { organizers: true },
    });
    expect(event.name).toBe(name);
    expect(event.capacity).toBe(30);
    expect(event.city).toBe('Córdoba');
    expect(event.createdById).toBe(adminId);
    expect(event.organizers.map((organizer) => organizer.userId)).toEqual([adminId]);
  });

  test('TC-EVT-010 Validaciones del formulario de evento', async ({ page, db }) => {
    const name = 'ab';
    await gotoReady(page, '/eventos/nuevo');

    await page.getByLabel('Nombre del evento').fill(name);
    await page.getByLabel('Descripción').fill('123456789');
    await page.getByLabel('Inicio', { exact: true }).fill(localInput(new Date(Date.now() + DAY)));
    await page.getByLabel('Ciudad').fill('Córdoba');
    await page.getByLabel('Nombre del lugar').fill('Cowork E2E');
    await page.getByLabel('URL corta para flyers').fill('Mi Evento');
    await page.getByRole('button', { name: 'crearEvento();' }).click();

    await expect(page.getByText('El nombre debe tener al menos 3 caracteres')).toBeVisible();
    await expect(page.getByText('La descripción debe tener al menos 10 caracteres')).toBeVisible();
    await expect(page.getByText('La dirección debe tener al menos 5 caracteres')).toBeVisible();
    await expect(page.getByText('Solo minúsculas, números y guiones (sin espacios)')).toBeVisible();
    await expect(page).toHaveURL(/\/eventos\/nuevo$/);

    // Cupo 0: el input numérico (min=1) ya lo frena el navegador; vacío no cuenta como 0
    await page.getByLabel('Cupo máximo').fill('0');
    const capacityValid = await page
      .getByLabel('Cupo máximo')
      .evaluate((input: HTMLInputElement) => input.validity.valid);
    expect(capacityValid).toBe(false);
    await page.getByRole('button', { name: 'crearEvento();' }).click();
    await expect(page).toHaveURL(/\/eventos\/nuevo$/);

    expect(await db.event.count({ where: { name } })).toBe(0);
  });

  test('the capacity must be greater than zero', async ({ page, db }) => {
    const name = `Cupo cero ${uniqueId(PREFIX)}`;
    await gotoReady(page, '/eventos/nuevo');
    await fillInPersonEvent(page, name);
    // Sin la validación nativa del navegador, el esquema muestra su mensaje
    await page.locator('form').evaluate((form: HTMLFormElement) => (form.noValidate = true));
    await page.getByLabel('Cupo máximo').fill('0');
    await page.getByRole('button', { name: 'crearEvento();' }).click();

    await expect(page.getByText('El cupo debe ser un número mayor a 0')).toBeVisible();
    expect(await db.event.count({ where: { name } })).toBe(0);
  });

  test('an end date before the start date is rejected with a clear message', async ({
    page,
    db,
  }) => {
    // BUG: el formulario no valida el fin contra el inicio; lo hace la server action con un
    // `throw new Error(...)` (src/actions/events/create-event.ts:39). En producción ese mensaje no
    // llega al navegador: el toast muestra "Minified React error #441; visit
    // https://react.dev/errors/441 …" (actionErrorMessage no reconoce ese texto) o, a lo sumo, el
    // genérico "Ocurrió un error al crear el evento", nunca "La fecha de finalización debe ser
    // posterior a la fecha de inicio". Lo mismo pasa al editar (update-event.ts:50).
    test.fail();
    const name = `Fechas al revés ${uniqueId(PREFIX)}`;
    await gotoReady(page, '/eventos/nuevo');
    await fillInPersonEvent(page, name);
    await page.getByLabel('Fin (opcional)').fill(localInput(new Date(Date.now() + 19 * DAY)));
    await page.getByRole('button', { name: 'crearEvento();' }).click();

    // La action responde con un toast de error y no crea el evento
    await expect(
      page
        .getByRole('region', { name: /^Notifications/ })
        .getByRole('listitem')
        .filter({ hasNotText: 'Creando evento' }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/eventos\/nuevo$/);
    expect(await db.event.count({ where: { name } })).toBe(0);
    await expect(
      page.getByText('La fecha de finalización debe ser posterior a la fecha de inicio'),
    ).toBeVisible({ timeout: 3_000 });
  });

  test('creating an online event hides the address fields', async ({ page, db }) => {
    const name = `Online ${uniqueId(PREFIX)}`;
    await gotoReady(page, '/eventos/nuevo');
    await page.getByLabel('Nombre del evento').fill(name);
    await page.getByLabel('Descripción').fill('Un evento online creado por la suite e2e.');
    await page
      .getByLabel('Inicio', { exact: true })
      .fill(localInput(new Date(Date.now() + 25 * DAY)));
    await page.getByLabel('Es un evento online').check();
    await expect(page.getByLabel('Dirección')).toHaveCount(0);
    await page.getByLabel('Link de transmisión').fill('https://meet.google.com/e2e-evt');
    await page.getByRole('button', { name: 'crearEvento();' }).click();

    await page.waitForURL((url) => /^\/eventos\/(?!nuevo)[^/]+$/.test(url.pathname));
    await expect(page.getByRole('link', { name: 'ver transmisión' })).toBeVisible();
    const event = await db.event.findFirstOrThrow({ where: { name } });
    expect(event.isOnline).toBe(true);
    expect(event.address).toBeNull();
    expect(event.streamingUrl).toBe('https://meet.google.com/e2e-evt');
  });

  test('TC-EVT-014 Sumar y quitar organizadores', async ({ page, db }) => {
    const adminId = await seededUserId(db, 'admin');
    const event = await createEvent(db, PREFIX, { createdById: adminId, organizerIds: [adminId] });
    // Una persona sembrada: la búsqueda de miembros está cacheada y ya la conoce
    const person = USERS.unverified.name;
    const personId = await seededUserId(db, 'unverified');

    await gotoReady(page, `/eventos/${event.id}/organizadores`);
    await page.getByLabel('sumar organizador por nombre').fill('Sin Verificar');
    await page.getByRole('option', { name: new RegExp(person) }).click();
    await expect(page.getByText(`${person} ahora organiza el evento`)).toBeVisible();
    await expect
      .poll(() => db.eventOrganizer.count({ where: { eventId: event.id, userId: personId } }))
      .toBe(1);

    await page.getByRole('button', { name: `Quitar a ${person}` }).click();
    await expect(page.getByText(`${person} ya no organiza el evento`)).toBeVisible();
    await expect(page.getByRole('button', { name: `Quitar a ${person}` })).toHaveCount(0);
    await expect
      .poll(() => db.eventOrganizer.count({ where: { eventId: event.id, userId: personId } }))
      .toBe(0);
  });

  test('TC-EVT-016 Eliminar un evento', async ({ page, db }) => {
    const event = await createEvent(db, PREFIX, {
      name: `Para borrar ${uniqueId(PREFIX)}`,
      createdById: await seededUserId(db, 'admin'),
    });

    await gotoReady(page, `/eventos/${event.id}/editar`);
    await page.getByRole('button', { name: 'eliminarEvento();' }).click();
    const dialog = page.getByRole('alertdialog', {
      name: '¿Estás seguro de eliminar este evento?',
    });
    await expect(dialog).toContainText(event.name);
    await dialog.getByRole('button', { name: 'Eliminar' }).click();

    await expect(page.getByText('Evento eliminado correctamente')).toBeVisible();
    await page.waitForURL((url) => url.pathname === '/eventos');
    await expect(page.getByRole('link', { name: 'crearEvento();' })).toBeVisible();
    // Recargado, para no depender de la copia del listado que el navegador prefetcheó antes
    await page.reload();
    await expect(page.getByRole('link', { name: 'crearEvento();' })).toBeVisible();
    await expect(page.getByText(event.name)).toHaveCount(0);

    // Soft delete: la fila sigue, con deletedAt
    const deleted = await db.event.findUniqueOrThrow({ where: { id: event.id } });
    expect(deleted.deletedAt).not.toBeNull();
    await page.goto(`/eventos/${event.id}`);
    await expect(page.getByText('No se encontró el evento solicitado.')).toBeVisible();
  });

  test('TC-EVT-018 Anuncios de un evento', async ({ page, db, browser }) => {
    const adminId = await seededUserId(db, 'admin');
    const event = await createEvent(db, PREFIX, { name: `Con anuncios ${uniqueId(PREFIX)}` });
    const older = `Anuncio común ${uniqueId(PREFIX)}`;
    const pinned = `Anuncio fijado ${uniqueId(PREFIX)}`;
    const draft = `Anuncio borrador ${uniqueId(PREFIX)}`;
    // Uno publicado sin fijar, de antes: el fijado tiene que quedar primero igual
    await db.announcement.create({
      data: {
        title: older,
        content: 'Un anuncio publicado y sin fijar.',
        category: 'evento',
        published: true,
        authorId: adminId,
        eventId: event.id,
        createdAt: new Date(Date.now() - DAY),
      },
    });

    const createAnnouncement = async (
      title: string,
      options: { pinned?: boolean; draft?: boolean },
    ) => {
      await page.getByRole('button', { name: 'nuevoAnuncio();' }).click();
      const dialog = page.getByRole('dialog', { name: 'Nuevo anuncio' });
      await dialog.getByLabel('Título').fill(title);
      await dialog.getByLabel('Contenido').fill('Contenido del anuncio de la suite e2e.');
      await dialog.getByLabel('Categoría').click();
      await page.getByRole('option', { name: 'Evento', exact: true }).click();
      if (options.draft) {
        await dialog.getByLabel('Estado').click();
        await page.getByRole('option', { name: 'Borrador' }).click();
      }
      await dialog.getByLabel('Evento relacionado').click();
      await page.getByRole('option', { name: new RegExp(event.name) }).click();
      if (options.pinned) {
        await dialog.getByLabel('Destacar anuncio').click();
        await page.getByRole('option', { name: 'Sí, destacar' }).click();
      }
      await dialog.getByRole('button', { name: 'crearAnuncio();' }).click();
      await expect(page.getByText('Anuncio creado exitosamente')).toBeVisible();
      await expect(dialog).toBeHidden();
    };

    await gotoReady(page, '/anuncios');
    await createAnnouncement(pinned, { pinned: true });
    await createAnnouncement(draft, { draft: true });

    const saved = await db.announcement.findMany({ where: { eventId: event.id } });
    expect(saved.find((a) => a.title === pinned)).toMatchObject({ pinned: true, published: true });
    expect(saved.find((a) => a.title === draft)).toMatchObject({ published: false });

    await page.goto(`/eventos/${event.id}`);
    const section = page
      .getByRole('main')
      .locator('section')
      .filter({ hasText: 'anuncios del evento' });
    await expect(section.getByRole('heading', { level: 4 })).toHaveText([pinned, older]);
    await expect(section).toContainText('destacado');
    await expect(page.getByText(draft)).toHaveCount(0);

    // Un usuario común no puede crear anuncios
    const memberContext = await browser.newContext({ storageState: storageStatePath('member') });
    const memberPage = await memberContext.newPage();
    await memberPage.goto('/anuncios');
    await expect(memberPage.getByText(pinned).first()).toBeVisible();
    await expect(memberPage.getByRole('button', { name: 'nuevoAnuncio();' })).toHaveCount(0);
    await memberContext.close();
  });
});

test.describe('as an organizer of an event someone else created', () => {
  test.use({ as: 'organizer' });

  test('TC-EVT-005 Subir el cupo promueve a la lista de espera', async ({ page, db }) => {
    const organizerId = await seededUserId(db, 'organizer');
    const [registered, first, second, third] = [
      await createUser(db, PREFIX),
      await createUser(db, PREFIX),
      await createUser(db, PREFIX),
      await createUser(db, PREFIX),
    ];
    const event = await createEvent(db, PREFIX, {
      capacity: 1,
      createdById: await seededUserId(db, 'admin'),
      organizerIds: [organizerId],
    });
    await register(db, event.id, [registered]);
    await waitlist(db, event.id, [first, second, third]);

    await gotoReady(page, `/eventos/${event.id}/editar`);
    await expect(page.getByLabel('Cupo máximo')).toHaveValue('1');
    await page.getByLabel('Cupo máximo').fill('3');
    await page.getByRole('button', { name: 'guardarCambios();' }).click();
    await waitForDetail(page, event.id);

    const active = (userId: string) =>
      db.eventRegistration.count({ where: { eventId: event.id, userId, cancelledAt: null } });
    expect(await active(first.id)).toBe(1);
    expect(await active(second.id)).toBe(1);
    expect(await active(third.id)).toBe(0);
    const stillWaiting = await db.eventWaitlistEntry.findMany({
      where: { eventId: event.id, cancelledAt: null, promotedAt: null },
    });
    expect(stillWaiting.map((entry) => entry.userId)).toEqual([third.id]);
    // El email de "Conseguiste un lugar" no se puede leer en la suite; los admins reciben el aviso
    expect(
      await db.notification.count({
        where: { type: 'event_waitlist_promoted', message: { contains: second.name } },
      }),
    ).toBeGreaterThan(0);
  });

  test('TC-EVT-012 Un organizador puede editar pero no borrar', async ({ page, db }) => {
    const event = await createEvent(db, PREFIX, {
      createdById: await seededUserId(db, 'admin'),
      organizerIds: [await seededUserId(db, 'organizer')],
    });
    const newName = `Editado ${uniqueId(PREFIX)}`;

    await gotoReady(page, `/eventos/${event.id}/editar`);
    await expect(page.getByLabel('Nombre del evento')).toHaveValue(event.name);
    await expect(page.getByRole('button', { name: 'eliminarEvento();' })).toHaveCount(0);

    await page.getByLabel('Nombre del evento').fill(newName);
    await page.getByRole('button', { name: 'guardarCambios();' }).click();
    await waitForDetail(page, event.id);
    expect((await db.event.findUniqueOrThrow({ where: { id: event.id } })).name).toBe(newName);
    // A veces la vuelta al detalle muestra todavía el nombre viejo hasta recargar (ver el reporte):
    // se verifica con la página recargada
    await page.reload();
    await expect(page.getByRole('heading', { name: newName }).first()).toBeVisible();
    // Llamar a deleteEvent a mano ("Solo puedes eliminar los eventos que creaste") no se puede
    // desde la UI: lo cubren los tests unitarios de la action
  });

  test('an organizer sees the team but cannot add or remove organizers', async ({ page, db }) => {
    const event = await createEvent(db, PREFIX, {
      createdById: await seededUserId(db, 'admin'),
      organizerIds: [await seededUserId(db, 'organizer')],
    });

    await gotoReady(page, `/eventos/${event.id}`);
    await page.getByRole('link', { name: 'gestionar organizadores →' }).click();
    await page.waitForURL(`**/eventos/${event.id}/organizadores`);
    await expect(page.getByRole('link', { name: USERS.organizer.name }).first()).toBeVisible();
    await expect(page.getByLabel('sumar organizador por nombre')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Quitar a / })).toHaveCount(0);
  });

  test('TC-EVT-015 Gestionar inscripciones como organizador', async ({ page, db }) => {
    const student = await createUser(db, PREFIX, { career: 'Sistemas', studyPlace: 'UTN' });
    const professional = await createUser(db, PREFIX, {
      jobTitle: 'Backend developer',
      enterprise: 'PCN',
    });
    const [first, second] = [await createUser(db, PREFIX), await createUser(db, PREFIX)];
    const event = await createEvent(db, PREFIX, {
      capacity: 2,
      createdById: await seededUserId(db, 'admin'),
      organizerIds: [await seededUserId(db, 'organizer')],
    });
    await register(db, event.id, [student, professional]);
    await waitlist(db, event.id, [first, second]);

    await gotoReady(page, `/eventos/${event.id}/inscripciones`);
    const stat = (label: string) => page.getByText(`// ${label}`, { exact: true }).locator('..');
    await expect(stat('activas').getByText('2', { exact: true })).toBeVisible();
    await expect(stat('estudiantes').getByText('1', { exact: true })).toBeVisible();
    await expect(stat('profesionales').getByText('1', { exact: true })).toBeVisible();
    await expect(stat('en espera').getByText('2', { exact: true })).toBeVisible();

    const waitlistSection = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: /lista de espera · 2/ }) });
    await expect(waitlistSection.getByRole('row').filter({ hasText: first.email })).toContainText(
      '1',
    );
    await expect(waitlistSection.getByRole('row').filter({ hasText: second.email })).toBeVisible();

    await page.getByRole('row').filter({ hasText: professional.email }).getByRole('button').click();
    const dialog = page.getByRole('alertdialog', { name: '¿Eliminar inscripción?' });
    await expect(dialog).toContainText(professional.name);
    await dialog.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Inscripción eliminada exitosamente')).toBeVisible();

    // La baja libera el lugar y lo toma el primero de la lista de espera
    await expect(page.getByRole('heading', { name: /lista de espera · 1/ })).toBeVisible();
    expect(
      await db.eventRegistration.count({ where: { eventId: event.id, userId: professional.id } }),
    ).toBe(0);
    expect(
      await db.eventRegistration.count({
        where: { eventId: event.id, userId: first.id, cancelledAt: null },
      }),
    ).toBe(1);
  });
});

test.describe('as a regular member', () => {
  test.use({ as: 'member' });

  test('TC-EVT-011 Solo admins y embajadores pueden crear eventos', async ({ page }) => {
    await page.goto('/eventos');
    await expect(page.getByRole('link', { name: 'quiero organizar algo' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'quiero organizar algo' })).toHaveAttribute(
      'href',
      /wa\.me/,
    );
    await expect(page.getByRole('link', { name: 'crearEvento();' })).toHaveCount(0);

    await page.goto('/eventos/nuevo');
    await expect(page).toHaveURL(/\/eventos$/);
  });

  test('TC-EVT-013 Rutas de gestión protegidas', async ({ page, db }) => {
    const attendee = await createUser(db, PREFIX);
    const event = await createEvent(db, PREFIX, {
      capacity: 10,
      callForSpeakersEnabled: true,
      createdById: await seededUserId(db, 'admin'),
    });
    await register(db, event.id, [attendee]);

    for (const section of ['editar', 'inscripciones', 'propuestas-de-charlas']) {
      await page.goto(`/eventos/${event.id}/${section}`);
      await expect(page).toHaveURL(new RegExp(`/eventos/${event.id}$`));
      await expect(page.getByText(attendee.email)).toHaveCount(0);
    }
    await expect(page.getByRole('button', { name: 'editarEvento();' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /ver todas/ })).toHaveCount(0);
  });

  test('a member cannot open the organizers page', async ({ page, db }) => {
    const event = await createEvent(db, PREFIX);
    await page.goto(`/eventos/${event.id}/organizadores`);
    await expect(page).toHaveURL(new RegExp(`/eventos/${event.id}$`));
  });
});

test.describe('as an ambassador', () => {
  test('an ambassador creates events and deletes only the ones they created', async ({
    page,
    db,
  }) => {
    const ambassador = await createUser(db, PREFIX, { isAmbassador: true });
    const own = await createEvent(db, PREFIX, {
      createdById: ambassador.id,
      organizerIds: [ambassador.id],
    });
    const someoneElses = await createEvent(db, PREFIX, {
      createdById: await seededUserId(db, 'admin'),
    });

    await signIn(page, ambassador, '/eventos');
    await expect(page.getByRole('link', { name: 'crearEvento();' })).toBeVisible();

    await gotoReady(page, `/eventos/${own.id}/editar`);
    await expect(page.getByRole('button', { name: 'eliminarEvento();' })).toBeVisible();

    // Editar un evento ajeno (sin organizarlo) lo devuelve al detalle
    await page.goto(`/eventos/${someoneElses.id}/editar`);
    await expect(page).toHaveURL(new RegExp(`/eventos/${someoneElses.id}$`));
  });
});

test.describe('anonymous visitors', () => {
  test('management routes send anonymous visitors away', async ({ page, db }) => {
    const event = await createEvent(db, PREFIX);
    await page.goto('/eventos/nuevo');
    await expect(page).toHaveURL(/\/eventos$/);
    await expect(page.getByRole('link', { name: 'crearEvento();' })).toHaveCount(0);

    for (const section of ['editar', 'inscripciones', 'organizadores']) {
      await page.goto(`/eventos/${event.id}/${section}`);
      await expect(page).toHaveURL(new RegExp(`/eventos/${event.id}$`));
    }
  });

  test('TC-EVT-017 Descargar el evento en el calendario', async ({ page, db }) => {
    const event = await createEvent(db, PREFIX, { name: `Calendario ${uniqueId(PREFIX)}` });

    const response = await page.request.get(`/eventos/${event.id}/calendario.ics`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/calendar');
    expect(response.headers()['content-disposition']).toContain(
      `filename="pcn-evento-${event.id}.ics"`,
    );
    const ics = await response.text();
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain(event.name);
    expect(ics).toContain('END:VCALENDAR');

    // El link de la página descarga el mismo archivo
    await gotoReady(page, `/eventos/${event.id}`);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'descargar .ics' }).click();
    expect((await downloadPromise).suggestedFilename()).toBe(`pcn-evento-${event.id}.ics`);

    const missing = await page.request.get('/eventos/no-existe/calendario.ics');
    expect(missing.status()).toBe(404);
  });
});
