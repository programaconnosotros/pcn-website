// Architecture diagrams shown on /desarrollo. Each view is a Mermaid diagram plus the explanation
// of every box in it, in the same order the diagram reads. Keep them in sync with the code:
// config/deploy.yml, .github/workflows/deployment.yml, docker-compose.yml and src/.

export type ArchitectureComponent = { term: string; detail: string };

export type ArchitectureView = {
  id: string;
  title: string;
  summary: string;
  source: string;
  components: ArchitectureComponent[];
};

const logical: ArchitectureView = {
  id: 'logica',
  title: 'Arquitectura lógica',
  summary:
    'Cómo se reparte la responsabilidad dentro de la aplicación, sin importar dónde corre. Es un monolito de Next.js en capas: la interfaz nunca habla directo con la base, siempre pasa por server actions o route handlers, que validan, chequean permisos y recién ahí usan Prisma.',
  source: `flowchart TB
  subgraph cliente["Navegador"]
    rsc["Páginas (Server Components)"]
    cc["Client Components<br/>shadcn/ui · React Query · react-hook-form"]
    sw["Service worker (PWA)"]
  end
  subgraph servidor["Servidor Next.js"]
    router["App Router<br/>src/app"]
    actions["Server actions<br/>src/actions"]
    routes["Route handlers<br/>src/app/api · feed.xml · /up"]
    schemas["Validación Zod<br/>src/schemas"]
    lib["Dominio y utilidades<br/>src/lib"]
    content["Contenido versionado<br/>src/data · artículos · cursos"]
    orm["Prisma Client<br/>src/lib/prisma.ts"]
  end
  subgraph externos["Servicios externos"]
    db[("PostgreSQL")]
    s3[("S3")]
    cdn["CloudFront"]
    smtp["SMTP<br/>Gmail · MailHog"]
  end
  rsc --> router
  cc -- "llamadas RPC" --> actions
  cc -- "fetch" --> routes
  sw -. "cachea" .-> rsc
  router --> lib
  router --> content
  actions --> schemas
  actions --> lib
  routes --> lib
  lib --> orm --> db
  lib -- "SDK de AWS" --> s3
  lib -- "URLs firmadas" --> cdn
  lib -- "nodemailer" --> smtp
  cdn --> s3
  cc -. "sube archivos con URL prefirmada" .-> s3`,
  components: [
    {
      term: 'Páginas (Server Components)',
      detail:
        'La mayoría de las páginas se renderizan en el servidor: consultan los datos ahí mismo y mandan HTML al navegador. No exponen ninguna API ni envían JavaScript para la parte que no es interactiva.',
    },
    {
      term: 'Client Components',
      detail:
        'Las partes interactivas (formularios, filtros, el diagrama de la base, PCN OS) llevan "use client". Usan shadcn/ui sobre Radix para la UI, react-hook-form + Zod para formularios y React Query para cachear datos que se piden desde el cliente.',
    },
    {
      term: 'Service worker (PWA)',
      detail:
        'public/sw.js, registrado por pwa-provider.tsx. Permite instalar PCN como app y muestra /offline cuando no hay conexión.',
    },
    {
      term: 'App Router',
      detail:
        'src/app define las rutas por carpetas: el grupo (platform) con las secciones de la comunidad, autenticacion, api y archivos especiales (sitemap, robots, opengraph-image, [shortcut]). Los layouts comparten la barra lateral, el tema y los providers.',
    },
    {
      term: 'Server actions',
      detail:
        'src/actions, agrupadas por dominio (auth, events, gallery, talks, comments…). Son la única puerta de escritura: cada una aplica el rate limit, lee la sesión de la cookie, chequea el rol o el dueño del recurso, valida la entrada y después escribe. Al terminar llaman a revalidatePath para refrescar las páginas afectadas.',
    },
    {
      term: 'Route handlers',
      detail:
        'Endpoints HTTP para lo que no es un formulario: /api/search (búsqueda global), /api/galeria (fotos aleatorias y detalle), los embeds de /lectura y /proyectos, /feed.xml (RSS) y /up, el healthcheck que usa el deploy.',
    },
    {
      term: 'Validación Zod',
      detail:
        'Los schemas de src/schemas se comparten entre el formulario del cliente y la server action: el usuario ve el error antes de enviar, y el servidor vuelve a validar porque al cliente no se le cree nada.',
    },
    {
      term: 'Dominio y utilidades',
      detail:
        'src/lib concentra la lógica reutilizable: sesiones (session.ts), permisos de eventos, lista de espera, rate limiting en memoria, procesamiento de fotos con sharp, S3 y firma de CloudFront, emails, calendario (ICS y Google Calendar), índice de búsqueda y logros.',
    },
    {
      term: 'Contenido versionado',
      detail:
        'Lo que cambia poco vive en el repo y no en la base: changelog, preguntas frecuentes, partners, conversaciones, artículos de /lectura, cursos y las estadísticas de GitHub (src/data/github-stats.json). Se edita con una PR y se publica con el deploy.',
    },
    {
      term: 'Prisma Client',
      detail:
        'Un único cliente compartido (singleton) que por defecto omite datos sensibles, como el hash de la contraseña y el teléfono de los oradores, para que no lleguen nunca a un componente por accidente.',
    },
    {
      term: 'PostgreSQL',
      detail:
        'La fuente de verdad de todo lo que crea la comunidad: usuarios, sesiones, eventos, inscripciones, charlas, galería, comentarios, notificaciones, visitas y logs de errores. Más abajo está el diagrama completo de entidades.',
    },
    {
      term: 'S3 y CloudFront',
      detail:
        'S3 guarda los archivos subidos (flyers, fotos de perfil, logos, galería) y CloudFront los sirve desde la CDN. La galería es privada: solo se ve con URLs que el servidor firma al renderizar.',
    },
    {
      term: 'SMTP',
      detail:
        'Los emails transaccionales (código de verificación, recuperar clave, avisos de eventos) se arman con React Email y se envían con nodemailer: por Gmail en producción y por MailHog en local.',
    },
  ],
};

const physical: ArchitectureView = {
  id: 'fisica',
  title: 'Arquitectura física',
  summary:
    'Dónde corre cada pieza en producción. Todo vive en AWS: el tráfico de la app entra por un único servidor; los archivos pesados no pasan por él, van directo entre el navegador y S3/CloudFront.',
  source: `flowchart TB
  user["Navegador / PWA"]
  dns["DNS<br/>programaconnosotros.com"]
  subgraph aws["AWS"]
    subgraph ec2["Servidor EC2 · Ubuntu"]
      proxy["kamal-proxy<br/>HTTPS · Let's Encrypt"]
      app["Contenedor pcn-website<br/>Node 24 · next start :3000"]
    end
    s3[("Bucket S3")]
    cf["CloudFront<br/>CDN"]
    ecr[("ECR<br/>registry de imágenes")]
    db[("PostgreSQL")]
  end
  gmail["Gmail SMTP"]
  gh["GitHub<br/>repo · Actions"]
  user --> dns --> proxy
  proxy --> app
  app --> db
  app --> s3
  app --> gmail
  user -- "imágenes y video" --> cf --> s3
  user -- "subidas con URL prefirmada" --> s3
  ecr -- "docker pull" --> ec2
  gh -- "build y push" --> ecr
  gh -- "SSH" --> ec2`,
  components: [
    {
      term: 'Navegador / PWA',
      detail:
        'El sitio funciona en cualquier navegador y se puede instalar como app. Pide el HTML al servidor y las imágenes a CloudFront.',
    },
    {
      term: 'DNS',
      detail: 'programaconnosotros.com apunta a la IP pública del servidor EC2.',
    },
    {
      term: 'Servidor EC2',
      detail:
        'Una única máquina Ubuntu en AWS (us-east-2) con Docker, configurada en config/deploy.yml. Como hay un solo proceso, cosas como el rate limiting se guardan en memoria sin necesidad de Redis.',
    },
    {
      term: 'kamal-proxy',
      detail:
        'El reverse proxy que instala Kamal delante de la app. Termina HTTPS con certificados de Let’s Encrypt que renueva solo y reenvía el tráfico al puerto 3000 del contenedor activo.',
    },
    {
      term: 'Contenedor pcn-website',
      detail:
        'La imagen construida con Dockerfile.prod (Node 24, pnpm build) que corre next start. Recibe la configuración (base, AWS, SMTP) como variables de entorno secretas.',
    },
    {
      term: 'PostgreSQL',
      detail:
        'La base de producción también vive en AWS, separada del servidor de la app: el contenedor se puede reemplazar en cada deploy sin tocar los datos. Prisma se conecta con una URL que llega como secreto, y el pipeline de deploy usa una conexión directa para aplicar las migraciones.',
    },
    {
      term: 'Bucket S3',
      detail:
        'Guarda los archivos subidos. El navegador sube directo con una URL o un formulario prefirmados de vida corta, así un video grande no ocupa memoria ni ancho de banda del servidor.',
    },
    {
      term: 'CloudFront',
      detail:
        'La CDN delante del bucket: entrega flyers, avatares y galería desde un servidor cercano al visitante. Las fotos de la galería se guardan como inmutables, así que se cachean un año sin invalidar nada.',
    },
    {
      term: 'ECR',
      detail:
        'Amazon Elastic Container Registry: donde el pipeline sube cada imagen nueva y de donde el servidor la descarga al desplegar.',
    },
    {
      term: 'Gmail SMTP',
      detail:
        'El servidor de correo saliente de producción, autenticado con una cuenta propia del proyecto.',
    },
    {
      term: 'GitHub',
      detail:
        'Aloja el código y corre el pipeline de deploy. Además, pnpm github:stats consulta su API para regenerar el snapshot de estadísticas; el sitio nunca llama a GitHub en tiempo de render.',
    },
  ],
};

const deployment: ArchitectureView = {
  id: 'despliegue',
  title: 'Arquitectura de despliegue',
  summary:
    'El camino de un cambio desde tu branch hasta producción. Nada se despliega a mano: mergear a main dispara todo, y la versión vieja sigue atendiendo hasta que la nueva responde bien.',
  source: `flowchart TB
  subgraph git["Git"]
    direction LR
    dev["Tu branch"] -- "pre-push: lint · format<br/>test · build" --> pr["PR hacia testing"]
    pr -- "review y merge" --> testing["branch testing"]
    testing -- "merge del equipo" --> main["branch main"]
  end
  subgraph gha["GitHub Actions · deployment.yml"]
    direction LR
    install["pnpm install<br/>--frozen-lockfile"] --> migrate["prisma migrate deploy"]
    migrate --> build["kamal build<br/>Buildx · Dockerfile.prod · caché GHA"]
  end
  subgraph server["Servidor EC2 · kamal deploy por SSH"]
    direction LR
    pull["docker pull<br/>imagen nueva"] --> boot["arranca el<br/>contenedor nuevo"]
    boot --> health{"GET /up<br/>responde 200?"}
    health -- "sí" --> swap["kamal-proxy pasa el tráfico<br/>y apaga el contenedor viejo"]
    health -- "no" --> keep["el contenedor viejo<br/>sigue atendiendo"]
  end
  git -- "push a main dispara el workflow" --> gha
  gha -- "migraciones" --> db[("PostgreSQL")]
  gha -- "push imagen" --> ecr[("ECR")]
  ecr -- "pull" --> server`,
  components: [
    {
      term: 'Tu branch',
      detail:
        'Cada cambio arranca en una branch propia. Husky corre lint, format check, tests y build antes de cada push: si algo falla, no sale de tu máquina.',
    },
    {
      term: 'PR hacia testing',
      detail:
        'La PR se revisa contra testing, nunca contra main. Si cambia la UI, lleva capturas generadas con pnpm screenshot.',
    },
    {
      term: 'branch testing',
      detail:
        'Junta los cambios aprobados. Cuando el equipo decide publicar, mergea testing a main.',
    },
    {
      term: 'GitHub Actions',
      detail:
        'El workflow deployment.yml corre en cada push a main (o a mano con workflow_dispatch). Arma el entorno con Node 24, pnpm, Ruby y Kamal, y carga los secretos del repo como variables.',
    },
    {
      term: 'prisma migrate deploy',
      detail:
        'Aplica a la base de producción las migraciones de prisma/migrations que todavía no corrieron, antes de que la versión nueva arranque. Por eso cada migración tiene que ser compatible con el código que está corriendo en ese momento.',
    },
    {
      term: 'kamal build',
      detail:
        'Construye la imagen amd64 con Docker Buildx a partir de Dockerfile.prod, reutilizando la caché de GitHub Actions, y la sube a ECR.',
    },
    {
      term: 'kamal deploy',
      detail:
        'Se conecta por SSH al servidor, descarga la imagen y arranca un contenedor nuevo al lado del viejo.',
    },
    {
      term: 'Healthcheck /up',
      detail:
        'kamal-proxy le pega a /up (src/app/up/route.ts) hasta que responde 200. Recién ahí manda el tráfico al contenedor nuevo y apaga el viejo: deploy sin downtime. Si nunca responde, el deploy falla y producción sigue con la versión anterior.',
    },
  ],
};

const local: ArchitectureView = {
  id: 'local',
  title: 'Entorno de desarrollo local',
  summary:
    'Lo mismo que producción, pero en tu máquina y con reemplazos locales: Postgres en Docker en vez de la base de producción y MailHog en vez de Gmail. Hay dos formas de levantarlo.',
  source: `flowchart TB
  subgraph compose["docker-compose up -d"]
    web["web<br/>next dev · localhost:3000"]
    pg[("database<br/>postgres:13 · :5432")]
    mh["mailhog<br/>SMTP :11025 · UI :18025"]
  end
  subgraph host["pnpm dev (Node 24+)"]
    portless["portless<br/>https://pcn-website.localhost"]
    next["next dev"]
    portless --> next
  end
  dev["Navegador"] --> web
  dev --> portless
  dev -- "ver emails" --> mh
  web --> pg
  web --> mh
  next --> pg
  next --> mh
  web -. "opcional" .-> s3[("S3 de desarrollo")]
  next -. "opcional" .-> s3`,
  components: [
    {
      term: 'web',
      detail:
        'Contenedor con next dev y el código montado como volumen: los cambios se ven al instante. Aplica las migraciones al arrancar y espera a que la base esté sana.',
    },
    {
      term: 'database',
      detail:
        'Postgres 13 con healthcheck (pg_isready). Con pnpm populate-database se carga con datos de prueba.',
    },
    {
      term: 'mailhog',
      detail:
        'Un servidor SMTP falso que atrapa todos los emails. Se leen en http://localhost:18025, así podés probar la verificación de cuenta sin mandar nada real.',
    },
    {
      term: 'pnpm dev + portless',
      detail:
        'La alternativa sin el contenedor web: corre next dev en tu máquina detrás de portless, que le da una URL estable por HTTPS. Cada worktree tiene su propia URL (<branch>.pcn-website.localhost) y su propia base, así podés tener varias branches levantadas sin choques de puertos.',
    },
    {
      term: 'S3 de desarrollo',
      detail:
        'Subir archivos necesita credenciales de AWS en el .env. Sin ellas, el resto del sitio funciona igual.',
    },
  ],
};

const flows: ArchitectureView = {
  id: 'flujos',
  title: 'Flujo de una petición',
  summary:
    'Cómo colaboran las piezas en dos casos reales: abrir una página y subir una foto a la galería. El segundo muestra por qué los archivos van directo a S3 y no a través del servidor.',
  source: `sequenceDiagram
  autonumber
  participant B as Navegador
  participant P as kamal-proxy
  participant N as Next.js
  participant D as PostgreSQL
  participant S as S3
  participant C as CloudFront
  B->>P: GET /galeria (cookie sessionId)
  P->>N: reenvía la petición
  N->>D: busca la sesión por el hash del token
  N->>D: consulta las fotos
  N-->>B: HTML con URLs firmadas de CloudFront
  B->>C: pide las miniaturas
  C->>S: trae el archivo (primera vez)
  C-->>B: imagen cacheada
  Note over B,N: Subir una foto (admin)
  B->>N: server action getPhotoUploadUrl
  N-->>B: URL prefirmada de S3 (5 min)
  B->>S: PUT del original, directo
  B->>N: server action createPhoto(key)
  N->>S: descarga el original
  N->>N: sharp genera full y thumb en WebP
  N->>S: guarda las versiones y borra el original
  N->>D: crea el GalleryItem
  N-->>B: revalida la galería`,
  components: [
    {
      term: 'Sesión',
      detail:
        'La cookie sessionId lleva un token aleatorio; la base guarda solo su hash SHA-256. Cada request la resuelve con findSession, que además descarta las sesiones vencidas.',
    },
    {
      term: 'Render en el servidor',
      detail:
        'La página consulta la base con Prisma y devuelve HTML listo. Las URLs de la galería se firman en ese momento y valen hasta el final de la hora siguiente, así la misma foto conserva la URL y se cachea.',
    },
    {
      term: 'CloudFront como caché',
      detail:
        'La primera vez trae el archivo de S3; las siguientes lo entrega desde la CDN sin tocar ni el servidor ni el bucket.',
    },
    {
      term: 'Subida directa a S3',
      detail:
        'El servidor solo firma un permiso de subida de vida corta para una clave y un tipo de archivo concretos. El archivo viaja del navegador a S3 sin pasar por Next.js. Los videos, además, se optimizan en el propio navegador con mediabunny antes de subirse.',
    },
    {
      term: 'Procesamiento con sharp',
      detail:
        'createPhoto descarga el original, lo rota según el EXIF y genera una versión de hasta 2560px y una miniatura de 640px en WebP. El original se borra: lo que queda guardado ya está optimizado.',
    },
    {
      term: 'Revalidación',
      detail:
        'Después de escribir, la server action llama a revalidatePath para que la próxima visita a la galería vea la foto nueva.',
    },
  ],
};

export const architectureViews: ArchitectureView[] = [logical, physical, deployment, local, flows];
