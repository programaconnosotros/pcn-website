import type { InterviewGuide } from './types';

export const javaGuide: InterviewGuide = {
  track: 'java',
  summary:
    'Qué estudiar y cómo practicar para una entrevista de backend con Java y Spring Boot, de junior a senior.',
  sections: [
    {
      id: 'la-entrevista',
      title: 'Cómo es la entrevista',
      body: [
        'Los procesos de Java suelen ser más formales: charla con recruiting, entrevista técnica sobre el lenguaje y Spring, un ejercicio práctico (live coding o take-home), y para perfiles altos system design y una charla con liderazgo. En empresas grandes, bancos y consultoras es común una prueba de algoritmos al principio. Preguntá cuántas etapas hay y qué evalúa cada una.',
        'Para junior se evalúa Java y orientación a objetos con precisión: los pilares de POO, interfaces contra clases abstractas, `equals` y `hashCode`, colecciones, excepciones y un endpoint básico con Spring Boot. Se espera código prolijo, nombres claros y que sepas explicar lo que escribís. Un proyecto propio con Spring Boot, JPA, una base real y tests vale más que cualquier certificación.',
        'Para semi-senior se mira Java moderno (streams, lambdas, `record`, `Optional`), cómo funciona Spring por dentro (inyección de dependencias, scopes, `@Transactional`), JPA sin N+1, concurrencia básica, Spring Security, testing con slices y configuración por entorno. Te van a pedir ejemplos de decisiones reales.',
        'Para senior importan la JVM en producción (memoria, GC, diagnóstico), virtual threads, transacciones avanzadas, resiliencia y consistencia entre microservicios, Kafka, observabilidad, contenedores y cómo modernizar sistemas legacy. También cómo guiás técnicamente al equipo y manejás actualizaciones de versiones y dependencias.',
      ],
      checklist: [
        {
          text: 'Saber qué etapas tiene el proceso y si hay prueba de algoritmos',
          explanation:
            'Preguntalo en la primera charla con recruiting, sin vergüenza: cuántas etapas hay, quién participa en cada una, cuánto dura y qué evalúa, si hay prueba de algoritmos (HackerRank, Codility o similar), live coding o take-home, y si podés usar tu IDE. Con eso repartís el tiempo de estudio: si hay algoritmos, practicá en Java los patrones típicos (hash maps, two pointers, sliding window, BFS y DFS, ordenamiento) usando `HashMap`, `ArrayDeque` y `PriorityQueue`; si hay system design, dedicale sesiones aparte. Anotá todo en un documento por empresa y repasalo antes de cada etapa. El error común es prepararse igual para todo y llegar a una prueba cronometrada sin haber practicado con reloj.',
        },
        {
          text: 'Tener un proyecto Spring Boot propio que puedas explicar completo',
          explanation:
            'Armá una API chica pero completa: endpoints REST con validación y manejo global de errores, JPA sobre Postgres con migraciones de Flyway, Spring Security con JWT, tests unitarios y de integración con Testcontainers, un `docker-compose.yml` para levantarla y un `README` con decisiones. Un dominio simple (turnos, inventario, gastos) alcanza; lo que importa es que puedas justificar cada pieza: por qué esa estructura de paquetes, por qué lazy loading, cómo evitaste el N+1, qué harías distinto en producción. Practicá dibujar la arquitectura y contar el flujo de una request en dos minutos. El error común es mostrar un proyecto copiado de un tutorial y trabarse cuando preguntan por qué algo está hecho así.',
        },
        {
          text: 'Contar dos o tres problemas reales que resolviste con contexto y resultado',
          explanation:
            'Elegí casos técnicos concretos, como una consulta lenta por N+1, una fuga de memoria, un deadlock, una migración de versión o un incidente en producción, y escribilos con esta estructura: contexto (sistema y escala), problema y cómo lo detectaste, qué hiciste vos y por qué descartaste alternativas, resultado medible (latencia de 2 s a 200 ms, errores que desaparecieron) y qué aprendiste. Ensayalos en voz alta hasta que duren unos dos minutos y tené detalles listos para cuando repregunten. El error común es hablar todo el tiempo en plural sin dejar claro tu aporte, o no tener ningún número que muestre el impacto.',
        },
        {
          text: 'Distinguir qué se espera de un junior, un semi-senior y un senior',
          explanation:
            'Un junior tiene que escribir código correcto y prolijo, dominar Java y POO, y resolver tareas acotadas con guía. Un semi-senior es autónomo en features completas, entiende cómo funciona Spring y JPA por dentro y toma decisiones justificando trade-offs. Un senior diseña sistemas, anticipa problemas de producción (rendimiento, consistencia, fallas), guía técnicamente al equipo y tiene impacto más allá de su código. Usalo para calibrar tus respuestas: si te postulás a senior, cada respuesta debería mencionar alternativas, costos y cómo se opera en producción, no solo cómo se programa.',
        },
        {
          text: 'Saber en qué versión de Java y Spring Boot trabajaste y qué cambió',
          explanation:
            'Las LTS de Java son 8, 11, 17, 21 y 25. Hitos para nombrar: Java 11 trajo el `HttpClient` estándar; 17 consolidó `record`, text blocks, sealed classes y pattern matching en `instanceof`; 21 trajo virtual threads, pattern matching en `switch`, record patterns y sequenced collections; 25 (septiembre de 2025) finalizó scoped values, flexible constructor bodies y los compact source files. En Spring, Boot 3 exigió Java 17 y pasó de `javax.*` a `jakarta.*`, sumó soporte nativo con GraalVM y observabilidad con Micrometer; Boot 4 (noviembre de 2025, sobre Spring Framework 7) trajo Jakarta EE 11, null-safety con JSpecify, versionado de APIs integrado y Jackson 3. Si trabajaste en versiones viejas, decilo y mostrá que sabés qué implica migrar.',
        },
      ],
    },
    {
      id: 'fundamentos',
      title: 'Java, POO y la JVM',
      body: [
        'Empezá por lo básico pero con precisión: JDK, JRE y JVM; tipos primitivos y wrappers con autoboxing (y el `NullPointerException` que aparece al desempaquetar un `null`); `==` contra `equals`; por qué `String` es inmutable; `final`, `static` y `this`. El contrato entre `equals` y `hashCode` es pregunta casi segura: si dos objetos son iguales tienen que tener el mismo hash, o se rompen los `HashMap` y `HashSet`.',
        'Colecciones: `List`, `Set` y `Map` y sus implementaciones, `ArrayList` contra `LinkedList` (casi siempre `ArrayList`), y cómo funciona un `HashMap` por dentro (buckets, colisiones, árboles cuando un bucket crece, rehash). Excepciones checked contra unchecked, try-with-resources para cerrar recursos y genéricos con su type erasure.',
        'Java moderno es lo que diferencia: lambdas e interfaces funcionales, la Stream API (y cuándo un loop es más claro), `Optional` como tipo de retorno y no como campo, `record` para datos inmutables, `var`, text blocks, sealed classes y pattern matching en `switch`. En 2026 lo esperable es Java 21 o 25 (ambas LTS); sabé qué features usaste de cada una.',
        'De la JVM: heap contra stack, cómo el garbage collector trabaja por generaciones, que G1 es el default y que ZGC apunta a pausas mínimas, y que el JIT optimiza el código caliente en runtime. Para el build, Maven o Gradle: dependencias, scopes, plugins y por qué conviene un BOM para alinear versiones.',
      ],
      checklist: [
        {
          text: 'Explicar el contrato entre `equals` y `hashCode` con un ejemplo roto',
          explanation:
            'El contrato dice que si `a.equals(b)` es true, `a.hashCode()` tiene que ser igual a `b.hashCode()`; lo inverso no es obligatorio (puede haber colisiones). `HashMap` y `HashSet` usan el hash para elegir el bucket y recién después comparan con `equals`. Ejemplo roto: una clase `Point` que sobrescribe `equals` comparando `x` e `y` pero no `hashCode`; entonces `set.add(new Point(1, 2))` seguido de `set.contains(new Point(1, 2))` devuelve false, porque cada instancia tiene un hash distinto y se busca en otro bucket. Otro clásico: usar campos mutables en el hash y modificarlos después de insertar, con lo que el objeto queda perdido dentro del set. La solución es sobrescribir ambos con los mismos campos (por ejemplo con `Objects.hash`) o usar un `record`, que los genera bien.',
        },
        {
          text: 'Explicar cómo funciona un `HashMap` por dentro',
          explanation:
            'Es un array de buckets: calcula `hashCode()` de la clave, lo mezcla (`h ^ (h >>> 16)`) y con `hash & (n - 1)` obtiene el índice. Si dos claves caen en el mismo bucket hay colisión y se encadenan en una lista; desde Java 8, si un bucket supera 8 entradas y la tabla tiene al menos 64 posiciones, la lista se convierte en un árbol rojo-negro, así el peor caso pasa de O(n) a O(log n). Cuando la cantidad de entradas supera capacidad por load factor (0,75 por defecto) la tabla se duplica y se redistribuyen las entradas (rehash), lo que es caro, por eso conviene dimensionarla si sabés el tamaño. Get y put son O(1) promedio. No es thread-safe (para concurrencia usá `ConcurrentHashMap`), acepta una clave `null` y no garantiza orden de iteración (para eso está `LinkedHashMap`).',
        },
        {
          text: 'Diferenciar checked y unchecked exceptions y usar try-with-resources',
          explanation:
            'Las checked heredan de `Exception` sin pasar por `RuntimeException` y el compilador te obliga a capturarlas o declararlas con `throws` (`IOException`, `SQLException`); representan fallas externas recuperables. Las unchecked heredan de `RuntimeException` (`IllegalArgumentException`, `NullPointerException`) y suelen indicar errores de programación o condiciones que no tiene sentido forzar a manejar; Spring, por ejemplo, traduce las de JDBC a `DataAccessException`, que es unchecked. Try-with-resources cierra automáticamente cualquier `AutoCloseable`, en orden inverso y aunque haya excepción: `try (var in = Files.newBufferedReader(path)) { ... }`; si el cierre también falla, esa excepción queda como suppressed en la principal. Errores comunes: capturar y tragar la excepción sin loguear, o atrapar `Exception` genérica y perder la causa original al relanzar sin pasarla como `cause`.',
        },
        {
          text: 'Usar streams, lambdas, `Optional` y `record` con criterio',
          explanation:
            'Los streams expresan transformaciones de forma declarativa (`filter`, `map`, `collect`, `groupingBy`) y son lazy: nada corre hasta la operación terminal. Usalos sin side effects; si necesitás cortar a mitad con lógica compleja, manejar checked exceptions o el pipeline se vuelve ilegible, un `for` es más claro. Las lambdas solo capturan variables effectively final. `Optional` está pensado como tipo de retorno para expresar que puede no haber valor: encadená `map`, `orElse`, `orElseThrow` y evitá `get()` sin chequear; no lo uses en campos, parámetros ni colecciones. `record` sirve para datos inmutables como DTOs o value objects porque genera constructor, accessors, `equals`, `hashCode` y `toString`, pero no para entidades JPA, que necesitan constructor sin argumentos, mutabilidad y proxies.',
        },
        {
          text: 'Explicar heap, stack y el garbage collector a grandes rasgos',
          explanation:
            'Cada hilo tiene su stack con un frame por método en ejecución, donde viven las variables locales, los primitivos y las referencias; se libera solo al salir del método y si se llena tenés `StackOverflowError` (típico de recursión infinita). El heap es compartido y guarda los objetos; lo limpia el garbage collector, que libera lo que ya no es alcanzable desde las raíces (stacks, campos static). Se basa en la hipótesis generacional: la mayoría de los objetos mueren jóvenes, así que hay una young generation que se limpia seguido y barato, y una old generation para los que sobreviven. G1 es el default y busca un objetivo de pausa trabajando por regiones; ZGC hace casi todo concurrente con pausas de menos de un milisegundo, útil para heaps grandes. Una fuga de memoria en Java no es memoria sin liberar sino referencias que mantenés sin querer, como un `static Map` usado de cache sin límite.',
        },
        {
          text: 'Explicar qué hace Maven o Gradle y cómo se manejan versiones',
          explanation:
            'Son herramientas de build: resuelven dependencias (incluidas las transitivas) desde repositorios como Maven Central, compilan, corren tests y empaquetan el jar. Maven usa un `pom.xml` declarativo con un ciclo de vida fijo (`compile`, `test`, `package`, `install`) y scopes como `compile`, `provided`, `runtime` y `test`; Gradle usa un script en Kotlin o Groovy, es incremental y más rápido, con configuraciones como `implementation` y `testImplementation`. Para alinear versiones se usa un BOM: con el parent o el plugin de Spring Boot no declarás versiones de las librerías que Spring ya gestiona, y evitás combinaciones incompatibles. Ante conflictos, Maven elige la versión más cercana en el árbol y Gradle la más alta; mirá el árbol con `mvn dependency:tree` o `gradle dependencies`. Usá el wrapper (`mvnw`, `gradlew`) para que todos compilen con la misma versión de la herramienta.',
        },
      ],
    },
    {
      id: 'spring-boot-apis',
      title: 'Spring Boot y diseño de APIs',
      body: [
        'Spring Boot resuelve configuración y arranque: starters, autoconfiguración, servidor embebido y configuración externa. Sabé explicar la inyección de dependencias (inversión de control, inyección por constructor como práctica recomendada), los estereotipos (`@Component`, `@Service`, `@Repository`, `@Controller`), los scopes de beans y que el default es singleton, con lo que eso implica para el estado mutable.',
        'Para senior, cómo funciona la autoconfiguración por dentro: clases de configuración registradas que se activan con condiciones como `@ConditionalOnClass` o `@ConditionalOnMissingBean`, lo que te permite reemplazar un bean definiendo el tuyo. También los proxies: muchas anotaciones (`@Transactional`, `@Async`, `@Cacheable`) funcionan por proxy y no se aplican en llamadas internas dentro de la misma clase, un bug clásico.',
        'En la capa web conocé `@RestController`, `@GetMapping`, `@PathVariable`, `@RequestParam`, `@RequestBody` y `ResponseEntity`. Validá con Bean Validation (`@Valid`, `@NotNull`, `@Size`) y centralizá errores con `@RestControllerAdvice` y `ProblemDetail` (RFC 9457) para devolver un formato consistente. La configuración por entorno se maneja con profiles, `application.yml` y `@ConfigurationProperties`.',
        'El diseño de APIs es el mismo que en cualquier backend: recursos, verbos, idempotencia, códigos correctos (201, 204, 400, 401, 403, 404, 409), paginación (`Pageable` en Spring Data, y cursores para volúmenes grandes), versionado y documentación con OpenAPI vía springdoc. Para senior, evolución de APIs públicas sin romper clientes.',
      ],
      checklist: [
        {
          text: 'Explicar inyección de dependencias e inyección por constructor',
          explanation:
            'Inversión de control significa que tus clases no crean sus dependencias con `new`, sino que el contenedor de Spring las crea y se las pasa; así podés cambiar implementaciones y testear con dobles. La inyección por constructor es la recomendada: los campos pueden ser `final`, las dependencias quedan explícitas, el objeto nunca está a medio construir y en tests lo instanciás con `new UserService(repoFake)` sin levantar Spring; si hay un solo constructor ni siquiera necesitás `@Autowired`. La inyección por campo esconde dependencias, impide `final` y obliga a usar reflexión en tests. Si hay varias implementaciones de una interfaz, elegís con `@Qualifier` o `@Primary`, o inyectás un `List<T>` con todas. Un constructor con diez dependencias es una señal de que la clase hace demasiado.',
        },
        {
          text: 'Explicar cómo funciona la autoconfiguración de Spring Boot',
          explanation:
            '`@SpringBootApplication` incluye `@EnableAutoConfiguration`, que carga las clases listadas en `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` de cada jar del classpath. Cada clase de autoconfiguración define beans protegidos por condiciones: `@ConditionalOnClass` (si la librería está), `@ConditionalOnProperty` (si una propiedad tiene cierto valor) y `@ConditionalOnMissingBean` (si vos no definiste uno). Por ejemplo, si HikariCP está en el classpath, hay propiedades `spring.datasource.*` y no declaraste un `DataSource`, Boot crea uno; si declarás el tuyo, el de Boot se retira. Los starters solo agregan dependencias que activan esas condiciones. Para ver qué se aplicó y por qué, arrancá con `--debug` (imprime el conditions evaluation report) o mirá `/actuator/conditions`; para desactivar una, usá `exclude`.',
        },
        {
          text: 'Explicar por qué `@Transactional` no aplica en una llamada interna',
          explanation:
            'Spring implementa `@Transactional` con un proxy que envuelve tu bean: cuando otro bean llama al método, la llamada pasa por el proxy, que abre la transacción, invoca al método real y hace commit o rollback. Si dentro de la misma clase hacés `this.guardar()`, la llamada va directo al objeto real y saltea el proxy, así que la anotación del método interno se ignora sin ningún error. Lo mismo pasa con `@Async`, `@Cacheable` y `@PreAuthorize`, y con métodos que el proxy no puede interceptar como los `private`. Soluciones: mover el método a otro bean (lo más limpio), usar `TransactionTemplate` para controlar la transacción programáticamente, o como último recurso inyectarse a sí mismo. La alternativa de AspectJ con weaving no tiene esta limitación, pero casi nadie la usa.',
        },
        {
          text: 'Armar un controller con validación y manejo global de errores',
          explanation:
            'El request es un `record` con anotaciones de Bean Validation (`@NotBlank`, `@Email`, `@Size`) y el controller lo recibe con `@Valid @RequestBody CreateUserRequest req`; si falla, Spring lanza `MethodArgumentNotValidException` antes de entrar a tu código. Para crear devolvés `ResponseEntity.created(uri).body(response)`, con 201 y header `Location`. Los errores se centralizan en una clase `@RestControllerAdvice` con métodos `@ExceptionHandler` que devuelven `ProblemDetail`: validación a 400 con el detalle por campo, tu `NotFoundException` a 404, conflictos a 409; podés extender `ResponseEntityExceptionHandler` o activar `spring.mvc.problemdetails.enabled` para cubrir las excepciones estándar de Spring. Así cada controller queda limpio y el formato de error es consistente. Errores comunes: try/catch en cada endpoint, devolver la entidad JPA en vez de un DTO, o filtrar stack traces al cliente.',
        },
        {
          text: 'Configurar perfiles y `@ConfigurationProperties` por entorno',
          explanation:
            'Tenés un `application.yml` base y archivos por perfil como `application-prod.yml`, que se activan con `SPRING_PROFILES_ACTIVE=prod`; las propiedades del perfil pisan las base, y las variables de entorno y argumentos de línea de comandos pisan a los archivos (con relaxed binding, `APP_PAYMENT_TIMEOUT` mapea a `app.payment.timeout`). Con `@ConfigurationProperties(prefix = "app.payment")` sobre un `record` agrupás la configuración en un objeto tipado, validable con `@Validated` y fácil de testear, mucho mejor que `@Value` desparramado con strings. Se registran con `@ConfigurationPropertiesScan` o `@EnableConfigurationProperties`. Los secretos no van en el yml commiteado: llegan por variables de entorno o un vault. Error común: usar perfiles para activar lógica de negocio distinta por entorno, cuando debería ser solo configuración.',
        },
        {
          text: 'Elegir el código de estado correcto en cada caso',
          explanation:
            '200 para una respuesta con cuerpo, 201 con header `Location` cuando un POST crea un recurso, 204 cuando no hay cuerpo (un DELETE o un PUT exitoso). 400 para un request mal formado o que no pasa validación (algunas APIs usan 422 para errores semánticos), 401 cuando no hay autenticación válida y 403 cuando el usuario está autenticado pero no tiene permiso. 404 si el recurso no existe (también para no revelar que existe algo ajeno), 409 para conflictos de estado como un duplicado o un fallo de locking optimista, y 429 cuando se excede un rate limit. 500 es un bug tuyo, 502 o 503 cuando falla o no está disponible una dependencia. Errores comunes: devolver 200 con `{ "error": ... }` en el cuerpo y confundir 401 con 403.',
        },
      ],
    },
    {
      id: 'bases-de-datos',
      title: 'JPA, SQL y transacciones',
      body: [
        'Sabé SQL a mano (`JOIN`, agregaciones, índices, `EXPLAIN`) y la pila de acceso a datos: JDBC como base, JPA como especificación, Hibernate como implementación y Spring Data JPA encima con repositorios. Conocé el ciclo de vida de una entidad (transient, managed, detached), el persistence context y el dirty checking que hace que un cambio se guarde sin llamar a `save`.',
        'Fetch `LAZY` contra `EAGER` y el N+1 son preguntas seguras. Lo recomendado es lazy por defecto y traer lo necesario con `JOIN FETCH`, `@EntityGraph` o proyecciones con DTOs. Sabé detectar el N+1 activando el log de SQL o con estadísticas de Hibernate, y explicar la `LazyInitializationException` y por qué `open-in-view` no es la solución.',
        '`@Transactional` es central: por defecto hace rollback solo con excepciones unchecked, la propagación default es `REQUIRED`, `REQUIRES_NEW` abre una transacción independiente y `readOnly` permite optimizaciones. Para senior, niveles de aislamiento y sus anomalías, y locking optimista con `@Version` contra pesimista con `@Lock`.',
        'En lo operativo: migraciones versionadas con Flyway o Liquibase (nunca `ddl-auto=update` en producción), connection pool con HikariCP y su tamaño (más grande no es mejor), y cuándo salir de JPA hacia `JdbcClient`, jOOQ o SQL nativo para consultas complejas o masivas.',
      ],
      checklist: [
        {
          text: 'Explicar la relación entre JDBC, JPA, Hibernate y Spring Data',
          explanation:
            'JDBC es la API de bajo nivel de Java para hablar con bases relacionales: `Connection`, `PreparedStatement`, `ResultSet`, con SQL escrito a mano. JPA (hoy Jakarta Persistence) es una especificación de ORM: define anotaciones como `@Entity`, el `EntityManager` y JPQL, pero no trae implementación. Hibernate es la implementación más usada de JPA: genera el SQL y lo ejecuta por JDBC, a través de un pool como HikariCP. Spring Data JPA va encima: declarás una interfaz que extiende `JpaRepository` y obtenés CRUD, paginación y queries derivadas del nombre como `findByEmail`, todo usando el `EntityManager` por debajo. Entender las capas te permite depurar: un problema de rendimiento casi siempre se ve en el SQL que Hibernate genera, no en el repositorio.',
        },
        {
          text: 'Detectar y resolver un N+1 con `JOIN FETCH` o `@EntityGraph`',
          explanation:
            'El N+1 pasa cuando traés N entidades con una consulta y después, al recorrerlas, cada acceso a una relación lazy dispara otra: 100 pedidos y `order.getCustomer().getName()` en un loop son 101 queries. Se detecta activando `logging.level.org.hibernate.SQL=debug`, con `hibernate.generate_statistics` o con un test que verifique la cantidad de queries. Se resuelve trayendo la relación en la misma consulta: `@Query("select o from Order o join fetch o.customer")` o `@EntityGraph(attributePaths = "customer")` sobre el método del repositorio; para listados, una proyección a DTO trae solo las columnas necesarias. Otra opción es `hibernate.default_batch_fetch_size`, que agrupa las cargas lazy en queries con `IN`. Cuidado: hacer fetch de colecciones con paginación hace que Hibernate pagine en memoria, y hacer fetch de dos colecciones `List` a la vez lanza `MultipleBagFetchException`; en esos casos conviene partir en dos queries.',
        },
        {
          text: 'Explicar propagación y rollback de `@Transactional`',
          explanation:
            'La propagación define qué pasa si ya hay una transacción en curso: `REQUIRED` (default) se une a la existente o crea una; `REQUIRES_NEW` suspende la actual y abre otra independiente, con su propia conexión del pool, útil para un log de auditoría que debe persistir aunque falle lo demás; `MANDATORY` exige que exista; `NESTED` usa un savepoint. Por defecto solo hace rollback con excepciones unchecked y `Error`: una checked como `IOException` hace commit, lo que sorprende a muchos; se cambia con `rollbackFor = Exception.class`. Trampa clásica: si un método interno con `REQUIRED` lanza una excepción y el externo la captura, la transacción ya quedó marcada rollback-only y el commit final falla con `UnexpectedRollbackException`. `readOnly = true` evita el dirty checking y puede enrutar a réplicas de lectura.',
        },
        {
          text: 'Comparar locking optimista con `@Version` y pesimista',
          explanation:
            'Con locking optimista agregás un campo `@Version` y Hibernate hace `UPDATE ... WHERE id = ? AND version = ?`; si otro modificó la fila antes, se actualizan 0 filas y salta `OptimisticLockException` (en Spring, `ObjectOptimisticLockingFailureException`), que traducís a 409 o reintentás. No bloquea nada, escala bien con poca contención y sirve entre requests si mandás la versión al cliente (por ejemplo como `ETag`). El pesimista usa `@Lock(LockModeType.PESSIMISTIC_WRITE)`, que genera `SELECT ... FOR UPDATE` y bloquea la fila hasta el commit: conviene con mucha contención sobre pocas filas (descontar stock, saldos), con transacciones cortas, y trae riesgo de deadlocks y esperas. Para un contador, muchas veces lo mejor es un update atómico: `UPDATE stock SET qty = qty - 1 WHERE id = ? AND qty > 0`.',
        },
        {
          text: 'Versionar el esquema con Flyway o Liquibase',
          explanation:
            'Cada cambio de esquema es un archivo versionado en el repo (en Flyway, `V3__add_email_to_users.sql`) que se aplica en orden al arrancar la app o en el pipeline; Flyway registra lo aplicado en `flyway_schema_history` con un checksum, así que nunca editás una migración ya aplicada: creás una nueva. Liquibase usa changelogs en XML, YAML o SQL y suma rollbacks y precondiciones. En producción, `spring.jpa.hibernate.ddl-auto` va en `validate` o `none`, nunca `update`. Para no cortar el servicio se usa expand and contract: agregás la columna nullable, desplegás código que escribe en ambas, hacés el backfill y recién en un release posterior la volvés obligatoria o borrás la vieja. Error común: dos ramas que crean la misma versión; se evita con timestamps en el nombre o rebaseando antes de mergear.',
        },
        {
          text: 'Explicar cómo dimensionar el pool de HikariCP',
          explanation:
            'Cada conexión es cara para la base (en Postgres es un proceso), y la base solo ejecuta en paralelo tanto como le permiten sus CPUs y discos, así que un pool chico suele rendir más que uno enorme. El default de Hikari es `maximumPoolSize=10` y su guía sugiere partir de algo como núcleos de la base por dos más los discos, y medir. Hacé la cuenta total: instancias por tamaño de pool tiene que quedar debajo de `max_connections` con margen; si escalás a muchas instancias, poné PgBouncer delante. Mirá las métricas `hikaricp.connections.pending` y el tiempo de adquisición, y bajá `connectionTimeout` (30 s por defecto) para fallar rápido. La causa más común de pool agotado no es el tamaño sino transacciones largas, por ejemplo llamar a una API externa dentro de un `@Transactional`; con virtual threads el problema se nota más porque miles de hilos compiten por las mismas conexiones.',
        },
      ],
    },
    {
      id: 'concurrencia',
      title: 'Concurrencia y virtual threads',
      body: [
        'Conocé las bases: `Thread`, `Runnable`, condiciones de carrera y cómo se protegen con `synchronized`, `volatile` (visibilidad, no atomicidad) y las clases atómicas como `AtomicInteger`. Las colecciones concurrentes (`ConcurrentHashMap`) y la inmutabilidad suelen ser mejores soluciones que sincronizar a mano.',
        'Para trabajo asincrónico, `ExecutorService` para manejar pools de hilos y `CompletableFuture` para componer tareas (`thenApply`, `thenCompose`, `allOf`) con manejo de errores. En Spring, `@Async` usa un executor que conviene configurar en vez de dejar el default.',
        'Los virtual threads (Java 21) cambian el panorama: son hilos livianos gestionados por la JVM, ideales para código bloqueante de I/O con el estilo simple de un thread por request, y Spring Boot los activa con `spring.threads.virtual.enabled`. No aceleran trabajo de CPU, no conviene ponerlos en un pool, y hay que cuidar los recursos limitados como conexiones a la base (el pool sigue siendo el límite). Sabé que el pinning con `synchronized` se resolvió en Java 24.',
        'Para senior: el Java Memory Model y la relación happens-before (qué garantiza que un hilo vea lo que escribió otro), y cuándo elegir Spring WebFlux. Con virtual threads, WebFlux pierde atractivo para la mayoría de los servicios; sigue teniendo sentido para streaming y backpressure de punta a punta, a cambio de un modelo de programación más difícil de leer y depurar.',
      ],
      checklist: [
        {
          text: 'Diferenciar `synchronized`, `volatile` y clases atómicas',
          explanation:
            '`synchronized` da exclusión mutua y visibilidad: solo un hilo entra al bloque por monitor y al salir sus escrituras quedan visibles para el próximo que entre. `volatile` solo garantiza visibilidad y orden de una variable, no atomicidad: sirve para un flag como `volatile boolean running`, pero `count++` sobre un `volatile` sigue siendo una condición de carrera porque es leer, sumar y escribir. Las clases atómicas (`AtomicInteger`, `AtomicReference`) hacen operaciones atómicas sobre una variable con compare-and-swap, sin locks: `counter.incrementAndGet()`; para contadores con mucha contención, `LongAdder` escala mejor. Si necesitás actualizar varias variables de forma consistente, ninguna atómica alcanza y necesitás un lock (`synchronized` o `ReentrantLock`). Muchas veces la mejor solución es evitar el estado compartido con inmutabilidad o `ConcurrentHashMap`.',
        },
        {
          text: 'Componer tareas con `CompletableFuture` y manejar errores',
          explanation:
            '`CompletableFuture.supplyAsync(() -> fetchUser(id), executor)` lanza una tarea; pasá siempre un executor propio, porque el default es el `ForkJoinPool.commonPool()` compartido. `thenApply` transforma el resultado, `thenCompose` encadena otra operación que también devuelve un future (como un flatMap), `thenCombine` junta dos, y `allOf(f1, f2).thenRun(...)` espera a varios (después leés cada uno con `join()`). Para errores: `exceptionally(ex -> fallback)` recupera, `handle((res, ex) -> ...)` ve ambos casos y `whenComplete` sirve para loguear sin cambiar el resultado; la excepción llega envuelta en `CompletionException`, así que mirá `getCause()`. Con `orTimeout` o `completeOnTimeout` evitás esperas infinitas. Errores comunes: llamar `join()` enseguida (lo que vuelve todo bloqueante) y no manejar la excepción, que queda silenciada dentro del future.',
        },
        {
          text: 'Explicar qué son los virtual threads y cuándo no ayudan',
          explanation:
            'Son hilos livianos que gestiona la JVM y se montan sobre unos pocos hilos de plataforma (carriers); cuando un virtual thread se bloquea en I/O, se desmonta y el carrier queda libre para otro. Eso permite tener cientos de miles de hilos y escribir código bloqueante simple, un hilo por request, con la escalabilidad del código asincrónico; se crean con `Executors.newVirtualThreadPerTaskExecutor()` o en Spring Boot con `spring.threads.virtual.enabled=true`. No ayudan con trabajo de CPU, porque no hay más núcleos; no se ponen en pools, porque son baratos de crear (para limitar concurrencia se usa un `Semaphore`); y no eliminan límites de abajo: si tu pool tiene 10 conexiones, 10.000 virtual threads hacen cola igual. Cuidado con `ThreadLocal` pesados, que se multiplican por cada hilo. El pinning por `synchronized` se resolvió en Java 24, pero llamadas nativas todavía pueden fijar el carrier.',
        },
        {
          text: 'Explicar happens-before con un ejemplo',
          explanation:
            'El Java Memory Model permite que el compilador y la CPU reordenen instrucciones y que cada núcleo vea valores en caché, así que sin sincronización un hilo puede no ver lo que escribió otro. Happens-before es la regla que garantiza visibilidad: si A happens-before B, B ve todo lo que A escribió. Las relaciones principales: el orden del programa dentro de un hilo, liberar un lock antes de que otro hilo tome ese mismo lock, escribir un `volatile` antes de que otro lo lea, `Thread.start()` antes de lo que hace el hilo y lo que hace un hilo antes de que `join()` retorne; además es transitiva. Ejemplo: el hilo A hace `data = 42; ready = true;` y el B hace `if (ready) print(data)`. Si `ready` es `volatile`, B ve 42; si no, B puede quedar en loop para siempre o ver `ready` en true con `data` en 0. Por eso el double-checked locking necesita `volatile`.',
        },
        {
          text: 'Comparar Spring MVC con virtual threads y WebFlux',
          explanation:
            'Spring MVC con virtual threads mantiene el modelo imperativo: código bloqueante, stack traces legibles, JDBC y JPA tal cual, y aun así escala a mucha concurrencia de I/O porque cada request bloqueada no ocupa un hilo de plataforma. WebFlux es reactivo con Reactor (`Mono`, `Flux`): no bloquea en ningún punto, maneja backpressure y brilla en streaming (SSE, WebSockets), gateways y proxies, pero exige drivers reactivos como R2DBC, cambia la forma de programar y depurar, y una sola llamada bloqueante en el event loop degrada todo el servicio. Hoy el default razonable para un servicio nuevo es MVC con virtual threads; WebFlux tiene sentido si necesitás streaming o backpressure de punta a punta, o si el equipo ya trabaja reactivo. Error común: elegir WebFlux por rendimiento y después llamar a JPA adentro.',
        },
      ],
    },
    {
      id: 'seguridad',
      title: 'Seguridad y Spring Security',
      body: [
        'Separá autenticación de autorización. Spring Security funciona como una cadena de filtros que se configura con un bean `SecurityFilterChain`: autentica la request, guarda el resultado en el `SecurityContext` y después aplica reglas de autorización por URL o por método con `@PreAuthorize`. Practicá contar ese flujo de punta a punta.',
        'Las contraseñas se guardan con un `PasswordEncoder` lento (BCrypt o Argon2). Para APIs, lo habitual es el modo resource server con JWT emitidos por un proveedor de identidad: Spring valida la firma y los claims, y vos mapeás roles y scopes. Sabé comparar sesiones con JWT y explicar access y refresh tokens y la dificultad de revocar.',
        'Riesgos que conviene nombrar: SQL injection con queries armadas concatenando strings (incluso en JPQL), broken access control al no verificar que el recurso pertenece al usuario, mass assignment al bindear entidades directo desde el request (usá DTOs), deserialización insegura y dependencias vulnerables (Log4Shell es el ejemplo que todos recuerdan). Usá OWASP Dependency-Check, Dependabot o Renovate.',
        'Para senior, autenticación entre varios servicios: OAuth 2.0 y OpenID Connect con un authorization server centralizado, propagación de tokens o client credentials entre servicios, mTLS en la red interna y secretos en un vault, no en `application.yml`.',
      ],
      checklist: [
        {
          text: 'Explicar la cadena de filtros de Spring Security',
          explanation:
            'Spring Security se engancha al contenedor de servlets con un filtro (`DelegatingFilterProxy`) que delega en `FilterChainProxy`, que a su vez elige qué `SecurityFilterChain` aplica según la URL. Cada cadena es una lista ordenada de filtros: CORS, CSRF, los de autenticación (por ejemplo `BearerTokenAuthenticationFilter` para JWT o el de formulario), `ExceptionTranslationFilter`, que convierte fallas en 401 o 403, y al final `AuthorizationFilter`, que aplica las reglas por URL. Si la autenticación funciona, el resultado (un `Authentication` con principal y authorities) queda en el `SecurityContextHolder`, que por defecto vive en un `ThreadLocal`, y de ahí lo leen las reglas por método. Desde Spring Security 6 se configura declarando un bean `SecurityFilterChain` con el DSL de lambdas de `HttpSecurity`; `WebSecurityConfigurerAdapter` ya no existe. Para depurar, `logging.level.org.springframework.security=TRACE` muestra cada filtro que pasa.',
        },
        {
          text: 'Configurar un resource server que valide JWT',
          explanation:
            'Agregás `spring-boot-starter-oauth2-resource-server`, configurás `spring.security.oauth2.resourceserver.jwt.issuer-uri` con la URL del proveedor de identidad (Keycloak, Auth0, Entra ID, Cognito) y en el `SecurityFilterChain` ponés `http.oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))`. Spring descarga las claves públicas (JWKS) y valida firma, emisor, `exp` y `nbf`; la audiencia conviene validarla también, con la propiedad `audiences` o un validador propio, para no aceptar tokens emitidos para otra API. Por defecto los scopes se mapean a authorities `SCOPE_xxx`; si tus roles vienen en otro claim, configurás un `JwtAuthenticationConverter`. La API queda stateless, así que podés desactivar CSRF y sesiones si solo usa bearer tokens. Error común: validar con una clave simétrica hardcodeada o no validar audiencia.',
        },
        {
          text: 'Usar `@PreAuthorize` para reglas por método',
          explanation:
            'Activás la seguridad por método con `@EnableMethodSecurity` y anotás servicios o controllers: `@PreAuthorize("hasRole(\'ADMIN\')")`, `@PreAuthorize("hasAuthority(\'SCOPE_orders:write\')")` o reglas con parámetros en SpEL como `@PreAuthorize("#userId == authentication.name")`. Para lógica más compleja, delegás en un bean: `@PreAuthorize("@orderAuth.isOwner(#orderId, authentication)")`, que es la forma prolija de evitar broken access control (que un usuario acceda a recursos ajenos cambiando un id). `hasRole(\'ADMIN\')` busca la authority `ROLE_ADMIN`, porque agrega el prefijo. Como funciona con proxies, tiene la misma limitación que `@Transactional`: no aplica en llamadas internas de la misma clase. `@PostAuthorize` permite decidir según el objeto devuelto.',
        },
        {
          text: 'Explicar por qué usar DTOs en lugar de bindear entidades',
          explanation:
            'Si el controller recibe la entidad JPA directamente, el cliente puede mandar campos que no debería tocar, como `role`, `id` o `balance`, y terminan persistidos: eso es mass assignment. Al devolver entidades exponés campos internos (el hash de la contraseña), disparás cargas lazy fuera de la transacción o recursión infinita con relaciones bidireccionales, y atás el contrato de la API al esquema de la base, así que cualquier cambio de modelo rompe clientes. Con DTOs, típicamente `record`s distintos para request y response, definís exactamente qué entra y qué sale, validás en el borde con Bean Validation y versionás la API independientemente del modelo. El mapeo puede ser a mano o con MapStruct, que genera el código en compilación. El costo es algo de código extra, que vale la pena.',
        },
        {
          text: 'Diseñar autenticación entre servicios con OAuth 2.0',
          explanation:
            'Para llamadas servicio a servicio sin usuario se usa el grant client credentials: el servicio A se autentica ante el authorization server (Keycloak, Okta, Entra ID) con su client id y un secreto o, mejor, con `private_key_jwt`, obtiene un access token con scopes acotados y lo manda como bearer; el servicio B lo valida como resource server, chequeando audiencia y scopes. En Spring se configura con `spring-boot-starter-oauth2-client` y un `OAuth2AuthorizedClientManager` que obtiene y cachea el token hasta que vence, conectado al `RestClient` con un interceptor. Si necesitás propagar la identidad del usuario, usás token exchange (RFC 8693) en vez de reenviar el token original a cualquier servicio. Se complementa con mTLS en la red interna (muchas veces lo da un service mesh) y con secretos en un vault. Error común: una API key estática compartida por todos los servicios.',
        },
        {
          text: 'Explicar cómo manejar dependencias vulnerables',
          explanation:
            'La mayor parte del código que corrés son dependencias transitivas, y Log4Shell (2021) mostró que una librería de logging puede abrir una ejecución remota. Hacen falta herramientas de SCA en el pipeline: OWASP Dependency-Check, Snyk, Dependabot o Renovate, que avisan y abren PRs con las versiones corregidas; también conviene generar un SBOM con CycloneDX. Mantener Spring Boot en el último patch resuelve la mayoría, porque el BOM sube las versiones transitivas; para algo urgente podés pisar una sola versión con su propiedad (por ejemplo `<jackson-bom.version>`) o con `dependencyManagement`. Evaluá si la vulnerabilidad es explotable en tu uso además del puntaje CVSS. Lo que hace viable actualizar seguido es tener buenos tests: sin ellos nadie se anima a subir versiones.',
        },
      ],
    },
    {
      id: 'testing',
      title: 'Testing en Spring Boot',
      body: [
        'La base es JUnit 5 con AssertJ y Mockito: tests unitarios de servicios con dependencias mockeadas, sin levantar Spring. Si inyectás por constructor, testear sin el framework es trivial, y eso es un argumento a favor que conviene mencionar.',
        'Spring Boot ofrece test slices para levantar solo una parte: `@WebMvcTest` para controllers con `MockMvc`, `@DataJpaTest` para repositorios, y `@SpringBootTest` para el contexto completo. Para reemplazar beans en tests se usa `@MockitoBean` (que reemplazó a `@MockBean`). Saber cuándo usar cada uno y por qué un `@SpringBootTest` en todos lados vuelve lenta la suite es lo que buscan.',
        'Para integración real, Testcontainers con Postgres, Kafka o Redis en Docker, integrado con Spring Boot con `@ServiceConnection`. Evitá H2 si en producción usás Postgres: las diferencias de dialecto esconden bugs. Cuidá el aislamiento entre tests y reutilizá el contexto de Spring para que la suite no tarde minutos de más.',
        'Para senior, la estrategia entre varios servicios: contract testing con Spring Cloud Contract o Pact, tests de arquitectura con ArchUnit para cuidar dependencias entre capas, y qué corre en cada etapa del pipeline.',
      ],
      checklist: [
        {
          text: 'Escribir un test unitario con JUnit 5 y Mockito',
          explanation:
            'Anotás la clase con `@ExtendWith(MockitoExtension.class)`, declarás `@Mock UserRepository repo` y creás el servicio a mano con `new UserService(repo)` (o con `@InjectMocks`). Organizás el test en arrange, act y assert: `when(repo.findById(1L)).thenReturn(Optional.of(user));`, llamás al método, verificás con AssertJ (`assertThat(result.name()).isEqualTo("Ana")`) y, si importa el efecto, `verify(repo).save(any())`; los errores se prueban con `assertThrows`. `@ParameterizedTest` con `@CsvSource` cubre varios casos sin duplicar. Testeá comportamiento observable, no la implementación paso a paso, y no mockees value objects ni todo lo que existe: si el test tiene más setup de mocks que lógica, probablemente estás testeando la implementación. No hace falta Spring para esto, y eso lo hace rápido.',
        },
        {
          text: 'Elegir entre `@WebMvcTest`, `@DataJpaTest` y `@SpringBootTest`',
          explanation:
            '`@WebMvcTest(UserController.class)` levanta solo la capa web (controllers, advice, filtros, conversión JSON) y te da `MockMvc`; los servicios los reemplazás con `@MockitoBean`. Sirve para probar rutas, validación, serialización y códigos de error. `@DataJpaTest` levanta solo JPA, repositorios y el `DataSource`, con cada test en una transacción que hace rollback; por defecto intenta usar una base embebida, así que con Testcontainers agregás `@AutoConfigureTestDatabase(replace = NONE)`. `@SpringBootTest` levanta el contexto completo, y con `webEnvironment = RANDOM_PORT` un servidor real: es para tests de integración de punta a punta. Spring cachea el contexto entre tests con la misma configuración; cada combinación distinta de `@MockitoBean` crea un contexto nuevo, y por eso una suite con `@SpringBootTest` en todos lados se vuelve lenta.',
        },
        {
          text: 'Testear un controller con `MockMvc`',
          explanation:
            '`MockMvc` ejecuta el request por todo el stack de Spring MVC (filtros, binding, validación, advice, serialización) sin abrir un puerto. Ejemplo: `mockMvc.perform(post("/users").contentType(MediaType.APPLICATION_JSON).content("{\\"email\\":\\"ana@x.com\\"}")).andExpect(status().isCreated()).andExpect(jsonPath("$.email").value("ana@x.com"));`. Probá también los caminos de error: un body inválido devuelve 400 con el `ProblemDetail` esperado, un id inexistente 404. Para seguridad, `@WithMockUser(roles = "ADMIN")` o el post processor `jwt()` de `spring-security-test` simulan el usuario. Desde Spring Framework 6.2 existe `MockMvcTester`, con assertions estilo AssertJ más legibles. Error común: testear lógica de negocio acá; eso va en tests unitarios del servicio.',
        },
        {
          text: 'Usar Testcontainers para tests de integración',
          explanation:
            'Testcontainers levanta contenedores Docker reales (Postgres, Kafka, Redis) durante los tests, así probás contra la misma tecnología que producción. Con Spring Boot 3.1 o superior, declarás `@Container @ServiceConnection static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17");` en una clase con `@Testcontainers`, y Boot configura el `DataSource` solo, sin `@DynamicPropertySource`. Como el contenedor es `static`, se comparte entre los tests de la clase; para compartirlo entre toda la suite, usá una configuración de test común o un contenedor singleton, así el contexto de Spring también se reutiliza. Las migraciones de Flyway corren igual que en producción. Necesitás Docker en la máquina y en CI, y aislar datos entre tests (rollback, limpiar tablas o datos únicos por test).',
        },
        {
          text: 'Explicar por qué evitar H2 si producción usa Postgres',
          explanation:
            'H2 es otra base de datos: tiene otro dialecto SQL y le faltan o cambian cosas que en Postgres usás seguido, como `jsonb`, arrays, `ON CONFLICT`, índices parciales, funciones específicas, secuencias y el comportamiento exacto de locking y aislamiento. Además tus migraciones de Flyway, si están escritas para Postgres, no corren en H2, y terminás manteniendo scripts duplicados o desactivando migraciones en tests. El resultado es una suite verde que no prueba lo que corre en producción: queries que fallan recién al desplegar, o bugs de concurrencia que H2 no reproduce. Con Testcontainers, usar el Postgres real cuesta unos segundos de arranque, que es barato frente a esa falsa confianza.',
        },
        {
          text: 'Proponer una estrategia de testing para varios servicios',
          explanation:
            'Por servicio: muchos tests unitarios del dominio, que son rápidos; tests de slices para controllers y repositorios; y algunos tests de integración con Testcontainers que prueben el servicio con su base y su broker reales. Entre servicios, en vez de un entorno compartido con todo levantado, contract testing con Pact o Spring Cloud Contract: el consumidor define qué espera y el proveedor verifica en su pipeline que no lo rompe. Sumá tests de arquitectura con ArchUnit para que nadie viole las dependencias entre capas o módulos, y unos pocos tests end to end en staging sobre los flujos críticos (login, compra). Contá qué corre en cada etapa: unitarios y slices en cada push, integración y contratos antes de mergear, e2e después de desplegar. Mencioná también cómo tratás los tests flaky: se arreglan o se borran, no se ignoran.',
        },
      ],
    },
    {
      id: 'arquitectura-produccion',
      title: 'Arquitectura, escala y producción',
      body: [
        'Para aplicaciones grandes, organizá por módulos de negocio con límites claros (Spring Modulith ayuda a verificarlos), dominio separado de la infraestructura y DTOs en los bordes. Monolito modular por defecto y microservicios cuando hay razones concretas. Para modernizar un legacy, el patrón strangler fig: extraer funcionalidades de a poco detrás de una fachada, con tests que fijen el comportamiento antes de tocar.',
        'Entre servicios, la resiliencia se arma con timeouts, retries con backoff solo en operaciones idempotentes, circuit breaker y bulkheads, típicamente con Resilience4j. Para consistencia, sagas y el patrón outbox en lugar de transacciones distribuidas. Kafka aparece seguido: sabé explicar topics, particiones, consumer groups, que el orden se garantiza solo dentro de una partición y que at-least-once obliga a consumidores idempotentes.',
        'Diagnóstico en producción: para memoria, heap dumps analizados con Eclipse MAT; para CPU, thread dumps y JDK Flight Recorder; para latencia, trazas y métricas antes que adivinar. Elegir el GC depende del objetivo: G1 como default equilibrado, ZGC para pausas mínimas con heaps grandes. Para un endpoint lento, el orden es medir, encontrar si es base, red o CPU, y recién ahí optimizar.',
        'Observabilidad con Actuator, Micrometer y OpenTelemetry: métricas, health checks, trazas y logs estructurados con trace ID. En contenedores, la JVM respeta los límites de memoria y CPU, pero conviene configurar `MaxRAMPercentage`, usar imágenes livianas, construir con Buildpacks o Jib, y conocer GraalVM native image y CRaC para arranques rápidos con sus trade-offs. Mantené Java y dependencias al día con el BOM de Spring Boot y Renovate.',
      ],
      checklist: [
        {
          text: 'Proponer la estructura de una aplicación Spring grande',
          explanation:
            'Organizá por funcionalidad de negocio (`orders`, `billing`, `catalog`) en lugar de por capa técnica (`controllers`, `services`), así cada módulo es cohesivo y podés usar visibilidad package-private para esconder sus internos. Un monolito modular es el punto de partida razonable: Spring Modulith verifica que los módulos solo se usen por su API pública y facilita comunicarlos con eventos, lo que además deja preparada una futura extracción a microservicios. Dentro de un módulo complejo, separá el dominio (sin anotaciones de framework si es posible) de la infraestructura, al estilo hexagonal, con DTOs en los bordes; para módulos CRUD simples eso es sobreingeniería. ArchUnit o los tests de Modulith fijan las reglas para que no se degraden con el tiempo. Defendé la elección por el tamaño del equipo y la complejidad del dominio, no por moda.',
        },
        {
          text: 'Aplicar timeouts, retries y circuit breaker con Resilience4j',
          explanation:
            'Primero timeouts: toda llamada remota necesita timeout de conexión y de lectura, porque sin ellos un servicio lento te agota hilos y conexiones. Los retries solo van en operaciones idempotentes (o con una idempotency key), con pocos intentos y backoff exponencial con jitter, para no generar una tormenta de reintentos. El circuit breaker mide la tasa de fallas en una ventana deslizante y, al superar el umbral, se abre y rechaza llamadas de inmediato durante un tiempo, después pasa a half-open y prueba unas pocas antes de cerrarse; así protegés al servicio caído y a vos mismo. En Spring Boot se usan anotaciones como `@CircuitBreaker(name = "payments", fallbackMethod = "fallback")` y `@Retry(name = "payments")`, configuradas en `application.yml`, y se combinan con bulkheads para limitar concurrencia. Error común: retries en varias capas a la vez, que multiplican la carga sobre un servicio que ya está mal.',
        },
        {
          text: 'Explicar particiones, consumer groups y garantías de Kafka',
          explanation:
            'Un topic se divide en particiones, que son logs ordenados y replicados; el orden se garantiza solo dentro de una partición, y la key del mensaje decide a cuál va, así que todos los eventos de un mismo `orderId` quedan en orden si los publicás con esa key. En un consumer group, cada partición la consume un solo consumidor del grupo, por lo que el paralelismo máximo es la cantidad de particiones: consumidores de más quedan ociosos. El consumidor guarda su posición con offsets; si commitea después de procesar, tenés at-least-once, lo que obliga a consumidores idempotentes porque puede haber duplicados tras un rebalanceo o un crash. El productor idempotente (activo por defecto en clientes recientes) evita duplicados al reintentar, y las transacciones de Kafka dan exactly-once dentro de Kafka (leer, procesar y escribir), no hacia tu base. Para durabilidad, `acks=all` con `min.insync.replicas=2`; para errores, reintentos y un dead letter topic con el `DefaultErrorHandler` de Spring Kafka.',
        },
        {
          text: 'Diagnosticar una fuga de memoria o CPU alta en la JVM',
          explanation:
            'Fuga de memoria: el síntoma es que el heap usado después de cada GC completo sigue subiendo hasta un `OutOfMemoryError`. Corré con `-XX:+HeapDumpOnOutOfMemoryError`, o sacá un dump en caliente con `jcmd <pid> GC.heap_dump`, y analizalo con Eclipse MAT: el dominator tree y el reporte de leak suspects muestran qué objetos retienen más memoria y quién los referencia; los culpables típicos son caches sin límite, colecciones `static`, `ThreadLocal` no limpiados y listeners no removidos. CPU alta: tomá varios thread dumps con `jcmd <pid> Thread.print` separados por segundos y buscá los hilos que siempre están en el mismo código, o mejor perfilá con JDK Flight Recorder (`jcmd <pid> JFR.start`) o async-profiler y mirá el flame graph. Revisá los logs de GC (`-Xlog:gc*`): mucha CPU puede ser el GC peleando con un heap casi lleno. Si el proceso crece pero el heap no, es memoria nativa y se investiga con Native Memory Tracking.',
        },
        {
          text: 'Configurar observabilidad con Actuator, Micrometer y OpenTelemetry',
          explanation:
            'Actuator expone endpoints operativos: `/actuator/health` con grupos de liveness y readiness para Kubernetes, `/actuator/metrics` y `/actuator/prometheus` si agregás ese registry. Micrometer es la fachada de métricas (como SLF4J para logs) y su Observation API instrumenta una vez y genera métricas y trazas; Spring ya instrumenta requests HTTP, `RestClient`, JDBC y Kafka. Las trazas se exportan a OpenTelemetry por OTLP (con Micrometer Tracing o el starter de OpenTelemetry de Spring Boot 4) hacia un collector y de ahí a Grafana, Jaeger o un proveedor. Los logs van estructurados en JSON (Boot 3.4 lo trae con `logging.structured.format.console`) y con trace ID, para saltar de un log a su traza. Errores comunes: exponer Actuator a internet sin protección y usar tags de alta cardinalidad (como el id de usuario) en métricas, que explotan el almacenamiento.',
        },
        {
          text: 'Explicar qué tener en cuenta al correr la JVM en contenedores',
          explanation:
            'La JVM moderna lee los límites del contenedor (cgroups), pero por defecto usa solo el 25 % de la memoria para el heap; lo habitual es fijar `-XX:MaxRAMPercentage=75` en vez de un `-Xmx` fijo, dejando lugar para metaspace, stacks de hilos, buffers directos y el code cache. Si el contenedor pasa su límite, el kernel lo mata (OOMKilled, exit 137) sin ningún `OutOfMemoryError` en los logs, que es una pista para diagnosticar. Con menos de 2 CPUs o poca memoria la JVM elige SerialGC; si querés G1, asigná más CPU o forzalo. Para la imagen, usá una base con solo el JRE, usuario no root y capas separadas (Buildpacks o Jib lo hacen). El arranque se acelera con CDS y el AOT cache de Java 24 y 25, o con GraalVM native image (arranque en milisegundos pero sin JIT y con límites en reflexión) y CRaC. Activá el graceful shutdown para no cortar requests en curso al reiniciar pods.',
        },
        {
          text: 'Planificar la migración gradual de un monolito legacy',
          explanation:
            'Evitá el big bang: se usa el patrón strangler fig. Primero fijá el comportamiento actual con tests de caracterización y poné una fachada (un gateway o proxy) delante del monolito. Después elegí la primera funcionalidad a extraer: algo con pocos acoplamientos y valor claro, siguiendo los límites del dominio; la implementás en el nuevo servicio o módulo y redirigís su tráfico de a poco, con feature flags y la posibilidad de volver atrás. Lo más difícil son los datos: cada parte nueva debe ser dueña de sus tablas, sincronizando mientras tanto con eventos o CDC (Debezium), y nunca con dos sistemas escribiendo las mismas tablas. En paralelo conviene modernizar la base técnica, por ejemplo de Java 8 a 21 y de `javax` a `jakarta`, con recetas automáticas de OpenRewrite. Medí y comunicá el avance por funcionalidad migrada, no por porcentaje de código reescrito.',
        },
      ],
    },
    {
      id: 'ejercicios',
      title: 'Live coding, take-home y system design',
      body: [
        'En Java es común un ejercicio de algoritmos (colecciones, ordenamiento, mapas, recursión) o de modelado orientado a objetos: diseñar las clases de un estacionamiento, un carrito o una biblioteca. Practicá escribir Java sin el IDE completándote todo, porque a veces el editor compartido es básico. Pensá en voz alta, definí casos borde y elegí bien las estructuras de datos.',
        'El take-home suele ser una API con Spring Boot: cuidá la estructura por capas o módulos, DTOs, validación, manejo global de errores, migraciones, tests de unidad e integración con Testcontainers y un `README` con cómo correrlo con `docker compose up`. Documentá decisiones y lo que harías con más tiempo. Si usaste IA, entendé y podé defender cada línea.',
        'En system design seguí un orden: requisitos, estimación de volumen, API, modelo de datos, diseño de alto nivel y profundizar en cuellos de botella. En Java los entrevistadores suelen ir a fondo en mensajería, transacciones, consistencia y resiliencia, así que prepará cómo usarías Kafka, outbox y circuit breakers en un diseño concreto.',
      ],
      checklist: [
        {
          text: 'Resolver un ejercicio de colecciones sin depender del IDE',
          explanation:
            'Practicá en un editor sin autocompletado (o en CoderPad) hasta saber de memoria la API que más se usa: `map.getOrDefault`, `map.merge(word, 1, Integer::sum)` para contar frecuencias, `computeIfAbsent(key, k -> new ArrayList<>()).add(x)` para agrupar, `List.of` (inmutable), `Collections.sort` y `list.sort(Comparator.comparing(Person::age).thenComparing(Person::name))`, `ArrayDeque` como pila o cola (no la vieja clase `Stack`), `PriorityQueue` para top k, y `Collectors.groupingBy` y `counting` en streams. Sabé la complejidad de cada operación: `contains` es O(n) en una lista y O(1) promedio en un `HashSet`. Error común: remover elementos dentro de un for-each, que lanza `ConcurrentModificationException`; usá `removeIf` o un `Iterator`. Antes de codear, decí qué estructura elegís y por qué.',
        },
        {
          text: 'Modelar un problema con clases, interfaces y responsabilidades claras',
          explanation:
            'Empezá por los requisitos y los sustantivos del problema (un estacionamiento: lugar, vehículo, ticket, tarifa), y asigná a cada clase una responsabilidad. Usá una interfaz donde el comportamiento varía, por ejemplo `PricingPolicy` con implementaciones por hora o tarifa plana, para agregar casos sin tocar el código existente; preferí composición a herencia. Encapsulá el estado y protegé invariantes con métodos con intención (`ticket.close(exitTime)`) en vez de setters públicos, y usá `record` para value objects como `Money`. Pensá en voz alta qué dejás afuera y por qué, y no inventes abstracciones que el problema no pide. Error común: una clase `Manager` que hace todo con datos en clases anémicas, o jerarquías de herencia profundas.',
        },
        {
          text: 'Entregar una API Spring Boot con tests, migraciones y `README`',
          explanation:
            'Antes de entregar, repasá esta lista: estructura por capas o módulos coherente, DTOs con Bean Validation, errores centralizados con `ProblemDetail` y códigos correctos, migraciones de Flyway (nada de `ddl-auto=update`), tests unitarios y de integración con Testcontainers que pasen con un solo comando, y un `docker compose up` que levante todo. El `README` tiene que explicar cómo correrlo y testearlo, las decisiones y trade-offs, qué supuestos tomaste y qué harías con más tiempo. Hacé commits chicos con mensajes claros, sin secretos ni archivos generados, y con versiones fijas (wrapper de Maven o Gradle). Error común: sobreingeniería (microservicios, Kafka) para un CRUD, o pulir features y dejar sin tests lo central.',
        },
        {
          text: 'Seguir un orden fijo para un ejercicio de system design',
          explanation:
            'Usá siempre el mismo orden para no perderte: requisitos funcionales y no funcionales (unos cinco minutos de preguntas: usuarios, latencia, consistencia, disponibilidad), estimación de volumen (requests por segundo, almacenamiento, picos), API principal, modelo de datos y elección de base, diagrama de alto nivel, y después profundizar en los cuellos de botella: caché, colas, particionado, réplicas. Cerrá con fallas (qué pasa si cae cada componente), observabilidad y trade-offs de lo que elegiste. Dejá que el entrevistador te lleve a donde quiere profundizar, pero volvé al orden si te perdés. Practicalo con dos o tres problemas clásicos (acortador de URLs, sistema de pedidos, notificaciones) con reloj, en voz alta y dibujando.',
        },
        {
          text: 'Integrar mensajería y resiliencia en un diseño concreto',
          explanation:
            'Tomá un caso como un sistema de pedidos: el servicio de órdenes guarda la orden y un registro en una tabla outbox dentro de la misma transacción, y un relay (Debezium o un poller) publica ese evento en Kafka, así nunca queda la orden sin evento ni el evento sin orden. Pagos e inventario consumen con la key `orderId` para mantener el orden, son idempotentes (guardan los ids de mensajes procesados o usan claves únicas), reintentan con backoff y mandan lo que no pueden procesar a un dead letter topic. Si falla un paso, una saga dispara compensaciones (liberar stock, cancelar la orden) en lugar de una transacción distribuida. Las llamadas sincrónicas que queden, como consultar el precio, llevan timeout, circuit breaker y un fallback. En la entrevista recorré qué pasa cuando cae cada pieza: eso es lo que evalúan.',
        },
      ],
    },
    {
      id: 'dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta y aclará el alcance antes de resolver: qué volumen, qué consistencia, qué pasa ante errores. Si no sabés algo, decilo y contá cómo lo investigarías o qué sabés de algo relacionado; inventar se nota y resta mucho.',
        'Para preguntas de comportamiento usá STAR: situación, tarea, acción y resultado, contando lo que hiciste vos y con un resultado concreto. Prepará historias sobre un incidente en producción, un desacuerdo técnico, un error propio y una mejora que impulsaste.',
        'Llevá preguntas para la empresa: en qué versión de Java y Spring están y cómo actualizan, cómo despliegan, cómo manejan guardias e incidentes, cuánto código legacy hay y cómo se toman las decisiones de arquitectura.',
        'Checklist final: probá cámara, micrófono y el editor; tené tu proyecto listo; repasá el stack de la búsqueda; dormí bien. Después anotá lo que no supiste y estudialo para la próxima.',
      ],
      checklist: [
        {
          text: 'Pensar en voz alta y aclarar el alcance antes de resolver',
          explanation:
            'Antes de escribir código, reformulá el problema con tus palabras y preguntá lo que falta: tamaño de la entrada, casos borde (vacío, nulos, duplicados), qué devolver ante errores, y en diseño, volumen y consistencia esperada. Después proponé una solución simple, aunque sea fuerza bruta, con su complejidad, y mejorala; mientras codeás, narrá qué hacés y por qué ("uso un `HashMap` para tener búsqueda en O(1)"). Al final probá el código a mano con un ejemplo y un caso borde. El entrevistador evalúa tu proceso tanto como el resultado, y si estás en silencio no puede darte pistas. Se entrena con mock interviews o grabándote resolviendo un ejercicio.',
        },
        {
          text: 'Admitir lo que no sabés y explicar cómo lo averiguarías',
          explanation:
            'Decilo de frente y aportá lo que sí sabés: "No lo usé en producción, pero entiendo que funciona así, y lo confirmaría en la documentación de Spring o con un test chico". Razonar desde principios vale mucho: si no recordás un detalle de `HashMap` o del GC, explicá qué esperarías y por qué. Contá cómo lo investigarías: documentación oficial, el código fuente (en Java es muy accesible desde el IDE), un experimento mínimo, métricas o un profiler. Inventar una respuesta se detecta enseguida y resta más que un "no sé", porque pone en duda todo lo demás que dijiste.',
        },
        {
          text: 'Tener tres o cuatro historias preparadas con formato STAR',
          explanation:
            'STAR es Situación (contexto breve), Tarea (qué te tocaba resolver), Acción (qué hiciste vos, en primera persona y con detalle técnico) y Resultado (medible si se puede, más lo que aprendiste). Prepará historias que cubran las preguntas típicas: un conflicto con un compañero o con producto, un error tuyo o un incidente en producción, una decisión técnica difícil con trade-offs, y una situación de liderazgo o mentoría. Escribilas, ensayalas en voz alta hasta que duren dos minutos y adaptalas a cada pregunta, porque una buena historia sirve para varias. Error común: dedicar casi todo el tiempo a la situación y pasar rápido por la acción, que es lo que evalúan.',
        },
        {
          text: 'Llevar al menos tres preguntas para la empresa',
          explanation:
            'Prepará preguntas que te sirvan para decidir y muestren interés real: sobre el equipo y el proceso (cómo despliegan, cada cuánto, cómo es el code review, si hay guardias), sobre la tecnología (qué versiones de Java y Spring usan, monolito o microservicios, cómo manejan la deuda técnica y las actualizaciones) y sobre el crecimiento (qué se espera de vos en los primeros seis meses, cómo se evalúa el desempeño). Adaptalas al entrevistador: a un técnico, preguntas técnicas; a liderazgo, prioridades y desafíos del equipo. Evitá preguntar lo que está en la web de la empresa, y dejá salario y beneficios para la charla con recruiting.',
        },
        {
          text: 'Probar el entorno técnico antes de empezar',
          explanation:
            'Media hora antes revisá cámara, micrófono, conexión y que puedas compartir pantalla en la plataforma que usen (Meet, Zoom, Teams), con la app instalada y permisos dados. Si vas a usar tu IDE, tené el JDK correcto, un proyecto Spring Boot que compile y las dependencias de Maven o Gradle ya descargadas, porque bajarlas en vivo puede tardar minutos. Si es en CoderPad o HackerRank, probá antes su editor y cómo se ejecutan los tests. Cerrá notificaciones y pestañas con información privada, y tené un plan B: datos del celular como hotspot y el teléfono del entrevistador a mano.',
        },
      ],
    },
  ],
};
