import { expect as baseExpect, test } from './support/fixtures';
import { createEvent, createUser, signIn } from './support/eventos-helpers';

// Eventos en el celular (Pixel 7): el panel de inscripción entra en pantalla y funciona con toques.

const PREFIX = 'e2e-evt-mob';

// El servidor e2e lo comparten varios specs a la vez: las server actions pueden tardar
const expect = baseExpect.configure({ timeout: 25_000 });
test.describe.configure({ timeout: 120_000 });

test('an anonymous visitor taps inscribirme and is sent to log in', async ({ page, db }) => {
  const event = await createEvent(db, PREFIX, { capacity: 8 });
  await page.goto(`/eventos/${event.id}`);
  await page.waitForLoadState('networkidle');

  const button = page.getByRole('button', { name: 'inscribirme();' });
  await expect(button).toBeInViewport();
  await expect(page.getByText('Quedan 8 lugares disponibles.')).toBeVisible();
  await button.tap();

  await page.waitForURL(/\/autenticacion\/iniciar-sesion/);
  const url = new URL(page.url());
  expect(url.searchParams.get('redirect')).toBe(`/eventos/${event.id}`);
  expect(url.searchParams.get('autoRegister')).toBe('true');
});

test('a member registers and cancels from the phone', async ({ page, db }) => {
  const user = await createUser(db, PREFIX);
  const event = await createEvent(db, PREFIX, { capacity: 8 });

  await signIn(page, user, `/eventos/${event.id}`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'inscribirme();' }).tap();

  const dialog = page.getByRole('dialog', { name: '¡Te has inscrito exitosamente! 🎉' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'entendido();' })).toBeInViewport();
  await dialog.getByRole('button', { name: 'entendido();' }).tap();

  await page.getByRole('button', { name: 'cancelarInscripcion();' }).tap();
  await expect(page.getByText('Inscripción cancelada exitosamente')).toBeVisible();
  await expect(page.getByRole('button', { name: 'inscribirme();' })).toBeVisible();

  const registration = await db.eventRegistration.findFirstOrThrow({
    where: { eventId: event.id, userId: user.id },
  });
  expect(registration.cancelledAt).not.toBeNull();
});
