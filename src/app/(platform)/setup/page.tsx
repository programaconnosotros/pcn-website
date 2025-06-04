import { SetupsList } from '@/components/setup/setups-list';
import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';
import { cookies } from 'next/headers';

const SetupsPage = async () => {
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

  return (
    <div className="mt-4 md:px-20">
      <SetupsList session={session} />
    </div>
  );
};

export default SetupsPage;
