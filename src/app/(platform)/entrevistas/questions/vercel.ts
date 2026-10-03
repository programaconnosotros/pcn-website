import type { InterviewQuestion, Seniority } from './types';

export const vercelQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'vercel',
      question: '¿Qué es Vercel y cómo funciona un deploy conectado a Git?',
      answer:
        'Vercel es una plataforma para desplegar aplicaciones web, sobre todo frameworks frontend como Next.js, sin administrar servidores. Conectás un repositorio de GitHub, GitLab o Bitbucket, y cada push dispara un build que genera los archivos estáticos y las funciones, y los publica en su CDN. Un push a la rama de producción actualiza el dominio principal, y cada deploy queda inmutable con su propia URL.',
    },
    {
      topic: 'vercel',
      question: '¿Qué son los preview deployments?',
      answer:
        'Son deploys automáticos de cada rama o pull request que no es la de producción, cada uno con su propia URL. Sirven para revisar los cambios en un entorno real antes de mergear: el equipo, QA o producto pueden probar el link, y Vercel lo comenta en el PR. Usan las variables de entorno del entorno Preview, así que conviene que apunten a servicios de prueba y no a la base de producción.',
    },
    {
      topic: 'vercel',
      question: '¿Cómo se manejan las variables de entorno en Vercel?',
      answer:
        'Se configuran en el proyecto y se asignan a uno o más entornos: Production, Preview y Development, e incluso a ramas específicas de preview. Las variables se leen en el build y en las funciones; en Next.js, solo las que empiezan con `NEXT_PUBLIC_` llegan al navegador, así que los secretos nunca deben llevar ese prefijo. Con `vercel env pull` las bajás a un archivo local para desarrollar. Cambiar una variable no afecta deploys existentes: hay que volver a desplegar.',
    },
    {
      topic: 'vercel',
      question: '¿Cómo volverías atrás un deploy roto en producción en Vercel?',
      answer:
        'Como cada deploy es inmutable, podés usar Instant Rollback para que el dominio de producción vuelva a apuntar a un deploy anterior que funcionaba, sin reconstruir nada. Es casi inmediato porque solo cambia el alias. Después corregís el problema con un commit nuevo. Hay que tener en cuenta que el rollback no revierte cambios de base de datos ni de variables de entorno.',
    },
    {
      topic: 'vercel',
      question: '¿Cómo conectás un dominio propio a un proyecto de Vercel?',
      answer:
        'Agregás el dominio en la configuración del proyecto y después configurás el DNS: para un subdominio, un registro `CNAME` apuntando a Vercel; para el dominio raíz, un registro `A` con la IP que indica Vercel, o directamente delegás los nameservers a Vercel. Vercel emite y renueva el certificado TLS automáticamente. También podés definir redirecciones, por ejemplo de `www` al dominio raíz.',
    },
    {
      topic: 'vercel',
      question: '¿Qué son las Vercel Functions?',
      answer:
        'Son el cómputo del lado del servidor de Vercel: las rutas de API, el server-side rendering y los server actions de un framework se despliegan como funciones que escalan automáticamente según las requests. No administrás servidores y pagás por uso. Pueden correr en el runtime de Node.js (u otros lenguajes como Python) o en el runtime edge, y tienen límites de duración y memoria configurables según el plan.',
    },
  ],
  'semi-senior': [
    {
      topic: 'vercel',
      question: '¿Qué diferencia hay entre el runtime de Node.js y el runtime edge en Vercel?',
      answer:
        'El runtime de Node.js tiene acceso a todas las APIs de Node y a cualquier paquete de npm, más memoria y más duración, y corre en la región que configures, idealmente cerca de tu base de datos. El runtime edge es más liviano, basado en APIs web estándar, con arranque muy rápido, pero con APIs limitadas y sin módulos nativos de Node. Hoy Vercel recomienda Node.js para la mayoría de los casos; edge tiene sentido para lógica liviana como redirecciones o personalización simple. Si tu función consulta una base en una región, correrla lejos de esa base empeora la latencia.',
    },
    {
      topic: 'vercel',
      question: '¿Qué es Fluid compute en Vercel y qué problema resuelve?',
      answer:
        'Es el modelo de ejecución de las Vercel Functions en el que una misma instancia puede atender varias invocaciones concurrentes, en vez de una invocación por instancia como en el serverless clásico. Eso aprovecha el tiempo en que la función espera I/O, como una llamada a una base o a un modelo de IA, reduce cold starts y baja costos. Además se cobra por el tiempo de CPU activo y no por el tiempo esperando. Como contrapartida, tenés que cuidar el estado global compartido entre requests, igual que en un servidor tradicional.',
    },
    {
      topic: 'vercel',
      question: '¿Cómo funciona el caché de Vercel y qué es ISR?',
      answer:
        'Vercel tiene un CDN que cachea las respuestas según los headers `Cache-Control`, por ejemplo con `s-maxage` y `stale-while-revalidate`, además de los assets estáticos. ISR (Incremental Static Regeneration) genera páginas estáticas y las regenera en segundo plano después de un tiempo o bajo demanda, sin redeployar el sitio. En Next.js se revalida por tiempo o con `revalidatePath` y `revalidateTag` cuando cambian los datos. Así obtenés la velocidad del contenido estático con datos razonablemente frescos.',
    },
    {
      topic: 'vercel',
      question: '¿Para qué sirve el middleware y qué cuidados hay que tener?',
      answer:
        'El middleware corre antes de que la request llegue a la página o a la ruta, y se usa para redirecciones, reescrituras, chequeos de autenticación livianos, internacionalización o experimentos A/B. Se ejecuta en cada request que coincide con su `matcher`, así que tiene que ser rápido y conviene acotarlo para que no corra en assets estáticos. No debería ser la única barrera de autorización: los datos también tienen que validarse en el servidor donde se leen. Y evitá llamadas lentas a bases de datos ahí, porque suman latencia a todo el sitio.',
    },
    {
      topic: 'vercel',
      question: '¿Cómo configurarías un monorepo con varias aplicaciones en Vercel?',
      answer:
        'Se crea un proyecto de Vercel por aplicación, todos conectados al mismo repositorio, y en cada uno se configura el root directory de esa app. Con Turborepo o un workspace de pnpm, Vercel detecta las dependencias internas y puede saltear el build de proyectos que no cambiaron, con el ignored build step o la detección automática de cambios. El remote cache de Turborepo evita reconstruir paquetes compartidos. Así cada app tiene sus dominios, variables y deploys independientes.',
    },
    {
      topic: 'vercel',
      question: '¿Cómo programarías tareas periódicas en Vercel y qué limitaciones tienen?',
      answer:
        'Con Vercel Cron Jobs: definís en `vercel.json` una expresión cron y la ruta que se llama, y Vercel le hace una request en el horario indicado sobre el deploy de producción. La ruta es una función común, así que está sujeta a su duración máxima, y conviene protegerla verificando el header `Authorization` con el `CRON_SECRET`. La frecuencia y la precisión dependen del plan, y puede haber ejecuciones duplicadas o perdidas, así que el job tiene que ser idempotente. Para procesos largos o colas, es mejor un servicio de workflows o colas dedicado.',
    },
  ],
  senior: [
    {
      topic: 'vercel',
      question: '¿Qué es Skew Protection y qué problema evita?',
      answer:
        'El version skew pasa cuando un cliente que cargó la versión anterior de la app sigue haciendo requests después de un deploy, y el servidor ya tiene la versión nueva: los chunks de JavaScript o los IDs de server actions no coinciden y aparecen errores. Skew Protection hace que las requests de ese cliente se sigan sirviendo con el deploy con el que cargó la página, durante un tiempo configurable. Es especialmente útil con Next.js y deploys frecuentes. Igual, las APIs y la base de datos tienen que ser compatibles hacia atrás.',
    },
    {
      topic: 'vercel',
      question: '¿Cómo protegerías una aplicación en Vercel contra abuso y ataques?',
      answer:
        'Vercel incluye mitigación DDoS automática en su red, y el Vercel Firewall permite reglas custom (por IP, país, path, headers o user agent), rate limiting y el set de reglas administradas del WAF. También se puede activar el modo de desafío ante un ataque y bloquear bots con la protección de bots. Para los preview deployments, Deployment Protection evita que sean públicos. Y además de la plataforma, la aplicación tiene que validar input y autorización, y limitar operaciones caras como el envío de mails o llamadas a modelos de IA.',
    },
    {
      topic: 'vercel',
      question: '¿Cómo controlarías el costo de una aplicación con mucho tráfico en Vercel?',
      answer:
        'Primero entender qué se cobra: requests, transferencia, tiempo de CPU de las funciones, optimización de imágenes, ISR y uso de middleware. Después cachear al máximo en el CDN con `Cache-Control` e ISR para no ejecutar funciones en cada request, acotar el `matcher` del middleware, y revisar las funciones más caras en los dashboards de uso. Configurar spend management con alertas y un límite para no llevarse sorpresas. Y vigilar el abuso de bots, que suele inflar el consumo.',
    },
    {
      topic: 'vercel',
      question: '¿Cuándo no usarías Vercel?',
      answer:
        'Cuando el sistema es principalmente un backend con procesos de larga duración, conexiones persistentes como WebSockets propios, jobs pesados, o cómputo con GPU: ahí conviene un contenedor en un cloud o en una plataforma de servidores. También si el volumen es tan alto y predecible que el costo por uso supera al de infraestructura propia, o si hay requisitos regulatorios de residencia o de red privada que la plataforma no cubre en tu plan. Un patrón común es frontend y BFF en Vercel y servicios pesados en AWS, GCP o Azure. Lo importante es elegir por las necesidades del producto y no por moda.',
    },
    {
      topic: 'vercel',
      question: '¿Cómo diagnosticarías una página lenta servida desde Vercel?',
      answer:
        'Primero ubicaría dónde está el tiempo: con el header `x-vercel-cache` veo si la respuesta salió del caché (`HIT`, `MISS`, `STALE`), y con los logs y la observabilidad de Vercel veo la duración de las funciones y si hubo cold starts. Si la función tarda, reviso la región respecto de la base de datos, queries en serie que podrían ser paralelas y llamadas externas lentas, idealmente con trazas de OpenTelemetry. Si el problema está en el navegador, miro Speed Insights y las Core Web Vitals reales. Muchas veces la solución es cachear o mover la función cerca de los datos.',
    },
    {
      topic: 'vercel',
      question: '¿Cómo integrarías Vercel en un flujo de release con controles de calidad?',
      answer:
        'Cada PR genera un preview deployment donde corren tests E2E contra la URL del preview (por ejemplo, disparados por el evento de deploy en GitHub Actions), y los checks obligatorios del repositorio bloquean el merge si fallan. Para producción, se puede desactivar el auto-assign del dominio en el deploy de producción y promover manualmente o desde el pipeline cuando pasan las verificaciones, o usar rolling releases para ir subiendo tráfico gradualmente. Las migraciones de base de datos se coordinan para que sean compatibles hacia atrás, y el rollback queda en Instant Rollback.',
    },
  ],
};
