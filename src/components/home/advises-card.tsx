import { MessageSquare } from 'lucide-react';
import { StatCard } from './stat-card';
import prisma from '@/lib/prisma';

export const AdvisesCard = async () => {
  const numberOfAdvises = await prisma.advise.count({});

  return (
    <StatCard
      href="/advises"
      title="Consejos"
      Icon={MessageSquare}
      value={numberOfAdvises}
      description="Estamos creando un repositorio de consejos increíbles!"
    />
  );
};
