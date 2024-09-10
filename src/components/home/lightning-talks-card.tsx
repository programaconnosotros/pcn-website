import { Zap } from 'lucide-react';
import { StatCard } from './stat-card';
import { lightningTalks } from '@/app/(platform)/lightning-talks/page';

export const LightningTalksCard = () => (
  <StatCard
    href="/lightning-talks"
    title="Lightning Talks"
    Icon={Zap}
    value={lightningTalks.length}
    description="Las LT son charlas cortas y directas que nos ayudan a aprender cosas nuevas."
  />
);
