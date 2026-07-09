import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'programaConNosotros',
    short_name: 'PCN',
    description: 'Comunidad de apasionados por la ingeniería de software.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#09090b',
    orientation: 'portrait',
    icons: [
      {
        src: '/pwa-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-icon-192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/pwa-icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Eventos',
        short_name: 'Eventos',
        description: 'Ver los eventos programados de la comunidad',
        url: '/eventos',
        icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Conversaciones',
        short_name: 'Conversaciones',
        description: 'Ver conversaciones y debates del grupo',
        url: '/conversaciones',
        icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Cursos',
        short_name: 'Cursos',
        description: 'Acceder a los cursos de formación',
        url: '/cursos',
        icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Lectura',
        short_name: 'Lectura',
        description: 'Explorar artículos y recomendaciones de lectura',
        url: '/lectura',
        icons: [{ src: '/pwa-icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
