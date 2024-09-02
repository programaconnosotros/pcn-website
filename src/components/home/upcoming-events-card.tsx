import { Calendar } from 'lucide-react';
import { StatCard } from './stat-card';

export const UpcomingEventsCard = () => (
  <StatCard
    href="/events"
    title="Próximos eventos"
    Icon={Calendar}
    value={3}
    description="Creamos eventos para que puedas aprender y crecer junto a los demás."
  />
);
