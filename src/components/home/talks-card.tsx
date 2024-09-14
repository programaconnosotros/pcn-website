import { MicVocal } from 'lucide-react';
import { StatCard } from './stat-card';
import { talks } from '@/app/(platform)/talks/page';

export const TalksCard = () => (
  <StatCard
    href="/talks"
    title="Charlas"
    Icon={MicVocal}
    value={talks.length}
    description="Cada vez son más los miembros que se animan a dar charlas!"
  />
);
