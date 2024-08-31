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

      <div className="mb-10 flex flex-col md:-mx-2 md:flex-row">
        {advises.length === 0 && (
          <p className="w-full text-center text-sm text-muted-foreground">
            No hay consejos para ver aún.
          </p>
        )}

        {[0, 1, 2].map((columnIndex) => (
          <div key={columnIndex} className="flex-1 md:px-2">
            {advises
              .filter((_, index) => index % 3 === columnIndex)
              .map((advise, index) => (
                <div key={advise.id} className={`mb-4 md:mb-0 ${index > 0 ? 'mt-4' : ''}`}>
                  <AdviseCard advise={advise} />
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvisesPage;
