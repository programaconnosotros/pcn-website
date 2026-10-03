import { cookies } from 'next/headers';
import { fetchTestimonials } from '@/actions/testimonials/fetch-testimonials';
import { TestimonialsClientWrapper } from './testimonials-client-wrapper';
import type { Metadata } from 'next';
import { findSession } from '@/lib/session';
import { tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: tabTitle.ls('testimonios'),
  description:
    'Historias reales de miembros que crecieron junto a la comunidad. Descubrí cómo programaConNosotros impactó en su carrera profesional.',
  openGraph: {
    title: 'Testimonios | programaConNosotros',
    description:
      'Historias reales de miembros que crecieron junto a la comunidad. Descubrí cómo programaConNosotros impactó en su carrera profesional.',
    url: `${SITE_URL}/testimonios`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Testimonios | programaConNosotros',
    description:
      'Historias reales de miembros que crecieron junto a la comunidad. Descubrí cómo programaConNosotros impactó en su carrera profesional.',
  },
};

const TestimoniosPage = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;

  // La sesión y los testimonios no dependen entre sí: se piden a la vez.
  const [session, testimonials] = await Promise.all([
    sessionId ? findSession(sessionId) : null,
    fetchTestimonials(),
  ]);
  const currentUserId: string | undefined = session?.userId;
  const isAdmin = session?.user.role === 'ADMIN';

  // Verificar si el usuario actual ya tiene un testimonio
  const hasUserTestimonial = currentUserId
    ? testimonials.some(
        (testimonial: (typeof testimonials)[0]) => testimonial.userId === currentUserId,
      )
    : false;

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <TestimonialsClientWrapper
            testimonials={testimonials}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            hasUserTestimonial={hasUserTestimonial}
          />
        </div>
      </div>
    </>
  );
};

export default TestimoniosPage;
