import type { InterviewQuestion, Seniority } from './types';

export const nodeQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'node',
      question: '¿Qué es Node.js y por qué se dice que es non-blocking?',
      answer:
        'Es un runtime de JavaScript fuera del navegador basado en V8. Es non-blocking porque las operaciones de I/O (red, disco) se delegan al sistema operativo o a libuv y no frenan el hilo principal: cuando terminan, su callback se encola en el event loop. Así un solo hilo atiende muchas conexiones concurrentes.',
    },
    {
      topic: 'http',
      question: '¿Cuáles son los métodos HTTP más comunes y para qué se usan?',
      answer:
        'GET obtiene recursos, POST crea, PUT reemplaza, PATCH actualiza parcialmente y DELETE elimina. GET, PUT y DELETE deben ser idempotentes (repetirlos tiene el mismo efecto). GET no debería tener efectos secundarios.',
    },
    {
      topic: 'http',
      question: '¿Qué significan los códigos de estado 2xx, 4xx y 5xx? Dá ejemplos.',
      answer:
        '2xx éxito (200 OK, 201 Created, 204 No Content). 4xx error del cliente (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict). 5xx error del servidor (500 Internal Server Error, 503 Service Unavailable). 3xx son redirecciones.',
    },
    {
      topic: 'javascript',
      question: '¿Qué diferencia hay entre callbacks, promesas y async/await?',
      answer:
        'Los callbacks son funciones que se llaman al terminar una operación y anidarlos lleva al "callback hell". Las promesas representan un valor futuro y se encadenan con `then`/`catch`. `async/await` es azúcar sintáctico sobre promesas que permite escribir código asíncrono como si fuera secuencial y manejar errores con `try/catch`.',
    },
    {
      topic: 'node',
      question: '¿Qué es un middleware en Express?',
      answer:
        'Es una función `(req, res, next)` que se ejecuta en el pipeline de una request. Puede leer o modificar `req`/`res`, terminar la respuesta o llamar a `next()` para pasar al siguiente. Se usa para logging, autenticación, parseo del body, CORS y manejo de errores (los de error reciben 4 argumentos).',
    },
    {
      topic: 'node',
      question: '¿Para qué sirven `package.json` y `package-lock.json`?',
      answer:
        '`package.json` describe el proyecto: nombre, scripts y dependencias con rangos de versión. El lockfile fija las versiones exactas instaladas de todo el árbol de dependencias para que todos los entornos instalen lo mismo. El lockfile se commitea.',
    },
    {
      topic: 'bases de datos',
      question: '¿Qué diferencia hay entre una base SQL y una NoSQL?',
      answer:
        'SQL (PostgreSQL, MySQL) usa tablas con esquema definido, relaciones y transacciones ACID; ideal para datos relacionales y consistencia. NoSQL agrupa modelos distintos (documentos como MongoDB, clave-valor como Redis, grafos, columnares) con esquemas flexibles y escalado horizontal más simple, a veces con consistencia eventual.',
    },
    {
      topic: 'seguridad',
      question: '¿Cómo guardarías las contraseñas de los usuarios?',
      answer:
        'Nunca en texto plano ni con hashes rápidos como MD5 o SHA-256. Se usa un algoritmo de hashing lento y con salt, como bcrypt, scrypt o Argon2, y al hacer login se compara el hash. Las variables sensibles (claves, secretos) van en variables de entorno, no en el código.',
    },
    {
      topic: 'http',
      question: '¿Qué es una API REST?',
      answer:
        'Es un estilo de diseño de APIs sobre HTTP donde los datos se modelan como recursos identificados por URLs (`/users/42`) y se manipulan con los verbos HTTP. Es stateless: cada request lleva toda la información necesaria. Las respuestas suelen ser JSON y usan los códigos de estado para indicar el resultado.',
    },
    {
      topic: 'http',
      question:
        '¿Qué diferencia hay entre los query params, los path params y el body de una request?',
      answer:
        'Los path params identifican un recurso dentro de la URL (`/users/:id`). Los query params van después del `?` y se usan para filtrar, ordenar o paginar (`?page=2`). El body lleva los datos que se envían en POST, PUT o PATCH, normalmente como JSON.',
    },
    {
      topic: 'node',
      question: '¿Qué diferencia hay entre CommonJS y ES Modules en Node.js?',
      answer:
        'CommonJS usa `require` y `module.exports`, carga módulos de forma sincrónica y es el sistema histórico de Node. ES Modules usa `import`/`export`, es el estándar de JavaScript, se analiza de forma estática y permite top-level `await`. Se activa con `"type": "module"` en el `package.json` o con la extensión `.mjs`.',
    },
    {
      topic: 'node',
      question: '¿Para qué sirven las variables de entorno y cómo las leés en Node.js?',
      answer:
        'Sirven para configurar la app según el entorno (desarrollo, staging, producción) sin cambiar el código, y para guardar secretos fuera del repositorio. Se leen con `process.env.NOMBRE`. En local se suelen cargar desde un archivo `.env` (que no se commitea) con `--env-file` o una librería como dotenv.',
    },
    {
      topic: 'bases de datos',
      question: '¿Qué es una clave primaria y qué es una clave foránea?',
      answer:
        'La clave primaria identifica de forma única cada fila de una tabla y no puede ser nula ni repetirse. La clave foránea es una columna que referencia la clave primaria de otra tabla, lo que modela la relación entre ambas y permite que la base garantice la integridad referencial.',
    },
    {
      topic: 'sql',
      question: '¿Qué diferencia hay entre `INNER JOIN` y `LEFT JOIN`?',
      answer:
        '`INNER JOIN` devuelve solo las filas que tienen coincidencia en ambas tablas. `LEFT JOIN` devuelve todas las filas de la tabla de la izquierda y, si no hay coincidencia en la de la derecha, completa sus columnas con `NULL`. Por ejemplo, para listar todos los usuarios aunque no tengan pedidos se usa `LEFT JOIN`.',
    },
    {
      topic: 'bases de datos',
      question: '¿Qué es un ORM y qué ventajas y desventajas tiene?',
      answer:
        'Un ORM (Prisma, TypeORM, Sequelize) mapea tablas a objetos o modelos del lenguaje y genera las queries por vos. Ventajas: productividad, tipado, migraciones y menos SQL repetitivo. Desventajas: puede generar queries ineficientes, esconde lo que pasa en la base y para consultas complejas a veces conviene escribir SQL directo.',
    },
    {
      topic: 'http',
      question: '¿Qué es CORS y por qué aparece ese error?',
      answer:
        'CORS (Cross-Origin Resource Sharing) es un mecanismo del navegador que bloquea requests desde un origen distinto al del servidor, salvo que este lo permita con headers como `Access-Control-Allow-Origin`. El error aparece en el navegador, no en el servidor: se resuelve configurando en el backend qué orígenes, métodos y headers se aceptan.',
    },
    {
      topic: 'auth',
      question: '¿Qué diferencia hay entre autenticación y autorización?',
      answer:
        'Autenticación es verificar quién sos (login con contraseña, token, SSO). Autorización es decidir qué podés hacer una vez autenticado (roles, permisos sobre recursos). Si falla la autenticación se responde 401; si el usuario está autenticado pero no tiene permiso, 403.',
    },
    {
      topic: 'testing',
      question: '¿Qué es un test unitario y cómo escribirías uno en Node.js?',
      answer:
        'Es un test que verifica una unidad de código pequeña (una función, un módulo) de forma aislada, sin red ni base de datos reales. Se escribe con Jest, Vitest o el test runner nativo `node:test`: se prepara el input, se ejecuta la función y se verifica el resultado con aserciones como `expect(sum(1, 2)).toBe(3)`.',
    },
    {
      topic: 'typescript',
      question: '¿Qué ventajas tiene usar TypeScript en el backend?',
      answer:
        'Detecta errores de tipos en tiempo de compilación, mejora el autocompletado y hace más seguro refactorizar. Además documenta los contratos entre capas (DTOs, respuestas de la base, configuración). Hay que recordar que los tipos desaparecen en runtime, así que los datos externos igual se validan (por ejemplo con Zod).',
    },
    {
      topic: 'git',
      question: '¿Qué es Git y para qué sirven las ramas?',
      answer:
        'Git es un sistema de control de versiones distribuido que guarda el historial de cambios del código. Las ramas permiten trabajar en un feature o un fix de forma aislada sin afectar la rama principal, y después integrarlo con un merge o un pull request revisado por el equipo.',
    },
  ],
  'semi-senior': [
    {
      topic: 'node',
      question: 'Explicá las fases del event loop de Node.js.',
      answer:
        'timers (`setTimeout`/`setInterval`), pending callbacks, idle/prepare, poll (espera y procesa I/O), check (`setImmediate`) y close callbacks. Entre cada callback se vacían la cola de `process.nextTick` y luego la de microtasks (promesas). Bloquear el hilo con trabajo sincrónico pesado frena todas las fases.',
    },
    {
      topic: 'node',
      question: '¿Qué son los streams y cuándo los usarías?',
      answer:
        'Son una abstracción para procesar datos por partes (chunks) en lugar de cargarlos enteros en memoria. Hay Readable, Writable, Duplex y Transform. Se usan para archivos grandes, uploads, proxies o compresión. `pipeline()` los conecta manejando errores y backpressure (pausar al productor cuando el consumidor no da abasto).',
    },
    {
      topic: 'api',
      question: '¿Qué diferencias hay entre REST y GraphQL?',
      answer:
        'REST expone recursos en múltiples endpoints y usa los verbos y la cache de HTTP. GraphQL expone un único endpoint con un esquema tipado donde el cliente pide exactamente los campos que necesita, evitando over/under-fetching. GraphQL complica la cache HTTP y requiere cuidar el problema N+1 (DataLoader) y limitar la complejidad de las queries.',
    },
    {
      topic: 'auth',
      question: '¿Cómo funciona la autenticación con JWT y cuáles son sus desventajas?',
      answer:
        'El servidor firma un token con los claims del usuario y el cliente lo envía en cada request; el servidor valida la firma sin consultar estado. Desventajas: es difícil revocarlo antes de que expire, el payload es legible (no va info sensible) y puede crecer. Se mitiga con access tokens cortos, refresh tokens rotativos y guardarlos en cookies `httpOnly`.',
    },
    {
      topic: 'bases de datos',
      question: '¿Qué es un índice en una base de datos y qué costo tiene?',
      answer:
        'Es una estructura (normalmente un B-tree) que permite encontrar filas sin recorrer toda la tabla, acelerando lecturas por esas columnas. El costo: ocupa espacio y hace más lentas las escrituras porque hay que mantenerlo. Se eligen según las queries reales (revisando `EXPLAIN`), considerando el orden de columnas en índices compuestos.',
    },
    {
      topic: 'bases de datos',
      question: '¿Qué es el problema N+1 y cómo lo resolverías?',
      answer:
        'Ocurre cuando se hace una query para traer una lista y luego una query extra por cada elemento para traer su relación. Se resuelve con joins o eager loading (`include` en Prisma), cargando en lote con `WHERE id IN (...)` o con DataLoader, que agrupa y cachea los pedidos de un mismo tick.',
    },
    {
      topic: 'errores',
      question: '¿Cómo manejarías los errores en una API de Node.js?',
      answer:
        'Distinguir errores operacionales (input inválido, recurso inexistente, timeout) de errores de programación. Usar clases de error con código HTTP, un middleware central que los traduzca a respuestas consistentes sin filtrar detalles internos, validar la entrada con Zod o similar, loguear con contexto y escuchar `unhandledRejection` para registrar y reiniciar el proceso de forma controlada.',
    },
    {
      topic: 'performance',
      question: '¿Cómo aprovecharías varios núcleos de CPU con Node.js?',
      answer:
        'Corriendo varios procesos: el módulo `cluster`, PM2 o, más común hoy, varias réplicas detrás de un load balancer (contenedores en Kubernetes). Para trabajo CPU-intensivo dentro de un proceso se usan `worker_threads`, así no se bloquea el event loop.',
    },
    {
      topic: 'api',
      question: '¿Cómo implementarías la paginación en una API?',
      answer:
        'Con offset/limit (`?page=3&limit=20`), que es simple pero se vuelve lento con offsets grandes y puede saltear o repetir elementos si cambian los datos. O con paginación por cursor (`?after=<id>`), que usa un índice para continuar desde el último elemento, es estable y escala mejor. La respuesta incluye metadatos como el cursor siguiente o el total.',
    },
    {
      topic: 'bases de datos',
      question: '¿Qué es una transacción y qué significan las propiedades ACID?',
      answer:
        'Una transacción agrupa varias operaciones para que se apliquen todas o ninguna. ACID: atomicidad (todo o nada), consistencia (la base pasa de un estado válido a otro), aislamiento (las transacciones concurrentes no se pisan) y durabilidad (lo confirmado persiste aunque se caiga el servidor). En Prisma se usan con `prisma.$transaction`.',
    },
    {
      topic: 'bases de datos',
      question: '¿Qué es la normalización y cuándo conviene desnormalizar?',
      answer:
        'Normalizar es organizar las tablas para evitar datos duplicados y anomalías de actualización (formas normales 1FN, 2FN, 3FN). Se desnormaliza a propósito cuando las lecturas son mucho más frecuentes que las escrituras y los joins son costosos, por ejemplo guardando un contador o datos copiados, aceptando el costo de mantenerlos sincronizados.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué es una SQL injection y cómo se previene?',
      answer:
        "Es cuando input del usuario se concatena en una query y termina ejecutando SQL arbitrario (por ejemplo `' OR 1=1 --`). Se previene con queries parametrizadas o prepared statements, que el ORM usa por defecto, validando la entrada y dando a la app un usuario de base con permisos mínimos. Nunca armar SQL con template strings sin escapar.",
    },
    {
      topic: 'api',
      question: '¿Cómo implementarías rate limiting en una API?',
      answer:
        'Limitando la cantidad de requests por cliente (IP, API key o usuario) en una ventana de tiempo con algoritmos como token bucket o sliding window. Con varias instancias, el contador se guarda en un store compartido como Redis. Al superar el límite se responde 429 Too Many Requests con el header `Retry-After`.',
    },
    {
      topic: 'validación',
      question: '¿Por qué y cómo validás los datos de entrada de una API?',
      answer:
        'Porque todo lo que viene del cliente es no confiable: puede tener tipos incorrectos, campos de más o valores maliciosos. Se valida en el borde de la API con un schema (Zod, Joi, class-validator) que verifica tipos, formatos y rangos, devolviendo 400 con errores claros. Con Zod además se infiere el tipo de TypeScript del mismo schema.',
    },
    {
      topic: 'testing',
      question:
        '¿Qué diferencia hay entre tests unitarios, de integración y end-to-end en un backend?',
      answer:
        'Los unitarios prueban funciones aisladas con dependencias mockeadas. Los de integración prueban varias piezas juntas, por ejemplo un endpoint contra una base de datos real de test (con Supertest y un contenedor). Los e2e prueban el sistema completo como lo usa el cliente. La pirámide sugiere muchos unitarios, varios de integración y pocos e2e.',
    },
    {
      topic: 'docker',
      question: '¿Qué es Docker y qué ventajas tiene para un servicio Node.js?',
      answer:
        'Docker empaqueta la app con su runtime y dependencias en una imagen que corre igual en cualquier máquina como contenedor. Ventajas: entornos reproducibles, despliegues consistentes y levantar dependencias locales (Postgres, Redis) con docker-compose. Para Node conviene una imagen liviana, builds multi-stage e instalar solo dependencias de producción.',
    },
    {
      topic: 'auth',
      question: '¿Qué diferencia hay entre autenticación con sesiones y con tokens?',
      answer:
        'Con sesiones, el servidor guarda el estado de la sesión (en memoria, Redis o base) y el cliente solo tiene un id en una cookie, lo que permite revocarla fácilmente. Con tokens (JWT), el estado viaja en el token firmado y el servidor no guarda nada, lo que escala sin store compartido pero dificulta la revocación.',
    },
    {
      topic: 'node',
      question: '¿Cómo funciona `Promise.all` y en qué se diferencia de `Promise.allSettled`?',
      answer:
        '`Promise.all` ejecuta promesas en paralelo y resuelve con todos los resultados, pero rechaza apenas una falla. `Promise.allSettled` espera a que todas terminen y devuelve el estado de cada una (`fulfilled` o `rejected`), útil cuando querés procesar los éxitos aunque algunas fallen. `Promise.race` y `Promise.any` resuelven con la primera.',
    },
    {
      topic: 'caching',
      question: '¿Qué es Redis y para qué lo usarías?',
      answer:
        'Es una base de datos clave-valor en memoria, muy rápida, con estructuras como strings, hashes, listas, sets y sorted sets. Se usa como cache de queries o respuestas, para guardar sesiones, rate limiting, colas de trabajos (BullMQ), locks distribuidos y pub/sub. Como vive en memoria, se configura con TTLs y una política de expulsión.',
    },
    {
      topic: 'logging',
      question: '¿Cómo harías el logging de una aplicación Node.js en producción?',
      answer:
        'Con logs estructurados en JSON usando una librería como Pino, con niveles (`info`, `warn`, `error`) y contexto como request id y usuario. Se escriben a stdout y la plataforma los recolecta y centraliza (Datadog, Loki, CloudWatch). Nunca loguear contraseñas, tokens ni datos personales sensibles.',
    },
  ],
  senior: [
    {
      topic: 'arquitectura',
      question: '¿Cuándo elegirías microservicios en lugar de un monolito?',
      answer:
        'Cuando hay varios equipos que necesitan desplegar y escalar de forma independiente y los límites del dominio están claros. Agregan complejidad: red, consistencia distribuida, observabilidad, despliegues y testing. Muchas veces conviene empezar con un monolito modular bien separado y extraer servicios cuando haya una razón concreta.',
    },
    {
      topic: 'sistemas distribuidos',
      question:
        '¿Cómo mantenés la consistencia de datos entre servicios sin transacciones distribuidas?',
      answer:
        'Con consistencia eventual: patrón Saga (pasos locales con acciones compensatorias, orquestadas o coreografiadas por eventos) y el patrón Outbox para publicar eventos de forma atómica junto con el cambio en la base. Los consumidores deben ser idempotentes porque los mensajes pueden llegar duplicados o desordenados.',
    },
    {
      topic: 'escalabilidad',
      question: '¿Qué estrategias de caching usarías y cómo manejás la invalidación?',
      answer:
        'Cache-aside con Redis, cache HTTP/CDN con `Cache-Control` y ETags, y cache en memoria para datos muy calientes. Invalidación por TTL, por evento (al escribir se borra o actualiza la clave) o con versionado de claves. Cuidar el cache stampede con locks, jitter en los TTL o stale-while-revalidate.',
    },
    {
      topic: 'api',
      question: '¿Cómo diseñarías un endpoint de pagos para que sea idempotente?',
      answer:
        'El cliente manda una `Idempotency-Key` única por operación. El servidor la guarda junto con el resultado (con una constraint única para evitar carreras) y, si llega un reintento con la misma clave, devuelve la respuesta original sin volver a cobrar. Se combina con transacciones y con reintentos con backoff exponencial del lado del cliente.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo implementarías la observabilidad de un sistema en producción?',
      answer:
        'Los tres pilares: logs estructurados con correlation id, métricas (latencia p95/p99, tasa de errores, throughput, saturación) y trazas distribuidas con OpenTelemetry. Definir SLIs/SLOs, alertas basadas en síntomas que impactan al usuario, dashboards y runbooks para el on-call.',
    },
    {
      topic: 'node',
      question: '¿Cómo investigarías una fuga de memoria en un servicio Node.js?',
      answer:
        'Confirmarla con métricas (heap que crece y no baja tras el GC). Reproducir en un entorno controlado, tomar heap snapshots con `--inspect` y Chrome DevTools en distintos momentos y compararlos para ver qué objetos se retienen. Causas típicas: caches sin límite, listeners que no se remueven, closures que retienen objetos grandes y timers sin limpiar.',
    },
    {
      topic: 'escalabilidad',
      question: '¿Cuándo usarías una cola de mensajes y qué garantías de entrega existen?',
      answer:
        'Para desacoplar servicios, absorber picos de carga y procesar trabajo pesado en segundo plano (BullMQ, RabbitMQ, SQS, Kafka). Garantías: at-most-once (puede perderse), at-least-once (puede duplicarse, la más común, requiere consumidores idempotentes) y exactly-once (costosa, limitada a ciertos sistemas). Agregar dead-letter queues y reintentos con backoff.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué medidas tomarías para asegurar una API pública?',
      answer:
        'HTTPS, autenticación robusta (OAuth 2.0/OIDC) y autorización por recurso, validación de toda entrada, queries parametrizadas, rate limiting, headers de seguridad, CORS restrictivo, secretos en un vault, principio de mínimo privilegio, auditoría de dependencias y logs de seguridad sin datos sensibles. Tener en cuenta el OWASP API Security Top 10.',
    },
    {
      topic: 'system design',
      question: '¿Cómo diseñarías un acortador de URLs como bit.ly?',
      answer:
        'Un servicio que genera un código corto único (contador en base62 o hash con manejo de colisiones) y guarda el mapeo en una base clave-valor. Las lecturas superan ampliamente a las escrituras, así que se cachea en Redis y CDN y se responde con redirect 301/302. Para analytics se registran los clicks de forma asíncrona en una cola, sin frenar el redirect.',
    },
    {
      topic: 'escalabilidad',
      question: '¿Cómo escalarías una base de datos relacional que está al límite?',
      answer:
        'Primero optimizar: índices, queries lentas, connection pooling y cache. Después réplicas de lectura para separar lecturas de escrituras (aceptando lag de replicación), escalado vertical y particionado de tablas grandes. Como último recurso, sharding horizontal por una clave, que complica joins, transacciones y operaciones entre shards.',
    },
    {
      topic: 'sistemas distribuidos',
      question: '¿Qué dice el teorema CAP y cómo aplica en la práctica?',
      answer:
        'Ante una partición de red, un sistema distribuido debe elegir entre consistencia (todos ven el mismo dato) y disponibilidad (todos los nodos responden). En la práctica las particiones ocurren, así que se elige por caso de uso: CP para saldos o inventario, AP para feeds o contadores. PACELC agrega que aun sin particiones se negocia latencia contra consistencia.',
    },
    {
      topic: 'node',
      question: '¿Qué pasa si bloqueás el event loop y cómo lo detectás?',
      answer:
        'Toda la app deja de atender requests y timers mientras corre el código sincrónico, subiendo la latencia de todos los clientes. Causas típicas: `JSON.parse` de payloads enormes, regex catastróficas, crypto o compresión sincrónica y loops pesados. Se detecta midiendo el event loop lag (`perf_hooks.monitorEventLoopDelay`), con profiling (`--cpu-prof`, clinic.js) y se resuelve con worker threads o moviendo el trabajo a otro servicio.',
    },
    {
      topic: 'api',
      question: '¿Cómo manejás el versionado y los breaking changes de una API pública?',
      answer:
        'Evitando romper: cambios aditivos, campos nuevos opcionales y tolerancia a campos desconocidos. Cuando es inevitable, versionar en la URL (`/v2`) o por header, mantener ambas versiones un tiempo, avisar con el header `Deprecation`/`Sunset` y documentación, y medir el uso de la versión vieja antes de apagarla.',
    },
    {
      topic: 'arquitectura',
      question: '¿Qué es event sourcing y CQRS, y cuándo los usarías?',
      answer:
        'Event sourcing guarda el estado como una secuencia inmutable de eventos en lugar del estado actual, lo que da auditoría completa y permite reconstruir el pasado. CQRS separa el modelo de escritura del de lectura, con vistas optimizadas para consultas. Aportan en dominios complejos con fuerte necesidad de auditoría, pero suman complejidad, consistencia eventual y versionado de eventos.',
    },
    {
      topic: 'resiliencia',
      question: '¿Qué patrones usarías para que un servicio tolere fallas de sus dependencias?',
      answer:
        'Timeouts en toda llamada externa, reintentos con backoff exponencial y jitter solo en operaciones idempotentes, circuit breaker para dejar de llamar a un servicio caído, bulkheads para aislar recursos, fallbacks o respuestas degradadas y colas para desacoplar. También health checks y graceful shutdown para no cortar requests en curso.',
    },
    {
      topic: 'deploy',
      question: '¿Cómo harías deploys sin downtime y con bajo riesgo?',
      answer:
        'Con rolling updates o blue-green detrás de un load balancer, readiness probes y graceful shutdown que termina los requests en curso. Para reducir riesgo: canary releases y feature flags para separar deploy de release, y rollback automático según métricas. Las migraciones de base se hacen compatibles hacia atrás con el patrón expand/contract.',
    },
    {
      topic: 'bases de datos',
      question: '¿Qué niveles de aislamiento de transacciones existen y qué problemas evitan?',
      answer:
        'Read uncommitted, read committed (default de PostgreSQL), repeatable read y serializable. A mayor aislamiento se evitan más anomalías: dirty reads, non-repeatable reads, phantom reads y write skew, a cambio de más bloqueos o reintentos por conflictos. Para casos puntuales se usa `SELECT ... FOR UPDATE` o locking optimista con una columna de versión.',
    },
    {
      topic: 'multi-tenancy',
      question: '¿Cómo diseñarías un backend SaaS multi-tenant?',
      answer:
        'Opciones: base compartida con columna `tenant_id` (más barato, requiere filtrar siempre, idealmente con Row Level Security), schema por tenant o base por tenant (más aislamiento y costo operativo). Hay que resolver el tenant en cada request, aislar datos, cuotas y rate limits por tenant y considerar los "noisy neighbors" que consumen recursos de más.',
    },
    {
      topic: 'performance',
      question: '¿Cómo encararías un endpoint que en producción responde lento?',
      answer:
        'Medir antes de cambiar: trazas distribuidas y métricas de latencia p95/p99 para ver dónde se va el tiempo (base, servicios externos, CPU). Revisar las queries con `EXPLAIN ANALYZE`, índices y N+1, agregar cache donde tenga sentido, paralelizar llamadas independientes y mover trabajo pesado a jobs asíncronos. Validar la mejora con load testing (k6, autocannon).',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo encarás la deuda técnica en un equipo de backend?',
      answer:
        'Haciéndola visible: registrarla, estimar su impacto en velocidad, incidentes o riesgo y priorizarla junto al producto con argumentos de negocio. Pagarla de forma incremental (regla del boy scout, un porcentaje del sprint, refactors con tests de por medio) en lugar de reescrituras grandes, y prevenirla con code review, ADRs y estándares compartidos.',
    },
  ],
};
