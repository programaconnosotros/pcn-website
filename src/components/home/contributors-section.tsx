import { GeistMono } from 'geist/font/mono';
import { Team, teamSize } from '@/components/landing/team';
import { getCollaborationStats } from '@/lib/github-stats';
import { getIdentityMap } from '@/lib/identity-links';
import { cn } from '@/lib/utils';
import { SectionHeader } from './section-header';

const number = (value: number) => value.toLocaleString('es-AR');

/**
 * Credit to the people who build the website: everyone who contributed to its repo, linked to
 * their PCN profile when an admin tied their GitHub login in /vinculos.
 */
export const ContributorsSection = async () => {
  const [stats, profiles] = await Promise.all([getCollaborationStats(), getIdentityMap('github')]);

  return (
    <section id="colaboradores" className="scroll-mt-20">
      <SectionHeader
        eyebrow="Colaboradores"
        title={
          <>
            Las <span className="text-pcnGreen">personas</span> detrás de esta web
          </>
        }
        description="Es de código abierto: cada persona de esta lista sumó código, diseño o ideas. Gracias por hacerla posible."
        action={{ label: 'Ver cómo se desarrolla', href: '/desarrollo' }}
      />

      <p className={cn(GeistMono.className, 'mb-3 text-[11px] text-muted-foreground')}>
        <span className="text-pcnGreen-500">$ </span>git shortlog -sn
        <span className="text-muted-foreground/60">
          {' '}
          — {teamSize} colaboradores · {number(stats.commits)} commits · {number(stats.mergedPrs)}{' '}
          PRs mergeados
        </span>
      </p>

      <Team profiles={profiles} />
    </section>
  );
};
