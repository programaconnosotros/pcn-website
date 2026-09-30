import { PageTitle } from '@/components/ui/page-title';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Code Warfare',
  description: 'Competencias de programación de la comunidad programaConNosotros. Próximamente.',
  openGraph: {
    title: 'Code Warfare | programaConNosotros',
    description: 'Competencias de programación de la comunidad programaConNosotros. Próximamente.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/code-warfare`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Code Warfare | programaConNosotros',
    description: 'Competencias de programación de la comunidad programaConNosotros. Próximamente.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const CodeWarfare = () => (
  <div className="mt-4 p-4 pt-0">
    <PageTitle path="code-warfare" meta="próximamente" />
    <p className="border border-pcnGreen-200 p-3 font-mono text-sm text-muted-foreground">
      <span className="text-pcnGreen-500">$ </span>
      coming soon...
    </p>
  </div>
);

export default CodeWarfare;
