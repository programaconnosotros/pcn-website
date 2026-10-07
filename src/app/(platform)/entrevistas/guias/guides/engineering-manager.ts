import type { InterviewGuide } from './types';

export const engineeringManagerGuide: InterviewGuide = {
  track: 'engineering-manager',
  summary:
    'Cómo prepararte para entrevistas de engineering manager: personas, contratación, salud del equipo, entrega, diseño organizacional y stakeholders, de primer rol de manager a director.',
  sections: [
    {
      id: 'rol-y-entrevista',
      title: 'El rol y cómo es la entrevista',
      body: [
        'Un engineering manager es responsable de un equipo de ingeniería como sistema: las personas que lo forman, cómo trabajan juntas y lo que entregan. Contrata, hace crecer, da feedback, evalúa desempeño, cuida la salud del equipo y asegura que se entregue de forma predecible y sostenible. A diferencia del tech lead, que es dueño de la dirección técnica, y del product manager, que decide qué construir, el EM responde por la capacidad del equipo de ejecutar bien hoy y dentro de un año.',
        'La entrevista suele tener varias partes: una de people management (1:1s, feedback, bajo desempeño, promociones, conflictos), una de ejecución (planificación, roadmaps con producto, métricas, incidentes, deuda técnica), una de comportamiento con preguntas del tipo "contame de una vez que…" y, en muchas empresas, una de diseño de sistemas o de profundidad técnica para verificar que todavía tenés criterio de ingeniería. Para roles senior se suma una de organización y estrategia: estructura de equipos, headcount y cómo trabajás con otras áreas.',
        'En un primer rol de manager se espera que entiendas el cambio de identidad, lleves buenos 1:1s, des feedback claro, sepas delegar y construyas confianza. Para un EM de uno o dos equipos, que manejes bajo desempeño, promociones, procesos de contratación, roadmaps con producto, métricas de entrega e incidentes con soltura. Para un senior EM, manager de managers o director, que diseñes organizaciones, hagas crecer a otros managers, gestiones presupuesto y headcount, lleves adelante cambios grandes y despidos, y conectes la ingeniería con la estrategia del negocio.',
        'Los errores más comunes son hablar solo de tecnología y no de personas, contar historias en las que el héroe sos vos en vez del equipo, responder en abstracto sin ejemplos reales, y no tener historias de fracaso o de decisiones difíciles. El entrevistador busca juicio, autoconciencia y evidencia de que ya hiciste el trabajo, no que conozcas los términos.',
      ],
      checklist: [
        {
          text: 'Explicar qué hace un engineering manager y cómo se mide su éxito',
          explanation:
            'Un engineering manager logra resultados a través de otros: su trabajo es que el equipo entregue valor de forma predecible, con calidad y de manera sostenible, y que las personas crezcan. Sus responsabilidades típicas son contratar, hacer 1:1s, dar feedback, evaluar desempeño, planificar con producto, sacar bloqueos, cuidar la salud del equipo y representarlo ante el resto de la organización. Su éxito se mide por el equipo: qué entrega, cuánta gente crece y se queda, cómo se recupera de los problemas y cuánto confía en él la organización. Una frase útil para la entrevista: "mi output es el output de mi equipo más el de los equipos que influyo". Ejemplo: un buen trimestre de un EM no es haber cerrado tickets, sino que el equipo lanzó lo comprometido, una persona fue promovida y nadie se quemó en el camino. El error común es describir el rol como "el que asigna tareas y hace seguimiento".',
        },
        {
          text: 'Diferenciar engineering manager, tech lead y product manager',
          explanation:
            'El product manager decide qué construir y por qué: problema, usuarios, prioridades y resultados de negocio. El tech lead decide cómo construirlo técnicamente: arquitectura, estándares de calidad y decisiones de diseño, y suele seguir programando buena parte del tiempo. El engineering manager se ocupa de quién lo construye y en qué condiciones: personas, contratación, crecimiento, procesos, capacidad y salud del equipo. Ejemplo: ante una nueva feature de pagos, el PM define el alcance y la métrica de éxito, el tech lead propone el diseño y los riesgos técnicos, y el EM asegura que haya gente con el conocimiento, que la planificación sea realista y que la persona que lo lidera tenga apoyo para crecer con ese desafío. En equipos chicos un EM puede cubrir parte del rol de tech lead, pero conviene decirlo explícitamente. El error común es decir que el EM es "el tech lead con más reuniones".',
        },
        {
          text: 'Explicar qué cambia al pasar de ingeniero a manager',
          explanation:
            'Cambia la fuente de satisfacción, el tipo de feedback y las habilidades que importan. Como ingeniero tu impacto es directo y el feedback es rápido; como manager tu impacto es indirecto y los resultados se ven en meses. El manager es un multiplicador: si dedicás tu tiempo a destrabar, hacer crecer y alinear, el equipo rinde más que si vos programás. Ejemplo de transición sana: dejás de tomar tareas del camino crítico, bloqueás tiempo para 1:1s, delegás un proyecto difícil a alguien con acompañamiento, y aceptás que tu día "productivo" ahora es una conversación de carrera bien llevada. El péndulo también es válido: muchas personas vuelven a ser individual contributors y eso no es un fracaso. El error común en la entrevista es mostrar nostalgia por el código o decir que seguís siendo "el que más sabe del equipo", que sugiere que no soltaste el rol anterior.',
        },
        {
          text: 'Saber qué se espera de vos según el nivel del rol',
          explanation:
            'Para un primer rol de manager se espera criterio con personas: 1:1s, feedback, delegación, construcción de confianza y manejo de conflictos simples, aunque tengas pocos ejemplos. Para un EM de uno o dos equipos se espera dominio del ciclo completo: contratación, bajo desempeño y PIPs, promociones y calibración, planificación con producto, métricas de entrega e incidentes. Para un senior EM, manager de managers o director se espera trabajo a nivel organización: diseñar estructuras de equipos, hacer crecer managers, presupuesto y headcount, cambios grandes, reorganizaciones y despidos, y estrategia técnica alineada al negocio. Elegí tus historias según el nivel al que aplicás: para director, contar cómo le diste feedback a un dev se queda corto; contá cómo detectaste y resolviste un problema en uno de tus equipos sin estar en el día a día. El error común es aplicar a senior con historias de alcance de un solo equipo.',
        },
        {
          text: 'Tener un banco de historias reales preparadas con STAR',
          explanation:
            'Las preguntas de comportamiento son la mayor parte de una entrevista de EM, y se preparan con historias, no con respuestas. Armá entre ocho y diez historias con STAR (situación, tarea, acción, resultado) que cubran: un caso de bajo desempeño, una promoción que impulsaste, una contratación difícil, un conflicto entre personas, un desacuerdo con tu jefe o con producto, un proyecto atrasado, un incidente, un cambio que lideraste, una persona que se fue y un error tuyo. Para cada una tené el contexto en una frase, tus acciones concretas (en primera persona del singular, no "hicimos"), el resultado con algo medible y qué harías distinto. Ejemplo: "un senior empezó a entregar tarde y con bugs; en el 1:1 apareció un problema familiar; ajustamos su carga por dos meses y volvió a su nivel; aprendí a preguntar antes de asumir". Una historia bien preparada sirve para varias preguntas. El error común es improvisar y terminar con historias vagas o sin resultado.',
        },
      ],
    },
    {
      id: 'uno-a-uno-y-feedback',
      title: '1:1s, feedback y desarrollo de carrera',
      body: [
        'Los 1:1s son la herramienta principal de un engineering manager. Son el espacio de la otra persona para hablar de lo que le importa: cómo está, qué la frena, su carrera, feedback en ambas direcciones. No son reuniones de estado, que se resuelven por escrito. En la entrevista te van a preguntar con qué frecuencia los hacés, qué temas tratás y cómo los adaptás a cada persona.',
        'El feedback tiene que ser frecuente, específico y oportuno. Modelos como SBI (situación, comportamiento, impacto) ayudan a hablar de hechos observables y no de rasgos de personalidad. El feedback positivo concreto importa tanto como el negativo, y también tenés que pedir feedback sobre vos mismo y mostrar que actuás sobre él.',
        'El desarrollo de carrera conecta lo que la persona quiere con lo que el equipo necesita. La career ladder da un lenguaje común sobre qué significa cada nivel, y el trabajo del manager es encontrar oportunidades concretas para que la persona demuestre el siguiente nivel: proyectos, ownership, exposición. No todos quieren ascender, y eso también es una conversación válida.',
        'En la entrevista se valora que des ejemplos de personas concretas que crecieron con tu ayuda y de feedback difícil que diste. Una respuesta que suena a manual ("hago 1:1s semanales y doy feedback constructivo") sin ejemplos no convence.',
      ],
      checklist: [
        {
          text: 'Describir cómo llevás un buen 1:1',
          explanation:
            'Un buen 1:1 es frecuente (semanal o quincenal), tiene un horario fijo que no se cancela, dura entre 30 y 45 minutos y su agenda es principalmente de la otra persona. Conviene un documento compartido donde ambos anotan temas durante la semana y donde quedan acuerdos y acciones, para darle continuidad. Los temas rotan entre lo inmediato (bloqueos, frustraciones), el feedback en ambas direcciones y conversaciones de carrera más largas, por ejemplo una vez al mes. Ejemplo: con alguien que no trae temas, llevás preguntas como "¿qué te gustaría que cambie en cómo trabajamos?" o "¿qué fue lo que más energía te sacó esta semana?". También ajustás el formato: hay personas que prefieren caminar o hablar sin cámara. El error común es convertir el 1:1 en un repaso de tickets, que se podría reemplazar por un mensaje y le quita a la persona su único espacio privado con vos.',
        },
        {
          text: 'Dar feedback difícil con un modelo como SBI',
          explanation:
            'SBI significa situación, comportamiento e impacto: describís cuándo y dónde pasó, qué hizo la persona de forma observable y qué efecto tuvo, y después preguntás su perspectiva y acuerdan qué cambia. Ejemplo: "en la planning del martes (situación), cuando María propuso dividir la historia dijiste que era una pérdida de tiempo sin explicar por qué (comportamiento); ella no volvió a hablar en toda la reunión y perdimos su idea (impacto). ¿Cómo lo viste vos?". El feedback se da en privado, cerca del hecho y sin acumular. Es útil separar el feedback de la evaluación formal: la evaluación no debería traer nada que la persona no haya escuchado antes. El error común es el "sándwich" de elogio, crítica y elogio, que diluye el mensaje, o hablar de rasgos ("sos poco colaborativo") que la persona no puede accionar.',
        },
        {
          text: 'Usar una career ladder para conversaciones de carrera',
          explanation:
            'Una career ladder describe las expectativas de cada nivel en dimensiones como alcance técnico, impacto, autonomía, colaboración y liderazgo. Sirve para que las conversaciones de carrera se basen en criterios compartidos y no en la opinión del manager. El proceso: preguntar a la persona a dónde quiere ir, evaluar juntos dónde está en cada dimensión con ejemplos, identificar las dos o tres brechas principales y buscar oportunidades concretas para cerrarlas. Ejemplo: a un semi-senior le falta influencia fuera del equipo; le das la coordinación técnica de una integración con otro equipo y revisan cómo fue cada mes. También existen carreras paralelas de individual contributor (staff, principal) y de management, y hay que presentarlas como igualmente valiosas. El error común es usar la ladder como checklist: "cumplí todos los puntos, me corresponde el ascenso", cuando lo que se evalúa es impacto sostenido.',
        },
        {
          text: 'Delegar haciendo crecer a la persona',
          explanation:
            'Delegar bien no es pasar tareas, sino transferir ownership de un resultado con el nivel de soporte adecuado a la experiencia de la persona. Un modelo útil es ajustar el estilo según la madurez en esa tarea: más dirección para quien recién empieza, más autonomía para quien ya la domina. Conviene acordar el resultado esperado, las restricciones, los puntos de control y qué decisiones puede tomar sola. Ejemplo: delegás la planificación de la migración a una semi-senior; acuerdan que ella propone el plan, lo revisan juntos el jueves y después decide sola salvo que cambie la fecha. Delegar implica tolerar que lo haga distinto a como lo harías vos. El error común es delegar y después intervenir en cada detalle, que le quita el aprendizaje y la confianza, o delegar sin contexto y culparla cuando sale mal.',
        },
        {
          text: 'Pedir y usar feedback sobre tu propio trabajo como manager',
          explanation:
            'El poder que tenés como manager hace que la gente no te dé feedback negativo espontáneamente, así que hay que pedirlo de forma activa y hacerlo fácil. Preguntas específicas funcionan mejor que "¿tenés feedback para mí?": por ejemplo "¿qué es una cosa que podría hacer distinto en las plannings?" o "¿hay algo que hice este mes que te haya dificultado el trabajo?". Además sirven las encuestas anónimas de equipo y los skip-levels que hace tu jefe. Lo más importante es mostrar que actuaste sobre lo que te dijeron, porque eso hace que el feedback siga llegando. Ejemplo: te dicen que tus mensajes fuera de horario generan presión; empezás a programarlos para la mañana y lo comentás en la siguiente reunión de equipo. El error común es defenderte o explicar por qué lo hiciste cuando te dan feedback, que garantiza que no te lo vuelvan a dar.',
        },
      ],
    },
    {
      id: 'desempeno-y-promociones',
      title: 'Desempeño, evaluaciones, promociones y desvinculaciones',
      body: [
        'Gestionar el desempeño es una de las partes más evaluadas de la entrevista, porque es donde se ve si podés tener conversaciones difíciles. Te van a preguntar cómo detectás un problema de desempeño, cómo lo diagnosticás, cómo lo comunicás y qué hacés si no mejora.',
        'Las evaluaciones formales y las calibraciones existen para que las decisiones de compensación y promoción sean consistentes entre equipos. Un buen manager llega con evidencia de todo el período, conoce sus sesgos y defiende a su gente con datos, pero también acepta que la calibración ajuste sus calificaciones.',
        'Las promociones se ganan demostrando de forma sostenida el siguiente nivel, y el manager es quien construye el caso y las oportunidades para que eso pase. Del otro lado, a veces la respuesta correcta es la desvinculación: tiene que llegar después de feedback claro y una oportunidad real, y hacerse con respeto.',
        'En senior se suman los despidos masivos y la gestión del desempeño de otros managers. Ahí importa tanto la ejecución humana como el impacto en quienes se quedan.',
      ],
      checklist: [
        {
          text: 'Diagnosticar la causa de un bajo desempeño antes de actuar',
          explanation:
            'El bajo desempeño tiene causas muy distintas: expectativas que nunca se dejaron claras, falta de habilidades para lo que se le pide, un mal encaje con el tipo de trabajo, problemas personales o de salud, conflictos en el equipo o falta de motivación. Cada causa tiene un remedio distinto: aclarar expectativas, capacitar o hacer pairing, cambiar de proyecto, dar flexibilidad temporal, mediar o una conversación sobre compromiso. Por eso el primer paso es una conversación abierta en el 1:1 con ejemplos concretos y preguntas genuinas. Ejemplo: un dev que siempre fue sólido empieza a entregar tarde; al preguntar aparece que está cuidando a un familiar enfermo, y acuerdan menos carga y un horario flexible por dos meses. Un buen manager también se pregunta qué parte del problema es suya. El error común es saltar directo al plan formal o, al revés, esperar meses con la esperanza de que se arregle solo mientras el equipo absorbe el trabajo.',
        },
        {
          text: 'Explicar qué es un PIP y cómo llevarlo de forma justa',
          explanation:
            'Un performance improvement plan es un documento formal que describe la brecha entre lo esperado y lo actual con ejemplos, los objetivos medibles que la persona tiene que alcanzar, el apoyo que va a recibir, el plazo (típicamente 30 a 90 días) y qué pasa si no se cumple. Se arma con RR. HH. y se revisa en reuniones semanales con evidencia escrita. Para que sea justo, su contenido no puede sorprender: debe haber habido feedback claro antes, y los objetivos tienen que ser alcanzables para alguien en ese nivel. Ejemplo de objetivo bien escrito: "entregar las historias asignadas en el sprint con tests y sin bugs críticos reportados en las dos semanas siguientes, en al menos tres de cuatro sprints", en vez de "mejorar la calidad". Hay personas que salen de un PIP y vuelven a un buen nivel. El error común es usarlo como trámite previo a un despido ya decidido, que es injusto y el equipo lo percibe.',
        },
        {
          text: 'Preparar una evaluación de desempeño y una calibración',
          explanation:
            'Una evaluación justa se basa en evidencia de todo el período: notas de 1:1s, proyectos entregados, impacto, feedback de pares y de otros equipos. Conviene llevar un documento por persona durante el año para no depender de la memoria, que favorece lo reciente. Los sesgos más comunes son el de recencia, el de afinidad (evaluar mejor a quien se parece a vos), el efecto halo (una cualidad tiñe todo) y el de visibilidad (premiar a quien más habla). En la calibración, los managers comparan sus evaluaciones para que un "supera expectativas" signifique lo mismo en todos los equipos; ahí defendés con ejemplos concretos y aceptás ajustes. Ejemplo: argumentar "redujo el tiempo de deploy de 40 a 8 minutos y eso desbloqueó a tres equipos" en vez de "es muy bueno". El error común es que la persona escuche por primera vez en la evaluación un problema del que nunca le hablaste.',
        },
        {
          text: 'Construir un caso de promoción sólido',
          explanation:
            'Una promoción reconoce que la persona ya trabaja de forma sostenida al siguiente nivel, no que lo merece por antigüedad ni que lo va a lograr después del ascenso. El caso se construye durante meses: identificás las brechas con la ladder, generás oportunidades para cerrarlas y vas juntando evidencia. El documento final mapea logros concretos a los criterios del nivel, con impacto medible y citas de feedback de pares, y está escrito para un comité que no conoce el contexto. Ejemplo: "lideró el diseño del nuevo servicio de facturación con dos equipos, escribió el RFC aprobado por arquitectura, bajó el tiempo de cierre mensual de cinco días a uno y mentoreó a dos juniors que hoy toman tareas de forma autónoma". También hay que manejar expectativas: decir de antemano cuál es el proceso y qué pasa si no sale. El error común es prometer una promoción que no depende solo de vos.',
        },
        {
          text: 'Desvincular a una persona con claridad y respeto',
          explanation:
            'Antes de desvincular por desempeño tiene que haber habido feedback claro, expectativas escritas y una oportunidad real de mejorar; la decisión no debería sorprender a la persona. Se prepara con RR. HH. y legal: motivo, documentación, condiciones de salida, accesos y quién comunica qué. La conversación es corta y directa: se comunica la decisión en los primeros minutos, se explica brevemente el motivo, no se debate y se informa qué sigue, cuidando la dignidad de la persona. Ejemplo: "Juan, tomamos la decisión de terminar tu relación con la empresa; como venimos hablando en el plan, no se alcanzaron los objetivos; RR. HH. te va a explicar ahora las condiciones". Después se informa al equipo sin detalles privados y se planifica la redistribución del trabajo. El error común es dar vueltas antes de decirlo, generar falsas esperanzas o hablar mal de la persona después.',
        },
      ],
    },
    {
      id: 'contratacion',
      title: 'Contratación: diseño del proceso, entrevistas y cierre',
      body: [
        'La contratación es probablemente la decisión con más impacto a largo plazo que toma un engineering manager. Te van a preguntar cómo diseñás un proceso, cómo entrevistás, cómo tomás la decisión final y cómo cerrás a un candidato que tiene otras ofertas.',
        'Un buen proceso empieza por definir qué necesita el equipo y qué competencias evaluar, y diseña etapas que las midan de forma consistente: entrevistas estructuradas, rúbricas, ejercicios parecidos al trabajo real y feedback escrito antes del debrief. Eso mejora la calidad de las decisiones y reduce sesgos.',
        'La experiencia del candidato también es parte del trabajo: un proceso largo, sin comunicación o con ejercicios desproporcionados te hace perder a los mejores. El cierre empieza en la primera conversación, entendiendo qué busca la persona.',
        'En niveles senior se suma planificar la contratación de toda una organización, contratar managers, armar pipelines diversos y entrenar a entrevistadores.',
      ],
      checklist: [
        {
          text: 'Diseñar un proceso de selección de punta a punta',
          explanation:
            'Se empieza por el perfil: qué problema va a resolver la persona, qué nivel y qué competencias son imprescindibles y cuáles se pueden aprender. Después se diseñan etapas que cubran esas competencias sin repetirse, por ejemplo: screening con recruiting, una conversación técnica con el manager, un ejercicio práctico, una entrevista de diseño, una de comportamiento y una con el equipo. Cada etapa tiene un responsable, preguntas estándar y una rúbrica con señales de "sí" y de "no". Ejemplo para backend semi-senior: un pairing de 90 minutos sobre un bug real simplificado reemplaza a un take-home de ocho horas, evalúa lo mismo y respeta el tiempo del candidato. Conviene medir el embudo (tasa de pase por etapa, tiempo total, ofertas aceptadas) para mejorar el proceso. El error común es sumar etapas por miedo a equivocarse, alargando el proceso hasta perder a los buenos candidatos.',
        },
        {
          text: 'Explicar qué es una entrevista estructurada y por qué reduce sesgos',
          explanation:
            'Una entrevista estructurada hace las mismas preguntas a todos los candidatos para un puesto, en el mismo orden, y las evalúa con una rúbrica definida de antemano. Eso hace que las respuestas sean comparables y reduce el peso de la primera impresión, la afinidad y el "me cayó bien". Las preguntas de comportamiento piden ejemplos reales ("contame de una vez que…") y se repregunta por detalles para distinguir lo que hizo la persona de lo que hizo el equipo. Ejemplo de rúbrica para "manejo de conflictos": señal fuerte si describe acciones concretas propias, considera el punto de vista del otro y muestra un resultado; señal débil si culpa a otros o responde en hipotético. Cada entrevistador escribe su feedback antes del debrief para no influenciarse. El error común es entrevistar "por conversación libre", que favorece a quien se parece al entrevistador.',
        },
        {
          text: 'Tomar la decisión de contratación en un debrief',
          explanation:
            'En el debrief, cada entrevistador presenta su evaluación y su evidencia, y se busca una decisión basada en las competencias definidas, no en impresiones. Conviene que hable primero quien tiene menos poder en la sala, para que su opinión no se adapte a la del manager. Las señales contradictorias se discuten con evidencia concreta: si una persona vio un problema de comunicación y otra no, se revisa qué pasó en cada entrevista. La regla de muchas empresas es que una señal fuerte en contra de algo crítico pesa más que varias señales tibias a favor. Ejemplo: el candidato es técnicamente excelente pero en dos entrevistas culpó a sus compañeros por todos los problemas; para un rol con mucha colaboración, eso es un no. El error común es contratar por urgencia a alguien "suficientemente bueno", que cuesta mucho más después que dejar la vacante abierta unas semanas.',
        },
        {
          text: 'Cerrar a un candidato que tiene otras ofertas',
          explanation:
            'El cierre empieza en la primera conversación: preguntás qué está buscando, qué lo haría elegir una empresa sobre otra y qué otros procesos tiene. Con esa información, en cada etapa le mostrás lo que le importa: el problema técnico, el equipo, el crecimiento, la flexibilidad. Cuando llega la oferta, el manager habla directamente con la persona, le explica por qué la quiere en el equipo y qué impacto puede tener. Ejemplo: el candidato valora aprender sobre sistemas distribuidos; le presentás al staff engineer con quien trabajaría y le contás el proyecto de rediseño del pipeline de eventos. Si la otra oferta paga más, negociás dentro de las bandas con RR. HH. sin romper la equidad con el equipo actual. El error común es presionar con fechas límite artificiales o prometer cosas que no controlás, como una promoción en seis meses.',
        },
        {
          text: 'Hacer un proceso de contratación más diverso e inclusivo',
          explanation:
            'La diversidad se construye en todo el embudo, no solo al final. En la atracción: buscar candidatos fuera de los referidos, que tienden a reproducir el perfil del equipo, y revisar los avisos para quitar requisitos innecesarios (años de experiencia, títulos) y lenguaje excluyente. En la evaluación: entrevistas estructuradas, rúbricas, paneles diversos y debriefs basados en evidencia en vez de "fit cultural", que suele esconder "se parece a nosotros". En el cierre y la retención: un ambiente donde esas personas quieran quedarse, porque si no la diversidad dura poco. Ejemplo: medir la tasa de pase por etapa reveló que el take-home eliminaba a muchas personas con responsabilidades de cuidado; reemplazarlo por un ejercicio en vivo corto lo corrigió. El error común es tratarlo como una cuota o una campaña puntual en vez de un cambio de proceso.',
        },
      ],
    },
    {
      id: 'salud-del-equipo',
      title: 'Salud del equipo: seguridad psicológica, burnout, conflictos y retención',
      body: [
        'Un equipo sano entrega mejor durante más tiempo. La seguridad psicológica, es decir poder preguntar, discrepar o admitir errores sin miedo, es el factor que más se asocia a equipos efectivos, y el manager la construye o la destruye con su ejemplo.',
        'El burnout y la rotación son costosos y se pueden prevenir: cargas sostenidas, guardias mal repartidas, falta de autonomía y falta de reconocimiento son causas frecuentes. El manager tiene que detectar las señales temprano y actuar sobre las causas, no solo sobre los síntomas.',
        'Los conflictos son normales y hasta sanos cuando son sobre ideas; el problema es cuando se vuelven personales o se evitan. Te van a preguntar cómo mediás y cómo distinguís un conflicto estructural de uno de relación.',
        'Los equipos remotos y distribuidos agregan desafíos de comunicación, inclusión y conexión. Se espera que sepas trabajar asincrónicamente y cuidar que nadie quede afuera por estar en otra zona horaria.',
      ],
      checklist: [
        {
          text: 'Explicar la seguridad psicológica y cómo se construye',
          explanation:
            'La seguridad psicológica, un concepto de Amy Edmondson, es la creencia compartida de que en el equipo se pueden asumir riesgos interpersonales: hacer una pregunta básica, admitir un error, proponer una idea o discrepar con alguien con más poder, sin ser castigado ni humillado. El proyecto Aristotle de Google la identificó como el factor más importante de sus equipos efectivos. Se construye con acciones concretas: el manager admite sus propios errores, agradece a quien trae malas noticias, hace postmortems sin culpables, pregunta la opinión de quienes hablan menos y reacciona con curiosidad y no con enojo ante un problema. Ejemplo: alguien rompe producción con un deploy y lo avisa enseguida; agradecés el aviso públicamente y el postmortem se enfoca en por qué el pipeline lo permitió. No es lo mismo que comodidad: un equipo seguro puede tener estándares muy altos. El error común es confundirla con evitar el conflicto o con no dar feedback negativo.',
        },
        {
          text: 'Detectar y prevenir el burnout en el equipo',
          explanation:
            'El burnout es agotamiento crónico por estrés laboral sostenido, con tres señales típicas: cansancio, cinismo o distancia del trabajo y sensación de ineficacia. Las causas más comunes son carga excesiva durante mucho tiempo, guardias frecuentes, falta de control sobre el propio trabajo, falta de reconocimiento, injusticia percibida y conflicto de valores. Señales a observar: cambios de comportamiento, horarios extendidos, irritabilidad, errores poco habituales, la persona que todos consultan para todo, vacaciones que no se toman. Ejemplo: después de tres meses de lanzamiento con horas extra, el manager corta el trabajo nuevo por dos semanas para estabilización, revisa la rotación de guardias y se asegura de que todos tomen días libres. Prevenir significa planificar con capacidad realista y no convertir la urgencia en norma. El error común es tratarlo como un problema individual ("tomate unos días") sin cambiar las condiciones que lo causaron.',
        },
        {
          text: 'Mediar un conflicto entre personas del equipo',
          explanation:
            'Primero se habla con cada persona por separado para entender su versión, los hechos y qué necesita, sin tomar partido ni juzgar. Después se distingue la causa: muchos conflictos son estructurales (roles poco claros, ownership compartido, incentivos opuestos, falta de acuerdos técnicos) y se resuelven cambiando la estructura, no la relación. Si es de relación, se facilita una conversación entre ambos enfocada en el problema y en acuerdos concretos, y se hace seguimiento. Ejemplo: dos devs discuten en cada code review; resulta que no hay un estándar de estilo acordado; el equipo escribe una guía y automatiza lo que se puede con un linter, y los comentarios dejan de ser personales. Si el conflicto incluye falta de respeto o acoso, deja de ser un desacuerdo y se trata como un tema de conducta con RR. HH. El error común es evitar el conflicto esperando que se resuelva solo, o resolverlo vos imponiendo una solución sin que ellos lleguen a un acuerdo.',
        },
        {
          text: 'Retener a las personas clave del equipo',
          explanation:
            'La gente suele irse por su manager, por falta de crecimiento, por un trabajo que no la motiva, por compensación por debajo del mercado o por cansancio. Retener empieza mucho antes de la renuncia: conversaciones de carrera frecuentes, proyectos que desafíen, reconocimiento concreto, compensación revisada y carga sostenible. Una práctica útil son las "stay interviews": preguntar periódicamente qué te hace quedarte, qué te haría irte y qué cambiarías. Ejemplo: en un 1:1 una senior menciona que hace un año hace lo mismo; le das el liderazgo técnico del próximo proyecto y le proponés presentar el trabajo en la charla interna de ingeniería. Si alguien decide irse por algo que no podés ofrecer, apoyarlo y cuidar la salida mantiene la relación y la reputación del equipo. El error común es reaccionar solo con una contraoferta salarial, que muchas veces solo posterga la salida.',
        },
        {
          text: 'Liderar un equipo remoto o distribuido',
          explanation:
            'Un equipo remoto funciona bien cuando el trabajo es asincrónico por defecto: decisiones y contexto por escrito, documentos de diseño, updates en texto y reuniones grabadas o con notas. Se define una ventana corta de solapamiento para lo que necesita ser en vivo y se rotan los horarios incómodos para que no los pague siempre la misma región. La inclusión requiere atención: en reuniones híbridas, todos se conectan desde su computadora para que quienes están remotos no queden en desventaja. La conexión humana se cuida con espacios informales y encuentros presenciales ocasionales. Ejemplo: un equipo entre Buenos Aires y Madrid reemplaza la daily por un update escrito, deja una sola reunión semanal en la franja compartida y usa un canal para decisiones que queda como registro. El error común es replicar la oficina en videollamadas todo el día, que agota y excluye a quienes están en otra zona.',
        },
      ],
    },
    {
      id: 'entrega-y-metricas',
      title: 'Entrega, planificación y métricas',
      body: [
        'Un engineering manager responde por la capacidad del equipo de entregar de forma predecible. Eso incluye planificar con producto, estimar con incertidumbre, gestionar dependencias, comunicar atrasos con opciones y equilibrar trabajo de producto con deuda técnica y confiabilidad.',
        'Las métricas ayudan a ver el sistema de entrega, pero se usan mal con frecuencia. DORA mide la entrega de software; SPACE propone mirar productividad en varias dimensiones, incluida la satisfacción. En la entrevista se valora que sepas qué medir, para qué y, sobre todo, qué no hacer con las métricas.',
        'Los incidentes son parte de la entrega. El manager asegura que haya un proceso claro de respuesta, postmortems sin culpables y que las acciones de mejora entren en la planificación.',
        'También te pueden preguntar qué tan hands-on sos. Se espera criterio técnico suficiente para detectar riesgos y hacer buenas preguntas, sin convertirte en un cuello de botella del equipo.',
      ],
      checklist: [
        {
          text: 'Armar un roadmap trimestral con producto',
          explanation:
            'El roadmap se arma entre producto e ingeniería: producto trae los problemas a resolver y su prioridad de negocio, y el engineering manager trae la capacidad real del equipo y el trabajo técnico necesario. La capacidad real descuenta vacaciones, guardias, soporte, onboarding y un margen para imprevistos, que suele ser del 15 al 20%. Conviene acordar una distribución explícita, por ejemplo 70% iniciativas de producto, 20% deuda y confiabilidad y 10% mejoras de herramientas. Se estiman los bloques grandes por tamaño relativo y se diferencia lo comprometido de lo deseable. Ejemplo: "comprometemos el nuevo onboarding y la migración de facturación; el panel de reportes entra si la migración termina en la semana 8". El error común es llenar el trimestre al 100% con features, prometiendo todo, y descubrir a mitad de camino que no entran ni las guardias.',
        },
        {
          text: 'Explicar las métricas DORA y cómo usarlas',
          explanation:
            'Las métricas DORA, del programa de investigación DevOps Research and Assessment, son cuatro: frecuencia de deploy (cada cuánto se despliega a producción), lead time de cambios (desde el commit hasta producción), tasa de fallas de cambios (porcentaje de deploys que causan un incidente o rollback) y tiempo de recuperación ante fallas. Las dos primeras miden velocidad y las dos últimas estabilidad, y la investigación muestra que los mejores equipos mejoran en ambas a la vez. Se usan para detectar cuellos de botella y ver si una mejora funciona, mirando tendencias del equipo. Ejemplo: el lead time es de nueve días; al desglosarlo, seis son espera de review y de QA manual; el equipo acuerda reviews dentro del día y automatiza los tests de regresión, y baja a dos días. El error común es convertirlas en objetivos o comparar equipos, porque se gamifican: deploys vacíos para subir la frecuencia, incidentes que no se reportan.',
        },
        {
          text: 'Explicar el marco SPACE y los riesgos de medir productividad',
          explanation:
            'SPACE es un marco de investigadores de GitHub y Microsoft que dice que la productividad de desarrollo no se captura con una sola métrica y propone cinco dimensiones: satisfacción y bienestar, desempeño (resultados), actividad (volumen de acciones), comunicación y colaboración, y eficiencia y flujo. La recomendación es combinar métricas de al menos tres dimensiones, incluyendo percepciones de encuestas, para no optimizar una a costa de otras. La ley de Goodhart explica el riesgo: cuando una medida se convierte en objetivo, deja de ser una buena medida. Ejemplo: si medís commits por persona, aparecen commits más chicos y nadie hace pairing ni ayuda a otros, porque eso no suma. Ante un pedido de medir productividad individual, lo útil es preguntar qué decisión se quiere tomar y responder con métricas de equipo y evidencia cualitativa. El error común es usar líneas de código, commits o story points para evaluar personas.',
        },
        {
          text: 'Mejorar la predictibilidad de un equipo',
          explanation:
            'Un equipo impredecible suele tener demasiado trabajo en paralelo, tareas grandes y poco definidas, interrupciones no planificadas y dependencias externas no gestionadas. Las palancas son: limitar el trabajo en curso para terminar antes de empezar, dividir el trabajo en partes chicas que se entreguen en días, separar la capacidad de soporte e imprevistos, y gestionar dependencias explícitamente con otros equipos. Para pronosticar conviene usar datos históricos de throughput y tiempos de ciclo, y dar rangos con nivel de confianza en vez de fechas únicas. Ejemplo: "con el ritmo de las últimas seis semanas, hay un 85% de probabilidad de terminar entre el 10 y el 24 de marzo". También ayuda revisar en cada retro por qué se desvió el plan. El error común es exigir estimaciones más precisas en vez de reducir la variabilidad del trabajo, o tratar las estimaciones como compromisos y castigar los desvíos.',
        },
        {
          text: 'Ser dueño de los incidentes como manager',
          explanation:
            'Durante un incidente, el manager asegura que haya un incident commander claro, que alguien se encargue de comunicar a stakeholders y clientes sin interrumpir a quienes resuelven, y que en incidentes largos haya relevos para que nadie trabaje agotado. No conviene que el manager tome el teclado salvo que sea realmente quien mejor puede resolverlo. Después impulsa un postmortem sin culpables: qué pasó, por qué el sistema lo permitió, qué funcionó en la respuesta y qué acciones concretas, con responsable y fecha, evitan que se repita. Su responsabilidad específica es que esas acciones entren en la planificación y se hagan. Ejemplo: tras una caída por un certificado vencido, la acción "alertar 30 días antes de cada vencimiento" se prioriza en el sprint siguiente y se revisa en la reunión mensual de confiabilidad. El error común es buscar culpables, que hace que la próxima vez la gente oculte información.',
        },
      ],
    },
    {
      id: 'organizacion-y-equipos',
      title: 'Diseño organizacional, team topologies y manejar managers',
      body: [
        'A partir de senior EM, el trabajo pasa de manejar un equipo a diseñar el sistema de equipos. La ley de Conway dice que la arquitectura termina reflejando la estructura de comunicación de la organización, así que cómo dividís a las personas condiciona el software que se construye.',
        'Team Topologies ofrece un vocabulario útil: equipos alineados a un flujo de valor, de plataforma, habilitadores y de subsistema complicado, con tres modos de interacción (colaboración, X como servicio y facilitación) y la carga cognitiva como restricción principal.',
        'Manejar managers es un trabajo distinto: tu señal sobre los equipos es indirecta, tu impacto pasa por hacer crecer a otros líderes y tenés que darles autonomía real. Los skip-levels, las métricas de salud y la calibración entre managers son herramientas clave.',
        'También vas a manejar headcount y presupuesto: planificar crecimiento, justificar contrataciones y decidir dónde invertir la capacidad de la organización.',
      ],
      checklist: [
        {
          text: 'Explicar la ley de Conway y la maniobra inversa',
          explanation:
            'La ley de Conway dice que las organizaciones diseñan sistemas que copian su estructura de comunicación. Si tenés un equipo de frontend, uno de backend y uno de base de datos, tu arquitectura va a tener esas capas con interfaces entre ellas, y cada feature va a requerir coordinar a los tres equipos. La maniobra inversa de Conway consiste en diseñar primero la estructura de equipos que produce la arquitectura deseada. Ejemplo: si querés servicios independientes por dominio (catálogo, checkout, envíos), armás equipos completos por dominio con frontend, backend y datos, y cada uno puede entregar de punta a punta sin esperar a otros. Por eso las decisiones de organización y de arquitectura se toman juntas, idealmente con el arquitecto o los staff engineers. El error común es reorganizar equipos sin considerar qué dueño queda de cada parte del sistema, generando servicios huérfanos o con varios dueños.',
        },
        {
          text: 'Usar los tipos de equipo de Team Topologies',
          explanation:
            'Team Topologies, de Skelton y Pais, propone cuatro tipos de equipos. Los alineados a un flujo (stream-aligned) entregan valor de punta a punta en un dominio y son la mayoría. Los de plataforma ofrecen servicios internos de autoservicio que reducen la carga cognitiva de los anteriores, como pipelines, observabilidad o infraestructura. Los habilitadores (enabling) ayudan temporalmente a otros equipos a adquirir una capacidad, como testing o seguridad. Los de subsistema complicado se ocupan de una parte que requiere especialización profunda, como un motor de pricing o de video. Ejemplo: si cada equipo de producto pierde un día por semana peleando con su infraestructura de deploy, un equipo de plataforma con una plantilla estándar les devuelve esa capacidad. El concepto central es la carga cognitiva: un equipo no puede ser dueño de más de lo que puede entender. El error común es crear equipos de plataforma que funcionan por tickets y se vuelven un cuello de botella en vez de un producto de autoservicio.',
        },
        {
          text: 'Hacer crecer y evaluar a managers que reportan a vos',
          explanation:
            'Cuando manejás managers, tu impacto pasa por ellos: contratarlos bien, darles contexto y objetivos claros, delegarles autoridad real y hacerlos crecer con feedback y coaching. Como no ves el día a día de sus equipos, necesitás señales indirectas: skip-levels periódicos, encuestas de clima, rotación, predictibilidad de la entrega, calidad de sus evaluaciones y de sus casos de promoción, y cómo los perciben sus pares. Las señales se contrastan con el manager antes de sacar conclusiones. Ejemplo: en skip-levels aparece que un equipo no recibe feedback; el manager reconoce que evita conversaciones difíciles; acuerdan practicar con role play y que él lleve las próximas dos conversaciones con tu apoyo. Para un manager nuevo conviene un plan de transición con mentoría. El error común es saltearte a tus managers y dar indicaciones directamente a sus equipos, que les quita autoridad.',
        },
        {
          text: 'Justificar headcount y gestionar presupuesto',
          explanation:
            'Un pedido de headcount se aprueba cuando se conecta con objetivos de negocio y muestra el costo de no hacerlo. Conviene mostrar cómo se usa hoy la capacidad (porcentaje en producto, mantenimiento, soporte e incidentes), qué iniciativas quedan afuera y qué alternativas se evaluaron: reprioritizar, automatizar, usar contratistas o reasignar entre equipos. El costo real de una contratación incluye salario, cargas, herramientas, tiempo de reclutamiento y meses hasta que la persona sea productiva, y además una persona nueva reduce temporalmente la capacidad de quienes la acompañan. Ejemplo: "hoy el 45% del equipo se va en soporte del sistema legado; con dos personas en un equipo de plataforma reducimos eso al 20% en dos trimestres y liberamos el equivalente a tres personas para producto". El error común es pedir gente porque "estamos sobrecargados", sin datos ni opciones.',
        },
        {
          text: 'Planificar y comunicar una reorganización',
          explanation:
            'Una reorganización tiene un costo alto: semanas de productividad perdida, relaciones que se rompen e incertidumbre, así que tiene que resolver un problema claro, como dependencias excesivas o falta de ownership. Se diseña con un grupo chico, se valida con personas clave y se prepara la comunicación por capas: primero los managers afectados, después conversaciones individuales con cada persona que cambia de equipo o manager, y después el anuncio general con el por qué. Hay que tener respuestas para las preguntas obvias: quién es mi manager, qué pasa con mi proyecto, cambia mi rol. Ejemplo: pasar de equipos por capas a equipos por dominio se anuncia un lunes, con todas las conversaciones individuales hechas el viernes anterior y un documento de preguntas frecuentes. Después hay que seguir de cerca los primeros meses y ajustar. El error común es que la gente se entere por rumores o reorganizar con frecuencia, que destruye la confianza.',
        },
      ],
    },
    {
      id: 'stakeholders-y-cambio',
      title: 'Stakeholders, gestión hacia arriba, cambio y despidos',
      body: [
        'Un engineering manager pasa buena parte de su tiempo fuera del equipo: con producto, con otras áreas de ingeniería, con su jefe y con la dirección. Gestionar hacia arriba significa mantener a tu jefe informado, sin sorpresas, traer problemas con propuestas y entender sus prioridades y presiones.',
        'Los desacuerdos con la dirección son inevitables. Se espera que los plantees en privado, con datos y alternativas, y que una vez tomada la decisión la apoyes ante tu equipo, salvo que sea ética o legalmente inaceptable.',
        'Liderar cambios en varios equipos requiere más influencia que autoridad: empezar por el problema, probar con un piloto, sumar aliados y medir resultados. Los cambios impuestos sin explicación generan resistencia pasiva.',
        'En senior te pueden preguntar por despidos masivos y por comunicar decisiones que no tomaste vos. Ahí se evalúa tu humanidad y tu integridad tanto como tu capacidad de ejecución.',
      ],
      checklist: [
        {
          text: 'Gestionar la relación con tu propio jefe',
          explanation:
            'Gestionar hacia arriba es hacer que tu jefe tenga la información que necesita para decidir y apoyarte, sin sorpresas. En la práctica: un update escrito regular con avances, riesgos y decisiones necesarias; malas noticias apenas aparecen y con propuestas; y entender sus objetivos y presiones para alinear tu trabajo con ellos. También conviene acordar explícitamente qué decisiones tomás vos solo, cuáles le consultás y cuáles le informás después. Ejemplo: "el lanzamiento está en riesgo por la dependencia con el equipo de identidad; propongo lanzar sin login social y agregarlo en la siguiente versión, ¿estás de acuerdo o preferís que escale con su manager?". Pedile feedback sobre tu trabajo con la misma frecuencia que se lo das a tu equipo. El error común es aparecer solo con problemas, o esconderlos hasta tenerlos resueltos y que tu jefe se entere por otro lado.',
        },
        {
          text: 'Manejar un desacuerdo con la dirección con "disagree and commit"',
          explanation:
            'Cuando no estás de acuerdo con una decisión de tu jefe o de la dirección, lo planteás en privado y a tiempo, entendiendo primero el contexto que te falta, con datos sobre el riesgo y con alternativas concretas. Si después de escucharte la decisión se mantiene, la apoyás públicamente y la ejecutás bien: eso es "disagree and commit". Ante tu equipo explicás el por qué de la decisión sin culpar a "los de arriba", porque eso erosiona la confianza en toda la organización. Ejemplo: la dirección quiere lanzar en una fecha que ves riesgosa; mostrás el último incidente por falta de pruebas de carga y proponés lanzar al 10% de usuarios; si igual se decide lanzar completo, preparás el plan de rollback y monitoreo. La excepción son las decisiones éticamente o legalmente inaceptables, que se escalan. El error común es acatar en silencio y después sabotear o quejarse con el equipo.',
        },
        {
          text: 'Liderar un cambio que afecta a varios equipos',
          explanation:
            'Los cambios fallan más por resistencia y falta de adopción que por mal diseño. El proceso que funciona: empezar por el problema, con datos que los equipos reconozcan, antes de proponer la solución; sumar a referentes respetados que ayuden a diseñarla; probar con un equipo piloto voluntario; medir y ajustar; y recién después extender, con ayuda concreta como plantillas, herramientas, tiempo y acompañamiento. Modelos como el de Kotter o ADKAR describen estas etapas: urgencia, coalición, visión, quick wins, consolidación. Ejemplo: para adoptar RFCs para cambios de arquitectura, se prueba con dos equipos un trimestre, se muestra que evitó una migración duplicada y se simplifica la plantilla según su feedback antes de pedírselo a todos. El error común es anunciar el cambio por mail con un mandato y una fecha, sin explicar el problema ni dar tiempo para adoptarlo.',
        },
        {
          text: 'Llevar adelante un recorte de personal con humanidad',
          explanation:
            'Si participás en la decisión, los criterios tienen que ser claros, ligados al negocio, validados con RR. HH. y legal, y aplicados de forma consistente. La comunicación a cada persona afectada es individual, breve y clara: la decisión está tomada, no es negociable, y se explican las condiciones concretas (indemnización, cobertura, carta de recomendación, accesos). Con quienes se quedan, se comunica rápido y con honestidad el por qué, se reconoce el impacto emocional y, sobre todo, se ajustan las prioridades, porque el mismo plan con menos gente quema al equipo. Ejemplo: después de un recorte del 15%, el director cancela dos iniciativas del roadmap, redistribuye ownership de servicios y hace 1:1s con cada persona en la primera semana. El error común es comunicar con lenguaje corporativo vacío, prometer que "no va a haber más recortes" sin saberlo o seguir como si nada hubiera pasado.',
        },
        {
          text: 'Explicar qué tan técnico tenés que ser como manager',
          explanation:
            'Un engineering manager necesita criterio técnico suficiente para entender los trade-offs de su equipo, detectar riesgos, hacer buenas preguntas en revisiones de diseño, evaluar a ingenieros en contrataciones y promociones, y tener credibilidad con el equipo y con otras áreas. No necesita ser quien toma las decisiones técnicas ni escribir código del camino crítico: eso lo convierte en cuello de botella y le quita espacio al tech lead y al equipo. Cuanto más alto el nivel, más se mueve hacia el criterio de arquitectura y estrategia técnica y menos hacia el detalle. Ejemplo de aporte valioso: en una revisión preguntás cómo se revierte la migración de datos si falla a mitad de camino, y el equipo agrega un plan de rollback que después se usa. Para mantenerse al día sirve leer RFCs, participar en revisiones de arquitectura, hacer guardias ocasionales o algún proyecto chico fuera del camino crítico. El error común en la entrevista es exagerar en cualquier dirección: "sigo programando el 50%" o "ya no miro nada técnico".',
        },
      ],
    },
  ],
};
