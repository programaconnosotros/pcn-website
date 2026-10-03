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
        {
          text: 'Explicar qué es un product engineer y en qué se diferencia de un full-stack y de un platform engineer',
          explanation:
            'Un product engineer es un ingeniero que se hace cargo del resultado de negocio y de usuario, no solo del código: participa en decidir qué construir, lo construye de punta a punta y mide si funcionó. Un full-stack se define por el alcance técnico (frontend, backend y base de datos), pero puede trabajar perfectamente a partir de tickets ya definidos por otros. Un platform engineer construye herramientas e infraestructura para otros equipos internos (CI, deploys, observabilidad), así que su usuario es el desarrollador, no el cliente final. Un buen ejemplo para la entrevista: ante el pedido de exportar a CSV, el full-stack lo implementa; el product engineer pregunta para qué exportan, descubre que es para armar un reporte mensual y quizás construye ese reporte directo. El error común es decir que product engineer es solo un full-stack que habla con usuarios.',
        },
        {
          text: 'Describir el ciclo Define, Build y Ship con un ejemplo propio',
          explanation:
            'Define es entender el problema y decidir qué hacer (research, hipótesis, alcance), Build es construirlo bien y con instrumentación, y Ship es lanzarlo, distribuirlo y medir si movió la métrica. Para contarlo con un ejemplo propio usá una feature real y recorré las tres etapas en dos minutos: qué señal te hizo detectar el problema, qué alternativas descartaste y por qué, qué recortaste del alcance, cómo lo lanzaste (flag, rollout) y qué pasó con el número. Por ejemplo: vimos que el 40% abandonaba el checkout en el paso de dirección, probamos autocompletar con una API de direcciones detrás de un flag y la conversión de ese paso subió del 60% al 71%. El error típico es dedicarle el 90% del relato al Build; el entrevistador quiere oír sobre todo Define y Ship.',
        },
        {
          text: 'Saber qué se espera de vos según tu seniority',
          explanation:
            'En junior se espera curiosidad por el usuario, que preguntes para quién y por qué antes de programar, y que conozcas los conceptos básicos (MVP, vanity metric, feature flag). En semi-senior se espera ownership completo de features medianas: escribir la hipótesis, instrumentar eventos, correr un experimento, recortar alcance y diagnosticar por qué algo no se usa. En senior se espera estrategia e influencia: decidir el roadmap del trimestre, diseñar sistemas que hagan barato experimentar, armar la base de analytics y cambiar el rumbo de otros sin autoridad formal. Ajustá tus historias al nivel al que aplicás: si vas por senior y todos tus ejemplos son de ejecutar tickets, vas a quedar evaluado como semi-senior.',
        },
        {
          text: 'Explicar cuándo una feature está realmente "done"',
          explanation:
            'Una feature está realmente done cuando llegó a usuarios reales y sabés si cumplió su objetivo, no cuando se mergeó el PR. Eso implica que está en producción, instrumentada con los eventos necesarios, lanzada a la audiencia prevista, comunicada a quienes la tienen que usar (usuarios, soporte, ventas) y con una revisión del resultado contra la hipótesis en un plazo definido. También incluye limpiar lo temporal, como el feature flag una vez que está al 100%. Una forma de decirlo en la entrevista: done es cuando puedo responder si funcionó y qué hacemos ahora. El error común es confundir done técnico (tests, code review, deploy) con done de producto.',
        },
        {
          text: 'Tener dos o tres historias de cosas que construiste, con problema, decisión y resultado',
          explanation:
            'Prepará cada historia con cuatro partes: problema (quién lo tenía, cómo lo detectaste y con qué evidencia), decisión (qué opciones había, cuál elegiste y qué trade-off aceptaste), ejecución (qué hiciste vos, no el equipo) y resultado (un número antes y después, o lo que aprendiste si falló). Escribilas en una hoja, una por historia, y ensayalas en voz alta hasta que cada una dure entre dos y tres minutos. Elegí historias que cubran ángulos distintos: una con impacto medible, una donde recortaste alcance o cambiaste de idea por datos, y una que salió mal y qué aprendiste. Ejemplo de resultado concreto: bajamos los tickets de soporte sobre facturación un 35% en un mes. Si no tenés el número exacto, da un rango honesto y explicá cómo lo mediste.',
        },
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
        {
          text: 'Contar qué hacés antes de programar cuando te piden una feature',
          explanation:
            'Primero buscás el problema detrás del pedido: quién lo pidió, qué estaba intentando hacer, con qué frecuencia le pasa y cómo lo resuelve hoy. Después revisás la evidencia disponible (datos de uso, tickets de soporte, conversaciones con usuarios) para ver si el problema es real y de qué tamaño es. Con eso proponés la solución más chica que lo resuelva y definís cómo vas a medir si funcionó. Ejemplo: te piden un dashboard nuevo; al hablar con dos usuarios descubrís que solo quieren saber un número cada lunes, así que un email semanal resuelve el problema en un día en vez de en tres semanas. El error común es arrancar a diseñar la arquitectura de la feature pedida sin cuestionar el pedido.',
        },
        {
          text: 'Nombrar al menos cuatro métodos de research livianos y cuándo usar cada uno',
          explanation:
            'Entrevistas a usuarios: para entender problemas, contexto y cómo resuelven algo hoy; sirven al principio, cuando todavía no sabés qué construir. Análisis de datos de uso: para medir el tamaño de un problema y ver dónde abandonan; sirve cuando ya tenés producto e instrumentación. Revisión de tickets de soporte y feedback: barato y rápido para detectar dolores frecuentes. Test de usabilidad con un prototipo: para ver si la gente puede usar una solución antes de construirla. Fake door o smoke test: un botón o landing de algo que no existe para medir interés real. Encuestas cortas: para cuantificar algo que ya entendiste cualitativamente. La regla es usar lo cualitativo para entender el por qué y lo cuantitativo para saber cuánto.',
        },
        {
          text: 'Explicar por qué preguntar "¿usarías esto?" es una mala pregunta',
          explanation:
            'Porque es una pregunta hipotética sobre el futuro y la gente es pésima prediciendo su propio comportamiento; además tiende a ser amable y decirte que sí. Lo que predice mejor es el comportamiento pasado: preguntá cuándo fue la última vez que tuvo ese problema, qué hizo, cuánto tiempo o plata le costó y si probó alguna otra solución. Si nunca buscó una solución, probablemente el problema no le duele tanto. Por ejemplo, en vez de ¿usarías una app para dividir gastos?, preguntá ¿cómo dividieron los gastos del último viaje? y escuchá si hubo fricción real. Este es el principio de The Mom Test: hablar de su vida, no de tu idea.',
        },
        {
          text: 'Pasar de observaciones sueltas a un problem statement con evidencia',
          explanation:
            'Primero juntás las observaciones (notas de entrevistas, tickets, datos) y las agrupás por patrones, por ejemplo con un affinity map: cada observación en una nota, y se agrupan las que hablan de lo mismo. Después contás cuántas veces aparece cada patrón y en qué segmento, y lo cruzás con datos cuantitativos para estimar el tamaño. El problem statement tiene la forma: este usuario, en esta situación, tiene este problema, que le cuesta esto, y lo sabemos por esta evidencia. Ejemplo: los administradores de equipos de más de 20 personas pierden unas dos horas por mes reasignando permisos a mano; lo vimos en 7 de 10 entrevistas y en 120 tickets del último trimestre. El error común es escribir el problema como la ausencia de tu solución (no tienen un botón de X).',
        },
        {
          text: 'Investigar una caída de métrica empezando por descartar errores de medición',
          explanation:
            'Antes de buscar causas de producto, confirmá que la caída es real: revisá si hubo un deploy que rompió el tracking, cambios en la definición del evento, problemas en el pipeline de datos, bots filtrados, o un cambio de zona horaria o de ventana de cálculo. Después mirá si es estacional (feriados, fin de mes) comparando con el mismo período anterior. Si es real, segmentá: por plataforma, versión de la app, país, canal de adquisición o tipo de usuario, para ver si la caída se concentra en un lugar. Finalmente, cruzalo con eventos internos (releases, experimentos, cambios de precio) y externos (competencia, caída de un proveedor). Ejemplo típico: la conversión cae 20% y resulta que el evento de compra dejó de dispararse en iOS después del último release.',
        },
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
        {
          text: 'Definir vanity metric y dar ejemplos con su alternativa útil',
          explanation:
            'Una vanity metric es un número que sube y se ve bien pero no te ayuda a decidir nada, porque no refleja valor real o crece solo con el tiempo. Ejemplos: usuarios registrados totales (alternativa: usuarios activos semanales que hicieron la acción clave), page views (alternativa: porcentaje de visitas que completan una tarea), descargas acumuladas (alternativa: retención a 30 días de los que descargaron), seguidores (alternativa: tasa de conversión desde ese canal). La prueba es preguntarse si este número sube, ¿qué decisión tomo distinta?; si la respuesta es ninguna, es vanity. Las acumulativas y las que no están normalizadas por usuario o por cohorte son las sospechosas habituales.',
        },
        {
          text: 'Elegir métricas para cada etapa: exposición, activación, retención e impacto',
          explanation:
            'Exposición mide cuántos usuarios elegibles vieron la feature (por ejemplo, porcentaje de usuarios activos que abrieron la pantalla nueva); sin esto no sabés si un mal resultado es por la feature o porque nadie la encontró. Activación mide cuántos de los expuestos la usaron por primera vez de forma significativa (crearon su primer reporte, no solo abrieron el menú). Retención mide cuántos la siguen usando después de una o cuatro semanas, que es la señal de que aporta valor real. Impacto mide si movió la métrica de negocio que te importaba, como conversión, churn o tickets de soporte. Pensarlo como un embudo te deja diagnosticar en qué etapa se pierde la gente.',
        },
        {
          text: 'Explicar cómo encontrarías el aha moment de un producto con datos',
          explanation:
            'El aha moment es la acción temprana que mejor separa a los usuarios que se quedan de los que se van, como el famoso caso de Facebook con agregar 7 amigos en 10 días. Para encontrarlo, tomás una cohorte de usuarios nuevos, la dividís entre retenidos y no retenidos a un plazo (por ejemplo, 30 días) y comparás qué acciones hicieron en sus primeros días. Buscás la acción y el umbral que mejor predicen la retención, cuidando que no sea algo que solo hacen los que ya iban a quedarse. Como eso es correlación, después lo validás con un experimento: empujás a nuevos usuarios hacia esa acción en el onboarding y ves si la retención sube. El error común es tomar la correlación como causalidad sin validar.',
        },
        {
          text: 'Listar los eventos mínimos para lanzar una feature y una métrica guardiana',
          explanation:
            'Los eventos mínimos son: exposición (el usuario vio la feature o entró a la pantalla), inicio (empezó a usarla), éxito (completó la acción clave) y error o abandono si aplica, cada uno con propiedades útiles como plataforma, plan y variante del experimento. Con eso podés armar el embudo y medir activación y retención. La métrica guardiana (guardrail) es la que no tiene que empeorar mientras optimizás la principal, por ejemplo tiempo de carga, tasa de errores, tickets de soporte o cancelaciones. Ejemplo: lanzás recomendaciones en el checkout para subir el ticket promedio, y la guardiana es la conversión del checkout. Sin guardiana podés ganar en un número y romper el negocio en otro.',
        },
        {
          text: 'Proponer cómo organizar analytics en una empresa sin frenar a los equipos',
          explanation:
            'Un modelo que suele funcionar es un equipo central chico que es dueño de la infraestructura y las definiciones (el pipeline, el warehouse, las métricas oficiales y un tracking plan con convenciones de nombres), y equipos de producto que instrumentan y analizan sus propias features con autonomía. Las métricas clave se definen una sola vez en una capa semántica para que no haya tres versiones de usuario activo. Para no frenar a los equipos, el tracking plan se revisa en el mismo PR que agrega los eventos, y hay dashboards self-service en vez de pedir cada consulta al equipo de datos. Los dos errores opuestos son centralizar todo (cuello de botella) y descentralizar sin estándares (eventos duplicados y números que no coinciden).',
        },
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
        {
          text: 'Escribir una hipótesis completa con métrica, umbral y plazo',
          explanation:
            'El formato es: creemos que [cambio] para [segmento] va a lograr [resultado], y lo sabremos cuando [métrica] pase de [valor actual] a [valor objetivo] en [plazo], sin que [guardiana] empeore. Ejemplo: creemos que mostrar el costo de envío en la página de producto para usuarios nuevos va a reducir el abandono en el checkout, y lo sabremos cuando la conversión del checkout pase del 42% al 46% en cuatro semanas, sin que baje el ticket promedio. Escribí también qué resultado te haría descartarla, antes de ver los datos. Una hipótesis sin umbral ni plazo no se puede refutar, y entonces cualquier resultado parece un éxito.',
        },
        {
          text: 'Explicar las condiciones mínimas de un A/B test válido',
          explanation:
            'Necesitás asignación aleatoria de usuarios (no de sesiones, si el usuario puede volver) a control y variante, una métrica principal definida antes de empezar, y un tamaño de muestra calculado de antemano según el efecto mínimo que te importa detectar, la tasa base, el nivel de significancia (típicamente 5%) y la potencia (típicamente 80%). Tiene que correr el tiempo planeado y al menos un ciclo semanal completo para evitar efectos de día de la semana. También hay que chequear que los grupos tengan el tamaño esperado (sample ratio mismatch) y que no haya contaminación entre grupos. Ejemplo: con una conversión base del 5% y un efecto mínimo de 10% relativo, necesitás del orden de 30 mil usuarios por grupo.',
        },
        {
          text: 'Reconocer el peeking y el cambio de métrica como errores',
          explanation:
            'El peeking es mirar el resultado del test todos los días y frenarlo apenas da significativo: como el p-value fluctúa, revisarlo muchas veces infla mucho la probabilidad de un falso positivo, a veces por encima del 20% en vez del 5% nominal. La solución es fijar el tamaño de muestra y la duración antes, o usar métodos secuenciales diseñados para mirar en el camino. El cambio de métrica es, al ver que la principal no se movió, buscar otra que sí lo hizo y declarar éxito; si mirás veinte métricas, alguna va a dar significativa por azar. Por eso la métrica principal y las guardianas se escriben antes de empezar, y lo demás se reporta como exploratorio para un próximo test.',
        },
        {
          text: 'Proponer alternativas al A/B test cuando hay poco tráfico',
          explanation:
            'Con poco tráfico un A/B test tardaría meses en dar resultado, así que usás otras evidencias. Podés hacer comparaciones antes y después, con cuidado de controlar estacionalidad, o lanzar a un segmento y compararlo con otro similar. También sirven las pruebas cualitativas: tests de usabilidad con cinco usuarios, entrevistas después del lanzamiento, o fake doors para medir interés. Otra opción es medir métricas más sensibles y cercanas al cambio (clics en el paso modificado en vez de conversión final) o aceptar un umbral de confianza menor si la decisión es fácil de revertir. La clave es explicitar que la evidencia es más débil y compensarlo con decisiones reversibles.',
        },
        {
          text: 'Describir cómo diseñarías un sistema para que experimentar sea barato',
          explanation:
            'Que experimentar sea barato significa que lanzar una variante cueste horas, no semanas. Eso requiere feature flags con targeting por segmento y porcentaje, asignación de variantes consistente por usuario, eventos de exposición registrados automáticamente cuando se evalúa el flag y un pipeline que calcule los resultados sin trabajo manual. En el código, conviene aislar las partes que cambian (textos, precios, orden de elementos) en configuración en vez de hardcodearlas, y tener una forma estándar de limpiar flags al terminar. Ejemplo: el equipo define el experimento en una herramienta, el código consulta el flag, y al día siguiente hay un dashboard con la métrica principal y las guardianas por variante. El error común es armar cada experimento a mano con su propio tracking.',
        },
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
        {
          text: 'Explicar un framework de priorización y sus límites',
          explanation:
            'RICE puntúa cada iniciativa como Reach (cuántos usuarios afecta en un período) por Impact (cuánto mueve la métrica, en una escala como 0,25 a 3) por Confidence (qué tan seguro estás, en porcentaje), dividido Effort (personas-mes). Sirve para comparar opciones heterogéneas con un mismo criterio y para hacer explícitos los supuestos. Sus límites: los números son estimaciones subjetivas que se pueden inflar para justificar lo que uno ya quería, no considera dependencias, urgencia, reversibilidad ni alineación estratégica, y favorece mejoras chicas y seguras sobre apuestas grandes. Usalo como disparador de la conversación, no como decisión automática. Otros marcos: impacto contra esfuerzo, MoSCoW o Kano.',
        },
        {
          text: 'Recortar el alcance de una feature dejando lo necesario para validarla',
          explanation:
            'Empezás por la hipótesis: qué es lo mínimo que tiene que existir para saber si el problema se resuelve y si la gente lo usa. Separás la feature en partes y te preguntás para cada una si sin ella podés aprender lo mismo; si sí, queda para después. Suele recortarse: casos borde poco frecuentes, configuraciones, plataformas secundarias, automatizaciones que se pueden hacer a mano al principio y pulido visual no esencial. Ejemplo: para una feature de facturas recurrentes, la primera versión solo soporta frecuencia mensual y una moneda, y el resto se agrega si la gente la adopta. No se recorta la calidad de lo que sí entra ni la instrumentación, porque sin eso no validás nada.',
        },
        {
          text: 'Definir MVP y el error común al hacerlo',
          explanation:
            'Un MVP (minimum viable product) es la versión más chica de algo que te permite validar la hipótesis más riesgosa con usuarios reales, aprendiendo lo máximo con el mínimo esfuerzo. Puede ni siquiera ser software: una landing, un proceso manual detrás de una interfaz simple (concierge o Wizard of Oz) o un prototipo. El error común es interpretarlo como una versión mala o incompleta del producto final: algo con bugs y mala experiencia no valida nada, porque si falla no sabés si fue la idea o la ejecución. La metáfora conocida es que no se construye una rueda para después llegar a un auto, sino una patineta que ya te lleva de un lado a otro.',
        },
        {
          text: 'Argumentar cuándo tomar y cuándo pagar deuda técnica',
          explanation:
            'La deuda técnica es tomar un atajo hoy a cambio de un costo de mantenimiento futuro, y como la deuda financiera, puede ser una buena decisión si es consciente. Conviene tomarla cuando estás validando algo incierto (si la feature fracasa, la deuda desaparece con ella), cuando hay una ventana de mercado concreta o cuando el código es fácil de reemplazar. Conviene pagarla cuando frena al equipo de forma medible (features que tardan el doble en esa zona, bugs recurrentes, incidentes) y esa parte del sistema se toca seguido. Para defenderlo ante producto, traducilo a impacto: cada feature de pagos tarda dos semanas extra por esto. El error común es pedir tiempo para refactorizar sin conectar con un costo concreto.',
        },
        {
          text: 'Armar un plan trimestral a partir de objetivos y evidencia',
          explanation:
            'Partís de los objetivos de la empresa para el trimestre, por ejemplo con OKRs, y elegís uno o dos resultados que tu equipo puede mover. Después juntás la evidencia: problemas detectados en research, datos de embudos y retención, pedidos frecuentes, deuda que frena. Con eso armás un puñado de apuestas, cada una con su hipótesis, métrica y estimación gruesa, y las priorizás contra la capacidad real del equipo dejando margen (alrededor de 20 a 30%) para bugs, soporte e imprevistos. Ejemplo: objetivo subir la retención a 30 días del 25% al 30%; apuestas: mejorar el onboarding, notificaciones de reenganche y arreglar el bug de sincronización que más tickets genera. El error común es armar una lista de features sin conectar cada una con el objetivo.',
        },
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
        {
          text: 'Explicar qué es un feature flag, para qué sirve y qué costo tiene',
          explanation:
            'Un feature flag es una condición en el código que prende o apaga una funcionalidad en tiempo de ejecución, sin hacer un nuevo deploy, muchas veces con targeting por usuario, segmento o porcentaje. Sirve para separar deploy de release (mergear seguido código apagado), para rollouts graduales, para experimentos A/B, como kill switch ante incidentes y para betas con clientes específicos. Su costo: cada flag agrega ramas en el código, combinaciones difíciles de testear y riesgo de que un flag viejo se toque por error. Por eso cada flag necesita dueño, fecha de limpieza y un tipo claro (de release, de experimento, operacional o de permisos). Ejemplo de mal uso: un flag de release que lleva un año al 100% y nadie se anima a borrar.',
        },
        {
          text: 'Describir un rollout gradual con criterios de freno',
          explanation:
            'Un rollout gradual expone la feature a porcentajes crecientes de usuarios, por ejemplo equipo interno, después 1%, 10%, 50% y 100%, esperando en cada paso el tiempo suficiente para ver señales. Antes de empezar definís los criterios de freno, que son umbrales concretos que disparan el rollback: tasa de errores por encima de X, latencia p95 que sube más de Y, caída de conversión, aumento de tickets de soporte. Lo ideal es monitorear comparando el grupo con la feature contra el grupo sin ella, para separar el efecto de cambios externos. Ejemplo: si en el 10% la tasa de errores del checkout pasa de 0,5% a 2%, se apaga el flag y se investiga. El error común es definir los criterios después de ver los números.',
        },
        {
          text: 'Diagnosticar por qué una feature lanzada no se usa',
          explanation:
            'Recorré el embudo de adopción en orden. Exposición: ¿la gente la ve? Puede estar escondida en un menú o lanzada solo a una parte de los usuarios. Comprensión: ¿entienden para qué sirve? Mirá los clics y las sesiones grabadas. Activación: ¿la prueban y la terminan, o abandonan en un paso? Valor: ¿la usan una vez y no vuelven? Eso indica que no resuelve un problema real o que el problema no es frecuente. Cruzá los datos con cinco o seis conversaciones con usuarios que la vieron y no la usaron. Antes de todo, confirmá que el tracking funciona. El error común es asumir que el problema es de visibilidad y agregar un banner, cuando en realidad la feature no resuelve nada importante.',
        },
        {
          text: 'Diseñar el onboarding de una feature nueva y cómo medirlo',
          explanation:
            'El onboarding de una feature lleva al usuario indicado, en el momento en que tiene el problema, hasta el primer uso con éxito. Funciona mejor contextual que genérico: un tooltip o empty state que aparece cuando el usuario está en la situación relevante, plantillas o datos de ejemplo para no empezar en blanco y un camino corto hasta el primer resultado. Se mide con el embudo: cuántos vieron el onboarding, cuántos lo completaron, cuántos alcanzaron el primer uso exitoso y cuántos siguen usándola semanas después, idealmente comparando contra un grupo sin onboarding. Ejemplo: en una herramienta de reportes, el empty state ofrece crear el primer reporte desde una plantilla con un clic. El error común es un tour de cinco pasos que todos cierran sin leer.',
        },
        {
          text: 'Proponer canales de distribución pensados desde ingeniería',
          explanation:
            'Desde ingeniería hay canales que se construyen en el producto: loops de crecimiento donde el uso trae nuevos usuarios (invitar a un compañero, compartir un link público, un badge de hecho con X en lo que se exporta), integraciones con herramientas donde ya están los usuarios (Slack, Google, un marketplace de apps), páginas públicas indexables para SEO generadas desde el producto, una API o embeds que otros integran, y notificaciones o emails transaccionales que traen de vuelta. Ejemplo: un formulario que incluye un link a crear tu propio formulario en cada formulario publicado. La idea es que la distribución sea una propiedad del producto y no solo un trabajo de marketing. El error común es pensar que, si está bien construida, la gente la va a encontrar sola.',
        },
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
        {
          text: 'Contar cómo trabajás con diseño cuando también decidís UX',
          explanation:
            'Involucrate temprano: antes de que exista el diseño, compartí restricciones técnicas, datos de uso y la idea de alcance, así diseño no trabaja sobre supuestos imposibles. Cuando decidís UX por tu cuenta en cosas chicas, seguí el design system y patrones existentes, y dejá a diseño las decisiones grandes o nuevas. Prototipá rápido en código para probar interacciones que en un mockup no se ven (tiempos de carga, estados vacíos, errores). Cuando no estés de acuerdo, discutí con evidencia del usuario y no con preferencias, y respetá que la decisión final de diseño es de su especialidad. Ejemplo para contar: propusiste cambiar un flujo de tres pantallas a una porque los datos mostraban abandono en la segunda, y lo validaron juntos con un prototipo.',
        },
        {
          text: 'Relatar una vez que convenciste a otros sin autoridad, con evidencia',
          explanation:
            'Usá la estructura STAR (situación, tarea, acción, resultado) y poné el peso en la acción. Contá qué creía la otra parte y por qué tenía sentido desde su lado, qué evidencia juntaste (datos, entrevistas, un prototipo, un experimento chico) y cómo la presentaste en sus términos, por ejemplo traducida a la métrica que a esa persona le importa. Ejemplo: el equipo de ventas quería una integración pedida por un cliente grande; mostraste que otros 30 clientes pedían otra cosa que afectaba la retención, propusiste una versión mínima para el cliente grande y priorizaron la otra. Cerrá con el resultado y qué aprendiste. Evitá historias donde ganaste una discusión y el otro quedó mal: lo que se evalúa es influencia y colaboración.',
        },
        {
          text: 'Presentar los resultados de un lanzamiento en cuatro partes',
          explanation:
            'Las cuatro partes son: qué intentábamos lograr (la hipótesis y la métrica objetivo), qué pasó (los números contra el objetivo, incluyendo guardianas, con su nivel de confianza), qué aprendimos (por qué creemos que pasó, lo que sorprendió) y qué hacemos ahora (iterar, escalar, o abandonar, con el próximo paso concreto). Ejemplo: queríamos subir la activación del 30% al 35%; llegamos a 33%; el paso de importar datos sigue siendo el principal abandono; próximo paso, probar importación desde CSV. Reportá con la misma honestidad un resultado negativo que uno positivo. El error común es mostrar solo métricas que subieron o mostrar números sin conclusión.',
        },
        {
          text: 'Comunicar un cambio de prioridad explicando qué se deja de hacer',
          explanation:
            'Explicá primero por qué cambia la prioridad, con el dato o el contexto que lo motivó, y después decí explícitamente qué se deja de hacer o se pospone y hasta cuándo, porque toda nueva prioridad desplaza a otra. Nombrá a las personas afectadas y hablá con ellas antes del anuncio general si se ven muy afectadas, por ejemplo un equipo que dependía de esa entrega. Ejemplo: por el aumento de churn en clientes chicos, las próximas cuatro semanas vamos a priorizar el onboarding; esto pospone la integración con el ERP hasta el próximo mes. El error común es anunciar solo lo nuevo y dejar que cada uno descubra después que lo suyo se cayó.',
        },
        {
          text: 'Argumentar pros y contras de trabajar sin sprints',
          explanation:
            'Trabajar sin sprints, con flujo continuo o ciclos más largos tipo Shape Up, tiene a favor que reduce ceremonias, permite shippear apenas algo está listo y da más autonomía a equipos con ownership fuerte. En contra, sin un ritmo fijo puede perderse la visibilidad del avance, es más fácil que el trabajo se estire sin un corte, y requiere disciplina para revisar resultados y repriorizar. Funciona mejor con equipos senior, buena observabilidad y objetivos claros; con equipos nuevos o stakeholders que necesitan previsibilidad, una cadencia fija ayuda. Una respuesta con matices: no importa tanto el sprint como tener ciclos cortos de feedback, límites de trabajo en curso y un momento regular para mirar resultados.',
        },
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
        {
          text: 'Explicar cómo cambia la IA el trabajo de un product engineer',
          explanation:
            'Con agentes y asistentes de código, construir una primera versión es mucho más barato y rápido, así que el cuello de botella se mueve a decidir qué construir, especificar bien el problema y verificar que lo construido sea correcto y útil. Eso hace más valiosos el criterio de producto, el research y la capacidad de revisar código ajeno con rigor. También cambia el cálculo de alcance: prototipar varias alternativas y tirarlas es barato, así que conviene probar más ideas antes de comprometerse. El riesgo es acumular código que nadie entiende del todo y features que nadie pidió solo porque eran fáciles de hacer. Una respuesta sólida menciona tanto la velocidad como el control de calidad.',
        },
        {
          text: 'Describir tu flujo con agentes y cómo controlás la calidad',
          explanation:
            'Describí un flujo concreto: escribís una especificación corta con el problema, el comportamiento esperado y criterios de aceptación; le das al agente contexto (archivos relevantes, convenciones, tests existentes); trabajás en pasos chicos y revisás cada diff como si fuera el PR de otra persona. El control de calidad se apoya en lo verificable: tests que el agente tiene que hacer pasar, type checking, linters y revisión manual de lógica de negocio, seguridad y casos borde, que es donde los modelos se equivocan más. Ejemplo: le pedís primero los tests de una regla de descuento, los revisás y recién después la implementación. El error común es aceptar código que funciona en el caso feliz sin entender qué hace.',
        },
        {
          text: 'Listar qué hace que un codebase funcione bien con agentes',
          explanation:
            'Un codebase funciona bien con agentes cuando es fácil de entender y de verificar automáticamente: buena cobertura de tests rápidos, tipado estricto, linters, comandos simples y documentados para correr todo, y convenciones consistentes que el agente pueda imitar. Ayuda tener documentación cercana al código (un README o archivo de instrucciones con la arquitectura, decisiones y comandos), módulos chicos con responsabilidades claras y nombres descriptivos. También importan los entornos reproducibles, por ejemplo una base de datos local por rama, para que el agente pueda probar sus cambios. Lo que es bueno para un desarrollador nuevo es bueno para un agente; lo que solo sabe una persona en su cabeza es invisible para ambos.',
        },
        {
          text: 'Explicar cómo medirías la calidad de una feature basada en un modelo',
          explanation:
            'Combinás tres niveles. Evals offline: un conjunto de casos representativos con la respuesta esperada o criterios de calidad, que corrés en cada cambio de prompt o de modelo, evaluados con reglas, con personas o con otro modelo como juez calibrado contra juicio humano. Señales online: comportamiento de los usuarios, como aceptación de la respuesta, ediciones posteriores, reintentos, pulgares arriba o abajo y tasa de abandono. Guardianas: errores, alucinaciones detectadas, latencia y costo por request. Ejemplo para un resumen automático: porcentaje de resúmenes que el usuario edita mucho, más una muestra semanal revisada a mano. El error común es lanzar probando diez casos a ojo y sin forma de detectar regresiones.',
        },
        {
          text: 'Pensar la UX cuando un agente es la interfaz principal',
          explanation:
            'Cuando un agente es la interfaz, el usuario delega una tarea en vez de manejar cada paso, así que el diseño se centra en confianza y control. Hace falta que el agente muestre qué entendió y qué va a hacer antes de acciones importantes, que pida confirmación en lo irreversible (pagar, borrar, enviar), que deje ver el progreso y los pasos tomados, y que se pueda corregir o deshacer fácilmente. También hay que diseñar bien los errores y la incertidumbre: decir cuando no sabe en vez de inventar, y ofrecer salidas a una interfaz tradicional. Ejemplo: un agente que reserva viajes muestra un resumen con precio y fechas y espera un ok antes de pagar. El error común es copiar un chat genérico sin pensar en qué acciones tiene que verificar el usuario.',
        },
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
        {
          text: 'Resolver un caso de producto con una estructura anunciada al inicio',
          explanation:
            'Al empezar decí en voz alta cómo vas a resolverlo, por ejemplo: primero voy a aclarar el objetivo y el contexto, después elegir un segmento y un problema, proponer dos o tres soluciones, priorizar una y cerrar con cómo la mediría y qué riesgos veo. Eso le da al entrevistador un mapa para seguirte y a vos un ancla para no perderte. Durante el caso, avisá cuando pasás de una etapa a la otra y resumí lo decidido. Ejemplo: para mejorar la retención de Spotify, arrancás preguntando si el foco es usuarios gratuitos o pagos y en qué mercado. El error común es saltar directo a ideas de features sin estructura, lo que hace que la respuesta parezca una lluvia de ideas.',
        },
        {
          text: 'Elegir un segmento y un problema antes de proponer soluciones',
          explanation:
            'No podés resolver para todos, así que elegís un segmento concreto de usuarios (por ejemplo, usuarios nuevos en su primera semana, o pequeños comercios que venden por Instagram) y justificás la elección por tamaño, por dolor o por alineación con el objetivo de la empresa. Después listás dos o tres problemas de ese segmento y elegís uno, de nuevo explicando por qué. Recién ahí pensás soluciones, que quedan mucho más enfocadas. Ejemplo: en un caso de una app de delivery, elegís usuarios que piden de noche entre semana, el problema es la demora impredecible, y la solución se enfoca en estimaciones de tiempo más precisas. El error común es proponer soluciones genéricas para todo el mundo.',
        },
        {
          text: 'Priorizar una lista de pedidos explicando qué queda afuera',
          explanation:
            'Primero aclarás el objetivo contra el que priorizás, porque sin objetivo no hay orden posible. Después agrupás los pedidos por el problema que resuelven (muchas veces tres pedidos son el mismo problema), estimás de forma gruesa impacto, evidencia y esfuerzo de cada uno, y ordenás. Lo importante es decir explícitamente qué queda afuera y por qué, y qué haría falta para que entre, por ejemplo más evidencia o un cambio de objetivo. Ejemplo: si el objetivo es retención, el modo oscuro queda afuera aunque lo pida mucha gente, porque no hay señal de que la gente se vaya por eso. El error común es intentar meter todo con versiones reducidas, lo que no es priorizar.',
        },
        {
          text: 'Diseñar un sistema de notificaciones y su medición',
          explanation:
            'En el sistema separás quién decide enviar (eventos del producto que generan una notificación), un servicio que aplica reglas (preferencias del usuario, límites de frecuencia, horarios silenciosos, agrupado de varias en un resumen), una cola para el envío asíncrono con reintentos, y proveedores por canal (push, email, in-app, SMS). Cada envío se registra con un id para poder medir entregado, abierto o clickeado y la acción posterior. Para medir si funciona: tasa de clics, conversión a la acción objetivo, y sobre todo guardianas como opt-outs, desinstalaciones y desactivación de notificaciones. Ideal correr un experimento con grupo de control sin notificaciones para medir el efecto incremental real. El error común es optimizar aperturas y terminar con usuarios que desactivan todo.',
        },
        {
          text: 'Cerrar un caso con métricas, riesgos y próximos pasos',
          explanation:
            'Para cerrar, resumí en treinta segundos el problema elegido y la solución propuesta, y después nombrá cómo medirías el éxito (métrica principal con un objetivo, más una o dos guardianas), cuáles son los principales riesgos o supuestos (y cómo los mitigarías o validarías primero) y cuáles serían los próximos pasos concretos (qué se construye primero, qué experimento corrés, qué preguntarías a usuarios). Ejemplo: mediría la conversión del checkout con objetivo de +3 puntos en un mes, cuidando el ticket promedio; el mayor riesgo es que el costo de envío visible asuste; lo primero sería un test con el 10% del tráfico. Un buen cierre muestra que sabés convertir una idea en un plan verificable. El error común es terminar sin conclusión, esperando que el entrevistador diga basta.',
        },
        {
          text: 'Practicar al menos tres casos con tiempo limitado',
          explanation:
            'Buscá enunciados de casos (mejorar una métrica de una app conocida, diseñar una feature para un segmento, priorizar un backlog, diseñar un sistema y su medición) y resolvé cada uno con un cronómetro de 30 a 40 minutos, en voz alta, como en la entrevista real. Grabate o hacelo con otra persona que haga de entrevistador y te interrumpa con preguntas. Después revisá: si anunciaste la estructura, si hiciste preguntas aclaratorias, si elegiste segmento antes de soluciones y si cerraste con métricas y riesgos. Practicar en voz alta es clave porque pensar un caso en silencio no se parece a explicarlo bajo presión. Con tres casos ya se nota la diferencia en fluidez.',
        },
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
        {
          text: 'Hacer preguntas aclaratorias antes de responder un caso',
          explanation:
            'Ante un caso o escenario, antes de responder preguntá lo que cambia la respuesta: cuál es el objetivo de negocio, quién es el usuario, qué restricciones hay (tiempo, equipo, tecnología) y qué se sabe hoy. Dos a cuatro preguntas alcanzan; no conviertas la entrevista en un interrogatorio. Si el entrevistador te dice que lo decidas vos, explicitá el supuesto y seguí: asumo que el objetivo es retención porque la app ya tiene buena adquisición. Ejemplo: te piden diseñar una feature de búsqueda; preguntás si es para encontrar productos para comprar o contenido para leer, porque cambia todo. Esto muestra que no construís sin entender el problema, que es justo lo que se evalúa.',
        },
        {
          text: 'Admitir lo que no sabés y explicar cómo lo averiguarías',
          explanation:
            'Cuando no sabés algo, decilo de forma directa y mostrá cómo lo resolverías: no trabajé con esa herramienta, pero lo encararía así, o no conozco el dato exacto, lo buscaría en tal fuente. Si tenés algo cercano, conectalo: no usé Amplitude, pero armé embudos con Mixpanel y el concepto es el mismo. Esto suma puntos, porque el rol se trata de tomar decisiones con incertidumbre y saber cómo conseguir la información. Inventar una respuesta es lo peor: el entrevistador suele detectarlo con una repregunta y ahí perdés credibilidad en todo lo demás.',
        },
        {
          text: 'Tener cuatro historias STAR con resultados medibles',
          explanation:
            'Armá cada historia con STAR: Situación (contexto en una o dos frases), Tarea (qué te tocaba a vos), Acción (lo que hiciste vos, con decisiones y trade-offs, que es la parte más larga) y Resultado (un número medible y qué aprendiste). Cubrí temas distintos que se preguntan mucho: un lanzamiento con impacto, una decisión basada en datos o un cambio de rumbo, un conflicto o desacuerdo, y un fracaso. Ejemplo de resultado medible: redujimos el tiempo de onboarding de 3 días a 4 horas y la activación subió 12 puntos. Escribilas, ensayalas en voz alta a unos dos minutos cada una y adaptalas a varias preguntas. Si no hay números, usá aproximaciones honestas y explicá cómo las estimaste.',
        },
        {
          text: 'Preparar cinco preguntas para hacerle a la empresa',
          explanation:
            'Las buenas preguntas te ayudan a decidir y muestran cómo pensás. Ejemplos útiles para product engineering: cómo se decide qué construir y quién participa; cómo miden si una feature funcionó y qué pasa cuando no funciona; cuánto contacto tienen los ingenieros con usuarios; cómo es el proceso de deploy y cuánto tarda algo en llegar a producción; qué esperan que haya logrado la persona en este puesto a los seis meses. Prepará cinco por si algunas ya se respondieron durante la entrevista. Evitá preguntas cuya respuesta está en la web de la empresa y dejá salario y beneficios para la conversación con recruiting.',
        },
        {
          text: 'Probar el producto de la empresa y llevar una propuesta con hipótesis',
          explanation:
            'Usá el producto como un usuario real antes de la entrevista: registrate, completá el flujo principal y anotá fricciones, cosas confusas y oportunidades. Elegí una sola y armala como hipótesis: noté que tal paso pide demasiados datos, creo que simplificarlo para nuevos usuarios mejoraría la activación, y lo mediría con tal métrica. Presentala con humildad, reconociendo que no tenés sus datos y que puede haber razones que no ves desde afuera. Esto muestra iniciativa y criterio de producto, y suele dar una conversación muy buena. El error común es llevar una lista de críticas o rediseños grandes sin evidencia ni forma de validarlos.',
        },
      ],
    },
  ],
};
