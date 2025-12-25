import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Heading2 } from '@/components/ui/heading-2';
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
import { TestimonialsClient } from './testimonials-client';

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
    ? testimonials.some((testimonial: typeof testimonials[0]) => testimonial.userId === currentUserId)
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
                <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
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
          <div className="mb-6">
            <Heading2 className="m-0">Testimonios</Heading2>
          </div>

          <TestimonialsClient
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
