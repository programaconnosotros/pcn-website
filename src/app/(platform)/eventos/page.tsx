import { EventsList } from '@/components/events/events-list';
import { Heading2 } from '@/components/ui/heading-2';

const EventsPage = () => (
  <div className="mt-4">
    <div className="sticky top-0 z-10 bg-background/95 pb-3 pt-1 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full flex-row items-center justify-between md:px-20">
        <Heading2 className="m-0">Eventos</Heading2>
      </div>
    </div>
    <div className="md:px-20">
      <EventsList />
    </div>
  </div>
);

export default EventsPage;
