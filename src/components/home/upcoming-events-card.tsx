import { Calendar } from 'lucide-react';
import { StatCard } from './stat-card';

export const UpcomingEventsCard = () => (
  <StatCard href="/events" title="Próximos eventos" Icon={Calendar} value={3} />
);
