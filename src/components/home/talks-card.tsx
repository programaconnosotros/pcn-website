import { talks } from '@/app/(platform)/charlas/talks';
import { MicVocal } from 'lucide-react';
import { StatCard } from './stat-card';

export const TalksCard = () => (
  <StatCard href="/charlas" title="Charlas" Icon={MicVocal} value={talks.length} />
);
