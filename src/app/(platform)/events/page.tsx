import { EventsList } from '@/components/events/events-list';
import { Heading2 } from '@/components/ui/heading-2';

const Events = () => (
  <div className="mt-4 md:px-20">
    <Heading2>Eventos</Heading2>
    <EventsList></EventsList>
  </div>
);

export default Events;
