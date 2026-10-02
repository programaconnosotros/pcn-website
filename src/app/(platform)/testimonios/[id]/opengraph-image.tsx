import { fetchTestimonial } from '@/actions/testimonials/fetch-testimonial';
import { OG_CONTENT_TYPE, OG_SIZE, renderTerminalCard } from '@/lib/og/terminal-card';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Testimonio de la comunidad programaConNosotros';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const testimonial = await fetchTestimonial(id);

  return renderTerminalCard({
    path: 'testimonios',
    command: testimonial ? `cat testimonio --autor "${testimonial.user.name}"` : 'cat testimonios',
    title: testimonial ? `“${testimonial.body}”` : 'Testimonios de la comunidad',
    meta: testimonial ? [`@${testimonial.user.name}`] : [],
  });
}
