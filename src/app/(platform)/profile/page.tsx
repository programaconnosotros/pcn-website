import prisma from '@/lib/prisma';
import { ProfileForm } from '@components/profile/profile-form';
import { Heading2 } from '@components/ui/heading-2';
import { cookies } from 'next/headers';
import Image from 'next/image';
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
    include: {
      languages: true,
    },
  });

  if (!user) {
    console.error('Usuario no encontrawdo, redireccionando a /home');
    redirect('/home');
  }

  const userLanguages = user.languages
    ? user.languages.map((language) => ({
        languageId: language.language,
        color: language.color,
        logo: language.logo,
      }))
    : [];

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

      <ProfileForm user={user} languages={userLanguages} />
    </div>
  );
};

export default Profile;
