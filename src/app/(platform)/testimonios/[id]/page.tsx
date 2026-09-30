import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { PageTitle } from '@/components/ui/page-title';
import { fetchTestimonial } from '@/actions/testimonials/fetch-testimonial';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TestimonialDetailActions } from './testimonial-detail-actions';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const testimonial = await fetchTestimonial(params.id);

  if (!testimonial) {
    return {
      title: 'Testimonio no encontrado',
      description: 'El testimonio que buscas no existe.',
    };
  }

  const title = `Testimonio de ${testimonial.user.name}`;
  const description =
    testimonial.body.length > 160 ? testimonial.body.substring(0, 157) + '...' : testimonial.body;
  const pageUrl = `${SITE_URL}/testimonios/${params.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'article',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
    hour12: false,
  }).format(date);
};

const TestimonialDetailPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;

  const testimonial = await fetchTestimonial(id);

  if (!testimonial) {
    redirect('/testimonios');
  }

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

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <PageTitle
              path={`testimonios/${testimonial.user.name.split(' ')[0].toLowerCase()}`}
              meta={testimonial.featured ? 'destacado' : undefined}
              className="mb-0 flex-1"
            />
            <TestimonialDetailActions
              testimonial={testimonial}
              canEdit={isAdmin || currentUserId === testimonial.userId}
              isAdmin={isAdmin}
            />
          </div>

          <div className="mb-14 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
            <div className="flex items-center gap-3 p-3">
              <Avatar className="h-9 w-9 rounded-sm">
                <AvatarImage
                  src={testimonial.user.image || undefined}
                  alt={testimonial.user.name}
                />
                <AvatarFallback className="rounded-sm text-xs">
                  {testimonial.user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Link
                href={`/perfil/${testimonial.user.id}`}
                className="truncate font-mono text-sm font-semibold transition-colors hover:text-pcnGreen"
              >
                {testimonial.user.name}
              </Link>
              {isAdmin && testimonial.featured && (
                <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
              )}
              <Link
                href="/testimonios"
                className="ml-auto flex shrink-0 items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-pcnGreen"
              >
                <ArrowLeft className="h-3 w-3" />
                volver
              </Link>
            </div>

            <p className="whitespace-pre-wrap p-3 text-sm leading-relaxed text-foreground">
              {testimonial.body}
            </p>

            <p className="p-3 font-mono text-[11px] text-muted-foreground">
              <span className="text-pcnGreen-500">$ </span>
              publicado {formatDate(testimonial.createdAt)}
              {testimonial.updatedAt.getTime() !== testimonial.createdAt.getTime() &&
                ` · actualizado ${formatDate(testimonial.updatedAt)}`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestimonialDetailPage;
