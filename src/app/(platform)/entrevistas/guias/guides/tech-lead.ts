import type { InterviewGuide } from './types';

export const techLeadGuide: InterviewGuide = {
  track: 'tech-lead',
  summary:
    'Cómo prepararte para entrevistas de tech lead: decisiones técnicas, code review y calidad, deuda, planificación con producto, crecimiento del equipo, incidentes y diseño de sistemas, de tu primer rol de líder a liderar varios equipos.',
  sections: [
    {
      id: 'rol-y-entrevista',
      title: 'El rol y cómo es la entrevista',
      body: [
        'Un tech lead es responsable de la dirección técnica y de la entrega de un equipo: que las decisiones de diseño sean buenas, que el código tenga la calidad acordada, que el trabajo esté bien partido y fluya, y que el equipo crezca. Sigue programando, pero su impacto se mide por lo que entrega el equipo, no por sus propios tickets. Se diferencia del engineering manager, que es dueño de las personas y la organización (contratación, desempeño, carrera), y del staff engineer o arquitecto, que trabaja sobre problemas técnicos que cruzan varios equipos sin tener uno propio a cargo.',
        'La entrevista suele tener cuatro partes: una técnica (live coding, revisar un PR o discutir código que escribiste), una de liderazgo con escenarios ("dos personas del equipo no se ponen de acuerdo, ¿qué hacés?"), una de diseño de sistemas donde se evalúa tanto el diseño como la forma de razonar trade-offs, y una de comportamiento sobre experiencias reales ("contame de una vez que..."). En algunas empresas se suma una charla con producto para ver cómo negociás alcance y fechas.',
        'En junior, es decir tu primer rol de tech lead o un senior que da el salto, se espera que muestres criterio técnico sólido y señales de liderazgo informal: guiaste a alguien, propusiste mejoras, hiciste buenos reviews. En semi-senior, tech lead de un equipo, se espera que manejes la entrega completa: decisiones documentadas, deuda priorizada con producto, incidentes, estándares y el crecimiento de las personas. En senior, tech lead de varios equipos o líder de líderes, se espera estrategia técnica, influencia sin autoridad, migraciones grandes y hacer crecer a otros tech leads.',
        'Los errores más comunes son contar todo en primera persona como si el equipo no existiera, describir el liderazgo como "tomar las decisiones" en vez de crear las condiciones para que se tomen bien, y en la parte técnica, rendir por debajo porque "ya no programo tanto". El entrevistador busca a alguien que siga siendo técnicamente creíble y que, además, multiplique al equipo.',
      ],
      checklist: [
        {
          text: 'Explicar qué hace un tech lead y cómo se mide su impacto',
          explanation:
            'Un tech lead se hace cargo de la dirección técnica y de la entrega de un equipo. Concretamente: guía las decisiones de diseño, define y cuida estándares de calidad, parte el trabajo y lo ordena con producto, destraba a la gente, hace crecer a los desarrolladores y es el punto de contacto técnico hacia afuera. Su impacto se mide por el resultado del equipo: qué se entregó, con qué calidad, qué tan predecible fue y cuánto creció la gente. Ejemplo: un tech lead que pasa una semana emparejando con dos desarrolladores para que puedan mantener el módulo de pagos genera más impacto que si hubiera hecho él la feature en tres días. El error común es describir el rol como "el desarrollador más senior que además va a las reuniones".',
        },
        {
          text: 'Diferenciar tech lead, engineering manager y staff engineer o arquitecto',
          explanation:
            'El tech lead es dueño del cómo técnico de un equipo y de su ejecución. El engineering manager es dueño de las personas y la organización: contrata, evalúa desempeño, maneja carreras y salarios, y cuida la salud del equipo. El staff engineer o arquitecto trabaja sobre problemas técnicos que cruzan equipos (plataforma, estándares, arquitectura global) sin un equipo propio a cargo. Ejemplo: si un desarrollador no rinde, el tech lead aporta observaciones técnicas concretas y el manager lleva la conversación formal; si la organización necesita definir cómo se comunican los servicios, lo lidera el staff o arquitecto con los tech leads. En empresas chicas una persona combina roles, y conviene preguntar en la entrevista cuál es el reparto real.',
        },
        {
          text: 'Saber qué se espera de vos según tu seniority',
          explanation:
            'En junior (primer rol de tech lead) se espera criterio técnico fuerte, buenos code reviews, capacidad de partir trabajo y señales de liderazgo informal, como haber guiado a alguien o llevado adelante una mejora. En semi-senior (tech lead de un equipo) se espera que manejes la entrega completa: design docs y ADRs, deuda técnica priorizada con producto, incidentes y postmortems, estándares automatizados, delegación y mentoría. En senior (varios equipos o líder de líderes) se espera estrategia técnica, migraciones grandes, influencia sobre equipos que no te reportan, métricas de entrega y hacer crecer tech leads. Elegí ejemplos acordes: para senior, contá decisiones que cambiaron cómo trabajan varios equipos, no solo un buen sprint. El error común es apuntar a senior con historias de tamaño de un equipo.',
        },
        {
          text: 'Tener tres o cuatro historias de liderazgo listas en formato STAR',
          explanation:
            'STAR es situación, tarea, acción y resultado: sirve para contar una experiencia de forma ordenada en dos o tres minutos. Prepará historias que cubran las preguntas clásicas: una decisión técnica difícil, un desacuerdo en el equipo, alguien que ayudaste a crecer, un incidente, una entrega en riesgo y una decisión que salió mal. Para cada una, dejá claro qué hiciste vos y qué hizo el equipo, y cerrá con un resultado medible ("bajamos el tiempo de CI de 25 a 8 minutos", "la persona pasó a liderar el módulo"). Agregá qué aprendiste o harías distinto, porque casi siempre lo repreguntan. El error común es contar historias genéricas en plural ("hacíamos reviews") sin una acción concreta tuya.',
        },
        {
          text: 'Evitar los errores típicos en la entrevista de tech lead',
          explanation:
            'El primero es presentarte como el que decide todo: el entrevistador busca a alguien que escucha, deja decidir al equipo cuando corresponde y decide cuando hace falta, explicando el porqué. El segundo es descuidar la parte técnica; si te toca live coding o revisar código, se espera nivel senior aunque hoy programes menos. El tercero es responder escenarios con teoría ("aplicaría Scrum") en vez de con pasos concretos y preguntas para entender el contexto. El cuarto es hablar mal de equipos o jefes anteriores, que se lee como falta de responsabilidad. Ejemplo de buena actitud: ante "el equipo no llega a la fecha", preguntar qué se comprometió, qué se sabe del atraso y quién decide el alcance antes de proponer.',
        },
      ],
    },
    {
      id: 'decisiones-tecnicas',
      title: 'Decisiones técnicas, design docs y ADRs',
      body: [
        'Tomar buenas decisiones técnicas es el núcleo del rol, pero lo que se evalúa no es acertar siempre sino el proceso: entender el problema, definir criterios, considerar alternativas reales, pensar en los trade-offs (costo, riesgo, tiempo, operación, conocimiento del equipo) y dejar registro. Un tech lead que elige la tecnología que le gusta sin poder explicar qué se pierde es una señal de alerta.',
        'Las decisiones no pesan todas igual. Las reversibles, como una librería interna o un nombre de endpoint, se toman rápido y se corrigen si hace falta. Las difíciles de deshacer, como la base de datos, el modelo de datos de un dominio central o un contrato de API pública, merecen un design doc, una prueba de concepto y revisión de otras personas. Saber distinguirlas evita tanto el análisis eterno como los apurones caros.',
        'Los design docs o RFCs sirven para pensar por escrito y recibir feedback antes de construir; los ADRs registran decisiones ya tomadas para que el equipo del futuro entienda el porqué. Ambos tienen que ser cortos y circular a tiempo. En la entrevista suele sumar mucho mostrar un ejemplo real: qué decidiste, qué alternativas descartaste y cómo resultó.',
        'Cuando el equipo no se pone de acuerdo, el tech lead lleva la discusión a criterios y datos, y si no hay consenso, decide y explica. "Disagree and commit" significa que cada uno puede plantear su desacuerdo, pero una vez decidido, todos empujan en la misma dirección. Decidir por jerarquía sin escuchar rompe la confianza; no decidir nunca paraliza al equipo.',
      ],
      checklist: [
        {
          text: 'Describir tu proceso para tomar una decisión técnica importante',
          explanation:
            'Un proceso razonable: primero definir el problema y qué significa éxito, después listar criterios con peso (por ejemplo costo operativo, tiempo de implementación, riesgo, experiencia del equipo, escalabilidad), buscar dos o tres alternativas reales, evaluarlas contra esos criterios y, si la incertidumbre es alta, hacer un spike o prueba de concepto acotada en tiempo. Después alguien decide, se comunica y se registra el porqué. Ejemplo: para elegir cómo procesar trabajos en segundo plano, comparar una cola gestionada como SQS, Redis con una librería de jobs y una tabla en Postgres, y elegir Postgres porque el volumen es bajo y evita operar otra pieza. Conviene también definir cuándo revisar la decisión, por ejemplo "si pasamos de mil jobs por minuto". El error común es arrancar por la solución y armar los criterios después para justificarla.',
        },
        {
          text: 'Distinguir decisiones reversibles de las difíciles de deshacer',
          explanation:
            'Amazon popularizó la idea de puertas de una vía y de dos vías: las de dos vías se pueden revertir con poco costo, las de una vía no. Las reversibles se toman rápido, por la persona más cercana al problema, y se corrigen si salen mal; las irreversibles merecen más análisis, más revisores y a veces una prueba de concepto. Ejemplos reversibles: una librería de validación, la estructura de carpetas de un módulo, un feature detrás de un flag. Ejemplos difíciles de deshacer: el modelo de datos de facturación, un contrato de API pública que consumen clientes, el proveedor de nube. El error común es tratar todo igual: o se discute durante semanas qué librería de fechas usar, o se elige la base de datos de un servicio central en una charla de pasillo.',
        },
        {
          text: 'Escribir un design doc o RFC que se lea y sirva',
          explanation:
            'Un buen design doc arranca con el problema, el contexto mínimo, los objetivos y los no-objetivos (lo que explícitamente no se resuelve). Después la propuesta con el nivel de detalle justo, las alternativas descartadas con su porqué, los riesgos, el plan de rollout y migración, cómo se va a observar en producción y las preguntas abiertas. Tiene que circular temprano, con revisores elegidos (incluidos los equipos afectados) y una fecha para cerrar comentarios. Ejemplo: un RFC de dos o tres páginas para versionar la API pública, revisado por los equipos que la consumen antes de escribir código. Para cambios chicos alcanza con la descripción del PR. El error común es escribirlo cuando ya está todo implementado, cuando ya nadie puede cambiar nada.',
        },
        {
          text: 'Explicar qué es un ADR y cómo se mantiene',
          explanation:
            'Un Architecture Decision Record registra una decisión técnica significativa en un formato corto: título, estado (propuesta, aceptada, reemplazada), contexto, decisión, alternativas consideradas y consecuencias, tanto las buenas como lo que se acepta perder. Se guarda en el repositorio, por ejemplo en `docs/adr/0007-usar-postgres-para-jobs.md`, numerado y versionado junto al código. No se edita para cambiar la decisión: si cambia, se escribe un ADR nuevo que reemplaza al anterior y se marca el viejo como reemplazado, así queda la historia. Ejemplo de valor: un año después alguien pregunta por qué no usamos Kafka y la respuesta está escrita con el contexto de ese momento. El error común es usarlos solo para decisiones enormes o escribirlos sin alternativas, lo que les quita casi todo el valor.',
        },
        {
          text: 'Resolver un desacuerdo técnico en el equipo',
          explanation:
            'Primero separar personas de propuestas y opiniones de criterios: pedir que cada parte explique su opción con trade-offs, idealmente por escrito, y acordar qué importa más en este caso (simplicidad, performance, tiempo de entrega, mantenimiento). Muchas veces el desacuerdo es sobre supuestos distintos, como el volumen esperado, y se resuelve con datos o un spike corto. Si sigue sin consenso, el tech lead decide, explica el porqué y reconoce los puntos válidos de la otra opción; después se pide "disagree and commit". Ejemplo: ante REST contra GraphQL para un servicio interno, mirar quiénes lo consumen y qué sabe operar el equipo suele inclinar la balanza. El error común es dejar que gane quien más insiste o decidir por jerarquía sin escuchar.',
        },
      ],
    },
    {
      id: 'code-review-y-calidad',
      title: 'Code review, estándares y calidad',
      body: [
        'El code review es una de las herramientas más fuertes del tech lead: mejora el código, reparte conocimiento y transmite estándares. Pero también puede convertirse en cuello de botella o en fuente de conflictos. En la entrevista te van a preguntar qué mirás, cómo das feedback y cómo hacés para que los PRs no esperen días.',
        'Los estándares de código funcionan cuando se acuerdan con el equipo, se escriben de forma breve y se automatizan todo lo posible. Formatter, linter, chequeo de tipos y tests en CI resuelven la mayoría de las discusiones de estilo, y dejan a las personas discutiendo diseño y correctitud.',
        'La estrategia de testing se elige según el riesgo: muchos tests rápidos de lógica, menos tests de integración en los bordes y pocos end-to-end en los flujos críticos. La calidad no es una etapa al final ni responsabilidad exclusiva de QA: está en el diseño, en los tests, en los deploys chicos y en la observabilidad.',
        'El pipeline de CI/CD es parte de la calidad: si es lento o flaky, el equipo aprende a ignorarlo o a juntar cambios grandes. Un tech lead cuida que el feedback sea rápido, que los deploys sean frecuentes y reversibles, y mide la entrega con métricas como las de DORA.',
      ],
      checklist: [
        {
          text: 'Explicar qué mirás en un code review y en qué orden',
          explanation:
            'Primero el panorama: si el PR resuelve el problema correcto y si el enfoque encaja con la arquitectura del sistema. Después la correctitud: casos borde, manejo de errores, concurrencia, seguridad (permisos, validación de entrada), migraciones de datos y compatibilidad con versiones anteriores. Luego tests: si cubren el comportamiento importante y no la implementación. Al final, legibilidad y nombres; el estilo debería resolverlo el linter. Ejemplo: en un PR que agrega un endpoint de exportación, lo más importante es notar que no chequea que el usuario pertenezca a la organización, no que una variable se llama `data`. El error común es llenar el PR de comentarios menores y no ver el problema de diseño.',
        },
        {
          text: 'Dar feedback en reviews que mejore el código sin romper la relación',
          explanation:
            'Los comentarios funcionan mejor como preguntas o sugerencias con motivo ("¿qué pasa si la lista viene vacía?", "lo extraería para poder testearlo aislado") que como órdenes. Conviene marcar qué es bloqueante y qué es opcional, por ejemplo con prefijos como `nit:` o `sugerencia:`, y reconocer también lo que está bien. Si un hilo pasa de dos o tres idas y vueltas, es mejor una llamada de cinco minutos. Ejemplo: en vez de "esto está mal", escribir "esta consulta corre dentro del loop, así que con 500 órdenes son 500 queries; ¿la podemos traer en una sola con `in`?". El error común es usar el review para imponer gustos personales, lo que genera resistencia y PRs defensivos.',
        },
        {
          text: 'Mantener los reviews rápidos y evitar el cuello de botella',
          explanation:
            'Los PRs que esperan días frenan la entrega y llevan a PRs cada vez más grandes. Ayuda acordar un tiempo objetivo de primera respuesta (por ejemplo, el mismo día hábil), pedir PRs chicos (idealmente menos de 400 líneas), repartir los reviews en vez de que todo pase por el tech lead y usar `CODEOWNERS` solo donde hace falta un dueño. Ejemplo: si medís y ves que los PRs esperan en promedio dos días, una rotación diaria de revisor y bloques de review a primera hora suelen bajarlo a horas. El tech lead debería revisar los cambios de mayor riesgo, no todos. El error común es que el tech lead sea aprobador obligatorio de todo, lo que lo convierte en cuello de botella y frena el crecimiento del resto.',
        },
        {
          text: 'Definir una estrategia de testing según el riesgo',
          explanation:
            'La pirámide de testing propone muchos tests unitarios (rápidos, sobre lógica), menos de integración (contra base de datos real, colas, APIs) y pocos end-to-end (flujos críticos de punta a punta, más lentos y frágiles). Cada equipo la ajusta según su sistema: una API con poca lógica y mucha base de datos se beneficia más de tests de integración. Lo importante es testear comportamiento observable y cubrir lo que más duele si falla. Ejemplo: para un checkout, unitarios del cálculo de precios con descuentos y redondeos, integración del endpoint de pago con un proveedor simulado y un e2e del flujo completo. El error común es perseguir un porcentaje de cobertura, que se infla con tests que no verifican nada importante.',
        },
        {
          text: 'Explicar qué hace bueno a un pipeline de CI/CD y cómo medir la entrega',
          explanation:
            'Un buen pipeline da feedback rápido (idealmente menos de diez minutos para lo principal), es confiable y bloquea lo que tiene que bloquear: build, tipos, linter, tests y chequeos de seguridad. Los tests flaky se arreglan o se ponen en cuarentena rápido, porque si no el equipo aprende a reintentar sin mirar. Del lado del deploy, automático, frecuente, chico y reversible, con feature flags o canary releases. Para medir, las métricas de DORA: frecuencia de deploy, lead time de cambios, tasa de fallas de cambios y tiempo de recuperación. Ejemplo: tener rollback en un comando hace que el equipo deploye más seguido y con menos miedo. El error común es sumar pasos al pipeline sin mirar cuánto tarda hasta que nadie quiere esperarlo.',
        },
      ],
    },
    {
      id: 'deuda-tecnica',
      title: 'Deuda técnica',
      body: [
        'La deuda técnica es el costo futuro que generan los atajos o las decisiones que ya no encajan con lo que el sistema necesita: cada cambio en esa zona es más lento, más riesgoso o más difícil de entender. No es sinónimo de "código feo": la deuda que importa es la que frena al equipo o genera incidentes en partes que se tocan seguido.',
        'Parte de la deuda se toma a propósito, por ejemplo para llegar a un lanzamiento, y eso está bien si se registra y se planea pagarla. Otra parte aparece sola, porque el negocio cambió o porque se aprendió algo que antes no se sabía. Un tech lead la hace visible, la cuantifica y la prioriza con producto como cualquier otro trabajo.',
        'En la entrevista se busca que no la presentes como una pelea entre ingeniería y producto. Las respuestas que funcionan hablan de impacto concreto, de pagarla de forma incremental y cerca del trabajo de producto, y de evitar los grandes rewrites que congelan el negocio durante meses.',
      ],
      checklist: [
        {
          text: 'Definir deuda técnica y distinguir sus tipos',
          explanation:
            'Ward Cunningham la definió con la metáfora financiera: tomar un atajo es como pedir un préstamo, y cada cambio posterior en esa zona paga intereses en forma de tiempo y riesgo. El cuadrante de Martin Fowler la clasifica en deliberada o inadvertida y en prudente o imprudente: "lanzamos ahora y refactorizamos después" es deliberada y prudente; no saber que existía un patrón mejor es inadvertida. También hay deuda que aparece por cambios externos, como una librería que dejó de mantenerse o un dominio que creció. Ejemplo: guardar los precios como `float` para salir rápido es deuda deliberada que más adelante genera errores de redondeo. El error común es llamar deuda a cualquier código que no te gusta, lo que le quita credibilidad al concepto frente a producto.',
        },
        {
          text: 'Hacer visible la deuda y medir su impacto',
          explanation:
            'La deuda que no se ve no se prioriza. Un registro simple (un label en el tracker o una lista en el repo) con cada ítem, la zona afectada, el impacto y una estimación del arreglo permite discutirla con datos. El impacto se expresa en términos de negocio: incidentes causados, tiempo extra que agrega a cada cambio, riesgo de seguridad, onboarding más lento. También sirven señales del código como zonas con muchos cambios y muchos bugs a la vez (hotspots). Ejemplo: "el módulo de facturación concentró 6 de los 10 incidentes del trimestre y cada cambio ahí tarda el doble que en el resto". El error común es acumular la deuda en la cabeza del tech lead y sacarla solo en forma de quejas.',
        },
        {
          text: 'Priorizar la deuda frente a las features con producto',
          explanation:
            'Funcionan varias estrategias combinadas: reservar un porcentaje de capacidad fijo (por ejemplo 15-20% por sprint), aplicar la regla del boy scout (dejar el código un poco mejor cada vez que se toca) y pagar la deuda de una zona justo antes de una feature que la va a tocar. Así la deuda se paga donde más rinde y con un beneficio de producto visible. Ejemplo: "antes de sumar el nuevo medio de pago refactorizamos el módulo de cobros; suma tres días, pero los dos medios de pago siguientes salen en la mitad del tiempo". Con producto conviene hablar de opciones y costos, no pedir permiso. El error común es pedir un "sprint de deuda" abstracto sin resultado visible, que casi nunca se aprueba o se cancela a la mitad.',
        },
        {
          text: 'Decidir entre refactor incremental y reescritura',
          explanation:
            'Las reescrituras completas son tentadoras pero riesgosas: llevan más de lo previsto, el sistema viejo sigue necesitando cambios mientras tanto y se pierden comportamientos que nadie documentó. Por eso suele convenir el refactor incremental o el patrón strangler fig: construir lo nuevo al lado, mover funcionalidad de a partes y apagar lo viejo cuando ya no recibe tráfico. Una reescritura tiene sentido cuando el sistema es chico, está muy aislado o la tecnología ya no se puede mantener. Ejemplo: en vez de reescribir todo el backend de reportes, migrar primero el reporte más usado a la nueva arquitectura y enrutar ese endpoint, midiendo que los resultados coincidan. El error común es prometer una reescritura en tres meses y congelar features durante un año.',
        },
        {
          text: 'Contar una experiencia real de manejo de deuda técnica',
          explanation:
            'Es una pregunta de comportamiento muy frecuente, así que conviene tener una historia preparada. Una buena historia muestra cómo detectaste la deuda, cómo mediste su impacto, cómo convenciste a producto o a la dirección, cómo la pagaste sin frenar la entrega y qué resultado tuvo con números. Ejemplo: "los deploys fallaban una de cada cinco veces por tests de integración frágiles; registré los fallos durante un mes, mostré que nos costaban unas diez horas semanales, acordamos dedicar un 20% durante dos sprints y bajamos los fallos a menos de uno por mes". Suma contar qué deuda decidiste no pagar y por qué. El error común es contar solo el refactor técnico sin la parte de alinear a otros, que es lo que se evalúa en un tech lead.',
        },
      ],
    },
    {
      id: 'planificacion-y-entrega',
      title: 'Estimación, planificación y alineación con producto',
      body: [
        'Un tech lead es el socio técnico del product manager: producto trae el qué y el porqué, y el tech lead aporta factibilidad, riesgos, dependencias, estimaciones y opciones para llegar al objetivo con menos costo. La relación sana es de negociación entre pares, no de "producto pide, ingeniería ejecuta".',
        'Partir el trabajo es una habilidad clave: rebanadas verticales que se pueden entregar y probar, empezando por las que más incertidumbre sacan, con tareas lo bastante chicas para revisarse y seguirse. Una buena descomposición hace que la estimación sea más confiable y que varias personas puedan trabajar en paralelo.',
        'Las estimaciones son pronósticos con incertidumbre, no promesas. Se comunican como rangos con supuestos explícitos y se actualizan cuando aparece información nueva. Cuando algo se atrasa, se avisa temprano y con opciones: qué se recorta, qué se mueve, qué versión mínima llega.',
        'Durante la ejecución, el trabajo del tech lead es mantener el flujo: detectar bloqueos, destrabar a la gente, gestionar dependencias con otros equipos y comunicar el estado hacia arriba y hacia los costados, en el idioma de cada audiencia.',
      ],
      checklist: [
        {
          text: 'Descomponer una feature grande en rebanadas verticales',
          explanation:
            'Una rebanada vertical atraviesa todas las capas necesarias (UI, API, base de datos) para entregar algo que funciona de punta a punta, aunque sea chico. Se opone a partir por capas, como "todo el backend y después todo el frontend", que demora el feedback y concentra el riesgo de integración al final. Conviene empezar por la rebanada que más incertidumbre saca y dejar para después lo que es variación de algo conocido. Ejemplo: para un checkout nuevo, primero un flujo con un solo medio de pago detrás de un feature flag, después cupones, después más medios de pago y por último la optimización mobile. Tareas de uno a tres días son fáciles de revisar y hacen visible el avance real. El error común es una tarea de "implementar checkout" de tres semanas que está "casi lista" durante dos.',
        },
        {
          text: 'Estimar con incertidumbre y comunicar rangos',
          explanation:
            'Una estimación honesta es un rango con supuestos: "entre dos y cuatro semanas, si el proveedor nos da acceso al sandbox esta semana". Para reducir la incertidumbre sirven los spikes acotados en tiempo, comparar con trabajo similar del pasado y estimar en grupo, por ejemplo con planning poker, para que salgan a la luz los supuestos distintos. El cono de la incertidumbre recuerda que al principio el error es grande y se achica a medida que se avanza, así que las estimaciones se revisan. Ejemplo: después de un spike de dos días, pasar de "uno a tres meses" a "cinco a siete semanas" y comunicarlo. El error común es dar el número optimista para quedar bien, que después se convierte en compromiso y en horas extra.',
        },
        {
          text: 'Negociar alcance y fechas con el product manager',
          explanation:
            'Cuando el pedido no entra en el tiempo disponible, el tech lead no dice simplemente que no: entiende el objetivo de negocio detrás del pedido y ofrece opciones con sus consecuencias. Las palancas habituales son recortar alcance, entregar por etapas, cambiar la fecha o asumir deuda de forma explícita; sumar gente tarde rara vez acelera. Ejemplo: "para la fecha del evento podemos tener la exportación a CSV; los reportes programados por email llegan dos semanas después; si los necesitás para el evento, tenemos que sacar la integración con el CRM de este mes". La decisión de qué priorizar es de producto, con información técnica clara. El error común es aceptar todo y después sacrificar calidad o al equipo en silencio.',
        },
        {
          text: 'Comunicar un atraso a tiempo y con opciones',
          explanation:
            'Los atrasos se comunican apenas se detectan, no el día anterior a la fecha. Un buen aviso tiene qué pasó (sin excusas largas), el impacto en la fecha, las opciones con sus costos y una recomendación, más lo que se necesita del otro lado para decidir. Ejemplo: "la integración con el proveedor está una semana atrasada porque su API no soporta reembolsos parciales; opciones: lanzar sin reembolsos parciales y hacerlos manuales una semana, o mover el lanzamiento al 15; recomiendo la primera". Después, en la retrospectiva, se analiza la causa para mejorar las próximas estimaciones. El error común es esperar a tener buenas noticias, porque el atraso descubierto tarde quita opciones y destruye confianza.',
        },
        {
          text: 'Detectar y destrabar bloqueos en el equipo',
          explanation:
            'Las señales de bloqueo son tareas que no se mueven en el tablero, dailies repetidas ("sigo con lo mismo"), PRs que esperan review hace días o dependencias de otros equipos sin fecha. El tech lead pregunta en privado y sin juicio, y ofrece ayuda concreta: emparejar un rato, conectar con quien sabe, aclarar el requisito con producto o recortar el alcance de la tarea. Para las dependencias externas, conviene hablarlas en la planificación, con un responsable y una fecha del otro lado. Ejemplo: si alguien lleva tres días con un test flaky, media hora de pairing suele resolverlo o al menos decidir aislarlo. El error común es enterarse del bloqueo en la demo, cuando ya no hay tiempo de reaccionar.',
        },
      ],
    },
    {
      id: 'crecimiento-del-equipo',
      title: 'Mentoría, delegación y onboarding',
      body: [
        'Un tech lead que hace todo lo difícil se vuelve cuello de botella y deja al equipo sin crecer. Parte central del rol es multiplicar: enseñar, delegar trabajo que estire a otros y armar un equipo donde el conocimiento esté repartido. En la entrevista te van a pedir ejemplos concretos de personas que ayudaste a crecer.',
        'Delegar bien no es repartir tickets: es dar resultados con contexto, ajustar el acompañamiento a la experiencia de cada persona y aceptar que lo hagan distinto a como lo harías vos. El onboarding es la primera oportunidad de mostrar cómo trabaja el equipo y se nota en lo rápido que una persona nueva llega a aportar.',
        'El balance entre programar y liderar cambia con el tamaño del equipo, pero siempre conviene elegir qué programar: trabajo fuera del camino crítico, prototipos que reducen riesgo y mejoras que ayudan a todos. Programar algo sigue siendo necesario para mantener el criterio técnico y la credibilidad.',
      ],
      checklist: [
        {
          text: 'Explicar cómo hacés crecer a un desarrollador del equipo',
          explanation:
            'Empieza por saber qué quiere y dónde está: una charla sobre sus objetivos y una idea honesta de sus fortalezas y lo que le falta. Después, trabajo que lo estire un poco con red de seguridad, feedback frecuente y específico, y espacios de aprendizaje como pair programming o reviews que expliquen el porqué. Las preguntas suelen enseñar más que las respuestas: "¿qué pasaría si este servicio no responde?" lleva a la persona a pensar el caso. Ejemplo: a un semi-senior que quiere crecer en diseño, darle el design doc de una integración, revisarlo juntos y que lo presente al equipo. El error común es resolverle los problemas para ir más rápido, que le quita justamente la oportunidad de aprender.',
        },
        {
          text: 'Delegar resultados con el nivel de acompañamiento justo',
          explanation:
            'Delegar es transferir un resultado con su contexto: el problema, por qué importa, las restricciones y qué decisiones puede tomar la persona sola. El nivel de seguimiento depende de su experiencia en esa tarea: a alguien nuevo en el tema conviene darle check-ins tempranos, por ejemplo revisar el enfoque antes de que empiece a codear; a alguien con experiencia, solo pedirle que avise si se traba. Ejemplo: "necesitamos que los reportes no tarden más de dos segundos; podés elegir el enfoque, contame el plan antes del jueves". El tech lead se queda con lo que solo él puede destrabar, como decisiones entre equipos o riesgos grandes. El error común es delegar y después rehacer el trabajo, lo que enseña al equipo que no vale la pena esforzarse.',
        },
        {
          text: 'Diseñar un onboarding que lleve a alguien a aportar rápido',
          explanation:
            'Un buen onboarding tiene el entorno funcionando el primer día (un README o script que levanta todo), un buddy asignado para las preguntas, una explicación del dominio y del mapa del sistema, y un primer PR chico que llega a producción en la primera semana. Después siguen tareas de complejidad creciente en distintas partes del código y check-ins regulares. Ejemplo: una lista de "primeros issues" etiquetados, con bugs acotados en frontend, backend y datos, para que la persona conozca el sistema arreglando cosas reales. Conviene pedirle a cada persona nueva que mejore la documentación con lo que le costó, porque ve lo que el resto ya no ve. El error común es una semana entera leyendo documentación desactualizada sin tocar código.',
        },
        {
          text: 'Reducir el bus factor del equipo',
          explanation:
            'El bus factor es cuántas personas tendrían que irse para que una parte del sistema quede sin nadie que la entienda; si es uno, hay un riesgo serio. Se reduce rotando el trabajo entre zonas, haciendo pair programming en los módulos críticos, pidiendo reviews de alguien que no conoce esa parte y documentando lo que no es obvio en el código. Ejemplo: si solo una persona sabe deployar el servicio de facturación, el próximo deploy lo hace otra con ella al lado y se escribe el runbook. Esto también es bueno para quien concentra el conocimiento, porque puede tomarse vacaciones y crecer hacia otros temas. El error común es que el propio tech lead sea el único que conoce las partes críticas.',
        },
        {
          text: 'Explicar cómo balanceás programar y liderar',
          explanation:
            'La proporción habitual va de un 30% a un 60% de tiempo programando, según el tamaño del equipo y la etapa. Lo importante es elegir bien: el trabajo del camino crítico conviene que lo hagan otros, porque las reuniones y las interrupciones del tech lead lo van a atrasar. Sí suman los prototipos que reducen riesgo antes de una decisión, las herramientas que aceleran a todos, los bugs acotados y el pairing. Ejemplo: en vez de tomar la integración urgente del sprint, armar la prueba de concepto del sistema de colas que el equipo va a usar el trimestre siguiente. Conviene proteger bloques de foco en la agenda. El error común es seguir midiéndose por los tickets propios y sentir culpa por el tiempo dedicado a destrabar a otros.',
        },
      ],
    },
    {
      id: 'incidentes-y-postmortems',
      title: 'Incidentes y postmortems',
      body: [
        'Cómo reacciona un equipo cuando algo se rompe en producción dice mucho de su madurez, y el tech lead suele estar en el centro. Lo que se evalúa es la calma, la priorización (primero mitigar, después investigar), la coordinación de roles y la comunicación hacia afuera mientras dura el incidente.',
        'Después de un incidente viene el postmortem: un análisis sin culpas que busca entender cómo el sistema permitió que pasara y qué cambiar para que no se repita o duela menos. Un postmortem útil termina en pocas acciones concretas con responsable y fecha, que se siguen hasta cerrarlas.',
        'En semi-senior y senior también importa la prevención: alertas sobre síntomas que afectan al usuario, SLOs, runbooks, guardias sostenibles y prácticas de deploy que reducen el radio de impacto, como feature flags y canary releases.',
      ],
      checklist: [
        {
          text: 'Describir cómo coordinás la respuesta a un incidente',
          explanation:
            'El primer paso es declarar el incidente y definir roles: quien coordina (incident commander), quien investiga y quien comunica. El objetivo inicial es restaurar el servicio, no encontrar la causa raíz: rollback, desactivar un feature flag, escalar recursos o desviar tráfico. Se trabaja en un canal único, dejando registro de lo que se prueba y se decide, lo que después sirve para la línea de tiempo. Ejemplo: tras un deploy, los pagos fallan al 30%; el coordinador decide revertir a los cinco minutos aunque todavía no se sepa la causa, y la investigación sigue con el servicio estable. El error común es que el tech lead se meta a debuggear solo y nadie coordine ni comunique.',
        },
        {
          text: 'Comunicar un incidente a stakeholders mientras sucede',
          explanation:
            'Soporte, producto y a veces clientes necesitan saber qué pasa aunque no haya causa todavía. Un buen update dice qué está afectado y para quién, desde cuándo, qué se está haciendo y cuándo llega el próximo update, sin jerga y sin especular. La cadencia regular (por ejemplo cada 15 o 30 minutos) baja la ansiedad y evita que todos pregunten por privado al equipo que está resolviendo. Ejemplo: "desde las 14:10 alrededor del 30% de los pagos con tarjeta fallan; revertimos el último cambio y estamos monitoreando; próximo update 14:45". Al cerrar, un mensaje final con la resolución y el aviso de que viene un postmortem. El error común es el silencio, que hace que el incidente parezca peor de lo que es.',
        },
        {
          text: 'Escribir un postmortem sin culpas',
          explanation:
            'Un postmortem sin culpas (blameless) parte de que las personas actuaron razonablemente con la información que tenían, y busca qué en el sistema permitió el error. Incluye resumen, impacto (usuarios, duración, dinero), línea de tiempo precisa, causas contribuyentes, qué funcionó bien, qué no, y acciones. Preguntar "¿por qué el sistema permitió esto?" varias veces lleva a mejoras de verdad en vez de a "tener más cuidado". Ejemplo: en vez de "Ana corrió una migración que bloqueó la tabla", la causa es "nada en CI detecta migraciones que bloquean tablas grandes y no hay ventana definida para correrlas". El error común es buscar un culpable, lo que hace que la próxima vez la gente esconda información.',
        },
        {
          text: 'Definir acciones de un postmortem que realmente se cumplan',
          explanation:
            'Las acciones tienen que ser pocas, concretas, con responsable, fecha y un ticket en el backlog del equipo, priorizadas como cualquier otro trabajo. Conviene combinar acciones que previenen (un chequeo en CI), que detectan antes (una alerta) y que reducen el impacto (un feature flag o un runbook). Ejemplo: tres acciones bien elegidas, como agregar la alerta de tasa de errores en pagos, automatizar el rollback y testear el timeout del proveedor, valen más que quince ideas sueltas. El tech lead revisa en la planificación que se cierren, y si se repite un incidente parecido, es señal de que algo no se cumplió. El error común es un documento prolijo cuyas acciones nadie retoma.',
        },
        {
          text: 'Explicar cómo prevenís incidentes y reducís su impacto',
          explanation:
            'La prevención combina varias capas: deploys chicos y frecuentes que son fáciles de revertir, feature flags para separar deploy de lanzamiento, canary releases que exponen el cambio a pocos usuarios primero, tests en los flujos críticos y revisiones de los cambios riesgosos. Para detectar rápido sirven las alertas sobre síntomas que ve el usuario (tasa de errores, latencia) y los SLOs con presupuesto de errores, en vez de alertas de CPU que nadie mira. Las guardias tienen que ser sostenibles, con runbooks y rotación justa. Ejemplo: lanzar el nuevo buscador al 5% del tráfico con una alerta de latencia permite volver atrás antes de que lo note casi nadie. El error común es tener tantas alertas ruidosas que el equipo las ignora.',
        },
      ],
    },
    {
      id: 'diseno-de-sistemas',
      title: 'Diseño de sistemas para tech leads',
      body: [
        'Casi todas las entrevistas de tech lead incluyen una etapa de diseño de sistemas. No se espera un arquitecto de sistemas planetarios, pero sí que puedas diseñar algo razonable para el tamaño del problema, explicar los trade-offs y conducir la conversación de forma ordenada.',
        'El formato típico es una consigna abierta ("diseñá un acortador de URLs", "un sistema de notificaciones") de 45 a 60 minutos. Lo que más pesa es el proceso: aclarar requisitos, estimar escala, proponer una arquitectura simple, profundizar en las partes críticas y reconocer lo que dejaste afuera.',
        'Para un tech lead suma conectar el diseño con la realidad del equipo: qué sabe operar, cuánto cuesta, cómo se despliega de forma incremental, cómo se observa en producción y cómo se migra desde lo que existe hoy. Un diseño brillante que el equipo no puede mantener no es un buen diseño.',
        'Es la etapa donde más se nota si sabés pensar en voz alta y colaborar: escuchar las pistas del entrevistador, cambiar de idea cuando aparece información nueva y decir "no sé, pero lo pensaría así" en vez de inventar.',
      ],
      checklist: [
        {
          text: 'Seguir una estructura clara en una entrevista de diseño de sistemas',
          explanation:
            'Una estructura que funciona: primero aclarar requisitos funcionales y no funcionales (qué hace, cuántos usuarios, latencia, disponibilidad, consistencia), después estimar escala con números gruesos (pedidos por segundo, volumen de datos), luego un diseño de alto nivel con los componentes principales y el flujo de datos, después profundizar en dos o tres partes críticas y al final hablar de cuellos de botella, fallas y observabilidad. Conviene ir dibujando y contando qué hacés en cada paso. Ejemplo: en un acortador de URLs, notar que las lecturas superan por mucho a las escrituras lleva naturalmente a hablar de caché. El error común es empezar a dibujar Kafka y microservicios sin haber preguntado nada.',
        },
        {
          text: 'Explicar trade-offs clásicos con ejemplos',
          explanation:
            'Los trade-offs que más aparecen: consistencia contra disponibilidad (el teorema CAP, y en la práctica cuánta latencia de replicación tolera el negocio), base relacional contra no relacional según el modelo de datos y las consultas, procesamiento sincrónico contra asincrónico con colas, monolito contra servicios, y caché (más velocidad a cambio de datos posiblemente viejos e invalidación). Lo importante es atarlos al caso: el saldo de una cuenta necesita consistencia fuerte, el contador de likes puede ser eventual. Ejemplo: enviar el email de bienvenida por una cola hace que el registro no dependa del proveedor de emails, a cambio de operar la cola y manejar reintentos. El error común es nombrar tecnologías sin decir qué se gana y qué se pierde.',
        },
        {
          text: 'Diseñar para fallas: reintentos, idempotencia y degradación',
          explanation:
            'En sistemas distribuidos todo falla en algún momento, así que el diseño tiene que contemplarlo. Los reintentos con backoff exponencial y jitter evitan saturar a un servicio que se está recuperando; los timeouts evitan que un servicio lento arrastre a todos; la idempotencia (por ejemplo con una `idempotency-key`) permite reintentar un pago sin cobrar dos veces. Un circuit breaker deja de llamar a una dependencia caída por un tiempo, y la degradación elegante muestra algo útil aunque una parte no funcione. Ejemplo: si el servicio de recomendaciones no responde, la página de producto se muestra igual sin ese bloque. Las colas con dead letter queue guardan lo que falla siempre para revisarlo. El error común es diseñar solo el camino feliz.',
        },
        {
          text: 'Conectar el diseño con la operación y el equipo',
          explanation:
            'Un tech lead tiene que pensar quién va a construir y operar lo que diseña. Eso incluye observabilidad (logs estructurados, métricas, trazas y alertas sobre lo que ve el usuario), cómo se despliega y se revierte, el costo de infraestructura y si el equipo conoce las tecnologías elegidas. También el plan de migración desde el sistema actual, de forma incremental y con forma de volver atrás. Ejemplo: elegir Postgres con una tabla de jobs en vez de un cluster de Kafka para un volumen de mil eventos por minuto, porque el equipo ya lo opera y alcanza con margen. En la entrevista, mencionarlo muestra criterio de líder. El error común es sobrediseñar para una escala que el negocio no tiene ni va a tener pronto.',
        },
        {
          text: 'Comunicar y defender un diseño ante otros',
          explanation:
            'Saber diseñar no alcanza: el tech lead tiene que explicar el diseño a públicos distintos y recibir críticas sin ponerse a la defensiva. Con el equipo técnico se profundiza en componentes, contratos y riesgos; con producto o la dirección se habla de qué habilita, cuánto cuesta, qué riesgos tiene y en qué etapas se entrega. Ante una objeción, conviene preguntar qué la motiva, reconocer lo válido y explicar el trade-off que se eligió y por qué. Ejemplo: si un entrevistador dice "¿y si el tráfico se multiplica por diez?", una buena respuesta indica qué parte se rompería primero y cómo se escalaría, sin rediseñar todo. El error común es aferrarse al primer diseño o, al revés, abandonarlo ante la primera pregunta.',
        },
      ],
    },
  ],
};
