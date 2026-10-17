import type { InterviewQuestion, Seniority } from './types';

export const qaAutomationQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'testing',
      question: '¿Qué es la pirámide de testing y por qué tiene esa forma?',
      answer:
        'Propone muchos tests unitarios en la base, una cantidad media de tests de integración y pocos tests end-to-end en la punta. Tiene esa forma porque los unitarios son rápidos, baratos y precisos al fallar, mientras que los E2E son lentos, más frágiles y caros de mantener. La idea es detectar la mayoría de los errores lo más abajo posible.',
    },
    {
      topic: 'automatización',
      question:
        '¿Qué diferencia hay entre un test manual y uno automatizado? ¿Cuándo conviene cada uno?',
      answer:
        'El automatizado lo ejecuta una herramienta de forma repetible y rápida; el manual depende de una persona. Conviene automatizar lo que se repite seguido, como regresiones y flujos críticos. El testing manual sigue siendo mejor para exploratorio, usabilidad y funcionalidades que cambian todo el tiempo.',
    },
    {
      topic: 'selectores',
      question: '¿Qué selector usarías para encontrar un botón en un test E2E y por qué?',
      answer:
        'Preferiría un atributo dedicado como `data-testid` o, mejor aún, un selector por rol y texto accesible. Las clases CSS o los XPath largos se rompen cuando cambia el estilo o la estructura del DOM. Un selector estable hace que el test falle solo cuando cambia el comportamiento, no el diseño.',
    },
    {
      topic: 'testing',
      question: '¿Qué partes tiene un buen caso de prueba automatizado?',
      answer:
        'Suele seguir el patrón Arrange-Act-Assert (o Given-When-Then): preparar el estado y los datos, ejecutar la acción y verificar el resultado esperado. Tiene que tener un nombre que describa el comportamiento, probar una sola cosa y ser independiente de los demás tests.',
    },
    {
      topic: 'flakiness',
      question: '¿Qué es un flaky test?',
      answer:
        'Es un test que a veces pasa y a veces falla sin que cambie el código. Las causas típicas son esperas fijas (`sleep`), dependencias entre tests, datos compartidos o servicios externos inestables. Son peligrosos porque el equipo deja de confiar en la suite y empieza a ignorar fallas reales.',
    },
    {
      topic: 'aserciones',
      question: '¿Qué es una aserción y qué hace que una aserción sea buena?',
      answer:
        'Es la verificación que compara el resultado obtenido con el esperado y hace fallar el test si no coinciden. Una buena aserción es específica (chequea el valor concreto, no solo que "existe algo"), verifica lo que ve el usuario o el contrato de la API y da un mensaje de error claro cuando falla.',
    },
  ],
  'semi-senior': [
    {
      topic: 'arquitectura',
      question: '¿Qué es el Page Object Model y qué problemas resuelve? ¿Tiene desventajas?',
      answer:
        'Es un patrón que encapsula los selectores y acciones de cada página o componente en una clase u objeto, así los tests hablan en términos de negocio (`loginPage.login(user)`). Reduce duplicación y, si cambia la UI, se corrige en un solo lugar. Como desventaja, puede crecer a clases enormes o esconder demasiado; alternativas como app actions o el Screenplay pattern ayudan en suites grandes.',
    },
    {
      topic: 'flakiness',
      question: '¿Cómo encararías una suite con varios flaky tests?',
      answer:
        'Primero mediría: detectar qué tests fallan intermitentemente con reintentos y reportes históricos, y ponerlos en cuarentena para que no bloqueen el pipeline. Después buscaría la causa raíz: reemplazar esperas fijas por esperas a condiciones, aislar datos, mockear dependencias inestables y eliminar dependencias de orden. Los reintentos automáticos son un parche, no la solución.',
    },
    {
      topic: 'datos de prueba',
      question: '¿Cómo manejás los datos de prueba para que los tests sean independientes?',
      answer:
        'Cada test crea los datos que necesita, idealmente vía API o seed directo a la base en lugar de por la UI, y no depende de lo que dejó otro test. Uso datos únicos (por ejemplo con un sufijo aleatorio) para evitar colisiones al correr en paralelo, y limpio o reseteo el estado antes de cada test. Así se pueden correr en cualquier orden.',
    },
    {
      topic: 'mocks',
      question:
        '¿Cuál es la diferencia entre un mock, un stub y un fake? ¿Cuándo mockearías en un test E2E?',
      answer:
        'Un stub devuelve respuestas predefinidas, un mock además verifica cómo fue llamado y un fake es una implementación simplificada que funciona (como una base en memoria). En E2E mockearía servicios de terceros (pagos, emails) o para forzar casos difíciles como errores 500 o timeouts. Pero mantendría algunos tests contra el backend real para no perder la confianza en la integración.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo integrarías una suite automatizada en un pipeline de CI/CD?',
      answer:
        'Correría unitarios y de integración en cada push o PR, y los E2E críticos (smoke) antes de mergear o al desplegar a staging, con la suite completa en un job nocturno si es lenta. El pipeline tiene que fallar si fallan los tests y publicar reportes, screenshots y videos como artefactos. Paralelizar y cachear dependencias mantiene el feedback rápido.',
    },
    {
      topic: 'automatización',
      question: '¿Qué criterios usás para decidir qué automatizar y qué no?',
      answer:
        'Priorizo flujos críticos para el negocio, casos que se repiten en cada regresión, escenarios con muchas combinaciones de datos y funcionalidades estables. No automatizo funcionalidades que cambian todo el tiempo, verificaciones visuales subjetivas ni casos que se ejecutan una sola vez. También elijo el nivel correcto: si algo se puede probar con un unitario, no hace falta un E2E.',
    },
  ],
  senior: [
    {
      topic: 'estrategia',
      question:
        'Llegás a un equipo sin tests automatizados y con releases que rompen producción. ¿Cómo armarías la estrategia de testing?',
      answer:
        'Empezaría entendiendo dónde están los riesgos: qué flujos generan más incidentes y valor de negocio. Armaría un smoke E2E de los flujos críticos para frenar lo más grave rápido, y en paralelo impulsaría tests unitarios y de integración junto a los devs, con la calidad como responsabilidad del equipo. Definiría métricas (escape de bugs, tiempo de feedback, flakiness) y lo integraría al CI como gate de merge.',
    },
    {
      topic: 'contratos',
      question:
        '¿Qué son los tests de contrato y qué problema resuelven en una arquitectura de microservicios?',
      answer:
        'Verifican que un proveedor (una API) cumpla el contrato que esperan sus consumidores, sin levantar todo el sistema. Con consumer-driven contracts (por ejemplo Pact), cada consumidor publica sus expectativas y el proveedor las valida en su pipeline. Reemplazan gran parte de los E2E entre servicios, que son lentos y frágiles, y detectan cambios incompatibles antes del deploy.',
    },
    {
      topic: 'roi',
      question: '¿Cómo medirías y justificarías el ROI de la automatización ante el negocio?',
      answer:
        'Compararía el costo de construir y mantener la suite contra el ahorro: horas de regresión manual evitadas, frecuencia de releases, bugs detectados antes de producción y el costo de esos incidentes. También mediría el lead time y la confianza para desplegar. Una suite con mucho mantenimiento o flakiness puede tener ROI negativo, así que el mantenimiento entra en la cuenta.',
    },
    {
      topic: 'ci/cd',
      question: 'La suite E2E tarda 90 minutos y frena los deploys. ¿Qué harías?',
      answer:
        'Paralelizaría en varios workers balanceando por duración histórica y no por cantidad de archivos. Movería casos a niveles más bajos de la pirámide cuando no necesiten la UI, crearía datos por API en vez de por pantalla y reutilizaría sesiones de login. Separaría un smoke rápido que bloquea el merge de la regresión completa, y correría solo los tests afectados por el cambio cuando sea posible.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo diseñarías un framework de automatización para que lo usen varios equipos?',
      answer:
        'Separaría capas: utilidades core (config por entorno, clientes de API, generación de datos, reporting) y la capa de tests de cada equipo encima. Definiría convenciones claras de selectores, estructura y naming, con linters y code review. Lo trataría como un producto: versionado, documentación, ejemplos y ownership, evitando abstracciones que solo entienda quien las escribió.',
    },
    {
      topic: 'reporting',
      question:
        '¿Qué información debería dar un buen sistema de reporting de tests y cómo lo usarías para mejorar la suite?',
      answer:
        'Por cada falla: el paso exacto, el error, screenshots, video, logs de red y consola, y el commit y entorno. A nivel suite: tendencias de duración, tasa de flakiness por test y fallas más frecuentes. Con esos datos priorizo qué tests estabilizar o eliminar, detecto áreas frágiles del producto y muestro la salud de la calidad al equipo.',
    },
  ],
};
