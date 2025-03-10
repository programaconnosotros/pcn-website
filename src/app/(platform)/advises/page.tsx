import { AdvisesList } from '@/components/advises/advises-list';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Session } from '@prisma/client';

const AdvisesPage = async () => {
  const sessionId = await cookies().get('sessionId')?.value;
  let session: Session | null = null;

  if (sessionId) {
    session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
  }

  return (
    <div className="mt-4 md:px-20">
      <AdvisesList showAddAdviseButton={!!session} />
    </div>
  );
};

export default AdvisesPage;
