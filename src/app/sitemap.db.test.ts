import sitemap from '@/app/sitemap';
import { createTestEvent } from '@/test/db/content-fixtures';

// El sitemap contra Postgres real: lista las páginas de los eventos vivos, no las eliminadas.

it('includes live events and leaves deleted ones out', async () => {
  const live = await createTestEvent();
  const deleted = await createTestEvent({ deletedAt: new Date() });

  const urls = (await sitemap()).map((entry) => entry.url);

  expect(urls.some((url) => url.endsWith(`/eventos/${live.id}`))).toBe(true);
  expect(urls.some((url) => url.endsWith(`/eventos/${deleted.id}`))).toBe(false);
  expect(urls.some((url) => url.endsWith('/eventos'))).toBe(true);
});
