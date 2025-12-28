import { getCurrentSession } from '@/actions/auth/get-current-session';
import { AdviseCard } from '@/components/advises/advise-card';
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
import { Github, Linkedin, Pencil, Twitter, Briefcase, GraduationCap, MapPin, Quote } from 'lucide-react';
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
      include: {
        advises: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
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

    // Seleccionar solo los campos necesarios del usuario
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      countryOfOrigin: user.countryOfOrigin,
      province: user.province,
      slogan: user.slogan,
      jobTitle: user.jobTitle,
      enterprise: user.enterprise,
      career: user.career,
      studyPlace: user.studyPlace,
      xAccountUrl: user.xAccountUrl,
      linkedinUrl: user.linkedinUrl,
      gitHubUrl: user.gitHubUrl,
      advises: user.advises,
      languages: user.languages,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    // Si el error es porque el usuario no existe, usar notFound
    if (error instanceof Error && error.message.includes('Record to find does not exist')) {
      notFound();
    }
    // Re-lanzar el error original para debugging
    throw error;
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
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
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
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna izquierda: Información del usuario (fija en pantallas grandes) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'Usuario'} />
                  <AvatarFallback>{user.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-2xl font-semibold">{user.name}</h1>
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

              <div className="flex flex-col items-end gap-2">
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
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {/* Slogan */}
                {user.slogan && (
                  <div>
                    <div className="flex items-start gap-2">
                      <Quote className="mt-1 h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                      <div>
                        <h2 className="mb-1 font-semibold">Slogan</h2>
                        <p className="text-muted-foreground italic">{user.slogan}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información laboral */}
                {(user.jobTitle || user.enterprise) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                      <h2 className="font-semibold">Información laboral</h2>
                    </div>
                    <div className="space-y-1 pl-7">
                      {user.jobTitle && (
                        <p>
                          <span className="font-medium">Cargo:</span> {user.jobTitle}
                        </p>
                      )}
                      {user.enterprise && (
                        <p>
                          <span className="font-medium">Empresa:</span> {user.enterprise}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Información académica */}
                {(user.career || user.studyPlace) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                      <h2 className="font-semibold">Información académica</h2>
                    </div>
                    <div className="space-y-1 pl-7">
                      {user.career && (
                        <p>
                          <span className="font-medium">Carrera:</span> {user.career}
                        </p>
                      )}
                      {user.studyPlace && (
                        <p>
                          <span className="font-medium">Institución:</span> {user.studyPlace}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                {(user.countryOfOrigin || user.province) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                      <h2 className="font-semibold">Ubicación</h2>
                    </div>
                    <div className="space-y-1 pl-7">
                      {user.countryOfOrigin && <p>{user.countryOfOrigin}</p>}
                      {user.province && <p className="text-sm text-muted-foreground">{user.province}</p>}
                    </div>
                  </div>
                )}

                {/* Lenguajes de programación */}
                <div>
                  <h2 className="mb-2 font-semibold">Lenguajes de programación</h2>
                  {userLanguages.length > 0 ? (
                    <LanguageCoinsContainer languages={userLanguages} />
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay lenguajes registrados</p>
                  )}
                </div>
              </div>
            </CardContent>
              </Card>
            </div>
          </div>

          {/* Columna derecha: Consejos y demás contenido */}
          <div className="lg:col-span-2">
            <div>
              <h2 className="mb-4 text-2xl font-semibold">Consejos compartidos</h2>
              {user.advises.length === 0 ? (
                <p className="text-gray-500">Este usuario aún no ha compartido ningún consejo.</p>
              ) : (
                <div className="space-y-4">
                  {user.advises.map((advise) => (
                    <AdviseCard key={advise.id} session={session} advise={advise} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
