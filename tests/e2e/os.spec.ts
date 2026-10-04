import type { Page } from '@playwright/test';
import { EVENTS } from './support/data';
import { expect, test } from './support/fixtures';

// PCN OS: en pantallas de 1024 px o más el sitio es un escritorio con barra de menú, dock y
// ventanas (iframes de páginas reales). Desktop Chrome abre a 1280×720.

const MENU_BAR = 28;
const DOCK = 64;

const ADMIN_PROGRAMS = [
  'Panel',
  'Usuarios',
  'Analíticas',
  'Visitas',
  'Notificaciones',
  'Monitoreo',
  'Vínculos',
];

/** Cuántos núcleos y memoria reporta el navegador, para que el modo automático no dependa de la máquina. */
const emulateHardware = (page: Page, cores: number, memory = 8) =>
  page.addInitScript(
    ([c, m]) => {
      Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', { get: () => c });
      Object.defineProperty(Navigator.prototype, 'deviceMemory', { get: () => m });
    },
    [cores, memory],
  );

const dock = (page: Page) => page.getByRole('navigation', { name: 'Dock' });
const menuBarTrigger = (page: Page) => page.getByRole('button', { name: 'PCN_OS' });
const osWindow = (page: Page, name: string) => page.getByRole('dialog', { name, exact: true });
const windowFrame = (page: Page, name: string) => osWindow(page, name).frameLocator('iframe');
const htmlMode = (page: Page) =>
  page.evaluate(() => document.documentElement.getAttribute('data-os-mode'));

const openFromDock = async (page: Page, name: string) => {
  await dock(page).getByRole('button', { name, exact: true }).click();
  await expect(osWindow(page, name)).toBeVisible();
};

/** La página de la ventana hidrató (PwaProvider marca `data-app-ready`), así el bridge ya escucha. */
const waitForWindowReady = (page: Page, name: string) =>
  expect(windowFrame(page, name).locator('html[data-app-ready]')).toBeAttached({ timeout: 30_000 });

const nextFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );

/**
 * Doble clic con el mouse, dejando que React pinte entre los dos clics: el primer pointerdown
 * arranca un arrastre y pone un escudo sobre los iframes que se va al soltar.
 */
const doubleClickAt = async (page: Page, x: number, y: number) => {
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.up();
  await nextFrames(page);
  await page.mouse.down({ clickCount: 2 });
  await page.mouse.up({ clickCount: 2 });
};

const box = async (page: Page, name: string) => (await osWindow(page, name).boundingBox())!;

/** La ventana entera entre la barra de menú y el dock. */
const expectInsideDesktop = async (page: Page, name: string) => {
  const viewport = page.viewportSize()!;
  await expect
    .poll(async () => {
      const b = await box(page, name);
      return b.y >= MENU_BAR - 1 && b.y + b.height <= viewport.height - DOCK + 1;
    })
    .toBe(true);
};

// Cada ventana es una copia entera del sitio: con el servidor cargado, las páginas de los iframes
// tardan. Más margen que el resto de la suite.
test.describe.configure({ timeout: 120_000 });

test.describe('full mode', () => {
  test.use({ osMode: 'full' });
  test.beforeEach(async ({ page }) => {
    await emulateHardware(page, 8);
  });

  test('TC-OS-001 El escritorio aparece solo en pantallas grandes', async ({ page }) => {
    await page.goto('/eventos');
    await expect(menuBarTrigger(page)).toBeVisible();
    await expect(dock(page)).toBeVisible();
    await expect(osWindow(page, 'Eventos')).toBeVisible();
    await expect(
      windowFrame(page, 'Eventos').getByRole('heading', { level: 1 }).first(),
    ).toContainText('eventos');

    // Por debajo de 1024 px pasa al layout clásico con la misma URL
    await page.setViewportSize({ width: 1000, height: 720 });
    await expect(dock(page)).toBeHidden();
    await expect(menuBarTrigger(page)).toBeHidden();
    await expect(page).toHaveURL(/\/eventos$/);
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('eventos');
    await expect(page.getByText(EVENTS.upcoming.name).first()).toBeVisible();

    // Y vuelve al escritorio al agrandarla
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(dock(page)).toBeVisible();
  });

  test('the classic layout at 1000px shows the URL of the focused window', async ({ page }) => {
    await page.goto('/');
    await openFromDock(page, 'Cursos');
    await expect(page).toHaveURL(/\/cursos$/);
    await page.setViewportSize({ width: 1000, height: 720 });
    await expect(page).toHaveURL(/\/cursos$/);
    // El layout clásico vuelve a pedir la página de la URL (router.refresh), que tarda un poco
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('cursos', {
      timeout: 30_000,
    });
  });

  test('TC-OS-002 Ventanas: maximizar, minimizar, mover y cerrar', async ({ page }) => {
    // Mover, minimizar y cerrar (y maximizar con su botón) los cubre el test siguiente.
    await page.goto('/');
    await openFromDock(page, 'Eventos');
    const eventos = osWindow(page, 'Eventos');
    await expect(eventos).toHaveAttribute('data-focused', 'true');
    await expectInsideDesktop(page, 'Eventos');
    const restored = await box(page, 'Eventos');

    await doubleClickAt(page, restored.x + restored.width * 0.7, restored.y + 14);
    await expect(eventos.getByRole('button', { name: 'Restaurar' })).toBeVisible({
      timeout: 5_000,
    });
    const viewport = page.viewportSize()!;
    await doubleClickAt(page, viewport.width * 0.7, MENU_BAR + 14);
    await expect(eventos.getByRole('button', { name: 'Maximizar' })).toBeVisible({
      timeout: 5_000,
    });
  });

  test('window buttons maximize and restore; dragging, minimizing and closing work', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(osWindow(page, 'Inicio')).toBeVisible();
    await openFromDock(page, 'Eventos');
    const eventos = osWindow(page, 'Eventos');
    await expect(page).toHaveURL(/\/eventos$/);
    await expect(eventos).toHaveAttribute('data-focused', 'true');
    await expect(page).toHaveTitle(/eventos/i);
    await expectInsideDesktop(page, 'Eventos');
    const restored = await box(page, 'Eventos');

    // Maximizar ocupa el escritorio, sin tapar la barra de menú ni el dock
    await eventos.getByRole('button', { name: 'Maximizar' }).click();
    await expect(eventos.getByRole('button', { name: 'Restaurar' })).toBeVisible();
    const viewport = page.viewportSize()!;
    await expect
      .poll(async () => {
        const b = await box(page, 'Eventos');
        return [Math.round(b.y), Math.round(b.width), Math.round(b.height)];
      })
      .toEqual([MENU_BAR, viewport.width, viewport.height - MENU_BAR - DOCK]);

    await eventos.getByRole('button', { name: 'Restaurar' }).click();
    await expect(eventos.getByRole('button', { name: 'Maximizar' })).toBeVisible();
    await expect
      .poll(async () => Math.round((await box(page, 'Eventos')).width))
      .toBe(Math.round(restored.width));

    // Arrastrar una ventana maximizada la restaura bajo el puntero
    await eventos.getByRole('button', { name: 'Maximizar' }).click();
    await expect(eventos.getByRole('button', { name: 'Restaurar' })).toBeVisible();
    const grabX = viewport.width * 0.8;
    await page.mouse.move(grabX, MENU_BAR + 14);
    await page.mouse.down();
    await page.mouse.move(grabX - 40, MENU_BAR + 120, { steps: 8 });
    await page.mouse.up();
    await expect(eventos.getByRole('button', { name: 'Maximizar' })).toBeVisible();
    await expect
      .poll(async () => {
        const b = await box(page, 'Eventos');
        return (
          Math.round(b.width) === Math.round(restored.width) &&
          b.x <= grabX - 40 &&
          b.x + b.width >= grabX - 40
        );
      })
      .toBe(true);
    await expectInsideDesktop(page, 'Eventos');

    // Arrastrarla hacia arriba no la deja debajo de la barra de menú
    const moved = await box(page, 'Eventos');
    await page.mouse.move(moved.x + moved.width / 2, moved.y + 14);
    await page.mouse.down();
    await page.mouse.move(moved.x + moved.width / 2, 0, { steps: 6 });
    await page.mouse.up();
    await expectInsideDesktop(page, 'Eventos');

    // Minimizar: la URL pasa a la ventana de atrás; el dock la restaura
    await eventos.getByRole('button', { name: 'Minimizar' }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await dock(page).getByRole('button', { name: 'Eventos', exact: true }).click();
    await expect(eventos).toHaveAttribute('data-focused', 'true');
    await expect(page).toHaveURL(/\/eventos$/);

    // Cerrar
    await eventos.getByRole('button', { name: 'Cerrar' }).click();
    await expect(eventos).toHaveCount(0);
    await expect(page).toHaveURL(/localhost:\d+\/$/);
  });

  test('opening a program that is already open focuses its window instead of a new one', async ({
    page,
  }) => {
    await page.goto('/');
    await openFromDock(page, 'Cursos');
    await openFromDock(page, 'Eventos');
    await dock(page).getByRole('button', { name: 'Cursos', exact: true }).click();
    await expect(osWindow(page, 'Cursos')).toHaveCount(1);
    await expect(osWindow(page, 'Cursos')).toHaveAttribute('data-focused', 'true');
    await expect(page).toHaveURL(/\/cursos$/);
  });

  test('a reload brings back the open windows', async ({ page }) => {
    await page.goto('/');
    await openFromDock(page, 'Cursos');
    await page.reload();
    await expect(osWindow(page, 'Cursos')).toBeVisible();
    await expect(osWindow(page, 'Inicio')).toBeVisible();
    await expect(osWindow(page, 'Cursos')).toHaveAttribute('data-focused', 'true');
  });

  test('TC-OS-003 Links que abren ventanas nuevas', async ({ page }) => {
    await page.goto('/');
    await waitForWindowReady(page, 'Inicio');
    const home = windowFrame(page, 'Inicio');
    await home.locator(`a[href="/eventos/${EVENTS.past.id}"]`).first().click();

    // El evento abre en una ventana nueva y la de inicio sigue ahí
    await expect(page).toHaveURL(new RegExp(`/eventos/${EVENTS.past.id}$`));
    const eventWindows = osWindow(page, 'Eventos');
    await expect(eventWindows).toHaveCount(1);
    await expect(osWindow(page, 'Inicio')).toBeVisible();
    const event = windowFrame(page, 'Eventos');
    await expect(event.getByText(EVENTS.past.name).first()).toBeVisible({ timeout: 30_000 });
    await waitForWindowReady(page, 'Eventos');

    // Un perfil dentro de la ventana del evento abre otra ventana
    await event.locator('a[href^="/perfil/"]').first().click();
    await expect(osWindow(page, 'Perfil')).toBeVisible();
    await expect(page).toHaveURL(/\/perfil\/[^/]+$/);
    await expect(eventWindows).toHaveCount(1);

    // El breadcrumb navega dentro de la misma ventana
    await dock(page).getByRole('button', { name: 'Eventos', exact: true }).click();
    await expect(eventWindows).toHaveAttribute('data-focused', 'true');
    await expect(page).toHaveURL(new RegExp(`/eventos/${EVENTS.past.id}$`));
    await event
      .getByRole('navigation', { name: 'breadcrumb' })
      .getByRole('link', { name: 'eventos' })
      .click();
    await expect(page).toHaveURL(/\/eventos$/);
    await expect(osWindow(page, 'Eventos')).toHaveCount(1);
    const title = event.getByRole('heading', { level: 1 }).first();
    await expect(title).toContainText('eventos', { timeout: 30_000 });
    await expect(title).not.toContainText(EVENTS.past.name, { timeout: 30_000 });
  });

  test('an event picked from the /eventos listing opens in the same window', async ({ page }) => {
    await page.goto('/eventos');
    await waitForWindowReady(page, 'Eventos');
    const listing = windowFrame(page, 'Eventos');
    await listing.locator(`a[href="/eventos/${EVENTS.upcoming.id}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`/eventos/${EVENTS.upcoming.id}$`));
    await expect(osWindow(page, 'Eventos')).toHaveCount(1);
  });

  test('TC-OS-004 Cambiar el modo de PCN OS', async ({ page, context }) => {
    await page.goto('/');
    await expect(dock(page)).toBeVisible();
    // El widget de htop del escritorio
    await expect(page.getByText('htop — pcn-prod-01')).toBeAttached();

    // Una segunda pestaña del sitio
    const other = await context.newPage();
    await emulateHardware(other, 8);
    await other.goto('/eventos');
    await expect(dock(other)).toBeVisible();

    await menuBarTrigger(page).click();
    await page.getByRole('menuitem', { name: 'Modo de PCN OS' }).click();
    await page.getByRole('menuitemradio', { name: /Liviano/ }).click();
    await expect.poll(() => htmlMode(page)).toBe('lite');
    // Liviano saca los widgets del escritorio
    await expect(page.getByText('htop — pcn-prod-01')).toHaveCount(0);
    await expect(dock(page)).toBeVisible();
    // La otra pestaña cambia sola (localStorage)
    await expect.poll(() => htmlMode(other)).toBe('lite');

    // Clásico: sin escritorio, con el sidebar
    await menuBarTrigger(page).click();
    await page.getByRole('menuitem', { name: 'Modo de PCN OS' }).click();
    await page.getByRole('menuitemradio', { name: /Clásico/ }).click();
    await expect(dock(page)).toBeHidden();
    const back = page.getByRole('button', { name: 'Volver a PCN OS' });
    await expect(back).toBeVisible();
    await expect.poll(() => htmlMode(other)).toBe('classic');
    await expect(dock(other)).toBeHidden();

    // "Volver a PCN OS" regresa al escritorio completo en una compu con recursos
    await back.click();
    await expect(dock(page)).toBeVisible();
    await expect.poll(() => htmlMode(page)).toBeNull();
    await expect.poll(() => htmlMode(other)).toBeNull();
    expect(await page.evaluate(() => localStorage.getItem('pcn-os-mode'))).toBe('full');
  });

  test('TC-OS-007 Launcher y búsqueda desde una ventana', async ({ page }) => {
    await page.goto('/eventos');
    await expect(osWindow(page, 'Eventos')).toBeVisible();
    await dock(page).getByRole('button', { name: 'Programas', exact: true }).click();
    const launcher = page.getByRole('dialog', { name: 'Todos los programas' });
    await expect(launcher).toBeVisible();
    const input = launcher.getByPlaceholder('buscar programas…');
    await expect(input).toBeFocused();
    await input.fill('lec');
    await input.press('Enter');
    await expect(launcher).toBeHidden();
    await expect(osWindow(page, 'Lectura')).toBeVisible();
    await expect(page).toHaveURL(/\/lectura$/);

    // ⌘K con el foco dentro de una ventana abre la búsqueda del escritorio, no la de la ventana
    const frame = windowFrame(page, 'Lectura');
    await frame.getByRole('heading', { level: 1 }).first().click();
    await expect(async () => {
      await frame.locator('body').press('ControlOrMeta+k');
      await expect(page.getByRole('dialog', { name: 'Buscar en todo el sitio' })).toBeVisible({
        timeout: 1_000,
      });
    }).toPass();
    await expect(frame.getByRole('dialog', { name: 'Buscar en todo el sitio' })).toHaveCount(0);

    // Elegir un resultado lo abre en una ventana
    await page
      .getByRole('combobox', { name: 'Buscar en todo el sitio' })
      .fill(EVENTS.upcoming.name);
    await page.getByRole('option', { name: new RegExp(EVENTS.upcoming.name) }).click();
    await expect(page).toHaveURL(new RegExp(`/eventos/${EVENTS.upcoming.id}$`));
  });

  test('the launcher filters programs, says when nothing matches and closes with Escape', async ({
    page,
  }) => {
    await page.goto('/');
    await menuBarTrigger(page).click();
    await page.getByRole('menuitem', { name: 'Todos los programas' }).click();
    const launcher = page.getByRole('dialog', { name: 'Todos los programas' });
    await launcher.getByPlaceholder('buscar programas…').fill('zzz');
    await expect(launcher.getByText(/no hay programas que coincidan con “zzz”/)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(launcher).toBeHidden();
  });

  test('anonymous visitors see the sign-in links in the menu bar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Iniciar sesión' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Crear cuenta' }).first()).toBeVisible();
  });
});

test.describe('full mode as a member', () => {
  test.use({ osMode: 'full', as: 'member' });

  test('TC-OS-006 Programas de admin ocultos', async ({ page }) => {
    await emulateHardware(page, 8);
    await page.goto('/');
    await expect(dock(page)).toBeVisible();
    await expect(dock(page).getByRole('button', { name: 'Eventos', exact: true })).toBeVisible();
    for (const name of ADMIN_PROGRAMS) {
      await expect(dock(page).getByRole('button', { name, exact: true })).toHaveCount(0);
    }

    await dock(page).getByRole('button', { name: 'Programas', exact: true }).click();
    const launcher = page.getByRole('dialog', { name: 'Todos los programas' });
    await expect(launcher.getByRole('button', { name: /^métricas$/i })).toBeVisible();
    for (const name of ADMIN_PROGRAMS) {
      await expect(launcher.getByRole('button', { name, exact: true })).toHaveCount(0);
    }
    await launcher.getByPlaceholder('buscar programas…').fill('monitoreo');
    await expect(
      launcher.getByText(/no hay programas que coincidan con “monitoreo”/),
    ).toBeVisible();
  });
});

test.describe('full mode as an admin', () => {
  test.use({ osMode: 'full', as: 'admin' });

  test('admins do get the admin programs in the launcher', async ({ page }) => {
    await emulateHardware(page, 8);
    await page.goto('/');
    await dock(page).getByRole('button', { name: 'Programas', exact: true }).click();
    const launcher = page.getByRole('dialog', { name: 'Todos los programas' });
    await launcher.getByPlaceholder('buscar programas…').fill('monitoreo');
    await expect(launcher.getByRole('button', { name: /monitoreo/i })).toBeVisible();
  });
});

test.describe('no mode chosen', () => {
  test.beforeEach(async ({ page }) => {
    // El fixture guarda un modo antes de cada carga, también en los iframes de las ventanas (y
    // eso le llega al escritorio como evento `storage`). Estos tests arrancan como la primera
    // visita: se borra el modo y el escritorio ignora esos ecos de los iframes.
    await page.addInitScript(() => {
      localStorage.removeItem('pcn-os-mode');
      localStorage.removeItem('pcn-os-auto-mode');
      if (window.self === window.top) {
        window.addEventListener(
          'storage',
          (event) => {
            if (event.key === 'pcn-os-mode') event.stopImmediatePropagation();
          },
          true,
        );
      }
    });
  });

  test('TC-OS-005 Modo liviano automático en compus con pocos recursos', async ({ page }) => {
    await emulateHardware(page, 4);
    await page.goto('/');
    await expect.poll(() => htmlMode(page)).toBe('lite');
    const notice = page.getByRole('status').filter({ hasText: 'PCN OS liviano' });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText('Detectamos que tu compu tiene pocos recursos');
    for (const name of ['entendido', 'experiencia completa', 'versión clásica']) {
      await expect(notice.getByRole('button', { name })).toBeVisible();
    }

    // "entendido" se queda en liviano, ahora elegido por la persona
    await notice.getByRole('button', { name: 'entendido' }).click();
    await expect(notice).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('pcn-os-mode'))).toBe('lite');
    await expect.poll(() => htmlMode(page)).toBe('lite');
  });

  test('the low-resources notice can switch to the full experience or the classic layout', async ({
    page,
  }) => {
    await emulateHardware(page, 2);
    await page.goto('/');
    const notice = page.getByRole('status').filter({ hasText: 'PCN OS liviano' });
    await notice.getByRole('button', { name: 'experiencia completa' }).click();
    await expect.poll(() => htmlMode(page)).toBeNull();
    await expect(notice).toBeHidden();
    await expect(dock(page)).toBeVisible();

    await menuBarTrigger(page).click();
    await page.getByRole('menuitem', { name: 'Modo de PCN OS' }).click();
    await expect(page.getByRole('menuitemradio', { name: /Completo/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('a low-memory computer also starts in lite, and "Ocultar aviso" dismisses the notice', async ({
    page,
  }) => {
    await emulateHardware(page, 16, 2);
    await page.goto('/');
    await expect.poll(() => htmlMode(page)).toBe('lite');
    const notice = page.getByRole('status').filter({ hasText: 'PCN OS liviano' });
    await notice.getByRole('button', { name: 'Ocultar aviso' }).click();
    await expect(notice).toBeHidden();
    // Ocultar no elige un modo
    expect(await page.evaluate(() => localStorage.getItem('pcn-os-mode'))).toBeNull();
  });

  test('a capable computer starts in the full desktop with no notice', async ({ page }) => {
    await emulateHardware(page, 8);
    await page.goto('/');
    await expect(dock(page)).toBeVisible();
    expect(await htmlMode(page)).toBeNull();
    await expect(page.getByRole('status').filter({ hasText: 'PCN OS liviano' })).toHaveCount(0);
  });
});

test.describe('classic mode', () => {
  test('pages render with the sidebar and no desktop', async ({ page }) => {
    await page.goto('/eventos');
    await expect(dock(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('eventos');
    await expect(page.getByRole('button', { name: 'Volver a PCN OS' })).toBeVisible();
  });
});
