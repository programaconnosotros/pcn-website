import { AdviseCard } from '@/components/advises/advise-card';
import { AddAdvise } from '@/components/advises/add-advise';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';
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
import { Handshake } from 'lucide-react';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Consejos (PCN)',
  description: 'Compartí y descubrí consejos valiosos sobre ingeniería de software.',
  openGraph: {
    title: 'Consejos (PCN)',
    description: 'Compartí y descubrí consejos valiosos sobre ingeniería de software.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/consejos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consejos (PCN)',
    description: 'Compartí y descubrí consejos valiosos sobre ingeniería de software.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const AdvicePage = async () => {
  const sessionId = cookies().get('sessionId')?.value;
  let session: (Session & { user: User }) | null = null;

  if (sessionId) {
    session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
  }

  const advises = await prisma.advise.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: true,
      likes: true,
    },
  });

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
                <BreadcrumbPage>Consejos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full flex-row items-center justify-between">
              <Heading2 className="m-0 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
                  <Handshake className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
                </div>
                <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Consejos</span>
              </Heading2>
              {session && <AddAdvise />}
            </div>
          </div>

          {advises.length === 0 ? (
            <p className="w-full text-center text-sm text-muted-foreground">
              No hay consejos para ver aún.
            </p>
          ) : (
            <>
              <div className="space-y-4 xl:hidden">
                {advises.map((advise) => (
                  <div key={advise.id}>
                    <AdviseCard advise={advise} session={session} />
                  </div>
                ))}
              </div>

              <div className="hidden xl:block">
                <div className="mb-4 columns-2 gap-4">
                  {advises.map((advise) => (
                    <div key={advise.id} className="mb-4 break-inside-avoid">
                      <AdviseCard advise={advise} session={session} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdvicePage;
