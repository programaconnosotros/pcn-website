import { Zap } from 'lucide-react';
import { StatCard } from './stat-card';

export const LightningTalksCard = () => (
  <StatCard
    href="/lightning-talks"
    title="Lightning Talks"
    Icon={Zap}
    value={42}
    description="Las LT son charlas cortas y directas que nos ayudan a aprender cosas nuevas."
  />
);
