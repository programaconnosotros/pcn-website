import type { TrackPractice } from './types';

export const reactPractice: TrackPractice = {
  track: 'react',
  exercises: {
    junior: [
      {
        id: 'lista-filtrable',
        title: 'Lista de usuarios filtrable',
        duration: '30 min',
        statement: [
          'Tenés un array `users` con objetos `{ id: number, name: string, email: string, role: "admin" | "member" }`. Armá un componente `UserList` que reciba ese array por props y lo muestre como lista, con un input de búsqueda arriba.',
          'Al escribir en el input, la lista se filtra por nombre o email sin distinguir mayúsculas de minúsculas. Por ejemplo, con `"ana"` deberían aparecer tanto `Ana Pérez` como `mariana@mail.com`. No hace falta pegarle a ninguna API: los datos llegan por props.',
        ],
        requirements: [
          'El input es controlado: su valor vive en el state del componente.',
          'El filtro ignora mayúsculas, minúsculas y espacios al principio y al final.',
          'Cada ítem usa una `key` estable (el `id`, no el índice).',
          'Mostrá cuántos resultados hay y un mensaje claro cuando no hay ninguno.',
          'Agregá un botón para limpiar la búsqueda que devuelva el foco al input.',
        ],
        followUps: [
          '¿Guardarías la lista filtrada en el state o la calcularías en cada render? ¿Por qué?',
          '¿Cómo agregarías un filtro por `role` que se combine con la búsqueda?',
          'Si la lista tuviera 50.000 usuarios y se sintiera lenta al tipear, ¿qué probarías?',
        ],
        evaluates:
          'Que manejes inputs controlados, state derivado y renderizado de listas con keys correctas sin duplicar estado.',
      },
      {
        id: 'lista-de-tareas',
        title: 'Lista de tareas con filtros',
        duration: '45 min',
        statement: [
          'Construí una lista de tareas. Cada tarea tiene la forma `{ id: string, text: string, done: boolean }`. Arriba hay un formulario para agregar tareas y abajo tres botones para filtrar: `Todas`, `Pendientes` y `Completadas`.',
          'Cada tarea se puede marcar como completada con un checkbox y eliminar con un botón. Al pie mostrá cuántas tareas pendientes quedan, por ejemplo `2 pendientes`.',
        ],
        requirements: [
          'No se pueden agregar tareas vacías o con solo espacios; el input se limpia después de agregar.',
          'El formulario se envía tanto con el botón como con Enter (usá un `<form>` con `onSubmit`).',
          'Las actualizaciones de state son inmutables: nada de `push` o mutar la tarea directamente.',
          'El filtro activo se distingue visualmente del resto.',
          'Separá al menos un componente hijo (por ejemplo `TodoItem`) que reciba callbacks por props.',
        ],
        followUps: [
          '¿Cómo persistirías las tareas para que sobrevivan a un refresh?',
          '¿Usarías `useReducer` en lugar de `useState` acá? ¿Qué ganarías?',
          '¿Cómo harías para editar el texto de una tarea con doble click?',
          '¿Qué tests escribirías para este componente?',
        ],
        evaluates:
          'Que sepas modelar estado de una UI pequeña, comunicar hijo y padre con callbacks y actualizar arrays de forma inmutable.',
      },
      {
        id: 'implementar-debounce',
        title: 'Implementá debounce',
        duration: '30 min',
        statement: [
          'Implementá una función `debounce(fn, ms)` que devuelva una nueva función. Cuando la nueva función se llama varias veces seguidas, `fn` se ejecuta una sola vez, `ms` milisegundos después de la última llamada, con los argumentos de esa última llamada.',
          'Ejemplo: con `const log = debounce(console.log, 300)`, si llamás `log("a")`, `log("b")` y `log("c")` dentro de 100 ms, después de 300 ms se imprime solo `c`. No uses librerías.',
        ],
        requirements: [
          'Cada llamada nueva cancela el timer pendiente y arranca uno nuevo.',
          '`fn` recibe los argumentos de la última llamada.',
          'Se respeta el `this` con el que se llamó a la función devuelta.',
          'Escribí un ejemplo de uso con un input de búsqueda que muestre por qué sirve.',
        ],
        followUps: [
          '¿Cuál es la diferencia entre debounce y throttle? Dame un caso de uso de cada uno.',
          'Agregale un método `cancel()` a la función devuelta.',
          '¿Qué pasa si usás `debounce` dentro de un componente de React sin `useMemo` o `useRef`?',
        ],
        evaluates:
          'Que entiendas closures, timers y el contexto de ejecución en JavaScript, la base de muchas optimizaciones de UI.',
      },
    ],
    'semi-senior': [
      {
        id: 'autocomplete',
        title: 'Autocomplete con debounce y teclado',
        duration: '60 min',
        statement: [
          'Construí un componente `Autocomplete` para buscar ciudades. Mockeá la API con una función `searchCities(query: string, signal?: AbortSignal): Promise<{ id: string, name: string, country: string }[]>` que resuelve después de un delay aleatorio de 100 a 800 ms y filtra una lista fija.',
          'Mientras el usuario escribe se muestran sugerencias debajo del input. Se puede navegar con flechas, elegir con Enter y cerrar con Escape. Al elegir una ciudad, el input muestra su nombre y la lista se cierra.',
          'Ojo: como el delay es aleatorio, una respuesta vieja puede llegar después de una nueva. La UI nunca debería mostrar resultados de una búsqueda que ya no corresponde al texto actual.',
        ],
        requirements: [
          'Las búsquedas se hacen con debounce de 300 ms y solo a partir de 2 caracteres.',
          'Cada búsqueda nueva cancela la anterior con `AbortController`, o como mínimo ignora respuestas viejas.',
          'Estados claros de carga, error y sin resultados.',
          'Navegación con flechas arriba y abajo, Enter para seleccionar y Escape para cerrar.',
          'Accesibilidad básica: `role="combobox"`, `role="listbox"`, `aria-activedescendant` y `aria-expanded`.',
          'Click fuera del componente cierra la lista.',
        ],
        followUps: [
          '¿Cómo cachearías resultados de queries ya hechas?',
          '¿Cómo extraerías la lógica a un hook reutilizable como `useAutocomplete`?',
          '¿Cómo testearías la race condition entre respuestas?',
          '¿Qué cambiarías si la lista de sugerencias pudiera tener miles de ítems?',
        ],
        evaluates:
          'Que manejes efectos asíncronos con cancelación y race conditions, manejo de foco y teclado, y accesibilidad en un componente real.',
      },
      {
        id: 'tabla-paginada',
        title: 'Tabla paginada con orden del servidor',
        duration: '45 min',
        statement: [
          'Tenés que mostrar una tabla de órdenes que vienen de `fetchOrders({ page, pageSize, sortBy, sortDir }): Promise<{ items: Order[], total: number }>`, donde `Order` es `{ id: string, customer: string, amount: number, createdAt: string }`. Mockeá la función con un array de 137 órdenes y un delay de 500 ms.',
          'La tabla muestra 10 órdenes por página, se puede ordenar haciendo click en los encabezados de `customer`, `amount` y `createdAt`, y tiene controles de página anterior y siguiente con el texto `Página 3 de 14`.',
        ],
        requirements: [
          'Página, orden y dirección viven en la URL (query params) para que un refresh o un link compartido mantengan la vista.',
          'Cambiar el orden vuelve a la página 1.',
          'Mientras carga la página siguiente se siguen viendo los datos anteriores con un indicador de carga, sin saltos de layout.',
          'Los montos y fechas se formatean con `Intl.NumberFormat` e `Intl.DateTimeFormat`.',
          'Los botones se deshabilitan en la primera y última página.',
        ],
        followUps: [
          '¿Cómo evitarías mostrar datos de una página vieja si el usuario hace click rápido varias veces?',
          '¿Qué cambiaría si lo hicieras con Server Components en Next.js?',
          '¿Cómo prefetchearías la página siguiente?',
        ],
        evaluates:
          'Que sepas sincronizar estado con la URL, manejar fetching dependiente de parámetros y cuidar la experiencia mientras carga.',
      },
      {
        id: 'implementar-promise-all',
        title: 'Implementá Promise.all',
        duration: '30 min',
        statement: [
          'Implementá `promiseAll(items)` que se comporte como `Promise.all` sin usarlo. Recibe un array que puede mezclar promesas y valores comunes, y devuelve una promesa que resuelve con un array de resultados en el mismo orden de entrada.',
          'Ejemplo: `promiseAll([1, Promise.resolve(2), new Promise(r => setTimeout(() => r(3), 100))])` resuelve con `[1, 2, 3]`. Si cualquiera rechaza, la promesa devuelta rechaza con ese mismo error apenas ocurre.',
        ],
        requirements: [
          'El orden de los resultados respeta el orden de entrada, no el orden en que resuelven.',
          'Los valores que no son promesas se tratan como ya resueltos.',
          'Un array vacío resuelve inmediatamente con `[]`.',
          'Rechaza con el primer error y no espera al resto.',
        ],
        followUps: [
          'Ahora implementá `promiseAllSettled`.',
          '¿Cómo limitarías la cantidad de promesas corriendo en paralelo a `n`?',
          '¿Cuál es la diferencia entre `Promise.all`, `Promise.race` y `Promise.any`?',
        ],
        evaluates:
          'Que entiendas a fondo cómo funcionan las promesas y el orden de ejecución asíncrona en JavaScript.',
      },
    ],
    senior: [
      {
        id: 'lista-virtualizada',
        title: 'Lista virtualizada desde cero',
        duration: '60 min',
        statement: [
          'Tenés que renderizar una lista de 100.000 ítems `{ id: number, label: string }` en un contenedor de 600 px de alto sin que el navegador se trabe. No podés usar librerías de virtualización: implementá un componente `VirtualList` desde cero.',
          'Asumí primero que todas las filas miden 40 px. La API del componente es `<VirtualList items={items} itemHeight={40} height={600} renderItem={(item) => ...} />`.',
        ],
        requirements: [
          'Solo se montan en el DOM las filas visibles más un overscan configurable arriba y abajo.',
          'La scrollbar refleja el alto total de la lista (por ejemplo con un spacer o padding).',
          'El scroll es fluido; evitá recalcular de más en cada evento de scroll.',
          'Las filas usan keys estables para no remontar contenido al scrollear.',
          'Exponé un método o prop para hacer scroll hasta un índice dado.',
        ],
        followUps: [
          '¿Cómo lo adaptarías a filas de alto variable que no conocés de antemano?',
          '¿Qué problemas de accesibilidad trae la virtualización y cómo los mitigás?',
          '¿Cómo combinarías esto con carga infinita desde una API?',
          '¿Cuándo preferirías paginar en vez de virtualizar?',
        ],
        evaluates:
          'Que razones sobre performance de renderizado, el modelo de scroll del navegador y el costo real del DOM.',
      },
      {
        id: 'hook-de-datos-con-cache',
        title: 'Hook de datos con cache y reintentos',
        duration: '60 min',
        statement: [
          'Diseñá e implementá un hook `useQuery(key, fetcher, options)` parecido a una versión mínima de React Query o SWR. Devuelve `{ data, error, status, refetch }`, donde `status` es `"idle" | "loading" | "success" | "error"`.',
          'Si dos componentes montados al mismo tiempo usan la misma `key`, debe hacerse un solo request y ambos reciben el resultado. Si un componente se monta con una `key` ya cacheada, muestra el dato al instante y revalida en segundo plano si el dato tiene más de `staleTime` ms.',
          'Para probarlo, mockeá `fetchUser(id)` que falla el 30% de las veces y tarda entre 200 y 600 ms.',
        ],
        requirements: [
          'Cache compartido a nivel módulo o con un Provider, indexado por `key`.',
          'Deduplicación de requests en vuelo para la misma `key`.',
          'Reintentos con backoff exponencial (por ejemplo 3 intentos: 500 ms, 1 s, 2 s), configurables por opción.',
          'Si el componente se desmonta o cambia la `key`, no se actualiza el state con respuestas viejas.',
          'Tipado genérico en TypeScript: `useQuery<User>` devuelve `data: User | undefined`.',
        ],
        followUps: [
          '¿Cómo invalidarías el cache después de una mutación?',
          '¿Cómo evitarías que el cache crezca para siempre?',
          '¿Cómo lo integrarías con Suspense?',
          '¿Qué ventajas te daría `useSyncExternalStore` para suscribir componentes al cache?',
        ],
        evaluates:
          'Que sepas diseñar una abstracción de data fetching reutilizable, con concurrencia, cache e invalidación bien resueltos y una API pensada para otros devs.',
      },
      {
        id: 'deep-clone',
        title: 'Deep clone con referencias circulares',
        duration: '45 min',
        statement: [
          'Implementá `deepClone(value)` sin usar `structuredClone` ni `JSON.parse(JSON.stringify())`. Tiene que soportar objetos planos, arrays, `Date`, `Map`, `Set`, `RegExp` y primitivos, y devolver una copia donde ninguna referencia mutable se comparta con el original.',
          'También tiene que soportar referencias circulares: si `const a = { name: "a" }; a.self = a;`, entonces `const b = deepClone(a)` cumple `b.self === b` y `b !== a`.',
        ],
        requirements: [
          'Los primitivos y las funciones se devuelven tal cual.',
          'Las referencias circulares y compartidas se resuelven con un `WeakMap` de visitados.',
          'Se preserva el prototipo de los objetos.',
          'Los `Map` y `Set` clonan también sus claves y valores.',
          'Escribí casos de prueba que muestren cada tipo soportado.',
        ],
        followUps: [
          '¿Qué limitaciones tiene `JSON.parse(JSON.stringify())` y cuáles tiene `structuredClone`?',
          '¿Cómo manejarías propiedades con `Symbol` como clave o no enumerables?',
          '¿Cómo lo harías iterativo para no reventar el stack con estructuras muy profundas?',
        ],
        evaluates:
          'Que domines el modelo de objetos de JavaScript, recursión y estructuras de datos auxiliares, cuidando casos borde reales.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'counter',
        title: 'Counter',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: practica closures, la base de hooks, handlers y funciones como `debounce`.',
      },
      {
        slug: 'filter-elements-from-array',
        title: 'Filter Elements from Array',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: reimplementar `filter` te obliga a entender callbacks y funciones de orden superior.',
      },
      {
        slug: 'array-reduce-transformation',
        title: 'Array Reduce Transformation',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: `reduce` aparece todo el tiempo para derivar datos antes de renderizar.',
      },
      {
        slug: 'allow-one-function-call',
        title: 'Allow One Function Call',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: envolver funciones y guardar estado en un closure, un patrón clásico de entrevistas de frontend.',
      },
      {
        slug: 'chunk-array',
        title: 'Chunk Array',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: manipulación de arrays típica para paginar o armar grillas en la UI.',
      },
      {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        why: 'El ejercicio clásico para usar un hash map y pasar de O(n²) a O(n).',
      },
      {
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        why: 'Practica el uso de una pila, útil para parsers y validaciones que aparecen en entrevistas de cualquier nivel.',
      },
    ],
    'semi-senior': [
      {
        slug: 'function-composition',
        title: 'Function Composition',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: componer funciones es la idea detrás de middlewares, HOCs y pipelines de datos.',
      },
      {
        slug: 'timeout-cancellation',
        title: 'Timeout Cancellation',
        difficulty: 'Easy',
        why: 'Del plan 30 Days of JavaScript: cancelar timers es lo mismo que hacés en el cleanup de un `useEffect`.',
      },
      {
        slug: 'debounce',
        title: 'Debounce',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: es de las preguntas más frecuentes en entrevistas de frontend y la base de cualquier búsqueda en vivo.',
      },
      {
        slug: 'promise-time-limit',
        title: 'Promise Time Limit',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: combinar promesas y timers para poner timeouts a requests, algo que usás en producción.',
      },
      {
        slug: 'group-by',
        title: 'Group By',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: extender prototipos y agrupar datos, muy común al preparar listas por categoría.',
      },
      {
        slug: 'event-emitter',
        title: 'Event Emitter',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: el patrón pub/sub detrás de stores, buses de eventos y suscripciones en React.',
      },
      {
        slug: 'longest-substring-without-repeating-characters',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        why: 'El ejemplo más pedido de sliding window con hash map, un patrón que aparece en muchas variantes.',
      },
    ],
    senior: [
      {
        slug: 'execute-asynchronous-functions-in-parallel',
        title: 'Execute Asynchronous Functions in Parallel',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: implementar `Promise.all` a mano, la pregunta asíncrona más típica de frontend senior.',
      },
      {
        slug: 'cache-with-time-limit',
        title: 'Cache With Time Limit',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: un cache con TTL es exactamente lo que hay detrás de React Query o SWR.',
      },
      {
        slug: 'memoize-ii',
        title: 'Memoize II',
        difficulty: 'Hard',
        why: 'Memoizar con argumentos que son referencias obliga a pensar en igualdad por identidad, igual que en `useMemo` y `React.memo`.',
      },
      {
        slug: 'flatten-deeply-nested-array',
        title: 'Flatten Deeply Nested Array',
        difficulty: 'Medium',
        why: 'Del plan 30 Days of JavaScript: recursión controlada por profundidad, útil para árboles de menús, comentarios o rutas.',
      },
      {
        slug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        why: 'Diseño de estructura de datos con `Map` en O(1); aparece seguido en entrevistas senior y en caches de cliente reales.',
      },
      {
        slug: 'minimum-window-substring',
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        why: 'Sliding window avanzado con conteo de frecuencias; mide si podés razonar invariantes bajo presión.',
      },
    ],
  },
};
