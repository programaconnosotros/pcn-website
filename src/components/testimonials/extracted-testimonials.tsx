import Link from 'next/link';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import type { TestimonialItem } from '@/lib/extracted-testimonials';
import { cn } from '@/lib/utils';

// What members said about the community in the WhatsApp group, as the conversation summaries tell
// it: paraphrased, credited and linked to the conversation it came from.
export function ExtractedTestimonials({ testimonials }: { testimonials: TestimonialItem[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section aria-labelledby="extracted-testimonials" className="mb-14">
      <h2
        id="extracted-testimonials"
        className="mb-1 font-mono text-xs uppercase tracking-wider text-muted-foreground"
      >
        {'// '}de las conversaciones · {testimonials.length}
      </h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Extraídos automáticamente de los resúmenes del grupo de WhatsApp: cuentan, con otras
        palabras, lo que cada miembro dijo de la comunidad.
      </p>
      <RuledGrid className="grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.id}
            className={cn(ruledCellClassName, 'flex flex-col gap-3 p-4')}
          >
            <blockquote className="flex-1 text-sm leading-relaxed text-foreground/85">
              <span aria-hidden className="font-mono text-pcnGreen">
                &gt;{' '}
              </span>
              {testimonial.body}
            </blockquote>
            <figcaption className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
              {testimonial.user.id ? (
                <Link
                  href={`/perfil/${testimonial.user.id}`}
                  className="text-pcnGreen hover:underline"
                >
                  @{testimonial.user.name}
                </Link>
              ) : (
                <span title="Todavía no vinculado a un perfil de la plataforma">
                  @{testimonial.user.name}
                </span>
              )}
              {testimonial.source && (
                <Link
                  href={testimonial.source.href}
                  title={`«${testimonial.source.title}»`}
                  className="text-pcnGreen-600 underline decoration-dotted underline-offset-2 hover:text-pcnGreen"
                >
                  ~/conversaciones/{testimonial.source.hash}
                </Link>
              )}
            </figcaption>
          </figure>
        ))}
      </RuledGrid>
    </section>
  );
}
