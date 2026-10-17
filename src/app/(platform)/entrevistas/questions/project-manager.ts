import type { InterviewQuestion, Seniority } from './types';

export const projectManagerQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'rol',
      question: '¿Qué hace un project manager en un equipo de software?',
      answer:
        'Se asegura de que el proyecto llegue a destino: planifica alcance, tiempos y recursos, coordina dependencias entre personas y equipos, detecta y saca bloqueos, gestiona riesgos y mantiene informados a los stakeholders. No decide qué construir (eso es producto) ni cómo construirlo (eso es ingeniería), sino que hace que el trabajo fluya y se entregue de forma predecible.',
    },
    {
      topic: 'rol',
      question: '¿Cuál es la diferencia entre un project manager y un product manager?',
      answer:
        'El product manager define qué construir y por qué: estrategia, priorización según valor para usuarios y negocio, y se mide por resultados del producto. El project manager se enfoca en cómo y cuándo se entrega un proyecto concreto: plan, cronograma, dependencias, riesgos, y se mide por entregar en tiempo, alcance y presupuesto. En equipos chicos una persona puede cubrir ambos, pero son responsabilidades distintas.',
    },
    {
      topic: 'fundamentos',
      question: '¿Qué es el triángulo de hierro (alcance, tiempo y costo)?',
      answer:
        'La idea de que alcance, tiempo y costo (recursos) están atados: si cambia uno, se afecta al menos otro, y en el medio está la calidad. Si piden más alcance con la misma fecha, hay que sumar recursos o recortar otra cosa. Sirve para negociar: ante un cambio, el PM explica qué variable se mueve en vez de aceptar todo y sacrificar la calidad en silencio.',
    },
    {
      topic: 'agile',
      question: '¿Cuáles son los roles, eventos y artefactos de Scrum?',
      answer:
        'Roles: product owner (prioriza el backlog), scrum master (facilita y saca impedimentos) y developers. Eventos: sprint, sprint planning, daily scrum, sprint review y retrospectiva. Artefactos: product backlog, sprint backlog e incremento, cada uno con su compromiso (objetivo de producto, objetivo del sprint y definition of done).',
    },
    {
      topic: 'agile',
      question: '¿Qué diferencia hay entre Scrum y Kanban?',
      answer:
        'Scrum trabaja en iteraciones de duración fija con un compromiso por sprint y roles y eventos definidos. Kanban es flujo continuo: el trabajo se visualiza en un tablero, se limita el trabajo en progreso (WIP) por columna y se optimiza el tiempo de ciclo, sin sprints obligatorios. Kanban suele encajar mejor en trabajo con mucha demanda imprevista, como soporte u operaciones.',
    },
    {
      topic: 'planificación',
      question: '¿Qué es una WBS (estructura de desglose del trabajo)?',
      answer:
        'Una descomposición jerárquica de todo el trabajo del proyecto en entregables y paquetes de trabajo cada vez más chicos, hasta que se pueden estimar, asignar y seguir. Ayuda a no olvidarse de nada (incluido lo que no es código: documentación, testing, capacitación) y es la base para el cronograma y el presupuesto.',
    },
    {
      topic: 'planificación',
      question: '¿Qué es un hito (milestone)?',
      answer:
        'Un punto de control significativo en el cronograma, sin duración, que marca que se completó algo importante: fin del diseño, beta disponible, lanzamiento. Sirven para comunicar el avance a stakeholders y detectar temprano si el proyecto se está atrasando.',
    },
    {
      topic: 'riesgos',
      question: '¿Qué es un riesgo y cómo lo registrás?',
      answer:
        'Un evento incierto que, si ocurre, afecta al proyecto. Se registra en un registro de riesgos con su descripción, probabilidad, impacto, un responsable y una respuesta: evitar, mitigar, transferir o aceptar. A diferencia de un issue, que ya está pasando, el riesgo todavía no ocurrió; el objetivo es actuar antes.',
    },
    {
      topic: 'comunicación',
      question: '¿Qué incluirías en un reporte de estado semanal?',
      answer:
        'Un estado general claro (en verde, amarillo o rojo) y por qué, lo que se logró, lo que viene, los riesgos y bloqueos con quién los resuelve y qué decisiones se necesitan de los destinatarios. Corto, honesto y adaptado a la audiencia: un sponsor quiere el panorama y lo que tiene que decidir; el equipo, el detalle.',
    },
    {
      topic: 'stakeholders',
      question: '¿Qué es un stakeholder y cómo los identificás?',
      answer:
        'Cualquier persona o grupo que afecta o se ve afectado por el proyecto: sponsor, usuarios, equipos que dependen del resultado, soporte, legal, ventas. Se identifican preguntando quién decide, quién usa, quién tiene que cambiar su forma de trabajar y quién puede bloquear. Después se mapean por interés e influencia para definir cómo gestionar a cada uno.',
    },
    {
      topic: 'estimación',
      question: '¿Qué son los story points y para qué sirven?',
      answer:
        'Una unidad relativa para estimar el esfuerzo de una historia, que combina complejidad, incertidumbre y volumen de trabajo, en vez de horas. Se estiman comparando historias entre sí (por ejemplo con planning poker). Sirven para que el equipo planifique según su velocidad histórica; no sirven para comparar equipos ni para medir productividad individual.',
    },
    {
      topic: 'reuniones',
      question: '¿Cómo hacés que una reunión sea útil?',
      answer:
        'Solo si hace falta (si alcanza con un mensaje asincrónico, mejor), con un objetivo claro y una agenda enviada antes, las personas justas, una moderación que respete el tiempo y cierre con decisiones, responsables y fechas por escrito. Una daily que se convierte en reporte de estado al PM perdió su propósito.',
    },
    {
      topic: 'herramientas',
      question: '¿Qué herramientas usarías para gestionar un proyecto de software?',
      answer:
        'Un gestor de trabajo como Jira, Linear o GitHub Projects para el backlog y el tablero, un documento compartido para el plan, decisiones y riesgos, un diagrama de Gantt o roadmap para las dependencias y fechas, y los canales de comunicación del equipo. La herramienta importa menos que mantenerla actualizada y que sea la fuente de verdad.',
    },
    {
      topic: 'agile',
      question: '¿Qué es la definition of done?',
      answer:
        'Un acuerdo del equipo sobre qué condiciones tiene que cumplir cualquier trabajo para considerarse terminado: código revisado, tests pasando, documentación, desplegado en cierto entorno, etc. Evita el "está terminado pero falta…" y hace que el avance sea medible de forma honesta.',
    },
    {
      topic: 'conflictos',
      question: 'Dos personas del equipo no se ponen de acuerdo en cómo hacer algo. ¿Qué hacés?',
      answer:
        'Escuchar a ambas y llevar la discusión a hechos y criterios: qué objetivo tenemos, qué riesgos tiene cada opción, qué cuesta revertir. Si es una decisión técnica, la toma quien corresponda (el tech lead), no el PM; el rol del PM es que la decisión se tome a tiempo, quede registrada y no frene el proyecto.',
    },
  ],
  'semi-senior': [
    {
      topic: 'planificación',
      question: '¿Qué es el camino crítico y por qué importa?',
      answer:
        'Es la secuencia más larga de tareas dependientes del proyecto: determina la duración mínima total. Cualquier atraso en una tarea del camino crítico atrasa todo el proyecto; las demás tienen holgura. Conocerlo permite enfocar la atención y los recursos donde de verdad importa y evaluar qué pasa si algo se demora.',
    },
    {
      topic: 'estimación',
      question: '¿Cómo estimarías un proyecto con mucha incertidumbre?',
      answer:
        'Con rangos en vez de un número único (estimación de tres puntos: optimista, más probable y pesimista), descomponiendo el trabajo, usando datos históricos del equipo, haciendo spikes para reducir la incertidumbre de las partes más dudosas y comunicando el nivel de confianza. La estimación se refina a medida que se aprende (cono de incertidumbre) y se agrega un buffer explícito para riesgos.',
    },
    {
      topic: 'alcance',
      question: '¿Cómo manejás el scope creep?',
      answer:
        'Con un alcance bien definido desde el principio y un proceso de control de cambios: cada pedido nuevo se registra, se evalúa su impacto en tiempo, costo y riesgo, y lo aprueba quien corresponde, sabiendo qué se sacrifica. No se dice que no por reflejo, pero tampoco se suman cosas "chiquitas" en silencio que, juntas, rompen el plan.',
    },
    {
      topic: 'stakeholders',
      question: '¿Qué es una matriz RACI?',
      answer:
        'Una tabla que define, para cada tarea o decisión, quién es Responsable de hacerla, quién Aprueba (accountable, uno solo), a quién se Consulta y a quién se Informa. Evita tanto que nadie se haga cargo como que todos crean que deciden. Es especialmente útil en proyectos con varios equipos.',
    },
    {
      topic: 'métricas',
      question: '¿Qué métricas usarías para seguir un proyecto ágil?',
      answer:
        'Velocidad o throughput para planificar, burndown o burnup del sprint o del release para ver el avance contra el plan, lead time y cycle time para ver qué tan rápido fluye el trabajo, WIP para detectar cuellos de botella y la tasa de bugs escapados como señal de calidad. Siempre como herramientas de conversación del equipo, no para evaluar personas.',
    },
    {
      topic: 'riesgos',
      question: '¿Cómo priorizarías y gestionarías los riesgos de un proyecto?',
      answer:
        'Evaluándolos por probabilidad e impacto en una matriz y enfocando la atención en los altos. Para cada uno se define una respuesta concreta y un responsable, se agregan disparadores que indiquen que se está materializando y se revisa el registro en cada reunión de seguimiento. Los riesgos más grandes suelen estar en dependencias externas, integraciones y supuestos no validados.',
    },
    {
      topic: 'dependencias',
      question: '¿Cómo gestionás dependencias con otros equipos?',
      answer:
        'Identificándolas temprano y haciéndolas visibles en el plan, acordando con el otro equipo qué se necesita, para cuándo y en qué formato (por ejemplo un contrato de API), con un responsable de cada lado. Se hace seguimiento frecuente, se busca la forma de desacoplar (mocks, feature flags) y se escala a tiempo si la dependencia se pone en riesgo.',
    },
    {
      topic: 'comunicación',
      question: 'El proyecto se va a atrasar. ¿Cómo lo comunicás?',
      answer:
        'Lo antes posible, sin esperar a estar seguro del todo. Con el motivo, el impacto concreto (cuánto y en qué), qué opciones hay (recortar alcance, sumar recursos, mover la fecha) con sus trade-offs y una recomendación. Malas noticias tempranas permiten decidir; malas noticias tardías solo sorprenden.',
    },
    {
      topic: 'agile',
      question: '¿Cómo facilitarías una retrospectiva que realmente genere cambios?',
      answer:
        'Creando un espacio seguro donde se pueda hablar sin culpas, con un formato que varíe para no caer en la rutina, enfocándose en pocos temas importantes y terminando con acciones concretas, con responsable y fecha. En la siguiente retro se revisa si se cumplieron. Si las acciones nunca se ejecutan, el equipo deja de creer en la retro.',
    },
    {
      topic: 'presupuesto',
      question: '¿Cómo controlás el presupuesto de un proyecto?',
      answer:
        'Con una línea base de costos por fase o entregable, seguimiento periódico del gasto real contra lo planificado y del avance real, y proyecciones de cuánto va a costar terminar. Herramientas como el valor ganado (comparar costo real, valor planificado y valor ganado) muestran si el proyecto está gastando más de lo que avanza. Las desviaciones se comunican con opciones.',
    },
    {
      topic: 'metodologías',
      question: '¿Cuándo elegirías un enfoque predictivo (cascada) y cuándo uno ágil?',
      answer:
        'Predictivo cuando los requisitos son estables y conocidos, el costo de cambiar es alto y hay restricciones regulatorias o contractuales fuertes (por ejemplo, una migración con fecha fija). Ágil cuando hay incertidumbre sobre qué construir y el feedback temprano agrega valor, como en la mayoría del software de producto. Muchos proyectos usan un híbrido: hitos y presupuesto predictivos con ejecución iterativa.',
    },
    {
      topic: 'calidad',
      question: '¿Cómo te asegurás de que la presión por la fecha no destruya la calidad?',
      answer:
        'Haciendo explícita la calidad en el plan (definition of done, tiempo para testing y estabilización), recortando alcance antes que calidad cuando hay que ajustar, haciendo visibles los riesgos de calidad a los stakeholders y midiendo bugs en producción. Lanzar a tiempo algo que se rompe suele costar más que mover una fecha o recortar una feature.',
    },
    {
      topic: 'stakeholders',
      question: '¿Cómo manejás a un stakeholder que cambia de prioridades todo el tiempo?',
      answer:
        'Entendiendo qué hay detrás (presión de su área, falta de información), haciendo visible el costo de cada cambio (qué se atrasa o se descarta), acordando un ritmo para repriorizar (por ejemplo al inicio de cada ciclo) y dejando registradas las decisiones. Si es necesario, se escala para alinear prioridades entre áreas.',
    },
    {
      topic: 'lanzamiento',
      question: '¿Qué incluirías en un plan de lanzamiento?',
      answer:
        'Criterios de salida (qué tiene que estar listo), checklist técnico (monitoreo, plan de rollback, feature flags, migraciones), coordinación con soporte, ventas y marketing, comunicación a usuarios, un plan de rollout gradual, responsables de guardia el día del lanzamiento y una revisión posterior para ver si se cumplieron los objetivos.',
    },
    {
      topic: 'equipo',
      question: '¿Cómo detectás que el equipo está sobrecargado y qué hacés?',
      answer:
        'Señales: trabajo en progreso creciente, tareas que se estancan, horas extra frecuentes, más bugs, menos participación y desgaste en las retros. Se actúa limitando el WIP, repriorizando y recortando alcance con los stakeholders, protegiendo al equipo de interrupciones y pedidos directos, y conversando uno a uno. Un plan que solo funciona con horas extra es un plan equivocado.',
    },
  ],
  senior: [
    {
      topic: 'programas',
      question: '¿Cómo gestionarías un programa con varios equipos y proyectos interdependientes?',
      answer:
        'Con un objetivo del programa claro y compartido, un roadmap integrado que muestre hitos y dependencias entre equipos, una cadencia de sincronización (por ejemplo una revisión semanal de leads y planificaciones trimestrales en conjunto), un registro de riesgos y decisiones a nivel programa y gobernanza clara de quién decide qué. Se busca reducir dependencias, no solo coordinarlas.',
    },
    {
      topic: 'métricas',
      question: '¿Cómo usarías el análisis de valor ganado (EVM)?',
      answer:
        'Comparando el valor planificado (PV), el valor ganado (EV, cuánto del trabajo planificado se completó) y el costo real (AC). El índice de desempeño del cronograma (SPI = EV/PV) indica si vamos atrasados y el de costo (CPI = EV/AC) si gastamos de más. Con el CPI se proyecta el costo final (EAC). Es muy útil en proyectos predictivos; en ágiles se adapta midiendo por puntos o entregables completados.',
    },
    {
      topic: 'rescate',
      question: 'Te asignan un proyecto que está en rojo. ¿Qué hacés las primeras semanas?',
      answer:
        'Diagnosticar antes de actuar: hablar con el equipo y los stakeholders, revisar el estado real (no el reportado), entender la causa raíz (alcance irreal, dependencias, problemas técnicos, equipo). Después, rehacer el plan con datos reales, negociar alcance o fecha con el sponsor, atacar los dos o tres riesgos principales y comunicar con transparencia y frecuencia hasta recuperar la confianza.',
    },
    {
      topic: 'estimación',
      question: '¿Cómo pronosticarías la fecha de entrega con datos en vez de estimaciones?',
      answer:
        'Usando el throughput histórico del equipo (cuántos ítems termina por semana) y simulaciones de Monte Carlo sobre el trabajo restante, que dan un rango con probabilidades ("85% de probabilidad de terminar antes del 15 de mayo"). Es más honesto que una fecha única, requiere menos tiempo de estimación y se actualiza solo a medida que avanza el trabajo.',
    },
    {
      topic: 'gobernanza',
      question: '¿Cómo definirías la gobernanza de un proyecto grande?',
      answer:
        'Un sponsor con autoridad para decidir y destrabar, un comité de dirección con reuniones periódicas para las decisiones de alcance, presupuesto y prioridades, umbrales de tolerancia claros (por ejemplo, desvíos de más del 10% se escalan), un proceso de control de cambios y un registro de decisiones. Gobernanza liviana para proyectos chicos y más formal cuanto mayor es el riesgo.',
    },
    {
      topic: 'stakeholders',
      question: '¿Cómo alineás a stakeholders con objetivos en conflicto?',
      answer:
        'Llevando la conversación a los objetivos de la organización, haciendo visibles los trade-offs con datos, buscando opciones que satisfagan lo esencial de cada parte y, si no hay acuerdo, escalando a quien tiene la autoridad para decidir con la información preparada. Lo que no se puede hacer es prometer a cada uno lo que quiere escuchar.',
    },
    {
      topic: 'contratos',
      question:
        '¿Qué diferencias hay entre gestionar un proyecto a precio fijo y uno por tiempo y materiales?',
      answer:
        'A precio fijo, el riesgo de costo lo asume el proveedor: el alcance tiene que estar muy bien definido y el control de cambios es crítico, porque cada cambio se negocia. Por tiempo y materiales hay más flexibilidad para adaptar el alcance, pero el cliente asume el riesgo de costo y hay que dar mucha visibilidad del avance y del gasto. Existen híbridos, como precio fijo por fase.',
    },
    {
      topic: 'escalado',
      question: '¿Qué opinás de los frameworks de escalado ágil como SAFe?',
      answer:
        'Pueden ayudar a organizaciones grandes a coordinar muchos equipos con planificaciones conjuntas (PI planning) y un lenguaje común. El riesgo es la burocracia: muchas ceremonias y roles que frenan a los equipos. Antes de adoptar un framework conviene reducir dependencias entre equipos (equipos alineados a producto), y tomar del framework solo lo que resuelve un problema real.',
    },
    {
      topic: 'riesgos',
      question:
        '¿Cómo manejás un riesgo que se materializó y amenaza la fecha comprometida con un cliente?',
      answer:
        'Activando el plan de respuesta si existía, evaluando el impacto real rápido, armando opciones (entrega parcial, trabajo en paralelo, sumar recursos, mover la fecha) y comunicándolo al cliente cuanto antes con una propuesta concreta. Después, una revisión sin culpas para entender por qué la mitigación no alcanzó y mejorar la gestión de riesgos.',
    },
    {
      topic: 'equipo',
      question: '¿Cómo construís un equipo de alto rendimiento sin autoridad jerárquica sobre él?',
      answer:
        'Con influencia: objetivos claros que den sentido al trabajo, sacando obstáculos de verdad, protegiendo al equipo de interrupciones, reconociendo los logros públicamente, generando seguridad psicológica para hablar de problemas y cumpliendo lo que uno promete. La confianza se gana mostrando que el PM trabaja para el equipo y no solo para reportar sobre él.',
    },
    {
      topic: 'métricas',
      question: '¿Cómo medirías el éxito de un proyecto más allá de tiempo, alcance y costo?',
      answer:
        'Por los resultados que justificaron hacerlo: adopción del sistema, ahorro de costos, impacto en ingresos, satisfacción de usuarios, reducción de incidentes. Un proyecto entregado en tiempo y presupuesto que nadie usa no fue exitoso. Por eso se definen métricas de beneficio al inicio, con un responsable de medirlas después del cierre.',
    },
    {
      topic: 'cierre',
      question: '¿Qué hacés al cerrar un proyecto?',
      answer:
        'Verificar que se cumplieron los criterios de aceptación y obtener la conformidad formal, traspasar la operación y el soporte con documentación, liberar recursos, cerrar contratos, hacer una retrospectiva o postmortem del proyecto con lecciones aprendidas que se compartan con otros equipos y planificar la medición de los beneficios a futuro.',
    },
    {
      topic: 'software',
      question:
        '¿Qué tiene de particular gestionar proyectos de software frente a otros proyectos?',
      answer:
        'La incertidumbre es alta y el trabajo es difícil de estimar, los requisitos cambian al ver el software funcionando, sumar gente a un proyecto atrasado suele atrasarlo más (ley de Brooks), la deuda técnica es invisible para los stakeholders pero condiciona los plazos, y el deploy y la operación son parte del proyecto. Por eso funcionan mejor los ciclos cortos de entrega y feedback.',
    },
    {
      topic: 'ia',
      question: '¿Cómo cambia la IA el trabajo de un project manager?',
      answer:
        'Automatiza buena parte del trabajo administrativo (reportes de estado, actas, seguimiento de tickets, resúmenes), así que el valor se corre a lo humano: alinear stakeholders, decidir con información incompleta, gestionar riesgos y cuidar al equipo. Además, los equipos que trabajan con agentes cambian sus ritmos y estimaciones, y el PM tiene que adaptar la planificación y medir resultados en vez de actividad.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo implementarías una oficina de proyectos (PMO) sin agregar burocracia?',
      answer:
        'Empezando por los problemas que tiene que resolver (visibilidad del portfolio, priorización entre proyectos, estándares mínimos), ofreciendo plantillas y herramientas como servicio más que como control, adaptando el nivel de proceso al tamaño y riesgo de cada proyecto y midiendo si los proyectos mejoran. Una PMO que solo pide reportes y no ayuda a decidir se vuelve un costo.',
    },
  ],
};
