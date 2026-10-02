import type { InterviewQuestion, Seniority } from './types';

export const frontendQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'react',
      question: '¿Qué es JSX y por qué lo usamos en React?',
      answer:
        'Es una extensión de sintaxis de JavaScript que permite escribir estructuras parecidas a HTML dentro del código. No lo entiende el navegador: un compilador (Babel, SWC) lo transforma en llamadas a `React.createElement` / `jsx()`. Lo usamos porque hace más legible la descripción de la UI y permite mezclar lógica y markup con expresiones entre llaves.',
    },
    {
      topic: 'react',
      question: '¿Cuál es la diferencia entre props y state?',
      answer:
        'Las props son datos que un componente recibe desde su padre y son de solo lectura. El state es información propia del componente que puede cambiar con el tiempo (con `useState` o `useReducer`); cuando cambia, React vuelve a renderizar el componente. Regla práctica: si el dato viene de afuera es prop, si el componente lo controla es state.',
    },
    {
      topic: 'react',
      question: '¿Para qué sirve la prop `key` al renderizar listas?',
      answer:
        'Le permite a React identificar cada elemento entre renders para saber cuál se agregó, se movió o se eliminó, y así reutilizar el DOM y el estado correctos. Debe ser estable y única entre hermanos (por ejemplo un id). Usar el índice del array puede causar bugs de estado cuando la lista se reordena o se filtra.',
    },
    {
      topic: 'hooks',
      question: '¿Qué hace `useEffect` y cuándo se ejecuta?',
      answer:
        'Sincroniza el componente con algo externo a React (APIs, suscripciones, timers, el DOM). Se ejecuta después de que el render se pinta. Con array de dependencias vacío corre una sola vez al montar; con dependencias, cada vez que alguna cambia; sin array, después de cada render. La función que retorna es el cleanup y corre antes del próximo efecto y al desmontar.',
    },
    {
      topic: 'javascript',
      question: '¿Cuál es la diferencia entre `let`, `const` y `var`?',
      answer:
        '`var` tiene scope de función y hoisting (se inicializa como `undefined`). `let` y `const` tienen scope de bloque y están en la "temporal dead zone" hasta su declaración. `const` no permite reasignar la variable, aunque si es un objeto o array su contenido sí puede mutar.',
    },
    {
      topic: 'javascript',
      question: '¿Qué diferencia hay entre `==` y `===`?',
      answer:
        '`==` compara con coerción de tipos (por ejemplo `"1" == 1` es `true`), mientras que `===` compara valor y tipo sin coerción. En la práctica se usa siempre `===` para evitar resultados inesperados.',
    },
    {
      topic: 'css',
      question: '¿Qué es el box model en CSS?',
      answer:
        'Cada elemento es una caja formada por content, padding, border y margin. Con `box-sizing: content-box` (default) el `width` aplica solo al contenido; con `box-sizing: border-box` incluye padding y borde, lo que hace los tamaños más predecibles.',
    },
    {
      topic: 'react',
      question: '¿Qué es un componente controlado en un formulario?',
      answer:
        'Es un input cuyo valor vive en el state de React: se pasa `value` y se actualiza con `onChange`. React es la única fuente de verdad. Un componente no controlado guarda su valor en el DOM y se lee con una ref cuando hace falta.',
    },
    {
      topic: 'html',
      question: '¿Por qué es importante usar HTML semántico?',
      answer:
        'Etiquetas como `header`, `nav`, `main`, `article` o `button` describen el significado del contenido, no solo su apariencia. Eso mejora la accesibilidad (los lectores de pantalla entienden la estructura), el SEO y la mantenibilidad. Por ejemplo, un `button` ya es enfocable y responde al teclado, mientras que un `div` con `onClick` no.',
    },
    {
      topic: 'css',
      question: '¿Cuál es la diferencia entre Flexbox y Grid?',
      answer:
        'Flexbox distribuye elementos en una sola dimensión (fila o columna) y es ideal para alinear componentes como barras de navegación o botones. Grid trabaja en dos dimensiones (filas y columnas a la vez) y sirve para layouts de página completos. Se combinan seguido: Grid para la estructura y Flexbox dentro de cada celda.',
    },
    {
      topic: 'css',
      question: '¿Cómo funciona la especificidad en CSS?',
      answer:
        'Cuando varias reglas aplican al mismo elemento, gana la más específica: estilos inline, luego selectores de id, luego clases, atributos y pseudo-clases, y por último elementos. Si empatan, gana la que aparece última. `!important` saltea este orden y conviene evitarlo porque hace los estilos difíciles de sobrescribir.',
    },
    {
      topic: 'javascript',
      question: '¿Qué es el DOM?',
      answer:
        'El Document Object Model es la representación en forma de árbol de objetos que el navegador construye a partir del HTML. JavaScript lo usa para leer y modificar la página (`document.querySelector`, `appendChild`, eventos). React lo manipula por nosotros a partir de los componentes que declaramos.',
    },
    {
      topic: 'javascript',
      question: '¿Qué son `map`, `filter` y `reduce`?',
      answer:
        'Son métodos de arrays que no mutan el original. `map` transforma cada elemento y devuelve un array del mismo largo, `filter` devuelve los elementos que cumplen una condición y `reduce` acumula todos los elementos en un único valor. En React se usa mucho `map` para renderizar listas.',
    },
    {
      topic: 'javascript',
      question: '¿Qué es la desestructuración y el spread operator?',
      answer:
        'La desestructuración extrae valores de objetos o arrays en variables (`const { name } = user`). El spread (`...`) expande un iterable u objeto, útil para copiar o combinar sin mutar (`{ ...user, age: 30 }`). En React se usan para leer props y para actualizar estado de forma inmutable.',
    },
    {
      topic: 'react',
      question: '¿Por qué no hay que mutar el estado directamente en React?',
      answer:
        'React detecta cambios comparando referencias: si mutás un objeto y llamás al setter con la misma referencia, puede no re-renderizar. Además, mutar rompe supuestos de memoización y hace el código difícil de razonar. Siempre se crea un nuevo objeto o array (`setItems([...items, item])`).',
    },
    {
      topic: 'react',
      question: '¿Cómo se maneja un evento en React y en qué se diferencia del HTML tradicional?',
      answer:
        'Se pasa una función como prop en camelCase (`onClick={handleClick}`), no un string. React usa eventos sintéticos que normalizan las diferencias entre navegadores. Para evitar el comportamiento por defecto se llama a `event.preventDefault()`, no se retorna `false`.',
    },
    {
      topic: 'react',
      question: '¿Qué es el renderizado condicional y cómo se hace?',
      answer:
        'Es mostrar distintos elementos según una condición. Se usa el operador ternario (`cond ? <A /> : <B />`), `&&` para mostrar algo o nada, o un `if` antes del `return`. Ojo con `&&` y números: `{count && <List />}` renderiza `0` si `count` es cero.',
    },
    {
      topic: 'react',
      question: '¿Qué son los children en React?',
      answer:
        'Es la prop especial que contiene lo que se pasa entre las etiquetas de apertura y cierre de un componente. Permite crear componentes contenedores reutilizables (layouts, modales, cards) que no necesitan saber qué renderizan adentro. Es la base de la composición en React.',
    },
    {
      topic: 'accesibilidad',
      question: '¿Qué buenas prácticas de accesibilidad básicas conocés?',
      answer:
        'Usar HTML semántico, textos alternativos en imágenes (`alt`), `label` asociado a cada input, buen contraste de colores, que todo sea operable con teclado y con un foco visible, y no transmitir información solo con color. Herramientas como Lighthouse o axe ayudan a detectar problemas.',
    },
    {
      topic: 'git',
      question: '¿Cuál es el flujo básico de trabajo con Git en un equipo?',
      answer:
        'Crear una rama a partir de la principal, hacer commits chicos con mensajes claros, mantenerla actualizada con la rama principal (merge o rebase), abrir un pull request y pasar la revisión de código y los checks de CI antes de mergear. Nunca se trabaja directo sobre `main`.',
    },
  ],
  'semi-senior': [
    {
      topic: 'react',
      question: '¿Cómo funciona la reconciliación y el Virtual DOM en React?',
      answer:
        'En cada render React genera un árbol de elementos y lo compara (diffing) con el anterior. Asume que elementos de distinto tipo producen árboles distintos y usa las `key` para emparejar hijos. Con esa diferencia calcula el mínimo de cambios y los aplica al DOM real en la fase de commit. El trabajo está dividido en unidades (Fiber) para poder priorizarlo e interrumpirlo.',
    },
    {
      topic: 'hooks',
      question: '¿Cuándo usarías `useMemo` y `useCallback`? ¿Cuándo no?',
      answer:
        '`useMemo` memoriza el resultado de un cálculo costoso y `useCallback` memoriza una función para mantener su referencia estable, útil al pasarla a hijos con `React.memo` o como dependencia de efectos. No conviene usarlos por defecto: tienen costo propio y complejizan el código. Además, el React Compiler puede aplicar estas memoizaciones automáticamente.',
    },
    {
      topic: 'state',
      question: '¿Qué es el prop drilling y qué alternativas tenés?',
      answer:
        'Es pasar props por varios niveles intermedios que no las usan solo para que lleguen a un componente profundo. Alternativas: composición (pasar componentes como `children`), Context API para datos globales poco cambiantes, o librerías de estado (Zustand, Redux Toolkit, Jotai). Para datos de servidor conviene TanStack Query en lugar de estado global.',
    },
    {
      topic: 'hooks',
      question: '¿Por qué puede haber un "stale closure" en un `useEffect` o un handler?',
      answer:
        'Porque cada render crea funciones nuevas que capturan los valores de ese render. Si un efecto o un intervalo se crea una vez y no lista sus dependencias, sigue viendo valores viejos. Se resuelve declarando bien las dependencias, usando la forma funcional del setter (`setCount(c => c + 1)`) o guardando el valor en una ref.',
    },
    {
      topic: 'performance',
      question: '¿Qué técnicas usarías para mejorar la performance de una app React?',
      answer:
        'Medir primero con el Profiler y Lighthouse. Luego: code splitting con `lazy` / imports dinámicos, virtualizar listas largas, evitar re-renders innecesarios (bajar el estado, `React.memo`), optimizar imágenes, cachear datos de servidor, usar `useTransition` / `useDeferredValue` para mantener la UI responsiva y reducir el tamaño del bundle.',
    },
    {
      topic: 'testing',
      question: '¿Cómo testearías un componente de React?',
      answer:
        'Con React Testing Library (sobre Jest o Vitest), probando el comportamiento como lo ve el usuario: buscar por rol o texto, simular eventos con `user-event` y verificar el resultado en pantalla, sin depender de detalles de implementación. Las llamadas de red se mockean (por ejemplo con MSW). Los flujos críticos se cubren con tests e2e (Playwright).',
    },
    {
      topic: 'rendering',
      question: '¿Qué diferencia hay entre CSR, SSR y SSG?',
      answer:
        'CSR: el navegador descarga JS y renderiza todo en el cliente (peor primer render y SEO). SSR: el servidor genera el HTML en cada request, mejor para contenido dinámico y SEO. SSG: el HTML se genera en build y se sirve desde CDN, muy rápido para contenido estático. ISR combina SSG con revalidación periódica.',
    },
    {
      topic: 'javascript',
      question: '¿Cómo funciona el event loop en el navegador?',
      answer:
        'JavaScript corre en un solo hilo con un call stack. Las tareas asíncronas se encolan: las microtasks (promesas, `queueMicrotask`) se vacían por completo después de cada tarea, antes que las macrotasks (`setTimeout`, eventos de I/O). Entre tareas el navegador puede renderizar. Por eso un `then` corre antes que un `setTimeout(fn, 0)`.',
    },
    {
      topic: 'typescript',
      question: '¿Qué diferencia hay entre `interface` y `type` en TypeScript?',
      answer:
        'Ambos describen la forma de un objeto. `interface` se puede extender y fusionar (declaration merging), lo que la hace útil para APIs públicas. `type` es más flexible: permite uniones, intersecciones, tipos condicionales y mapeados. En la práctica se elige uno por convención y se usa `type` cuando hacen falta uniones.',
    },
    {
      topic: 'typescript',
      question: '¿Qué son los generics y cómo los usarías en un componente React?',
      answer:
        'Permiten escribir código reutilizable que preserva los tipos en lugar de usar `any`. Por ejemplo, un `List<T>` que recibe `items: T[]` y `renderItem: (item: T) => ReactNode` infiere `T` según lo que le pases. Así el consumidor obtiene autocompletado y errores de tipo correctos.',
    },
    {
      topic: 'hooks',
      question: '¿Qué es un custom hook y cuándo conviene crear uno?',
      answer:
        'Es una función que empieza con `use` y combina otros hooks para encapsular lógica con estado reutilizable (fetch, formularios, suscripciones). Conviene cuando la misma lógica se repite en varios componentes o cuando extraerla hace más legible el componente. Cada componente que lo usa tiene su propio estado independiente.',
    },
    {
      topic: 'hooks',
      question: '¿Cuál es la diferencia entre `useRef` y `useState`?',
      answer:
        'Ambos persisten valores entre renders, pero cambiar `ref.current` no provoca un re-render y cambiar el state sí. `useRef` se usa para acceder a nodos del DOM y para guardar valores mutables que no afectan lo que se muestra (timers, valores previos). Lo que se muestra en pantalla debe ir en state.',
    },
    {
      topic: 'hooks',
      question: '¿Cuándo usarías `useReducer` en lugar de `useState`?',
      answer:
        'Cuando el estado es complejo, tiene varias partes relacionadas o la próxima versión depende de la anterior con lógica no trivial. El reducer centraliza las transiciones en una función pura y testeable, y el `dispatch` es estable, lo que facilita pasarlo a hijos.',
    },
    {
      topic: 'state',
      question: '¿Cuáles son las limitaciones de Context API?',
      answer:
        'Cada vez que cambia el valor del provider se re-renderizan todos los consumidores, aunque usen solo una parte. Por eso no es ideal para estado que cambia seguido. Se mitiga dividiendo contextos, memoizando el valor o usando una librería con selectores como Zustand.',
    },
    {
      topic: 'datos',
      question: '¿Qué ventajas tiene TanStack Query sobre hacer fetch en un `useEffect`?',
      answer:
        'Maneja cache, deduplicación de requests, estados de carga y error, reintentos, revalidación al volver a la pestaña, paginación y mutaciones con invalidación. Hacerlo a mano en un `useEffect` lleva a race conditions, requests duplicados y mucho código repetido.',
    },
    {
      topic: 'react',
      question: '¿Qué son los error boundaries?',
      answer:
        'Componentes que capturan errores de renderizado en su subárbol y muestran una UI alternativa en lugar de romper toda la app. Se implementan con componentes de clase (`getDerivedStateFromError`, `componentDidCatch`) o librerías como `react-error-boundary`. No capturan errores en event handlers ni en código asíncrono.',
    },
    {
      topic: 'react',
      question: '¿Qué son los portals y cuándo los usarías?',
      answer:
        '`createPortal` renderiza hijos en otro nodo del DOM fuera de la jerarquía del componente padre, manteniendo el árbol de React (contexto y propagación de eventos). Se usan para modales, tooltips y menús que necesitan escapar de un `overflow: hidden` o de un contexto de `z-index`.',
    },
    {
      topic: 'formularios',
      question: '¿Cómo manejarías formularios complejos con validación?',
      answer:
        'Con una librería como React Hook Form, que usa inputs no controlados para minimizar re-renders, junto con un schema de validación (Zod o Yup) compartible con el backend. Mostrar errores accesibles junto a cada campo, validar al perder el foco o al enviar, y siempre revalidar en el servidor.',
    },
    {
      topic: 'tooling',
      question: '¿Qué hace un bundler como Vite o webpack?',
      answer:
        'Toma el código fuente y sus dependencias, resuelve los imports, transforma TypeScript/JSX/CSS y genera archivos optimizados para el navegador: minificados, con tree shaking y divididos en chunks. Vite usa módulos ES nativos en desarrollo para arrancar rápido y Rollup para el build de producción.',
    },
    {
      topic: 'navegador',
      question: '¿Qué diferencias hay entre `localStorage`, `sessionStorage` y cookies?',
      answer:
        '`localStorage` persiste sin vencimiento y `sessionStorage` dura lo que la pestaña; ambos son solo del cliente, síncronos y accesibles por JavaScript. Las cookies se envían automáticamente al servidor en cada request, pueden tener vencimiento y marcarse `httpOnly`, `Secure` y `SameSite`, por eso son mejores para sesiones.',
    },
  ],
  senior: [
    {
      topic: 'arquitectura',
      question: '¿Qué son los React Server Components y qué problema resuelven?',
      answer:
        'Son componentes que se ejecutan solo en el servidor: pueden acceder directamente a datos y su código no se envía al cliente, reduciendo el bundle. Se combinan con Client Components (`"use client"`) para la interactividad. Resuelven el waterfall de fetches desde el cliente y el costo de mandar JS innecesario. El trade-off es pensar bien la frontera servidor/cliente y qué es serializable.',
    },
    {
      topic: 'react',
      question: '¿Qué es el rendering concurrente y para qué sirven `useTransition` y Suspense?',
      answer:
        'React puede preparar varias versiones de la UI e interrumpir renders de baja prioridad. `useTransition` marca actualizaciones como no urgentes para que el input siga respondiendo mientras se calcula la nueva vista. Suspense permite declarar estados de carga mientras un componente espera datos o código, y con streaming SSR envía el HTML por partes.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo diseñarías la arquitectura frontend de una app grande con varios equipos?',
      answer:
        'Dividir por dominios/features con límites claros, un design system compartido y versionado, monorepo con herramientas como Turborepo/Nx y reglas de dependencias. Separar estado de servidor (TanStack Query) del estado de UI. Definir contratos de API tipados. Considerar micro-frontends solo si los equipos necesitan deploys independientes, porque agregan complejidad operativa.',
    },
    {
      topic: 'performance',
      question: '¿Qué son las Core Web Vitals y cómo las mejorarías?',
      answer:
        'LCP (carga del contenido principal), INP (respuesta a interacciones) y CLS (estabilidad visual). LCP: SSR/SSG, priorizar la imagen principal, CDN, menos JS bloqueante. INP: dividir tareas largas, menos hidratación, `useTransition`, mover trabajo a web workers. CLS: reservar espacio para imágenes y anuncios, cuidar la carga de fuentes. Se miden con datos reales (RUM), no solo en laboratorio.',
    },
    {
      topic: 'state',
      question: '¿Cómo decidís dónde vive cada pieza de estado?',
      answer:
        'Clasificando: estado de servidor (cache con TanStack Query o RSC), estado de URL (filtros, paginación: en search params para que sea compartible), estado local de UI (`useState` lo más abajo posible), estado global de cliente (sesión, tema: Context o Zustand) y estado de formularios (React Hook Form). Evitar duplicar estado derivable y mantener una única fuente de verdad.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué riesgos de seguridad tenés que considerar en el frontend?',
      answer:
        'XSS (evitar `dangerouslySetInnerHTML` sin sanitizar, usar CSP), CSRF en apps con cookies (SameSite, tokens), no guardar tokens sensibles en localStorage, validar siempre en el servidor, cuidar dependencias de terceros (supply chain) y no exponer secretos en variables públicas del bundle.',
    },
    {
      topic: 'react',
      question: '¿Cómo funciona la hidratación y qué es un hydration mismatch?',
      answer:
        'El servidor envía HTML y luego React en el cliente adjunta los event listeners recorriendo el mismo árbol. Si el HTML del cliente difiere del servidor (por fechas, `Math.random`, `window`, extensiones del navegador) hay un mismatch: React avisa y puede re-renderizar esa parte. Se evita con renders deterministas, `useEffect` para valores solo de cliente y `suppressHydrationWarning` puntual.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo evaluarías adoptar una nueva librería o framework en el equipo?',
      answer:
        'Partiendo del problema concreto que resuelve, comparando alternativas (madurez, mantenimiento, comunidad, tamaño de bundle, licencia, curva de aprendizaje) y haciendo una prueba de concepto acotada. Documentar la decisión (ADR), planear una adopción incremental con forma de revertir y considerar el costo de mantenerla a largo plazo.',
    },
    {
      topic: 'testing',
      question: '¿Cómo diseñarías la estrategia de testing de un frontend grande?',
      answer:
        'Siguiendo el "testing trophy": análisis estático (TypeScript, ESLint) como base, muchos tests de integración de componentes con Testing Library, unit tests para lógica pura y pocos e2e con Playwright para los flujos críticos. Sumar tests visuales en el design system y correr todo en CI, priorizando confianza sobre porcentaje de cobertura.',
    },
    {
      topic: 'design system',
      question: '¿Cómo construirías y mantendrías un design system?',
      answer:
        'Partiendo de design tokens (colores, tipografía, espaciado) compartidos con diseño, componentes accesibles y componibles documentados en Storybook, versionado semántico y changelog. Definir ownership, un proceso de contribución y medir la adopción. Componentes headless (Radix, React Aria) ayudan a resolver accesibilidad y comportamiento.',
    },
    {
      topic: 'next.js',
      question: '¿Qué estrategias de caching y revalidación ofrece Next.js?',
      answer:
        'Páginas estáticas generadas en build, revalidación por tiempo (ISR) o bajo demanda con `revalidatePath` / `revalidateTag`, cache de `fetch` y de datos, y renderizado dinámico por request. La clave es decidir por ruta qué datos pueden estar desactualizados y cuánto, y cómo invalidarlos cuando cambian.',
    },
    {
      topic: 'performance',
      question: '¿Cómo reducirías el tamaño del bundle de una aplicación?',
      answer:
        'Medirlo con un analizador de bundle, hacer code splitting por ruta y con imports dinámicos para componentes pesados, reemplazar dependencias grandes, asegurar tree shaking (ES modules, `sideEffects`), mover lógica al servidor (Server Components) y cargar scripts de terceros de forma diferida. Agregar un presupuesto de tamaño en CI.',
    },
    {
      topic: 'arquitectura',
      question: '¿Qué son los micro-frontends y cuándo los usarías?',
      answer:
        'Son una forma de dividir el frontend en aplicaciones independientes por dominio, cada una con su equipo y su deploy, integradas en runtime (Module Federation, iframes) o en build. Tienen sentido con muchos equipos que necesitan autonomía. El costo es duplicación de dependencias, inconsistencia visual y complejidad de integración.',
    },
    {
      topic: 'accesibilidad',
      question: '¿Cómo harías accesible un componente complejo como un combobox o un modal?',
      answer:
        'Siguiendo los patrones de WAI-ARIA: roles y atributos correctos (`aria-expanded`, `aria-activedescendant`), manejo de foco (atraparlo en el modal y devolverlo al cerrar), navegación completa con teclado y anuncios para lectores de pantalla. Probarlo con lectores reales y, de ser posible, partir de primitivas accesibles ya probadas.',
    },
    {
      topic: 'react',
      question: '¿Qué hace el React Compiler y cómo cambia la forma de escribir componentes?',
      answer:
        'Analiza los componentes en build y agrega memoización automática de valores, funciones y JSX, evitando re-renders innecesarios sin `useMemo`, `useCallback` ni `React.memo` manuales. Requiere seguir las reglas de React (componentes puros, no mutar props ni state). Permite escribir código más simple dejando la optimización al compilador.',
    },
    {
      topic: 'react',
      question: '¿Qué son las Server Actions y qué consideraciones de seguridad tienen?',
      answer:
        'Son funciones marcadas con `"use server"` que se ejecutan en el servidor y se pueden invocar desde formularios o componentes cliente, sin crear un endpoint a mano. Son endpoints públicos: hay que validar la entrada, verificar autenticación y autorización en cada una y no confiar en datos que vengan del cliente.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo monitorearías errores y performance del frontend en producción?',
      answer:
        'Con herramientas de error tracking (Sentry) con source maps y contexto del usuario, RUM para Core Web Vitals reales por página y dispositivo, logs de eventos clave y alertas sobre picos de errores. Correlacionar con releases para detectar regresiones y poder hacer rollback rápido.',
    },
    {
      topic: 'i18n',
      question: '¿Qué tenés en cuenta para internacionalizar una aplicación?',
      answer:
        'Externalizar textos con una librería (i18next, FormatJS), manejar plurales y variables con ICU, formatear fechas, números y monedas con `Intl`, soportar idiomas de derecha a izquierda, dejar espacio para textos más largos y definir cómo se detecta y persiste el idioma, incluyendo rutas localizadas para SEO.',
    },
    {
      topic: 'arquitectura',
      question:
        '¿Cómo planificarías la migración incremental de una app legacy a React o a una nueva arquitectura?',
      answer:
        'Con el patrón strangler fig: convivir ambos sistemas e ir reemplazando pantallas o rutas de a una, empezando por las de más valor o menos riesgo. Establecer la integración (montar React dentro del legacy o rutear por proxy), cubrir con tests e2e antes de migrar y medir el progreso, evitando un big bang rewrite.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo mantenés la calidad del código en un equipo frontend que crece?',
      answer:
        'Con estándares automatizados (TypeScript estricto, ESLint, Prettier, checks en CI), code reviews con criterios claros, documentación de decisiones (ADRs), un design system compartido y guías de arquitectura. Fomentar pairing, tiempo para deuda técnica y métricas como errores en producción o tiempo de build para detectar problemas temprano.',
    },
  ],
};
