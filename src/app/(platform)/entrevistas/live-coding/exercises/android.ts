import type { TrackPractice } from './types';

export const androidPractice: TrackPractice = {
  track: 'android',
  exercises: {
    junior: [
      {
        id: 'lista-con-busqueda-compose',
        title: 'Lista de contactos con búsqueda en Compose',
        duration: '30 min',
        statement: [
          'Tenés una lista de contactos `data class Contact(val id: Long, val name: String, val phone: String)`. Armá una pantalla en Jetpack Compose con un `TextField` de búsqueda arriba y la lista de contactos abajo, ordenada alfabéticamente.',
          'Al escribir, la lista se filtra por nombre o teléfono. Los datos están hardcodeados en un `ViewModel`; no hace falta red ni base de datos.',
        ],
        requirements: [
          'Usá `LazyColumn` con `key = { it.id }` en `items`.',
          'El estado de la búsqueda se eleva (state hoisting): la pantalla recibe el texto y un callback, no lo guarda adentro.',
          'El texto de búsqueda sobrevive a la rotación de pantalla.',
          'El filtro ignora mayúsculas y minúsculas.',
          'Mostrá un mensaje cuando no hay resultados.',
        ],
        followUps: [
          '¿Qué diferencia hay entre `remember` y `rememberSaveable`?',
          '¿Por qué conviene pasar `key` en una `LazyColumn`?',
          '¿Cómo agregarías encabezados por letra inicial con `stickyHeader`?',
        ],
        evaluates:
          'Que conozcas los fundamentos de Compose: estado, state hoisting, listas lazy y supervivencia a cambios de configuración.',
      },
      {
        id: 'colecciones-kotlin',
        title: 'Procesar pedidos con colecciones de Kotlin',
        duration: '30 min',
        statement: [
          'Tenés `data class Order(val id: String, val customer: String, val amount: Double, val status: Status)` con `enum class Status { PAID, PENDING, CANCELLED }`. Escribí funciones puras que reciban un `List<Order>` y devuelvan lo siguiente.',
          'Primero, el total pagado por cliente como `Map<String, Double>`, ignorando pedidos cancelados y pendientes. Segundo, los 3 clientes que más gastaron, de mayor a menor. Tercero, la cantidad de pedidos por estado. Por ejemplo, con pedidos de `ana` por 100 y 50 pagados y uno de `beto` por 80 cancelado, el primer resultado es `{ana=150.0}`.',
        ],
        requirements: [
          'Usá la API de colecciones (`filter`, `groupBy`, `sumOf`, `sortedByDescending`, `take`) en lugar de loops manuales.',
          'Las funciones no mutan la lista de entrada.',
          'Manejá la lista vacía sin errores.',
          'Escribí al menos un test unitario con JUnit para cada función.',
        ],
        followUps: [
          '¿Por qué usar `Double` para montos puede ser un problema y qué usarías en su lugar?',
          '¿Cuándo convendría usar `asSequence()`?',
          '¿Qué ventaja tiene un `when` exhaustivo sobre el enum?',
        ],
        evaluates:
          'Que escribas Kotlin idiomático con data classes, enums y operaciones funcionales sobre colecciones.',
      },
      {
        id: 'formulario-registro',
        title: 'Formulario de registro con ViewModel',
        duration: '45 min',
        statement: [
          'Armá un formulario de registro en Compose con nombre, email y contraseña, y un botón `Crear cuenta`. Mockeá el backend con `suspend fun register(name: String, email: String, password: String): Result<Unit>` que espera 1 segundo y falla si el email ya existe (`test@mail.com`).',
          'Cada campo muestra su error debajo cuando el usuario sale del campo o intenta enviar. Mientras se envía, el botón muestra un indicador de carga.',
        ],
        requirements: [
          'El estado del formulario vive en un `ViewModel` y se expone como `StateFlow` de un `data class` de UI state.',
          'La llamada se hace en `viewModelScope` y la UI se recolecta con `collectAsStateWithLifecycle`.',
          'Validaciones: nombre no vacío, email con formato válido, contraseña de al menos 8 caracteres.',
          'Teclado adecuado para cada campo y la contraseña oculta con `PasswordVisualTransformation`.',
          'Si el registro falla se muestra un error general sin perder lo que el usuario escribió.',
        ],
        followUps: [
          '¿Qué pasa con el request en curso si el usuario rota el teléfono?',
          '¿Cómo mostrarías un mensaje de éxito una sola vez sin que reaparezca al rotar?',
          '¿Cómo testearías el `ViewModel`?',
        ],
        evaluates:
          'Que conectes Compose con un `ViewModel` usando flujo de datos unidireccional y coroutines, respetando el ciclo de vida.',
      },
    ],
    'semi-senior': [
      {
        id: 'lista-paginada-uistate',
        title: 'Lista paginada con UiState',
        duration: '45 min',
        statement: [
          'Implementá una pantalla de noticias que carga de a páginas desde un repositorio `interface NewsRepository { suspend fun getPage(page: Int): List<Article> }`. Hacé un fake que tarda 700 ms, devuelve 20 artículos por página, se queda sin datos en la página 5 y falla aleatoriamente un 20% de las veces.',
          'Cuando el usuario llega cerca del final se carga la página siguiente. Si falla, se muestra un ítem al final con un botón para reintentar, sin perder lo ya cargado.',
        ],
        requirements: [
          'El `ViewModel` expone un único `StateFlow<NewsUiState>` modelado con una sealed interface o un data class.',
          'No se piden dos páginas a la vez ni se sigue pidiendo cuando no hay más datos.',
          'Distinguí error de la primera carga (pantalla completa) de error de paginación (ítem al final).',
          'Detectá el final de la lista a partir del `LazyListState`.',
          'El repositorio se inyecta (Hilt o constructor) para poder testear con el fake.',
        ],
        followUps: [
          '¿Qué te daría Paging 3 y cuándo no lo usarías?',
          '¿Cómo agregarías pull to refresh?',
          '¿Cómo evitarías recomposiciones innecesarias de toda la lista al agregar una página?',
          '¿Cómo testearías el ViewModel con `runTest` y un dispatcher de test?',
        ],
        evaluates:
          'Que modeles estados de UI completos, manejes concurrencia con coroutines y estructures una pantalla real con arquitectura recomendada.',
      },
      {
        id: 'busqueda-con-flow',
        title: 'Búsqueda reactiva con Flow',
        duration: '45 min',
        statement: [
          'Implementá una búsqueda de películas que consulta `suspend fun search(query: String): List<Movie>` a medida que el usuario escribe. El fake tarda entre 100 y 800 ms de forma aleatoria.',
          'El texto del input llega al `ViewModel` como `MutableStateFlow<String>`. Armá con operadores de Flow el `StateFlow` de resultados que consume la UI, sin que nunca se muestren resultados de un query anterior.',
        ],
        requirements: [
          'Debounce de 300 ms y `distinctUntilChanged`.',
          'Cada query nuevo cancela el anterior con `flatMapLatest` o `mapLatest`.',
          'Con menos de 2 caracteres no se busca y se muestran resultados vacíos.',
          'Los errores se manejan sin cortar el flow, de modo que la búsqueda siga funcionando después de un fallo.',
          'El resultado se expone con `stateIn` usando `SharingStarted.WhileSubscribed(5_000)`.',
        ],
        followUps: [
          '¿Por qué `WhileSubscribed(5_000)` y no `Eagerly`?',
          '¿Qué diferencia hay entre `StateFlow` y `SharedFlow`?',
          '¿Cómo testearías el debounce con Turbine y tiempo virtual?',
        ],
        evaluates:
          'Que domines Flow y sus operadores para resolver casos reactivos reales con cancelación correcta.',
      },
      {
        id: 'retry-con-backoff',
        title: 'Función retry con backoff exponencial',
        duration: '30 min',
        statement: [
          'Implementá `suspend fun <T> retry(times: Int = 3, initialDelayMs: Long = 500, factor: Double = 2.0, shouldRetry: (Throwable) -> Boolean = { true }, block: suspend () -> T): T`.',
          'Ejecuta `block` y, si falla con un error que `shouldRetry` acepta, espera y vuelve a intentar con un delay que crece de forma exponencial: 500 ms, 1000 ms, 2000 ms. Si se agotan los intentos, propaga el último error.',
        ],
        requirements: [
          'Usá `delay`, no `Thread.sleep`.',
          'Una `CancellationException` nunca se reintenta y siempre se propaga.',
          'Respetá `shouldRetry` para no reintentar, por ejemplo, un error 400.',
          'Testeala con `runTest` verificando la cantidad de intentos y los delays.',
        ],
        followUps: [
          '¿Para qué sirve agregar jitter al delay?',
          '¿Qué pasa si no relanzás la `CancellationException`?',
          '¿Cómo lo expresarías como operador de Flow con `retryWhen`?',
        ],
        evaluates:
          'Que entiendas coroutines, cancelación cooperativa y funciones de orden superior con lambdas suspendidas en Kotlin.',
      },
    ],
    senior: [
      {
        id: 'repositorio-offline-first',
        title: 'Repositorio offline-first',
        duration: '60 min',
        statement: [
          'Diseñá el repositorio de una lista de tareas que funciona sin conexión. La fuente de verdad es una base local (Room o un fake en memoria) y existe una API `TasksApi` con `getTasks()`, `createTask()` y `updateTask()`.',
          'La UI observa las tareas como `Flow<List<Task>>` y las ve al instante aunque no haya red. Las tareas creadas o editadas offline se marcan como pendientes de sync y se envían cuando vuelve la conexión.',
        ],
        requirements: [
          'La UI solo lee de la base local; la red solo escribe en la base.',
          'Cada tarea tiene un estado de sync (sincronizada, pendiente, error) visible en la UI.',
          'La sincronización de pendientes se dispara con WorkManager cuando hay red y es idempotente.',
          'Definí una estrategia de conflictos (por ejemplo, last write wins por `updatedAt`) y explicala.',
          'Las tareas creadas offline tienen un id local y se reconcilian con el id del servidor.',
        ],
        followUps: [
          '¿Cómo manejarías un borrado offline de una tarea que otro dispositivo editó?',
          '¿Cómo testearías la sincronización de punta a punta?',
          '¿Qué pasa si la app se mata en medio de un sync?',
          '¿Cómo migrarías el esquema de la base sin perder pendientes?',
        ],
        evaluates:
          'Que diseñes una capa de datos robusta para mobile, razonando sobre consistencia, fallas de red y procesos en background.',
      },
      {
        id: 'map-concurrente-limitado',
        title: 'Map concurrente con límite de paralelismo',
        duration: '45 min',
        statement: [
          'Implementá `suspend fun <T, R> List<T>.mapConcurrently(limit: Int, transform: suspend (T) -> R): List<R>`. Ejecuta `transform` sobre todos los elementos en paralelo, pero con como máximo `limit` corriendo al mismo tiempo, y devuelve los resultados en el orden original.',
          'Caso de uso: subir 50 fotos a un servidor que no acepta más de 4 uploads simultáneos. Si una falla, el resto se cancela y el error se propaga al llamador.',
        ],
        requirements: [
          'Respetá structured concurrency con `coroutineScope`.',
          'Limitá el paralelismo con `Semaphore` (o un pool de workers con `Channel`).',
          'Los resultados mantienen el orden de entrada.',
          'Si el llamador cancela, se cancelan todas las tareas en curso.',
          'Escribí un test que verifique que nunca hay más de `limit` tareas activas.',
        ],
        followUps: [
          '¿Cómo cambiarías el comportamiento para recolectar errores sin cancelar el resto?',
          '¿Qué diferencia hay entre `coroutineScope` y `supervisorScope` acá?',
          '¿Cómo reportarías el progreso a la UI?',
          '¿En qué dispatcher correrías el trabajo y por qué?',
        ],
        evaluates:
          'Que domines coroutines avanzadas: structured concurrency, cancelación, primitivas de sincronización y testing de concurrencia.',
      },
      {
        id: 'pantalla-de-chat-compose',
        title: 'Pantalla de chat performante en Compose',
        duration: '60 min',
        statement: [
          'Armá la pantalla de una conversación de chat. Los mensajes llegan desde `fun messages(chatId: String): Flow<List<Message>>`, donde `Message` es `data class Message(val id: String, val text: String, val fromMe: Boolean, val sentAt: Instant, val status: Status)`. El fake emite un mensaje nuevo cada 2 segundos y la conversación ya tiene 2.000 mensajes.',
          'Los mensajes nuevos aparecen abajo. Si el usuario está leyendo más arriba, no se lo debe mover; en su lugar aparece un botón de nuevos mensajes. Abajo hay un input para enviar.',
        ],
        requirements: [
          '`LazyColumn` con `reverseLayout = true`, keys estables y `contentType` por tipo de burbuja.',
          'Solo se hace auto-scroll si el usuario ya estaba al final de la lista.',
          'Separadores de fecha entre mensajes de días distintos sin recalcular toda la lista en cada recomposición.',
          'Los modelos de UI son estables o inmutables para que Compose pueda saltear recomposiciones.',
          'El input sube con el teclado usando `imePadding`.',
        ],
        followUps: [
          '¿Cómo detectarías y medirías recomposiciones innecesarias?',
          '¿Cómo implementarías la carga de mensajes viejos al scrollear hacia arriba?',
          '¿Qué te dan los Baseline Profiles en una pantalla como esta?',
          '¿Cómo mostrarías el envío optimista de un mensaje y su reintento si falla?',
        ],
        evaluates:
          'Que entiendas el modelo de recomposición y estabilidad de Compose y puedas construir una pantalla exigente sin problemas de performance.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'contains-duplicate',
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        why: 'Uso básico de `HashSet` para pasar de O(n²) a O(n), un patrón que aparece en todos lados.',
      },
      {
        slug: 'valid-palindrome',
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        why: 'Dos punteros sobre strings y manejo de caracteres en Kotlin.',
      },
      {
        slug: 'merge-two-sorted-lists',
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        why: 'Manejo de nulos y referencias en listas enlazadas, ideal para practicar null safety de Kotlin.',
      },
      {
        slug: 'move-zeroes',
        title: 'Move Zeroes',
        difficulty: 'Easy',
        why: 'Manipular un array in place con dos punteros sin memoria extra.',
      },
      {
        slug: 'invert-binary-tree',
        title: 'Invert Binary Tree',
        difficulty: 'Easy',
        why: 'Recursión simple sobre árboles, la puerta de entrada a problemas de jerarquías.',
      },
      {
        slug: 'roman-to-integer',
        title: 'Roman to Integer',
        difficulty: 'Easy',
        why: 'Mapas y recorrido de strings con una regla de negocio, típico en primeras rondas de mobile.',
      },
    ],
    'semi-senior': [
      {
        slug: 'ransom-note',
        title: 'Ransom Note',
        difficulty: 'Easy',
        why: 'Conteo de frecuencias con un array o mapa, rápido para calentar en la entrevista.',
      },
      {
        slug: 'isomorphic-strings',
        title: 'Isomorphic Strings',
        difficulty: 'Easy',
        why: 'Mapeos biyectivos con dos mapas; entrena detectar casos borde.',
      },
      {
        slug: 'longest-substring-without-repeating-characters',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        why: 'El ejemplo más pedido de sliding window con hash map.',
      },
      {
        slug: 'min-stack',
        title: 'Min Stack',
        difficulty: 'Medium',
        why: 'Diseñar una clase con invariantes en O(1), parecido a lo que piden en preguntas de diseño de componentes.',
      },
      {
        slug: 'decode-string',
        title: 'Decode String',
        difficulty: 'Medium',
        why: 'Pilas anidadas o recursión para parsear, muy frecuente en entrevistas Android.',
      },
      {
        slug: 'daily-temperatures',
        title: 'Daily Temperatures',
        difficulty: 'Medium',
        why: 'Monotonic stack, un patrón que resuelve muchos problemas de siguiente mayor o menor.',
      },
      {
        slug: 'kth-largest-element-in-an-array',
        title: 'Kth Largest Element in an Array',
        difficulty: 'Medium',
        why: 'Uso de `PriorityQueue` o quickselect; mide si conocés las estructuras de la standard library.',
      },
    ],
    senior: [
      {
        slug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        why: 'Hash map más lista doblemente enlazada; aparece seguido porque Android usa `LruCache` para imágenes.',
      },
      {
        slug: 'time-based-key-value-store',
        title: 'Time Based Key-Value Store',
        difficulty: 'Medium',
        why: 'Diseño de estructura con búsqueda binaria sobre timestamps, parecido a versionar datos para sync.',
      },
      {
        slug: 'insert-delete-getrandom-o1',
        title: 'Insert Delete GetRandom O(1)',
        difficulty: 'Medium',
        why: 'Combinar array y mapa para garantizar operaciones en O(1); prueba diseño fino de estructuras.',
      },
      {
        slug: 'clone-graph',
        title: 'Clone Graph',
        difficulty: 'Medium',
        why: 'Recorrido de grafos con mapa de visitados, la misma idea que copiar estructuras con ciclos.',
      },
      {
        slug: 'lfu-cache',
        title: 'LFU Cache',
        difficulty: 'Hard',
        why: 'Versión exigente del LRU con frecuencias; mide si podés mantener varios invariantes a la vez.',
      },
      {
        slug: 'trapping-rain-water',
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        why: 'Dos punteros o prefijos máximos; un Hard clásico que aparece en entrevistas senior.',
      },
    ],
  },
};
