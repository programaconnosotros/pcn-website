import type { Page } from '@playwright/test';
import { createUser, signIn } from './support/content-helpers';
import { ANNOUNCEMENTS } from './support/data';
import { E2E_BASE_URL } from './support/env';
import { expect as baseExpect, test } from './support/fixtures';

// /lectura: marcas personales (leído / para leer), filtros, el lector embebido, el endpoint de
// embed y el feed RSS. Las marcas se guardan por usuario, así que cada test usa uno propio.

// La base y el servidor se comparten con el resto de la suite: con la máquina cargada, un flujo
// con login y varias acciones del servidor puede pasar los 45 s por defecto.
test.describe.configure({ timeout: 120_000 });
const expect = baseExpect.configure({ timeout: 20_000 });

// Artículos fijos de src/app/(platform)/lectura/articles.ts
const LOOP = {
  id: '1',
  title: 'Loop Engineering',
  url: 'https://addyosmani.com/blog/loop-engineering/',
};
const HARNESS = { id: '2', title: 'Agent Harness Engineering' };
const AGENTIC = {
  id: '3',
  title: 'Agentic Infrastructure',
  url: 'https://vercel.com/blog/agentic-infrastructure',
};

/** La fila de un artículo, por su título. */
const articleRow = (page: Page, title: string) =>
  page.getByRole('article').filter({ has: page.getByRole('button', { name: title, exact: true }) });

const toggle = (page: Page, title: string, label: 'leído' | 'para leer') =>
  articleRow(page, title).getByRole('button', { name: label, exact: true });

/**
 * Activa una marca con sesión iniciada. Las marcas del usuario se cargan después de la página: un
 * click antes de que lleguen se trata como anónimo (toast de login, sin cambios), así que se
 * reintenta hasta que el toggle quede activo.
 */
const mark = async (page: Page, title: string, label: 'leído' | 'para leer') => {
  const button = toggle(page, title, label);
  await expect(async () => {
    if ((await button.getAttribute('aria-pressed')) !== 'true') await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true', { timeout: 1_000 });
  }).toPass();
};

const statusFilter = (page: Page, label: RegExp) =>
  page.getByRole('group', { name: 'Filtrar por estado' }).getByRole('button', { name: label });

const marksOf = (db: Parameters<typeof createUser>[0], userId: string) =>
  db.contentMark.findMany({
    where: { userId, contentType: 'article' },
    select: { contentId: true, mark: true },
    orderBy: { contentId: 'asc' },
  });

test('TC-LEC-001 Marcar artículos como leídos y para leer', async ({
  page,
  db,
  browser,
  clientIp,
}) => {
  test.slow();
  const reader = await createUser(db, 'e2e-lec');
  await signIn(page, reader);
  await page.goto('/lectura');

  await mark(page, LOOP.title, 'leído');
  await mark(page, HARNESS.title, 'para leer');
  await expect
    .poll(() => marksOf(db, reader.id))
    .toEqual([
      { contentId: LOOP.id, mark: 'read' },
      { contentId: HARNESS.id, mark: 'saved' },
    ]);

  await statusFilter(page, /^para leer/).click();
  await expect(page).toHaveURL(/\?lista=para-leer$/);
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(articleRow(page, HARNESS.title)).toBeVisible();

  await page.reload();
  await expect(statusFilter(page, /^para leer/)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(toggle(page, HARNESS.title, 'para leer')).toHaveAttribute('aria-pressed', 'true');

  await statusFilter(page, /^leídos$/).click();
  await expect(page).toHaveURL(/\?lista=leidos$/);
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(toggle(page, LOOP.title, 'leído')).toHaveAttribute('aria-pressed', 'true');

  // Otro dispositivo: una sesión nueva del mismo usuario ve las mismas marcas
  const other = await browser.newContext({
    baseURL: E2E_BASE_URL,
    extraHTTPHeaders: { 'x-forwarded-for': clientIp },
  });
  try {
    // Como la fixture `page`: el sitio clásico, sin el escritorio de PCN OS
    await other.addInitScript(() => localStorage.setItem('pcn-os-mode', 'classic'));
    const otherPage = await other.newPage();
    await signIn(otherPage, reader);
    await otherPage.goto('/lectura?lista=para-leer');
    await expect(toggle(otherPage, HARNESS.title, 'para leer')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(otherPage.getByRole('article')).toHaveCount(1);
  } finally {
    await other.close();
  }
});

test('TC-LEC-002 Marcas sin sesión', async ({ page }) => {
  await page.goto('/lectura');
  await expect(page.getByText('· iniciá sesión para guardar lo que leés')).toBeVisible();

  await toggle(page, LOOP.title, 'leído').click();
  await expect(page.getByText('Iniciá sesión para guardar tu progreso')).toBeVisible();
  await expect(toggle(page, LOOP.title, 'leído')).toHaveAttribute('aria-pressed', 'false');

  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/autenticacion\/iniciar-sesion/);
});

test('TC-LEC-003 Leer un artículo embebido', async ({ page }) => {
  // Si el sitio se deja embeber lo decide el servidor pidiendo el artículo real: acá se simula su
  // respuesta y la del sitio externo, así el test no depende de internet.
  await page.route('**/api/lectura/embed?**', (route) => {
    const url = new URL(route.request().url()).searchParams.get('url');
    return route.fulfill({ json: { embeddable: url === AGENTIC.url } });
  });
  await page.route(AGENTIC.url, (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: '<html><body><h1>Artículo embebido de prueba</h1></body></html>',
    }),
  );

  await page.goto('/lectura');
  await page.getByRole('button', { name: AGENTIC.title, exact: true }).click();
  const reader = page.getByRole('dialog', { name: AGENTIC.title });
  await expect(reader).toBeVisible();
  await expect(reader.getByText('vercel.com')).toBeVisible();
  await expect(
    reader.frameLocator(`iframe[title="${AGENTIC.title}"]`).getByRole('heading', {
      name: 'Artículo embebido de prueba',
    }),
  ).toBeVisible();
  await expect(reader.getByText('no permite mostrarse embebido')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(reader).toBeHidden();

  await page.getByRole('button', { name: LOOP.title, exact: true }).click();
  const blocked = page.getByRole('dialog', { name: LOOP.title });
  await expect(blocked.getByText('addyosmani.com no permite mostrarse embebido')).toBeVisible();
  const open = blocked.getByRole('link', { name: "abrir('addyosmani.com');" });
  await expect(open).toHaveAttribute('href', LOOP.url);
  await expect(open).toHaveAttribute('target', '_blank');
  await expect(blocked.locator('iframe')).toHaveCount(0);
});

test('TC-LEC-004 El endpoint de embed no es un proxy abierto', async ({ request }) => {
  const missing = await request.get('/api/lectura/embed');
  expect(missing.status()).toBe(400);
  expect(await missing.json()).toEqual({ error: 'Missing url parameter' });

  const metadata = await request.get(
    `/api/lectura/embed?url=${encodeURIComponent('http://169.254.169.254/')}`,
  );
  expect(metadata.status()).toBe(400);
  expect(await metadata.json()).toEqual({ error: 'URL not allowed' });

  for (const url of [
    'http://localhost:3300/up',
    'https://example.com/',
    `${LOOP.url}?x=1`,
    'file:///etc/passwd',
  ]) {
    const response = await request.get(`/api/lectura/embed?url=${encodeURIComponent(url)}`);
    expect(response.status(), url).toBe(400);
    expect(await response.json(), url).toEqual({ error: 'URL not allowed' });
  }
});

test('TC-LEC-005 Feed RSS', async ({ request }) => {
  const response = await request.get('/feed.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/rss+xml');

  const xml = await response.text();
  expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
  expect(xml).toContain('<rss version="2.0"');
  expect(xml).toContain('<atom:link href="');
  expect(xml).toContain(`<title>${ANNOUNCEMENTS.published.title}</title>`);
  expect(xml).not.toContain(ANNOUNCEMENTS.draft.title);
  // Solo entran los 30 eventos y charlas más nuevos, y otros specs crean muchos: se chequea el
  // formato, no un evento puntual
  expect(xml).toMatch(/<title>Evento: [^<]+<\/title>/);
  expect(xml).toMatch(/<title>Charla: [^<]+<\/title>/);
  expect(xml).toContain('<category>Anuncios</category>');
  expect(xml).toContain('<category>Eventos</category>');
  expect(xml).toContain('<category>Charlas</category>');

  // Bien formado: cada item cierra y tiene título, link, guid y fecha
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  expect(items.length).toBeGreaterThan(3);
  for (const item of items) {
    expect(item).toMatch(/<title>[^<]+<\/title>/);
    expect(item).toMatch(/<link>https?:\/\/[^<]+<\/link>/);
    expect(item).toMatch(/<guid isPermaLink="false">[^<]+<\/guid>/);
    expect(item).toMatch(/<pubDate>\w{3}, \d{2} \w{3} \d{4} [\d:]{8} GMT<\/pubDate>/);
  }
});

test('marking a saved article as read takes it off the reading list', async ({ page, db }) => {
  const reader = await createUser(db, 'e2e-lec');
  await signIn(page, reader);
  await page.goto('/lectura');

  await mark(page, LOOP.title, 'para leer');
  await expect(statusFilter(page, /^para leer\s*\[1\]$/)).toBeVisible();
  await expect.poll(() => marksOf(db, reader.id)).toEqual([{ contentId: LOOP.id, mark: 'saved' }]);

  await mark(page, LOOP.title, 'leído');
  await expect(toggle(page, LOOP.title, 'para leer')).toHaveCount(0);
  await expect.poll(() => marksOf(db, reader.id)).toEqual([{ contentId: LOOP.id, mark: 'read' }]);

  // Desmarcar como leído borra la marca
  await toggle(page, LOOP.title, 'leído').click();
  await expect(toggle(page, LOOP.title, 'leído')).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => marksOf(db, reader.id)).toEqual([]);
});

test('an empty reading list says how to fill it', async ({ page, db }) => {
  const reader = await createUser(db, 'e2e-lec');
  await signIn(page, reader);
  await page.goto('/lectura?lista=para-leer');
  await expect(statusFilter(page, /^para leer/)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/tu lista está vacía/)).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);

  await statusFilter(page, /^todos$/).click();
  await expect(page).toHaveURL(/\/lectura$/);
  await expect(articleRow(page, LOOP.title)).toBeVisible();
});

test('search narrows the articles and says when nothing matches', async ({ page }) => {
  await page.goto('/lectura');
  const search = page.getByLabel('Buscar por título, autor o descripción');

  await search.fill('Loop Engineering');
  await expect(articleRow(page, LOOP.title)).toBeVisible();
  await expect(articleRow(page, HARNESS.title)).toHaveCount(0);

  // También busca por autor
  await search.fill('Addy Osmani');
  await expect(articleRow(page, HARNESS.title)).toBeVisible();
  await expect(articleRow(page, AGENTIC.title)).toHaveCount(0);

  await search.fill('zzz-no-existe-e2e');
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByText(/no hay artículos con esos filtros/)).toBeVisible();
});

test('the category histogram filters the articles', async ({ page }) => {
  await page.goto('/lectura');
  const category = page.getByRole('button', { name: /^#arquitectura/i });
  await category.click();
  await expect(category).toHaveAttribute('aria-pressed', 'true');
  await expect(articleRow(page, AGENTIC.title)).toBeVisible();
  await expect(articleRow(page, LOOP.title)).toHaveCount(0);

  await page.getByRole('button', { name: /^#todas/i }).click();
  await expect(articleRow(page, LOOP.title)).toBeVisible();
});

test('the books tab lists books and searches them', async ({ page }) => {
  await page.goto('/lectura');
  await page.getByRole('tab', { name: 'Libros' }).click();
  await expect(page.getByRole('tab', { name: 'Libros' })).toHaveAttribute('aria-selected', 'true');
  const panel = page.getByRole('tabpanel');
  await expect(panel.getByRole('heading', { name: 'Clean Code', exact: true })).toBeVisible();

  const search = page.getByLabel('Buscar por título, autor o descripción');
  await search.fill('Pragmatic');
  await expect(
    panel.getByRole('heading', { name: 'The Pragmatic Programmer', exact: true }),
  ).toBeVisible();
  await expect(panel.getByRole('heading', { name: 'Clean Code', exact: true })).toHaveCount(0);

  await search.fill('zzz-no-existe-e2e');
  await expect(
    panel.getByText('No se encontraron libros con los filtros seleccionados.'),
  ).toBeVisible();
});

test('anonymous visitors also get the login prompt when saving for later', async ({ page }) => {
  await page.goto('/lectura');
  await toggle(page, HARNESS.title, 'para leer').click();
  await expect(page.getByText('Iniciá sesión para guardar tu progreso')).toBeVisible();
  await expect(toggle(page, HARNESS.title, 'para leer')).toHaveAttribute('aria-pressed', 'false');
});
