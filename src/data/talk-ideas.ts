// Ideas para quien quiere dar una charla y no sabe de qué. Las de tecnologías que ya usa este
// sitio traen `example`: dónde verlas funcionando en el código de la web, para mostrarlas con un
// caso real en vez de un ejemplo de juguete.

export type TalkIdeaLevel = 'inicial' | 'intermedio' | 'avanzado';

export interface TalkIdea {
  title: string;
  description: string;
  area: string;
  level: TalkIdeaLevel;
  /** Where the website itself uses it: a file or doc of its repo, or one of its pages. */
  example?: { label: string; href: string };
}

const REPO = 'https://github.com/programaconnosotros/pcn-os/blob/main';

export const talkIdeas: TalkIdea[] = [
  // ── Web ──
  {
    title: 'Server Components y Server Actions en Next.js',
    description:
      'Qué corre en el servidor y qué en el navegador, cómo se arma una mutación sin escribir una API y qué cambia al pensar los datos de cada página.',
    area: 'web',
    level: 'intermedio',
    example: { label: 'las server actions de la web', href: `${REPO}/src/actions` },
  },
  {
    title: 'Cachear lecturas sin servir datos viejos',
    description:
      'Cómo cachear lo que es igual para todos e invalidarlo solo cuando cambia una tabla que leyó, sin acordarse de hacerlo a mano en cada escritura.',
    area: 'web',
    level: 'avanzado',
    example: { label: 'el cache de datos de la web', href: `${REPO}/docs/cache-de-datos.md` },
  },
  {
    title: 'Formularios con react-hook-form y zod',
    description:
      'Un mismo schema para validar en el navegador y en el servidor, errores claros y formularios largos que no se vuelven inmanejables.',
    area: 'web',
    level: 'inicial',
    example: { label: 'el schema del perfil', href: `${REPO}/src/schemas/profile-schema.ts` },
  },
  {
    title: 'Tiempo real con Server-Sent Events',
    description:
      'Cuándo alcanza con SSE en lugar de WebSockets, cómo mantener viva la conexión detrás de un proxy y cómo publicar eventos desde el servidor.',
    area: 'web',
    level: 'intermedio',
    example: { label: 'el endpoint de tiempo real', href: `${REPO}/src/app/api/realtime/route.ts` },
  },
  {
    title: 'Una PWA instalable con service worker',
    description:
      'Qué hace falta para que una web se instale como app, qué conviene cachear offline y qué nunca hay que cachear.',
    area: 'web',
    level: 'intermedio',
    example: { label: 'el service worker de la web', href: `${REPO}/public/sw.js` },
  },
  {
    title: 'Accesibilidad que se testea',
    description:
      'Roles, labels y navegación por teclado, y cómo Testing Library te obliga a escribir componentes que un lector de pantalla entiende.',
    area: 'web',
    level: 'inicial',
  },
  {
    title: 'Diseño de sistemas visuales con Tailwind',
    description:
      'Tokens, componentes y reglas compartidas para que cientos de pantallas se vean como un solo producto.',
    area: 'web',
    level: 'inicial',
    example: { label: 'el sistema de diseño de la web', href: '/desarrollo/diseno' },
  },

  // ── Backend y datos ──
  {
    title: 'Prisma en producción: migraciones sin miedo',
    description:
      'Escribir y revisar migraciones, qué pasa con los datos existentes y cómo migrar una versión mayor del ORM sin romper nada.',
    area: 'backend',
    level: 'intermedio',
    example: { label: 'la migración a Prisma 7', href: `${REPO}/docs/migracion-prisma-7.md` },
  },
  {
    title: 'Modelar una base de datos relacional',
    description:
      'Normalizar o no, claves, índices y relaciones, con un modelo real de punta a punta.',
    area: 'backend',
    level: 'inicial',
    example: { label: 'el diagrama de la base de la web', href: '/desarrollo' },
  },
  {
    title: 'Diseñar una API que dure',
    description: 'Versionado, paginación, errores consistentes e idempotencia en APIs REST.',
    area: 'backend',
    level: 'intermedio',
  },
  {
    title: 'Colas y trabajos en segundo plano',
    description:
      'Qué mandar a una cola, reintentos, idempotencia y cómo no perder trabajos cuando algo se cae.',
    area: 'backend',
    level: 'avanzado',
  },

  // ── Seguridad ──
  {
    title: 'OWASP Top 10 en una app real',
    description:
      'Recorrer cada riesgo con un caso concreto: control de acceso, inyección, SSRF, y las reglas que lo previenen en el día a día.',
    area: 'seguridad',
    level: 'intermedio',
    example: {
      label: 'cómo la web cubre el OWASP Top 10',
      href: `${REPO}/docs/seguridad-owasp.md`,
    },
  },
  {
    title: 'Verificación en dos pasos con TOTP',
    description:
      'Cómo funcionan los códigos de las apps autenticadoras, los códigos de recuperación y cómo evitar que un código se reutilice.',
    area: 'seguridad',
    level: 'avanzado',
    example: {
      label: 'la verificación en dos pasos de la web',
      href: `${REPO}/docs/verificacion-en-dos-pasos.md`,
    },
  },
  {
    title: 'Content Security Policy sin romper tu sitio',
    description:
      'Qué bloquea una CSP, cómo armarla de a poco y cómo convivir con scripts de terceros.',
    area: 'seguridad',
    level: 'intermedio',
    example: { label: 'la CSP de la web', href: `${REPO}/src/lib/csp.ts` },
  },
  {
    title: 'Rate limiting: frenar abusos sin molestar a nadie',
    description:
      'Ventanas fijas o deslizantes, por IP o por usuario, y cómo contarle a la persona cuánto tiene que esperar.',
    area: 'seguridad',
    level: 'intermedio',
    example: { label: 'el rate limit de la web', href: `${REPO}/src/lib/rate-limit.ts` },
  },

  // ── Infraestructura ──
  {
    title: 'Deploy con Docker y Kamal a tu propio servidor',
    description:
      'Del Dockerfile al deploy sin downtime en una instancia propia, y cuándo conviene frente a un PaaS.',
    area: 'infra',
    level: 'intermedio',
    example: { label: 'la configuración de deploy de la web', href: `${REPO}/config/deploy.yml` },
  },
  {
    title: 'Servir archivos con S3 y CloudFront',
    description:
      'Subidas directas desde el navegador, URLs firmadas que vencen y cómo optimizar imágenes antes de guardarlas.',
    area: 'infra',
    level: 'intermedio',
    example: {
      label: 'las URLs firmadas de la galería',
      href: `${REPO}/src/lib/gallery-signing.ts`,
    },
  },
  {
    title: 'CI/CD con GitHub Actions',
    description:
      'Qué conviene correr en cada push, qué localmente con hooks y cómo no gastar minutos de más.',
    area: 'infra',
    level: 'inicial',
    example: { label: 'el workflow de deploy', href: `${REPO}/.github/workflows/deployment.yml` },
  },
  {
    title: 'Observabilidad: logs, métricas y alertas',
    description: 'Qué medir, cómo encontrar un error en producción y cómo no ahogarse en ruido.',
    area: 'infra',
    level: 'intermedio',
    example: { label: 'las métricas abiertas de la web', href: '/metricas' },
  },

  // ── Testing y calidad ──
  {
    title: 'Testear componentes como los usa una persona',
    description:
      'Testing Library, queries por rol y por texto, y por qué los tests que miran detalles internos se rompen solos.',
    area: 'calidad',
    level: 'inicial',
    example: { label: 'los casos de test de la web', href: '/desarrollo/calidad' },
  },
  {
    title: 'Tests end-to-end con Playwright',
    description:
      'Flujos completos en un navegador real, datos de prueba aislados y cómo evitar tests intermitentes.',
    area: 'calidad',
    level: 'intermedio',
    example: {
      label: 'los tests e2e de la web',
      href: 'https://github.com/programaconnosotros/pcn-os/tree/main/tests/e2e',
    },
  },
  {
    title: 'Code review que suma',
    description: 'Qué mirar, cómo comentar sin herir y cómo hacer PRs fáciles de revisar.',
    area: 'calidad',
    level: 'inicial',
  },

  // ── IA ──
  {
    title: 'Agentes con tools usando el AI SDK',
    description:
      'Un agente que lee imágenes, consulta tu base con tools y devuelve datos estructurados que una persona revisa antes de guardar.',
    area: 'ia',
    level: 'avanzado',
    example: {
      label: 'el agente que lee flyers de eventos',
      href: `${REPO}/src/lib/event-flyer-agent.ts`,
    },
  },
  {
    title: 'Programar con asistentes de IA sin perder el control',
    description:
      'Cómo pedirle cosas a un agente de código, revisar lo que hace y en qué tareas ayuda de verdad.',
    area: 'ia',
    level: 'inicial',
  },
  {
    title: 'RAG: que un modelo responda sobre tus datos',
    description: 'Embeddings, búsqueda semántica y cómo evaluar si las respuestas son buenas.',
    area: 'ia',
    level: 'avanzado',
  },

  // ── Carrera ──
  {
    title: 'Mi primer trabajo en tecnología',
    description:
      'Cómo lo conseguiste, qué te sirvió, qué no y qué le dirías a quien está buscando el suyo.',
    area: 'carrera',
    level: 'inicial',
  },
  {
    title: 'Cómo preparar una entrevista técnica',
    description: 'Live coding, system design y cómo contar tu experiencia.',
    area: 'carrera',
    level: 'inicial',
    example: { label: 'las guías de entrevistas de la web', href: '/entrevistas' },
  },
  {
    title: 'Contribuir a open source por primera vez',
    description:
      'Encontrar un proyecto, entender el código ajeno y que te acepten el primer PR. La web de PCN es un buen lugar para empezar.',
    area: 'carrera',
    level: 'inicial',
    example: {
      label: 'el repo de la web',
      href: 'https://github.com/programaconnosotros/pcn-os',
    },
  },
  {
    title: 'De dev a tech lead',
    description: 'Qué cambia, qué se pierde, qué se gana y cómo saber si es para vos.',
    area: 'carrera',
    level: 'intermedio',
  },
  {
    title: 'Trabajar para afuera',
    description:
      'Inglés, contratos, impuestos y husos horarios: lo que aprendiste trabajando remoto.',
    area: 'carrera',
    level: 'intermedio',
  },
  {
    title: 'Un proyecto tuyo, de la idea a producción',
    description:
      'Contá algo que construiste: qué problema resolvía, qué decisiones tomaste y qué harías distinto.',
    area: 'carrera',
    level: 'inicial',
    example: { label: 'proyectos de la comunidad', href: '/proyectos' },
  },
];

export const TALK_IDEA_AREAS = [...new Set(talkIdeas.map((idea) => idea.area))];
