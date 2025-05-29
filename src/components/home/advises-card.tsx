import prisma from '@/lib/prisma';
import { MessageSquare } from 'lucide-react';
import { StatCard } from './stat-card';

export const AdvisesCard = async () => {
  const numberOfAdvises = await prisma.advise.count({});

  return (
    <StatCard href="/consejos" title="Consejos" Icon={MessageSquare} value={numberOfAdvises} />
  );
};
