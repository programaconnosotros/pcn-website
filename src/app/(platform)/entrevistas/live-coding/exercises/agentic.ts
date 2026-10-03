import type { TrackPractice } from './types';

export const agenticPractice: TrackPractice = {
  track: 'agentic',
  exercises: {
    junior: [
      {
        id: 'spec-para-un-agente',
        title: 'Escribir la spec y revisar el diff del agente',
        duration: '45 min',
        statement: [
          'Partí de un proyecto chico en TypeScript o Python con una función `slugify(title)` que hoy solo pasa a minúsculas y reemplaza espacios por guiones. El pedido de producto es: "los slugs tienen que sacar tildes, colapsar guiones repetidos, no empezar ni terminar con guion y cortar en 60 caracteres sin partir una palabra".',
          'Escribí las instrucciones para tu coding agent (Claude Code, Cursor, Copilot o el que uses) como si fuera un ticket: contexto, comportamiento esperado con ejemplos de entrada y salida, qué archivos puede tocar y cómo verificar. Dejá que lo implemente y revisá el diff línea por línea. Como práctica de revisión, chequeá estos bugs frecuentes: `"Ñandú Árbol"` tiene que dar `nandu-arbol`, un título de un solo caracter no especial no puede quedar vacío y un título de 61 caracteres sin espacios no puede devolver un string vacío.',
        ],
        requirements: [
          'La spec incluye al menos 6 ejemplos de entrada y salida, incluyendo casos de borde.',
          'La spec acota el alcance: qué archivos se pueden modificar y qué no.',
          'Se piden tests como parte del entregable y se los corre localmente.',
          'Se deja por escrito cada problema encontrado en el diff y cómo se le pidió al agente corregirlo.',
        ],
        followUps: [
          '¿Qué ambigüedad del pedido de producto tuviste que resolver vos antes de delegar?',
          '¿Qué parte del diff aceptaste sin leer en detalle y por qué estuvo bien o mal?',
          '¿Cómo cambiarías la spec para que el agente acierte en el primer intento?',
        ],
        evaluates:
          'Que sepas convertir un pedido vago en instrucciones verificables y que no aceptes código de un agente sin revisarlo.',
      },
      {
        id: 'tests-primero-con-agente',
        title: 'Tests primero, implementación con el agente',
        duration: '45 min',
        statement: [
          'Tenés que implementar `parseDuration(input: string): number` que convierte strings como `"1h30m"`, `"45s"`, `"2h"` o `"1h 5m 10s"` a segundos, y lanza un error ante entradas como `""`, `"10x"`, `"1h1h"` o `"-5m"`.',
          'Antes de abrir el agente, escribí vos la suite de tests completa sin implementación (tienen que fallar todos). Recién después pedile al agente que implemente la función con la consigna explícita de no modificar los tests. Si algún test no pasa, iterá con el agente hasta que pasen todos sin tocar la suite.',
        ],
        requirements: [
          'Al menos 10 casos de test, con un tercio de casos inválidos.',
          'Los tests están commiteados antes de la implementación (se puede ver en el historial).',
          'El agente no modifica ni borra tests; si lo intenta, se rechaza el cambio.',
          'La implementación final pasa todos los tests y el linter.',
        ],
        followUps: [
          '¿Qué casos se te ocurrieron recién después de ver la implementación del agente?',
          '¿Cómo detectarías que el agente hizo trampa, por ejemplo hardcodeando los casos de test?',
          '¿Qué ganás y qué perdés con este flujo comparado con pedirle todo al agente de una?',
        ],
        evaluates:
          'Que uses los tests como contrato para verificar el trabajo del agente en lugar de confiar en su explicación.',
      },
      {
        id: 'bug-reproducible-con-agente',
        title: 'Reproducir y arreglar un bug con el agente',
        duration: '30 min',
        statement: [
          'Escribí esta función en un proyecto nuevo: `function average(nums) { let sum = 0; for (let i = 1; i < nums.length; i++) sum += nums[i]; return sum / nums.length; }`. El reporte de un usuario dice: "el promedio de mis notas da mal y a veces aparece NaN".',
          'Usá el agente para reproducir el bug con un test que falle, encontrar la causa y arreglarlo. La regla es que el agente primero tiene que mostrarte el test fallando antes de proponer el fix.',
        ],
        requirements: [
          'Hay un test que falla por el índice inicial y otro que cubre el array vacío.',
          'Se define explícitamente qué debe devolver la función con un array vacío y queda testeado.',
          'El fix es mínimo y no reescribe la función entera sin motivo.',
          'Los tests pasan después del fix.',
        ],
        followUps: [
          '¿Por qué conviene exigir el test fallando antes del fix cuando trabajás con un agente?',
          '¿Qué otras entradas raras probarías, como valores no numéricos o arrays muy grandes?',
        ],
        evaluates:
          'Que mantengas el método de debugging (reproducir, aislar, arreglar, verificar) aunque el que escribe el código sea un agente.',
      },
    ],
    'semi-senior': [
      {
        id: 'descomponer-feature-en-pasos',
        title: 'Descomponer una feature en pasos para el agente',
        duration: '60 min',
        statement: [
          'Tenés una API REST chica de tareas en Node o Python con endpoints `GET /tasks` y `POST /tasks`, guardadas en memoria como `{ id, title, done, createdAt }`. La feature pedida es: paginación por cursor en `GET /tasks`, filtro por `done`, y un endpoint `PATCH /tasks/:id` con validación del body.',
          'Antes de escribir código, armá un plan de entre 4 y 6 pasos donde cada paso sea un cambio chico que el agente pueda hacer en una sola iteración, con su criterio de verificación (qué test o comando tiene que pasar). Ejecutá el plan paso a paso con el agente, verificando y commiteando al final de cada uno.',
        ],
        requirements: [
          'El plan está escrito antes de empezar y cada paso tiene una verificación concreta.',
          'Cada paso termina en un commit independiente con tests verdes.',
          'Si un paso falla la verificación, se corrige antes de avanzar al siguiente.',
          'El cursor es opaco para el cliente y estable aunque se agreguen tareas entre páginas.',
          'La validación del `PATCH` rechaza campos desconocidos y tipos incorrectos con 400.',
        ],
        followUps: [
          '¿Qué paso del plan resultó demasiado grande para el agente y cómo lo partiste?',
          '¿Cuándo es mejor darle al agente la feature completa en vez de pasos?',
          '¿Cómo guardarías el plan para que otra sesión del agente pueda retomarlo?',
        ],
        evaluates:
          'Que sepas planificar trabajo en incrementos verificables, que es lo que hace confiable trabajar con agentes en features reales.',
      },
      {
        id: 'test-flaky-con-agente',
        title: 'Arreglar un test flaky con el agente',
        duration: '45 min',
        statement: [
          'Escribí este módulo y su test. Módulo: `export async function fetchAll(ids, fetchOne) { const results = []; ids.forEach(async (id) => { results.push(await fetchOne(id)); }); return results; }`. Test: un `fetchOne` falso que resuelve con `setTimeout` de un delay aleatorio entre 0 y 20 ms, y un `expect(await fetchAll([1, 2, 3], fetchOne)).toEqual([r1, r2, r3])`.',
          'El test falla casi siempre y, si lo "arreglás" a medias, pasa a fallar de forma intermitente. Usá el agente para diagnosticar la causa raíz y arreglarla. No vale agregar reintentos al test ni sleeps.',
        ],
        requirements: [
          'Explicar la causa raíz: `forEach` no espera promesas y el orden de resolución no está garantizado.',
          'El fix preserva el orden de los resultados según `ids`.',
          'Demostrar que el test es estable corriéndolo al menos 50 veces seguidas.',
          'Reemplazar el delay aleatorio por timers falsos o un orden controlado para que el test sea determinístico.',
          'Rechazar cualquier propuesta del agente que solo esconda el síntoma.',
        ],
        followUps: [
          '¿Cómo agregarías un límite de concurrencia a `fetchAll`?',
          '¿Qué debería pasar si uno de los `fetchOne` falla? ¿`Promise.all` o `Promise.allSettled`?',
          '¿Cómo detectás tests flaky en CI antes de que alguien los marque como skip?',
        ],
        evaluates:
          'Que distingas un arreglo real de uno que oculta el síntoma, especialmente cuando el agente propone el camino fácil.',
      },
      {
        id: 'review-de-diff-con-bugs',
        title: 'Code review de un diff generado por un agente',
        duration: '30 min',
        statement: [
          'Un agente implementó esta función para aplicar descuentos y la presentó como lista: `function applyDiscount(price, code) { const codes = { PROMO10: 0.1, PROMO50: 0.5 }; const pct = codes[code.toUpperCase()]; return Math.round(price - price * pct); }`. El ticket pedía: precios en centavos como enteros, códigos case insensitive, código inexistente o vacío no aplica descuento, y nunca devolver un precio negativo.',
          'Hacé el code review como lo harías en un PR: listá cada problema con un ejemplo de entrada que lo demuestre, escribí los tests que lo cubren y después pedile al agente que lo corrija usando tus comentarios como única instrucción.',
        ],
        requirements: [
          'Detectar que un código inexistente devuelve `NaN` en vez del precio original.',
          'Detectar que `code` nulo o indefinido rompe en `toUpperCase`.',
          'Detectar que no se valida que `price` sea un entero no negativo.',
          'Cada comentario incluye una entrada concreta y la salida esperada.',
          'Verificar que el fix del agente pase los tests que escribiste.',
        ],
        followUps: [
          '¿Qué tipo de bugs suelen pasar desapercibidos en diffs generados por agentes?',
          '¿Cómo escribirías los comentarios para que otro agente los pueda resolver sin ambigüedad?',
        ],
        evaluates:
          'Que tengas ojo crítico para revisar código ajeno contra los requisitos, que es la habilidad central al trabajar con agentes.',
      },
    ],
    senior: [
      {
        id: 'refactor-multi-archivo-con-plan',
        title: 'Refactor en varios archivos con un plan',
        duration: '60 min',
        statement: [
          'Tomá un proyecto chico (o generalo) con al menos 6 archivos que llamen directamente a `console.log` y `console.error` con strings armados a mano, por ejemplo `console.log("user " + id + " created")`. El objetivo es migrar todo a un logger estructurado `logger.info("user_created", { userId })` con niveles, un campo `requestId` propagado y salida JSON en producción.',
          'Escribí primero el plan del refactor: el orden de los archivos, qué queda compatible durante la migración, cómo verificar en cada paso que no cambió el comportamiento y cuál es el criterio de terminado (por ejemplo, una regla de lint que prohíbe `console`). Ejecutalo con el agente y revisá cada tanda de cambios.',
        ],
        requirements: [
          'El plan define pasos que dejan el proyecto compilando y con tests verdes en todo momento.',
          'Se agregan tests de caracterización antes de tocar los archivos con lógica.',
          'El `requestId` se propaga sin pasar parámetros por toda la cadena (por ejemplo, con `AsyncLocalStorage` o equivalente).',
          'Una regla de lint impide reintroducir `console` en el código de la app.',
          'Ningún dato sensible (emails, tokens) termina en los logs; queda cubierto por un test.',
          'El historial muestra commits chicos y revisables.',
        ],
        followUps: [
          '¿Cómo le das al agente el contexto de las convenciones del repo para que no las rompa en archivos que no viste?',
          '¿Qué harías si a mitad del refactor el agente cambia el comportamiento de una función sin avisar?',
          '¿Cómo repartirías este refactor entre varios agentes en paralelo sin que se pisen?',
        ],
        evaluates:
          'Que sepas liderar un cambio transversal con agentes manteniendo el control: plan, verificación incremental y guardrails automáticos.',
      },
      {
        id: 'harness-de-verificacion',
        title: 'Harness de verificación para cambios del agente',
        duration: '60 min',
        statement: [
          'Tu equipo deja que un agente abra PRs solo. Querés un script `verify` que el agente tenga que correr antes de dar una tarea por terminada y que también corra en CI. El proyecto tiene typecheck, lint, tests unitarios y un archivo `CHANGELOG.md`.',
          'Implementá el script para que corra los checks en orden de costo (los más baratos primero), corte en el primer fallo con un mensaje accionable para el agente, detecte si el diff modificó o borró tests existentes y lo marque para revisión humana, y falle si el diff toca archivos de una lista protegida (por ejemplo migraciones o `package-lock.json`) sin una etiqueta explícita. Después escribí las instrucciones para el agente (en `CLAUDE.md`, `AGENTS.md` o equivalente) que lo obliguen a usarlo.',
        ],
        requirements: [
          'El script devuelve códigos de salida distintos por tipo de fallo.',
          'Los mensajes de error indican qué falló y qué comando correr para reproducirlo.',
          'La detección de tests modificados funciona comparando contra la rama base con `git diff`.',
          'La lista de archivos protegidos es configurable.',
          'Las instrucciones para el agente son cortas, concretas y verificables.',
        ],
        followUps: [
          '¿Qué tipo de errores del agente este harness no detecta y cómo los cubrirías?',
          '¿Cómo evitás que el agente desactive o saltee el propio script de verificación?',
          '¿Cuánto tiempo puede tardar `verify` antes de que se vuelva un problema para el flujo del agente?',
        ],
        evaluates:
          'Que pienses en guardrails automáticos y en el diseño del entorno del agente, no solo en el prompt.',
      },
      {
        id: 'migracion-de-api-con-agente',
        title: 'Migración de una API deprecada en todo el repo',
        duration: '60 min',
        statement: [
          'En un proyecto con varios módulos, todas las llamadas HTTP usan un helper viejo `request(url, opts, callback)` basado en callbacks. Tenés que migrarlas a `httpClient.get(url, { timeoutMs })` y `httpClient.post(url, body)`, que devuelven promesas y lanzan `HttpError` con `status` en vez de pasar el error al callback.',
          'Usando el agente, primero hacé un inventario de todos los call sites y clasificalos por patrón (lectura simple, manejo de error por status, reintentos manuales, llamadas en paralelo). Elegí un call site de cada patrón, migralo a mano o con el agente y revisalo en detalle, y usá esos ejemplos como referencia para migrar el resto. Al final, borrá el helper viejo.',
        ],
        requirements: [
          'El inventario lista cada call site con su patrón y se genera de forma reproducible (por ejemplo con `grep` o un script).',
          'Los call sites que manejaban errores por status siguen distinguiendo los mismos casos después de la migración.',
          'Las llamadas en paralelo usan `Promise.all` o equivalente sin serializarse por accidente.',
          'Hay tests que cubren al menos un call site de cada patrón antes y después.',
          'El helper viejo se elimina y el build falla si alguien lo vuelve a importar.',
        ],
        followUps: [
          '¿Cuándo conviene un codemod determinístico en lugar de un agente para este tipo de migración?',
          '¿Cómo revisarías 80 call sites migrados sin leer cada uno con el mismo nivel de detalle?',
          '¿Cómo harías el rollout si el proyecto estuviera en producción con tráfico real?',
        ],
        evaluates:
          'Que combines agentes y herramientas determinísticas con criterio, y que sepas escalar la revisión en cambios grandes.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        why: 'Resolvelo primero sin agente y después compará con lo que propone: es ideal para notar si entendés el trade-off entre fuerza bruta y hash map.',
      },
      {
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        why: 'Entrena el uso de stacks y tiene muchos casos de borde, perfecto para escribir los tests vos antes de pedir la implementación.',
      },
      {
        slug: 'merge-two-sorted-lists',
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        why: 'Practica manipulación de punteros, un terreno donde conviene saber razonar sin ayuda para poder revisar el código del agente.',
      },
      {
        slug: 'best-time-to-buy-and-sell-stock',
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        why: 'Una pasada con estado mínimo: sirve para explicar en voz alta la invariante, que es lo que te van a pedir en el screen.',
      },
      {
        slug: 'reverse-linked-list',
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        why: 'Clásico corto que conviene saber escribir de memoria en sus versiones iterativa y recursiva sin depender de un agente.',
      },
    ],
    'semi-senior': [
      {
        slug: 'binary-search',
        title: 'Binary Search',
        difficulty: 'Easy',
        why: 'Los off-by-one de la búsqueda binaria son un buen ejercicio para revisar diffs del agente buscando errores sutiles.',
      },
      {
        slug: '3sum',
        title: '3Sum',
        difficulty: 'Medium',
        why: 'Combina ordenamiento, dos punteros y deduplicación, donde las soluciones generadas suelen fallar en los duplicados.',
      },
      {
        slug: 'product-of-array-except-self',
        title: 'Product of Array Except Self',
        difficulty: 'Medium',
        why: 'Practica prefijos y sufijos con restricciones explícitas, útil para verificar que el agente respete las restricciones del enunciado.',
      },
      {
        slug: 'number-of-islands',
        title: 'Number of Islands',
        difficulty: 'Medium',
        why: 'BFS o DFS sobre grillas, uno de los patrones más pedidos en coding screens de cualquier rol.',
      },
      {
        slug: 'valid-sudoku',
        title: 'Valid Sudoku',
        difficulty: 'Medium',
        why: 'Ejercicio de modelar reglas con hash sets, bueno para escribir primero los tests y delegar después la implementación.',
      },
    ],
    senior: [
      {
        slug: 'lru-cache',
        title: 'LRU Cache',
        difficulty: 'Medium',
        why: 'Diseño de estructuras con complejidad garantizada, ideal para discutir la solución del agente contra la óptima.',
      },
      {
        slug: 'time-based-key-value-store',
        title: 'Time Based Key-Value Store',
        difficulty: 'Medium',
        why: 'Combina diseño de API y búsqueda binaria, parecido a los problemas de diseño chico que aparecen en screens senior.',
      },
      {
        slug: 'course-schedule',
        title: 'Course Schedule',
        difficulty: 'Medium',
        why: 'Detección de ciclos en grafos dirigidos, el mismo razonamiento que usás al ordenar tareas dependientes de un plan.',
      },
      {
        slug: 'rotting-oranges',
        title: 'Rotting Oranges',
        difficulty: 'Medium',
        why: 'BFS multi-origen por niveles, un buen ejercicio para comparar la solución propia con la del agente en claridad y casos de borde.',
      },
      {
        slug: 'coin-change',
        title: 'Coin Change',
        difficulty: 'Medium',
        why: 'Programación dinámica clásica que te obliga a justificar la recurrencia, algo que el agente no puede hacer por vos en la entrevista.',
      },
      {
        slug: 'search-in-rotated-sorted-array',
        title: 'Search in Rotated Sorted Array',
        difficulty: 'Medium',
        why: 'Búsqueda binaria con muchos casos de borde, perfecta para practicar escribir tests que destapen errores en código generado.',
      },
    ],
  },
};
