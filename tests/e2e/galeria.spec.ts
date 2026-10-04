import { truncate, writeFile } from 'node:fs/promises';
import type { FileChooser, Page } from '@playwright/test';
import type { PrismaClient } from '../../src/generated/prisma/client';
import { createUser, seededUserId, signIn, uniqueId } from './support/content-helpers';
import { EVENTS } from './support/data';
import { expect as baseExpect, test } from './support/fixtures';

// El servidor e2e lo comparten varias suites a la vez (y el primer login de cada usuario nuevo
// regenera su hash con bcrypt, que bloquea el servidor): todo puede tardar más de lo normal
const expect = baseExpect.configure({ timeout: 20_000 });
test.describe.configure({ timeout: 120_000 });
test.use({ actionTimeout: 20_000 });

// Galería (/galeria). Las fotos y videos se crean directo en la base apuntando a archivos de
// /public: así se ven y se descargan sin S3. Las subidas reales (S3) quedan afuera.
//
// Las lecturas de la galería están cacheadas y una escritura desde el test no las vence. Las vistas
// filtradas por un evento o una foto nuevos tienen su propia entrada, pero el listado completo y
// las opciones de los filtros no: para esos tests se inicia sesión con un usuario recién creado,
// cuyo primer login regenera el hash de la contraseña (una escritura en User desde el servidor) y
// vence las lecturas cacheadas de la galería.

const PREFIX = 'e2e-gal';
const PHOTO_FILE = '/IMG_2332.webp';
const DAY = 86_400_000;

const createEvent = async (db: PrismaClient, name: string, daysFromNow = -40) => {
  const admin = await seededUserId(db, 'admin');
  return db.event.create({
    data: {
      id: uniqueId(`${PREFIX}-evt`),
      name,
      description: `Descripción de ${name}.`,
      date: new Date(Date.now() + daysFromNow * DAY),
      city: 'Córdoba',
      placeName: 'Cowork E2E',
      createdById: admin,
    },
  });
};

type ItemData = {
  description?: string;
  eventId?: string | null;
  kind?: 'PHOTO' | 'VIDEO';
  takenAt?: Date;
  src?: string;
  thumbSrc?: string;
  width?: number;
  height?: number;
  tagged?: string[];
};

const createItem = async (db: PrismaClient, data: ItemData = {}) => {
  const id = uniqueId(PREFIX);
  const isVideo = data.kind === 'VIDEO';
  return db.galleryItem.create({
    data: {
      id,
      kind: data.kind ?? 'PHOTO',
      src: data.src ?? (isVideo ? '/videos/e2e.mp4' : PHOTO_FILE),
      thumbSrc: data.thumbSrc ?? PHOTO_FILE,
      mimeType: isVideo ? 'video/mp4' : 'image/webp',
      durationSeconds: isVideo ? 65 : null,
      width: data.width,
      height: data.height,
      takenAt: data.takenAt ?? new Date(Date.now() - 40 * DAY),
      description: data.description,
      eventId: data.eventId ?? null,
      tags: data.tagged?.length ? { create: data.tagged.map((userId) => ({ userId })) } : undefined,
    },
  });
};

const expectToast = (page: Page, text: string) =>
  expect(page.locator('[data-sonner-toast]').filter({ hasText: text })).toBeVisible();

// Los tests de un archivo corren en orden en el mismo worker: al final se borra lo que crearon.
test.afterAll(async ({ db }) => {
  await db.galleryItem.deleteMany({ where: { id: { startsWith: `${PREFIX}-` } } });
  await db.event.deleteMany({ where: { id: { startsWith: `${PREFIX}-evt-` } } });
  await db.user.deleteMany({ where: { email: { startsWith: `${PREFIX}-` } } });
});

test('TC-GAL-005 Filtros de la galería en la URL', async ({ page, db }) => {
  const token = uniqueId('filtro');
  const event = await createEvent(db, `Evento ${token}`);
  const other = await createEvent(db, `Otro ${token}`);
  const person = await createUser(db, PREFIX, { name: `Persona ${token}` });
  const newer = await createItem(db, {
    description: `Foto nueva ${token}`,
    eventId: event.id,
    tagged: [person.id],
    takenAt: new Date(Date.now() - 40 * DAY),
  });
  const older = await createItem(db, {
    description: `Foto vieja ${token}`,
    eventId: event.id,
    tagged: [person.id],
    takenAt: new Date(Date.now() - 41 * DAY),
  });
  const untagged = await createItem(db, {
    description: `Foto sin etiqueta ${token}`,
    eventId: event.id,
  });
  const video = await createItem(db, {
    kind: 'VIDEO',
    description: `Video ${token}`,
    eventId: event.id,
    tagged: [person.id],
  });
  const elsewhere = await createItem(db, {
    description: `Foto de otro evento ${token}`,
    eventId: other.id,
    tagged: [person.id],
  });

  // Vence las opciones cacheadas de los filtros (ver arriba)
  await signIn(page, person);
  await page.goto('/galeria');

  await page.getByRole('group', { name: 'Tipo' }).getByRole('link', { name: 'fotos' }).click();
  await expect(page).toHaveURL(/\/galeria\?tipo=fotos$/);

  await page.getByRole('combobox', { name: 'Filtrar por evento' }).click();
  await page.getByRole('option', { name: new RegExp(`^Evento ${token}`) }).click();
  await expect(page).toHaveURL(`/galeria?tipo=fotos&evento=${event.id}`);

  await page.getByRole('combobox', { name: 'Filtrar por persona' }).click();
  await page.getByRole('option', { name: new RegExp(`^Persona ${token}`) }).click();
  await expect(page).toHaveURL(`/galeria?tipo=fotos&evento=${event.id}&persona=${person.id}`);

  const expectFiltered = async (target: Page) => {
    await expect(target.getByRole('link', { name: `Ver foto: Foto nueva ${token}` })).toBeVisible();
    await expect(target.getByRole('link', { name: `Ver foto: Foto vieja ${token}` })).toBeVisible();
    await expect(target.getByRole('link', { name: /^Ver (foto|video): / })).toHaveCount(2);
    await expect(target.getByText(`Foto sin etiqueta ${token}`)).toHaveCount(0);
    await expect(target.getByText(`Video ${token}`)).toHaveCount(0);
  };
  await expectFiltered(page);

  // La misma URL en otra pestaña restaura los mismos filtros
  const otherTab = await page.context().newPage();
  await otherTab.addInitScript(() => localStorage.setItem('pcn-os-mode', 'classic'));
  await otherTab.goto(page.url());
  await expectFiltered(otherTab);
  await expect(otherTab.getByRole('combobox', { name: 'Filtrar por evento' })).toContainText(
    `Evento ${token}`,
  );
  await expect(otherTab.getByRole('combobox', { name: 'Filtrar por persona' })).toContainText(
    `Persona ${token}`,
  );
  await otherTab.close();

  // Las flechas recorren solo los resultados filtrados, dando la vuelta
  const query = `?tipo=fotos&evento=${event.id}&persona=${person.id}`;
  await page.getByRole('link', { name: `Ver foto: Foto nueva ${token}` }).click();
  await expect(page).toHaveURL(`/galeria/${newer.id}${query}`);
  await expect(page.getByRole('img', { name: `Foto nueva ${token}` })).toBeVisible();
  // Antes de cada tecla se espera a que la foto nueva esté en pantalla: la URL cambia antes que
  // la página, y hasta entonces las flechas siguen apuntando a los vecinos de la anterior
  const step = async (key: 'ArrowLeft' | 'ArrowRight', to: { id: string }, caption: string) => {
    await page.keyboard.press(key);
    await expect(page).toHaveURL(`/galeria/${to.id}${query}`);
    await expect(page.getByRole('img', { name: caption })).toBeVisible();
  };
  await step('ArrowRight', older, `Foto vieja ${token}`);
  await step('ArrowRight', newer, `Foto nueva ${token}`);
  await step('ArrowLeft', older, `Foto vieja ${token}`);

  for (const skipped of [untagged, video, elsewhere]) {
    expect(page.url()).not.toContain(skipped.id);
  }
});

test.describe('anonymous visitor', () => {
  test('TC-GAL-007 Visitante anónimo en una foto', async ({ page, db }) => {
    const photo = await createItem(db, { description: `Foto anónima ${uniqueId('x')}` });

    await page.goto(`/galeria/${photo.id}`);

    await expect(page.getByText('¿Aparecés en la foto?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Iniciá sesión' })).toHaveAttribute(
      'href',
      `/autenticacion/iniciar-sesion?redirect=/galeria/${photo.id}`,
    );
    await expect(page.getByRole('button', { name: 'aparezco en esta foto' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Editar o eliminar' })).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'etiquetar persona' })).toHaveCount(0);
  });

  test('the sign-in link on a photo brings the visitor back to it', async ({ page, db }) => {
    const user = await createUser(db, PREFIX);
    const photo = await createItem(db, { description: `Foto para volver ${uniqueId('x')}` });

    await page.goto(`/galeria/${photo.id}`);
    await page.getByRole('link', { name: 'Iniciá sesión' }).click();
    await page.getByLabel('Correo electrónico').fill(user.email);
    await page.getByLabel('Contraseña').fill(user.password);
    await page.getByRole('button', { name: /ingresar/ }).click();

    await expect(page).toHaveURL(`/galeria/${photo.id}`, { timeout: 60_000 });
    await expect(page.getByRole('button', { name: 'aparezco en esta foto' })).toBeVisible();
  });

  test('downloading a photo that does not exist answers 404', async ({ page }) => {
    const response = await page.request.get(`/api/galeria/${PREFIX}-no-existe/descargar`);
    expect(response.status()).toBe(404);
    expect(await response.text()).toBe('No encontrado');
  });

  test('a photo that does not exist shows the not-found screen', async ({ page }) => {
    // La página hace streaming (loading.tsx), así que el estado HTTP ya salió como 200
    await page.goto(`/galeria/${PREFIX}-no-existe`);
    await expect(
      page.getByText(`bash: cd: /galeria/${PREFIX}-no-existe: No such file or directory`),
    ).toBeVisible();
  });

  test('links from the old static gallery go to /galeria', async ({ page }) => {
    await page.goto('/galeria?foto=12');
    await expect(page).toHaveURL(/\/galeria$/);
  });

  test('the video filter shows only videos and an empty filter offers to see everything', async ({
    page,
    db,
  }) => {
    const token = uniqueId('videos');
    const event = await createEvent(db, `Evento ${token}`);
    const empty = await createEvent(db, `Vacío ${token}`);
    await createItem(db, { description: `Foto ${token}`, eventId: event.id });
    const video = await createItem(db, {
      kind: 'VIDEO',
      description: `Video ${token}`,
      eventId: event.id,
    });

    await page.goto(`/galeria?tipo=videos&evento=${event.id}`);
    await expect(page.getByRole('link', { name: `Ver video: Video ${token}` })).toHaveAttribute(
      'href',
      `/galeria/${video.id}?tipo=videos&evento=${event.id}`,
    );
    await expect(page.getByRole('link', { name: /^Ver (foto|video): / })).toHaveCount(1);
    await expect(page.getByText('1:05')).toBeVisible();

    await page.goto(`/galeria?evento=${empty.id}`);
    await expect(page.getByRole('main').getByText('No hay nada con estos filtros.')).toBeVisible();
    await page.getByRole('link', { name: 'ver todo', exact: true }).click();
    await expect(page).toHaveURL(/\/galeria$/);
  });

  test('searching the gallery narrows the tiles and says when nothing matches', async ({
    page,
    db,
  }) => {
    const token = uniqueId('busqueda');
    const event = await createEvent(db, `Evento ${token}`);
    await createItem(db, { description: `Atardecer ${token}`, eventId: event.id });
    await createItem(db, { description: `Asado ${token}`, eventId: event.id });

    await page.goto(`/galeria?evento=${event.id}`);
    await expect(page.getByRole('link', { name: /^Ver foto: / })).toHaveCount(2);

    const search = page.getByRole('textbox', { name: 'Buscar en la galería' });
    await search.fill('atardecer');
    await expect(page.getByRole('link', { name: /^Ver foto: / })).toHaveCount(1);
    await expect(page.getByRole('link', { name: `Ver foto: Atardecer ${token}` })).toBeVisible();
    await expect(page.getByText(/1\s*\/\s*2\s*coincidencias/)).toBeVisible();

    await search.fill('nada-que-ver-xyz');
    await expect(page.getByText('grep: sin coincidencias para')).toBeVisible();
  });
});

test('TC-GAL-009 Descargar una foto', async ({ page, db }) => {
  // El límite de descargas es por usuario (o por IP sin sesión) y vive en la memoria del
  // servidor: un usuario nuevo arranca con el cupo entero aunque el test se repita
  const user = await createUser(db, PREFIX);
  const photo = await createItem(db, { description: `Foto para bajar ${uniqueId('x')}` });
  const endpoint = `/api/galeria/${photo.id}/descargar`;

  await signIn(page, user);

  await page.goto(`/galeria/${photo.id}`);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Descargar' }).click();
  const download = await downloadPromise;
  // Las fotos de /public se bajan con su nombre; las subidas (S3) son pcn-<fecha>-<id>.webp
  expect(download.suggestedFilename()).toBe('IMG_2332.webp');

  // El límite es de 30 descargas por hora; una ya se usó
  const statuses = await Promise.all(
    Array.from({ length: 29 }, async () => (await page.request.get(endpoint)).status()),
  );
  expect(statuses.every((status) => status === 200)).toBe(true);
  const limited = await page.request.get(endpoint);
  expect(limited.status()).toBe(429);
  expect(Number(limited.headers()['retry-after'])).toBeGreaterThan(0);
  expect(await limited.text()).toContain('Descargaste muchas fotos en poco tiempo');

  await page.getByRole('link', { name: 'Descargar' }).click();
  await expectToast(page, 'Descargaste muchas fotos en poco tiempo');
});

test.describe('signed in as a member', () => {
  test.use({ as: 'member' });

  test('TC-GAL-004 Solo admins pueden subir', async ({ page, db }) => {
    const photo = await createItem(db, { description: `Foto de miembro ${uniqueId('x')}` });

    await page.goto('/galeria');
    await expect(page.getByRole('button', { name: 'subir();' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'seleccionar' })).toHaveCount(0);

    await page.goto('/galeria/subir');
    await expect(page).toHaveURL(/\/$/);

    // Tampoco puede editar ni eliminar una foto
    await page.goto(`/galeria/${photo.id}`);
    await expect(page.getByRole('link', { name: 'Editar o eliminar' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Usar como portada del evento' })).toHaveCount(0);
    await page.goto(`/galeria/${photo.id}/editar`);
    await expect(page).toHaveURL(/\/$/);
  });
});

test('TC-GAL-006 Etiquetarse en una foto', async ({ page, db }) => {
  const user = await createUser(db, PREFIX);
  const other = await createUser(db, PREFIX);
  const description = `Foto para etiquetarse ${uniqueId('x')}`;
  const photo = await createItem(db, { description, tagged: [other.id] });

  await signIn(page, user);
  await page.goto(`/galeria/${photo.id}`);

  // No puede quitar a otras personas
  await expect(page.getByRole('link', { name: other.name })).toBeVisible();
  await expect(page.getByRole('button', { name: `Quitar a ${other.name} de la foto` })).toHaveCount(
    0,
  );

  await page.getByRole('button', { name: 'aparezco en esta foto' }).click();
  await expectToast(page, '¡Listo! Ya aparecés en la foto');
  await expect(page.getByRole('link', { name: user.name })).toBeVisible();
  await expect(page.getByRole('button', { name: 'aparezco en esta foto' })).toHaveCount(0);
  await expect
    .poll(() => db.galleryItemTag.count({ where: { itemId: photo.id, userId: user.id } }))
    .toBe(1);

  await page.goto(`/perfil/${user.id}?tab=fotos`);
  await expect(page.getByRole('img', { name: description })).toBeVisible();

  await page.goto(`/galeria/${photo.id}`);
  await page.getByRole('button', { name: `Quitar a ${user.name} de la foto` }).click();
  await expectToast(page, 'Te quitaste de la foto');
  await expect(page.getByRole('button', { name: 'aparezco en esta foto' })).toBeVisible();
  await expect
    .poll(() => db.galleryItemTag.count({ where: { itemId: photo.id, userId: user.id } }))
    .toBe(0);
  // La etiqueta de la otra persona sigue
  expect(await db.galleryItemTag.count({ where: { itemId: photo.id, userId: other.id } })).toBe(1);
});

test('TC-GAL-008 Edición masiva', async ({ page, db }) => {
  const token = uniqueId('masiva');
  const admin = await createUser(db, PREFIX, { role: 'ADMIN' });
  const person = await createUser(db, PREFIX, { name: `Persona ${token}` });
  const source = await createEvent(db, `Origen ${token}`);
  const target = await createEvent(db, `Destino ${token}`);
  const photos = await Promise.all(
    [1, 2, 3].map((n) =>
      createItem(db, { description: `Masiva ${n} ${token}`, eventId: source.id }),
    ),
  );
  const ids = photos.map((photo) => photo.id);

  // Sesión nueva: vence el listado cacheado y la búsqueda de personas (ver arriba)
  await signIn(page, admin);
  await page.goto('/galeria');
  await page.getByRole('textbox', { name: 'Buscar en la galería' }).fill(token);
  await expect(page.getByRole('link', { name: /^Ver foto: / })).toHaveCount(3);

  await page.getByRole('button', { name: 'seleccionar' }).click();
  for (const n of [1, 2, 3]) {
    await page.getByRole('button', { name: `Seleccionar Masiva ${n} ${token}` }).click();
  }
  const bar = page.getByRole('region', { name: 'Edición masiva' });
  await expect(bar.getByText(/3\s+seleccionados/)).toBeVisible();

  // Moverlas a otro evento
  await bar.getByRole('combobox', { name: 'Evento para los seleccionados' }).click();
  await page.getByRole('option', { name: new RegExp(`^Destino ${token}`) }).click();
  await bar.getByRole('button', { name: 'asignar' }).click();
  await expectToast(page, `3 archivos movidos a Destino ${token}`);
  await expect
    .poll(() => db.galleryItem.count({ where: { id: { in: ids }, eventId: target.id } }))
    .toBe(3);

  // Etiquetar a una persona en las 3
  await bar.getByRole('textbox', { name: 'buscar persona' }).fill(token);
  await page.getByRole('option', { name: new RegExp(`Persona ${token}`) }).click();
  await expectToast(page, `Etiquetaste a Persona ${token} en 3 archivos`);
  await expect
    .poll(() => db.galleryItemTag.count({ where: { itemId: { in: ids }, userId: person.id } }))
    .toBe(3);

  // Cancelar el diálogo no borra nada
  await bar.getByRole('button', { name: 'eliminar' }).click();
  const dialog = page.getByRole('alertdialog', { name: '¿Eliminar 3 archivos?' });
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialog).toBeHidden();
  expect(await db.galleryItem.count({ where: { id: { in: ids } } })).toBe(3);

  // Eliminarlas confirmando
  await bar.getByRole('button', { name: 'eliminar' }).click();
  await dialog.getByRole('button', { name: 'Eliminar' }).click();
  await expectToast(page, '3 archivos eliminados');
  await expect.poll(() => db.galleryItem.count({ where: { id: { in: ids } } })).toBe(0);
  await expect(page.getByRole('link', { name: /^Ver foto: / })).toHaveCount(0);
});

test('an admin tags someone else on a photo and removes them', async ({ page, db }) => {
  const token = uniqueId('etiqueta');
  const admin = await createUser(db, PREFIX, { role: 'ADMIN' });
  const person = await createUser(db, PREFIX, { name: `Persona ${token}` });
  const photo = await createItem(db, { description: `Foto ${token}` });

  await signIn(page, admin);
  await page.goto(`/galeria/${photo.id}`);
  await page.getByRole('textbox', { name: 'etiquetar persona' }).fill(token);
  await page.getByRole('option', { name: new RegExp(`Persona ${token}`) }).click();
  await expectToast(page, `Etiquetaste a Persona ${token}`);
  await expect
    .poll(() => db.galleryItemTag.findFirst({ where: { itemId: photo.id, userId: person.id } }))
    .toMatchObject({ taggedById: admin.id });

  await page.getByRole('button', { name: `Quitar a Persona ${token} de la foto` }).click();
  await expectToast(page, `Quitaste a Persona ${token}`);
  await expect
    .poll(() => db.galleryItemTag.count({ where: { itemId: photo.id, userId: person.id } }))
    .toBe(0);
});

test.describe('signed in as an admin', () => {
  test.use({ as: 'admin' });

  test('TC-GAL-010 Usar una foto como portada del evento', async ({ page, db }) => {
    const token = uniqueId('portada');
    const event = await createEvent(db, `Portada ${token}`);
    // Una apaisada (la portada aleatoria) y una vertical, que solo es portada si se elige
    await createItem(db, {
      description: `Apaisada ${token}`,
      eventId: event.id,
      src: '/IMG_8912.webp',
      width: 1600,
      height: 900,
    });
    const chosenSrc = '/IMG_9143.webp';
    const photo = await createItem(db, {
      description: `Vertical ${token}`,
      eventId: event.id,
      src: chosenSrc,
      width: 900,
      height: 1600,
    });
    const cover = page.locator(`img[src="${chosenSrc}"]`);

    await page.goto(`/galeria/${photo.id}`);
    await page.getByRole('button', { name: 'Usar como portada del evento' }).click();
    await expectToast(page, 'Es la portada del evento');
    await expect(
      page.getByRole('button', { name: 'Quitar como portada del evento' }),
    ).toBeVisible();
    await expect
      .poll(async () => (await db.event.findUnique({ where: { id: event.id } }))?.coverPhotoId)
      .toBe(photo.id);

    await page.goto(`/eventos/${event.id}`);
    await expect(cover).toHaveCount(1);

    await page.goto(`/galeria/${photo.id}`);
    await page.getByRole('button', { name: 'Quitar como portada del evento' }).click();
    await expectToast(page, 'La portada vuelve a ser aleatoria');
    await expect
      .poll(async () => (await db.event.findUnique({ where: { id: event.id } }))?.coverPhotoId)
      .toBeNull();

    await page.goto(`/eventos/${event.id}`);
    await expect(page.locator('img[src="/IMG_8912.webp"]')).toHaveCount(1);
    await expect(cover).toHaveCount(0);
  });

  test('the upload page starts with the event from the URL', async ({ page }) => {
    // La subida en sí va a S3 y no se prueba acá (TC-GAL-001)
    await page.goto(`/galeria/subir?evento=${EVENTS.past.id}`);
    await expect(
      page.getByText('arrastrá fotos y videos o hacé click para elegirlos'),
    ).toBeVisible();
    await expect(page.getByRole('combobox').first()).toContainText(EVENTS.past.name);
  });

  test('TC-GAL-002 Formatos no soportados al subir', async ({ page }, testInfo) => {
    // Un video de 501 MB sin ocupar disco: un archivo disperso
    const bigVideo = testInfo.outputPath('grande.mp4');
    await writeFile(bigVideo, '');
    await truncate(bigVideo, 501 * 1024 * 1024);

    await page.goto('/galeria/subir');
    const pick = async (files: Parameters<FileChooser['setFiles']>[0]) => {
      const chooser = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: /arrastrá fotos y videos/ }).click();
      await (await chooser).setFiles(files);
    };

    await pick({ name: 'foto.heic', mimeType: 'image/heic', buffer: Buffer.from('no es heic') });
    await expect(page.getByText('HEIC no está soportado: exportala como JPG.')).toBeVisible();

    await pick({ name: 'video.avi', mimeType: 'video/x-msvideo', buffer: Buffer.from('avi') });
    await expect(
      page.getByText('Formato de video no soportado: subí MP4, WebM o MOV.'),
    ).toBeVisible();

    await pick(bigVideo);
    await expect(page.getByText('El video pesa más de 500 MB.')).toBeVisible();
  });
});
