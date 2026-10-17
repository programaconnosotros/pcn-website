import { EVENTS, USERS } from './support/data';
import { expect, test } from './support/fixtures';

// Smoke: el sitio levanta, renderiza las secciones principales y las sesiones de cada rol sirven.

test('home renders for anonymous visitors', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/programaConNosotros/);
  await expect(page.getByRole('link', { name: /iniciarSesion/ }).first()).toBeVisible();
});

test('seeded events show up in /eventos', async ({ page }) => {
  await page.goto('/eventos');
  await expect(page.getByText(EVENTS.upcoming.name).first()).toBeVisible();
});

test.describe('signed in as a member', () => {
  test.use({ as: 'member' });

  test('the session from auth.setup works', async ({ page, db }) => {
    await page.goto('/notificaciones');
    await expect(page).toHaveURL(/\/notificaciones/);
    const member = await db.user.findUniqueOrThrow({ where: { email: USERS.member.email } });
    expect(member.emailVerified).toBe(true);
  });
});
