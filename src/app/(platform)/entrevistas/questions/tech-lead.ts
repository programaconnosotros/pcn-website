import type { InterviewQuestion, Seniority } from './types';

export const techLeadQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'rol',
      question: '¿Qué hace un tech lead y en qué se diferencia de un desarrollador senior?',
      answer:
        'Un desarrollador senior se mide sobre todo por lo que entrega con sus manos; un tech lead se mide por lo que entrega el equipo. Además de programar, se hace cargo de la dirección técnica (decisiones, estándares, calidad), de que el trabajo esté bien partido y fluya, de destrabar a la gente y de ser el puente técnico con producto. Una buena respuesta muestra que el cambio es de foco: por ejemplo, pasar de tomar la tarea más difícil del sprint a emparejar con alguien para que la pueda hacer él y quede conocimiento repartido.',
    },
    {
      topic: 'rol',
      question: '¿Cuál es la diferencia entre un tech lead y un engineering manager?',
      answer:
        'El tech lead es dueño del cómo técnico: arquitectura del equipo, calidad, decisiones de diseño y ejecución. El engineering manager es dueño de las personas y la organización: contratación, evaluaciones de desempeño, carrera, salarios y salud del equipo. Se solapan en mentoría y planificación, y en empresas chicas una persona puede hacer ambas cosas. Un ejemplo claro: si alguien rinde por debajo de lo esperado, el tech lead aporta feedback técnico concreto, pero la conversación formal de desempeño la lleva el manager.',
    },
    {
      topic: 'transición',
      question: '¿Por qué querés ser tech lead?',
      answer:
        'Una respuesta fuerte habla de multiplicar impacto a través de otros, no de "subir de puesto" o de tener la última palabra. Conviene mostrar evidencia de que ya hiciste parte del trabajo sin el título: guiaste a alguien nuevo, propusiste y llevaste adelante una mejora técnica, coordinaste una entrega entre varias personas. Por ejemplo: "me di cuenta de que disfrutaba más cuando destrabé a dos compañeros con el diseño de la API que cuando cerré mi propio ticket". También suma reconocer lo que vas a extrañar, como el tiempo largo de foco programando.',
    },
    {
      topic: 'code review',
      question: '¿Qué mirás primero cuando revisás un pull request?',
      answer:
        'Primero el objetivo y el diseño: si el cambio resuelve el problema correcto, si el enfoque encaja con el resto del sistema y si falta algo importante (casos borde, migraciones, permisos, tests). Recién después los detalles de legibilidad y estilo, que idealmente cubren el linter y el formatter. Una buena respuesta también menciona el tono: comentarios con preguntas y motivos, separando lo bloqueante de lo opcional (por ejemplo con el prefijo "nit:"). Revisar 800 líneas de golpe es poco efectivo, así que también conviene pedir PRs más chicos.',
    },
    {
      topic: 'code review',
      question: '¿Qué hacés si un compañero se toma mal los comentarios de tus code reviews?',
      answer:
        'Hablarlo en privado y en sincrónico, no en el hilo del PR: preguntar cómo los está leyendo y escuchar antes de defenderte. Muchas veces el problema es el tono escrito o la cantidad de comentarios menores, así que podés ajustar: explicar el porqué de cada pedido, marcar lo opcional, reconocer lo que está bien y pasar a una llamada cuando hay idas y vueltas. Por ejemplo, acordar que lo de estilo lo resuelve el linter y que los reviews se enfocan en diseño y correctitud baja mucho la fricción.',
    },
    {
      topic: 'descomposición',
      question: '¿Cómo partís una feature grande en tareas para el equipo?',
      answer:
        'Primero entender el resultado esperado y los riesgos, después cortar en rebanadas verticales que se puedan entregar y probar de punta a punta, en vez de capas (todo el backend, después todo el frontend). Conviene empezar por la rebanada que más incertidumbre saca, y separar lo que se puede hacer en paralelo de lo que tiene dependencias. Por ejemplo, para un checkout nuevo: primero un flujo mínimo con un medio de pago detrás de un feature flag, después cupones, después otros medios de pago. Tareas de uno a tres días son más fáciles de revisar y de seguir.',
    },
    {
      topic: 'estimación',
      question: '¿Cómo estimás una tarea que nunca hiciste?',
      answer:
        'Reconociendo la incertidumbre en vez de inventar un número: separar lo conocido de lo desconocido, hacer un spike acotado en tiempo para investigar lo que más riesgo tiene y dar un rango que se va achicando. También sirve comparar con trabajo parecido del pasado y estimar con el equipo, no solo. Por ejemplo: "integrar el nuevo proveedor de pagos lleva entre una y tres semanas; con dos días de spike sobre su sandbox te doy algo más preciso". Una mala respuesta da una fecha optimista para quedar bien.',
    },
    {
      topic: 'desbloqueo',
      question: '¿Cómo te das cuenta de que alguien del equipo está trabado y qué hacés?',
      answer:
        'Las señales suelen ser una tarea que no se mueve en el tablero hace días, dailies con "sigo con lo mismo", PRs que no aparecen o preguntas que no se hacen. Lo útil es preguntar en privado y sin juicio, y ofrecer ayuda concreta: emparejar media hora, conectarlo con quien sabe o redefinir el alcance. Por ejemplo, si alguien lleva tres días peleando con un test flaky, sentarse juntos un rato suele destrabar más que cualquier consejo. También conviene crear un ambiente donde pedir ayuda temprano sea lo normal.',
    },
    {
      topic: 'mentoría',
      question: '¿Cómo ayudarías a crecer a un desarrollador junior del equipo?',
      answer:
        'Con tareas que lo estiren un poco pero con red: empezar por algo acotado y con buen contexto, ir sumando ambigüedad, y acompañar con pair programming, code reviews que expliquen el porqué y espacios regulares para preguntas. Conviene acordar con él qué quiere aprender y darle visibilidad cuando hace algo bien. Por ejemplo, después de un par de bugs, darle una feature chica de punta a punta y que la presente en la demo. El error común es resolverle los problemas en vez de hacerle las preguntas que lo llevan a resolverlos.',
    },
    {
      topic: 'deuda técnica',
      question: '¿Qué es la deuda técnica y cómo se la explicás a alguien de producto?',
      answer:
        'Es el costo futuro de atajos o decisiones que hoy ya no encajan: cada cambio en esa zona es más lento y más riesgoso, como pagar intereses. A producto conviene explicarla en su idioma, con impacto concreto: "cada cambio en facturación tarda el doble y en el último trimestre causó tres incidentes". Una buena respuesta distingue la deuda deliberada (tomada a conciencia para llegar a una fecha) de la accidental, y propone pagarla de forma incremental, cerca del trabajo de producto, en vez de pedir un "sprint de refactor" abstracto.',
    },
    {
      topic: 'calidad',
      question: '¿Qué tests escribirías para una feature nueva y por qué?',
      answer:
        'Depende del riesgo, pero en general la pirámide: muchos tests unitarios para la lógica de negocio, tests de integración para los bordes (base de datos, APIs externas) y pocos end-to-end para los flujos críticos. Lo importante es testear comportamiento, no implementación, y cubrir los casos borde que más duelen. Por ejemplo, para un cálculo de descuentos: unitarios con combinaciones de cupones y redondeos, un test de integración del endpoint y un e2e del checkout completo. Perseguir un porcentaje de cobertura sin mirar qué se cubre es un error común.',
    },
    {
      topic: 'comunicación',
      question: '¿Cómo le explicás una decisión técnica a alguien que no es técnico?',
      answer:
        'Empezando por el impacto que le importa (tiempo, riesgo, costo, experiencia del usuario) y no por la tecnología. Usar analogías simples, dar opciones con sus consecuencias y evitar la jerga. Por ejemplo, en vez de "necesitamos migrar a colas asincrónicas", decir "hoy, si el proveedor de emails se cae, el usuario no puede registrarse; con este cambio el registro sigue funcionando y los emails salen cuando vuelve". Chequear que se entendió preguntando, no asumiendo.',
    },
    {
      topic: 'situacional',
      question: '¿Qué hacés si te piden una fecha para algo que todavía no está definido?',
      answer:
        'No inventar una fecha ni negarse: explicar qué falta definir, dar un rango amplio con los supuestos explícitos y proponer cómo achicarlo. Por ejemplo: "si es solo exportar a CSV, una semana; si incluye reportes programados por email, un mes; necesito media hora con producto para cerrar el alcance". También sirve ofrecer una fecha para tener una estimación mejor. Lo que muestra madurez es cuidar la confianza: un número dicho al pasar suele convertirse en compromiso.',
    },
    {
      topic: 'conducta',
      question: 'Contame de una vez que tomaste la iniciativa técnica sin que te lo pidieran.',
      answer:
        'Una buena respuesta usa STAR: el problema que viste, por qué importaba, qué hiciste para alinear a otros (no solo el código) y el resultado medible. Por ejemplo: "el build tardaba 25 minutos y todos lo sufrían; medí dónde se iba el tiempo, propuse cachear dependencias y paralelizar tests, lo acordé con el equipo y lo bajamos a 8 minutos". Suma mostrar que lo hiciste sin descuidar tus compromisos y que pediste opinión antes de cambiar algo que afectaba a todos.',
    },
    {
      topic: 'hands-on',
      question: '¿Cuánto tiempo debería programar un tech lead?',
      answer:
        'Depende del tamaño del equipo y de la etapa, pero lo habitual es entre un 30% y un 60%. Lo importante es elegir bien qué programar: trabajo fuera del camino crítico, prototipos para reducir riesgo, herramientas o mejoras que ayudan a todos, en vez de quedarse con la feature más urgente y convertirse en cuello de botella. Por ejemplo, un tech lead que toma la tarea crítica del sprint y después se pasa la semana en reuniones atrasa a todo el equipo. Programar algo sí hace falta para mantener el criterio técnico y la credibilidad.',
    },
  ],
  'semi-senior': [
    {
      topic: 'decisiones',
      question: '¿Cómo tomás una decisión técnica importante en tu equipo?',
      answer:
        'Primero definir el problema y los criterios (costo, riesgo, tiempo, operación, experiencia del equipo), después buscar al menos dos o tres alternativas reales y evaluarlas, idealmente por escrito en un design doc que el equipo pueda comentar. Una buena respuesta distingue decisiones reversibles, que se toman rápido, de las difíciles de deshacer, que merecen más análisis. Por ejemplo, elegir una librería de fechas se resuelve en una charla; elegir la base de datos de un servicio nuevo merece un doc y una prueba de concepto. Al final alguien decide y se registra el porqué.',
    },
    {
      topic: 'adr',
      question: '¿Qué es un ADR y qué incluye?',
      answer:
        'Un Architecture Decision Record es un documento corto que registra una decisión técnica relevante: contexto, la decisión, las alternativas consideradas y las consecuencias (lo que ganamos y lo que aceptamos perder). Vive cerca del código, por ejemplo en `docs/adr/`, numerado e inmutable: si la decisión cambia, se escribe un ADR nuevo que reemplaza al anterior. Sirve para que dentro de un año alguien entienda por qué se eligió Postgres en vez de MongoDB sin depender de la memoria de nadie. El error común es escribirlos después y sin alternativas, como acta.',
    },
    {
      topic: 'rfc',
      question: '¿Cómo escribís un design doc o RFC para que realmente sirva?',
      answer:
        'Con el problema y los objetivos claros arriba (y también los no-objetivos), el contexto mínimo, la propuesta con el nivel de detalle justo, alternativas descartadas con su porqué, riesgos, plan de rollout y preguntas abiertas. Tiene que ser corto y circular temprano, cuando todavía se puede cambiar, con revisores elegidos y una fecha para cerrar comentarios. Por ejemplo, un RFC de dos páginas sobre cómo versionar la API pública, revisado por los consumidores antes de escribir código. Un doc de veinte páginas que llega cuando ya está todo hecho no es un RFC, es documentación.',
    },
    {
      topic: 'desacuerdo',
      question: '¿Qué hacés si dos desarrolladores del equipo no se ponen de acuerdo en un diseño?',
      answer:
        'Llevar la discusión de opiniones a criterios: pedir que cada uno escriba su propuesta con trade-offs, acordar qué importa más en este caso (simplicidad, performance, tiempo) y, si hace falta, probar con un spike corto. Si sigue sin consenso, el tech lead decide, explica el porqué y pide "disagree and commit". Por ejemplo, ante REST contra GraphQL para un servicio interno, mirar quiénes lo consumen y qué sabe operar el equipo suele resolverlo. Lo importante es que nadie sienta que perdió por jerarquía sino que se lo escuchó.',
    },
    {
      topic: 'deuda técnica',
      question: '¿Cómo priorizás la deuda técnica frente a las features?',
      answer:
        'Haciéndola visible y medible: un registro de deuda con impacto (incidentes, tiempo extra por cambio, riesgo de seguridad) y costo de arreglarla, para priorizarla con producto como cualquier otro trabajo. Funcionan bien un porcentaje de capacidad acordado (por ejemplo 15-20% por sprint) y la regla de pagarla cuando se toca esa zona por una feature. Por ejemplo: "antes de sumar el nuevo medio de pago, refactorizamos el módulo de cobros; suma tres días pero baja a la mitad el costo de los dos siguientes". Pedir meses de refactor sin entregar valor casi nunca se aprueba.',
    },
    {
      topic: 'planificación',
      question: '¿Cómo trabajás con el product manager para planificar un trimestre?',
      answer:
        'Producto trae los objetivos y el porqué; el tech lead aporta factibilidad, estimaciones gruesas, riesgos, dependencias y el trabajo técnico necesario (deuda, plataforma, seguridad). Juntos se arma un plan con margen para imprevistos, priorizado por valor y riesgo, y se revisa cada pocas semanas. Por ejemplo, detectar en la planificación que una feature depende de que otro equipo exponga una API permite pedirla a tiempo. Una buena respuesta muestra relación de socios, no de "producto pide, ingeniería ejecuta", y que el tech lead dice que no con alternativas.',
    },
    {
      topic: 'alcance',
      question:
        '¿Qué hacés si a mitad del sprint te das cuenta de que no llegan con lo comprometido?',
      answer:
        'Avisar apenas se sabe, no el último día, con un diagnóstico y opciones: qué se puede recortar, qué versión mínima sí llega, qué se mueve al siguiente sprint. Hablarlo con el product manager para que decida qué priorizar, en vez de cargar al equipo con horas extra en silencio. Por ejemplo: "el reporte llega, pero sin exportar a PDF; eso lo sumamos la semana que viene". Después, en la retro, entender por qué pasó (estimación, interrupciones, alcance que creció) para que no se repita.',
    },
    {
      topic: 'incidentes',
      question: '¿Cómo manejás un incidente en producción como tech lead?',
      answer:
        'Primero mitigar, después entender: definir quién coordina (incident commander), quién investiga y quién comunica, y priorizar restaurar el servicio, por ejemplo con un rollback o desactivando un feature flag, antes de buscar la causa raíz. Comunicar el estado a intervalos regulares a soporte y stakeholders. Después del incidente, un postmortem sin culpas con línea de tiempo, causas contribuyentes y acciones con responsable. Por ejemplo: "revertimos el deploy en diez minutos y el postmortem mostró que faltaba una alerta sobre el tiempo de respuesta del proveedor".',
    },
    {
      topic: 'postmortem',
      question: '¿Qué hace que un postmortem sea útil y no un trámite?',
      answer:
        'Que sea sin culpas (se buscan fallas del sistema, no culpables), con una línea de tiempo precisa, el impacto real, las causas contribuyentes (no solo "un humano se equivocó") y pocas acciones concretas con responsable y fecha, que después se siguen. Preguntar "¿por qué el sistema permitió este error?" lleva a mejoras de verdad. Por ejemplo, en vez de "Juan va a tener más cuidado con las migraciones", la acción es "las migraciones que bloquean tablas grandes fallan en CI". El error común es llenar el doc de acciones que nadie cierra.',
    },
    {
      topic: 'estándares',
      question: '¿Cómo definís y hacés cumplir estándares de código en el equipo?',
      answer:
        'Acordándolos con el equipo, escribiéndolos de forma corta y automatizando todo lo posible: formatter, linter, chequeo de tipos y tests en CI, para que la discusión humana en los reviews se enfoque en diseño. Lo que no se puede automatizar, como convenciones de arquitectura, va en una guía breve con ejemplos y en plantillas. Por ejemplo, una regla de ESLint que prohíbe importar la base de datos desde componentes de UI evita cientos de comentarios. Imponer estándares por gusto personal, sin explicar el porqué, genera resistencia.',
    },
    {
      topic: 'delegación',
      question: '¿Cómo decidís qué delegar y qué hacer vos?',
      answer:
        'Delegar casi todo lo que otro puede hacer, sobre todo lo que lo hace crecer, y quedarse con lo que solo el tech lead puede destrabar (decisiones, alineación, riesgos) o con lo que es muy riesgoso y urgente. Delegar resultados con contexto, no tareas paso a paso, y ajustar el seguimiento a la experiencia de la persona. Por ejemplo, darle a un semi-senior el diseño de la integración con un nuevo proveedor, con un check-in sobre el design doc antes de que empiece a codear. El error común es delegar y después rehacerlo, o no delegar porque "es más rápido si lo hago yo".',
    },
    {
      topic: 'onboarding',
      question: '¿Cómo armás el onboarding de un desarrollador nuevo en tu equipo?',
      answer:
        'Con el entorno funcionando el primer día (un README o script que levante todo), un buddy asignado, un mapa del sistema y del dominio, y un primer PR chico a producción en la primera semana. Después, tareas de complejidad creciente y check-ins regulares para saber qué falta. Por ejemplo, una lista de "primeras tareas" con bugs acotados en distintas partes del código ayuda a conocer el sistema. Una buena respuesta también menciona pedirle al nuevo que mejore la documentación de onboarding con lo que le costó, porque ve lo que el resto ya no ve.',
    },
    {
      topic: 'ci/cd',
      question: '¿Qué le pedís a un buen pipeline de CI/CD?',
      answer:
        'Que sea rápido (idealmente menos de diez minutos para el feedback principal), confiable (sin tests flaky que el equipo aprende a ignorar) y que bloquee lo que tiene que bloquear: build, tipos, linter, tests y chequeos de seguridad. Del lado del deploy, que sea automático, frecuente y reversible, con estrategias como feature flags o canary. Por ejemplo, poder hacer rollback en un comando cambia la forma en que el equipo se anima a deployar. Una buena respuesta mide con métricas como las de DORA: frecuencia de deploy, lead time, tasa de fallas y tiempo de recuperación.',
    },
    {
      topic: 'conducta',
      question: 'Contame de una vez que tomaste una decisión técnica que resultó equivocada.',
      answer:
        'Lo que se evalúa es la honestidad y el aprendizaje, no que no te equivoques. Una buena respuesta cuenta el contexto y por qué la decisión parecía razonable, cuándo y cómo te diste cuenta, qué hiciste para corregirla (incluida la comunicación al equipo y a producto) y qué cambiaste en tu forma de decidir. Por ejemplo: "elegimos microservicios para un equipo de cuatro personas; a los seis meses el costo operativo nos frenaba, lo reconocí, consolidamos en un monolito modular y desde entonces escribimos ADRs con criterios de reversión". Culpar al contexto o a otros resta mucho.',
    },
    {
      topic: 'diseño de sistemas',
      question:
        '¿Cómo diseñarías un sistema de notificaciones (email, push y SMS) para tu producto?',
      answer:
        'Empezando por los requisitos: volumen, latencia aceptable, canales, preferencias del usuario y qué pasa si un proveedor falla. Una propuesta razonable: los servicios publican eventos en una cola, un servicio de notificaciones aplica preferencias y plantillas, y workers por canal envían con reintentos con backoff, idempotencia para no duplicar y una dead letter queue para lo que falla siempre. Por ejemplo, un email de "restablecer contraseña" va por una cola prioritaria separada de las newsletters. Una buena respuesta explicita los trade-offs y cómo se observaría (métricas de entrega y alertas).',
    },
  ],
  senior: [
    {
      topic: 'rol',
      question: '¿Cómo cambia el rol cuando pasás de liderar un equipo a liderar varios?',
      answer:
        'Se pasa de decidir a crear las condiciones para que otros decidan bien: definir principios y estándares compartidos, revisar los diseños de mayor impacto, alinear la dirección técnica con la estrategia y hacer crecer a los tech leads de cada equipo. Programar en el camino crítico ya casi no tiene sentido; el impacto viene de documentos, conversaciones y prototipos. Por ejemplo, en vez de diseñar la integración de cada equipo con el sistema de pagos, escribir los lineamientos y revisar solo los casos difíciles. El riesgo es seguir actuando como tech lead de un equipo y volverse cuello de botella de todos.',
    },
    {
      topic: 'estrategia técnica',
      question: '¿Cómo construís una visión o estrategia técnica para varios equipos?',
      answer:
        'Partiendo del diagnóstico: hacia dónde va el negocio, qué limita hoy a los equipos (tiempos de entrega, incidentes, costos, deuda) y qué capacidades van a hacer falta. De ahí salen pocos principios y apuestas concretas con un plan incremental, escrito y discutido con los equipos para que lo sientan propio. Por ejemplo: "en un año cada equipo deploya solo, sin coordinar con otros; para eso separamos el monolito en estos tres dominios y armamos un pipeline compartido". Una estrategia que no dice qué no se va a hacer, o que nadie conoce, no es estrategia.',
    },
    {
      topic: 'decisiones',
      question: '¿Cómo lográs que varios equipos adopten un estándar técnico sin imponerlo?',
      answer:
        'Haciéndolo el camino fácil: involucrar a los equipos en definirlo, explicar el problema que resuelve, dar herramientas, plantillas y migraciones automatizadas, y empezar con un equipo piloto que muestre el beneficio. Lo obligatorio debería ser poco y justificado, por ejemplo seguridad, y el resto recomendaciones. Por ejemplo, para estandarizar el logging, una librería interna que ya trae trazas y formato correcto y un tablero que funciona solo si la usás convence más que un memo. Medir la adopción y escuchar por qué algunos no adoptan ayuda a mejorar el estándar.',
    },
    {
      topic: 'migraciones',
      question: '¿Cómo planificás una migración grande, como pasar de un monolito a servicios?',
      answer:
        'Primero preguntarse si hace falta y qué problema resuelve; después hacerla incremental, con el patrón strangler fig: extraer de a un dominio, empezando por uno con valor y bajo riesgo, enrutando tráfico gradualmente y con forma de volver atrás. Hace falta definir criterios de éxito, quién mantiene lo viejo mientras tanto y cómo se sigue entregando valor de producto en paralelo. Por ejemplo, extraer primero notificaciones, que tiene bordes claros, antes que facturación. Las migraciones "big bang" que congelan features durante un año suelen fracasar o abandonarse a la mitad.',
    },
    {
      topic: 'situacional',
      question:
        '¿Qué hacés si un equipo toma una decisión técnica que creés que va a afectar a otros equipos?',
      answer:
        'Hablar primero con su tech lead, en privado y con curiosidad: entender el contexto y las restricciones que tal vez no ves. Si el riesgo sigue, hacerlo explícito por escrito con el impacto concreto en los otros equipos y buscar una alternativa juntos, o llevarlo al espacio de decisiones de arquitectura si existe. Por ejemplo, si un equipo quiere cambiar el formato de eventos que consumen otros cuatro, proponer versionar el evento y migrar de forma gradual. Pasar por encima del equipo sin hablar rompe la confianza; no decir nada también es una falla.',
    },
    {
      topic: 'liderar líderes',
      question: '¿Cómo hacés crecer a los tech leads de los equipos que liderás?',
      answer:
        'Dándoles ownership real de las decisiones de su equipo, con un marco claro de qué deciden solos y qué se consulta, y acompañando con 1:1 periódicos, revisión de sus design docs y feedback sobre cómo lideran, no solo sobre lo técnico. Conviene exponerlos a problemas más grandes de a poco y darles visibilidad. Por ejemplo, que un tech lead presente su propuesta en la revisión de arquitectura y vos solo intervengas si hace falta. El error común es resolverles los problemas difíciles, lo que les quita justamente las oportunidades de crecer.',
    },
    {
      topic: 'organización',
      question:
        '¿Qué relación ves entre la estructura de los equipos y la arquitectura del sistema?',
      answer:
        'La ley de Conway dice que los sistemas reflejan la estructura de comunicación de la organización que los construye. Por eso conviene alinear equipos con dominios de negocio y servicios con bordes claros, para reducir la coordinación necesaria (la "maniobra inversa de Conway"). Por ejemplo, si tres equipos tocan el mismo servicio de órdenes, cada cambio requiere sincronizarse y los deploys se traban; asignarle un dueño claro o separarlo por subdominios lo destraba. Una buena respuesta menciona que reorganizar equipos es costoso y que la arquitectura y la estructura se diseñan juntas.',
    },
    {
      topic: 'incidentes',
      question: 'Contame del incidente más serio que te tocó liderar.',
      answer:
        'Una buena respuesta tiene la línea de tiempo clara, el impacto (usuarios, dinero, duración), cómo se organizó la respuesta (roles, comunicación, decisiones bajo presión), la mitigación y qué cambió después a nivel sistema y proceso. Por ejemplo: "una migración bloqueó la tabla de órdenes durante 40 minutos en hora pico; coordiné el rollback, comuniqué cada 15 minutos a soporte y negocio, y el postmortem derivó en chequeos automáticos de migraciones y un runbook de incidentes que hoy usan todos los equipos". Mostrar calma, foco en mitigar y cultura sin culpas es lo que se evalúa.',
    },
    {
      topic: 'stakeholders',
      question:
        '¿Cómo negociás con la dirección cuando el negocio pide algo técnicamente muy riesgoso?',
      answer:
        'Entendiendo primero el objetivo de negocio detrás del pedido, y después presentando el riesgo en términos que importan a la dirección (probabilidad e impacto en clientes, ingresos, seguridad o reputación) junto con alternativas que logren gran parte del objetivo con menos riesgo. Por ejemplo, ante "lanzar en todos los países a la vez el mes que viene", proponer lanzar en un país con feature flags y expandir en semanas. Si la dirección igual decide asumir el riesgo, dejarlo por escrito y preparar mitigaciones. No es decir que no: es dar información para una buena decisión.',
    },
    {
      topic: 'métricas',
      question: '¿Con qué métricas medís la salud técnica y la entrega de varios equipos?',
      answer:
        'Las de DORA son una buena base: frecuencia de deploy, lead time de cambios, tasa de fallas de cambios y tiempo de recuperación. Se complementan con señales de calidad y operación (incidentes, errores, SLOs), de experiencia de desarrollo (tiempo de CI, tiempo de review) y encuestas al equipo. Por ejemplo, ver que el lead time sube porque los PRs esperan dos días por review lleva a acciones concretas. Una buena respuesta advierte que las métricas sirven para encontrar problemas a nivel sistema, no para comparar ni evaluar personas, porque ahí se distorsionan.',
    },
    {
      topic: 'build vs buy',
      question: '¿Cómo decidís entre construir algo internamente o comprar una solución?',
      answer:
        'Mirando si es parte del diferencial del negocio, el costo total (no solo licencia: integración, operación, mantenimiento y personas), el riesgo de dependencia del proveedor, la seguridad y el tiempo hasta tener valor. En general se construye lo que diferencia y se compra lo que es commodity. Por ejemplo, autenticación, observabilidad o envío de emails conviene comprarlos; el motor de precios que es el núcleo del producto, construirlo. Una buena respuesta incluye cómo salir del proveedor si hace falta, por ejemplo con una capa de abstracción mínima.',
    },
    {
      topic: 'cultura',
      question: '¿Cómo construís una cultura de calidad sin frenar la entrega?',
      answer:
        'Haciendo que la calidad sea parte del flujo y no una etapa: tests automatizados que corren rápido, deploys chicos y frecuentes, feature flags, observabilidad y postmortems sin culpas, con la responsabilidad de la calidad en el equipo y no en un QA al final. Calidad y velocidad no compiten a largo plazo; la falta de calidad es lo que termina frenando. Por ejemplo, un equipo que pasa de deployar una vez por semana con un QA manual a deployar varias veces por día con buenos tests suele tener menos incidentes, no más. El ejemplo del líder (tests en sus PRs, reviews serios) pesa mucho.',
    },
    {
      topic: 'conducta',
      question:
        'Contame de una vez que tuviste que convencer a otros equipos de cambiar algo que no querían cambiar.',
      answer:
        'Se busca ver influencia sin autoridad. Una buena respuesta muestra que entendiste sus razones y costos, que armaste el caso con datos y en términos de su beneficio, que bajaste el costo de cambiar (herramientas, ayuda, migración gradual) y que aceptaste ajustar la propuesta. Por ejemplo: "quería que todos los servicios expusieran métricas estándar; dos equipos se resistían por falta de tiempo, así que hicimos la librería y yo mismo migré su primer servicio; al ver los tableros, lo adoptaron solos". Contar que se impuso por jerarquía resta.',
    },
    {
      topic: 'contratación',
      question:
        '¿Cómo diseñarías el proceso de entrevistas técnicas para sumar gente a varios equipos?',
      answer:
        'Partiendo de qué necesita el rol de verdad, con etapas que lo evalúen de forma parecida al trabajo real (por ejemplo, un ejercicio de diseño o de code review en vez de algoritmos de memoria), rúbricas claras para reducir sesgos y entrevistadores entrenados y calibrados. También importa la experiencia del candidato: tiempos cortos, expectativas claras y feedback. Por ejemplo, revisar juntos un PR con problemas sembrados muestra cómo piensa y cómo comunica mejor que invertir un árbol binario. Una buena respuesta menciona revisar el proceso con datos de quién pasa y cómo rinde después.',
    },
    {
      topic: 'hands-on',
      question: '¿Cómo mantenés el criterio técnico si ya casi no programás features?',
      answer:
        'Programando en lugares de alto apalancamiento: prototipos para validar decisiones, herramientas internas, arreglos en la plataforma compartida, y algún bug o feature chica fuera del camino crítico. También revisando código y design docs de forma regular, participando en guardias o postmortems y emparejando con los equipos. Por ejemplo, implementar la prueba de concepto de la nueva cola de mensajes antes de recomendarla a toda la organización. El riesgo de no tocar el código es tomar decisiones con un modelo mental desactualizado y perder credibilidad con los equipos.',
    },
  ],
};
