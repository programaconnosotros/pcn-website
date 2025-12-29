import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { fetchTestimonials } from '@/actions/testimonials/fetch-testimonials';
import { TestimonialsClientWrapper } from './testimonials-client-wrapper';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Testimonios (PCN)',
  description: 'Conocé la opinión de otros miembros de la comunidad.',
  openGraph: {
    title: 'Testimonios (PCN)',
    description: 'Conocé la opinión de otros miembros de la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/testimonios`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Testimonios (PCN)',
    description: 'Conocé la opinión de otros miembros de la comunidad.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const TestimoniosPage = async () => {
  const sessionId = cookies().get('sessionId')?.value;
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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Testimonios</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
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
