// What /desarrollo/calidad tells about how the site is tested: the tools and techniques that are
// really in the repo, the gates a change goes through, and what is still missing (labelled as
// such). Keep it honest: only list something here once it's in the code.

export type QualityItem = {
  term: string;
  detail: string;
  /** A file in the repo that shows it, linked to GitHub. */
  file?: string;
};

export type QualityGate = {
  stage: string;
  command: string;
  checks: string;
};

/** Each check a change has to pass, in order, from the commit to production. */
export const qualityGates: QualityGate[] = [
  {
    stage: 'pre-commit',
    command: 'pnpm exec lint-staged',
    checks:
      'Husky corre lint-staged, que formatea con Prettier solo los archivos que cambiaste (js, ts, tsx, json, css, md). Nadie commitea código sin formatear.',
  },
  {
    stage: 'pre-push',
    command: 'pnpm lint && pnpm format:check && pnpm test && pnpm build',
    checks:
      'ESLint, el chequeo de formato, toda la suite de Jest y el build de producción de Next.js (que incluye el chequeo de tipos de TypeScript). Si algo falla, el push no sale.',
  },
  {
    stage: 'pull request',
    command: 'pnpm screenshot /ruta && pnpm screenshot:publish',
    checks:
      'Cada cambio entra por una PR hacia testing que revisa otra persona. Si toca la UI, lleva capturas de las rutas afectadas tomadas con Playwright (Chromium headless) y publicadas en la branch huérfana pr-screenshots.',
  },
  {
    stage: 'deploy',
    command: 'pnpm prisma migrate deploy && kamal deploy',
    checks:
      'El push a main dispara GitHub Actions: instala con el lockfile congelado (--frozen-lockfile), aplica las migraciones pendientes y despliega con Kamal, que solo pasa el tráfico a la versión nueva cuando responde el health check de /up.',
  },
  {
    stage: 'producción',
    command: '/monitoreo · /analiticas',
    checks:
      'Los errores del servidor y del cliente quedan en ErrorLog (con el usuario y la ruta) y se revisan y marcan como resueltos desde /monitoreo; los logs de la app y las visitas también se guardan para investigar.',
  },
];

export const qualityTools: QualityItem[] = [
  {
    term: 'Jest 30',
    detail:
      'El runner de toda la suite automatizada, configurado con next/jest (que usa el compilador SWC de Next.js para TypeScript). Corre en entorno node y solo busca src/**/*.test.ts.',
    file: 'jest.config.mjs',
  },
  {
    term: 'jest-mock-extended',
    detail:
      'jest.setup.ts reemplaza el cliente de Prisma por un mockDeep tipado y lo resetea antes de cada test: las server actions se prueban sin base de datos y TypeScript avisa si un mock no coincide con el modelo.',
    file: 'jest.setup.ts',
  },
  {
    term: 'Helpers de test',
    detail:
      'src/test trae mockCookies(), mockHeaders() y prismaMock para armar cada escenario (anónimo, logueado, admin) en una línea. jest.setup.ts además simula redirect() de Next.js lanzando NEXT_REDIRECT:/ruta, igual que en producción.',
    file: 'src/test/cookies.ts',
  },
  {
    term: 'Playwright',
    detail:
      'Configurado para Chromium, Firefox y WebKit (playwright.config.ts). Hoy se usa para tomar las capturas de las PRs (scripts/pr-screenshots.mjs); la suite E2E de tests/ es todavía un smoke test inicial.',
    file: 'scripts/pr-screenshots.mjs',
  },
  {
    term: 'TypeScript strict',
    detail:
      'strict y strictNullChecks activados en tsconfig.json: null, undefined y los tipos de Prisma se chequean en todo el código. El build falla con cualquier error de tipos.',
    file: 'tsconfig.json',
  },
  {
    term: 'Zod',
    detail:
      'Schemas en src/schemas que validan lo mismo en el formulario (react-hook-form + zodResolver) y en la server action, con los mensajes de error en español. El cliente nunca es la única validación.',
    file: 'src/schemas/event-schema.ts',
  },
  {
    term: 'Prisma',
    detail:
      'Cliente tipado generado desde el schema, restricciones únicas compuestas en la base (no se puede inscribir dos veces a la misma persona) y migraciones SQL versionadas que el deploy aplica antes de levantar la versión nueva.',
    file: 'prisma/schema.prisma',
  },
  {
    term: 'ESLint 9 + Prettier',
    detail:
      'Flat config con eslint-config-next/core-web-vitals (reglas de React, hooks, Next.js y parte de jsx-a11y) y eslint-config-prettier; Prettier 3 con el plugin que ordena las clases de Tailwind.',
    file: 'eslint.config.mjs',
  },
  {
    term: 'Husky + lint-staged',
    detail: 'Los hooks de git que hacen de CI local: nada llega al repo sin pasar los checks.',
    file: '.husky/pre-push',
  },
  {
    term: 'Rate limiting',
    detail:
      'Ventana deslizante por usuario (o por IP si es anónimo) para cada formulario: login, registro, códigos, contenido, comentarios, inscripciones, uploads, descargas. Los admins no tienen límite y el error viaja en RateLimitError.digest porque producción oculta los mensajes.',
    file: 'src/lib/rate-limit.ts',
  },
  {
    term: 'Bases aisladas por worktree',
    detail:
      'Cada worktree de git tiene su propia base de Postgres (scripts/setup-worktree-db.sh) y su URL con portless, así se prueban varias branches en paralelo sin pisarse datos ni puertos.',
    file: 'scripts/setup-worktree-db.sh',
  },
  {
    term: 'MailHog',
    detail:
      'En desarrollo los emails (códigos de verificación, recuperación de clave, avisos) no salen a internet: docker-compose levanta MailHog y se leen en localhost:18025.',
    file: 'docker-compose.yml',
  },
];

export const qualityTechniques: QualityItem[] = [
  {
    term: 'Tests colocalizados',
    detail:
      'Cada test vive al lado del código que prueba (create-event.ts → create-event.test.ts). Si movés o borrás el módulo, el test va con él.',
  },
  {
    term: 'Test doubles',
    detail:
      'Prisma, cookies(), headers(), revalidatePath, S3, el envío de emails y fetch se reemplazan por mocks: los tests son rápidos, deterministas y no tocan servicios reales.',
  },
  {
    term: 'Matriz de permisos',
    detail:
      'Casi toda server action se prueba primero por lo que tiene que rechazar: sin cookie de sesión, con sesión vencida o inexistente, usuario que no es el autor, que no es organizador, que no es admin. Recién después el camino feliz.',
    file: 'src/actions/advises/delete-advise.test.ts',
  },
  {
    term: 'Testing negativo y de bordes',
    detail:
      'Particiones de equivalencia y valores límite sobre los schemas: contenido vacío, un carácter de más, fechas en el pasado, cupo lleno exacto, códigos vencidos o ya usados.',
    file: 'src/schemas/event-schema.test.ts',
  },
  {
    term: 'Tests parametrizados',
    detail:
      'it.each recorre tablas de casos (direcciones IP privadas, redirecciones peligrosas, cada track de entrevistas) con un solo cuerpo de test.',
    file: 'src/lib/safe-redirect.test.ts',
  },
  {
    term: 'Tiempo controlado',
    detail:
      'jest.useFakeTimers y setSystemTime congelan el reloj para probar ventanas del rate limit y qué eventos son "próximos" sin depender de cuándo corre el test.',
    file: 'src/lib/rate-limit.test.ts',
  },
  {
    term: 'Tests de seguridad',
    detail:
      'SSRF al validar URLs embebibles (IPs privadas, metadata de la nube, cada salto de redirección), open redirect después del login, URLs firmadas de CloudFront para la galería, costo de bcrypt y re-hash de contraseñas viejas.',
    file: 'src/lib/embeddable.test.ts',
  },
  {
    term: 'Binarios reales',
    detail:
      'El procesamiento de fotos se prueba con imágenes generadas con sharp en el momento: que achique, que nunca agrande, que respete la rotación EXIF y que salga en webp.',
    file: 'src/lib/photo-processing.test.ts',
  },
  {
    term: 'Integridad de contenido',
    detail:
      'El contenido estático versionado también se testea: cada guía de entrevistas tiene secciones con ids únicos y contenido, cada ejercicio de live coding está completo.',
    file: 'src/app/(platform)/entrevistas/guias/guides/guides.test.ts',
  },
  {
    term: 'Revisión visual',
    detail:
      'Las capturas de cada ruta afectada van en la PR para que la revisión no dependa de levantar el proyecto.',
  },
  {
    term: 'Testing manual exploratorio',
    detail:
      'Lo que no está automatizado (flujos en el navegador, PWA, PCN OS, responsive, accesibilidad) se prueba a mano siguiendo los casos de este repositorio antes de mergear a main.',
  },
];

/** Not in the repo yet: what we'd add next, in rough order. */
export const qualityRoadmap: QualityItem[] = [
  {
    term: 'CI en las PRs',
    detail:
      'Hoy los checks corren en los hooks de cada máquina; un workflow de GitHub Actions que repita lint, tipos, tests y build en cada PR evitaría depender de que nadie use --no-verify.',
  },
  {
    term: 'Suite E2E real',
    detail:
      'Convertir los casos manuales de prioridad alta (login, registro, inscripción a eventos, subir fotos) en tests de Playwright contra una base sembrada.',
  },
  {
    term: 'Accesibilidad automatizada',
    detail:
      'Sumar @axe-core/playwright a la suite E2E para detectar contraste, labels y roles faltantes en cada ruta.',
  },
  {
    term: 'Cobertura',
    detail:
      'jest --coverage con un umbral mínimo en src/lib y src/actions, para ver qué queda sin probar.',
  },
  {
    term: 'Integración con Postgres',
    detail:
      'Correr una parte de las server actions contra una base real (la del worktree) para cubrir restricciones únicas, cascadas y transacciones que los mocks no ven.',
  },
  {
    term: 'Regresión visual',
    detail:
      'Comparar las capturas de pnpm screenshot contra las de main y marcar las diferencias en píxeles.',
  },
];
