import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { faqs } from '@/data/faqs';
import { cn } from '@/lib/utils';
import { SectionHeader } from './section-header';

const featuredFaqs = faqs.filter((faq) => faq.featured);

/** The questions newcomers ask before joining; the rest live on /preguntas-frecuentes. */
export const FaqSection = () => (
  <section>
    <SectionHeader
      eyebrow="Preguntas frecuentes"
      title={
        <>
          Antes de <span className="text-pcnGreen">sumarte</span>
        </>
      }
      description="Lo que más nos preguntan quienes recién llegan a la comunidad."
      action={{ label: 'Ver todas las preguntas', href: '/preguntas-frecuentes' }}
    />

    <RuledGrid className="grid-cols-1 md:grid-cols-2">
      {featuredFaqs.map((faq, index) => (
        <div key={faq.question} className={cn(ruledCellClassName, 'flex flex-col gap-1 p-4')}>
          <h3 className="font-mono text-sm font-semibold">
            <span className="text-pcnGreen-500">{String(index + 1).padStart(2, '0')} </span>
            {faq.question}
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">{faq.answer}</p>
        </div>
      ))}
    </RuledGrid>
  </section>
);
