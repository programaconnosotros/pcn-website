import type { InterviewGuide } from './types';

export const nodeGuide: InterviewGuide = {
  track: 'node',
  summary:
    'Qué estudiar y cómo practicar para una entrevista de backend con Node.js, Express y NestJS, de junior a senior.',
  sections: [
    {
      id: 'la-entrevista',
      title: 'Cómo es la entrevista',
      body: [
        'Un proceso típico de backend Node.js tiene una charla inicial con recruiting, una entrevista técnica conceptual, un ejercicio práctico (live coding o take-home) y, para perfiles más altos, una instancia de system design y otra de cultura o liderazgo. No todas las empresas hacen todas las etapas, pero casi todas combinan preguntas de teoría con algo de código real. Preguntá al principio cuántas etapas hay y qué evalúa cada una: es información que te dan sin problema y te ayuda a prepararte.',
        'Para junior se evalúa que entiendas los fundamentos: JavaScript asíncrono, qué es Node y por qué es non-blocking, HTTP y REST, SQL básico y cómo armar un endpoint simple con Express. No se espera que sepas todo, sino que razones bien, que tu código sea prolijo y que digas con honestidad hasta dónde llegás. Un proyecto propio con una API, tests y una base de datos suma mucho más que una lista larga de tecnologías.',
        'Para semi-senior el foco pasa a la autonomía: manejo de errores, validación, autenticación, índices, transacciones, el problema N+1, testing de integración y cómo llevar un servicio a producción con Docker y logs útiles. Te van a pedir ejemplos concretos de cosas que hiciste y por qué las hiciste así. Respuestas del tipo "depende" están bien siempre que expliques de qué depende.',
        'Para senior importan los trade-offs y el impacto: elegir entre monolito y microservicios, consistencia entre servicios, colas, caching, observabilidad, deploys sin downtime, incidentes que resolviste y cómo hacés crecer a otras personas del equipo. Esperan que hagas preguntas antes de diseñar, que menciones costos y riesgos, y que sepas decir qué no harías.',
      ],
      checklist: [
        {
          text: 'Saber qué etapas tiene el proceso y qué evalúa cada una',
          explanation:
            'Un proceso típico de backend Node tiene un screening con recruiter (encaje, expectativas salariales, inglés), una entrevista técnica conceptual (JavaScript, Node, bases de datos, HTTP), un ejercicio práctico (live coding o take-home), a veces system design para semi-senior y senior, y una charla cultural o con el manager. Cada etapa mide algo distinto: el screening filtra por comunicación y alineación, la técnica por profundidad de conceptos, el ejercicio por cómo programás y razonás bajo presión, y la cultural por cómo trabajás en equipo y resolvés conflictos. Preguntale al recruiter en la primera llamada cuántas etapas hay, cuánto dura cada una y qué stack usan, así preparás lo que se va a evaluar y no todo a la vez. El error común es prepararse solo para lo técnico y llegar sin historias ni preguntas para la etapa cultural.',
        },
        {
          text: 'Tener un proyecto propio que puedas explicar de punta a punta',
          explanation:
            'Elegí un proyecto (laboral o personal) y prepará su explicación completa: qué problema resuelve, la arquitectura (por ejemplo API en Express o NestJS, Postgres con Prisma, cola con BullMQ), cómo fluye una request desde que entra hasta que responde, cómo se deploya y cómo se testea. Para cada decisión tené el por qué y la alternativa que descartaste, por ejemplo por qué Postgres y no MongoDB. Practicá contarlo en 2 minutos y después profundizar en cualquier parte, porque el entrevistador va a tirar de un hilo al azar. Preparate también para la pregunta qué cambiarías hoy: reconocer deuda técnica con criterio suma más que defender todo. El error común es describir features en vez de decisiones técnicas.',
        },
        {
          text: 'Contar dos o tres problemas reales que resolviste con contexto y resultado',
          explanation:
            'Elegí problemas técnicos concretos, idealmente con números: un endpoint que tardaba 3 segundos y bajaste a 200 ms con un índice, un memory leak que encontraste con un heap snapshot, una migración que hiciste sin downtime. Estructuralos así: contexto (qué sistema y por qué importaba), el problema, qué investigaste y descartaste, qué hiciste vos (no el equipo) y el resultado medible. Escribilos y contalos en voz alta hasta que salgan en 2 o 3 minutos cada uno. El error común es quedarse en lo vago, como mejoré la performance, sin métricas ni detalle de cómo diagnosticaste.',
        },
        {
          text: 'Distinguir qué se espera de un junior, un semi-senior y un senior',
          explanation:
            'De un junior se espera que domine el lenguaje y las bases (JavaScript, HTTP, SQL básico), que resuelva tareas acotadas con guía y que sepa pedir ayuda a tiempo. Un semi-senior resuelve features completas de forma autónoma, entiende el sistema en el que trabaja, escribe tests sin que se lo pidan y conoce trade-offs comunes como cache o índices. Un senior diseña sistemas, anticipa problemas de escala, seguridad y operación, toma decisiones con trade-offs explícitos, revisa código de otros y mejora al equipo. En la entrevista calibrá tus respuestas al nivel al que aplicás: para senior no alcanza con saber cómo, tenés que explicar por qué y cuándo no.',
        },
        {
          text: 'Explicar con tus palabras por qué elegiste Node.js para un proyecto',
          explanation:
            'Node encaja bien en servicios I/O-bound: APIs que pasan la mayor parte del tiempo esperando a la base, a otros servicios o a la red, porque su modelo de event loop maneja miles de conexiones concurrentes con un solo hilo y poca memoria. Suma compartir lenguaje y tipos con el frontend vía TypeScript, un ecosistema enorme en npm y buen soporte para tiempo real (WebSockets, streaming). Es mala opción para trabajo CPU-bound intenso (procesamiento de imágenes, cálculo numérico pesado) porque un cómputo largo bloquea el event loop para todas las requests, salvo que lo mandes a `worker_threads` u otro servicio. Una respuesta madura nombra también los costos: ecosistema de dependencias muy fragmentado y la necesidad de disciplina con tipos y validación.',
        },
      ],
    },
    {
      id: 'fundamentos',
      title: 'JavaScript, TypeScript y el runtime',
      body: [
        'Antes de cualquier framework te van a medir JavaScript: scope y closures, `this`, `==` contra `===`, tipos primitivos contra objetos (paso por referencia), destructuring, spread y la diferencia entre callbacks, promesas y `async/await`. Practicá explicar qué pasa cuando una promesa se rechaza y nadie la maneja, y cómo se propagan los errores con `try/catch` en funciones `async`. Es muy común que en el live coding se olviden un `await` y no lo noten.',
        'Sabé explicar qué es Node: un runtime basado en V8 que delega el I/O a libuv y al sistema operativo, con un solo hilo que ejecuta tu JavaScript y un event loop que procesa los callbacks a medida que el I/O termina. Eso lo hace muy bueno para servicios con mucha concurrencia de red y malo para trabajo pesado de CPU en el hilo principal. Conocé también el ecosistema: `package.json` y lockfile, rangos semver, scripts, variables de entorno con `process.env` y la carga de `.env` que Node ya trae con `--env-file`.',
        'Los módulos son pregunta frecuente: CommonJS (`require`) contra ES Modules (`import`), cómo se activa cada uno y los problemas de interoperabilidad. En 2026 la mayoría de los proyectos nuevos usan ESM y TypeScript; Node ya puede ejecutar archivos `.ts` quitando los tipos, aunque para producción muchos equipos siguen compilando con `tsc` o un bundler. Usá una versión LTS (par) y sabé por qué no conviene correr una impar en producción.',
        'En TypeScript te alcanza con dominar bien lo cotidiano: interfaces contra `type`, uniones y narrowing, generics simples, `unknown` contra `any`, y `strict` activado. El error típico es creer que los tipos validan datos en runtime: no lo hacen, por eso en el borde de la API necesitás validar con algo como Zod o class-validator.',
      ],
      checklist: [
        {
          text: 'Explicar closures, `this` y el paso de objetos por referencia',
          explanation:
            'Una closure es una función que recuerda las variables del scope donde fue creada aunque ese scope ya haya terminado, por ejemplo `const counter = () => { let n = 0; return () => ++n; }`: cada llamada al resultado sigue viendo su propio `n`. `this` depende de cómo se llama la función y no de dónde se define: en un método es el objeto antes del punto, en una función suelta es `undefined` en strict mode, y las arrow functions no tienen `this` propio sino que heredan el del scope externo. Por eso pasar `obj.method` como callback pierde el `this`, y se resuelve con una arrow o con `.bind(obj)`. Los objetos se pasan por valor de la referencia: si una función muta `user.name`, el llamador ve el cambio, pero si reasigna `user = {}` no. El error común es mutar un objeto recibido sin querer; usá spread o `structuredClone` cuando necesites una copia.',
        },
        {
          text: 'Comparar callbacks, promesas y `async/await`, incluyendo el manejo de errores',
          explanation:
            'Los callbacks con convención error-first (`(err, data) => {}`) fueron el modelo original de Node, pero anidan mal y obligan a chequear el error en cada nivel. Las promesas representan un valor futuro, se encadenan con `.then` y propagan el rechazo hasta el primer `.catch`. `async/await` es azúcar sobre promesas: el código se lee secuencial y los errores se manejan con `try/catch`, porque un `await` sobre una promesa rechazada lanza la excepción. Un rechazo que nadie maneja dispara `unhandledRejection` y desde Node 15 termina el proceso por defecto. Errores típicos: olvidar el `await` (la función sigue y el error se pierde), y usar `await` dentro de un `for` cuando las operaciones son independientes, en vez de `Promise.all`.',
        },
        {
          text: 'Explicar qué hacen V8 y libuv y por qué Node es non-blocking',
          explanation:
            'V8 es el motor de JavaScript de Google: compila el código a máquina con JIT y gestiona la memoria con un garbage collector. libuv es la biblioteca en C que provee el event loop y la I/O asíncrona: usa los mecanismos del sistema operativo (epoll, kqueue, IOCP) para red, y un thread pool (4 hilos por defecto, configurable con `UV_THREADPOOL_SIZE`) para operaciones sin API asíncrona nativa como filesystem, `crypto.pbkdf2` o DNS con `lookup`. Node es non-blocking porque tu JavaScript corre en un solo hilo pero delega la espera de I/O: mientras la base responde, el hilo atiende otras requests y retoma con el callback cuando hay resultado. Ojo: non-blocking aplica a la I/O, no al cómputo; un `JSON.parse` de 50 MB o un loop pesado bloquea todo igual.',
        },
        {
          text: 'Diferenciar CommonJS de ES Modules y saber cuál usar hoy',
          explanation:
            'CommonJS usa `require` y `module.exports`, carga de forma síncrona y resuelve en runtime, así que podés hacer `require` condicional. ES Modules usa `import` y `export`, es el estándar del lenguaje, se analiza estáticamente (permite tree shaking), carga de forma asíncrona y admite top-level `await`. En Node se activa con `"type": "module"` en `package.json` o con la extensión `.mjs`. Hoy lo recomendable para código nuevo es ESM; además, desde Node 22 se puede hacer `require` de módulos ESM síncronos, lo que alivió mucho la interoperabilidad. Diferencias que se preguntan: en ESM no existen `__dirname` ni `__filename` (se usa `import.meta.dirname`) y los imports relativos llevan extensión.',
        },
        {
          text: 'Explicar para qué sirven el lockfile y las variables de entorno',
          explanation:
            'El lockfile (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) fija la versión exacta de cada dependencia, incluidas las transitivas, para que todos los entornos instalen el mismo árbol; sin él, un rango como `^4.18.0` puede traer otra versión y romper algo. Se commitea siempre y en CI se instala con `npm ci` o `pnpm install --frozen-lockfile`, que fallan si el lockfile no coincide. Las variables de entorno separan la configuración del código, como sugiere 12-factor: URL de la base, secretos, puertos, cambian por entorno sin recompilar. Validalas al arrancar (por ejemplo con un schema de Zod sobre `process.env`) para fallar rápido, y nunca commitees el `.env`: en producción los secretos vienen del gestor de secretos de la plataforma.',
        },
        {
          text: 'Justificar por qué los tipos de TypeScript no reemplazan la validación en runtime',
          explanation:
            'Los tipos de TypeScript existen solo en compilación: se borran al generar JavaScript, así que no hay nada que chequee en runtime que el body de una request cumpla la interfaz que declaraste. Si hacés `const body = req.body as CreateUser`, el compilador te cree, pero el cliente puede mandar cualquier cosa, incluso campos extra o tipos incorrectos. Por eso todo dato que cruza una frontera (requests, respuestas de APIs externas, variables de entorno, mensajes de una cola) se valida con una librería como Zod, Valibot o `class-validator` en NestJS. Con Zod definís el schema una vez y derivás el tipo con `z.infer`, así tipos y validación no se desincronizan.',
        },
      ],
    },
    {
      id: 'express-nestjs-apis',
      title: 'Express, NestJS y diseño de APIs',
      body: [
        'Express es minimalista: un pipeline de middlewares `(req, res, next)` donde el orden importa. Sabé armar un router, parsear el body, agregar un middleware de autenticación y uno de errores (el que recibe cuatro argumentos, al final de la cadena). Desde Express 5 las promesas rechazadas en handlers `async` llegan solas al middleware de errores; en Express 4 tenías que llamar a `next(err)` o usar un wrapper, y es una pregunta clásica.',
        'NestJS agrega estructura: módulos, controllers, providers e inyección de dependencias, con pipes para validar y transformar, guards para autorización, interceptors para lógica transversal y exception filters para mapear errores. Si la empresa usa Nest, practicá contar el ciclo de vida de una request por esas capas y cuándo conviene cada una. Si te preguntan cuál elegir, el argumento honesto es que Express da libertad y Nest da convenciones que escalan mejor en equipos grandes, a cambio de más abstracción.',
        'En diseño de APIs se espera que manejes REST con criterio: recursos con sustantivos, verbos HTTP correctos, idempotencia de GET, PUT y DELETE, y códigos de estado precisos (201 al crear, 204 sin contenido, 400 contra 422, 401 contra 403, 404, 409). Sabé diferenciar path params, query params y body, implementar paginación por offset y por cursor, y explicar cuándo GraphQL tiene sentido y qué problemas trae (caching, N+1 en resolvers, queries costosas).',
        'Para semi-senior y senior entran el manejo de errores consistente (un formato único de error, nunca stack traces al cliente), la validación de entrada, CORS bien entendido, rate limiting, versionado de APIs y cómo introducir cambios sin romper clientes. Un detalle que suma: documentar con OpenAPI y generar o validar los contratos a partir de ese documento.',
      ],
      checklist: [
        {
          text: 'Armar un servidor Express con rutas, middlewares y manejo de errores centralizado',
          explanation:
            "En Express todo es middleware: funciones `(req, res, next)` que se ejecutan en el orden en que se registran, y cada una responde o llama a `next()`. Armá la app con `express.json()` para parsear el body, routers por recurso (`app.use('/users', usersRouter)`), y al final un middleware de error con cuatro parámetros `(err, req, res, next)`, que Express reconoce por la aridad. Ahí mapeás tus errores de dominio a códigos HTTP (por ejemplo `NotFoundError` a 404) y devolvés un formato uniforme sin filtrar stack traces. Desde Express 5 los errores lanzados en handlers `async` llegan solos al middleware de error; en Express 4 había que hacer `next(err)` o usar un wrapper. Error común: registrar el handler de errores antes que las rutas, con lo que nunca se ejecuta.",
        },
        {
          text: 'Explicar el ciclo de una request en NestJS: guards, pipes, interceptors y filters',
          explanation:
            'En NestJS una request pasa primero por los middlewares, después por los guards, que deciden si puede continuar (autenticación y roles, devolviendo `true` o lanzando `ForbiddenException`). Luego los interceptors en su parte previa (logging, timing, cache), después los pipes, que transforman y validan los parámetros (por ejemplo `ValidationPipe` con DTOs de `class-validator`), y recién ahí el handler del controller. A la vuelta los interceptors pueden transformar la respuesta, y si algo lanzó una excepción en cualquier punto, los exception filters la convierten en respuesta HTTP. La clave para responder bien es saber qué va en cada lugar: autorización en guards, validación en pipes, cross-cutting en interceptors y formato de errores en filters.',
        },
        {
          text: 'Elegir el código de estado correcto para crear, validar, autorizar y conflictos',
          explanation:
            'Crear un recurso devuelve 201 Created, idealmente con header `Location`; una acción sin contenido de respuesta, como un DELETE, devuelve 204. Un body mal formado o inválido es 400, aunque muchas APIs usan 422 para errores de validación semántica. 401 significa no autenticado (falta token o es inválido) y 403 significa autenticado pero sin permiso; confundirlos es el error más típico. 404 es recurso inexistente (también se usa para no revelar que existe algo ajeno), 409 es conflicto con el estado actual, como un email duplicado o una versión desactualizada, y 429 es rate limit. Los 5xx quedan para fallas del servidor: nunca devuelvas 500 por un input inválido del cliente.',
        },
        {
          text: 'Implementar paginación por cursor y explicar por qué escala mejor que offset',
          explanation:
            'Con offset (`LIMIT 20 OFFSET 10000`) la base igual tiene que recorrer y descartar las 10000 filas previas, así que las páginas profundas son cada vez más lentas, y si se insertan filas entre pedidos el cliente ve duplicados o se saltea elementos. Con cursor guardás la posición del último elemento visto y pedís lo que sigue: `WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20`, que con un índice compuesto sobre esas columnas es igual de rápido en cualquier página. El cursor se devuelve al cliente como un string opaco (por ejemplo base64 del último `created_at` e `id`) y se incluye un desempate único como `id` para que el orden sea estable. La contra: no podés saltar directo a la página 50 ni mostrar el total barato, por eso offset sigue sirviendo para tablas chicas de backoffice.',
        },
        {
          text: 'Explicar qué es CORS y por qué el error aparece en el navegador y no en el servidor',
          explanation:
            'CORS es un mecanismo del navegador que relaja la same-origin policy: por defecto, JavaScript en `https://app.com` no puede leer respuestas de `https://api.com`, salvo que la API lo autorice con headers como `Access-Control-Allow-Origin`. El servidor recibe y procesa la request normalmente; es el navegador el que, al no ver los headers correctos, le oculta la respuesta al código y muestra el error en consola. Por eso con curl o Postman funciona: no son navegadores y no aplican la política. Para requests no simples (métodos como PUT o DELETE, `Content-Type: application/json`, headers custom) el navegador manda antes un preflight `OPTIONS` que el servidor tiene que responder. Se configura en el servidor, por ejemplo con el middleware `cors`; el error común es poner `*` con credenciales, que el navegador rechaza.',
        },
        {
          text: 'Comparar REST y GraphQL con ventajas y costos concretos',
          explanation:
            'REST modela recursos con URLs y verbos HTTP, aprovecha el cache HTTP y de CDNs de forma natural, es simple de operar y de observar por endpoint, pero puede generar over-fetching o varias idas y vueltas para armar una pantalla. GraphQL expone un único endpoint con un schema tipado donde el cliente pide exactamente los campos que necesita, ideal cuando hay muchos clientes con necesidades distintas o datos muy relacionados. A cambio, el cache HTTP deja de servir (todo es POST a `/graphql`), aparece el riesgo de N+1 en los resolvers (se mitiga con DataLoader), hay que limitar profundidad y complejidad de queries para evitar abusos, y la observabilidad es más difícil. Una respuesta madura: REST por defecto para APIs públicas y servicios simples, GraphQL cuando el problema es la agregación para frontends variados.',
        },
      ],
    },
    {
      id: 'bases-de-datos',
      title: 'Bases de datos, ORMs y transacciones',
      body: [
        'SQL es lo que más diferencia a candidatos parecidos. Practicá escribir a mano `SELECT` con `JOIN`, `GROUP BY`, `HAVING` y subqueries, y explicá la diferencia entre `INNER JOIN` y `LEFT JOIN` con un ejemplo. Sabé qué son las claves primarias y foráneas, qué es normalizar y cuándo tiene sentido desnormalizar para lecturas. En Node lo habitual es PostgreSQL con Prisma, Drizzle, TypeORM o Knex, y MongoDB con Mongoose en algunos equipos.',
        'Los índices son pregunta segura: aceleran lecturas a costa de escrituras más lentas y más espacio, y un índice compuesto sirve según el orden de sus columnas. Aprendé a leer un `EXPLAIN ANALYZE` básico para ver si una query hace un seq scan. El problema N+1 aparece casi siempre que hay un ORM: sabé reconocerlo en los logs de queries y resolverlo con includes, joins o batching (DataLoader en GraphQL).',
        'Transacciones: qué significa ACID, cómo abrir una transacción con tu ORM y qué pasa si una operación falla a mitad de camino. A nivel senior te pueden pedir los niveles de aislamiento (read committed, repeatable read, serializable) y qué anomalías evita cada uno, más locking optimista con una columna de versión contra locking pesimista con `SELECT ... FOR UPDATE`.',
        'No te olvides de lo operativo: migraciones versionadas y aplicadas en el pipeline, connection pooling (y por qué cada instancia abre su pool, lo que puede agotar las conexiones de Postgres), y Redis para cache, sesiones, rate limiting o colas simples. Un error común es usar el ORM sin mirar nunca el SQL que genera.',
      ],
      checklist: [
        {
          text: 'Escribir una query con `JOIN` y `GROUP BY` sin ayuda del ORM',
          explanation:
            "`JOIN` combina filas de dos tablas según una condición: `INNER JOIN` deja solo las que matchean y `LEFT JOIN` conserva todas las de la izquierda con `NULL` donde no hay match. `GROUP BY` agrupa filas para aplicar agregaciones como `COUNT`, `SUM` o `AVG`, y `HAVING` filtra sobre el resultado agregado, mientras `WHERE` filtra antes de agrupar. Ejemplo, clientes con más de 5 pedidos en 2026: `SELECT c.id, c.name, COUNT(o.id) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.created_at >= '2026-01-01' GROUP BY c.id, c.name HAVING COUNT(o.id) > 5 ORDER BY orders DESC`. Errores comunes: seleccionar columnas que no están en el `GROUP BY` ni agregadas, y usar `COUNT(*)` con `LEFT JOIN`, que cuenta 1 aunque no haya filas relacionadas (usá `COUNT(o.id)`).",
        },
        {
          text: 'Explicar cuándo crear un índice y qué costo tiene',
          explanation:
            'Un índice (B-tree por defecto en Postgres) es una estructura ordenada que permite encontrar filas sin recorrer toda la tabla. Conviene crearlo sobre columnas que aparecen en `WHERE`, `JOIN` y `ORDER BY` de queries frecuentes y selectivas, y en las foreign keys, que Postgres no indexa solo. En índices compuestos importa el orden: `(user_id, created_at)` sirve para filtrar por `user_id` y ordenar por fecha, pero no para filtrar solo por `created_at`. El costo es que cada `INSERT`, `UPDATE` y `DELETE` también actualiza los índices, ocupan disco y memoria, y un índice sobre una columna poco selectiva casi no se usa. Para decidir, mirá el plan con `EXPLAIN ANALYZE`, y en producción crealo con `CREATE INDEX CONCURRENTLY` para no bloquear escrituras.',
        },
        {
          text: 'Detectar y resolver un N+1 en un endpoint con un ORM',
          explanation:
            "El N+1 ocurre cuando traés una lista con una query y después, por cada elemento, hacés otra para una relación: 1 query de posts y 100 queries de autores. Suele esconderse en un `for` con `await` o en lazy loading del ORM, y se detecta activando el log de queries (por ejemplo `log: ['query']` en Prisma) o con trazas que muestran cientos de spans de base por request. Se resuelve cargando la relación de una vez: `include: { author: true }` en Prisma, `relations` o `leftJoinAndSelect` en TypeORM, o juntando los ids y haciendo un solo `WHERE id IN (...)`. En GraphQL se usa DataLoader, que agrupa los pedidos de un mismo tick en una query. Ojo con el exceso inverso: incluir relaciones enormes que no usás también cuesta.",
        },
        {
          text: 'Explicar ACID y usar una transacción en Prisma o TypeORM',
          explanation:
            'ACID: atomicidad (todo o nada), consistencia (las restricciones se cumplen antes y después), aislamiento (transacciones concurrentes no se pisan según el nivel elegido, Read Committed por defecto en Postgres) y durabilidad (lo confirmado sobrevive a una caída). El caso típico es una transferencia: debitar y acreditar tienen que ocurrir juntos. En Prisma usás `await prisma.$transaction(async (tx) => { await tx.account.update(...); await tx.account.update(...); })` y todo lo que hagas con `tx` se confirma o se revierte junto si algo lanza. En TypeORM el equivalente es `dataSource.transaction(async (manager) => { ... })`. Error común: usar el cliente global en vez de `tx` dentro del callback, con lo que esa query queda fuera de la transacción; y hacer llamadas HTTP lentas adentro, que mantienen la transacción y sus locks abiertos.',
        },
        {
          text: 'Comparar locking optimista y pesimista',
          explanation:
            'El locking pesimista bloquea la fila al leerla para que nadie más la modifique hasta que termines: `SELECT ... FOR UPDATE` dentro de una transacción. Es seguro cuando hay mucha contención sobre el mismo dato, como el stock de un producto en oferta, pero reduce concurrencia y puede generar deadlocks si dos transacciones bloquean en distinto orden. El optimista no bloquea: guarda una columna `version` y al actualizar hace `UPDATE ... SET version = version + 1 WHERE id = $1 AND version = $2`; si afectó 0 filas, alguien cambió el dato y reintentás o devolvés 409. Conviene cuando los conflictos son raros, como la edición de un perfil. Regla práctica: optimista por defecto, pesimista cuando los conflictos son frecuentes y reintentar sale caro.',
        },
        {
          text: 'Explicar qué es un connection pool y cómo dimensionarlo',
          explanation:
            'Abrir una conexión a Postgres es caro (handshake, autenticación, un proceso por conexión en el servidor), así que un pool mantiene un conjunto de conexiones abiertas que las requests toman y devuelven. Postgres tiene un límite (`max_connections`, 100 por defecto) y cada conexión consume memoria, por eso más no es mejor: el total es pool por instancia multiplicado por réplicas, y tiene que entrar con margen en ese límite. Un pool chico, de 10 a 20 por instancia, suele rendir más que uno enorme porque la base no puede ejecutar más queries en paralelo que sus cores. En serverless, donde cada invocación puede abrir conexiones, se pone delante un pooler como PgBouncer o el de tu proveedor. Síntoma de mal dimensionamiento: requests que esperan conexión (timeouts del pool) aunque la base esté ociosa, típico de transacciones largas que acaparan conexiones.',
        },
      ],
    },
    {
      id: 'event-loop-concurrencia',
      title: 'Event loop, async y concurrencia',
      body: [
        'El event loop es la pregunta más característica de Node. Sabé recorrer sus fases (timers, pending callbacks, poll, check, close) y dónde entran las microtasks: las de `process.nextTick` y las promesas se vacían entre cada callback, antes de seguir con la siguiente fase. Un buen ejercicio es predecir el orden de salida de un snippet con `setTimeout`, `setImmediate`, `Promise.resolve().then` y `nextTick`, y explicar el porqué.',
        'Bloquear el event loop es el error más grave en un servicio Node: un `JSON.parse` de un payload enorme, una regex con backtracking catastrófico, un loop de CPU o una función sincrónica como `fs.readFileSync` dentro de un handler frenan todas las requests a la vez. Sabé detectarlo con métricas de event loop lag o `monitorEventLoopDelay`, y resolverlo moviendo ese trabajo a `worker_threads`, a otro servicio o a una cola.',
        'Para usar varios núcleos, Node escala con varios procesos: el módulo `cluster`, PM2 o, lo más común hoy, varias réplicas detrás de un load balancer en Kubernetes o en la plataforma de deploy. Los `worker_threads` son para trabajo de CPU dentro de un proceso, no para atender más requests. Conocé `Promise.all`, `Promise.allSettled`, `Promise.race` y `Promise.any`, y cuándo limitar la concurrencia en lugar de disparar mil promesas juntas.',
        'Los streams son otro tema de semi-senior: procesar archivos o respuestas grandes por partes, con backpressure, usando `pipeline` para no perder errores. A nivel senior te pueden preguntar por fugas de memoria: listeners que se acumulan, caches sin límite, closures que retienen objetos; se investigan con heap snapshots y `--inspect` comparando dos momentos.',
      ],
      checklist: [
        {
          text: 'Recorrer las fases del event loop y ubicar microtasks y `nextTick`',
          explanation:
            "El event loop de Node (libuv) recorre fases en orden: timers (callbacks de `setTimeout` y `setInterval` vencidos), pending callbacks (algunos errores de sistema), poll (espera y procesa eventos de I/O), check (callbacks de `setImmediate`) y close callbacks (como `socket.on('close')`). Entre cada callback, Node vacía dos colas de mayor prioridad: primero la de `process.nextTick` y después la de microtasks (promesas resueltas y `queueMicrotask`). Por eso un `.then` siempre corre antes que cualquier timer pendiente. Abusar de `nextTick` recursivo puede dejar sin turno a la I/O (starvation), por eso hoy se recomienda `queueMicrotask` salvo casos puntuales.",
        },
        {
          text: 'Predecir el orden de ejecución de un snippet con timers y promesas',
          explanation:
            "Primero corre todo el código síncrono, después la cola de `nextTick`, después las microtasks (promesas), y recién ahí las fases del loop: timers, luego `setImmediate`. Ejemplo: `setTimeout(() => log('timeout')); setImmediate(() => log('immediate')); Promise.resolve().then(() => log('promise')); process.nextTick(() => log('tick')); log('sync');` imprime `sync`, `tick`, `promise`, y después `timeout` e `immediate`. El orden entre esos dos últimos no está garantizado en el módulo principal (depende de si el timer de 1 ms ya venció), pero dentro de un callback de I/O `setImmediate` siempre va antes. Recordá que el código de una función `async` hasta el primer `await` es síncrono, y lo que sigue al `await` es una microtask.",
        },
        {
          text: 'Explicar qué bloquea el event loop y cómo detectarlo en producción',
          explanation:
            'Bloquea el event loop cualquier trabajo síncrono largo en el hilo principal: loops sobre colecciones grandes, `JSON.parse` o `JSON.stringify` de payloads enormes, regex con backtracking catastrófico (ReDoS), funciones `*Sync` del filesystem, y crypto o compresión síncronos. Mientras eso corre, ninguna otra request avanza, así que la latencia de todas sube a la vez y los health checks pueden fallar. En producción se detecta midiendo el event loop lag con `perf_hooks.monitorEventLoopDelay()` o el event loop utilization, y exportándolo como métrica; un p99 de varias decenas de ms es señal de alarma. Para encontrar el culpable, generá un CPU profile con `--cpu-prof` o con clinic.js y buscá funciones con mucho self time. La solución es partir el trabajo, usar versiones async o moverlo a `worker_threads` o a otro servicio.',
        },
        {
          text: 'Diferenciar `cluster`, réplicas y `worker_threads` y cuándo usar cada uno',
          explanation:
            '`cluster` levanta varios procesos de Node que comparten el mismo puerto, uno por core, para aprovechar CPUs en una sola máquina; cada proceso tiene su memoria y su event loop. Las réplicas son lo mismo a nivel infraestructura: varios contenedores o pods detrás de un load balancer, que es lo habitual hoy en Kubernetes o plataformas cloud, y por eso `cluster` se usa poco (un proceso por contenedor y escalás réplicas). `worker_threads` crea hilos dentro del mismo proceso con su propio event loop, pensados para tareas CPU-bound como hashing, parsing o compresión, comunicándose por mensajes y pudiendo compartir memoria con `SharedArrayBuffer`. Regla: réplicas para escalar throughput de requests, `worker_threads` (idealmente con un pool como Piscina) para sacar cómputo pesado del hilo principal.',
        },
        {
          text: 'Comparar `Promise.all`, `allSettled`, `race` y `any`',
          explanation:
            "`Promise.all` espera todas y devuelve el array de resultados, pero rechaza apenas una falla (las demás siguen corriendo, solo se ignora su resultado): sirve cuando necesitás todo o nada. `Promise.allSettled` espera todas y devuelve para cada una `{ status: 'fulfilled', value }` o `{ status: 'rejected', reason }`, ideal para operaciones independientes donde querés reportar parciales, como mandar notificaciones. `Promise.race` se resuelve o rechaza con la primera que termina, útil para timeouts (`Promise.race([fetchData(), timeout(5000)])`), aunque hoy es más limpio `AbortSignal.timeout(5000)`. `Promise.any` devuelve la primera que se cumple e ignora rechazos salvo que fallen todas (`AggregateError`), útil para consultar réplicas redundantes. Ojo: las promesas arrancan al crearse, así que hacer `Promise.all(ids.map(fetchUser))` con miles de ids dispara todo a la vez y puede saturar un servicio; limitá concurrencia con `p-limit`.",
        },
        {
          text: 'Explicar backpressure y por qué usar `pipeline` con streams',
          explanation:
            "Backpressure es la señal de que el consumidor de un stream es más lento que el productor: si leés un archivo a 1 GB/s y lo mandás a un cliente lento sin respetarla, los datos se acumulan en memoria hasta que el proceso explota. En Node, `writable.write()` devuelve `false` cuando el buffer interno supera `highWaterMark`, y el productor debería pausar hasta el evento `drain`. `pipeline` de `node:stream/promises` hace eso automáticamente, encadena los streams y, a diferencia de `.pipe()`, propaga errores y destruye todos los streams si uno falla, evitando leaks de file descriptors. Ejemplo: `await pipeline(fs.createReadStream('big.csv'), zlib.createGzip(), res)`. Usá streams cuando el dato es grande o infinito, en vez de cargarlo entero con `readFile`.",
        },
      ],
    },
    {
      id: 'seguridad',
      title: 'Seguridad y autenticación',
      body: [
        'Primero separá conceptos: autenticación es quién sos, autorización es qué podés hacer. Las contraseñas se guardan con un hash lento y con salt (Argon2, bcrypt o scrypt), nunca con SHA-256 a secas. Los secretos van en variables de entorno o en un secret manager, nunca en el repo.',
        'Sesiones contra tokens es pregunta casi segura. Con sesiones el servidor guarda el estado y el navegador manda una cookie `HttpOnly`, `Secure` y `SameSite`; revocar es trivial. Con JWT el token es autocontenido y se valida con la firma, lo que escala bien entre servicios, pero revocarlo es difícil: por eso se usan access tokens cortos con refresh tokens rotados. Guardar un JWT en `localStorage` lo expone a XSS, y ese detalle suele marcar la diferencia en la respuesta.',
        'Conocé el OWASP Top 10 aplicado a una API: SQL injection (se previene con queries parametrizadas, no escapando a mano), broken access control (validar que el recurso pertenece al usuario, no solo que está logueado), mass assignment, SSRF y validación de entrada. En Node suma mencionar `helmet`, límites de tamaño del body, rate limiting y auditar dependencias con `npm audit` o Dependabot por el riesgo de supply chain.',
        'A nivel senior se espera que diseñes la seguridad de una API pública completa: OAuth 2.0 y OpenID Connect con un proveedor de identidad, scopes, API keys para integraciones, HTTPS en todos lados, logs sin datos sensibles y principio de mínimo privilegio en la base y en la nube.',
      ],
      checklist: [
        {
          text: 'Diferenciar autenticación de autorización con un ejemplo',
          explanation:
            'Autenticación responde quién sos: verificar identidad con contraseña, token, passkey o SSO. Autorización responde qué podés hacer una vez identificado: si tenés permiso para esa acción sobre ese recurso. Ejemplo: iniciar sesión en un banco es autenticación; que puedas ver tu cuenta y no la de otro cliente es autorización. En HTTP, fallar la autenticación es 401 y fallar la autorización es 403. El error más común en APIs es autenticar bien pero no chequear la pertenencia del recurso: `GET /invoices/123` devuelve la factura de otro usuario porque solo se validó el token (BOLA, el primer riesgo del OWASP API Top 10).',
        },
        {
          text: 'Explicar cómo guardar contraseñas y por qué no sirve un hash rápido',
          explanation:
            'Las contraseñas nunca se guardan en texto plano ni cifradas de forma reversible: se guarda un hash con un algoritmo diseñado para ser lento y con salt único por usuario. Hoy la recomendación es Argon2id (OWASP), con bcrypt como alternativa válida y scrypt disponible nativo en `node:crypto`. Un hash rápido como SHA-256 no sirve porque una GPU calcula miles de millones por segundo, así que ante una filtración se prueban diccionarios enteros en minutos; los algoritmos lentos y con costo de memoria hacen eso inviable. El salt evita que dos contraseñas iguales tengan el mismo hash y que sirvan tablas precalculadas. Al verificar se usa la función de comparación de la librería, que es de tiempo constante, y el costo se ajusta para que tarde unos cientos de milisegundos.',
        },
        {
          text: 'Comparar sesiones con cookies y JWT, incluyendo revocación',
          explanation:
            'Con sesiones, el servidor guarda el estado (en Redis o en la base) y el cliente solo tiene un id opaco en una cookie `HttpOnly`, `Secure` y `SameSite`; revocar es borrar la sesión y tiene efecto inmediato. Con JWT, el token firmado lleva los claims y el servidor lo valida sin consultar nada, lo que escala bien entre servicios, pero no se puede invalidar antes de que expire salvo que mantengas una denylist, que reintroduce estado. Por eso los JWT de acceso se emiten cortos (5 a 15 minutos) junto a un refresh token revocable. Para una app web con backend propio, las sesiones suelen ser más simples y seguras; JWT encaja en APIs consumidas por varios servicios o clientes. Error común: guardar el JWT en `localStorage`, expuesto a cualquier XSS.',
        },
        {
          text: 'Prevenir SQL injection y explicar por qué funcionan las queries parametrizadas',
          explanation:
            "SQL injection ocurre cuando concatenás input del usuario dentro del SQL: con `\"SELECT * FROM users WHERE email = '\" + email + \"'\"` y un email como `' OR '1'='1`, el atacante cambia la lógica de la query. Las queries parametrizadas mandan el SQL y los valores por separado: `db.query('SELECT * FROM users WHERE email = $1', [email])`. La base parsea y planifica la query antes de recibir los valores, así que el input se trata siempre como dato y nunca como código, sin importar qué caracteres tenga. Los ORMs y query builders parametrizan por defecto, pero el riesgo vuelve con métodos raw: en Prisma, `$queryRaw` con template tag es seguro y `$queryRawUnsafe` con concatenación no. Los nombres de columnas u orden dinámicos no se pueden parametrizar: validalos contra una allowlist.",
        },
        {
          text: 'Nombrar los riesgos principales del OWASP Top 10 para APIs',
          explanation:
            'El OWASP API Security Top 10 (edición 2023, la vigente) arranca con Broken Object Level Authorization: acceder a recursos ajenos cambiando un id. Siguen Broken Authentication (tokens débiles, sin rate limit en login), Broken Object Property Level Authorization (exponer o permitir modificar campos que no corresponden, como mass assignment de `isAdmin`), Unrestricted Resource Consumption (sin límites de tamaño, paginación o rate limiting) y Broken Function Level Authorization (un usuario común llamando endpoints de admin). Completan la lista el abuso de flujos de negocio sensibles, SSRF, mala configuración de seguridad, inventario deficiente de APIs (versiones viejas expuestas) y consumo inseguro de APIs de terceros. En la entrevista alcanza con nombrar cuatro o cinco y dar la mitigación de cada uno, sobre todo chequear pertenencia en cada endpoint.',
        },
        {
          text: 'Explicar el flujo de access token y refresh token',
          explanation:
            'Al loguearse, el servidor emite un access token de vida corta (5 a 15 minutos), normalmente un JWT que se manda en cada request en el header `Authorization: Bearer`, y un refresh token de vida larga, opaco y guardado del lado del servidor. Cuando el access token expira, el cliente llama a un endpoint de refresh con el refresh token y recibe un par nuevo, sin pedirle la contraseña al usuario. Así, si roban un access token, sirve poco tiempo, y el refresh token se puede revocar en logout o ante sospecha. La buena práctica es la rotación: cada uso del refresh token emite uno nuevo e invalida el anterior, y si llega uno ya usado se revoca toda la familia, porque indica robo. En web, el refresh token va en una cookie `HttpOnly` y `Secure`, nunca en `localStorage`.',
        },
      ],
    },
    {
      id: 'testing',
      title: 'Testing en backend',
      body: [
        'Sabé diferenciar tests unitarios (una función o servicio aislado), de integración (tu código con la base, la cola o HTTP real) y end-to-end (el sistema completo). En backend los de integración suelen dar más confianza por costo: levantar la app y pegarle a los endpoints con Supertest contra una base real en Docker o con Testcontainers detecta errores que los mocks esconden.',
        'Las herramientas habituales son Vitest o Jest, y Node trae su propio runner con `node:test`. Practicá escribir un test con arrange, act y assert, mockear una dependencia externa (un cliente HTTP o un servicio de pagos) y testear el caso feliz y los errores. En NestJS conocé el `TestingModule` para reemplazar providers.',
        'El error común es mockear todo y terminar testeando los mocks, o escribir tests acoplados a la implementación que se rompen con cada refactor. Lo que buscan los entrevistadores es criterio: qué testeás primero (la lógica de negocio y los bordes de la API), cómo mantenés los tests rápidos y deterministas, y cómo manejás datos de prueba sin que un test dependa de otro.',
        'Para senior, hablá de estrategia: la pirámide o el trofeo de testing, contract testing entre servicios, tests en el pipeline de CI como condición para mergear, y cómo cubrir migraciones y jobs asincrónicos.',
      ],
      checklist: [
        {
          text: 'Diferenciar unitario, integración y end-to-end con ejemplos de backend',
          explanation:
            'Un test unitario prueba una unidad aislada sin I/O: por ejemplo, la función que calcula el precio con descuentos, con dependencias reemplazadas por fakes; corre en milisegundos. Uno de integración prueba varias piezas reales juntas: un endpoint con Supertest contra una base Postgres real, verificando que el repositorio, las queries y las migraciones funcionan. Un end-to-end recorre el sistema completo como lo haría un cliente: levanta la API desplegada con sus dependencias y ejecuta un flujo de registro, login y compra. Cuanto más arriba, más confianza pero más lentos y frágiles. En backend suele rendir mucho la integración (Testing Trophy): muchos tests de endpoint con base real, unitarios para lógica de dominio compleja y pocos e2e para flujos críticos.',
        },
        {
          text: 'Escribir un test de un endpoint con Supertest',
          explanation:
            "Supertest recibe tu app de Express o el servidor HTTP de NestJS y hace requests en memoria sin levantar un puerto, así que exportá la app separada del `listen`. Un test típico con Vitest o Jest: `const res = await request(app).post('/users').send({ email: 'a@b.com', password: 'secreta123' }); expect(res.status).toBe(201); expect(res.body).toMatchObject({ email: 'a@b.com' }); expect(res.body.password).toBeUndefined();`. Probá el camino feliz y los errores: validación (400), sin token (401), recurso ajeno (403 o 404) y duplicado (409). Para endpoints autenticados, generá un token en el setup o usá un helper que loguee. Verificá también el efecto en la base, no solo la respuesta.",
        },
        {
          text: 'Mockear una dependencia externa y explicar cuándo no conviene',
          explanation:
            'Mockeá lo que no controlás y es lento, caro o no determinista: un proveedor de pagos, un servicio de emails, la hora actual. Lo más limpio es inyectar la dependencia (un cliente con interfaz) y pasar un fake en el test, o interceptar HTTP con MSW o `nock`, en vez de mockear módulos internos con `vi.mock`. Para la hora, usá fake timers (`vi.useFakeTimers()` y `vi.setSystemTime`). No conviene mockear lo que es tuyo y barato de usar real, como tu propia base: un repositorio mockeado no detecta una query mal escrita ni una migración faltante. Otro error es mockear tanto que el test verifica la implementación (qué funciones se llamaron) en vez del comportamiento, y se rompe con cada refactor.',
        },
        {
          text: 'Levantar una base real para tests de integración',
          explanation:
            'La forma estándar es Testcontainers: desde el setup de los tests levantás un contenedor de Postgres con la misma versión que producción, corrés las migraciones y pasás la URL a tu app; al terminar se destruye solo. Alternativa simple: un servicio en `docker-compose` o el `services` del CI, con una base dedicada a tests. Para aislar cada test, envolvé cada uno en una transacción que se revierte al final, o truncá las tablas entre tests; si corren en paralelo, usá una base o un schema por worker. No reemplaces Postgres por SQLite en memoria: difieren en tipos, constraints y SQL, y los tests pasan donde producción falla.',
        },
        {
          text: 'Explicar cómo mantener los tests rápidos, aislados y deterministas',
          explanation:
            'Rápidos: la mayoría de los tests no debería tocar red externa, reutilizá un contenedor de base por suite en vez de uno por test, y corré en paralelo. Aislados: cada test arma sus propios datos y no depende del orden ni de lo que dejó otro; limpiá con transacciones revertidas o truncate, y no compartas estado mutable global. Deterministas: controlá todo lo que varía, como la hora con fake timers, los ids aleatorios con seeds o inyección, y el orden de resultados con `ORDER BY` explícito. Nunca uses `sleep` para esperar algo asíncrono: esperá la condición o el evento. Un test flaky hay que arreglarlo o borrarlo enseguida, porque enseña al equipo a ignorar el CI.',
        },
      ],
    },
    {
      id: 'arquitectura-produccion',
      title: 'Arquitectura, escala y producción',
      body: [
        'Monolito contra microservicios es la pregunta de arquitectura por excelencia. La respuesta madura es que un monolito modular bien separado es la mejor opción por defecto y que los microservicios se justifican por necesidades de escala, de deploy independiente o de equipos, a cambio de complejidad operativa, red poco confiable y consistencia eventual. Sabé explicar el patrón outbox y las sagas para mantener datos consistentes entre servicios sin transacciones distribuidas.',
        'Para escalar, conocé las palancas en orden: medir primero, cachear (cache-aside con Redis, TTL e invalidación), réplicas de lectura, índices y queries, colas para sacar trabajo del request (BullMQ, RabbitMQ, SQS o Kafka) y recién después particionar datos. Con colas, sabé que en la práctica la entrega es at-least-once, así que los consumidores tienen que ser idempotentes. El teorema CAP y las idempotency keys en pagos son temas recurrentes de senior.',
        'Resiliencia y observabilidad van juntas: timeouts en cada llamada externa, retries con backoff y jitter solo en operaciones idempotentes, circuit breakers y degradación elegante. Para ver qué pasa usá logs estructurados en JSON con un logger como Pino, métricas (latencia p95 y p99, tasa de errores, event loop lag) y trazas distribuidas con OpenTelemetry. Practicá contar cómo investigarías un endpoint que se volvió lento en producción, paso a paso.',
        'En deploy se espera que manejes Docker (imagen multi-stage, usuario no root, `node` directo en lugar de `npm start` para recibir `SIGTERM` y cerrar conexiones de forma ordenada), CI/CD, y estrategias como rolling, blue-green o canary con feature flags. Las migraciones de base tienen que ser compatibles hacia atrás (expand and contract) para que convivan dos versiones de la app durante el deploy.',
      ],
      checklist: [
        {
          text: 'Argumentar cuándo pasar de monolito a microservicios y cuándo no',
          explanation:
            'Empezá con un monolito modular: un solo deploy, pero con módulos con límites claros (cada uno con su API interna y sus tablas), lo que da casi todos los beneficios de organización sin costo operativo. Pasar a microservicios se justifica cuando hay una razón concreta: equipos que se pisan al deployar, una parte con necesidades de escala o de tecnología muy distintas, o requisitos de aislamiento de fallas. El costo es grande: llamadas por red que fallan y suman latencia, consistencia eventual en vez de transacciones, observabilidad distribuida, versionado de contratos y más infraestructura. Señal de que no conviene: equipo chico o dominio poco entendido, donde terminás con un monolito distribuido. Lo práctico es extraer de a un servicio, por el módulo con límites más claros.',
        },
        {
          text: 'Explicar el patrón outbox y para qué sirve una saga',
          explanation:
            'El problema del outbox es el dual write: guardás un pedido en la base y publicás un evento en Kafka o RabbitMQ, y si una de las dos falla quedan inconsistentes. Con outbox, en la misma transacción que modifica los datos insertás el evento en una tabla `outbox`; un proceso aparte (polling o CDC con Debezium) la lee y publica al broker, marcando lo enviado. Garantiza at-least-once, así que los consumidores tienen que ser idempotentes. Una saga coordina una operación que abarca varios servicios sin transacción distribuida: es una secuencia de transacciones locales donde cada paso tiene una acción compensatoria, por ejemplo si falla el cobro se libera el stock reservado. Puede ser por coreografía (cada servicio reacciona a eventos) o por orquestación (un coordinador o un motor como Temporal dirige los pasos).',
        },
        {
          text: 'Diseñar una estrategia de cache con invalidación',
          explanation:
            'El patrón más común es cache-aside: leés de Redis, si no está (miss) vas a la base, guardás con un TTL y devolvés. Para invalidar, al escribir borrás la clave (mejor borrar que actualizar, para evitar carreras entre escrituras), y el TTL funciona como red de seguridad ante invalidaciones perdidas. Definí claves predecibles (`user:123:profile`) y qué datos toleran estar desactualizados unos segundos. Riesgos a nombrar: cache stampede, cuando una clave popular expira y cientos de requests van juntas a la base (se mitiga con lock o single flight y TTL con jitter), y cachear datos por usuario con claves que no incluyen al usuario, que filtra información ajena. También existen capas previas: cache HTTP con `Cache-Control` y ETags o CDN.',
        },
        {
          text: 'Explicar at-least-once y cómo hacer un consumidor idempotente',
          explanation:
            'Las colas y brokers (SQS, RabbitMQ, Kafka) suelen garantizar at-least-once: el mensaje llega al menos una vez, pero puede llegar repetido si el consumidor procesa y se cae antes de confirmar (ack). Exactly-once de punta a punta en general no existe, así que se simula haciendo el procesamiento idempotente: procesar dos veces tiene el mismo efecto que una. Técnicas: guardar el id del mensaje en una tabla de procesados con unique constraint, en la misma transacción que el efecto; usar operaciones naturalmente idempotentes (`UPSERT`, setear un estado en vez de incrementarlo); y para efectos externos como cobros, mandar una idempotency key al proveedor. Error común: confirmar el mensaje antes de procesarlo, que convierte la garantía en at-most-once y pierde datos.',
        },
        {
          text: 'Nombrar las tres señales de observabilidad y qué medirías en un servicio Node',
          explanation:
            'Las tres señales son logs (eventos discretos con contexto, idealmente JSON estructurado con Pino y un request id), métricas (series numéricas agregadas y baratas para alertar) y trazas (el recorrido de una request entre servicios, con spans por cada llamada). Hoy el estándar para instrumentarlas es OpenTelemetry, con auto-instrumentación para HTTP, Express y drivers de base. En un servicio Node medí lo de RED por endpoint (rate, errors y duración en percentiles p50, p95 y p99), más lo propio de Node: event loop lag, uso de heap y pausas de GC, conexiones del pool de base en uso y en espera, y tamaño de colas. Alertá sobre síntomas que ve el usuario (latencia y errores) y no sobre cada métrica de CPU.',
        },
        {
          text: 'Describir un deploy sin downtime con migraciones compatibles',
          explanation:
            'El deploy sin downtime se hace con rolling update o blue-green: levantás instancias nuevas, el load balancer les manda tráfico solo cuando pasan el readiness check, y las viejas terminan con graceful shutdown (dejan de aceptar conexiones con `server.close()` al recibir `SIGTERM` y terminan las requests en curso). Durante el deploy conviven versiones vieja y nueva, así que la base tiene que ser compatible con ambas: patrón expand and contract. Para renombrar una columna: agregás la nueva (expand), deployás código que escribe en ambas, migrás los datos en lotes, pasás las lecturas a la nueva y recién en un deploy posterior borrás la vieja (contract). Evitá en un solo paso: renombrar o borrar columnas en uso, agregar `NOT NULL` sin default en tablas grandes o crear índices sin `CONCURRENTLY`.',
        },
        {
          text: 'Contar paso a paso cómo diagnosticarías un endpoint lento',
          explanation:
            'Primero acotá: desde cuándo, si es siempre o en picos, para todos o para ciertos usuarios, y mirá los percentiles (p95 y p99), no el promedio. Después abrí una traza de una request lenta para ver dónde se va el tiempo: si es una query de base, una llamada a otro servicio o código propio. Si es la base, corré `EXPLAIN ANALYZE` buscando sequential scans en tablas grandes, índices faltantes o N+1 (muchas queries chicas). Si es CPU propio, mirá el event loop lag y tomá un CPU profile; si es espera de conexiones, revisá el pool. Aplicá un cambio por vez, medí antes y después con los mismos datos, y cerrá con una métrica o alerta para que no vuelva a pasar sin aviso.',
        },
      ],
    },
    {
      id: 'ejercicios',
      title: 'Live coding, take-home y system design',
      body: [
        'El live coding de backend suele ser un endpoint o una función con lógica concreta: un CRUD con validación, agrupar y transformar datos, un rate limiter en memoria, un cliente con retries, o un problema de algoritmos de dificultad media. Practicá en el mismo entorno que vas a usar (editor compartido, sin autocompletado de IA si así lo piden) y con un cronómetro. Antes de escribir, repetí el problema con tus palabras, acordá entradas y salidas y proponé casos borde.',
        'En el take-home importa más la calidad que la cantidad de features: estructura clara, validación, manejo de errores, tests de lo importante, un `README` con cómo correrlo (idealmente con `docker compose up`) y una sección de decisiones y de lo que harías con más tiempo. Respetá el tiempo sugerido y no agregues tecnologías solo para impresionar. Si usaste IA para ayudarte, asegurate de entender y poder defender cada línea, porque la siguiente entrevista suele ser sobre ese código.',
        'El system design aparece en semi-senior alto y senior: un acortador de URLs, un sistema de notificaciones, un feed o un backend de pagos. Seguí un orden: requisitos funcionales y no funcionales, estimación gruesa de volumen, API, modelo de datos, diseño de alto nivel y después profundizar en el cuello de botella (cache, colas, particionado, consistencia). Lo que se evalúa es cómo razonás los trade-offs, no que llegues a una arquitectura perfecta.',
      ],
      checklist: [
        {
          text: 'Resolver un CRUD con validación y errores en menos de 45 minutos',
          explanation:
            'Llegá con un esqueleto mental fijo y practicado: modelo, schema de validación, rutas, capa de acceso a datos y middleware de errores. En los primeros 5 minutos aclarás requisitos (campos, reglas, si hay que persistir en base o alcanza un `Map` en memoria) y después hacés funcionar el camino feliz de punta a punta antes de pulir. Validá con Zod en el borde, devolvé 201, 400, 404 y 409 donde corresponda, y centralizá los errores en un solo handler. Si sobra tiempo, sumá un par de tests con Supertest y paginación. Para practicar, cronometrate armando el mismo CRUD tres o cuatro veces con distintos recursos hasta que salga sin consultar documentación.',
        },
        {
          text: 'Implementar un rate limiter o un retry con backoff desde cero',
          explanation:
            'Rate limiter: el más fácil de explicar es token bucket, donde cada cliente tiene un balde con capacidad N que se recarga a R tokens por segundo y cada request consume uno; sin tokens devolvés 429 con `Retry-After`. Se implementa guardando por clave `{ tokens, lastRefill }` y recalculando tokens con el tiempo transcurrido en cada request; en memoria sirve para una instancia, con varias réplicas va en Redis con una operación atómica (script Lua). Fixed window es más simple pero permite ráfagas dobles en el borde de la ventana. Retry con backoff: reintentá solo errores transitorios (timeouts, 503, 429, nunca 400), con espera exponencial más jitter, por ejemplo `Math.random() * base * 2 ** attempt`, un máximo de intentos y solo en operaciones idempotentes. Sin jitter, todos los clientes reintentan sincronizados y tiran el servicio de nuevo.',
        },
        {
          text: 'Entregar un take-home con tests, `README` y decisiones documentadas',
          explanation:
            'El `README` es lo primero que lee el evaluador: tiene que explicar cómo correrlo en un comando (idealmente `docker compose up` o `pnpm install && pnpm dev`), cómo correr los tests, qué decisiones tomaste y por qué, qué supuestos hiciste ante ambigüedades y qué harías con más tiempo. Los tests cubren los casos importantes y los errores, no el 100% de líneas. Cuidá lo básico que se revisa siempre: estructura clara, validación de input, manejo de errores, nada de secretos commiteados y commits con mensajes legibles que cuenten la historia. No sobre-ingenierices con microservicios ni patrones que el problema no pide, y respetá el tiempo sugerido; si te pasás, decilo en el `README`.',
        },
        {
          text: 'Seguir un orden fijo para encarar un ejercicio de system design',
          explanation:
            'Un orden que funciona: primero requisitos funcionales (qué hace el sistema) y no funcionales (latencia, disponibilidad, consistencia, escala), preguntando en vez de suponer. Segundo, estimaciones de volumen para saber si el problema es de lectura, de escritura o de almacenamiento. Tercero, la API y el modelo de datos. Cuarto, un diagrama de alto nivel con cliente, load balancer, servicios, base, cache y colas. Quinto, profundizar en los cuellos de botella que el entrevistador elija (particionado, cache, consistencia) y cerrar con fallas, monitoreo y trade-offs. Gestioná el tiempo: no pases 20 minutos en requisitos ni saltes directo a Kafka sin justificar por qué hace falta.',
        },
        {
          text: 'Estimar órdenes de magnitud de requests, almacenamiento y ancho de banda',
          explanation:
            'Usá números redondos: un día tiene unos 86400 segundos, aproximalo a 100000. Con 10 millones de usuarios activos diarios que hacen 10 requests cada uno son 100 millones de requests por día, unas 1000 por segundo de promedio, y el pico suele ser 2 a 3 veces más. Almacenamiento: si cada usuario genera 1 KB por día, son 10 GB diarios y unos 3.6 TB por año, más réplicas e índices. Ancho de banda: requests por segundo multiplicado por tamaño de respuesta, 1000 por 10 KB son 10 MB/s. Lo que importa no es la precisión sino sacar conclusiones: 1000 rps los maneja una base bien indexada, 100000 rps de escritura piden particionado o colas.',
        },
        {
          text: 'Defender cada decisión de tu código ante preguntas de seguimiento',
          explanation:
            'Después del ejercicio siempre vienen preguntas como por qué esta estructura, qué pasa si hay 1000 requests concurrentes, o cómo lo testearías. Prepararte significa que, mientras programás, cada elección tenga un motivo que puedas decir en una frase: elegí un `Map` porque la búsqueda es O(1), validé en el borde para que el servicio confíe en sus inputs. Si te señalan un problema real, reconocelo y proponé la corrección; defender algo indefendible resta mucho más. Si la pregunta abre un escenario nuevo (escala, concurrencia), razonalo en voz alta con trade-offs en vez de responder con una sola tecnología. Practicá revisando tus soluciones viejas y preguntándote qué cambiaría con 100 veces más carga.',
        },
      ],
    },
    {
      id: 'dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta: el entrevistador evalúa tu proceso, no solo el resultado. Antes de responder o codear, hacé preguntas que aclaren el alcance (volumen, consistencia, qué pasa ante errores). Si no sabés algo, decilo y contá cómo lo averiguarías o qué sí sabés de un tema vecino; inventar se nota y resta mucho más que un "no lo sé".',
        'Para las preguntas de comportamiento usá STAR: situación, tarea, acción y resultado, con foco en lo que hiciste vos y con un resultado medible si lo hay. Prepará historias sobre un incidente en producción, un desacuerdo técnico, un error tuyo y qué aprendiste, y algo que mejoraste por iniciativa propia. Un minuto y medio por historia es una buena medida.',
        'Llevá preguntas para la empresa: cómo es el proceso de deploy y cada cuánto salen a producción, quién está de guardia y cómo se manejan los incidentes, cómo se decide la arquitectura, qué tan grande es la deuda técnica y cómo es el onboarding. Las respuestas te dicen mucho del día a día y muestran interés real.',
        'Checklist final: probá cámara, micrófono y el editor compartido antes; tené a mano tu `README` o proyecto para mostrar; repasá el stack que pide la búsqueda; dormí bien. Al terminar, anotá lo que no supiste responder y estudialo: cada entrevista es práctica para la siguiente.',
      ],
      checklist: [
        {
          text: 'Pensar en voz alta y hacer preguntas de alcance antes de resolver',
          explanation:
            'El entrevistador evalúa cómo razonás, no solo el resultado, y si te quedás callado no tiene qué evaluar. Antes de escribir código, repetí el problema con tus palabras y hacé preguntas de alcance: tamaño del input, casos borde, si hay que persistir, qué hacer con datos inválidos. Después contá tu plan en dos o tres frases y arrancá. Mientras programás, narrá las decisiones (voy a usar un objeto como índice para no recorrer la lista dos veces) y avisá cuando te trabás. Practicalo resolviendo ejercicios en voz alta con un timer o grabándote, porque no sale natural si nunca lo hiciste.',
        },
        {
          text: 'Admitir lo que no sabés y explicar cómo lo resolverías',
          explanation:
            'Decir no lo sé es aceptable; inventar se detecta enseguida y genera desconfianza sobre todo lo demás que dijiste. Lo que suma es cómo seguís: contá qué sabés de algo relacionado (no usé Kafka, pero trabajé con RabbitMQ y entiendo colas con ack) y cómo lo averiguarías (la documentación oficial, un prototipo chico, medir). Si es un concepto, podés razonarlo en voz alta desde principios: supongo que funciona así por tal motivo. Practicalo pidiendo a alguien que te haga preguntas fuera de tu zona y respondiendo con esta estructura. Lo que no sabés anotalo para estudiarlo después.',
        },
        {
          text: 'Tener tres o cuatro historias preparadas con formato STAR',
          explanation:
            'STAR es Situación (contexto breve), Tarea (tu responsabilidad), Acción (lo que hiciste vos, con detalle técnico) y Resultado (medible si se puede, y qué aprendiste). Prepará historias que cubran las preguntas típicas: un problema técnico difícil, un conflicto con un compañero o con producto, un error tuyo y cómo lo manejaste, y algo de lo que estés orgulloso o donde tomaste iniciativa. Una misma historia puede servir para varias preguntas si la adaptás. Escribilas en viñetas y practicalas en voz alta hasta contarlas en 2 o 3 minutos. Error común: hablar en plural todo el tiempo, que no deja ver qué hiciste vos.',
        },
        {
          text: 'Llevar al menos tres preguntas para hacerle a la empresa',
          explanation:
            'Las preguntas muestran interés y te dan información para decidir si te conviene el trabajo. Buenas preguntas para backend: cómo es el proceso de deploy y cada cuánto deployan, cómo manejan las guardias y los incidentes, cómo se decide qué deuda técnica se paga, cómo es el onboarding y qué se espera de vos en los primeros tres meses, y cómo se mide el éxito del equipo. Adaptalas al entrevistador: a un ingeniero preguntale por el día a día y el stack, a un manager por el equipo y el crecimiento. Evitá preguntar algo que está en la web de la empresa, y dejá salario y beneficios para el recruiter.',
        },
        {
          text: 'Probar el entorno técnico antes de empezar',
          explanation:
            'Con 15 minutos de anticipación probá cámara, micrófono y conexión en la misma plataforma de la entrevista (Meet, Zoom, Teams). Si el live coding es en una herramienta online (CoderPad, HackerRank) o en tu editor compartiendo pantalla, abrila antes y verificá que puedas ejecutar código, con Node y tu gestor de paquetes funcionando y un proyecto vacío listo si vas a usar tu entorno. Cerrá notificaciones, pestañas y apps que puedan aparecer al compartir pantalla, y subí el tamaño de fuente del editor para que se lea bien. Tené a mano agua y una alternativa (datos del celular) por si se cae la conexión.',
        },
        {
          text: 'Anotar después lo que no supiste para estudiarlo',
          explanation:
            'Apenas termina la entrevista, en los primeros 10 o 15 minutos que es cuando te acordás, anotá cada pregunta que no supiste o respondiste mal, y también cómo te sentiste con el ejercicio. Después buscá la respuesta correcta, entendela hasta poder explicarla en voz alta, y si es práctica, implementala. Mantené un documento acumulado de esos temas: con varias entrevistas vas a ver patrones de lo que te falta, que es lo que más rinde estudiar. Si te rechazan, pedí feedback concreto al recruiter; no siempre lo dan, pero cuando lo dan vale mucho.',
        },
      ],
    },
  ],
};
