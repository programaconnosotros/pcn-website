import type { Page } from '@playwright/test';
import { expect as baseExpect, test } from './support/fixtures';
import {
  createUser,
  openBrowserAs,
  signIn,
  uniqueId,
  type CreatedUser,
} from './support/eventos-helpers';

// Administración: páginas protegidas, roles en /usuarios, monitoreo, métricas y vínculos. Los
// tests que cambian algo usan un admin y usuarios propios, nunca el admin sembrado.

const PREFIX = 'e2e-evt-adm';

// El servidor e2e lo comparten varios specs a la vez: las server actions pueden tardar
const expect = baseExpect.configure({ timeout: 25_000 });
test.describe.configure({ timeout: 120_000 });

const ADMIN_PAGES = ['/admin', '/monitoreo', '/analiticas', '/visitas', '/vinculos'];
const ADMIN_SIDEBAR_ITEMS = ['Panel', 'Usuarios', 'Analíticas', 'Visitas', 'Monitoreo', 'Vínculos'];

const expectAdminPagesProtected = async (page: Page) => {
  // Solo importa a dónde redirige: no hace falta esperar a que cargue el inicio entero
  for (const path of ADMIN_PAGES) {
    await page.goto(path, { waitUntil: 'commit' });
    await page.waitForURL((url) => url.pathname === '/', { waitUntil: 'commit' });
  }
  await page.goto('/usuarios', { waitUntil: 'commit' });
  await page.waitForURL((url) => url.pathname === '/miembros');
  await expect(page.getByText(/usuarios registrados/)).toHaveCount(0);

  // El sidebar ya cargó (Changelog es uno de sus links), pero sin la sección de administración
  await expect(page.getByRole('link', { name: 'Changelog', exact: true })).toBeVisible();
  for (const item of ADMIN_SIDEBAR_ITEMS) {
    await expect(page.getByRole('link', { name: item, exact: true })).toHaveCount(0);
  }
};

test.describe('as a regular member', () => {
  test.use({ as: 'member' });

  test('TC-ADM-001 Las páginas de administración están protegidas', async ({
    page,
    browser,
    clientIp,
  }) => {
    await expectAdminPagesProtected(page);

    // Y con la sesión cerrada, lo mismo
    const anonymous = await openBrowserAs(browser, clientIp);
    await expectAdminPagesProtected(anonymous);
    await anonymous.context().close();
  });
});

test.describe('as an admin', () => {
  test.use({ as: 'admin' });

  test('admins see the administration section in the sidebar', async ({ page }) => {
    await page.goto('/admin');
    for (const item of ADMIN_SIDEBAR_ITEMS) {
      await expect(page.getByRole('link', { name: item, exact: true }).first()).toBeVisible();
    }
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('TC-ADM-004 Filtrar logs por nivel', async ({ page }) => {
    await page.goto('/monitoreo?logPage=2');
    // Con logPage en la URL, la página abre en la pestaña de logs
    await expect(page.getByRole('tab', { name: /^logs/ })).toHaveAttribute('aria-selected', 'true');

    await page
      .getByRole('group', { name: 'Filtrar por nivel' })
      .getByRole('button', { name: /^--warn/ })
      .click();
    await page.waitForURL(/logLevel=warn/);
    const url = new URL(page.url());
    expect(url.searchParams.get('logLevel')).toBe('warn');
    expect(url.searchParams.get('logPage')).toBe('1');

    await expect(page.getByText('grep level=warn app.log')).toBeVisible();
    const logs = page.getByRole('tabpanel', { name: /^logs/ });
    const empty = logs.getByText('no hay logs de nivel warn');
    if ((await empty.count()) === 0) {
      // Hay logs de warn: la tabla solo muestra ese nivel
      const levels = await logs.getByRole('row').locator('td:nth-child(3)').allTextContents();
      expect(levels.length).toBeGreaterThan(0);
      expect(new Set(levels)).toEqual(new Set(['warn']));
    } else {
      await expect(empty).toBeVisible();
    }
  });
});

test.describe('with an admin of its own', () => {
  let admin: CreatedUser;

  test.beforeEach(async ({ db }) => {
    admin = await createUser(db, PREFIX, { role: 'ADMIN' });
  });

  /** Filtra la tabla de /usuarios hasta dejar solo a `name`. */
  const findUser = async (page: Page, name: string) => {
    await page.getByLabel('Buscar usuario').fill(name);
    await expect(page.getByRole('link', { name })).toBeVisible();
  };

  test('TC-ADM-002 Dar y quitar roles', async ({ page, db }) => {
    const target = await createUser(db, PREFIX);
    await signIn(page, admin, '/usuarios');
    await page.waitForLoadState('networkidle');
    await findUser(page, target.name);

    const toggle = async (action: 'Dar' | 'Quitar', flag: string, toast: string) => {
      await page.getByTitle(`${action} ${flag} a ${target.name}`).click();
      await expect(page.getByText(`${target.name} ${toast}`)).toBeVisible();
      const flipped = page.getByTitle(
        `${action === 'Dar' ? 'Quitar' : 'Dar'} ${flag} a ${target.name}`,
      );
      await expect(flipped).toHaveAttribute('aria-pressed', String(action === 'Dar'));
      // Mientras guarda, el toggle queda atenuado e ignora los clics: esperar a que termine
      await expect(flipped).toHaveCSS('opacity', '1');
    };
    const saved = () => db.user.findUniqueOrThrow({ where: { id: target.id } });

    await toggle('Dar', 'admin', 'ahora es admin');
    await expect.poll(async () => (await saved()).role).toBe('ADMIN');

    await toggle('Dar', 'ambassador', 'ahora es ambassador');
    await expect.poll(async () => (await saved()).isAmbassador).toBe(true);
    await toggle('Quitar', 'ambassador', 'ya no es ambassador');
    await expect.poll(async () => (await saved()).isAmbassador).toBe(false);

    await toggle('Dar', 'co-founder', 'ahora figura como co-founder');
    await expect.poll(async () => (await saved()).isCofounder).toBe(true);
    await toggle('Quitar', 'co-founder', 'ya no figura como co-founder');
    await expect.poll(async () => (await saved()).isCofounder).toBe(false);

    await toggle('Quitar', 'admin', 'ya no es admin');
    await expect.poll(async () => (await saved()).role).toBe('REGULAR');
  });

  test('an admin cannot remove their own admin role', async ({ page, db }) => {
    await signIn(page, admin, '/usuarios');
    await page.waitForLoadState('networkidle');
    await findUser(page, admin.name);

    await page.getByTitle(`Quitar admin a ${admin.name}`).click();
    // El toggle vuelve a su estado y el rol no cambia
    await expect(page.getByTitle(`Quitar admin a ${admin.name}`)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(
      page
        .getByRole('region', { name: /^Notifications/ })
        .getByRole('listitem')
        .first(),
    ).toBeVisible();
    expect((await db.user.findUniqueOrThrow({ where: { id: admin.id } })).role).toBe('ADMIN');
  });

  test('removing your own admin role explains why it failed', async ({ page }) => {
    // BUG: setUserRole (src/actions/users/set-user-role.ts:13) lanza el motivo con `throw new
    // Error(...)` y user-flag-toggle.tsx muestra `error.message`; en producción ese mensaje no llega
    // al navegador y el toast dice "Minified React error #441; visit https://react.dev/errors/441 …"
    // en vez de "No podés quitarte el rol de admin a vos mismo".
    test.fail();
    await signIn(page, admin, '/usuarios');
    await page.waitForLoadState('networkidle');
    await findUser(page, admin.name);
    await page.getByTitle(`Quitar admin a ${admin.name}`).click();
    await expect(
      page
        .getByRole('region', { name: /^Notifications/ })
        .getByRole('listitem')
        .first(),
    ).toBeVisible();
    await expect(page.getByText('No podés quitarte el rol de admin a vos mismo')).toBeVisible({
      timeout: 3_000,
    });
  });

  test('TC-ADM-003 Un error del sitio llega a monitoreo', async ({ page, db }) => {
    // Provocar un error de render real (cortar la base) no se puede en una suite compartida: el
    // error se registra directo, como lo haría logError
    const message = `Error e2e ${uniqueId(PREFIX)}`;
    const stack = `Error: ${message}\n    at renderEventos (eventos/page.tsx:42:7)`;
    const error = await db.errorLog.create({ data: { message, stack, path: '/eventos' } });

    await signIn(page, admin, '/monitoreo');
    await page.waitForLoadState('networkidle');
    const errors = page.getByRole('tabpanel', { name: /^errores/ });
    await expect(
      errors.getByRole('group', { name: 'Filtrar por estado' }).getByRole('button', {
        name: /^--sin-resolver/,
      }),
    ).toHaveAttribute('aria-pressed', 'true');

    const detailsName = new RegExp(`detalles de ${message}`);
    const row = errors
      .getByRole('row')
      .filter({ has: page.getByRole('button', { name: detailsName }) });
    const details = row.getByRole('button', { name: detailsName });
    await expect(row).toContainText('sin resolver');
    await details.click();
    await expect(errors.getByText('renderEventos (eventos/page.tsx:42:7)')).toBeVisible();

    await row.getByRole('button', { name: `Marcar como resuelto: ${message}` }).click();
    await expect(page.getByText('Error marcado como resuelto')).toBeVisible();
    await expect
      .poll(
        async () => (await db.errorLog.findUniqueOrThrow({ where: { id: error.id } })).resolvedBy,
      )
      .toBe(admin.id);

    // Pasa a "resueltos", con quién lo resolvió en el detalle
    await errors.getByRole('button', { name: /^--resueltos/ }).click();
    await expect(row).toContainText('resuelto');
    await expect(row).not.toContainText('sin resolver');
    if ((await details.getAttribute('aria-expanded')) !== 'true') await details.click();
    await expect(errors.getByText(`por ${admin.name}`)).toBeVisible();
  });

  test('TC-ADM-006 Vincular identidades', async ({ page, db }) => {
    // Un login de GitHub del snapshot que firma entradas del changelog y no está vinculado
    const candidates = ['contrera-lean', 'SpagnoloCarlos', 'MauriJC', 'MatiasDG539', 'FacuBzn'];
    const linked = await db.identityLink.findMany({
      where: { source: 'github', externalName: { in: candidates } },
    });
    const login = candidates.find((name) => !linked.some((link) => link.externalName === name));
    test.skip(!login, 'Todos los logins candidatos ya están vinculados');
    const target = await createUser(db, PREFIX, { name: `Persona ${uniqueId(PREFIX)}` });

    await signIn(page, admin, '/vinculos');
    await page.waitForLoadState('networkidle');
    const github = page
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'github' }) });
    await github.getByLabel('Filtrar github').fill(login!);
    const row = github.getByRole('row').filter({ hasText: login! });
    await row.getByLabel('vincular a…').fill(target.name);
    await page.getByRole('option', { name: new RegExp(target.name) }).click();
    await expect(page.getByText(`${login} → ${target.name}`)).toBeVisible();
    await expect
      .poll(() =>
        db.identityLink.count({
          where: { source: 'github', externalName: login!, userId: target.id },
        }),
      )
      .toBe(1);

    // En el changelog, el autor pasa a linkear al perfil
    await page.goto('/changelog');
    const author = page.getByTitle(`Ver el perfil de ${target.name}`).first();
    await expect(author).toHaveAttribute('href', `/perfil/${target.id}`);
    await expect(author).toHaveText(`@${target.name}`);

    await page.goto('/vinculos');
    await page.waitForLoadState('networkidle');
    await github.getByLabel('Filtrar github').fill(login!);
    await github.getByRole('button', { name: `Desvincular ${login}` }).click();
    await expect(page.getByText(`${login} desvinculado`)).toBeVisible();
    await expect
      .poll(() => db.identityLink.count({ where: { source: 'github', externalName: login! } }))
      .toBe(0);

    await page.goto('/changelog');
    await expect(page.getByTitle(`Ver el perfil de ${target.name}`)).toHaveCount(0);
  });
});

test.describe('public metrics', () => {
  const isoDate = (date: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(date);

  test('TC-ADM-005 Rango de métricas', async ({ page }) => {
    await page.goto('/metricas');
    await page.waitForLoadState('networkidle');
    const ranges = page.getByRole('group', { name: 'Rango de fechas' });
    await ranges.getByRole('button', { name: '90d' }).click();
    await page.waitForURL(/rango=90d/);
    await expect(ranges.getByRole('button', { name: '90d' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    const now = Date.now();
    const from = isoDate(new Date(now - 90 * 86_400_000));
    await expect(
      page.getByText(`metrics --from ${from} --to ${isoDate(new Date(now))}`),
    ).toBeVisible();

    await page.goto('/metricas?desde=2026-01-01&hasta=2026-02-01');
    await expect(page.getByText('metrics --from 2026-01-01 --to 2026-02-01')).toBeVisible();
    await expect(ranges.getByRole('button', { pressed: true })).toHaveCount(0);
    await expect(page.getByLabel('Desde')).toHaveValue('2026-01-01');
    await expect(page.getByLabel('Hasta')).toHaveValue('2026-02-01');
  });

  test('a custom range can be applied from the date inputs', async ({ page }) => {
    await page.goto('/metricas');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Desde').fill('2026-03-01');
    await page.getByLabel('Hasta').fill('2026-03-15');
    await page.getByRole('button', { name: 'aplicar' }).click();
    await page.waitForURL(/desde=2026-03-01&hasta=2026-03-15/);
    await expect(page.getByText('metrics --from 2026-03-01 --to 2026-03-15')).toBeVisible();
  });
});
