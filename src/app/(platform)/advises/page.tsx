import { AddAdvise } from '@components/advises/add-advise';
import { AdviseCard } from '@components/advises/advise-card';
import prisma from '@/lib/prisma';
import { Heading2 } from '@components/ui/heading-2';

// TODO: Add infinite scroll to load more advises and improve performance.
// TODO: Allow users to order advises by number of likes.

const AdvisesPage = async () => {
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
      <div className="mb-4 flex justify-between items-center">
        <Heading2>Consejos</Heading2>
        <AddAdvise />
      </div>

      <div className="space-y-4">
        {advises.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No hay consejos para ver aún.</p>
        )}

        {advises.map((advise) => (
          <AdviseCard key={advise.id} advise={advise} />
        ))}
      </div>
    </div>
  );
};

export default AdvisesPage;
