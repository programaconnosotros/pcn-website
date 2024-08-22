import { auth } from '@/auth';
import Advises from '@/components/advises/advises';
import { SignOut } from '@/components/auth/sign-out';
import { SidebarDemo } from '@/components/sidebar-demo';
import prisma from '@/lib/prisma';

const Feed = async () => {
  const advises = await prisma.advise.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      {/* <SidebarDemo /> */}
      <Advises advises={advises} />
    </div>
  );
};

export default Feed;
