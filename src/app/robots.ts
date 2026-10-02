import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/autenticacion/',
        '/perfil',
        '/analiticas',
        '/visitas',
        '/notificaciones',
        '/monitoreo',
        '/eventos/nuevo',
        '/eventos/*/editar',
        '/eventos/*/inscripciones',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
