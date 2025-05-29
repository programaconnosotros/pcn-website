import { AdvisesList } from '@/components/advises/advises-list';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';

const AdvisesPage = async () => {
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
      <AdvisesList session={session} />
    </div>
  );
};

export default AdvisesPage;
