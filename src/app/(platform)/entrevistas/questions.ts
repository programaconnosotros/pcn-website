export type InterviewTrack = 'frontend' | 'backend' | 'agentic';
export type Seniority = 'junior' | 'semi-senior' | 'senior';

export interface InterviewQuestion {
  question: string;
  answer: string;
  topic: string;
}

export const TRACKS: { id: InterviewTrack; label: string; stack: string }[] = [
  { id: 'frontend', label: 'Frontend', stack: 'React.js' },
  { id: 'backend', label: 'Backend', stack: 'Node.js' },
  { id: 'agentic', label: 'Agentic engineering', stack: 'LLMs y agentes' },
];

export const SENIORITIES: { id: Seniority; label: string }[] = [
  { id: 'junior', label: 'Junior' },
  { id: 'semi-senior', label: 'Semi-senior' },
  { id: 'senior', label: 'Senior' },
];

export const interviewQuestions: Record<InterviewTrack, Record<Seniority, InterviewQuestion[]>> = {
  frontend: {
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
    ],
  },
  backend: {
    junior: [
      {
        topic: 'node',
        question: '¿Qué es Node.js y por qué se dice que es non-blocking?',
        answer:
          'Es un runtime de JavaScript fuera del navegador basado en V8. Es non-blocking porque las operaciones de I/O (red, disco) se delegan al sistema operativo o a libuv y no frenan el hilo principal: cuando terminan, su callback se encola en el event loop. Así un solo hilo atiende muchas conexiones concurrentes.',
      },
      {
        topic: 'http',
        question: '¿Cuáles son los métodos HTTP más comunes y para qué se usan?',
        answer:
          'GET obtiene recursos, POST crea, PUT reemplaza, PATCH actualiza parcialmente y DELETE elimina. GET, PUT y DELETE deben ser idempotentes (repetirlos tiene el mismo efecto). GET no debería tener efectos secundarios.',
      },
      {
        topic: 'http',
        question: '¿Qué significan los códigos de estado 2xx, 4xx y 5xx? Dá ejemplos.',
        answer:
          '2xx éxito (200 OK, 201 Created, 204 No Content). 4xx error del cliente (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict). 5xx error del servidor (500 Internal Server Error, 503 Service Unavailable). 3xx son redirecciones.',
      },
      {
        topic: 'javascript',
        question: '¿Qué diferencia hay entre callbacks, promesas y async/await?',
        answer:
          'Los callbacks son funciones que se llaman al terminar una operación y anidarlos lleva al "callback hell". Las promesas representan un valor futuro y se encadenan con `then`/`catch`. `async/await` es azúcar sintáctico sobre promesas que permite escribir código asíncrono como si fuera secuencial y manejar errores con `try/catch`.',
      },
      {
        topic: 'node',
        question: '¿Qué es un middleware en Express?',
        answer:
          'Es una función `(req, res, next)` que se ejecuta en el pipeline de una request. Puede leer o modificar `req`/`res`, terminar la respuesta o llamar a `next()` para pasar al siguiente. Se usa para logging, autenticación, parseo del body, CORS y manejo de errores (los de error reciben 4 argumentos).',
      },
      {
        topic: 'node',
        question: '¿Para qué sirven `package.json` y `package-lock.json`?',
        answer:
          '`package.json` describe el proyecto: nombre, scripts y dependencias con rangos de versión. El lockfile fija las versiones exactas instaladas de todo el árbol de dependencias para que todos los entornos instalen lo mismo. El lockfile se commitea.',
      },
      {
        topic: 'bases de datos',
        question: '¿Qué diferencia hay entre una base SQL y una NoSQL?',
        answer:
          'SQL (PostgreSQL, MySQL) usa tablas con esquema definido, relaciones y transacciones ACID; ideal para datos relacionales y consistencia. NoSQL agrupa modelos distintos (documentos como MongoDB, clave-valor como Redis, grafos, columnares) con esquemas flexibles y escalado horizontal más simple, a veces con consistencia eventual.',
      },
      {
        topic: 'seguridad',
        question: '¿Cómo guardarías las contraseñas de los usuarios?',
        answer:
          'Nunca en texto plano ni con hashes rápidos como MD5 o SHA-256. Se usa un algoritmo de hashing lento y con salt, como bcrypt, scrypt o Argon2, y al hacer login se compara el hash. Las variables sensibles (claves, secretos) van en variables de entorno, no en el código.',
      },
    ],
    'semi-senior': [
      {
        topic: 'node',
        question: 'Explicá las fases del event loop de Node.js.',
        answer:
          'timers (`setTimeout`/`setInterval`), pending callbacks, idle/prepare, poll (espera y procesa I/O), check (`setImmediate`) y close callbacks. Entre cada callback se vacían la cola de `process.nextTick` y luego la de microtasks (promesas). Bloquear el hilo con trabajo sincrónico pesado frena todas las fases.',
      },
      {
        topic: 'node',
        question: '¿Qué son los streams y cuándo los usarías?',
        answer:
          'Son una abstracción para procesar datos por partes (chunks) en lugar de cargarlos enteros en memoria. Hay Readable, Writable, Duplex y Transform. Se usan para archivos grandes, uploads, proxies o compresión. `pipeline()` los conecta manejando errores y backpressure (pausar al productor cuando el consumidor no da abasto).',
      },
      {
        topic: 'api',
        question: '¿Qué diferencias hay entre REST y GraphQL?',
        answer:
          'REST expone recursos en múltiples endpoints y usa los verbos y la cache de HTTP. GraphQL expone un único endpoint con un esquema tipado donde el cliente pide exactamente los campos que necesita, evitando over/under-fetching. GraphQL complica la cache HTTP y requiere cuidar el problema N+1 (DataLoader) y limitar la complejidad de las queries.',
      },
      {
        topic: 'auth',
        question: '¿Cómo funciona la autenticación con JWT y cuáles son sus desventajas?',
        answer:
          'El servidor firma un token con los claims del usuario y el cliente lo envía en cada request; el servidor valida la firma sin consultar estado. Desventajas: es difícil revocarlo antes de que expire, el payload es legible (no va info sensible) y puede crecer. Se mitiga con access tokens cortos, refresh tokens rotativos y guardarlos en cookies `httpOnly`.',
      },
      {
        topic: 'bases de datos',
        question: '¿Qué es un índice en una base de datos y qué costo tiene?',
        answer:
          'Es una estructura (normalmente un B-tree) que permite encontrar filas sin recorrer toda la tabla, acelerando lecturas por esas columnas. El costo: ocupa espacio y hace más lentas las escrituras porque hay que mantenerlo. Se eligen según las queries reales (revisando `EXPLAIN`), considerando el orden de columnas en índices compuestos.',
      },
      {
        topic: 'bases de datos',
        question: '¿Qué es el problema N+1 y cómo lo resolverías?',
        answer:
          'Ocurre cuando se hace una query para traer una lista y luego una query extra por cada elemento para traer su relación. Se resuelve con joins o eager loading (`include` en Prisma), cargando en lote con `WHERE id IN (...)` o con DataLoader, que agrupa y cachea los pedidos de un mismo tick.',
      },
      {
        topic: 'errores',
        question: '¿Cómo manejarías los errores en una API de Node.js?',
        answer:
          'Distinguir errores operacionales (input inválido, recurso inexistente, timeout) de errores de programación. Usar clases de error con código HTTP, un middleware central que los traduzca a respuestas consistentes sin filtrar detalles internos, validar la entrada con Zod o similar, loguear con contexto y escuchar `unhandledRejection` para registrar y reiniciar el proceso de forma controlada.',
      },
      {
        topic: 'performance',
        question: '¿Cómo aprovecharías varios núcleos de CPU con Node.js?',
        answer:
          'Corriendo varios procesos: el módulo `cluster`, PM2 o, más común hoy, varias réplicas detrás de un load balancer (contenedores en Kubernetes). Para trabajo CPU-intensivo dentro de un proceso se usan `worker_threads`, así no se bloquea el event loop.',
      },
    ],
    senior: [
      {
        topic: 'arquitectura',
        question: '¿Cuándo elegirías microservicios en lugar de un monolito?',
        answer:
          'Cuando hay varios equipos que necesitan desplegar y escalar de forma independiente y los límites del dominio están claros. Agregan complejidad: red, consistencia distribuida, observabilidad, despliegues y testing. Muchas veces conviene empezar con un monolito modular bien separado y extraer servicios cuando haya una razón concreta.',
      },
      {
        topic: 'sistemas distribuidos',
        question:
          '¿Cómo mantenés la consistencia de datos entre servicios sin transacciones distribuidas?',
        answer:
          'Con consistencia eventual: patrón Saga (pasos locales con acciones compensatorias, orquestadas o coreografiadas por eventos) y el patrón Outbox para publicar eventos de forma atómica junto con el cambio en la base. Los consumidores deben ser idempotentes porque los mensajes pueden llegar duplicados o desordenados.',
      },
      {
        topic: 'escalabilidad',
        question: '¿Qué estrategias de caching usarías y cómo manejás la invalidación?',
        answer:
          'Cache-aside con Redis, cache HTTP/CDN con `Cache-Control` y ETags, y cache en memoria para datos muy calientes. Invalidación por TTL, por evento (al escribir se borra o actualiza la clave) o con versionado de claves. Cuidar el cache stampede con locks, jitter en los TTL o stale-while-revalidate.',
      },
      {
        topic: 'api',
        question: '¿Cómo diseñarías un endpoint de pagos para que sea idempotente?',
        answer:
          'El cliente manda una `Idempotency-Key` única por operación. El servidor la guarda junto con el resultado (con una constraint única para evitar carreras) y, si llega un reintento con la misma clave, devuelve la respuesta original sin volver a cobrar. Se combina con transacciones y con reintentos con backoff exponencial del lado del cliente.',
      },
      {
        topic: 'observabilidad',
        question: '¿Cómo implementarías la observabilidad de un sistema en producción?',
        answer:
          'Los tres pilares: logs estructurados con correlation id, métricas (latencia p95/p99, tasa de errores, throughput, saturación) y trazas distribuidas con OpenTelemetry. Definir SLIs/SLOs, alertas basadas en síntomas que impactan al usuario, dashboards y runbooks para el on-call.',
      },
      {
        topic: 'node',
        question: '¿Cómo investigarías una fuga de memoria en un servicio Node.js?',
        answer:
          'Confirmarla con métricas (heap que crece y no baja tras el GC). Reproducir en un entorno controlado, tomar heap snapshots con `--inspect` y Chrome DevTools en distintos momentos y compararlos para ver qué objetos se retienen. Causas típicas: caches sin límite, listeners que no se remueven, closures que retienen objetos grandes y timers sin limpiar.',
      },
      {
        topic: 'escalabilidad',
        question: '¿Cuándo usarías una cola de mensajes y qué garantías de entrega existen?',
        answer:
          'Para desacoplar servicios, absorber picos de carga y procesar trabajo pesado en segundo plano (BullMQ, RabbitMQ, SQS, Kafka). Garantías: at-most-once (puede perderse), at-least-once (puede duplicarse, la más común, requiere consumidores idempotentes) y exactly-once (costosa, limitada a ciertos sistemas). Agregar dead-letter queues y reintentos con backoff.',
      },
      {
        topic: 'seguridad',
        question: '¿Qué medidas tomarías para asegurar una API pública?',
        answer:
          'HTTPS, autenticación robusta (OAuth 2.0/OIDC) y autorización por recurso, validación de toda entrada, queries parametrizadas, rate limiting, headers de seguridad, CORS restrictivo, secretos en un vault, principio de mínimo privilegio, auditoría de dependencias y logs de seguridad sin datos sensibles. Tener en cuenta el OWASP API Security Top 10.',
      },
    ],
  },
  agentic: {
    junior: [
      {
        topic: 'llms',
        question: '¿Qué es un LLM y qué es un token?',
        answer:
          'Un LLM (large language model) es un modelo entrenado sobre grandes volúmenes de texto que genera texto prediciendo el siguiente token según el contexto. Un token es la unidad en la que se parte el texto (fragmentos de palabras, signos, espacios). Los límites de contexto, la latencia y el costo se miden en tokens de entrada y de salida.',
      },
      {
        topic: 'agentes',
        question: '¿Qué diferencia hay entre un chatbot y un agente?',
        answer:
          'Un chatbot responde a cada mensaje con texto. Un agente recibe un objetivo y trabaja en un loop: razona, decide qué herramienta usar (leer archivos, ejecutar comandos, llamar APIs), observa el resultado y repite hasta terminar la tarea o necesitar input humano. La autonomía y el uso de herramientas son lo que lo distinguen.',
      },
      {
        topic: 'contexto',
        question: '¿Qué es la ventana de contexto y por qué importa?',
        answer:
          'Es la cantidad máxima de tokens que el modelo puede considerar a la vez: system prompt, historial, resultados de herramientas y su propia respuesta. Lo que no entra no existe para el modelo. Además, aunque entre, mucho contexto irrelevante degrada la calidad y aumenta costo y latencia, por eso conviene darle solo lo necesario.',
      },
      {
        topic: 'prompting',
        question: '¿Qué hace que un prompt sea bueno?',
        answer:
          'Ser claro y específico: contexto del problema, objetivo, restricciones, formato de salida esperado y criterios de éxito. Ayudan los ejemplos (few-shot), separar instrucciones de datos (por ejemplo con etiquetas XML) y explicar el porqué de las reglas. Tratarlo como un brief para un colega muy capaz que no conoce tu proyecto.',
      },
      {
        topic: 'llms',
        question: '¿Qué es una alucinación y cómo la reducís?',
        answer:
          'Es cuando el modelo genera información plausible pero falsa (APIs que no existen, datos inventados). Se reduce dándole las fuentes en el contexto (RAG, documentación), permitiéndole decir "no sé", pidiéndole citar de dónde sale cada dato y verificando la salida con herramientas: tests, compilador, linters.',
      },
      {
        topic: 'herramientas',
        question: '¿Qué es tool use (function calling)?',
        answer:
          'Es la capacidad del modelo de pedir que se ejecute una función definida por nosotros. Se le pasa un nombre, una descripción y un JSON schema de parámetros; el modelo devuelve una llamada estructurada, nuestro código la ejecuta y le devuelve el resultado para que continúe. El modelo nunca ejecuta nada por sí mismo.',
      },
      {
        topic: 'workflow',
        question: '¿Cómo revisás el código que genera un agente antes de commitearlo?',
        answer:
          'Como si lo hubiera escrito un compañero: leer el diff completo, entender cada cambio, correr los tests y el linter, probar el feature en la app y desconfiar de cambios fuera del alcance pedido. La responsabilidad del código sigue siendo tuya, no del agente.',
      },
      {
        topic: 'llms',
        question: '¿Qué es la temperatura de un modelo?',
        answer:
          'Un parámetro de muestreo que controla cuán aleatoria es la elección del siguiente token. Valores bajos dan respuestas más deterministas y repetibles (útil para extracción o código); valores altos dan más variedad (útil para brainstorming). No garantiza determinismo total ni mejora la exactitud.',
      },
    ],
    'semi-senior': [
      {
        topic: 'rag',
        question: '¿Qué es RAG y cuáles son sus componentes?',
        answer:
          'Retrieval-Augmented Generation: recuperar información relevante y agregarla al contexto antes de generar la respuesta. Componentes: ingesta y chunking de documentos, embeddings e índice (vectorial, léxico o híbrido), retrieval con reranking y el prompt que combina la pregunta con los fragmentos. Permite responder sobre datos privados o actualizados sin reentrenar el modelo.',
      },
      {
        topic: 'contexto',
        question: '¿Qué es context engineering y en qué se diferencia del prompt engineering?',
        answer:
          'Prompt engineering es redactar bien las instrucciones. Context engineering es decidir todo lo que entra en la ventana en cada paso del agente: instrucciones, herramientas disponibles, memoria, documentos recuperados y resultados previos. Incluye recuperar información just-in-time, resumir o compactar historial y delegar en subagentes para mantener el contexto chico y relevante.',
      },
      {
        topic: 'herramientas',
        question: '¿Cómo diseñarías las herramientas de un agente?',
        answer:
          'Pocas y bien definidas, pensadas para el agente y no como un espejo de la API: nombres y descripciones claras, parámetros con schema estricto, respuestas concisas con la información útil (paginadas o truncadas) y errores accionables que expliquen cómo corregir la llamada. Evitar herramientas que se solapen, porque confunden al modelo.',
      },
      {
        topic: 'mcp',
        question: '¿Qué es MCP (Model Context Protocol)?',
        answer:
          'Un protocolo abierto para conectar aplicaciones de IA con herramientas y fuentes de datos externas de forma estándar. Un servidor MCP expone tools, resources y prompts; cualquier cliente compatible (IDEs, asistentes, agentes) puede usarlos sin una integración a medida para cada uno.',
      },
      {
        topic: 'evals',
        question: '¿Cómo evaluarías si un cambio de prompt mejora o empeora un sistema con LLMs?',
        answer:
          'Con un set de evals: casos representativos y bordes con el resultado esperado. Se puntúan con checks deterministas (formato, tests que pasan), con un LLM como juez usando una rúbrica clara o con revisión humana. Se corren antes y después del cambio para comparar, varias veces porque la salida es no determinista, y se suman casos nuevos a partir de fallas reales.',
      },
      {
        topic: 'workflow',
        question:
          '¿Cómo estructurás una tarea grande para que un agente de código la resuelva bien?',
        answer:
          'Explorar y planificar antes de codear, dividir en pasos chicos y verificables, dar contexto del repo (convenciones en un archivo tipo CLAUDE.md o AGENTS.md) y, sobre todo, un mecanismo de verificación: tests, typecheck, linter o screenshots para que el agente compruebe su propio trabajo. Commits frecuentes para poder volver atrás.',
      },
      {
        topic: 'salida',
        question: '¿Cómo obtenés salidas estructuradas confiables de un LLM?',
        answer:
          'Usando structured outputs o tool use con un JSON schema para que la respuesta respete el formato, y validando siempre del lado del código (por ejemplo con Zod). Ante un error de validación, reintentar pasándole el error al modelo. Mantener los schemas simples y con descripciones en cada campo.',
      },
      {
        topic: 'costos',
        question: '¿Cómo reducirías el costo y la latencia de una aplicación con LLMs?',
        answer:
          'Elegir el modelo más chico que resuelva bien cada paso, usar prompt caching para prefijos repetidos (system prompt, documentos), recortar el contexto, limitar los tokens de salida, hacer streaming para mejorar la latencia percibida, paralelizar llamadas independientes y usar procesamiento por lotes cuando no hace falta respuesta inmediata.',
      },
    ],
    senior: [
      {
        topic: 'arquitectura',
        question: '¿Cuándo usarías un workflow predefinido y cuándo un agente autónomo?',
        answer:
          'Un workflow (prompt chaining, routing, paralelización) sigue pasos definidos en código: es más predecible, barato y fácil de testear, ideal cuando la tarea es conocida. Un agente decide sus propios pasos: sirve para tareas abiertas donde no se puede prever el camino, a cambio de más costo, latencia y riesgo de errores acumulados. Conviene empezar por lo más simple y sumar autonomía solo si mejora los resultados medibles.',
      },
      {
        topic: 'multi-agente',
        question: '¿Qué ventajas y riesgos tiene un sistema multi-agente?',
        answer:
          'Ventajas: paralelizar trabajo independiente, especializar agentes y aislar contexto (cada subagente explora y devuelve solo un resumen al orquestador). Riesgos: más tokens y costo, coordinación difícil, pérdida de información entre agentes, trabajo duplicado y errores que se propagan. Funciona mejor con tareas fácilmente divisibles e instrucciones muy precisas para cada subagente.',
      },
      {
        topic: 'seguridad',
        question: '¿Qué es prompt injection y cómo protegés a un agente?',
        answer:
          'Es cuando contenido no confiable (una web, un issue, un email, la salida de una herramienta) incluye instrucciones que el modelo termina siguiendo. No hay una solución total: se mitiga con mínimo privilegio en las herramientas, sandboxing, separar datos de instrucciones, confirmación humana para acciones irreversibles o externas, allowlists de red y no mezclar en un mismo agente datos privados, contenido no confiable y capacidad de exfiltrar.',
      },
      {
        topic: 'producción',
        question: '¿Cómo llevarías un agente a producción de forma confiable?',
        answer:
          'Evals continuas y regresiones en CI, tracing de cada paso (prompts, tool calls, tokens, latencia), límites de iteraciones y presupuesto, timeouts y reintentos, fallbacks entre modelos, guardrails en entrada y salida, human-in-the-loop en acciones riesgosas, versionado de prompts y modelos, y monitoreo de calidad con muestras revisadas por humanos.',
      },
      {
        topic: 'contexto',
        question: '¿Cómo manejás tareas de larga duración que superan la ventana de contexto?',
        answer:
          'Compactando o resumiendo el historial, guardando estado y notas en archivos externos (progreso, decisiones, TODOs) que el agente relee, usando git como checkpoint, delegando exploraciones en subagentes que devuelven resúmenes y diseñando la tarea para que un agente nuevo pueda retomarla desde ese estado persistido.',
      },
      {
        topic: 'evals',
        question: '¿Cómo diseñarías un sistema de evaluación para un agente de código?',
        answer:
          'Tareas reales con verificación objetiva: un repo en un estado inicial y tests ocultos que deben pasar (estilo SWE-bench), ejecutadas en sandboxes reproducibles. Medir tasa de éxito, costo, tiempo y cantidad de pasos, correr cada tarea varias veces (pass@k), analizar transcripts de fallas para entender la causa y complementar con LLM-as-judge para calidad de código y revisión humana periódica.',
      },
      {
        topic: 'liderazgo',
        question: '¿Cómo integrarías agentes de código en el flujo de trabajo de un equipo?',
        answer:
          'Definir dónde aportan (bugs acotados, tests, migraciones, code review, documentación), documentar convenciones del repo para los agentes, mantener la revisión humana obligatoria y la responsabilidad en quien mergea, configurar permisos y sandboxes, reforzar la verificación automática (CI, tests, tipos) y medir el impacto real en calidad y velocidad en lugar de adoptarlo por moda.',
      },
      {
        topic: 'arquitectura',
        question: '¿Qué trade-offs considerás al elegir el modelo para cada parte del sistema?',
        answer:
          'Capacidad de razonamiento, latencia, costo por token, ventana de contexto, soporte de herramientas y multimodalidad, y requisitos de privacidad o despliegue. Se suele usar un modelo grande para planificar o para pasos difíciles y modelos chicos y rápidos para clasificación, extracción o subtareas, validando cada elección con evals y no con intuición.',
      },
    ],
  },
};
