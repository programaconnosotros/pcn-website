import type { TrackPractice } from './types';

export const reactNativePractice: TrackPractice = {
  track: 'react-native',
  exercises: {
    junior: [
      {
        id: 'flatlist-con-busqueda',
        title: 'Lista de contactos con FlatList',
        duration: '30 min',
        statement: [
          'Tenés un array `contacts` con objetos `{ id: string, name: string, phone: string, avatarUrl: string }`. Armá una pantalla en React Native que los muestre en una `FlatList` con avatar, nombre y teléfono, y un `TextInput` arriba para buscar por nombre.',
          'Los datos están hardcodeados. Simulá un pull to refresh que espera 1 segundo y vuelve a cargar la misma lista.',
        ],
        requirements: [
          'Usá `FlatList` con `keyExtractor` basado en el `id`, no `ScrollView` con `map`.',
          'El `TextInput` es controlado y el filtro ignora mayúsculas y minúsculas.',
          'Mostrá un componente vacío con `ListEmptyComponent` cuando no hay resultados.',
          'Pull to refresh con `refreshing` y `onRefresh`.',
          'Estilos con `StyleSheet.create`, respetando el safe area.',
        ],
        followUps: [
          '¿Por qué `FlatList` y no un `ScrollView` con `map`?',
          '¿Cómo harías que al tocar un contacto se abra la app de teléfono?',
          '¿Qué cambiarías si cada fila tuviera un botón de favorito?',
        ],
        evaluates:
          'Que conozcas los componentes básicos de React Native y cómo renderizar listas de forma eficiente.',
      },
      {
        id: 'lista-y-detalle-con-navegacion',
        title: 'Lista y detalle con navegación',
        duration: '45 min',
        statement: [
          'Armá dos pantallas con Expo Router o React Navigation. La primera lista productos que trae `fetchProducts(): Promise<{ id: string, name: string, price: number }[]>` y la segunda muestra el detalle de uno con `fetchProduct(id): Promise<{ id: string, name: string, price: number, description: string }>`. Mockeá las dos funciones con un delay de 600 ms.',
          'Al tocar un producto se navega al detalle pasando solo el `id` como parámetro. El título del header del detalle es el nombre del producto.',
        ],
        requirements: [
          'El detalle recibe el `id` por parámetro de ruta y pide sus datos; no recibe el objeto entero.',
          'Ambas pantallas muestran estados de carga y error con opción de reintentar.',
          'El precio se formatea como moneda con `Intl.NumberFormat` o equivalente.',
          'Si la pantalla se cierra antes de que termine el request, no se actualiza el state.',
          'Los tipos de las rutas y parámetros están definidos en TypeScript.',
        ],
        followUps: [
          '¿Por qué pasar el `id` y no el objeto completo como parámetro?',
          '¿Cómo harías para que un deep link abra directamente el detalle?',
          '¿Cómo evitarías volver a pedir el producto si ya lo tenías de la lista?',
        ],
        evaluates:
          'Que sepas estructurar navegación entre pantallas, manejar parámetros y cuidar los estados de carga en mobile.',
      },
      {
        id: 'transacciones-a-sectionlist',
        title: 'Agrupar transacciones para una SectionList',
        duration: '30 min',
        statement: [
          'Recibís transacciones con la forma `{ id: string, description: string, amount: number, date: string }`, donde `date` es ISO (`2024-06-03T10:15:00Z`) y `amount` es negativo para gastos. Escribí una función pura `toSections(transactions)` que devuelva el formato que espera `SectionList`: `{ title: string, total: number, data: Transaction[] }[]`.',
          'Las secciones se agrupan por día, van del día más reciente al más viejo y dentro de cada día las transacciones también van de la más reciente a la más vieja. `total` es la suma del día. Después usá la función para renderizar la `SectionList` con el total en cada encabezado.',
        ],
        requirements: [
          'La función no muta el array de entrada.',
          'El agrupamiento es O(n) más el costo del ordenamiento.',
          'Los títulos de sección son legibles, por ejemplo `Hoy`, `Ayer` o `3 de junio`.',
          'Los montos negativos y positivos se distinguen visualmente.',
          'Escribí un par de tests para `toSections`.',
        ],
        followUps: [
          '¿Qué problemas de zona horaria puede tener agrupar por día?',
          '¿Por qué conviene que esta transformación sea una función pura separada del componente?',
          '¿Cómo evitarías recalcular las secciones en cada render?',
        ],
        evaluates:
          'Que manejes transformaciones de datos en JavaScript con métodos de array y las conectes con componentes de lista de React Native.',
      },
    ],
    'semi-senior': [
      {
        id: 'feed-infinito',
        title: 'Feed infinito performante',
        duration: '45 min',
        statement: [
          'Implementá un feed de posts con scroll infinito. La API mockeada es `fetchFeed(cursor?: string): Promise<{ items: Post[], nextCursor: string | null }>`, con `Post` de la forma `{ id: string, author: string, text: string, imageUrl?: string }`. Devuelve 15 posts por página, tarda 800 ms y a veces repite un post que ya vino en la página anterior.',
          'El feed tiene que sentirse fluido en un Android de gama media aunque haya cientos de posts cargados.',
        ],
        requirements: [
          'Paginación con `onEndReached` y `onEndReachedThreshold`, sin pedir la misma página dos veces.',
          'Se descartan posts duplicados por `id`.',
          'Footer de carga mientras llega la página siguiente y pull to refresh que vuelve a empezar.',
          'Las filas son componentes memoizados y los callbacks son estables.',
          'Ajustá props de performance de `FlatList` (`windowSize`, `initialNumToRender`, `removeClippedSubviews`) y explicá por qué.',
        ],
        followUps: [
          '¿Qué te daría FlashList frente a `FlatList`?',
          '¿Cómo medirías si el scroll pierde frames?',
          '¿Cómo manejarías las imágenes para que no consuman demasiada memoria?',
          '¿Lo harías con React Query o TanStack Query? ¿Qué te resuelve?',
        ],
        evaluates:
          'Que entiendas cómo renderiza listas React Native y puedas construir un feed real sin problemas de performance.',
      },
      {
        id: 'formulario-con-borrador',
        title: 'Formulario con borrador persistente',
        duration: '45 min',
        statement: [
          'Armá un formulario para publicar una reseña con título, texto y puntaje de 1 a 5. Si el usuario cierra la app a mitad de camino, al volver a abrir la pantalla tiene que encontrar su borrador tal como lo dejó.',
          'Al enviar se llama a `submitReview(review): Promise<void>`, mockeada con 1 segundo de delay y un 20% de fallas. Si el envío sale bien, el borrador se borra.',
        ],
        requirements: [
          'El borrador se guarda en `AsyncStorage` (o MMKV) con debounce, no en cada tecla.',
          'Al abrir la pantalla se restaura el borrador antes de mostrar el formulario, sin parpadeos.',
          'El teclado no tapa los campos: usá `KeyboardAvoidingView` con el comportamiento correcto en iOS y Android.',
          'Validaciones: título de al menos 3 caracteres, texto de al menos 20, puntaje obligatorio.',
          'El botón de enviar muestra carga y queda deshabilitado mientras se envía.',
        ],
        followUps: [
          '¿Qué diferencias hay entre AsyncStorage, MMKV y SecureStore?',
          '¿Cómo manejarías un borrador por cada producto reseñado?',
          '¿Usarías React Hook Form acá? ¿Qué te ahorra?',
        ],
        evaluates:
          'Que resuelvas formularios en mobile cuidando teclado, persistencia local y diferencias entre plataformas.',
      },
      {
        id: 'fetch-con-timeout-y-retry',
        title: 'Fetch con timeout y reintentos',
        duration: '30 min',
        statement: [
          'Implementá `fetchJson(url, { timeoutMs = 5000, retries = 2 })` sobre `fetch`. Si la respuesta tarda más de `timeoutMs`, se aborta. Si falla por red, timeout o un status 5xx, se reintenta con backoff exponencial (500 ms, 1 s). Si responde 4xx, no se reintenta.',
          'Devuelve el body parseado como JSON o tira un error que permita distinguir si fue timeout, red o HTTP (incluyendo el status).',
        ],
        requirements: [
          'El timeout usa `AbortController`, no solo un `Promise.race` que deja el request vivo.',
          'Los errores son clases propias o tienen un campo `type` para distinguirlos.',
          'Los 4xx no se reintentan.',
          'La función acepta un `signal` externo para que el llamador pueda cancelar todo.',
          'Está tipada con un genérico: `fetchJson<User>(url)` devuelve `Promise<User>`.',
        ],
        followUps: [
          '¿Para qué sirve agregar jitter al backoff?',
          '¿Qué pasa con reintentar un `POST` que no es idempotente?',
          '¿Cómo lo testearías sin esperar tiempos reales?',
        ],
        evaluates:
          'Que manejes promesas, cancelación y errores de red con criterio, algo crítico en apps que viven con conexiones inestables.',
      },
    ],
    senior: [
      {
        id: 'cola-offline',
        title: 'Cola de acciones offline',
        duration: '60 min',
        statement: [
          'En una app de pedidos para vendedores en la calle, la conexión se corta todo el tiempo. Diseñá e implementá una cola que guarda las acciones del usuario (`createOrder`, `updateOrder`, `cancelOrder`) cuando no hay conexión y las envía en orden cuando vuelve.',
          'Usá `@react-native-community/netinfo` para detectar la conexión (podés mockearlo) y una API mockeada que falla un 20% de las veces. La UI muestra cada pedido con su estado: sincronizado, pendiente o con error.',
        ],
        requirements: [
          'La cola se persiste y sobrevive a que el sistema mate la app.',
          'Las acciones se envían en orden y una que falla no se saltea en silencio.',
          'Cada acción lleva una clave de idempotencia para que un reintento no duplique pedidos.',
          'Las acciones sobre pedidos creados offline usan un id local que se reemplaza por el del servidor.',
          'Los reintentos usan backoff y hay un máximo; después se marca el error para que el usuario decida.',
          'La UI se actualiza de forma optimista.',
        ],
        followUps: [
          '¿Qué hacés si el servidor rechaza una acción del medio de la cola por un conflicto?',
          '¿Cómo sincronizarías en background con la app cerrada en iOS y en Android?',
          '¿Cómo testearías los escenarios de red intermitente?',
          '¿Cómo evitarías que dos procesos procesen la cola a la vez?',
        ],
        evaluates:
          'Que diseñes soluciones offline robustas, razonando sobre consistencia, idempotencia y ciclo de vida de la app en mobile.',
      },
      {
        id: 'galeria-de-fotos',
        title: 'Galería de 5.000 fotos',
        duration: '60 min',
        statement: [
          'Tenés que mostrar una galería en grilla de 3 columnas con 5.000 fotos `{ id: string, thumbUrl: string, fullUrl: string, width: number, height: number }`. Al tocar una foto se abre en pantalla completa con swipe horizontal para pasar a la siguiente y pinch to zoom.',
          'Hoy la versión existente usa `ScrollView` con `map`, tarda 4 segundos en abrir y se cierra por memoria en Android. Reescribila para que abra al instante y scrollee fluido.',
        ],
        requirements: [
          'Grilla virtualizada (`FlatList` con `numColumns` y `getItemLayout`, o FlashList con `estimatedItemSize`).',
          'Las miniaturas usan una librería con cache de imágenes (por ejemplo `expo-image`) y tamaño acotado.',
          'El visor a pantalla completa también se virtualiza y abre directamente en la foto tocada.',
          'Los gestos y animaciones corren en el UI thread (Reanimated y Gesture Handler).',
          'Explicá cómo verificarías la mejora con herramientas de profiling.',
        ],
        followUps: [
          '¿Cómo implementarías una transición compartida de la miniatura al visor?',
          '¿Qué cambia con la New Architecture para este tipo de pantalla?',
          '¿Cómo manejarías la selección múltiple para compartir fotos?',
          '¿Cómo detectarías leaks de memoria?',
        ],
        evaluates:
          'Que puedas diagnosticar y resolver problemas de performance y memoria reales en React Native, conociendo los límites entre JS y nativo.',
      },
      {
        id: 'cache-lru-con-ttl',
        title: 'Cache LRU con TTL',
        duration: '45 min',
        statement: [
          'Implementá en TypeScript `createCache<K, V>({ max, ttlMs })`, que devuelve un objeto con `get(key)`, `set(key, value)`, `has(key)`, `delete(key)` y `size`. Cuando se supera `max` se desaloja la entrada usada hace más tiempo, y una entrada vencida se comporta como si no existiera.',
          'Después, usalo para envolver una función async: `cachedFetch = withCache(fetchUser, { max: 100, ttlMs: 60_000 })`, donde dos llamadas simultáneas con el mismo id comparten la misma promesa.',
        ],
        requirements: [
          '`get` y `set` son O(1), aprovechando el orden de inserción de `Map`.',
          'Las entradas vencidas se limpian de forma perezosa al leerlas, sin timers por entrada.',
          'Si la promesa cacheada rechaza, se saca del cache para no guardar errores.',
          'El tiempo se inyecta (por ejemplo `now = Date.now`) para poder testear sin esperar.',
          'Los tipos genéricos se preservan en `withCache`.',
        ],
        followUps: [
          '¿Cómo agregarías stale-while-revalidate?',
          '¿Cómo persistirías el cache entre sesiones de la app?',
          '¿Qué cambiaría si el cache tuviera que ser compartido entre JS y código nativo?',
        ],
        evaluates:
          'Que diseñes una utilidad de bajo nivel correcta y testeable, con buen uso de estructuras de datos y promesas en TypeScript.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'counter-ii',
        title: 'Counter II',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: closures que devuelven varios métodos, la idea detrás de hooks y stores simples.',
      },
      {
        slug: 'apply-transform-over-each-element-in-array',
        title: 'Apply Transform Over Each Element in Array',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: reimplementar `map` para entender callbacks, la base de renderizar listas.',
      },
      {
        slug: 'is-object-empty',
        title: 'Is Object Empty',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: diferencias entre objetos y arrays, útil al validar respuestas de una API.',
      },
      {
        slug: 'sleep',
        title: 'Sleep',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: primera promesa construida a mano, ideal para entender `async` y `await`.',
      },
      {
        slug: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        why: 'Conteo de frecuencias con objetos o `Map`, un patrón de algoritmos muy básico y muy pedido.',
      },
      {
        slug: 'contains-duplicate',
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        why: 'Uso de `Set` para bajar de O(n²) a O(n), algo que también usás para deduplicar datos en una lista.',
      },
    ],
    'semi-senior': [
      {
        slug: 'interval-cancellation',
        title: 'Interval Cancellation',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: crear y limpiar intervalos, lo mismo que hacés en el cleanup de un efecto con polling.',
      },
      {
        slug: 'sort-by',
        title: 'Sort By',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: ordenar con una función de clave, frecuente al preparar datos para una lista.',
      },
      {
        slug: 'memoize',
        title: 'Memoize',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: memoización con closures, la base para entender `useMemo` y evitar trabajo repetido.',
      },
      {
        slug: 'debounce',
        title: 'Debounce',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: imprescindible para búsquedas y guardados automáticos, y muy preguntado.',
      },
      {
        slug: 'compact-object',
        title: 'Compact Object',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: recorrer objetos anidados de forma recursiva, como al limpiar payloads de una API.',
      },
      {
        slug: 'group-anagrams',
        title: 'Group Anagrams',
        difficulty: 'Medium',
        why: 'Agrupar con claves derivadas en un `Map`, la misma lógica que armar secciones para una `SectionList`.',
      },
      {
        slug: 'top-k-frequent-elements',
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        why: 'Conteo más bucket sort o heap; un Medium clásico de entrevistas de nivel medio.',
      },
    ],
    senior: [
      {
        slug: 'promise-time-limit',
        title: 'Promise Time Limit',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: ponerle timeout a una promesa, crítico en apps con redes inestables.',
      },
      {
        slug: 'execute-asynchronous-functions-in-parallel',
        title: 'Execute Asynchronous Functions in Parallel',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: implementar `Promise.all` a mano, una pregunta asíncrona clásica de nivel senior.',
      },
      {
        slug: 'join-two-arrays-by-id',
        title: 'Join Two Arrays by ID',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: mergear datos locales con datos del servidor por id, como en una sincronización offline.',
      },
      {
        slug: 'event-emitter',
        title: 'Event Emitter',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: el patrón pub/sub que usan los módulos nativos para mandar eventos a JS.',
      },
      {
        slug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        why: 'Diseño de estructura con `Map` en O(1); muy frecuente en senior y directamente aplicable a caches de imágenes y datos.',
      },
      {
        slug: 'sliding-window-maximum',
        title: 'Sliding Window Maximum',
        difficulty: 'Hard',
        why: 'Deque monotónica sobre una ventana; mide si podés llevar un patrón conocido a su versión exigente.',
      },
    ],
  },
};
