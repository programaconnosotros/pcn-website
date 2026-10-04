import { mkdirSync } from 'node:fs';
import { test as setup, expect } from '@playwright/test';
import { PASSWORD, SIGNED_IN_ROLES, storageStatePath, USERS } from './support/data';

// Inicia sesión una vez por rol y guarda cookies y localStorage, así cada spec arranca logueado sin
// pasar por el formulario (y sin gastar el rate limit del login).
mkdirSync('tests/e2e/.auth', { recursive: true });

for (const role of SIGNED_IN_ROLES) {
  setup(`sign in as ${role}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('pcn-os-mode', 'classic'));
    await page.goto('/autenticacion/iniciar-sesion');
    await page.getByLabel('Correo electrónico').fill(USERS[role].email);
    await page.getByLabel('Contraseña').fill(PASSWORD);
    await page.getByRole('button', { name: /ingresar/ }).click();
    await page.waitForURL((url) => !url.pathname.startsWith('/autenticacion'));
    expect((await page.context().cookies()).some((c) => c.name === 'sessionId')).toBe(true);
    await page.context().storageState({ path: storageStatePath(role) });
  });
}
