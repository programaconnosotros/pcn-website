import type { InterviewQuestion, Seniority } from './types';

export const aiQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'llms',
      question: '¿Qué es un LLM y qué es un token?',
      answer:
        'Un LLM (large language model) es un modelo entrenado sobre grandes volúmenes de texto que genera texto prediciendo el siguiente token según el contexto. Un token es la unidad en la que se parte el texto (fragmentos de palabras, signos, espacios). Los límites de contexto, la latencia y el costo se miden en tokens de entrada y de salida.',
    },
    {
      topic: 'agentes',
      question: '¿Qué diferencia hay entre un chatbot y un agente?',
      answer:
        'Un chatbot responde a cada mensaje con texto. Un agente recibe un objetivo y trabaja en un loop: razona, decide qué herramienta usar (leer archivos, ejecutar comandos, llamar APIs), observa el resultado y repite hasta terminar la tarea o necesitar input humano. La autonomía y el uso de herramientas son lo que lo distinguen.',
    },
    {
      topic: 'contexto',
      question: '¿Qué es la ventana de contexto y por qué importa?',
      answer:
        'Es la cantidad máxima de tokens que el modelo puede considerar a la vez: system prompt, historial, resultados de herramientas y su propia respuesta. Lo que no entra no existe para el modelo. Además, aunque entre, mucho contexto irrelevante degrada la calidad y aumenta costo y latencia, por eso conviene darle solo lo necesario.',
    },
    {
      topic: 'prompting',
      question: '¿Qué hace que un prompt sea bueno?',
      answer:
        'Ser claro y específico: contexto del problema, objetivo, restricciones, formato de salida esperado y criterios de éxito. Ayudan los ejemplos (few-shot), separar instrucciones de datos (por ejemplo con etiquetas XML) y explicar el porqué de las reglas. Tratarlo como un brief para un colega muy capaz que no conoce tu proyecto.',
    },
    {
      topic: 'llms',
      question: '¿Qué es una alucinación y cómo la reducís?',
      answer:
        'Es cuando el modelo genera información plausible pero falsa (APIs que no existen, datos inventados). Se reduce dándole las fuentes en el contexto (RAG, documentación), permitiéndole decir "no sé", pidiéndole citar de dónde sale cada dato y verificando la salida con herramientas: tests, compilador, linters.',
    },
    {
      topic: 'herramientas',
      question: '¿Qué es tool use (function calling)?',
      answer:
        'Es la capacidad del modelo de pedir que se ejecute una función definida por nosotros. Se le pasa un nombre, una descripción y un JSON schema de parámetros; el modelo devuelve una llamada estructurada, nuestro código la ejecuta y le devuelve el resultado para que continúe. El modelo nunca ejecuta nada por sí mismo.',
    },
    {
      topic: 'llms',
      question:
        '¿Qué diferencia hay entre un modelo base y un modelo ajustado para seguir instrucciones?',
      answer:
        'Un modelo base solo fue preentrenado para continuar texto, así que completa lo que le des sin seguir órdenes. Un modelo ajustado (instruction-tuned, con técnicas como RLHF) fue entrenado además para responder pedidos, mantener una conversación y respetar instrucciones. Para construir apps y agentes casi siempre se usan modelos ajustados.',
    },
    {
      topic: 'llms',
      question: '¿Qué es la temperatura de un modelo?',
      answer:
        'Un parámetro de muestreo que controla cuán aleatoria es la elección del siguiente token. Valores bajos dan respuestas más deterministas y repetibles (útil para extracción o código); valores altos dan más variedad (útil para brainstorming). No garantiza determinismo total ni mejora la exactitud.',
    },
    {
      topic: 'llms',
      question: '¿Qué es un system prompt y para qué sirve?',
      answer:
        'Son las instrucciones que se le dan al modelo antes de la conversación para definir su rol, tono, reglas y contexto general. Aplica a todas las respuestas siguientes, así que es el lugar para las restricciones estables. No es una barrera de seguridad infalible: el modelo puede no cumplirlo siempre, por eso las reglas críticas se refuerzan en el código.',
    },
    {
      topic: 'prompting',
      question: '¿Qué es few-shot prompting?',
      answer:
        'Es incluir en el prompt algunos ejemplos de entrada y salida esperada para que el modelo imite el formato y el criterio. Funciona mejor con ejemplos variados y representativos. Si todos los ejemplos se parecen mucho, el modelo tiende a copiarlos demasiado literalmente.',
    },
    {
      topic: 'llms',
      question: '¿Por qué un LLM puede dar respuestas distintas ante el mismo prompt?',
      answer:
        'Porque genera texto muestreando tokens según probabilidades, no eligiendo siempre el más probable. Parámetros como la temperatura afectan esa aleatoriedad. Por eso, al evaluar un sistema con LLMs, conviene probar cada caso varias veces.',
    },
    {
      topic: 'llms',
      question: '¿Qué es el knowledge cutoff de un modelo?',
      answer:
        'Es la fecha hasta la que llegan los datos con los que fue entrenado. El modelo no conoce eventos, versiones de librerías ni APIs posteriores a esa fecha. Para información actualizada hay que dársela en el contexto, por ejemplo con búsqueda web, documentación o RAG.',
    },
    {
      topic: 'rag',
      question: '¿Qué es un embedding?',
      answer:
        'Es un vector de números que representa el significado de un texto, de forma que textos con significado parecido quedan cerca en ese espacio. Se usan para búsqueda semántica, clustering y recomendaciones. La similitud se suele medir con distancia coseno.',
    },
    {
      topic: 'agentes',
      question: '¿Qué es el loop de un agente?',
      answer:
        'Es el ciclo que repite el agente hasta completar la tarea: el modelo decide una acción, se ejecuta la herramienta, el resultado vuelve al contexto y el modelo decide el siguiente paso. Termina cuando el modelo responde sin pedir herramientas o cuando se alcanza un límite de pasos o de presupuesto.',
    },
    {
      topic: 'api',
      question: '¿Qué partes tiene una llamada típica a la API de un LLM?',
      answer:
        'El modelo a usar, un system prompt con las instrucciones generales, la lista de mensajes (roles `user` y `assistant`), las herramientas disponibles y parámetros como el máximo de tokens de salida o la temperatura. La respuesta trae el contenido generado, el motivo de finalización (`stop_reason` o similar) y el uso de tokens. La API no guarda estado: en cada llamada hay que reenviar el historial.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué datos no deberías pegar en un prompt de un servicio externo?',
      answer:
        'Contraseñas, API keys, tokens, datos personales de clientes y código o información confidencial que la política de tu empresa no permita compartir. Hay que revisar los términos del proveedor sobre retención y uso de datos. Ante la duda, anonimizar o usar datos de ejemplo.',
    },
    {
      topic: 'llms',
      question: '¿Qué diferencia hay entre tokens de entrada y tokens de salida?',
      answer:
        'Los de entrada son todo lo que le mandás al modelo (instrucciones, historial, documentos) y los de salida son los que genera. Ambos se cobran, normalmente la salida es más cara por token, y la salida además determina buena parte de la latencia porque se genera token por token.',
    },
    {
      topic: 'prompting',
      question: '¿Por qué conviene pedirle al modelo un formato de salida específico?',
      answer:
        'Porque hace la respuesta predecible y fácil de procesar desde código o de leer por una persona. Se puede pedir JSON, una lista, una tabla o secciones con títulos, idealmente con un ejemplo. Para integraciones conviene usar structured outputs y validar el resultado.',
    },
    {
      topic: 'herramientas',
      question: '¿Qué pasa si una herramienta falla durante la ejecución de un agente?',
      answer:
        'El error se devuelve al modelo como resultado de la herramienta y el modelo puede decidir reintentar, corregir los parámetros o seguir otro camino. Por eso los mensajes de error deben ser claros y accionables. Si la falla es grave, el sistema debe cortar y avisar en lugar de seguir a ciegas.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cuándo no conviene resolver un problema con un LLM?',
      answer:
        'Cuando la lógica es determinista y se resuelve con código común (cálculos, validaciones, reglas fijas), cuando se necesita exactitud total sin poder verificar la salida, o cuando la latencia o el costo por llamada no son aceptables. Un LLM conviene para tareas con lenguaje natural ambiguo, como clasificar, extraer, resumir o razonar sobre texto no estructurado.',
    },
  ],
  'semi-senior': [
    {
      topic: 'rag',
      question: '¿Qué es RAG y cuáles son sus componentes?',
      answer:
        'Retrieval-Augmented Generation: recuperar información relevante y agregarla al contexto antes de generar la respuesta. Componentes: ingesta y chunking de documentos, embeddings e índice (vectorial, léxico o híbrido), retrieval con reranking y el prompt que combina la pregunta con los fragmentos. Permite responder sobre datos privados o actualizados sin reentrenar el modelo.',
    },
    {
      topic: 'contexto',
      question: '¿Qué es context engineering y en qué se diferencia del prompt engineering?',
      answer:
        'Prompt engineering es redactar bien las instrucciones. Context engineering es decidir todo lo que entra en la ventana en cada paso del agente: instrucciones, herramientas disponibles, memoria, documentos recuperados y resultados previos. Incluye recuperar información just-in-time, resumir o compactar historial y delegar en subagentes para mantener el contexto chico y relevante.',
    },
    {
      topic: 'herramientas',
      question: '¿Cómo diseñarías las herramientas de un agente?',
      answer:
        'Pocas y bien definidas, pensadas para el agente y no como un espejo de la API: nombres y descripciones claras, parámetros con schema estricto, respuestas concisas con la información útil (paginadas o truncadas) y errores accionables que expliquen cómo corregir la llamada. Evitar herramientas que se solapen, porque confunden al modelo.',
    },
    {
      topic: 'mcp',
      question: '¿Qué es MCP (Model Context Protocol)?',
      answer:
        'Un protocolo abierto para conectar aplicaciones de IA con herramientas y fuentes de datos externas de forma estándar. Un servidor MCP expone tools, resources y prompts; cualquier cliente compatible (IDEs, asistentes, agentes) puede usarlos sin una integración a medida para cada uno.',
    },
    {
      topic: 'evals',
      question: '¿Cómo evaluarías si un cambio de prompt mejora o empeora un sistema con LLMs?',
      answer:
        'Con un set de evals: casos representativos y bordes con el resultado esperado. Se puntúan con checks deterministas (formato, tests que pasan), con un LLM como juez usando una rúbrica clara o con revisión humana. Se corren antes y después del cambio para comparar, varias veces porque la salida es no determinista, y se suman casos nuevos a partir de fallas reales.',
    },
    {
      topic: 'arquitectura',
      question: '¿Qué es prompt chaining y cuándo lo usarías?',
      answer:
        'Es dividir una tarea en pasos secuenciales, donde la salida de una llamada al LLM es la entrada de la siguiente. Entre pasos se pueden agregar validaciones en código (gates) para cortar o corregir temprano. Conviene cuando la tarea se descompone en subtareas fijas y claras, porque cada llamada es más simple y precisa, a cambio de más latencia.',
    },
    {
      topic: 'salida',
      question: '¿Cómo obtenés salidas estructuradas confiables de un LLM?',
      answer:
        'Usando structured outputs o tool use con un JSON schema para que la respuesta respete el formato, y validando siempre del lado del código (por ejemplo con Zod). Ante un error de validación, reintentar pasándole el error al modelo. Mantener los schemas simples y con descripciones en cada campo.',
    },
    {
      topic: 'costos',
      question: '¿Cómo reducirías el costo y la latencia de una aplicación con LLMs?',
      answer:
        'Elegir el modelo más chico que resuelva bien cada paso, usar prompt caching para prefijos repetidos (system prompt, documentos), recortar el contexto, limitar los tokens de salida, hacer streaming para mejorar la latencia percibida, paralelizar llamadas independientes y usar procesamiento por lotes cuando no hace falta respuesta inmediata.',
    },
    {
      topic: 'rag',
      question: '¿Cómo elegirías el tamaño de los chunks en un sistema RAG?',
      answer:
        'Depende del tipo de documento y de las preguntas: chunks chicos son más precisos pero pierden contexto, chunks grandes traen contexto pero también ruido. Conviene cortar respetando la estructura (secciones, párrafos, funciones), usar algo de solapamiento y medir con evals de retrieval qué configuración recupera mejor.',
    },
    {
      topic: 'rag',
      question: '¿Qué es la búsqueda híbrida y por qué se usa?',
      answer:
        'Es combinar búsqueda léxica (como BM25, por palabras exactas) con búsqueda semántica por embeddings, y fusionar los resultados. La léxica es buena para nombres propios, códigos o términos técnicos exactos; la semántica para sinónimos y paráfrasis. Juntas suelen recuperar mejor que cada una por separado.',
    },
    {
      topic: 'rag',
      question: '¿Qué es un reranker?',
      answer:
        'Es un modelo que reordena los candidatos recuperados evaluando la relevancia de cada uno respecto de la pregunta con más precisión que la búsqueda inicial. Se recuperan muchos candidatos rápido y el reranker elige los mejores para el contexto. Mejora la calidad a cambio de algo más de latencia y costo.',
    },
    {
      topic: 'evals',
      question: '¿Qué es LLM-as-a-judge y qué cuidados requiere?',
      answer:
        'Es usar un modelo para puntuar respuestas de otro según una rúbrica. Escala mejor que la revisión humana, pero tiene sesgos: preferencia por respuestas largas, por la posición en comparaciones o por su propio estilo. Hay que darle criterios concretos, pedirle que justifique y calibrarlo contra evaluaciones humanas.',
    },
    {
      topic: 'prompting',
      question: '¿Para qué sirve pedirle al modelo que razone antes de responder?',
      answer:
        'Darle espacio para pensar paso a paso suele mejorar los resultados en problemas de varios pasos, como lógica, matemática o planificación. Se puede pedir explícitamente o usar modelos con razonamiento extendido. Aumenta tokens y latencia, así que no vale la pena para tareas simples.',
    },
    {
      topic: 'herramientas',
      question: '¿Cómo limitás lo que un agente puede hacer con sus herramientas?',
      answer:
        'Dándole solo las herramientas necesarias para la tarea, con permisos mínimos (por ejemplo solo lectura), validando los parámetros en el código, usando allowlists de comandos o dominios y pidiendo confirmación humana para acciones destructivas. El control tiene que estar en la ejecución, no solo en el prompt.',
    },
    {
      topic: 'contexto',
      question: '¿Qué es la compactación del contexto?',
      answer:
        'Es resumir o recortar el historial de una conversación larga para que siga entrando en la ventana de contexto sin perder lo importante. Se conservan decisiones, estado actual y pendientes, y se descartan resultados de herramientas viejos o detalles irrelevantes. Si se hace mal, el agente olvida información clave.',
    },
    {
      topic: 'guardrails',
      question: '¿Qué son los guardrails en una aplicación con LLMs?',
      answer:
        'Son controles alrededor del modelo que validan la entrada y la salida: detectar contenido fuera de tema o dañino, datos personales, intentos de prompt injection o respuestas que no cumplen el formato. Pueden ser reglas en código, clasificadores o un LLM chico que corre en paralelo. Conviene combinarlos con permisos acotados, porque ninguno es infalible por sí solo.',
    },
    {
      topic: 'llms',
      question: '¿Qué es el streaming de respuestas y por qué importa?',
      answer:
        'Es recibir la respuesta del modelo token por token a medida que se genera, en lugar de esperar a que termine. Reduce mucho la latencia percibida en interfaces de chat. Complica algo el manejo de errores y el parseo de salidas estructuradas, que solo son válidas al final.',
    },
    {
      topic: 'seguridad',
      question: '¿Por qué no deberías confiar ciegamente en la salida de un LLM en tu backend?',
      answer:
        'Porque puede ser incorrecta, tener un formato inválido o estar influenciada por prompt injection. Hay que tratarla como input no confiable: validarla con schemas, escaparla antes de renderizarla, no ejecutarla como código o SQL sin controles y verificar permisos antes de actuar sobre ella.',
    },
    {
      topic: 'costos',
      question: '¿Qué es el prompt caching y cómo lo aprovechás?',
      answer:
        'Es reutilizar el procesamiento de un prefijo de prompt que se repite entre llamadas, lo que baja costo y latencia. Para aprovecharlo, el contenido estable (system prompt, herramientas, documentos) va al principio y lo variable al final. Cualquier cambio en el prefijo invalida la cache desde ese punto.',
    },
    {
      topic: 'agentes',
      question: '¿Cómo evitás que un agente entre en un loop infinito o gaste de más?',
      answer:
        'Con límites de iteraciones, de tokens, de tiempo y de costo por tarea, detectando acciones repetidas sin progreso y cortando con un error claro. También ayuda que las herramientas devuelvan errores accionables para que el agente no repita el mismo intento fallido.',
    },
  ],
  senior: [
    {
      topic: 'arquitectura',
      question: '¿Cuándo usarías un workflow predefinido y cuándo un agente autónomo?',
      answer:
        'Un workflow (prompt chaining, routing, paralelización) sigue pasos definidos en código: es más predecible, barato y fácil de testear, ideal cuando la tarea es conocida. Un agente decide sus propios pasos: sirve para tareas abiertas donde no se puede prever el camino, a cambio de más costo, latencia y riesgo de errores acumulados. Conviene empezar por lo más simple y sumar autonomía solo si mejora los resultados medibles.',
    },
    {
      topic: 'multi-agente',
      question: '¿Qué ventajas y riesgos tiene un sistema multi-agente?',
      answer:
        'Ventajas: paralelizar trabajo independiente, especializar agentes y aislar contexto (cada subagente explora y devuelve solo un resumen al orquestador). Riesgos: más tokens y costo, coordinación difícil, pérdida de información entre agentes, trabajo duplicado y errores que se propagan. Funciona mejor con tareas fácilmente divisibles e instrucciones muy precisas para cada subagente.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué es prompt injection y cómo protegés a un agente?',
      answer:
        'Es cuando contenido no confiable (una web, un issue, un email, la salida de una herramienta) incluye instrucciones que el modelo termina siguiendo. No hay una solución total: se mitiga con mínimo privilegio en las herramientas, sandboxing, separar datos de instrucciones, confirmación humana para acciones irreversibles o externas, allowlists de red y no mezclar en un mismo agente datos privados, contenido no confiable y capacidad de exfiltrar.',
    },
    {
      topic: 'producción',
      question: '¿Cómo llevarías un agente a producción de forma confiable?',
      answer:
        'Evals continuas y regresiones en CI, tracing de cada paso (prompts, tool calls, tokens, latencia), límites de iteraciones y presupuesto, timeouts y reintentos, fallbacks entre modelos, guardrails en entrada y salida, human-in-the-loop en acciones riesgosas, versionado de prompts y modelos, y monitoreo de calidad con muestras revisadas por humanos.',
    },
    {
      topic: 'contexto',
      question: '¿Cómo manejás tareas de larga duración que superan la ventana de contexto?',
      answer:
        'Compactando o resumiendo el historial, guardando estado y notas en archivos externos (progreso, decisiones, TODOs) que el agente relee, usando git como checkpoint, delegando exploraciones en subagentes que devuelven resúmenes y diseñando la tarea para que un agente nuevo pueda retomarla desde ese estado persistido.',
    },
    {
      topic: 'evals',
      question: '¿Cómo evaluarías un agente que resuelve tareas de varios pasos?',
      answer:
        'Evaluando el resultado final en un entorno reproducible (¿el estado quedó como se esperaba?) y también la trayectoria: herramientas usadas, pasos innecesarios, errores recuperados. Correr cada caso varias veces por la variabilidad, medir tasa de éxito, costo y latencia, y revisar transcripts de las fallas. Se complementa con un LLM como juez con rúbrica y revisión humana periódica.',
    },
    {
      topic: 'arquitectura',
      question:
        '¿Cómo diseñarías un agente de atención al cliente que pueda ejecutar acciones reales?',
      answer:
        'Herramientas acotadas a lo necesario (consultar pedido, iniciar reembolso) con autorización verificada en el backend y no confiada al modelo, límites por monto o tipo de acción y confirmación humana o del usuario para lo irreversible. RAG sobre la documentación vigente, derivación a una persona cuando la confianza es baja, guardrails de entrada y salida, y evals con conversaciones reales antes de cada cambio.',
    },
    {
      topic: 'arquitectura',
      question: '¿Qué trade-offs considerás al elegir el modelo para cada parte del sistema?',
      answer:
        'Capacidad de razonamiento, latencia, costo por token, ventana de contexto, soporte de herramientas y multimodalidad, y requisitos de privacidad o despliegue. Se suele usar un modelo grande para planificar o para pasos difíciles y modelos chicos y rápidos para clasificación, extracción o subtareas, validando cada elección con evals y no con intuición.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo decidís entre fine-tuning, RAG y prompting?',
      answer:
        'Primero prompting, porque es lo más barato y rápido de iterar. RAG cuando el problema es de conocimiento: datos privados, cambiantes o demasiado grandes para el contexto. Fine-tuning cuando el problema es de comportamiento o formato consistente a escala, o para usar un modelo más chico y barato, sabiendo que requiere datos de calidad, evals y mantenimiento.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué es la "lethal trifecta" en agentes?',
      answer:
        'Es la combinación de acceso a datos privados, exposición a contenido no confiable y capacidad de comunicarse hacia afuera. Con las tres juntas, un prompt injection puede hacer que el agente exfiltre datos. La defensa más sólida es romper la combinación: quitar alguna de las tres capacidades en ese flujo.',
    },
    {
      topic: 'evals',
      question: '¿Cómo armás un dataset de evals cuando todavía no tenés usuarios?',
      answer:
        'Empezando por casos escritos a mano a partir de los requisitos y de los bordes conocidos, sumando ejemplos generados sintéticamente y revisados por personas, y probando el sistema uno mismo para encontrar fallas. Cuando hay tráfico real, se incorporan casos de producción, sobre todo los que fallaron.',
    },
    {
      topic: 'producción',
      question: '¿Cómo manejás el cambio de versión de un modelo en producción?',
      answer:
        'Fijando versiones explícitas en lugar de alias que cambian solos, corriendo la suite de evals con el modelo nuevo, comparando calidad, costo y latencia, y desplegando de forma gradual (canary o A/B) con posibilidad de volver atrás. Los prompts pueden necesitar ajustes porque cada modelo responde distinto.',
    },
    {
      topic: 'arquitectura',
      question: '¿Qué es el patrón orquestador-trabajadores?',
      answer:
        'Un modelo orquestador descompone la tarea dinámicamente, delega subtareas a trabajadores (otras llamadas o subagentes) y sintetiza los resultados. Sirve cuando no se pueden prever las subtareas de antemano. El orquestador necesita dar instrucciones muy precisas a cada trabajador para evitar trabajo duplicado o fuera de alcance.',
    },
    {
      topic: 'observabilidad',
      question: '¿Qué información registrarías en el tracing de un agente?',
      answer:
        'Cada paso del loop: prompts y versiones, modelo, tool calls con parámetros y resultados, tokens, costo, latencia, errores y la decisión final. Todo correlacionado por un id de sesión. Hay que cuidar no loguear datos sensibles o anonimizarlos, y definir políticas de retención.',
    },
    {
      topic: 'seguridad',
      question: '¿Cómo sandboxearías un agente que ejecuta código?',
      answer:
        'Ejecutándolo en un entorno aislado (contenedor o microVM) sin credenciales de producción, con sistema de archivos limitado, red restringida a una allowlist, límites de CPU, memoria y tiempo, y descartable después de cada tarea. Las acciones que afectan sistemas reales pasan por aprobación humana o por herramientas con permisos acotados.',
    },
    {
      topic: 'costos',
      question: '¿Cómo estimás y controlás el costo de un producto basado en agentes?',
      answer:
        'Midiendo tokens por tarea en distribuciones reales, no promedios optimistas, porque los agentes tienen colas largas. Se controla con presupuestos por tarea y por usuario, modelos más chicos para pasos simples, caching, compactación de contexto, límites de iteraciones y alertas sobre anomalías de consumo.',
    },
    {
      topic: 'evals',
      question:
        '¿Por qué los agentes son más difíciles de evaluar que una llamada simple a un LLM?',
      answer:
        'Porque recorren caminos distintos para llegar al resultado, interactúan con un entorno con estado y los errores se acumulan entre pasos. Hay que evaluar el resultado final en un entorno reproducible, y además la trayectoria: herramientas usadas, pasos innecesarios, costo y si respetó las restricciones.',
    },
    {
      topic: 'datos',
      question: '¿Cómo manejarías datos personales y privacidad en un producto con LLMs?',
      answer:
        'Minimizar lo que se envía al modelo, enmascarar o anonimizar datos sensibles antes de la llamada, revisar las políticas de retención y uso para entrenamiento del proveedor y elegir región o despliegue según la regulación. Controlar quién puede ver los logs y traces, que suelen contener prompts completos, y aislar los datos por usuario en RAG y memoria para que un usuario nunca recupere información de otro.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo diseñarías la memoria de largo plazo de un agente?',
      answer:
        'Separando tipos de memoria: hechos sobre el usuario o el proyecto, decisiones pasadas y procedimientos aprendidos. Se guardan fuera del contexto (archivos, base de datos o índice vectorial) y se recuperan cuando son relevantes. Hay que permitir actualizarlas y borrarlas, evitar guardar información incorrecta o sensible y darle al usuario control sobre ellas.',
    },
    {
      topic: 'producción',
      question: '¿Cómo diseñarías el human-in-the-loop en un agente?',
      answer:
        'Definiendo qué acciones requieren aprobación según su riesgo y reversibilidad, mostrando a la persona información suficiente para decidir (qué hará, por qué, con qué datos) y permitiendo aprobar, editar o rechazar. El estado del agente se persiste para poder retomar después de la aprobación sin rehacer el trabajo.',
    },
  ],
};
