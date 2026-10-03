import type { TrackPractice } from './types';

export const javaPractice: TrackPractice = {
  track: 'java',
  exercises: {
    junior: [
      {
        id: 'products-rest-controller',
        title: 'Controller REST de productos con validación',
        duration: '45 min',
        statement: [
          'Con Spring Boot, armá un `ProductController` para un catálogo guardado en memoria (un `ConcurrentHashMap` alcanza). Un producto tiene `id` (Long), `name` (String), `price` (BigDecimal) y `stock` (int).',
          'Implementá `POST /products` que devuelve `201` con el producto creado y el header `Location`, `GET /products/{id}` y `PUT /products/{id}`. Si el body es inválido respondé `400` con un JSON como `{ "errors": { "price": "debe ser mayor a 0" } }`.',
        ],
        requirements: [
          'Usá un DTO de entrada (puede ser un `record`) con Bean Validation: `@NotBlank`, `@Positive`, `@PositiveOrZero`.',
          'Separá controller y service; el controller no tiene lógica de negocio.',
          'Un `id` inexistente lanza una excepción propia que se traduce a `404` en un `@RestControllerAdvice`.',
          'Los errores de validación se devuelven con el formato pedido, no el default de Spring.',
          'Generá los `id` de forma segura ante requests concurrentes (por ejemplo con `AtomicLong`).',
        ],
        followUps: [
          '¿Qué diferencia hay entre `PUT` y `PATCH` y cómo implementarías el segundo?',
          '¿Cómo lo testearías con `@WebMvcTest` y `MockMvc`?',
          '¿Qué cambia si pasás a JPA con una entidad `Product`? ¿Expondrías la entidad directamente?',
        ],
        evaluates:
          'Que conozcas las piezas básicas de Spring Boot (controllers, DTOs, validación, manejo global de errores) y las uses con orden.',
      },
      {
        id: 'student-grades-streams',
        title: 'Reporte de notas con Streams',
        duration: '30 min',
        statement: [
          'Tenés una `List<Grade>` donde `Grade` es `record Grade(String student, String subject, int score)`. Escribí métodos que devuelvan: el promedio por alumno como `Map<String, Double>`, los alumnos con alguna nota menor a 4 y la materia con mejor promedio.',
          'Por ejemplo, con `[("ana", "math", 8), ("ana", "history", 3), ("juan", "math", 6)]`, el promedio de `ana` es `5.5`, la lista de alumnos con aplazos es `["ana"]` y la mejor materia es `math` con `7.0`.',
        ],
        requirements: [
          'Resolvelo con la API de Streams (`groupingBy`, `averagingInt`, `filter`, `max`).',
          'La lista de alumnos con aplazos no tiene repetidos y está ordenada alfabéticamente.',
          'Manejá la lista vacía devolviendo `Optional` donde corresponda, sin `null`.',
          'No mutes la lista de entrada.',
        ],
        followUps: [
          '¿Cuándo preferís un `for` clásico frente a un stream?',
          '¿Qué pasa si usás `parallelStream()` acá? ¿Conviene?',
          '¿Cómo harías que el `Map` del resultado mantenga el orden alfabético?',
        ],
        evaluates:
          'Tu manejo de colecciones y Streams en Java moderno, y si sabés evitar `null` con `Optional`.',
      },
      {
        id: 'bank-account-model',
        title: 'Modelar una cuenta bancaria',
        duration: '30 min',
        statement: [
          'Modelá una clase `BankAccount` con titular, número de cuenta y saldo. Tiene que permitir `deposit(amount)`, `withdraw(amount)` y `transferTo(other, amount)`, y guardar un historial de movimientos consultable.',
          'Un retiro o transferencia sin fondos suficientes lanza `InsufficientFundsException`. Los montos negativos o cero lanzan `IllegalArgumentException`.',
        ],
        requirements: [
          'Usá `BigDecimal` para el saldo y explicá por qué no `double`.',
          'El saldo no tiene setter público; solo cambia a través de las operaciones.',
          'El historial se expone como una lista inmutable (`List.copyOf` o `Collections.unmodifiableList`).',
          'Decidí si `InsufficientFundsException` es checked o unchecked y justificalo.',
          'Escribí tests con JUnit 5 para los casos de error.',
        ],
        followUps: [
          '¿Qué pasa si dos threads retiran de la misma cuenta al mismo tiempo?',
          '¿Cómo evitarías un deadlock si dos transferencias cruzadas se ejecutan en paralelo?',
          '¿Implementarías `equals` y `hashCode`? ¿Basados en qué campos?',
        ],
        evaluates:
          'Tus bases de orientación a objetos en Java: encapsulamiento, inmutabilidad, excepciones y tipos adecuados para dinero.',
      },
    ],
    'semi-senior': [
      {
        id: 'paginated-orders-jpa',
        title: 'Listado de órdenes con JPA sin N+1',
        duration: '45 min',
        statement: [
          'Tenemos las entidades JPA `Customer`, `Order` (con `@ManyToOne` a `Customer` y `@OneToMany` a `OrderItem`) y `OrderItem`. El endpoint `GET /orders?status=PAID&page=0&size=20` devuelve cada orden con el nombre del cliente y sus ítems, y en producción dispara cientos de queries.',
          'Reescribí el repository, el service y el DTO de respuesta para que la cantidad de queries sea constante y la respuesta sea `{ "content": [...], "page": 0, "size": 20, "totalElements": 1234 }`.',
        ],
        requirements: [
          'Usá `Pageable` de Spring Data y un DTO de salida, sin serializar entidades.',
          'Resolvé el N+1 con `@EntityGraph`, `JOIN FETCH` o una proyección, y explicá el problema de combinar `JOIN FETCH` de colecciones con paginación.',
          'El service es `@Transactional(readOnly = true)`.',
          'Validá `size` con un máximo de 100.',
          'Mostrá cómo verificarías la cantidad de queries (logs de Hibernate o un test).',
        ],
        followUps: [
          '¿Qué es `LazyInitializationException` y por qué aparece con open-in-view desactivado?',
          '¿Cuándo pasarías a paginación por cursor?',
          '¿Qué índices crearías para este listado?',
        ],
        evaluates:
          'Que entiendas cómo JPA y Hibernate generan SQL y puedas diagnosticar y resolver problemas de performance comunes.',
      },
      {
        id: 'thread-safe-lru-cache',
        title: 'Cache LRU thread-safe con TTL',
        duration: '45 min',
        statement: [
          'Implementá `LruCache<K, V>` con capacidad máxima y TTL por entrada. `get(key)` devuelve `Optional<V>` y actualiza el orden de uso; `put(key, value)` inserta y, si se supera la capacidad, desaloja la entrada usada menos recientemente.',
          'El cache se usa desde varios threads de un servidor web al mismo tiempo, así que tiene que ser seguro ante concurrencia sin bloquear más de lo necesario.',
        ],
        requirements: [
          'Primero resolvelo extendiendo `LinkedHashMap` con `removeEldestEntry` y después explicá cómo lo harías a mano con hash map y lista doblemente enlazada.',
          'Las entradas vencidas no se devuelven nunca.',
          'Usá `ReentrantReadWriteLock`, `synchronized` o una estructura concurrente y justificá la elección.',
          'Las operaciones son O(1) en promedio.',
        ],
        followUps: [
          '¿Por qué un `get` en un LRU no es una operación de solo lectura y qué implica para el lock?',
          '¿Cuándo usarías Caffeine o el cache de Spring (`@Cacheable`) en vez de esto?',
          '¿Cómo medirías el hit rate?',
        ],
        evaluates:
          'Tu dominio de colecciones y concurrencia en Java, y si entendés el costo real de cada estrategia de sincronización.',
      },
      {
        id: 'parallel-price-aggregator',
        title: 'Agregador de precios con CompletableFuture',
        duration: '45 min',
        statement: [
          'Un comparador de vuelos consulta 5 proveedores externos con `ProviderClient.search(query)`, que tarda entre 200 ms y 3 segundos y a veces falla. Escribí un `PriceAggregator.search(query)` que consulte a todos en paralelo y devuelva las ofertas combinadas, ordenadas por precio.',
          'La respuesta total no puede tardar más de 2 segundos: lo que no llegó a tiempo se descarta y se informa qué proveedores faltaron, por ejemplo `{ "offers": [...], "missingProviders": ["acme"] }`.',
        ],
        requirements: [
          'Usá `CompletableFuture` con un `Executor` propio, no el common pool.',
          'Aplicá un timeout por proveedor con `orTimeout` o `completeOnTimeout`.',
          'Un proveedor que falla no rompe la respuesta de los demás.',
          'Combiná resultados con `allOf` o una alternativa equivalente.',
          'Explicá cómo dimensionarías el pool de threads.',
        ],
        followUps: [
          '¿Qué cambia si usás virtual threads de Java 21?',
          '¿Cómo agregarías un circuit breaker con Resilience4j para un proveedor que falla seguido?',
          '¿Cómo lo testearías sin depender de tiempos reales?',
        ],
        evaluates:
          'Tu manejo de programación concurrente con futures en Java: timeouts, aislamiento de fallas y uso responsable de threads.',
      },
    ],
    senior: [
      {
        id: 'idempotent-transfer-endpoint',
        title: 'Transferencias idempotentes y consistentes',
        duration: '60 min',
        statement: [
          'Implementá en Spring Boot `POST /transfers` con body `{ "fromAccount": "A", "toAccount": "B", "amount": 1500.00 }` y header `Idempotency-Key`. Las cuentas están en Postgres con JPA y la transferencia tiene que debitar y acreditar de forma atómica.',
          'Reintentos con la misma key y el mismo body devuelven la respuesta original sin duplicar el movimiento; con otro body, `422`; si el original sigue en curso, `409`. Además, dos transferencias concurrentes desde la misma cuenta no pueden dejar saldo negativo.',
        ],
        requirements: [
          'Guardá las keys con un constraint único y decidí si se registran en la misma transacción que el movimiento.',
          'Evitá condiciones de carrera sobre el saldo con locking pesimista (`@Lock(PESSIMISTIC_WRITE)`) u optimista (`@Version`) y justificá la elección.',
          'Bloqueá las cuentas en un orden determinista para evitar deadlocks.',
          'Las validaciones de negocio devuelven errores claros: saldo insuficiente, cuenta inexistente, misma cuenta.',
          'Escribí un test de integración (por ejemplo con Testcontainers) que dispare transferencias concurrentes.',
        ],
        followUps: [
          '¿Cómo manejás el reintento cuando falla el locking optimista?',
          '¿Qué cambia si las cuentas viven en dos microservicios distintos? ¿Saga, outbox?',
          '¿Qué nivel de aislamiento de transacción usarías y por qué?',
        ],
        evaluates:
          'Tu criterio con transacciones, concurrencia en la base e idempotencia, que es lo que separa una API que funciona de una que no pierde plata.',
      },
      {
        id: 'bounded-worker-pool',
        title: 'Pool de workers con cola acotada y reintentos',
        duration: '60 min',
        statement: [
          'Sin usar `ExecutorService`, implementá un `WorkerPool` con `N` threads que toman tareas de una cola acotada. `submit(task)` bloquea si la cola está llena, o falla después de un timeout configurable. Las tareas que lanzan excepción se reintentan hasta 3 veces y después van a una lista de fallidas.',
          'El pool tiene que soportar `shutdown()` (no acepta nuevas tareas y termina las encoladas) y `shutdownNow()` (interrumpe los workers y devuelve las pendientes).',
        ],
        requirements: [
          'Usá `BlockingQueue` o implementá la cola con `ReentrantLock` y `Condition`.',
          'Respetá la interrupción de threads: no tragues `InterruptedException`.',
          'Los contadores de completadas y fallidas son thread-safe (`AtomicInteger` o `LongAdder`).',
          'Un worker que muere por una excepción inesperada no reduce el tamaño del pool.',
          'Explicá qué garantías de visibilidad de memoria te da cada primitiva que usaste.',
        ],
        followUps: [
          '¿En qué se diferencia tu solución de `ThreadPoolExecutor` y su `RejectedExecutionHandler`?',
          '¿Cómo cambiaría el diseño con virtual threads?',
          '¿Cómo detectarías un worker trabado?',
        ],
        evaluates:
          'Un entendimiento profundo del modelo de concurrencia de Java: locks, condiciones, interrupciones y el Java Memory Model.',
      },
      {
        id: 'sliding-window-rate-limiter',
        title: 'Rate limiter distribuido como filtro',
        duration: '45 min',
        statement: [
          'Implementá un `OncePerRequestFilter` de Spring que limite cada cliente (identificado por el header `X-Api-Key`) a una cantidad de requests por minuto que depende de su plan: `FREE` 60, `PRO` 600. Al excederse, respondé `429` con `Retry-After`.',
          'Definí una interfaz `RateLimiter` con una implementación en memoria para tests y otra basada en Redis para producción, con varias instancias de la app.',
        ],
        requirements: [
          'Elegí el algoritmo (token bucket, sliding window log o sliding window counter) y explicá sus trade-offs.',
          'La implementación en memoria es thread-safe y no acumula claves de clientes inactivos para siempre.',
          'En Redis, chequear e incrementar es atómico (script Lua o comandos atómicos).',
          'El filtro no aplica a rutas excluidas como `/actuator/health`.',
          'Agregá los headers `X-RateLimit-Limit` y `X-RateLimit-Remaining`.',
        ],
        followUps: [
          '¿Qué hacés si Redis está caído: fail open o fail closed?',
          '¿Lo pondrías en la app o en el API gateway?',
          '¿Cómo testearías el comportamiento en el borde de la ventana?',
        ],
        evaluates:
          'Tu capacidad para diseñar un componente transversal, elegir un algoritmo con criterio y llevarlo a un entorno distribuido.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        why: 'El ejemplo clásico de usar un `HashMap` para pasar de O(n²) a O(n), base de muchas preguntas.',
      },
      {
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        why: 'Practica una pila con `Deque` en vez de la vieja clase `Stack`, detalle que muchos entrevistadores miran.',
      },
      {
        slug: 'merge-two-sorted-lists',
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        why: 'Manipular referencias en listas enlazadas es un clásico de entrevistas Java para juniors.',
      },
      {
        slug: 'isomorphic-strings',
        title: 'Isomorphic Strings',
        difficulty: 'Easy',
        why: 'Mantener dos mapas consistentes entrena el uso cuidadoso de `Map` y sus casos borde.',
      },
      {
        slug: 'move-zeroes',
        title: 'Move Zeroes',
        difficulty: 'Easy',
        why: 'Two pointers in-place sobre arrays, un patrón simple que muestra si pensás en memoria.',
      },
      {
        slug: 'employees-earning-more-than-their-managers',
        title: 'Employees Earning More Than Their Managers',
        difficulty: 'Easy',
        why: 'Un self join, la consulta que más se suele preguntar para ver si entendés los `JOIN`.',
      },
      {
        slug: 'rising-temperature',
        title: 'Rising Temperature',
        difficulty: 'Easy',
        why: 'Comparar filas por fecha con un join, práctica útil para consultas sobre series temporales.',
      },
    ],
    'semi-senior': [
      {
        slug: '3sum',
        title: '3Sum',
        difficulty: 'Medium',
        why: 'Ordenar más two pointers y manejar duplicados, una pregunta muy repetida en entrevistas Java.',
      },
      {
        slug: 'number-of-islands',
        title: 'Number of Islands',
        difficulty: 'Medium',
        why: 'BFS o DFS sobre una grilla, la puerta de entrada a todos los problemas de grafos.',
      },
      {
        slug: 'min-stack',
        title: 'Min Stack',
        difficulty: 'Medium',
        why: 'Diseñar una estructura con una operación extra en O(1) entrena pensar invariantes.',
      },
      {
        slug: 'kth-largest-element-in-an-array',
        title: 'Kth Largest Element in an Array',
        difficulty: 'Medium',
        why: 'Practica `PriorityQueue` y te hace comparar heap contra quickselect.',
      },
      {
        slug: 'print-foobar-alternately',
        title: 'Print FooBar Alternately',
        difficulty: 'Medium',
        why: 'Coordinar dos threads con `Semaphore` o `wait/notify` es una pregunta de concurrencia muy común en Java.',
      },
      {
        slug: 'managers-with-at-least-5-direct-reports',
        title: 'Managers with at Least 5 Direct Reports',
        difficulty: 'Medium',
        why: '`GROUP BY` con `HAVING` sobre una relación jerárquica, típico de consultas de reportes.',
      },
      {
        slug: 'nth-highest-salary',
        title: 'Nth Highest Salary',
        difficulty: 'Medium',
        why: 'Practica `DENSE_RANK`, `LIMIT/OFFSET` y el manejo de `NULL` cuando no hay resultado.',
      },
    ],
    senior: [
      {
        slug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        why: 'La pregunta de diseño de estructuras más frecuente; en Java además te preguntan por `LinkedHashMap`.',
      },
      {
        slug: 'merge-k-sorted-lists',
        title: 'Merge k Sorted Lists',
        difficulty: 'Hard',
        why: 'Fusionar k fuentes ordenadas con `PriorityQueue`, como combinar resultados de varias particiones.',
      },
      {
        slug: 'word-ladder',
        title: 'Word Ladder',
        difficulty: 'Hard',
        why: 'BFS sobre un grafo implícito, entrena modelar un problema como grafo antes de codear.',
      },
      {
        slug: 'insert-delete-getrandom-o1',
        title: 'Insert Delete GetRandom O(1)',
        difficulty: 'Medium',
        why: 'Combinar `HashMap` y `ArrayList` para cumplir varias operaciones O(1) a la vez.',
      },
      {
        slug: 'the-dining-philosophers',
        title: 'The Dining Philosophers',
        difficulty: 'Medium',
        why: 'El problema clásico de deadlock; te obliga a explicar orden de locks y starvation.',
      },
      {
        slug: 'building-h2o',
        title: 'Building H2O',
        difficulty: 'Medium',
        why: 'Sincronizar grupos de threads con `Semaphore` y `CyclicBarrier`, un ejercicio exigente de coordinación.',
      },
      {
        slug: 'trips-and-users',
        title: 'Trips and Users',
        difficulty: 'Hard',
        why: 'Varios `JOIN`, filtros y agregación condicional en una sola consulta, como un reporte de negocio real.',
      },
    ],
  },
};
