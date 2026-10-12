import prisma from '@/lib/prisma';
import { findExtractedConsejo } from '@/data/consejos-extraidos';
import { getCourseById } from '@/lib/recommendations';
import { listForumCategories } from '@/lib/forum';
import { getGuideMeta } from '@/app/(platform)/entrevistas/guias/guides';
import { matchSiteRoute } from '@/lib/site-routes';

// Qué tiene que existir para que cuente la visita a cada segmento dinámico de SITE_ROUTES. Sin
// esto, `/eventos/estafa-reclama-tu-premio` pasaría por una ruta real y llegaría a /metricas.
// Las consultas no van por `cached()`: el valor lo elige quien llama a trackPageVisit, y cachear
// cada id inventado llenaría el cache.
const byId = (find: (_id: string) => Promise<unknown>) => async (id: string) =>
  Boolean(await find(id));

export const PARAM_TARGETS: Record<string, (_value: string) => Promise<boolean>> = {
  '/[shortcut]': byId((shortcut) =>
    prisma.event.findFirst({
      where: { shortcut: shortcut.toLowerCase(), deletedAt: null },
      select: { id: true },
    }),
  ),
  '/consejos/[id]': byId(async (id) =>
    findExtractedConsejo(id)
      ? true
      : prisma.advice.findUnique({ where: { id }, select: { id: true } }),
  ),
  '/cursos/[courseId]': byId(getCourseById),
  '/entrevistas/guias/[guia]': byId(async (guia) => getGuideMeta(guia)),
  '/eventos/[id]': byId((id) => prisma.event.findUnique({ where: { id }, select: { id: true } })),
  '/foro/categoria/[slug]': async (slug) =>
    (await listForumCategories()).some((category) => category.slug === slug),
  '/foro/tema/[id]': byId((id) =>
    prisma.forumPost.findUnique({ where: { id }, select: { id: true } }),
  ),
  '/galeria/[id]': byId((id) =>
    prisma.galleryItem.findUnique({ where: { id }, select: { id: true } }),
  ),
  '/perfil/[id]': byId((id) => prisma.user.findUnique({ where: { id }, select: { id: true } })),
  '/proyectos/[id]': byId((id) =>
    prisma.project.findUnique({ where: { id }, select: { id: true } }),
  ),
  '/setups/[id]': byId((id) => prisma.setup.findUnique({ where: { id }, select: { id: true } })),
  '/testimonios/[id]': byId((id) =>
    prisma.testimonial.findUnique({ where: { id }, select: { id: true } }),
  ),
};

/**
 * `true` si `path` es una página del sitio y lo que nombran sus segmentos dinámicos existe (el
 * evento, el perfil, el atajo...). Espera una ruta que ya pasó `isSitePath`.
 */
export const isExistingPage = async (path: string) => {
  const match = matchSiteRoute(path);
  if (!match) return false;

  for (const { route, value } of match.params) {
    const exists = PARAM_TARGETS[route];
    const decoded = decodeSegment(value);
    if (!exists || decoded === null || !(await exists(decoded))) return false;
  }
  return true;
};

const decodeSegment = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null; // `%` suelto: no es una URL que el sitio genere
  }
};
