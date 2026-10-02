'use client';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { StickyHeader } from '@/components/ui/sticky-header';

type PricingTier = 'free' | 'freemium' | 'paid';
type SoftwareType = 'app' | 'library' | 'language';
type TypingDiscipline = 'static' | 'dynamic' | 'mixed';

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
  typing?: TypingDiscipline;
  paradigms?: string[];
}

interface SoftwareRecommendationCardProps extends SoftwareRecommendation {}

const PRICING_LABEL: Record<PricingTier, string> = {
  free: 'gratis',
  freemium: 'freemium',
  paid: 'de pago',
};

const TYPING_LABEL: Record<TypingDiscipline, string> = {
  static: 'tipado estático',
  dynamic: 'tipado dinámico',
  mixed: 'tipado mixto',
};

function SoftwareRecommendationCard({
  name,
  description,
  logo,
  tags,
  category,
  website,
  pricing,
  type,
  isPopular: _isPopular = false,
  usedHere = false,
  typing,
  paradigms,
}: SoftwareRecommendationCardProps) {
  const isLanguage = type === 'language';
  const chips = isLanguage
    ? [...(typing ? [TYPING_LABEL[typing]] : []), ...(paradigms ?? [])]
    : tags;

  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(ruledCellClassName, 'group flex gap-3 p-3')}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-white p-1">
        <Image
          src={logo || '/placeholder.svg?height=48&width=48'}
          alt={`${name} logo`}
          width={28}
          height={28}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 font-mono text-sm">
          <h3 className="truncate font-semibold group-hover:text-pcnGreen">{name}</h3>
          {usedHere && <Badge className="px-1.5 py-0 text-[10px]">usado acá</Badge>}
          <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground group-hover:text-pcnGreen">
            {isLanguage ? category.toLowerCase() : PRICING_LABEL[pricing]}
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>

        <p className="truncate font-mono text-[11px] text-muted-foreground/70">
          <span className="text-pcnGreen-500"># </span>
          {chips.join(' · ')}
        </p>
      </div>
    </a>
  );
}

interface RecommendationsListProps {
  header: ReactNode;
  recommendations: SoftwareRecommendation[];
}

function RecommendationsList({ header, recommendations }: RecommendationsListProps) {
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
      <StickyHeader>
        {header}
        <TabsList className="mb-4">
          <TabsTrigger value="app">Apps</TabsTrigger>
          <TabsTrigger value="library">Librerías</TabsTrigger>
          <TabsTrigger value="language">Lenguajes</TabsTrigger>
        </TabsList>

        {/* Search — shared across all tabs */}
        <div className="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
          <SearchBar
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
            placeholder="nombre, categoría o tecnología"
            label="Buscar por nombre, categoría o tecnología"
          />
        </div>
      </StickyHeader>

      {(['app', 'library', 'language'] as SoftwareType[]).map((tab) => (
        <TabsContent key={tab} value={tab}>
          {filteredRecommendations.length > 0 ? (
            <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredRecommendations.map((software) => (
                <SoftwareRecommendationCard key={software.name} {...software} />
              ))}
            </RuledGrid>
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
    name: 'AI SDK',
    description:
      'Kit de herramientas TypeScript de Vercel para construir aplicaciones y agentes con IA. Ofrece una API unificada para trabajar con distintos modelos de lenguaje, con soporte de streaming, tool calling y generación de objetos estructurados.',
    logo: '/software-logos/ai-sdk.webp',
    tags: ['IA', 'TypeScript', 'Vercel', 'LLM', 'Streaming', 'Agentes'],
    category: 'Librería',
    website: 'https://ai-sdk.dev',
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
    usedHere: true,
  },
  {
    name: 'Playwright',
    description:
      'Framework de testing end-to-end de Microsoft para aplicaciones web. Permite automatizar navegadores (Chromium, Firefox, WebKit) con una API moderna y confiable. Soporta múltiples lenguajes y es completamente gratuito y open source.',
    logo: '/software-logos/playwright.webp',
    tags: ['Testing', 'E2E', 'Automatización', 'Browser', 'Microsoft'],
    category: 'Librería',
    website: 'https://playwright.dev',
    pricing: 'free',
    type: 'library',
    usedHere: true,
  },
  {
    name: 'Portless',
    description:
      'Herramienta CLI que reemplaza los números de puerto con URLs nombradas en `.localhost` para el desarrollo local. Ideal para trabajar con múltiples servicios o agentes sin recordar puertos.',
    logo: '/software-logos/portless.webp',
    tags: ['CLI', 'Dev tools', 'HTTPS', 'Desarrollo local', 'Vercel'],
    category: 'Librería',
    website: 'https://portless.sh',
    pricing: 'free',
    type: 'library',
    usedHere: true,
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
    tags: ['JavaScript', 'Microsoft', 'Frontend', 'Backend'],
    category: 'Lenguaje',
    website: 'https://typescriptlang.org',
    pricing: 'free',
    type: 'language',
    typing: 'mixed',
    paradigms: ['Orientado a objetos', 'Funcional', 'Imperativo'],
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
    typing: 'static',
    paradigms: ['Imperativo', 'Funcional', 'Concurrente'],
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
    typing: 'static',
    paradigms: ['Imperativo', 'Concurrente', 'Procedural'],
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
    typing: 'dynamic',
    paradigms: ['Orientado a objetos', 'Funcional', 'Imperativo'],
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
    typing: 'static',
    paradigms: ['Orientado a objetos', 'Funcional', 'Imperativo'],
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
    typing: 'static',
    paradigms: ['Orientado a objetos', 'Funcional', 'Imperativo'],
  },
  {
    name: 'Elixir',
    description:
      'Lenguaje funcional y concurrente construido sobre la Erlang VM. Diseñado para sistemas distribuidos y de alta disponibilidad. El framework Phoenix lo hace ideal para apps web en tiempo real.',
    logo: '/software-logos/elixir.webp',
    tags: ['Concurrencia', 'Phoenix', 'Distribuido', 'Real-time'],
    category: 'Lenguaje',
    website: 'https://elixir-lang.org',
    pricing: 'free',
    type: 'language',
    typing: 'dynamic',
    paradigms: ['Funcional', 'Concurrente'],
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
    typing: 'static',
    paradigms: ['Imperativo', 'Procedural'],
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
    typing: 'static',
    paradigms: ['Orientado a objetos', 'Funcional', 'Imperativo'],
    isPopular: true,
  },
  {
    name: 'C++',
    description:
      'Extensión orientada a objetos de C con gestión manual de memoria y alto rendimiento. Utilizado en motores de videojuegos, software de sistemas, simulaciones científicas y aplicaciones de tiempo real.',
    logo: '/software-logos/cpp.webp',
    tags: ['Sistemas', 'Performance', 'Videojuegos', 'Bajo nivel'],
    category: 'Lenguaje',
    website: 'https://isocpp.org',
    pricing: 'free',
    type: 'language',
    typing: 'static',
    paradigms: ['Orientado a objetos', 'Imperativo', 'Procedural'],
    isPopular: true,
  },
  {
    name: 'Haskell',
    description:
      'Lenguaje de programación funcional puro con tipado estático avanzado y evaluación perezosa. Referente académico e industrial para funciones matemáticas, compiladores y sistemas confiables.',
    logo: '/software-logos/haskell.webp',
    tags: ['Académico', 'Compiladores', 'Matemático'],
    category: 'Lenguaje',
    website: 'https://haskell.org',
    pricing: 'free',
    type: 'language',
    typing: 'static',
    paradigms: ['Funcional', 'Declarativo'],
  },
  {
    name: 'Java',
    description:
      'Lenguaje orientado a objetos multiplataforma basado en la JVM. Estándar en el desarrollo empresarial, Android y sistemas de gran escala. Su ecosistema maduro y amplia comunidad lo mantienen vigente.',
    logo: '/software-logos/java.webp',
    tags: ['JVM', 'Empresarial', 'Android', 'Backend'],
    category: 'Lenguaje',
    website: 'https://oracle.com/java',
    pricing: 'free',
    type: 'language',
    typing: 'static',
    paradigms: ['Orientado a objetos', 'Imperativo'],
    isPopular: true,
  },
  {
    name: 'Prolog',
    description:
      'Lenguaje de programación lógica declarativa basado en reglas y hechos. Clásico en inteligencia artificial, sistemas expertos y procesamiento de lenguaje natural. Fundamento del paradigma lógico.',
    logo: '/software-logos/prolog.webp',
    tags: ['IA', 'Sistemas expertos', 'Académico'],
    category: 'Lenguaje',
    website: 'https://swi-prolog.org',
    pricing: 'free',
    type: 'language',
    typing: 'dynamic',
    paradigms: ['Lógico', 'Declarativo'],
  },
  {
    name: 'Ruby',
    description:
      'Lenguaje interpretado orientado a objetos diseñado para la productividad y la elegancia. Muy popular gracias a Ruby on Rails, que lo convirtió en referente del desarrollo web ágil.',
    logo: '/software-logos/ruby.webp',
    tags: ['Backend', 'Scripting', 'Rails', 'Productividad'],
    category: 'Lenguaje',
    website: 'https://ruby-lang.org',
    pricing: 'free',
    type: 'language',
    typing: 'dynamic',
    paradigms: ['Orientado a objetos', 'Funcional', 'Imperativo'],
    isPopular: true,
  },
  {
    name: 'Smalltalk',
    description:
      'Lenguaje de programación orientado a objetos pionero de los años 70. Influyó en el diseño de Java, Ruby y Python. Conocido por su modelo de mensajes entre objetos y su entorno de desarrollo interactivo.',
    logo: '/software-logos/smalltalk.webp',
    tags: ['Histórico', 'Mensajes', 'Académico'],
    category: 'Lenguaje',
    website: 'https://smalltalk.org',
    pricing: 'free',
    type: 'language',
    typing: 'dynamic',
    paradigms: ['Orientado a objetos'],
  },
];

export default function SoftwareRecommendationsPage() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <RecommendationsList
            header={
              <PageTitle
                path="herramientas"
                meta={`${softwareRecommendations.length} herramientas recomendadas por la comunidad`}
              />
            }
            recommendations={softwareRecommendations}
          />
        </div>
      </div>
    </>
  );
}
