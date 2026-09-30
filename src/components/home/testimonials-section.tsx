import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.id}
            className="relative flex flex-col rounded-lg border border-pcnGreen-200 bg-pcnGreen-50 p-6 transition-colors hover:border-pcnGreen-200"
          >
            <span aria-hidden className="font-sans text-6xl leading-none text-pcnGreen/70">
              “
            </span>
            <blockquote className="-mt-4 flex-1 text-[15px] leading-relaxed text-foreground/85">
              {testimonial.body}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-pcnGreen-200 pt-5">
              <Avatar className="size-9 rounded-full ring-2 ring-pcnGreen/25">
                <AvatarImage
                  src={testimonial.user.image ?? undefined}
                  alt={testimonial.user.name}
                />
                <AvatarFallback className="rounded-full bg-pcnGreen/10 text-xs font-semibold text-pcnGreen">
                  {initials(testimonial.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {testimonial.user.name}
                </p>
                <p className="text-xs text-muted-foreground">Miembro de PCN</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};
