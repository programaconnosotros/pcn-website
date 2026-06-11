'use client';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heading2 } from '@/components/ui/heading-2';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Search, SquareMousePointer, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

type PricingTier = 'free' | 'freemium' | 'paid';
type SoftwareType = 'app' | 'library' | 'language';

interface SoftwareRecommendation {
  name: string;
  description: string;
  logo: string;
  tags: string[];
  category: string;
  website: string;
  pricing: PricingTier;
  type: SoftwareType;
  isPopular?: boolean;
  usedHere?: boolean;
}

interface SoftwareRecommendationCardProps extends SoftwareRecommendation {}

const PRICING_BADGE: Record<PricingTier, { label: string; className: string }> = {
  free: {
    label: 'Gratis',
    className: 'border-green-500/30 bg-green-500/20 text-green-700 dark:text-green-300',
  },
  freemium: {
    label: 'Freemium',
    className: 'border-blue-500/30 bg-blue-500/20 text-blue-700 dark:text-blue-300',
  },
  paid: {
    label: 'De pago',
    className: 'border-amber-500/30 bg-amber-500/20 text-amber-700 dark:text-amber-300',
  },
};

function SoftwareRecommendationCard({
  name,
  description,
  logo,
  tags,
  category,
  website,
  pricing,
  isPopular: _isPopular = false,
  usedHere = false,
}: SoftwareRecommendationCardProps) {
  const badge = PRICING_BADGE[pricing];
  return (
    <Card
      className={`relative flex flex-col overflow-hidden bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:from-neutral-900 dark:to-neutral-800 ${
        usedHere
          ? 'border-2 border-pcnPurple/40 dark:border-pcnGreen/40'
          : 'border-2 border-transparent dark:border-neutral-800'
      }`}
    >
      {usedHere && (
        <div className="absolute -right-8 top-5 z-10 rotate-45 bg-pcnPurple px-10 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-white shadow-sm dark:bg-pcnGreen dark:text-black">
          Usado acá
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-white p-2 dark:bg-neutral-800">
              <Image
                src={logo || '/placeholder.svg?height=48&width=48'}
                alt={`${name} logo`}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground">{category}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge className={badge.className}>{badge.label}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="mb-4 flex-1 text-sm text-muted-foreground">{description}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button size="sm" className="w-full" onClick={() => window.open(website, '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Visitar sitio
        </Button>
      </CardContent>
    </Card>
  );
}

interface RecommendationsListProps {
  recommendations: SoftwareRecommendation[];
}

function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<SoftwareType>('app');

  const filteredRecommendations = recommendations
    .filter((software) => {
      if (software.type !== activeTab) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        software.name.toLowerCase().includes(searchLower) ||
        software.description.toLowerCase().includes(searchLower) ||
        software.category.toLowerCase().includes(searchLower) ||
        software.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SoftwareType)}>
      <TabsList className="mb-4">
        <TabsTrigger value="app">Apps</TabsTrigger>
        <TabsTrigger value="library">Librerías</TabsTrigger>
        <TabsTrigger value="language">Lenguajes</TabsTrigger>
      </TabsList>

      {/* Search — shared across all tabs */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, categoría o tecnología..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {(['app', 'library', 'language'] as SoftwareType[]).map((tab) => (
        <TabsContent key={tab} value={tab}>
          {filteredRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {filteredRecommendations.map((software, index) => (
                <SoftwareRecommendationCard key={index} {...software} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No se encontraron resultados"
              description="No pudimos encontrar nada que coincida con tus criterios de búsqueda. Intenta ajustar los filtros o buscar con otros términos."
              onRefresh={() => setSearchTerm('')}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

const softwareRecommendations: SoftwareRecommendation[] = [
  // ── Apps ────────────────────────────────────────────────────────────────
  {
    name: 'Visual Studio Code',
    description:
      'Editor de código fuente ligero pero potente. Incluye soporte para debugging, Git integrado, syntax highlighting y extensiones.',
    logo: '/software-logos/vsc.webp',
    tags: ['Editor', 'JavaScript', 'TypeScript', 'Python', 'Git'],
    category: 'Desarrollo',
    website: 'https://code.visualstudio.com',
    pricing: 'free',
    type: 'app',
    isPopular: true,
  },
  {
    name: 'Figma',
    description:
      'Herramienta de diseño colaborativo basada en la web. Perfecta para UI/UX design, prototipado y trabajo en equipo. Plan gratuito disponible; planes Pro y Organization para equipos.',
    logo: '/software-logos/figma.webp',
    tags: ['Diseño', 'UI/UX', 'Prototipado', 'Colaborativo'],
    category: 'Diseño',
    website: 'https://figma.com',
    pricing: 'freemium',
    type: 'app',
    isPopular: true,
  },
  {
    name: 'Docker',
    description:
      'Plataforma de contenedores que permite empaquetar aplicaciones con todas sus dependencias. Personal use gratuito; Docker Business para equipos empresariales es de pago.',
    logo: '/software-logos/docker.webp',
    tags: ['Contenedores', 'DevOps', 'Deployment', 'Microservicios'],
    category: 'DevOps',
    website: 'https://docker.com',
    pricing: 'freemium',
    type: 'app',
    usedHere: true,
  },
  {
    name: 'Notion',
    description:
      'Espacio de trabajo todo-en-uno que combina notas, tareas, wikis y bases de datos. Plan gratuito disponible; planes Plus y Business para más funcionalidades.',
    logo: '/software-logos/notion.webp',
    tags: ['Productividad', 'Notas', 'Organización', 'Colaboración'],
    category: 'Productividad',
    website: 'https://notion.so',
    pricing: 'freemium',
    type: 'app',
    isPopular: true,
  },
  {
    name: 'Postman',
    description:
      'Plataforma de colaboración para el desarrollo de APIs. Plan gratuito para uso individual; planes Basic y Professional para equipos con más colaboradores y funcionalidades.',
    logo: '/software-logos/postman.webp',
    tags: ['API', 'Testing', 'Desarrollo', 'HTTP'],
    category: 'Desarrollo',
    website: 'https://postman.com',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'Slack',
    description:
      'Plataforma de comunicación empresarial que organiza conversaciones en canales. Plan gratuito con historial limitado; planes Pro y Business+ con acceso completo.',
    logo: '/software-logos/slack.webp',
    tags: ['Comunicación', 'Equipos', 'Chat', 'Integraciones'],
    category: 'Comunicación',
    website: 'https://slack.com',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'Adobe Photoshop',
    description:
      'Software profesional de edición de imágenes y diseño gráfico. Estándar de la industria para diseñadores y fotógrafos. Requiere suscripción a Creative Cloud.',
    logo: '/software-logos/photoshop.webp',
    tags: ['Diseño', 'Edición', 'Fotografía', 'Gráficos'],
    category: 'Diseño',
    website: 'https://adobe.com/photoshop',
    pricing: 'paid',
    type: 'app',
    isPopular: true,
  },
  {
    name: 'GitHub',
    description:
      'Plataforma de alojamiento de código con control de versiones Git. Plan gratuito para repositorios públicos y privados; GitHub Teams y Enterprise para organizaciones.',
    logo: '/software-logos/github.webp',
    tags: ['Git', 'Control de versiones', 'Colaboración', 'Open Source', 'CI/CD'],
    category: 'Desarrollo',
    website: 'https://github.com',
    pricing: 'freemium',
    type: 'app',
    isPopular: true,
    usedHere: true,
  },
  {
    name: 'Cursor',
    description:
      'Editor de código potenciado por IA, basado en VS Code. Ofrece autocompletado avanzado, chat con el codebase y edición multi-archivo. Plan gratuito con límites; Pro a USD 20/mes.',
    logo: '/software-logos/cursor.webp',
    tags: ['Editor', 'IA', 'Autocompletado', 'JavaScript', 'Python'],
    category: 'IA',
    website: 'https://cursor.com',
    pricing: 'freemium',
    type: 'app',
    isPopular: true,
  },
  {
    name: 'Windsurf',
    description:
      'IDE con IA integrada desarrollado por Codeium. Incluye Cascade, un agente que entiende el contexto completo del proyecto para sugerir y aplicar cambios. Plan gratuito disponible.',
    logo: '/software-logos/windsurf.webp',
    tags: ['Editor', 'IA', 'Agente', 'Autocompletado'],
    category: 'IA',
    website: 'https://windsurf.com',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'Claude Code',
    description:
      'Agente de programación de Anthropic que opera en la terminal. Entiende y edita codebases completos, ejecuta comandos y trabaja de forma autónoma. Requiere suscripción Pro o API.',
    logo: '/software-logos/claude-code.webp',
    tags: ['IA', 'Agente', 'Terminal', 'CLI', 'Automatización'],
    category: 'IA',
    website: 'https://claude.ai/code',
    pricing: 'paid',
    type: 'app',
  },
  {
    name: 'ChatGPT',
    description:
      'Asistente de IA conversacional de OpenAI. Útil para generar código, resolver dudas técnicas, redactar documentación y mucho más. Versión gratuita disponible; Plus a USD 20/mes.',
    logo: '/software-logos/chatgpt.webp',
    tags: ['IA', 'Asistente', 'Generación de código', 'Documentación'],
    category: 'IA',
    website: 'https://chatgpt.com',
    pricing: 'freemium',
    type: 'app',
    isPopular: true,
  },
  {
    name: 'Codex',
    description:
      'Agente de programación en la nube de OpenAI, integrado en ChatGPT. Trabaja en tareas de código de forma asíncrona en un entorno sandboxed. Requiere plan ChatGPT Pro o superior.',
    logo: '/software-logos/codex.webp',
    tags: ['IA', 'Agente', 'OpenAI', 'Automatización'],
    category: 'IA',
    website: 'https://openai.com/codex',
    pricing: 'paid',
    type: 'app',
  },
  {
    name: 'Antigravity',
    description:
      'IDE de IA de Google con modelos Gemini integrados. Ofrece un agente de código, edición en contexto y generación de tests. Plan gratuito con límites; Pro a USD 20/mes.',
    logo: '/software-logos/antigravity.webp',
    tags: ['IA', 'Editor', 'Google', 'Gemini', 'Agente'],
    category: 'IA',
    website: 'https://antigravity.google',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'Warp',
    description:
      'Terminal moderna con IA integrada para macOS, Linux y Windows. Incluye autocompletado inteligente, búsqueda de comandos en lenguaje natural y bloques de output navegables.',
    logo: '/software-logos/warp.webp',
    tags: ['Terminal', 'Desarrollo', 'IA', 'Productividad'],
    category: 'Desarrollo',
    website: 'https://warp.dev',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'DataGrip',
    description:
      'IDE de JetBrains para bases de datos y SQL. Soporta PostgreSQL, MySQL, MongoDB, Redis y más. Gratuito para uso no comercial; suscripción comercial desde USD 25/mes.',
    logo: '/software-logos/datagrip.webp',
    tags: ['Base de datos', 'SQL', 'PostgreSQL', 'MySQL', 'JetBrains'],
    category: 'Desarrollo',
    website: 'https://jetbrains.com/datagrip',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'IntelliJ IDEA',
    description:
      'IDE líder para Java y Kotlin de JetBrains. Community Edition gratuita y open source; Ultimate con soporte completo para frameworks web y herramientas empresariales.',
    logo: '/software-logos/intellij.webp',
    tags: ['Java', 'Kotlin', 'IDE', 'JetBrains', 'Spring'],
    category: 'Desarrollo',
    website: 'https://jetbrains.com/idea',
    pricing: 'freemium',
    type: 'app',
    isPopular: true,
  },
  {
    name: 'WebStorm',
    description:
      'IDE de JetBrains especializado en JavaScript y TypeScript. Soporte avanzado para React, Angular, Vue y Node.js. Gratuito para uso no comercial; suscripción comercial disponible.',
    logo: '/software-logos/webstorm.webp',
    tags: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'JetBrains'],
    category: 'Desarrollo',
    website: 'https://jetbrains.com/webstorm',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'RubyMine',
    description:
      'IDE de JetBrains para Ruby y Ruby on Rails. Incluye refactoring inteligente, debugging y soporte completo para el ecosistema Ruby. Gratuito para uso no comercial.',
    logo: '/software-logos/rubymine.webp',
    tags: ['Ruby', 'Rails', 'IDE', 'JetBrains'],
    category: 'Desarrollo',
    website: 'https://jetbrains.com/ruby',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'PyCharm',
    description:
      'IDE de JetBrains para Python. Community Edition gratuita y open source; Professional Edition con soporte para Django, Flask, Jupyter y bases de datos remotas.',
    logo: '/software-logos/pycharm.webp',
    tags: ['Python', 'Django', 'Flask', 'Data Science', 'JetBrains'],
    category: 'Desarrollo',
    website: 'https://jetbrains.com/pycharm',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'PhpStorm',
    description:
      'IDE de JetBrains para PHP con soporte para Laravel, Symfony y WordPress. Incluye debugging, refactoring y herramientas de calidad de código. Solo disponible con suscripción.',
    logo: '/software-logos/phpstorm.webp',
    tags: ['PHP', 'Laravel', 'Symfony', 'WordPress', 'JetBrains'],
    category: 'Desarrollo',
    website: 'https://jetbrains.com/phpstorm',
    pricing: 'paid',
    type: 'app',
  },
  {
    name: 'GoLand',
    description:
      'IDE de JetBrains diseñado específicamente para Go. Ofrece análisis de código, debugging, testing y soporte para módulos Go. Solo disponible con suscripción comercial.',
    logo: '/software-logos/goland.webp',
    tags: ['Go', 'Golang', 'IDE', 'JetBrains'],
    category: 'Desarrollo',
    website: 'https://jetbrains.com/go',
    pricing: 'paid',
    type: 'app',
  },
  {
    name: 'CLion',
    description:
      'IDE de JetBrains para C y C++. Soporta CMake, Makefile, y herramientas de análisis estático. Gratuito para uso no comercial; suscripción comercial disponible.',
    logo: '/software-logos/clion.webp',
    tags: ['C', 'C++', 'CMake', 'Sistemas', 'JetBrains'],
    category: 'Desarrollo',
    website: 'https://jetbrains.com/clion',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'Linear',
    description:
      'Herramienta de gestión de proyectos de software diseñada para velocidad. Seguimiento de issues, sprints y roadmaps con una UX ultra-rápida. Plan gratuito; Starter desde USD 8/mes.',
    logo: '/software-logos/linear.webp',
    tags: ['Gestión', 'Issues', 'Sprints', 'Productividad', 'Equipos'],
    category: 'Productividad',
    website: 'https://linear.app',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'Canva',
    description:
      'Plataforma de diseño gráfico online con cientos de plantillas. Ideal para crear presentaciones, posts para redes y materiales de marketing. Plan gratuito; Canva Pro desde USD 15/mes.',
    logo: '/software-logos/canva.webp',
    tags: ['Diseño', 'Presentaciones', 'Marketing', 'Templates'],
    category: 'Diseño',
    website: 'https://canva.com',
    pricing: 'freemium',
    type: 'app',
  },
  {
    name: 'AWS',
    description:
      'Plataforma de servicios en la nube de Amazon. Ofrece cómputo, almacenamiento, bases de datos, IA y más. Capa gratuita por 12 meses para nuevas cuentas; luego pago por uso.',
    logo: '/software-logos/aws.webp',
    tags: ['Cloud', 'DevOps', 'Infraestructura', 'Serverless', 'S3'],
    category: 'DevOps',
    website: 'https://aws.amazon.com',
    pricing: 'freemium',
    type: 'app',
    usedHere: true,
  },

  // ── Librerías (Node.js ecosystem) ────────────────────────────────────────
  {
    name: 'React',
    description:
      'Librería de JavaScript de Meta para construir interfaces de usuario declarativas. Base del ecosistema frontend moderno y compatible con React Native para apps móviles.',
    logo: '/software-logos/react.webp',
    tags: ['UI', 'Frontend', 'JavaScript', 'TypeScript', 'Componentes'],
    category: 'Librería',
    website: 'https://react.dev',
    pricing: 'free',
    type: 'library',
    isPopular: true,
    usedHere: true,
  },
  {
    name: 'Next.js',
    description:
      'Framework full-stack basado en React con soporte para SSR, SSG y App Router. Desarrollado por Vercel, es el estándar para proyectos React en producción.',
    logo: '/software-logos/nextjs.webp',
    tags: ['React', 'SSR', 'Full-stack', 'TypeScript', 'Vercel'],
    category: 'Librería',
    website: 'https://nextjs.org',
    pricing: 'free',
    type: 'library',
    isPopular: true,
    usedHere: true,
  },
  {
    name: 'Vue.js',
    description:
      'Framework progresivo para construir interfaces de usuario. Fácil de adoptar de forma incremental, con una API intuitiva y un ecosistema completo (Pinia, Vue Router).',
    logo: '/software-logos/vue.webp',
    tags: ['UI', 'Frontend', 'JavaScript', 'TypeScript', 'SPA'],
    category: 'Librería',
    website: 'https://vuejs.org',
    pricing: 'free',
    type: 'library',
  },
  {
    name: 'Express',
    description:
      'Framework web minimalista y flexible para Node.js. El más utilizado para construir APIs REST y aplicaciones del lado del servidor con middleware modular.',
    logo: '/software-logos/express.webp',
    tags: ['Node.js', 'Backend', 'API', 'REST', 'Middleware'],
    category: 'Librería',
    website: 'https://expressjs.com',
    pricing: 'free',
    type: 'library',
    isPopular: true,
  },
  {
    name: 'NestJS',
    description:
      'Framework backend escalable para Node.js construido con TypeScript. Inspirado en Angular, ofrece arquitectura modular, inyección de dependencias y soporte para REST, GraphQL y WebSockets.',
    logo: '/software-logos/nestjs.webp',
    tags: ['Node.js', 'Backend', 'TypeScript', 'GraphQL', 'Microservicios'],
    category: 'Librería',
    website: 'https://nestjs.com',
    pricing: 'free',
    type: 'library',
  },
  {
    name: 'Prisma',
    description:
      'ORM de próxima generación para TypeScript y Node.js. Ofrece un cliente type-safe auto-generado, migraciones declarativas y soporte para PostgreSQL, MySQL, SQLite y más.',
    logo: '/software-logos/prisma.webp',
    tags: ['ORM', 'TypeScript', 'PostgreSQL', 'MySQL', 'Base de datos'],
    category: 'Librería',
    website: 'https://prisma.io',
    pricing: 'free',
    type: 'library',
    usedHere: true,
  },
  {
    name: 'Zod',
    description:
      'Librería de validación de esquemas con inferencia de tipos para TypeScript. Define el esquema una sola vez y obtén validación en runtime y tipos estáticos automáticamente.',
    logo: '/software-logos/zod.webp',
    tags: ['TypeScript', 'Validación', 'Esquemas', 'Runtime'],
    category: 'Librería',
    website: 'https://zod.dev',
    pricing: 'free',
    type: 'library',
    usedHere: true,
  },
  {
    name: 'Axios',
    description:
      'Cliente HTTP basado en promesas para el navegador y Node.js. Simplifica peticiones REST con interceptores, transformadores y cancelación de requests.',
    logo: '/software-logos/axios.webp',
    tags: ['HTTP', 'REST', 'Promesas', 'Node.js', 'Browser'],
    category: 'Librería',
    website: 'https://axios-http.com',
    pricing: 'free',
    type: 'library',
  },
  {
    name: 'Tailwind CSS',
    description:
      'Framework CSS utility-first que permite construir diseños personalizados sin salir del HTML. Altamente optimizable con PurgeCSS y con soporte oficial para dark mode y responsive.',
    logo: '/software-logos/tailwind.webp',
    tags: ['CSS', 'Frontend', 'Utility-first', 'Responsive', 'Dark mode'],
    category: 'Librería',
    website: 'https://tailwindcss.com',
    pricing: 'free',
    type: 'library',
    isPopular: true,
    usedHere: true,
  },
  {
    name: 'Vite',
    description:
      'Build tool y servidor de desarrollo ultrarrápido para proyectos web modernos. Usa ES modules nativos en desarrollo y Rollup para producción. Compatible con React, Vue, Svelte y más.',
    logo: '/software-logos/vite.webp',
    tags: ['Build tool', 'Frontend', 'HMR', 'ESM', 'Rollup'],
    category: 'Librería',
    website: 'https://vitejs.dev',
    pricing: 'free',
    type: 'library',
  },
  {
    name: 'Jest',
    description:
      'Framework de testing para JavaScript con foco en la simplicidad. Incluye test runner, assertions, mocks y cobertura de código integrados. Ampliamente adoptado en el ecosistema React.',
    logo: '/software-logos/jest.webp',
    tags: ['Testing', 'JavaScript', 'TypeScript', 'Unit tests', 'Mocks'],
    category: 'Librería',
    website: 'https://jestjs.io',
    pricing: 'free',
    type: 'library',
  },
  {
    name: 'Django',
    description:
      'Framework web de alto nivel para Python que sigue el patrón MVC. Incluye ORM, panel de administración, autenticación y protección contra vulnerabilidades comunes. Ideal para aplicaciones robustas y de rápido desarrollo.',
    logo: '/software-logos/django.webp',
    tags: ['Python', 'Backend', 'ORM', 'Full-stack', 'REST'],
    category: 'Librería',
    website: 'https://djangoproject.com',
    pricing: 'free',
    type: 'library',
    isPopular: true,
  },
  {
    name: 'Flask',
    description:
      'Microframework web para Python minimalista y extensible. Perfecto para APIs REST y aplicaciones pequeñas a medianas. Su simplicidad lo hace ideal para aprender desarrollo web backend con Python.',
    logo: '/software-logos/flask.webp',
    tags: ['Python', 'Backend', 'API', 'Microframework', 'REST'],
    category: 'Librería',
    website: 'https://flask.palletsprojects.com',
    pricing: 'free',
    type: 'library',
  },
  {
    name: '.NET',
    description:
      'Plataforma de desarrollo open source de Microsoft para construir aplicaciones web, de escritorio, móviles y en la nube. Soporta C#, F# y Visual Basic con alto rendimiento y amplio ecosistema.',
    logo: '/software-logos/dotnet.webp',
    tags: ['C#', 'Microsoft', 'Backend', 'Full-stack', 'Cloud'],
    category: 'Librería',
    website: 'https://dotnet.microsoft.com',
    pricing: 'free',
    type: 'library',
    isPopular: true,
  },
  {
    name: 'Ruby on Rails',
    description:
      'Framework web full-stack para Ruby que sigue la convención sobre configuración. Incluye ORM (Active Record), generadores y una arquitectura MVC lista para producción. Muy popular para startups por su velocidad de desarrollo.',
    logo: '/software-logos/rails.webp',
    tags: ['Ruby', 'Backend', 'Full-stack', 'MVC', 'ORM'],
    category: 'Librería',
    website: 'https://rubyonrails.org',
    pricing: 'free',
    type: 'library',
    isPopular: true,
  },
  {
    name: 'Spring',
    description:
      'Framework empresarial para Java y Kotlin que simplifica el desarrollo de aplicaciones robustas. Spring Boot permite crear microservicios con configuración mínima y un ecosistema muy maduro.',
    logo: '/software-logos/spring.webp',
    tags: ['Java', 'Kotlin', 'Backend', 'Microservicios', 'Empresarial'],
    category: 'Librería',
    website: 'https://spring.io',
    pricing: 'free',
    type: 'library',
    isPopular: true,
  },

  // ── Lenguajes ───────────────────────────────────────────────────────────
  {
    name: 'TypeScript',
    description:
      'Superset de JavaScript desarrollado por Microsoft que agrega tipado estático. Mejora la productividad, la detección temprana de errores y la experiencia en editores. Compilado a JS.',
    logo: '/software-logos/typescript.webp',
    tags: ['JavaScript', 'Tipado estático', 'Microsoft', 'Frontend', 'Backend'],
    category: 'Lenguaje',
    website: 'https://typescriptlang.org',
    pricing: 'free',
    type: 'language',
    isPopular: true,
    usedHere: true,
  },
  {
    name: 'Rust',
    description:
      'Lenguaje de sistemas de alto rendimiento con garantías de seguridad de memoria en tiempo de compilación, sin garbage collector. Ideal para CLI, WebAssembly y sistemas embebidos.',
    logo: '/software-logos/rust.webp',
    tags: ['Sistemas', 'WebAssembly', 'Performance', 'Seguridad de memoria', 'CLI'],
    category: 'Lenguaje',
    website: 'https://rust-lang.org',
    pricing: 'free',
    type: 'language',
    isPopular: true,
  },
  {
    name: 'Go',
    description:
      'Lenguaje compilado de Google diseñado para simplicidad y eficiencia. Excelente para servicios backend, microservicios y herramientas CLI gracias a su concurrencia nativa con goroutines.',
    logo: '/software-logos/go.webp',
    tags: ['Backend', 'Microservicios', 'Concurrencia', 'CLI', 'Google'],
    category: 'Lenguaje',
    website: 'https://go.dev',
    pricing: 'free',
    type: 'language',
    isPopular: true,
  },
  {
    name: 'Python',
    description:
      'Lenguaje interpretado de propósito general con sintaxis legible. Líder en Data Science, Machine Learning e IA gracias a librerías como NumPy, Pandas, TensorFlow y PyTorch.',
    logo: '/software-logos/python.webp',
    tags: ['Data Science', 'IA', 'Machine Learning', 'Scripting', 'Backend'],
    category: 'Lenguaje',
    website: 'https://python.org',
    pricing: 'free',
    type: 'language',
    isPopular: true,
  },
  {
    name: 'Kotlin',
    description:
      'Lenguaje moderno de JetBrains que corre en la JVM. Es el lenguaje oficial de Android y puede compilarse también a JavaScript o código nativo con Kotlin Multiplatform.',
    logo: '/software-logos/kotlin.webp',
    tags: ['Android', 'JVM', 'Multiplatform', 'JetBrains', 'Backend'],
    category: 'Lenguaje',
    website: 'https://kotlinlang.org',
    pricing: 'free',
    type: 'language',
  },
  {
    name: 'Swift',
    description:
      'Lenguaje de Apple para desarrollo de apps en iOS, macOS, watchOS y tvOS. Moderno, seguro y de alto rendimiento. También open source con soporte para desarrollo del lado del servidor.',
    logo: '/software-logos/swift.webp',
    tags: ['iOS', 'macOS', 'Apple', 'Mobile', 'Backend'],
    category: 'Lenguaje',
    website: 'https://swift.org',
    pricing: 'free',
    type: 'language',
  },
  {
    name: 'Elixir',
    description:
      'Lenguaje funcional y concurrente construido sobre la Erlang VM. Diseñado para sistemas distribuidos y de alta disponibilidad. El framework Phoenix lo hace ideal para apps web en tiempo real.',
    logo: '/software-logos/elixir.webp',
    tags: ['Funcional', 'Concurrencia', 'Phoenix', 'Distribuido', 'Real-time'],
    category: 'Lenguaje',
    website: 'https://elixir-lang.org',
    pricing: 'free',
    type: 'language',
  },
  {
    name: 'C',
    description:
      'Lenguaje de programación de sistemas de bajo nivel creado en los años 70. Fundamento de la mayoría de sistemas operativos, compiladores y software embebido. Otorga control directo sobre el hardware y la memoria.',
    logo: '/software-logos/c.webp',
    tags: ['Sistemas', 'Bajo nivel', 'Embebido', 'Performance', 'UNIX'],
    category: 'Lenguaje',
    website: 'https://en.cppreference.com/w/c',
    pricing: 'free',
    type: 'language',
    isPopular: true,
  },
  {
    name: 'C#',
    description:
      'Lenguaje orientado a objetos de Microsoft, parte del ecosistema .NET. Ampliamente usado en desarrollo de videojuegos con Unity, aplicaciones empresariales y backends con ASP.NET Core.',
    logo: '/software-logos/csharp.webp',
    tags: ['Microsoft', '.NET', 'Videojuegos', 'Unity', 'Backend'],
    category: 'Lenguaje',
    website: 'https://learn.microsoft.com/dotnet/csharp',
    pricing: 'free',
    type: 'language',
    isPopular: true,
  },
  {
    name: 'C++',
    description:
      'Extensión orientada a objetos de C con gestión manual de memoria y alto rendimiento. Utilizado en motores de videojuegos, software de sistemas, simulaciones científicas y aplicaciones de tiempo real.',
    logo: '/software-logos/cpp.webp',
    tags: ['Sistemas', 'Performance', 'Videojuegos', 'Bajo nivel', 'OOP'],
    category: 'Lenguaje',
    website: 'https://isocpp.org',
    pricing: 'free',
    type: 'language',
    isPopular: true,
  },
  {
    name: 'Haskell',
    description:
      'Lenguaje de programación funcional puro con tipado estático avanzado y evaluación perezosa. Referente académico e industrial para funciones matemáticas, compiladores y sistemas confiables.',
    logo: '/software-logos/haskell.webp',
    tags: ['Funcional', 'Tipado estático', 'Académico', 'Compiladores', 'Matemático'],
    category: 'Lenguaje',
    website: 'https://haskell.org',
    pricing: 'free',
    type: 'language',
  },
  {
    name: 'Java',
    description:
      'Lenguaje orientado a objetos multiplataforma basado en la JVM. Estándar en el desarrollo empresarial, Android y sistemas de gran escala. Su ecosistema maduro y amplia comunidad lo mantienen vigente.',
    logo: '/software-logos/java.webp',
    tags: ['JVM', 'Empresarial', 'Android', 'Backend', 'OOP'],
    category: 'Lenguaje',
    website: 'https://oracle.com/java',
    pricing: 'free',
    type: 'language',
    isPopular: true,
  },
  {
    name: 'Prolog',
    description:
      'Lenguaje de programación lógica declarativa basado en reglas y hechos. Clásico en inteligencia artificial, sistemas expertos y procesamiento de lenguaje natural. Fundamento del paradigma lógico.',
    logo: '/software-logos/prolog.webp',
    tags: ['Lógico', 'IA', 'Declarativo', 'Sistemas expertos', 'Académico'],
    category: 'Lenguaje',
    website: 'https://swi-prolog.org',
    pricing: 'free',
    type: 'language',
  },
  {
    name: 'Ruby',
    description:
      'Lenguaje interpretado orientado a objetos diseñado para la productividad y la elegancia. Muy popular gracias a Ruby on Rails, que lo convirtió en referente del desarrollo web ágil.',
    logo: '/software-logos/ruby.webp',
    tags: ['Backend', 'Scripting', 'OOP', 'Rails', 'Productividad'],
    category: 'Lenguaje',
    website: 'https://ruby-lang.org',
    pricing: 'free',
    type: 'language',
    isPopular: true,
  },
  {
    name: 'Smalltalk',
    description:
      'Lenguaje de programación orientado a objetos pionero de los años 70. Influyó en el diseño de Java, Ruby y Python. Conocido por su modelo de mensajes entre objetos y su entorno de desarrollo interactivo.',
    logo: '/software-logos/smalltalk.webp',
    tags: ['OOP', 'Histórico', 'Mensajes', 'Dinámico', 'Académico'],
    category: 'Lenguaje',
    website: 'https://smalltalk.org',
    pricing: 'free',
    type: 'language',
  },
];

export default function SoftwareRecommendationsPage() {
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
                <BreadcrumbPage>Herramientas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-6 flex items-center justify-between">
            <Heading2 className="m-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
                <SquareMousePointer className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
              </div>
              <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Herramientas</span>
            </Heading2>
          </div>

          <p className="mb-6 text-muted-foreground">
            Acá podés encontrar una lista de herramientas recomendadas por la comunidad de PCN. Si
            querés sumar alguna, ¡avisanos!
          </p>

          <RecommendationsList recommendations={softwareRecommendations} />
        </div>
      </div>
    </>
  );
}
