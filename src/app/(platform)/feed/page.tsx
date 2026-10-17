import { getAdminUser } from '@/lib/admin';
import { fetchFeed, toFeedDay } from '@/lib/feed';
import { Suspense } from 'react';
import { FeedAside } from './feed-aside';
import { FeedClient } from './feed-client';

export default async function FeedPage() {
  const [items, admin] = await Promise.all([fetchFeed(), getAdminUser()]);
  return (
    <FeedClient
      items={items}
      today={toFeedDay(new Date())}
      isAdmin={!!admin}
      aside={
        <Suspense fallback={null}>
          <FeedAside />
        </Suspense>
      }
    />
  );
}
