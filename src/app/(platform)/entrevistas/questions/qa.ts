import type { InterviewQuestion, Seniority } from './types';

export const qaQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'fundamentos',
      question: '¿Qué diferencia hay entre QA, QC y testing?',
      answer:
        'QA (Quality Assurance) es preventivo y apunta al proceso: definir prácticas para que los defectos no se introduzcan. QC (Quality Control) es correctivo y apunta al producto: verificar que cumple los requisitos. El testing es una actividad concreta dentro de QC que ejecuta el software para encontrar defectos.',
    },
    {
      topic: 'fundamentos',
      question: '¿Qué diferencia hay entre un error, un defecto y una falla?',
      answer:
        'El error es la equivocación humana (por ejemplo, entender mal un requisito). El defecto o bug es la consecuencia en el código o en un artefacto. La falla es cuando ese defecto se manifiesta al ejecutar el sistema y el comportamiento observado difiere del esperado. No todo defecto produce una falla visible.',
    },
    {
      topic: 'fundamentos',
      question: '¿Qué diferencia hay entre testing funcional y no funcional? Dá ejemplos.',
      answer:
        'El funcional verifica qué hace el sistema contra los requisitos: que el login acepte credenciales válidas o que el carrito calcule bien el total. El no funcional verifica cómo lo hace: performance, seguridad, usabilidad, accesibilidad, compatibilidad. Los dos son necesarios para hablar de calidad.',
    },
    {
      topic: 'niveles',
      question: '¿Cuáles son los niveles de testing?',
      answer:
        'Unitario (una función o componente aislado), de integración (cómo interactúan módulos o servicios), de sistema (la aplicación completa contra los requisitos) y de aceptación (si el sistema sirve al usuario o al negocio, como UAT). Cada nivel encuentra tipos distintos de defectos.',
    },
    {
      topic: 'tipos de testing',
      question: '¿Qué diferencia hay entre smoke testing y sanity testing?',
      answer:
        'El smoke es una verificación amplia y superficial de que un build nuevo es estable: la app levanta, se puede loguear, los flujos críticos responden. El sanity es angosto y profundo: después de un fix puntual, verifica que esa funcionalidad anda y que tiene sentido seguir probando. Si falla el smoke, el build se rechaza.',
    },
    {
      topic: 'tipos de testing',
      question: '¿Qué es el testing de regresión y cuándo se hace?',
      answer:
        'Es volver a probar funcionalidades que ya andaban para confirmar que un cambio nuevo (feature, fix, refactor, actualización de dependencias) no las rompió. Se hace antes de cada release y después de cambios relevantes. Como crece con el producto, se prioriza por riesgo y es el principal candidato a automatizar.',
    },
    {
      topic: 'tipos de testing',
      question: '¿Qué es el testing exploratorio?',
      answer:
        'Es aprender, diseñar y ejecutar pruebas al mismo tiempo, guiado por la curiosidad y la experiencia del tester en vez de casos escritos de antemano. Se organiza en sesiones con un objetivo (charter) y un tiempo acotado, tomando notas de lo encontrado. Es muy bueno para encontrar bugs que los casos guionados no anticipan.',
    },
    {
      topic: 'casos de prueba',
      question: '¿Qué partes tiene un buen caso de prueba?',
      answer:
        'Un ID, un título claro, precondiciones, datos de prueba, pasos concretos y el resultado esperado. Opcionalmente prioridad y trazabilidad al requisito o historia. Tiene que ser reproducible por cualquier persona del equipo y verificar una sola cosa para que el resultado sea inequívoco.',
    },
    {
      topic: 'bugs',
      question: '¿Qué información tiene que tener un buen reporte de bug?',
      answer:
        'Un título descriptivo, pasos para reproducir, resultado esperado vs. obtenido, entorno (versión, navegador, dispositivo, SO), severidad y evidencia (capturas, video, logs, request/response). Tiene que ser reproducible y objetivo, un bug por reporte, sin suposiciones sobre la causa.',
    },
    {
      topic: 'bugs',
      question:
        '¿Qué diferencia hay entre severidad y prioridad? Dá un ejemplo de cada combinación.',
      answer:
        'La severidad mide el impacto técnico del defecto; la prioridad, la urgencia de arreglarlo para el negocio. Alta severidad y baja prioridad: un crash en una pantalla que casi nadie usa. Baja severidad y alta prioridad: el logo de la empresa mal escrito en la home. Severidad la suele proponer QA; prioridad la define producto.',
    },
    {
      topic: 'diseño de pruebas',
      question: '¿Qué son las particiones de equivalencia?',
      answer:
        'Es dividir los datos de entrada en grupos que el sistema debería tratar igual, y probar un valor representativo de cada uno. Por ejemplo, si una edad válida va de 18 a 65, hay tres particiones: menor a 18, de 18 a 65 y mayor a 65. Reduce la cantidad de casos sin perder cobertura.',
    },
    {
      topic: 'diseño de pruebas',
      question:
        '¿Qué es el análisis de valores límite? ¿Qué valores probarías para un campo que acepta de 1 a 100?',
      answer:
        'Es probar en los bordes de las particiones, porque ahí se concentran los errores (un `<` en vez de `<=`). Para 1 a 100 probaría 0, 1, 2, 99, 100 y 101. Se complementa con particiones de equivalencia y con valores inválidos como vacío, negativos o texto.',
    },
    {
      topic: 'fundamentos',
      question: '¿Qué diferencia hay entre testing de caja negra y caja blanca?',
      answer:
        'En caja negra se prueba sin conocer el código, solo entradas y salidas contra los requisitos; es lo típico del testing manual funcional. En caja blanca se diseñan pruebas a partir de la estructura interna (caminos, condiciones, cobertura). La caja gris combina ambos, por ejemplo conociendo la base de datos o la API.',
    },
    {
      topic: 'fundamentos',
      question: '¿Qué diferencia hay entre verificación y validación?',
      answer:
        'Verificación responde "¿lo estamos construyendo bien?": que el producto cumpla las especificaciones, con revisiones y pruebas. Validación responde "¿estamos construyendo lo correcto?": que el producto resuelva la necesidad real del usuario, por ejemplo con UAT. Se puede cumplir la especificación y aun así no servir.',
    },
    {
      topic: 'api',
      question: '¿Cómo probarías manualmente un endpoint con Postman?',
      answer:
        'Configuraría método, URL, headers (por ejemplo `Authorization` y `Content-Type`) y body, y verificaría el código de estado, el cuerpo de la respuesta, los headers y el tiempo de respuesta. Después probaría casos negativos: campos faltantes, tipos inválidos, sin token, recursos inexistentes. Uso variables de entorno para no hardcodear URLs ni tokens.',
    },
    {
      topic: 'api',
      question:
        '¿Qué código de estado esperarías en cada caso: crear un recurso, request sin token, sin permisos y recurso inexistente?',
      answer:
        'Crear un recurso: `201 Created`. Sin token o token inválido: `401 Unauthorized`. Autenticado pero sin permisos: `403 Forbidden`. Recurso inexistente: `404 Not Found`. Si el body es inválido, `400` o `422`, y un `500` ante input del usuario casi siempre es un bug para reportar.',
    },
    {
      topic: 'bases de datos',
      question: '¿Para qué usarías SQL siendo QA manual?',
      answer:
        'Para verificar que lo que muestra la UI o devuelve la API se persiste correctamente, preparar datos de prueba y encontrar registros en estados particulares. Con un `SELECT ... WHERE` confirmo que un pedido se guardó con el estado y el total correctos, y con `JOIN` reviso relaciones entre tablas. En entornos compartidos, cuidado con `UPDATE` y `DELETE`.',
    },
    {
      topic: 'stlc',
      question: '¿Qué es el STLC y cuáles son sus fases?',
      answer:
        'Es el ciclo de vida del testing: análisis de requisitos, planificación, diseño de casos, preparación del entorno, ejecución y cierre. Cada fase tiene criterios de entrada y salida. En el cierre se resumen resultados, defectos y lecciones aprendidas.',
    },
    {
      topic: 'tipos de testing',
      question: '¿Qué es el UAT y quién lo hace?',
      answer:
        'User Acceptance Testing es la última validación antes de salir a producción, hecha por usuarios finales, clientes o el negocio, para confirmar que el sistema sirve para sus tareas reales. QA suele preparar el entorno, los datos y los escenarios, pero la decisión de aceptar es del negocio.',
    },
    {
      topic: 'fundamentos',
      question: '¿Por qué no es posible probar todo?',
      answer:
        'Porque las combinaciones de entradas, estados, entornos y caminos son prácticamente infinitas. Por eso se usan técnicas de diseño para reducir casos y se prioriza por riesgo. Además, el testing muestra la presencia de defectos, no su ausencia: que no encontremos bugs no prueba que no haya.',
    },
  ],
  'semi-senior': [
    {
      topic: 'diseño de pruebas',
      question: '¿Qué son las tablas de decisión y cuándo conviene usarlas?',
      answer:
        'Son una técnica para reglas de negocio con varias condiciones combinadas: cada columna es una combinación de condiciones con su acción esperada. Por ejemplo, un descuento que depende de si el cliente es premium, si el monto supera un mínimo y si hay cupón. Garantizan que no se escape ninguna combinación y exponen reglas ambiguas o faltantes.',
    },
    {
      topic: 'diseño de pruebas',
      question: '¿Cómo aplicarías la técnica de transición de estados? Dá un ejemplo.',
      answer:
        'Se modela el sistema como estados, eventos y transiciones, y se diseñan casos para cubrir transiciones válidas e intentar las inválidas. Ejemplo: un pedido pasa de `pendiente` a `pagado`, `enviado` y `entregado`, o a `cancelado`. Probaría que no se pueda cancelar uno `entregado` o pagar dos veces, y que tres logins fallidos bloqueen la cuenta.',
    },
    {
      topic: 'diseño de pruebas',
      question: '¿Qué es el pairwise testing y qué problema resuelve?',
      answer:
        'Es una técnica combinatoria que cubre todos los pares posibles de valores entre parámetros en vez de todas las combinaciones. Se basa en que la mayoría de los defectos los disparan uno o dos factores. Con navegador, SO, idioma y tipo de usuario reduce cientos de combinaciones a un puñado de casos, generados con herramientas como PICT.',
    },
    {
      topic: 'bugs',
      question: '¿Cuál es el ciclo de vida de un defecto?',
      answer:
        'Típicamente: nuevo, asignado, en progreso, resuelto, en re-test y cerrado. Puede ir a reabierto si el re-test falla, o a rechazado, duplicado o diferido según el triage. Lo importante es que el flujo esté acordado en el equipo y que QA verifique el fix antes de cerrarlo.',
    },
    {
      topic: 'bugs',
      question: '¿Qué hacés con un bug que no podés reproducir de forma consistente?',
      answer:
        'Lo reporto igual, marcándolo como intermitente con la frecuencia observada y toda la evidencia: logs, hora exacta, usuario, datos, red, video. Busco el patrón variando condiciones (datos, timing, concurrencia, caché, dispositivo) y reviso logs del backend o la consola del navegador. Muchas veces el patrón aparece al cruzar con observabilidad.',
    },
    {
      topic: 'casos de prueba',
      question: '¿Qué incluye un plan de pruebas?',
      answer:
        'Alcance (qué se prueba y qué no), objetivos, enfoque y tipos de testing, entornos y datos, roles, cronograma, criterios de entrada y salida, riesgos y mitigaciones y entregables. No tiene que ser un documento enorme: en equipos ágiles puede ser una página viva que se acuerda con el equipo.',
    },
    {
      topic: 'casos de prueba',
      question: '¿Qué es una matriz de trazabilidad y para qué sirve?',
      answer:
        'Relaciona requisitos o historias con sus casos de prueba y los defectos asociados. Sirve para detectar requisitos sin cobertura, evaluar el impacto de un cambio (qué casos re-ejecutar) y mostrar el estado de calidad por funcionalidad. En la práctica suele vivir en la herramienta de gestión enlazando tickets y casos.',
    },
    {
      topic: 'agile',
      question: '¿Cómo escribirías criterios de aceptación con el formato Given/When/Then?',
      answer:
        'Cada escenario describe un contexto, una acción y un resultado observable: "Dado un usuario con el carrito vacío, cuando agrega un producto, entonces el contador muestra 1". Tienen que ser concretos, verificables y desde la perspectiva del usuario, cubriendo el camino feliz, los alternativos y los errores. Sirven como base de los casos de prueba.',
    },
    {
      topic: 'agile',
      question: '¿Qué es BDD y qué aporta más allá de la sintaxis Gherkin?',
      answer:
        'Behavior-Driven Development es una práctica colaborativa donde producto, desarrollo y QA definen el comportamiento con ejemplos concretos antes de construir, por ejemplo en sesiones de "three amigos". El valor está en la conversación que alinea el entendimiento y descubre casos borde temprano, no en escribir Gherkin. Sin esa colaboración, es solo otro formato de tests.',
    },
    {
      topic: 'shift-left',
      question: '¿Qué significa shift-left testing y cómo lo aplicarías?',
      answer:
        'Es mover las actividades de calidad lo antes posible en el ciclo, porque un defecto cuesta mucho menos si se encuentra en el requisito que en producción. En la práctica: participar del refinamiento, revisar historias y diseños, definir criterios de aceptación con el equipo, testear en ramas o entornos efímeros y acompañar a los devs en sus pruebas.',
    },
    {
      topic: 'agile',
      question: '¿Cuál es el rol de QA en un equipo Scrum?',
      answer:
        'QA es parte del equipo, no una etapa al final. Aporta en el refinamiento haciendo preguntas y detectando ambigüedades, ayuda a definir la Definition of Done, prueba de forma continua durante el sprint y difunde prácticas de calidad. La calidad es responsabilidad de todo el equipo; QA la facilita y la hace visible.',
    },
    {
      topic: 'api',
      question: '¿Qué casos probarías en un endpoint `POST /users` más allá del camino feliz?',
      answer:
        'Campos obligatorios faltantes, tipos y formatos inválidos (email mal formado), valores límite en longitudes, duplicados (email ya registrado, esperando `409`), caracteres especiales y unicode, payloads muy grandes, sin autenticación o sin permisos e idempotencia ante reintentos. También verificaría que la respuesta no exponga datos sensibles como el hash de la contraseña.',
    },
    {
      topic: 'bases de datos',
      question: '¿Cómo verificarías con SQL la integridad de los datos después de una migración?',
      answer:
        'Comparando cantidades de registros entre origen y destino con `COUNT(*)`, buscando huérfanos con `LEFT JOIN ... WHERE x.id IS NULL`, duplicados con `GROUP BY ... HAVING COUNT(*) > 1` y nulos en columnas obligatorias. También revisaría muestras de registros puntuales, sumas de montos y que los formatos de fechas y encodings se hayan conservado.',
    },
    {
      topic: 'accesibilidad',
      question: '¿Cómo harías una revisión manual de accesibilidad de una pantalla?',
      answer:
        'Navegaría solo con teclado (orden de foco lógico, foco visible, sin trampas), la probaría con un lector de pantalla como VoiceOver o NVDA, revisaría contraste, textos alternativos en imágenes, labels en formularios y mensajes de error asociados, y el zoom al 200%. Me guío por WCAG nivel AA y complemento con herramientas como axe o Lighthouse.',
    },
    {
      topic: 'usabilidad',
      question: '¿Qué tenés en cuenta al hacer testing de usabilidad?',
      answer:
        'Si el usuario puede completar sus tareas de forma eficiente y sin confusión: claridad de textos y flujos, consistencia, feedback ante acciones, mensajes de error útiles y prevención de errores. Las heurísticas de Nielsen son una buena guía. Lo ideal es observar usuarios reales haciendo tareas, porque QA conoce demasiado el producto.',
    },
    {
      topic: 'mobile',
      question: '¿Qué aspectos específicos probarías en una app mobile?',
      answer:
        'Distintos tamaños de pantalla y versiones de SO, rotación, interrupciones (llamadas, notificaciones, pasar a background), red lenta o sin conexión y cambios de red, permisos, consumo de batería y memoria, gestos y teclado, deep links y actualizaciones de la app. Combino dispositivos reales con emuladores o granjas de dispositivos.',
    },
    {
      topic: 'cross-browser',
      question: '¿Cómo decidís en qué navegadores y dispositivos probar?',
      answer:
        'A partir de los datos de analytics de los usuarios reales y de los requisitos del negocio, priorizando las combinaciones que cubren la mayoría del tráfico y las críticas para clientes importantes. Defino una matriz de soporte con niveles (completo, básico) y uso técnicas como pairwise para no explotar combinaciones. Safari en iOS casi siempre merece atención especial.',
    },
    {
      topic: 'estrategia',
      question: '¿Cómo priorizás qué probar cuando hay poco tiempo antes de un release?',
      answer:
        'Con testing basado en riesgo: identifico lo que más impacto tendría si falla (pagos, login, flujos principales) y lo que más probabilidad tiene de romperse (lo que cambió, lo complejo, lo que históricamente tuvo bugs). Pruebo eso primero y comunico explícitamente qué quedó sin cubrir para que la decisión de salir sea informada.',
    },
    {
      topic: 'estrategia',
      question: '¿Qué son los criterios de entrada y salida en testing?',
      answer:
        'Los de entrada definen cuándo se puede empezar a probar: build desplegado y estable, smoke aprobado, entorno y datos listos, historias con criterios de aceptación. Los de salida definen cuándo se considera terminado: casos críticos ejecutados, sin bugs bloqueantes ni críticos abiertos, riesgos residuales aceptados. Evitan discusiones subjetivas sobre "¿ya está?".',
    },
    {
      topic: 'métricas',
      question: '¿Qué métricas de calidad usarías en un equipo y cuáles evitarías?',
      answer:
        'Útiles: defectos escapados a producción, densidad de defectos por módulo, tiempo de resolución, tasa de reapertura y cobertura de requisitos. Evitaría medir a las personas por cantidad de bugs reportados o casos ejecutados, porque incentiva comportamientos que no mejoran la calidad. Las métricas sirven para detectar tendencias, no para premiar o castigar.',
    },
  ],
  senior: [
    {
      topic: 'estrategia',
      question:
        '¿Cómo diseñarías la estrategia de calidad para una organización que hoy no tiene QA?',
      answer:
        'Empezaría por entender el producto, los riesgos y dónde duele hoy (incidentes, quejas, retrabajo). Definiría un enfoque de calidad compartida con prácticas mínimas: criterios de aceptación, Definition of Done, code review, tests en el pipeline y un proceso de manejo de incidentes. Iría incrementalmente, midiendo defectos escapados y tiempo de recuperación para mostrar impacto.',
    },
    {
      topic: 'estrategia',
      question: '¿Qué es la pirámide de testing y cuándo tiene sentido desviarse de ella?',
      answer:
        'Propone muchos tests unitarios rápidos y baratos, menos de integración y pocos end-to-end, más el exploratorio manual encima. Es una guía, no una regla: en apps con mucha integración y poca lógica propia el "trofeo" de testing pone el peso en integración. El antipatrón a evitar es el cono de helado: casi todo manual o E2E, lento y frágil.',
    },
    {
      topic: 'estrategia',
      question: '¿Cómo decidís qué automatizar y qué dejar como testing manual?',
      answer:
        'Automatizo lo repetitivo, estable y de alto valor: regresión de flujos críticos, validaciones de datos, casos que se ejecutan en cada build. Dejo manual lo que requiere juicio humano (exploratorio, usabilidad, UX visual), lo que cambia mucho o se prueba una sola vez. El criterio es el retorno: costo de crear y mantener vs. frecuencia de ejecución y riesgo cubierto.',
    },
    {
      topic: 'producción',
      question: '¿Qué significa testing en producción y cómo lo harías de forma segura?',
      answer:
        'Es validar con tráfico, datos e infraestructura reales, cosa que ningún entorno de staging replica del todo. Se hace de forma controlada: feature flags, canary releases y despliegues progresivos, dark launches, synthetic monitoring y pruebas con usuarios internos. Requiere rollback rápido, buena observabilidad y cuidado con los datos de prueba para no contaminar métricas.',
    },
    {
      topic: 'observabilidad',
      question: '¿Qué relación hay entre observabilidad y calidad?',
      answer:
        'Ningún testing previo encuentra todo, así que la calidad también depende de detectar y diagnosticar rápido lo que falla en producción. Logs estructurados, métricas, trazas distribuidas y alertas sobre SLOs permiten ver el impacto real en usuarios y reducir el MTTR. QA puede definir qué señales indican que un feature funciona y usar los datos de producción para orientar el testing.',
    },
    {
      topic: 'quality gates',
      question: '¿Qué son los quality gates y cómo los definirías?',
      answer:
        'Son puntos de control con criterios objetivos que un cambio debe cumplir para avanzar en el pipeline: tests en verde, sin vulnerabilidades críticas, cobertura mínima en código nuevo, análisis estático, performance dentro de un umbral. Los definiría pocos y significativos, acordados con el equipo, porque un gate que se saltea siempre o que es ruidoso pierde credibilidad.',
    },
    {
      topic: 'riesgos',
      question: '¿Cómo harías un análisis de riesgos para planificar el testing de un proyecto?',
      answer:
        'Identificaría riesgos de producto (funcionalidades críticas, integraciones, datos sensibles, cumplimiento normativo) y de proyecto (plazos, dependencias, conocimiento del equipo) junto con negocio y desarrollo. Los puntuaría por probabilidad e impacto en una matriz y asignaría profundidad de testing en proporción. Lo revisaría a lo largo del proyecto porque los riesgos cambian.',
    },
    {
      topic: 'liderazgo',
      question:
        '¿Cómo construís una cultura donde la calidad es responsabilidad de todo el equipo?',
      answer:
        'Involucrando a todos desde el inicio: QA en el refinamiento, devs escribiendo y manteniendo tests, producto definiendo criterios de aceptación claros. Hago visibles los datos de calidad sin buscar culpables, con postmortems blameless, y paso de ser un "gatekeeper" a un coach que enseña técnicas de testing. El objetivo es que nadie piense en QA como la red de seguridad final.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo manejás una presión del negocio para salir a producción con bugs conocidos?',
      answer:
        'Mi rol es dar información clara para una decisión informada, no bloquear por principio. Presento cada bug con su impacto real, probabilidad, usuarios afectados y workarounds, y propongo alternativas: salir con un feature flag apagado, reducir el alcance o un plan de fix inmediato con monitoreo. Si se decide salir, queda documentado el riesgo aceptado y quién lo aceptó.',
    },
    {
      topic: 'métricas',
      question: '¿Cómo medirías si la estrategia de calidad de una organización está funcionando?',
      answer:
        'Con métricas de resultado más que de actividad: defectos escapados y su severidad, incidentes y MTTR, change failure rate y lead time (métricas DORA), satisfacción del usuario y tickets de soporte. Las combino con señales del proceso como tiempo de feedback del pipeline y flaky tests. Lo importante son las tendencias y que guíen decisiones, no un número aislado.',
    },
    {
      topic: 'agile',
      question:
        '¿Cómo encarás la calidad en un equipo que hace deploys continuos varias veces por día?',
      answer:
        'No hay lugar para una fase de testing manual larga antes de cada deploy, así que la calidad se distribuye: criterios claros antes de codear, tests automatizados confiables en el pipeline, cambios chicos detrás de feature flags y despliegues progresivos con monitoreo y rollback automático. El testing manual se enfoca en exploratorio de features nuevos, idealmente antes de habilitarlos.',
    },
    {
      topic: 'estrategia',
      question: '¿Cómo organizarías el testing en una arquitectura de microservicios?',
      answer:
        'Priorizando tests rápidos y aislados por servicio y contratos explícitos entre ellos (contract testing) en lugar de depender de grandes suites end-to-end en un entorno compartido, que son lentas y frágiles. Unos pocos E2E para los journeys críticos, ambientes efímeros por cambio cuando se pueda y mucha observabilidad con trazas distribuidas para diagnosticar fallas entre servicios.',
    },
    {
      topic: 'datos de prueba',
      question: '¿Cómo gestionarías los datos de prueba en una organización con datos sensibles?',
      answer:
        'Nunca copiaría datos de producción sin anonimizar. Usaría datos sintéticos generados para cubrir los casos necesarios, o subconjuntos de producción enmascarados de forma irreversible cumpliendo normativas de privacidad. Definiría datasets versionados y reproducibles, con mecanismos para crearlos y limpiarlos por test, evitando dependencias entre pruebas en entornos compartidos.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo estructurarías un equipo de QA: embebido en los squads o centralizado?',
      answer:
        'Prefiero QA embebidos en los equipos de producto porque están cerca del contexto y participan desde el inicio. Pero sumo una capa transversal (chapter o guild) que define estándares, herramientas, estrategia común y crecimiento de carrera, para evitar que cada equipo reinvente todo o que los QAs queden aislados. El equilibrio depende del tamaño y la madurez de la organización.',
    },
    {
      topic: 'bugs',
      question: '¿Cómo hacés un análisis de causa raíz de los defectos que escapan a producción?',
      answer:
        'Por cada defecto escapado relevante pregunto por qué ocurrió y por qué no se detectó antes, con técnicas como los 5 porqués, sin buscar culpables. Clasifico los resultados (requisito ambiguo, caso no cubierto, diferencia de entornos, falta de monitoreo) y busco patrones para atacar las causas sistémicas con acciones concretas: un test, un gate, un cambio de proceso.',
    },
    {
      topic: 'estrategia',
      question:
        '¿Cómo incorporás testing no funcional (performance, seguridad) en la estrategia sin un equipo dedicado?',
      answer:
        'Definiendo requisitos no funcionales medibles desde el inicio (latencia p95, carga esperada, estándares como OWASP Top 10) e incluyéndolos en los criterios de aceptación. Integro chequeos livianos en el pipeline (análisis de dependencias, escaneos de seguridad, pruebas de carga básicas) y hago pruebas más profundas antes de hitos críticos, sumando especialistas externos cuando el riesgo lo justifica.',
    },
    {
      topic: 'accesibilidad',
      question:
        '¿Cómo llevarías la accesibilidad de ser una auditoría puntual a una práctica continua?',
      answer:
        'Incorporándola en todo el ciclo: componentes accesibles en el design system, criterios de accesibilidad en la Definition of Done, chequeos automáticos en el pipeline y revisiones manuales con teclado y lector de pantalla en cada feature. Capacitaría a diseño y desarrollo, y sumaría pruebas con usuarios con discapacidad, porque las herramientas automáticas detectan solo una parte de los problemas.',
    },
    {
      topic: 'shift-right',
      question: '¿Qué es shift-right y cómo se complementa con shift-left?',
      answer:
        'Shift-left busca prevenir defectos temprano; shift-right acepta que algunos solo aparecen con uso real y se enfoca en detectarlos y aprender en producción: monitoreo, canary releases, A/B testing, chaos engineering y feedback de usuarios. Una estrategia madura usa ambos: lo que se aprende en producción vuelve a alimentar los requisitos y los casos de prueba.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo justificarías ante la dirección la inversión en calidad?',
      answer:
        'Hablando en términos de negocio: costo de los incidentes (ingresos perdidos, soporte, churn, reputación), tiempo del equipo dedicado a retrabajo y cuánto se reduce el lead time cuando hay confianza para desplegar. Muestro datos actuales, propongo una inversión acotada con objetivos medibles y reporto resultados. La calidad se vende como velocidad sostenible, no como costo.',
    },
    {
      topic: 'estrategia',
      question: '¿Cómo encarás la calidad de un sistema legacy sin tests ni documentación?',
      answer:
        'Primero entiendo el comportamiento actual con testing exploratorio, logs y usuarios clave, y documento los flujos críticos. Antes de tocar código agrego tests de caracterización que capturan cómo funciona hoy, aunque tenga bugs, para detectar regresiones. Priorizo por riesgo y frecuencia de cambio, y voy cubriendo de forma incremental a medida que se modifica cada parte.',
    },
  ],
};
