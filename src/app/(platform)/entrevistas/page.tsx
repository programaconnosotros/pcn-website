import { InterviewSimulator } from '@/components/interviews/interview-simulator';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const DESCRIPTION =
  'Simulá entrevistas técnicas de frontend con React.js, iOS, Android y React Native, backend con Node.js, Python, Java y .NET, AI engineering, agentic engineering y quality engineering para junior, semi-senior y senior, practicando con active recall.';

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

const EntrevistasPage = () => (
  <div className="flex flex-1 flex-col p-4 pt-0">
    <div className="mt-4">
      <InterviewSimulator />
    </div>
  </div>
);

export default EntrevistasPage;
