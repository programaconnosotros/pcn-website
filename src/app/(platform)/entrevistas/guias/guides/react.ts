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
        'Saber qué etapas tiene el proceso y qué se evalúa en cada una',
        'Tener un proyecto propio que puedas explicar de punta a punta',
        'Identificar qué temas de tu seniority te cuestan más y priorizarlos',
        'Poder contar en dos minutos tu experiencia y qué tipo de rol buscás',
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
        'Explicar closures con un ejemplo real de React',
        'Predecir el orden de ejecución entre `setTimeout`, promesas y código síncrono',
        'Explicar por qué mutar un objeto rompe la detección de cambios',
        'Usar discriminated unions para modelar estados como loading, error y success',
        'Tipar un componente genérico con `T` y explicar por qué',
        'Elegir entre Flexbox y Grid para un layout y maquetarlo sin ayuda',
        'Comparar `localStorage`, `sessionStorage` y cookies para guardar una sesión',
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
        'Explicar qué dispara un re-render y qué es la reconciliación',
        'Explicar con un ejemplo por qué usar el índice como `key` puede causar bugs',
        'Diferenciar componentes controlados y no controlados',
        'Explicar qué captura un error boundary y qué no',
        'Contar qué resuelve el React Compiler y qué cambia en tu forma de escribir',
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
        'Explicar cuándo no necesitás un `useEffect`',
        'Reproducir y arreglar un stale closure',
        'Explicar cuándo usar `useMemo` y `useCallback` y cuándo no',
        'Elegir entre `useState`, `useReducer` y `useRef` para un caso dado',
        'Escribir un custom hook como `useDebounce` o `useFetch` y explicar sus reglas',
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
        'Clasificar el estado de una pantalla en local, compartido, servidor y URL',
        'Explicar las limitaciones de Context y cómo mitigarlas',
        'Enumerar los problemas de hacer fetch en un `useEffect`',
        'Explicar cómo invalidar y revalidar datos después de una mutación',
        'Diseñar la validación de un formulario con un schema compartido',
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
        'Comparar CSR, SSR, SSG e ISR con sus trade-offs',
        'Explicar qué es un hydration mismatch y cómo evitarlo',
        'Decidir qué componentes van con `"use client"` y por qué',
        'Explicar cómo revalidar datos cacheados después de una mutación',
        'Enumerar las precauciones de seguridad de una Server Action',
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
        'Usar el Profiler para encontrar un re-render innecesario',
        'Explicar LCP, INP y CLS y una mejora concreta para cada una',
        'Explicar cómo reducir el tamaño del bundle',
        'Explicar cuándo virtualizar una lista',
        'Explicar para qué sirven `useTransition` y Suspense',
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
        'Escribir un test con Testing Library que busque por rol y simule una interacción',
        'Explicar qué testearías con unit, integración y E2E',
        'Enumerar los requisitos de accesibilidad de un modal',
        'Explicar cómo React previene XSS y dónde no lo hace',
        'Explicar cómo monitorearías errores y performance en producción',
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
        'Resolver un buscador con debounce y manejo de race conditions en 45 minutos',
        'Construir un componente de tabs o acordeón accesible por teclado',
        'Tener un take-home de ejemplo con README y tests',
        'Diseñar un feed infinito cubriendo datos, estado, performance y errores',
        'Hablar en voz alta mientras resolvés un ejercicio',
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
        'Hacer al menos dos preguntas de aclaración antes de codear',
        'Tener cuatro o cinco historias preparadas en formato STAR',
        'Saber cómo responder cuando no sabés algo',
        'Tener tres preguntas propias para la empresa',
        'Dejar listo el entorno: editor, proyecto base, cámara y conexión',
      ],
    },
  ],
};
