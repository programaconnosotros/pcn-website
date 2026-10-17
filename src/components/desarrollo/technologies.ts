import { AwsSVG } from '@/components/logos/AwsSVG';
import { DockerSVG } from '@/components/logos/DockerSVG';
import { GitHubMarkSVG } from '@/components/logos/GitHubMarkSVG';
import { GitSVG } from '@/components/logos/GitSVG';
import { KamalSVG } from '@/components/logos/KamalSVG';
import { NextJsSVG } from '@/components/logos/NextJsSVG';
import { PostgresqlSVG } from '@/components/logos/PostgresqlSVG';
import { PrismaSVG } from '@/components/logos/PrismaSVG';
import { ReactSVG } from '@/components/logos/ReactSVG';
import { TailwindSVG } from '@/components/logos/TailwindSVG';
import { TypescriptSVG } from '@/components/logos/TypescriptSVG';

// The website's stack, as /desarrollo lists it and the home's "Colaborá en el código" card shows.

export const technologies = [
  { name: 'Next.js', icon: NextJsSVG },
  { name: 'React', icon: ReactSVG },
  { name: 'TypeScript', icon: TypescriptSVG },
  { name: 'Tailwind CSS', icon: TailwindSVG },
  { name: 'Prisma', icon: PrismaSVG },
  { name: 'PostgreSQL', icon: PostgresqlSVG },
  { name: 'Docker', icon: DockerSVG },
  { name: 'Kamal', icon: KamalSVG },
  { name: 'AWS', icon: AwsSVG },
  { name: 'Git', icon: GitSVG },
  { name: 'GitHub', icon: GitHubMarkSVG },
];

/** Libraries and tools beyond the main technologies, by area. */
export const toolchain = [
  {
    category: 'Frontend',
    tools: [
      'shadcn/ui + Radix',
      'React Hook Form',
      'TanStack Query',
      'TanStack Table',
      'Motion',
      'Sonner',
      'date-fns',
      'Embla Carousel',
      'Lucide',
    ],
  },
  {
    category: 'Backend & datos',
    tools: ['Prisma', 'Zod', 'bcryptjs', 'Nodemailer', 'React Email'],
  },
  {
    category: 'Imágenes y video',
    tools: ['AWS S3', 'CloudFront (URLs firmadas)', 'sharp', 'exifr', 'Mediabunny'],
  },
  {
    category: 'Testing & calidad',
    tools: [
      'Jest',
      'jest-mock-extended',
      'Playwright',
      'ESLint',
      'Prettier',
      'Husky',
      'lint-staged',
    ],
  },
  {
    category: 'Infraestructura & dev',
    tools: ['Docker Compose', 'Dev Containers', 'Portless', 'Kamal', 'GitHub Actions', 'MailHog'],
  },
];
