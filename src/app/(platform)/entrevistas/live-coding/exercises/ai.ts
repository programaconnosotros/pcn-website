import type { TrackPractice } from './types';

export const aiPractice: TrackPractice = {
  track: 'ai',
  exercises: {
    junior: [
      {
        id: 'structured-output-con-reintentos',
        title: 'Salida estructurada con validación y reintentos',
        duration: '45 min',
        statement: [
          'Tenés una función `callModel(prompt: string): Promise<string>` que simula un LLM: devuelve texto que debería ser un JSON con la forma `{ "sentiment": "positive" | "negative" | "neutral", "confidence": number }`, donde `confidence` va de 0 a 1. A veces el modelo devuelve el JSON envuelto en un bloque de código, con texto antes ("Claro, acá va:") o directamente inválido.',
          'Implementá `classifySentiment(text: string): Promise<Result>` que arme el prompt, llame al modelo, extraiga el JSON, lo valide contra el schema y, si falla, reintente hasta 3 veces incluyendo en el nuevo prompt el error de validación. Para probarlo, armá un mock de `callModel` que devuelva en orden: `Claro: {sentiment: positive}`, `{"sentiment": "happy", "confidence": 0.9}` y `{"sentiment": "positive", "confidence": 0.92}`; tu función tiene que terminar devolviendo el tercer resultado.',
        ],
        requirements: [
          'Extraer el primer objeto JSON del texto aunque venga rodeado de prosa o de un bloque de código.',
          'Validar tipos y rangos con un schema explícito (Zod, Pydantic o validación manual).',
          'Reintentar como máximo 3 veces, pasando el error concreto en el prompt del reintento.',
          'Si se agotan los reintentos, lanzar un error tipado que incluya la última respuesta cruda.',
          'Escribir al menos un test con el mock que cubra el camino feliz y el agotamiento de reintentos.',
        ],
        followUps: [
          '¿Cómo cambiaría la solución si el proveedor soporta structured outputs o JSON mode nativo?',
          '¿Qué loguearías de cada intento para poder depurar en producción sin filtrar datos sensibles?',
          '¿Cuándo conviene caer a un valor por defecto en vez de lanzar un error?',
        ],
        evaluates:
          'Que trates la salida del modelo como input no confiable y sepas validarla y recuperarte de errores de forma acotada.',
      },
      {
        id: 'chunking-y-retrieval-coseno',
        title: 'Chunking y retrieval con similitud coseno',
        duration: '45 min',
        statement: [
          'Recibís una lista de documentos `{ id: string, text: string }[]` y una función mock `embed(text: string): number[]` que devuelve un vector de dimensión fija (para el ejercicio podés implementarla como un bag of words sobre un vocabulario chico, así es determinística).',
          'Implementá `chunk(text, size, overlap)` que parta cada documento en fragmentos de como máximo `size` palabras con `overlap` palabras compartidas entre fragmentos consecutivos, y `search(query, k)` que devuelva los `k` chunks más similares a la query por similitud coseno, con su `docId`, el texto y el score. Ejemplo: con `size = 4` y `overlap = 1`, el texto `"a b c d e f g"` produce `["a b c d", "d e f g"]`.',
        ],
        requirements: [
          'Validar que `overlap < size` y manejar textos más cortos que `size`.',
          'Implementar la similitud coseno a mano, cuidando el caso de vectores con norma cero.',
          'Calcular los embeddings de los chunks una sola vez, no en cada búsqueda.',
          'Devolver los resultados ordenados por score descendente y con empates resueltos de forma determinística.',
          'Incluir tests con el ejemplo del enunciado y con una query que no matchea nada.',
        ],
        followUps: [
          '¿Qué complejidad tiene la búsqueda y cómo escalaría a un millón de chunks?',
          '¿Por qué partir por palabras puede ser peor que partir por oraciones o por tokens?',
          '¿Cómo combinarías esto con una búsqueda por keywords (hybrid search)?',
        ],
        evaluates:
          'Que entiendas las piezas básicas de un pipeline de RAG y puedas implementarlas sin depender de un framework.',
      },
      {
        id: 'conteo-de-tokens-y-costo',
        title: 'Estimador de tokens y costo por request',
        duration: '30 min',
        statement: [
          'Tenés un log de llamadas a un modelo como un array de `{ model: string, inputTokens: number, outputTokens: number, userId: string }` y una tabla de precios `{ [model]: { inputPerMillion: number, outputPerMillion: number } }` en dólares.',
          'Implementá `costReport(calls, prices)` que devuelva el costo total, el costo por usuario y el top 3 de usuarios que más gastan. Ejemplo: con un modelo a 3 USD por millón de input y 15 USD por millón de output, una llamada con 2.000 tokens de input y 500 de output cuesta `0.0135` USD.',
        ],
        requirements: [
          'Calcular el costo por llamada separando input y output.',
          'Agregar por usuario con un hash map en una sola pasada.',
          'Si una llamada usa un modelo sin precio, no romper: reportarla aparte como desconocida.',
          'Redondear solo al presentar el resultado, no en los cálculos intermedios.',
        ],
        followUps: [
          '¿Cómo agregarías un límite de gasto diario por usuario que corte las llamadas?',
          '¿Cómo cambiaría el cálculo con prompt caching, donde los tokens cacheados cuestan menos?',
        ],
        evaluates:
          'Que manejes con soltura agregaciones simples y tengas incorporado que el costo por token es una restricción real de los productos con LLMs.',
      },
    ],
    'semi-senior': [
      {
        id: 'tool-calling-loop',
        title: 'Loop de tool calling con límite de pasos',
        duration: '60 min',
        statement: [
          'Vas a implementar el loop de un agente sin usar ningún framework. El modelo es un mock `model.next(messages)` que devuelve o bien `{ type: "tool_call", id: string, name: string, args: object }` o bien `{ type: "final", text: string }`. Tenés dos tools: `getWeather({ city })`, que devuelve `{ tempC: number }`, y `convert({ celsius })`, que devuelve `{ fahrenheit: number }`.',
          'Implementá `runAgent(userMessage, { maxSteps })` que agregue el mensaje del usuario, pida el siguiente paso al modelo, ejecute la tool pedida, agregue el resultado al historial con el `id` de la llamada y repita hasta recibir `final` o llegar a `maxSteps`. Armá un mock que, ante "¿Qué temperatura hace en Córdoba en Fahrenheit?", pida `getWeather`, después `convert` y finalmente responda.',
        ],
        requirements: [
          'Cortar con un error claro si se supera `maxSteps`, devolviendo el historial hasta ese punto.',
          'Validar los `args` de cada tool antes de ejecutarla y devolverle al modelo el error de validación como resultado de la tool en vez de romper.',
          'Si el modelo pide una tool que no existe, informárselo como resultado y seguir.',
          'Capturar excepciones de las tools y convertirlas en un resultado de error para el modelo.',
          'Registrar una traza por paso con la tool, los args, el resultado y la duración.',
          'Tests que cubran el camino feliz, una tool inexistente y el corte por `maxSteps`.',
        ],
        followUps: [
          '¿Cómo ejecutarías en paralelo varias tool calls que el modelo pide en el mismo turno?',
          '¿Qué tools requerirían confirmación humana antes de ejecutarse y cómo lo modelarías?',
          '¿Cómo detectarías que el agente está en un loop pidiendo siempre la misma tool con los mismos args?',
        ],
        evaluates:
          'Que entiendas qué pasa por debajo de un agente y sepas hacerlo robusto ante errores de las tools y del propio modelo.',
      },
      {
        id: 'streaming-con-cancelacion',
        title: 'Streaming de respuesta con cancelación',
        duration: '45 min',
        statement: [
          'Tenés un mock `streamCompletion(prompt, signal)` que devuelve un async iterable de eventos `{ type: "delta", text: string }` emitidos cada 50 ms y que termina con `{ type: "done", usage: { outputTokens: number } }`. El mock respeta un `AbortSignal`: si se aborta, deja de emitir y lanza un `AbortError`.',
          'Implementá `collectStream(prompt, { onDelta, timeoutMs, stopSequences })` que vaya llamando a `onDelta` con cada fragmento, acumule el texto completo y devuelva `{ text, finishReason }`, donde `finishReason` es `"done"`, `"timeout"`, `"stop_sequence"` o `"aborted"`. Si aparece una stop sequence, aunque quede partida entre dos deltas (por ejemplo `"FI"` y `"N"` con stop sequence `"FIN"`), hay que cortar el stream y no incluirla en el texto.',
        ],
        requirements: [
          'Usar `AbortController` para cancelar el stream ante timeout o stop sequence.',
          'Detectar stop sequences que crucen el borde entre deltas sin emitir a `onDelta` texto que luego habría que retirar.',
          'Permitir que el caller cancele desde afuera con su propio `AbortSignal`.',
          'Liberar el timer en todos los caminos de salida.',
          'Devolver el texto parcial acumulado también cuando se cancela.',
        ],
        followUps: [
          '¿Cómo lo expondrías a un frontend con Server-Sent Events y qué pasa si el usuario cierra la pestaña?',
          '¿Cómo manejarías un stream que se corta por un error de red a mitad de camino?',
          '¿Qué cambia si además del texto el stream trae tool calls parciales?',
        ],
        evaluates:
          'Que manejes asincronía, cancelación y estado parcial, que son la base de cualquier UX con LLMs que se sienta rápida.',
      },
      {
        id: 'context-builder-con-presupuesto',
        title: 'Context builder con presupuesto de tokens',
        duration: '45 min',
        statement: [
          'Tenés que armar el contexto que se manda al modelo a partir de un system prompt, el historial de conversación `{ role: "user" | "assistant", content: string }[]` y una lista de documentos recuperados `{ id, text, score }[]`. Contás con `countTokens(text): number` (para el ejercicio, aproximá con `Math.ceil(text.length / 4)`).',
          'Implementá `buildContext({ system, history, docs, budget, reserveForOutput })` que respete el presupuesto total. Las prioridades son: el system prompt y el último mensaje del usuario entran siempre; después, los documentos por score descendente; después, el historial del más reciente al más viejo. Si el system más el último mensaje ya superan el presupuesto, hay que lanzar un error.',
        ],
        requirements: [
          'Respetar `budget - reserveForOutput` como límite estricto.',
          'Mantener el historial incluido en orden cronológico aunque se seleccione de atrás hacia adelante.',
          'No partir un mensaje del historial a la mitad; un documento sí puede truncarse si es el último que entra y quedan al menos 50 tokens.',
          'Devolver además un resumen de qué quedó afuera (ids de documentos y cantidad de mensajes descartados).',
          'Tests con presupuestos justos en el límite.',
        ],
        followUps: [
          '¿Cómo reemplazarías el historial descartado por un resumen generado por el modelo?',
          '¿Qué problema tiene aproximar tokens por caracteres en idiomas distintos del inglés o con código?',
          '¿Cómo ordenarías el contexto para aprovechar prompt caching?',
        ],
        evaluates:
          'Que sepas razonar sobre la ventana de contexto como un recurso escaso y tomar decisiones de prioridad explícitas y testeables.',
      },
    ],
    senior: [
      {
        id: 'eval-harness',
        title: 'Eval harness para comparar dos prompts',
        duration: '60 min',
        statement: [
          'El equipo quiere cambiar el prompt de un extractor que, dado un email, devuelve `{ intent: "refund" | "question" | "complaint", orderId: string | null }`. Tenés un dataset de 20 casos `{ input: string, expected: { intent, orderId } }` y dos variantes de prompt. El modelo es un mock determinístico `model(prompt, input)` con respuestas pregrabadas por variante y caso, y algunas respuestas son JSON inválido.',
          'Construí un harness que corra las dos variantes sobre todo el dataset con concurrencia limitada, puntúe cada salida y genere un reporte comparativo: accuracy de `intent`, exact match de `orderId`, tasa de JSON inválido, latencia p50 y p95, y la lista de casos donde una variante acierta y la otra no.',
        ],
        requirements: [
          'Separar con claridad dataset, runner, scorers y reporte, de modo que agregar un scorer nuevo no toque el runner.',
          'Limitar la concurrencia a N llamadas simultáneas y aplicar timeout por caso.',
          'Un caso que falla o da timeout se registra como fallo, no aborta la corrida.',
          'Calcular percentiles de latencia correctamente sobre los casos completados.',
          'Producir un reporte legible en consola o JSON que destaque regresiones por caso.',
          'Hacer la corrida reproducible: guardar versión del prompt, modelo y parámetros junto con los resultados.',
        ],
        followUps: [
          '¿Cómo evaluarías salidas abiertas donde no hay un `expected` exacto? ¿Qué riesgos tiene usar un LLM como juez?',
          'Con 20 casos, ¿cuándo una diferencia de accuracy es ruido? ¿Cómo lo decidirías?',
          '¿Cómo integrarías esto en CI para bloquear un cambio de prompt que empeora la calidad?',
          '¿Cómo armarías y mantendrías el dataset a partir de tráfico real?',
        ],
        evaluates:
          'Que trates los cambios de prompt como cambios de código que se miden, y que sepas diseñar infraestructura de evaluación extensible.',
      },
      {
        id: 'router-con-fallback-y-circuit-breaker',
        title: 'Cliente de LLM con fallback y circuit breaker',
        duration: '60 min',
        statement: [
          'Tu producto llama a dos proveedores de LLM. Cada uno se expone como `provider.complete(request): Promise<Response>` y puede fallar con `{ status: 429, retryAfterMs }`, `{ status: 500 }` o un timeout. Te dan mocks configurables para simular cada falla.',
          'Implementá `LlmClient.complete(request)` que use el proveedor primario, reintente con backoff exponencial y jitter los errores transitorios, respete `retryAfterMs` en los 429, caiga al proveedor secundario cuando el primario no responde y abra un circuit breaker por proveedor tras 5 fallas consecutivas, que se mantenga abierto 30 segundos antes de probar con una sola request (half-open).',
        ],
        requirements: [
          'Distinguir errores reintentables (429, 5xx, timeout) de los que no lo son (400, errores de validación).',
          'Implementar el circuit breaker como una máquina de estados explícita: closed, open y half-open.',
          'Inyectar el reloj y el random para poder testear backoff y breaker sin esperas reales.',
          'Respetar un deadline total por request, sumando reintentos y fallback.',
          'Exponer métricas: intentos, fallbacks y estado del breaker por proveedor.',
        ],
        followUps: [
          '¿Qué problemas trae hacer fallback a un modelo distinto en cuanto a formato y calidad de salida?',
          '¿Cómo evitarías que muchos procesos reintenten a la vez y empeoren un rate limit (thundering herd)?',
          '¿Reintentarías una request con streaming que ya emitió tokens al usuario?',
        ],
        evaluates:
          'Que diseñes integraciones con proveedores externos pensando en resiliencia, testeabilidad y comportamiento bajo falla.',
      },
      {
        id: 'cache-semantico',
        title: 'Cache semántico de respuestas',
        duration: '60 min',
        statement: [
          'Para bajar costos, querés reutilizar respuestas de preguntas muy parecidas. Tenés un mock `embed(text): number[]` y un mock `model(question): Promise<string>`. Diseñá e implementá `SemanticCache` con `get(question)` y `set(question, answer)`, y una función `answer(question)` que consulte el cache antes de llamar al modelo.',
          'Una entrada se considera hit si la similitud coseno entre embeddings es mayor o igual a un umbral configurable (por ejemplo `0.92`). El cache tiene capacidad máxima con política LRU y un TTL por entrada. Ejemplo: si se guardó "¿Cuál es el horario de atención?", la pregunta "¿En qué horario atienden?" debería ser hit, pero "¿Cuál es el horario de envíos?" no.',
        ],
        requirements: [
          'Implementar LRU con operaciones de actualización en O(1), más el costo de la búsqueda por similitud.',
          'Expirar entradas por TTL usando un reloj inyectable.',
          'Normalizar la pregunta (mayúsculas, espacios) antes de calcular el embedding y probar primero un match exacto.',
          'Evitar llamadas duplicadas al modelo cuando llegan en paralelo dos preguntas equivalentes (request coalescing).',
          'Exponer hit rate y permitir invalidar todas las entradas de un tema o una versión de prompt.',
        ],
        followUps: [
          '¿Qué riesgos tiene un falso positivo en el cache y cómo elegirías el umbral con datos?',
          '¿Cómo manejarías respuestas que dependen del usuario o de datos que cambian?',
          '¿Qué estructura usarías si el cache tuviera millones de entradas?',
        ],
        evaluates:
          'Que combines estructuras de datos clásicas con conceptos de IA y analices con criterio los trade-offs de corrección contra costo.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        why: 'Entrena contar caracteres con un hash map, la base de cualquier normalización y comparación de texto.',
      },
      {
        slug: 'first-unique-character-in-a-string',
        title: 'First Unique Character in a String',
        difficulty: 'Easy',
        why: 'Practica conteo de frecuencias en dos pasadas, un patrón que se repite al procesar tokens y vocabularios.',
      },
      {
        slug: 'ransom-note',
        title: 'Ransom Note',
        difficulty: 'Easy',
        why: 'Refuerza comparar multisets de caracteres, útil para razonar sobre conteos de tokens y presupuestos.',
      },
      {
        slug: 'longest-common-prefix',
        title: 'Longest Common Prefix',
        difficulty: 'Easy',
        why: 'Introduce el razonamiento sobre prefijos compartidos, la idea detrás de los tries y del prompt caching.',
      },
      {
        slug: 'word-pattern',
        title: 'Word Pattern',
        difficulty: 'Easy',
        why: 'Entrena mapeos biyectivos entre palabras y símbolos, parecido a construir vocabularios y tokenizers simples.',
      },
    ],
    'semi-senior': [
      {
        slug: 'group-anagrams',
        title: 'Group Anagrams',
        difficulty: 'Medium',
        why: 'Practica diseñar claves canónicas para agrupar textos equivalentes, como al deduplicar documentos antes de indexarlos.',
      },
      {
        slug: 'top-k-frequent-elements',
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        why: 'Es el patrón de top-k con heap o bucket sort que aparece al rankear resultados de retrieval.',
      },
      {
        slug: 'kth-largest-element-in-an-array',
        title: 'Kth Largest Element in an Array',
        difficulty: 'Medium',
        why: 'Entrena heaps de tamaño fijo y quickselect, lo que usás para quedarte con los k chunks de mayor score.',
      },
      {
        slug: 'merge-intervals',
        title: 'Merge Intervals',
        difficulty: 'Medium',
        why: 'Trabaja rangos solapados, igual que al unir chunks con overlap o resaltar spans citados en un documento.',
      },
      {
        slug: 'implement-trie-prefix-tree',
        title: 'Implement Trie (Prefix Tree)',
        difficulty: 'Medium',
        why: 'El trie es la estructura detrás del autocompletado y de varios tokenizers, y es pregunta clásica en roles de texto.',
      },
    ],
    senior: [
      {
        slug: 'top-k-frequent-words',
        title: 'Top K Frequent Words',
        difficulty: 'Medium',
        why: 'Suma al top-k el desempate determinístico, un detalle clave cuando los rankings tienen que ser reproducibles.',
      },
      {
        slug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        why: 'Diseño de una estructura con operaciones en O(1), la base de cualquier cache de respuestas o embeddings.',
      },
      {
        slug: 'design-add-and-search-words-data-structure',
        title: 'Design Add and Search Words Data Structure',
        difficulty: 'Medium',
        why: 'Combina trie y backtracking para búsquedas con comodines, típico en matching de patrones sobre texto.',
      },
      {
        slug: 'insert-interval',
        title: 'Insert Interval',
        difficulty: 'Medium',
        why: 'Exige manejar todos los casos de borde de intervalos, como al actualizar anotaciones sobre un documento.',
      },
      {
        slug: 'longest-substring-without-repeating-characters',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        why: 'Es el sliding window canónico, el mismo patrón que usás para recorrer ventanas de tokens.',
      },
      {
        slug: 'word-break',
        title: 'Word Break',
        difficulty: 'Medium',
        why: 'Programación dinámica sobre segmentación de texto, muy cercana a cómo funciona la tokenización por subpalabras.',
      },
    ],
  },
};
