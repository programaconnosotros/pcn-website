import type { Article } from '@/app/(platform)/lectura/articles';
import type { Book } from '@/app/(platform)/lectura/books';
import type { Course } from '@/app/(platform)/cursos/courses';
import type { Video } from '@/components/videos/videos';

// Small recommendation lists for the unit tests, in the shapes `@/lib/recommendations` returns
// (the real ones live in the database). `mockRecommendations()` is a ready jest.mock factory:
//   jest.mock('@/lib/recommendations', () => require('@/test/recommendations').mockRecommendations());

export const testVideos: Video[] = [
  {
    id: 'talk-000001',
    title: 'AI Won’t Replace Craftsmanship',
    speaker: 'Javi Velasco (Vercel)',
    channel: 'Manfred',
    date: '2026-10-06',
    durationSeconds: 2071,
    language: 'es',
    isTalk: true,
  },
  {
    id: 'video-00001',
    title: '¿Qué es esto del Harness Engineering?',
    channel: 'BettaTech',
    date: '2026-04-29',
    durationSeconds: 1515,
    language: 'es',
  },
  {
    id: 'talk-000002',
    title: 'Mastering Claude Code in 30 minutes',
    speaker: 'Boris Cherny (Anthropic)',
    channel: 'Anthropic',
    date: '2025-05-22',
    durationSeconds: 1687,
    language: 'en',
    isTalk: true,
  },
];

export const testArticles: Article[] = [
  {
    id: '1',
    title: 'Loop Engineering',
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'Programación',
    description: 'Sistemas autónomos que iteran hasta completar objetivos.',
    url: 'https://addyosmani.com/blog/loop-engineering/',
    avatar: 'https://github.com/addyosmani.png?size=128',
    date: '2026-06-07',
    language: 'en',
  },
  {
    id: '2',
    title: 'Agentic Infrastructure',
    author: 'Tom Occhino',
    coauthors: ['Guillermo Rauch'],
    source: 'vercel.com',
    category: 'Arquitectura',
    description: 'Agentes que despliegan y ejecutan software de forma autónoma.',
    url: 'https://vercel.com/blog/agentic-infrastructure',
    avatar: 'https://github.com/tomocchino.png?size=128',
    date: '2026-04-09',
    language: 'en',
  },
  {
    id: '3',
    title: 'Harness Engineering: explicado desde cero',
    author: 'Santiago M.',
    source: 'x.com',
    category: 'IA',
    description: 'Qué es el harness que rodea al modelo y cómo diseñarlo.',
    url: 'https://x.com/santtiagom_/status/2098782814837543075',
    avatar: '/lectura/santiago-m.webp',
    date: '2025-09-12',
    language: 'es',
  },
];

export const testBooks: Book[] = [
  {
    id: '1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    language: 'en',
    categories: ['Programación'],
    description: 'Un manual de artesanía de software ágil.',
    year: 2008,
    cover: '/lectura/clean-code.jpg',
    isbn: '0132350882',
  },
  {
    id: '8',
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    language: 'en',
    categories: ['Arquitectura'],
    description: 'Conectar la implementación a un modelo en evolución.',
    year: 2003,
    cover: '/lectura/domain-driven-design.jpg',
    url: 'https://www.amazon.com/dp/0321125215',
  },
];

export const testCommunityCourses: Course[] = [
  {
    id: 'git-and-github',
    name: 'Git & GitHub',
    logo: '/software-logos/github.webp',
    description: 'Controlá las versiones de tu código y trabajá en equipo.',
    youtubeUrls: ['https://www.youtube.com/embed/WlB2fzl1vO8'],
    teachedBy: 'Agustín Sánchez, Marcelo Núñez, Germán Navarro e Iván Taddei',
    acceptDonations: false,
    isMadeByCommunity: true,
    date: new Date('2020-06-27'),
    hours: 2,
  },
];

export const testExternalCourses: Course[] = [
  {
    id: 'html-and-css',
    name: 'HTML & CSS',
    logo: '/software-logos/html5.svg',
    description: 'Una introducción a los lenguajes de las páginas web.',
    youtubeUrls: ['https://www.youtube.com/embed/ELSm-G201Ls'],
    teachedBy: 'Dalto',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2024-01-01'),
    hours: 24,
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    logo: '/software-logos/nextjs.webp',
    description: 'El curso oficial e interactivo de Next.js.',
    websiteUrl: 'https://nextjs.org/learn',
    teachedBy: 'Vercel',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2026-01-01'),
  },
  {
    id: 'patterns-dev',
    name: 'Patterns.dev',
    logo: '/software-logos/patterns-dev.png',
    description: 'Patrones de diseño y de rendimiento para aplicaciones web modernas.',
    websiteUrl: 'https://www.patterns.dev/',
    teachedBy: 'Lydia Hallie & Addy Osmani',
    acceptDonations: false,
    isMadeByCommunity: false,
    date: new Date('2026-01-01'),
  },
];

export const testCourses = [...testCommunityCourses, ...testExternalCourses];

/** A jest.mock factory for the recommend button, which talks to the server on its own. */
export const mockRecommendButton = () => ({
  RecommendButton: ({ kind, label }: { kind: string; label?: string }) =>
    require('react').createElement('button', { type: 'button' }, label ?? `recomendar ${kind}`),
});

/** A jest.mock factory for `@/lib/recommendations` that serves the lists above. */
export const mockRecommendations = () => ({
  getVideos: jest.fn(async () => testVideos),
  getExternalTalks: jest.fn(async () => testVideos.filter((video) => video.isTalk)),
  getOtherVideos: jest.fn(async () => testVideos.filter((video) => !video.isTalk)),
  getArticles: jest.fn(async () => testArticles),
  getBooks: jest.fn(async () => testBooks),
  getCourses: jest.fn(async () => ({
    communityCourses: testCommunityCourses,
    externalCourses: testExternalCourses,
  })),
  getAllCourses: jest.fn(async () => testCourses),
  getCourseById: jest.fn(async (id: string) => testCourses.find((course) => course.id === id)),
  listRecommendationsForReview: jest.fn(async () => []),
});
