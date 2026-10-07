import type { Page } from '@playwright/test';
import { ADVICE, EVENTS, TESTIMONIAL, USERS } from './support/data';
import { expect, test } from './support/fixtures';
import { collectPageErrors } from './support/platform-helpers';

// Regresión de navegación: cada ruta pública de src/app/(platform)/*/page.tsx y src/app/*
// responde 200, muestra un encabezado y no deja errores de consola ni violaciones de CSP.
// Quedan afuera las de admin (/admin, /analiticas, /monitoreo, /usuarios, /visitas, /vinculos),
// las que piden sesión (/perfil, /notificaciones, /eventos/nuevo, /galeria/subir, las de
// organización de un evento) y /agents, que redirige.

const STATIC_ROUTES = [
  '/',
  '/anuncios',
  '/changelog',
  '/charlas',
  '/code-warfare',
  '/consejos',
  '/conversaciones',
  '/cursos',
  '/desarrollo',
  '/desarrollo/calidad',
  '/desarrollo/diseno',
  '/entrevistas',
  '/entrevistas/guias',
  '/entrevistas/live-coding',
  '/especialidades',
  '/eventos',
  '/feed',
  '/galeria',
  '/herramientas',
  '/historia',
  '/influencers',
  '/lectura',
  '/logros',
  '/metricas',
  '/miembros',
  '/music',
  '/partners',
  '/podcast',
  '/preguntas-frecuentes',
  '/proyectos',
  '/series-y-peliculas',
  '/setups',
  '/software-recomendado',
  '/testimonios',
  '/videos',
  '/offline',
  '/autenticacion/iniciar-sesion',
  '/autenticacion/registro',
  '/autenticacion/recuperar-clave',
];

const DYNAMIC_ROUTES = [
  `/eventos/${EVENTS.upcoming.id}`,
  `/eventos/${EVENTS.past.id}`,
  `/eventos/${EVENTS.past.id}/charlas`,
  `/consejos/${ADVICE.id}`,
  `/testimonios/${TESTIMONIAL.id}`,
  '/cursos/claude-code',
  '/entrevistas/guias/node',
];

/**
 * Ruido de afuera del sitio: imágenes de dominios externos que el entorno de test puede no
 * alcanzar. Nada de esto es un error de la página.
 */
const IGNORED_ERRORS = [
  /Failed to load resource: net::ERR_(NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|CONNECTION_REFUSED|BLOCKED_BY_ORB)/,
];

/** Las violaciones de CSP llegan como evento `securitypolicyviolation`; se juntan en window. */
const trackCspViolations = (page: Page) =>
  page.addInitScript(() => {
    const store: string[] = [];
    (window as unknown as { __csp: string[] }).__csp = store;
    document.addEventListener('securitypolicyviolation', (event) =>
      store.push(`${event.violatedDirective} ${event.blockedURI}`),
    );
  });

/** Pantallas sin encabezado: la de sin conexión es una terminal. */
const WITHOUT_HEADING: Record<string, string> = { '/offline': 'ping programaconnosotros.com' };

const visit = async (page: Page, path: string, errors: string[]) => {
  const response = await page.goto(path);
  expect(response?.status(), path).toBe(200);
  if (WITHOUT_HEADING[path]) await expect(page.getByText(WITHOUT_HEADING[path])).toBeVisible();
  else await expect(page.getByRole('heading').first(), path).toBeVisible();
  await expect(page.locator('html[data-app-ready]'), path).toBeAttached();
  const csp = await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
  expect(csp, `${path}: violaciones de CSP`).toEqual([]);
  expect(errors, `${path}: errores de consola`).toEqual([]);
};

test.describe('every public route renders', () => {
  test.describe.configure({ timeout: 60_000 });

  for (const path of [...STATIC_ROUTES, ...DYNAMIC_ROUTES]) {
    test(`${path} renders a heading without errors`, async ({ page }) => {
      await trackCspViolations(page);
      const errors = collectPageErrors(page, IGNORED_ERRORS);
      await visit(page, path, errors);
    });
  }

  test('a member profile renders', async ({ page, db }) => {
    const member = await db.user.findUniqueOrThrow({ where: { email: USERS.member.email } });
    await trackCspViolations(page);
    const errors = collectPageErrors(page, IGNORED_ERRORS);
    await visit(page, `/perfil/${member.id}`, errors);
    await expect(page.getByText(USERS.member.name).first()).toBeVisible();
  });
});

test.describe('signed in routes', () => {
  test.use({ as: 'member' });

  for (const path of ['/perfil', '/notificaciones', '/galeria/subir']) {
    test(`${path} renders for a member`, async ({ page }) => {
      await trackCspViolations(page);
      const errors = collectPageErrors(page, IGNORED_ERRORS);
      await visit(page, path, errors);
    });
  }
});

test.describe('404 handling', () => {
  for (const path of ['/no-existe/de-verdad', '/eventos/x/y/z', '/cursos/no-existe/otra']) {
    test(`${path} answers 404 with the terminal screen`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.getByText(`bash: cd: ${path}: No such file or directory`)).toBeVisible();
      await expect(page.getByRole('link', { name: /cd ~\s*#/ })).toBeVisible();
    });
  }

  test('a missing event shows its own not-found message inside the platform', async ({ page }) => {
    await page.goto('/eventos/no-existe-e2e-plt');
    await expect(page.getByText('No se encontró el evento solicitado.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('404');
  });
});

test.describe('client-side navigation', () => {
  test('the sidebar links navigate without full reloads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html[data-app-ready]')).toBeAttached();
    await page.evaluate(() => ((window as unknown as { __marker: boolean }).__marker = true));
    // El sidebar arranca colapsado (solo íconos): se abre para ver los nombres
    await page.getByRole('button', { name: 'Mostrar barra lateral' }).first().click();
    for (const [name, path] of [
      ['Eventos', '/eventos'],
      ['Cursos', '/cursos'],
      ['Conversaciones', '/conversaciones'],
    ] as const) {
      await page.getByRole('link', { name, exact: true }).filter({ visible: true }).first().click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(path.slice(1));
    }
    // El marcador sigue: fueron navegaciones del cliente
    expect(await page.evaluate(() => (window as unknown as { __marker?: boolean }).__marker)).toBe(
      true,
    );

    await page.goBack();
    await expect(page).toHaveURL(/\/cursos$/);
  });
});
