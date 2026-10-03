import type { TrackPractice } from './types';

export const iosPractice: TrackPractice = {
  track: 'ios',
  exercises: {
    junior: [
      {
        id: 'lista-con-busqueda-swiftui',
        title: 'Lista de países con búsqueda en SwiftUI',
        duration: '30 min',
        statement: [
          'Tenés un array de `Country` con la forma `struct Country { let code: String; let name: String; let capital: String; let population: Int }`. Armá una pantalla en SwiftUI que muestre la lista de países ordenada por nombre, con una barra de búsqueda arriba.',
          'Al tocar un país se navega a una pantalla de detalle que muestra nombre, capital y población formateada (por ejemplo `45.808.747`). Los datos están hardcodeados; no hace falta red.',
        ],
        requirements: [
          'Usá `NavigationStack`, `List` y `.searchable`.',
          'La búsqueda filtra por nombre o capital sin distinguir mayúsculas, minúsculas ni tildes.',
          '`Country` conforma `Identifiable` para que `List` no necesite `id: \\.self`.',
          'La población se formatea con `formatted()` o `NumberFormatter`, respetando el locale.',
          'Mostrá un estado vacío con `ContentUnavailableView` cuando no hay resultados.',
        ],
        followUps: [
          '¿Dónde guardarías el texto de búsqueda y por qué con `@State`?',
          '¿Cómo agregarías la opción de marcar países como favoritos y que se vea en la lista?',
          '¿Qué cambia si la lista viene de una API en vez de estar hardcodeada?',
        ],
        evaluates:
          'Que conozcas los bloques básicos de SwiftUI: estado local, listas, navegación y formateo correcto de datos.',
      },
      {
        id: 'decodificar-json-codable',
        title: 'Modelar y decodificar un JSON con Codable',
        duration: '30 min',
        statement: [
          'Una API devuelve este JSON: `{ "user_id": 42, "full_name": "Ana Pérez", "email": null, "created_at": "2024-05-10T14:30:00Z", "tags": ["admin", "beta"] }`. Definí un modelo `User` en Swift y escribí la función que decodifica un `Data` con ese contenido.',
          'Después, la API agrega un campo `plan` que puede valer `"free"`, `"pro"` o, en el futuro, valores que todavía no conocés. Tu modelo no debería romperse cuando aparezca un valor nuevo.',
        ],
        requirements: [
          'Las propiedades en Swift usan camelCase (`userId`, `fullName`, `createdAt`).',
          '`email` es opcional y `createdAt` es un `Date`, no un `String`.',
          '`plan` es un `enum` con un caso `unknown` para valores no contemplados.',
          'Los errores de decodificación se manejan con `do/catch` y se loguean con información útil.',
        ],
        followUps: [
          '¿Cuándo usarías `CodingKeys` y cuándo `keyDecodingStrategy = .convertFromSnakeCase`?',
          '¿Qué diferencia hay entre `try`, `try?` y `try!`?',
          '¿Cómo testearías el decoding sin pegarle a la API?',
        ],
        evaluates:
          'Que manejes Codable, opcionales, enums y manejo de errores en Swift, algo que aparece en cualquier app que consume una API.',
      },
      {
        id: 'formulario-login',
        title: 'Formulario de login con validación',
        duration: '30 min',
        statement: [
          'Armá una pantalla de login en SwiftUI con campos de email y contraseña y un botón `Ingresar`. Mockeá el servicio con `func login(email: String, password: String) async throws -> String` que espera 1 segundo y devuelve un token, o tira error si la contraseña es `"error"`.',
          'Mientras se valida contra el servicio, el botón muestra un `ProgressView` y no se puede tocar de nuevo. Si falla, se muestra un mensaje de error debajo del formulario.',
        ],
        requirements: [
          'El botón está deshabilitado hasta que el email tenga formato válido y la contraseña al menos 8 caracteres.',
          'El campo de contraseña usa `SecureField` y el de email el teclado y `textContentType` adecuados.',
          'La llamada async se hace con `Task` y el estado de carga se actualiza en el main actor.',
          'Al tocar Return en el email el foco pasa a la contraseña, usando `@FocusState`.',
          'La lógica de validación vive fuera de la vista (por ejemplo en un view model) para poder testearla.',
        ],
        followUps: [
          '¿Dónde guardarías el token y por qué no en `UserDefaults`?',
          '¿Cómo cancelarías el request si el usuario sale de la pantalla?',
          '¿Qué tests unitarios escribirías para la validación?',
        ],
        evaluates:
          'Que sepas manejar formularios, foco, estados de carga y llamadas async en SwiftUI separando la lógica de la vista.',
      },
    ],
    'semi-senior': [
      {
        id: 'feed-paginado',
        title: 'Feed paginado con async/await',
        duration: '45 min',
        statement: [
          'Implementá un feed de posts que carga de a páginas desde `GET https://api.example.com/posts?page=1&limit=20`, que devuelve `{ "items": [{ "id": 1, "title": "...", "body": "..." }], "hasMore": true }`. Mockeá el cliente con un protocolo `PostsService` y una implementación fake con delay.',
          'Al llegar cerca del final de la lista se pide la página siguiente. Se puede hacer pull to refresh para volver a la primera página.',
        ],
        requirements: [
          'Arquitectura MVVM con un view model `@Observable` o `ObservableObject` marcado `@MainActor`.',
          'Estado modelado como enum o similar: cargando, cargado, vacío y error con reintento.',
          'No se dispara más de un request de paginación a la vez y no se pide más cuando `hasMore` es `false`.',
          'Pull to refresh con `.refreshable`.',
          'El servicio se inyecta por protocolo para poder testear el view model con un fake.',
        ],
        followUps: [
          '¿Qué pasa si el usuario hace pull to refresh mientras se está cargando la página 3?',
          '¿Cómo cachearías el feed para mostrar algo al abrir la app sin conexión?',
          '¿Cómo lo harías con `UICollectionView` y diffable data source?',
          '¿Cómo testearías el view model?',
        ],
        evaluates:
          'Que estructures una pantalla real con concurrencia moderna, estados de UI explícitos y dependencias testeables.',
      },
      {
        id: 'busqueda-con-debounce',
        title: 'Búsqueda con debounce y cancelación',
        duration: '45 min',
        statement: [
          'Agregá una búsqueda de productos que consulta `func search(_ query: String) async throws -> [Product]` a medida que el usuario escribe. El servicio mockeado tarda un tiempo aleatorio entre 100 y 800 ms.',
          'No querés pegarle al servicio en cada tecla, y nunca deberías mostrar resultados de un query viejo que llegó tarde.',
        ],
        requirements: [
          'Debounce de 300 ms, ya sea con `.task(id:)` y `Task.sleep` o con Combine.',
          'Cada búsqueda nueva cancela la anterior y la cancelación no se muestra como error.',
          'Solo se busca a partir de 2 caracteres; con menos se limpian los resultados.',
          'Estados de cargando, sin resultados y error.',
        ],
        followUps: [
          '¿Qué diferencias hay entre resolverlo con Combine y con structured concurrency?',
          '¿Cómo verificás que una tarea fue cancelada dentro del servicio?',
          '¿Cómo lo testearías sin esperar tiempos reales?',
        ],
        evaluates:
          'Que entiendas la cancelación cooperativa en Swift Concurrency y cómo evitar race conditions en la UI.',
      },
      {
        id: 'extensiones-genericas-sequence',
        title: 'Extensiones genéricas sobre Sequence',
        duration: '30 min',
        statement: [
          'Escribí dos extensiones genéricas. La primera, `func grouped<Key: Hashable>(by key: (Element) -> Key) -> [Key: [Element]]` sobre `Sequence`. La segunda, `func uniqued<Key: Hashable>(by key: (Element) -> Key) -> [Element]`, que elimina duplicados conservando el primer elemento de cada clave y el orden original.',
          'Ejemplo: con `[Order(customer: "ana", total: 10), Order(customer: "beto", total: 5), Order(customer: "ana", total: 7)]`, `grouped(by: \\.customer)` devuelve `["ana": [10, 7], "beto": [5]]` (mostrando los totales) y `uniqued(by: \\.customer)` devuelve los pedidos de 10 y 5.',
        ],
        requirements: [
          'Las dos funciones son O(n).',
          'Funcionan con key paths gracias a que un key path se puede pasar como función.',
          'No dependen de que `Element` sea `Hashable`, solo la clave.',
          'Incluí un par de casos de prueba con XCTest o Swift Testing.',
        ],
        followUps: [
          '¿Cómo harías `grouped` usando `Dictionary(grouping:by:)`? ¿Qué cambia?',
          '¿Qué ventaja tendría que `uniqued` devuelva una secuencia lazy?',
          '¿Qué son los associated types y cómo se relacionan con `Element`?',
        ],
        evaluates:
          'Que te sientas cómodo con generics, protocolos de la standard library, closures y key paths en Swift.',
      },
    ],
    senior: [
      {
        id: 'image-loader-con-cache',
        title: 'Image loader con cache y deduplicación',
        duration: '60 min',
        statement: [
          'Implementá un `ImageLoader` para una grilla de fotos en `UICollectionView`. Expone `func image(for url: URL) async throws -> UIImage`. Muchas celdas pueden pedir la misma URL al mismo tiempo y el usuario scrollea rápido.',
          'Querés que una URL ya descargada se sirva desde memoria, que dos pedidos simultáneos de la misma URL generen una sola descarga y que las celdas recicladas nunca muestren la imagen de otra fila.',
        ],
        requirements: [
          'El loader es un `actor` (o está correctamente sincronizado) y guarda las descargas en vuelo en un diccionario de `Task`.',
          'Cache en memoria con `NSCache` y límite de costo; opcionalmente cache en disco.',
          'La celda cancela su tarea en `prepareForReuse` y verifica que la imagen recibida corresponda a su URL actual.',
          'Las imágenes se decodifican o redimensionan fuera del main thread antes de mostrarse.',
          'Si una tarea se cancela y otra celda esperaba la misma URL, la otra no se ve afectada.',
        ],
        followUps: [
          '¿Cómo reaccionarías a una advertencia de memoria del sistema?',
          '¿Cómo agregarías prefetching con `UICollectionViewDataSourcePrefetching`?',
          '¿Qué cambiarías para usarlo desde SwiftUI?',
          '¿Cómo medirías si el scroll se mantiene a 60 o 120 fps?',
        ],
        evaluates:
          'Que domines concurrencia con actores, manejo de memoria, reciclado de celdas y performance de scroll en un caso de producción.',
      },
      {
        id: 'cache-lru-generico',
        title: 'Cache LRU genérico y thread-safe',
        duration: '45 min',
        statement: [
          'Implementá `LRUCache<Key: Hashable, Value>` con capacidad fija. Expone `func value(for key: Key) -> Value?` y `func set(_ value: Value, for key: Key)`. Cuando se supera la capacidad se descarta el elemento usado hace más tiempo.',
          'Ejemplo con capacidad 2: `set(1, "a")`, `set(2, "b")`, `value(1)`, `set(3, "c")` deja en cache las claves 1 y 3, porque 2 era la menos usada.',
        ],
        requirements: [
          'Tanto leer como escribir son O(1), usando diccionario más lista doblemente enlazada.',
          'Se puede usar desde varios hilos sin data races (actor, lock o cola serial; justificá la elección).',
          'Leer un valor lo marca como usado recientemente.',
          'Cuidá los ciclos de retención en los nodos de la lista.',
          'Escribí tests para el orden de desalojo y para acceso concurrente.',
        ],
        followUps: [
          '¿Por qué no alcanza con `NSCache` si necesitás orden LRU estricto?',
          '¿Cómo agregarías expiración por tiempo?',
          '¿Qué diferencia de performance y ergonomía tiene un actor frente a un lock?',
        ],
        evaluates:
          'Que diseñes estructuras de datos eficientes en Swift y razones sobre gestión de memoria y seguridad entre hilos.',
      },
      {
        id: 'cliente-http-refresh-token',
        title: 'Cliente HTTP con refresh de token',
        duration: '60 min',
        statement: [
          'Diseñá un `APIClient` con `func send<T: Decodable>(_ request: URLRequest) async throws -> T`. Las requests llevan un access token en el header `Authorization`. Cuando el servidor responde 401, el cliente tiene que refrescar el token con `func refreshToken() async throws -> String` y reintentar la request una sola vez.',
          'El problema real: al abrir una pantalla salen 5 requests en paralelo y todas reciben 401. Tiene que haber un solo refresh y las 5 requests tienen que reintentarse con el token nuevo. Si el refresh falla, se cierra la sesión.',
        ],
        requirements: [
          'Un solo refresh en curso a la vez, compartido por todas las requests que lo necesiten (por ejemplo un actor que guarda la `Task` del refresh).',
          'Cada request se reintenta como máximo una vez tras el refresh.',
          'Errores tipados que distingan red, decodificación, no autorizado y servidor.',
          '`URLSession` inyectada por protocolo para poder testearlo con respuestas fake.',
          'Si el refresh falla se notifica a la app para volver al login.',
        ],
        followUps: [
          '¿Cómo agregarías reintentos con backoff para errores de red o 5xx?',
          '¿Dónde y cómo guardarías los tokens?',
          '¿Cómo testearías que solo hubo un refresh con 5 requests concurrentes?',
          '¿Qué cambiaría si refrescaras el token de forma proactiva antes de que expire?',
        ],
        evaluates:
          'Que resuelvas concurrencia compartida y manejo de errores en una capa de red, con diseño testeable y pensando en casos de producción.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        why: 'El clásico para usar un `Dictionary` y bajar de O(n²) a O(n); casi siempre aparece en la primera ronda.',
      },
      {
        slug: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        why: 'Conteo de frecuencias con diccionarios y manejo de `String` y `Character` en Swift.',
      },
      {
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        why: 'Uso de una pila con un array, un patrón que se repite en muchos problemas de parsing.',
      },
      {
        slug: 'reverse-linked-list',
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        why: 'Manejo de referencias y opcionales con clases, base para entender estructuras enlazadas.',
      },
      {
        slug: 'maximum-depth-of-binary-tree',
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        why: 'Primer contacto con recursión sobre árboles, que aparece en jerarquías de vistas y menús.',
      },
      {
        slug: 'first-unique-character-in-a-string',
        title: 'First Unique Character in a String',
        difficulty: 'Easy',
        why: 'Recorrer strings y contar con diccionarios, frecuente en entrevistas mobile de nivel inicial.',
      },
    ],
    'semi-senior': [
      {
        slug: 'best-time-to-buy-and-sell-stock',
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        why: 'Un recorrido con mínimo acumulado; entrena pensar en una sola pasada.',
      },
      {
        slug: 'merge-sorted-array',
        title: 'Merge Sorted Array',
        difficulty: 'Easy',
        why: 'Dos punteros trabajando desde el final del array, útil para mergear listas ordenadas en memoria.',
      },
      {
        slug: 'group-anagrams',
        title: 'Group Anagrams',
        difficulty: 'Medium',
        why: 'Agrupar con claves derivadas en un diccionario, lo mismo que hacés al seccionar una lista.',
      },
      {
        slug: 'top-k-frequent-elements',
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        why: 'Combina conteo con bucket sort o heap; es muy común en entrevistas de nivel medio.',
      },
      {
        slug: 'product-of-array-except-self',
        title: 'Product of Array Except Self',
        difficulty: 'Medium',
        why: 'Prefijos y sufijos sin división; mide si podés optimizar espacio y tiempo.',
      },
      {
        slug: 'binary-tree-level-order-traversal',
        title: 'Binary Tree Level Order Traversal',
        difficulty: 'Medium',
        why: 'BFS con cola sobre árboles, el patrón para recorrer jerarquías por niveles.',
      },
      {
        slug: 'number-of-islands',
        title: 'Number of Islands',
        difficulty: 'Medium',
        why: 'DFS o BFS sobre una grilla, uno de los problemas de grafos más pedidos.',
      },
    ],
    senior: [
      {
        slug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        why: 'Diccionario más lista doblemente enlazada; aparece seguido en entrevistas iOS porque se usa en caches de imágenes.',
      },
      {
        slug: 'merge-intervals',
        title: 'Merge Intervals',
        difficulty: 'Medium',
        why: 'Ordenar y fusionar rangos, típico para calendarios, reservas o rangos de tiempo en la UI.',
      },
      {
        slug: 'course-schedule',
        title: 'Course Schedule',
        difficulty: 'Medium',
        why: 'Detección de ciclos y orden topológico, la misma lógica que resolver dependencias entre módulos.',
      },
      {
        slug: 'serialize-and-deserialize-binary-tree',
        title: 'Serialize and Deserialize Binary Tree',
        difficulty: 'Hard',
        why: 'Diseñar un formato de serialización y reconstruirlo, parecido a persistir estado complejo.',
      },
      {
        slug: 'merge-k-sorted-lists',
        title: 'Merge k Sorted Lists',
        difficulty: 'Hard',
        why: 'Uso de un heap o divide and conquer; Swift no trae heap de serie, así que mide si podés implementarlo.',
      },
      {
        slug: 'find-median-from-data-stream',
        title: 'Find Median from Data Stream',
        difficulty: 'Hard',
        why: 'Dos heaps balanceados para datos en streaming; prueba diseño de estructuras bajo restricciones de complejidad.',
      },
    ],
  },
};
