import prisma from '@/lib/prisma';
import { ProfileForm } from '@components/profile/profile-form';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { findSession } from '@/lib/session';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'whoami' };

const Profile = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    console.error('Usuario no autenticado, redireccionando a /home');
    redirect('/');
  }

  const session = await findSession(sessionId);

  if (!session) {
    console.error('Usuario no autenticado, redireccionando a /home');
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    include: {
      languages: true,
      positions: { orderBy: { order: 'asc' } },
    },
  });

  if (!user) {
    console.error('Usuario no encontrawdo, redireccionando a /home');
    redirect('/');
  }

  const userLanguages = user.languages
    ? user.languages.map((language) => ({
        languageId: language.language,
        color: language.color,
        logo: language.logo,
      }))
    : [];

  return (
    <>
      <div className="mt-4 px-4 md:px-10">
        <StickyHeader className="md:-mx-10 md:px-10">
          <PageTitle path="perfil" meta={user.email} />
        </StickyHeader>

        <ProfileForm user={user} languages={userLanguages} />
      </div>
    </>
  );
};

export default Profile;
