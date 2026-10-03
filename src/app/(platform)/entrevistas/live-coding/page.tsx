import { InterviewsTabs } from '@/components/interviews/interviews-tabs';
import { LiveCodingPractice } from '@/components/interviews/live-coding-practice';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SENIORITIES, TRACKS, type Seniority } from '../questions/types';
import { getLivePractice, livePractices } from './exercises';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const DESCRIPTION =
  'Practicá para entrevistas de live coding: enunciados para resolver por tu cuenta y problemas de LeetCode recomendados para cada tecnología y seniority.';

export const metadata: Metadata = {
  title: './live-coding',
  description: DESCRIPTION,
  openGraph: {
    title: 'Live coding | programaConNosotros',
    description: DESCRIPTION,
    url: `${SITE_URL}/entrevistas/live-coding`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live coding | programaConNosotros',
    description: DESCRIPTION,
  },
};

const PRACTICE_TRACKS = TRACKS.filter(({ id }) => livePractices[id]);

const href = (tecnologia?: string, seniority?: string) => {
  const params = new URLSearchParams();
  if (tecnologia) params.set('tecnologia', tecnologia);
  if (seniority) params.set('seniority', seniority);
  const query = params.toString();
  return `/entrevistas/live-coding${query ? `?${query}` : ''}`;
};

const OptionLink = ({
  selected,
  label,
  hint,
  to,
}: {
  selected: boolean;
  label: string;
  hint?: string;
  to: string;
}) => (
  <Link
    href={to}
    scroll={false}
    aria-current={selected ? 'true' : undefined}
    className={cn(
      ruledCellClassName,
      'flex items-center gap-3 p-3 font-mono text-sm',
      selected && 'bg-pcnGreen/10 text-pcnGreen hover:bg-pcnGreen/10',
    )}
  >
    <span className={cn('shrink-0', selected ? 'text-pcnGreen' : 'text-pcnGreen-500/50')}>
      {selected ? '[x]' : '[ ]'}
    </span>
    <span className="font-semibold">{label}</span>
    {hint && <span className="ml-auto text-[11px] text-muted-foreground">{hint}</span>}
  </Link>
);

type Props = { searchParams: Promise<{ tecnologia?: string; seniority?: string }> };

const LiveCodingPage = async (props: Props) => {
  const { tecnologia, seniority } = await props.searchParams;
  const track = PRACTICE_TRACKS.find(({ id }) => id === tecnologia);
  const seniorityInfo = SENIORITIES.find(({ id }) => id === seniority);
  const practice = track && getLivePractice(track.id);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mb-14 mt-4">
        <PageTitle
          path="entrevistas/live-coding"
          meta="enunciados + leetcode"
          action={<InterviewsTabs active="live-coding" />}
        />
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Enunciados como los de una entrevista real para resolver por tu cuenta, con el tiempo que
          te darían, y problemas de LeetCode recomendados para cada tecnología y seniority. Nada se
          corrige acá: resolvelo en tu editor, en voz alta, y marcá lo que ya practicaste.
        </p>

        <h2 className="mb-2 font-mono text-xs text-pcnGreen-500"># 1. tecnología</h2>
        <RuledGrid className="mb-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {PRACTICE_TRACKS.map(({ id, label, stack }) => (
            <OptionLink
              key={id}
              selected={track?.id === id}
              label={label}
              hint={stack}
              to={href(id, seniorityInfo?.id)}
            />
          ))}
        </RuledGrid>

        <h2 className="mb-2 font-mono text-xs text-pcnGreen-500"># 2. seniority</h2>
        <RuledGrid className="mb-8 grid-cols-1 sm:grid-cols-3">
          {SENIORITIES.map(({ id, label }) => (
            <OptionLink
              key={id}
              selected={seniorityInfo?.id === id}
              label={label}
              to={href(track?.id, id)}
            />
          ))}
        </RuledGrid>

        {practice && seniorityInfo ? (
          <LiveCodingPractice
            key={`${track.id}-${seniorityInfo.id}`}
            track={track.id}
            label={track.label}
            seniorityLabel={seniorityInfo.label}
            exercises={practice.exercises[seniorityInfo.id as Seniority]}
            leetcode={practice.leetcode[seniorityInfo.id as Seniority]}
          />
        ) : (
          <p className="font-mono text-xs text-muted-foreground">
            <span className="text-pcnGreen-500">&gt; </span>
            {track
              ? 'elegí la seniority'
              : seniorityInfo
                ? 'elegí la tecnología'
                : 'elegí la tecnología y la seniority'}{' '}
            para ver los ejercicios. ¿Primero querés repasar cómo encarar un live coding?{' '}
            <Link href="/entrevistas/guias/live-coding" className="text-pcnGreen hover:underline">
              leé la guía
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
};

export default LiveCodingPage;
