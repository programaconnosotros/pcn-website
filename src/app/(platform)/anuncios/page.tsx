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

const AnunciosPage = async () => {
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
                <BreadcrumbPage>Anuncios</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex w-full flex-row items-center justify-between">
              <Heading2 className="m-0">Anuncios</Heading2>
            </div>
          </div>

          <div className="flex items-center justify-center py-12">
            <p className="text-center text-lg text-muted-foreground">
              Los anuncios de la comunidad aparecerán aquí
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnunciosPage;
