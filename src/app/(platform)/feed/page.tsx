import { fetchFeed, toFeedDay } from '@/lib/feed';
import { Suspense } from 'react';
import { FeedAside } from './feed-aside';
import { FeedClient } from './feed-client';

export default async function FeedPage() {
  const items = await fetchFeed();
  return (
    <FeedClient
      items={items}
      today={toFeedDay(new Date())}
      aside={
        <Suspense fallback={null}>
          <FeedAside />
        </Suspense>
      }
    />
  );
}
