import type { MetadataRoute } from 'next';

const shortcutIcons = [{ src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' }];

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'programaConNosotros',
    short_name: 'PCN',
    description: 'Comunidad de apasionados por la ingeniería de software.',
    lang: 'es',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      { src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
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
      { name: 'Eventos', url: '/eventos', icons: shortcutIcons },
      { name: 'Conversaciones', url: '/conversaciones', icons: shortcutIcons },
      { name: 'Cursos', url: '/cursos', icons: shortcutIcons },
      { name: 'Lectura', url: '/lectura', icons: shortcutIcons },
    ],
  };
}
