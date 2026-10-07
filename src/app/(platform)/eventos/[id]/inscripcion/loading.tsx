import { EventDetailSkeleton } from '@/components/skeletons/event-skeletons';

// The page only redirects to the event (or its external sign-up), so wait on the event's layout.
export default function Loading() {
  return <EventDetailSkeleton />;
}
