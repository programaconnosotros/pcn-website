import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { SectionHeader } from './section-header';

export type FeaturedTestimonial = {
  id: string;
  body: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const TestimonialsSection = ({ testimonials }: { testimonials: FeaturedTestimonial[] }) => {
  if (testimonials.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow="Testimonios"
        title="Lo que dicen nuestros miembros"
        action={{ label: 'Ver todos los testimonios', href: '/testimonios' }}
      />

      <RuledGrid className="md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure key={testimonial.id} className={cn(ruledCellClassName, 'flex flex-col p-4')}>
            <blockquote className="line-clamp-6 flex-1 text-sm leading-relaxed text-foreground/85">
              <span aria-hidden className="font-mono text-pcnGreen">
                &gt;{' '}
              </span>
              {testimonial.body}
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2">
              <Avatar className="size-6 rounded-sm">
                <AvatarImage
                  src={testimonial.user.image ?? undefined}
                  alt={testimonial.user.name}
                />
                <AvatarFallback className="rounded-sm bg-pcnGreen/10 text-[10px] font-semibold text-pcnGreen">
                  {initials(testimonial.user.name)}
                </AvatarFallback>
              </Avatar>
              <p className="min-w-0 truncate font-mono text-[11px] text-muted-foreground">
                <span className="text-pcnGreen-500">@ </span>
                {testimonial.user.name}
              </p>
            </figcaption>
          </figure>
        ))}
      </RuledGrid>
    </section>
  );
};
