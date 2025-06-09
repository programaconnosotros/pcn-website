import { fetchSetups } from '@/actions/setup/fetch-setups';
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

  const setups = await fetchSetups(1);

  return (
    <div className="mt-4 md:px-20">
      <SetupsList session={session} initialSetups={setups} />
    </div>
  );
};

export default SetupsPage;
