import { Heading2 } from '@components/ui/heading-2';
import { SignOut } from '@components/auth/sign-out';
import { ProfileForm } from '@components/profile/profile-form';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const Profile = async () => {
  const session = await auth();

  if (!session) throw new Error('User not found');

  const user = await prisma.user.findUnique({
    where: {
      id: session.user?.id,
    },
  });

  if (!user) throw new Error('User not found');

  return (
    <div className="mt-4 md:px-20">
      <Heading2>Mi perfil</Heading2>
      <ProfileForm user={user} />
      <SignOut />
    </div>
  );
};

export default Profile;
