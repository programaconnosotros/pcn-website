import type { InterviewGuide } from './types';

export const reactGuide: InterviewGuide = {
  track: 'react',
  summary:
    'Cómo prepararte para una entrevista de frontend con React: JavaScript y TypeScript, CSS y el navegador, hooks, estado, Next.js, performance, testing y el día de la entrevista.',
  sections: [
    {
      id: 'como-es-la-entrevista',
      title: 'Cómo es la entrevista',
      body: [
        'Un proceso típico para frontend con React tiene una charla inicial con recruiting, una entrevista técnica conceptual, un ejercicio práctico (live coding o take-home) y una entrevista con el equipo o el tech lead. En empresas más grandes se suma una ronda de system design de frontend y otra de comportamiento. Preguntá al principio cuántas etapas hay y qué evalúa cada una: te ayuda a preparar lo que importa y no todo a la vez.',
        'Para junior se evalúan los fundamentos: JavaScript (scope, `this`, arrays, async), HTML semántico, CSS (box model, Flexbox, Grid) y React básico (props, state, `key`, eventos, formularios controlados). No esperan que sepas todo, pero sí que razones bien y que entiendas lo que escribís. Un proyecto propio que puedas explicar de punta a punta suma mucho más que una lista de tecnologías.',
        'Para semi-senior el foco pasa a cómo funciona React por dentro y a decisiones del día a día: reconciliación, cuándo memoizar, stale closures, Context vs una librería de estado, TanStack Query, testing con Testing Library, CSR/SSR/SSG y TypeScript con generics. Te van a pedir que justifiques elecciones, no que recites definiciones.',
        'Para senior se espera criterio: Server Components y caching en Next.js, rendering concurrente, Core Web Vitals, arquitectura de una app con varios equipos, design systems, seguridad, observabilidad y cómo subís la calidad de un equipo. Las respuestas buenas mencionan trade-offs, costos y cuándo no usar algo.',
      ],
      checklist: [
        {
          text: 'Saber qué etapas tiene el proceso y qué se evalúa en cada una',
          explanation:
            'En la primera charla con recruiting preguntá directamente: cuántas etapas hay, quién te entrevista en cada una, cuánto dura y qué evalúa (conceptos, live coding, take-home, system design, comportamiento). Preguntá también si el ejercicio es en tu editor o en una plataforma online, si podés buscar documentación y si es React puro o Next.js. Anotalo en una tabla simple con etapa, fecha, formato y qué vas a repasar para cada una. El error común es preparar todo a la vez y llegar flojo a la etapa que define: si hay take-home no te mates con algoritmos, y si hay system design de frontend dedicale tiempo propio.',
        },
        {
          text: 'Tener un proyecto propio que puedas explicar de punta a punta',
          explanation:
            'Elegí un proyecto chico pero real (un buscador que consume una API pública, un tracker de gastos, un clon simple de una app que usás) y asegurate de poder explicar cada decisión. Prepará un recorrido de cinco minutos: qué problema resuelve, stack y por qué, cómo está organizado el código, dónde vive el estado, cómo pide los datos, cómo maneja loading y errores, qué testeaste y qué cambiarías. Tenelo deployado (Vercel, Netlify) con un README claro, porque te pueden pedir compartir pantalla. Lo que suma no es la complejidad sino que no haya nada en el código que no sepas justificar: si copiaste algo de un tutorial o de una IA y no lo entendés, te lo van a preguntar.',
        },
        {
          text: 'Identificar qué temas de tu seniority te cuestan más y priorizarlos',
          explanation:
            'Tomá los temas de esta guía para tu nivel y puntuá cada uno de 1 a 3: 1 si no podrías explicarlo, 2 si lo explicás con dudas, 3 si lo explicás con un ejemplo y sus trade-offs. Para saberlo de verdad, explicalo en voz alta o por escrito sin mirar nada; leer y asentir no cuenta. Empezá por los 1 que más aparecen en entrevistas de tu nivel (por ejemplo, el event loop y `useEffect` para junior, stale closures y caché de datos para semi-senior, Server Components y Core Web Vitals para senior). Repetí la autoevaluación cada semana para ver qué subió.',
        },
        {
          text: 'Poder contar en dos minutos tu experiencia y qué tipo de rol buscás',
          explanation:
            'Armá un pitch con cuatro partes: quién sos y cuánta experiencia tenés, en qué trabajaste recientemente (producto, stack, tu rol), un logro concreto con un resultado medible y qué tipo de rol buscás y por qué esta empresa. Ejemplo: "Soy frontend con tres años en React y Next.js; en mi último trabajo migré el checkout al App Router y bajamos el LCP de 4 a 2 segundos; busco un equipo de producto donde pueda crecer en arquitectura frontend." Ensayalo en voz alta con un timer hasta que salga natural, sin leer. Evitá repetir el CV completo o enumerar tecnologías sin contexto.',
        },
      ],
    },
    {
      id: 'fundamentos-web',
      title: 'JavaScript, TypeScript y la web',
      body: [
        'React es JavaScript, y muchas entrevistas filtran por ahí. Repasá scope y hoisting (`var` vs `let`/`const`, temporal dead zone), closures, `this` y arrow functions, igualdad estricta, desestructuración, spread, y los métodos de array (`map`, `filter`, `reduce`, `find`, `some`). Sabé explicar la diferencia entre copiar por referencia y por valor, porque está detrás de casi todos los bugs de estado en React.',
        'La asincronía es el otro pilar: promesas, `async`/`await`, manejo de errores con `try`/`catch`, `Promise.all` vs `Promise.allSettled`, y el event loop (call stack, microtasks, macrotasks, cuándo pinta el navegador). Una pregunta clásica es predecir el orden de unos `console.log` con `setTimeout` y promesas: practicalo hasta poder explicarlo en voz alta sin dudar.',
        'En TypeScript te van a preguntar `interface` vs `type`, uniones y discriminated unions, narrowing, `unknown` vs `any`, utility types (`Partial`, `Pick`, `Omit`, `Record`) y generics. Un buen ejercicio es tipar un componente genérico como una lista o un select que recibe `items: T[]` y un `renderItem`. Lo que buscan es que uses los tipos para modelar el dominio, no para silenciar al compilador.',
        'No descuides HTML, CSS y el navegador. HTML semántico (`button` y no un `div` con `onClick`, `label` asociado a cada input), box model y `box-sizing`, especificidad, Flexbox vs Grid (una dimensión vs dos) y responsive con media y container queries. Del navegador: el critical rendering path, qué provoca reflows, CORS, cache HTTP y la diferencia entre `localStorage`, `sessionStorage` y cookies, incluido por qué un token de sesión está mejor en una cookie `HttpOnly`.',
      ],
      checklist: [
        {
          text: 'Explicar closures con un ejemplo real de React',
          explanation:
            'Una closure es una función que recuerda las variables del scope donde fue creada, aunque se ejecute después y en otro lugar. En React cada render es una llamada nueva a tu componente, así que cada handler y cada efecto se crea en ese render y "ve" las props y el state de ese render. Ejemplo: `const handleClick = () => setTimeout(() => alert(count), 3000)`; si hacés click y después incrementás `count`, el alert muestra el valor viejo, porque la función capturó el `count` del render en que se creó. Eso no es un bug de React sino closures funcionando, y es la base del stale closure. Los custom hooks también son closures: `useDebounce` guarda el timer y el valor entre llamadas gracias a ellas.',
        },
        {
          text: 'Predecir el orden de ejecución entre `setTimeout`, promesas y código síncrono',
          explanation:
            'El event loop ejecuta primero todo el código síncrono del call stack; cuando queda vacío, vacía la cola de microtasks completa (callbacks de promesas, `await`, `queueMicrotask`) y recién después toma una macrotask (`setTimeout`, eventos, I/O), entre medio el navegador puede pintar. Ejemplo: `console.log(1); setTimeout(() => console.log(2)); Promise.resolve().then(() => console.log(3)); console.log(4)` imprime 1, 4, 3, 2. Dentro de una función `async`, lo que está antes del primer `await` corre síncrono y lo que sigue es una microtask. El error común es pensar que `setTimeout(fn, 0)` corre "inmediatamente": siempre espera a que se vacíen el stack y todas las microtasks.',
        },
        {
          text: 'Explicar por qué mutar un objeto rompe la detección de cambios',
          explanation:
            'React decide si algo cambió comparando referencias con `Object.is`, no recorriendo el contenido. Si hacés `user.name = "Ana"; setUser(user)`, la referencia es la misma, React asume que no hubo cambio y puede saltear el render; lo mismo pasa con `items.push(x)`. Además `React.memo`, `useMemo` y las dependencias de `useEffect` también comparan por referencia, así que una mutación hace que no se enteren. La solución es crear un objeto nuevo: `setUser({ ...user, name: "Ana" })` o `setItems([...items, x])`, o usar `toSorted`, `toSpliced` y `with` en vez de `sort` y `splice`. Ojo con el spread: es una copia superficial, así que los objetos anidados hay que copiarlos también.',
        },
        {
          text: 'Usar discriminated unions para modelar estados como loading, error y success',
          explanation:
            'En vez de tener `isLoading`, `error` y `data` sueltos (que permiten combinaciones imposibles como loading y error a la vez), definís una unión donde un campo literal distingue cada caso: `type State<T> = { status: "loading" } | { status: "error"; error: string } | { status: "success"; data: T }`. Al hacer `if (state.status === "success")` TypeScript hace narrowing y sabe que `state.data` existe; en los otros casos no te deja acceder. Con un `switch` y un `default` que asigna a `never` obtenés un chequeo de exhaustividad: si agregás un estado nuevo, el compilador te marca todos los lugares que no lo manejan. Es la forma de "hacer imposibles los estados imposibles".',
        },
        {
          text: 'Tipar un componente genérico con `T` y explicar por qué',
          explanation:
            'Un componente genérico mantiene la relación entre los tipos de sus props: si recibe `items: T[]`, el `renderItem` y el `onSelect` reciben exactamente ese `T`, sin `any` ni casteos. Ejemplo: `function List<T>({ items, renderItem, getKey }: { items: T[]; renderItem: (item: T) => ReactNode; getKey: (item: T) => string })`. Al usarlo con `items={users}`, TypeScript infiere `T = User` y autocompleta `user.name` dentro de `renderItem`. Podés restringirlo con `T extends { id: string }` si necesitás una propiedad. En un archivo `.tsx` con arrow functions hay que escribir `<T,>` para que no se confunda con JSX. La alternativa sin generics es `unknown` o `any`, que te obliga a castear y pierde la seguridad.',
        },
        {
          text: 'Elegir entre Flexbox y Grid para un layout y maquetarlo sin ayuda',
          explanation:
            'Flexbox distribuye elementos en una dimensión (fila o columna) y el tamaño lo deciden los contenidos: ideal para navbars, toolbars, centrar algo o alinear un ícono con un texto. Grid controla filas y columnas a la vez y el layout lo define el contenedor: ideal para el esqueleto de una página, galerías o formularios alineados. Un patrón clave: `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))` da una grilla responsive sin media queries. Sabé de memoria `justify-content` (eje principal), `align-items` (eje cruzado), `gap`, `flex: 1` y `min-width: 0` para que un hijo flex con texto largo pueda achicarse. Practicá maquetar una card, un header y un layout con sidebar sin buscar nada.',
        },
        {
          text: 'Comparar `localStorage`, `sessionStorage` y cookies para guardar una sesión',
          explanation:
            '`localStorage` persiste hasta que se borra y `sessionStorage` dura lo que la pestaña; ambos son síncronos, solo accesibles desde JavaScript del mismo origen y no se mandan al servidor. Las cookies viajan automáticamente en cada request al dominio y se pueden marcar `HttpOnly` (JavaScript no puede leerlas), `Secure` (solo HTTPS) y `SameSite` (limita el envío cross-site, mitigando CSRF). Para una sesión conviene una cookie `HttpOnly; Secure; SameSite=Lax`: si hay un XSS, el atacante no puede robar el token, mientras que cualquier script inyectado lee `localStorage`. El costo es que tenés que pensar en CSRF y que el servidor maneja la sesión. Usá `localStorage` para preferencias no sensibles como el tema.',
        },
      ],
    },
    {
      id: 'react-fundamentos',
      title: 'React: fundamentos y rendering',
      body: [
        'Tenés que poder explicar qué es un render: React llama a tu componente, obtiene un árbol de elementos, lo compara con el anterior (reconciliación) y aplica al DOM solo las diferencias. Un componente se re-renderiza cuando cambia su state, cuando se re-renderiza su padre o cuando cambia un Context que consume. Entender esto es la base para responder cualquier pregunta de performance.',
        'Repasá props vs state, por qué el estado es inmutable, `key` en listas (y por qué el índice puede romper el estado al reordenar), renderizado condicional, `children` y composición, componentes controlados y no controlados, error boundaries y portals. Para cada concepto pensá un bug real que causa usarlo mal: los entrevistadores valoran mucho más un ejemplo concreto que una definición.',
        'En React 19 conviene conocer las novedades: Actions y `useActionState`, `useOptimistic`, `use` para leer promesas y Context, `ref` como prop sin `forwardRef`, y el React Compiler, que memoiza automáticamente y reduce la necesidad de `useMemo` y `useCallback` manuales. No hace falta haberlos usado en producción, pero sí saber qué problema resuelven.',
      ],
      checklist: [
        {
          text: 'Explicar qué dispara un re-render y qué es la reconciliación',
          explanation:
            'Un componente se re-renderiza cuando cambia su state, cuando se re-renderiza su padre (aunque las props sean iguales, salvo que esté envuelto en `React.memo`) o cuando cambia el value de un Context que consume. Cambiar props por sí solo no dispara nada: las props cambian porque el padre se re-renderizó. Renderizar no es tocar el DOM: React ejecuta la función, obtiene un árbol de elementos nuevo y lo compara con el anterior; esa comparación es la reconciliación. Si en una posición el tipo de elemento es el mismo, reutiliza el nodo y su state y solo actualiza atributos; si cambia el tipo, desmonta todo ese subárbol y monta uno nuevo. En listas usa la `key` para emparejar elementos. Recién en la fase de commit aplica al DOM las diferencias.',
        },
        {
          text: 'Explicar con un ejemplo por qué usar el índice como `key` puede causar bugs',
          explanation:
            'La `key` le dice a React qué elemento es cuál entre renders, y React asocia el state y el DOM de cada item a su key. Si usás el índice y la lista se reordena, se filtra o insertás al principio, el item que estaba en la posición 0 ahora tiene otro contenido pero la misma key, así que React reutiliza el state del anterior. Ejemplo: una lista de tareas con un `input` no controlado o un checkbox con state local por fila; si borrás la primera, el texto escrito "salta" a la tarea siguiente. Además hay renders de más porque todos los items cambian de contenido. Usá un id estable del dato (`todo.id`), nunca `Math.random()`, que fuerza a remontar todo en cada render. El índice solo es aceptable en listas estáticas que nunca cambian de orden.',
        },
        {
          text: 'Diferenciar componentes controlados y no controlados',
          explanation:
            'En un input controlado el valor vive en el state de React: `<input value={name} onChange={e => setName(e.target.value)} />`; React es la fuente de verdad y podés validar, formatear o deshabilitar en cada tecla. En uno no controlado el valor vive en el DOM: usás `defaultValue` y lo leés cuando lo necesitás con un `ref` o con `FormData` al enviar, como hacen las Actions de React 19 con `<form action={...}>`. Controlado da más control pero re-renderiza en cada tecla; no controlado es más simple y rápido para formularios grandes (React Hook Form se apoya en eso). El bug típico es pasar de `value={undefined}` a un string, lo que dispara el warning de cambiar de no controlado a controlado; inicializá con `""`.',
        },
        {
          text: 'Explicar qué captura un error boundary y qué no',
          explanation:
            'Un error boundary es un componente que atrapa errores lanzados durante el render, en los métodos de ciclo de vida y en constructores de sus hijos, y muestra un fallback en lugar de desmontar toda la app. Se escriben como clase con `static getDerivedStateFromError` y `componentDidCatch`, o con la librería `react-error-boundary`; en Next.js, `error.tsx` crea uno por segmento de ruta. No captura errores en event handlers (usá `try`/`catch` ahí), en código asíncrono como un `setTimeout` o una promesa sin manejar, en el render del servidor, ni errores del propio boundary. Si querés que un error asíncrono llegue al boundary, guardalo en state y relanzalo en el render, o usá `use` con una promesa que rechaza. Ubicalos por zona para que un widget roto no tire la página entera.',
        },
        {
          text: 'Contar qué resuelve el React Compiler y qué cambia en tu forma de escribir',
          explanation:
            'El React Compiler (estable desde la versión 1.0, a fines de 2025) es un plugin de build que analiza tus componentes y hooks y agrega memoización automática: cachea valores, funciones y JSX para que solo se recalculen cuando cambian sus dependencias reales. Resuelve los re-renders innecesarios y las referencias inestables sin que escribas `useMemo`, `useCallback` ni `React.memo` a mano. A cambio exige que respetes las reglas de React: componentes puros, sin mutar props ni state, sin leer refs durante el render; si un componente las rompe, el compilador lo saltea. En la práctica escribís código más simple y dejás la memoización manual para casos puntuales, como estabilizar una dependencia de un efecto. Para verificar qué optimizó, React DevTools marca los componentes compilados.',
        },
      ],
    },
    {
      id: 'hooks',
      title: 'Hooks',
      body: [
        '`useState` y `useEffect` son lo primero que te preguntan, y `useEffect` es donde más se equivoca la gente. Su propósito es sincronizar con algo externo a React (suscripciones, timers, APIs del navegador), no derivar estado ni reaccionar a eventos del usuario. Si podés calcular un valor durante el render, no necesitás un efecto. Sabé explicar el array de dependencias, el cleanup y por qué en desarrollo con Strict Mode el efecto corre dos veces.',
        'El stale closure es una pregunta casi segura en semi-senior: un handler o un efecto que captura un valor viejo porque se creó en un render anterior. Las soluciones son declarar bien las dependencias, usar la forma funcional del setter (`setCount(c => c + 1)`), guardar el valor en un `useRef` o, en React 19.2, usar `useEffectEvent` para lógica que no debería re-disparar el efecto.',
        'Conocé cuándo usar `useReducer` (estado con varias transiciones relacionadas), `useRef` (valores mutables que no disparan render, o referencias al DOM), `useMemo` y `useCallback` (cálculos caros o referencias estables que realmente importan) y cómo escribir custom hooks para reutilizar lógica, no markup. Un error común es memoizar todo por las dudas: tiene costo y ensucia el código, y con el React Compiler cada vez hace menos falta.',
      ],
      checklist: [
        {
          text: 'Explicar cuándo no necesitás un `useEffect`',
          explanation:
            'No necesitás un efecto para derivar datos: si `fullName` sale de `firstName` y `lastName`, calculalo en el render en vez de guardarlo en state y sincronizarlo con un efecto, que causa un render extra y bugs de desincronización. Tampoco para reaccionar a eventos del usuario: la lógica de "al enviar el formulario" va en el handler, no en un efecto que mira un flag. Para resetear state cuando cambia una prop, usá una `key` en el componente. Para notificar al padre, llamá al callback en el mismo handler donde cambiás el state. Un efecto sí corresponde para sincronizar con algo externo: suscripciones, timers, APIs del navegador, una librería no React. Pregunta guía: ¿esto pasa porque el componente se mostró, o porque el usuario hizo algo?',
        },
        {
          text: 'Reproducir y arreglar un stale closure',
          explanation:
            'Reproducción clásica: `useEffect(() => { const id = setInterval(() => setCount(count + 1), 1000); return () => clearInterval(id); }, [])`. El intervalo se crea una sola vez y su closure captura `count = 0`, así que siempre setea 1. Arreglos: usar el setter funcional `setCount(c => c + 1)`, que no depende del valor capturado; declarar `count` en las dependencias (funciona, pero recrea el intervalo en cada cambio); guardar el valor en un `useRef` que actualizás en un efecto; o, para leer el último valor dentro de un efecto sin re-dispararlo, `useEffectEvent` (estable desde React 19.2). El error es silenciar la regla `react-hooks/exhaustive-deps` del linter: casi siempre es la que te avisa del stale closure.',
        },
        {
          text: 'Explicar cuándo usar `useMemo` y `useCallback` y cuándo no',
          explanation:
            '`useMemo` cachea el resultado de un cálculo y `useCallback` cachea una función entre renders, mientras sus dependencias no cambien. Valen la pena en tres casos: un cálculo realmente caro (filtrar o ordenar miles de items, medido con el Profiler), pasar un objeto o función a un hijo envuelto en `React.memo` (si no, la referencia nueva rompe la memo), y estabilizar algo que es dependencia de un `useEffect` o de otro hook. No valen la pena para cálculos triviales ni para funciones que se pasan a elementos nativos como `button`: agregan costo de comparación y ruido. Con el React Compiler activo, la mayoría se vuelven innecesarios. Error común: memoizar con dependencias que cambian en cada render, lo que no cachea nada.',
        },
        {
          text: 'Elegir entre `useState`, `useReducer` y `useRef` para un caso dado',
          explanation:
            '`useState` para valores independientes que se muestran en pantalla: un input, un toggle, un modal abierto. `useReducer` cuando hay varias piezas de estado que cambian juntas o el próximo estado depende de reglas: un formulario de varios pasos, un carrito con agregar, quitar y vaciar, una máquina de estados `idle | loading | error`; centraliza la lógica en una función pura fácil de testear y el `dispatch` es estable. `useRef` para valores que tenés que recordar entre renders pero que no deben disparar un render: el id de un timer, el valor anterior, una instancia de una librería o un nodo del DOM. El error típico es guardar en `useRef` algo que se muestra (la UI no se actualiza) o en `useState` algo que no se muestra (renders de más).',
        },
        {
          text: 'Escribir un custom hook como `useDebounce` o `useFetch` y explicar sus reglas',
          explanation:
            'Un custom hook es una función que empieza con `use` y llama a otros hooks para reutilizar lógica con estado, no markup; cada componente que lo usa tiene su propio state. Ejemplo: `function useDebounce<T>(value: T, delay = 300) { const [debounced, setDebounced] = useState(value); useEffect(() => { const id = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(id); }, [value, delay]); return debounced; }`; el cleanup cancela el timer anterior en cada cambio. Las reglas de los hooks: llamarlos solo en el nivel superior (nunca dentro de `if`, loops o callbacks) y solo desde componentes u otros hooks, porque React los identifica por el orden de llamada. En un `useFetch` mostrá que manejás loading, error, cancelación con `AbortController` y race conditions, y aclará que en producción usarías TanStack Query.',
        },
      ],
    },
    {
      id: 'estado-y-datos',
      title: 'Estado y datos',
      body: [
        'La pregunta senior por excelencia es "dónde vive cada pieza de estado". Separá cuatro tipos: estado local de UI (un modal abierto), estado compartido de cliente (un carrito), estado del servidor (datos que viven en una API) y estado de la URL (filtros, página, tab). Cada uno tiene su herramienta: `useState`, Context o Zustand, TanStack Query o Server Components, y los search params. Meter todo en un store global es el error más común.',
        'Context sirve para valores que cambian poco (tema, usuario, idioma), pero cada cambio re-renderiza a todos sus consumidores. Si lo usás para estado que cambia seguido, la app se vuelve lenta. Sabé explicar cómo mitigarlo (dividir contextos, memoizar el value, o pasar a una librería con selectores) y qué es el prop drilling y cuándo en realidad no es un problema.',
        'Para datos remotos, TanStack Query resuelve lo que un `fetch` en `useEffect` no: caché, deduplicación, reintentos, revalidación, estados de loading y error, race conditions y paginación. En formularios complejos, React Hook Form con un schema de Zod es el estándar de facto. Lo importante en la entrevista es que muestres que entendés los problemas, no solo el nombre de la librería.',
      ],
      checklist: [
        {
          text: 'Clasificar el estado de una pantalla en local, compartido, servidor y URL',
          explanation:
            'Tomá una pantalla concreta, por ejemplo un listado de productos con filtros: el dropdown abierto es estado local (`useState` en ese componente); el carrito que se ve en el header y en el checkout es estado compartido de cliente (Context o Zustand); los productos que vienen de la API son estado del servidor (TanStack Query o un Server Component, con su caché); y el filtro, la página y el orden son estado de la URL (search params), porque el usuario espera poder compartir el link, recargar y usar el botón atrás. La pregunta para clasificar es: ¿quién es el dueño del dato y quién necesita leerlo? El error típico es copiar datos del servidor a un store global, donde quedan desactualizados y hay que reimplementar caché, o tener filtros en state que se pierden al recargar.',
        },
        {
          text: 'Explicar las limitaciones de Context y cómo mitigarlas',
          explanation:
            'Context resuelve el transporte de un valor a través del árbol sin prop drilling, pero no es un gestor de estado: cuando cambia el value, todos los componentes que lo consumen se re-renderizan, aunque solo usen una parte. Además, si el provider crea un objeto nuevo en cada render (`value={{ user, setUser }}`), los consumidores renderizan aunque nada haya cambiado. Mitigaciones: memoizar el value con `useMemo` (o dejarlo al React Compiler), separar en contextos distintos lo que cambia seguido de lo que no (por ejemplo state y dispatch por separado), bajar el provider al subárbol que lo necesita, o pasar a Zustand, Jotai o Redux, que permiten suscribirse con selectores a una porción. Context es ideal para tema, usuario, idioma o dependencias inyectadas.',
        },
        {
          text: 'Enumerar los problemas de hacer fetch en un `useEffect`',
          explanation:
            'Race conditions: si el usuario cambia rápido de búsqueda, una respuesta vieja puede llegar después de la nueva y pisarla; hay que cancelar con `AbortController` o ignorar con un flag en el cleanup. Waterfalls: el fetch empieza recién después de montar, y si los hijos también hacen fetch, las requests van en serie. No hay caché ni deduplicación, así que dos componentes piden lo mismo y volver a una pantalla vuelve a cargar. Tenés que manejar a mano loading, error, reintentos y revalidación, y en Strict Mode el efecto corre dos veces en desarrollo. Tampoco funciona en SSR, porque los efectos no corren en el servidor. Por eso se usa TanStack Query, SWR, el loader del router o Server Components.',
        },
        {
          text: 'Explicar cómo invalidar y revalidar datos después de una mutación',
          explanation:
            'Después de crear, editar o borrar algo, la caché tiene datos viejos y hay que actualizarla. Con TanStack Query, en el `onSuccess` de `useMutation` llamás a `queryClient.invalidateQueries({ queryKey: ["todos"] })`: marca esas queries como viejas y refetchea las que están en pantalla. Si la respuesta trae el objeto actualizado, podés escribirlo directo con `setQueryData` y evitar un request. Para que se sienta instantáneo, una actualización optimista modifica la caché antes de la respuesta y hace rollback en `onError`. En Next.js con Server Actions, después de la mutación llamás a `revalidatePath` o `revalidateTag` (o `updateTag` para ver tu propio cambio en la misma respuesta). El error común es diseñar mal las query keys y no poder invalidar con precisión.',
        },
        {
          text: 'Diseñar la validación de un formulario con un schema compartido',
          explanation:
            'Definís un único schema, por ejemplo con Zod: `const signupSchema = z.object({ email: z.email(), password: z.string().min(8) })`, y derivás el tipo con `z.infer<typeof signupSchema>`. En el cliente lo conectás a React Hook Form con `zodResolver` para mostrar errores por campo mientras el usuario escribe o al enviar. En el servidor (API route o Server Action) volvés a validar con `signupSchema.safeParse(input)`, porque la validación del cliente es solo UX y cualquiera puede mandar un request a mano. Compartir el schema evita que las reglas diverjan entre front y back. Las reglas que dependen de la base, como "el email ya existe", solo se pueden validar en el servidor; devolvé esos errores mapeados al campo correspondiente.',
        },
      ],
    },
    {
      id: 'nextjs-y-rendering',
      title: 'Next.js y estrategias de rendering',
      body: [
        'Empezá por los conceptos: CSR (todo se arma en el navegador), SSR (HTML por request), SSG (HTML en build) e ISR o revalidación (HTML estático que se regenera). Cada uno tiene trade-offs de SEO, tiempo hasta el primer contenido, costo de servidor y frescura de datos. La hidratación es cuando React toma el HTML del servidor y le agrega interactividad; un hydration mismatch aparece si el servidor y el cliente renderizan distinto, por ejemplo usando `Date.now()` o `window` en el render.',
        'Con el App Router de Next.js los componentes son Server Components por defecto: corren solo en el servidor, pueden leer la base o una API directamente y no suman JavaScript al bundle. Marcás con `"use client"` solo las hojas interactivas. Sabé explicar qué se puede pasar de server a client (props serializables), por qué no podés usar hooks en un Server Component y cómo componer ambos usando `children`.',
        'En senior te van a preguntar por caching y mutaciones. Conocé la directiva `"use cache"` y la revalidación por tag o por path, el streaming con `loading.tsx` y Suspense, y las Server Actions. Recordá que una Server Action es un endpoint público: validá el input, verificá autenticación y autorización adentro, y no confíes en que solo la llama tu formulario.',
      ],
      checklist: [
        {
          text: 'Comparar CSR, SSR, SSG e ISR con sus trade-offs',
          explanation:
            'CSR (client-side rendering): el servidor manda un HTML casi vacío y el JavaScript arma la página en el navegador; es barato de servir y muy interactivo, pero el primer contenido tarda, el SEO depende de que el crawler ejecute JS y en dispositivos lentos pesa. Sirve para dashboards detrás de login. SSR (server-side rendering): el HTML se genera en cada request con datos frescos; mejora SEO y primer contenido y permite personalizar por usuario, a cambio de costo de servidor por request y un TTFB que depende de qué tan rápido respondan tus datos. Sirve para páginas personalizadas o con datos que cambian todo el tiempo. SSG (static site generation): el HTML se genera en el build y se sirve desde un CDN; es lo más rápido y barato, pero los datos quedan congelados hasta el próximo deploy. Sirve para docs, blogs y landings. ISR o revalidación: HTML estático que se regenera en segundo plano cada cierto tiempo o cuando lo invalidás por tag o path; combina velocidad de CDN con datos razonablemente frescos, a cambio de que algún usuario pueda ver una versión vieja por un rato. Sirve para catálogos o páginas de producto. En la práctica, Next.js mezcla las cuatro por ruta y hasta por componente: con Partial Prerendering una misma página tiene un shell estático y huecos dinámicos que llegan por streaming.',
        },
        {
          text: 'Explicar qué es un hydration mismatch y cómo evitarlo',
          explanation:
            'Al hidratar, React recorre el HTML que vino del servidor y espera que coincida exactamente con lo que renderiza en el cliente para adjuntar los event handlers. Si difiere, tira un error de hydration mismatch y descarta ese HTML para volver a renderizar en el cliente, perdiendo la ventaja del SSR y causando saltos visuales. Causas típicas: `Date.now()`, `Math.random()` o fechas formateadas con la zona horaria del navegador; leer `window`, `localStorage` o `navigator` durante el render; HTML inválido como un `div` dentro de un `p`; y extensiones del navegador que modifican el DOM. Soluciones: generar el valor en el servidor y pasarlo como prop, leer lo del navegador en un `useEffect` después de montar, usar `useId` para ids, o cargar el componente solo en el cliente con `dynamic(..., { ssr: false })`. `suppressHydrationWarning` es para casos puntuales como un timestamp, no para tapar bugs.',
        },
        {
          text: 'Decidir qué componentes van con `"use client"` y por qué',
          explanation:
            'Un componente necesita ser Client Component si usa state o efectos (`useState`, `useEffect`), event handlers como `onClick`, APIs del navegador (`window`, `localStorage`) o librerías que dependen de eso. Todo lo demás conviene dejarlo como Server Component: puede leer datos directo, no suma JavaScript al bundle y mantiene secretos en el servidor. `"use client"` marca un límite: ese archivo y todo lo que importa pasa a ser parte del bundle del cliente, por eso se pone lo más abajo posible en el árbol, en las hojas interactivas (un botón de like, un buscador), no en el layout. Para meter contenido de servidor dentro de un componente cliente, pasalo como `children` en vez de importarlo. El error común es marcar la página entera con `"use client"` por un solo botón.',
        },
        {
          text: 'Explicar cómo revalidar datos cacheados después de una mutación',
          explanation:
            'En Next.js con Cache Components marcás funciones o componentes con `"use cache"` y les ponés etiquetas con `cacheTag("posts")` y una duración con `cacheLife`. Después de una mutación, dentro de una Server Action, tenés tres herramientas: `updateTag("posts")` expira la caché y hace que el usuario que mutó vea su cambio en la misma respuesta (read-your-writes); `revalidateTag("posts", "max")` marca la caché como vieja y la regenera en segundo plano (stale-while-revalidate), útil cuando no hace falta inmediatez; y `revalidatePath("/posts")` invalida todo lo de una ruta. `refresh()` refresca datos no cacheados de la página actual. Etiquetá por entidad (`post-123`) y por colección (`posts`) para invalidar con precisión. El error común es revalidar todo con `revalidatePath("/", "layout")` y perder los beneficios de la caché.',
        },
        {
          text: 'Enumerar las precauciones de seguridad de una Server Action',
          explanation:
            'Una Server Action se expone como un endpoint POST al que cualquiera puede llamar con los argumentos que quiera, aunque en tu UI solo la use un formulario de admin. Por eso, dentro de la acción: validá el input con un schema (Zod) porque los tipos de TypeScript no existen en runtime; verificá autenticación (hay sesión) y autorización (este usuario puede editar este recurso, no solo "está logueado"); no confíes en ids ocultos en el form sin chequear que pertenecen al usuario; aplicá rate limiting a acciones sensibles; y devolvé errores genéricos sin filtrar detalles internos. Next.js agrega protección CSRF comparando el origen y genera ids de acción no adivinables, pero eso no reemplaza la autorización. Tampoco confíes en el proxy (antes middleware) como única barrera: chequeá en la acción misma, cerca del dato.',
        },
      ],
    },
    {
      id: 'performance',
      title: 'Performance',
      body: [
        'Antes de optimizar, medí. Las herramientas son el React DevTools Profiler (qué componentes renderizan y por qué), la pestaña Performance del navegador, Lighthouse y los datos reales de usuarios. Un candidato que dice "primero perfilo y después decido" ya da mejor impresión que uno que arranca enumerando `React.memo` y `useMemo`.',
        'Las Core Web Vitals son LCP (cuánto tarda el contenido principal), INP (cuánto tarda la página en responder a una interacción) y CLS (cuánto se mueve el layout). Para cada una tené dos o tres técnicas: imágenes optimizadas y con dimensiones, preload del recurso LCP, menos JavaScript en el hilo principal, `useTransition` para actualizaciones no urgentes, reservar espacio para contenido que llega tarde.',
        'Para el bundle: code splitting por ruta, `lazy` y `import()` dinámico para componentes pesados, revisar dependencias con un analizador, evitar librerías enteras cuando usás una función, y mover lógica a Server Components. Para listas largas, virtualización. Y para re-renders, primero arreglá la estructura (bajar el estado, pasar `children`) antes de memoizar.',
      ],
      checklist: [
        {
          text: 'Usar el Profiler para encontrar un re-render innecesario',
          explanation:
            'En React DevTools, pestaña Profiler, activá "Record why each component rendered while profiling" en la configuración, grabá, hacé la interacción lenta y pará. El flamegraph muestra cada commit: los componentes en gris no renderizaron, los de color sí, y el ancho y el color indican cuánto tardaron. Al seleccionar uno ves por qué renderizó: cambió su state, cambiaron props (cuáles), cambió un hook o un Context, o renderizó su padre. Un re-render innecesario típico es un item de lista que renderiza al tipear en un buscador porque recibe una función o un objeto nuevo en cada render. Arreglo: primero estructura (bajar el state al componente que lo usa, pasar contenido como `children`), y si no alcanza, `React.memo` con props estables. También sirve "Highlight updates when components render" para verlo en vivo.',
        },
        {
          text: 'Explicar LCP, INP y CLS y una mejora concreta para cada una',
          explanation:
            'LCP (Largest Contentful Paint) mide cuánto tarda en pintarse el elemento más grande visible, normalmente una imagen hero o un título; bueno es menos de 2,5 segundos. Se mejora sirviendo HTML con SSR o estático, precargando la imagen LCP con `fetchpriority="high"` (o `priority` en `next/image`), sin `loading="lazy"` en ella y con formatos como AVIF o WebP. INP (Interaction to Next Paint) mide la latencia entre una interacción y el siguiente frame pintado, tomando las peores del uso real; bueno es menos de 200 ms. Se mejora partiendo tareas largas, mandando menos JavaScript, usando `useTransition` para updates no urgentes y evitando re-renders masivos. CLS (Cumulative Layout Shift) mide cuánto se mueve el contenido inesperadamente; bueno es menos de 0,1. Se mejora poniendo `width` y `height` o `aspect-ratio` a imágenes, reservando espacio para banners y anuncios y usando `font-display` con fuentes de métricas ajustadas (`next/font` lo hace). Medí con datos de campo (CrUX, `web-vitals`), no solo con Lighthouse.',
        },
        {
          text: 'Explicar cómo reducir el tamaño del bundle',
          explanation:
            'Primero medí con un analizador (`@next/bundle-analyzer`, `vite-bundle-visualizer` o el de tu bundler) para ver qué pesa. Después: code splitting por ruta (Next.js y los routers modernos lo hacen solos) y carga diferida de componentes pesados que no se ven al inicio con `lazy` e `import()` dinámico, como un editor, un gráfico o un modal. Reemplazá dependencias grandes o importá solo lo que usás (`date-fns` en vez de Moment, `lodash-es/debounce` en vez de todo lodash) para que funcione el tree shaking. En Next.js, mové lógica y librerías de render a Server Components, que no mandan JS al cliente, y bajá el límite de `"use client"`. Cuidado con los barrel files (`index.ts` que reexportan todo), que a veces arrastran módulos de más. Fijá un presupuesto de tamaño en CI para que no vuelva a crecer.',
        },
        {
          text: 'Explicar cuándo virtualizar una lista',
          explanation:
            'Virtualizar es renderizar solo los items visibles más un margen, y reciclar a medida que scrolleás, en vez de montar miles de nodos en el DOM. Conviene cuando la lista tiene cientos o miles de items o items pesados, y medís que el render inicial, el scroll o la memoria sufren; con 50 filas simples no hace falta y agrega complejidad. Librerías: TanStack Virtual o `react-window`. Trade-offs: la búsqueda del navegador con Ctrl+F no encuentra items que no están en el DOM, la accesibilidad necesita cuidado (anunciar el total, manejar el foco), y los items de alto variable requieren medición dinámica. Alternativas antes de virtualizar: paginar, scroll infinito con carga por páginas, o `content-visibility: auto` en CSS, que saltea el render de lo que está fuera de pantalla.',
        },
        {
          text: 'Explicar para qué sirven `useTransition` y Suspense',
          explanation:
            '`useTransition` marca una actualización de estado como no urgente: `startTransition(() => setFilter(value))`. React prioriza las urgentes (escribir en el input) y renderiza la transición en segundo plano, interrumpiéndola si llega otra; `isPending` te deja mostrar un indicador sin bloquear la UI. Sirve para filtrar listas grandes, cambiar de tab o navegar; en React 19 también acepta funciones async (Actions). `useDeferredValue` es su pariente cuando no controlás el setter. Suspense declara un fallback mientras algo de su subárbol no está listo: un componente `lazy`, datos leídos con `use(promise)` o un Server Component que espera; en Next.js habilita streaming, mandando el shell primero y cada parte cuando llega. Combinados, una transición evita que un contenido ya visible se reemplace por el fallback al navegar.',
        },
      ],
    },
    {
      id: 'testing-y-calidad',
      title: 'Testing, accesibilidad y seguridad',
      body: [
        'Para testing de componentes, el estándar es Vitest o Jest con Testing Library: testeás lo que ve y hace el usuario (buscar por rol y texto, hacer click, esperar un resultado), no detalles de implementación como el state interno. Para la red, MSW permite mockear la API a nivel de request. Los flujos críticos van con E2E en Playwright. Sabé explicar la pirámide o el trofeo de testing y qué testearías primero en una app sin tests.',
        'Accesibilidad aparece en todas las seniorities: HTML semántico, labels en inputs, contraste, navegación por teclado, foco visible y textos alternativos. En senior te pueden pedir cómo harías accesible un modal (foco atrapado, `Escape` para cerrar, devolver el foco al cerrar, `role="dialog"`) o un combobox. La regla de oro: usá elementos nativos antes que ARIA.',
        'En seguridad, lo central es XSS (React escapa por defecto, el riesgo está en `dangerouslySetInnerHTML` y en URLs `javascript:`), CSRF, dónde guardar tokens, Content Security Policy, secretos que nunca deben llegar al bundle y dependencias vulnerables. Sumale observabilidad: captura de errores con Sentry o similar, source maps y métricas de usuarios reales.',
      ],
      checklist: [
        {
          text: 'Escribir un test con Testing Library que busque por rol y simule una interacción',
          explanation:
            'La idea es testear como lo usaría una persona: buscar elementos por rol accesible y nombre, interactuar con `userEvent` y afirmar lo que se ve. Ejemplo: `const user = userEvent.setup(); render(<Counter />); await user.click(screen.getByRole("button", { name: /sumar/i })); expect(screen.getByText("Total: 1")).toBeInTheDocument();`. Usá `getBy` cuando el elemento tiene que estar, `queryBy` para afirmar que no está y `findBy` (async) para lo que aparece después de una promesa. Preferí `userEvent` sobre `fireEvent` porque simula la secuencia real (foco, teclas, click). Buscar por rol además valida accesibilidad: si no podés encontrar el botón por rol, un lector de pantalla tampoco. Error común: testear state interno o clases CSS, que rompe el test al refactorizar sin que cambie el comportamiento.',
        },
        {
          text: 'Explicar qué testearías con unit, integración y E2E',
          explanation:
            'Unit: funciones puras con lógica de negocio (calcular el total de un carrito, formatear precios, un reducer, validaciones); son rápidos y baratos, tené muchos. Integración: un componente o una pantalla con sus hijos reales, renderizada con Testing Library y la red mockeada con MSW, verificando el flujo completo (cargar, filtrar, enviar un formulario, ver el error); es donde está la mejor relación costo-confianza en frontend, por eso el "testing trophy" pone ahí el grueso. E2E: pocos flujos críticos de negocio en un navegador real con Playwright contra la app levantada (login, checkout, alta de algo), porque son lentos y más frágiles. Sumale TypeScript y lint como base estática. En una app sin tests, empezá por un E2E del flujo que da plata y tests de integración de lo que más se rompe.',
        },
        {
          text: 'Enumerar los requisitos de accesibilidad de un modal',
          explanation:
            'El contenedor necesita `role="dialog"` y `aria-modal="true"`, con `aria-labelledby` apuntando al título. Al abrir, el foco va al primer elemento interactivo o al título; mientras está abierto, Tab y Shift+Tab quedan atrapados adentro (focus trap) y el resto de la página es inerte (atributo `inert`). Escape cierra, y al cerrar el foco vuelve al botón que lo abrió. También: botón de cerrar con nombre accesible, bloquear el scroll del fondo y contraste suficiente. Hoy la forma más simple es el elemento nativo `<dialog>` con `showModal()`, que da foco, `inert` del fondo, Escape y el backdrop gratis; si no, usá un componente probado como los de Radix o React Aria en vez de reimplementarlo.',
        },
        {
          text: 'Explicar cómo React previene XSS y dónde no lo hace',
          explanation:
            'XSS es cuando un atacante logra ejecutar JavaScript en tu página, por ejemplo guardando `<img src=x onerror=...>` en su nombre de usuario. React escapa todo lo que interpolás en JSX: `{user.name}` se inserta como texto, nunca como HTML, así que ese payload se ve literal. No te protege en: `dangerouslySetInnerHTML` (si renderizás HTML de usuarios, sanitizalo con DOMPurify), URLs en `href` o `src` con `javascript:` (validá que empiecen con `http` o `https`; React 19 bloquea `javascript:` pero no conviene depender de eso), manipular el DOM directo con refs e `innerHTML`, `eval` o librerías de terceros que inyectan HTML, y datos serializados en un `script` del SSR sin escapar. Una Content Security Policy estricta es la segunda línea de defensa.',
        },
        {
          text: 'Explicar cómo monitorearías errores y performance en producción',
          explanation:
            'Para errores, un servicio como Sentry captura excepciones no manejadas, promesas rechazadas y errores atrapados por error boundaries, con el stack trace legible gracias a source maps subidos en el build (sin publicarlos), más el contexto: release, navegador, usuario anónimo y los pasos previos (breadcrumbs). Configurá alertas por errores nuevos o picos después de un deploy y agrupalos para no ahogarte en ruido. Para performance, medí con datos reales de usuarios (RUM): la librería `web-vitals` o el reporte integrado de tu plataforma manda LCP, INP y CLS por página, y mirás el percentil 75, no el promedio. Sumale tracing de requests lentos y session replay con datos sensibles enmascarados. Lo clave: conectar cada métrica con un release para saber qué deploy la empeoró.',
        },
      ],
    },
    {
      id: 'ejercicios-practicos',
      title: 'Live coding, take-home y system design',
      body: [
        'Los live coding de React suelen ser componentes chicos con estado y datos: un buscador con debounce que consume una API, un todo list, un contador con reglas, un acordeón o tabs accesibles, paginación o un formulario con validación. Practicalos con un timer de 45 minutos. Arrancá por lo que funciona, después manejá loading y error, y por último pulí. Hablá mientras escribís.',
        'En un take-home se evalúa tanto el código como las decisiones: estructura de carpetas clara, componentes con responsabilidades simples, tipos, algunos tests de lo importante, manejo de estados vacíos y de error, y un README que explique cómo correrlo, qué decisiones tomaste y qué harías con más tiempo. No sobrediseñes: un take-home con tres librerías de estado da peor impresión que uno simple y prolijo.',
        'El system design de frontend (senior) te pide diseñar algo como un feed infinito, un autocomplete, un editor colaborativo o un dashboard. Una estructura útil: requisitos y alcance, componentes y responsabilidades, modelo de datos y API, manejo de estado y caché, performance (virtualización, paginación, imágenes), accesibilidad, errores y offline, y cómo lo medirías. Mencioná trade-offs explícitamente.',
      ],
      checklist: [
        {
          text: 'Resolver un buscador con debounce y manejo de race conditions en 45 minutos',
          explanation:
            'Estructura: un input controlado con `query`, un `useDebounce(query, 300)` y un efecto que depende del valor debounced. Dentro del efecto, si el texto está vacío limpiás resultados; si no, creás un `AbortController`, hacés `fetch(url, { signal })`, manejás loading, error y resultados, y en el cleanup llamás a `controller.abort()`. Ese abort resuelve la race condition: si llega una búsqueda nueva, la anterior se cancela y su respuesta nunca pisa a la nueva (ignorá el `AbortError` en el `catch`). El debounce evita un request por tecla. Orden recomendado: primero que busque, después debounce, después loading, error y "sin resultados", después la cancelación, y si sobra tiempo, accesibilidad y resaltar coincidencias. Practicalo contra una API pública hasta hacerlo en 30 minutos.',
        },
        {
          text: 'Construir un componente de tabs o acordeón accesible por teclado',
          explanation:
            'Tabs: un contenedor con `role="tablist"`, cada pestaña es un `button` con `role="tab"`, `aria-selected` y `aria-controls`, y cada panel tiene `role="tabpanel"` con `aria-labelledby`. Patrón de teclado: solo la tab activa tiene `tabIndex={0}` y las demás `-1` (roving tabindex), las flechas izquierda y derecha mueven el foco entre tabs, Home y End van a la primera y última, y Tab salta al panel. Acordeón: cada encabezado es un `button` dentro de un heading, con `aria-expanded` y `aria-controls` hacia su panel; Enter y Espacio lo abren solos por ser `button`. Para el acordeón también existe `<details>` y `<summary>` nativo. Error común: usar `div` con `onClick`, que no recibe foco ni responde al teclado.',
        },
        {
          text: 'Tener un take-home de ejemplo con README y tests',
          explanation:
            'Hacé uno antes de que te lo pidan: por ejemplo, un listado de una API pública con búsqueda, filtros en la URL, detalle, y estados de loading, vacío y error, en 4 a 6 horas. Usá Vite o Next.js con TypeScript estricto, una estructura por features, un cliente de datos (TanStack Query o Server Components), tres o cuatro tests de integración con Testing Library y MSW, y lint configurado. El README tiene que tener: cómo correrlo en un comando, decisiones y por qué (qué librería y qué descartaste), trade-offs, qué no hiciste por tiempo y qué harías después. Commits chicos y con mensajes claros, porque los miran. Te sirve de plantilla y para mostrar en entrevistas.',
        },
        {
          text: 'Diseñar un feed infinito cubriendo datos, estado, performance y errores',
          explanation:
            'Requisitos: qué items muestra, si se actualiza en tiempo real, mobile o desktop, volumen esperado. Datos: paginación por cursor (`?cursor=abc&limit=20`) y no por offset, porque con items nuevos el offset duplica o saltea; la respuesta trae `items` y `nextCursor`. Estado: `useInfiniteQuery` de TanStack Query maneja páginas, caché y refetch; para items nuevos, un banner "hay 5 posts nuevos" en vez de empujar el contenido. Carga: un `IntersectionObserver` sobre un sentinel al final pide la página siguiente antes de llegar. Performance: virtualización si el feed crece mucho, imágenes lazy con dimensiones reservadas (evita CLS), skeletons y restaurar la posición de scroll al volver. Errores: reintento por página sin perder lo cargado, estado vacío, offline. Accesibilidad: `role="feed"`, foco manejable y un botón alternativo "cargar más". Cerrá con métricas: tiempo a primer item, INP al scrollear, tasa de errores.',
        },
        {
          text: 'Hablar en voz alta mientras resolvés un ejercicio',
          explanation:
            'El entrevistador no puede evaluar lo que no dice: narrar tu razonamiento le permite ver cómo pensás y ayudarte si te desviás. Una estructura simple: repetí el problema con tus palabras, decí el plan en una frase ("primero el input, después el fetch, después el debounce"), y mientras escribís contá el por qué de cada decisión, no lo que tipeás ("uso un `AbortController` para que una respuesta vieja no pise la nueva"). Cuando te trabes, decilo ("no me acuerdo la firma exacta, la busco o asumo esto") en vez de quedarte en silencio. Practicalo grabándote o con alguien de la comunidad haciendo de entrevistador; al principio se siente raro, y solo mejora con repetición. Error común: hablar sin parar de cosas irrelevantes o pedir permiso para todo.',
        },
      ],
    },
    {
      id: 'el-dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta: el entrevistador evalúa tu razonamiento, no solo el resultado. Antes de escribir código, hacé preguntas para aclarar el alcance (qué datos llegan, qué pasa con errores, si importa mobile) y confirmá tu plan en una frase. Si no sabés algo, decilo y explicá cómo lo averiguarías o razoná a partir de lo que sí sabés. Inventar una respuesta se nota y resta mucho más que un "no lo sé".',
        'Para las preguntas de comportamiento usá STAR: situación, tarea, acción y resultado. Prepará cuatro o cinco historias reales: un bug difícil que resolviste, un desacuerdo técnico, algo que salió mal y qué aprendiste, una mejora que propusiste y una vez que ayudaste a alguien. Contalas en primera persona y con resultados concretos.',
        'Llevá preguntas para la empresa: cómo es el proceso de code review y deploy, qué stack usan y por qué, cómo testean, quién define el producto, cómo es el onboarding y qué se espera de vos en los primeros meses. Antes de entrar, revisá conexión, cámara, editor y que tengas un proyecto Next.js o Vite listo para correr si hay live coding.',
      ],
      checklist: [
        {
          text: 'Hacer al menos dos preguntas de aclaración antes de codear',
          explanation:
            'Los enunciados de entrevista son ambiguos a propósito: quieren ver si definís el alcance antes de lanzarte. Tené una lista mental de preguntas útiles para frontend: qué forma tienen los datos y de dónde vienen, qué pasa si la API falla o tarda, cuántos items puede haber (cambia si hace falta paginar o virtualizar), si importa mobile o accesibilidad, si puedo usar librerías y qué prioridad tiene cada parte. Ejemplo ante "hacé un autocomplete": "¿la búsqueda es contra una API o una lista local?" y "¿con cuántos caracteres empiezo a buscar?". Después resumí lo acordado en una frase. Evitá preguntas que se responden leyendo el enunciado, y no te quedes diez minutos preguntando: dos o tres bien elegidas alcanzan.',
        },
        {
          text: 'Tener cuatro o cinco historias preparadas en formato STAR',
          explanation:
            'STAR es Situación (contexto breve), Tarea (qué te tocaba a vos), Acción (qué hiciste vos concretamente, la parte más larga) y Resultado (qué pasó, con números si se puede, y qué aprendiste). Escribí cinco historias que cubran: un bug difícil, un desacuerdo técnico, un error tuyo, una mejora que impulsaste y una vez que ayudaste a alguien; cada una se adapta a varias preguntas. Ejemplo de resultado: "el checkout dejó de fallar en Safari y los errores bajaron un 80% en Sentry". Contalas en primera persona ("yo propuse") aunque haya sido en equipo, y que duren unos dos minutos. Si sos junior, valen historias de la facultad, de un bootcamp o de proyectos propios.',
        },
        {
          text: 'Saber cómo responder cuando no sabés algo',
          explanation:
            'Decilo con honestidad y seguí aportando: "No lo usé, pero por lo que sé resuelve X; si tuviera que implementarlo, empezaría por la documentación y probaría Y". Razonar desde lo que sí sabés muestra criterio: si no conocés `useSyncExternalStore`, podés deducir para qué existiría a partir de cómo funcionan las suscripciones y los renders. Si es algo que se busca (una firma de una API), decí que lo buscarías y asumí algo razonable en voz alta. Nunca inventes una respuesta con seguridad: el entrevistador casi siempre se da cuenta y eso resta más que admitir el hueco. Si después lo averiguás, podés mencionarlo en un mail de seguimiento.',
        },
        {
          text: 'Tener tres preguntas propias para la empresa',
          explanation:
            'Preparalas antes según la etapa: con el equipo técnico, preguntá por el día a día ("¿cómo es un ciclo desde que se toma una tarea hasta que llega a producción?", "¿cómo hacen code review y testing?", "¿qué deuda técnica les preocupa más?"); con el tech lead, por expectativas ("¿qué esperarían de mí en los primeros tres meses?"); con producto, por cómo se decide qué construir. Las buenas preguntas muestran interés real y te dan información para decidir si querés trabajar ahí. Evitá preguntar en la entrevista técnica cosas que están en la web o que son de recruiting (vacaciones, salario). Anotá las respuestas para comparar ofertas.',
        },
        {
          text: 'Dejar listo el entorno: editor, proyecto base, cámara y conexión',
          explanation:
            'El día anterior creá un proyecto con `pnpm create vite` (React y TypeScript) o `create-next-app`, instalá dependencias, verificá que `dev` arranca y que podés agregar un test, así no perdés diez minutos instalando en vivo. En el editor, subí el tamaño de fuente para compartir pantalla, cerrá pestañas y notificaciones y decidí si vas a apagar el autocompletado con IA si no lo permiten. Probá la herramienta de videollamada, compartir pantalla, cámara, micrófono y la conexión, y tené un plan B (hotspot del celular). Si la entrevista es en una plataforma online como CoderPad o CodeSandbox, probala antes para conocer el atajo de ejecutar.',
        },
      ],
    },
  ],
};
