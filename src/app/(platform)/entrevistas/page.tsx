import { InterviewSimulator } from '@/components/interviews/interview-simulator';
import type { Metadata } from 'next';
import { interviewGuides } from './guias/guides';
import type { InterviewTrack } from './questions/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const DESCRIPTION =
  'Simulá entrevistas técnicas de frontend con React.js, iOS, Android y React Native, backend con Node.js, Python, Java y .NET, AI engineering, agentic engineering, quality engineering, seguridad informática, product engineering y project management para junior, semi-senior y senior, practicando con active recall.';

export const metadata: Metadata = {
  title: 'Entrevistas',
  description: DESCRIPTION,
  openGraph: {
    title: 'Entrevistas | programaConNosotros',
    description: DESCRIPTION,
    url: `${SITE_URL}/entrevistas`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Entrevistas | programaConNosotros',
    description: DESCRIPTION,
  },
};

// Only the section ids reach the client, to show how much of each guide was read.
const guideSections = Object.fromEntries(
  Object.entries(interviewGuides).map(([track, guide]) => [
    track,
    guide.sections.map((section) => section.id),
  ]),
) as Record<InterviewTrack, string[]>;

const EntrevistasPage = async (props: { searchParams: Promise<{ tipo?: string | string[] }> }) => {
  const { tipo } = await props.searchParams;
  const linked = typeof tipo === 'string' ? tipo : undefined;

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        {/* Keyed by `tipo` so following another `?tipo=` link starts over with that selection. */}
        <InterviewSimulator key={linked} guideSections={guideSections} tipo={linked} />
      </div>
    </div>
  );
};

export default EntrevistasPage;
