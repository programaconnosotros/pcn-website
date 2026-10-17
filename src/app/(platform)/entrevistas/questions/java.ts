import type { InterviewQuestion, Seniority } from './types';

export const javaQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'java',
      question: '¿Qué diferencia hay entre el JDK, el JRE y la JVM?',
      answer:
        'La JVM es la máquina virtual que ejecuta el bytecode. El JRE incluye la JVM y las librerías estándar necesarias para correr programas. El JDK suma las herramientas de desarrollo como el compilador `javac`. Desde Java 11 ya no se distribuye un JRE separado: se usa el JDK o se arma un runtime a medida con `jlink`.',
    },
    {
      topic: 'oop',
      question: '¿Cuáles son los cuatro pilares de la programación orientada a objetos?',
      answer:
        'Encapsulamiento (ocultar el estado interno y exponer comportamiento), herencia (reutilizar y especializar clases), polimorfismo (tratar objetos distintos a través de una misma interfaz) y abstracción (modelar solo lo relevante). En Java se aplican con modificadores de acceso, `extends`, `implements` e interfaces.',
    },
    {
      topic: 'oop',
      question: '¿Qué diferencia hay entre una clase abstracta y una interfaz?',
      answer:
        'Una clase abstracta puede tener estado, constructores y métodos implementados, y una clase solo puede extender una. Una interfaz define un contrato; puede tener métodos `default` y `static`, pero no estado de instancia, y una clase puede implementar varias. Se usa interfaz para capacidades y clase abstracta para compartir implementación base.',
    },
    {
      topic: 'java',
      question: '¿Qué diferencia hay entre `==` y `equals()`?',
      answer:
        '`==` compara referencias en objetos (si apuntan a la misma instancia) y valores en tipos primitivos. `equals()` compara el contenido según cómo lo defina la clase. Por eso los `String` se comparan con `equals()`, no con `==`.',
    },
    {
      topic: 'java',
      question: '¿Por qué si sobrescribís `equals()` tenés que sobrescribir `hashCode()`?',
      answer:
        'Porque el contrato dice que dos objetos iguales según `equals()` deben tener el mismo `hashCode()`. Si no se respeta, colecciones como `HashMap` o `HashSet` no encuentran los objetos o guardan duplicados. Los `record` y los IDEs generan ambos métodos de forma consistente.',
    },
    {
      topic: 'java',
      question: '¿Por qué `String` es inmutable y qué implica?',
      answer:
        'Una vez creado su contenido no cambia: cualquier operación devuelve un `String` nuevo. Esto permite compartirlo de forma segura entre hilos, cachearlo en el string pool y usarlo como clave de mapas. Para concatenar muchas veces en un loop conviene `StringBuilder`.',
    },
    {
      topic: 'colecciones',
      question: '¿Qué diferencia hay entre `List`, `Set` y `Map`?',
      answer:
        '`List` es una secuencia ordenada que admite duplicados (`ArrayList`, `LinkedList`). `Set` no admite duplicados (`HashSet`, `TreeSet`). `Map` asocia claves únicas con valores (`HashMap`, `TreeMap`). Se elige según si importa el orden, la unicidad o el acceso por clave.',
    },
    {
      topic: 'colecciones',
      question: '¿Qué diferencia hay entre `ArrayList` y `LinkedList`?',
      answer:
        '`ArrayList` usa un array dinámico: acceso por índice en O(1) y buena localidad de memoria. `LinkedList` es una lista doblemente enlazada: inserciones en los extremos baratas pero acceso por índice O(n) y más memoria. En la práctica `ArrayList` es la opción por defecto casi siempre.',
    },
    {
      topic: 'excepciones',
      question: '¿Qué diferencia hay entre checked y unchecked exceptions?',
      answer:
        'Las checked (subclases de `Exception` que no son `RuntimeException`, como `IOException`) el compilador obliga a manejarlas o declararlas con `throws`. Las unchecked (`RuntimeException` y sus hijas, como `NullPointerException`) no. Las checked se usan para errores recuperables esperables; las unchecked para errores de programación.',
    },
    {
      topic: 'excepciones',
      question: '¿Para qué sirve try-with-resources?',
      answer:
        'Cierra automáticamente los recursos que implementan `AutoCloseable` (archivos, conexiones, streams) al salir del bloque, incluso si hay una excepción. Evita fugas de recursos y reemplaza el `finally` manual: `try (var reader = Files.newBufferedReader(path)) { ... }`.',
    },
    {
      topic: 'java',
      question: '¿Qué significan `final`, `static` y `this`?',
      answer:
        '`final` impide reasignar una variable, sobrescribir un método o extender una clase. `static` hace que un miembro pertenezca a la clase y no a cada instancia. `this` referencia a la instancia actual, útil para diferenciar atributos de parámetros o encadenar constructores.',
    },
    {
      topic: 'java',
      question: '¿Qué son los tipos primitivos y los wrappers? ¿Qué es el autoboxing?',
      answer:
        'Los primitivos (`int`, `long`, `boolean`, etc.) guardan valores directamente y no pueden ser `null`. Los wrappers (`Integer`, `Long`, `Boolean`) son objetos y se necesitan en colecciones y genéricos. El autoboxing es la conversión automática entre ambos; ojo con el unboxing de un `null`, que lanza `NullPointerException`.',
    },
    {
      topic: 'genéricos',
      question: '¿Para qué sirven los genéricos?',
      answer:
        'Permiten escribir clases y métodos que trabajan con distintos tipos manteniendo la seguridad de tipos en compilación, como `List<String>`. Evitan casteos manuales y errores en runtime. Internamente se implementan con type erasure, así que el tipo genérico no existe en tiempo de ejecución.',
    },
    {
      topic: 'java',
      question: '¿Qué es `Optional` y cuándo usarlo?',
      answer:
        'Es un contenedor que puede tener o no un valor, pensado para tipos de retorno que pueden estar vacíos, en lugar de devolver `null`. Se usa con `map`, `orElse`, `orElseThrow`. No se recomienda usarlo como atributo de clase ni como parámetro de método.',
    },
    {
      topic: 'spring',
      question: '¿Qué es Spring Boot y qué problema resuelve?',
      answer:
        'Es un framework sobre Spring que simplifica crear aplicaciones listas para producción: autoconfiguración según las dependencias del classpath, servidor embebido (Tomcat), starters que agrupan dependencias y configuración externa con `application.properties` o YAML. Reduce mucho la configuración manual.',
    },
    {
      topic: 'spring',
      question: '¿Qué hacen `@RestController`, `@GetMapping` y `@PathVariable`?',
      answer:
        '`@RestController` marca una clase que atiende requests HTTP y serializa las respuestas (normalmente a JSON). `@GetMapping("/users/{id}")` asocia un método a un GET en esa ruta. `@PathVariable` toma un valor de la URL, mientras que `@RequestParam` toma query params y `@RequestBody` el body.',
    },
    {
      topic: 'build',
      question: '¿Para qué sirven Maven o Gradle?',
      answer:
        'Son herramientas de build: gestionan dependencias, compilan, corren tests y empaquetan la aplicación (por ejemplo un `.jar`). Maven usa un `pom.xml` declarativo con un ciclo de vida fijo; Gradle usa un script (Groovy o Kotlin) más flexible y con builds incrementales.',
    },
    {
      topic: 'testing',
      question: '¿Cómo escribís un test unitario en Java?',
      answer:
        'Con JUnit 5: un método anotado con `@Test` que prepara datos, ejecuta el código y verifica con aserciones como `assertEquals` o `assertThrows`. Las dependencias externas se reemplazan con mocks de Mockito. Se corren con `mvn test` o `gradle test`.',
    },
    {
      topic: 'http',
      question: '¿Qué es una API REST?',
      answer:
        'Un estilo de arquitectura donde se exponen recursos identificados por URLs y se operan con los verbos HTTP (GET, POST, PUT, PATCH, DELETE). Es stateless: cada request lleva toda la información necesaria. Se usan códigos de estado HTTP y normalmente JSON como formato.',
    },
    {
      topic: 'bases de datos',
      question: '¿Qué es JDBC?',
      answer:
        'Es la API estándar de Java para conectarse a bases de datos relacionales: abrir conexiones, ejecutar SQL y leer resultados. Se usa con `PreparedStatement` para parametrizar queries y evitar SQL injection. Frameworks como Spring JDBC o JPA trabajan por encima de JDBC.',
    },
  ],
  'semi-senior': [
    {
      topic: 'streams',
      question: '¿Qué es la Stream API y en qué se diferencia de un loop?',
      answer:
        'Permite procesar colecciones de forma declarativa con operaciones como `filter`, `map` y `collect`. Las operaciones intermedias son lazy y solo se ejecutan con una operación terminal. Mejora la legibilidad, pero un stream no se puede reutilizar y para lógica con mucho estado un loop puede ser más claro.',
    },
    {
      topic: 'streams',
      question: '¿Qué son las lambdas y las interfaces funcionales?',
      answer:
        'Una interfaz funcional tiene un único método abstracto (`Function`, `Predicate`, `Supplier`, `Consumer`, o propias con `@FunctionalInterface`). Una lambda es una implementación concisa de ese método, como `x -> x * 2`. Las variables externas que captura deben ser efectivamente finales.',
    },
    {
      topic: 'java',
      question: '¿Qué son los `record` y cuándo los usarías?',
      answer:
        'Son clases inmutables para transportar datos: el compilador genera constructor, getters, `equals`, `hashCode` y `toString`. Ideales para DTOs, respuestas de APIs y value objects. No sirven como entidades JPA porque estas necesitan ser mutables y tener constructor sin argumentos.',
    },
    {
      topic: 'colecciones',
      question: '¿Cómo funciona internamente un `HashMap`?',
      answer:
        'Usa un array de buckets: el `hashCode()` de la clave determina el bucket y las colisiones se guardan en una lista que, si crece mucho, se convierte en un árbol balanceado. Cuando se supera el load factor (0.75 por defecto) el array se duplica y se redistribuye. No es thread-safe; para concurrencia se usa `ConcurrentHashMap`.',
    },
    {
      topic: 'spring',
      question: '¿Qué es la inyección de dependencias y cómo la implementa Spring?',
      answer:
        'Es que un objeto reciba sus dependencias desde afuera en lugar de crearlas. Spring tiene un contenedor que crea los beans (`@Component`, `@Service`, `@Repository`) y los inyecta. Se recomienda inyección por constructor: deja las dependencias explícitas, permite campos `final` y facilita testear.',
    },
    {
      topic: 'spring',
      question: '¿Qué scopes de beans existen en Spring?',
      answer:
        '`singleton` (por defecto, una instancia por contenedor), `prototype` (una nueva cada vez que se pide) y, en aplicaciones web, `request` y `session`. Como los singletons se comparten entre hilos, no deben guardar estado mutable por request.',
    },
    {
      topic: 'jpa',
      question: '¿Qué es JPA y qué relación tiene con Hibernate?',
      answer:
        'JPA es la especificación de Java para mapear objetos a tablas relacionales (ORM) con anotaciones como `@Entity` y `@Id`. Hibernate es la implementación más usada. Spring Data JPA agrega repositorios que generan queries a partir del nombre del método, como `findByEmail`.',
    },
    {
      topic: 'jpa',
      question: '¿Qué diferencia hay entre fetch `LAZY` y `EAGER`?',
      answer:
        'Con `LAZY` la relación se carga recién cuando se accede; con `EAGER`, junto con la entidad. Lo recomendable es `LAZY` y traer lo necesario explícitamente con `JOIN FETCH` o `@EntityGraph`. Acceder a una relación lazy fuera de la sesión produce `LazyInitializationException`.',
    },
    {
      topic: 'jpa',
      question: '¿Cómo detectás y resolvés el problema N+1 con Hibernate?',
      answer:
        'Se detecta activando el log de SQL o con herramientas que cuentan queries: aparece una query por cada elemento de una lista. Se resuelve con `JOIN FETCH`, `@EntityGraph`, batch fetching (`@BatchSize`) o proyecciones a DTOs que traigan solo lo necesario.',
    },
    {
      topic: 'transacciones',
      question: '¿Cómo funciona `@Transactional` en Spring?',
      answer:
        'Spring crea un proxy que abre una transacción antes del método y hace commit al terminar o rollback ante una `RuntimeException` (las checked no hacen rollback por defecto). Como funciona por proxy, no aplica si el método se llama desde la misma clase ni en métodos privados.',
    },
    {
      topic: 'concurrencia',
      question: '¿Qué diferencia hay entre `synchronized`, `volatile` y las clases atómicas?',
      answer:
        '`synchronized` asegura exclusión mutua y visibilidad sobre un bloque. `volatile` solo garantiza que los cambios de una variable sean visibles entre hilos, sin atomicidad en operaciones compuestas como `count++`. Las clases como `AtomicInteger` ofrecen operaciones atómicas sin locks usando compare-and-swap.',
    },
    {
      topic: 'concurrencia',
      question: '¿Para qué sirven `ExecutorService` y `CompletableFuture`?',
      answer:
        '`ExecutorService` administra un pool de hilos para ejecutar tareas sin crear hilos a mano. `CompletableFuture` representa un resultado asíncrono y permite componer operaciones con `thenApply`, `thenCompose` y `allOf`, manejando errores con `exceptionally`. Hay que cerrar los executors y elegir bien el tamaño del pool.',
    },
    {
      topic: 'jvm',
      question: '¿Qué diferencia hay entre el heap y el stack en la JVM?',
      answer:
        'El stack es por hilo y guarda los frames de cada llamada con variables locales y referencias; se libera al terminar el método. El heap es compartido y guarda los objetos, y lo administra el garbage collector. `StackOverflowError` indica recursión muy profunda; `OutOfMemoryError` indica heap agotado.',
    },
    {
      topic: 'jvm',
      question: '¿Cómo funciona el garbage collector en Java?',
      answer:
        'Libera la memoria de objetos que ya no son alcanzables desde las raíces (stacks, variables estáticas). Se basa en la hipótesis generacional: la mayoría de los objetos muere joven, así que el heap se divide en generaciones. Hay distintos collectors (G1 por defecto, ZGC o Shenandoah para pausas muy cortas) según se priorice throughput o latencia.',
    },
    {
      topic: 'testing',
      question: '¿Cómo testeás un servicio de Spring Boot con sus dependencias?',
      answer:
        'Tests unitarios con JUnit y Mockito, mockeando los repositorios. Tests de slices como `@WebMvcTest` (solo la capa web con `MockMvc`) o `@DataJpaTest` (solo persistencia). Tests de integración con `@SpringBootTest` y Testcontainers para levantar una base real en Docker.',
    },
    {
      topic: 'api',
      question: '¿Cómo manejás errores y validaciones en una API con Spring?',
      answer:
        'Validando los DTOs con Bean Validation (`@NotNull`, `@Email`, `@Size`) y `@Valid` en el controller. Los errores se centralizan con `@RestControllerAdvice` y `@ExceptionHandler`, devolviendo respuestas consistentes, por ejemplo con `ProblemDetail` (RFC 9457), sin exponer stack traces.',
    },
    {
      topic: 'seguridad',
      question: '¿Cómo funciona Spring Security a grandes rasgos?',
      answer:
        'Es una cadena de filtros que intercepta cada request antes del controller. Autentica (sesión, JWT, OAuth2), carga al usuario en el `SecurityContext` y aplica reglas de autorización por URL o por método con `@PreAuthorize`. Se configura declarando un bean `SecurityFilterChain`.',
    },
    {
      topic: 'spring',
      question: '¿Cómo manejás configuración por entorno en Spring Boot?',
      answer:
        'Con perfiles (`application-dev.yml`, `application-prod.yml`) activados con `spring.profiles.active`, y sobrescribiendo valores con variables de entorno. Se agrupan propiedades en clases con `@ConfigurationProperties`. Los secretos no van en el repo: se inyectan desde variables de entorno o un vault.',
    },
    {
      topic: 'bases de datos',
      question: '¿Cómo versionás los cambios del esquema de la base de datos?',
      answer:
        'Con herramientas de migraciones como Flyway o Liquibase: cada cambio es un script versionado que se aplica en orden al arrancar o en el pipeline, y queda registrado en una tabla de control. No se usa `ddl-auto=update` de Hibernate en producción.',
    },
    {
      topic: 'performance',
      question: '¿Qué es un connection pool y por qué es importante?',
      answer:
        'Mantiene un conjunto de conexiones abiertas a la base para reutilizarlas, porque abrir una conexión es caro. Spring Boot usa HikariCP por defecto. Un pool chico genera esperas y uno muy grande satura la base; se dimensiona según la carga y los límites del motor.',
    },
  ],
  senior: [
    {
      topic: 'concurrencia',
      question: '¿Qué son los virtual threads y cuándo los usarías?',
      answer:
        'Son hilos livianos administrados por la JVM (estables desde Java 21) que se montan sobre pocos hilos del sistema operativo. Permiten tener millones de tareas concurrentes con código bloqueante simple, ideal para servicios con mucho I/O. No mejoran tareas CPU-intensivas y hay que cuidar los recursos limitados (como el pool de conexiones) y evitar el pinning en bloques `synchronized` largos en versiones anteriores a Java 24.',
    },
    {
      topic: 'concurrencia',
      question: '¿Qué es el Java Memory Model y la relación happens-before?',
      answer:
        'El JMM define cuándo las escrituras de un hilo son visibles para otro, ya que el compilador y la CPU pueden reordenar instrucciones y cachear valores. Happens-before es la garantía de que una acción es visible y ordenada respecto de otra; se establece con locks, `volatile`, el arranque y `join` de hilos. Sin esas garantías aparecen data races difíciles de reproducir.',
    },
    {
      topic: 'jvm',
      question:
        '¿Cómo investigarías una fuga de memoria o un uso alto de CPU en una app Java en producción?',
      answer:
        'Mirar métricas del heap y del GC, tomar un heap dump (`jcmd <pid> GC.heap_dump`) y analizarlo con Eclipse MAT para ver qué retiene objetos. Para CPU, varios thread dumps o Java Flight Recorder con JDK Mission Control o async-profiler. Causas típicas: caches sin límite, listeners o `ThreadLocal` no limpiados y loops calientes.',
    },
    {
      topic: 'jvm',
      question: '¿Cómo elegirías y ajustarías el garbage collector?',
      answer:
        'Según el objetivo: G1 es un buen balance por defecto, ZGC o Shenandoah si se necesitan pausas de pocos milisegundos con heaps grandes, Parallel si importa solo el throughput. Se ajusta midiendo con logs de GC y métricas reales, definiendo el tamaño del heap (`-Xmx`, o porcentaje en contenedores) antes de tocar flags avanzados.',
    },
    {
      topic: 'spring',
      question: '¿Cómo funciona la autoconfiguración de Spring Boot por dentro?',
      answer:
        'Spring Boot carga clases de autoconfiguración declaradas en los jars, que crean beans condicionados con anotaciones como `@ConditionalOnClass`, `@ConditionalOnMissingBean` o `@ConditionalOnProperty`. Si definís tu propio bean, la autoconfiguración se retira. El endpoint `conditions` de Actuator o `--debug` muestran qué se aplicó y por qué.',
    },
    {
      topic: 'transacciones',
      question:
        '¿Qué niveles de aislamiento y propagación de transacciones conocés y cuándo importan?',
      answer:
        'Aislamiento: `READ_COMMITTED`, `REPEATABLE_READ` y `SERIALIZABLE`, que evitan progresivamente dirty reads, non-repeatable reads y phantoms a cambio de menos concurrencia. Propagación en Spring: `REQUIRED` (por defecto), `REQUIRES_NEW` (transacción independiente, útil para auditoría) y `NESTED`, entre otras. Importan en operaciones concurrentes sobre los mismos datos.',
    },
    {
      topic: 'jpa',
      question: '¿Qué diferencia hay entre locking optimista y pesimista en JPA?',
      answer:
        'El optimista usa una columna `@Version`: al actualizar verifica que no haya cambiado y si cambió lanza `OptimisticLockException`; es ideal con pocos conflictos. El pesimista bloquea la fila con `SELECT ... FOR UPDATE` (`LockModeType.PESSIMISTIC_WRITE`) y conviene con mucha contención, a costa de esperas y posibles deadlocks.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo estructurarías una aplicación Spring grande para que sea mantenible?',
      answer:
        'Organizando por módulos de dominio y no por capas técnicas, con límites claros y dependencias controladas (Spring Modulith o ArchUnit ayudan a verificarlas). Aplicar arquitectura hexagonal donde el dominio lo justifique, aislando frameworks e infraestructura. Empezar como monolito modular y extraer servicios solo con una razón concreta.',
    },
    {
      topic: 'microservicios',
      question: '¿Cómo manejás la resiliencia en llamadas entre microservicios?',
      answer:
        'Con timeouts siempre, reintentos con backoff exponencial y jitter solo en operaciones idempotentes, circuit breakers y bulkheads (por ejemplo con Resilience4j) para no propagar fallas. Agregar fallbacks razonables y observabilidad para saber cuándo se activan.',
    },
    {
      topic: 'microservicios',
      question: '¿Cómo mantenés la consistencia de datos entre microservicios?',
      answer:
        'Con consistencia eventual: el patrón Saga coordina transacciones locales con acciones compensatorias, y el patrón Outbox guarda los eventos en la misma transacción que el cambio y luego los publica (por ejemplo a Kafka). Los consumidores deben ser idempotentes porque los mensajes pueden duplicarse.',
    },
    {
      topic: 'mensajería',
      question: '¿Cuándo usarías Kafka y qué garantías ofrece?',
      answer:
        'Para streaming de eventos con alto volumen, retención y múltiples consumidores independientes. Garantiza orden dentro de una partición, así que la clave de particionado define qué eventos se ordenan. Por defecto es at-least-once; existe exactly-once con producers idempotentes y transacciones, pero el consumidor igualmente debería ser idempotente.',
    },
    {
      topic: 'performance',
      question: '¿Cómo mejorarías la latencia de un endpoint lento en Spring?',
      answer:
        'Medir primero con tracing y profiling para encontrar el cuello de botella. Suelen ser queries: índices, evitar N+1, proyecciones. Después: caching (`@Cacheable` con Redis o Caffeine), paralelizar llamadas independientes, paginar, reducir la serialización y revisar el dimensionamiento de pools de conexiones e hilos.',
    },
    {
      topic: 'reactivo',
      question: '¿Cuándo elegirías Spring WebFlux en lugar de Spring MVC?',
      answer:
        'WebFlux es no bloqueante y maneja mucha concurrencia con pocos hilos, útil para streaming o gateways con mucho I/O, pero exige un stack reactivo de punta a punta y es más difícil de depurar. Con virtual threads, Spring MVC con código bloqueante alcanza para la mayoría de los casos con mucho menos complejidad.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo implementarías observabilidad en servicios Spring Boot?',
      answer:
        'Spring Boot Actuator para health checks y métricas con Micrometer, exportadas a Prometheus. Tracing distribuido con Micrometer Tracing u OpenTelemetry, propagando el trace id entre servicios. Logs estructurados en JSON que incluyan ese trace id, y alertas basadas en SLOs.',
    },
    {
      topic: 'seguridad',
      question:
        '¿Cómo diseñarías la autenticación y autorización de un sistema con varios servicios?',
      answer:
        'Delegando la autenticación a un identity provider con OAuth 2.0 / OpenID Connect (Keycloak, Auth0, etc.). Los servicios actúan como resource servers que validan JWTs (firma, expiración, audiencia) y autorizan por scopes o roles. Para llamadas entre servicios se usa client credentials o mTLS, con tokens de vida corta.',
    },
    {
      topic: 'deploy',
      question: '¿Qué tenés en cuenta para correr una aplicación Java en contenedores?',
      answer:
        'Usar una JVM moderna que respete los límites del contenedor y fijar el heap como porcentaje (`-XX:MaxRAMPercentage`). Imágenes livianas con builds multi-stage o Jib, health checks de liveness y readiness, apagado graceful, y evaluar CDS, CRaC o GraalVM native image si el tiempo de arranque es crítico.',
    },
    {
      topic: 'java',
      question:
        '¿Qué aportan las features modernas de Java (sealed classes, pattern matching) al diseño?',
      answer:
        'Las sealed classes limitan qué clases pueden extender un tipo, modelando jerarquías cerradas. Combinadas con records y pattern matching en `switch`, el compilador verifica que se cubran todos los casos, como un tipo algebraico. Permite modelar estados y resultados de forma explícita y segura, sin `instanceof` sueltos.',
    },
    {
      topic: 'testing',
      question:
        '¿Qué estrategia de testing definirías para un equipo que mantiene varios servicios Java?',
      answer:
        'Base amplia de tests unitarios rápidos, tests de integración con Testcontainers para la persistencia y la mensajería, y contract testing (Spring Cloud Contract o Pact) entre servicios en lugar de muchos e2e frágiles. Tests de arquitectura con ArchUnit y un pipeline de CI que corra todo antes de cada merge.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo migrarías un monolito Java legacy a una arquitectura más moderna?',
      answer:
        'De forma incremental con el patrón Strangler Fig: poner un proxy o gateway adelante y extraer funcionalidades una por una, empezando por las de mayor valor y menor acoplamiento. Primero agregar tests de caracterización y observabilidad, y actualizar versiones de Java y Spring por etapas. Evitar el rewrite completo.',
    },
    {
      topic: 'liderazgo',
      question:
        '¿Cómo mantenés actualizadas las dependencias y la versión de Java en un proyecto grande?',
      answer:
        'Automatizando la detección con Dependabot o Renovate, manteniendo buena cobertura de tests para actualizar con confianza y apuntando a versiones LTS de Java. Herramientas como OpenRewrite automatizan migraciones grandes (por ejemplo de `javax` a `jakarta`). Es mejor actualizar seguido y en pasos chicos que acumular deuda.',
    },
  ],
};
