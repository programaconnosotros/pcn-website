import type { InterviewGuide } from './types';

export const softSkillsGuide: InterviewGuide = {
  track: 'soft-skills',
  summary:
    'Cómo prepararte para entrevistas de soft skills y liderazgo en software: método STAR, comunicación, feedback, conflictos, ownership e influencia, de junior a senior.',
  sections: [
    {
      id: 'rol-y-entrevista',
      title: 'El rol y cómo es la entrevista',
      body: [
        'Las entrevistas de soft skills evalúan cómo trabajás con otras personas, no qué sabés de una tecnología: cómo te comunicás, cómo recibís y das feedback, qué hacés en un conflicto, cómo te hacés cargo de tus errores y cómo influís en decisiones. Aplican a cualquier rol de software (desarrollo, QA, diseño, liderazgo) y muchas veces pesan tanto como la entrevista técnica: un candidato técnicamente fuerte que no sabe colaborar suele quedar afuera.',
        'Hay varios formatos. Las preguntas de comportamiento ("contame de una vez que...") piden experiencias reales, bajo la idea de que el comportamiento pasado predice el futuro. Las situacionales ("¿qué harías si...?") plantean un escenario hipotético. Las de culture fit o culture add exploran tus valores y forma de trabajar. Algunas empresas suman un bar raiser, una persona de otro equipo que entrevista para asegurar que cada contratación mejore el promedio y que puede vetar aunque el equipo quiera contratarte.',
        'En junior se espera comunicación clara, ganas de aprender, saber pedir ayuda, recibir feedback sin ponerse a la defensiva y trabajar bien en equipo. En semi-senior, ownership de punta a punta, dar feedback, resolver conflictos, acompañar a juniors e influir en decisiones del equipo. En senior, liderar sin autoridad formal, influir entre equipos, tener conversaciones difíciles, subir la vara, pensar en estrategia y construir cultura. La misma pregunta se evalúa distinto según el nivel: el alcance de tus ejemplos tiene que coincidir con el puesto.',
        'Los errores más comunes son responder en hipotético cuando te piden un caso real, hablar todo el tiempo en "nosotros" sin que se entienda qué hiciste vos, elegir historias sin conflicto ni dificultad, culpar a otros y no tener ejemplos preparados. Este tipo de entrevista se prepara igual que una técnica: con práctica en voz alta.',
      ],
      checklist: [
        {
          text: 'Explicar qué evalúa una entrevista de soft skills y por qué importa',
          explanation:
            'Evalúa comportamientos observables en el trabajo con otros: comunicación, colaboración, manejo de conflictos, feedback, ownership, adaptabilidad y liderazgo. Importa porque la mayoría de los problemas de los equipos de software no son técnicos sino de coordinación, expectativas y confianza. Un entrevistador que pregunta "contame de un desacuerdo con un compañero" no quiere saber quién tenía razón, sino cómo manejaste la tensión y si llegaron a una decisión. Ejemplo: dos candidatos resuelven igual el ejercicio técnico, pero uno cuenta que aceptó una decisión que no compartía y la ejecutó bien; ese suele ganar. El error común es tomarla como una charla informal y no prepararla.',
        },
        {
          text: 'Diferenciar preguntas de comportamiento, situacionales, de culture fit y la ronda de bar raiser',
          explanation:
            'Las de comportamiento piden un hecho real del pasado ("contame de una vez que...") y se responden con STAR. Las situacionales plantean un hipotético ("¿qué harías si un compañero no cumple?") y se responden con un criterio claro, idealmente respaldado por algo que ya te pasó. Las de culture fit o add exploran valores: por qué querés este equipo, cómo te gusta trabajar, qué te frustra. El bar raiser es un entrevistador ajeno al equipo que evalúa si subís el nivel promedio y suele repreguntar mucho para ver profundidad. Ejemplo: ante "¿qué harías si te piden una fecha imposible?", lo mejor es responder el criterio y agregar "de hecho me pasó en..." con un caso real. El error común es responder una pregunta de comportamiento con un hipotético, que se lee como falta de experiencia.',
        },
        {
          text: 'Saber qué se espera de vos según tu seniority',
          explanation:
            'En junior se espera que aprendas rápido, preguntes a tiempo, recibas feedback con apertura y colabores; tus ejemplos pueden ser de facultad, bootcamp o proyectos personales. En semi-senior se espera ownership de tareas completas, dar feedback a pares, resolver conflictos sin escalar todo, acompañar a juniors y proponer mejoras al equipo. En senior se espera influencia sin autoridad entre equipos, conversaciones difíciles, decisiones con ambigüedad, mentoría que hace crecer a otros y construcción de cultura. Ejemplo: "lideré una mejora" en junior puede ser proponer un linter; en senior tiene que ser algo que cambió cómo trabajan varios equipos. El error común es usar historias de un nivel inferior al puesto al que aplicás.',
        },
        {
          text: 'Reconocer las señales que busca el entrevistador en cada respuesta',
          explanation:
            'Las señales positivas más comunes son: responsabilidad propia ("yo hice", "me equivoqué"), empatía con la otra parte, foco en el resultado, aprendizaje explícito, y datos concretos en vez de generalidades. Las negativas son culpar a otros, hablar mal de empleos anteriores, historias sin conflicto real, "nosotros" todo el tiempo y respuestas ensayadas que no aguantan una repregunta. Muchas empresas usan una grilla con competencias (por ejemplo ownership, comunicación, colaboración) y puntúan cada historia contra ella. Ejemplo: si contás un conflicto y terminás con "al final se dio cuenta de que yo tenía razón", perdés puntos de colaboración aunque el resultado haya sido bueno. El error común es optimizar para quedar bien en vez de para mostrar cómo pensás.',
        },
        {
          text: 'Evitar los errores más comunes de estas entrevistas',
          explanation:
            'Primero, no tener historias preparadas y improvisar, lo que lleva a respuestas largas y vagas. Segundo, elegir ejemplos sin tensión ("nunca tuve un conflicto"), que suenan a falta de experiencia o de honestidad. Tercero, usar "nosotros" para todo, que no deja ver tu aporte. Cuarto, hablar mal de jefes o compañeros anteriores, que es una de las señales más negativas posibles. Quinto, no cerrar con un resultado ni un aprendizaje. Ejemplo: en vez de "en mi equipo siempre hubo buena onda", contá un desacuerdo concreto y cómo se resolvió. La solución a casi todos estos errores es la misma: un banco de historias preparado con STAR y practicado en voz alta.',
        },
      ],
    },
    {
      id: 'metodo-star',
      title: 'El método STAR y tu banco de historias',
      body: [
        'STAR es la estructura estándar para responder preguntas de comportamiento: situación (contexto breve), tarea (qué te tocaba a vos y por qué era difícil), acción (lo que hiciste, en primera persona y con detalle) y resultado (qué pasó, idealmente con un número, y qué aprendiste). Una respuesta bien armada dura entre dos y tres minutos y dedica más de la mitad a la acción.',
        'La clave de la preparación es tener un banco de 6 a 8 historias reales que puedas adaptar a muchas preguntas. Cada historia cubre varias competencias a la vez: un incidente en producción sirve para "un error", "trabajar bajo presión" y "ownership"; un desacuerdo técnico sirve para "conflicto", "influencia" y "decisiones con ambigüedad". Con ocho historias bien elegidas cubrís casi cualquier pregunta.',
        'Un buen banco incluye: un éxito del que estés orgulloso, un error o fracaso, un conflicto con una persona, un caso de feedback (dado o recibido), una situación de presión o prioridades en conflicto, un caso de influencia o liderazgo, un cambio o ambigüedad, y un caso de ayudar a otro a crecer. Escribí cada una en cuatro o cinco viñetas, no en prosa, para no memorizarlas palabra por palabra.',
        'Practicá en voz alta, cronometrando, y pedile a alguien que te repregunte: "¿qué hiciste vos exactamente?", "¿qué harías distinto?", "¿cómo lo mediste?". Las repreguntas son donde se nota si la historia es real y si entendés tu propio rol. Una variante útil es STAR-L, que agrega explícitamente el aprendizaje (learning) al final.',
      ],
      checklist: [
        {
          text: 'Estructurar una respuesta con STAR y repartir bien el tiempo',
          explanation:
            'Situación: dos o tres oraciones de contexto (empresa, equipo, qué estaba pasando). Tarea: cuál era tu responsabilidad y qué la hacía difícil. Acción: lo que hiciste vos, paso a paso, con decisiones y razones; es lo que más se evalúa y debería ocupar más de la mitad. Resultado: qué pasó, con un dato si es posible, y qué aprendiste. Ejemplo: "Teníamos un checkout con 3% de errores (S); me asignaron reducirlo antes del Hot Sale (T); agregué logs, encontré que el 80% venía de un timeout con el proveedor, implementé reintentos y una cola (A); bajó a 0,4% y no tuvimos caídas en el evento (R)". El error común es pasar dos minutos en la situación y despachar la acción en una frase.',
        },
        {
          text: 'Armar un banco de 6 a 8 historias que cubran las competencias clave',
          explanation:
            'Listá tus últimos dos o tres años de trabajo y anotá momentos con tensión: incidentes, desacuerdos, entregas difíciles, cambios, personas que ayudaste, errores propios. Elegí las 6 a 8 más ricas y armá una tabla: cada historia en una fila y las competencias (conflicto, error, feedback, influencia, presión, ambigüedad, éxito, mentoría) en columnas, marcando cuáles cubre. Si una columna queda vacía, buscá otra historia. Ejemplo: una migración que se complicó puede cubrir presión, ambigüedad y comunicación con stakeholders. El error común es tener una sola historia buena y forzarla para todas las preguntas, cosa que el entrevistador nota enseguida.',
        },
        {
          text: 'Hablar en primera persona sin quitarle mérito al equipo',
          explanation:
            'El entrevistador te evalúa a vos, así que necesita saber qué hiciste vos. Usá "nosotros" para el contexto y los logros del equipo, y "yo" para tus decisiones y acciones. No es arrogancia: es precisión. Ejemplo: "El equipo tenía que migrar la base; yo me encargué del plan de rollback y de coordinar con soporte, y propuse hacer la migración en dos etapas". Si en algo tu papel fue chico, decilo, porque la honestidad suma. El error común es contar una historia excelente del equipo donde no queda claro si vos hiciste algo.',
        },
        {
          text: 'Cerrar con un resultado medible y un aprendizaje',
          explanation:
            'Un resultado concreto le da credibilidad a la historia: porcentajes, tiempos, dinero, incidentes, satisfacción del cliente, o un hecho verificable como "el proceso lo adoptaron los otros dos equipos". Si no hay números, describí el cambio observable. Después agregá qué aprendiste o qué harías distinto, que muestra capacidad de reflexión. Ejemplo: "El tiempo de review bajó de tres días a uno; lo que haría distinto es involucrar antes a QA, porque al principio les cambiamos el proceso sin avisar". El error común es terminar en la acción ("y bueno, eso hice") sin resultado ni reflexión, o inventar números que después no podés sostener.',
        },
        {
          text: 'Prepararte para las repreguntas',
          explanation:
            'Los buenos entrevistadores repreguntan para validar la historia y para ver profundidad: "¿por qué elegiste eso?", "¿qué opinaba el otro?", "¿qué alternativas consideraste?", "¿qué pasó después?", "¿qué harías distinto hoy?". Para cada historia de tu banco, anotá dos o tres de esas respuestas antes de la entrevista. Practicá con alguien que te interrumpa y te pida más detalle. Ejemplo: si contás que convenciste al equipo de adoptar feature flags, prepará qué objeciones hubo y quién se resistía. El error común es tener una versión pulida de dos minutos que se desarma ante la primera pregunta concreta.',
        },
      ],
    },
    {
      id: 'comunicacion',
      title: 'Comunicación con perfiles técnicos y no técnicos',
      body: [
        'La comunicación es la competencia que aparece en todas las demás. En software implica escribir bien (tickets, PRs, documentos, mensajes asíncronos), explicar en reuniones, escuchar y adaptar el mensaje a la audiencia. En entrevistas te la evalúan dos veces: con preguntas específicas y con la forma en que respondés todo lo demás.',
        'Con personas no técnicas, lo importante es empezar por el impacto y lo que necesitan saber o decidir, evitar la jerga y chequear que se entendió. Con ejecutivos, conclusión primero, opciones con su costo y una recomendación. Con pares técnicos, contexto suficiente para que alguien que no estuvo en la conversación entienda la decisión.',
        'Las malas noticias se comunican temprano, con hechos, impacto y opciones. Una mala noticia el lunes con un plan vale mucho más que la misma noticia el viernes sin plan. Es una de las preguntas más frecuentes en todos los niveles: "¿cómo avisás que algo se atrasa?".',
        'Escuchar también es comunicar: hacer preguntas abiertas, parafrasear para confirmar y no interrumpir. En senior se suma la comunicación escrita a escala: RFCs, documentos de diseño y actualizaciones para varios equipos que tienen que funcionar sin que estés presente.',
      ],
      checklist: [
        {
          text: 'Explicar un problema técnico a alguien no técnico',
          explanation:
            'Empezá por lo que a esa persona le importa: qué está pasando en sus términos, a quién afecta, qué se está haciendo y cuándo se resuelve. El detalle técnico va después, solo si lo pide. Usá analogías simples y verificá que se entendió con una pregunta ("¿te sirve así o necesitás más detalle para hablar con el cliente?"). Ejemplo: en vez de "tenemos un memory leak en el worker", decir "el sistema que procesa los envíos se vuelve lento después de unas horas; mientras lo arreglamos lo reiniciamos dos veces por día, así que los envíos salen con hasta una hora de demora". El error común es sobreexplicar o, al revés, simplificar tanto que la persona no puede tomar decisiones.',
        },
        {
          text: 'Comunicar una mala noticia o un atraso',
          explanation:
            'Avisá apenas lo sabés, aunque no tengas toda la información. Estructura: qué pasó, el impacto (en fechas, usuarios, otros equipos), qué estás haciendo y las opciones con su costo, más una recomendación. Ejemplo: "La integración con el banco no va a estar el 15: su sandbox no soporta reembolsos. Opciones: salir el 15 sin reembolsos y hacerlos manuales una semana, o salir el 22 completo. Recomiendo la primera". Hacerlo por escrito deja registro y le permite a la otra persona procesar antes de hablar. El error común es esperar a tener la solución para avisar, lo que convierte un problema chico en una crisis de confianza.',
        },
        {
          text: 'Escribir mensajes asíncronos que se entiendan sin contexto',
          explanation:
            'Un buen mensaje asíncrono se puede leer y responder sin una reunión. Incluye: contexto breve, la pregunta o el pedido concreto, lo que ya intentaste o sabés, y para cuándo lo necesitás. Si hay una decisión, poné las opciones numeradas para que la respuesta sea "voy con la 2". Ejemplo: en vez de "hola, ¿tenés un minuto?", escribir "Hola, el deploy de pagos falla en staging con un error de permisos en S3 (adjunto log); ¿el rol cambió esta semana? Lo necesito para mañana". En equipos remotos esto se evalúa mucho. El error común es el "hola" solo, que obliga a una conversación entera para saber qué necesitás.',
        },
        {
          text: 'Adaptar el mensaje a ejecutivos',
          explanation:
            'Los ejecutivos tienen poco tiempo y deciden sobre negocio, así que el mensaje va al revés que un informe técnico: primero la conclusión y lo que necesitás de ellos, después el impacto en dinero, clientes, tiempo o riesgo, y por último el detalle como respaldo. Siempre con opciones y una recomendación. Ejemplo: "Necesito aprobar dos meses de trabajo para cambiar el proveedor de pagos: el actual nos cobra 30% más y tuvo tres caídas este trimestre. Si no lo hacemos, el riesgo es perder ventas en temporada alta". Preparate para que te corten a los treinta segundos y pregunten. El error común es arrancar por la arquitectura y no llegar nunca al pedido.',
        },
        {
          text: 'Mostrar escucha activa en una conversación',
          explanation:
            'Escuchar activamente es entender antes de responder: preguntas abiertas ("¿qué te preocupa de este cambio?"), parafrasear para confirmar ("entonces lo que te preocupa es el soporte, no la fecha, ¿es así?") y no interrumpir para defender tu idea. Sirve para destrabar conflictos, porque muchas discusiones son malentendidos sobre qué problema se está resolviendo. En la entrevista se nota cuando contás que cambiaste tu propuesta después de escuchar al otro. Ejemplo: diseño rechazaba una solución técnica y al preguntar descubriste que el problema real era la accesibilidad, que se resolvía fácil. El error común es confundir escuchar con esperar tu turno para hablar.',
        },
      ],
    },
    {
      id: 'feedback',
      title: 'Dar y recibir feedback',
      body: [
        'El feedback es cómo un equipo mejora: sin él, los problemas se repiten y las personas no crecen. En entrevistas preguntan las dos direcciones: cómo recibís críticas (en todos los niveles) y cómo das feedback a otros (desde semi-senior, y en senior también hacia arriba, a tu líder o a otros equipos).',
        'Para dar feedback sirve el modelo SBI: situación (cuándo y dónde), comportamiento (lo observable, no un juicio sobre la persona) e impacto (qué consecuencia tuvo). Después, una pregunta para entender el otro lado y un acuerdo. Se da pronto, en privado si es correctivo, y también vale para el feedback positivo, que mucha gente olvida dar con la misma precisión.',
        'Para recibir feedback lo esencial es no defenderte en el momento: agradecer, pedir ejemplos, separar lo que es cierto de lo que no y actuar. Contar en la entrevista que algo te costó escuchar y aun así lo usaste es una de las señales más valoradas.',
        'En senior se espera que generes una cultura donde el feedback circule: reviews de código que enseñan, retrospectivas útiles, pedir feedback públicamente para dar el ejemplo y dar feedback difícil a personas con más experiencia o jerarquía.',
      ],
      checklist: [
        {
          text: 'Dar feedback correctivo con el modelo SBI',
          explanation:
            'SBI ordena el feedback en situación, comportamiento e impacto, y evita los juicios sobre la persona. Situación: "en la daily de ayer". Comportamiento: "interrumpiste dos veces a Sofi mientras explicaba el bloqueo". Impacto: "no llegó a contar lo que necesitaba y hoy sigue trabada". Después preguntá su mirada ("¿cómo lo viste vos?") y acordá algo concreto. Hacelo pronto y en privado, porque una semana después pierde fuerza y en público humilla. El error común es el "sándwich" (elogio, crítica, elogio), que diluye el mensaje y hace que la persona desconfíe de los elogios.',
        },
        {
          text: 'Recibir una crítica sin ponerte a la defensiva',
          explanation:
            'La reacción inicial importa: escuchar hasta el final, agradecer y pedir un ejemplo concreto si no queda claro ("¿me podés dar un caso para entender mejor?"). No hace falta estar de acuerdo en el momento; podés decir "dejame pensarlo y lo retomamos". Después separá qué parte es cierta, actuá sobre esa y contale a la persona qué cambiaste. Ejemplo para la entrevista: "Mi líder me dijo que mis estimaciones eran muy optimistas; me molestó, pero revisé los últimos sprints y tenía razón, empecé a agregar margen para integraciones y mis entregas se volvieron predecibles". El error común es contar un feedback que en realidad era un elogio disfrazado.',
        },
        {
          text: 'Dar feedback a alguien con más experiencia o jerarquía',
          explanation:
            'Se puede y se espera, sobre todo en senior. La clave es pedir permiso o elegir un buen momento, hablar de hechos e impacto en el equipo o el objetivo, y plantearlo como información útil, no como reproche. Ejemplo: "¿Te puedo dar un feedback sobre la planning? Cuando cambiaste las prioridades al final, el equipo se quedó sin tiempo para estimar y dos historias se fueron al próximo sprint; ¿podemos acordar los cambios antes?". Funciona mejor si ya hay una relación de confianza construida. El error común es no decir nada y quejarse con otros, o hacerlo en público.',
        },
        {
          text: 'Hacer code reviews que sirvan de feedback',
          explanation:
            'Una buena review distingue lo bloqueante de lo opcional (por ejemplo con prefijos como "nit:" para detalles), explica el porqué de cada comentario y sugiere en vez de ordenar. También reconoce lo que está bien hecho. Para cambios grandes o discusiones largas, una llamada corta ahorra diez comentarios. Ejemplo: "Esto podría fallar si el usuario no tiene dirección (bloqueante); ¿qué te parece validar antes? Nit: el nombre `data` podría ser más específico". En entrevistas de semi-senior y senior es común que pregunten cómo hacés reviews. El error común es usar la review para imponer preferencias personales o dejar comentarios secos que desmotivan a los juniors.',
        },
        {
          text: 'Construir una cultura donde el feedback circule',
          explanation:
            'El feedback fluye cuando es frecuente, específico y seguro. Prácticas concretas: pedir feedback vos primero y en público ("¿qué haría mejor la próxima?"), agradecer cuando te lo dan, hacer retrospectivas con acciones que se cumplen, 1:1 regulares y celebrar errores reportados temprano. Ejemplo: después de un lanzamiento, abriste la retro contando tu propio error, y eso habilitó que otros hablaran con honestidad. La seguridad psicológica es la base: si equivocarse se castiga, nadie va a dar ni pedir feedback real. El error común es creer que con un formulario de evaluación anual alcanza.',
        },
      ],
    },
    {
      id: 'conflictos-y-negociacion',
      title: 'Conflictos, negociación y saber decir que no',
      body: [
        'Los conflictos son inevitables en cualquier equipo y no son malos en sí: un desacuerdo técnico bien llevado produce mejores decisiones. Lo que evalúan es cómo los manejás: si los encarás o los evitás, si separás a la persona del problema y si llegan a una decisión que todos puedan ejecutar.',
        'Para resolver un conflicto sirve volver al objetivo compartido, entender los intereses detrás de las posturas (qué le preocupa al otro de verdad), bajar la discusión a criterios concretos y, si no hay acuerdo, saber quién decide. Principios como "disagree and commit" permiten avanzar: se discute fuerte antes y se ejecuta juntos después.',
        'Negociar en software suele ser negociar alcance, fechas y calidad con producto, negocio u otros equipos. Saber decir que no es parte de eso: un "no" bien dado entiende el objetivo, explica el costo y ofrece alternativas. Un "sí" a todo termina en entregas tardías, calidad baja y pérdida de confianza.',
        'En senior se suman conflictos entre equipos, con stakeholders de intereses opuestos o con personas de más jerarquía, y saber cuándo escalar: escalar no es fracasar si se hace con una propuesta y después de intentar resolverlo directamente.',
      ],
      checklist: [
        {
          text: 'Contar un conflicto con un compañero de forma equilibrada',
          explanation:
            'Una buena historia de conflicto presenta la postura del otro con justicia, como si él la estuviera contando. Explicá qué estaba en juego, cómo buscaron entender los intereses de cada uno, cómo bajaron la discusión a criterios (rendimiento, plazos, riesgo) y cómo se decidió. Ejemplo: "Lucas quería usar una cola de mensajes y yo un cron simple; su preocupación real era perder eventos. Acordamos el cron con reintentos y una alerta, y una revisión en tres meses". Muy buena señal: contar que te convencieron o que cediste. El error común es una historia donde el otro es irracional y vos el héroe, que hace dudar de tu capacidad de colaborar.',
        },
        {
          text: 'Aplicar "disagree and commit"',
          explanation:
            'Significa que podés estar en desacuerdo con una decisión, decirlo con argumentos mientras se discute y, una vez tomada, ejecutarla con el mismo compromiso que si fuera tuya. Evita dos problemas: discusiones eternas y sabotaje pasivo ("ya dije que esto no iba a funcionar"). Requiere que esté claro quién decide y que tu desacuerdo haya sido escuchado. Ejemplo: no estabas de acuerdo con usar un framework nuevo, lo dijiste en el RFC, se eligió igual, y fuiste quien escribió la guía de buenas prácticas. El error común es interpretarlo como callarse: el desacuerdo se expresa, primero y con fuerza.',
        },
        {
          text: 'Negociar alcance y fechas con negocio o producto',
          explanation:
            'Empezá por el objetivo compartido: qué problema se resuelve y qué tiene que pasar en esa fecha. Desde ahí ofrecé opciones concretas con su costo: menos alcance en la fecha, todo más tarde, una solución temporal o más gente con su riesgo. Usá datos (estimaciones, velocidad del equipo, riesgos conocidos) y no posiciones. Ejemplo: "Para la feria del 10 podemos tener el registro y el pago; el panel de reportes lo sacamos el 24. ¿Lo que necesitan en la feria es vender o mostrar reportes?". El error común es plantearlo como una pelea de ingeniería contra negocio en vez de un problema común con restricciones.',
        },
        {
          text: 'Decir que no sin cerrar la puerta',
          explanation:
            'Un buen "no" tiene cuatro partes: reconocer el pedido y su objetivo, explicar por qué no se puede ahora (costo, riesgo, prioridades), ofrecer una alternativa y dejar claro qué haría falta para que fuera un sí. Ejemplo: "Entiendo que el cliente lo necesita; este sprint estamos con el cierre de seguridad que vence el 30. Puedo darte una solución manual esta semana o lo priorizamos para el próximo sprint si lo charlamos con producto". Con alguien de más jerarquía, explicá riesgos con datos y, si la decisión se mantiene, dejala asentada. El error común es decir que sí a todo para quedar bien y después incumplir, que daña más la confianza que el no.',
        },
        {
          text: 'Saber cuándo y cómo escalar un conflicto',
          explanation:
            'Escalar es correcto cuando intentaste resolverlo directamente, el conflicto bloquea un objetivo importante y la decisión excede a las partes (prioridades entre equipos, recursos, riesgos legales o de seguridad). Hacelo con transparencia (avisá a la otra parte que vas a escalar), con hechos y con una propuesta, no con una queja. Ejemplo: "Plataforma y nosotros tenemos prioridades incompatibles para este trimestre; armamos juntos un documento con las dos opciones y su impacto para que decida dirección". En temas de ética o seguridad se escala de inmediato. El error común es escalar como primer paso, que se lee como incapacidad de resolver, o no escalar nunca y dejar que el problema crezca.',
        },
      ],
    },
    {
      id: 'ownership-y-errores',
      title: 'Ownership, prioridades y manejo de errores',
      body: [
        'Ownership es hacerse cargo de un resultado y no solo de una tarea: que lo que construiste funcione en producción, que resuelva el problema, y que si algo falla te ocupes aunque no sea "tu parte". Es de las competencias más buscadas desde semi-senior, porque reduce la necesidad de supervisión.',
        'Priorizar bajo presión implica separar urgente de importante, usar criterios explícitos (impacto, costo de demora, dependencias) y comunicar qué queda afuera. En junior se espera que hagas visible el conflicto de prioridades; en semi-senior, que propongas un orden razonado; en senior, que protejas al equipo del ruido y ordenes las prioridades con los stakeholders.',
        'Los errores y fracasos aparecen en casi todas las entrevistas. Lo que evalúan es honestidad, cómo reaccionaste en el momento (avisar y mitigar primero), si buscaste causas en vez de culpables y qué cambiaste para que no se repita. Elegí errores reales con consecuencias, no falsos defectos.',
        'La cultura de postmortems sin culpables (blameless) es una buena referencia: los errores humanos son síntomas de un sistema que los permitió, y la pregunta útil es qué cambio en el proceso o la herramienta evita que vuelva a pasar.',
      ],
      checklist: [
        {
          text: 'Explicar qué es ownership con un ejemplo propio',
          explanation:
            'Ownership es sentir como propio un resultado: no terminar en el merge, sino en que funcione y aporte valor; detectar problemas que nadie atiende y resolverlos o llevarlos a quien corresponde; cumplir lo que prometés o avisar a tiempo. Ejemplo: "Después de lanzar el nuevo buscador revisé las métricas y vi que las búsquedas sin resultado subieron un 20%; investigué, era un problema de acentos, y lo arreglé esa misma semana". Ownership no es hacer todo solo ni pisar el trabajo de otros: es asegurarte de que el problema tenga dueño. El error común es confundirlo con trabajar horas extra.',
        },
        {
          text: 'Priorizar cuando todo parece urgente',
          explanation:
            'Usá criterios explícitos: impacto en usuarios o negocio, costo de demorarlo, si bloquea a otros y cuánto esfuerzo lleva. Una matriz urgente/importante (Eisenhower) ayuda a separar lo que hay que hacer ya, lo que hay que planificar, lo que se puede delegar y lo que se puede descartar. Lo más importante es comunicar: qué hacés primero, por qué y qué se posterga. Ejemplo: "Tengo el bug de pagos, el pedido de ventas y el refactor; pagos primero porque pierde plata, ventas el jueves, el refactor la semana próxima. ¿Alguien ve algo distinto?". El error común es intentar hacer todo a la vez y terminar todo a medias.',
        },
        {
          text: 'Contar un error propio con honestidad y aprendizaje',
          explanation:
            'Elegí un error real con impacto moderado, que te haya enseñado algo. Estructura: qué pasó y cuál fue tu parte (sin rodeos), cómo te diste cuenta, qué hiciste en el momento (avisar y mitigar), qué causas encontraste y qué cambiaste después, en vos y en el proceso. Ejemplo: "Desplegué un cambio de configuración un viernes sin revisarlo; los mails dejaron de salir dos horas. Avisé, revertí, y propuse que la configuración pase por PR con validación automática". El error común es elegir un error trivial, uno que en realidad fue de otro o un falso defecto como "trabajo demasiado".',
        },
        {
          text: 'Manejar un incidente en producción y su postmortem',
          explanation:
            'Durante el incidente: comunicar rápido en el canal acordado, mitigar antes de entender (revertir, apagar una feature), definir quién coordina y actualizar el estado a intervalos regulares. Después: un postmortem sin culpables con línea de tiempo, impacto, causas raíz (suele haber varias) y acciones con responsable y fecha. Ejemplo: "Coordiné el incidente, revertimos en 12 minutos y en el postmortem encontramos que faltaba una alerta de errores 5xx; la agregamos y armamos un runbook". En entrevistas se valora mucho la calma y la comunicación. El error común es buscar quién tuvo la culpa, lo que hace que la próxima vez la gente esconda los errores.',
        },
        {
          text: 'Contar un fracaso a nivel proyecto sin repartir culpas',
          explanation:
            'En semi-senior y senior suelen pedir un proyecto que salió mal, no solo un error puntual. Asumí tu parte con claridad, analizá causas sistémicas (alcance mal definido, falta de validación temprana, dependencias no gestionadas) y contá qué cambió después en tu forma de trabajar. Ejemplo: "Lideré una reescritura del panel de administración que cancelamos a los cinco meses porque no entregaba nada usable; aprendí a planificar migraciones incrementales que den valor cada dos semanas, y lo apliqué en el proyecto siguiente". Mostrar que el fracaso te cambió es la señal clave. El error común es elegir un "fracaso" que terminó bien o culpar a la gerencia.',
        },
      ],
    },
    {
      id: 'liderazgo-e-influencia',
      title: 'Liderazgo sin autoridad, mentoría e influencia',
      body: [
        'Liderar no requiere un cargo: en software, la mayor parte del liderazgo se ejerce sin autoridad formal, convenciendo a pares, a otros equipos y a stakeholders. Desde semi-senior se espera que influyas en las decisiones del equipo, y en senior que lideres iniciativas que cruzan equipos.',
        'La influencia se construye con credibilidad (cumplir, saber de lo que hablás), con datos y con entender los incentivos de los demás. Las herramientas concretas son documentos escritos (RFCs, propuestas), pruebas chicas y reversibles, aliados que apoyen la idea y sponsors con poder de decisión.',
        'La mentoría es una forma de liderazgo: acompañar a juniors en su onboarding, ayudar a semi-seniors a dar el salto, delegar oportunidades de crecimiento con red de contención. Un senior se mide también por cuánto crece la gente a su alrededor.',
        'Subir la vara (raise the bar) es elevar el estándar del equipo con el ejemplo, con reviews que enseñan, con prácticas como el diseño escrito o los postmortems, y en las contrataciones. En senior se espera que pienses en estrategia: no solo resolver el problema de hoy, sino qué capacidades necesita el equipo dentro de un año.',
      ],
      checklist: [
        {
          text: 'Contar una iniciativa que lideraste sin autoridad formal',
          explanation:
            'Estructura: el problema y por qué importaba, cómo lo hiciste visible, cómo conseguiste apoyo (datos, un aliado, un sponsor), cómo coordinaste a personas que no te reportaban, cómo manejaste la resistencia y el resultado medible. Ejemplo: "Los deploys tardaban 40 minutos; armé un análisis de dónde se iba el tiempo, convencí a un compañero de plataforma de probar caché en un servicio, bajó a 12 minutos y con ese dato los demás equipos se sumaron". El componente clave es la influencia: cómo lograste que otros quisieran hacerlo. El error común es contar algo que hiciste solo, que muestra ejecución pero no liderazgo.',
        },
        {
          text: 'Influir en otro equipo para que priorice algo',
          explanation:
            'Entendé primero los objetivos y la presión del otro equipo; tu pedido compite con sus prioridades. Hacé el pedido concreto, con el impacto en un objetivo que les importe o de la empresa, y fácil de aceptar: ofrecer hacer parte del trabajo, un PR revisado por ellos, o una solución temporal. Ejemplo: "Necesitábamos un campo nuevo en su API; les propusimos hacerlo nosotros con su review y documentarlo, y salió en una semana". Si hay un conflicto real de prioridades, escalalo juntos con las opciones. El error común es insistir por todos los canales o escalar sin haber intentado entender al otro equipo.',
        },
        {
          text: 'Explicar cómo mentoreás a alguien según su nivel',
          explanation:
            'Con un junior: onboarding estructurado, tareas chicas con valor real, pair programming, reviews que explican el porqué y un espacio seguro para preguntar. Con un semi-senior que quiere ser senior: delegarle problemas más ambiguos (diseñar una solución, liderar una iniciativa chica, presentar una decisión), con feedback específico y visibilidad frente a quien decide promociones. En ambos casos, objetivos observables y seguimiento periódico. Ejemplo: "A una junior le armé un plan de cuatro semanas; a un semi-senior le delegué el RFC de un servicio y lo presentó él". El error común es mentorear resolviendo todo vos, que hace que la persona dependa de vos en vez de crecer.',
        },
        {
          text: 'Explicar qué significa subir la vara en un equipo',
          explanation:
            'Subir la vara es elevar el estándar de calidad y de trabajo del equipo de forma sostenida. Se hace con el ejemplo propio (tu código, tus documentos, tu forma de manejar incidentes), con prácticas explícitas (plantillas de diseño, criterios de review, definition of done) y con feedback directo cuando algo está por debajo del estándar. También en las contrataciones: sumar personas que mejoren el promedio. Ejemplo: "Introduje documentos de diseño para todo lo que llevara más de una semana; en dos trimestres bajaron los retrabajos en las reviews". El error común es confundirlo con perfeccionismo o con exigencia que frena las entregas.',
        },
        {
          text: 'Mostrar pensamiento estratégico como senior',
          explanation:
            'Pensar estratégicamente es conectar el trabajo diario con los objetivos del negocio a mediano plazo: qué problemas van a aparecer cuando el producto crezca, qué deuda técnica limita la velocidad, qué capacidades le faltan al equipo. En la entrevista se nota cuando tus historias incluyen el porqué de negocio y una mirada a futuro. Ejemplo: "Vi que el 60% de las ventas nuevas venían de México y el sistema no soportaba múltiples monedas; propuse invertir un trimestre en eso antes de que fuera urgente". Requiere entender cómo gana plata la empresa. El error común es que todas tus historias sean de ejecución brillante de tareas que definió otro.',
        },
      ],
    },
    {
      id: 'cultura-adaptabilidad-y-remoto',
      title: 'Cultura, adaptabilidad y trabajo remoto',
      body: [
        'Las preguntas de cultura buscan saber si vas a funcionar bien en ese equipo y qué vas a aportar. Culture fit es compartir valores y formas de trabajar; culture add es sumar algo que falta. Las empresas maduras buscan las dos cosas: valores compartidos (honestidad, colaboración, responsabilidad) y diversidad en todo lo demás.',
        'La adaptabilidad se evalúa con preguntas sobre cambios: requisitos que cambian, reorganizaciones, tecnologías nuevas, decisiones con información incompleta. La señal buscada es que te adaptes sin perder el criterio: entender por qué cambió, evaluar el impacto, comunicarlo y avanzar.',
        'La inteligencia emocional aparece en muchas preguntas sin nombrarse: reconocer tus emociones bajo presión, entender las del otro en un conflicto y regular tu reacción. En la entrevista se demuestra contando cómo manejaste una situación tensa y qué notaste en vos.',
        'El trabajo remoto agrega exigencias concretas: comunicación escrita clara, visibilidad del trabajo sin que te la pidan, autonomía, respeto por las zonas horarias y esfuerzo deliberado por construir confianza. Si el puesto es remoto, prepará ejemplos específicos de cómo trabajás así.',
      ],
      checklist: [
        {
          text: 'Diferenciar culture fit de culture add',
          explanation:
            'Culture fit es que la persona comparta los valores y encaje con la forma de trabajar del equipo. Culture add es que, además, aporte algo distinto: otra experiencia, otra disciplina, otra forma de pensar los problemas. Buscar solo fit tiende a equipos homogéneos donde se contrata a gente parecida a quien entrevista, con sesgos y puntos ciegos. Ejemplo: un equipo de backend que suma a alguien con experiencia en soporte empieza a diseñar mejores mensajes de error y herramientas internas. Como candidato, mostrá qué valores compartís y qué aportás distinto. El error común es intentar parecerte a lo que creés que quieren, que se nota y no te diferencia.',
        },
        {
          text: 'Responder "¿por qué querés trabajar acá?"',
          explanation:
            'Investigá la empresa antes: su producto, su modelo de negocio, cómo trabaja su equipo de ingeniería (blog técnico, charlas, repos públicos) y noticias recientes. La respuesta conecta algo concreto de ellos con algo concreto que buscás vos. Ejemplo: "Uso su app para pagar servicios, me interesa el problema de conciliar pagos a escala y leí que hacen postmortems públicos, que es la cultura en la que quiero trabajar". Evitá respuestas que valgan para cualquier empresa. El error común es hablar solo de lo que ganás vos (sueldo, flexibilidad) sin mencionar qué te atrae del trabajo.',
        },
        {
          text: 'Contar cómo te adaptaste a un cambio grande',
          explanation:
            'Los cambios pueden ser de requisitos, de equipo, de tecnología o de estrategia de la empresa. Una buena historia muestra la reacción inicial con honestidad (está bien que te haya costado), cómo buscaste entender el porqué, qué hiciste para adaptarte y cómo ayudaste a otros. Ejemplo: "La empresa decidió pasar de web a mobile-first y mi equipo tenía que aprender React Native en un trimestre; armé un grupo de estudio y migramos primero la pantalla más simple". En senior, sumá cómo comunicaste el cambio al equipo con transparencia. El error común es mostrarte siempre de acuerdo con todo o, al revés, quejarte sin acción.',
        },
        {
          text: 'Demostrar inteligencia emocional en una situación tensa',
          explanation:
            'La inteligencia emocional tiene cuatro partes útiles: reconocer tu emoción, regularla antes de actuar, reconocer la emoción del otro y usar eso para manejar la relación. En la entrevista no se dice "tengo inteligencia emocional", se muestra con una historia. Ejemplo: "En un incidente, el gerente de ventas me escribió furioso; noté que me estaba poniendo a la defensiva, esperé diez minutos, lo llamé, reconocí que tenía clientes enojados y le di un horario concreto de actualización. Bajó el tono y nos ayudó con los clientes". El error común es decir que nunca te enojás o te estresás, que suena falso y muestra poca autoconciencia.',
        },
        {
          text: 'Explicar cómo trabajás bien en remoto',
          explanation:
            'En remoto nadie ve lo que hacés, así que la visibilidad es tu responsabilidad: actualizar tickets, compartir avances y avisar bloqueos sin que te pregunten. La comunicación escrita tiene que ser autosuficiente y las decisiones tienen que quedar documentadas. También importa respetar zonas horarias, elegir bien entre síncrono y asíncrono y crear espacios para la confianza (cámara en reuniones clave, charlas informales). Ejemplo: "Cada día cierro con un mensaje de tres líneas: qué hice, qué sigue y si estoy bloqueado; mi líder me dijo que nunca tuvo que preguntarme cómo venía". El error común es responder solo con tu setup y tu disciplina, sin hablar de cómo colaborás con los demás.',
        },
      ],
    },
  ],
};
