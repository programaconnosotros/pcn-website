import { MicVocal } from 'lucide-react';
import { StatCard } from './stat-card';
import { talks } from '@/app/(platform)/talks/talks';

export const TalksCard = () => (
  <StatCard href="/talks" title="Charlas" Icon={MicVocal} value={talks.length} />
);
