import { AdviseCard } from '@components/advises/advise-card';
import prisma from '@/lib/prisma';

// TODO: Add infinite scroll to load more advises and improve performance.
// TODO: Allow users to order advises by number of likes.

const Home = async () => {
  const advises = await prisma.advise.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <>
      <div className="mb-4 flex justify-between">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Hola!</h1>
      </div>

      <div className="space-y-4">
        {advises.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No hay consejos para ver aún.</p>
        )}

        {advises.map((advise) => (
          <AdviseCard key={advise.id} advise={advise} />
        ))}
      </div>
    </>
  );
};

export default Home;
