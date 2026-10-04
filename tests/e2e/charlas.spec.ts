import type { Page } from '@playwright/test';
import type { PrismaClient } from '../../src/generated/prisma/client';
import { EVENTS } from './support/data';
import {
  expect,
  type Factory,
  fillSignIn,
  signInWithSession,
  test,
  unique,
  SLOW_TEST_TIMEOUT,
} from './support/auth-helpers';

// Propuestas de charlas y el listado de /charlas (TC-CHA-001…007). Cada test arma sus propios
// eventos, usuarios y propuestas, que se borran al terminar.

test.use({ area: 'cha' });
test.describe.configure({ timeout: SLOW_TEST_TIMEOUT });

const proposeUrl = (eventId: string) => `/eventos/${eventId}/proponer-charla`;
const proposalsUrl = (eventId: string) => `/eventos/${eventId}/propuestas-de-charlas`;

const speakerBlock = (page: Page, n: number) =>
  page.getByRole('heading', { name: `Orador ${n}`, exact: true }).locator('xpath=../..');

/** El botón (sin texto, solo el ícono) que quita al orador `n`. */
const removeSpeakerButton = (page: Page, n: number) =>
  page
    .getByRole('heading', { name: `Orador ${n}`, exact: true })
    .locator('xpath=..')
    .getByRole('button');

test('TC-CHA-001 Proponer una charla', async ({ page, factory, db }) => {
  const user = await factory.user({
    phoneNumber: '5493815550000',
    jobTitle: 'Desarrolladora',
    enterprise: 'ACME',
  });
  const event = await factory.event({ callForSpeakersEnabled: true });
  await signInWithSession(db, page.context(), user.id);

  await page.goto(`/eventos/${event.id}`);
  await page.getByRole('link', { name: /proponer →/ }).click();
  await expect(page).toHaveURL(proposeUrl(event.id));

  // El orador 1 viene del perfil
  const first = speakerBlock(page, 1);
  await expect(first.getByLabel('Nombre del orador')).toHaveValue(user.name);
  await expect(first.getByLabel('Teléfono (WhatsApp)')).toHaveValue('5493815550000');
  await expect(first.getByLabel('Soy profesional')).toBeChecked();
  await expect(first.getByLabel('Rol / Puesto')).toHaveValue('Desarrolladora');
  await expect(first.getByLabel('Empresa')).toHaveValue('ACME');

  const title = `Testing de punta a punta ${unique()}`;
  await page.getByLabel('Título de la charla').fill(title);
  await page
    .getByLabel('Descripción de la charla')
    .fill('Cómo escribir tests e2e que no se rompan con cada cambio.');
  await page.getByRole('button', { name: /enviarPropuesta/ }).click();

  await expect(
    page.getByText('¡Propuesta enviada! Nos pondremos en contacto pronto.'),
  ).toBeVisible();
  await expect(page).toHaveURL(`/eventos/${event.id}`);

  const proposal = await db.talkProposal.findFirstOrThrow({
    where: { eventId: event.id },
    include: { speakers: { omit: { speakerPhone: false } } },
  });
  expect(proposal).toMatchObject({ title, userId: user.id, status: 'PENDING' });
  expect(proposal.speakers).toHaveLength(1);
  expect(proposal.speakers[0]).toMatchObject({
    userId: user.id,
    speakerName: user.name,
    speakerPhone: '5493815550000',
    isProfessional: true,
    enterprise: 'ACME',
  });

  const notifications = await db.notification.findMany({
    where: { type: 'talk_proposal_created', metadata: { contains: proposal.id } },
  });
  expect(notifications.length).toBeGreaterThan(0);
  expect(notifications.every((n) => n.title === 'Nueva propuesta de charla')).toBe(true);
  await db.notification.deleteMany({ where: { id: { in: notifications.map((n) => n.id) } } });
});

test('TC-CHA-002 Validaciones de oradores en la propuesta', async ({ page, factory, db }) => {
  const user = await factory.user();
  const event = await factory.event({ callForSpeakersEnabled: true });
  await signInWithSession(db, page.context(), user.id);
  await page.goto(proposeUrl(event.id));

  // Con un solo orador no hay botón para quitarlo
  await expect(removeSpeakerButton(page, 1)).toHaveCount(0);

  await page.getByLabel('Título de la charla').fill('Una charla con datos inválidos');
  await page.getByLabel('Descripción de la charla').fill('Descripción suficientemente larga.');
  const first = speakerBlock(page, 1);
  await first.getByLabel('Teléfono (WhatsApp)').fill('+54 381 123');
  await page.getByRole('button', { name: /enviarPropuesta/ }).click();

  await expect(first.getByText(/^El teléfono debe contener solo dígitos/)).toBeVisible();
  await expect(
    first.getByText('Debés seleccionar al menos una opción: profesional o estudiante'),
  ).toBeVisible();

  await first.getByLabel('Soy profesional').check();
  await first.getByLabel('Rol / Puesto').fill('Backend');
  await page.getByRole('button', { name: /enviarPropuesta/ }).click();
  await expect(first.getByText('La empresa es requerida para profesionales')).toBeVisible();

  await page.getByRole('button', { name: /agregarOrador/ }).click();
  await expect(page.getByRole('heading', { name: 'Orador 2', exact: true })).toBeVisible();
  await expect(removeSpeakerButton(page, 1)).toHaveCount(1);
  await expect(removeSpeakerButton(page, 2)).toHaveCount(1);
  await removeSpeakerButton(page, 2).click();
  await expect(page.getByRole('heading', { name: 'Orador 2', exact: true })).toHaveCount(0);
  await expect(removeSpeakerButton(page, 1)).toHaveCount(0);

  await expect(page).toHaveURL(proposeUrl(event.id));
  expect(await db.talkProposal.count({ where: { eventId: event.id } })).toBe(0);
});

test.describe('call for speakers cerrado', () => {
  test.use({ as: 'member' });

  test('TC-CHA-003 Call for speakers cerrado', async ({ page }) => {
    await page.goto(proposeUrl(EVENTS.online.id));
    await expect(page).toHaveURL(`/eventos/${EVENTS.online.id}`);
    await expect(page.getByRole('link', { name: /proponer →/ })).toHaveCount(0);
  });

  test('proponer en un evento que no existe vuelve a /eventos/[id]', async ({ page }) => {
    await page.goto(proposeUrl('e2e-cha-no-existe'));
    await expect(page).not.toHaveURL(/proponer-charla/);
  });
});

test('TC-CHA-004 Aceptar una propuesta y crear la charla', async ({ page, factory, db }) => {
  const organizer = await factory.user();
  const event = await factory.event({ callForSpeakersEnabled: true, organizerIds: [organizer.id] });
  const proposal = await factory.proposal(event.id, organizer.id);
  await signInWithSession(db, page.context(), organizer.id);

  await page.goto(proposalsUrl(event.id));
  const row = page.getByRole('row', { name: new RegExp(proposal.title) });
  await expect(row.getByText('Pendiente')).toBeVisible();

  await row.getByRole('button', { name: /aceptar/ }).click();
  await expect(page.getByText('Propuesta aceptada')).toBeVisible();
  await expect(row.getByText('Aceptada')).toBeVisible();

  await row.getByRole('button', { name: /crearCharla/ }).click();
  await expect(page.getByText('Charla creada a partir de la propuesta')).toBeVisible();
  const created = row.getByRole('button', { name: '// charla creada' });
  await expect(created).toBeDisabled();

  // No se puede crear otra vez: el botón queda deshabilitado y hay una sola charla
  await page.reload();
  await expect(created).toBeDisabled();
  const talks = await db.talk.findMany({ where: { proposalId: proposal.id } });
  expect(talks).toHaveLength(1);
  expect(talks[0]).toMatchObject({ title: proposal.title, eventId: event.id });

  await page.goto('/charlas');
  await page.getByRole('textbox', { name: /Buscar charlas/ }).fill(proposal.title);
  await expect(page.getByText(proposal.title)).toBeVisible();
});

test.describe('organizador de otro evento', () => {
  // La UI solo muestra las propuestas del propio evento: el request se reescribe con el id de la
  // propuesta ajena, como haría alguien llamando a la server action a mano.
  const setup = async ({
    page,
    factory,
    db,
  }: {
    page: Page;
    factory: Factory;
    db: PrismaClient;
  }) => {
    const organizer = await factory.user();
    const own = await factory.event({ callForSpeakersEnabled: true, organizerIds: [organizer.id] });
    const other = await factory.event({ callForSpeakersEnabled: true });
    const author = await factory.user();
    const ownProposal = await factory.proposal(own.id, author.id);
    const otherProposal = await factory.proposal(other.id, author.id);
    await signInWithSession(db, page.context(), organizer.id);

    await page.route('**/*', async (route) => {
      const request = route.request();
      const body = request.postData();
      if (
        request.method() === 'POST' &&
        request.headers()['next-action'] &&
        body?.includes(ownProposal.id)
      ) {
        await route.continue({ postData: body.replaceAll(ownProposal.id, otherProposal.id) });
        return;
      }
      await route.fallback();
    });
    await page.goto(proposalsUrl(own.id));
    return { ownProposal, otherProposal, other };
  };

  test('TC-CHA-005 Un organizador de otro evento no puede revisar propuestas ajenas', async ({
    page,
    factory,
    db,
  }) => {
    const { ownProposal, otherProposal } = await setup({ page, factory, db });
    const row = page.getByRole('row', { name: new RegExp(ownProposal.title) });

    await row.getByRole('button', { name: /aceptar/ }).click();
    await expect(page.getByText('Propuesta aceptada')).toHaveCount(0);
    expect(
      (await db.talkProposal.findUniqueOrThrow({ where: { id: otherProposal.id } })).status,
    ).toBe('PENDING');

    await row.locator('button[aria-haspopup="dialog"]').click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /eliminar/ })
      .click();
    await expect(page.getByText('Propuesta eliminada')).toHaveCount(0);
    expect(await db.talkProposal.count({ where: { id: otherProposal.id } })).toBe(1);
    expect(
      (await db.talkProposal.findUniqueOrThrow({ where: { id: ownProposal.id } })).status,
    ).toBe('PENDING');
  });

  test('el error al revisar una propuesta ajena explica que no la gestionás', async ({
    page,
    factory,
    db,
  }) => {
    const { ownProposal } = await setup({ page, factory, db });
    const row = page.getByRole('row', { name: new RegExp(ownProposal.title) });
    await row.getByRole('button', { name: /aceptar/ }).click();
    // En producción el mensaje de un error lanzado no llega: el aviso explica la causa probable y
    // nunca muestra el error minificado de React
    await expect(page.getByText(/Revisá que gestiones este evento/)).toBeVisible();
    await expect(page.getByText(/Minified React error/)).toHaveCount(0);
  });

  test('tampoco puede abrir la página de propuestas del otro evento', async ({
    page,
    factory,
    db,
  }) => {
    const { other } = await setup({ page, factory, db });
    await page.goto(proposalsUrl(other.id));
    await expect(page).toHaveURL(`/eventos/${other.id}`);
  });
});

test('TC-CHA-006 Buscar y filtrar charlas', async ({ page, factory }) => {
  const token = `Zq${unique()}`;
  const speaker = (name: string) => ({
    create: [{ speakerName: name, speakerPhone: '5490000000000' }],
  });
  const video = `Charla con video ${token}`;
  const slides = `Charla con slides ${token}`;
  const plain = `Charla sin material ${token}`;
  await factory.talk({
    title: video,
    description: 'Con video.',
    manualEventDate: new Date('2019-05-10T12:00:00Z'),
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    speakers: speaker(`Ada ${token}`),
  });
  await factory.talk({
    title: slides,
    description: 'Con slides.',
    manualEventDate: new Date('2018-03-10T12:00:00Z'),
    slidesUrl: 'https://example.com/slides.pdf',
    speakers: speaker(`Grace ${token}`),
  });
  await factory.talk({
    title: plain,
    description: 'Sin material.',
    manualEventDate: new Date('2018-08-10T12:00:00Z'),
    speakers: speaker(`Linus ${token}`),
  });

  // Las charlas se crearon directo en la base, sin expirar el listado cacheado. Un login de un
  // usuario con hash de costo bajo hace que la app reescriba su fila de User, y eso expira el cache.
  const user = await factory.user();
  await page.goto('/autenticacion/iniciar-sesion');
  await fillSignIn(page, user.email, user.password);
  await expect(page).toHaveURL('/');

  await page.goto('/charlas');
  const search = page.getByRole('textbox', { name: /Buscar charlas/ });
  const filters = page.getByRole('group', { name: 'Filtrar charlas' });
  const all = [video, slides, plain];
  const expectVisible = async (visible: string[]) => {
    for (const title of all) {
      await expect(page.getByText(title, { exact: true })).toHaveCount(
        visible.includes(title) ? 1 : 0,
      );
    }
  };

  await search.fill(token);
  await expectVisible(all);
  await expect(page.getByRole('heading', { name: /## 2019\s*1 charla$/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /## 2018\s*2 charlas$/ })).toBeVisible();

  await search.fill(`Grace ${token}`);
  await expectVisible([slides]);

  await search.fill(token);
  await filters.getByRole('button', { name: 'con video' }).click();
  await expect(filters.getByRole('button', { name: 'con video' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expectVisible([video]);
  await filters.getByRole('button', { name: 'con slides' }).click();
  await expectVisible([slides]);

  await search.fill(`Ada ${token}`);
  await expect(page.getByText(/0 matches/)).toBeVisible();
  await filters.getByRole('button', { name: 'todas' }).click();
  await expectVisible([video]);

  await page.goto('/charlas?tab=externas');
  await expect(page.getByRole('tab', { name: 'Externas' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tab', { name: 'Comunidad' })).toHaveAttribute(
    'aria-selected',
    'false',
  );
});

const talkMenus = (page: Page) =>
  page.locator('section[aria-labelledby^="charlas-"] [aria-haspopup="menu"]');

test.describe('como miembro', () => {
  test.use({ as: 'member' });

  test('TC-CHA-007 Solo admins gestionan charlas desde /charlas', async ({ page }) => {
    await page.goto('/charlas');
    await expect(page.getByText('Charla E2E sobre Playwright')).toBeVisible();
    await expect(page.getByRole('button', { name: /nuevaCharla/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /quiero dar una charla/ })).toBeVisible();
    await expect(talkMenus(page)).toHaveCount(0);
  });
});

test.describe('extra', () => {
  test('anónimo: proponer manda a iniciar sesión y vuelve a la propuesta', async ({
    page,
    factory,
  }) => {
    const event = await factory.event({ callForSpeakersEnabled: true });
    await page.goto(`/eventos/${event.id}`);
    await page.getByRole('link', { name: /proponer →/ }).click();
    await expect(page).toHaveURL(
      `/autenticacion/iniciar-sesion?redirect=/eventos/${event.id}/proponer-charla`,
    );

    const user = await factory.user({ career: 'Sistemas', studyPlace: 'UTN' });
    await fillSignIn(page, user.email, user.password);
    await expect(page).toHaveURL(proposeUrl(event.id));
    await expect(speakerBlock(page, 1).getByLabel('Soy estudiante')).toBeChecked();
  });

  test('anónimo: /charlas no muestra controles de admin', async ({ page }) => {
    await page.goto('/charlas');
    await expect(page.getByText('Charla E2E sobre Playwright')).toBeVisible();
    await expect(page.getByRole('button', { name: /nuevaCharla/ })).toHaveCount(0);
    await expect(talkMenus(page)).toHaveCount(0);
  });

  test('una propuesta con dos oradores los guarda en orden', async ({ page, factory, db }) => {
    const user = await factory.user({
      phoneNumber: '5493815550001',
      career: 'Sistemas',
      studyPlace: 'UTN',
    });
    const event = await factory.event({ callForSpeakersEnabled: true });
    await signInWithSession(db, page.context(), user.id);
    await page.goto(proposeUrl(event.id));

    await page.getByLabel('Título de la charla').fill('Charla a dos voces');
    await page.getByLabel('Descripción de la charla').fill('Dos oradores, una charla.');
    await page.getByRole('button', { name: /agregarOrador/ }).click();
    const second = speakerBlock(page, 2);
    await second.getByLabel('Nombre del orador').fill('Segunda Oradora');
    await second.getByLabel('Teléfono (WhatsApp)').fill('5493815550002');
    await second.getByLabel('Soy profesional').check();
    await second.getByLabel('Rol / Puesto').fill('SRE');
    await second.getByLabel('Empresa').fill('Infra SA');
    await page.getByRole('button', { name: /enviarPropuesta/ }).click();
    await expect(page).toHaveURL(`/eventos/${event.id}`);

    const proposal = await db.talkProposal.findFirstOrThrow({
      where: { eventId: event.id },
      include: { speakers: { orderBy: { order: 'asc' } } },
    });
    expect(proposal.speakers.map((s) => s.speakerName)).toEqual([user.name, 'Segunda Oradora']);
    await db.notification.deleteMany({
      where: { type: 'talk_proposal_created', metadata: { contains: proposal.id } },
    });
  });

  test('rechazar y eliminar una propuesta del propio evento', async ({ page, factory, db }) => {
    const organizer = await factory.user();
    const event = await factory.event({
      callForSpeakersEnabled: true,
      organizerIds: [organizer.id],
    });
    const proposal = await factory.proposal(event.id, organizer.id);
    await signInWithSession(db, page.context(), organizer.id);
    await page.goto(proposalsUrl(event.id));
    const row = page.getByRole('row', { name: new RegExp(proposal.title) });

    await row.getByRole('button', { name: /rechazar/ }).click();
    await expect(page.getByText('Propuesta rechazada')).toBeVisible();
    await expect(row.getByText('Rechazada')).toBeVisible();
    await expect(row.getByRole('button', { name: /rechazar/ })).toBeDisabled();
    await expect(row.getByRole('button', { name: /crearCharla/ })).toHaveCount(0);

    await row.locator('button[aria-haspopup="dialog"]').click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog.getByRole('heading', { name: '¿Eliminar propuesta?' })).toBeVisible();
    await dialog.getByRole('button', { name: /eliminar/ }).click();
    await expect(page.getByText('Propuesta eliminada')).toBeVisible();
    await expect(
      page.getByText('Aún no hay propuestas de charlas para este evento.'),
    ).toBeVisible();
    expect(await db.talkProposal.count({ where: { id: proposal.id } })).toBe(0);
  });

  test.describe('como admin', () => {
    test.use({ as: 'admin' });

    test('el admin ve nuevaCharla(); y los controles de editar y eliminar', async ({ page }) => {
      await page.goto('/charlas');
      await expect(page.getByRole('button', { name: /nuevaCharla/ })).toBeVisible();
      await expect(talkMenus(page).first()).toBeVisible();
      await talkMenus(page).first().click();
      await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: 'Eliminar' })).toBeVisible();
      await page.keyboard.press('Escape');
    });
  });
});
