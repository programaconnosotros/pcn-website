import type { InterviewQuestion, Seniority } from './types';

// Built from the product engineering articles recommended on /lectura (leerob.com, product.engineer
// and the PostHog newsletter): what the role is, Define/Build/Ship, metrics, research and launch.
export const productEngineeringQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'rol',
      question: '¿Qué es un product engineer?',
      answer:
        'Un ingeniero que se hace cargo del resultado y no solo de la implementación: parte de la experiencia que quiere lograr para el usuario y elige la tecnología que la hace posible. No se define por frontend o backend sino por resolver problemas reales de usuarios, con mentalidad iterativa (shippear rápido y aprender del uso real), obsesión por el usuario y pragmatismo: las tecnologías son un medio, no el fin.',
    },
    {
      topic: 'rol',
      question: '¿En qué se diferencia un product engineer de un full-stack developer?',
      answer:
        'Full-stack describe alcance técnico: saber construir en todas las capas. Product engineer describe ownership: hacerse cargo desde el problema del usuario hasta la métrica de negocio. Un full-stack puede implementar perfecto un ticket que nadie usa; a un product engineer se lo evalúa por si el cambio mejoró algo para los usuarios. Muchos product engineers son full-stack, pero no al revés.',
    },
    {
      topic: 'rol',
      question: '¿Cuál es la diferencia entre un product engineer y un platform engineer?',
      answer:
        'El product engineer construye las funcionalidades que usan los usuarios finales y mide su impacto. El platform engineer construye la infraestructura, las herramientas y los sistemas internos que hacen más productivos a los equipos de producto (CI/CD, observabilidad, componentes compartidos). Uno tiene como cliente al usuario; el otro, a los equipos de ingeniería.',
    },
    {
      topic: 'discovery',
      question: 'Te piden construir una feature. ¿Qué hacés antes de empezar a programar?',
      answer:
        'Entender el problema detrás del pedido: quién lo tiene, con qué frecuencia y cómo lo resuelve hoy. Buscar evidencia (tickets de soporte, datos de uso, hablar con algún usuario), definir qué métrica debería moverse si funciona y buscar la versión más chica que permita validar la idea. A veces la conclusión es que no hay que construirla, o que hay que construir otra cosa.',
    },
    {
      topic: 'research',
      question: '¿Cómo podés hacer user research sin un equipo de research?',
      answer:
        'Con métodos livianos que entran en la semana: leer tickets de soporte para encontrar dolores recurrentes, mirar session replays buscando rage clicks y dudas, hacer llamadas cortas preguntando por experiencias pasadas (sin preguntas que sugieran la respuesta), micro-encuestas de una pregunta en el momento justo y pruebas de usabilidad con 3 a 5 personas que piensan en voz alta. Una hora por semana alcanza para crear el hábito.',
    },
    {
      topic: 'métricas',
      question: '¿Qué es una vanity metric?',
      answer:
        'Una métrica que sube y se ve bien pero no ayuda a decidir nada, como visitas totales o usuarios registrados acumulados. Las métricas útiles están ligadas a una decisión y al valor real: activación, retención, tasa de conversión de un paso concreto. La pregunta para detectarla es "si este número cambia, ¿qué haría distinto?".',
    },
    {
      topic: 'métricas',
      question: '¿Qué eventos medirías como mínimo al lanzar una feature?',
      answer:
        'Tres: que la feature se mostró (exposición), que el usuario hizo la acción principal (activación) y que obtuvo el resultado buscado (valor entregado). Con eso ya tenés un funnel que muestra dónde se cae la gente, y lleva pocos minutos instrumentarlo. Conviene usar una convención de nombres consistente, como `objeto_acción_contexto`, para poder cruzar datos entre equipos.',
    },
    {
      topic: 'shipping',
      question: '¿Qué es un feature flag y para qué lo usa un product engineer?',
      answer:
        'Un interruptor que activa o desactiva código en producción sin hacer un deploy. Permite mergear seguido aunque la feature no esté terminada, liberarla a un grupo chico de usuarios primero, hacer experimentos A/B y apagarla al instante si algo sale mal. Separa el deploy (subir código) del lanzamiento (que los usuarios lo vean).',
    },
    {
      topic: 'shipping',
      question: '¿Qué es un MVP y qué error común se comete al hacerlo?',
      answer:
        'La versión más chica de algo que permite aprender si la apuesta es correcta con usuarios reales. El error típico es tratarlo como "la versión mala del producto final" o recortar calidad donde importa: un MVP puede tener poco alcance, pero lo que hace lo tiene que hacer bien. Otro error es lanzarlo sin medir, con lo que no se aprende nada.',
    },
    {
      topic: 'colaboración',
      question: '¿Cómo trabajás con diseño cuando vos también tomás decisiones de UX?',
      answer:
        'Con ownership compartido y explícito: diseño es dueño del sistema visual y de los flujos complejos; el product engineer puede resolver detalles de interacción dentro de ese sistema y aporta lo que ve en los datos y en el uso real. Se consulta antes de inventar patrones nuevos, se comparten prototipos temprano y se reconoce cuándo un problema necesita un diseñador de verdad.',
    },
    {
      topic: 'mentalidad',
      question: '¿Qué significa que una feature está "done"?',
      answer:
        'No alcanza con que el PR esté mergeado y el CI en verde. Está terminada cuando llegó a los usuarios, la están usando y se midió si resolvió el problema. Si nadie la descubre o nadie la usa, todavía hay trabajo: mejorar la distribución, el onboarding o reconsiderar la solución.',
    },
    {
      topic: 'priorización',
      question:
        'Tenés dos bugs y una feature pendientes y tiempo para una sola cosa. ¿Cómo elegís?',
      answer:
        'Por impacto en los usuarios y en el negocio frente al esfuerzo: cuántos usuarios afecta cada cosa, qué tan grave es (¿bloquea un flujo clave o es cosmético?), qué métrica mueve y cuánto cuesta. Un bug que rompe el checkout gana a casi cualquier feature; uno cosmético en una pantalla poco usada puede esperar. Y se comunica la decisión con sus razones.',
    },
    {
      topic: 'ia',
      question: '¿Cómo cambia la IA el trabajo de un product engineer?',
      answer:
        'Escribir código pasa a ser más barato, así que pesa más decidir qué construir, especificarlo con precisión y revisar lo que generan los agentes. El valor se corre hacia entender usuarios, tener criterio de producto, dar buen contexto a los agentes y validar resultados. Sin ese criterio, la IA solo te permite construir más rápido cosas que nadie necesita.',
    },
    {
      topic: 'carrera',
      question: '¿Cómo podés empezar a pensar como product engineer en tu primer trabajo?',
      answer:
        'Preguntando el porqué de cada ticket y qué métrica debería mover, leyendo los tickets de soporte de lo que construís, mirando cómo se usa después de lanzarlo y proponiendo mejoras con datos. No hace falta un ascenso para hacerse cargo de resultados: se empieza con features chicas de punta a punta y documentando el antes y el después.',
    },
    {
      topic: 'comunicación',
      question: '¿Cómo comunicarías que querés cambiar la prioridad de algo?',
      answer:
        'Con datos concretos y una propuesta clara, no con impresiones. En vez de "los usuarios se quejan", algo como "este error generó 40 tickets este mes y afecta al 8% de los checkouts; propongo arreglarlo antes de X porque…". Mostrar las opciones que se evaluaron, los trade-offs y dar una opinión. Comunicar para que la otra persona pueda decidir.',
    },
  ],
  'semi-senior': [
    {
      topic: 'discovery',
      question: 'La métrica de engagement de una feature viene cayendo. ¿Cómo lo investigás?',
      answer:
        'Primero descartar que sea un problema de medición (cambios en el tracking, bots, un deploy). Después segmentar: por plataforma, versión, cohorte, país, tipo de usuario, para ver si es general o de un grupo. Cruzar con cambios recientes del producto o del contexto (estacionalidad, competencia). Mirar session replays y tickets del segmento afectado y hablar con usuarios. Recién con una hipótesis concreta se decide qué cambiar y cómo medirlo.',
    },
    {
      topic: 'métricas',
      question: '¿Qué métricas mirarías en cada etapa de una feature?',
      answer:
        'Antes de construir: señales cualitativas, como frecuencia del problema. Durante el build: exposición por feature flag, pasos del funnel, errores y performance base. Al lanzar (primeras semanas): adopción, activación, time to value y si vuelven a usarla. En crecimiento: retención de la feature y expansión dentro de las cohortes. En madurez: caída de uso, carga de soporte y señales de que hay que reemplazarla.',
    },
    {
      topic: 'métricas',
      question: '¿Qué es la activación y cómo encontrarías el "aha moment" de un producto?',
      answer:
        'La activación es el momento en que el usuario obtiene suficiente valor como para volver solo. Para encontrarla se compara lo que hicieron los usuarios que se quedaron con lo que hicieron los que se fueron en sus primeros días, buscando una acción y un umbral que predigan la retención (del estilo "invitó a 2 compañeros en la primera semana"). Después se valida con experimentos que empujen a más gente a cruzarlo.',
    },
    {
      topic: 'hipótesis',
      question: '¿Cómo plantearías una feature como una apuesta medible?',
      answer:
        'Como una hipótesis: "Creemos que [cambio] va a lograr [resultado] para [usuarios], y lo vamos a saber cuando [métrica] pase de X a Y en Z semanas". Se define antes de construir, junto con lo que haría que la descartemos. Después de lanzar se revisa honestamente: salió, salió a medias o falló, y qué aprendimos.',
    },
    {
      topic: 'experimentación',
      question: '¿Qué tener en cuenta al correr un A/B test?',
      answer:
        'Una métrica principal definida de antemano (y métricas guardianas que no deben empeorar), tamaño de muestra suficiente calculado antes, asignación aleatoria y estable por usuario, correrlo el tiempo necesario para cubrir ciclos semanales y no mirar el resultado todos los días para cortarlo cuando "da significativo". Si el tráfico es poco, a veces conviene un rollout gradual con análisis cualitativo.',
    },
    {
      topic: 'técnico',
      question: '¿Cómo balanceás deuda técnica y velocidad de entrega?',
      answer:
        'Tratando la deuda como una decisión de producto: se toma a propósito cuando acelera aprender algo importante, y se paga cuando empieza a frenar al equipo, generar bugs o impedir cambios que el negocio necesita. Se explicita (qué atajo, por qué, cuándo se revisa), se paga de forma incremental al tocar esas partes y se prioriza con el mismo criterio de impacto que las features.',
    },
    {
      topic: 'técnico',
      question: '¿Cómo diseñarías un sistema para que sea fácil de experimentar?',
      answer:
        'Con feature flags y configuración remota en vez de valores fijos, componentes desacoplados que permitan variantes, eventos de analytics consistentes desde el inicio, deploys pequeños y frecuentes y la posibilidad de revertir rápido. Evitar sobre-ingeniería: diseñar para que sea fácil de cambiar, no para cubrir todos los casos futuros.',
    },
    {
      topic: 'alcance',
      question: '¿Cómo recortás el alcance de un proyecto sin perder el objetivo?',
      answer:
        'Volviendo al problema y a la métrica: todo lo que no sea necesario para validar la hipótesis es candidato a salir. Se separa lo imprescindible de lo deseable, se buscan atajos manuales detrás de escena (un proceso que hoy hace una persona antes de automatizarlo) y se lanzan versiones incrementales. Recortar alcance no es recortar calidad en lo que sí sale.',
    },
    {
      topic: 'lanzamiento',
      question: 'Lanzaste una feature, el CI está en verde y nadie la usa. ¿Qué hacés?',
      answer:
        'Diagnosticar en qué parte del recorrido se pierde la gente: ¿la descubren?, ¿completan el setup?, ¿llegan al valor? Si no la descubren, es un problema de distribución: mostrarla en contexto dentro del producto, no solo en un changelog. Si abandonan el setup, hay fricción en el onboarding. Si la prueban y no vuelven, el problema es el valor. Cada diagnóstico lleva a una solución distinta.',
    },
    {
      topic: 'lanzamiento',
      question: '¿Cómo diseñarías el onboarding de una feature nueva?',
      answer:
        'Mostrando cada capacidad cuando es relevante (divulgación progresiva), no todo junto en un tour que la gente saltea. Buscar que el usuario llegue al primer valor en pocos minutos, usar los estados vacíos para enseñar qué hacer, precargar datos de ejemplo si ayuda, y medir la finalización y el tiempo hasta el valor para iterar.',
    },
    {
      topic: 'research',
      question: '¿Cómo convertís lo que ves en research en cambios concretos?',
      answer:
        'Registrando cada observación con su fuente, confirmando el patrón en al menos tres fuentes distintas (tickets, replays, entrevistas), estimando cuántos usuarios afecta con datos, escribiendo un problem statement con esa evidencia y, después de shippear el cambio, validando con nueva research que realmente se resolvió. Idealmente el ciclo completo entra en dos semanas.',
    },
    {
      topic: 'comunicación',
      question: '¿Cómo presentarías los resultados de un lanzamiento?',
      answer:
        'Con una estructura clara: cómo estaban las métricas antes y el contexto, qué se lanzó y cuándo, cómo están ahora, y qué recomendás hacer a partir de eso. Traducir los números a impacto de negocio para audiencias no técnicas (por ejemplo, cuánto dinero representa una tasa de abandono) y ser honesto con lo que no funcionó.',
    },
    {
      topic: 'colaboración',
      question: '¿Cómo convenciste a un equipo de cambiar de dirección sin tener autoridad formal?',
      answer:
        'Una buena respuesta muestra evidencia antes que opinión: datos de uso, testimonios de usuarios, un prototipo o un experimento chico que reduzca la incertidumbre. Entender qué le importa a cada parte y conectar la propuesta con sus objetivos, presentar opciones con trade-offs y estar dispuesto a que la evidencia te contradiga. Se cuenta como historia con situación, acción y resultado medible.',
    },
    {
      topic: 'proceso',
      question: '¿Por qué algunos equipos de producto dejan los sprints?',
      answer:
        'Porque los sprints se pensaron cuando deployar llevaba semanas y el feedback tardaba en llegar. Hoy se deploya en minutos y los datos de uso llegan en horas, así que esperar a la próxima planificación para actuar sobre algo urgente es un retraso artificial. Equipos chicos y senior pasan a prioridades continuas, ownership de áreas del producto, foco en resultados en vez de tickets cerrados y comunicación asincrónica.',
    },
    {
      topic: 'ia',
      question: '¿Cómo usarías agentes de IA en tu flujo sin perder calidad?',
      answer:
        'Escribiendo especificaciones claras (qué, por qué, criterios de aceptación) antes de pedirle código a un agente, dándole buen contexto del repo y de las convenciones, trabajando en cambios chicos, revisando cada diff como si fuera de otra persona y apoyándote en tests y verificaciones automáticas. La responsabilidad del resultado sigue siendo tuya.',
    },
  ],
  senior: [
    {
      topic: 'estrategia',
      question: '¿Cómo decidís qué construir el próximo trimestre?',
      answer:
        'Partiendo de los objetivos del negocio y de dónde está el mayor problema en el recorrido del usuario (por ejemplo, a veces mejorar la retención vale varias veces más que mejorar la adquisición). Se juntan oportunidades con evidencia de datos, research y equipos de cara al cliente; se estima impacto, confianza y esfuerzo; y se elige un conjunto chico de apuestas con métricas de éxito claras, dejando margen para lo que aparezca.',
    },
    {
      topic: 'diseño de sistemas',
      question: 'Diseñá un sistema de notificaciones y explicá cómo medirías si funciona.',
      answer:
        'Técnicamente: eventos de dominio que generan notificaciones, una cola para procesarlas, preferencias por usuario y canal (in-app, email, push), plantillas, deduplicación, agrupado (digest) y límites de frecuencia para no saturar. De producto: medir tasa de apertura y de acción por tipo de notificación, el efecto en retención con un holdout que no las recibe, y las desuscripciones como métrica guardiana.',
    },
    {
      topic: 'diseño de sistemas',
      question:
        '¿Cómo elegís entre renderizar en el servidor o en el cliente para una funcionalidad?',
      answer:
        'Según la experiencia que se busca: contenido que tiene que cargar rápido y posicionar en buscadores se beneficia del servidor (SSR, estático o server components); interfaces muy interactivas, del cliente. También pesan la frescura de los datos, el costo de infraestructura, el dispositivo y la red de los usuarios y la complejidad para el equipo. Se decide midiendo las métricas que le importan al usuario, como el tiempo hasta ver el contenido o hasta poder interactuar.',
    },
    {
      topic: 'métricas',
      question: '¿Cómo instrumentarías analytics en una organización sin frenar a los equipos?',
      answer:
        'Con un mínimo obligatorio por feature (exposición, activación, valor), una convención de nombres compartida, un plan de tracking corto que se revisa en el PR, herramientas que permitan autoservicio para consultar datos y dashboards por área con dueño. Evitar trackear todo "por las dudas": cada evento debería responder una pregunta concreta.',
    },
    {
      topic: 'impacto',
      question: 'Contá algo que lanzaste de punta a punta: del problema al resultado.',
      answer:
        'Se espera una respuesta que empiece por el resultado ("subimos la activación del 20% al 31%") y después explique el contexto: cómo se detectó el problema, qué evidencia había, qué alternativas se descartaron, qué se construyó y por qué con ese alcance, cómo se midió y qué se aprendió. Mostrar ownership en todo el ciclo, no solo en la implementación.',
    },
    {
      topic: 'impacto',
      question: 'Contá algo que lanzaste y falló. ¿Qué aprendiste?',
      answer:
        'Una buena respuesta usa el formato de hipótesis: "Creíamos X, construimos Y, medimos Z y aprendimos W". Se valora la honestidad, haber detectado el fallo rápido gracias a la medición, qué se hizo después (iterar, revertir o pivotear) y qué cambió en la forma de trabajar para la próxima. Culpar a otros o no tener métricas es una mala señal.',
    },
    {
      topic: 'competencias',
      question: '¿Qué competencias tiene un product engineer y cómo las agruparías?',
      answer:
        'En tres modos: Define (encontrar problemas, research, dimensionar la oportunidad, formular hipótesis testeables, criterio de producto), cuyo resultado es una apuesta clara; Build (código de producción, arquitectura que permita experimentar, recortar alcance, prototipar rápido, aprovechar IA), cuyo resultado es software que pone a prueba la apuesta; y Ship (medición, rollouts controlados, interpretar resultados, comunicar y registrar aprendizajes), cuyo resultado es aprendizaje medido.',
    },
    {
      topic: 'competencias',
      question: '¿Qué habilidades priorizarías según la etapa de la empresa?',
      answer:
        'En una startup temprana: descubrir problemas y prototipar rápido, porque lo más importante es aprender qué funciona. En una empresa en crecimiento: medición, experimentación y comunicación entre equipos. En una empresa establecida: ejecutar cambios complejos con poco riesgo y tomar decisiones estratégicas con muchos stakeholders. El mismo rol cambia mucho de una etapa a otra.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo liderarías un equipo de product engineers?',
      answer:
        'Dando ownership de áreas del producto con objetivos de resultado, no de tareas; acceso directo a usuarios y datos; un ritmo semanal liviano para revisar métricas y aprendizajes; coaching sobre criterio de producto además de lo técnico; y una carrera que reconozca el impacto, no la cantidad de tickets. Requiere confianza: medir resultados en vez de controlar actividad.',
    },
    {
      topic: 'proceso',
      question: '¿Qué hace falta para que un equipo trabaje sin sprints y siga siendo predecible?',
      answer:
        'Ingenieros senior con criterio de producto que puedan decidir solos, buena observabilidad para ver el impacto real en clientes, una lista de prioridades viva y visible, objetivos de resultado claros, comunicación asincrónica (notas de deploy, updates automáticos) y un management basado en confianza. Sin esas condiciones, abandonar la estructura suele terminar en caos.',
    },
    {
      topic: 'ia',
      question: '¿Cómo construirías un producto donde un agente de IA es la interfaz principal?',
      answer:
        'Diseñando desde el principio para el agente y no agregándolo al final: herramientas bien definidas con permisos acotados, contexto relevante del usuario y del producto, límites y checkpoints humanos para acciones riesgosas, evaluaciones automáticas que corran en CI, observabilidad de las trazas en producción y métricas de producto que midan si el usuario logró su objetivo, no solo si el modelo respondió.',
    },
    {
      topic: 'ia',
      question: '¿Cómo prepararías un codebase para que los agentes trabajen bien en él?',
      answer:
        'Haciendo explícito lo implícito: documentación de arquitectura y convenciones donde el agente la encuentre (archivos de instrucciones del repo), estructura predecible, tipos fuertes, tests rápidos y confiables que sirvan de verificación, comandos claros para build, lint y test, y feedback rápido. Lo que ayuda a un agente también ayuda a una persona nueva en el equipo.',
    },
    {
      topic: 'colaboración',
      question:
        '¿Cuándo necesita un equipo de product engineers un project manager o un product manager?',
      answer:
        'Un project manager suma en iniciativas grandes con muchos equipos, dependencias y fechas externas, donde coordinar es un trabajo en sí. Un product manager suma cuando la estrategia, el mercado o los stakeholders son complejos y alguien tiene que dedicarse a eso. En equipos chicos de producto, los product engineers absorben gran parte de esas tareas; lo importante es que quede claro quién es dueño de cada decisión.',
    },
    {
      topic: 'go-to-market',
      question: '¿Cómo pensarías la distribución de una feature desde ingeniería?',
      answer:
        'Construyéndola dentro del producto: loops virales (invitar compañeros, compartir resultados), artefactos públicos que generen tráfico, integraciones con herramientas que los usuarios ya usan y superficies contextuales que muestren la feature cuando es útil. Se mide la tasa de descubrimiento y se itera, en vez de esperar que la gente lea el changelog.',
    },
    {
      topic: 'carrera',
      question: '¿Cómo mostrarías tu impacto en un portfolio o en una entrevista?',
      answer:
        'Con casos de estudio en vez de una lista de tecnologías: el problema, tu rol concreto (aunque haya sido trabajo en equipo), las decisiones y trade-offs, y las métricas de antes y después. Si no hay números exactos, usar rangos o señales cualitativas honestas. Lo que se busca demostrar es que podés decidir qué construir y hacerte cargo de que funcione, no solo cómo construirlo.',
    },
  ],
};
