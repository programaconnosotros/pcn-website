import type { InterviewQuestion, Seniority } from './types';

export const engineeringManagerQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'rol',
      question: '¿Qué hace un engineering manager y en qué se diferencia de un tech lead?',
      answer:
        'El engineering manager es responsable de las personas y del equipo como sistema: contratar, hacer crecer, dar feedback, evaluar desempeño y asegurar que el equipo entregue de forma sostenible. El tech lead es responsable de la dirección técnica: arquitectura, calidad del código, decisiones de diseño y destrabar problemas técnicos. Se solapan en la entrega y en el criterio técnico, pero el EM responde por la salud y el crecimiento del equipo y el tech lead por la salud del sistema. Una buena respuesta muestra que entendés que tu éxito ahora se mide por lo que logra el equipo, no por lo que vos programás.',
    },
    {
      topic: 'rol',
      question: '¿En qué se diferencia un engineering manager de un product manager?',
      answer:
        'El product manager decide qué construir y por qué, según el valor para usuarios y negocio. El engineering manager se ocupa de quién lo construye y cómo trabaja el equipo para entregarlo bien y de forma sostenible: capacidad, procesos, calidad, personas. Se necesitan mutuamente: el PM trae el problema y las prioridades, el EM trae la capacidad real del equipo, los riesgos técnicos y la deuda que hay que pagar. Ejemplo: el PM quiere tres features para el trimestre; el EM muestra que con dos personas de licencia y la migración pendiente entran dos, y negocian juntos qué queda afuera.',
    },
    {
      topic: 'transición',
      question: '¿Qué fue lo más difícil de pasar de ingeniero a manager?',
      answer:
        'Lo que más se repite es soltar el código y aceptar que el impacto ahora es indirecto y con feedback lento: ya no hay un PR mergeado que te diga que hiciste un buen día. Una buena respuesta es honesta sobre un error concreto, por ejemplo seguir tomando tareas críticas y convertirte en el cuello de botella, y cuenta qué cambiaste: delegar con contexto, bloquear tiempo para 1:1s y dejar de medir tu día en tickets. Mostrá que hiciste el duelo del rol anterior y que te interesa genuinamente el trabajo con personas.',
    },
    {
      topic: '1:1s',
      question: '¿Cómo llevás tus 1:1s con cada persona del equipo?',
      answer:
        'Semanales o quincenales, de 30 minutos, que nunca se cancelan (como mucho se mueven) y cuya agenda es principalmente de la otra persona. No son reportes de estado: son para hablar de cómo está, qué la frena, su carrera, feedback en ambas direcciones y lo que no se dice en público. Una buena respuesta menciona un documento compartido con notas y acciones para darle continuidad, y adaptar el formato a cada persona. Ejemplo: con alguien callado, llevar preguntas concretas como "¿qué fue lo más frustrante de esta semana?" en vez de "¿cómo va todo?".',
    },
    {
      topic: 'feedback',
      question: '¿Cómo das feedback negativo a alguien de tu equipo?',
      answer:
        'En privado, pronto y concreto, con un modelo como SBI: la situación, el comportamiento observable y el impacto, seguido de una pregunta para entender su lado y un acuerdo sobre qué cambia. Se habla de hechos, no de rasgos de personalidad: "en la review de ayer cortaste dos veces a Ana y ella dejó de opinar" en vez de "sos agresivo". Una buena respuesta agrega que el feedback positivo también es específico y frecuente, para que el negativo no sea la única señal. El error común es guardar todo para la evaluación anual, donde llega tarde y sorprende.',
    },
    {
      topic: 'delegación',
      question: '¿Qué hacés si seguís agarrando las tareas técnicas más difíciles del equipo?',
      answer:
        'Reconocer que, como manager, eso te vuelve un cuello de botella y le saca al equipo las oportunidades de crecer. Lo sano es delegar esas tareas con contexto y acompañamiento: elegir a alguien para quien sea un desafío alcanzable, explicar el por qué y los criterios de éxito, y estar disponible sin tomar el control. Podés seguir aportando técnicamente en cosas fuera del camino crítico, como revisar diseños, mejorar herramientas o pagar deuda chica. Ejemplo: le das la migración del servicio de pagos a una semi-senior, revisan juntos el plan y vos hacés de reviewer en vez de autor.',
    },
    {
      topic: 'confianza',
      question: '¿Cómo construís confianza con un equipo que recién heredás?',
      answer:
        'Primero escuchar: 1:1s con cada persona preguntando qué funciona, qué no, qué cambiarían y qué esperan de su manager, y no cambiar nada grande en las primeras semanas. Después cumplir lo que prometés, aunque sean cosas chicas, y ser transparente con lo que sabés y lo que no. Una buena respuesta incluye devolverle al equipo lo que escuchaste y elegir una o dos mejoras visibles para empezar. El error común es llegar con un plan de cambios armado antes de entender por qué las cosas están como están.',
    },
    {
      topic: 'seguridad psicológica',
      question: '¿Qué es la seguridad psicológica y cómo la fomentás en tu equipo?',
      answer:
        'Es la creencia compartida de que en el equipo se puede asumir riesgos interpersonales, como preguntar, admitir un error o discrepar, sin ser castigado o humillado. Google la encontró como el factor más importante de los equipos efectivos en el proyecto Aristotle. Se fomenta con el ejemplo: admitir tus propios errores, agradecer a quien levanta un problema, hacer postmortems sin culpables y preguntar activamente la opinión de quienes hablan menos. No significa evitar el conflicto ni bajar la exigencia, sino que el desacuerdo sea sobre ideas y no sobre personas.',
    },
    {
      topic: 'contratación',
      question: '¿Cómo te preparás para hacer una entrevista técnica como entrevistador?',
      answer:
        'Saber qué competencias evalúa tu etapa y con qué criterios, tener las preguntas y la rúbrica de antemano y leer el CV para no preguntar lo que ya está ahí. Durante la entrevista: presentarte, explicar el formato, dejar tiempo para sus preguntas y tomar notas de lo que la persona dijo e hizo, no de impresiones. Después, escribir el feedback antes de hablar con el resto del panel para no contaminarte. Una buena respuesta menciona tratar a todos los candidatos igual con las mismas preguntas, porque reduce sesgos y hace comparables las decisiones.',
    },
    {
      topic: 'conflictos',
      question: '¿Qué hacés si dos personas de tu equipo están en conflicto?',
      answer:
        'Primero hablar por separado con cada una para entender su versión, los hechos y qué necesita, sin tomar partido. Muchas veces el conflicto es por expectativas o responsabilidades poco claras, y se resuelve aclarándolas. Si hace falta, facilitar una conversación entre ambas centrada en el problema y en acuerdos concretos, y hacer seguimiento. Ejemplo: dos devs chocan en cada code review; descubrís que no hay estándares acordados, el equipo define una guía de estilo y los comentarios dejan de ser personales. Si el conflicto es por falta de respeto, eso se trata como un tema de desempeño, no como un desacuerdo.',
    },
    {
      topic: 'carga de trabajo',
      question: '¿Cómo te das cuenta de que alguien de tu equipo está quemado?',
      answer:
        'Por cambios respecto de su comportamiento habitual: menos participación, cinismo, irritabilidad, errores poco comunes, horarios cada vez más extendidos o lo contrario, desconexión total. También por señales del contexto: muchas guardias, un proyecto largo en crisis, la persona que todos consultan para todo. Lo importante es preguntar directamente en el 1:1 y actuar sobre la causa: redistribuir trabajo, sacarle guardias, cuidar que se tome vacaciones. Ejemplo: notás que alguien responde mensajes a las 2 a.m. hace semanas, lo hablan y la sacás de la rotación de soporte por un mes.',
    },
    {
      topic: 'entrega',
      question: '¿Qué hacés si el equipo no va a llegar a una fecha comprometida?',
      answer:
        'Avisar apenas lo sabés, no el día anterior, con un diagnóstico y opciones: recortar alcance, mover la fecha o, en pocos casos, sumar ayuda concreta. Antes de avisar, entender por qué pasó (subestimación, interrupciones, dependencias) para no repetirlo. No pedirle al equipo horas extra como solución por defecto, porque cuesta calidad y salud. Ejemplo: "la integración con el proveedor se atrasó dos semanas; podemos lanzar el 15 sin el pago en cuotas o el 29 completo; recomiendo la primera".',
    },
    {
      topic: 'onboarding',
      question: '¿Cómo armás el onboarding de una persona nueva en el equipo?',
      answer:
        'Con un plan escrito para los primeros 30-60-90 días: accesos y entorno listos el primer día, un buddy asignado, documentación de la arquitectura y del proceso, y una primera tarea chica que llegue a producción en la primera semana. Incluir 1:1s más frecuentes al principio y presentaciones con las personas clave de otros equipos. Una buena respuesta pide a cada persona nueva que mejore la documentación del onboarding con lo que le faltó. Ejemplo de métrica simple: días hasta el primer deploy.',
    },
    {
      topic: 'comportamiento',
      question: 'Contame de una vez que cometiste un error como manager y qué aprendiste.',
      answer:
        'Elegí un error real y con consecuencias, no uno disfrazado de virtud como "soy muy perfeccionista". Contá el contexto, qué hiciste, el impacto en el equipo y qué cambiaste después. Ejemplo: tardaste meses en dar feedback a alguien que no estaba rindiendo porque te incomodaba, el resto del equipo absorbió su trabajo y se frustró; desde entonces das feedback dentro de la semana y escribís expectativas claras. Lo que se evalúa es la autocrítica y la capacidad de aprender, no que no te equivoques.',
    },
    {
      topic: 'prioridades',
      question: '¿Cómo repartís tu tiempo entre personas, entrega y trabajo técnico?',
      answer:
        'No hay una proporción fija, pero una buena respuesta muestra que las personas tienen prioridad protegida: 1:1s, contratación y feedback no se sacrifican por urgencias. Después viene destrabar la entrega (planificación, dependencias, stakeholders) y, con lo que queda, aporte técnico que no bloquee al equipo. Conviene revisar tu calendario cada semana y preguntarte si refleja tus prioridades. Ejemplo: si notás que pasás el 60% en reuniones de estado, reemplazás algunas por un update escrito y recuperás tiempo para el equipo.',
    },
  ],
  'semi-senior': [
    {
      topic: 'desempeño',
      question: '¿Qué hacés si alguien de tu equipo tiene bajo desempeño sostenido?',
      answer:
        'Primero entender la causa: expectativas poco claras, falta de habilidades, problemas personales, mala asignación o falta de motivación, porque cada una tiene un remedio distinto. Después dejar las expectativas por escrito, con ejemplos concretos de la brecha, plazos y apoyo, y hacer seguimiento semanal. Si no hay mejora, escalar a un plan formal con RR. HH., que debe ser una oportunidad real y no un trámite para despedir. Ejemplo: un dev que entrega PRs con muchos bugs; acuerdan tests obligatorios, pairing dos veces por semana y revisan la tasa de bugs en seis semanas.',
    },
    {
      topic: 'pip',
      question: '¿Qué es un PIP y cómo lo llevarías adelante de forma justa?',
      answer:
        'Un performance improvement plan es un plan formal, con duración definida (típicamente 30 a 90 días), que documenta la brecha entre lo esperado y lo actual, objetivos medibles, el apoyo que se va a dar y las consecuencias si no se cumplen. Para que sea justo, nada de lo que dice puede sorprender a la persona: tuvo que haber feedback previo. Se acuerda con RR. HH., se revisa cada semana con evidencia y se escribe en criterios observables. El error común es usarlo como formalidad de despido sin intención real de que la persona lo supere, cosa que el equipo nota y erosiona la confianza.',
    },
    {
      topic: 'carrera',
      question: '¿Cómo usás una career ladder para el crecimiento de tu equipo?',
      answer:
        'La ladder describe qué se espera en cada nivel en dimensiones como alcance técnico, impacto, autonomía y colaboración, y sirve como lenguaje común para conversaciones de carrera. Con cada persona identificás dónde está, a qué nivel aspira y qué evidencia falta, y armás un plan con oportunidades concretas. Una buena respuesta aclara que no es una checklist para tachar, sino ejemplos de impacto sostenido. Ejemplo: para que un semi-senior llegue a senior, le das ownership de un proyecto con dependencias de otro equipo y revisan juntos cómo lo manejó.',
    },
    {
      topic: 'promociones',
      question: '¿Cómo preparás un caso de promoción para alguien de tu equipo?',
      answer:
        'Juntás evidencia de que la persona ya trabaja al siguiente nivel de forma sostenida, no de una vez: proyectos, alcance, decisiones, impacto medible y feedback de pares y de otros equipos, mapeado a los criterios de la ladder. Lo escribís pensando en un comité que no conoce a la persona, sin jerga del equipo. Una buena respuesta incluye preparar el caso durante meses, no a último momento, y manejar las expectativas de la persona si no sale. Ejemplo: "lideró el rediseño del checkout con dos equipos, bajó los incidentes un 40% y mentoreó a dos juniors".',
    },
    {
      topic: 'evaluaciones',
      question: '¿Cómo hacés una evaluación de desempeño que sea justa?',
      answer:
        'Con evidencia de todo el período, no solo de las últimas semanas: notas de 1:1s, entregas, feedback de pares y resultados. Separar el qué (impacto) del cómo (comportamientos), cuidarte de sesgos de recencia, de afinidad y de efecto halo, y calibrar con otros managers para que los criterios sean comparables. La conversación no debería tener sorpresas: si alguien se entera en la evaluación de un problema, fallaste antes. Ejemplo: llevás un documento por persona con hitos y feedback del semestre, y lo usás como base en vez de tu memoria.',
    },
    {
      topic: 'contratación',
      question: '¿Cómo diseñarías el proceso de selección para un puesto de backend semi-senior?',
      answer:
        'Empezar por definir qué necesita el equipo y qué competencias evaluar, y después diseñar etapas que las midan sin redundancia: screening, un ejercicio técnico parecido al trabajo real, una entrevista de diseño, una de comportamiento y una con el equipo. Cada etapa con preguntas estándar, rúbrica y un responsable; decisiones con feedback escrito antes del debrief. Una buena respuesta cuida la experiencia del candidato: proceso corto, tiempos claros y feedback al final. Ejemplo: reemplazar un take-home de 8 horas por un pairing de 90 minutos sobre un bug real del dominio.',
    },
    {
      topic: 'cierre',
      question: '¿Qué hacés si tu candidato preferido recibe una oferta mejor de otra empresa?',
      answer:
        'Entender qué le importa realmente (dinero, crecimiento, tipo de trabajo, flexibilidad, equipo) antes de reaccionar, porque no siempre es solo el salario. Si hay margen, negociar con RR. HH. dentro de las bandas para no generar inequidad con el equipo actual. Si no, competir con lo que sí podés ofrecer: el problema, el equipo, la autonomía, un camino de crecimiento concreto. Ejemplo: no podés igualar el sueldo, pero ofrecés empezar como responsable técnico del nuevo servicio y una revisión salarial a los seis meses con criterios escritos.',
    },
    {
      topic: 'métricas',
      question: '¿Qué son las métricas DORA y cómo las usarías con tu equipo?',
      answer:
        'Son cuatro métricas de desempeño de entrega: frecuencia de deploy, lead time de cambios, tasa de fallas de cambios y tiempo de recuperación ante fallas. Miden el sistema de entrega, no a las personas, y sirven para detectar cuellos de botella y ver si las mejoras funcionan. Las usaría como conversación del equipo, mirando tendencias y no números absolutos, y nunca como objetivos individuales ni para comparar equipos. Ejemplo: el lead time es de nueve días y la mayoría se pierde esperando review; el equipo acuerda revisar PRs dentro del día y el lead time baja a tres.',
    },
    {
      topic: 'métricas',
      question:
        '¿Qué pasa si la dirección te pide medir la productividad individual de cada desarrollador?',
      answer:
        'Explicar que las métricas individuales como commits, líneas de código o story points se gamifican rápido y empeoran la colaboración: la ley de Goodhart dice que cuando una medida se vuelve objetivo deja de ser buena medida. Proponer en cambio entender qué pregunta hay detrás (¿por qué se entrega lento?, ¿estamos bien dimensionados?) y responderla con métricas de equipo como DORA y un marco más amplio como SPACE, que suma satisfacción, colaboración y flujo. La evaluación individual se hace con evidencia cualitativa e impacto. Ejemplo: en vez de un ranking de PRs, mostrás que el cuello de botella son los ambientes de test.',
    },
    {
      topic: 'roadmap',
      question: '¿Cómo trabajás con producto para armar el roadmap del trimestre?',
      answer:
        'Producto trae los problemas y prioridades de negocio; vos traés la capacidad real (vacaciones, guardias, soporte), los riesgos técnicos y el trabajo de plataforma o deuda necesario. Se negocia una distribución explícita, por ejemplo 70% producto, 20% deuda y confiabilidad, 10% imprevistos, y se estiman los grandes bloques por tamaño, no al detalle. Una buena respuesta muestra que el roadmap se comunica como compromisos y apuestas diferenciados. Ejemplo: comprometés dos iniciativas y marcás una tercera como "si llegamos", en vez de prometer las tres.',
    },
    {
      topic: 'deuda técnica',
      question: '¿Cómo convencés a producto de invertir en deuda técnica?',
      answer:
        'Traduciendo la deuda a impacto que producto y negocio entienden: velocidad de entrega, incidentes, tiempo de onboarding, riesgo. En vez de "hay que refactorizar el módulo de pedidos", decir "cada feature en pedidos tarda el doble y causó tres incidentes este trimestre; con cuatro semanas de trabajo bajamos eso a la mitad". Ayuda tener una asignación fija de capacidad para deuda y priorizarla por costo de no hacerla. El error común es pedirla en abstracto o hacerla escondida, que rompe la confianza con producto.',
    },
    {
      topic: 'incidentes',
      question: '¿Cuál es tu rol como manager durante y después de un incidente grave?',
      answer:
        'Durante: asegurarte de que haya un incident commander claro, que la comunicación a stakeholders salga sin interrumpir a quienes resuelven y que nadie esté solo ni agotado en incidentes largos. No metas las manos en el teclado salvo que seas realmente la mejor persona para eso. Después: impulsar un postmortem sin culpables, con causas sistémicas y acciones con responsable y fecha, y asegurarte de que esas acciones tengan lugar en el roadmap. Ejemplo: la acción "agregar alertas de saturación del pool de conexiones" entra en el sprint siguiente en vez de quedar en un documento olvidado.',
    },
    {
      topic: 'remoto',
      question: '¿Cómo manejás un equipo distribuido en varias zonas horarias?',
      answer:
        'Haciendo que el trabajo funcione de forma asincrónica por defecto: decisiones escritas, documentos de diseño, updates en texto y reuniones grabadas. Definir una ventana de solapamiento corta para lo que necesita estar en vivo y rotar los horarios incómodos para que no los pague siempre la misma región. Cuidar la conexión humana con espacios informales y algún encuentro presencial. Ejemplo: reemplazar la daily sincrónica por un update escrito y dejar una sola reunión semanal en el horario de solapamiento.',
    },
    {
      topic: 'comportamiento',
      question: 'Contame de una vez que tuviste que dar una noticia difícil a tu equipo.',
      answer:
        'Usá STAR: contexto, qué noticia era (un proyecto cancelado, un cambio de prioridades, una reestructura, un aumento que no salió), cómo lo preparaste y cómo lo comunicaste. Una buena respuesta muestra que lo dijiste rápido, directo y con el por qué, sin culpar a "los de arriba", que dejaste espacio para las reacciones y que hiciste seguimiento individual con quienes más los afectaba. Ejemplo: cancelaron el proyecto en el que el equipo trabajó tres meses; explicaste el motivo de negocio, reconociste el trabajo, rescataste lo reutilizable y hablaste uno a uno con los más involucrados.',
    },
    {
      topic: 'retención',
      question: '¿Qué hacés si tu mejor ingeniera te dice que está pensando en irse?',
      answer:
        'Agradecer la confianza y escuchar sin ponerte a la defensiva para entender qué la motiva: crecimiento, dinero, el tipo de trabajo, un conflicto, cansancio. Ver qué se puede cambiar de verdad y en qué plazo, sin prometer lo que no controlás. Si el motivo es algo que la empresa no puede ofrecer, apoyar su decisión y planificar la transición con respeto, porque la relación sigue. Ejemplo: quería trabajar en infraestructura; le armaste una rotación al equipo de plataforma y se quedó en la empresa aunque no en tu equipo.',
    },
  ],
  senior: [
    {
      topic: 'managers',
      question: '¿En qué cambia tu trabajo cuando pasás a manejar managers?',
      answer:
        'Dejás de tener contacto directo con la mayoría de los ingenieros y tu impacto pasa por las personas que manejan equipos: contratarlas, hacerlas crecer y darles contexto y autonomía. Tu trabajo se vuelve más de sistemas: estructura de equipos, procesos comunes, calibración, planificación y estrategia con otras áreas. Una buena respuesta menciona hacer skip-levels para tener señal directa sin pasar por encima de tus managers. El error común es seguir manejando a los equipos directamente y dejar a tus managers sin autoridad real.',
    },
    {
      topic: 'managers',
      question: '¿Cómo te das cuenta de que uno de tus managers no está funcionando?',
      answer:
        'Por señales indirectas, porque no lo ves en el día a día: rotación o pedidos de cambio de equipo, encuestas de clima bajas, skip-levels donde aparecen temas que el manager nunca mencionó, entregas impredecibles, escalaciones frecuentes o sorpresas en las evaluaciones. Después hay que contrastar con el manager y darle feedback concreto y apoyo, como coaching o un mentor. Ejemplo: en skip-levels tres personas te dicen que hace un mes no tienen 1:1; lo hablás con el manager, descubrís que está sobrecargado con contratación y redistribuís.',
    },
    {
      topic: 'organización',
      question: '¿Cómo decidís cómo dividir una organización de 40 ingenieros en equipos?',
      answer:
        'Partiendo de la ley de Conway: la estructura de equipos va a terminar reflejada en la arquitectura, así que hay que diseñar ambas juntas. Buscar equipos de 5 a 8 personas con ownership claro y de punta a punta sobre un dominio, minimizando dependencias entre equipos. Team Topologies da un vocabulario útil: equipos alineados a un flujo, de plataforma, habilitadores y de subsistema complicado, con modos de interacción definidos. Ejemplo: separar por dominios de negocio (catálogo, checkout, logística) en vez de por capas (frontend, backend, base de datos), que obligaba a coordinar tres equipos para cada feature.',
    },
    {
      topic: 'team topologies',
      question: '¿Cuándo crearías un equipo de plataforma?',
      answer:
        'Cuando varios equipos de producto resuelven los mismos problemas de infraestructura por separado y eso les consume una parte significativa de su capacidad o carga cognitiva: deploys, observabilidad, entornos, autenticación. El equipo de plataforma ofrece eso como un producto interno con autoservicio, con los equipos de producto como clientes. Una buena respuesta menciona el riesgo de crearlo demasiado pronto o de que se vuelva un cuello de botella de tickets. Ejemplo: cada equipo mantiene su pipeline de CI distinto; una plataforma ofrece una plantilla estándar y el tiempo de creación de un servicio nuevo baja de dos semanas a un día.',
    },
    {
      topic: 'reestructura',
      question: '¿Cómo llevarías adelante una reorganización de equipos?',
      answer:
        'Con un problema claro que la reorganización resuelve, porque reorganizar tiene un costo alto en productividad y confianza. Diseñarla con un grupo chico, consultar a personas clave, preparar la comunicación por niveles (primero los managers afectados, después cada persona individualmente y después el anuncio general) y tener respuestas para las preguntas obvias: quién es mi manager, qué pasa con mi proyecto. Después hacer seguimiento cercano en las semanas siguientes. Ejemplo: pasar de equipos por capas a equipos por dominio, anunciado en un día con conversaciones individuales previas y un documento de preguntas frecuentes.',
    },
    {
      topic: 'despidos',
      question: '¿Cómo manejarías tener que hacer un recorte de personal en tu organización?',
      answer:
        'Primero, si tenés voz en la decisión, usar criterios claros y defendibles ligados al negocio y validados con RR. HH. y legal, no al humor del momento. La comunicación a cada persona afectada es individual, breve, humana y clara sobre que la decisión está tomada, con información concreta de indemnización y próximos pasos. Con quienes se quedan, explicar el por qué, reconocer el impacto y replantear las prioridades, porque el mismo trabajo con menos gente quema a todos. Ejemplo: después del recorte, cortás dos iniciativas del roadmap en vez de redistribuirlas.',
    },
    {
      topic: 'despidos',
      question: 'Contame de una vez que tuviste que desvincular a alguien.',
      answer:
        'Una buena respuesta muestra que la decisión no fue una sorpresa para la persona: hubo feedback previo, expectativas escritas y una oportunidad real de mejorar. Contá cómo la preparaste con RR. HH., cómo fue la conversación (corta, directa, sin debatir la decisión, cuidando la dignidad) y cómo lo comunicaste al equipo sin exponer detalles. También qué aprendiste, por ejemplo haber actuado antes. Lo que se evalúa es que podés tomar decisiones difíciles con responsabilidad y empatía, no que te resulte fácil.',
    },
    {
      topic: 'presupuesto',
      question: '¿Cómo justificás pedir más headcount para tu organización?',
      answer:
        'Conectando el pedido con objetivos de negocio y mostrando el costo de no hacerlo, no con "estamos sobrecargados". Mostrar en qué se usa hoy la capacidad (producto, mantenimiento, soporte, incidentes), qué iniciativas no entran y qué alternativas consideraste: reprioritizar, automatizar, contratistas. Una buena respuesta propone un plan de contratación escalonado, con el costo total (no solo salario) y el tiempo hasta que la persona sea productiva. Ejemplo: "sin dos personas más, el lanzamiento en Brasil se mueve dos trimestres; con ellas llega en Q3".',
    },
    {
      topic: 'stakeholders',
      question: '¿Cómo gestionás hacia arriba a un VP que cambia las prioridades cada semana?',
      answer:
        'Entender qué lo lleva a cambiar: presión de arriba, falta de información, miedo a una competencia. Después hacer visible el costo del cambio de contexto con datos (trabajo empezado y abandonado, fechas que se mueven) y proponer un mecanismo: prioridades revisadas cada dos semanas o un buffer de capacidad para urgencias reales. Una buena respuesta no se queja del VP sino que busca alinear incentivos. Ejemplo: le mostrás que en el último trimestre se empezaron nueve iniciativas y se terminaron dos, y acuerdan congelar prioridades por sprint.',
    },
    {
      topic: 'cambio',
      question: '¿Cómo introducís un cambio de proceso grande en varios equipos que no lo piden?',
      answer:
        'Empezando por el problema y no por la solución: que los equipos reconozcan el dolor antes de discutir cómo resolverlo. Probar con un equipo piloto voluntario, medir resultados, ajustar y usar ese caso como evidencia; sumar a referentes técnicos respetados como aliados. Cuidar que el cambio tenga ayuda concreta (plantillas, herramientas, tiempo) y no solo un mandato. Ejemplo: para adoptar on-call compartido, un equipo lo prueba dos meses, se reducen los incidentes sin dueño, y los demás se suman con ese aprendizaje.',
    },
    {
      topic: 'criterio técnico',
      question: '¿Qué tan técnico tiene que ser un engineering manager senior?',
      answer:
        'Lo suficiente para hacer buenas preguntas, detectar riesgos, evaluar el criterio de los ingenieros en las contrataciones y promociones, y participar con credibilidad en decisiones de arquitectura con impacto en la organización. No tiene que escribir código del camino crítico ni ser quien toma las decisiones técnicas, que deberían estar en los equipos y en los staff engineers. Una buena respuesta explica cómo se mantiene al día: leer diseños, participar en revisiones de arquitectura, hacer algún proyecto chico. Ejemplo: en una revisión preguntás cómo se hace el rollback de la migración de datos y eso evita un incidente.',
    },
    {
      topic: 'conflictos',
      question: '¿Qué hacés si dos de tus managers tienen un conflicto que afecta a sus equipos?',
      answer:
        'Primero hablar con cada uno por separado para entender la situación y si la causa es estructural (ownership poco claro, incentivos opuestos, recursos compartidos) o de relación. Los conflictos estructurales se resuelven aclarando responsabilidades o cambiando la estructura, no pidiendo que se lleven bien. Después facilitar una conversación entre ambos con acuerdos escritos, y dejar claro que se espera que lo resuelvan entre ellos la próxima vez. Ejemplo: dos equipos se pelean por quién mantiene el servicio de notificaciones; definís un dueño único y un acuerdo de interfaz.',
    },
    {
      topic: 'cultura',
      question: '¿Cómo construís una cultura de ingeniería en una organización que crece rápido?',
      answer:
        'Haciendo explícito lo que antes era implícito: principios de ingeniería escritos, guías de onboarding, una career ladder, procesos de diseño (RFCs, ADRs) y de incidentes. La cultura se transmite más por lo que se premia y se tolera que por lo que se escribe, así que las promociones, las contrataciones y la forma de reaccionar ante errores tienen que ser coherentes con los principios. Una buena respuesta cuida que la contratación rápida no baje el nivel. Ejemplo: al pasar de 20 a 60 ingenieros, formalizar el proceso de RFC evitó que cada equipo decidiera tecnologías por separado.',
    },
    {
      topic: 'diversidad',
      question: '¿Qué hacés para que tu proceso de contratación sea más diverso e inclusivo?',
      answer:
        'Ampliar las fuentes de candidatos más allá de los referidos, que tienden a reproducir el perfil del equipo, revisar los avisos para quitar requisitos innecesarios y lenguaje excluyente, y usar entrevistas estructuradas con rúbricas que reducen sesgos. Paneles diversos y debriefs donde se discuta evidencia, no "fit cultural". Medir el embudo por etapa para encontrar dónde se pierde diversidad. Ejemplo: al sacar "5 años de experiencia" y reemplazarlo por competencias concretas, aumentaron las postulaciones de perfiles con carreras no tradicionales.',
    },
    {
      topic: 'comportamiento',
      question: 'Contame de una vez que no estuviste de acuerdo con una decisión de tu jefe.',
      answer:
        'Una buena respuesta muestra que planteaste el desacuerdo en privado, con datos y alternativas, entendiendo el contexto de la decisión, y que una vez tomada la apoyaste públicamente ("disagree and commit") sin sabotearla ni culpar a la dirección ante tu equipo. Si la decisión era ética o legalmente inaceptable, es otro caso y lo escalás. Ejemplo: tu director quería lanzar sin pruebas de carga; mostraste el riesgo con el último incidente, acordaron lanzar a un 10% de usuarios primero y escalar con métricas.',
    },
  ],
};
