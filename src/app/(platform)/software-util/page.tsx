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
import { ExternalLink, Search, SquareMousePointer, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

type PricingTier = 'free' | 'freemium' | 'paid';

interface SoftwareRecommendation {
  name: string;
  description: string;
  logo: string;
  tags: string[];
  category: string;
  website: string;
  pricing: PricingTier;
  isPopular?: boolean;
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
}: SoftwareRecommendationCardProps) {
  const badge = PRICING_BADGE[pricing];
  return (
    <Card className="flex flex-col border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800">
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

  const filteredRecommendations = recommendations
    .filter((software) => {
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
    <>
      {/* Search */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Buscar software, categoría o tecnología..."
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

      {/* Software Grid or Empty State */}
      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filteredRecommendations.map((software, index) => (
            <SoftwareRecommendationCard key={index} {...software} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No se encontró software útil"
          description="No pudimos encontrar ningún software que coincida con tus criterios de búsqueda. Intenta ajustar los filtros o buscar con otros términos."
          onRefresh={() => setSearchTerm('')}
        />
      )}
    </>
  );
}

const softwareRecommendations: SoftwareRecommendation[] = [
  // — Existing tools (reclassified) —
  {
    name: 'Visual Studio Code',
    description:
      'Editor de código fuente ligero pero potente. Incluye soporte para debugging, Git integrado, syntax highlighting y extensiones.',
    logo: '/software-logos/vsc.webp',
    tags: ['Editor', 'JavaScript', 'TypeScript', 'Python', 'Git'],
    category: 'Desarrollo',
    website: 'https://code.visualstudio.com',
    pricing: 'free',
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
    isPopular: true,
  },
  // — New tools —
  {
    name: 'GitHub',
    description:
      'Plataforma de alojamiento de código con control de versiones Git. Plan gratuito para repositorios públicos y privados; GitHub Teams y Enterprise para organizaciones.',
    logo: '/software-logos/github.webp',
    tags: ['Git', 'Control de versiones', 'Colaboración', 'Open Source', 'CI/CD'],
    category: 'Desarrollo',
    website: 'https://github.com',
    pricing: 'freemium',
    isPopular: true,
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
                <BreadcrumbPage>Software útil</BreadcrumbPage>
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
              <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Software útil</span>
            </Heading2>
          </div>

          <p className="mb-6 text-muted-foreground">
            Acá podés encontrar una lista de software útil recomendado por la comunidad de PCN. Si
            querés sumar alguno, ¡avisanos!
          </p>

          <RecommendationsList recommendations={softwareRecommendations} />
        </div>
      </div>
    </>
  );
}
