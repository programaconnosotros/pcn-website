import { getCurrentSession } from '@/actions/auth/get-current-session';
import { AdviseCard } from '@/components/advises/advise-card';
import { LanguageCoinsContainer } from '@/components/profile/language-coins-container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import prisma from '@/lib/prisma';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Images, Lightbulb, MicVocal, Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      name: true,
      slogan: true,
      image: true,
    },
  });

  if (!user) {
    return {
      title: 'Perfil no encontrado',
      description: 'El perfil que buscas no existe.',
    };
  }

  const title = user.name;
  const description = user.slogan
    ? `Perfil de ${user.name} en programaConNosotros. ${user.slogan}`
    : `Perfil de ${user.name} en programaConNosotros. Miembro de la comunidad.`;
  const imageUrl = user.image
    ? user.image.startsWith('http')
      ? user.image
      : `${SITE_URL}${user.image}`
    : `${SITE_URL}/pcn-link-preview.png`;
  const pageUrl = `${SITE_URL}/perfil/${params.id}`;

  return {
    title,
    description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    openGraph: {
      title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      images: [imageUrl],
      url: pageUrl,
      type: 'profile',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      images: [imageUrl],
    },
  };
}

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
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
      phoneNumber: (user as any).phoneNumber ?? null,
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

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
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

  const profileFacts: { label: string; value: string; href?: string }[] = [
    { label: 'cargo', value: user.jobTitle },
    { label: 'empresa', value: user.enterprise },
    { label: 'carrera', value: user.career },
    { label: 'institución', value: user.studyPlace },
    {
      label: 'ubicación',
      value: [user.province, user.countryOfOrigin].filter(Boolean).join(', '),
    },
    { label: 'email', value: user.email, href: user.email ? `mailto:${user.email}` : undefined },
    {
      label: 'teléfono',
      value: user.phoneNumber,
      href: user.phoneNumber ? `tel:${user.phoneNumber}` : undefined,
    },
  ].filter((fact): fact is { label: string; value: string; href?: string } => !!fact.value);

  const userTalks = await prisma.talk.findMany({
    where: { speakers: { some: { userId: user.id } } },
    include: {
      event: { select: { date: true, placeName: true, city: true } },
      speakers: { orderBy: { order: 'asc' } },
    },
    orderBy: [{ event: { date: 'desc' } }, { createdAt: 'desc' }],
  });

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
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Columna izquierda: Información del usuario (fija en pantallas grandes) */}
          <div className="lg:col-span-1">
            <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200 lg:sticky lg:top-4">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12 rounded-sm">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'Usuario'} />
                  <AvatarFallback className="rounded-sm">{user.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h1 className="truncate font-mono text-base font-semibold">{user.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-3 font-mono text-[11px] text-muted-foreground">
                    {user.xAccountUrl && (
                      <a
                        href={user.xAccountUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pcnGreen"
                        aria-label={`Perfil de X (anteriormente Twitter) de ${user.name}`}
                      >
                        x↗
                      </a>
                    )}
                    {user.linkedinUrl && (
                      <a
                        href={user.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pcnGreen"
                        aria-label={`Perfil de LinkedIn de ${user.name}`}
                      >
                        linkedin↗
                      </a>
                    )}
                    {user.gitHubUrl && (
                      <a
                        href={user.gitHubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pcnGreen"
                        aria-label={`Perfil de GitHub de ${user.name}`}
                      >
                        github↗
                      </a>
                    )}
                    {isOwnProfile && (
                      <Link href="/perfil" className="flex items-center gap-1 hover:text-pcnGreen">
                        <Pencil className="h-3 w-3" />
                        editar
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {user.slogan && (
                <p className="p-4 text-sm italic leading-relaxed text-muted-foreground">
                  <span className="not-italic text-pcnGreen-500">&gt; </span>
                  {user.slogan}
                </p>
              )}

              {profileFacts.length > 0 && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 p-4 text-xs">
                  {profileFacts.map((fact) => (
                    <div key={fact.label} className="contents">
                      <dt className="font-mono text-pcnGreen-500">{fact.label}</dt>
                      <dd className="min-w-0 break-words">
                        {fact.href ? (
                          <a href={fact.href} className="text-pcnGreen hover:underline">
                            {fact.value}
                          </a>
                        ) : (
                          fact.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="p-4">
                <h2 className="mb-2 font-mono text-xs font-semibold text-muted-foreground">
                  <span className="text-pcnGreen-500">## </span>lenguajes
                </h2>
                {userLanguages.length > 0 ? (
                  <LanguageCoinsContainer languages={userLanguages} />
                ) : (
                  <p className="text-xs text-muted-foreground">No hay lenguajes registrados</p>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha: Tabs con Consejos, Fotos y Charlas */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="consejos" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="consejos" className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Consejos
                  <span className="font-mono text-[11px] text-muted-foreground">
                    [{user.advises.length}]
                  </span>
                </TabsTrigger>
                <TabsTrigger value="fotos" className="gap-2">
                  <Images className="h-4 w-4" />
                  Fotos
                </TabsTrigger>
                <TabsTrigger value="charlas" className="gap-2">
                  <MicVocal className="h-4 w-4" />
                  Charlas
                  <span className="font-mono text-[11px] text-muted-foreground">
                    [{userTalks.length}]
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="consejos" className="mt-4">
                {user.advises.length === 0 ? (
                  <p className="font-mono text-xs text-muted-foreground">
                    Este usuario aún no ha compartido ningún consejo.
                  </p>
                ) : (
                  <RuledGrid className="grid-cols-1">
                    {user.advises.map((advise) => (
                      <AdviseCard key={advise.id} session={session} advise={advise} />
                    ))}
                  </RuledGrid>
                )}
              </TabsContent>

              <TabsContent value="fotos" className="mt-4">
                <p className="font-mono text-xs text-muted-foreground">
                  Las fotos estarán disponibles próximamente.
                </p>
              </TabsContent>

              <TabsContent value="charlas" className="mt-4">
                {userTalks.length === 0 ? (
                  <p className="font-mono text-xs text-muted-foreground">
                    Este usuario aún no ha dado ninguna charla.
                  </p>
                ) : (
                  <RuledGrid className="grid-cols-1">
                    {userTalks.map((talk) => {
                      const location = [talk.event?.placeName, talk.event?.city]
                        .filter(Boolean)
                        .join(', ');
                      const meta = [
                        talk.event?.date &&
                          new Date(talk.event.date).toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }),
                        location,
                      ]
                        .filter(Boolean)
                        .join(' · ');
                      return (
                        <div key={talk.id} className={cn(ruledCellClassName, 'flex gap-3 p-3')}>
                          {talk.portraitUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={talk.portraitUrl}
                              alt={`Foto de la charla "${talk.title}"`}
                              className="h-16 w-16 shrink-0 object-cover"
                            />
                          )}
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="flex items-center gap-2 font-mono text-sm">
                              <h3 className="truncate font-semibold">{talk.title}</h3>
                              {talk.videoUrl && (
                                <a
                                  href={talk.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-auto flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground hover:text-pcnGreen"
                                >
                                  youtube
                                  <ArrowUpRight className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {talk.speakers.map((speaker) => speaker.speakerName).join(', ')}
                            </p>
                            {meta && (
                              <p className="truncate font-mono text-[11px] text-muted-foreground/70">
                                <span className="text-pcnGreen-500">@ </span>
                                {meta}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </RuledGrid>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
