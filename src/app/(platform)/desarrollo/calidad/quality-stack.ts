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
      'ESLint (que además prohíbe armar SQL a mano), el chequeo de formato, toda la suite unitaria y de componentes de Jest (incluidos los guardas de seguridad: SQL injection y chequeo de permisos en cada server action) y el build de producción, que chequea los tipos. Si algo falla, el push no sale.',
  },
  {
    stage: 'integración',
    command: 'pnpm test:db',
    checks:
      'Al tocar queries, el schema o server actions: corre las actions contra un Postgres real en una base descartable con todas las migraciones. Restricciones únicas, cascadas, transacciones, carreras por el último lugar de un evento y payloads de SQL injection.',
  },
  {
    stage: 'pull request',
    command: 'pnpm screenshot /ruta && pnpm screenshot:publish',
    checks:
      'Cada cambio entra por una PR hacia testing que revisa otra persona. Si toca la UI, lleva capturas de las rutas afectadas tomadas con Playwright (Chromium headless) y publicadas en la branch huérfana pr-screenshots.',
  },
  {
    stage: 'regresión semanal',
    command: 'pnpm test:e2e',
    checks:
      'Una vez por semana y antes de un release grande: recrea una base con datos de prueba, compila el sitio en modo producción y lo recorre con Playwright (desktop y mobile), con un test por caso manual automatizado y una pasada por todas las rutas públicas buscando errores y violaciones de CSP.',
  },
  {
    stage: 'deploy',
    command: 'pnpm prisma migrate deploy && kamal deploy',
    checks:
      'El push a main dispara GitHub Actions: instala con el lockfile congelado (--frozen-lockfile), aplica las migraciones pendientes y despliega con Kamal, que solo pasa el tráfico a la versión nueva cuando responde el health check de /up. Los tests no corren en CI, a propósito: corren antes, en cada máquina.',
  },
  {
    stage: 'producción',
    command: '/monitoreo · notificaciones',
    checks:
      'Los errores del servidor y del cliente quedan en ErrorLog y se revisan desde /monitoreo. Un error nuevo del servidor o un posible ataque de fuerza bruta (alguien que llega al límite de login o de códigos) les llega a los admins como notificación.',
  },
];

export const qualityTools: QualityItem[] = [
  {
    term: 'Jest 30',
    detail:
      'El runner de unit, componentes e integración, con next/jest (el compilador SWC de Next.js). Dos proyectos: node para *.test.ts (lib, schemas, server actions, route handlers) y jsdom para *.test.tsx (componentes). La integración usa su propia config.',
    file: 'jest.config.mjs',
  },
  {
    term: 'Testing Library',
    detail:
      '@testing-library/react y user-event renderizan los componentes en jsdom y los usan como una persona: por rol, label y texto, tipeando y haciendo click. jest.setup.dom.ts simula el router de Next y las APIs del navegador que jsdom no tiene.',
    file: 'jest.setup.dom.ts',
  },
  {
    term: 'jest-mock-extended',
    detail:
      'En la suite unitaria, jest.setup.ts reemplaza el cliente de Prisma por un mockDeep tipado y lo resetea antes de cada test: las server actions se prueban sin base y TypeScript avisa si un mock no coincide con el modelo.',
    file: 'jest.setup.ts',
  },
  {
    term: 'Postgres de integración',
    detail:
      'pnpm test:db crea una base descartable por corrida al lado de la de desarrollo (solo en un Postgres local), aplica las migraciones, corre las actions con Prisma de verdad y sesiones reales por rol, y la borra al terminar.',
    file: 'jest.db.config.mjs',
  },
  {
    term: 'Playwright',
    detail:
      'La regresión e2e: una base propia sembrada (un usuario por rol), un build de producción en su propio puerto, login una vez por rol guardado como storage state, una IP distinta por test para que no se crucen los rate limits, Desktop Chrome y Pixel 7. También toma las capturas de las PRs.',
    file: 'playwright.config.ts',
  },
  {
    term: 'Cobertura',
    detail:
      'pnpm test:coverage mide líneas, ramas y funciones; pnpm qa:cases guarda el resumen por carpeta que se muestra en esta página.',
    file: 'scripts/generate-automated-cases.mjs',
  },
  {
    term: 'Helpers de test',
    detail:
      'src/test trae mockCookies(), mockHeaders() y prismaMock para la suite unitaria, createUser() y actAs() para la de integración (crea la sesión en la base), y builders de eventos, charlas y galería para los componentes.',
    file: 'src/test/db/fixtures.ts',
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
      'Schemas en src/schemas que validan lo mismo en el formulario (react-hook-form + zodResolver) y en la server action, con los mensajes en español. Zod descarta los campos que no están en el schema, así nadie puede mandar role: ADMIN en un formulario de perfil.',
    file: 'src/schemas/profile-schema.ts',
  },
  {
    term: 'Prisma',
    detail:
      'Cliente tipado generado desde el schema, restricciones únicas compuestas en la base (no se puede inscribir dos veces a la misma persona), datos sensibles omitidos por defecto y migraciones SQL versionadas.',
    file: 'prisma/schema.prisma',
  },
  {
    term: 'ESLint 9 + Prettier',
    detail:
      'Flat config con eslint-config-next/core-web-vitals y reglas propias que prohíben $queryRawUnsafe, Prisma.raw y drivers de base que no sean Prisma; Prettier 3 con el plugin que ordena las clases de Tailwind.',
    file: 'eslint.config.mjs',
  },
  {
    term: 'Husky + lint-staged',
    detail: 'Los hooks de git que hacen de CI local: nada llega al repo sin pasar los checks.',
    file: '.husky/pre-push',
  },
  {
    term: 'Dependabot',
    detail:
      'Abre PRs los lunes para dependencias con vulnerabilidades conocidas o desactualizadas; pnpm.overrides fuerza versiones parcheadas de dependencias transitivas.',
    file: '.github/dependabot.yml',
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
      'En desarrollo los emails no salen a internet: docker-compose levanta MailHog y se leen en localhost:18025. En la suite e2e los mails no se mandan (jsonTransport) y los tests leen los códigos de la base.',
    file: 'docker-compose.yml',
  },
];

export const qualityTechniques: QualityItem[] = [
  {
    term: 'Tests colocalizados',
    detail:
      'Cada test vive al lado del código que prueba (create-event.ts → create-event.test.ts y create-event.db.test.ts). Si movés o borrás el módulo, el test va con él.',
  },
  {
    term: 'Test doubles',
    detail:
      'En la suite unitaria, Prisma, cookies(), headers(), revalidatePath, S3, el envío de emails y fetch se reemplazan por mocks: rápidos y deterministas. La integración usa los reales.',
  },
  {
    term: 'Matriz de permisos',
    detail:
      'Toda server action se prueba primero por lo que tiene que rechazar: sin sesión, sesión vencida, usuario que no es el autor, que no es organizador, que no es admin. Un test lee el AST de cada action y falla si alguna no valida la sesión o los permisos sin estar declarada pública.',
    file: 'src/lib/server-action-auth.test.ts',
  },
  {
    term: 'SQL injection',
    detail:
      'Un test recorre el AST de todo src/ y falla ante cualquier forma de armar SQL a mano; otro manda payloads clásicos (tautologías, DROP TABLE, UNION, pg_sleep) por cada formulario contra Postgres real y comprueba que se guardan como texto, que nadie entra y que las tablas siguen intactas.',
    file: 'src/test/sql-injection.db.test.ts',
  },
  {
    term: 'Concurrencia',
    detail:
      'La integración dispara requests a la vez: varias personas por el último lugar de un evento, la misma persona inscribiéndose dos veces, un doble click al convertir una propuesta en charla, intentos de código en paralelo.',
    file: 'src/actions/events/registration.db.test.ts',
  },
  {
    term: 'Testing negativo y de bordes',
    detail:
      'Particiones de equivalencia y valores límite sobre los schemas: contenido vacío, un carácter de más, fechas en el pasado o al revés, cupo lleno exacto, códigos vencidos o ya usados.',
    file: 'src/schemas/event-schema.test.ts',
  },
  {
    term: 'Tests parametrizados',
    detail:
      'it.each recorre tablas de casos (direcciones IP privadas, redirecciones peligrosas, payloads de inyección, cada track de entrevistas) con un solo cuerpo de test.',
    file: 'src/lib/safe-fetch.test.ts',
  },
  {
    term: 'Tiempo controlado',
    detail:
      'jest.useFakeTimers y page.clock de Playwright congelan el reloj para probar ventanas del rate limit, cuentas regresivas de los códigos y qué eventos son "próximos".',
    file: 'src/lib/rate-limit.test.ts',
  },
  {
    term: 'Tests de seguridad',
    detail:
      'SSRF con servidores HTTP reales (IPs internas, redirects, DNS rebinding), CSP con nonce por request, open redirect después del login, mass assignment en el perfil, timing del login, URLs firmadas de la galería y path traversal en las descargas.',
    file: 'src/lib/safe-fetch.test.ts',
  },
  {
    term: 'Bugs fijados con tests',
    detail:
      'Un bug encontrado se escribe primero como test del comportamiento correcto (it.failing / test.fail) y se arregla después, dando vuelta el test. Así esta suite encontró y cerró, entre otros, un escalamiento a admin desde el perfil, inscripciones a eventos terminados y respuestas que caían en otro consejo.',
  },
  {
    term: 'Binarios reales',
    detail:
      'El procesamiento de fotos se prueba con imágenes generadas con sharp en el momento: que achique, que nunca agrande, que respete la rotación EXIF y que salga en webp.',
    file: 'src/lib/photo-processing.test.ts',
  },
  {
    term: 'Regresión de rutas',
    detail:
      'Un spec e2e recorre todas las rutas públicas y falla con un status distinto de 200, una página sin título, un error en la consola o una violación de la CSP.',
    file: 'tests/e2e/plataforma-navegacion.spec.ts',
  },
  {
    term: 'Revisión visual',
    detail:
      'Las capturas de cada ruta afectada van en la PR para que la revisión no dependa de levantar el proyecto.',
  },
  {
    term: 'Testing manual exploratorio',
    detail:
      'Lo que la regresión e2e no automatiza (instalar la PWA, mails reales, subir a S3, accesibilidad con lector de pantalla) se prueba a mano siguiendo los casos de este repositorio.',
  },
];

/** Not in the repo yet: what we'd add next, in rough order. */
export const qualityRoadmap: QualityItem[] = [
  {
    term: 'Accesibilidad automatizada',
    detail:
      'Sumar @axe-core/playwright a la regresión e2e para detectar contraste, labels y roles faltantes en cada ruta.',
  },
  {
    term: 'Regresión visual',
    detail:
      'Comparar capturas de cada ruta contra las de la semana anterior y marcar las diferencias en píxeles.',
  },
  {
    term: 'Mutation testing',
    detail:
      'Stryker sobre src/lib y src/actions para medir si los tests detectan cambios en el código, no solo si lo ejecutan.',
  },
  {
    term: 'Regresión programada',
    detail:
      'Que la corrida semanal de pnpm test:e2e se dispare sola en una máquina con la base local y deje el reporte de Playwright publicado.',
  },
];
