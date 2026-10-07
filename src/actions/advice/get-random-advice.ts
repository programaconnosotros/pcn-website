import prisma from '@/lib/prisma';

export const getRandomAdvice = async () => {
  const adviceCount = await prisma.advice.count();
  const randomSkip = Math.floor(Math.random() * adviceCount);

  const randomAdvice = await prisma.advice.findFirst({
    skip: randomSkip,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return randomAdvice;
};
