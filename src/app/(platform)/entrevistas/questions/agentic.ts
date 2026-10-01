import type { InterviewQuestion, Seniority } from './types';

export const agenticQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'fundamentos',
      question: '¿Qué es agentic engineering y en qué se diferencia de usar autocompletado con IA?',
      answer:
        'Es desarrollar software delegando tareas completas a agentes de código que leen el repo, editan archivos, ejecutan comandos y verifican su trabajo en un loop. El autocompletado sugiere líneas mientras vos escribís; con un agente describís el objetivo y revisás el resultado. Tu rol pasa a ser definir bien la tarea, darle contexto y validar lo que produce.',
    },
    {
      topic: 'contexto',
      question: '¿Qué información le darías a un agente de código antes de pedirle una tarea?',
      answer:
        'El objetivo concreto, el porqué, los archivos o módulos relevantes, las restricciones (qué no tocar, librerías a usar), cómo reproducir el problema si es un bug y cómo se verifica que está listo (tests, comandos). Cuanto menos tenga que adivinar, mejor resultado. Pensalo como el brief para un colega que no conoce el proyecto.',
    },
    {
      topic: 'prompting',
      question: '¿Qué diferencia hay entre un buen y un mal pedido a un agente de código?',
      answer:
        'Uno malo es vago: "arreglá el login". Uno bueno dice qué pasa, qué debería pasar, dónde mirar y cómo comprobarlo: "al loguearse con Google se redirige a `/404`; debería ir a `/perfil`; revisá el callback en `auth.ts` y agregá un test que lo cubra". La especificidad reduce idas y vueltas y cambios fuera de alcance.',
    },
    {
      topic: 'revisión',
      question: '¿Cómo revisás el código que genera un agente antes de commitearlo?',
      answer:
        'Como si lo hubiera escrito un compañero: leer el diff completo, entender cada cambio, correr los tests y el linter, probar el feature en la app y desconfiar de cambios fuera del alcance pedido. La responsabilidad del código sigue siendo tuya, no del agente.',
    },
    {
      topic: 'verificación',
      question: '¿Por qué es importante que el agente pueda verificar su propio trabajo?',
      answer:
        'Porque sin un mecanismo de verificación el agente solo puede suponer que el código funciona. Si puede correr tests, el typecheck, el linter o ver la app, detecta y corrige sus errores en el loop antes de devolverte el resultado. Es la práctica que más mejora la calidad de lo que entrega.',
    },
    {
      topic: 'git',
      question: '¿Por qué conviene hacer commits chicos y frecuentes cuando trabajás con agentes?',
      answer:
        'Porque cada commit es un punto de control: si el agente toma un mal camino podés volver atrás con `git reset` o `git restore` sin perder el trabajo bueno. Además, diffs chicos son más fáciles de revisar y entender. Empezar cada tarea con el working tree limpio ayuda a ver exactamente qué cambió el agente.',
    },
    {
      topic: 'instrucciones',
      question: '¿Para qué sirve un archivo como `CLAUDE.md` o `AGENTS.md` en el repo?',
      answer:
        'Es un archivo de instrucciones que el agente lee al empezar: cómo correr el proyecto, comandos de test y lint, convenciones de código, arquitectura y cosas a evitar. Evita repetir el mismo contexto en cada pedido y hace que el agente siga las reglas del equipo. Se versiona con el código como cualquier otro archivo.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué datos no deberías pegar en un prompt ni dejar al alcance de un agente?',
      answer:
        'Secretos (API keys, contraseñas, tokens), datos personales de usuarios y datos de producción, y código o información que tu empresa no permite compartir con servicios externos. Los secretos van en variables de entorno o un gestor de secretos, nunca en el código ni en el chat. Revisá también la política de la empresa sobre qué herramientas están aprobadas.',
    },
    {
      topic: 'permisos',
      question: '¿Por qué un agente de código te pide permiso antes de ejecutar ciertos comandos?',
      answer:
        'Porque ejecutar comandos tiene efectos reales: puede borrar archivos, instalar dependencias, hacer push o tocar servicios externos. Los permisos te dejan aprobar acciones riesgosas y habilitar automáticamente solo las seguras (leer archivos, correr tests). Antes de aprobar, leé qué va a ejecutar.',
    },
    {
      topic: 'alucinaciones',
      question: '¿Qué hacés si el agente usa una función o API que no existe?',
      answer:
        'Es una alucinación: el modelo generó algo plausible pero falso. Se lo marcás con el error concreto (por ejemplo, el mensaje del compilador) y le das la fuente correcta: la documentación, la versión de la librería o un ejemplo de uso real del repo. Tener typecheck y tests en el loop hace que lo detecte solo.',
    },
    {
      topic: 'aprendizaje',
      question: '¿Cómo usás un agente para aprender sobre un código que no conocés?',
      answer:
        'Pidiéndole que explore y explique antes de cambiar nada: cómo está organizado el proyecto, por dónde pasa un flujo, dónde se define algo. Después verificás leyendo los archivos que te señala. Es una forma rápida de hacer onboarding, siempre contrastando con el código real.',
    },
    {
      topic: 'delegación',
      question: '¿Cuándo no conviene delegarle una tarea a un agente?',
      answer:
        'Cuando explicarla lleva más que hacerla, cuando no podés verificar el resultado, cuando la decisión requiere contexto de negocio que no está escrito en ningún lado o cuando querés aprender ese tema haciéndolo vos. También en cambios muy sensibles (seguridad, pagos) sin una revisión cuidadosa.',
    },
    {
      topic: 'iteración',
      question: '¿Qué hacés si el agente no entiende lo que le pediste después de varios intentos?',
      answer:
        'Parar y reformular en lugar de insistir con correcciones sobre correcciones. Conviene limpiar el contexto y empezar de nuevo con un pedido más preciso que incluya lo aprendido en los intentos fallidos, o dividir la tarea en pasos más chicos. Un historial lleno de intentos fallidos suele empeorar las respuestas.',
    },
    {
      topic: 'debugging',
      question: '¿Cómo le pedís ayuda a un agente para resolver un bug?',
      answer:
        'Dándole el error completo (stack trace, logs), los pasos para reproducirlo, qué esperabas y qué pasó, y qué ya probaste. Lo ideal es que primero escriba un test que reproduzca el bug, luego lo arregle y confirme que el test pasa. Así sabés que se arregló la causa y no solo el síntoma.',
    },
    {
      topic: 'contexto',
      question: '¿Qué es la ventana de contexto y por qué afecta tu trabajo con un agente?',
      answer:
        'Es la cantidad máxima de texto que el modelo puede considerar a la vez: tus mensajes, los archivos que leyó y la salida de los comandos. En sesiones largas se llena y la calidad baja porque hay mucha información irrelevante. Por eso conviene empezar sesiones nuevas para tareas nuevas.',
    },
    {
      topic: 'testing',
      question: '¿Le pedirías a un agente que escriba los tests de su propio código? ¿Qué cuidás?',
      answer:
        'Sí, pero revisándolos con atención: un agente puede escribir tests que pasan pero no prueban nada, o "arreglar" un test fallido cambiando la aserción en lugar del código. Verificá que los tests cubran los casos importantes y que fallarían si el código estuviera mal.',
    },
    {
      topic: 'revisión',
      question: '¿Qué señales en un diff de un agente te harían desconfiar?',
      answer:
        'Archivos modificados que no tienen que ver con la tarea, tests borrados o salteados, aserciones relajadas, `any` o `@ts-ignore` agregados para que compile, manejo de errores que silencia todo, dependencias nuevas sin justificar y código duplicado en lugar de reutilizar lo existente.',
    },
    {
      topic: 'convenciones',
      question: '¿Cómo lográs que el código del agente se parezca al del resto del proyecto?',
      answer:
        'Señalándole archivos de ejemplo que siga como referencia, documentando las convenciones en el archivo de instrucciones del repo y teniendo linter y formateador configurados para que los corra. Si algo se repite, conviene escribirlo como regla en lugar de corregirlo cada vez.',
    },
    {
      topic: 'responsabilidad',
      question: '¿Quién es responsable si el código generado por un agente rompe producción?',
      answer:
        'Quien lo revisó, aprobó y mergeó. El agente es una herramienta: la autoría y la responsabilidad del código siguen siendo de las personas del equipo. Por eso nunca se mergea algo que no entendés.',
    },
    {
      topic: 'aprendizaje',
      question: '¿Cómo evitás dejar de aprender si un agente escribe gran parte de tu código?',
      answer:
        'Entendiendo cada cambio antes de aceptarlo, pidiéndole que explique sus decisiones, resolviendo a mano algunas tareas a propósito y estudiando los conceptos detrás de lo que genera. El agente acelera, pero la capacidad de juzgar si algo está bien depende de tu conocimiento.',
    },
  ],
  'semi-senior': [
    {
      topic: 'planificación',
      question: '¿Por qué conviene que el agente planifique antes de escribir código?',
      answer:
        'Porque separar exploración, plan e implementación evita que salte directo a una solución equivocada. Primero lee el código relevante, después propone un plan que vos revisás y corregís, y recién ahí implementa. Corregir un plan es mucho más barato que corregir cientos de líneas ya escritas.',
    },
    {
      topic: 'especificación',
      question: '¿Cómo escribirías la especificación de una feature para delegarla a un agente?',
      answer:
        'Con el objetivo y el contexto de negocio, el comportamiento esperado en casos normales y bordes, criterios de aceptación verificables, restricciones técnicas (archivos, patrones, librerías) y lo que queda fuera de alcance. Una spec escrita sirve también como documentación y para que otro agente o persona retome la tarea.',
    },
    {
      topic: 'testing',
      question: '¿Cómo aplicás TDD trabajando con un agente?',
      answer:
        'Le pedís que escriba primero los tests a partir de los casos esperados, confirmás que fallan, los revisás y commiteás. Después le pedís que implemente hasta que pasen, sin modificar los tests. Los tests funcionan como un objetivo claro y verificable que el agente puede iterar solo.',
    },
    {
      topic: 'verificación',
      question: '¿Cómo armás un buen loop de verificación para un agente en un proyecto frontend?',
      answer:
        'Dándole comandos rápidos para typecheck, lint y tests unitarios, y la posibilidad de levantar la app y verla: screenshots o un navegador controlado para comparar con el diseño o probar el flujo. Así puede validar tanto que compila como que la UI se ve y se comporta como se pidió.',
    },
    {
      topic: 'contexto',
      question: '¿Cómo manejás el contexto en sesiones largas con un agente?',
      answer:
        'Limpiando el contexto entre tareas no relacionadas, compactando o resumiendo cuando se llena, guardando el progreso y las decisiones en un archivo (plan, TODOs) que el agente pueda releer y delegando exploraciones grandes en subagentes que devuelven solo un resumen. Menos ruido en el contexto da mejores resultados.',
    },
    {
      topic: 'subagentes',
      question: '¿Para qué sirven los subagentes en un flujo de desarrollo?',
      answer:
        'Para delegar tareas acotadas con su propio contexto, como buscar en todo el repo, investigar una librería o revisar un diff. El subagente hace el trabajo pesado y devuelve solo la conclusión, así el contexto principal queda limpio. También permiten correr investigaciones en paralelo.',
    },
    {
      topic: 'paralelismo',
      question: '¿Cómo trabajarías con varios agentes en paralelo sobre el mismo repo?',
      answer:
        'Dándole a cada uno su propia copia de trabajo, por ejemplo con `git worktree`, en ramas separadas para que no se pisen los archivos. Cada agente necesita su entorno aislado (puertos, base de datos). Conviene paralelizar tareas independientes y después revisar e integrar cada rama por separado.',
    },
    {
      topic: 'mcp',
      question: '¿Qué es MCP y cómo lo usarías en tu flujo de desarrollo?',
      answer:
        'Model Context Protocol es un protocolo abierto para conectar agentes con herramientas y datos externos. Con servidores MCP el agente puede, por ejemplo, leer issues, consultar la base de datos de desarrollo, ver diseños o manejar un navegador. Conviene instalar solo los que necesitás, revisar qué permisos tienen y preferir fuentes confiables.',
    },
    {
      topic: 'automatización',
      question: '¿Qué son los comandos personalizados, skills o hooks en un agente de código?',
      answer:
        'Son formas de empaquetar flujos repetidos: comandos o skills guardan instrucciones reutilizables (por ejemplo, "crear un componente siguiendo nuestras convenciones") y los hooks ejecutan scripts automáticamente ante eventos, como formatear después de editar o bloquear comandos peligrosos. Convierten conocimiento del equipo en comportamiento consistente.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué es prompt injection en el contexto de un agente de código?',
      answer:
        'Es cuando contenido que el agente lee (un README, un issue, un comentario, una página web, la salida de un comando) contiene instrucciones que intentan que haga algo no pedido, como exfiltrar secretos o ejecutar comandos. Se mitiga tratando ese contenido como datos, limitando permisos y acceso a red y revisando las acciones sensibles.',
    },
    {
      topic: 'permisos',
      question: '¿Cómo configurarías los permisos de un agente para trabajar rápido pero seguro?',
      answer:
        'Permitir automáticamente acciones de solo lectura y comandos seguros y frecuentes (tests, lint, build), pedir confirmación para lo que modifica cosas fuera del repo o es irreversible (push, deploys, borrar) y bloquear lo peligroso. Para máxima autonomía, correr el agente dentro de un contenedor o sandbox sin acceso a credenciales reales.',
    },
    {
      topic: 'refactor',
      question: '¿Cómo encararías un refactor grande con un agente?',
      answer:
        'Asegurando primero buena cobertura de tests sobre el comportamiento actual, pidiendo un plan dividido en pasos chicos que dejen el sistema funcionando en cada uno, y commiteando después de cada paso verificado. Si el cambio es mecánico y repetido, conviene que el agente escriba un script o codemod en lugar de editar archivo por archivo.',
    },
    {
      topic: 'legacy',
      question: '¿Cómo usás un agente en un código legacy sin tests ni documentación?',
      answer:
        'Primero para entender: que explore y documente cómo funcionan los flujos críticos. Después para escribir tests de caracterización que fijen el comportamiento actual, aunque tenga bugs. Recién con esa red de seguridad conviene pedirle cambios, siempre en pasos chicos.',
    },
    {
      topic: 'revisión',
      question: '¿Cómo usarías un agente para revisar código, incluido el de otro agente?',
      answer:
        'Pidiéndole una revisión con criterios concretos (bugs, seguridad, convenciones, casos no cubiertos) en una sesión con contexto limpio, sin el sesgo de quien escribió el código. Sirve como primer filtro, pero no reemplaza la revisión humana: hay que verificar sus hallazgos y descartar falsos positivos.',
    },
    {
      topic: 'debugging',
      question: '¿Cómo debuggeás con un agente un bug intermitente o difícil de reproducir?',
      answer:
        'Pidiéndole que forme hipótesis a partir de logs y código, que agregue instrumentación (logs, métricas) para confirmarlas o descartarlas y que intente reproducirlo con un test o un script. Evitá que aplique arreglos especulativos sin evidencia de la causa; cada cambio debería estar respaldado por lo que se observó.',
    },
    {
      topic: 'instrucciones',
      question: '¿Qué ponés y qué no ponés en el archivo de instrucciones para agentes del repo?',
      answer:
        'Sí: comandos de build, test y lint, convenciones que no son obvias, decisiones de arquitectura, errores comunes y cómo verificar cambios. No: información que el agente puede deducir leyendo el código, detalles muy específicos de una sola tarea ni textos largos que gastan contexto. Hay que mantenerlo corto, actualizado y revisarlo como cualquier código.',
    },
    {
      topic: 'costos',
      question: '¿Cómo controlás el costo de usar agentes de código en tu día a día?',
      answer:
        'Usando modelos más chicos para tareas simples, limpiando el contexto entre tareas, evitando que el agente lea archivos enormes o salidas de comandos muy largas sin necesidad, dando instrucciones precisas para reducir iteraciones y revisando el consumo periódicamente. El costo crece con los tokens de cada paso del loop.',
    },
    {
      topic: 'dependencias',
      question: '¿Qué cuidás cuando un agente agrega una dependencia nueva?',
      answer:
        'Que sea realmente necesaria, que el nombre sea el correcto (los modelos pueden inventar paquetes y existen paquetes maliciosos con nombres parecidos), que esté mantenida, su licencia, su tamaño y sus vulnerabilidades conocidas. Revisar siempre los cambios en el lockfile.',
    },
    {
      topic: 'documentación',
      question:
        '¿Cómo le das al agente información sobre una librería que salió después de su entrenamiento?',
      answer:
        'Pasándole la documentación actual: enlaces que pueda leer, archivos de docs en el repo, un servidor MCP de documentación o ejemplos de uso. Conviene indicarle la versión exacta que usa el proyecto. Sin eso, va a usar la API que conoce de su entrenamiento, que puede estar desactualizada.',
    },
    {
      topic: 'pull requests',
      question: '¿Cómo debería verse un PR hecho con ayuda de un agente?',
      answer:
        'Igual que cualquier PR bueno: acotado a un objetivo, con una descripción que explique el qué y el porqué, cómo se probó y screenshots si cambia la UI. Algunos equipos piden indicar que se usó un agente. Quien abre el PR tiene que poder defender cada línea en la revisión.',
    },
  ],
  senior: [
    {
      topic: 'adopción',
      question: '¿Cómo introducirías agentes de código en un equipo de desarrollo?',
      answer:
        'Empezando por casos de uso concretos y de bajo riesgo (tests, bugs acotados, documentación), definiendo guías de uso y de seguridad, preparando el repo con archivos de instrucciones y buenos comandos de verificación, y compartiendo prácticas que funcionan. Mantener la revisión humana obligatoria y medir el impacto en lugar de imponerlo por moda.',
    },
    {
      topic: 'productividad',
      question: '¿Cómo medirías el impacto real de los agentes en la productividad del equipo?',
      answer:
        'Con métricas de entrega y calidad antes y después: lead time, frecuencia de deploy, tasa de cambios que fallan, bugs en producción y tiempo de revisión, complementadas con encuestas al equipo. Medir solo líneas generadas o PRs abiertos es engañoso: más código no es más valor, y el costo puede trasladarse a la revisión o al mantenimiento.',
    },
    {
      topic: 'calidad',
      question: '¿Cómo mantenés la calidad del código cuando gran parte lo escriben agentes?',
      answer:
        'Reforzando las barreras automáticas (tipos estrictos, linters, tests, CI obligatoria), manteniendo estándares de revisión, vigilando la duplicación y la deuda técnica, y documentando la arquitectura para que los agentes la sigan. El cuello de botella pasa a ser la revisión, así que conviene invertir en hacerla más fácil: PRs chicos y bien descriptos.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo preparás un codebase para que los agentes trabajen bien en él?',
      answer:
        'Con módulos claros y bien nombrados, tipos estrictos, tests rápidos y confiables, comandos simples para levantar y verificar todo, documentación de decisiones y un archivo de instrucciones para agentes. Lo que hace un repo fácil para un desarrollador nuevo es lo mismo que lo hace fácil para un agente: feedback rápido y convenciones explícitas.',
    },
    {
      topic: 'ci',
      question: '¿Cómo usarías agentes en modo headless dentro de CI/CD?',
      answer:
        'Para tareas automáticas como revisar PRs, clasificar issues, arreglar errores de lint o tests rotos, actualizar dependencias o generar changelogs. Corriendo sin interacción, necesitan permisos mínimos, credenciales con alcance limitado, entornos aislados, límites de tiempo y costo, y que sus cambios pasen por la misma revisión y CI que cualquier otro.',
    },
    {
      topic: 'seguridad',
      question:
        '¿Qué riesgos de seguridad trae darle a un agente acceso a tu máquina o a tu infraestructura?',
      answer:
        'Ejecución de comandos destructivos, filtración de secretos del entorno, prompt injection desde contenido externo que lleve a exfiltrar datos, instalación de paquetes maliciosos y acciones sobre sistemas reales con tus credenciales. Se mitiga con sandboxes o contenedores, mínimo privilegio, credenciales de desarrollo separadas de producción, restricción de red y aprobación humana para acciones irreversibles.',
    },
    {
      topic: 'seguridad',
      question:
        '¿Por qué es peligroso combinar acceso a datos privados, contenido no confiable y salida a internet en un agente?',
      answer:
        'Porque esa combinación permite que una instrucción escondida en contenido no confiable (un issue, una web) haga que el agente lea datos privados o secretos y los envíe afuera. Si no podés eliminar el riesgo de prompt injection, tenés que cortar al menos una de las tres patas: sin secretos accesibles, sin contenido externo o sin capacidad de exfiltrar.',
    },
    {
      topic: 'orquestación',
      question: '¿Cómo orquestarías varios agentes para una feature grande?',
      answer:
        'Dividiendo la feature en partes independientes con interfaces definidas de antemano, asignando cada parte a un agente en su propia rama o worktree, con criterios de aceptación y verificación propios. Un agente o una persona coordina, integra y revisa. Si las partes están muy acopladas, paralelizar genera más conflictos que velocidad.',
    },
    {
      topic: 'tareas largas',
      question:
        '¿Cómo estructurás una tarea de varias horas para que un agente la complete de forma autónoma?',
      answer:
        'Con una spec clara, una forma objetiva de saber cuándo terminó (tests que deben pasar), un archivo de progreso donde registre qué hizo y qué falta, commits frecuentes como checkpoints y la posibilidad de retomar desde ese estado si se reinicia el contexto. También límites de costo y tiempo, y revisión al final.',
    },
    {
      topic: 'migraciones',
      question:
        '¿Cómo planificarías una migración grande, como cambiar de framework, usando agentes?',
      answer:
        'Definiendo primero el patrón de migración en unos pocos casos hechos y revisados con cuidado, que sirvan como ejemplo. Después se reparte el resto en lotes chicos que los agentes migran en paralelo siguiendo ese ejemplo, cada uno verificado con tests y CI. Se mantiene la app funcionando durante toda la migración y se mide el avance.',
    },
    {
      topic: 'delegación',
      question: '¿Qué tipo de trabajo seguís haciendo vos y cuál delegás a agentes?',
      answer:
        'Delego trabajo bien definido y verificable: implementaciones con especificación clara, tests, refactors mecánicos, investigación del código. Me quedo con definir el problema, las decisiones de arquitectura y producto, los trade-offs, la revisión final y las partes críticas donde un error es caro. El criterio es cuánto cuesta verificar contra cuánto cuesta hacerlo.',
    },
    {
      topic: 'equipo',
      question: '¿Cómo acompañás a desarrolladores junior en un equipo que usa agentes?',
      answer:
        'Pidiendo que entiendan y puedan explicar todo lo que proponen, revisando su forma de usar el agente además del código, dándoles tareas donde aprendan los fundamentos sin delegar todo y usando el agente como tutor que explica en lugar de como generador. El riesgo es que entreguen rápido sin construir criterio propio.',
    },
    {
      topic: 'guías',
      question: '¿Qué incluirías en las guías de uso de agentes de un equipo?',
      answer:
        'Herramientas aprobadas y qué datos se pueden compartir, configuración de permisos recomendada, responsabilidad sobre el código generado, estándares de revisión y de PRs, buenas prácticas de prompting y verificación, manejo de secretos y cómo reportar problemas. Conviene que sean cortas, prácticas y que evolucionen con el uso.',
    },
    {
      topic: 'conocimiento',
      question: '¿Cómo capturás el conocimiento del equipo para que los agentes lo usen?',
      answer:
        'Escribiendo convenciones y decisiones en archivos de instrucciones del repo, documentando arquitectura y ADRs, empaquetando flujos repetidos como comandos o skills compartidos y convirtiendo correcciones frecuentes en reglas de lint o hooks. Lo que solo vive en la cabeza de alguien, el agente no lo puede usar.',
    },
    {
      topic: 'costos',
      question: '¿Cómo gestionarías el presupuesto de agentes de código para todo un equipo?',
      answer:
        'Midiendo el consumo por persona y por tipo de tarea, estableciendo límites para tareas automáticas, eligiendo modelos según la dificultad y comparando el costo con el tiempo ahorrado. Una tarea que el agente intenta muchas veces sin éxito suele indicar que falta contexto o verificación, no más presupuesto.',
    },
    {
      topic: 'evaluación',
      question: '¿Cómo compararías dos agentes o herramientas de código para elegir cuál adoptar?',
      answer:
        'Con tareas reales del propio codebase y una forma objetiva de verificarlas (tests), corriendo cada una varias veces porque los resultados varían. Comparar tasa de éxito, calidad del código según la revisión, tiempo, costo, integración con el flujo del equipo y garantías de seguridad y privacidad. Los benchmarks públicos orientan pero no reemplazan probar en tu contexto.',
    },
    {
      topic: 'riesgos',
      question: '¿Qué riesgos a largo plazo ves en un equipo que depende mucho de agentes?',
      answer:
        'Pérdida de comprensión del sistema, deuda técnica acumulada por código que nadie entiende del todo, revisiones superficiales por volumen, dependencia de un proveedor y atrofia de habilidades. Se mitiga manteniendo ownership claro de cada área, revisiones serias, documentación viva y tiempo dedicado a entender el sistema.',
    },
    {
      topic: 'revisión',
      question:
        '¿Cómo escalás la revisión de código cuando los agentes producen mucho más volumen?',
      answer:
        'Exigiendo PRs chicos con buena descripción y evidencia de verificación, automatizando todo lo chequeable (tipos, lint, tests, análisis de seguridad), usando revisión asistida por agentes como primer filtro y concentrando la atención humana en diseño, lógica de negocio y riesgos. Si la revisión no da abasto, hay que generar menos, no revisar peor.',
    },
    {
      topic: 'incidentes',
      question: '¿Cómo usarías agentes durante un incidente en producción?',
      answer:
        'Para acelerar el análisis: buscar en logs y código, correlacionar cambios recientes, proponer hipótesis y redactar el postmortem. Con acceso de solo lectura a producción y con una persona tomando las decisiones y aplicando los cambios. La urgencia no justifica que un agente ejecute acciones irreversibles sobre sistemas reales sin supervisión.',
    },
    {
      topic: 'ownership',
      question:
        '¿Cómo definís el ownership del código en un equipo donde los agentes escriben gran parte?',
      answer:
        'El ownership es de personas y equipos, no de herramientas: cada área tiene responsables que entienden su diseño y aprueban sus cambios. Quien abre un PR responde por él como si lo hubiera escrito, y los code owners mantienen la coherencia del sistema. Los agentes cambian quién teclea, no quién decide ni quién responde.',
    },
  ],
};
