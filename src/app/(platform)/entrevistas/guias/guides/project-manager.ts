import type { InterviewGuide } from './types';

export const projectManagerGuide: InterviewGuide = {
  track: 'project-manager',
  summary:
    'Cómo prepararte para entrevistas de project manager en software: planificación, riesgos, stakeholders, equipos y rescate de proyectos, de junior a senior.',
  sections: [
    {
      id: 'rol-y-entrevista',
      title: 'El rol y cómo es la entrevista',
      body: [
        'Un project manager en software se hace cargo de que un proyecto llegue a su objetivo dentro de las restricciones acordadas: coordina personas y equipos, hace visible el avance y los riesgos, y facilita las decisiones. No define qué producto construir (eso es del product manager) ni cómo construirlo técnicamente (eso es del equipo), pero sí es quien asegura que esas decisiones se tomen a tiempo y con la información correcta.',
        'La entrevista suele combinar preguntas de conceptos (metodologías, planificación, riesgos), escenarios ("el proyecto se va a atrasar, ¿qué hacés?"), preguntas de comportamiento sobre proyectos reales y, a veces, un caso más largo como rescatar un proyecto en rojo o armar un plan a partir de un brief. Suele haber una conversación con alguien del equipo técnico para ver si podés trabajar con ingenieros sin perderte en la jerga.',
        'En junior se espera que conozcas los fundamentos (triángulo de hierro, Scrum y Kanban, WBS, hitos, registro de riesgos, reporte de estado) y que muestres orden, comunicación clara y buena actitud ante conflictos simples. En semi-senior, que manejes un proyecto completo: estimar con incertidumbre, controlar el scope creep, gestionar dependencias y presupuesto, y comunicar atrasos sin esconderlos. En senior, que manejes programas con varios equipos, gobernanza, contratos, stakeholders con objetivos en conflicto, proyectos en rojo y la construcción de prácticas para toda la organización.',
        'El error más común es responder recitando el manual: nombrar artefactos y ceremonias sin explicar para qué sirven ni cuándo no aplican. El entrevistador busca criterio, no definiciones.',
      ],
      checklist: [
        'Explicar qué hace un project manager en un equipo de software',
        'Diferenciar project manager de product manager con un ejemplo',
        'Explicar el triángulo de hierro y qué cede cuando algo cambia',
        'Saber qué se espera de vos según tu seniority',
        'Tener dos o tres proyectos propios listos para contar con detalle',
      ],
    },
    {
      id: 'metodologias',
      title: 'Metodologías: ágil, predictivo e híbrido',
      body: [
        'Tenés que manejar Scrum con soltura: roles (product owner, scrum master, equipo de desarrollo), eventos (sprint, planning, daily, review, retrospectiva) y artefactos (product backlog, sprint backlog, incremento), y sobre todo para qué existe cada uno. También la definition of done, que es el acuerdo de qué tiene que cumplir algo para considerarse terminado, y por qué evita el "está listo pero falta testear".',
        'Kanban no tiene sprints ni roles fijos: visualiza el flujo, limita el trabajo en curso y mide tiempos de ciclo. Funciona mejor que Scrum para trabajo con demanda continua e impredecible, como soporte o mantenimiento; Scrum aporta más cuando se necesita una cadencia de planificación y entrega con objetivos por iteración. Saber cuándo conviene cada uno vale más que defender uno.',
        'El enfoque predictivo (cascada) sigue teniendo lugar cuando los requisitos son estables, hay contratos de alcance cerrado, regulaciones o dependencias físicas, como una migración con fecha fija o una integración con un proveedor externo. Muchos proyectos reales son híbridos: planificación por hitos y presupuesto para la dirección, y ejecución iterativa dentro del equipo. Decir que "ágil siempre es mejor" es una mala señal.',
        'En senior pueden preguntarte por frameworks de escalado como SAFe. Una respuesta madura reconoce que resuelven coordinación entre muchos equipos, pero que pueden agregar mucha ceremonia y rigidez si se aplican enteros sin necesidad. Lo esperable es empezar por los problemas concretos de coordinación y adoptar solo las prácticas que los resuelven.',
      ],
      checklist: [
        'Explicar roles, eventos y artefactos de Scrum y para qué sirve cada uno',
        'Comparar Scrum y Kanban y elegir uno para un contexto dado',
        'Definir una definition of done útil',
        'Justificar cuándo elegirías un enfoque predictivo o híbrido',
        'Dar una opinión con matices sobre SAFe y el escalado ágil',
      ],
    },
    {
      id: 'planificacion-y-estimacion',
      title: 'Planificación y estimación',
      body: [
        'Un plan empieza por el objetivo y el alcance, y se baja a trabajo concreto con una WBS: descomponer el entregable en partes cada vez más chicas hasta llegar a paquetes que alguien puede estimar y hacerse cargo. Sobre eso se definen hitos, que son puntos de control sin duración que marcan algo verificable (una integración funcionando, una salida a producción), no "terminar el 50%".',
        'El camino crítico es la secuencia de tareas dependientes más larga; cualquier atraso en ella atrasa todo el proyecto. Importa porque te dice dónde poner atención y dónde no sirve acelerar. Sabé explicarlo con un ejemplo y mencionar que el camino crítico puede cambiar a medida que avanza el proyecto.',
        'Para estimar con incertidumbre, usá rangos en vez de fechas únicas, estimá con el equipo que va a hacer el trabajo, descomponé hasta reducir lo desconocido y hacé spikes cortos para investigar lo más riesgoso primero. Los story points miden esfuerzo relativo y sirven para planificar la capacidad del equipo, no para comparar equipos ni medir productividad individual; usarlos así los corrompe.',
        'En senior se espera que pronostiques con datos: usar el throughput histórico (cuántos ítems termina el equipo por semana) y simulaciones de Monte Carlo para dar una fecha con probabilidad ("85% de chances de terminar antes de tal semana"). El error común es comprometer una fecha optimista para quedar bien y después renegociar en el peor momento.',
      ],
      checklist: [
        'Armar una WBS para un proyecto de software simple',
        'Definir hitos verificables',
        'Explicar el camino crítico con un ejemplo',
        'Estimar un proyecto incierto con rangos y spikes',
        'Explicar qué son los story points y cómo se usan mal',
        'Pronosticar una fecha con throughput histórico',
      ],
    },
    {
      id: 'alcance-presupuesto-contratos',
      title: 'Alcance, presupuesto y contratos',
      body: [
        'El scope creep es la suma de cambios chicos que nadie aprobó formalmente. Se previene con un alcance escrito y acordado, criterios de aceptación claros y un proceso de control de cambios simple: cada pedido nuevo se registra, se evalúa su impacto en tiempo, costo y riesgo, y alguien con autoridad decide si entra, qué sale a cambio o si se mueve la fecha. Decir que no a todo tampoco es la respuesta; los cambios son normales, lo que no puede pasar es que entren gratis.',
        'Controlar el presupuesto implica tener una línea base, registrar el costo real con frecuencia (horas, licencias, proveedores, infraestructura) y comparar contra el avance real, no contra el calendario. El análisis de valor ganado (EVM) formaliza esto: comparando valor planificado, valor ganado y costo real obtenés índices de desempeño de costo y de cronograma que te dicen si vas atrasado o sobre presupuesto y cuánto. Sabé explicar los índices sin fórmulas de memoria y reconocé su límite: en proyectos ágiles el "valor ganado" depende de cómo midas el avance.',
        'En semi-senior y senior aparecen los contratos. Un contrato de precio fijo traslada el riesgo al proveedor y exige un alcance muy claro; uno por tiempo y materiales da flexibilidad pero exige más control del cliente; hay modelos intermedios con alcance flexible dentro de un presupuesto fijo o con entregas por etapas. Lo que se evalúa es que entiendas quién carga con el riesgo en cada caso y cómo se manejan los cambios.',
        'Un error común es esconder un desvío de presupuesto esperando compensarlo más adelante. Los desvíos se comunican temprano, con causa, impacto proyectado y opciones.',
      ],
      checklist: [
        'Describir un proceso de control de cambios liviano',
        'Manejar un pedido fuera de alcance sin decir solo que no',
        'Explicar cómo controlás el presupuesto contra el avance real',
        'Explicar EVM y sus índices de costo y cronograma',
        'Comparar contratos de precio fijo y de tiempo y materiales',
      ],
    },
    {
      id: 'riesgos-y-dependencias',
      title: 'Riesgos y dependencias',
      body: [
        'Un riesgo es un evento incierto que, si ocurre, afecta un objetivo del proyecto; un problema (issue) es algo que ya pasó. Se registran con descripción, causa, probabilidad, impacto, dueño, respuesta y fecha de revisión. Las respuestas típicas son evitar, mitigar, transferir o aceptar, y para los riesgos aceptados conviene tener un plan de contingencia y una señal que lo dispare.',
        'Priorizar riesgos es combinar probabilidad e impacto, pero el registro solo sirve si se revisa. Lo que buscan los entrevistadores es que lo uses como herramienta viva: revisión periódica con el equipo, foco en los tres o cuatro más grandes y acciones concretas con fecha. Un registro con cincuenta riesgos que nadie mira es peor que uno corto que se trabaja.',
        'Las dependencias con otros equipos o proveedores son una de las fuentes de atraso más comunes. Identificalas temprano, acordá fechas y entregables concretos con los dueños, hacelas visibles en el plan, seguí las críticas de cerca y diseñá el trabajo para depender lo menos posible (por ejemplo, avanzar con contratos de API acordados o mocks mientras el otro equipo termina). Escalá a tiempo cuando una dependencia está en riesgo, no cuando ya rompió la fecha.',
        'En senior pueden pedirte un ejemplo de un riesgo que no viste venir. La respuesta buena reconoce el error, explica cómo se manejó el impacto y qué cambió en tu forma de identificar riesgos después.',
      ],
      checklist: [
        'Diferenciar riesgo de problema',
        'Registrar un riesgo con todos sus campos',
        'Explicar las cuatro respuestas posibles a un riesgo',
        'Mantener un registro de riesgos útil y vivo',
        'Gestionar una dependencia crítica con otro equipo',
      ],
    },
    {
      id: 'stakeholders-y-comunicacion',
      title: 'Stakeholders y comunicación',
      body: [
        'Un stakeholder es cualquier persona o grupo que afecta o es afectado por el proyecto. Identificalos temprano, mapealos por interés e influencia y definí cómo y con qué frecuencia comunicarte con cada uno. Una matriz RACI aclara quién es responsable de hacer, quién aprueba, a quién se consulta y a quién se informa en cada decisión o entregable; la regla clave es que haya un único aprobador por ítem.',
        'Un buen reporte de estado semanal es corto: estado general (verde, amarillo o rojo) con una línea de por qué, avance contra hitos, próximos pasos, riesgos y bloqueos, y decisiones que necesitás de alguien. Escribilo para que se entienda en un minuto. El error común es reportar actividad ("tuvimos muchas reuniones") en vez de avance y decisiones pendientes, o dejar todo en verde hasta que de golpe pasa a rojo.',
        'Comunicar un atraso es una pregunta casi segura. Hacelo apenas tengas evidencia, no cuando sea inevitable; explicá causa, impacto en fecha y en otros compromisos, y llevá opciones con sus trade-offs (reducir alcance, sumar gente con su costo real, mover la fecha). La persona que decide necesita opciones, no solo malas noticias.',
        'Con stakeholders que cambian prioridades todo el tiempo, o con objetivos en conflicto, la respuesta madura es hacer visible el costo de cada cambio, llevar la discusión al objetivo compartido del negocio y facilitar que quien tiene autoridad decida. En proyectos grandes eso se formaliza en una gobernanza: un comité o sponsor que decide, niveles de escalamiento claros y una cadencia de revisión.',
      ],
      checklist: [
        'Identificar y mapear stakeholders por interés e influencia',
        'Armar una matriz RACI con un único aprobador por ítem',
        'Escribir un reporte de estado semanal que se lea en un minuto',
        'Comunicar un atraso llevando opciones con trade-offs',
        'Manejar a un stakeholder que cambia prioridades',
        'Describir una gobernanza simple para un proyecto grande',
      ],
    },
    {
      id: 'equipo-y-conflictos',
      title: 'Equipo, reuniones y conflictos',
      body: [
        'Un project manager rara vez tiene autoridad jerárquica sobre el equipo, así que su influencia viene de la confianza: objetivos claros, cuidar el foco, sacar bloqueos rápido, reconocer el trabajo y cumplir lo que promete. Un equipo de alto rendimiento necesita seguridad para decir "no llegamos" o "me equivoqué" sin miedo. Contá cómo construís eso con acciones concretas, no con adjetivos.',
        'Para detectar sobrecarga mirá señales: trabajo en curso que crece, tiempos de ciclo que se alargan, horas fuera de horario, más bugs, menos participación en las reuniones. La respuesta es bajar el trabajo en paralelo, renegociar alcance o fechas con los stakeholders y proteger al equipo de pedidos que entran por fuera del proceso. Pedir más esfuerzo sostenido no es una solución.',
        'Ante un conflicto entre dos personas del equipo sobre cómo hacer algo, escuchá a ambas por separado si hace falta, llevá la discusión a criterios objetivos (requisitos, riesgos, costo de revertir), y si no hay acuerdo, acordá quién decide (muchas veces el líder técnico) y con qué plazo. Lo importante es que la decisión se tome y se respete, no que gane una parte.',
        'Las reuniones son la herramienta principal del rol y también su mayor riesgo. Cada una necesita objetivo, agenda, las personas justas y un cierre con decisiones y responsables. Una retrospectiva que genera cambios termina con una o dos acciones con dueño que se revisan en la siguiente. Y cuando hay presión por la fecha, protegé la calidad con la definition of done y haciendo visible el costo de saltear tests o revisiones.',
      ],
      checklist: [
        'Explicar cómo influís en un equipo sin autoridad formal',
        'Detectar sobrecarga con señales concretas y actuar',
        'Resolver un desacuerdo técnico entre dos personas',
        'Facilitar una reunión con objetivo y cierre claros',
        'Facilitar una retrospectiva que termine en acciones con dueño',
        'Defender la calidad bajo presión de fecha',
      ],
    },
    {
      id: 'programas-y-cierre',
      title: 'Programas, cierre y herramientas',
      body: [
        'Un programa agrupa proyectos relacionados que comparten un objetivo de negocio. Gestionarlo implica un plan integrado con hitos comunes, un mapa de dependencias entre equipos, una cadencia de sincronización (por ejemplo, una reunión semanal de líderes y una planificación conjunta por trimestre), riesgos a nivel programa y una sola fuente de verdad sobre el estado. El foco pasa de las tareas a las interfaces entre equipos.',
        'En senior puede aparecer la oficina de proyectos (PMO). La clave es que exista para ayudar a los equipos a entregar (plantillas útiles, visibilidad del portafolio, criterios para priorizar proyectos, acompañamiento) y no para pedir reportes que nadie lee. Empezá por un problema concreto de la organización y medí si la PMO lo resuelve.',
        'El cierre se suele olvidar: confirmar la aceptación formal de los entregables, traspasar a operación o soporte con documentación, liberar recursos, cerrar contratos y presupuesto, hacer una retrospectiva del proyecto y compartir las lecciones aprendidas. Medir el éxito solo por tiempo, alcance y costo es incompleto; también importa si se logró el beneficio esperado, la satisfacción de usuarios y stakeholders y el estado en que quedó el equipo.',
        'Sobre herramientas, lo que importa es para qué usás cada una (gestión de backlog, planificación de cronograma, documentación, comunicación) y no la marca. Con la IA, se espera que sepas que acelera tareas como resumir reuniones, redactar reportes o detectar riesgos en datos del proyecto, pero que el criterio, la relación con las personas y la responsabilidad por las decisiones siguen siendo tuyos.',
      ],
      checklist: [
        'Explicar la diferencia entre proyecto, programa y portafolio',
        'Coordinar un programa con varios equipos interdependientes',
        'Proponer una PMO que no agregue burocracia',
        'Enumerar los pasos para cerrar un proyecto',
        'Medir el éxito de un proyecto más allá del triángulo de hierro',
        'Explicar cómo usás la IA en el día a día del rol',
      ],
    },
    {
      id: 'casos-practicos',
      title: 'Casos prácticos y rescate de proyectos',
      body: [
        'Los casos típicos para este rol son armar un plan a partir de un brief, resolver un escenario con varios problemas a la vez (un proveedor que se atrasa, un stakeholder que pide más alcance y una persona clave que se va) o rescatar un proyecto en rojo. Se evalúa que ordenes la información, que priorices y que tus decisiones se apoyen en datos y en conversación con las personas.',
        'Para un rescate, una estructura que funciona en las primeras semanas: entender antes de actuar (hablar con el sponsor, el equipo y los stakeholders, revisar plan, backlog, presupuesto y riesgos), encontrar las causas reales del desvío (alcance mal definido, estimaciones irreales, dependencias, problemas técnicos o de equipo), armar un nuevo plan realista con opciones de alcance y fecha, acordarlo explícitamente con quien decide y después cumplir pequeños compromisos visibles para recuperar la confianza.',
        'En un caso de planificación, empezá aclarando objetivo, restricciones y criterios de éxito; después descomponé el trabajo, identificá dependencias y el camino crítico, proponé hitos, nombrá los tres riesgos principales con su respuesta y explicá cómo vas a comunicar el avance. Anunciá la estructura al principio para que el entrevistador te siga.',
        'Errores típicos: prometer que vas a salvar la fecha original sin análisis, culpar al PM anterior o al equipo, proponer horas extra como solución principal, olvidarte de los stakeholders y no dejar decisiones explícitas. Practicá con proyectos reales que conozcas cambiando las variables.',
      ],
      checklist: [
        'Describir tus primeras dos semanas en un proyecto en rojo',
        'Identificar causas reales de un desvío y no solo síntomas',
        'Armar un plan desde un brief con hitos, dependencias y riesgos',
        'Resolver un escenario con varios problemas priorizando',
        'Presentar un replan con opciones de alcance y fecha',
        'Practicar al menos tres casos con tiempo limitado',
      ],
    },
    {
      id: 'dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta y hacé preguntas aclaratorias antes de responder un escenario: tamaño del equipo, metodología, quién es el sponsor, qué restricciones son fijas. Si te dicen que asumas lo que quieras, explicitá tus supuestos. Si no sabés algo, decilo y contá cómo lo averiguarías; para un project manager, inventar una respuesta es especialmente mala señal porque el rol depende de la confianza.',
        'Para las preguntas de comportamiento usá STAR: situación, tarea, acción y resultado, con foco en tus acciones (no en las del equipo) y en resultados concretos, con números si los tenés. Prepará historias de un proyecto entregado a tiempo bajo presión, uno que se atrasó y cómo lo comunicaste, un conflicto que resolviste, un stakeholder difícil y un riesgo que no viste venir. Las historias de fracaso cuentan tanto como las de éxito si mostrás qué aprendiste.',
        'Llevá preguntas para la empresa: cómo se decide qué proyectos se hacen, qué autoridad real tiene el project manager sobre alcance y presupuesto, cómo es la relación con producto y con los líderes técnicos, qué metodología usan y por qué, cómo se ve un proyecto que salió mal y qué pasó después. Te ayudan a ver si el rol está bien definido.',
        'Como checklist final: repasá los conceptos de cada sección hasta poder explicarlos con un ejemplo propio, tené tus historias STAR escritas y ensayadas, practicá un caso de rescate en voz alta y revisá qué hace la empresa para adaptar tus ejemplos a su contexto.',
      ],
      checklist: [
        'Hacer preguntas aclaratorias antes de responder un escenario',
        'Admitir lo que no sabés y explicar cómo lo averiguarías',
        'Tener cinco historias STAR con resultados concretos',
        'Preparar cinco preguntas para hacerle a la empresa',
        'Ensayar en voz alta un caso de rescate completo',
      ],
    },
  ],
};
