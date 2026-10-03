import type { TrackPractice } from './types';

export const dotnetPractice: TrackPractice = {
  track: 'dotnet',
  exercises: {
    junior: [
      {
        id: 'todo-minimal-api',
        title: 'API de tareas con validación en ASP.NET Core',
        duration: '45 min',
        statement: [
          'Con ASP.NET Core (Minimal APIs o controllers, como prefieras) armá una API de tareas guardadas en memoria. Una tarea es `record TodoItem(int Id, string Title, bool IsDone, DateTime CreatedAt)`.',
          'Implementá `POST /todos` que devuelve `201 Created` con la ubicación del recurso, `GET /todos` con filtro opcional `?done=true`, `GET /todos/{id}` y `PUT /todos/{id}`. Los errores de validación se devuelven como `400` con un `ProblemDetails`.',
        ],
        requirements: [
          'Usá un DTO de entrada distinto del modelo; `Title` es obligatorio y tiene entre 1 y 100 caracteres.',
          'Registrá el repositorio en memoria en el contenedor de DI y justificá el lifetime elegido (`Singleton`, `Scoped` o `Transient`).',
          'El repositorio es seguro ante requests concurrentes (`ConcurrentDictionary` o un lock).',
          'Un `id` inexistente devuelve `404` con `Results.NotFound()` o `NotFound()`.',
          'Los handlers son `async` aunque el store sea en memoria, para que el contrato no cambie al pasar a EF Core.',
        ],
        followUps: [
          '¿Qué pasaría si registrás el repositorio como `Scoped`?',
          '¿Cómo lo testearías con `WebApplicationFactory`?',
          '¿Qué cambia al pasar a EF Core con un `DbContext`?',
        ],
        evaluates:
          'Que conozcas lo básico de ASP.NET Core: routing, DI con sus lifetimes, status codes y validación de entrada.',
      },
      {
        id: 'linq-sales-report',
        title: 'Reporte de ventas con LINQ',
        duration: '30 min',
        statement: [
          'Tenés una `List<Sale>` donde `record Sale(string Seller, string Region, decimal Amount, DateOnly Date)`. Escribí métodos que devuelvan: el total vendido por región ordenado de mayor a menor, el mejor vendedor de cada mes y los vendedores que no vendieron nada en un mes dado, partiendo de una lista de todos los vendedores.',
          'Por ejemplo, el primero devuelve algo como `[("Norte", 15000m), ("Sur", 9800m)]`.',
        ],
        requirements: [
          'Resolvelo con LINQ (`GroupBy`, `Sum`, `OrderByDescending`, `Except` o equivalentes).',
          'Usá `decimal` para los montos.',
          'Las colecciones vacías no lanzan excepción: cuidado con `Max` y `First` sobre secuencias vacías.',
          'Evitá enumerar la misma consulta varias veces sin necesidad.',
        ],
        followUps: [
          '¿Qué es la ejecución diferida en LINQ y cuándo te puede jugar en contra?',
          '¿Qué diferencia hay entre `IEnumerable` e `IQueryable` si esto viniera de EF Core?',
          '¿Cuándo preferís `FirstOrDefault` y cuándo `Single`?',
        ],
        evaluates:
          'Tu fluidez con colecciones y LINQ, y si conocés sus trampas habituales como la ejecución diferida.',
      },
      {
        id: 'parse-config-lines',
        title: 'Parsear un archivo de configuración',
        duration: '30 min',
        statement: [
          'Escribí `Dictionary<string, string> ParseConfig(string content)` que reciba el contenido de un archivo con líneas como `db.host = localhost`, comentarios que empiezan con `#` y líneas vacías.',
          'Por ejemplo, para el texto con las líneas `# base`, `db.host = localhost`, `db.port=5432` y `invalida`, devuelve `{ "db.host": "localhost", "db.port": "5432" }` y reporta que la línea 4 es inválida.',
        ],
        requirements: [
          'Se ignoran espacios alrededor de la clave y del valor.',
          'Una clave repetida se queda con el último valor, y se registra un warning.',
          'Las líneas inválidas no cortan el parseo; se devuelven con su número de línea en una lista de errores.',
          'Escribí tests con xUnit o NUnit para los casos borde.',
        ],
        followUps: [
          '¿Cómo agregarías un método `GetInt(key)` que falle con un mensaje claro si el valor no es numérico?',
          '¿Usarías `TryParse` o excepciones para los errores de formato? ¿Por qué?',
          '¿Cómo se relaciona esto con el sistema de configuración de .NET (`IConfiguration`)?',
        ],
        evaluates:
          'Tu manejo de strings, colecciones y errores en C#, y si escribís código claro y testeado para algo simple.',
      },
    ],
    'semi-senior': [
      {
        id: 'paginated-orders-ef-core',
        title: 'Listado paginado de órdenes con EF Core',
        duration: '45 min',
        statement: [
          'Tenemos las entidades `Customer`, `Order` y `OrderItem` en EF Core. `GET /orders?status=Paid&pageSize=20&cursor=...` tiene que devolver cada orden con el nombre del cliente, la cantidad de ítems y el total, en el formato `{ "items": [...], "nextCursor": "..." }`.',
          'La versión actual hace `ToListAsync()` de todas las órdenes y después filtra y calcula en memoria. Reescribila para que el filtrado, el cálculo y la paginación ocurran en la base.',
        ],
        requirements: [
          'Proyectá a un DTO con `Select` en vez de cargar entidades con `Include`.',
          'Usá `AsNoTracking` y explicá qué ganás.',
          'Implementá paginación por cursor sobre `CreatedAt` e `Id`, no con `Skip/Take`.',
          'Pasá el `CancellationToken` del request hasta la query.',
          'Validá `pageSize` entre 1 y 100.',
        ],
        followUps: [
          '¿Cómo ves el SQL que genera EF Core y cómo detectarías evaluación en el cliente?',
          '¿Qué índices crearías para esta query?',
          '¿Cuándo usarías Dapper o SQL crudo en vez de EF Core?',
        ],
        evaluates:
          'Que sepas usar EF Core de forma eficiente, entendiendo qué se ejecuta en la base y qué en memoria.',
      },
      {
        id: 'background-email-queue',
        title: 'Cola de emails en background con reintentos',
        duration: '45 min',
        statement: [
          'Un endpoint `POST /signup` tiene que responder rápido, pero también mandar un email de bienvenida que tarda hasta 3 segundos y a veces falla. Implementá una cola en memoria con `System.Threading.Channels` y un `BackgroundService` que la consuma.',
          'Los envíos fallidos se reintentan con backoff exponencial (1 s, 2 s, 4 s) hasta 3 veces; después se loguean como error con el id del usuario.',
        ],
        requirements: [
          'Usá un `Channel` acotado y definí qué pasa cuando se llena (`BoundedChannelFullMode`).',
          'El `BackgroundService` procesa hasta 4 emails en paralelo.',
          'El servicio de email es `Scoped` y el `BackgroundService` es singleton: resolvé el scope con `IServiceScopeFactory`.',
          'Respetá el `CancellationToken` del host para un apagado ordenado.',
          'Usá `ILogger` con logging estructurado.',
        ],
        followUps: [
          '¿Qué perdés si la app se reinicia con emails en la cola y cómo lo resolverías (outbox, Hangfire, una cola externa)?',
          '¿Cómo usarías Polly para los reintentos en vez de hacerlo a mano?',
          '¿Cómo testearías el `BackgroundService`?',
        ],
        evaluates:
          'Tu manejo de async, DI y procesamiento en background en .NET, incluyendo lifetimes y cancelación.',
      },
      {
        id: 'memory-cache-with-dedup',
        title: 'Cache con expiración y deduplicación de llamadas',
        duration: '45 min',
        statement: [
          'Un servicio llama a `GetExchangeRateAsync(string currency)`, que consulta una API externa lenta. Escribí un `CachedExchangeRateService` que envuelva al original (patrón decorator) y cachee cada cotización por 60 segundos.',
          'Si llegan 200 requests simultáneos para `USD` cuando el valor no está en cache, la API externa tiene que llamarse una sola vez y todos tienen que recibir el mismo resultado.',
        ],
        requirements: [
          'El decorator implementa la misma interfaz que el servicio original y se registra en DI sin cambiar a los consumidores.',
          'Usá `IMemoryCache` o un `ConcurrentDictionary` propio y justificá la elección.',
          'La deduplicación de llamadas concurrentes usa `Lazy<Task<T>>`, `SemaphoreSlim` o algo equivalente.',
          'Un error de la API no queda cacheado.',
          'No uses `.Result` ni `.Wait()` en ningún lado.',
        ],
        followUps: [
          '¿Por qué `GetOrCreateAsync` de `IMemoryCache` no evita por sí solo las llamadas duplicadas?',
          '¿Cuándo pasarías a `IDistributedCache` con Redis o a `HybridCache`?',
          '¿Qué riesgo de deadlock tiene `.Result` en código async?',
        ],
        evaluates:
          'Que entiendas async/await y concurrencia en .NET lo suficiente como para evitar condiciones de carrera y llamadas duplicadas.',
      },
    ],
    senior: [
      {
        id: 'idempotent-payments-endpoint',
        title: 'Endpoint de pagos idempotente',
        duration: '60 min',
        statement: [
          'Implementá `POST /payments` en ASP.NET Core con header `Idempotency-Key` y body `{ "amount": 2500.00, "currency": "ARS", "customerId": "c_42" }`. El endpoint llama a un `IPaymentGateway` externo que puede tardar varios segundos o hacer timeout.',
          'Un reintento con la misma key y el mismo body devuelve la respuesta original sin volver a cobrar; con otro body, `422`; si el original sigue en curso, `409`. Las keys se guardan en SQL Server o Postgres con EF Core.',
        ],
        requirements: [
          'La reserva de la key es atómica con un índice único; manejá la `DbUpdateException` por duplicado.',
          'Guardá hash del body, estado y respuesta serializada.',
          'Implementá la lógica como un endpoint filter o middleware reusable, no dentro del handler.',
          'Definí qué pasa con keys que quedan en `Processing` porque el proceso murió.',
          'Escribí un test de integración con `WebApplicationFactory` que envíe requests concurrentes con la misma key.',
        ],
        followUps: [
          '¿Cómo reconciliás un pago que el gateway procesó pero cuya respuesta nunca te llegó?',
          '¿Meterías la llamada al gateway dentro de una transacción de base? ¿Por qué no?',
          '¿Cómo limpiarías keys viejas sin bloquear la tabla?',
        ],
        evaluates:
          'Tu criterio para operaciones críticas: atomicidad, fallas parciales con terceros y diseño reusable dentro del pipeline de ASP.NET Core.',
      },
      {
        id: 'token-bucket-rate-limiter',
        title: 'Rate limiter por cliente',
        duration: '45 min',
        statement: [
          'Implementá desde cero un rate limiter con token bucket: cada API key tiene una capacidad de `N` tokens que se recargan a `R` tokens por segundo. Exponelo como middleware que responde `429` con `Retry-After` cuando no hay tokens.',
          'Después comparalo con el middleware de rate limiting que trae ASP.NET Core (`AddRateLimiter`) y explicá cómo lo llevarías a varias instancias con Redis.',
        ],
        requirements: [
          'El bucket se recarga de forma lazy según el tiempo transcurrido, sin timers por cliente.',
          'La operación de consumir un token es thread-safe sin un lock global para todos los clientes.',
          'Inyectá el reloj (`TimeProvider`) para poder testear sin esperar.',
          'Los buckets de clientes inactivos se liberan.',
          'Distintos planes de cliente tienen capacidades distintas, leídas de configuración.',
        ],
        followUps: [
          '¿Qué diferencia hay entre token bucket, fixed window y sliding window en ráfagas de tráfico?',
          '¿Cómo garantizás atomicidad en Redis?',
          '¿Qué hacés si Redis no responde?',
        ],
        evaluates:
          'Que sepas implementar un algoritmo concurrente correcto en .NET, testeable y con un plan claro para escalarlo.',
      },
      {
        id: 'order-workflow-design',
        title: 'Modelar el ciclo de vida de una orden',
        duration: '60 min',
        statement: [
          'Una orden pasa por los estados `Created`, `Paid`, `Shipped`, `Delivered` y `Cancelled`. Solo se puede cancelar antes del envío, solo se puede enviar si está pagada, y cada cambio de estado tiene que disparar efectos: emails, liberar stock, avisar a logística.',
          'Diseñá en C# el modelo de dominio y el servicio de aplicación para estas transiciones, de forma que las reglas no queden repartidas en controllers ni en `if` sueltos.',
        ],
        requirements: [
          'La entidad `Order` encapsula sus transiciones con métodos como `Pay()`, `Ship()` y `Cancel()`; el estado no tiene setter público.',
          'Una transición inválida devuelve un error de dominio claro (excepción propia o un tipo `Result`, justificá la elección).',
          'Los efectos se modelan como domain events que se despachan después de guardar, no dentro de la entidad.',
          'Explicá cómo garantizarías que los eventos no se pierdan si falla el envío después del commit (outbox).',
          'Escribí tests unitarios de las transiciones sin depender de la base.',
        ],
        followUps: [
          '¿Cómo manejarías dos requests concurrentes que intentan `Ship()` y `Cancel()` sobre la misma orden?',
          '¿Usarías una librería de state machine como Stateless? ¿Qué ganás y qué perdés?',
          '¿Cómo versionarías los eventos si otros servicios los consumen?',
        ],
        evaluates:
          'Tu capacidad de modelar un dominio con reglas claras, efectos desacoplados y consistencia ante concurrencia.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        why: 'El ejemplo clásico de usar un `Dictionary` para pasar de O(n²) a O(n), base de muchas preguntas.',
      },
      {
        slug: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        why: 'Contar frecuencias con un array o `Dictionary`, un patrón que se repite en cualquier agregación.',
      },
      {
        slug: 'roman-to-integer',
        title: 'Roman to Integer',
        difficulty: 'Easy',
        why: 'Recorrer un string con reglas simples, buen ejercicio para escribir lógica clara y sin errores de borde.',
      },
      {
        slug: 'merge-sorted-array',
        title: 'Merge Sorted Array',
        difficulty: 'Easy',
        why: 'Two pointers desde el final para fusionar in-place, un clásico que muestra si pensás en memoria.',
      },
      {
        slug: 'design-hashmap',
        title: 'Design HashMap',
        difficulty: 'Easy',
        why: 'Implementar un hash map con buckets te hace entender qué pasa dentro de un `Dictionary`.',
      },
      {
        slug: 'recyclable-and-low-fat-products',
        title: 'Recyclable and Low Fat Products',
        difficulty: 'Easy',
        why: 'Un `SELECT` con filtros combinados para empezar con SQL, que en backend siempre se evalúa.',
      },
      {
        slug: 'article-views-i',
        title: 'Article Views I',
        difficulty: 'Easy',
        why: 'Practica `DISTINCT` y `ORDER BY`, detalles que en una entrevista se olvidan fácil.',
      },
    ],
    'semi-senior': [
      {
        slug: 'longest-consecutive-sequence',
        title: 'Longest Consecutive Sequence',
        difficulty: 'Medium',
        why: 'Usar un `HashSet` para lograr O(n) donde lo obvio es ordenar, un salto de razonamiento muy evaluado.',
      },
      {
        slug: 'daily-temperatures',
        title: 'Daily Temperatures',
        difficulty: 'Medium',
        why: 'Introduce la pila monótona, útil para resolver "el próximo mayor" sobre series de datos.',
      },
      {
        slug: 'evaluate-reverse-polish-notation',
        title: 'Evaluate Reverse Polish Notation',
        difficulty: 'Medium',
        why: 'Evaluar expresiones con una pila, la base de cualquier parser o motor de reglas simple.',
      },
      {
        slug: 'my-calendar-i',
        title: 'My Calendar I',
        difficulty: 'Medium',
        why: 'Detectar superposición de reservas es un problema de negocio real; podés usar `SortedSet` o búsqueda binaria.',
      },
      {
        slug: 'print-in-order',
        title: 'Print in Order',
        difficulty: 'Easy',
        why: 'Primer contacto con sincronización entre threads en C# con `ManualResetEventSlim` o `SemaphoreSlim`.',
      },
      {
        slug: 'print-zero-even-odd',
        title: 'Print Zero Even Odd',
        difficulty: 'Medium',
        why: 'Coordinar tres threads que se pasan el turno, buen ejercicio para entender semáforos.',
      },
      {
        slug: 'monthly-transactions-i',
        title: 'Monthly Transactions I',
        difficulty: 'Medium',
        why: 'Agregación por mes con conteos condicionales, el tipo de query de reportes que pide cualquier negocio.',
      },
    ],
    senior: [
      {
        slug: 'lfu-cache',
        title: 'LFU Cache',
        difficulty: 'Hard',
        why: 'Mantener varias estructuras sincronizadas en O(1), una prueba exigente de diseño de estructuras de datos.',
      },
      {
        slug: 'find-median-from-data-stream',
        title: 'Find Median from Data Stream',
        difficulty: 'Hard',
        why: 'Dos heaps con `PriorityQueue` para una métrica en streaming, la idea detrás de percentiles en vivo.',
      },
      {
        slug: 'accounts-merge',
        title: 'Accounts Merge',
        difficulty: 'Medium',
        why: 'Union-find o DFS para unificar entidades duplicadas, un problema real de deduplicación de clientes.',
      },
      {
        slug: 'serialize-and-deserialize-binary-tree',
        title: 'Serialize and Deserialize Binary Tree',
        difficulty: 'Hard',
        why: 'Diseñar un formato de serialización y su parser, algo que como senior tenés que razonar con cuidado.',
      },
      {
        slug: 'fizz-buzz-multithreaded',
        title: 'Fizz Buzz Multithreaded',
        difficulty: 'Medium',
        why: 'Coordinar cuatro threads sobre un estado compartido, ideal para practicar `SemaphoreSlim` y `Monitor`.',
      },
      {
        slug: 'design-a-food-rating-system',
        title: 'Design a Food Rating System',
        difficulty: 'Medium',
        why: 'Combinar diccionarios con estructuras ordenadas y actualizaciones, como un ranking que cambia en vivo.',
      },
      {
        slug: 'department-top-three-salaries',
        title: 'Department Top Three Salaries',
        difficulty: 'Hard',
        why: 'Funciones de ventana como `DENSE_RANK` para el top N por grupo, una consulta que un senior debería dominar.',
      },
    ],
  },
};
