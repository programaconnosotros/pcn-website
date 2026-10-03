import type { InterviewGuide } from './types';

export const productEngineeringGuide: InterviewGuide = {
  track: 'product-engineering',
  summary:
    'Cómo prepararte para entrevistas de product engineering: decidir qué construir, medirlo, shippearlo y contar el impacto, de junior a senior.',
  sections: [
    {
      id: 'rol-y-entrevista',
      title: 'El rol y cómo es la entrevista',
      body: [
        'Un product engineer se hace cargo del resultado, no solo de la implementación: parte del problema del usuario, elige la solución técnica que lo resuelve y mide si el cambio movió algo. Por eso la entrevista no se parece del todo a una de frontend o backend. Además de una parte técnica (código, diseño de sistemas, a veces un ejercicio en vivo), vas a tener preguntas de criterio de producto, un caso práctico y muchas preguntas sobre cosas que ya lanzaste.',
        'En un perfil junior se evalúa curiosidad por el usuario y actitud: que antes de programar preguntes para quién es y por qué, que sepas qué es un MVP, una vanity metric o un feature flag, y que entiendas que una feature no está terminada cuando se mergea sino cuando alguien la usa y se sabe si funcionó. No se espera que hayas liderado discovery, pero sí que muestres cómo pensarías.',
        'En semi-senior se espera ownership de punta a punta en features medianas: plantear hipótesis medibles, instrumentar eventos, correr un experimento, recortar alcance sin perder el objetivo y diagnosticar por qué algo que lanzaste no se usa. En senior el foco pasa a la estrategia y a la influencia: decidir qué construir el próximo trimestre, diseñar sistemas pensando en experimentar, armar la base de analytics de una organización, liderar a otros product engineers y cambiar el rumbo de un equipo sin autoridad formal.',
        'El error más común en todos los niveles es responder como si el trabajo terminara en el código. Si te preguntan por una feature y hablás solo de la arquitectura, el entrevistador anota que no pensaste en el usuario ni en la métrica. Tampoco sirve el extremo opuesto: es un rol de ingeniería y tenés que poder bajar las ideas a algo que se construye bien.',
      ],
      checklist: [
        'Explicar qué es un product engineer y en qué se diferencia de un full-stack y de un platform engineer',
        'Describir el ciclo Define, Build y Ship con un ejemplo propio',
        'Saber qué se espera de vos según tu seniority',
        'Explicar cuándo una feature está realmente "done"',
        'Tener dos o tres historias de cosas que construiste, con problema, decisión y resultado',
      ],
    },
    {
      id: 'discovery-y-research',
      title: 'Discovery y research',
      body: [
        'Discovery es todo lo que hacés antes de construir para no construir lo equivocado: entender quién tiene el problema, con qué frecuencia, cuánto le duele y cómo lo resuelve hoy. Cuando te piden una feature, el pedido es una solución propuesta; tu trabajo es encontrar el problema detrás y validar que vale la pena. A veces la conclusión es construir algo más chico, algo distinto o nada.',
        'No necesitás un equipo de research para hacerlo bien. Las fuentes livianas que los entrevistadores esperan que conozcas son los tickets de soporte, los session replays (rage clicks, dudas, abandonos), los datos de uso, llamadas cortas con usuarios, micro-encuestas en el momento justo y pruebas de usabilidad con tres a cinco personas pensando en voz alta. La clave en las entrevistas con usuarios es preguntar por experiencias pasadas concretas ("contame la última vez que…") y no por opiniones o futuros hipotéticos ("¿usarías…?"), que generan respuestas complacientes.',
        'Lo que diferencia a alguien con experiencia es cómo convierte lo observado en decisiones. Registrá cada observación con su fuente, buscá el mismo patrón en varias fuentes distintas antes de creerlo, estimá con datos a cuántos usuarios afecta y escribí un problem statement corto con esa evidencia. Después de shippear, cerrá el ciclo: verificá con nueva research o con datos que el problema se resolvió.',
        'Un caso clásico es "la métrica de engagement de tal feature viene cayendo, ¿cómo lo investigás?". Antes de teorizar, descartá problemas de medición (cambió el tracking, hubo un deploy, un bug), segmentá (plataforma, país, cohorte, tipo de usuario, nuevos contra existentes), buscá qué cambió en esas fechas dentro y fuera del producto, y recién ahí formulá hipótesis y salí a validarlas con usuarios.',
      ],
      checklist: [
        'Contar qué hacés antes de programar cuando te piden una feature',
        'Nombrar al menos cuatro métodos de research livianos y cuándo usar cada uno',
        'Explicar por qué preguntar "¿usarías esto?" es una mala pregunta',
        'Pasar de observaciones sueltas a un problem statement con evidencia',
        'Investigar una caída de métrica empezando por descartar errores de medición',
      ],
    },
    {
      id: 'metricas',
      title: 'Métricas y analytics',
      body: [
        'Medir es lo que te permite saber si lo que construiste sirvió. Una buena métrica está ligada a un comportamiento que representa valor real para el usuario y para el negocio, y se puede mover con decisiones del equipo. Una vanity metric, en cambio, sube sola o no dice nada útil: registros totales, page views, descargas acumuladas. La pregunta que tenés que poder responder es "si este número sube, ¿qué decisión tomo distinta?".',
        'Pensá las métricas por etapa del recorrido: exposición (cuántos ven la feature), activación (cuántos llegan al primer valor), uso recurrente o retención (cuántos vuelven), y el impacto en el negocio (conversión, ingresos, churn). La activación merece atención especial: el "aha moment" es la acción que mejor separa a los usuarios que se quedan de los que se van, y se encuentra comparando el comportamiento temprano de cohortes retenidas contra las que abandonaron, no por intuición.',
        'Al lanzar una feature, el mínimo es medir que se vio, que se empezó, que se completó y que se volvió a usar, más alguna métrica guardiana que no debería empeorar (errores, performance, tickets de soporte). Cada evento tiene que responder una pregunta concreta; trackear todo "por las dudas" genera ruido, costo y dashboards que nadie mira. Definí el plan de tracking antes de programar y revisalo en el PR como parte del código.',
        'En senior te pueden preguntar cómo instrumentarías analytics en toda una organización. Lo esperable es una convención de nombres compartida, un mínimo obligatorio por feature, autoservicio para que cualquiera pueda consultar datos sin depender de un equipo central y dashboards con dueño. El error común es proponer una herramienta en vez de un sistema de trabajo.',
      ],
      checklist: [
        'Definir vanity metric y dar ejemplos con su alternativa útil',
        'Elegir métricas para cada etapa: exposición, activación, retención e impacto',
        'Explicar cómo encontrarías el aha moment de un producto con datos',
        'Listar los eventos mínimos para lanzar una feature y una métrica guardiana',
        'Proponer cómo organizar analytics en una empresa sin frenar a los equipos',
      ],
    },
    {
      id: 'hipotesis-y-experimentos',
      title: 'Hipótesis y experimentación',
      body: [
        'Tratar cada feature como una apuesta medible cambia toda la conversación. El formato que conviene tener automatizado es: creemos que este cambio va a lograr este resultado para estos usuarios, y lo vamos a saber cuando esta métrica pase de X a Y en tal plazo. Se escribe antes de construir, junto con qué resultado haría que la descartes. Después de lanzar se revisa con honestidad: funcionó, funcionó a medias o falló, y qué aprendiste.',
        'Para un A/B test tenés que saber explicar lo básico sin estadística avanzada: una métrica principal definida de antemano, métricas guardianas, tamaño de muestra calculado antes de empezar, asignación aleatoria y estable por usuario, y duración suficiente para cubrir al menos un ciclo semanal. Los errores típicos que buscan los entrevistadores son mirar el resultado todos los días y cortarlo apenas da significativo, cambiar la métrica después de ver los datos y sacar conclusiones de segmentos elegidos a posteriori.',
        'No todo se puede testear. Con poco tráfico, un A/B test puede tardar meses; ahí sirven un rollout gradual comparando antes y después con cuidado, un holdout chico, pruebas cualitativas o simplemente decidir con criterio cuando el costo de equivocarse es bajo y el cambio se revierte fácil. Saber cuándo no experimentar también es una señal de madurez.',
        'Del lado técnico, un sistema fácil de experimentar usa feature flags y configuración remota en vez de valores fijos, componentes desacoplados que admiten variantes, eventos consistentes desde el día uno y deploys chicos que se revierten rápido. Evitá la sobre-ingeniería: la meta es que cambiar sea barato, no cubrir todos los casos futuros.',
      ],
      checklist: [
        'Escribir una hipótesis completa con métrica, umbral y plazo',
        'Explicar las condiciones mínimas de un A/B test válido',
        'Reconocer el peeking y el cambio de métrica como errores',
        'Proponer alternativas al A/B test cuando hay poco tráfico',
        'Describir cómo diseñarías un sistema para que experimentar sea barato',
      ],
    },
    {
      id: 'priorizacion-y-alcance',
      title: 'Priorización y alcance',
      body: [
        'Priorizar es elegir qué no hacer. Los marcos como RICE o impacto contra esfuerzo sirven para ordenar la discusión, pero en la entrevista importa más que muestres el razonamiento: qué objetivo del negocio se mueve, cuánta evidencia hay de que el problema existe, cuánto cuesta y qué tan reversible es la decisión. Usar un framework de memoria sin conectarlo con el contexto suena mecánico.',
        'Recortar alcance sin perder el objetivo es una de las habilidades más valoradas. Volvé a la hipótesis: todo lo que no hace falta para validarla es candidato a salir. Separá lo imprescindible de lo deseable, buscá atajos manuales detrás de escena (algo que hoy hace una persona antes de automatizarlo) y planeá entregas incrementales. El error típico del MVP es entregar algo tan pobre que no prueba nada, o tan completo que tardó meses; recortar alcance no es recortar calidad en lo que sí sale.',
        'La deuda técnica también se prioriza con criterio de producto. Tomarla a propósito está bien cuando acelera aprender algo importante; pagarla se justifica cuando frena al equipo, genera bugs o impide cambios que el negocio necesita. Lo que se espera es que la hagas explícita (qué atajo, por qué y cuándo se revisa) y que la pagues de forma incremental al tocar esas partes, no en un gran refactor que nadie puede justificar.',
        'En senior, la pregunta pasa a ser qué construir el próximo trimestre. Una buena respuesta parte de los objetivos del negocio y de dónde está el mayor problema en el recorrido del usuario (a veces mejorar la retención vale mucho más que traer más usuarios), junta oportunidades con evidencia de datos, research y equipos de cara al cliente, y elige un conjunto chico de apuestas con métricas de éxito y fechas de revisión.',
      ],
      checklist: [
        'Explicar un framework de priorización y sus límites',
        'Recortar el alcance de una feature dejando lo necesario para validarla',
        'Definir MVP y el error común al hacerlo',
        'Argumentar cuándo tomar y cuándo pagar deuda técnica',
        'Armar un plan trimestral a partir de objetivos y evidencia',
      ],
    },
    {
      id: 'shipping-y-lanzamiento',
      title: 'Shipping y lanzamiento',
      body: [
        'Shippear rápido y seguro es parte del rol. Los feature flags separan el deploy del lanzamiento: el código llega a producción apagado, se prende para el equipo, después para un porcentaje de usuarios y se apaga en segundos si algo sale mal. Sabé explicar también su costo: flags que nunca se borran se vuelven deuda y combinaciones difíciles de testear, así que cada uno necesita dueño y fecha de limpieza.',
        'Un rollout controlado combina flags, monitoreo de errores y performance, y métricas de producto mirando la cohorte expuesta. Antes de subir el porcentaje, definí qué número te haría frenar. Esto es lo que diferencia a alguien que "deploya" de alguien que "lanza": el segundo sabe qué está esperando ver y qué hace si no lo ve.',
        'Un escenario muy frecuente es: lanzaste, el CI está en verde y nadie la usa. La respuesta esperada es diagnosticar en qué parte del recorrido se pierde la gente. Si no la descubren, es un problema de distribución: hay que mostrarla en contexto dentro del producto y no solo en un changelog. Si abandonan el setup, hay fricción en el onboarding. Si la prueban y no vuelven, el problema es el valor. Cada diagnóstico lleva a una solución distinta.',
        'La distribución también es trabajo de ingeniería. El onboarding funciona mejor con divulgación progresiva (mostrar cada capacidad cuando es relevante), estados vacíos que enseñan qué hacer, datos de ejemplo y un tiempo hasta el primer valor de minutos. Pensá también en los canales: emails o notificaciones disparados por comportamiento, integraciones, SEO, contenido para el equipo de ventas y anuncios dentro del producto, y medí cada uno.',
      ],
      checklist: [
        'Explicar qué es un feature flag, para qué sirve y qué costo tiene',
        'Describir un rollout gradual con criterios de freno',
        'Diagnosticar por qué una feature lanzada no se usa',
        'Diseñar el onboarding de una feature nueva y cómo medirlo',
        'Proponer canales de distribución pensados desde ingeniería',
      ],
    },
    {
      id: 'colaboracion-y-comunicacion',
      title: 'Colaboración y comunicación',
      body: [
        'Un product engineer trabaja muy cerca de diseño, de producto y de los equipos de cara al cliente, y muchas veces toma decisiones de UX por su cuenta. Con diseño, lo que se valora es involucrarse temprano, discutir el problema y las restricciones técnicas antes de que el diseño esté cerrado, prototipar rápido para probar ideas y respetar el criterio del otro en lo que es su especialidad. Con producto, compartir la responsabilidad del resultado en vez de esperar tickets definidos.',
        'Influir sin autoridad formal es una pregunta casi segura a partir de semi-senior. La respuesta fuerte muestra evidencia antes que opinión: datos de uso, testimonios, un prototipo o un experimento chico que reduzca la incertidumbre. Entendé qué le importa a cada parte, conectá tu propuesta con sus objetivos, presentá opciones con trade-offs y mostrá que estás dispuesto a que la evidencia te contradiga.',
        'Para comunicar resultados de un lanzamiento usá una estructura fija: contexto y métricas de antes, qué se lanzó y cuándo, cómo están ahora y qué recomendás hacer. Traducí los números a impacto de negocio para audiencias no técnicas y contá también lo que no funcionó. Para pedir un cambio de prioridad, explicá qué aprendiste, qué proponés dejar de hacer y qué se gana, en vez de solo sumar trabajo.',
        'También pueden preguntarte por proceso: por qué algunos equipos de producto dejan los sprints. La idea es que cuando deployar lleva minutos y los datos llegan en horas, esperar a la próxima planning para actuar es un retraso artificial. Pero sin sprints hace falta otra cosa para seguir siendo predecibles: ownership claro por área, prioridades visibles, objetivos por resultado, entregas chicas y una cadencia de revisión de métricas. Mostrá ambos lados.',
      ],
      checklist: [
        'Contar cómo trabajás con diseño cuando también decidís UX',
        'Relatar una vez que convenciste a otros sin autoridad, con evidencia',
        'Presentar los resultados de un lanzamiento en cuatro partes',
        'Comunicar un cambio de prioridad explicando qué se deja de hacer',
        'Argumentar pros y contras de trabajar sin sprints',
      ],
    },
    {
      id: 'ia-en-producto',
      title: 'IA en el trabajo y en el producto',
      body: [
        'La IA aparece de dos formas en estas entrevistas: cómo la usás para trabajar y cómo construirías productos con ella. Sobre lo primero, se espera que digas que construir se volvió más barato, así que el cuello de botella se mueve hacia decidir qué construir, especificar bien y verificar. Eso hace todavía más importante el criterio de producto.',
        'Para usar agentes sin perder calidad, describí un flujo concreto: escribir una especificación clara con el qué, el porqué y criterios de aceptación; darle al agente contexto del repo y de las convenciones; trabajar en cambios chicos; revisar cada diff como si lo hubiera escrito otra persona y apoyarte en tests y checks automáticos. La responsabilidad del resultado sigue siendo tuya. Un codebase preparado para agentes tiene documentación de convenciones, comandos de verificación fáciles de correr, tipos estrictos y tests rápidos.',
        'Sobre productos con IA, pensá en qué cambia cuando un modelo es parte de la experiencia o incluso la interfaz principal: las respuestas no son deterministas, hay costos y latencias por uso, y la calidad se mide con evaluaciones sobre casos reales además de métricas de uso. El usuario necesita entender qué puede pedir, ver qué hizo el sistema, poder corregirlo y confiar en él; las acciones con consecuencias deberían requerir confirmación.',
        'El error común es hablar de IA en abstracto o con entusiasmo sin criterio. Lo que suma es mostrar un caso concreto, qué funcionó, qué no y cómo lo mediste.',
      ],
      checklist: [
        'Explicar cómo cambia la IA el trabajo de un product engineer',
        'Describir tu flujo con agentes y cómo controlás la calidad',
        'Listar qué hace que un codebase funcione bien con agentes',
        'Explicar cómo medirías la calidad de una feature basada en un modelo',
        'Pensar la UX cuando un agente es la interfaz principal',
      ],
    },
    {
      id: 'casos-practicos',
      title: 'Casos prácticos',
      body: [
        'Casi todas las entrevistas de product engineering incluyen un caso: mejorar una métrica de un producto conocido, diseñar una feature para cierto usuario, priorizar una lista de pedidos o diseñar un sistema (por ejemplo, notificaciones) y explicar cómo medirías si funciona. No hay una respuesta correcta; se evalúa la estructura, las preguntas que hacés y si tus decisiones se conectan con un objetivo.',
        'Una estructura que funciona: aclarar el objetivo y el contexto (qué empresa, qué etapa, qué métrica importa), elegir un segmento de usuarios y su problema principal, generar dos o tres alternativas, elegir una explicando el trade-off, definir el MVP y cómo lo medirías (métrica principal, guardianas, hipótesis) y cerrar con riesgos y próximos pasos. Anunciá la estructura al principio para que el entrevistador te pueda seguir.',
        'En un ejercicio de priorización, no ordenes la lista directamente. Primero preguntá cuál es el objetivo del período, agrupá los pedidos por problema, estimá impacto, confianza y esfuerzo de forma gruesa, y explicá qué dejarías afuera y cómo se lo comunicarías a quien lo pidió. En los de diseño de sistemas, cubrí la parte técnica (eventos, colas, preferencias, deduplicación, límites de frecuencia) y la de producto (qué métricas, un holdout para medir el efecto real, qué señal te diría que molesta).',
        'Errores típicos: saltar a la solución en el primer minuto, querer resolver para todos los usuarios a la vez, proponer cinco features sin elegir, no hablar nunca de métricas o no dejar tiempo para cerrar. Practicá con un reloj y con productos que usás todos los días.',
      ],
      checklist: [
        'Resolver un caso de producto con una estructura anunciada al inicio',
        'Elegir un segmento y un problema antes de proponer soluciones',
        'Priorizar una lista de pedidos explicando qué queda afuera',
        'Diseñar un sistema de notificaciones y su medición',
        'Cerrar un caso con métricas, riesgos y próximos pasos',
        'Practicar al menos tres casos con tiempo limitado',
      ],
    },
    {
      id: 'dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta: el entrevistador evalúa tu razonamiento, no solo la conclusión. Antes de responder un caso, hacé preguntas aclaratorias sobre el usuario, el objetivo y las restricciones, y si te dicen "asumí lo que quieras", explicitá tus supuestos. Si no sabés algo, decilo y contá cómo lo averiguarías; inventar una respuesta se nota y resta mucho más que admitir un hueco.',
        'Para las preguntas de comportamiento usá STAR: situación, tarea, acción y resultado. En este rol el resultado tiene que tener números siempre que puedas ("subimos la activación del 20% al 31%"), y conviene empezar por él. Prepará historias de algo que lanzaste de punta a punta, algo que falló y qué aprendiste, un desacuerdo con diseño o producto, y una vez que decidiste no construir algo. En la historia del fallo, culpar a otros o no tener métricas es mala señal; detectarlo rápido gracias a la medición es buena.',
        'Llevá preguntas para la empresa que te ayuden a entender si el rol es realmente de producto: cómo deciden qué construir, quién define las métricas de éxito, si los ingenieros hablan con usuarios, cómo se ve un lanzamiento típico, qué herramientas de analytics y experimentación usan, y qué pasó con la última feature que no funcionó. Las respuestas te dicen tanto como la entrevista les dice a ellos.',
        'Antes de entrar, repasá el producto de la empresa como usuario: registrate, recorré el onboarding y anotá una mejora que propondrías con su hipótesis. Es una de las formas más simples de mostrar que pensás como product engineer.',
      ],
      checklist: [
        'Hacer preguntas aclaratorias antes de responder un caso',
        'Admitir lo que no sabés y explicar cómo lo averiguarías',
        'Tener cuatro historias STAR con resultados medibles',
        'Preparar cinco preguntas para hacerle a la empresa',
        'Probar el producto de la empresa y llevar una propuesta con hipótesis',
      ],
    },
  ],
};
