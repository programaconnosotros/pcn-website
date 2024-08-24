import { Advises } from '@/components/advises/advises';
import prisma from '@/lib/prisma';

// TODO: Add infinite scroll to load more advises and improve performance.
// TODO: Allow users to order advises by number of likes.

const Feed = async () => {
  const advises = await prisma.advise.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return <Advises advises={advises} />;
};

export default Feed;
