import prisma from '@/lib/prisma';
import { fetchFeed } from '@/lib/feed';
import { actAs } from '@/test/db/fixtures';
import { quickUser } from '@/test/db/actions-fixtures';
import { hideFeedItem, showFeedItem } from './hidden-feed-items';

// Hiding feed items against a real Postgres: only admins can, and the feed drops them right away.

it('lets an admin take an item off the feed for everyone and put it back', async () => {
  const admin = await quickUser({ role: 'ADMIN' });
  await actAs(admin.id);
  const [item] = await fetchFeed();
  expect(item).toBeDefined();

  await hideFeedItem({ itemId: item.id, title: item.title, href: item.href });
  await hideFeedItem({ itemId: item.id, title: 'otra vez', href: item.href });
  expect(await prisma.hiddenFeedItem.findUnique({ where: { itemId: item.id } })).toMatchObject({
    title: item.title,
    hiddenById: admin.id,
  });

  await actAs();
  expect((await fetchFeed()).map(({ id }) => id)).not.toContain(item.id);

  await actAs(admin.id);
  await showFeedItem(item.id);
  expect((await fetchFeed()).map(({ id }) => id)).toContain(item.id);
});

it('rejects members, visitors and links off the site', async () => {
  const member = await quickUser();
  const input = { itemId: `x-${member.id}`, title: 'Algo', href: '/eventos' };

  await actAs(member.id);
  await expect(hideFeedItem(input)).rejects.toThrow('No autorizado');
  await actAs();
  await expect(hideFeedItem(input)).rejects.toThrow('No autorizado');
  await expect(showFeedItem(input.itemId)).rejects.toThrow('No autorizado');

  await actAs((await quickUser({ role: 'ADMIN' })).id);
  await expect(hideFeedItem({ ...input, href: 'https://evil.example' })).rejects.toThrow();
  await expect(hideFeedItem({ ...input, href: '//evil.example' })).rejects.toThrow();
  expect(await prisma.hiddenFeedItem.count({ where: { itemId: input.itemId } })).toBe(0);
});
