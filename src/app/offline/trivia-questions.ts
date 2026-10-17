export interface TriviaQuestion {
  question: string;
  /** The first option is the right one; the screen shuffles them. */
  options: [string, ...string[]];
  explanation: string;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    question: '¿Qué devuelve `typeof null` en JavaScript?',
    options: ['"object"', '"null"', '"undefined"', '"string"'],
    explanation:
      'Es un bug histórico que se mantiene por compatibilidad: los valores se representaban en binario y el tipo objeto compartía el prefijo 000 con null.',
  },
  {
    question: '¿Qué comando deshace el último commit local pero deja los cambios en stage?',
    options: [
      'git reset --soft HEAD~1',
      'git reset --hard HEAD~1',
      'git checkout HEAD~1',
      'git revert HEAD~1',
    ],
    explanation:
      '--soft mueve HEAD y deja los archivos listos en el área de preparación. --hard descarta todo.',
  },
  {
    question: 'En el patrón Observer, ¿cuál es el rol del "Subject"?',
    options: [
      'Mantener la lista de suscriptores y notificarles cada cambio de estado.',
      'Clonar objetos complejos dinámicamente.',
      'Encapsular una petición como un objeto.',
      'Interceptar y formatear peticiones entrantes.',
    ],
    explanation:
      'El Subject guarda el estado y los observadores suscritos, y los notifica cuando ese estado cambia.',
  },
  {
    question: '¿Qué distingue principalmente a una base de datos relacional de una NoSQL?',
    options: [
      'Un esquema estricto definido de antemano y transacciones ACID.',
      'Escalabilidad horizontal automática sin claves primarias.',
      'El uso obligatorio de WebSockets para consultar.',
      'Que guarda los registros solo en archivos planos binarios.',
    ],
    explanation:
      'Las bases SQL se apoyan en esquemas relacionales bien definidos y priorizan la integridad transaccional por sobre la flexibilidad del esquema.',
  },
  {
    question: 'En TypeScript, ¿cuál es la diferencia clave entre `unknown` y `any`?',
    options: [
      '`unknown` te obliga a comprobar el tipo antes de operar con el valor.',
      '`any` solo admite strings o números.',
      '`unknown` no admite valores dinámicos.',
      'Ninguna: compilan exactamente igual.',
    ],
    explanation:
      '`unknown` es la contraparte segura de `any`: acepta cualquier valor, pero exige un type guard para usarlo.',
  },
  {
    question: '¿Qué complejidad tiene la búsqueda binaria sobre un array ordenado?',
    options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
    explanation:
      'Cada paso descarta la mitad del rango que queda, así que crece de forma logarítmica.',
  },
  {
    question: '¿Qué dice el principio de responsabilidad única (la S de SOLID)?',
    options: [
      'Un módulo debe tener una sola razón para cambiar.',
      'La aplicación debe tener un único servidor de base de datos.',
      'Cada función debe ocupar una sola línea.',
      'El estado global debe vivir en un único store.',
    ],
    explanation:
      'Cada clase o módulo cumple un único propósito, lo que reduce el acoplamiento entre partes.',
  },
  {
    question: '¿Qué protocolo usa WebSocket para el handshake inicial?',
    options: ['HTTP', 'SMTP', 'TCP sin cabeceras', 'SSH'],
    explanation:
      'Arranca con una petición HTTP con la cabecera `Upgrade: websocket` y después cambia a un canal full-duplex.',
  },
  {
    question: '¿Cuál de estos no es un hook de React?',
    options: ['useFetch', 'useMemo', 'useCallback', 'useLayoutEffect'],
    explanation: '`useFetch` es un hook personalizado muy común, pero React no lo trae.',
  },
  {
    question: '¿Para qué sirve `HAVING` en SQL?',
    options: [
      'Para filtrar los grupos que arma un GROUP BY.',
      'Para ordenar subconsultas de forma descendente.',
      'Para declarar claves foráneas en un CREATE TABLE.',
      'Para acelerar índices compuestos en PostgreSQL.',
    ],
    explanation: '`WHERE` filtra filas antes de agrupar; `HAVING` filtra los grupos ya agrupados.',
  },
  {
    question: '¿Qué es un closure en JavaScript?',
    options: [
      'Una función que recuerda las variables del ámbito donde se creó.',
      'Un mecanismo del garbage collector para cerrar conexiones.',
      'Una directiva para compilar scripts en segundo plano.',
      'Un error por llaves sin cerrar.',
    ],
    explanation:
      'La función interna conserva acceso al ámbito de la que la contiene, incluso después de que esa ya retornó.',
  },
  {
    question: '¿Qué significa un HTTP 403?',
    options: [
      'Forbidden: el servidor sabe quién sos pero no te deja acceder.',
      'Unauthorized: faltan credenciales.',
      'Not Found: el recurso no existe.',
      'Bad Request: la petición está mal formada.',
    ],
    explanation: '403 es falta de permisos con identidad conocida; 401 es que falta autenticarse.',
  },
];
