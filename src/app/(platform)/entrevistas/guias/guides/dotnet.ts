import type { InterviewGuide } from './types';

export const dotnetGuide: InterviewGuide = {
  track: 'dotnet',
  summary:
    'Qué estudiar y cómo practicar para una entrevista de backend con C# y ASP.NET Core, de junior a senior.',
  sections: [
    {
      id: 'la-entrevista',
      title: 'Cómo es la entrevista',
      body: [
        'Un proceso de backend .NET suele tener una charla con recruiting, una entrevista técnica sobre C# y ASP.NET Core, un ejercicio práctico (live coding o take-home) y, para perfiles altos, system design y una charla con liderazgo. Muchas empresas que usan .NET trabajan con Azure y SQL Server, así que preguntá por el stack completo: cambia el foco de algunas preguntas.',
        'Para junior se evalúa C# con buena base: tipos por valor y por referencia, clases, interfaces, colecciones, LINQ, excepciones, `async` y `await`, y un endpoint con ASP.NET Core y Entity Framework Core. Esperan código claro y que sepas explicar lo que escribís. Un proyecto propio con una API, una base y tests es tu mejor argumento.',
        'Para semi-senior el foco está en el framework y sus trampas: lifetimes de la inyección de dependencias, el pipeline de middleware, Minimal APIs contra controllers, `async` bien usado (sin `.Result`), `CancellationToken`, change tracking y N+1 en EF Core, configuración con el Options pattern, logging estructurado, autenticación con JWT y tests de integración.',
        'Para senior se evalúan rendimiento y arquitectura: el garbage collector, `Span<T>`, thread pool starvation, diagnóstico en producción, estructura de soluciones grandes, CQRS, resiliencia y mensajería entre servicios, observabilidad, contenedores, Native AOT y migraciones desde .NET Framework. También cómo liderás decisiones técnicas en el equipo.',
      ],
      checklist: [
        {
          text: 'Saber qué etapas tiene el proceso y qué stack completo usa la empresa',
          explanation:
            'En la primera charla con recruiting preguntá cuántas etapas hay, quién participa, qué evalúa cada una y si hay live coding, take-home o prueba de algoritmos. En .NET además importa mucho el stack completo, porque varía bastante entre empresas: qué versión de .NET usan y si queda código en .NET Framework, si están en Azure o AWS, SQL Server o Postgres, EF Core o Dapper, y qué frontend (Angular, React, Blazor). Con eso decidís qué repasar: no es lo mismo preparar Azure Service Bus y Entra ID que una migración de un monolito en Web Forms. Anotá todo por empresa y releelo antes de cada etapa.',
        },
        {
          text: 'Tener un proyecto ASP.NET Core propio que puedas explicar completo',
          explanation:
            'Armá una API chica pero completa en .NET 10: endpoints con Minimal APIs o controllers, validación y errores con `ProblemDetails`, EF Core sobre Postgres o SQL Server con migraciones, autenticación JWT con políticas, tests con xUnit, `WebApplicationFactory` y Testcontainers, OpenTelemetry, un `docker-compose.yml` y un `README` con decisiones. El dominio puede ser simple (turnos, gastos, inventario); lo que importa es justificar cada pieza: por qué esos lifetimes en DI, cómo evitaste el N+1, cómo manejás la cancelación, qué cambiarías para producción. Practicá contar el recorrido de una request por el pipeline en dos minutos. El error común es mostrar un template generado que no sabés explicar.',
        },
        {
          text: 'Contar dos o tres problemas reales que resolviste con contexto y resultado',
          explanation:
            'Elegí casos concretos, como un endpoint lento por un N+1 en EF Core, thread pool starvation por código sync-over-async, una fuga de memoria, una migración desde .NET Framework o un incidente en producción, y escribilos así: contexto (sistema y escala), problema y cómo lo detectaste (qué herramienta, qué métrica), qué hiciste vos y qué alternativas descartaste, resultado medible y qué aprendiste. Ensayalos en voz alta hasta que duren unos dos minutos y tené detalles listos para las repreguntas. El error común es hablar en plural sin que quede claro tu aporte, o no tener ningún número de impacto.',
        },
        {
          text: 'Distinguir qué se espera de un junior, un semi-senior y un senior',
          explanation:
            'Un junior tiene que manejar bien C#, POO, colecciones y LINQ, y armar un CRUD con ASP.NET Core y EF Core escribiendo código claro. Un semi-senior es autónomo en features completas, entiende el pipeline de middleware, los lifetimes de DI, async correcto y el rendimiento de EF Core, y justifica decisiones con trade-offs. Un senior diseña soluciones, diagnostica problemas de producción con métricas y dumps, decide sobre nube, resiliencia y arquitectura, planifica migraciones y guía al equipo. Calibrá tus respuestas según el puesto: para senior, cada respuesta debería incluir alternativas, costos y cómo se opera en producción.',
        },
        {
          text: 'Saber en qué versión de .NET trabajaste y qué cambió en las últimas',
          explanation:
            '.NET sale cada noviembre; las versiones pares son LTS con tres años de soporte (.NET 8 en 2023, .NET 10 en 2025) y las impares son STS, ahora con dos años. Hitos para nombrar: .NET 6 unificó el hosting en un `Program.cs` mínimo y trajo Minimal APIs; .NET 7 sumó rate limiting y output caching; .NET 8 trajo Native AOT para ASP.NET Core, keyed services, `TimeProvider` e `IExceptionHandler`; .NET 9 agregó `HybridCache` y la generación de OpenAPI integrada en lugar de Swashbuckle; .NET 10 trajo C# 14 (extension members, la palabra clave `field`), validación integrada para Minimal APIs y OpenAPI 3.1. De C# reciente, primary constructors y collection expressions (C# 12). Si venís de .NET Framework, decilo y mostrá que sabés qué implica migrar.',
        },
      ],
    },
    {
      id: 'fundamentos',
      title: 'C# y el runtime de .NET',
      body: [
        'La base que más se pregunta: tipos por valor (`struct`, primitivos) contra tipos por referencia (`class`), qué pasa al pasarlos a un método, y cuándo un `struct` tiene sentido (chico, inmutable, de vida corta). Sabé también propiedades contra campos, interfaces, generics con restricciones, `string` inmutable y `StringBuilder`, y las colecciones habituales: `List<T>`, `Dictionary<TKey, TValue>` y `HashSet<T>` con su costo de búsqueda.',
        'LINQ es infaltable: sintaxis de métodos, proyecciones, agrupaciones y, sobre todo, la ejecución diferida: la query no corre hasta que la enumerás, y enumerarla dos veces la ejecuta dos veces. Conocé `IEnumerable<T>` contra `IQueryable<T>`: el primero filtra en memoria, el segundo traduce la expresión a SQL, y mezclarlos sin cuidado trae toda la tabla.',
        'C# moderno suma puntos: nullable reference types activados para que el compilador avise de posibles `null`, records para datos inmutables con igualdad por valor, pattern matching, primary constructors, `required` e `init`. `IDisposable` con `using` para liberar recursos no administrados y excepciones bien usadas (no para control de flujo, con `throw;` para conservar el stack trace). En 2026 lo esperable es .NET 8 o .NET 10, ambas LTS.',
        'Del runtime: el CLR compila IL a código nativo con JIT, gestiona memoria con un garbage collector generacional (gen 0, 1 y 2, más el Large Object Heap) y tiene un thread pool compartido. El boxing de un tipo por valor a `object` genera allocations que en código caliente afectan el rendimiento; saber detectarlo es una pregunta típica de semi-senior.',
      ],
      checklist: [
        {
          text: 'Explicar tipos por valor y por referencia con un ejemplo',
          explanation:
            'Los tipos por valor (`struct`, primitivos como `int`, `enum`) guardan el dato directamente y se copian completos al asignarlos o pasarlos a un método; los tipos por referencia (`class`, `string`, arrays) guardan una referencia a un objeto en el heap, y al asignar se copia la referencia, así que dos variables apuntan al mismo objeto. Ejemplo: con `var b = a; b.X = 5;`, si `Point` es `struct`, `a.X` sigue igual; si es `class`, `a.X` también pasa a 5. Decir que los structs viven en el stack es una simplificación: un struct que es campo de una clase vive dentro de ese objeto en el heap. `string` es por referencia pero inmutable, y los `record` son clases con igualdad por valor (existe también `record struct`). Error común: structs mutables, donde modificás una copia sin darte cuenta, por ejemplo al leerlos de una lista.',
        },
        {
          text: 'Explicar la ejecución diferida de LINQ y sus trampas',
          explanation:
            'La mayoría de los operadores de LINQ (`Where`, `Select`, `OrderBy`) no ejecutan nada: arman una consulta que corre recién cuando la enumerás con `foreach`, `ToList`, `Count`, `First` o `Any`. Trampas: si enumerás dos veces se ejecuta dos veces (con EF Core son dos idas a la base, con un `Select` que crea objetos tenés instancias distintas); si una variable capturada cambia entre que definís la consulta y la ejecutás, se usa el valor nuevo; las excepciones aparecen lejos de donde escribiste la consulta; y si la consulta se enumera después de que el `DbContext` fue liberado, falla. La regla práctica es materializar con `ToList()` o `ToArray()` cuando vas a recorrer el resultado varias veces o lo devolvés fuera del alcance donde vive el origen de datos. Los analizadores de los IDEs avisan sobre la enumeración múltiple; hacé caso a ese warning.',
        },
        {
          text: 'Diferenciar `IEnumerable<T>` e `IQueryable<T>`',
          explanation:
            '`IEnumerable<T>` representa una secuencia en memoria: LINQ to Objects ejecuta delegados (`Func<T, bool>`) elemento por elemento en tu proceso. `IQueryable<T>` arma un expression tree (`Expression<Func<T, bool>>`) que un provider como EF Core traduce a SQL y ejecuta en la base. La diferencia importa mucho: `db.Orders.Where(o => o.Total > 100)` filtra en la base, pero si antes pasás a `IEnumerable` (con `AsEnumerable()` o devolviendo `IEnumerable` desde un repositorio y filtrando después), traés toda la tabla y filtrás en memoria. EF Core lanza una excepción si no puede traducir una expresión, salvo en la proyección final. Exponer `IQueryable` fuera de la capa de datos da flexibilidad pero filtra detalles de persistencia y hace imprevisibles las queries; es un trade-off que conviene poder defender.',
        },
        {
          text: 'Usar records, nullable reference types y pattern matching',
          explanation:
            'Un `record` es un tipo con igualdad por valor, `ToString` legible y expresiones `with` para crear copias modificadas: `var updated = order with { Status = "paid" };`. Sirve para DTOs, mensajes y value objects; para entidades de EF Core con identidad y estado mutable suele convenir una clase. Los nullable reference types (`<Nullable>enable</Nullable>`) hacen que `string` signifique no nulo y `string?` posiblemente nulo, y el compilador avisa cuando podrías desreferenciar un null; son solo análisis estático, no cambian el runtime, y el operador `!` debe usarse poco. Pattern matching permite expresar reglas de forma compacta: `order switch { { Status: "paid", Total: > 1000 } => "revisar", { Status: "paid" } => "ok", _ => "pendiente" }`, además de `is not null`, patrones de tipo y list patterns como `[var first, .., var last]`. Tratá los warnings de nullability como errores en proyectos nuevos.',
        },
        {
          text: 'Usar `using` e `IDisposable` correctamente',
          explanation:
            '`IDisposable` es para liberar de forma determinista recursos que el garbage collector no gestiona bien: archivos, sockets, conexiones, handles. `using var stream = File.OpenRead(path);` llama a `Dispose` al salir del bloque aunque haya una excepción, y `await using` hace lo mismo con `IAsyncDisposable`. Lo que te da el contenedor de DI no lo liberes vos: el contenedor hace dispose de los servicios scoped y transient que creó al terminar el scope. El patrón completo con finalizador solo hace falta si manejás recursos nativos directamente, y aun así conviene envolverlos en un `SafeHandle`. Error clásico: crear un `HttpClient` dentro de un `using` por cada request, lo que deja sockets en `TIME_WAIT` y agota puertos; para eso está `IHttpClientFactory`.',
        },
        {
          text: 'Explicar qué es el boxing y cuándo importa',
          explanation:
            'Boxing es convertir un tipo por valor en `object` o en una interfaz: el runtime crea un objeto en el heap y copia el valor adentro; unboxing es el cast de vuelta, que copia otra vez. Pasa al usar colecciones no genéricas como `ArrayList`, al pasar un `int` a un parámetro `object`, al llamar a un método de interfaz sobre un struct a través de una variable de esa interfaz o al concatenar con APIs viejas que reciben `object`. Cada boxing es una asignación, así que en un camino caliente (un loop de millones de iteraciones, un parser, un serializador) suma presión sobre el GC y latencia. Los genéricos (`List<int>`, restricciones `where T : struct`) lo evitan, y las interpolated string handlers de C# 10 lo eliminaron de la interpolación. Se detecta midiendo asignaciones con BenchmarkDotNet y `[MemoryDiagnoser]` o con un profiler; en código normal de negocio rara vez importa.',
        },
      ],
    },
    {
      id: 'aspnet-core-apis',
      title: 'ASP.NET Core y diseño de APIs',
      body: [
        'ASP.NET Core es un pipeline de middleware donde el orden importa: manejo de excepciones primero, después HTTPS, routing, CORS, autenticación, autorización y por último los endpoints. Sabé escribir un middleware propio y explicar qué pasa si ponés `UseAuthorization` antes de `UseAuthentication`.',
        'La inyección de dependencias viene incluida y los lifetimes son pregunta segura: Transient crea una instancia cada vez, Scoped una por request y Singleton una para toda la app. El error clásico es la captive dependency: inyectar un servicio Scoped (como un `DbContext`) dentro de un Singleton. Para configuración, el Options pattern con `IOptions<T>` y sus variantes, y secretos fuera de `appsettings.json` (user secrets en desarrollo, Key Vault o variables de entorno en producción).',
        'Minimal APIs contra controllers: las primeras son más livianas y hoy cubren casi todo (filtros, validación, grupos de rutas, OpenAPI integrado); los controllers siguen siendo comunes en proyectos grandes y legacy. Sabé validar entradas (Data Annotations, la validación integrada de Minimal APIs o FluentValidation) y manejar errores de forma global con `IExceptionHandler` y respuestas `ProblemDetails`.',
        'El diseño de APIs es el de cualquier backend: recursos, verbos, idempotencia, códigos correctos (201 con `CreatedAtRoute`, 204, 400, 401, 403, 404, 409), paginación y un formato de error consistente. Para senior, versionado con Asp.Versioning, deprecaciones y cómo evolucionar un contrato público sin romper clientes.',
      ],
      checklist: [
        {
          text: 'Ordenar el pipeline de middleware y explicar por qué',
          explanation:
            'Cada middleware recibe el request, puede hacer algo antes y después de llamar a `next` o cortar la cadena, y el orden en que los registrás en `Program.cs` es el orden en que corren. El orden recomendado: `UseExceptionHandler` primero, para envolver todo lo demás; HSTS y `UseHttpsRedirection`; archivos estáticos (cortan temprano sin pasar por auth); `UseRouting`; `UseCors`, antes de la autenticación para que los preflight respondan; `UseAuthentication` y después `UseAuthorization`; `UseRateLimiter` (después del routing si usás políticas por endpoint); y al final los endpoints. Si ponés `UseAuthorization` antes de `UseAuthentication`, el usuario siempre aparece anónimo; si el manejador de excepciones va al final, no atrapa nada de lo anterior. Un middleware propio es una clase con `InvokeAsync(HttpContext context)` o un `app.Use(async (ctx, next) => { ...; await next(ctx); })`.',
        },
        {
          text: 'Explicar Transient, Scoped y Singleton y la captive dependency',
          explanation:
            'Transient crea una instancia nueva cada vez que se resuelve; Scoped, una por scope, que en ASP.NET Core es una por request; Singleton, una para toda la vida de la aplicación, por lo que tiene que ser thread-safe. Una captive dependency es cuando un servicio de vida larga depende de uno de vida más corta: un singleton que recibe un `DbContext` lo retiene para siempre, compartido entre requests concurrentes, con datos viejos y errores de concurrencia. En Development, ASP.NET Core valida los scopes y lanza una excepción al resolver un scoped desde el root, pero en producción esa validación no está activa por defecto. Se arregla haciendo scoped al consumidor, o inyectando `IServiceScopeFactory` y creando un scope cuando hace falta. Regla: una dependencia nunca debe vivir menos que quien la usa.',
        },
        {
          text: 'Usar el Options pattern para la configuración',
          explanation:
            'Mapeás una sección de configuración a una clase tipada: `builder.Services.AddOptions<SmtpOptions>().BindConfiguration("Smtp").ValidateDataAnnotations().ValidateOnStart();`, con lo que la app no arranca si falta un valor obligatorio. La consumís con `IOptions<T>` (singleton, se lee una vez), `IOptionsSnapshot<T>` (scoped, se recalcula por request y toma cambios del archivo) o `IOptionsMonitor<T>` (singleton con notificación de cambios, útil en singletons y background services). La configuración se arma por capas y la última gana: `appsettings.json`, `appsettings.{Environment}.json`, User Secrets en desarrollo, variables de entorno (`Smtp__Host` con doble guion bajo para anidar) y argumentos de línea de comandos. Error común: inyectar `IConfiguration` en todas partes y leer valores con strings mágicos, sin tipos ni validación.',
        },
        {
          text: 'Comparar Minimal APIs y controllers',
          explanation:
            'Las Minimal APIs definen endpoints como funciones: `app.MapGet("/orders/{id}", async (int id, AppDb db) => ...)`, con menos ceremonia, `TypedResults` para respuestas tipadas que también documentan OpenAPI, `MapGroup` para agrupar rutas con prefijo y políticas, y endpoint filters; son las que soportan Native AOT y, desde .NET 10, tienen validación integrada con `AddValidation`. Los controllers son clases con atributos, model binding, filtros y convenciones de `[ApiController]`, familiares para equipos grandes y código existente. El rendimiento es parecido y ambos usan el mismo pipeline. Para proyectos nuevos hoy se tiende a Minimal APIs organizadas por feature (un archivo con los endpoints de cada módulo), para no terminar con un `Program.cs` gigante; en un proyecto existente con controllers no hay motivo para migrar.',
        },
        {
          text: 'Manejar errores globalmente con `ProblemDetails`',
          explanation:
            'Registrás `builder.Services.AddProblemDetails()` y en el pipeline `app.UseExceptionHandler()` y `app.UseStatusCodePages()`, así toda excepción no manejada y todo error sin cuerpo devuelven el formato estándar de RFC 9457 (`type`, `title`, `status`, `detail`, `instance`, más extensiones como el `traceId`). Para mapear tus excepciones de dominio a códigos concretos implementás `IExceptionHandler` (desde .NET 8), por ejemplo `NotFoundException` a 404 y `ConflictException` a 409, y lo registrás con `AddExceptionHandler<T>()`. Los errores de validación se devuelven con `TypedResults.ValidationProblem(errors)`, que da 400 con el detalle por campo. En producción nunca expongas stack traces; la página de excepciones de desarrollo solo se activa en Development. Para errores esperables (no encontrado, regla de negocio violada) muchos equipos prefieren un patrón Result en vez de excepciones, que son caras y ocultan el flujo.',
        },
        {
          text: 'Elegir el código de estado correcto en cada caso',
          explanation:
            '200 con cuerpo, 201 con header `Location` cuando un POST crea algo (`TypedResults.Created`), 204 sin cuerpo para un DELETE o un PUT exitoso (`TypedResults.NoContent`). 400 para un request mal formado o inválido (`ValidationProblem`; algunas APIs usan 422 para errores semánticos), 401 sin autenticación válida y 403 autenticado pero sin permiso (lo que devuelve `Forbid`). 404 si el recurso no existe o no querés revelar que existe algo ajeno, 409 para conflictos de estado como duplicados o un `DbUpdateConcurrencyException`, 429 cuando actúa el rate limiter. 500 es un bug tuyo; 502 o 503 cuando falla o no responde una dependencia. Errores comunes: devolver 200 con un error en el cuerpo y confundir 401 con 403.',
        },
      ],
    },
    {
      id: 'bases-de-datos',
      title: 'EF Core, SQL y transacciones',
      body: [
        'Sabé SQL a mano (`JOIN`, agregaciones, índices, planes de ejecución) y EF Core: `DbContext` como unidad de trabajo, `DbSet`, configuración con Fluent API, relaciones y migraciones. El `DbContext` no es thread-safe y vive por request (Scoped); usarlo en paralelo es un error frecuente.',
        'El change tracking es lo que más se pregunta: EF Core sigue las entidades que trae para detectar cambios al llamar a `SaveChanges`, lo que cuesta memoria y CPU. Para lecturas usá `AsNoTracking` o proyecciones con `Select` a DTOs. El N+1 aparece con lazy loading o con loops que consultan; se resuelve con `Include`, proyecciones o split queries. Activá el logging de SQL para ver qué genera cada query.',
        'Transacciones: `SaveChanges` ya es transaccional, y para varias operaciones usás `BeginTransaction`. Para concurrencia optimista, un concurrency token (`rowversion` en SQL Server o una columna de versión) que hace fallar el `SaveChanges` con `DbUpdateConcurrencyException` si otro escribió antes. Para senior, niveles de aislamiento y el patrón outbox para guardar datos y publicar un evento de forma consistente.',
        'En equipo, las migraciones se revisan en el PR, se aplican con scripts idempotentes o bundles en el pipeline y no al arrancar la app en producción. Sabé cuándo salir de EF Core: consultas complejas o masivas con Dapper o SQL directo, y operaciones en lote con `ExecuteUpdate` y `ExecuteDelete`.',
      ],
      checklist: [
        {
          text: 'Explicar el change tracking y cuándo usar `AsNoTracking`',
          explanation:
            'Cuando consultás entidades, el `DbContext` guarda una copia de sus valores originales; al llamar a `SaveChanges` compara (`DetectChanges`) y genera `UPDATE` solo de las propiedades modificadas, `INSERT` de lo agregado y `DELETE` de lo removido. Cada entidad tiene un estado: `Added`, `Unchanged`, `Modified`, `Deleted` o `Detached`. `AsNoTracking()` saltea ese registro, así que la consulta es más rápida y usa menos memoria: es lo indicado para lecturas que no vas a modificar, como listados y reportes; podés ponerlo como default con `UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)`. Si después querés actualizar una entidad no trackeada, tenés que adjuntarla con `Attach` o `Update`. Las proyecciones con `Select` a un DTO no se trackean. Error común: un contexto de vida larga, por ejemplo en un proceso batch, que acumula miles de entidades trackeadas y se vuelve cada vez más lento.',
        },
        {
          text: 'Detectar y resolver un N+1 en EF Core',
          explanation:
            'El N+1 aparece cuando cargás N entidades y después accedés a una relación de cada una con una query aparte: con lazy loading activado (`UseLazyLoadingProxies`) pasa solo al recorrer `order.Customer.Name`, y sin lazy loading pasa si en un loop hacés una consulta por elemento. Para detectarlo, activá el log de comandos SQL (`LogTo` o la categoría `Microsoft.EntityFrameworkCore.Database.Command` en nivel Information) o mirá las trazas de OpenTelemetry, donde se ven decenas de queries iguales en una request. Se resuelve con `Include(o => o.Customer)` y `ThenInclude`, o mejor con una proyección `Select(o => new OrderDto(o.Id, o.Customer.Name))`, que trae solo las columnas necesarias. Si incluís varias colecciones a la vez, el join produce una explosión cartesiana de filas; ahí conviene `AsSplitQuery()`. Ojo: sin lazy loading ni `Include`, la navegación queda en null, que no es un N+1 sino un bug silencioso.',
        },
        {
          text: 'Usar transacciones y concurrencia optimista con un concurrency token',
          explanation:
            'Cada `SaveChanges` ya es transaccional por sí solo. Si necesitás varias operaciones atómicas juntas, usás `await using var tx = await db.Database.BeginTransactionAsync();`, hacés tus `SaveChangesAsync` y terminás con `await tx.CommitAsync()`; si configuraste reintentos con `EnableRetryOnFailure`, tenés que envolver todo en `db.Database.CreateExecutionStrategy().ExecuteAsync(...)`. Para concurrencia optimista marcás un concurrency token: en SQL Server una propiedad `[Timestamp] public byte[] RowVersion`, en Postgres la columna de sistema `xmin` mapeada como row version, o cualquier propiedad con `[ConcurrencyCheck]`. EF agrega `WHERE token = valorOriginal` al update; si no afectó filas, lanza `DbUpdateConcurrencyException`, que traducís a 409 o resolvés recargando y reintentando. Sirve cuando los conflictos son raros; con mucha contención sobre la misma fila conviene un update atómico con `ExecuteUpdateAsync` o un lock explícito.',
        },
        {
          text: 'Explicar cómo aplicar migraciones de forma segura en equipo',
          explanation:
            'Cada cambio de modelo se convierte en una migración con `dotnet ef migrations add Nombre`, que genera el archivo de la migración y actualiza el model snapshot; ambos se commitean. Si dos ramas agregan migraciones, el snapshot entra en conflicto: se resuelve borrando la tuya, rebaseando y generándola de nuevo, no mergeando el snapshot a mano. Revisá siempre el SQL generado (`dotnet ef migrations script`), porque un renombre puede salir como borrar y crear una columna, con pérdida de datos. En producción, en vez de `Database.Migrate()` al arrancar (varias instancias a la vez, permisos de DDL en la app), generá un script idempotente con `--idempotent` o un migration bundle (`dotnet ef migrations bundle`) y aplicalo como paso del pipeline. Para no cortar el servicio usá expand and contract: agregá antes de quitar, y borrá columnas recién cuando ningún código desplegado las use.',
        },
        {
          text: 'Decidir cuándo usar Dapper o SQL directo',
          explanation:
            'EF Core conviene para la mayoría del CRUD y para la lógica de dominio que aprovecha change tracking, LINQ tipado y migraciones. Dapper es un micro-ORM: escribís el SQL y él mapea el resultado a objetos, con control total y casi sin overhead; conviene para reportes complejos, consultas muy optimizadas en caminos calientes, stored procedures o features específicas de la base. EF Core también permite SQL directo: `FromSql` para entidades, `Database.SqlQuery<T>` para tipos no mapeados (desde EF 8), y `ExecuteUpdateAsync` o `ExecuteDeleteAsync` para cambios masivos sin cargar entidades. Podés mezclar ambos en la misma app compartiendo conexión y transacción. El costo de SQL a mano es mantener strings sin chequeo del compilador; y siempre con parámetros, nunca concatenando valores.',
        },
        {
          text: 'Explicar por qué el `DbContext` es Scoped y no thread-safe',
          explanation:
            'El `DbContext` es una unidad de trabajo: tiene el change tracker, el identity map y la conexión, y está pensado para vivir poco, típicamente una request, por eso `AddDbContext` lo registra como Scoped. No es thread-safe: si dos operaciones corren a la vez sobre la misma instancia, EF lanza `InvalidOperationException: A second operation was started on this context instance`. La causa típica es un `Task.WhenAll` sobre varias queries del mismo contexto o un `await` olvidado. Si necesitás paralelismo real, usá `IDbContextFactory<T>` y creá un contexto por tarea; en singletons y background services, creá un scope o usá la factory, nunca inyectes el contexto directo. `AddDbContextPool` reutiliza instancias para ahorrar asignaciones, pero sigue siendo una por scope.',
        },
      ],
    },
    {
      id: 'async-concurrencia',
      title: 'Async, Task y concurrencia',
      body: [
        '`async` y `await` liberan el hilo mientras se espera I/O, lo que permite atender más requests con el mismo thread pool. Sabé explicar que no crean hilos nuevos y que `Task` representa una operación en curso. Usá `async` de punta a punta: bloquear con `.Result` o `.Wait()` puede causar deadlocks en contextos con sincronización y, en ASP.NET Core, agota el thread pool.',
        'El `CancellationToken` permite cortar trabajo cuando el cliente se va o vence un timeout: recibilo en los endpoints y pasalo a EF Core y `HttpClient`. Evitá `async void` salvo en event handlers, y conocé `Task.WhenAll` para paralelizar llamadas independientes. `ValueTask` sirve para evitar allocations en métodos que casi siempre terminan sincrónicamente, pero tiene reglas (no se puede await dos veces), así que no es un reemplazo general de `Task`.',
        'Thread pool starvation es una pregunta de senior: pasa cuando hay código sincrónico bloqueando hilos del pool, la latencia sube mientras la CPU está baja, y el pool crece lento. Se diagnostica con `dotnet-counters` (cola del thread pool) y dumps, y se resuelve eliminando el bloqueo, no subiendo el mínimo de hilos.',
        'Para trabajo en segundo plano, `BackgroundService` o `IHostedService`, recordando crear un scope para usar servicios Scoped. Para alto volumen dentro de un servicio, `Channel<T>` como cola productor-consumidor con backpressure, `Parallel.ForEachAsync` con grado de paralelismo limitado, o colas externas y Hangfire para trabajos persistentes.',
      ],
      checklist: [
        {
          text: 'Explicar qué hace `await` y por qué no crea hilos',
          explanation:
            'Un método `async` corre de forma sincrónica hasta el primer `await` sobre una tarea no completada; ahí el compilador, que transformó el método en una máquina de estados, registra el resto como continuación y devuelve el control al llamador, liberando el hilo. Mientras la operación de I/O está en curso (una query, una llamada HTTP) no hay ningún hilo esperando: el sistema operativo avisa cuando termina y la continuación se agenda en el thread pool, o en el `SynchronizationContext` capturado si existe (ASP.NET Core no tiene). Por eso async mejora la escalabilidad, porque los mismos pocos hilos atienden muchas requests, pero no hace más rápida una request individual. `Task.Run` sí usa un hilo del pool y sirve para sacar trabajo de CPU de un hilo de UI, no para volver asincrónico código en ASP.NET Core. En librerías, `ConfigureAwait(false)` evita volver al contexto original.',
        },
        {
          text: 'Explicar por qué evitar `.Result`, `.Wait()` y `async void`',
          explanation:
            '`.Result` y `.Wait()` bloquean el hilo actual hasta que la tarea termine (sync-over-async): en ASP.NET Core desperdician hilos del pool y bajo carga causan thread pool starvation, y en entornos con `SynchronizationContext` (WinForms, WPF, ASP.NET clásico) pueden generar un deadlock, porque la continuación espera al hilo que está bloqueado esperándola. Además envuelven las excepciones en `AggregateException`. `async void` no se puede esperar, el llamador no sabe cuándo termina y una excepción no atrapada se lanza en el contexto o el pool y puede tirar abajo el proceso; solo se justifica en event handlers. La regla es async de punta a punta: `async Task` en todos los niveles, `await` en vez de bloquear, y `static async Task Main` si hace falta. Si una API vieja te obliga a bloquear, aislalo y documentalo.',
        },
        {
          text: 'Propagar `CancellationToken` en toda la cadena',
          explanation:
            'ASP.NET Core te da un token que se cancela si el cliente corta la conexión: agregás un parámetro `CancellationToken ct` al endpoint o la acción y se enlaza solo a `HttpContext.RequestAborted`. Ese token se pasa a cada operación asincrónica de la cadena: `ToListAsync(ct)`, `SaveChangesAsync(ct)`, `httpClient.GetAsync(url, ct)`, `Task.Delay(delay, ct)`; en loops de CPU largos chequeás `ct.ThrowIfCancellationRequested()`. Para combinarlo con un timeout propio: `using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct); cts.CancelAfter(TimeSpan.FromSeconds(5));`. La cancelación llega como `OperationCanceledException`, que no debería loguearse como error. Error común: no pasar el token, con lo que la base sigue ejecutando queries para un cliente que ya se fue; y cuidado con cancelar a mitad de escrituras que no estén en una transacción.',
        },
        {
          text: 'Diagnosticar thread pool starvation',
          explanation:
            'El síntoma típico es latencia que se dispara y requests que hacen cola con la CPU baja: los hilos del pool están bloqueados y el pool, al superar el mínimo, agrega hilos nuevos de a poco (del orden de uno o dos por segundo), así que no da abasto ante un pico. La causa casi siempre es código bloqueante: `.Result`, `.Wait()`, I/O sincrónico, `Thread.Sleep` o locks largos. Para confirmarlo, `dotnet-counters monitor -n MiApp System.Runtime` muestra `threadpool-queue-length` alto y `threadpool-thread-count` creciendo; después, con `dotnet-stack` o con un dump analizado con `dotnet-dump analyze` (comando `clrstack -all`), ves en qué línea están bloqueados los hilos. La solución real es hacer async ese camino; subir el mínimo con `ThreadPool.SetMinThreads` solo es un parche temporal.',
        },
        {
          text: 'Implementar un `BackgroundService` con un scope de DI',
          explanation:
            'Heredás de `BackgroundService` y sobrescribís `ExecuteAsync(CancellationToken stoppingToken)`, típicamente con un loop sobre `PeriodicTimer` o leyendo de una cola, y lo registrás con `builder.Services.AddHostedService<Worker>()`. El hosted service es singleton, así que no podés inyectarle un `DbContext` ni otros servicios scoped (sería una captive dependency): inyectás `IServiceScopeFactory` y en cada iteración hacés `await using var scope = scopeFactory.CreateAsyncScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();`. Atrapá y logueá las excepciones dentro del loop: desde .NET 6, una excepción no manejada en un `BackgroundService` detiene toda la aplicación por defecto. Respetá `stoppingToken` para un apagado prolijo. Si corrés varias instancias de la app, el job corre en todas; para que lo haga una sola necesitás un lock distribuido o una cola.',
        },
        {
          text: 'Usar `Channel<T>` para procesar trabajo concurrente',
          explanation:
            '`System.Threading.Channels` da una cola productor-consumidor asincrónica y thread-safe. `Channel.CreateBounded<Job>(new BoundedChannelOptions(100) { FullMode = BoundedChannelFullMode.Wait })` limita la capacidad, así que si los consumidores no dan abasto el productor espera en `await channel.Writer.WriteAsync(job, ct)`, lo que te da backpressure en vez de memoria infinita. Los consumidores leen con `await foreach (var job in channel.Reader.ReadAllAsync(ct))`, y podés lanzar varios para procesar en paralelo; `Writer.Complete()` indica que no hay más trabajo. El uso típico en ASP.NET Core es que un endpoint encole trabajo y un `BackgroundService` lo procese, registrando el channel como singleton. Es memoria del proceso: si la app se reinicia se pierde lo encolado, así que para trabajo que no puede perderse usá una cola real como Azure Service Bus o RabbitMQ. Para procesar una colección conocida con paralelismo limitado, `Parallel.ForEachAsync` es más simple.',
        },
      ],
    },
    {
      id: 'seguridad',
      title: 'Seguridad y autenticación',
      body: [
        'Separá autenticación de autorización y conocé cómo las modela ASP.NET Core: esquemas de autenticación, claims, políticas con `AddAuthorization` y `[Authorize]` o `RequireAuthorization` en endpoints. Las políticas basadas en claims o en requisitos propios escalan mejor que chequear roles a mano en cada endpoint.',
        'JWT con `AddJwtBearer`: validar issuer, audience, firma y expiración, con tokens emitidos por un proveedor de identidad (Microsoft Entra ID, Auth0, Keycloak u otro) en vez de armar tu propio servidor de tokens. Sabé comparar cookies y JWT, explicar access y refresh tokens y por qué revocar un JWT es difícil. Para contraseñas propias, ASP.NET Core Identity ya resuelve el hashing.',
        'Medidas que conviene nombrar: HTTPS y HSTS, CORS restrictivo, rate limiting con el middleware integrado, validación de entrada, queries parametrizadas (EF Core lo hace, pero `FromSqlRaw` con strings concatenados no), protección contra mass assignment usando DTOs, headers de seguridad, y secretos en Key Vault o variables de entorno. Auditá paquetes con `dotnet list package --vulnerable` o Dependabot.',
        'Para senior, el diseño completo: OAuth 2.0 y OpenID Connect, scopes por API, autenticación entre servicios con client credentials o managed identities en la nube, y logs que no filtren tokens ni datos personales.',
      ],
      checklist: [
        {
          text: 'Configurar autenticación JWT y validar sus parámetros',
          explanation:
            'Con `builder.Services.AddAuthentication().AddJwtBearer(o => { o.Authority = "https://login.tu-idp.com/"; o.Audience = "api://orders"; });` la app descarga la metadata OpenID Connect y las claves públicas del proveedor (Entra ID, Auth0, Keycloak) y valida cada token. Los `TokenValidationParameters` tienen que validar emisor, audiencia, vencimiento y firma (`ValidateIssuer`, `ValidateAudience`, `ValidateLifetime`, `ValidateIssuerSigningKey`, todos en true); el `ClockSkew` por defecto tolera 5 minutos de diferencia, y conviene bajarlo si usás tokens cortos. Preferí claves asimétricas del proveedor; si firmás vos con una clave simétrica, que sea larga y venga de un vault. Con `MapInboundClaims = false` conservás los nombres originales de los claims (`sub`, `role`) en vez de los URIs largos de Microsoft. Error común: desactivar validaciones para que funcione en desarrollo y olvidarse en producción, o no validar la audiencia y aceptar tokens emitidos para otra API.',
        },
        {
          text: 'Definir políticas de autorización basadas en claims',
          explanation:
            'Una política agrupa requisitos con nombre: `builder.Services.AddAuthorizationBuilder().AddPolicy("CanRefund", p => p.RequireAuthenticatedUser().RequireClaim("scope", "payments:refund"));`, y la aplicás con `[Authorize(Policy = "CanRefund")]` o `.RequireAuthorization("CanRefund")` en Minimal APIs. Para reglas que no se expresan con un claim, creás un requirement (`IAuthorizationRequirement`) y su `AuthorizationHandler<T>`, por ejemplo una edad mínima o un plan pago. Para chequear que el recurso pertenece al usuario usás autorización basada en recursos: `await authorizationService.AuthorizeAsync(User, order, "IsOwner")` después de cargar el pedido, que es lo que previene broken access control. Configurá una fallback policy que exija usuario autenticado, así todo endpoint nuevo queda protegido por defecto. Preferí políticas a `[Authorize(Roles = "...")]` desparramados: centralizan las reglas y se testean mejor.',
        },
        {
          text: 'Comparar cookies y JWT incluyendo revocación',
          explanation:
            'Con cookies, el navegador manda la credencial solo en cada request; marcadas `HttpOnly`, `Secure` y `SameSite` no las puede leer JavaScript, lo que mitiga XSS, pero necesitás protección CSRF (antiforgery) si `SameSite` no alcanza. Si la sesión vive en el servidor, revocar es inmediato: borrás la sesión (ASP.NET Core Identity además invalida cookies con el security stamp). Un JWT bearer es autocontenido y stateless, ideal para APIs consumidas por apps móviles, otros servicios o varios dominios, pero es válido hasta que vence: no se puede revocar sin agregar estado. Por eso se usan access tokens cortos (5 a 15 minutos) con refresh tokens rotativos y revocables guardados del lado del servidor, o una denylist por `jti`. Para una SPA, lo recomendado hoy es el patrón BFF: el backend guarda los tokens y el navegador solo tiene una cookie, porque un JWT en `localStorage` queda expuesto a cualquier XSS.',
        },
        {
          text: 'Configurar rate limiting y CORS en ASP.NET Core',
          explanation:
            'El rate limiting viene integrado: `builder.Services.AddRateLimiter(o => { o.RejectionStatusCode = 429; o.AddFixedWindowLimiter("api", l => { l.PermitLimit = 100; l.Window = TimeSpan.FromMinutes(1); }); });`, después `app.UseRateLimiter()` y en los endpoints `.RequireRateLimiting("api")`. Hay algoritmos de ventana fija, ventana deslizante, token bucket y de concurrencia, y con un `PartitionedRateLimiter` limitás por usuario, API key o IP en vez de globalmente. Los contadores viven en la memoria de cada instancia; con varias instancias, el límite real se multiplica, así que para límites estrictos se usa el gateway o un store distribuido. CORS se configura con `AddCors(o => o.AddPolicy("web", p => p.WithOrigins("https://app.ejemplo.com").AllowAnyHeader().WithMethods("GET", "POST")))` y `app.UseCors("web")` antes de la autenticación. CORS no es seguridad del servidor: solo le indica al navegador qué orígenes pueden leer las respuestas, y combinar cualquier origen con credenciales no está permitido.',
        },
        {
          text: 'Explicar dónde guardar secretos en desarrollo y en producción',
          explanation:
            'En desarrollo, User Secrets: `dotnet user-secrets set "ConnectionStrings:Db" "..."` guarda los valores en un JSON dentro de tu perfil de usuario, fuera del repo, y ASP.NET Core los carga solo en Development; no están cifrados, solo evitan que los commitees. En producción, un gestor de secretos: Azure Key Vault (con `builder.Configuration.AddAzureKeyVault(...)` y Managed Identity, así la app no necesita ninguna credencial para leerlo), AWS Secrets Manager, o secretos de Kubernetes sincronizados desde un vault; como mínimo, variables de entorno inyectadas por la plataforma. Mejor todavía es eliminar el secreto: con Managed Identity la app se autentica contra Azure SQL o Storage sin contraseña. Nunca pongas secretos en `appsettings.json` commiteado, activá secret scanning en el repo, rotalos periódicamente y cuidá no loguear connection strings.',
        },
        {
          text: 'Explicar cuándo EF Core no te protege de SQL injection',
          explanation:
            'Las consultas LINQ siempre se parametrizan, y `FromSql($"SELECT * FROM Users WHERE Email = {email}")` también, porque recibe un `FormattableString` y convierte cada interpolación en un parámetro. El riesgo aparece con los métodos `Raw`: `FromSqlRaw` o `ExecuteSqlRaw` con un string concatenado o interpolado antes de pasarlo (`FromSqlRaw($"... {email}")`) mandan el valor como texto literal y son inyectables. Tampoco se pueden parametrizar identificadores, como el nombre de una columna en un `ORDER BY` dinámico o el nombre de una tabla: ahí tenés que validar contra una lista blanca de valores permitidos. Lo mismo vale para Dapper y ADO.NET: siempre parámetros, nunca concatenación. En el code review, cualquier `Raw` con interpolación debería prender una alarma.',
        },
      ],
    },
    {
      id: 'testing',
      title: 'Testing en .NET',
      body: [
        'La base es xUnit (también se usan NUnit y MSTest) con un framework de mocks como NSubstitute o Moq: tests unitarios de servicios con dependencias reemplazadas por interfaces. Practicá arrange, act y assert, `[Theory]` con datos para cubrir varios casos y testear tanto el camino feliz como los errores.',
        'Para integración, `WebApplicationFactory` levanta la API en memoria y te da un `HttpClient` para pegarle a los endpoints reales, reemplazando servicios con `ConfigureTestServices`. Combinalo con Testcontainers para tener una base real; el provider InMemory de EF Core no se comporta como una base relacional y esconde bugs.',
        'Lo que buscan los entrevistadores es criterio: no mockear el `DbContext`, testear lógica de negocio y bordes de la API, tests independientes y rápidos, y datos de prueba claros. Un error común es acoplar los tests a detalles de implementación que se rompen con cada refactor.',
        'Para senior, la estrategia de una solución grande: proporción de unitarios e integración, contract tests entre servicios, tests de arquitectura (NetArchTest o ArchUnitNET) para cuidar dependencias entre proyectos, y la suite como condición para mergear en CI.',
      ],
      checklist: [
        {
          text: 'Escribir un test con xUnit y un mock de una dependencia',
          explanation:
            'En xUnit, `[Fact]` marca un test y `[Theory]` con `[InlineData]` uno parametrizado; se crea una instancia nueva de la clase por cada test, así que el constructor es el setup y `IDisposable` o `IAsyncLifetime` el teardown, y lo compartido va en un `IClassFixture<T>`. Para el mock, con NSubstitute: `var repo = Substitute.For<IOrderRepository>(); repo.GetAsync(1).Returns(order);`, creás el servicio con `new OrderService(repo)`, ejecutás y verificás el resultado y, si importa el efecto, `await repo.Received(1).SaveAsync(Arg.Any<Order>())`; con Moq es equivalente con `Setup` y `Verify`. Ojo con las licencias: FluentAssertions pasó a licencia comercial en su versión 8, así que muchos equipos usan Shouldly o las assertions de xUnit. Testeá comportamiento observable, no mockees el `DbContext` (usá una base real en tests de integración) y no mockees todo: si el setup es más largo que el test, algo anda mal.',
        },
        {
          text: 'Hacer tests de integración con `WebApplicationFactory`',
          explanation:
            'El paquete `Microsoft.AspNetCore.Mvc.Testing` trae `WebApplicationFactory<Program>`, que levanta tu aplicación completa en memoria con `TestServer`, con el mismo `Program.cs`, middleware, DI y configuración, sin abrir puertos. Lo usás como fixture: `public class OrdersTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>`, y en el test `var client = factory.CreateClient(); var res = await client.GetAsync("/orders/1");`, después verificás status code y cuerpo deserializado con `ReadFromJsonAsync<T>()`. Con top-level statements, `Program` tiene que ser visible para el proyecto de tests (en versiones anteriores a .NET 10 se agregaba `public partial class Program {}`). Así probás routing, binding, validación, serialización, autorización y manejo de errores juntos. Sumale una base real con Testcontainers para cubrir también las queries.',
        },
        {
          text: 'Reemplazar servicios en tests con `ConfigureTestServices`',
          explanation:
            'Creás una subclase de `WebApplicationFactory<Program>` y sobrescribís `ConfigureWebHost(IWebHostBuilder builder)` con `builder.ConfigureTestServices(services => { services.RemoveAll<IEmailSender>(); services.AddSingleton<IEmailSender, FakeEmailSender>(); });`. `ConfigureTestServices` corre después de los registros de tu app, por eso tus reemplazos ganan; si usás `ConfigureServices`, corre antes y la app te pisa los cambios, que es un error muy común. Lo típico es reemplazar dependencias externas (email, pagos, APIs de terceros) por fakes, apuntar el `DbContext` a la base del contenedor de test y registrar un authentication handler de prueba que autentique a un usuario fijo, para probar endpoints protegidos sin un proveedor real. Con `builder.UseEnvironment("Testing")` podés cargar configuración específica de tests.',
        },
        {
          text: 'Usar Testcontainers en vez del provider InMemory',
          explanation:
            'El provider InMemory de EF Core no es una base relacional: no tiene constraints, claves foráneas ni transacciones reales, y ejecuta tu LINQ en memoria, así que queries que fallan al traducirse a SQL o que se comportan distinto (mayúsculas, nulls, fechas) pasan igual; la propia documentación de Microsoft desaconseja usarlo para testing. Con Testcontainers (`Testcontainers.PostgreSql` o `Testcontainers.MsSql`) levantás la base real en Docker: `var db = new PostgreSqlBuilder().Build();`, lo arrancás en `InitializeAsync` de un `IAsyncLifetime`, pasás `db.GetConnectionString()` al `DbContext` y aplicás las migraciones. Para que la suite sea rápida, compartí un contenedor por colección de tests con una fixture y limpiá los datos entre tests (por ejemplo con Respawn) en vez de crear un contenedor por test. Necesitás Docker en las máquinas de desarrollo y en CI.',
        },
        {
          text: 'Proponer una estrategia de testing para una solución grande',
          explanation:
            'Muchos tests unitarios sobre dominio y lógica de aplicación, que son rápidos y no necesitan infraestructura; tests de integración por API con `WebApplicationFactory` y Testcontainers que cubran endpoints con base real; y tests de arquitectura con NetArchTest o ArchUnitNET que fijen las dependencias entre proyectos (que el dominio no referencie infraestructura, por ejemplo). Si hay varios servicios, contract tests con Pact en lugar de un entorno compartido gigante, y unos pocos end to end con Playwright sobre los flujos críticos en staging; .NET Aspire permite además levantar la solución distribuida en tests con `Aspire.Hosting.Testing`. Organizá un proyecto de tests por proyecto, con builders de datos y fixtures compartidas. Explicá qué corre en cada push, qué antes de mergear y qué después del deploy, usá la cobertura como señal y no como objetivo, y arreglá o borrá los tests flaky.',
        },
      ],
    },
    {
      id: 'arquitectura-produccion',
      title: 'Arquitectura, escala y producción',
      body: [
        'Para soluciones grandes, sabé defender una estructura: Clean Architecture o vertical slices, con el dominio sin depender de la infraestructura, proyectos separados por responsabilidad y sin exagerar capas que no aportan. CQRS separa modelos de lectura y escritura; aplicalo donde las lecturas y escrituras tienen necesidades distintas, no en todo el sistema, y sabé que MediatR es una herramienta opcional y no un requisito del patrón.',
        'Entre servicios, HTTP con `IHttpClientFactory` (crear un `HttpClient` por request agota sockets y uno estático ignora cambios de DNS), gRPC para comunicación interna eficiente y mensajería con Azure Service Bus, RabbitMQ o Kafka, a veces con MassTransit o Wolverine. La resiliencia se arma con timeouts, retries con backoff, circuit breaker y hedging usando Polly o `Microsoft.Extensions.Http.Resilience`. Para caching, `IMemoryCache`, cache distribuida con Redis, `HybridCache` y output caching.',
        'Rendimiento y diagnóstico: medir antes de optimizar, con `dotnet-counters`, `dotnet-trace`, `dotnet-dump` y BenchmarkDotNet para micro-benchmarks. Reducir allocations con `Span<T>` y `Memory<T>`, pools y evitar boxing en código caliente. El GC tiene modos workstation y server y presiona más cuando hay muchos objetos en el Large Object Heap. Los source generators mueven trabajo de runtime a compilación (serialización JSON, logging, regex) y habilitan Native AOT, que da arranque rápido y menos memoria a cambio de no poder usar reflection libre.',
        'Observabilidad con OpenTelemetry (trazas, métricas y logs) y logging estructurado con `ILogger` o Serilog; .NET Aspire ayuda en desarrollo local de sistemas distribuidos. En contenedores, imágenes oficiales chiseled, usuario no root, health checks y graceful shutdown. Para migrar desde .NET Framework, hacelo de forma incremental (YARP para el patrón strangler fig, el upgrade assistant y bibliotecas en .NET Standard como puente).',
      ],
      checklist: [
        {
          text: 'Defender una estructura de solución y cuándo aplicar CQRS',
          explanation:
            'Las opciones habituales: capas clásicas; Clean Architecture con proyectos Domain, Application, Infrastructure y Api, donde las dependencias apuntan hacia el dominio; y Vertical Slice, donde cada feature agrupa su endpoint, su request, su handler y su acceso a datos. Defendé la elección por la complejidad: para un CRUD, cuatro proyectos y una interfaz por clase es ceremonia; para un dominio con reglas ricas, aislar el dominio paga. CQRS separa el modelo de escritura (comandos que pasan por las reglas de negocio) del de lectura (queries optimizadas, proyecciones directas a DTOs, incluso con Dapper o réplicas); no requiere dos bases ni event sourcing, y conviene cuando lecturas y escrituras tienen necesidades muy distintas, no por defecto. Sabé que MediatR pasó a licencia comercial en 2025, y que podés implementar handlers sin ninguna librería.',
        },
        {
          text: 'Explicar por qué usar `IHttpClientFactory`',
          explanation:
            'Crear un `HttpClient` nuevo por request (aunque lo liberes con `using`) abre una conexión nueva cada vez y deja sockets en `TIME_WAIT`, y bajo carga agotás los puertos disponibles; un único `HttpClient` estático evita eso pero mantiene conexiones abiertas para siempre y no se entera de cambios de DNS. `IHttpClientFactory` resuelve ambos: reutiliza y rota los handlers subyacentes (por defecto cada 2 minutos), y además centraliza la configuración con clientes nombrados o tipados (`builder.Services.AddHttpClient<GitHubClient>(c => c.BaseAddress = new Uri("https://api.github.com"))`) y permite encadenar `DelegatingHandler`s para autenticación, logging y resiliencia. Una alternativa válida es un `HttpClient` singleton con `SocketsHttpHandler { PooledConnectionLifetime = TimeSpan.FromMinutes(2) }`. Error común: inyectar un cliente tipado en un singleton, que captura su handler para siempre y anula la rotación.',
        },
        {
          text: 'Configurar resiliencia con Polly o `Microsoft.Extensions.Http.Resilience`',
          explanation:
            '`Microsoft.Extensions.Http.Resilience` está construido sobre Polly v8 y lo más simple es `builder.Services.AddHttpClient<PaymentsClient>().AddStandardResilienceHandler();`, que arma un pipeline con rate limiter, timeout total, reintentos con backoff exponencial y jitter, circuit breaker y timeout por intento; los valores se ajustan en sus opciones. El circuit breaker deja de llamar a una dependencia que viene fallando y responde rápido hasta probar de nuevo, protegiendo a ambos lados. Para código que no es HTTP, registrás un pipeline con `AddResiliencePipeline("db", b => b.AddRetry(...).AddTimeout(...))` y lo usás desde `ResiliencePipelineProvider`. Reintentá solo operaciones idempotentes o con idempotency key, y con pocos intentos. Errores comunes: reintentos en varias capas que multiplican la carga, y un timeout por intento más largo que el total.',
        },
        {
          text: 'Diagnosticar un problema de performance con las herramientas `dotnet-*`',
          explanation:
            'Empezá clasificando con `dotnet-counters monitor -n MiApp`: CPU, tamaño del heap y frecuencia de GC por generación, tasa de asignaciones, cola del thread pool y excepciones por segundo te dicen si el problema es CPU, memoria o hilos bloqueados. Si es CPU, `dotnet-trace collect` genera una traza que abrís en Visual Studio, PerfView o Speedscope para ver los métodos calientes. Si es memoria, `dotnet-gcdump` saca un snapshot liviano del heap, y `dotnet-dump collect` un dump completo que analizás con `dotnet-dump analyze` (`dumpheap -stat` para ver qué tipos ocupan más y `gcroot` para saber quién los retiene); el dump también sirve para ver hilos bloqueados. En contenedores, instalalas en la imagen o usá un contenedor sidecar con acceso al proceso. Para comparar alternativas puntuales de código, BenchmarkDotNet; para optimizar, primero medí.',
        },
        {
          text: 'Explicar `Span<T>`, source generators y los trade-offs de Native AOT',
          explanation:
            '`Span<T>` y `ReadOnlySpan<T>` son vistas sobre memoria contigua (un array, un string, memoria de `stackalloc` o nativa) que permiten leer y cortar sin copiar ni asignar: parsear un string con `span.Slice(...)` en vez de `Substring` evita crear strings intermedios. Son `ref struct`, así que solo viven en el stack (no pueden ser campos de una clase); para guardarlos o usarlos entre awaits está `Memory<T>`. Los source generators generan código en compilación en lugar de usar reflexión en runtime: `JsonSerializerContext` para System.Text.Json, `[LoggerMessage]` para logging eficiente, `[GeneratedRegex]` para regex compiladas; arrancan más rápido y son compatibles con AOT. Native AOT compila la app a un binario nativo: arranque en milisegundos, menos memoria e imágenes chicas, ideal para serverless, CLIs y servicios que escalan a cero. A cambio, no hay generación de código dinámico, las librerías que dependen de reflexión pueden romperse (hay que resolver los warnings de trimming), MVC con controllers no está soportado, el soporte de EF Core es limitado, el build es por plataforma y el throughput pico puede ser menor que con el JIT.',
        },
        {
          text: 'Instrumentar un servicio con OpenTelemetry',
          explanation:
            '.NET ya trae las APIs de instrumentación: `ActivitySource` para trazas, `Meter` para métricas e `ILogger` para logs; OpenTelemetry se encarga de recolectarlas y exportarlas. Con el paquete `OpenTelemetry.Extensions.Hosting`: `builder.Services.AddOpenTelemetry().ConfigureResource(r => r.AddService("orders")).WithTracing(t => t.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation().AddSource("Orders")).WithMetrics(m => m.AddAspNetCoreInstrumentation().AddRuntimeInstrumentation()).UseOtlpExporter();` y `builder.Logging.AddOpenTelemetry(...)` para que los logs lleven el trace ID. Para spans propios: `using var activity = source.StartActivity("ProcessOrder"); activity?.SetTag("order.id", id);`. Mandá todo por OTLP a un collector y de ahí a Grafana, Jaeger, Application Insights o el proveedor que sea; las service defaults de .NET Aspire te dejan esto armado y su dashboard sirve en desarrollo. Cuidá el sampling en producción y no uses valores de alta cardinalidad, como ids de usuario, como dimensiones de métricas.',
        },
        {
          text: 'Planificar una migración incremental desde .NET Framework',
          explanation:
            'Primero inventario: qué proyectos hay, qué dependencias no existen en .NET moderno (WCF del lado servidor, Web Forms, `System.Web`, Remoting, AppDomains) y qué tests tenés; las herramientas de análisis de Microsoft para modernización ayudan a medir el trabajo. Las librerías se pasan primero a proyectos SDK-style con multi-targeting (`net48` y `net10.0`) o a .NET Standard 2.0, así las comparten ambas apps durante la transición. Para la app web se usa strangler fig: una nueva app ASP.NET Core con YARP adelante que atiende las rutas ya migradas y reenvía el resto a la app vieja, con `System.Web Adapters` para compartir sesión y autenticación entre ambas. WCF se reemplaza con CoreWCF, gRPC o REST; Web Forms no tiene camino automático y se reescribe; EF6 a EF Core tiene diferencias de comportamiento que hay que probar. Migrá por funcionalidad, con tests de caracterización antes de tocar, apuntando a .NET 10 LTS.',
        },
      ],
    },
    {
      id: 'ejercicios',
      title: 'Live coding, take-home y system design',
      body: [
        'El live coding en .NET suele ser lógica con colecciones y LINQ, modelado con clases e interfaces, un endpoint con validación o un problema de algoritmos de dificultad media. Practicá escribir C# fuera de Visual Studio o Rider, porque el editor compartido puede no tener IntelliSense. Repetí el problema con tus palabras, acordá casos borde y usá LINQ donde aclara, no para mostrar.',
        'El take-home suele ser una API con ASP.NET Core y EF Core: cuidá la estructura, DTOs, validación, manejo global de errores, migraciones, tests unitarios y de integración con `WebApplicationFactory`, y un `README` con cómo correrlo con `docker compose up`. Documentá decisiones y lo que harías con más tiempo. Si usaste IA, entendé y podé defender cada línea.',
        'En system design seguí un orden: requisitos, estimación de volumen, API, modelo de datos, diseño de alto nivel y profundizar en los cuellos de botella. En empresas .NET es común que el diseño se apoye en servicios de Azure; sabé nombrar equivalentes (colas, cache, almacenamiento) sin atarte a un proveedor si no te lo piden.',
      ],
      checklist: [
        {
          text: 'Resolver un ejercicio con colecciones y LINQ sin IntelliSense',
          explanation:
            'Practicá en un editor sin autocompletado hasta tener de memoria lo más usado: `Dictionary<TKey, TValue>` con `TryGetValue` y `GetValueOrDefault`, `HashSet<T>`, `Queue<T>`, `Stack<T>`, `PriorityQueue<TElement, TPriority>` para top k o Dijkstra, y `SortedDictionary` cuando necesitás orden. De LINQ: `GroupBy`, `ToDictionary`, `OrderBy` con `ThenBy`, `Select`, `Where`, `Any`, `Aggregate`, `DistinctBy`, `MaxBy`, `Chunk`, y `CountBy` de .NET 9; por ejemplo, las tres palabras más frecuentes: `words.CountBy(w => w).OrderByDescending(p => p.Value).Take(3)`. Conocé la complejidad: `List.Contains` es O(n) y `HashSet.Contains` O(1) promedio. Errores comunes: modificar una colección dentro de su `foreach`, que lanza `InvalidOperationException`, y enumerar varias veces una consulta diferida. Antes de codear, decí qué estructura elegís y por qué.',
        },
        {
          text: 'Modelar un problema con clases e interfaces bien separadas',
          explanation:
            'Partí de los requisitos y los conceptos del problema (una biblioteca: libro, socio, préstamo, multa) y dale a cada clase una responsabilidad clara. Poné interfaces donde el comportamiento varía, por ejemplo `IFinePolicy` con distintas reglas de multa, para sumar casos sin modificar lo existente, y preferí composición a herencia. Protegé las invariantes: setters privados o `init`, y métodos con intención como `loan.Return(DateOnly date)` que validan el estado, en vez de propiedades públicas modificables desde cualquier lado; usá `record` para value objects como `Money`. No crees una interfaz por cada clase solo por costumbre, ni clases estáticas de helpers que hacen de todo. Explicá en voz alta qué dejás afuera y por qué.',
        },
        {
          text: 'Entregar una API ASP.NET Core con tests, migraciones y `README`',
          explanation:
            'Repasá esta lista antes de entregar: estructura de solución coherente y justificada, validación y errores con `ProblemDetails` y códigos correctos, migraciones de EF Core commiteadas (y cómo se aplican), tests unitarios y de integración con `WebApplicationFactory` y Testcontainers que pasen con `dotnet test`, y un `docker compose up` que levante API y base. Sumá detalles que muestran oficio: nullable habilitado, warnings como errores, `.editorconfig`, `global.json` fijando el SDK, OpenAPI documentado y ningún secreto en `appsettings.json`. El `README` explica cómo correrlo y testearlo, decisiones, supuestos y qué harías con más tiempo. Commits chicos con mensajes claros. Error común: sobreingeniería con muchas capas y patrones para un CRUD, o dejar sin tests la lógica central.',
        },
        {
          text: 'Seguir un orden fijo para un ejercicio de system design',
          explanation:
            'Usá siempre el mismo orden: requisitos funcionales y no funcionales (unos cinco minutos de preguntas sobre usuarios, latencia, consistencia, disponibilidad), estimación de volumen (requests por segundo, almacenamiento, picos), API principal, modelo de datos y elección de base, diagrama de alto nivel, y después profundizar en cuellos de botella: caché, colas, particionado, réplicas. Cerrá con fallas (qué pasa si cae cada componente), observabilidad y trade-offs. Dejá que el entrevistador marque dónde profundizar, pero volvé al orden si te perdés. Practicá dos o tres problemas clásicos (acortador de URLs, sistema de pedidos, notificaciones) con reloj, en voz alta y dibujando.',
        },
        {
          text: 'Nombrar los componentes de nube que usarías y por qué',
          explanation:
            'En empresas .NET la nube más común es Azure, así que conocé sus piezas y justificá cada una por un requisito, no por el nombre. Cómputo: App Service para una web simple, Azure Container Apps para contenedores con escalado automático (incluso a cero) y AKS si necesitás Kubernetes completo; Azure Functions para eventos esporádicos. Datos: Azure SQL o PostgreSQL Flexible Server para relacional, Cosmos DB para escala global y modelo documental, Redis para caché y Blob Storage para archivos. Mensajería: Service Bus para colas y topics con garantías de entrega, sesiones para orden y dead letter queue; Event Hubs para streaming de alto volumen (compatible con Kafka); Event Grid para enrutar eventos. Transversales: Key Vault para secretos, Entra ID para identidad, API Management o Front Door en el borde, y Application Insights y Azure Monitor para observabilidad. Si la empresa usa AWS, sabé los equivalentes: ECS o EKS, RDS, SQS y SNS, Secrets Manager y CloudWatch.',
        },
      ],
    },
    {
      id: 'dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta y aclará el alcance antes de resolver: qué volumen, qué consistencia, qué pasa ante errores. Si no sabés algo, decilo y contá cómo lo investigarías o qué sabés de algo relacionado; inventar se nota y resta mucho.',
        'Para preguntas de comportamiento usá STAR: situación, tarea, acción y resultado, contando lo que hiciste vos y con un resultado concreto. Prepará historias sobre un incidente en producción, un desacuerdo técnico, un error propio y una mejora que impulsaste.',
        'Llevá preguntas para la empresa: en qué versión de .NET están y cómo actualizan, si hay código en .NET Framework, cómo despliegan, cómo manejan guardias e incidentes y cómo se toman las decisiones de arquitectura.',
        'Checklist final: probá cámara, micrófono y el editor; tené tu proyecto listo; repasá el stack de la búsqueda; dormí bien. Después anotá lo que no supiste y estudialo para la próxima.',
      ],
      checklist: [
        {
          text: 'Pensar en voz alta y aclarar el alcance antes de resolver',
          explanation:
            'Antes de escribir código, reformulá el problema con tus palabras y preguntá lo que falta: tamaño de la entrada, casos borde (colección vacía, nulos, duplicados), qué devolver ante errores, y en diseño, volumen y consistencia esperada. Proponé primero una solución simple con su complejidad y después mejorala; mientras codeás, narrá qué hacés y por qué ("uso un `Dictionary` para buscar en O(1)"). Al final recorré el código a mano con un ejemplo y un caso borde. El entrevistador evalúa el proceso tanto como el resultado, y si estás en silencio no puede ayudarte. Se entrena con mock interviews o grabándote mientras resolvés.',
        },
        {
          text: 'Admitir lo que no sabés y explicar cómo lo averiguarías',
          explanation:
            'Decilo de frente y sumá lo que sí sabés: "No lo usé en producción, pero entiendo que funciona así, y lo confirmaría en Microsoft Learn o con una prueba chica". Razonar desde principios vale mucho: si no recordás un detalle del GC o de EF Core, explicá qué esperarías y por qué. Contá cómo lo investigarías: documentación oficial, el código fuente de .NET (es abierto y navegable en source.dot.net), un experimento mínimo, logs del SQL generado o un profiler. Inventar se detecta enseguida y resta más que un "no sé", porque pone en duda todo lo demás.',
        },
        {
          text: 'Tener tres o cuatro historias preparadas con formato STAR',
          explanation:
            'STAR es Situación (contexto breve), Tarea (qué te tocaba resolver), Acción (qué hiciste vos, en primera persona y con detalle técnico) y Resultado (medible si se puede, más lo que aprendiste). Prepará historias para las preguntas típicas: un conflicto con un compañero o con producto, un error tuyo o un incidente en producción, una decisión técnica difícil con trade-offs, y una situación de liderazgo o mentoría. Escribilas, ensayalas en voz alta hasta que duren unos dos minutos y adaptalas, porque una buena historia responde varias preguntas. Error común: extenderse en el contexto y pasar rápido por la acción, que es justamente lo que evalúan.',
        },
        {
          text: 'Llevar al menos tres preguntas para la empresa',
          explanation:
            'Prepará preguntas que te ayuden a decidir y muestren interés real: sobre el equipo y el proceso (cómo y cada cuánto despliegan, cómo es el code review, si hay guardias), sobre la tecnología (qué versión de .NET usan y cómo encaran las actualizaciones, si queda código en .NET Framework, cómo manejan la deuda técnica) y sobre el crecimiento (qué se espera de vos en los primeros seis meses, cómo se evalúa el desempeño). Adaptalas a quién tenés enfrente: técnicas para un técnico, prioridades y desafíos para liderazgo. Evitá preguntar lo que está en la web de la empresa y dejá salario y beneficios para recruiting.',
        },
        {
          text: 'Probar el entorno técnico antes de empezar',
          explanation:
            'Media hora antes revisá cámara, micrófono, conexión y que puedas compartir pantalla en la plataforma que usen (Teams es muy común en empresas .NET), con la app instalada y los permisos dados. Si vas a usar tu IDE, tené el SDK de .NET correcto instalado, un proyecto que compile y los paquetes de NuGet ya restaurados, porque restaurarlos en vivo puede tardar. Si es en CoderPad o similar, probá antes cómo compila y corre C#. Cerrá notificaciones y pestañas con información privada, y tené un plan B: datos del celular como hotspot y un contacto del entrevistador a mano.',
        },
      ],
    },
  ],
};
