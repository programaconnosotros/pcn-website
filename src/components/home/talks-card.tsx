import prisma from '@/lib/prisma';
import { MicVocal } from 'lucide-react';
import { StatCard } from './stat-card';

export const TalksCard = async () => {
  const value = await prisma.talk.count();
  return <StatCard href="/charlas" title="Charlas" Icon={MicVocal} value={value} />;
};
