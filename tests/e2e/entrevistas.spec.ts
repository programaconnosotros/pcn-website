import type { Locator, Page } from '@playwright/test';
import { createPlatformUser, deletePlatformUser, signInAs } from './support/platform-helpers';
import { expect, test } from './support/fixtures';

// /entrevistas: simulador (todo en el cliente), guías con progreso por usuario y live coding.

/** Las opciones del simulador son botones `[ ] Etiqueta hint`. */
const option = (page: Page, label: RegExp) =>
  page.getByRole('main').getByRole('button', { name: label });

const startButton = (page: Page) => page.getByRole('button', { name: /comenzar entrevista/ });

const configPanel = (page: Page) =>
  page.getByText('cat entrevista.conf').locator('xpath=ancestor::*[.//button][1]');

test('TC-ENT-001 Simular una entrevista con el teclado', async ({ page }) => {
  await page.goto('/entrevistas');
  await option(page, /Backend/).click();
  await option(page, /Node\.js.*Express/).click();
  await option(page, /Semi-senior/).click();
  await expect(startButton(page)).toBeEnabled();
  await startButton(page).click();

  const progress = page.getByText(/^pregunta \d+\/\d+$/);
  const total = Number((await progress.textContent())!.split('/')[1]);
  expect(total).toBeGreaterThan(1);

  // Alterna: impares "la sabía" (1), pares "a repasar" (2)
  let toReview = 0;
  for (let i = 0; i < total; i++) {
    await expect(progress).toHaveText(`pregunta ${i + 1}/${total}`);
    await page.keyboard.press(' ');
    await expect(page.getByText('¿la sabías?')).toBeVisible();
    const knewIt = i % 2 === 0;
    if (!knewIt) toReview++;
    await page.keyboard.press(knewIt ? '1' : '2');
  }

  await expect(page.getByText('entrevista terminada', { exact: true })).toBeVisible();
  await expect(
    page.getByText(new RegExp(`^${total - toReview}/${total}\\s*la sabía$`)),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: `repasar ${toReview} ${toReview === 1 ? 'pregunta' : 'preguntas'}`,
    }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: '# a repasar' })).toBeVisible();

  // El desglose por tema va del más flojo al más fuerte
  const topics = page.getByText('grep --count temas').locator('xpath=ancestor::*[.//li][1]');
  const ratios = await topics.getByRole('listitem').evaluateAll((items) =>
    items.map((item) => {
      const [known, of] = item
        .textContent!.match(/(\d+)\/(\d+)$/)!
        .slice(1)
        .map(Number);
      return known / of;
    }),
  );
  expect(ratios.length).toBeGreaterThan(0);
  expect(ratios).toEqual([...ratios].sort((a, b) => a - b));

  // "repasar" arranca otra vez solo con las marcadas con 2
  await page.getByRole('button', { name: /^repasar \d+/ }).click();
  await expect(progress).toHaveText(`pregunta 1/${toReview}`);
});

test('ending an interview early shows how many were answered', async ({ page }) => {
  await page.goto('/entrevistas?tipo=python');
  await option(page, /Junior/).click();
  await startButton(page).click();
  const total = Number((await page.getByText(/^pregunta 1\/\d+$/).textContent())!.split('/')[1]);

  await page.getByRole('button', { name: 'mostrar respuesta' }).click();
  await page.getByRole('button', { name: /la sabía/ }).click();
  await expect(page.getByText(`pregunta 2/${total}`)).toBeVisible();
  await page.getByRole('button', { name: 'terminar entrevista' }).click();

  await expect(page.getByText(`respondiste 1 de ${total} preguntas`)).toBeVisible();
  await expect(page.getByText(/^1\/1\s*la sabía$/)).toBeVisible();
  // Sin preguntas a repasar no hay botón de repaso
  await expect(page.getByRole('button', { name: /^repasar/ })).toHaveCount(0);

  await page.getByRole('button', { name: 'elegir otra entrevista' }).click();
  await expect(startButton(page)).toBeVisible();
});

test('TC-ENT-002 Configuración incompleta del simulador', async ({ page }) => {
  await page.goto('/entrevistas');
  await expect(startButton(page)).toBeDisabled();
  await expect(page.getByText('elegí el tipo y la seniority')).toBeVisible();

  await option(page, /Frontend/).click();
  await expect(page.getByText('elegí la tecnología y la seniority')).toBeVisible();
  await expect(startButton(page)).toBeDisabled();

  await option(page, /React\.js.*hooks/).click();
  await expect(page.getByText('elegí la seniority')).toBeVisible();
  await expect(startButton(page)).toBeDisabled();

  // ?tipo=backend preselecciona el área, pero falta la tecnología
  await page.goto('/entrevistas?tipo=backend');
  await expect(option(page, /Backend/)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('elegí la tecnología y la seniority')).toBeVisible();
});

test('?tipo= with a track or a tool preselects it, and an unknown one selects nothing', async ({
  page,
}) => {
  await page.goto('/entrevistas?tipo=python');
  await expect(option(page, /Backend/)).toHaveAttribute('aria-pressed', 'true');
  await expect(option(page, /Python.*Django/)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('elegí la seniority')).toBeVisible();

  await page.goto('/entrevistas?tipo=figma');
  await expect(option(page, /Diseño UX\/UI/)).toHaveAttribute('aria-pressed', 'true');
  await expect(option(page, /^\[x\]\s*Figma/)).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/entrevistas?tipo=cobol');
  await expect(page.getByText('elegí el tipo y la seniority')).toBeVisible();
});

test('TC-ENT-003 Quality engineering exige herramientas si incluye automatización', async ({
  page,
}) => {
  await page.goto('/entrevistas');
  await option(page, /Quality engineering/).click();
  await option(page, /Incluye automatizado/).click();
  await option(page, /Semi-senior/).click();
  await expect(page.getByText('elegí al menos una herramienta')).toBeVisible();
  await expect(startButton(page)).toBeDisabled();

  for (const tool of [/Cypress/, /Playwright/, /k6/])
    await expect(option(page, tool)).toBeVisible();
  await option(page, /Playwright/).click();
  await expect(startButton(page)).toBeEnabled();

  // Desmarcarla vuelve a bloquear
  await option(page, /Playwright/).click();
  await expect(startButton(page)).toBeDisabled();

  // Solo manual no pide herramientas
  await option(page, /Solo manual/).click();
  await expect(startButton(page)).toBeEnabled();
});

test('the config panel counts the questions of the chosen interview', async ({ page }) => {
  await page.goto('/entrevistas?tipo=node');
  await option(page, /Senior/)
    .last()
    .click();
  await expect(page.getByText(/^\d+ preguntas$/)).toBeVisible();
  await expect(page.getByText('temas que entran')).toBeVisible();
  await expect(configPanel(page).getByText('Node.js', { exact: true })).toBeVisible();
});

/**
 * Navega y espera a que respondan las marcas del usuario (una server action): antes de eso el
 * hook todavía no sabe que hay sesión y marcar muestra el toast de login.
 */
const gotoWithMarks = async (page: Page, url: string, contentType = 'interview-guide') => {
  const marks = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      !!response.request().headers()['next-action'] &&
      response.request().postData() === JSON.stringify([contentType]),
  );
  await page.goto(url);
  await marks;
};

/**
 * Hace clic hasta que aparezca `done`. Las marcas cargan con una server action y, hasta que React
 * aplica la respuesta, un clic muestra el toast de login en vez de marcar.
 */
const clickUntil = async (button: Locator, done: Locator) => {
  await expect(async () => {
    if (!(await done.isVisible())) await button.click();
    await expect(done).toBeVisible({ timeout: 2_000 });
  }).toPass();
};

test.describe('guides progress', () => {
  test('TC-ENT-004 Progreso de lectura en las guías', async ({ page, context, db }) => {
    const user = await createPlatformUser(db, 'e2e-ent');
    try {
      await signInAs(context, db, user.id);

      await page.goto('/entrevistas?tipo=node');
      const panel = page.getByText('cat guias/node').locator('xpath=ancestor::*[.//a][1]');
      await expect(panel.getByRole('link', { name: /empezar la guía/ })).toBeVisible();

      await gotoWithMarks(page, '/entrevistas/guias/node');
      const readButtons = page.getByRole('button', { name: 'marcar como leída y seguir' });
      const sections = await readButtons.count();
      await clickUntil(readButtons.first(), page.getByText(`1/${sections + 1} leídas`));
      await clickUntil(readButtons.first(), page.getByText(`2/${sections + 1} leídas`));
      await expect(page.getByRole('button', { name: 'leída', pressed: true })).toHaveCount(2);

      // Persiste: se guarda en la base y sobrevive a la recarga
      await expect
        .poll(() =>
          db.contentMark.count({ where: { userId: user.id, contentType: 'interview-guide' } }),
        )
        .toBe(2);
      await page.reload();
      await expect(page.getByText(`2/${sections + 1} leídas`)).toBeVisible();

      await page.goto('/entrevistas/guias');
      await expect(page.getByRole('link', { name: /seguir con Backend · Node\.js/ })).toBeVisible();

      await page.goto('/entrevistas?tipo=node');
      await expect(panel.getByRole('link', { name: /seguir leyendo/ })).toBeVisible();
      await expect(panel.getByText(`2/${sections + 1}`)).toBeVisible();

      // Una guía inexistente da la pantalla 404. Es un 404 "blando": /entrevistas tiene
      // loading.tsx, así que el streaming ya mandó el 200 cuando la página llama a notFound()
      await page.goto('/entrevistas/guias/no-existe');
      await expect(
        page.getByText('bash: cd: /entrevistas/guias/no-existe: No such file or directory'),
      ).toBeVisible();
      await expect(page).toHaveTitle('404: no such file or directory');
      await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
    } finally {
      await deletePlatformUser(db, user.id);
    }
  });

  test('unmarking a section as read lowers the progress', async ({ page, context, db }) => {
    const user = await createPlatformUser(db, 'e2e-ent');
    try {
      await signInAs(context, db, user.id);
      await gotoWithMarks(page, '/entrevistas/guias/python');
      const toggle = page.getByRole('button', { name: 'leída' }).first();
      await clickUntil(toggle, page.getByRole('button', { name: 'leída', pressed: true }));
      await expect(page.getByText(/^1\/\d+ leídas$/)).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await expect(page.getByText(/^0\/\d+ leídas$/)).toBeVisible();
      await expect.poll(() => db.contentMark.count({ where: { userId: user.id } })).toBe(0);
    } finally {
      await deletePlatformUser(db, user.id);
    }
  });
});

test('anonymous visitors are invited to sign in to save guide progress', async ({ page }) => {
  await page.goto('/entrevistas/guias/node');
  await expect(
    page.getByText('para marcar las secciones como leídas y guardar tu progreso'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'marcar como leída y seguir' }).first().click();
  await expect(page.getByText('Iniciá sesión para guardar tu progreso')).toBeVisible();
  await expect(page.getByText(/^0\/\d+ leídas$/)).toBeVisible();
});

test('TC-ENT-005 Ejercicios de live coding sin sesión', async ({ page }) => {
  await page.goto('/entrevistas/live-coding?tecnologia=react&seniority=junior');
  const toggle = page.getByRole('button', { name: 'resuelto' }).first();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();

  const toast = page
    .getByRole('listitem')
    .filter({ hasText: 'Iniciá sesión para guardar tu progreso' });
  await expect(toast).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText(/^0\/\d+$/).first()).toBeVisible();

  // La acción del toast lleva al login
  await toast.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page).toHaveURL(/\/autenticacion\/iniciar-sesion/);
});

test('live coding asks for a technology and a seniority before listing exercises', async ({
  page,
}) => {
  await page.goto('/entrevistas/live-coding');
  await expect(page.getByRole('button', { name: 'resuelto' })).toHaveCount(0);
  const react = page.getByRole('link', { name: /React\.js/ }).first();
  await react.click();
  await expect(page).toHaveURL(/tecnologia=react/);
  await expect(react).toHaveAttribute('aria-current', 'true');
  await page.getByRole('link', { name: /Semi-senior/ }).click();
  await expect(page).toHaveURL(/tecnologia=react&seniority=semi-senior/);
  await expect(page.getByRole('heading', { name: /leetcode recomendado/ })).toBeVisible();
});
