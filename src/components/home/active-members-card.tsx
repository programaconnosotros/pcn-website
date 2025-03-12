import { Users } from 'lucide-react';
import { StatCard } from './stat-card';

export const ActiveMembersCard = () => (
  <StatCard href="/members" title="Miembros activos" Icon={Users} value={50} />
);
