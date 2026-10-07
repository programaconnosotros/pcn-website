import type { Page } from '@playwright/test';
import { ADVISE, EVENTS, TESTIMONIAL, USERS } from './support/data';
import { expect, test } from './support/fixtures';
import { createPlatformUser, platformId, signInAs } from './support/platform-helpers';

// Plataforma: 404, atajos de teclado, accesibilidad, responsive, atajos de eventos, health check,
// robots/sitemap y los mensajes de rate limit en producción.

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

/** No hay scroll horizontal de página. */
const horizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test.describe('not found', () => {
  test('TC-PLT-001 Página inexistente', async ({ page }) => {
    const response = await page.goto('/eventos/x/y/z');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByText('bash: cd: /eventos/x/y/z: No such file or directory'),
    ).toBeVisible();
    await expect(page.getByText('[exit 404]')).toBeVisible();
    // El título de la pestaña es el de la terminal (el caso manual decía "Página no encontrada")
    await expect(page).toHaveTitle('404: command not found');
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();

    await expect(page.getByRole('link', { name: /cd ~\s*# volver al inicio/ })).toBeVisible();
    await page.getByRole('link', { name: /cd ~\/eventos/ }).click();
    await expect(page).toHaveURL(/\/eventos$/);
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('eventos', {
      timeout: 30_000,
    });
  });

  test('an unknown top-level path also returns 404 with the terminal screen', async ({
    request,
  }) => {
    const response = await request.get('/esto/no/existe');
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('No such file or directory');
  });
});

test.describe('vim shortcuts', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('TC-PLT-002 Atajos estilo vim', async ({ page }) => {
    await page.goto('/desarrollo');
    await expect(page.locator('html[data-app-ready]')).toBeAttached();
    const body = page.locator('body');

    // j baja, k sube
    await body.press('j');
    await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
    const afterJ = await scrollY(page);
    await body.press('k');
    await expect.poll(() => scrollY(page)).toBeLessThan(afterJ);

    // G baja hasta el final (la página es larga: muy por debajo de un j), gg vuelve arriba
    await body.press('Shift+G');
    await expect.poll(() => scrollY(page)).toBeGreaterThan(afterJ * 5);
    // Las secuencias de dos teclas tienen 600 ms entre una y otra: se tipean de una
    await page.keyboard.type('gg');
    await expect.poll(() => scrollY(page)).toBe(0);

    // yy copia la URL
    await expect(async () => {
      await page.keyboard.type('yy');
      await expect(page.getByText('Link copiado')).toBeVisible({ timeout: 2_000 });
    }).toPass();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/desarrollo$/);

    // ? abre la ayuda
    await body.press('Shift+?');
    const help = page.getByRole('dialog', { name: 'atajos de teclado' });
    await expect(help).toBeVisible();
    await expect(help.getByText('Ir al principio')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(help).toBeHidden();
  });

  test('typing j inside an input writes it instead of scrolling', async ({ page }) => {
    await page.goto('/conversaciones');
    const search = page.getByRole('textbox', { name: 'Buscar conversaciones' });
    await search.click();
    await search.pressSequentially('jjj');
    await expect(search).toHaveValue('jjj');
    expect(await scrollY(page)).toBe(0);
  });
});

test.describe('keyboard', () => {
  test('TC-PLT-003 Navegación completa con teclado', async ({ page }) => {
    // Al cerrar un diálogo con Esc el foco vuelve al botón que lo abrió. Lo demás del caso
    // (Tab, foco visible, trampa de foco, formulario) lo cubre el test siguiente.
    await page.goto('/conversaciones');
    const opener = page.getByRole('article').first().getByRole('heading').getByRole('button');
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused({ timeout: 3_000 });
  });

  test('Tab reaches visible controls, dialogs trap focus and forms work from the keyboard', async ({
    page,
  }) => {
    // Home: Tab llega a controles visibles, siempre con un foco que se ve
    await page.goto('/');
    await expect(page.locator('html[data-app-ready]')).toBeAttached();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
      const style = await focused.evaluate((el) => {
        const css = getComputedStyle(el);
        return { outline: css.outlineStyle, shadow: css.boxShadow, tag: el.tagName };
      });
      expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY']).toContain(style.tag);
      expect(style.outline !== 'none' || style.shadow !== 'none', JSON.stringify(style)).toBe(true);
    }
    // Shift+Tab vuelve
    const forward = await page.locator(':focus').evaluate((el) => el.outerHTML);
    await page.keyboard.press('Shift+Tab');
    expect(await page.locator(':focus').evaluate((el) => el.outerHTML)).not.toBe(forward);

    // Un diálogo atrapa el foco y Esc lo cierra
    await page.goto('/conversaciones');
    const opener = page.getByRole('article').first().getByRole('heading').getByRole('button');
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    // Un formulario se completa y envía solo con el teclado
    await page.goto('/autenticacion/iniciar-sesion');
    await page.getByLabel('Correo electrónico').focus();
    await page.keyboard.type(USERS.scratch.email);
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Contraseña')).toBeFocused();
    await page.keyboard.type('incorrecta-e2e');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Credenciales incorrectas.')).toBeVisible();
    await expect(page).toHaveURL(/\/autenticacion\/iniciar-sesion/);
  });
});

test.describe('icon-only controls', () => {
  for (const path of ['/', '/eventos', '/galeria', '/conversaciones', '/miembros', '/changelog']) {
    test(`every button and link on ${path} has an accessible name`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html[data-app-ready]')).toBeAttached();
      const unnamed = await page.evaluate(() => {
        const controls = document.querySelectorAll<HTMLElement>('a[href], button, [role="button"]');
        const name = (el: HTMLElement) =>
          (
            el.getAttribute('aria-label') ??
            ((el.getAttribute('aria-labelledby')
              ? el
                  .getAttribute('aria-labelledby')!
                  .split(' ')
                  .map((id) => document.getElementById(id)?.textContent ?? '')
                  .join(' ')
              : '') ||
              el.textContent ||
              el.getAttribute('title') ||
              [...el.querySelectorAll('img[alt]')].map((img) => img.getAttribute('alt')).join(' '))
          ).trim();
        return [...controls]
          .filter((el) => el.getClientRects().length > 0 && !el.closest('[aria-hidden="true"]'))
          .filter((el) => !name(el))
          .map((el) => el.outerHTML.slice(0, 160));
      });
      expect(unnamed).toEqual([]);
    });
  }

  test('the collapsed sidebar sign-in links have an accessible name', async ({ page }) => {
    await page.goto('/changelog');
    await expect(page.locator('html[data-app-ready]')).toBeAttached();
    const links = page.locator(
      'a[href="/autenticacion/iniciar-sesion"], a[href="/autenticacion/registro"]',
    );
    for (const link of await links.filter({ visible: true }).all()) {
      await expect(link).toHaveAccessibleName(/.+/, { timeout: 2_000 });
    }
  });

  test('TC-PLT-004 Lector de pantalla en controles con solo ícono', async ({ page }) => {
    await page.goto('/conversaciones');
    const search = page.getByRole('textbox', { name: 'Buscar conversaciones' });
    await search.fill('react');
    await expect(page.getByRole('button', { name: 'Limpiar búsqueda' })).toBeVisible();

    // Los filtros anuncian si están activos
    const flag = page.getByRole('button', { name: /--muchos-participantes/ });
    await expect(flag).toHaveAttribute('aria-pressed', 'false');
    await flag.click();
    await expect(flag).toHaveAttribute('aria-pressed', 'true');

    // El sidebar se abre y cierra con un botón con nombre
    await page.goto('/eventos');
    await expect(page.getByRole('button', { name: /barra lateral/ }).first()).toBeVisible();

    // Las voces destacadas también anuncian si filtran
    await page.goto('/conversaciones');
    const voice = page.getByRole('button', { name: /^@.+\d+$/ }).first();
    await expect(voice).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('responsive', () => {
  const SECTIONS = [
    '/',
    '/eventos',
    '/cursos',
    '/conversaciones',
    '/galeria',
    '/miembros',
    '/changelog',
  ];

  test('TC-PLT-005 Responsive sin scroll horizontal', async ({ page }) => {
    test.setTimeout(150_000);
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of SECTIONS) {
        await page.goto(path);
        await expect(page.getByRole('heading').first()).toBeVisible();
        await expect
          .poll(() => horizontalOverflow(page), { message: `${path} a ${width}px` })
          .toBeLessThanOrEqual(0);
      }
      // Por debajo de 768 px la navegación es la barra de pestañas; arriba, el sidebar
      const tabBar = page.getByRole('navigation', { name: 'Navegación principal' });
      if (width < 768) await expect(tabBar).toBeVisible();
      else await expect(tabBar).toBeHidden();
    }
  });

  test('/entrevistas has no horizontal scroll at 360px', async ({ page }) => {
    // A 360 px "active recall" y las pestañas [simulador][guías][live coding] no entran en una
    // línea: el `action` del PageTitle las baja en vez de scrollear de costado.
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto('/entrevistas');
    await expect(page.locator('html[data-app-ready]')).toBeAttached();
    await expect.poll(() => horizontalOverflow(page), { timeout: 3_000 }).toBeLessThanOrEqual(0);
  });
});

test.describe('event shortcuts', () => {
  test('TC-PLT-006 Atajo de evento', async ({ page, db }) => {
    const shortcut = platformId('e2e-plt-atajo').toLowerCase();
    const DAY = 86_400_000;
    const event = (id: string, daysFromNow: number) =>
      db.event.create({
        data: {
          id,
          name: `Atajo E2E ${id}`,
          description: 'Evento con URL corta de la suite e2e.',
          date: new Date(Date.now() + daysFromNow * DAY),
          isOnline: true,
          streamingUrl: 'https://www.youtube.com/watch?v=e2e',
          shortcut,
        },
      });
    const next = await event(`${shortcut}-proximo`, 5);
    await event(`${shortcut}-despues`, 20);
    await event(`${shortcut}-pasado`, -3);

    await page.goto(`/${shortcut}`);
    await expect(page).toHaveURL(new RegExp(`/eventos/${next.id}$`));

    await page.goto(`/${shortcut.toUpperCase()}`);
    await expect(page).toHaveURL(new RegExp(`/eventos/${next.id}$`));

    await page.goto('/no-existe-atajo');
    await expect(page).toHaveURL(/\/eventos$/);
  });
});

test.describe('infrastructure endpoints', () => {
  test('TC-PLT-007 Health check, robots y sitemap', async ({ request }) => {
    const up = await request.get('/up');
    expect(up.status()).toBe(200);
    expect(await up.json()).toEqual({ status: 'OK' });

    const robots = await (await request.get('/robots.txt')).text();
    for (const path of ['/api/', '/autenticacion/', '/perfil', '/monitoreo', '/eventos/nuevo']) {
      expect(robots).toContain(`Disallow: ${path}`);
    }
    expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/);

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    const xml = await sitemap.text();
    for (const path of ['/eventos', '/conversaciones', '/cursos', '/charlas']) {
      expect(xml).toContain(`${path}</loc>`);
    }
    expect(xml).toContain(`/eventos/${EVENTS.upcoming.id}</loc>`);
    expect(xml).not.toContain('/autenticacion');
    expect(xml).not.toContain('/monitoreo');
  });

  test('a page response carries the security headers and a CSP nonce', async ({ page }) => {
    const response = await page.goto('/eventos');
    const headers = response!.headers();
    expect(headers['strict-transport-security']).toMatch(/max-age=\d{7,}/);
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBeTruthy();

    const csp = headers['content-security-policy'];
    const nonce = csp.match(/'nonce-([^']+)'/)?.[1];
    expect(nonce).toBeTruthy();
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
    // El script inline del <head> lleva ese mismo nonce
    const nonces = await page.evaluate(() =>
      [...document.querySelectorAll('script')].map((script) => script.nonce),
    );
    expect(nonces).toContain(nonce);

    // Cada request recibe un nonce nuevo
    const again = await page.request.get('/eventos');
    expect(again.headers()['content-security-policy']).not.toContain(nonce);
  });
});

test.describe('rate limits', () => {
  test('TC-PLT-008 Mensajes de rate limit visibles en producción', async ({
    page,
    context,
    db,
  }) => {
    test.setTimeout(240_000);
    // Usuario y consejo propios: el límite es por usuario (20 comentarios cada 10 minutos)
    const user = await createPlatformUser(db, 'e2e-plt');
    const advise = await db.advise.create({
      data: {
        id: platformId('e2e-plt-consejo'),
        content: 'Consejo para probar el rate limit.',
        authorId: user.id,
      },
    });
    await signInAs(context, db, user.id);
    await page.goto(`/consejos/${advise.id}`);

    const box = page.getByPlaceholder('Escribe tu comentario...');
    const send = page.getByRole('button', { name: 'enviarComentario();' });
    for (let i = 1; i <= 20; i++) {
      await box.fill(`comentario ${i}`);
      await send.click();
      await expect(box).toHaveValue('');
    }
    await expect.poll(() => db.comment.count({ where: { adviseId: advise.id } })).toBe(20);

    await box.fill('comentario 21');
    await send.click();
    await expect(
      page.getByText(
        /Estás comentando muy seguido\. Para evitar spam hay un límite de comentarios: vas a poder comentar de nuevo en \d+ minutos?\./,
      ),
    ).toBeVisible();
    await expect(page.getByText('Error al crear el comentario')).toHaveCount(0);
    expect(await db.comment.count({ where: { adviseId: advise.id } })).toBe(20);
  });
});

test.skip('TC-PLT-009 Emails en desarrollo', () => {
  // Necesita MailHog (docker-compose) en localhost:18025. La suite e2e manda los emails con
  // EMAIL_TRANSPORT=json, que no sale de la máquina ni pasa por MailHog.
});

test('the seeded advise and testimonial pages render', async ({ page }) => {
  await page.goto(`/consejos/${ADVISE.id}`);
  await expect(page.getByText(ADVISE.content).first()).toBeVisible();
  await page.goto(`/testimonios/${TESTIMONIAL.id}`);
  await expect(page.getByText(TESTIMONIAL.body).first()).toBeVisible();
});
