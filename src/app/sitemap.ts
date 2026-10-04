import type { MetadataRoute } from 'next';
import { extractedConsejos } from '@/data/consejos-extraidos';
import prisma from '@/lib/prisma';
import { communityCourses, externalCourses } from './(platform)/cursos/courses';
import { TRACKS } from './(platform)/entrevistas/questions/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

// Built per request so new events, advice and testimonials show up without a deploy, and so
// `next build` never needs a database.
export const dynamic = 'force-dynamic';

const STATIC_ROUTES = [
  '/',
  '/eventos',
  '/anuncios',
  '/conversaciones',
  '/charlas',
  '/podcast',
  '/desarrollo',
  '/desarrollo/calidad',
  '/desarrollo/diseno',
  '/cursos',
  '/lectura',
  '/videos',
  '/especialidades',
  '/herramientas',
  '/entrevistas',
  '/entrevistas/guias',
  '/entrevistas/live-coding',
  '/proyectos',
  '/consejos',
  '/testimonios',
  '/influencers',
  '/music',
  '/series-y-peliculas',
  '/software-recomendado',
  '/preguntas-frecuentes',
  '/historia',
  '/miembros',
  '/logros',
  '/galeria',
  '/setups',
  '/partners',
  '/changelog',
  '/metricas',
  '/feed',
  '/usuarios',
];

async function dynamicRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const [events, advises, testimonials, setups] = await Promise.all([
      prisma.event.findMany({
        where: { deletedAt: null },
        select: { id: true, updatedAt: true },
      }),
      prisma.advise.findMany({ select: { id: true, updatedAt: true } }),
      prisma.testimonial.findMany({ select: { id: true, updatedAt: true } }),
      prisma.setup.findMany({ select: { id: true, updatedAt: true } }),
    ]);

    return [
      ...events.map((e) => ({ url: `${SITE_URL}/eventos/${e.id}`, lastModified: e.updatedAt })),
      ...advises.map((a) => ({ url: `${SITE_URL}/consejos/${a.id}`, lastModified: a.updatedAt })),
      ...extractedConsejos.map((c) => ({
        url: `${SITE_URL}/consejos/${c.id}`,
        lastModified: new Date(c.conversation.date),
      })),
      ...testimonials.map((t) => ({
        url: `${SITE_URL}/testimonios/${t.id}`,
        lastModified: t.updatedAt,
      })),
      ...setups.map((s) => ({ url: `${SITE_URL}/setups/${s.id}`, lastModified: s.updatedAt })),
    ];
  } catch (error) {
    // A database outage should still serve the static part of the sitemap.
    console.error('sitemap: failed to load dynamic routes', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = [...communityCourses, ...externalCourses].map((course) => ({
    url: `${SITE_URL}/cursos/${course.id}`,
  }));
  const interviewGuides = [...TRACKS.map((track) => track.id), 'live-coding'].map((guide) => ({
    url: `${SITE_URL}/entrevistas/guias/${guide}`,
  }));

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route === '/' ? '' : route}`,
      changeFrequency: 'weekly' as const,
      priority: route === '/' ? 1 : 0.7,
    })),
    ...courses,
    ...interviewGuides,
    ...(await dynamicRoutes()),
  ];
}
