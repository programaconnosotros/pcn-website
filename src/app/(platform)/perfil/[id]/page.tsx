import { getCurrentSession } from '@/actions/auth/get-current-session';
import { AdviseCard } from '@/components/advises/advise-card';
import { GitHubSVG } from '@/components/logos/GitHubSVG';
import { LanguageCoinsContainer } from '@/components/profile/language-coins-container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import prisma from '@/lib/prisma';
import { Github, Linkedin, Pencil, Twitter } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface ProfilePageProps {
  params: {
    id: string;
  };
}

async function getUser(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        countryOfOrigin: true,
        xAccountUrl: true,
        linkedinUrl: true,
        gitHubUrl: true,
        advises: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            author: true,
            likes: true,
          },
        },
        languages: {
          select: {
            language: true,
            color: true,
            logo: true,
          },
        },
      },
    });

    if (!user) {
      notFound();
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user profile');
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getUser(params.id);
  const session = await getCurrentSession();

  const userLanguages = user.languages
    ? user.languages.map((language) => ({
        languageId: language.language,
        color: language.color,
        logo: language.logo,
      }))
    : [];

  const isOwnProfile = session?.user?.id === params.id;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{user.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'Usuario'} />
                  <AvatarFallback>{user.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {isOwnProfile && (
                    <Link href="/perfil">
                      <Button
                        variant="link"
                        className="mt-1 flex h-auto items-center gap-1 p-0 text-sm text-gray-400 hover:text-white"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Editar perfil</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {user.xAccountUrl && (
                  <a
                    href={user.xAccountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:underline"
                    aria-label={`Perfil de X (anteriormente Twitter) de ${user.name}`}
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}

                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:underline"
                    aria-label={`Perfil de LinkedIn de ${user.name}`}
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h2 className="font-semibold">País de origen</h2>
                  <p>{user.countryOfOrigin || '-'}</p>
                </div>

                <div>
                  <h2 className="mb-2 font-semibold">Lenguajes de programación</h2>
                  <LanguageCoinsContainer languages={userLanguages} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">Consejos compartidos</h2>
            {user.advises.length === 0 ? (
              <p className="text-gray-500">Este usuario aún no ha compartido ningún consejo.</p>
            ) : (
              <div className="space-y-4">
                {user.advises.map((advise) => (
                  <AdviseCard key={advise.id} session={session} advise={advise} />
                ))}
              </div>
            )}
            {user.gitHubUrl && (
              <a
                href={user.gitHubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:underline"
                aria-label={`Perfil de GitHub de ${user.name}`}
              >
                <Github className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
