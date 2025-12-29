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
import { fetchTestimonial } from '@/actions/testimonials/fetch-testimonial';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TestimonialDetailActions } from './testimonial-detail-actions';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const testimonial = await fetchTestimonial(params.id);

  if (!testimonial) {
    return {
      title: 'Testimonio no encontrado (PCN)',
      description: 'El testimonio que buscas no existe.',
    };
  }

  const title = `Testimonio de ${testimonial.user.name} (PCN)`;
  const description =
    testimonial.body.length > 160
      ? testimonial.body.substring(0, 157) + '...'
      : testimonial.body;
  const pageUrl = `${SITE_URL}/testimonios/${params.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`${SITE_URL}/pcn-link-preview.png`],
      url: pageUrl,
      type: 'article',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/pcn-link-preview.png`],
    },
  };
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const TestimonialDetailPage = async ({ params }: { params: { id: string } }) => {
  const id = params.id;

  const testimonial = await fetchTestimonial(id);

  if (!testimonial) {
    redirect('/testimonios');
  }

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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/testimonios">Testimonios</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Testimonio de {testimonial.user.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/testimonios">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Heading2 className="m-0">Testimonio</Heading2>
            </div>
            <TestimonialDetailActions
              testimonial={testimonial}
              canEdit={isAdmin || currentUserId === testimonial.userId}
              isAdmin={isAdmin}
            />
          </div>

          <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={testimonial.user.image || undefined}
                      alt={testimonial.user.name}
                    />
                    <AvatarFallback className="text-lg">
                      {testimonial.user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Link
                        href={`/perfil/${testimonial.user.id}`}
                        className="text-xl font-semibold transition-colors hover:text-pcnPurple hover:underline dark:hover:text-pcnGreen"
                      >
                        {testimonial.user.name}
                      </Link>
                      {isAdmin && testimonial.featured && (
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    {testimonial.featured && (
                      <Badge variant="default" className="w-fit">
                        Destacado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
                    {testimonial.body}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Publicado el {formatDate(testimonial.createdAt)}
                  </p>
                  {testimonial.updatedAt.getTime() !== testimonial.createdAt.getTime() && (
                    <p className="text-sm text-muted-foreground">
                      Actualizado el {formatDate(testimonial.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TestimonialDetailPage;
