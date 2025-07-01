import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';
import { cookies } from 'next/headers';
import HomeClientSide from './home-client-side';

const Home = async () => {
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

  return <HomeClientSide session={session} />;
};

export default Home;
