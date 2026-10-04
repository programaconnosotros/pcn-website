import { fetchFeed, toFeedDay } from '@/lib/feed';
import { FeedClient } from './feed-client';

export default async function FeedPage() {
  const items = await fetchFeed();
  return <FeedClient items={items} today={toFeedDay(new Date())} />;
}
