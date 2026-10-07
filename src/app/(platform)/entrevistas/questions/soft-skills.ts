import type { InterviewQuestion, Seniority } from './types';

export const softSkillsQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'star',
      question: '¿Qué es el método STAR y para qué sirve en una entrevista?',
      answer:
        'Es una estructura para contar experiencias: situación (el contexto), tarea (qué te tocaba a vos), acción (qué hiciste concretamente) y resultado (qué pasó, idealmente con un dato). Sirve para que la respuesta sea corta, ordenada y verificable en vez de una anécdota que se va por las ramas. Una buena respuesta aclara que la mayor parte del tiempo va en la acción, contada en primera persona, y que al final suma qué aprendiste. El error típico es quedarse en la situación y nunca llegar a lo que hiciste vos.',
    },
    {
      topic: 'comunicacion',
      question: 'Contame de una vez que no entendiste una tarea y cómo lo resolviste.',
      answer:
        'Buscan ver si preguntás a tiempo o si te quedás trabado en silencio. Una buena respuesta cuenta qué intentaste solo primero (leer el ticket, el código, la documentación), cuándo decidiste preguntar y cómo armaste la pregunta: qué entendiste, qué no y qué opciones veías. Por ejemplo: "Me pasé una hora buscando, después le escribí a mi referente con lo que había probado y en diez minutos me destrabó; desde ahí me pongo un límite de tiempo antes de preguntar". La señal que buscan es autonomía con criterio, ni heroísmo ni dependencia.',
    },
    {
      topic: 'aprendizaje',
      question: '¿Cómo aprendés una tecnología o una herramienta que nunca usaste?',
      answer:
        'Una buena respuesta muestra un método y no solo "miro tutoriales": leer la documentación oficial, hacer algo chico que funcione, aplicarlo a un caso real y pedir revisión a alguien con más experiencia. Suma mucho dar un ejemplo concreto y reciente, con cuánto tardaste y qué construiste. También vale mencionar cómo distinguís lo que necesitás saber ya de lo que podés aprender después. Lo que evalúan es curiosidad y capacidad de aprender rápido, que en junior pesa más que lo que ya sabés.',
    },
    {
      topic: 'feedback',
      question:
        'Contame de una vez que recibiste una crítica sobre tu trabajo. ¿Qué hiciste con ella?',
      answer:
        'Evalúan si podés recibir feedback sin ponerte a la defensiva y si lo convertís en un cambio concreto. La estructura ideal: qué te dijeron, cómo reaccionaste al principio (vale admitir que te costó), qué hiciste después y cómo se notó el cambio. Ejemplo: "En un code review me marcaron que mis PRs eran enormes; empecé a partirlos y el tiempo de revisión bajó de días a horas". Una mala señal es elegir una crítica que en realidad era un elogio o contar que el otro estaba equivocado.',
    },
    {
      topic: 'equipo',
      question: '¿Qué hace que un equipo funcione bien, según tu experiencia?',
      answer:
        'Una buena respuesta habla de cosas observables: objetivos claros, confianza para decir "no sé" o "me equivoqué", comunicación frecuente, acuerdos explícitos sobre cómo se trabaja y gente que se ayuda sin llevar la cuenta. Podés mencionar la seguridad psicológica como idea central y conectarla con un equipo real, de trabajo, facultad o un proyecto personal. Conviene decir qué aportás vos a eso, no solo qué esperás de los demás. Evitá las respuestas genéricas tipo "buena onda" sin ejemplo.',
    },
    {
      topic: 'ayuda',
      question: '¿Cuándo pedís ayuda y cómo lo hacés para no hacerle perder tiempo a nadie?',
      answer:
        'Lo esperable es un criterio claro: pedís ayuda cuando ya intentaste lo razonable y seguir solo cuesta más que el tiempo del otro, o antes si está en juego una fecha o producción. La forma importa: contexto breve, qué intentaste, el error exacto y qué necesitás (una pista, una revisión, una decisión). Suma mencionar canales: un mensaje asíncrono bien escrito antes que interrumpir, y documentar la respuesta para el próximo. Muestra que entendés que pedir ayuda bien es una habilidad, no una debilidad.',
    },
    {
      topic: 'errores',
      question: 'Contame de un error que cometiste trabajando y qué aprendiste.',
      answer:
        'Buscan honestidad, responsabilidad y aprendizaje, no perfección. Elegí un error real con consecuencias moderadas, contá cómo te diste cuenta, qué hiciste para arreglarlo (avisar rápido es clave), y qué cambiaste para que no se repita. Ejemplo: "Rompí un endpoint por no correr los tests; avisé en el canal, revertí y desde entonces agregué el chequeo al pre-push". Las malas señales son culpar a otros, elegir un error trivial o falsos defectos como "soy demasiado perfeccionista".',
    },
    {
      topic: 'comunicacion',
      question: '¿Cómo le explicarías un problema técnico a alguien que no es técnico?',
      answer:
        'Una buena respuesta empieza por lo que le importa a esa persona (el impacto: qué no funciona, a quién afecta, para cuándo se resuelve) y deja el detalle técnico para si lo pide. Usa analogías simples, evita la jerga y chequea que se entendió preguntando, no asumiendo. Ejemplo: en vez de "el job de sincronización falló por un timeout", decir "los pedidos de ayer no llegaron al sistema de facturación; ya lo estamos reprocesando y mañana a primera hora va a estar al día". Muestra empatía con la audiencia, no condescendencia.',
    },
    {
      topic: 'motivacion',
      question: '¿Por qué querés trabajar en este equipo o en esta empresa?',
      answer:
        'Evalúan si investigaste y si tu motivación encaja con lo que ofrecen. Una buena respuesta conecta algo concreto de la empresa (el producto, el problema que resuelve, cómo trabajan, su stack) con lo que buscás vos para crecer. Evitá respuestas que sirvan para cualquier empresa o que hablen solo del sueldo o la flexibilidad. Ejemplo: "Usé su app para X, me interesa el problema de Y y quiero trabajar en un equipo que hace code review en serio porque es donde más aprendo".',
    },
    {
      topic: 'prioridades',
      question: '¿Qué hacés si te asignan dos tareas urgentes al mismo tiempo?',
      answer:
        'Lo esperable en junior no es que decidas solo, sino que hagas visible el conflicto y pidas que se priorice con información. Una buena respuesta: entender el impacto y la fecha real de cada una, avisarle a quien corresponde (tu líder o quien asignó) y proponer un orden con la razón. Suma decir que no intentás hacer las dos a medias en silencio. Ejemplo: "Le escribí a mi líder: tengo A y B, A bloquea a un cliente y B es para el viernes, propongo A primero, ¿te parece?".',
    },
    {
      topic: 'colaboracion',
      question: 'Contame de un proyecto en equipo del que estés orgulloso y cuál fue tu aporte.',
      answer:
        'El entrevistador quiere separar lo que hizo el equipo de lo que hiciste vos. Una buena respuesta da contexto breve, aclara tu rol y cuenta dos o tres acciones concretas tuyas usando "yo" para lo tuyo y "nosotros" para lo grupal. Cerrá con el resultado y qué aprendiste trabajando con otros. Sirven proyectos de facultad, bootcamp u open source si todavía no tenés mucha experiencia laboral, siempre que haya colaboración real.',
    },
    {
      topic: 'adaptabilidad',
      question:
        'Contame de una vez que cambiaron los requisitos a mitad de camino. ¿Cómo reaccionaste?',
      answer:
        'Buscan flexibilidad sin perder el criterio. Una buena respuesta muestra que entendiste por qué cambió (preguntaste), que evaluaste el impacto sobre lo ya hecho, que lo comunicaste y que te adaptaste sin quejarte de más. Ejemplo: "A mitad del sprint cambiaron el diseño del formulario; pregunté el motivo, avisé que una parte se tiraba y ajustamos la estimación". La mala señal es frustración sin acción o aceptar el cambio sin avisar que mueve la fecha.',
    },
    {
      topic: 'remoto',
      question: '¿Qué hacés para trabajar bien en un equipo remoto?',
      answer:
        'Una buena respuesta habla de visibilidad y comunicación escrita: actualizar el estado de tus tareas sin que te lo pidan, escribir mensajes completos que se entiendan sin contexto, avisar cuando estás bloqueado y respetar los horarios de los demás. También de hábitos propios: organización del día, cámara en reuniones clave y espacios informales para generar confianza. Conviene un ejemplo de algo que te funcionó. Evalúan si vas a ser una persona fácil de seguir sin supervisión constante.',
    },
    {
      topic: 'inteligencia emocional',
      question: '¿Cómo manejás el estrés cuando una entrega se complica?',
      answer:
        'Evalúan autoconciencia y si el estrés afecta tu comunicación con el equipo. Una buena respuesta reconoce que te pasa, cuenta qué hacés para manejarlo (partir el problema, priorizar, pedir ayuda, comunicar el riesgo temprano) y da un ejemplo real. Suma decir que avisás antes de que el problema explote en lugar de después. Evitá decir que nunca te estresás o que trabajás de más todas las noches como solución.',
    },
    {
      topic: 'feedback',
      question: '¿Cómo pedís feedback sobre tu trabajo si nadie te lo da?',
      answer:
        'Una buena respuesta muestra que lo buscás activamente y de forma concreta: en vez de "¿cómo vengo?", preguntar "¿qué cambiarías de cómo resolví este PR?" o "¿qué debería mejorar para tomar tareas más grandes?". Mencioná momentos naturales: después de una entrega, en los 1:1, en las revisiones de código. Y cerrá con qué hacés con lo que te dicen: agradecer, aplicar y contar después que lo aplicaste. Muestra iniciativa y ganas de crecer, que es lo que más pesa en junior.',
    },
  ],
  'semi-senior': [
    {
      topic: 'ownership',
      question:
        'Contame de una vez que te hiciste cargo de algo que no era estrictamente tu responsabilidad.',
      answer:
        'Evalúan ownership: si ves un problema y lo resolvés o lo hacés llegar a quien corresponde, en vez de decir "no es mío". Una buena respuesta cuenta el problema, por qué nadie lo estaba atendiendo, qué hiciste (y con quién lo coordinaste para no pisar a nadie) y el resultado medible. Ejemplo: "Las alertas de un servicio sonaban todas las noches y nadie las miraba; analicé las causas, arreglé dos y propuse un responsable rotativo". La mala señal es el héroe que hace todo solo sin avisar.',
    },
    {
      topic: 'feedback',
      question: '¿Cómo le das feedback negativo a un compañero?',
      answer:
        'Una buena respuesta describe un método: en privado y pronto, sobre un hecho concreto y no sobre la persona, con el impacto que tuvo y una pregunta para entender su lado antes de proponer algo. Modelos como SBI (situación, comportamiento, impacto) sirven para ordenarlo. Ejemplo: "En la review de ayer (situación) aprobaste sin probar el flujo (comportamiento) y se rompió el checkout en staging (impacto); ¿qué pasó?". Suma cerrar con un acuerdo y hacer seguimiento.',
    },
    {
      topic: 'conflictos',
      question: 'Contame de un desacuerdo técnico fuerte con un compañero y cómo se resolvió.',
      answer:
        'Buscan ver si podés discutir ideas sin personalizar y si sabés llegar a una decisión. Una buena respuesta explica las dos posturas de forma justa (incluida la del otro), cómo bajaron la discusión a criterios concretos (rendimiento, costo, riesgo), si hicieron una prueba o pidieron otra opinión y cómo se decidió. Muy buena señal: contar que te convencieron, o que aceptaste una decisión que no compartías y la ejecutaste bien. Mala señal: que la historia termine en "tenía razón yo".',
    },
    {
      topic: 'mentoria',
      question: '¿Cómo acompañás a una persona junior que se suma al equipo?',
      answer:
        'Una buena respuesta habla de onboarding con estructura: primeras tareas chicas con valor real, un referente claro, sesiones de pair programming y reviews que explican el porqué. Importa adaptar el ritmo a la persona y generar confianza para que pregunte. Ejemplo concreto: "Le armé una lista de las primeras tres semanas, hicimos pair dos veces por semana y a la cuarta ya tomaba tickets sola". Suma mencionar que la dejás equivocarse en cosas de bajo riesgo en lugar de darle todo resuelto.',
    },
    {
      topic: 'stakeholders',
      question:
        '¿Qué hacés cuando alguien de negocio te pide algo con una fecha que sabés que no se puede cumplir?',
      answer:
        'Evalúan si sabés decir que no sin cerrar la puerta. Una buena respuesta: entender qué problema hay detrás de la fecha, explicar con datos por qué no entra todo y ofrecer opciones (menos alcance en la fecha, todo más tarde, una solución temporal). Ejemplo: "Para el lanzamiento entra el pago con tarjeta; transferencias llegan dos semanas después". La mala señal es aceptar en silencio y después llegar tarde, o un "no se puede" sin alternativas.',
    },
    {
      topic: 'influencia',
      question: 'Contame de una vez que convenciste al equipo de cambiar una forma de trabajar.',
      answer:
        'Buscan influencia basada en evidencia y no en insistencia. Una buena respuesta cuenta el problema que detectaste, cómo lo hiciste visible (datos, un ejemplo doloroso), cómo propusiste el cambio de forma chica y reversible (una prueba de dos sprints), cómo escuchaste objeciones y qué resultado tuvo. Ejemplo: introducir feature flags después de dos rollbacks, con una prueba en un servicio. Suma mencionar a quién sumaste primero como aliado.',
    },
    {
      topic: 'prioridades',
      question: '¿Cómo decidís qué hacer primero cuando todo parece urgente?',
      answer:
        'Una buena respuesta separa urgente de importante y usa criterios explícitos: impacto en usuarios o negocio, costo de demorarlo, dependencias y esfuerzo. Mencioná que lo que no podés resolver vos lo escalás con una propuesta, y que comunicás qué se posterga. Ejemplo: "Primero el bug que bloquea pagos, después lo que bloquea a otro equipo y el refactor queda para la semana que viene, avisado". Muestra que la priorización también es comunicación, no solo una lista.',
    },
    {
      topic: 'errores',
      question:
        'Contame de un incidente en producción en el que estuviste involucrado. ¿Qué hiciste durante y después?',
      answer:
        'Evalúan calma bajo presión y cultura de aprendizaje. Una buena respuesta separa el durante (comunicar, mitigar primero y entender después, coordinar con otros) del después (postmortem sin culpables, causas raíz, acciones concretas con responsable). Si el error fue tuyo, decilo sin vueltas. Ejemplo: "Una migración bloqueó una tabla; avisé, revertimos en 15 minutos y después agregamos un chequeo de locks al pipeline". Mala señal: buscar culpables o minimizar el impacto.',
    },
    {
      topic: 'colaboracion',
      question:
        '¿Cómo trabajás con diseño y producto para que lo que se construye sea lo correcto?',
      answer:
        'Una buena respuesta muestra participación temprana: sumarte al refinamiento, preguntar por el problema y la métrica antes que por la pantalla, marcar costos técnicos y proponer alternativas más simples. También cómo resolvés diferencias: con el usuario y los datos como referencia, no con jerarquías. Ejemplo: "Diseño proponía una tabla editable compleja; mostré que una edición en un modal resolvía el 90% con un tercio del esfuerzo y lo validamos con dos usuarios".',
    },
    {
      topic: 'comunicacion',
      question: '¿Cómo comunicás que una tarea tuya se va a atrasar?',
      answer:
        'Lo esperable es avisar apenas lo sabés, no el día de la entrega. Una buena respuesta incluye qué pasó, la nueva estimación con su incertidumbre, el impacto en otros y las opciones (recortar, pedir ayuda, mover la fecha). Ejemplo: "La integración con el proveedor tiene un límite de requests que no estaba documentado; necesito tres días más o podemos salir con una cola simple". Muestra que entendés que una mala noticia temprana es mucho más barata que una tarde.',
    },
    {
      topic: 'feedback',
      question: '¿Qué hacés si recibís feedback que te parece injusto?',
      answer:
        'Evalúan madurez emocional. Una buena respuesta: no responder en caliente, agradecer, pedir ejemplos concretos para entender, separar la parte con la que estás de acuerdo y conversar con datos la que no. Muchas veces el feedback injusto en la forma tiene algo cierto en el fondo, y reconocerlo suma. Si después de conversar seguís sin acuerdo, podés pedir una tercera mirada o volver al tema más adelante con hechos nuevos.',
    },
    {
      topic: 'decisiones',
      question: 'Contame de una decisión que tuviste que tomar sin tener toda la información.',
      answer:
        'Buscan ver si podés avanzar con ambigüedad sin ser imprudente. Una buena respuesta explica qué sabías, qué no, cuánto costaba esperar, qué supuestos tomaste y cómo hiciste la decisión reversible o la acotaste. Ejemplo: "No sabíamos si el volumen iba a crecer; elegimos la opción simple, dejamos una métrica y un umbral para revisarla y a los tres meses la cambiamos con datos". Suma distinguir decisiones de una vía (difíciles de revertir) y de dos vías.',
    },
    {
      topic: 'negociacion',
      question: '¿Cómo negociás el alcance de una funcionalidad con producto?',
      answer:
        'Una buena respuesta parte del objetivo compartido: ¿qué problema resuelve y cómo sabemos que lo resolvimos? Desde ahí se ofrecen cortes: qué es imprescindible para validar, qué puede esperar y qué tiene un costo técnico desproporcionado. Ejemplo: proponer una primera versión sin filtros avanzados para medir el uso real antes de construirlos. La mala señal es plantearlo como una pelea entre lo que quiere producto y lo que quiere ingeniería.',
    },
    {
      topic: 'ownership',
      question: '¿Qué significa para vos que una tarea esté terminada?',
      answer:
        'Evalúan si pensás más allá del merge. Una buena respuesta incluye que funcione en producción, que tenga tests, que esté monitoreada, documentada lo necesario y que la persona que la pidió confirme que resuelve el problema. Suma mencionar que mirás las métricas o los errores después del deploy. Ejemplo: "Lo doy por terminado cuando lo vi andar en producción y revisé los logs del primer día".',
    },
    {
      topic: 'conflictos',
      question: '¿Qué hacés si un compañero no está cumpliendo con su parte y eso te afecta?',
      answer:
        'Una buena respuesta empieza por hablar directamente con la persona, con curiosidad y sin acusar: puede haber un bloqueo, una prioridad distinta o algo personal. Después buscan un acuerdo concreto y, si el problema sigue y afecta al equipo, lo llevás al líder con hechos, no con quejas. Ejemplo: "Le pregunté cómo venía con la API; estaba tapado con soporte, lo hablamos con el líder y se repartió el trabajo". Mala señal: ir directo al líder o resolverlo haciendo su trabajo en silencio.',
    },
  ],
  senior: [
    {
      topic: 'liderazgo',
      question:
        'Contame de una iniciativa que lideraste sin tener autoridad formal sobre las personas involucradas.',
      answer:
        'Es la pregunta clásica de senior: buscan influencia, no jerarquía. Una buena respuesta muestra cómo definiste el problema y el porqué, cómo conseguiste apoyo (aliados, sponsors, datos), cómo coordinaste a varios equipos con objetivos distintos y cómo manejaste a quienes se resistían. Ejemplo: "Lideré la migración a un sistema de diseño común entre cuatro equipos: armé un RFC, conseguí un sponsor, migramos un equipo piloto y con esos números se sumaron los demás". Cerrá con impacto medible y lo que harías distinto.',
    },
    {
      topic: 'conversaciones dificiles',
      question: 'Contame de una conversación difícil que tuviste que tener con alguien del equipo.',
      answer:
        'Evalúan si encarás los problemas en vez de evitarlos y si lo hacés con cuidado. Una buena respuesta cuenta cómo te preparaste (hechos concretos, objetivo de la charla), cómo la abriste, cómo escuchaste y qué acuerdo salió, más el seguimiento. Ejemplo: hablar con un senior cuyo tono en las reviews estaba haciendo que los juniors no pidieran revisión. Suma admitir qué te costó y qué aprendiste de la reacción del otro.',
    },
    {
      topic: 'influencia',
      question: '¿Cómo lográs que otro equipo priorice algo que tu equipo necesita?',
      answer:
        'Una buena respuesta muestra que entendés los incentivos del otro equipo: qué objetivos tiene y cómo tu pedido los ayuda o al menos no los perjudica. Después: hacer el pedido concreto y fácil de aceptar (ofrecer hacer parte del trabajo, un PR, una propuesta de diseño), y escalar solo con una propuesta clara si hay un conflicto real de prioridades. Ejemplo: "Les ofrecimos implementar el endpoint nosotros con su review, y lo sacamos en una semana en vez de esperar un trimestre".',
    },
    {
      topic: 'cultura',
      question: '¿Qué hiciste para mejorar la cultura o las prácticas de un equipo?',
      answer:
        'Buscan que eleves el nivel del equipo, no solo tu output. Una buena respuesta cuenta un cambio concreto (postmortems sin culpables, estándares de review, documentación de decisiones, un ritual de demos), cómo lo empezaste por el ejemplo, cómo lo sostuviste y cómo mediste su efecto. Ejemplo: "Empecé a escribir ADRs de mis decisiones; a los dos meses el equipo los usaba y las discusiones repetidas bajaron". Muestra que la cultura se construye con comportamientos repetidos, no con un documento.',
    },
    {
      topic: 'estrategia',
      question:
        '¿Cómo equilibrás deuda técnica y entrega de funcionalidades cuando negociás con negocio?',
      answer:
        'Una buena respuesta traduce la deuda técnica a impacto de negocio: incidentes, velocidad que se pierde, riesgo de seguridad, costo de incorporar gente. Propone mecanismos sostenibles (un porcentaje fijo de capacidad, pagar deuda cuando se toca esa zona) en vez de grandes reescrituras. Ejemplo: "Mostré que el 30% de los bugs venían del módulo de facturación y negociamos dos sprints para reescribirlo, con un objetivo de reducción medible". La mala señal es pedir tiempo para refactorizar sin explicar el beneficio.',
    },
    {
      topic: 'mentoria',
      question: '¿Cómo ayudás a una persona semi-senior a dar el salto a senior?',
      answer:
        'Una buena respuesta habla de darle oportunidades con red: liderar una iniciativa chica, presentar una decisión, ser responsable de un área, y acompañarla con feedback específico. Importa explicar qué diferencia a un senior (alcance, ambigüedad, influencia) y armar un plan con objetivos observables. Ejemplo: "Le delegué el diseño de un servicio nuevo, revisamos el documento juntos y presentó ella en la reunión de arquitectura". Suma mencionar que también le das visibilidad frente a quien decide las promociones.',
    },
    {
      topic: 'stakeholders',
      question: 'Contame de una vez que tuviste que manejar stakeholders con intereses opuestos.',
      answer:
        'Evalúan si podés navegar la política sin perder transparencia. Una buena respuesta explica qué quería cada parte y por qué, cómo hiciste explícito el conflicto, cómo armaste opciones con sus costos y quién tomó la decisión. Ejemplo: ventas quería una funcionalidad a medida para un cliente grande y producto quería mantener el roadmap; propusiste una solución configurable y escalaste la decisión con números. Mala señal: decirle a cada uno lo que quería escuchar.',
    },
    {
      topic: 'decir que no',
      question: '¿Cuándo dijiste que no a un pedido de alguien con más jerarquía que vos?',
      answer:
        'Buscan coraje con criterio. Una buena respuesta muestra que entendiste el objetivo detrás del pedido, que explicaste los riesgos con datos, que ofreciste una alternativa y que, si al final la decisión se mantuvo, la ejecutaste dejando registro de los riesgos. Ejemplo: "El CTO quería lanzar sin pruebas de carga para el Black Friday; propuse una prueba reducida de un día que encontró un cuello de botella". Suma distinguir cuándo hay que escalar (seguridad, legal, ética) y cuándo alcanza con dejarlo asentado.',
    },
    {
      topic: 'fracaso',
      question: 'Contame de un proyecto que fracasó o no salió como esperabas. ¿Cuál fue tu parte?',
      answer:
        'Evalúan responsabilidad y aprendizaje a nivel sistémico. Una buena respuesta elige un fracaso real con impacto, asume su parte sin repartir culpas, analiza las causas (incluidas las de proceso y comunicación) y cuenta qué cambió después, tanto en vos como en la organización. Ejemplo: una reescritura que se canceló a los seis meses por no entregar valor incremental; aprendiste a planificar migraciones por partes. Mala señal: un fracaso que en realidad fue culpa de otros.',
    },
    {
      topic: 'cultura',
      question: '¿Qué diferencia hay entre culture fit y culture add, y cuál buscás al contratar?',
      answer:
        'Culture fit es que la persona comparta los valores y la forma de trabajar del equipo; culture add es que, además, aporte algo que falta: otra experiencia, otra mirada, otra forma de resolver. Una buena respuesta advierte que buscar solo fit termina en equipos homogéneos que se parecen al que entrevista, y que lo sano es exigir valores compartidos (honestidad, colaboración, ownership) y valorar las diferencias en lo demás. Suma un ejemplo de alguien distinto que mejoró al equipo y de cómo cambiaste las entrevistas para evaluarlo.',
    },
    {
      topic: 'decisiones',
      question:
        '¿Cómo tomás una decisión técnica importante cuando el equipo no se pone de acuerdo?',
      answer:
        'Una buena respuesta describe un proceso: dejar claro quién decide y para cuándo, escribir las opciones con criterios explícitos, escuchar a todos (incluso por escrito para que no gane el que habla más fuerte), decidir y comunicar el razonamiento. El principio "disagree and commit" ayuda: se discute fuerte antes, se ejecuta junto después. Ejemplo: un ADR con tres opciones y una revisión a los tres meses. Suma mencionar que las decisiones reversibles no necesitan consenso total.',
    },
    {
      topic: 'presion',
      question:
        'Contame de una vez que el equipo estuvo bajo mucha presión. ¿Qué hiciste como referente?',
      answer:
        'Evalúan si protegés al equipo y mantenés el foco. Una buena respuesta cuenta cómo aclaraste prioridades y cortaste lo no esencial, cómo filtraste el ruido de afuera, cómo cuidaste la carga de las personas y cómo comunicaste el estado a los stakeholders. Ejemplo: "Antes de un lanzamiento con fecha legal, recortamos tres funcionalidades, puse un único canal para pedidos y roté las guardias". Suma reflexionar sobre cómo evitar que se repita.',
    },
    {
      topic: 'comunicacion',
      question: '¿Cómo adaptás un mensaje técnico para ejecutivos?',
      answer:
        'Una buena respuesta empieza por la conclusión y lo que necesitás de ellos (una decisión, un presupuesto, saber un riesgo), sigue con el impacto en el negocio en sus términos (dinero, clientes, tiempo, riesgo) y deja el detalle técnico como respaldo. Mensajes cortos, con opciones y una recomendación. Ejemplo: "Recomiendo invertir dos meses en migrar la base: hoy cada caída cuesta X y tuvimos tres este trimestre; la alternativa es aceptar ese riesgo". Mala señal: arrancar por la arquitectura.',
    },
    {
      topic: 'liderazgo',
      question: '¿Qué significa para vos subir la vara (raise the bar) en un equipo?',
      answer:
        'Una buena respuesta lo baja a comportamientos: revisiones de código que enseñan, estándares explícitos de calidad, diseño escrito antes de lo grande, postmortems serios y contrataciones de gente que mejore el promedio. También dar el ejemplo en tu propio trabajo y hacerle feedback directo a quien está por debajo del estándar. Ejemplo: "Introduje una plantilla de diseño técnico y empecé a pedirla en todo lo que tardara más de una semana". Mala señal: confundirlo con exigencia o perfeccionismo que frena la entrega.',
    },
    {
      topic: 'adaptabilidad',
      question:
        'Contame de un cambio organizacional grande que te tocó atravesar y cómo acompañaste al equipo.',
      answer:
        'Evalúan liderazgo en contextos de incertidumbre: reestructuras, cambios de estrategia, despidos, fusiones. Una buena respuesta cuenta cómo te informaste, qué comunicaste con honestidad (lo que se sabe, lo que no y cuándo se va a saber), cómo escuchaste preocupaciones y cómo mantuviste el foco en lo que el equipo podía controlar. Ejemplo: un cambio de producto a mitad de año; reorganizaste el roadmap con el equipo y redujiste la incertidumbre con reuniones cortas semanales. Mala señal: transmitir rumores o fingir un optimismo que nadie cree.',
    },
  ],
};
