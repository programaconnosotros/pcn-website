import Link from 'next/link';
import { BadgeMedal } from '@/components/badges/badge-medal';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { BADGE_TONES } from '@/lib/badges';
import { cn } from '@/lib/utils';
import { SectionHeader } from './section-header';

export const AchievementsSection = () => (
  <section>
    <SectionHeader
      eyebrow="Logros"
      title={
        <>
          Participá y desbloqueá <span className="text-pcnGreen">logros</span>
        </>
      }
      description="Dar una charla, organizar un evento, compartir un proyecto o mandar un PR a la plataforma te da badges que aparecen solos en tu perfil. Mirá cuánto te falta para cada uno."
      action={{ label: 'Ver logros', href: '/logros' }}
    />

    <RuledGrid className="grid-cols-2 sm:grid-cols-5">
      {ACHIEVEMENTS.map((achievement) => (
        <Link
          key={achievement.id}
          href="/logros"
          className={cn(
            ruledCellClassName,
            'group/badge flex flex-col items-center gap-2 px-2 py-4 text-center font-mono',
          )}
        >
          <BadgeMedal icon={achievement.icon} tone={achievement.tone} />
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: BADGE_TONES[achievement.tone].light }}
          >
            {achievement.name}
          </span>
          <span className="text-[11px] leading-tight text-muted-foreground">
            <span className="text-pcnGreen-500">&gt; </span>
            {achievement.goal}
          </span>
        </Link>
      ))}
    </RuledGrid>
  </section>
);
