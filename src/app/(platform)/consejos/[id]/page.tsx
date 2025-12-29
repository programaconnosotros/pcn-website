import { AdviseCard } from '@/components/advises/advise-card';
import { CommentSection } from '@/components/advises/comment-section';
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
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const advise = await prisma.advise.findUnique({
    where: { id: params.id },
    select: {
      content: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!advise) {
    return {
      title: 'Consejo no encontrado (PCN)',
      description: 'El consejo que buscas no existe.',
    };
  }

  const title = `Consejo de ${advise.author.name} (PCN)`;
  const description = advise.content.length > 160 ? advise.content.substring(0, 157) + '...' : advise.content;
  const pageUrl = `${SITE_URL}/consejos/${params.id}`;

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

export default async function AdvisePage({ params }: { params: { id: string } }) {
  const sessionId = cookies().get('sessionId');

  const session = sessionId
    ? await prisma.session.findUnique({
        where: { id: sessionId.value },
        include: { user: true },
      })
    : null;

  const advise = await prisma.advise.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      likes: true,
      comments: {
        where: {
          parentCommentId: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: true,
          replies: {
            include: { author: true },
          },
        },
      },
    },
  });

  if (!advise) {
    return <div>Consejo no encontrado</div>;
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
                <BreadcrumbLink href="/consejos">Consejos</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Consejo de {advise.author.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <AdviseCard advise={advise} session={session} />
          <CommentSection adviseId={advise.id} comments={advise.comments} session={session} />
        </div>
      </div>
    </>
  );
}
