import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { faqs } from '@/data/faqs';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description:
    'Todo lo que necesitás saber sobre programaConNosotros: cómo unirte, cómo participar y qué ofrecemos.',
  openGraph: {
    title: 'Preguntas frecuentes | programaConNosotros',
    description:
      'Todo lo que necesitás saber sobre programaConNosotros: cómo unirte, cómo participar y qué ofrecemos.',
    url: `${SITE_URL}/preguntas-frecuentes`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Preguntas frecuentes | programaConNosotros',
    description:
      'Todo lo que necesitás saber sobre programaConNosotros: cómo unirte, cómo participar y qué ofrecemos.',
  },
};

const FAQPage = async () => {
  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <PageTitle path="preguntas-frecuentes" meta={`${faqs.length} preguntas`} />
          </StickyHeader>

          <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2">
            {faqs.map((faq, index) => (
              <div key={index} className={cn(ruledCellClassName, 'flex flex-col gap-1 p-3')}>
                <h2 className="font-mono text-sm font-semibold">
                  <span className="text-pcnGreen-500">{String(index + 1).padStart(2, '0')} </span>
                  {faq.question}
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </RuledGrid>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
