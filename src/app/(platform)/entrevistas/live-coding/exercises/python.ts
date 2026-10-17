import type { TrackPractice } from './types';

export const pythonPractice: TrackPractice = {
  track: 'python',
  exercises: {
    junior: [
      {
        id: 'books-fastapi-endpoint',
        title: 'API de libros con FastAPI y Pydantic',
        duration: '45 min',
        statement: [
          'Armá con FastAPI una API para un catálogo de libros guardado en memoria (un `dict` alcanza). Un libro es `{ "id": int, "title": str, "author": str, "year": int, "isbn": str }`.',
          'Implementá `POST /books` que devuelve `201` con el libro creado, `GET /books` con un filtro opcional `?author=` y `GET /books/{id}`. Si el body no cumple las reglas, FastAPI tiene que responder `422` con el detalle del error.',
        ],
        requirements: [
          'Definí modelos de Pydantic separados para la entrada (`BookCreate`) y la salida (`Book`).',
          '`title` y `author` no pueden estar vacíos; `year` está entre 1450 y el año actual.',
          'No se pueden crear dos libros con el mismo `isbn`: respondé `409`.',
          'Un `id` inexistente devuelve `404` usando `HTTPException`.',
          'El filtro por autor no distingue mayúsculas de minúsculas.',
        ],
        followUps: [
          '¿Qué diferencia hay entre el `422` que da FastAPI y un `400` que devolvés vos?',
          '¿Cómo lo testearías con `TestClient` y pytest?',
          '¿Cómo lo harías en Django REST Framework? ¿Qué pieza cumple el rol de Pydantic?',
        ],
        evaluates:
          'Que sepas armar un endpoint simple con validación declarativa, status codes correctos y manejo de errores en el framework.',
      },
      {
        id: 'word-frequency',
        title: 'Palabras más frecuentes de un texto',
        duration: '30 min',
        statement: [
          'Escribí una función `top_words(text: str, n: int) -> list[tuple[str, int]]` que devuelva las `n` palabras más frecuentes de un texto con su cantidad de apariciones.',
          'Por ejemplo, `top_words("El perro y el gato. ¡El perro!", 2)` devuelve `[("el", 3), ("perro", 2)]`. Las palabras se comparan en minúsculas e ignorando signos de puntuación; ante un empate, van en orden alfabético.',
        ],
        requirements: [
          'Usá estructuras de la biblioteca estándar como `collections.Counter` o un `dict`.',
          'Respetá el desempate alfabético.',
          'Si `n` es mayor que la cantidad de palabras distintas, devolvé todas.',
          'Agregá type hints y al menos tres tests con pytest, incluyendo el texto vacío.',
        ],
        followUps: [
          '¿Cómo lo resolverías si el texto es un archivo de 10 GB?',
          '¿Qué complejidad tiene ordenar todo frente a usar `heapq.nlargest`?',
          '¿Cómo ignorarías palabras comunes como "el", "y" o "de"?',
        ],
        evaluates:
          'Tu manejo idiomático de strings, diccionarios y la biblioteca estándar de Python, además de pensar en casos borde.',
      },
      {
        id: 'csv-sales-report',
        title: 'Reporte de ventas desde un CSV',
        duration: '30 min',
        statement: [
          'Recibís un CSV `sales.csv` con columnas `date,product,quantity,unit_price` (por ejemplo `2024-03-01,teclado,2,15000.50`). Escribí una función que lo lea y devuelva un diccionario con el total facturado por mes, en el formato `{ "2024-03": 31001.0, "2024-04": 12000.0 }`.',
          'Algunas filas vienen rotas: cantidad vacía, precio con texto o fecha inválida. Esas filas no tienen que cortar el proceso.',
        ],
        requirements: [
          'Leé el archivo con el módulo `csv` y un context manager (`with open(...)`).',
          'Las filas inválidas se saltean y se informa cuántas fueron, con `logging` y no con `print`.',
          'Usá `Decimal` para los montos y justificá por qué.',
          'Los meses del resultado quedan ordenados cronológicamente.',
        ],
        followUps: [
          '¿Cómo lo harías con pandas y cuándo te conviene frente a la biblioteca estándar?',
          '¿Qué cambia si el archivo no entra en memoria?',
          '¿Cómo harías para que el reporte también devuelva el producto más vendido por mes?',
        ],
        evaluates:
          'Que sepas leer y limpiar datos reales con la biblioteca estándar, manejando errores y precisión numérica.',
      },
    ],
    'semi-senior': [
      {
        id: 'paginated-orders-django',
        title: 'Listado paginado de órdenes sin N+1',
        duration: '45 min',
        statement: [
          'En un proyecto Django tenemos los modelos `Customer(name, email)`, `Order(customer, created_at, status)` y `OrderItem(order, product_name, quantity, unit_price)`. El endpoint `GET /api/orders` devuelve cada orden con el nombre del cliente, sus ítems y el total, y hoy tarda varios segundos.',
          'Reescribí la vista (podés usar Django REST Framework) para que soporte `?status=paid&page_size=20&cursor=...` y que la cantidad de queries no dependa de cuántas órdenes devuelve.',
        ],
        requirements: [
          'Usá `select_related` y `prefetch_related` donde corresponda y explicá la diferencia.',
          'Calculá el total con una anotación en la base (`annotate` con `Sum` y `F`), no en Python.',
          'Implementá paginación por cursor ordenada por `created_at` descendente.',
          'Validá `page_size` entre 1 y 100.',
          'Mostrá cómo verificarías la cantidad de queries en un test (`assertNumQueries` o `django_assert_num_queries`).',
        ],
        followUps: [
          '¿Qué índices agregarías y cómo lo confirmarías con `EXPLAIN`?',
          '¿Cuándo preferís `values()` en vez de instancias completas de modelos?',
          '¿Cómo lo resolverías con SQLAlchemy en una app FastAPI?',
        ],
        evaluates:
          'Tu conocimiento del ORM más allá de lo básico: detectar y resolver N+1, empujar cálculos a la base y paginar bien.',
      },
      {
        id: 'ttl-cache-decorator',
        title: 'Decorador de cache con TTL',
        duration: '45 min',
        statement: [
          'Escribí un decorador `@ttl_cache(seconds=60, maxsize=1000)` que cachee el resultado de una función según sus argumentos y lo invalide pasado el TTL. Tiene que funcionar tanto con funciones normales como con `async def`.',
          'Por ejemplo, si decorás `async def get_user(user_id: int)`, dos llamadas con `user_id=1` dentro del mismo minuto ejecutan la función una sola vez.',
        ],
        requirements: [
          'Usá `functools.wraps` para conservar el nombre y el docstring de la función.',
          'La clave contempla args y kwargs; explicá qué pasa con argumentos no hasheables.',
          'Cuando se supera `maxsize`, se descarta la entrada menos usada recientemente (podés usar `OrderedDict`).',
          'Para funciones async, cacheá el resultado y no la corrutina.',
          'Exponé un método `cache_clear()` en la función decorada.',
        ],
        followUps: [
          '¿Es thread-safe tu implementación? ¿Qué cambiarías para usarla con varios threads?',
          '¿Cómo evitarías que 50 llamadas async simultáneas con la misma clave ejecuten la función 50 veces?',
          '¿Por qué no alcanza con `functools.lru_cache`?',
        ],
        evaluates:
          'Que domines decoradores, closures y la diferencia entre código sync y async en Python, con criterio sobre memoria y concurrencia.',
      },
      {
        id: 'concurrent-url-checker',
        title: 'Chequeo concurrente de URLs con límite',
        duration: '45 min',
        statement: [
          'Tenemos una lista de 5.000 URLs de webhooks de clientes y queremos saber cuáles responden. Escribí `async def check_urls(urls: list[str], max_concurrency: int = 50) -> dict[str, int | str]` que haga un `GET` a cada una y devuelva el status code o el tipo de error.',
          'Por ejemplo: `{ "https://a.com/hook": 200, "https://b.com/hook": "timeout", "https://c.com/hook": 503 }`. Podés usar `httpx` o `aiohttp`.',
        ],
        requirements: [
          'Nunca hay más de `max_concurrency` requests en vuelo; usá `asyncio.Semaphore` o un pool de workers con `asyncio.Queue`.',
          'Cada request tiene timeout de 5 segundos.',
          'Un error en una URL no cancela las demás.',
          'Reusá un único cliente HTTP para todas las requests.',
          'Explicá por qué `asyncio` encaja mejor que threads o procesos para este caso.',
        ],
        followUps: [
          '¿Qué pasa si dentro de la corrutina llamás a `requests.get`?',
          '¿Cómo agregarías reintentos con backoff solo para errores de red?',
          '¿Cómo lo resolverías con `concurrent.futures.ThreadPoolExecutor` y qué cambia?',
        ],
        evaluates:
          'Tu manejo de `asyncio` en un caso de I/O real: límites de concurrencia, timeouts y aislamiento de errores.',
      },
    ],
    senior: [
      {
        id: 'idempotent-payments-fastapi',
        title: 'Endpoint de pagos idempotente en FastAPI',
        duration: '60 min',
        statement: [
          'Implementá `POST /payments` en FastAPI. El cliente envía el header `Idempotency-Key` y el body `{ "amount": "100.00", "currency": "ARS", "customer_id": "c_123" }`. El endpoint llama a un proveedor externo que puede tardar o fallar.',
          'Un reintento con la misma key y el mismo body debe devolver la respuesta original sin volver a cobrar; con la misma key y otro body, `422`; si el primero sigue en curso, `409`. Usá Postgres con SQLAlchemy (podés escribir el schema y las queries).',
        ],
        requirements: [
          'La reserva de la key es atómica (`INSERT ... ON CONFLICT DO NOTHING` o constraint único), sin carreras entre dos workers.',
          'Guardá el hash del body, el estado y la respuesta serializada.',
          'Resolvé la lógica de idempotencia como una dependencia o un servicio reusable, no mezclada en el handler.',
          'Definí qué pasa con keys que quedaron en `processing` porque el proceso murió.',
          'Escribí al menos un test que dispare dos requests concurrentes con la misma key.',
        ],
        followUps: [
          '¿Cómo te enterás si el proveedor cobró aunque vos hayas recibido un timeout?',
          '¿Usarías una transacción que envuelva la llamada al proveedor? ¿Por qué no?',
          '¿Cómo limpiarías las keys viejas sin afectar la performance de la tabla?',
        ],
        evaluates:
          'Tu criterio para operaciones críticas: atomicidad en la base, fallas parciales con terceros y código testeable.',
      },
      {
        id: 'worker-pool-with-retries',
        title: 'Worker pool con reintentos y dead letter queue',
        duration: '60 min',
        statement: [
          'Implementá un procesador de jobs en Python sin Celery: una clase `JobRunner` que recibe jobs `{ "id": str, "type": str, "payload": dict, "attempts": int }`, los reparte entre `N` workers y ejecuta el handler registrado para cada `type`.',
          'Los jobs que fallan se reintentan con backoff exponencial hasta `max_attempts`; después van a una dead letter queue. Elegí si lo hacés con `asyncio` o con threads y justificalo según el tipo de trabajo.',
        ],
        requirements: [
          'Usá una cola de la biblioteca estándar (`asyncio.Queue` o `queue.Queue`) como cola de trabajo.',
          'El reintento con delay no bloquea a un worker mientras espera.',
          'Implementá un shutdown ordenado: dejar de aceptar jobs, terminar los en curso y devolver los pendientes.',
          'Exponé métricas simples: procesados, fallidos y en la dead letter queue.',
          'Un handler que excede su timeout cuenta como intento fallido.',
        ],
        followUps: [
          '¿Qué cambia si los jobs son CPU-bound? ¿Cómo afecta el GIL?',
          '¿Cómo garantizarías at-least-once si el proceso muere a mitad de un job?',
          '¿En qué casos lo reemplazarías por Celery, RQ o una tabla con `SKIP LOCKED`?',
        ],
        evaluates:
          'Que entiendas el modelo de concurrencia de Python y puedas diseñar un procesamiento en background robusto ante fallas.',
      },
      {
        id: 'pricing-rules-engine',
        title: 'Motor de reglas de precios extensible',
        duration: '60 min',
        statement: [
          'Un e-commerce calcula el precio final de un carrito aplicando promociones: "2x1 en el producto X", "10% off en la categoría Y si el carrito supera $50.000" y "envío gratis para clientes premium". Hoy es un `if` gigante y cada promo nueva rompe algo.',
          'Diseñá en código un módulo que reciba un carrito `{ "items": [{ "sku": str, "category": str, "price": Decimal, "qty": int }], "customer_tier": str }` y una lista de reglas, y devuelva el total y el detalle de descuentos aplicados.',
        ],
        requirements: [
          'Cada regla es una clase o función independiente con una interfaz común (`Protocol` o clase abstracta).',
          'Agregar una regla nueva no requiere modificar las existentes ni el motor.',
          'Definí cómo se resuelve el orden y la combinación de reglas: acumulables, excluyentes o con prioridad.',
          'El resultado es explicable: lista de reglas aplicadas con el monto que descontó cada una.',
          'Usá `Decimal` y tipado estricto; escribí tests para al menos dos reglas combinadas.',
        ],
        followUps: [
          '¿Cómo harías para que negocio configure reglas sin deploy (por ejemplo desde la base)?',
          '¿Cómo evitarías que una combinación de reglas deje un precio negativo?',
          '¿Qué patrones de diseño reconocés en tu solución?',
        ],
        evaluates:
          'Tu capacidad de modelar un dominio cambiante con código extensible, testeable y fácil de leer.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        why: 'El ejemplo clásico de usar un `dict` para pasar de O(n²) a O(n), base de muchas otras preguntas.',
      },
      {
        slug: 'contains-duplicate',
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        why: 'Practica cuándo un `set` resuelve en una línea lo que con listas sería lento.',
      },
      {
        slug: 'valid-palindrome',
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        why: 'Introduce two pointers y limpieza de strings, dos cosas que vas a usar seguido.',
      },
      {
        slug: 'majority-element',
        title: 'Majority Element',
        difficulty: 'Easy',
        why: 'Se resuelve con `Counter` y abre la puerta a discutir una solución O(1) en memoria.',
      },
      {
        slug: 'ransom-note',
        title: 'Ransom Note',
        difficulty: 'Easy',
        why: 'Comparar conteos de caracteres es un ejercicio rápido para mostrar Python idiomático.',
      },
      {
        slug: 'big-countries',
        title: 'Big Countries',
        difficulty: 'Easy',
        why: 'Un primer `SELECT` con `WHERE` y `OR` para calentar SQL, que en backend siempre aparece.',
      },
      {
        slug: 'duplicate-emails',
        title: 'Duplicate Emails',
        difficulty: 'Easy',
        why: 'Practica `GROUP BY` con `HAVING`, la forma estándar de encontrar duplicados en una tabla.',
      },
    ],
    'semi-senior': [
      {
        slug: 'top-k-frequent-elements',
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        why: 'Combina `Counter` con `heapq`, el patrón para rankings y reportes de "los más usados".',
      },
      {
        slug: 'product-of-array-except-self',
        title: 'Product of Array Except Self',
        difficulty: 'Medium',
        why: 'Entrena prefijos y sufijos acumulados, un truco que reaparece en agregaciones sobre series.',
      },
      {
        slug: 'insert-interval',
        title: 'Insert Interval',
        difficulty: 'Medium',
        why: 'Manejar intervalos ordenados es lo que hacés al validar reservas o turnos superpuestos.',
      },
      {
        slug: 'subarray-sum-equals-k',
        title: 'Subarray Sum Equals K',
        difficulty: 'Medium',
        why: 'Suma de prefijos con hash map, un patrón que sorprende si no lo practicaste antes.',
      },
      {
        slug: 'print-in-order',
        title: 'Print in Order',
        difficulty: 'Easy',
        why: 'Primer contacto con sincronización entre threads usando `threading.Event` o `Lock`.',
      },
      {
        slug: 'print-foobar-alternately',
        title: 'Print FooBar Alternately',
        difficulty: 'Medium',
        why: 'Coordinar dos threads que se turnan obliga a entender semáforos y condiciones.',
      },
      {
        slug: 'game-play-analysis-iv',
        title: 'Game Play Analysis IV',
        difficulty: 'Medium',
        why: 'Una consulta de retención con fechas y subconsultas, típica de métricas de producto.',
      },
    ],
    senior: [
      {
        slug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        why: 'Diseñar un cache O(1) con hash map y lista enlazada (o `OrderedDict`) es una pregunta casi obligada.',
      },
      {
        slug: 'find-median-from-data-stream',
        title: 'Find Median from Data Stream',
        difficulty: 'Hard',
        why: 'Dos heaps para mantener una métrica en streaming, la misma idea que calcular percentiles en vivo.',
      },
      {
        slug: 'network-delay-time',
        title: 'Network Delay Time',
        difficulty: 'Medium',
        why: 'Dijkstra con `heapq`, útil para razonar sobre propagación en redes y grafos de servicios.',
      },
      {
        slug: 'minimum-window-substring',
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        why: 'El sliding window más exigente, prueba si podés mantener invariantes con varios contadores.',
      },
      {
        slug: 'building-h2o',
        title: 'Building H2O',
        difficulty: 'Medium',
        why: 'Sincronizar grupos de threads con semáforos y barreras, como coordinar workers que dependen entre sí.',
      },
      {
        slug: 'task-scheduler',
        title: 'Task Scheduler',
        difficulty: 'Medium',
        why: 'Planificar tareas con cooldown usando heap y conteos, muy cercano a schedulers de jobs reales.',
      },
      {
        slug: 'department-top-three-salaries',
        title: 'Department Top Three Salaries',
        difficulty: 'Hard',
        why: 'Funciones de ventana como `DENSE_RANK` para obtener el top N por grupo, algo que todo senior debería escribir de memoria.',
      },
    ],
  },
};
