import type { Metadata } from 'next';
import { PageVisitTracker } from '@/components/analytics/page-visit-tracker';
import { MotivationScreen } from './motivation-screen';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';
const DESCRIPTION =
  'Una frase motivacional sobre una foto de la comunidad que cambia cada 5 minutos, para dejar abierta en un segundo monitor.';

export const metadata: Metadata = {
  title: 'watch -n 300 ~/motivacion',
  description: DESCRIPTION,
  openGraph: {
    title: 'Motivación | programaConNosotros',
    description: DESCRIPTION,
    url: `${SITE_URL}/motivacion`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motivación | programaConNosotros',
    description: DESCRIPTION,
  },
};

// Fuera de (platform): sin sidebar ni PCN OS, para que la frase ocupe todo el monitor.
export default function MotivacionPage() {
  return (
    <main>
      <PageVisitTracker />
      <MotivationScreen />
    </main>
  );
}
