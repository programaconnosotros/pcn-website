import type { TrackPractice } from './types';

export const nodePractice: TrackPractice = {
  track: 'node',
  exercises: {
    junior: [
      {
        id: 'tasks-crud-endpoint',
        title: 'Endpoint REST de tareas con validación',
        duration: '45 min',
        statement: [
          'Armá con Express y TypeScript una API mínima para una lista de tareas. Por ahora no hay base de datos: guardá todo en memoria en un array o un `Map`. Una tarea tiene la forma `{ id: string, title: string, done: boolean, createdAt: string }`.',
          'Necesitamos `POST /tasks` que recibe `{ "title": "Comprar café" }` y responde `201` con la tarea creada, `GET /tasks` que devuelve todas, `GET /tasks/:id` y `PATCH /tasks/:id` que permite cambiar `title` o `done`. Si el body es inválido respondé `400` con `{ "error": "title es obligatorio" }` o un mensaje equivalente.',
        ],
        requirements: [
          '`title` es obligatorio, string, sin espacios al principio ni al final y de 1 a 120 caracteres.',
          '`PATCH` solo acepta `title` y `done`; cualquier otro campo se ignora o se rechaza, pero decidilo y justificalo.',
          'Un `id` inexistente devuelve `404`, no `500`.',
          'Los códigos de estado son los correctos: `201` al crear, `200` al leer y actualizar.',
          'Los errores inesperados pasan por un error handler de Express y no exponen el stack trace.',
        ],
        followUps: [
          '¿Cómo agregarías `DELETE /tasks/:id` y qué código devolverías?',
          '¿Usarías una librería como zod para validar? ¿Qué ganás frente a validar a mano?',
          '¿Qué pasa con los datos si el proceso se reinicia y cómo lo resolverías?',
          '¿Cómo testearías estos endpoints con supertest?',
        ],
        evaluates:
          'Que conozcas lo básico de HTTP y Express: rutas, status codes, validación de entrada y manejo de errores sin romper el servidor.',
      },
      {
        id: 'group-orders-by-customer',
        title: 'Agrupar y resumir órdenes',
        duration: '30 min',
        statement: [
          'Recibís un array de órdenes con la forma `{ id: number, customerId: string, total: number, status: "paid" | "pending" | "cancelled" }`. Escribí una función `summarizeOrders(orders)` que devuelva, por cada cliente, cuántas órdenes pagadas tiene y cuánto gastó en total.',
          'Por ejemplo, para `[{ id: 1, customerId: "a", total: 100, status: "paid" }, { id: 2, customerId: "a", total: 50, status: "cancelled" }, { id: 3, customerId: "b", total: 30, status: "paid" }]` el resultado esperado es `[{ customerId: "a", paidOrders: 1, totalSpent: 100 }, { customerId: "b", paidOrders: 1, totalSpent: 30 }]`, ordenado de mayor a menor `totalSpent`.',
        ],
        requirements: [
          'Solo cuentan las órdenes con `status` igual a `paid`.',
          'Recorré el array una sola vez para agrupar (usando `Map` u objeto), sin filtros anidados por cliente.',
          'Tipá la entrada y la salida con interfaces o types de TypeScript.',
          'La función no muta el array original.',
        ],
        followUps: [
          '¿Qué cambia si los montos vienen como strings con decimales, por ejemplo `"10.10"`?',
          '¿Por qué sumar dinero con `number` puede dar resultados raros y cómo lo evitarías?',
          '¿Cómo lo resolverías si las órdenes vinieran de una tabla SQL en vez de un array?',
        ],
        evaluates:
          'Tu manejo de estructuras de datos básicas en JavaScript (`Map`, `reduce`, sort) y tu atención a casos borde como montos y estados.',
      },
      {
        id: 'retry-with-backoff',
        title: 'Reintentar una llamada async con backoff',
        duration: '30 min',
        statement: [
          'Tenemos que llamar a una API externa que a veces falla con errores transitorios. Escribí una función `retry(fn, { retries, baseDelayMs })` que reciba una función que devuelve una promesa y la ejecute hasta que funcione o se agoten los reintentos.',
          'Entre intento e intento esperá un tiempo que crece exponencialmente: `baseDelayMs`, después `baseDelayMs * 2`, después `baseDelayMs * 4`. Si todos los intentos fallan, la promesa devuelta tiene que rechazarse con el último error.',
        ],
        requirements: [
          'Usá `async/await` y una función `sleep(ms)` basada en `setTimeout` y `Promise`.',
          'Con `retries: 3` la función se ejecuta como máximo 4 veces (1 intento más 3 reintentos).',
          'Si `fn` resuelve, devolvé su valor sin esperar de más.',
          'La firma es genérica: `retry<T>(fn: () => Promise<T>, ...): Promise<T>`.',
        ],
        followUps: [
          '¿Para qué sirve agregar jitter al delay?',
          '¿Cómo harías para no reintentar errores que no son transitorios, como un `400`?',
          '¿Cómo testearías esto sin esperar los tiempos reales? Pensá en fake timers.',
        ],
        evaluates:
          'Que entiendas promesas, `async/await` y el event loop lo suficiente como para escribir un helper asíncrono correcto y tipado.',
      },
    ],
    'semi-senior': [
      {
        id: 'paginated-products-endpoint',
        title: 'Listado de productos con paginación y filtros',
        duration: '45 min',
        statement: [
          'Tenemos un endpoint `GET /products` en NestJS o Express que hoy devuelve los 50.000 productos de una vez. Modificalo para que acepte `?limit=20&cursor=<cursor>&category=books&minPrice=10` y responda `{ data: Product[], nextCursor: string | null }`. Un producto es `{ id: number, name: string, category: string, price: number, createdAt: string }`.',
          'Para el ejercicio podés simular la base con un array ordenado por `createdAt` descendente y `id` como desempate, pero escribí la consulta SQL equivalente que usarías en Postgres.',
        ],
        requirements: [
          'Usá paginación por cursor (keyset), no `OFFSET`; el cursor codifica `createdAt` e `id` del último elemento.',
          'Validá los query params: `limit` entre 1 y 100 con default 20, `minPrice` numérico; si son inválidos respondé `400`.',
          'Los filtros se aplican antes de paginar y el cursor sigue siendo válido con los mismos filtros.',
          '`nextCursor` es `null` cuando no hay más resultados.',
          'Explicá qué índice crearías para que la consulta sea eficiente.',
        ],
        followUps: [
          '¿Por qué `OFFSET` se degrada con tablas grandes y qué problema tiene si se insertan filas mientras paginás?',
          '¿Cómo harías para que el cliente no pueda manipular el cursor?',
          '¿Cómo agregarías ordenamiento por `price` sin romper el cursor?',
        ],
        evaluates:
          'Que sepas diseñar un endpoint de listado que escala: validación de entrada, paginación por cursor y la relación entre la query y los índices.',
      },
      {
        id: 'ttl-cache-with-dedup',
        title: 'Cache en memoria con TTL y deduplicación',
        duration: '45 min',
        statement: [
          'Un servicio llama muchas veces por segundo a `getExchangeRate(currency)`, que consulta una API lenta. Escribí una clase `TtlCache<K, V>` con `get(key, loader)` que devuelva el valor cacheado si no venció o, si no, llame a `loader()` (async), lo guarde con un TTL configurable y lo devuelva.',
          'Además, si llegan 100 llamadas simultáneas para la misma `key` mientras el valor no está en cache, `loader` tiene que ejecutarse una sola vez y todas las llamadas tienen que recibir el mismo resultado.',
        ],
        requirements: [
          'El TTL se pasa en el constructor y la expiración se evalúa al leer (lazy), sin un `setInterval` por cada clave.',
          'Las llamadas concurrentes a la misma clave comparten la misma promesa en vuelo.',
          'Si `loader` falla, el error se propaga a todos los que esperaban y no se cachea.',
          'Exponé `delete(key)` y `clear()`.',
          'Toda la clase está tipada con genéricos.',
        ],
        followUps: [
          '¿Cómo limitarías la cantidad de entradas para que no crezca la memoria sin control?',
          '¿Qué pasa si tenés varias instancias del servicio detrás de un load balancer? ¿Cuándo pasarías a Redis?',
          '¿Qué es stale-while-revalidate y cómo lo implementarías acá?',
        ],
        evaluates:
          'Tu dominio de promesas y concurrencia en el event loop de Node, y si pensás en fallas, memoria y el problema de thundering herd.',
      },
      {
        id: 'log-file-aggregation',
        title: 'Procesar un archivo de logs grande',
        duration: '45 min',
        statement: [
          'Tenemos un archivo de access logs de 5 GB donde cada línea tiene el formato `2024-05-01T10:00:00Z GET /api/users 200 123ms`. Escribí un script en Node que lo lea y devuelva, por cada endpoint (método más path), la cantidad de requests, el porcentaje de respuestas 5xx y la latencia p95.',
          'La salida esperada es un array como `[{ endpoint: "GET /api/users", count: 1520, errorRate: 0.02, p95Ms: 340 }]` ordenado por `count` descendente.',
        ],
        requirements: [
          'No cargues el archivo entero en memoria: usá streams (`fs.createReadStream` con `readline` o similar).',
          'Las líneas mal formadas se cuentan y se saltean sin cortar el proceso.',
          'Normalizá paths con IDs, por ejemplo `/api/users/42` pasa a `/api/users/:id`.',
          'Explicá la complejidad en memoria de tu cálculo de p95.',
        ],
        followUps: [
          '¿Qué harías si guardar todas las latencias por endpoint no entra en memoria?',
          '¿Cómo lo paralelizarías usando `worker_threads` o varios procesos?',
          '¿Qué es el backpressure en streams y cuándo te importaría acá?',
        ],
        evaluates:
          'Que sepas procesar datos grandes en Node sin bloquear ni explotar la memoria, y que razones sobre métricas como percentiles.',
      },
    ],
    senior: [
      {
        id: 'idempotent-payments-endpoint',
        title: 'Endpoint de pagos idempotente',
        duration: '60 min',
        statement: [
          'Diseñá e implementá `POST /payments` en NestJS. El cliente manda el header `Idempotency-Key` y un body `{ amount: number, currency: string, customerId: string }`. El endpoint llama a un `PaymentProvider.charge()` externo que puede tardar varios segundos o hacer timeout.',
          'Si el cliente reintenta con la misma key y el mismo body, tiene que recibir exactamente la misma respuesta sin cobrar dos veces. Si reintenta con la misma key y un body distinto, respondé `422`. Si llega un reintento mientras el primer request todavía se está procesando, respondé `409`.',
        ],
        requirements: [
          'Persistí las keys en una tabla (podés escribir el schema SQL) con estado `processing`, `completed` o `failed`, hash del body y respuesta guardada.',
          'La reserva de la key es atómica: usá un constraint único o `INSERT ... ON CONFLICT`, no un `SELECT` seguido de `INSERT`.',
          'Definí qué pasa si el proceso muere con la key en `processing`.',
          'Las keys expiran después de 24 horas.',
          'Separá el controller, el servicio de idempotencia y el cliente del proveedor para poder testearlos por separado.',
        ],
        followUps: [
          '¿Cómo te protegés si el proveedor cobró pero vos hiciste timeout antes de recibir la respuesta?',
          '¿Lo resolverías como interceptor de NestJS para reusarlo en otros endpoints? ¿Qué limitaciones tiene?',
          '¿Qué cambia si en vez de Postgres usás Redis para guardar las keys?',
          '¿Cómo lo testearías, incluyendo requests concurrentes?',
        ],
        evaluates:
          'Tu criterio para diseñar operaciones seguras ante reintentos y fallas parciales, cuidando la atomicidad y la separación de responsabilidades.',
      },
      {
        id: 'job-queue-with-retries',
        title: 'Cola de jobs con concurrencia y reintentos',
        duration: '60 min',
        statement: [
          'Implementá en TypeScript una `JobQueue` en memoria. Se registran handlers con `queue.process(type, handler, { concurrency })` y se encolan jobs con `queue.add(type, payload, { maxAttempts, backoffMs })`. Un handler es `(payload) => Promise<void>`.',
          'La cola tiene que ejecutar como máximo `concurrency` jobs del mismo tipo en paralelo, reintentar los fallidos con backoff exponencial hasta `maxAttempts` y, cuando se agotan, moverlos a una dead letter queue consultable con `queue.failed()`.',
        ],
        requirements: [
          'El límite de concurrencia se respeta siempre, incluso si se encolan 1.000 jobs de golpe.',
          'Un job que tira una excepción o rechaza la promesa cuenta como intento fallido.',
          'Soportá un timeout por job: si el handler no termina a tiempo, el intento falla.',
          'Implementá `queue.close()` que deja de tomar jobs nuevos y espera a que terminen los que están corriendo (graceful shutdown).',
          'Emití eventos `completed` y `failed` con `EventEmitter`.',
        ],
        followUps: [
          '¿Qué garantías perdés por ser en memoria y cómo lo llevarías a BullMQ o a una tabla en Postgres con `SELECT ... FOR UPDATE SKIP LOCKED`?',
          '¿Cómo harías para que un handler sea idempotente si el job se procesa dos veces?',
          '¿Cómo agregarías prioridades o jobs diferidos?',
        ],
        evaluates:
          'Que sepas coordinar trabajo asíncrono concurrente en Node con límites, reintentos y apagado ordenado, que es la base de cualquier sistema de background jobs.',
      },
      {
        id: 'sliding-window-rate-limiter',
        title: 'Rate limiter como middleware',
        duration: '45 min',
        statement: [
          'Escribí un middleware de Express que limite cada API key a `N` requests por ventana de `W` segundos. La key viene en el header `X-Api-Key`. Cuando se excede el límite, respondé `429` con el header `Retry-After` indicando cuántos segundos faltan.',
          'Primero implementalo con un store en memoria detrás de una interfaz `RateLimitStore`, y después explicá o esbozá la implementación con Redis para que funcione con varias instancias del servicio.',
        ],
        requirements: [
          'Elegí y justificá el algoritmo: fixed window, sliding window log, sliding window counter o token bucket.',
          'Agregá los headers `X-RateLimit-Limit` y `X-RateLimit-Remaining` en todas las respuestas.',
          'El store en memoria no crece sin límite con keys que dejaron de usarse.',
          'En la versión con Redis, la operación de chequear e incrementar es atómica (por ejemplo con un script Lua o `MULTI`).',
          'El middleware es configurable por ruta.',
        ],
        followUps: [
          '¿Qué hacés si Redis no responde: dejás pasar el tráfico o lo bloqueás?',
          '¿Cómo soportarías límites distintos por plan de cliente?',
          '¿Qué problema tiene fixed window en el borde entre dos ventanas?',
        ],
        evaluates:
          'Tu capacidad para elegir un algoritmo con trade-offs claros y llevarlo a un entorno distribuido sin condiciones de carrera.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        why: 'El ejemplo clásico de usar un hash map para pasar de O(n²) a O(n), base de muchísimas preguntas.',
      },
      {
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        why: 'Entrena el uso de una pila, el mismo razonamiento que usás para parsear o validar estructuras anidadas.',
      },
      {
        slug: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        why: 'Contar frecuencias con un objeto o `Map` es un patrón que vas a repetir en cualquier agregación de datos.',
      },
      {
        slug: 'first-unique-character-in-a-string',
        title: 'First Unique Character in a String',
        difficulty: 'Easy',
        why: 'Combina conteo de frecuencias con una segunda pasada, ideal para practicar recorridos simples y su complejidad.',
      },
      {
        slug: 'best-time-to-buy-and-sell-stock',
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        why: 'Te enseña a mantener un estado mínimo mientras recorrés un array una sola vez, muy común en primeras entrevistas.',
      },
      {
        slug: 'combine-two-tables',
        title: 'Combine Two Tables',
        difficulty: 'Easy',
        why: 'Practica `LEFT JOIN`, que es lo primero que te preguntan de SQL en una entrevista backend.',
      },
      {
        slug: 'customers-who-never-order',
        title: 'Customers Who Never Order',
        difficulty: 'Easy',
        why: 'Buscar filas sin relación con `LEFT JOIN ... IS NULL` o `NOT EXISTS` es una consulta de todos los días.',
      },
    ],
    'semi-senior': [
      {
        slug: 'group-anagrams',
        title: 'Group Anagrams',
        difficulty: 'Medium',
        why: 'Agrupar por una clave calculada es exactamente lo que hacés al agregar datos en un servicio.',
      },
      {
        slug: 'longest-substring-without-repeating-characters',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        why: 'El problema de referencia para sliding window, el patrón detrás de rate limiters y métricas por ventana.',
      },
      {
        slug: 'merge-intervals',
        title: 'Merge Intervals',
        difficulty: 'Medium',
        why: 'Ordenar y fusionar intervalos aparece en reservas, turnos y rangos de fechas en APIs reales.',
      },
      {
        slug: 'top-k-frequent-elements',
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        why: 'Combina conteo con heap o bucket sort, igual que sacar los endpoints o usuarios más activos de un log.',
      },
      {
        slug: 'time-based-key-value-store',
        title: 'Time Based Key-Value Store',
        difficulty: 'Medium',
        why: 'Diseñar una estructura con versiones por timestamp y búsqueda binaria se parece mucho a un cache o un store real.',
      },
      {
        slug: 'number-of-recent-calls',
        title: 'Number of Recent Calls',
        difficulty: 'Easy',
        why: 'Contar requests dentro de una ventana de tiempo con una cola es la base de un rate limiter.',
      },
      {
        slug: 'department-highest-salary',
        title: 'Department Highest Salary',
        difficulty: 'Medium',
        why: 'Practica `JOIN` con subconsultas o funciones de ventana para quedarte con el máximo por grupo.',
      },
    ],
    senior: [
      {
        slug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        why: 'Combinar hash map con lista doblemente enlazada para operaciones O(1) es una pregunta de diseño casi obligada.',
      },
      {
        slug: 'lfu-cache',
        title: 'LFU Cache',
        difficulty: 'Hard',
        why: 'Lleva el LRU un paso más allá y prueba si podés mantener varias estructuras sincronizadas sin errores.',
      },
      {
        slug: 'course-schedule-ii',
        title: 'Course Schedule II',
        difficulty: 'Medium',
        why: 'Orden topológico y detección de ciclos, lo mismo que resolver dependencias entre jobs, migraciones o paquetes.',
      },
      {
        slug: 'merge-k-sorted-lists',
        title: 'Merge k Sorted Lists',
        difficulty: 'Hard',
        why: 'Usar un heap para fusionar k fuentes ordenadas es el patrón de combinar streams o resultados de varias shards.',
      },
      {
        slug: 'sliding-window-maximum',
        title: 'Sliding Window Maximum',
        difficulty: 'Hard',
        why: 'La deque monótona resuelve métricas por ventana en O(n), útil para monitoreo y agregaciones en tiempo real.',
      },
      {
        slug: 'design-authentication-manager',
        title: 'Design Authentication Manager',
        difficulty: 'Medium',
        why: 'Modela tokens con expiración y renovación, el mismo problema que sesiones o un cache con TTL.',
      },
      {
        slug: 'trips-and-users',
        title: 'Trips and Users',
        difficulty: 'Hard',
        why: 'Una consulta con varios `JOIN`, filtros y agregación condicional, como las que escribís para reportes de negocio.',
      },
    ],
  },
};
