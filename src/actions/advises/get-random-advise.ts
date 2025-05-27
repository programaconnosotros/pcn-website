import prisma from '@/lib/prisma';

export const getRandomAdvise = async () => {
  const advisesCount = await prisma.advise.count();
  const randomSkip = Math.floor(Math.random() * advisesCount);

  const randomAdvise = await prisma.advise.findFirst({
    skip: randomSkip,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return randomAdvise;
};
