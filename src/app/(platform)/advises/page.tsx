import { AddAdvise } from '@components/advises/add-advise';
import { AdviseCard } from '@components/advises/advise-card';
import prisma from '@/lib/prisma';
import { Heading2 } from '@components/ui/heading-2';
import { auth } from '@/auth';

// TODO: Add infinite scroll to load more advises and improve performance.
// TODO: Allow users to order advises by number of likes.

const AdvisesPage = async () => {
  const session = await auth();

  const advises = await prisma.advise.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="mt-4 md:px-20">
      <div className="mb-6 flex items-center justify-between">
        <Heading2>Consejos</Heading2>
        {session && <AddAdvise />}
      </div>

      <div className="col-span-1 mb-10 space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3 lg:gap-6">
        {advises.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground">
            No hay consejos para ver aún.
          </p>
        )}

        {advises.map((advise) => (
          <AdviseCard key={advise.id} advise={advise} />
        ))}
      </div>
    </div>
  );
};

export default AdvisesPage;
