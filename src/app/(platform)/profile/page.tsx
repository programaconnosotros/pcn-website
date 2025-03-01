import { Heading2 } from '@components/ui/heading-2';
import { SignOut } from '@components/auth/sign-out';
import { ProfileForm } from '@components/profile/profile-form';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const Profile = async () => {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    console.error('Usuario no autenticado, redireccionando a /home');
    redirect('/home');
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
  });

  if (!session) {
    console.error('Usuario no autenticado, redireccionando a /home');
    redirect('/home');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
  });

  if (!user) {
    console.error('Usuario no encontrado, redireccionando a /home');
    redirect('/home');
  }

  return (
    <div className="mt-4 px-6 md:px-20">
      <div className="mb-4 flex items-center gap-4">
        {user.image && (
          <Image
            src={user.image}
            alt="Profile picture"
            width={40}
            height={40}
            className="rounded-full"
          />
        )}

        <Heading2>Mi perfil</Heading2>
      </div>

      <ProfileForm user={user} />
      <SignOut />
    </div>
  );
};

export default Profile;
