import { AdviseCard } from '@/components/advises/advise-card';
import { AddAdvise } from '@/components/advises/add-advise';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Session, User, Advise } from '@prisma/client';
import { Heading2 } from '@/components/ui/heading-2';
import { Suspense } from 'react';

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
    <div className="mt-4 md:px-20">
      <div className="bg-background/95 pb-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full flex-row items-center justify-between">
          <Heading2 className="m-0">Consejos</Heading2>
          {session && <AddAdvise />}
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
            {advises.length === 0 && (
              <p className="w-full text-center text-sm text-muted-foreground">
                No hay consejos para ver aún.
              </p>
            )}

            <Suspense fallback={<div>Cargando consejos...</div>}>
              {advises.map((advise) => (
                <div key={advise.id} className="w-full lg:w-[calc(50%-8px)]">
                  <AdviseCard advise={advise} session={session} />
                </div>
              ))}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvicePage;
