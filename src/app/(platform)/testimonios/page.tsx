import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { fetchTestimonials } from '@/actions/testimonials/fetch-testimonials';
import { TestimonialsClientWrapper } from './testimonials-client-wrapper';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Testimonios',
  description:
    'Historias reales de miembros que crecieron junto a la comunidad. Descubrí cómo programaConNosotros impactó en su carrera profesional.',
  openGraph: {
    title: 'Testimonios | programaConNosotros',
    description:
      'Historias reales de miembros que crecieron junto a la comunidad. Descubrí cómo programaConNosotros impactó en su carrera profesional.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/testimonios`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Testimonios | programaConNosotros',
    description:
      'Historias reales de miembros que crecieron junto a la comunidad. Descubrí cómo programaConNosotros impactó en su carrera profesional.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const TestimoniosPage = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  let currentUserId: string | undefined = undefined;
  let isAdmin = false;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (session) {
      currentUserId = session.userId;
      isAdmin = session.user.role === 'ADMIN';
    }
  }

  const testimonials = await fetchTestimonials();

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
