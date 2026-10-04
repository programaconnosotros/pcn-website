import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

// /conversaciones: resúmenes de charlas del grupo de WhatsApp, estáticos (src/data). Lo que se
// espera se calcula de los mismos JSON que usa la página o se lee de la UI (los conteos de cada voz).

const DATA_DIR = path.join(process.cwd(), 'src/data/whatsapp-conversations');
const raw: { title: string; date: string; summary: string }[] = readdirSync(DATA_DIR)
  .filter((file) => file.endsWith('.json'))
  .flatMap((file) => JSON.parse(readFileSync(path.join(DATA_DIR, file), 'utf8')));
const TOTAL = raw.length;

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const counter = (page: Page) => page.getByText(new RegExp(`^\\d+/${TOTAL} resultados$`));
const resultCount = async (page: Page) =>
  Number((await counter(page).textContent())!.split('/')[0]);
const search = (page: Page) => page.getByRole('textbox', { name: 'Buscar conversaciones' });
const rows = (page: Page) => page.getByRole('article');
const rowTitle = (page: Page, index: number) =>
  rows(page).nth(index).getByRole('heading').textContent() as Promise<string>;
const dialog = (page: Page) => page.getByRole('dialog');
const dialogHeading = (page: Page, title: string) =>
  dialog(page).getByRole('heading', { name: new RegExp(`^>?${escape(title)}$`) });

/** Los botones de "voces frecuentes": `@Nombre 12`. */
const voices = (page: Page) => page.getByRole('button', { name: /^@.+\d+$/ });

test.beforeEach(async ({ page }) => {
  await page.goto('/conversaciones');
  await expect(counter(page)).toHaveText(`${TOTAL}/${TOTAL} resultados`);
});

test('TC-CNV-001 Buscar conversaciones sin importar acentos', async ({ page }) => {
  // Los nombres de los participantes nunca dicen "programación": alcanza con título y resumen
  const expected = raw.filter((c) =>
    normalize(`${c.title} ${c.summary}`).includes('programacion'),
  ).length;
  expect(expected).toBeGreaterThan(0);

  await search(page).fill('programacion');
  await expect(counter(page)).toHaveText(`${expected}/${TOTAL} resultados`);
  await expect(rows(page)).toHaveCount(expected);
  // El resaltado marca "programación" con tilde aunque la búsqueda no la tenga
  await expect(
    page
      .locator('mark')
      .filter({ hasText: /^programación$/i })
      .first(),
  ).toBeVisible();

  // Con tilde da lo mismo
  await search(page).fill('PROGRAMACIÓN');
  await expect(counter(page)).toHaveText(`${expected}/${TOTAL} resultados`);
});

test('a search with no matches shows 0 resultados and Escape clears it', async ({ page }) => {
  await search(page).fill('zzzqqqxxx');
  await expect(counter(page)).toHaveText(`0/${TOTAL} resultados`);
  await expect(page.getByText('0 resultados para "zzzqqqxxx"')).toBeVisible();
  await expect(rows(page)).toHaveCount(0);

  await search(page).press('Escape');
  await expect(search(page)).toHaveValue('');
  await expect(counter(page)).toHaveText(`${TOTAL}/${TOTAL} resultados`);
});

test('the clear button empties the search and keeps the focus on it', async ({ page }) => {
  await search(page).fill('react');
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  await expect(search(page)).toHaveValue('');
  await expect(search(page)).toBeFocused();
  await expect(counter(page)).toHaveText(`${TOTAL}/${TOTAL} resultados`);
});

test('searching by a participant name without accents finds their conversations', async ({
  page,
}) => {
  const voice = voices(page).first();
  const [, name, count] = (await voice.textContent())!.match(/^@(.+?)(\d+)$/)!;
  await search(page).fill(normalize(name));
  // Puede haber más: el nombre también aparece en algún título o resumen
  expect(await resultCount(page)).toBeGreaterThanOrEqual(Number(count));
});

test('TC-CNV-002 Filtrar por una voz y por muchos participantes', async ({ page }) => {
  const voice = voices(page).first();
  const [, name, count] = (await voice.textContent())!.match(/^@(.+?)(\d+)$/)!;

  await voice.click();
  await expect(voice).toHaveAttribute('aria-pressed', 'true');
  await expect(counter(page)).toHaveText(`${count}/${TOTAL} resultados`);
  const chip = page.getByRole('button', { name: /Quitar filtro de persona/ });
  await expect(chip).toContainText(`--author="${name}"`);

  const flag = page.getByRole('button', { name: /--muchos-participantes/ });
  await flag.click();
  await expect(flag).toHaveAttribute('aria-pressed', 'true');
  // Se combinan: solo conversaciones de esa persona y con 5+ participantes
  const combined = await resultCount(page);
  expect(combined).toBeLessThanOrEqual(Number(count));
  await expect(rows(page)).toHaveCount(combined);
  for (const row of await rows(page).all()) {
    await expect(row.getByText('muchos participantes')).toBeVisible();
    await expect(row.getByRole('button', { name: `@${name}`, exact: true })).toBeVisible();
  }

  // Quitar el chip deja solo el flag
  await chip.click();
  await expect(chip).toBeHidden();
  await expect(voice).toHaveAttribute('aria-pressed', 'false');
  expect(await resultCount(page)).toBeGreaterThanOrEqual(combined);

  // Y sin el flag vuelve a la lista completa
  await flag.click();
  await expect(counter(page)).toHaveText(`${TOTAL}/${TOTAL} resultados`);
});

test('clicking a frequent voice twice toggles the filter off', async ({ page }) => {
  const voice = voices(page).first();
  await voice.click();
  await expect(voice).toHaveAttribute('aria-pressed', 'true');
  await voice.click();
  await expect(voice).toHaveAttribute('aria-pressed', 'false');
  await expect(counter(page)).toHaveText(`${TOTAL}/${TOTAL} resultados`);
});

test.describe('direct links', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('TC-CNV-003 Link directo a una conversación', async ({ page, context }) => {
    const title = await rowTitle(page, 3);
    await rows(page).nth(3).getByRole('heading').getByRole('button').click();
    await expect(dialogHeading(page, title)).toBeVisible();

    await dialog(page).getByRole('button', { name: 'Copiar link para compartir' }).click();
    await expect(dialog(page).getByRole('button', { name: 'Link copiado' })).toBeVisible();
    const link = await page.evaluate(() => navigator.clipboard.readText());
    const hash = (await dialog(page)
      .getByText(/^~\/conversaciones\/[0-9a-f]{7}$/)
      .textContent())!.split('/')[2];
    expect(link).toMatch(new RegExp(`/conversaciones\\?c=${hash}$`));

    // El link abre ese diálogo sobre la lista completa en otra pestaña y saca ?c=
    const other = await context.newPage();
    await other.goto(link);
    await expect(dialogHeading(other, title)).toBeVisible();
    await expect(dialog(other).getByText(`/${TOTAL}]`)).toBeVisible();
    await expect(other).toHaveURL(/\/conversaciones$/);

    // Un hash inexistente solo limpia el parámetro
    await other.goto('/conversaciones?c=no-existe');
    await expect(counter(other)).toHaveText(`${TOTAL}/${TOTAL} resultados`);
    await expect(other).toHaveURL(/\/conversaciones$/);
    await expect(dialog(other)).toBeHidden();
  });
});

test('a deep link keeps the rest of the query string', async ({ page }) => {
  const title = await rowTitle(page, 0);
  await rows(page).first().getByRole('heading').getByRole('button').click();
  const hash = (await dialog(page)
    .getByText(/^~\/conversaciones\/[0-9a-f]{7}$/)
    .textContent())!.split('/')[2];

  await page.goto(`/conversaciones?c=${hash}&utm=x`);
  await expect(dialogHeading(page, title)).toBeVisible();
  await expect(page).toHaveURL(/\/conversaciones\?utm=x$/);
});

test('TC-CNV-004 Navegar el diálogo con el teclado', async ({ page }) => {
  const titles = await Promise.all([0, 1, 2].map((i) => rowTitle(page, i)));
  await rows(page).nth(1).getByRole('heading').getByRole('button').click();
  await expect(dialogHeading(page, titles[1])).toBeVisible();

  await page.keyboard.press('ArrowRight');
  await expect(dialogHeading(page, titles[2])).toBeVisible();
  await expect(dialog(page).getByText(`/${TOTAL}]`)).toContainText(
    `[${String(3).padStart(String(TOTAL).length, '0')}/`,
  );

  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(dialogHeading(page, titles[0])).toBeVisible();
  // En la primera no hay anterior y ← no hace nada
  await expect(dialog(page).getByRole('button', { name: 'Anterior' })).toBeDisabled();
  await page.keyboard.press('ArrowLeft');
  await expect(dialogHeading(page, titles[0])).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog(page)).toBeHidden();
});

test('the dialog steps through the filtered list only', async ({ page }) => {
  await page.getByRole('button', { name: /--muchos-participantes/ }).click();
  const total = await resultCount(page);
  test.skip(total < 2, 'hacen falta al menos dos conversaciones con muchos participantes');
  const second = await rowTitle(page, 1);

  await rows(page).first().getByRole('heading').getByRole('button').click();
  await expect(dialog(page).getByText(new RegExp(`/${total}\\]$`))).toBeVisible();
  await dialog(page).getByRole('button', { name: 'Siguiente' }).click();
  await expect(dialogHeading(page, second)).toBeVisible();

  await dialog(page).getByRole('button', { name: 'Cerrar' }).click();
  await expect(dialog(page)).toBeHidden();
});

test('clicking a participant inside the dialog closes it and filters by that person', async ({
  page,
}) => {
  const row = rows(page)
    .filter({ has: page.getByRole('button', { name: /^@/ }) })
    .first();
  await row.getByRole('heading').getByRole('button').click();
  const chip = dialog(page).getByRole('button', { name: /^@/ }).first();
  const name = (await chip.textContent())!.slice(1);
  await chip.click();

  await expect(dialog(page)).toBeHidden();
  await expect(page.getByRole('button', { name: /Quitar filtro de persona/ })).toContainText(name);
  expect(await resultCount(page)).toBeLessThan(TOTAL);
});
