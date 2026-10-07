import prisma from '@/lib/prisma';
import { MessageSquare } from 'lucide-react';
import { StatCard } from './stat-card';

export const AdviceCountCard = async () => {
  const numberOfAdvice = await prisma.advice.count({});

  return <StatCard href="/consejos" title="Consejos" Icon={MessageSquare} value={numberOfAdvice} />;
};
