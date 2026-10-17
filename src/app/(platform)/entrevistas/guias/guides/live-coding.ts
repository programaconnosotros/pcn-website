import type { InterviewGuide } from './types';

export const liveCodingGuide: InterviewGuide = {
  track: 'live-coding',
  summary:
    'Cómo prepararte para un live coding en cualquier tecnología: formatos, un método para resolver en voz alta, complejidad, estructuras de datos, patrones, ejercicios de stack, práctica y el día de la entrevista.',
  sections: [
    {
      id: 'como-es-el-live-coding',
      title: 'Cómo es un live coding',
      body: [
        'Live coding es cualquier etapa donde escribís código mientras alguien te mira y te hace preguntas. No es un único formato: puede ser un problema algorítmico en un editor compartido tipo LeetCode o CoderPad, una feature chica en tu stack (un componente, un endpoint, un script), un ejercicio de debugging o refactor sobre código que ya existe, una sesión de pair programming donde el entrevistador actúa como compañero de equipo, o la revisión en vivo de un take-home que hiciste antes. Preguntá siempre cuál te toca, en qué herramienta y cuánto dura: prepararte para el formato correcto vale más que diez problemas al azar.',
        'Lo que se evalúa casi nunca es solo si el código funciona. Miran cómo entendés el problema, si hacés preguntas antes de escribir, cómo descomponés, si probás lo que escribiste, cómo reaccionás a una pista y si podés explicar el costo de tu solución. Una solución incompleta bien razonada y bien comunicada suele puntuar mejor que una completa escrita en silencio y sin probar.',
        'La vara cambia con la seniority. Para junior se espera que resuelvas un problema simple o medio con estructuras básicas, que el código sea legible y que pruebes casos normales. Para semi-senior se espera que llegues a una solución eficiente, que manejes edge cases sin que te los marquen y que tu código tenga nombres y funciones razonables. Para senior se espera además criterio: discutir alternativas y trade-offs, pensar en cómo escalaría o cómo se testearía, guiar la sesión y, en ejercicios de stack, tomar decisiones de diseño defendibles.',
      ],
      checklist: [
        {
          text: 'Distinguir los formatos de live coding y preparar cada uno',
          explanation:
            'Los formatos más comunes son: algorítmico en editor compartido, feature práctica en tu stack, debugging o refactor de código existente, pair programming y review de un take-home. El algorítmico se prepara con patrones y estructuras de datos; el práctico, construyendo cosas chicas contra reloj; el de debugging, leyendo código ajeno y usando el debugger; el pair, hablando mientras trabajás; el review, conociendo a fondo cada decisión de tu entrega. Si no sabés cuál te toca, preguntalo por mail a recruiting: es una pregunta normal y te da información valiosa.',
        },
        {
          text: 'Explicar qué se evalúa además de que el código funcione',
          explanation:
            'Los entrevistadores suelen puntuar varias dimensiones por separado: comprensión del problema, enfoque y descomposición, calidad del código, testing y verificación, análisis de complejidad y comunicación. Esto significa que podés sumar puntos aunque no termines, por ejemplo planteando bien la solución óptima y explicando qué falta. También significa que podés perder puntos con código correcto si nunca dijiste qué estabas haciendo. Tené en mente esa grilla y cubrí cada casillero durante la sesión.',
        },
        {
          text: 'Saber qué se espera de tu seniority en un live coding',
          explanation:
            'Junior: resolver un problema de dificultad fácil o media, aunque sea con una solución no óptima, con código claro y probado a mano. Semi-senior: llegar a la solución eficiente, detectar edge cases por tu cuenta y escribir código que otro pueda mantener. Senior: además de lo anterior, proponer alternativas, justificar trade-offs, pensar en tests, en errores y en cómo cambiaría la solución con más datos o más requisitos. Si sos senior y solo resolvés en silencio, aunque esté perfecto, probablemente quedes como semi-senior.',
        },
        {
          text: 'Hacer las preguntas logísticas antes de la entrevista',
          explanation:
            'Preguntá qué herramienta se usa (editor web, tu IDE compartiendo pantalla, una plataforma específica), si podés elegir lenguaje, si se ejecuta el código o solo se lee, si podés buscar documentación y cuánto dura. Saber si el código corre cambia tu estrategia: si no corre, tenés que probar a mano con más cuidado. Saber si podés buscar documentación te dice cuánto tenés que tener memorizado de la librería estándar. Con esas respuestas armás una práctica que se parezca a la entrevista real.',
        },
        {
          text: 'Elegir el lenguaje con el que vas a resolver',
          explanation:
            'Para problemas algorítmicos usá el lenguaje que más fluido tengas, no el que creas que impresiona. Python es muy cómodo por su sintaxis corta y estructuras incluidas (`dict`, `set`, `collections.deque`, `heapq`); JavaScript o TypeScript andan bien si los usás todos los días, aunque no traen heap nativo. Lo importante es conocer de memoria cómo crear y usar un map, un set, una cola y cómo ordenar con un comparador en tu lenguaje. Si el puesto es de un stack específico y el ejercicio es práctico, usá ese stack.',
        },
      ],
    },
    {
      id: 'metodo-paso-a-paso',
      title: 'Un método para resolver en voz alta',
      body: [
        'Tener un método fijo te saca de la parálisis de la hoja en blanco y le muestra al entrevistador que trabajás con orden. El método que funciona en casi todos los casos es: entender y clarificar, armar ejemplos y edge cases, plantear una solución de fuerza bruta, optimizar, escribir el código, probarlo a mano y analizar la complejidad. Cada paso tiene un objetivo concreto y no conviene saltearlos aunque creas que ya viste el problema.',
        'Los primeros minutos son los que más rinden. Repetí el problema con tus palabras, preguntá por el tamaño de la entrada, si puede venir vacía, si hay duplicados o negativos, si está ordenada y qué devolver si no hay respuesta. Después escribí uno o dos ejemplos chicos y un edge case como comentario en el editor. Esto evita el error más caro de todos: resolver bien un problema que no es el que te pidieron.',
        'Antes de codear, decí la solución de fuerza bruta y su complejidad, aunque sea mala. Te asegura tener algo, y desde ahí la optimización suele salir preguntándote qué trabajo estás repitiendo. Cuando el entrevistador esté de acuerdo con el enfoque, recién ahí escribí el código. Al terminar, no digas "listo": recorré tu código con un ejemplo, línea por línea, y después con el edge case. Cerrá con la complejidad en tiempo y espacio.',
      ],
      checklist: [
        {
          text: 'Clarificar el problema con preguntas concretas antes de escribir',
          explanation:
            'Las preguntas que casi siempre aplican son: tamaño máximo de la entrada, si puede estar vacía, rango de valores (negativos, ceros, enteros grandes), si hay duplicados, si la entrada está ordenada, si se puede modificar en el lugar y qué devolver cuando no hay respuesta. Por ejemplo, en "encontrá dos números que sumen `target`", preguntar si siempre hay solución y si se puede usar el mismo elemento dos veces cambia el código. Anotá las respuestas como comentario arriba del código para no olvidarlas.',
        },
        {
          text: 'Armar ejemplos y edge cases propios',
          explanation:
            'Escribí un ejemplo normal chico (3 a 6 elementos) y al menos dos edge cases: entrada vacía, un solo elemento, todos iguales, valores negativos o la respuesta en el primer o último lugar. Los ejemplos del enunciado suelen ser demasiado amables y no cubren lo que rompe tu código. Hacer los ejemplos a mano además te ayuda a descubrir el patrón: muchas veces, mientras calculás la respuesta, ves qué algoritmo estás usando mentalmente.',
        },
        {
          text: 'Plantear la fuerza bruta y explicar por qué no alcanza',
          explanation:
            'La fuerza bruta es probar todas las opciones: todos los pares, todos los subarrays, todas las combinaciones. Decirla en voz alta con su complejidad, por ejemplo "con dos loops anidados reviso todos los pares, es `O(n^2)`", demuestra que entendiste el problema y te da una red de seguridad. Si la entrada puede tener `10^5` elementos, `O(n^2)` son `10^10` operaciones y no alcanza, y eso justifica buscar algo mejor. Si te quedan pocos minutos, implementar la fuerza bruta bien hecha es mejor que nada.',
        },
        {
          text: 'Optimizar buscando trabajo repetido',
          explanation:
            'La pregunta clave es: qué estoy calculando más de una vez. Si en cada iteración buscás algo en un array, guardalo en un hash map para buscar en `O(1)`. Si recalculás sumas de rangos, usá prefix sums. Si probás todos los subarrays, quizás una sliding window evita reiniciar. Otra pista es el tamaño de la entrada: con `n` hasta `10^5` necesitás `O(n log n)` o mejor, con `n` hasta 20 probablemente sirva backtracking exponencial.',
        },
        {
          text: 'Probar el código a mano después de escribirlo',
          explanation:
            'Tomá tu ejemplo chico y recorré el código como si fueras la computadora, diciendo el valor de cada variable en cada vuelta del loop. Así aparecen los errores off-by-one, las variables sin inicializar y los casos donde nunca se entra al loop. Después repetí con el edge case más peligroso, como la entrada vacía. Si el editor permite ejecutar, igual hacé este recorrido primero: encontrar el bug vos mismo vale mucho más que verlo fallar.',
        },
        {
          text: 'Cerrar con la complejidad y posibles mejoras',
          explanation:
            'Al terminar, decí la complejidad en tiempo y en espacio y de dónde sale: "recorro el array una vez y cada operación del map es `O(1)` promedio, así que es `O(n)` en tiempo y `O(n)` en espacio por el map". Si hay una alternativa con otro trade-off, mencionala: "si la entrada viniera ordenada podría usar two pointers y bajar el espacio a `O(1)`". Esto muestra que entendés lo que escribiste y suele ser lo último que anota el entrevistador.',
        },
      ],
    },
    {
      id: 'complejidad-big-o',
      title: 'Complejidad y Big-O desde cero',
      body: [
        'Big-O describe cómo crece el trabajo de un algoritmo cuando crece la entrada, ignorando constantes y términos chicos. No mide segundos: mide la forma de la curva. Si duplicar la entrada duplica el trabajo, es `O(n)`; si lo cuadruplica, es `O(n^2)`. Se analiza el peor caso salvo que se aclare otra cosa, y se da por separado para tiempo (operaciones) y espacio (memoria extra que usás además de la entrada).',
        'Las clases que más vas a ver, de mejor a peor: `O(1)` constante (acceder a un índice, buscar en un hash map), `O(log n)` logarítmica (binary search, operaciones en un heap o un árbol balanceado), `O(n)` lineal (recorrer una vez), `O(n log n)` (ordenar), `O(n^2)` cuadrática (dos loops anidados sobre la entrada), `O(2^n)` exponencial (todos los subconjuntos) y `O(n!)` (todas las permutaciones). Un número práctico: una computadora hace del orden de `10^8` operaciones simples por segundo, así que con `n = 10^5` un `O(n^2)` ya no entra en tiempo.',
        'Para calcularla mirá la estructura del código: loops secuenciales se suman (`O(n) + O(n) = O(n)`), loops anidados se multiplican, y una función que divide el problema a la mitad en cada paso es logarítmica. Ojo con las operaciones escondidas: `slice`, `indexOf`, `includes` sobre un array, concatenar strings en un loop o `list.pop(0)` en Python son lineales, y metidas dentro de un loop te convierten un `O(n)` en `O(n^2)` sin que se note.',
      ],
      checklist: [
        {
          text: 'Explicar qué significa Big-O y por qué se ignoran las constantes',
          explanation:
            'Big-O es una cota superior del crecimiento del trabajo en función del tamaño de la entrada `n`. Se ignoran constantes porque, para `n` grande, lo que domina es la forma de la curva: `3n + 10` y `n` crecen igual, y ambos son `O(n)`. Por la misma razón `n^2 + n` es `O(n^2)`, porque el término cuadrático termina siendo mucho mayor. En una entrevista, decir "es lineal" o "es `O(n)`" es equivalente; lo que importa es saber justificarlo.',
        },
        {
          text: 'Reconocer las clases de complejidad más comunes con un ejemplo de cada una',
          explanation:
            '`O(1)`: leer `arr[i]` o hacer `map.get(key)`. `O(log n)`: binary search, porque cada paso descarta la mitad. `O(n)`: sumar todos los elementos. `O(n log n)`: ordenar con el `sort` de la librería estándar. `O(n^2)`: comparar cada par con dos loops anidados. `O(2^n)`: generar todos los subconjuntos, porque cada elemento puede estar o no. Asociar cada clase a un ejemplo concreto te permite estimar rápido la de tu solución.',
        },
        {
          text: 'Calcular la complejidad de un fragmento de código',
          explanation:
            'Contá cuántas veces se ejecuta la operación más interna en función de `n`. Dos loops uno después del otro sobre el array son `O(n)`; uno dentro del otro son `O(n^2)`; un loop donde `i` se duplica (`i *= 2`) es `O(log n)`. Para recursión, multiplicá cuántas llamadas hay por cuánto trabajo hace cada una: un `fib(n)` recursivo ingenuo hace dos llamadas por nivel y tiene `n` niveles, así que es `O(2^n)`. Si hay dos entradas distintas, usá dos variables, como `O(n + m)` o `O(n * m)`.',
        },
        {
          text: 'Analizar la complejidad en espacio',
          explanation:
            'El espacio es la memoria extra que tu algoritmo usa además de la entrada. Un map que guarda hasta `n` elementos es `O(n)`; un par de punteros o contadores es `O(1)`. La recursión también ocupa espacio en el call stack: un DFS sobre un árbol de altura `h` usa `O(h)`, que en un árbol degenerado es `O(n)`. Muchas optimizaciones cambian espacio por tiempo, como guardar resultados en un map para no recalcularlos, y conviene decir ese trade-off en voz alta.',
        },
        {
          text: 'Detectar operaciones lineales escondidas',
          explanation:
            'Varias funciones de la librería estándar parecen baratas pero recorren toda la estructura: `includes`, `indexOf` y `slice` en arrays de JavaScript, `in` sobre una lista en Python, `shift` en un array de JavaScript o `pop(0)` en una lista de Python. Si las usás dentro de un loop sobre `n`, tu algoritmo pasa a `O(n^2)`. La solución suele ser cambiar de estructura: un `Set` para membership en `O(1)`, un `deque` para sacar del frente en `O(1)`, o índices en vez de copiar con `slice`.',
        },
        {
          text: 'Usar el tamaño de la entrada para estimar la complejidad necesaria',
          explanation:
            'Con unas `10^8` operaciones por segundo como referencia: si `n` llega a `10^5` o `10^6`, necesitás `O(n)` u `O(n log n)`; si llega a `10^3` o `10^4`, `O(n^2)` probablemente alcance; si llega a 20, podés permitirte `O(2^n)` con backtracking. Esta estimación te dice qué familia de soluciones buscar antes de pensar el algoritmo. Si el enunciado no da límites, preguntalos: es una de las mejores preguntas que podés hacer.',
        },
      ],
    },
    {
      id: 'estructuras-de-datos',
      title: 'Estructuras de datos que tenés que dominar',
      body: [
        'Casi todos los problemas de entrevista se resuelven con un puñado de estructuras: arrays y strings, hash maps y sets, stacks y queues, linked lists, árboles (sobre todo binarios y BST), heaps y grafos. No hace falta implementarlas todas desde cero, pero sí saber el costo de cada operación, cómo se usan en tu lenguaje y, sobre todo, qué tipo de problema pide cada una.',
        'El hash map es la estructura más útil de las entrevistas: convierte búsquedas lineales en `O(1)` promedio y está detrás de contar frecuencias, detectar duplicados, agrupar y memoizar. Stacks y queues aparecen cuando importa el orden de procesamiento: el stack para lo último que entró (paréntesis, deshacer, DFS iterativo), la queue para lo primero (BFS, procesamiento por niveles). El heap aparece cuando necesitás el mínimo o el máximo repetidamente.',
        'Árboles y grafos son donde más gente se traba, porque requieren recursión o recorridos explícitos. Practicá hasta poder escribir sin pensar un DFS recursivo sobre un árbol binario, un BFS con una queue y un recorrido de grafo con un set de visitados. Con esos tres moldes resolvés la mayoría de los problemas de árboles y grafos de nivel medio.',
      ],
      checklist: [
        {
          text: 'Usar arrays y strings sabiendo el costo de cada operación',
          explanation:
            'Acceder por índice es `O(1)`; agregar al final es `O(1)` amortizado; insertar o borrar al principio o en el medio es `O(n)` porque hay que correr elementos. Los strings en la mayoría de los lenguajes son inmutables, así que concatenar en un loop crea copias: es mejor juntar las partes en un array y hacer `join` al final. Muchos problemas de arrays se resuelven con índices en lugar de copiar subarrays, lo que mantiene el espacio en `O(1)`.',
        },
        {
          text: 'Elegir un hash map o un set y explicar cuándo conviene',
          explanation:
            'Un hash map guarda pares clave-valor con inserción, búsqueda y borrado en `O(1)` promedio; un set es lo mismo pero solo con claves. Usalos cuando necesitás responder rápido "ya vi esto" o "cuántas veces apareció". Ejemplo: para saber si un array tiene duplicados, recorrés y agregás a un `Set`; si el elemento ya estaba, hay duplicado, todo en `O(n)`. El costo es memoria `O(n)` y que no mantienen orden por valor, así que si necesitás el mínimo no te sirven.',
        },
        {
          text: 'Usar stacks y queues según el orden de procesamiento',
          explanation:
            'Un stack es LIFO: lo último que entra es lo primero que sale, con `push` y `pop` en `O(1)`. Sirve para validar paréntesis, evaluar expresiones, deshacer acciones y simular recursión. Una queue es FIFO: lo primero que entra es lo primero que sale, y es la base del BFS. En JavaScript un array sirve de stack, pero `shift` es `O(n)`, así que para una queue grande usá un índice de lectura en vez de `shift`; en Python usá `collections.deque`.',
        },
        {
          text: 'Manipular linked lists sin perder nodos',
          explanation:
            'Una linked list es una cadena de nodos con `val` y `next`; insertar o borrar conociendo el nodo es `O(1)`, pero acceder al elemento `k` es `O(k)`. Los trucos clave son: un nodo dummy al principio para no tratar la cabeza como caso especial, guardar `next` antes de reasignar punteros y usar fast y slow pointers para encontrar el medio o detectar ciclos. Ejemplo: para invertir una lista, recorrés con `prev`, `curr` y `next`, haciendo `curr.next = prev` en cada paso. Dibujá las flechas en un comentario mientras lo hacés.',
        },
        {
          text: 'Recorrer árboles binarios y aprovechar las propiedades de un BST',
          explanation:
            'Un árbol binario se recorre con DFS (preorder, inorder, postorder, normalmente recursivo) o BFS por niveles con una queue. Un BST cumple que todo lo de la izquierda es menor y todo lo de la derecha mayor, así que buscar, insertar y borrar cuestan `O(h)`, que es `O(log n)` si está balanceado. Un dato muy preguntado: el recorrido inorder de un BST devuelve los valores ordenados. La mayoría de los problemas de árboles se resuelven pensando "qué le pido a cada subárbol y cómo combino las respuestas".',
        },
        {
          text: 'Usar un heap para obtener el mínimo o el máximo repetidamente',
          explanation:
            'Un heap (priority queue) da el mínimo o el máximo en `O(1)` y permite insertar y sacar en `O(log n)`. Es la estructura indicada cuando necesitás procesar siempre el elemento más chico o más grande que queda, como en top-k, merge de k listas ordenadas o Dijkstra. En Python está `heapq`, que es un min-heap (para max-heap guardás valores negativos); en Java, `PriorityQueue`; en JavaScript no hay uno nativo, así que preguntá si podés asumir uno o tené una implementación corta practicada.',
        },
        {
          text: 'Representar un grafo y recorrerlo sin ciclos infinitos',
          explanation:
            'Un grafo se representa casi siempre como lista de adyacencia: un map de cada nodo a la lista de sus vecinos, que se arma recorriendo las aristas. Para recorrerlo usás DFS o BFS con un set de visitados, marcando cada nodo al encolarlo o al entrar para no procesarlo dos veces. Muchos problemas son grafos disfrazados: una grilla donde cada celda es un nodo y sus vecinos son arriba, abajo, izquierda y derecha, o dependencias entre tareas. El costo de un recorrido completo es `O(V + E)`.',
        },
      ],
    },
    {
      id: 'patrones-frecuentes',
      title: 'Patrones frecuentes y cómo reconocerlos',
      body: [
        'La forma eficiente de prepararte no es resolver cientos de problemas sueltos sino aprender una docena de patrones y la señal que te dice cuándo usar cada uno. Los que más aparecen son two pointers, sliding window, hashing y conteo de frecuencias, prefix sums, binary search, BFS y DFS, recursión y backtracking, programación dinámica, sorting más greedy, monotonic stack y top-k con heaps.',
        'La señal suele estar en el enunciado: "subarray contiguo" sugiere sliding window o prefix sums; "array ordenado" sugiere two pointers o binary search; "todas las combinaciones" sugiere backtracking; "camino más corto en pasos" sugiere BFS; "cantidad de formas" o "máximo/mínimo con decisiones" sugiere programación dinámica; "los k más grandes" sugiere un heap. Entrená ese reconocimiento: leé enunciados y decí el patrón antes de pensar el código.',
        'Para cada patrón tené un molde de código que puedas escribir de memoria y adaptar. No es memorizar soluciones: es memorizar la estructura, como el loop de una sliding window con expansión a la derecha y contracción a la izquierda, o la plantilla de backtracking con elegir, explorar y deshacer. Con el molde listo, tu energía en la entrevista va a los detalles del problema y no a reinventar la estructura.',
      ],
      checklist: [
        {
          text: 'Aplicar two pointers y sliding window',
          explanation:
            'Two pointers usa dos índices que se mueven según una condición, típicamente uno en cada punta de un array ordenado: si la suma es menor que el objetivo avanzás el izquierdo, si es mayor retrocedés el derecho, todo en `O(n)`. La señal es un array ordenado, buscar pares o invertir en el lugar. Sliding window mantiene un rango contiguo `[left, right]`: expandís `right` y, cuando la ventana deja de cumplir la condición, avanzás `left`. La señal es "el subarray o substring más largo/corto que cumple X", como el substring más largo sin caracteres repetidos.',
        },
        {
          text: 'Usar hashing, conteo de frecuencias y prefix sums',
          explanation:
            'Hashing es guardar lo que ya viste en un map para responder en `O(1)`; el ejemplo clásico es two sum, donde por cada número buscás `target - num` en el map. Conteo de frecuencias es armar un map de elemento a cantidad, útil para anagramas o el elemento más frecuente. Prefix sums es precalcular `prefix[i]` como la suma de los primeros `i` elementos, así la suma del rango `[i, j)` es `prefix[j] - prefix[i]` en `O(1)`. Combinados, resuelven "cantidad de subarrays que suman `k`" guardando en un map cuántas veces apareció cada prefix sum.',
        },
        {
          text: 'Aplicar binary search más allá de buscar un valor',
          explanation:
            'Binary search descarta la mitad del espacio en cada paso y cuesta `O(log n)`. La señal obvia es un array ordenado, pero la potente es "buscar el mínimo valor que cumple una condición monótona": si con capacidad `x` alcanza, con `x + 1` también. Ese es el patrón de "binary search sobre la respuesta", como encontrar la velocidad mínima para terminar en `h` horas. Cuidá los bordes: definí si el intervalo es cerrado o semiabierto, usá `mid = lo + Math.floor((hi - lo) / 2)` y verificá que el loop siempre achique el intervalo.',
        },
        {
          text: 'Elegir entre BFS y DFS y escribir ambos de memoria',
          explanation:
            'BFS recorre por niveles con una queue y encuentra el camino más corto en cantidad de pasos en grafos sin pesos: la señal es "mínima cantidad de movimientos". DFS va hasta el fondo de una rama antes de volver, con recursión o un stack, y sirve para explorar todo, contar componentes conectadas, detectar ciclos o recorrer árboles. Ejemplo: contar islas en una grilla es un DFS desde cada celda de tierra no visitada que marca toda la isla. En los dos casos, el set de visitados es obligatorio en grafos.',
        },
        {
          text: 'Resolver problemas con recursión y backtracking',
          explanation:
            'Backtracking construye soluciones paso a paso y deshace la última decisión cuando no lleva a nada. El molde es: si el estado actual es solución, guardala; si no, por cada opción válida, elegila, llamá recursivamente y deshacela. La señal es "generá todas las combinaciones, permutaciones o subconjuntos" o "encontrá una configuración válida", como un sudoku. La complejidad suele ser exponencial, así que se usa con entradas chicas y conviene podar ramas inválidas lo antes posible.',
        },
        {
          text: 'Reconocer un problema de programación dinámica y plantear la recurrencia',
          explanation:
            'Programación dinámica aplica cuando el problema se divide en subproblemas que se repiten y la respuesta óptima se arma con respuestas óptimas de subproblemas. La señal es "cantidad de formas de...", "mínimo costo para..." o "máximo valor posible" con decisiones en cada paso. El método: definí qué significa `dp[i]`, escribí la recurrencia y los casos base. Ejemplo: en subir una escalera de 1 o 2 escalones, `dp[i] = dp[i - 1] + dp[i - 2]`. Empezá con recursión más memoización, que es más fácil de razonar, y pasá a tabla si te lo piden.',
        },
        {
          text: 'Usar sorting más greedy, monotonic stack y top-k con heaps',
          explanation:
            'Greedy elige en cada paso la mejor opción local y muchas veces necesita ordenar primero: para combinar intervalos superpuestos ordenás por inicio y fusionás si el siguiente empieza antes de que termine el actual. Monotonic stack mantiene elementos en orden creciente o decreciente y resuelve en `O(n)` "el próximo elemento mayor" o "cuántos días hasta una temperatura más alta". Top-k usa un min-heap de tamaño `k`: recorrés todo, insertás y, si se pasa de `k`, sacás el mínimo; al final quedan los `k` más grandes en `O(n log k)`.',
        },
      ],
    },
    {
      id: 'ejercicios-de-stack',
      title: 'Ejercicios prácticos en tu stack',
      body: [
        'Cada vez más empresas reemplazan el problema algorítmico por un ejercicio de su día a día: construir un componente que consume una API, un endpoint con validación, un script que procesa un archivo o una pantalla con una lista filtrable. Acá lo que importa es que llegues a algo funcionando, con código razonable, en un tiempo fijo, normalmente entre 45 y 90 minutos.',
        'La clave es priorizar. Primero hacé que el caso principal funcione de punta a punta, aunque sea feo; después manejá errores y estados de carga; después refactorizá y agregá tests; recién al final pulí detalles. Decí ese plan en voz alta al empezar, así el entrevistador sabe que lo que falta es decisión y no olvido. Un entregable que funciona a medias pero cubre el flujo central vale más que tres partes perfectas desconectadas.',
        'Estructurá el código como lo harías en un proyecto real pero sin sobreingeniería: separá la lógica pura (transformar datos, validar) de lo que tiene efectos (fetch, base de datos, UI), con nombres claros y funciones cortas. Eso te permite testear la lógica pura con un par de tests rápidos sin montar todo. Si el tiempo no da para tests, decí cuáles escribirías y por qué: también suma.',
      ],
      checklist: [
        {
          text: 'Planificar el ejercicio en los primeros cinco minutos',
          explanation:
            'Leé todo el enunciado, separá requisitos obligatorios de deseables y preguntá lo ambiguo, por ejemplo si la paginación es del lado del servidor o del cliente. Después decí un plan en tres o cuatro pasos: "primero traigo los datos y los muestro, después agrego el filtro, después errores y loading, y si sobra tiempo tests". Ese plan te sirve de guía cuando el reloj aprieta y le da al entrevistador un marco para evaluar lo que hiciste.',
        },
        {
          text: 'Priorizar el camino feliz de punta a punta',
          explanation:
            'Hacé primero que el flujo principal funcione completo, aunque sea con datos hardcodeados o estilos mínimos. Por ejemplo, en un endpoint que crea un recurso, primero que reciba el body, lo guarde y devuelva `201`; después la validación y los errores. Esto te asegura un entregable demostrable si se acaba el tiempo y te permite iterar sobre algo que funciona. Lo opuesto, perfeccionar una parte antes de tener el flujo completo, es la causa más común de terminar sin nada que mostrar.',
        },
        {
          text: 'Manejar errores, estados vacíos y estados de carga',
          explanation:
            'Después del camino feliz, lo que más diferencia a un candidato es si piensa en lo que puede fallar. En frontend: estado de loading, mensaje de error si falla el fetch y qué se muestra si la lista viene vacía. En backend: validar la entrada y devolver `400` con un mensaje claro, `404` si el recurso no existe y no filtrar detalles internos en un `500`. Modelar estos estados explícitamente, por ejemplo con un tipo `idle | loading | error | success`, muestra madurez.',
        },
        {
          text: 'Separar lógica pura de efectos para poder testear rápido',
          explanation:
            'La lógica pura recibe datos y devuelve datos sin tocar red, disco ni UI: filtrar, ordenar, validar, calcular totales. Si la sacás a funciones propias, como `filterProducts(products, query)`, podés escribir dos o tres tests unitarios en minutos sin mocks. Los efectos, como el fetch o la query a la base, quedan en una capa fina que llama a esa lógica. Esta separación también hace más fácil explicar tu código y extenderlo si el entrevistador agrega un requisito.',
        },
        {
          text: 'Decidir qué tests escribir con poco tiempo',
          explanation:
            'Con tiempo limitado, priorizá un test del caso principal y uno o dos de los edge cases más riesgosos, en lugar de buscar cobertura. Por ejemplo, para una función que calcula descuentos: el caso normal, el monto cero y el descuento que supera el total. Si no llegás a escribirlos, enumeralos en voz alta o como comentarios. Lo que se evalúa es que sepas qué vale la pena testear, no la cantidad de tests.',
        },
        {
          text: 'Usar la documentación y las herramientas del stack con fluidez',
          explanation:
            'En un ejercicio práctico casi siempre podés buscar documentación, y está bien hacerlo: decí qué estás buscando y por qué. Lo que no conviene es depender de la documentación para lo básico de tu stack, como el hook de efecto en React, el router de tu framework web o cómo leer un archivo en tu lenguaje. Practicá armar un proyecto nuevo desde cero con tu stack habitual hasta que el setup te lleve menos de cinco minutos.',
        },
      ],
    },
    {
      id: 'como-practicar',
      title: 'Cómo practicar',
      body: [
        'Practicar bien rinde mucho más que practicar mucho. Un plan de seis a ocho semanas, con sesiones cortas casi todos los días, funciona mejor que maratones de fin de semana. Las primeras semanas son para estructuras de datos y patrones básicos (arrays, hash maps, two pointers, sliding window); las del medio, para árboles, grafos, binary search y heaps; las últimas, para backtracking, programación dinámica, problemas mezclados y simulacros con tiempo.',
        'En LeetCode, o en la página de práctica de este sitio, trabajá con timebox: unos 25 a 45 minutos por problema según la dificultad. Si se cumple el tiempo y no avanzás, mirá la solución, entendela a fondo y escribila de nuevo sin mirarla. Marcá el problema para volver a resolverlo días después: la repetición espaciada es lo que convierte un patrón visto en un patrón que reconocés solo.',
        'Los simulacros son la parte que más gente se saltea y la que más se parece a la entrevista real. Juntate con alguien de la comunidad, uno hace de entrevistador con un problema que el otro no vio, y resolvés hablando en voz alta con tiempo fijo. Después intercambien feedback concreto: dónde te trabaste, qué no explicaste, qué edge case se te pasó. Hablar mientras pensás es una habilidad aparte y solo se entrena haciéndolo.',
      ],
      checklist: [
        {
          text: 'Armar un plan de práctica por semanas',
          explanation:
            'Un plan de ejemplo de ocho semanas: semana 1 y 2, arrays, strings, hash maps y two pointers; semana 3, sliding window, prefix sums y stacks; semana 4, linked lists y binary search; semana 5, árboles y BFS/DFS; semana 6, grafos y heaps; semana 7, backtracking y programación dinámica básica; semana 8, problemas mezclados y simulacros. Apuntá a dos o tres problemas por día más uno de repaso. Si tenés menos tiempo, comprimí priorizando hash maps, two pointers, sliding window, árboles y BFS/DFS, que son los más frecuentes.',
        },
        {
          text: 'Usar timeboxing en cada problema',
          explanation:
            'Poné un límite antes de empezar: unos 20 a 25 minutos para un fácil y 35 a 45 para un medio. Si a la mitad del tiempo no tenés ni un enfoque, permitite una pista, como mirar solo el tag del patrón. Si se cumple el tiempo, pasá a la solución sin culpa. Quedarse dos horas en un problema da la sensación de esfuerzo pero enseña poco; el timebox además te acostumbra al reloj de la entrevista.',
        },
        {
          text: 'Estudiar una solución sin memorizarla',
          explanation:
            'Cuando leas una solución, buscá la idea clave en una frase, por ejemplo "guardo en un map el índice de cada número para buscar el complemento en `O(1)`". Preguntate qué señal del enunciado debería haberte llevado a esa idea. Después cerrá la solución y escribila de cero; si no podés, no la entendiste todavía. Anotá en un archivo propio el problema, el patrón, la idea clave y el error que cometiste: ese archivo es tu material de repaso antes de la entrevista.',
        },
        {
          text: 'Volver a resolver problemas con repetición espaciada',
          explanation:
            'Resolver un problema una vez no alcanza para reconocer el patrón semanas después. Volvé a cada problema que te costó a los 3 días, a la semana y a las dos semanas, resolviéndolo de cero sin mirar. Si lo resolvés fluido, lo espaciás más; si te trabás, vuelve al principio de la rueda. Este método hace que con 100 o 150 problemas bien trabajados estés mejor preparado que con 400 resueltos una sola vez.',
        },
        {
          text: 'Elegir problemas según tu seniority y tu stack',
          explanation:
            'Para junior, concentrate en fáciles y algunos medios de arrays, strings, hash maps y árboles simples. Para semi-senior, la mayoría medios, cubriendo todos los patrones de esta guía. Para senior, medios sólidos y algunos difíciles, sumando ejercicios prácticos de tu stack y discusión de trade-offs. La página de práctica de este sitio tiene problemas recomendados por tecnología y seniority: usala como punto de partida en vez de elegir al azar.',
        },
        {
          text: 'Hacer simulacros con otra persona',
          explanation:
            'Una vez por semana, al menos en las últimas semanas, hacé un simulacro de 45 minutos con alguien que te pase un problema que no viste. Resolvés en voz alta en un editor compartido, sin ejecutar si así va a ser la entrevista real. Al terminar, pedí feedback sobre tres cosas: si se entendía lo que pensabas, si probaste el código y cómo reaccionaste al trabarte. Hacer de entrevistador también enseña mucho, porque ves desde afuera qué comunica bien y qué no.',
        },
      ],
    },
    {
      id: 'comunicacion-y-bloqueos',
      title: 'Comunicación y qué hacer si te trabás',
      body: [
        'En un live coding el entrevistador solo puede evaluar lo que ve y escucha. Si pensás en silencio, para él no estás pensando: estás trabado. Narrá lo que hacés y por qué, sin relatar cada tecla: "voy a usar un map de número a índice para no tener que buscar dos veces", "este loop termina cuando los punteros se cruzan". Cuando tengas que pensar sin hablar, avisalo: "dame un minuto para pensar el caso borde".',
        'Trabarse es normal y los entrevistadores lo esperan; lo que evalúan es cómo salís. Volvé a los ejemplos y resolvé uno a mano prestando atención a qué hacés vos; repasá la lista de patrones preguntándote cuál encaja; simplificá el problema (qué pasa si el array está ordenado, si no hay duplicados) y después generalizá. Si nada de eso funciona, pedí una pista de forma concreta.',
        'Los errores también son parte de la sesión. Si te das cuenta de un bug, decilo y corregilo con calma: "acá tengo un off-by-one, el rango tiene que ser hasta `n - 1`". Si el entrevistador te marca algo, agradecé, pensalo y no te pongas a la defensiva; si no estás de acuerdo, explicá por qué con un ejemplo. Recuperarse bien de un error suma más de lo que resta el error.',
      ],
      checklist: [
        {
          text: 'Narrar el razonamiento sin relatar cada línea',
          explanation:
            'Contá decisiones, no tecleos: qué estructura elegís y por qué, qué invariante mantiene un loop, qué caso estás cubriendo con un `if`. Una buena regla es hablar al empezar cada bloque de código y al tomar cada decisión, y quedarte en silencio mientras escribís lo mecánico. Por ejemplo: "uso un set de visitados porque la grilla puede tener ciclos" antes de escribir el BFS. Practicalo en voz alta solo hasta que te salga natural.',
        },
        {
          text: 'Narrar trade-offs entre alternativas',
          explanation:
            'Cuando hay más de un enfoque, mencioná ambos y elegí con un criterio: "puedo ordenar y usar two pointers, `O(n log n)` en tiempo y `O(1)` extra, o usar un map, `O(n)` en tiempo y `O(n)` en espacio; voy con el map porque la entrada no está ordenada y priorizamos tiempo". Esto muestra criterio, que es justamente lo que separa a un semi-senior de un senior. Si el entrevistador prefiere la otra opción, te lo va a decir y ganaste tiempo.',
        },
        {
          text: 'Destrabarte con una secuencia de técnicas',
          explanation:
            'Cuando no ves la solución, probá en orden: resolver un ejemplo chico a mano y observar qué hacés; pensar la fuerza bruta y buscar trabajo repetido; recorrer la lista de patrones preguntando si alguno encaja con la señal del enunciado; simplificar el problema relajando una restricción. Ejemplo: si no sale el problema con duplicados, resolvelo asumiendo que no hay y después adaptalo. Tener la secuencia preparada evita que el nervio te deje en blanco.',
        },
        {
          text: 'Pedir una pista de forma concreta',
          explanation:
            'Pedir una pista no te descalifica; quedarte diez minutos trabado en silencio, sí. La forma buena es mostrar dónde estás: "tengo la solución `O(n^2)` y siento que el trabajo repetido está en buscar el complemento, pero no veo cómo evitarlo; ¿voy bien por ahí?". Eso le permite al entrevistador darte una pista chica y precisa. Cuando la recibas, decí cómo la vas a usar para que vea que la entendiste.',
        },
        {
          text: 'Recuperarte de un error sin perder el ritmo',
          explanation:
            'Si encontrás un bug, nombralo, explicá la causa en una frase y corregilo: "el loop arranca en 1 y me salteo el primer elemento". No reescribas todo por nervios; arreglá lo mínimo y volvé a probar con el ejemplo. Si el entrevistador te marca un error que no ves, pedile el caso que falla y recorrelo a mano. Mostrar calma y método frente a un error es una señal fuerte de cómo vas a trabajar en el equipo.',
        },
        {
          text: 'Gestionar el tiempo durante la sesión',
          explanation:
            'Repartí el tiempo aproximado: unos 5 minutos para clarificar y ejemplos, 5 a 10 para el enfoque, 15 a 20 para codear y 5 a 10 para probar y analizar. Si a la mitad todavía no empezaste a codear, avisá y arrancá con la mejor solución que tengas, aunque no sea óptima. Preguntar "¿preferís que implemente esta versión o que siga buscando una mejor?" es válido y le da al entrevistador la decisión. Lo peor es llegar al final con una idea brillante y cero código.',
        },
      ],
    },
    {
      id: 'dia-del-live-coding',
      title: 'El día del live coding',
      body: [
        'La mayoría de los problemas del día no son técnicos sino de entorno: el micrófono que no anda, el editor web que no conocés, la conexión inestable, la notificación que aparece en la pantalla compartida. Dejá todo eso resuelto antes, para que tu cabeza esté libre para el problema. Si la entrevista usa una plataforma específica, entrá antes y probala con un ejercicio cualquiera.',
        'En las horas previas no intentes aprender nada nuevo. Repasá tu archivo de patrones e ideas clave, resolvé uno o dos problemas fáciles para entrar en ritmo y tené a mano tus notas de complejidad. Comé algo, tené agua y conectate cinco minutos antes. Si los nervios aparecen, recordá que el entrevistador quiere que te vaya bien: necesita contratar a alguien.',
        'Los últimos cinco minutos de la sesión también cuentan. Si terminaste, usalos para probar con edge cases, analizar complejidad y proponer mejoras. Si no terminaste, resumí qué funciona, qué falta y cómo lo completarías. Y guardá unos minutos para tus preguntas: preguntá cómo es el trabajo real del equipo o qué esperan de alguien en el rol, que deja mejor impresión que no preguntar nada.',
      ],
      checklist: [
        {
          text: 'Preparar el entorno técnico el día anterior',
          explanation:
            'Probá cámara, micrófono y auriculares en la misma plataforma de videollamada que se va a usar. Verificá la conexión y tené un plan B, como datos del celular. Si vas a usar tu IDE, dejá abierto un proyecto vacío con tu lenguaje configurado y el formatter funcionando. Cerrá aplicaciones que muestren notificaciones o activá el modo no molestar, y achicá las pestañas abiertas por si compartís pantalla.',
        },
        {
          text: 'Conocer los atajos del editor que vas a usar',
          explanation:
            'Los atajos que más tiempo ahorran son: duplicar línea, mover línea arriba o abajo, comentar y descomentar, selección múltiple, ir a una línea y formatear el archivo. En VS Code, por ejemplo, `Alt + flecha` mueve una línea y `Ctrl + /` comenta (`Cmd + /` en macOS). En un editor web tipo CoderPad algunos atajos cambian o no existen, así que probalo antes. Ganar fluidez en el editor te deja más tiempo para pensar.',
        },
        {
          text: 'Tener lista una checklist de setup',
          explanation:
            'Una checklist práctica: link de la entrevista abierto, plataforma probada, lenguaje elegido, plantilla con un `main` o función de prueba lista para ejecutar, papel y lápiz para dibujar, agua y el teléfono en silencio. Tené también a mano cómo se crean en tu lenguaje un map, un set, una queue, un heap y cómo se ordena con comparador. Repasar esta lista quince minutos antes te saca la ansiedad de olvidarte algo.',
        },
        {
          text: 'Hacer un precalentamiento breve antes de entrar',
          explanation:
            'Una hora o media hora antes, resolvé uno o dos problemas fáciles que ya conozcas, hablando en voz alta como en la entrevista. No es para aprender sino para activar el modo de resolver y narrar. Evitá problemas difíciles nuevos ese día: si no te salen, entrás con la confianza baja. Repasá también tu archivo de patrones con las ideas clave de cada uno.',
        },
        {
          text: 'Usar bien los últimos cinco minutos',
          explanation:
            'Si terminaste, probá un edge case más, enunciá la complejidad en tiempo y espacio y mencioná una mejora posible o cómo cambiaría la solución con otros requisitos. Si no terminaste, dejá de codear y resumí: qué parte funciona, qué falta y exactamente cómo lo completarías, con la complejidad que tendría. Ese resumen ordenado puede convertir una sesión incompleta en una evaluación positiva. Cerrá con una o dos preguntas tuyas sobre el equipo o el rol.',
        },
        {
          text: 'Registrar la experiencia después de la entrevista',
          explanation:
            'Apenas termines, anotá el problema que te tocó, cómo lo encaraste, dónde te trabaste y qué te preguntaron. Si no lo resolviste, buscalo o resolvelo tranquilo después: es el problema que mejor vas a recordar. Ese registro te sirve para las siguientes entrevistas, tanto en la misma empresa como en otras, porque los formatos y temas se repiten mucho. También es material valioso para compartir con la comunidad.',
        },
      ],
    },
  ],
};
