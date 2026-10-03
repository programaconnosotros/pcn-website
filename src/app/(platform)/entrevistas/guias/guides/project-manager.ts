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
        {
          text: 'Explicar qué hace un project manager en un equipo de software',
          explanation:
            'Un project manager se asegura de que un proyecto llegue a su objetivo dentro de las restricciones acordadas de alcance, tiempo, costo y calidad. En la práctica: arma y mantiene el plan, coordina a las personas y equipos involucrados, hace visible el avance y los riesgos, gestiona dependencias y cambios, y facilita que las decisiones se tomen a tiempo y por quien corresponde. No decide qué producto construir ni cómo implementarlo técnicamente, pero detecta cuándo falta una decisión y la empuja. Una forma corta de decirlo: el PM reduce la incertidumbre y la fricción para que el equipo pueda entregar. El error común es describir el rol como el que hace el seguimiento de tareas y las reuniones.',
        },
        {
          text: 'Diferenciar project manager de product manager con un ejemplo',
          explanation:
            'El product manager decide qué construir y por qué: entiende a los usuarios y el mercado, define el problema, prioriza el backlog y es responsable del valor del producto. El project manager se encarga de cómo y cuándo se entrega un esfuerzo concreto: plan, coordinación, riesgos, presupuesto y comunicación. Ejemplo: en la migración de pagos a un nuevo proveedor, el product manager decide que hay que migrar y qué métodos de pago son prioritarios; el project manager arma el plan con los cinco equipos involucrados, coordina el corte, sigue las dependencias con el proveedor y avisa si la fecha está en riesgo. En empresas chicas una persona puede hacer ambas cosas, pero son responsabilidades distintas.',
        },
        {
          text: 'Explicar el triángulo de hierro y qué cede cuando algo cambia',
          explanation:
            'El triángulo de hierro dice que alcance, tiempo y costo están conectados, con la calidad en el medio: si cambia uno, al menos otro tiene que ceder. Si el alcance crece, o se mueve la fecha o se agrega gente o presupuesto; si la fecha se adelanta, se recorta alcance o se suman recursos. En software, agregar gente tarde rara vez acelera, por la ley de Brooks, así que la palanca más efectiva suele ser el alcance. Ejemplo: el cliente agrega un módulo de reportes; podés entregar en la misma fecha sin reportes, con reportes un mes después, o con reportes básicos en la fecha y el resto después. El error común es dejar que ceda la calidad en silencio, que es lo que pasa cuando nadie elige explícitamente.',
        },
        {
          text: 'Saber qué se espera de vos según tu seniority',
          explanation:
            'En junior se espera que conozcas los fundamentos (triángulo de hierro, Scrum y Kanban, WBS, hitos, riesgos, reporte de estado) y muestres orden, comunicación clara y buena actitud en conflictos simples. En semi-senior se espera que manejes un proyecto completo: estimar con incertidumbre, controlar el scope creep, gestionar dependencias y presupuesto, y comunicar atrasos con opciones. En senior se espera que manejes programas con varios equipos, gobernanza, contratos, stakeholders con objetivos en conflicto, rescates de proyectos en rojo y que construyas prácticas para la organización. Elegí tus ejemplos según el nivel: para senior, contá decisiones que afectaron a varios equipos o a la organización, no solo tareas bien coordinadas.',
        },
        {
          text: 'Tener dos o tres proyectos propios listos para contar con detalle',
          explanation:
            'Para cada proyecto prepará: contexto (qué era, para quién, tamaño del equipo, duración y presupuesto aproximado), objetivo y restricciones, tu rol exacto, la metodología usada y por qué, los dos o tres problemas más difíciles (un atraso, un conflicto, un cambio de alcance, un riesgo que se materializó) con lo que hiciste, y el resultado con números (en fecha o con cuánto desvío, costo contra presupuesto, satisfacción del cliente). Agregá qué harías distinto, porque casi siempre lo preguntan. Elegí proyectos variados, por ejemplo uno exitoso, uno que rescataste y uno con muchos stakeholders. Escribilos y ensayalos, porque te van a repreguntar en detalle y las inconsistencias se notan.',
        },
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
        {
          text: 'Explicar roles, eventos y artefactos de Scrum y para qué sirve cada uno',
          explanation:
            'Roles: el product owner maximiza el valor y es dueño del product backlog; el scrum master facilita el proceso y remueve impedimentos; los developers construyen el incremento y se autoorganizan. Eventos: el sprint es un ciclo fijo de hasta un mes; la planning define el objetivo del sprint y qué entra; la daily, de 15 minutos, sincroniza al equipo hacia el objetivo; la review muestra el incremento a stakeholders y recoge feedback; la retrospectiva mejora la forma de trabajar. Artefactos: el product backlog es la lista ordenada de todo lo que se podría hacer, el sprint backlog es lo elegido más el plan, y el incremento es lo terminado y usable que cumple la definition of done. Todo existe para dar transparencia, inspeccionar y adaptar cada poco tiempo.',
        },
        {
          text: 'Comparar Scrum y Kanban y elegir uno para un contexto dado',
          explanation:
            'Scrum trabaja en iteraciones fijas con un compromiso de objetivo por sprint, roles definidos y ceremonias; da ritmo y previsibilidad, y funciona bien para desarrollo de producto con trabajo planificable. Kanban es flujo continuo: visualiza el trabajo en un tablero, limita el trabajo en curso (WIP) por columna y mide el lead time y el throughput; no tiene sprints ni roles obligatorios, y se adapta a trabajo que llega de forma impredecible. Para elegir: un equipo de soporte, operaciones o mantenimiento con pedidos urgentes constantes va mejor con Kanban; un equipo construyendo un producto nuevo con un backlog claro suele aprovechar Scrum. También existe Scrumban. El error común es elegir por moda y no por el tipo de trabajo.',
        },
        {
          text: 'Definir una definition of done útil',
          explanation:
            'La definition of done es una lista corta, acordada por el equipo, de lo que tiene que cumplir cualquier ítem para considerarse terminado. Una útil incluye criterios verificables: código revisado y mergeado, tests automáticos pasando, criterios de aceptación validados, desplegado en un entorno de staging o producción, documentación o notas de release actualizadas si aplica, y sin bugs críticos abiertos. Se diferencia de los criterios de aceptación, que son específicos de cada historia. Sirve para evitar el está listo pero falta testear y para que el avance reportado sea real. El error común es una DoD aspiracional que nadie cumple, o tan vaga (funciona bien) que no se puede verificar.',
        },
        {
          text: 'Justificar cuándo elegirías un enfoque predictivo o híbrido',
          explanation:
            'Un enfoque predictivo, o cascada, planifica todo al principio y avanza por fases; conviene cuando el alcance es estable y conocido, hay restricciones regulatorias o contractuales fuertes, o el costo de cambiar es alto (hardware, infraestructura física, migraciones con fecha legal). Un enfoque ágil conviene cuando hay incertidumbre sobre qué construir y feedback frecuente es valioso. El híbrido combina: planificación predictiva de hitos, presupuesto y contratos a nivel proyecto, y ejecución ágil en sprints dentro de cada fase. Ejemplo: implementar un sistema para un banco con fecha regulatoria fija y auditoría, donde los hitos y entregables formales son predictivos, pero el desarrollo de cada módulo se hace en sprints. El error común es defender ágil para todo como si fuera una religión.',
        },
        {
          text: 'Dar una opinión con matices sobre SAFe y el escalado ágil',
          explanation:
            'SAFe (Scaled Agile Framework) es un marco para coordinar muchos equipos ágiles con eventos como la PI planning, trenes de entrega (ARTs) y roles adicionales. Sus ventajas: da alineación y un lenguaje común en organizaciones grandes, hace visibles las dependencias entre equipos y la PI planning suele ser valiosa para planificar juntos. Sus críticas: agrega mucha estructura, roles y burocracia, puede volverse cascada con otro nombre y a veces se implementa como reorganización sin cambiar la cultura. Una opinión con matices: el problema real es coordinar dependencias; antes de adoptar un marco pesado conviene reducir dependencias con equipos más autónomos y usar solo las piezas que resuelven un problema concreto. Otras alternativas son LeSS, Scrum@Scale o simplemente Scrum of Scrums.',
        },
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
        {
          text: 'Armar una WBS para un proyecto de software simple',
          explanation:
            'La WBS (work breakdown structure) descompone el entregable total en partes cada vez más chicas, orientadas a entregables y no a actividades, hasta llegar a paquetes de trabajo que se pueden estimar y asignar a un dueño, típicamente de unos días a dos semanas. Tiene que cubrir el 100% del alcance, incluido lo que suele olvidarse. Ejemplo para una app de turnos: 1. Gestión de usuarios (registro, login, perfil); 2. Agenda (alta de turnos, calendario, cancelaciones); 3. Notificaciones (email, recordatorios); 4. Panel de administración; 5. Infraestructura y despliegue; 6. Testing y QA; 7. Gestión del proyecto. El error común es olvidar el trabajo no funcional: QA, despliegue, migración de datos, documentación y capacitación.',
        },
        {
          text: 'Definir hitos verificables',
          explanation:
            'Un hito es un punto de control sin duración que marca que algo verificable ocurrió, y sirve para saber si el proyecto va bien sin depender de porcentajes subjetivos. Tiene que ser binario: se cumplió o no. Buenos ejemplos: login con SSO funcionando en staging, primer pago real procesado en producción, migración del 100% de clientes del piloto completada, contrato de proveedor firmado. Malos ejemplos: backend al 50%, avanzar con el diseño. Conviene ubicarlos en los puntos de mayor riesgo, como la primera integración con un sistema externo, para enterarte temprano si algo falla. El error común es definir hitos como fechas en el calendario sin un criterio de cumplimiento.',
        },
        {
          text: 'Explicar el camino crítico con un ejemplo',
          explanation:
            'El camino crítico es la secuencia más larga de tareas dependientes entre el inicio y el fin del proyecto; determina la duración mínima, y cualquier atraso en una tarea de ese camino atrasa todo el proyecto. Las tareas fuera del camino crítico tienen holgura (float): pueden atrasarse un poco sin mover la fecha final. Ejemplo: diseño de base de datos (5 días), luego backend (15 días), luego integración (5 días) suman 25 días; en paralelo, el frontend toma 10 días después del diseño. El camino crítico es diseño, backend, integración; el frontend tiene 5 días de holgura. Sirve para saber dónde poner atención y recursos. Ojo: el camino crítico puede cambiar cuando otras tareas se atrasan más que su holgura.',
        },
        {
          text: 'Estimar un proyecto incierto con rangos y spikes',
          explanation:
            'Con incertidumbre alta, en vez de un número único das rangos: optimista, más probable y pesimista, por ejemplo con la estimación de tres puntos PERT (O + 4M + P) / 6, y comunicás la fecha como un rango con nivel de confianza (entre 8 y 12 semanas, 80% de confianza). Para reducir la incertidumbre usás spikes: investigaciones acotadas en tiempo, de uno a tres días, que responden una pregunta concreta (¿la API del proveedor soporta pagos recurrentes?) antes de comprometerse. El cono de incertidumbre dice que las estimaciones mejoran a medida que el proyecto avanza, así que re-estimás después de cada hito. El error común es dar una fecha exacta al principio y después defenderla como si fuera un compromiso.',
        },
        {
          text: 'Explicar qué son los story points y cómo se usan mal',
          explanation:
            'Los story points son una unidad relativa de esfuerzo, complejidad e incertidumbre: se estima comparando ítems entre sí (esto es el doble que aquello), típicamente con una escala tipo Fibonacci y técnicas como planning poker. Sirven para que el equipo converse los supuestos y para medir su propia velocidad y planificar sprints. Se usan mal cuando se convierten a horas, cuando se comparan velocidades entre equipos, cuando se usan como métrica de productividad individual o cuando la gerencia presiona para subir la velocidad, que se infla sola sin entregar más. Por eso muchos equipos los reemplazan por contar ítems de tamaño similar y medir throughput.',
        },
        {
          text: 'Pronosticar una fecha con throughput histórico',
          explanation:
            'Medís cuántos ítems termina el equipo por semana durante las últimas semanas, por ejemplo entre 4 y 9, y contás cuántos ítems quedan, desglosando el trabajo en ítems de tamaño parecido. Con eso podés hacer una cuenta simple (40 ítems a unos 6 por semana, unas 7 semanas) o mejor una simulación Monte Carlo: simulás miles de futuros tomando semanas al azar del historial y obtenés una distribución, por ejemplo 85% de probabilidad de terminar en 9 semanas o menos. Conviene sumar un margen porque el alcance suele crecer durante el proyecto. Esto es más confiable que estimar cada tarea porque usa datos reales del equipo e incluye interrupciones. El error común es usar el promedio, que da solo 50% de probabilidad.',
        },
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
        {
          text: 'Describir un proceso de control de cambios liviano',
          explanation:
            'Un control de cambios liviano tiene un canal único para pedir cambios (un formulario o ticket con descripción y motivo), un análisis rápido del impacto en alcance, fecha, costo y riesgo, una decisión de quien tiene autoridad (el sponsor o el product owner, según el tamaño), y un registro de lo decidido que actualiza el plan. Para cambios chicos podés acordar un umbral: si cuesta menos de dos días y no mueve un hito, lo decide el equipo con el product owner. Ejemplo: el cliente pide un nuevo reporte; se estima en una semana, se presenta con el impacto en la fecha y el sponsor elige si entra a cambio de otra cosa. El objetivo no es frenar cambios sino que nunca se acepten sin que alguien elija el trade-off.',
        },
        {
          text: 'Manejar un pedido fuera de alcance sin decir solo que no',
          explanation:
            'En vez de no, decí sí, y mostrá el costo: reconocé el valor del pedido, explicá que está fuera del alcance acordado y presentá opciones con sus trade-offs. Las opciones típicas son: lo agregamos y movemos la fecha o el presupuesto, lo agregamos a cambio de sacar otra cosa de prioridad similar, lo hacemos en una fase posterior, o hacemos una versión mínima ahora. Ejemplo: entiendo que la exportación a Excel les ahorra tiempo; agregarla son dos semanas, podemos sumarla en la fase 2, o reemplazar el filtro avanzado que todavía no empezamos. Dejá la decisión a quien corresponde y registrala. El error común es aceptar todo para mantener la relación y terminar con scope creep y una fecha imposible.',
        },
        {
          text: 'Explicar cómo controlás el presupuesto contra el avance real',
          explanation:
            'Compará el gasto real con el plan y, sobre todo, con el avance real, porque gastar el 50% del presupuesto es bueno o malo según cuánto se entregó. Cada semana o mes seguís las horas o costos incurridos por paquete de trabajo, lo comparás con el porcentaje de hitos o entregables completados y proyectás el costo al terminar (forecast) con la tasa de gasto actual. Mantené una reserva de contingencia para riesgos identificados y controlá cuándo se usa. Ejemplo: se gastó el 60% y se completó el 45% de los entregables; a ese ritmo el proyecto costaría un 33% más, así que lo levantás ahora con opciones. El error común es medir avance con el porcentaje de horas gastadas, que siempre parece ir bien hasta el final.',
        },
        {
          text: 'Explicar EVM y sus índices de costo y cronograma',
          explanation:
            'El earned value management mide costo y cronograma juntos con tres valores: PV (planned value, lo que debería estar hecho a hoy según el plan, en plata), EV (earned value, el valor presupuestado de lo realmente hecho) y AC (actual cost, lo realmente gastado). Los índices son CPI = EV / AC, eficiencia de costo, y SPI = EV / PV, eficiencia de cronograma; mayor a 1 es bueno, menor a 1 es malo. Ejemplo: PV 100.000, EV 80.000 y AC 100.000 dan CPI 0,8 (cada peso rinde 80 centavos) y SPI 0,8 (vas atrasado). El costo estimado al terminar se puede proyectar como EAC = BAC / CPI. Su límite en software es que depende de medir bien el porcentaje completado, así que conviene usar entregables terminados (0 o 100%) y no porcentajes subjetivos.',
        },
        {
          text: 'Comparar contratos de precio fijo y de tiempo y materiales',
          explanation:
            'En precio fijo se acuerda un alcance y un precio cerrado: el riesgo de que cueste más lo asume el proveedor, el cliente tiene previsibilidad de costo, pero cualquier cambio requiere negociación y el proveedor suele sumar un margen por riesgo. Conviene cuando el alcance es claro y estable. En tiempo y materiales se paga por las horas trabajadas a una tarifa acordada: el riesgo lo asume el cliente, hay flexibilidad para cambiar el alcance y encaja con trabajo ágil e incierto, pero requiere confianza y control del gasto. Hay modelos intermedios: tiempo y materiales con tope, precio fijo por fase o por sprint, o un precio fijo después de una fase de discovery pagada. El error común es firmar precio fijo para algo con alcance incierto, que termina en conflictos por cada cambio.',
        },
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
        {
          text: 'Diferenciar riesgo de problema',
          explanation:
            'Un riesgo es un evento incierto que todavía no pasó y que, si ocurre, afecta un objetivo del proyecto; se gestiona de forma preventiva. Un problema (issue) es algo que ya ocurrió y requiere acción ahora. Ejemplo: el proveedor de la API de pagos podría atrasar la entrega de su sandbox es un riesgo; el proveedor avisó que el sandbox se atrasa dos semanas es un problema. Muchos problemas son riesgos que se materializaron, y si tenías un plan de contingencia la respuesta es inmediata. También existen riesgos positivos, u oportunidades. El error común es llenar el registro de riesgos con problemas actuales o con preocupaciones vagas.',
        },
        {
          text: 'Registrar un riesgo con todos sus campos',
          explanation:
            'Cada riesgo se registra con: un id, una descripción con formato causa, evento y consecuencia (porque el proveedor tiene un solo desarrollador asignado, podría atrasar la integración, lo que movería el lanzamiento dos semanas), la probabilidad y el impacto (por ejemplo en escala de 1 a 5, con un puntaje que es el producto), un dueño que lo sigue, la respuesta elegida con acciones concretas, un plan de contingencia y su disparador (si el día 15 no tenemos el sandbox, activamos el mock), el estado y la fecha de próxima revisión. El dueño es una persona, no un equipo. El error común es una descripción vaga como problemas con el proveedor, que no se puede gestionar.',
        },
        {
          text: 'Explicar las cuatro respuestas posibles a un riesgo',
          explanation:
            'Evitar es eliminar el riesgo cambiando el plan, por ejemplo no usar una tecnología nueva y elegir una conocida. Mitigar es reducir la probabilidad o el impacto, como hacer un spike temprano para validar la integración o sumar una segunda persona que conozca el sistema. Transferir es pasar el impacto a un tercero, por ejemplo con un seguro, una cláusula contractual con penalidad o un servicio gestionado con SLA; ojo, el riesgo sigue existiendo, solo cambia quién paga. Aceptar es no hacer nada preventivo porque el costo de responder es mayor que el riesgo, idealmente con un plan de contingencia y un disparador. Para riesgos positivos las respuestas equivalentes son explotar, mejorar, compartir y aceptar.',
        },
        {
          text: 'Mantener un registro de riesgos útil y vivo',
          explanation:
            'Un registro útil es corto, se revisa con una cadencia fija (por ejemplo semanal, en una reunión de 15 minutos con los dueños de los riesgos principales) y está conectado con el plan: cada riesgo alto tiene una acción en curso con fecha. Se ordenan por puntaje para concentrarse en los cinco o diez más importantes, se cierran los que ya no aplican, se agregan los nuevos que surgen en dailies y retros, y se reportan los principales en el reporte de estado. Ejemplo de riesgo vivo: el puntaje bajó de 20 a 8 porque el spike confirmó la integración. El error común es armar el registro al inicio para cumplir y no volver a abrirlo nunca.',
        },
        {
          text: 'Gestionar una dependencia crítica con otro equipo',
          explanation:
            'Primero hacé explícita la dependencia: qué necesitás exactamente, para qué fecha y qué pasa si no llega. Hablá directamente con el responsable del otro equipo y entendé sus prioridades, porque tu urgencia no es automáticamente la suya; si hace falta, alineá la prioridad entre sus managers o el sponsor. Acordá entregables intermedios verificables (un contrato de API definido el día 5, un sandbox el día 15) y seguilos en vez de esperar la entrega final. Prepará un plan B: un mock para avanzar en paralelo, un alcance reducido o una alternativa. Ejemplo: el equipo de identidad tenía que exponer un endpoint; se acordó primero el contrato de la API y tu equipo trabajó con un mock mientras tanto. El error común es enterarse el día de la fecha de que no llega.',
        },
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
        {
          text: 'Identificar y mapear stakeholders por interés e influencia',
          explanation:
            'Primero listás a todos los que afectan o son afectados por el proyecto: sponsor, usuarios, equipos técnicos, áreas como legal, seguridad, soporte, ventas, proveedores y clientes. Después los ubicás en una matriz de poder o influencia contra interés: alta influencia y alto interés se gestionan de cerca (reuniones frecuentes, involucrar en decisiones); alta influencia y bajo interés se mantienen satisfechos (resúmenes cortos, consultar en lo que les importa); baja influencia y alto interés se mantienen informados; y el resto se monitorea. Ejemplo: el área de seguridad suele tener poco interés y mucha influencia, porque puede bloquear el lanzamiento, así que conviene consultarla temprano. El error común es descubrir a un stakeholder clave al final, cuando bloquea.',
        },
        {
          text: 'Armar una matriz RACI con un único aprobador por ítem',
          explanation:
            'La RACI asigna para cada entregable o decisión quién es Responsible (hace el trabajo), Accountable (aprueba y responde por el resultado), Consulted (da su opinión antes, comunicación de ida y vuelta) e Informed (se le avisa después). Por cada fila tiene que haber un único Accountable, porque dos aprobadores significan que nadie decide o que se bloquean entre sí. Ejemplo: para el diseño de la API, el líder técnico es A, dos desarrolladores son R, el equipo de seguridad es C y el PM y soporte son I. Revisá también columnas sin R o sin A y personas con demasiadas C, que generan cuellos de botella. El error común es armarla y no usarla para resolver quién decide cuando aparece la duda.',
        },
        {
          text: 'Escribir un reporte de estado semanal que se lea en un minuto',
          explanation:
            'Un buen reporte arranca con el estado general en una línea con semáforo y el motivo (amarillo: la integración con el banco se atrasa una semana, la fecha final todavía se sostiene). Después, en pocos puntos: avances de la semana contra hitos, próximos hitos con fecha, riesgos y problemas principales con su acción y dueño, y decisiones o ayuda que necesitás de los lectores, con fecha límite. Escribilo para alguien que solo va a leer las primeras dos líneas, y mantené el mismo formato todas las semanas para que se compare fácil. El error común es una lista larga de tareas hechas sin conclusión, o un verde permanente que de repente pasa a rojo: los semáforos honestos y tempranos generan confianza.',
        },
        {
          text: 'Comunicar un atraso llevando opciones con trade-offs',
          explanation:
            'Comunicalo apenas tengas evidencia, no cuando ya es inevitable, y primero en privado a quien decide. Explicá en pocas palabras qué pasó, la causa y el impacto real, y llevá dos o tres opciones con su trade-off: mantener la fecha recortando alcance, mantener el alcance moviendo la fecha, sumar recursos con su costo y riesgo. Incluí tu recomendación y qué necesitás para decidir. Ejemplo: la integración con el proveedor está tres semanas atrasada; opción A, lanzamos en fecha sin pagos con tarjeta; opción B, lanzamos completo tres semanas después; recomiendo A porque el 80% de los usuarios paga por transferencia. El error común es comunicar solo el problema, o maquillarlo, y que el stakeholder se entere por otro lado.',
        },
        {
          text: 'Manejar a un stakeholder que cambia prioridades',
          explanation:
            'Primero entendé el motivo del cambio, porque detrás suele haber una presión real (un cliente, un objetivo de su jefe). Después hacé visible el costo: mostrá lo que está en curso, qué se pierde al cambiar (trabajo descartado, cambio de contexto, fechas que se mueven) y pedí que elija qué sale si algo entra. Si los cambios son frecuentes, proponé una cadencia para repriorizar, como al inicio de cada sprint, protegiendo el trabajo en curso, y acordá un canal formal para urgencias reales. Si el conflicto es entre stakeholders con prioridades opuestas, llevalo al sponsor en vez de decidir vos. El error común es absorber cada cambio en silencio hasta que el equipo se quema y nada se termina.',
        },
        {
          text: 'Describir una gobernanza simple para un proyecto grande',
          explanation:
            'Una gobernanza simple define quién decide qué, cada cuánto se revisa el proyecto y cómo se escalan los problemas. Por ejemplo: un sponsor que es dueño del resultado y desempata, un comité de dirección mensual corto con sponsor y líderes de áreas para revisar hitos, presupuesto, riesgos altos y decisiones grandes, una reunión semanal de coordinación con líderes de equipo, y reglas de escalamiento claras (un desvío de más de dos semanas o del 10% del presupuesto va al comité). Se completa con la RACI para decisiones clave y un registro de decisiones. El objetivo es que las decisiones se tomen rápido y por quien corresponde, no agregar reuniones. El error común es una gobernanza pesada que aprueba todo y no decide nada.',
        },
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
        {
          text: 'Explicar cómo influís en un equipo sin autoridad formal',
          explanation:
            'Sin autoridad formal influís a través de la confianza, la información y los intereses de los demás. Concretamente: entendé qué le importa a cada persona y conectá el pedido con eso, usá datos para que la conversación sea sobre hechos, cumplí lo que prometés para ganar credibilidad, ayudá a remover bloqueos para que vean que les facilitás el trabajo, e involucrá a la gente en las decisiones para que las sientan propias. Cuando no alcanza, escalá con transparencia y sin sorpresas. Ejemplo: para que un equipo priorice tu dependencia, mostrás que también desbloquea un objetivo de ellos. El error común es intentar imponerte con urgencias o usando el nombre de un jefe.',
        },
        {
          text: 'Detectar sobrecarga con señales concretas y actuar',
          explanation:
            'Las señales concretas incluyen: trabajo fuera de horario de forma sostenida (commits o mensajes a la noche y los fines de semana), una persona con muchas más tareas en curso que el resto, plazos que se estiran sistemáticamente, más bugs o errores de los habituales, menos participación en reuniones, irritabilidad o comentarios de cansancio y aumento de licencias. Actuar significa hablarlo en privado con la persona, revisar la carga real con datos del tablero, repriorizar o redistribuir trabajo, limitar el WIP y, si el problema es el plan, renegociar alcance o fecha. Ejemplo: el único que sabe del sistema de pagos tiene cuatro tareas críticas; reasignás dos y armás pairing para repartir conocimiento. El error común es esperar a que la persona lo diga, porque casi nunca lo hace.',
        },
        {
          text: 'Resolver un desacuerdo técnico entre dos personas',
          explanation:
            'Primero escuchá a cada uno por separado o juntos para entender las posiciones y, sobre todo, los criterios detrás (performance, simplicidad, tiempo, mantenibilidad). Después llevá la discusión a criterios acordados: qué importa más para este proyecto y cómo se mide. Si sigue habiendo desacuerdo, usá evidencia (un spike o prueba de concepto acotado en tiempo), pedí que escriban las opciones con pros y contras, y que decida quien tiene esa responsabilidad, típicamente el líder técnico o arquitecto, registrando la decisión. Como PM no decidís la solución técnica, pero sí asegurás que se tome una decisión a tiempo. El error común es dejar que el desacuerdo se estire indefinidamente o tomar partido sin el conocimiento técnico.',
        },
        {
          text: 'Facilitar una reunión con objetivo y cierre claros',
          explanation:
            'Antes de convocar, preguntate si hace falta una reunión o alcanza con un mensaje. Si hace falta: definí un objetivo concreto en la invitación (decidir el proveedor de email, no hablar de emails), una agenda corta con tiempos, solo las personas necesarias y el material previo. Durante la reunión, recordá el objetivo al empezar, manejá el tiempo, hacé que hablen todos y llevá la discusión a una decisión. Al final, resumí decisiones, acciones con dueño y fecha, y mandalo por escrito ese mismo día. Ejemplo de cierre: decidimos el proveedor A; Juan configura la cuenta para el jueves; María avisa a soporte. El error común es una reunión que termina con hay que seguir hablándolo.',
        },
        {
          text: 'Facilitar una retrospectiva que termine en acciones con dueño',
          explanation:
            'Prepará un formato según el momento del equipo, por ejemplo qué funcionó, qué no y qué probamos, o una línea de tiempo del sprint para ver eventos concretos. Creá seguridad para hablar: foco en procesos y no en personas, anonimato si hace falta. Juntá las observaciones, agrupalas y votá las dos o tres más importantes, y dedicá el tiempo a entender causas y no solo síntomas. Cerrá con pocas acciones (una a tres), cada una concreta, con dueño y fecha, y revisá al inicio de la próxima retro si se cumplieron. Ejemplo de acción: agregar un checklist de deploy en el PR template, a cargo de Lucía, para el próximo sprint. El error común es una lista de diez quejas sin acciones, que hace que el equipo deje de creer en la retro.',
        },
        {
          text: 'Defender la calidad bajo presión de fecha',
          explanation:
            'Bajo presión de fecha, la calidad es lo que cede en silencio si nadie la defiende, y después se paga con bugs, incidentes y velocidad más baja. Defenderla no es negarse: es hacer visible el costo y ofrecer alternativas. Concretamente, separás lo que no se negocia (seguridad, integridad de datos, tests de lo crítico, cumplimiento de la definition of done) de lo que sí (alcance, pulido), y proponés recortar alcance en vez de calidad. Si se decide tomar un atajo, que sea explícito, con dueño y plan para pagarlo. Ejemplo: para llegar al lanzamiento, sacamos el modo offline en vez de saltear las pruebas del flujo de pagos. El error común es aceptar no testear para llegar y descubrir el problema en producción frente al cliente.',
        },
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
        {
          text: 'Explicar la diferencia entre proyecto, programa y portafolio',
          explanation:
            'Un proyecto es un esfuerzo temporal con un objetivo y entregables concretos, por ejemplo lanzar la app móvil. Un programa es un conjunto de proyectos relacionados que se gestionan coordinadamente porque juntos producen un beneficio que no se lograría por separado, por ejemplo la transformación digital del onboarding de clientes, que incluye la app, la integración con el CRM y la verificación de identidad. Un portafolio es el conjunto de todos los proyectos y programas de una organización o área, gestionados para elegir en qué invertir según la estrategia, con foco en priorización y asignación de recursos. En resumen: el proyecto busca entregar bien, el programa busca el beneficio conjunto y el portafolio busca hacer las cosas correctas.',
        },
        {
          text: 'Coordinar un programa con varios equipos interdependientes',
          explanation:
            'Primero hacé visibles las dependencias: un mapa de qué equipo necesita qué de quién y cuándo, y alineá a todos en un objetivo y unos hitos comunes del programa. Una sesión de planificación conjunta al inicio de cada período, al estilo de una PI planning, ayuda a que los equipos acuerden compromisos entre ellos. Después, una cadencia de sincronización corta (por ejemplo, semanal entre líderes de equipo) enfocada en dependencias, riesgos y bloqueos, no en el avance de cada uno. Reducí acoplamiento cuando puedas: contratos de API acordados temprano, mocks y entregas incrementales. Conviene una sola fuente de verdad del estado del programa. El error común es coordinar todo a través del PM, que se vuelve el cuello de botella.',
        },
        {
          text: 'Proponer una PMO que no agregue burocracia',
          explanation:
            'Una PMO (project management office) que aporte valor actúa como un servicio y no como un control: ofrece plantillas livianas opcionales, visibilidad del portafolio para la dirección, ayuda a priorizar y asignar recursos entre proyectos, coaching a PMs y equipos, y difusión de buenas prácticas y lecciones aprendidas. Para no agregar burocracia: pedí solo los datos que alguien realmente usa para decidir, sacalos automáticamente de las herramientas que ya usan los equipos, ajustá el proceso al tamaño del proyecto y medí su valor por resultados (proyectos más previsibles, decisiones más rápidas), no por cumplimiento de formularios. Ejemplo: un dashboard de portafolio alimentado de Jira en vez de un reporte manual semanal en planilla. El error común es una PMO que solo audita.',
        },
        {
          text: 'Enumerar los pasos para cerrar un proyecto',
          explanation:
            'Los pasos para cerrar son: confirmar que todos los entregables se aceptaron formalmente por el cliente o sponsor, hacer el traspaso a operaciones o soporte (documentación, capacitación, accesos, runbooks), cerrar contratos y pagos con proveedores, cerrar el presupuesto y reportar el costo final contra el plan, liberar recursos y reasignar al equipo, hacer una retrospectiva o sesión de lecciones aprendidas y documentarlas donde otros las encuentren, archivar la documentación del proyecto y comunicar el cierre y los resultados a los stakeholders. Si hay beneficios que se miden después, como adopción o ahorro, acordá quién y cuándo los mide. El error común es que el proyecto se termine solo cuando el equipo pasa a otra cosa, sin traspaso ni aprendizaje.',
        },
        {
          text: 'Medir el éxito de un proyecto más allá del triángulo de hierro',
          explanation:
            'Cumplir alcance, tiempo y costo dice si se entregó según el plan, pero no si el proyecto sirvió. Para medir éxito real sumás: si se lograron los beneficios de negocio que lo justificaron (ahorro, ingresos, reducción de errores o de tiempo), la adopción real por los usuarios, la satisfacción de clientes y stakeholders, la calidad en producción (incidentes, bugs después del lanzamiento) y el estado del equipo (rotación, desgaste). Ejemplo: un sistema entregado en fecha y presupuesto que nadie usa es un fracaso; uno que se atrasó un mes pero redujo los tiempos de atención un 40% es un éxito. Definí estos criterios al inicio junto con el sponsor. El error común es declarar éxito solo por cumplir la fecha.',
        },
        {
          text: 'Explicar cómo usás la IA en el día a día del rol',
          explanation:
            'Contá usos concretos y cómo verificás el resultado. Por ejemplo: resumir hilos largos o transcripciones de reuniones en decisiones y acciones, redactar el primer borrador de reportes de estado o actas, armar una primera WBS o lista de riesgos a partir de un brief para después ajustarla, analizar datos del tablero para detectar cuellos de botella o calcular pronósticos, y preparar comunicaciones difíciles probando distintos tonos. Lo importante es aclarar que la IA genera borradores y vos sos responsable de verificar los datos, las fechas y el contexto político que el modelo no conoce. Mencioná también el cuidado con información confidencial del cliente según las políticas de la empresa. El error común es decir que no la usás o que la usás para todo sin control.',
        },
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
        {
          text: 'Describir tus primeras dos semanas en un proyecto en rojo',
          explanation:
            'Las primeras dos semanas son para diagnosticar antes de cambiar el plan. Semana uno: hablá uno a uno con el sponsor, el equipo, los líderes técnicos y stakeholders clave para entender expectativas, problemas y versiones de la historia; revisá el plan, el backlog, el presupuesto, los riesgos y los datos reales de avance. Al mismo tiempo, buscá quick wins de bajo riesgo, como destrabar una decisión pendiente o resolver un bloqueo, para ganar confianza. Semana dos: armá un diagnóstico con causas raíz, un estado real (fecha y costo proyectados con datos) y opciones de replan, y presentalo al sponsor para decidir. Agregá una cadencia de comunicación honesta desde el día uno. El error común es llegar cambiando todo el proceso o prometiendo la fecha original sin haber entendido nada.',
        },
        {
          text: 'Identificar causas reales de un desvío y no solo síntomas',
          explanation:
            'Un síntoma es lo que se ve (estamos atrasados tres semanas, hay muchos bugs); una causa es por qué pasa. Para llegar a la causa usás técnicas como los cinco porqués: el sprint se atrasó, porque las historias no se terminan, porque esperan revisión de QA, porque hay un solo tester para tres equipos. O un diagrama de Ishikawa que ordena causas posibles por categorías (personas, proceso, tecnología, requisitos, proveedores). Validá cada hipótesis con datos: lead time por etapa, cambios de alcance, rotación, bugs por módulo. Causas reales típicas: alcance que crece sin control, estimaciones sin base, dependencias externas, falta de decisión del cliente, deuda técnica. El error común es proponer más horas extra, que ataca el síntoma y empeora la causa.',
        },
        {
          text: 'Armar un plan desde un brief con hitos, dependencias y riesgos',
          explanation:
            'Leé el brief buscando el objetivo, las restricciones (fecha, presupuesto, equipo) y lo que falta, y anotá supuestos explícitos para lo que no está claro. Después armá una WBS de alto nivel por entregables, identificá las dependencias entre ellos (internas y externas, como proveedores o aprobaciones), ubicá hitos verificables en los puntos clave, con prioridad a validar temprano lo más riesgoso, y estimá con rangos. Completá con los cinco riesgos principales con su respuesta y una propuesta de comunicación y gobernanza. Ejemplo de hito temprano: integración con el sistema del banco probada en sandbox en la semana 3. El error común es presentar un Gantt detallado sin explicar supuestos ni riesgos, cuando lo que se evalúa es el razonamiento.',
        },
        {
          text: 'Resolver un escenario con varios problemas priorizando',
          explanation:
            'Cuando un escenario tiene varios problemas a la vez (un atraso, un conflicto en el equipo, un cliente enojado, una persona que renuncia) no los resuelvas en el orden en que aparecen. Primero listalos y clasificalos por impacto en el objetivo y urgencia, y buscá relaciones: muchas veces uno es causa de otros. Atendé primero lo que bloquea o tiene riesgo de daño irreversible (seguridad, datos, un compromiso contractual inminente), delegá o calendarizá lo demás y decí explícitamente qué dejás para después y por qué. Ejemplo: antes de replanificar la fecha, asegurás la transferencia de conocimiento de quien renuncia, porque si no el replan no tiene sentido. El error común es querer resolver todo a la vez sin mostrar el criterio.',
        },
        {
          text: 'Presentar un replan con opciones de alcance y fecha',
          explanation:
            'Un replan se presenta como una decisión a tomar, no como una mala noticia. Estructura: situación actual con datos (lo entregado, lo que falta, el ritmo real del equipo), causas principales del desvío y qué cambia para que no se repita, y dos o tres opciones con alcance, fecha, costo y riesgo de cada una. Por ejemplo: opción A, fecha original con el 70% del alcance priorizado; opción B, alcance completo seis semanas después; opción C, alcance completo en cuatro semanas sumando dos personas, con más costo y riesgo de ramp-up. Incluí tu recomendación justificada y pedí una decisión con fecha. El error común es presentar una sola opción, o una fecha nueva optimista que se vuelve a romper.',
        },
        {
          text: 'Practicar al menos tres casos con tiempo limitado',
          explanation:
            'Juntá enunciados de casos típicos: un proyecto en rojo para rescatar, armar un plan desde un brief, un escenario con varios problemas simultáneos, un stakeholder difícil o un replan. Resolvé cada uno con cronómetro (30 a 45 minutos, como en la entrevista), en voz alta y escribiendo lo esencial, idealmente con alguien que haga de entrevistador y te repregunte. Después revisá: si hiciste preguntas aclaratorias, si separaste síntomas de causas, si diste opciones con trade-offs y si cerraste con próximos pasos concretos. Pensarlo en silencio no se parece a explicarlo bajo presión, y con tres casos practicados ganás estructura y fluidez.',
        },
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
        {
          text: 'Hacer preguntas aclaratorias antes de responder un escenario',
          explanation:
            'Antes de responder un escenario preguntá lo que cambia la respuesta: el objetivo y qué es más importante para el negocio (fecha, alcance o costo), el tamaño y composición del equipo, la metodología, quién es el sponsor, si hay contrato con el cliente y qué tan rígida es la fecha. Dos a cuatro preguntas alcanzan. Si te dicen que lo decidas vos, explicitá tus supuestos y seguí: asumo que la fecha es contractual y el alcance se puede negociar. Ejemplo: ante el proyecto se atrasa, ¿qué hacés?, preguntás cuánto se atrasa, por qué y qué tan fija es la fecha. Esto demuestra exactamente lo que el rol requiere: no actuar sin entender el contexto.',
        },
        {
          text: 'Admitir lo que no sabés y explicar cómo lo averiguarías',
          explanation:
            'Decilo de forma directa y mostrá cómo lo resolverías: no trabajé con EVM en un proyecto real, pero entiendo los índices y lo aplicaría así, o no conozco esa herramienta, en mi último proyecto usé una similar para lo mismo. Si es una pregunta sobre un escenario, podés razonar en voz alta a partir de principios. Esto muestra honestidad y criterio, dos cosas clave en un PM, que tiene que reportar estados reales. Inventar una respuesta es lo peor: con una repregunta queda en evidencia y tira abajo la credibilidad del resto de la entrevista.',
        },
        {
          text: 'Tener cinco historias STAR con resultados concretos',
          explanation:
            'Armá cada historia con STAR: Situación (contexto breve: proyecto, equipo, tamaño), Tarea (tu responsabilidad concreta), Acción (lo que hiciste vos, con las decisiones y el porqué, que es la parte más larga) y Resultado (un número y lo que aprendiste). Cubrí los temas más preguntados para PM: un proyecto atrasado que recuperaste, un conflicto en el equipo o con un stakeholder, un cambio de alcance que negociaste, un riesgo que anticipaste o que se materializó, y un fracaso. Ejemplo de resultado concreto: entregamos dos semanas después de lo original pero dentro del presupuesto, y el cliente renovó el contrato. Escribilas, ensayalas en voz alta a unos dos minutos y prepará qué harías distinto en cada una.',
        },
        {
          text: 'Preparar cinco preguntas para hacerle a la empresa',
          explanation:
            'Las buenas preguntas te ayudan a decidir si querés el puesto y muestran cómo pensás. Ejemplos para PM: qué tipo de proyectos manejaría y en qué estado están hoy; cuánta autoridad tiene el rol sobre alcance, presupuesto y fechas; qué metodología usan los equipos y quién la decide; cómo es la relación entre project managers, product managers y líderes técnicos; cómo se mide el éxito de esta persona a los seis meses. Prepará cinco por si algunas se responden durante la entrevista. Evitá preguntas que están en la web de la empresa y dejá salario y beneficios para recruiting.',
        },
        {
          text: 'Ensayar en voz alta un caso de rescate completo',
          explanation:
            'Elegí un caso de rescate (por ejemplo: proyecto de seis meses, en el mes cuatro va al 40%, el cliente está enojado y el líder técnico renunció) y resolvelo en voz alta de punta a punta en unos 30 minutos, con cronómetro. Seguí una estructura: preguntas aclaratorias, cómo harías el diagnóstico de las primeras dos semanas, las causas probables, acciones inmediatas, opciones de replan con trade-offs y cómo lo comunicarías al sponsor y al cliente. Grabate o hacelo con alguien y revisá si fuiste concreto, si diste opciones y si mostraste criterio de prioridad. Repetilo con otro escenario hasta que la estructura te salga natural.',
        },
      ],
    },
  ],
};
