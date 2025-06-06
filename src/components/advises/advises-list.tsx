'use client';

import { AdviseCard } from '@components/advises/advise-card';
import { useQuery } from '@tanstack/react-query';
import { fetchAdvises } from '@/actions/advises/fetch-advises';
import { AddAdvise } from './add-advise';
import { Session, User } from '@prisma/client';
import { Heading2 } from '../ui/heading-2';

export const AdvisesList = ({ session }: { session: (Session & { user: User }) | null }) => {
  const { data: advises = [], refetch } = useQuery({
    queryKey: ['advises'],
    queryFn: () => fetchAdvises(1),
  });

  return (
    <div className="relative">
      <div className="bg-background/95 pb-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full flex-row items-center justify-between">
          <Heading2 className="m-0">Consejos</Heading2>
          {session && <AddAdvise refetch={refetch} />}
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

            {advises.map((advise) => (
              <div key={advise.id} className="w-full lg:w-[calc(50%-8px)]">
                <AdviseCard advise={advise} session={session} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
