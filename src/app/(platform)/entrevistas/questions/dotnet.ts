import type { InterviewQuestion, Seniority } from './types';

export const dotnetQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'c#',
      question: '¿Qué diferencia hay entre un tipo por valor y un tipo por referencia en C#?',
      answer:
        'Los tipos por valor (`int`, `bool`, `struct`, `enum`) guardan el dato directamente y al asignarlos se copian. Los tipos por referencia (`class`, `string`, arrays, `interface`) guardan una referencia a un objeto en el heap, así que dos variables pueden apuntar al mismo objeto. `string` es por referencia pero inmutable, por eso se comporta parecido a un valor.',
    },
    {
      topic: 'c#',
      question: '¿Qué diferencia hay entre una `class` y un `struct`?',
      answer:
        'Una `class` es un tipo por referencia, soporta herencia y puede ser `null`. Un `struct` es un tipo por valor, se copia al asignarse y no soporta herencia (sí interfaces). Los `struct` convienen para datos chicos e inmutables, como coordenadas, porque evitan asignaciones en el heap.',
    },
    {
      topic: 'c#',
      question: '¿Qué es una interfaz y para qué se usa?',
      answer:
        'Es un contrato que define miembros que una clase o struct debe implementar, sin decir cómo. Permite programar contra abstracciones, intercambiar implementaciones y facilita la inyección de dependencias y el testing con mocks. Una clase puede implementar varias interfaces pero heredar de una sola clase.',
    },
    {
      topic: 'linq',
      question: '¿Qué es LINQ y qué significa que sea de ejecución diferida?',
      answer:
        'LINQ es un conjunto de métodos (`Where`, `Select`, `OrderBy`, etc.) para consultar colecciones y otras fuentes con una sintaxis uniforme. La ejecución diferida significa que la query no se ejecuta al definirla sino al enumerarla (`foreach`, `ToList()`, `Count()`). Si enumerás dos veces, se ejecuta dos veces.',
    },
    {
      topic: 'async',
      question: '¿Para qué sirven `async` y `await`?',
      answer:
        'Permiten escribir código asíncrono de forma secuencial. Un método `async` devuelve `Task` o `Task<T>`, y `await` libera el hilo mientras espera una operación de I/O, retomando cuando termina. En un servidor esto permite atender más requests con los mismos hilos.',
    },
    {
      topic: 'c#',
      question: '¿Qué es `IDisposable` y para qué sirve el bloque `using`?',
      answer:
        '`IDisposable` define el método `Dispose()` para liberar recursos no administrados como conexiones, archivos o sockets. El bloque o la declaración `using` llama a `Dispose()` automáticamente al salir del scope, incluso si hay una excepción. El garbage collector no libera esos recursos a tiempo por sí solo.',
    },
    {
      topic: 'c#',
      question: '¿Qué son los generics y qué ventajas tienen?',
      answer:
        'Permiten escribir clases y métodos parametrizados por tipo, como `List<T>` o `Dictionary<TKey, TValue>`. Dan seguridad de tipos en compilación, evitan casteos y, con tipos por valor, evitan el boxing. Se pueden restringir con constraints como `where T : class` o `where T : IComparable<T>`.',
    },
    {
      topic: 'c#',
      question: '¿Qué son los nullable reference types?',
      answer:
        'Una característica del compilador que distingue entre `string` (no debería ser null) y `string?` (puede ser null). Con `<Nullable>enable</Nullable>` el compilador avisa cuando podrías desreferenciar un null. No cambia el runtime: son advertencias estáticas que ayudan a evitar `NullReferenceException`.',
    },
    {
      topic: 'errores',
      question: '¿Cómo funcionan las excepciones en C#?',
      answer:
        'Se lanzan con `throw` y se capturan con `try`/`catch`, y `finally` corre siempre. Conviene capturar excepciones específicas y no tragarlas sin loguear. Para relanzar se usa `throw;` y no `throw ex;`, porque este último pierde el stack trace original.',
    },
    {
      topic: 'asp.net core',
      question: '¿Qué es ASP.NET Core?',
      answer:
        'Es el framework de .NET para construir APIs y aplicaciones web. Es multiplataforma, open source y de alto rendimiento, con servidor Kestrel integrado. Trae inyección de dependencias, configuración, logging y un pipeline de middleware de fábrica.',
    },
    {
      topic: 'asp.net core',
      question: '¿Qué es un controller y cómo se mapea una ruta?',
      answer:
        'Un controller es una clase que agrupa endpoints relacionados, normalmente heredando de `ControllerBase` con el atributo `[ApiController]`. Las rutas se definen con atributos como `[Route("api/users")]` y `[HttpGet("{id}")]`. Cada acción recibe parámetros por ruta, query o body y devuelve un `IActionResult` o un tipo concreto.',
    },
    {
      topic: 'inyección de dependencias',
      question: '¿Qué es la inyección de dependencias?',
      answer:
        'Es un patrón donde una clase recibe sus dependencias desde afuera, normalmente por el constructor, en lugar de crearlas ella. En ASP.NET Core se registran servicios en el contenedor (`builder.Services.AddScoped<IUserService, UserService>()`) y el framework los inyecta. Reduce acoplamiento y facilita testear con mocks.',
    },
    {
      topic: 'ef core',
      question: '¿Qué es Entity Framework Core?',
      answer:
        'Es el ORM oficial de .NET: mapea clases C# a tablas y permite consultar con LINQ en lugar de SQL a mano. Se trabaja con un `DbContext` y `DbSet<T>` por entidad. Además maneja migraciones para versionar el esquema de la base.',
    },
    {
      topic: 'http',
      question: '¿Qué códigos HTTP devolverías al crear, no encontrar o recibir datos inválidos?',
      answer:
        'Al crear, `201 Created` con la ubicación del recurso (`CreatedAtAction`). Si no existe, `404 Not Found` (`NotFound()`). Ante datos inválidos, `400 Bad Request`; con `[ApiController]` la validación del modelo devuelve 400 automáticamente con un `ProblemDetails`.',
    },
    {
      topic: 'c#',
      question: '¿Qué diferencia hay entre `string` y `StringBuilder`?',
      answer:
        '`string` es inmutable: cada concatenación crea un objeto nuevo. `StringBuilder` mantiene un buffer mutable, así que es mucho más eficiente para armar textos en loops. Para pocas concatenaciones, la interpolación `$"..."` es suficiente.',
    },
    {
      topic: 'c#',
      question: '¿Qué son las propiedades y en qué se diferencian de los campos?',
      answer:
        'Un campo es una variable de la clase; una propiedad expone el dato con accessors `get` y `set` que pueden tener lógica o distinto nivel de acceso. Las auto-properties (`public string Name { get; set; }`) generan el campo por detrás. Con `init` se puede asignar solo al construir el objeto.',
    },
    {
      topic: 'colecciones',
      question: '¿Cuándo usarías `List<T>`, `Dictionary<TKey, TValue>` y `HashSet<T>`?',
      answer:
        '`List<T>` para una secuencia ordenada con acceso por índice. `Dictionary` para buscar por clave en tiempo O(1) promedio. `HashSet` para guardar elementos únicos y consultar pertenencia rápido. Elegir bien la colección evita búsquedas lineales innecesarias.',
    },
    {
      topic: 'configuración',
      question: '¿Dónde guardás la configuración y los secretos de una app ASP.NET Core?',
      answer:
        'La configuración general va en `appsettings.json` y `appsettings.{Environment}.json`, sobrescribible con variables de entorno. Los secretos nunca van al repo: en desarrollo se usa User Secrets y en producción variables de entorno o un vault (por ejemplo Azure Key Vault). Se leen con `IConfiguration`.',
    },
    {
      topic: 'testing',
      question: '¿Cómo escribís un test unitario en .NET?',
      answer:
        'Con un framework como xUnit, NUnit o MSTest. En xUnit un test es un método con `[Fact]` (o `[Theory]` con `[InlineData]` para varios casos) que sigue Arrange, Act, Assert. Las dependencias se reemplazan con mocks usando librerías como Moq o NSubstitute.',
    },
    {
      topic: 'c#',
      question: '¿Qué es `var` y cuándo conviene usarlo?',
      answer:
        '`var` deja que el compilador infiera el tipo a partir de la expresión; sigue siendo tipado estático. Conviene cuando el tipo es obvio por el lado derecho (`var users = new List<User>()`). Si hace el código menos legible, mejor escribir el tipo explícito.',
    },
  ],
  'semi-senior': [
    {
      topic: 'inyección de dependencias',
      question: '¿Qué diferencia hay entre los lifetimes Transient, Scoped y Singleton?',
      answer:
        'Transient crea una instancia nueva cada vez que se pide. Scoped crea una por scope, que en ASP.NET Core es una por request. Singleton crea una sola para toda la vida de la app. Un error típico es inyectar un servicio Scoped (como un `DbContext`) dentro de un Singleton: queda capturado y se comparte entre requests.',
    },
    {
      topic: 'asp.net core',
      question: '¿Cómo funciona el pipeline de middleware en ASP.NET Core?',
      answer:
        'Cada middleware recibe el `HttpContext`, puede hacer algo antes, llamar a `next()` y hacer algo después, o cortar el pipeline devolviendo una respuesta. El orden de registro importa: por ejemplo, `UseAuthentication` debe ir antes de `UseAuthorization`. Se usan para logging, manejo de errores, CORS, auth y compresión.',
    },
    {
      topic: 'asp.net core',
      question: '¿Qué diferencia hay entre Minimal APIs y controllers?',
      answer:
        'Las Minimal APIs definen endpoints con lambdas (`app.MapGet("/users/{id}", ...)`), con menos ceremonia y algo más de rendimiento; son ideales para servicios chicos. Los controllers organizan endpoints en clases con atributos, filtros y convenciones, útiles en APIs grandes. Ambos comparten DI, model binding y middleware.',
    },
    {
      topic: 'async',
      question: '¿Por qué no deberías usar `.Result` o `.Wait()` sobre una `Task`?',
      answer:
        'Bloquean el hilo esperando la tarea, lo que desperdicia hilos del thread pool y puede causar thread pool starvation bajo carga. En contextos con `SynchronizationContext` (UI, ASP.NET clásico) pueden generar deadlocks. La regla es "async all the way": usar `await` en toda la cadena.',
    },
    {
      topic: 'async',
      question: '¿Para qué sirve el `CancellationToken`?',
      answer:
        'Permite cancelar cooperativamente operaciones asíncronas. ASP.NET Core provee uno por request que se cancela si el cliente se desconecta; conviene propagarlo a EF Core, `HttpClient` y otras llamadas. Así se evita seguir trabajando para alguien que ya no espera la respuesta.',
    },
    {
      topic: 'ef core',
      question: '¿Qué es el change tracking en EF Core y cuándo usarías `AsNoTracking`?',
      answer:
        'El `DbContext` rastrea las entidades que carga para detectar cambios y generar los `UPDATE` al llamar `SaveChanges()`. Eso consume memoria y CPU. Para consultas de solo lectura se usa `AsNoTracking()`, que es más rápido porque no registra las entidades.',
    },
    {
      topic: 'ef core',
      question: '¿Cómo evitás el problema N+1 en EF Core?',
      answer:
        'Cargando las relaciones en la misma query con `Include`/`ThenInclude`, o proyectando con `Select` solo los campos necesarios, que suele ser lo más eficiente. Hay que evitar el lazy loading en loops. Revisar el SQL generado con logging o `ToQueryString()` ayuda a detectarlo.',
    },
    {
      topic: 'linq',
      question: '¿Qué diferencia hay entre `IEnumerable<T>` e `IQueryable<T>`?',
      answer:
        '`IEnumerable` ejecuta los operadores LINQ en memoria. `IQueryable` construye un árbol de expresión que el proveedor (como EF Core) traduce, por ejemplo a SQL. Si convertís a `IEnumerable` o llamás `ToList()` antes de filtrar, traés toda la tabla a memoria y filtrás ahí.',
    },
    {
      topic: 'c#',
      question: '¿Qué son los records y cuándo los usarías?',
      answer:
        'Son tipos pensados para datos inmutables con igualdad por valor: dos records con los mismos datos son iguales. Generan `ToString`, `Equals` y soportan copias modificadas con `with`. Son ideales para DTOs, mensajes y value objects.',
    },
    {
      topic: 'configuración',
      question: '¿Qué es el Options pattern?',
      answer:
        'Es una forma de vincular secciones de configuración a clases tipadas (`builder.Services.Configure<SmtpOptions>(config.GetSection("Smtp"))`) e inyectarlas como `IOptions<T>`. `IOptionsSnapshot<T>` relee por request e `IOptionsMonitor<T>` notifica cambios. Se puede validar al arrancar con `ValidateOnStart()`.',
    },
    {
      topic: 'logging',
      question: '¿Qué es el logging estructurado y cómo lo hacés en .NET?',
      answer:
        'Es loguear eventos con propiedades en lugar de texto plano, para poder filtrarlos y buscarlos. Con `ILogger` se usan message templates: `logger.LogInformation("Order {OrderId} created", id)`, no interpolación. Proveedores como Serilog u OpenTelemetry envían esas propiedades a herramientas como Seq o Elastic.',
    },
    {
      topic: 'errores',
      question: '¿Cómo manejarías errores de forma global en una API ASP.NET Core?',
      answer:
        'Con un middleware de manejo de excepciones (`UseExceptionHandler`) o implementando `IExceptionHandler`, que convierte las excepciones en respuestas `ProblemDetails` consistentes. Se loguea el error con contexto y no se exponen stack traces al cliente. Errores esperables de negocio conviene modelarlos como resultados, no como excepciones.',
    },
    {
      topic: 'auth',
      question: '¿Cómo implementarías autenticación con JWT en ASP.NET Core?',
      answer:
        'Se configura `AddAuthentication().AddJwtBearer(...)` indicando issuer, audience y la clave o el authority del proveedor de identidad. Luego `UseAuthentication` y `UseAuthorization`, y se protegen endpoints con `[Authorize]` o políticas. Los tokens deben ser de vida corta y validarse siempre en el servidor.',
    },
    {
      topic: 'testing',
      question: '¿Cómo harías tests de integración de una API ASP.NET Core?',
      answer:
        'Con `WebApplicationFactory<Program>`, que levanta la app en memoria y da un `HttpClient` para llamarla. Se pueden reemplazar servicios en el contenedor y usar una base real en un contenedor con Testcontainers. Así se prueban rutas, middleware, serialización y acceso a datos juntos.',
    },
    {
      topic: 'http',
      question: '¿Por qué no deberías crear un `HttpClient` nuevo en cada request?',
      answer:
        'Porque cada instancia puede abrir conexiones nuevas y, al descartarse, deja sockets en `TIME_WAIT`, llevando a socket exhaustion. Se usa `IHttpClientFactory` (`AddHttpClient`), que reutiliza handlers, respeta cambios de DNS y permite configurar clientes tipados. Con Polly o Microsoft.Extensions.Http.Resilience se agregan reintentos y circuit breakers.',
    },
    {
      topic: 'background',
      question: '¿Cómo ejecutás tareas en segundo plano en ASP.NET Core?',
      answer:
        'Implementando un `BackgroundService` (o `IHostedService`) registrado con `AddHostedService`, que corre mientras vive la app. Como es Singleton, para usar servicios Scoped hay que crear un scope con `IServiceScopeFactory`. Para jobs persistentes con reintentos se usan herramientas como Hangfire, Quartz o una cola.',
    },
    {
      topic: 'validación',
      question: '¿Cómo validás los datos de entrada de una API en .NET?',
      answer:
        'Con data annotations (`[Required]`, `[Range]`) que `[ApiController]` valida automáticamente, o con FluentValidation para reglas más complejas y testeables. La validación devuelve `400` con un `ValidationProblemDetails`. Nunca hay que confiar en la validación del cliente.',
    },
    {
      topic: 'ef core',
      question: '¿Cómo manejás las migraciones de EF Core en un equipo?',
      answer:
        'Cada cambio de modelo genera una migración con `dotnet ef migrations add`, que se revisa y se commitea. En producción conviene aplicar scripts SQL idempotentes (`dotnet ef migrations script --idempotent`) o bundles desde el pipeline, no `Migrate()` al arrancar con varias réplicas. Los cambios destructivos se hacen en pasos compatibles hacia atrás.',
    },
    {
      topic: 'c#',
      question: '¿Qué es el boxing y por qué puede afectar la performance?',
      answer:
        'Es convertir un tipo por valor en `object` (o una interfaz), lo que crea una copia en el heap; el unboxing hace el camino inverso. En loops calientes genera asignaciones y presión sobre el GC. Se evita usando generics en lugar de `object` y colecciones genéricas en lugar de `ArrayList`.',
    },
    {
      topic: 'concurrencia',
      question: '¿Cómo manejás la concurrencia optimista en EF Core?',
      answer:
        'Marcando una columna como token de concurrencia (por ejemplo `rowversion` con `[Timestamp]`). Al guardar, EF incluye ese valor en el `WHERE`; si otro proceso modificó la fila, no se actualiza nada y se lanza `DbUpdateConcurrencyException`. Ahí decidís si reintentar, mergear o informar el conflicto.',
    },
  ],
  senior: [
    {
      topic: 'performance',
      question: '¿Cómo funciona el garbage collector de .NET?',
      answer:
        'Es generacional: los objetos nuevos van a la generación 0 y los que sobreviven suben a 1 y 2, porque la mayoría muere joven. Los objetos de más de ~85 KB van al Large Object Heap, que se compacta poco. Hay modo Workstation y Server (por defecto en ASP.NET Core); reducir asignaciones es la mejor forma de bajar pausas.',
    },
    {
      topic: 'performance',
      question: '¿Qué son `Span<T>` y `Memory<T>` y cuándo los usarías?',
      answer:
        '`Span<T>` es una vista sobre memoria contigua (arrays, stack o memoria nativa) sin copiar ni asignar; es un `ref struct`, así que vive solo en el stack y no se puede usar en métodos `async`. `Memory<T>` es su equivalente que sí puede guardarse en el heap y cruzar `await`. Se usan para parsing y procesamiento de buffers de alto rendimiento.',
    },
    {
      topic: 'performance',
      question: '¿Cómo diagnosticarías un problema de performance en una API .NET en producción?',
      answer:
        'Empezar por métricas y trazas (OpenTelemetry, Application Insights) para ubicar el endpoint y la dependencia lenta. Luego usar `dotnet-counters` para ver GC, thread pool y excepciones, y `dotnet-trace` o `dotnet-dump` para perfilar CPU y memoria. Las optimizaciones se validan con BenchmarkDotNet y pruebas de carga.',
    },
    {
      topic: 'async',
      question: '¿Qué es `ValueTask` y cuándo conviene sobre `Task`?',
      answer:
        '`ValueTask<T>` es un struct que evita asignar una `Task` cuando el resultado suele estar disponible sincrónicamente, como un hit de cache. Conviene en caminos muy calientes medidos. Tiene restricciones: no se debe await-ear dos veces ni consultar en paralelo, así que por defecto se sigue usando `Task`.',
    },
    {
      topic: 'async',
      question: '¿Qué es el thread pool starvation y cómo se detecta?',
      answer:
        'Ocurre cuando los hilos del thread pool quedan bloqueados (por `.Result`, `Thread.Sleep` o I/O sincrónico) y el pool crece lento, así que las requests se encolan y la latencia explota aunque la CPU esté baja. Se detecta con `dotnet-counters` viendo la cola del thread pool y la cantidad de hilos. Se resuelve eliminando el código bloqueante.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo estructurarías una solución .NET grande?',
      answer:
        'Separando dominio, aplicación e infraestructura (Clean Architecture o vertical slices), con dependencias apuntando hacia el dominio. Un monolito modular con límites claros por módulo suele ser mejor punto de partida que microservicios. Las reglas de dependencia se pueden hacer cumplir con tests de arquitectura (NetArchTest, ArchUnitNET).',
    },
    {
      topic: 'arquitectura',
      question: '¿Qué es CQRS y cuándo lo aplicarías?',
      answer:
        'Separar el modelo de escritura (commands que cambian estado) del de lectura (queries optimizadas, a veces con otro almacenamiento). Sirve cuando lecturas y escrituras tienen necesidades muy distintas de escala o forma. Agrega complejidad, así que no conviene aplicarlo a todo un sistema CRUD simple; MediatR es una ayuda, no un requisito.',
    },
    {
      topic: 'microservicios',
      question: '¿Cómo comunicarías microservicios en .NET?',
      answer:
        'De forma sincrónica con HTTP/REST o gRPC (más eficiente, con contratos Protobuf) cuando se necesita respuesta inmediata. De forma asincrónica con mensajería (RabbitMQ, Azure Service Bus, Kafka) usando librerías como MassTransit, para desacoplar y absorber picos. Con mensajería hay que diseñar consumidores idempotentes y el patrón Outbox.',
    },
    {
      topic: 'resiliencia',
      question: '¿Qué patrones de resiliencia aplicarías a las llamadas entre servicios?',
      answer:
        'Timeouts siempre, reintentos con backoff exponencial y jitter solo para operaciones idempotentes, circuit breaker para no saturar un servicio caído, y bulkhead para aislar recursos. En .NET se configuran con Polly o `Microsoft.Extensions.Http.Resilience`. También fallbacks y degradación elegante cuando es posible.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo implementarías observabilidad en servicios .NET?',
      answer:
        'Con OpenTelemetry: trazas distribuidas (`ActivitySource`), métricas (`Meter`) y logs estructurados correlacionados por trace id. ASP.NET Core, `HttpClient` y EF Core ya emiten telemetría que se exporta a Jaeger, Prometheus, Grafana o Application Insights. Sobre eso se definen SLOs, dashboards y alertas por síntomas.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué medidas de seguridad aplicarías a una API ASP.NET Core?',
      answer:
        'HTTPS y HSTS, autenticación con OAuth 2.0/OIDC, autorización por políticas y por recurso, validación de entrada, queries parametrizadas (EF lo hace por defecto, cuidado con `FromSqlRaw`), rate limiting con el middleware integrado, CORS restrictivo, secretos en un vault y auditoría de paquetes NuGet vulnerables. Sumar el OWASP API Security Top 10 como checklist.',
    },
    {
      topic: 'escalabilidad',
      question: '¿Qué estrategias de caching usarías en .NET?',
      answer:
        '`IMemoryCache` para datos calientes por instancia, `IDistributedCache` o Redis para compartir entre réplicas, y output caching o cache HTTP para respuestas. `HybridCache` combina ambos niveles y protege contra cache stampede. La invalidación se resuelve con TTL, eventos o claves versionadas.',
    },
    {
      topic: 'ef core',
      question: '¿Cuándo dejarías de usar EF Core para una query y qué alternativas tenés?',
      answer:
        'Cuando el SQL generado es ineficiente, la query es muy compleja o es un camino crítico de performance. Alternativas: `FromSql` con SQL a mano dentro de EF, Dapper para micro-ORM con mapeo rápido, o operaciones masivas con `ExecuteUpdate`/`ExecuteDelete`. Es válido combinar EF para escritura y Dapper para lecturas.',
    },
    {
      topic: 'datos',
      question:
        '¿Cómo manejarías transacciones que involucran la base de datos y la publicación de un evento?',
      answer:
        'Con el patrón Transactional Outbox: en la misma transacción se guarda el cambio y el evento en una tabla outbox, y un proceso aparte (un `BackgroundService`) lo publica al broker y lo marca como enviado. Así no se pierde el evento si falla la publicación. MassTransit y otras librerías ya lo implementan.',
    },
    {
      topic: 'performance',
      question: '¿Qué es Native AOT y qué trade-offs tiene?',
      answer:
        'Compila la app a código nativo antes de ejecutarse, logrando arranque muy rápido, menor memoria y binarios autocontenidos, ideal para serverless y contenedores. A cambio limita la reflexión dinámica y la generación de código en runtime, así que algunas librerías y features (partes de EF Core, MVC) no son compatibles. Se apoya en source generators.',
    },
    {
      topic: 'deploy',
      question: '¿Cómo desplegarías una API .NET en contenedores?',
      answer:
        'Con un Dockerfile multi-stage: compilar con la imagen del SDK y correr sobre la imagen runtime de ASP.NET (o chiseled) con usuario no root. Configurar health checks (`MapHealthChecks`) para liveness y readiness, logs a stdout y configuración por variables de entorno. Se orquesta con Kubernetes o un servicio gestionado, con despliegues graduales.',
    },
    {
      topic: 'api',
      question: '¿Cómo versionarías una API pública en .NET?',
      answer:
        'Por URL (`/v1/...`), header o query string, usando `Asp.Versioning` para mapear versiones y documentarlas en OpenAPI. Los cambios aditivos no requieren versión nueva; los que rompen sí. Mantener versiones viejas un período definido, con avisos de deprecación, y medir su uso antes de retirarlas.',
    },
    {
      topic: 'c#',
      question: '¿Qué son los source generators y para qué se usan?',
      answer:
        'Son componentes del compilador que generan código C# en tiempo de compilación a partir del código existente. Reemplazan reflexión en runtime: por ejemplo `System.Text.Json` y el logging de alto rendimiento (`[LoggerMessage]`) los usan. Mejoran el arranque, la performance y la compatibilidad con Native AOT.',
    },
    {
      topic: 'concurrencia',
      question:
        '¿Cómo procesarías un alto volumen de trabajo concurrente dentro de un servicio .NET?',
      answer:
        'Con `System.Threading.Channels` como cola productor-consumidor con backpressure (canales acotados), y consumidores en `BackgroundService`. Para paralelismo con I/O, `Parallel.ForEachAsync` con un `MaxDegreeOfParallelism` controlado. Evitar estado compartido mutable o protegerlo con estructuras concurrentes y `SemaphoreSlim`.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo planificarías migrar una aplicación de .NET Framework a .NET moderno?',
      answer:
        'Primero inventariar dependencias y APIs incompatibles (con el .NET Upgrade Assistant y analizadores), y mover librerías compartidas a .NET Standard o multi-target. Migrar de forma incremental, por ejemplo con el patrón strangler fig y YARP enrutando partes a la app nueva. Cubrir con tests de integración y medir performance antes y después.',
    },
  ],
};
