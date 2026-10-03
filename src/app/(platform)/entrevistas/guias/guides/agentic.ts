import type { InterviewGuide } from './types';

export const agenticGuide: InterviewGuide = {
  track: 'agentic',
  summary:
    'Preparate para demostrar que sabés desarrollar software con agentes de código: contexto, delegación, verificación, revisión, seguridad y adopción en equipo.',
  sections: [
    {
      id: 'la-entrevista',
      title: 'Cómo es la entrevista',
      body: [
        'Las entrevistas de agentic engineering evalúan cómo trabajás con agentes de código, no si sabés usar una herramienta en particular. Suelen tener preguntas conceptuales, una conversación sobre tu flujo de trabajo real y, cada vez más seguido, una sesión de pairing donde resolvés una tarea con un agente mientras el entrevistador mira cómo lo dirigís, verificás y revisás.',
        'En junior se espera que sepas darle buen contexto a un agente, pedir tareas concretas, leer y entender todo lo que genera antes de commitear, detectar alucinaciones como una API que no existe y no pegar secretos en ningún lado. También que sigas aprendiendo: te van a preguntar cómo evitás depender del agente para entender tu propio código.',
        'En semi-senior el foco está en el método: especificar antes de delegar, hacer que el agente planifique, armar loops de verificación con tests y linters, usar subagentes y sesiones paralelas, manejar el contexto en sesiones largas y configurar permisos para ir rápido sin riesgos.',
        'En senior evalúan el impacto en el equipo y la organización: cómo preparar un codebase para agentes, guías de uso, revisión de código a escala, presupuesto, métricas de productividad que no mientan, agentes headless en CI, riesgos a largo plazo y cómo acompañar a juniors. La pregunta de fondo es si podés hacer que un equipo entregue más sin bajar la calidad.',
      ],
      checklist: [
        'Describir tu flujo de trabajo real con agentes de punta a punta',
        'Nombrar las herramientas que usaste y qué te gusta y no de cada una',
        'Explicar qué evalúan en cada seniority',
        'Tener un ejemplo de una tarea donde el agente te ahorró tiempo y otra donde no',
        'Saber qué política de uso de IA tiene la empresa, si es pública',
      ],
    },
    {
      id: 'fundamentos',
      title: 'Fundamentos y ventana de contexto',
      body: [
        'Agentic engineering es desarrollar software delegando tareas completas a agentes que leen el código, editan archivos, ejecutan comandos y verifican su trabajo en un loop, mientras vos definís el objetivo, ponés los límites y revisás el resultado. Se diferencia del autocompletado en la unidad de trabajo: no sugiere la próxima línea, resuelve una tarea de varios pasos. Tu rol se mueve hacia especificar, verificar y decidir.',
        'La ventana de contexto es la memoria de trabajo del agente: instrucciones, archivos leídos, salidas de comandos y la conversación. Todo lo que no está ahí no existe para el modelo, y cuando se llena, la calidad baja aunque técnicamente entre. Por eso conviene una tarea por sesión, limpiar el contexto al cambiar de tema y no hacer que el agente lea logs o archivos enormes sin filtrar.',
        'En sesiones largas los agentes compactan: resumen el historial para seguir trabajando, y en ese resumen se pierden detalles. Las defensas son dejar el estado importante fuera del chat (un plan en un archivo, una lista de pendientes, commits frecuentes), arrancar sesiones nuevas con un resumen explícito y delegar exploraciones a subagentes que devuelven solo la conclusión.',
        'Un error común en la entrevista es hablar del agente como una caja mágica o, al revés, despreciarlo. Lo que buscan es un modelo mental realista: el agente es rápido y amplio, pero no sabe lo que no le dijiste, puede inventar con confianza y optimiza para terminar la tarea, no para que el código sea mantenible, salvo que se lo pidas y lo verifiques.',
      ],
      checklist: [
        'Explicar la diferencia entre agentic engineering y autocompletado',
        'Explicar qué ocupa la ventana de contexto y por qué degrada la calidad',
        'Describir qué hacés cuando una sesión se vuelve larga',
        'Explicar qué es la compactación y qué se pierde',
        'Describir el loop de un agente de código: leer, actuar, verificar',
      ],
    },
    {
      id: 'instrucciones',
      title: 'Instrucciones y preparación del repo',
      body: [
        'Un archivo de instrucciones como `CLAUDE.md` o `AGENTS.md` es lo primero que el agente lee: cómo correr el proyecto, comandos de test, lint y build, convenciones, arquitectura a grandes rasgos y cosas a evitar. Tiene que ser corto, concreto y estar versionado. No va ahí lo que el agente puede descubrir leyendo el código, ni documentación extensa, ni secretos; cada línea consume contexto en todas las sesiones.',
        'Para que el código generado se parezca al del proyecto, lo más efectivo es señalar un archivo de referencia ("seguí el patrón de `users.service.ts`") y tener reglas que se verifiquen solas: linters, formatters, tipos estrictos y tests. Lo que un linter puede imponer no debería depender de que el agente lea una instrucción.',
        'Un codebase preparado para agentes es, casi siempre, un codebase bueno para personas: comandos simples y documentados para correr todo, tests rápidos y confiables, tipos, módulos con límites claros, nombres descriptivos y un entorno local reproducible. Si un humano nuevo tarda una semana en poder correr los tests, el agente también va a sufrir.',
        'Las herramientas modernas suman mecanismos para capturar conocimiento: comandos personalizados para flujos repetidos, skills que cargan instrucciones específicas solo cuando hacen falta, hooks que ejecutan algo determinístico ante un evento (formatear al editar, bloquear un comando) y servidores MCP para conectar el agente a herramientas externas como el tracker de issues o la base de datos de desarrollo. Sabé cuándo usar cada uno: instrucción para lo que es criterio, hook para lo que tiene que pasar siempre.',
      ],
      checklist: [
        'Escribir un archivo de instrucciones corto para un repo que conozcas',
        'Explicar qué no va en ese archivo y por qué',
        'Lograr que el agente siga las convenciones del proyecto',
        'Listar qué hace que un codebase sea fácil de trabajar para agentes',
        'Diferenciar comandos, skills, hooks y servidores MCP',
        'Explicar qué es MCP y un caso concreto de uso en desarrollo',
      ],
    },
    {
      id: 'delegacion',
      title: 'Especificar, planificar y delegar',
      body: [
        'Un buen pedido a un agente tiene objetivo, contexto (archivos relevantes, por qué se hace el cambio), restricciones (qué no tocar, qué librerías usar) y cómo se verifica que está terminado. "Arreglá el login" es un mal pedido; "el login falla con emails en mayúsculas, el test que lo reproduce es este, la normalización debería hacerse en `auth.ts` y no quiero cambios en el schema" es uno bueno. Cuanto más ambigua la tarea, más tiempo perdés revisando.',
        'Para tareas medianas o grandes, pedile primero un plan y revisalo antes de que escriba código. Es mucho más barato corregir un enfoque equivocado en un plan de diez líneas que en un diff de quinientas. Para features completas, escribí una especificación con comportamiento esperado, casos borde, criterios de aceptación y fuera de alcance; también podés pedirle al agente que te entreviste para completarla.',
        'No todo conviene delegarlo: decisiones de arquitectura con mucho contexto implícito, cambios donde no podés verificar el resultado, código crítico que no entendés, o tareas donde explicar tardaría más que hacer. Lo que mejor rinde es lo bien definido y verificable: tests, migraciones mecánicas, refactors con buena cobertura, boilerplate, scripts y exploración de un código desconocido.',
        'Si después de dos o tres intentos el agente no entiende, no sigas corrigiendo en el mismo hilo: el contexto ya está contaminado con intentos fallidos. Limpiá, reformulá el pedido con lo que aprendiste, achicá la tarea o hacé vos la parte difícil. Saber cuándo cortar es una señal de seniority.',
      ],
      checklist: [
        'Reescribir un pedido vago como uno con objetivo, contexto, restricciones y verificación',
        'Explicar por qué conviene que el agente planifique antes de codear',
        'Escribir una especificación de feature lista para delegar',
        'Dar ejemplos de tareas que delegás y que no delegás',
        'Explicar qué hacés cuando el agente no entiende después de varios intentos',
        'Usar un agente para entender un código o legacy que no conocés',
      ],
    },
    {
      id: 'verificacion',
      title: 'Verificación y revisión',
      body: [
        'La palanca más grande para que un agente trabaje bien es que pueda verificar su propio trabajo: correr tests, type checker, linter y build, y en frontend ver la pantalla con una herramienta de browser o screenshots. Sin verificación, el agente declara éxito sobre código que no compila. Con TDD funciona muy bien: pedís primero los tests, confirmás que fallan, los commiteás y después pedís la implementación sin tocarlos.',
        'Si el agente escribe los tests de su propio código, cuidá que no prueben la implementación en vez del comportamiento, que no mockeen todo y que no ajusten las aserciones para que pasen. Leer los tests es tan importante como leer el código. Ante una función o API inventada, verificá contra la documentación o el código fuente de la versión que usás y dale esa fuente al agente.',
        'Revisás el código de un agente como el de un colega con mucha confianza y poca historia en el proyecto: leés todo el diff, entendés cada cambio y lo corrés. Las señales de alerta son cambios fuera del alcance pedido, tests modificados o borrados, `try/catch` que tragan errores, tipos relajados a `any`, código duplicado en vez de reutilizado, dependencias nuevas sin justificación y comentarios que explican lo obvio. Las dependencias nuevas merecen revisar que existan, que sean mantenidas y que el nombre no sea un typo malicioso.',
        'Un PR hecho con un agente tiene que ser chico, enfocado, con descripción clara de qué cambia y por qué, y con evidencia de que funciona. Quien lo abre es responsable del código, sin importar quién lo escribió: "lo hizo el agente" no es una respuesta aceptable en una entrevista ni en un postmortem. Usar otro agente como primer revisor ayuda, pero no reemplaza la revisión humana.',
      ],
      checklist: [
        'Armar un loop de verificación para un proyecto backend y uno frontend',
        'Aplicar TDD con un agente paso a paso',
        'Listar señales de alerta en un diff generado por un agente',
        'Verificar una API sospechosa contra la documentación de la versión usada',
        'Revisar una dependencia nueva antes de aceptarla',
        'Explicar quién es responsable del código que genera un agente',
      ],
    },
    {
      id: 'paralelismo',
      title: 'Subagentes, paralelismo, git y CI',
      body: [
        'Los subagentes son agentes que el principal lanza para una subtarea con su propio contexto limpio: explorar el código, investigar un bug, revisar un diff. Devuelven solo la conclusión, así que protegen el contexto principal y permiten especializar (un revisor, un investigador). El costo es que el principal no ve los detalles y que cada subagente consume tokens propios.',
        'Para trabajar con varios agentes en paralelo sobre el mismo repo, aislá cada uno en su propio git worktree o clon, con su rama y, si hace falta, su base de datos y puertos. Repartí tareas independientes para evitar conflictos, y tené en cuenta que el cuello de botella pasa a ser tu capacidad de revisar. Más agentes que lo que podés revisar es deuda, no productividad.',
        'Commits chicos y frecuentes son tu red de seguridad: cada paso verificado queda guardado y podés volver atrás si el agente se desvía. Para refactors grandes y migraciones, dividí en pasos mecánicos verificables, empezá por un módulo piloto, convertí el patrón aprendido en instrucciones y escalá en lotes con tests en cada paso.',
        'Los agentes en modo headless (sin interacción) se usan en CI para revisar PRs, arreglar lint, actualizar dependencias o triagear issues. Ahí los permisos son críticos: tokens con el mínimo alcance, sin acceso a secretos de producción, sin push directo a la rama principal y con un humano que aprueba el resultado. El contenido de un PR o un issue es input no confiable que puede intentar manipular al agente.',
      ],
      checklist: [
        'Explicar para qué sirven los subagentes y su costo',
        'Configurar dos agentes en paralelo con worktrees sin que se pisen',
        'Explicar por qué conviene commitear seguido con agentes',
        'Planificar un refactor grande o una migración en lotes verificables',
        'Diseñar un uso seguro de un agente headless en CI',
      ],
    },
    {
      id: 'seguridad',
      title: 'Seguridad y permisos',
      body: [
        'Un agente de código ejecuta comandos con tus credenciales, así que todo lo que vos podés romper, él también. Por eso piden permiso antes de acciones con efectos: borrar archivos, instalar paquetes, hacer push o llamar servicios externos. Una configuración razonable permite sin preguntar lo seguro y frecuente (leer, correr tests, lint), pide confirmación para lo que modifica fuera del repo y bloquea lo destructivo o lo que toca producción.',
        'Los secretos nunca van en el prompt, en el código ni en archivos que el agente lea: usá variables de entorno, gestores de secretos y reglas que impidan leer `.env`. Tampoco le des acceso a datos de producción o personales; trabajá con datos de prueba. Revisá qué herramientas aprobó la empresa y qué política de retención tiene el proveedor.',
        'Prompt injection en un agente de código es cuando instrucciones maliciosas llegan escondidas en algo que lee: un README de una dependencia, un issue, una página de documentación, la salida de un comando o un servidor MCP. Si el agente tiene acceso a secretos y a la red, puede ser inducido a exfiltrarlos. Las defensas son mínimo privilegio, sandbox (contenedor o entorno aislado, red restringida) para modos autónomos, servidores MCP de confianza y revisar los comandos antes de aprobarlos.',
        'El modo totalmente autónomo, sin pedir permisos, solo tiene sentido dentro de un entorno descartable y aislado, sin credenciales valiosas. En la entrevista suma mostrar que pensás en el peor caso: "si este agente fuera manipulado, ¿qué podría hacer con lo que le di?".',
      ],
      checklist: [
        'Explicar por qué los agentes piden permiso y qué aprobás sin mirar',
        'Configurar permisos para trabajar rápido pero seguro',
        'Listar qué datos no deben llegar nunca a un agente',
        'Explicar prompt injection en un agente de código con un ejemplo',
        'Describir cuándo y cómo correr un agente en modo autónomo',
      ],
    },
    {
      id: 'equipo',
      title: 'Equipo, costos y adopción',
      body: [
        'Introducir agentes en un equipo funciona mejor como un experimento acotado que como un mandato: un grupo piloto, tareas elegidas, guías iniciales y una retro para decidir. Las guías de uso cubren herramientas aprobadas, qué datos se pueden usar, cómo se revisa y quién es responsable, convenciones de PR y archivos de instrucciones compartidos. El conocimiento del equipo se captura en esos archivos, en skills y en comandos versionados.',
        'Medir productividad es difícil: líneas de código o cantidad de PRs no dicen nada. Mirá lead time, tiempo de revisión, tasa de defectos y de reverts, incidentes, y la percepción del equipo, comparando contra una línea de base. Desconfiá de mejoras que solo aparecen en velocidad y no en calidad.',
        'Los costos se controlan eligiendo el modelo según la tarea, manteniendo el contexto chico, evitando sesiones eternas y cortando loops improductivos. A nivel equipo, fijá presupuestos por persona o por proyecto, mirá el gasto por tipo de uso y compará contra el valor que genera. Para elegir entre herramientas, probalas con tareas reales del equipo, no con demos.',
        'Los riesgos de largo plazo son la pérdida de entendimiento del propio sistema, la revisión superficial porque "el agente lo hizo bien la última vez", el código que crece más rápido de lo que se mantiene y juniors que no desarrollan criterio. Se mitigan con revisión rigurosa, pairing, pedirles a los juniors que expliquen cada cambio y reservar tiempo para resolver problemas sin agente.',
      ],
      checklist: [
        'Proponer un plan de adopción de agentes para un equipo',
        'Listar qué incluyen las guías de uso de agentes',
        'Elegir métricas de impacto que no sean engañosas',
        'Gestionar el presupuesto de agentes de un equipo',
        'Comparar dos herramientas de agentes con un criterio claro',
        'Explicar cómo acompañar a juniors y seguir aprendiendo vos',
      ],
    },
    {
      id: 'ejercicios',
      title: 'Ejercicio de pairing con un agente',
      body: [
        'El ejercicio típico es una sesión de 45 a 90 minutos donde resolvés una tarea en un repo real o preparado, usando un agente, compartiendo pantalla. Puede ser agregar una feature chica, arreglar un bug con un test que falla o refactorizar un módulo. Lo que evalúan es el proceso: cómo explorás, qué contexto das, cómo dividís, cómo verificás y si entendés lo que se commitea.',
        'Un buen flujo es: leer el issue y hacer preguntas, pedirle al agente que explore y resuma el código relevante, acordar un plan, implementar en pasos chicos corriendo los tests en cada uno, revisar el diff en voz alta y commitear. Narrá tus decisiones: por qué aceptás un cambio, por qué rechazás otro, por qué cortás un hilo y empezás de nuevo.',
        'Los errores que más penalizan son aceptar diffs sin leerlos, no correr los tests, dejar que el agente cambie archivos fuera del alcance, aprobar comandos sin mirarlos y no poder explicar el código final. También es mala señal pelearse con el agente durante diez minutos en vez de escribir vos las tres líneas que faltan.',
        'Practicá con tus propios proyectos poniéndote un tiempo y grabándote o con alguien mirando. Probá también la variante sin agente: algunas empresas piden una parte sin asistencia para ver tus fundamentos.',
      ],
      checklist: [
        'Resolver una tarea chica con un agente en menos de una hora narrando el proceso',
        'Pedirle al agente un resumen del código antes de cambiar nada',
        'Revisar un diff en voz alta explicando qué aceptás y qué no',
        'Reconocer cuándo conviene escribir el código vos',
        'Mantener los tests corriendo en cada paso',
      ],
    },
    {
      id: 'dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta y hacé preguntas de aclaración antes de pedirle nada al agente: qué se espera, qué restricciones hay, cómo se verifica. Si no sabés algo, decilo y mostrá cómo lo investigarías, incluso usando el agente para explorar. Lo que no podés hacer es presentar como propio algo que no entendés.',
        'Para preguntas de comportamiento usá STAR: situación, tarea, acción y resultado, con números cuando puedas. Prepará historias sobre un bug que introdujo un agente y cómo lo detectaste, una vez que decidiste no delegar, cómo cambiaste el flujo de trabajo de tu equipo y un desacuerdo sobre el uso de IA.',
        'Preguntas para la empresa: qué herramientas de agentes usan y quién las elige, qué política tienen sobre datos y código, cómo revisan el código generado, cómo miden el impacto, qué presupuesto hay por persona y cómo evalúan a los juniors en este contexto.',
        'Checklist final: tené tu agente configurado y probado en la máquina que vas a usar, un archivo de instrucciones de ejemplo, un proyecto propio para mostrar tu flujo, y repasá permisos y atajos de la herramienta para no perder tiempo en vivo.',
      ],
      checklist: [
        'Hacer preguntas de aclaración antes de delegar',
        'Admitir lo que no sabés y mostrar cómo lo averiguarías',
        'Tener tres historias STAR sobre trabajo con agentes',
        'Llevar preguntas sobre política, revisión y presupuesto de agentes',
        'Tener el entorno del agente configurado y probado',
      ],
    },
  ],
};
