import type { MetadataRoute } from 'next';
import { visibleExtractedConsejos } from '@/lib/hidden-consejos';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { getAllCourses } from '@/lib/recommendations';
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
  '/foro',
  '/partners',
  '/changelog',
  '/metricas',
  '/feed',
  '/usuarios',
];

const listSitemapRecords = cached(
  'sitemap-records',
  async () => {
    const [events, advice, testimonials, setups, projects] = await Promise.all([
      prisma.event.findMany({
        where: { deletedAt: null },
        select: { id: true, updatedAt: true },
      }),
      prisma.advice.findMany({ select: { id: true, updatedAt: true } }),
      prisma.testimonial.findMany({ select: { id: true, updatedAt: true } }),
      prisma.setup.findMany({ select: { id: true, updatedAt: true } }),
      prisma.project.findMany({ select: { id: true, updatedAt: true } }),
    ]);
    return { events, advice, testimonials, setups, projects };
  },
  { models: ['Event', 'Advice', 'Testimonial', 'Setup', 'Project'] },
);

async function dynamicRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const { events, advice, testimonials, setups, projects } = await listSitemapRecords();

    return [
      ...events.map((e) => ({ url: `${SITE_URL}/eventos/${e.id}`, lastModified: e.updatedAt })),
      ...advice.map((a) => ({ url: `${SITE_URL}/consejos/${a.id}`, lastModified: a.updatedAt })),
      ...(await visibleExtractedConsejos()).map((c) => ({
        url: `${SITE_URL}/consejos/${c.id}`,
        lastModified: new Date(c.conversation.date),
      })),
      ...testimonials.map((t) => ({
        url: `${SITE_URL}/testimonios/${t.id}`,
        lastModified: t.updatedAt,
      })),
      ...setups.map((s) => ({ url: `${SITE_URL}/setups/${s.id}`, lastModified: s.updatedAt })),
      ...projects.map((p) => ({ url: `${SITE_URL}/proyectos/${p.id}`, lastModified: p.updatedAt })),
    ];
  } catch (error) {
    // A database outage should still serve the static part of the sitemap.
    console.error('sitemap: failed to load dynamic routes', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A database outage leaves the courses out, like the other dynamic routes.
  const courses = (await getAllCourses().catch(() => [])).map((course) => ({
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
