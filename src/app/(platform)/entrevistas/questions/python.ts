import type { InterviewQuestion, Seniority } from './types';

export const pythonQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'python',
      question: '¿Qué diferencia hay entre una lista y una tupla?',
      answer:
        'Las listas son mutables (podés agregar, quitar o cambiar elementos) y las tuplas son inmutables. Por ser inmutables, las tuplas pueden usarse como claves de un diccionario o elementos de un `set` si su contenido también es hashable. Se usan tuplas para agrupar datos fijos y listas para colecciones que cambian.',
    },
    {
      topic: 'python',
      question: '¿Qué tipos son mutables e inmutables en Python?',
      answer:
        'Inmutables: `int`, `float`, `str`, `bool`, `tuple`, `frozenset` y `bytes`. Mutables: `list`, `dict`, `set`, `bytearray` y la mayoría de los objetos de clases propias. Importa porque al pasar un objeto mutable a una función, los cambios adentro se ven afuera.',
    },
    {
      topic: 'python',
      question: '¿Por qué es un error usar una lista como valor por defecto de un parámetro?',
      answer:
        'Porque el valor por defecto se evalúa una sola vez, al definir la función, y se comparte entre todas las llamadas: si lo mutás, el cambio persiste. El patrón correcto es usar `None` como default y crear la lista adentro: `if items is None: items = []`.',
    },
    {
      topic: 'python',
      question: '¿Qué diferencia hay entre `==` e `is`?',
      answer:
        '`==` compara valores (llama a `__eq__`) e `is` compara identidad, es decir, si son el mismo objeto en memoria. `is` se usa para comparar con singletons como `None` (`x is None`), no para comparar números o strings.',
    },
    {
      topic: 'python',
      question: '¿Qué son las list comprehensions?',
      answer:
        'Una sintaxis compacta para construir listas a partir de un iterable, con filtro opcional: `[x * 2 for x in nums if x > 0]`. Existen también para diccionarios y sets. Si no necesitás la lista completa en memoria, una generator expression con paréntesis es más eficiente.',
    },
    {
      topic: 'python',
      question: '¿Qué son `*args` y `**kwargs`?',
      answer:
        '`*args` recibe argumentos posicionales extra como una tupla y `**kwargs` recibe argumentos con nombre extra como un diccionario. Sirven para funciones flexibles o para reenviar argumentos a otra función, por ejemplo en decoradores.',
    },
    {
      topic: 'entornos',
      question: '¿Para qué sirve un entorno virtual?',
      answer:
        'Aísla las dependencias de cada proyecto para que no choquen versiones entre proyectos ni con el Python del sistema. Se crea con `python -m venv .venv` (o lo manejan herramientas como Poetry o uv) y las dependencias se declaran en `pyproject.toml` o `requirements.txt`.',
    },
    {
      topic: 'errores',
      question: '¿Cómo manejás excepciones en Python?',
      answer:
        'Con `try`/`except` capturando excepciones específicas, nunca un `except:` vacío que oculta errores. `else` corre si no hubo excepción y `finally` siempre corre, útil para liberar recursos. Para relanzar con contexto se usa `raise NuevoError(...) from e`.',
    },
    {
      topic: 'python',
      question: '¿Qué es un context manager y para qué sirve `with`?',
      answer:
        'Es un objeto que define `__enter__` y `__exit__` para preparar y liberar un recurso de forma segura. `with open("f.txt") as f:` garantiza que el archivo se cierre aunque haya una excepción. También se pueden crear con el decorador `contextlib.contextmanager`.',
    },
    {
      topic: 'python',
      question: '¿Qué hace `if __name__ == "__main__":`?',
      answer:
        'Ejecuta ese bloque solo cuando el archivo se corre directamente y no cuando se importa como módulo. Permite que un archivo sea a la vez un módulo reutilizable y un script ejecutable.',
    },
    {
      topic: 'tipado',
      question: '¿Qué son los type hints y se validan en tiempo de ejecución?',
      answer:
        'Son anotaciones de tipos como `def suma(a: int, b: int) -> int`. Python no las valida al ejecutar: sirven para documentación, autocompletado y chequeo estático con herramientas como mypy o pyright. Librerías como Pydantic sí las usan para validar datos en runtime.',
    },
    {
      topic: 'python',
      question: '¿Qué diferencia hay entre un diccionario y un set?',
      answer:
        'Un diccionario guarda pares clave-valor y un set guarda solo valores únicos. Ambos usan una tabla hash, por lo que buscar, insertar y borrar es O(1) promedio y los elementos (o claves) deben ser hashables. Desde Python 3.7 los diccionarios mantienen el orden de inserción.',
    },
    {
      topic: 'frameworks',
      question: '¿Qué diferencias hay entre Django, Flask y FastAPI?',
      answer:
        'Django es un framework completo con ORM, admin, autenticación y migraciones incluidos. Flask es minimalista y agregás lo que necesitás con extensiones. FastAPI está pensado para APIs, es async, usa type hints con Pydantic para validar y genera documentación OpenAPI automáticamente.',
    },
    {
      topic: 'http',
      question:
        '¿Qué códigos de estado HTTP devolverías al crear, no encontrar o recibir datos inválidos?',
      answer:
        '201 Created al crear un recurso, 404 Not Found si no existe y 400 Bad Request o 422 Unprocessable Entity si los datos son inválidos (FastAPI usa 422 por defecto). Para errores inesperados del servidor, 500.',
    },
    {
      topic: 'testing',
      question: '¿Cómo escribís un test simple con pytest?',
      answer:
        'Creás una función que empiece con `test_` en un archivo `test_*.py` y usás `assert` directamente: `assert suma(2, 3) == 5`. pytest descubre y corre los tests, y muestra un detalle claro de las diferencias cuando un assert falla.',
    },
    {
      topic: 'bases de datos',
      question: '¿Qué es un ORM y qué ventajas y desventajas tiene?',
      answer:
        'Mapea tablas a clases y filas a objetos, como el ORM de Django o SQLAlchemy. Ventajas: menos SQL repetitivo, protección contra SQL injection y portabilidad. Desventajas: puede generar queries ineficientes si no entendés qué SQL produce, como el problema N+1.',
    },
    {
      topic: 'python',
      question: '¿Qué es un generador y qué hace `yield`?',
      answer:
        'Es una función que produce valores de a uno con `yield`, pausando su ejecución entre cada valor. No guarda toda la secuencia en memoria, por lo que sirve para procesar archivos grandes o secuencias infinitas de forma lazy.',
    },
    {
      topic: 'seguridad',
      question: '¿Dónde guardarías las credenciales de la base de datos de tu app?',
      answer:
        'En variables de entorno o en un gestor de secretos, nunca en el código ni commiteadas en el repo. En desarrollo se suele usar un archivo `.env` ignorado por git, leído con `python-dotenv` o con `pydantic-settings`.',
    },
    {
      topic: 'python',
      question: '¿Qué es PEP 8?',
      answer:
        'La guía de estilo oficial de Python: indentación de 4 espacios, `snake_case` para funciones y variables, `PascalCase` para clases, largo de línea y orden de imports, entre otros. Hoy se aplica automáticamente con formateadores y linters como Black o Ruff.',
    },
    {
      topic: 'python',
      question: '¿Qué diferencia hay entre una copia superficial y una copia profunda?',
      answer:
        'Una copia superficial (`copy.copy` o `lista[:]`) crea un nuevo contenedor pero comparte los objetos internos. Una copia profunda (`copy.deepcopy`) copia recursivamente todo. Si la estructura tiene objetos mutables anidados, modificar la copia superficial afecta al original.',
    },
  ],
  'semi-senior': [
    {
      topic: 'concurrencia',
      question: '¿Qué es el GIL y cómo afecta la concurrencia?',
      answer:
        'El Global Interpreter Lock de CPython permite que un solo hilo ejecute bytecode de Python a la vez. Los threads sirven para trabajo de I/O (el GIL se libera mientras esperan), pero no aceleran trabajo CPU-bound; para eso se usa `multiprocessing` o extensiones en C. Python 3.13 introdujo un build experimental sin GIL.',
    },
    {
      topic: 'async',
      question: '¿Cómo funciona `asyncio` y cuándo conviene usarlo?',
      answer:
        'Usa un event loop en un solo hilo que alterna entre corrutinas (`async def`) cada vez que una hace `await` sobre I/O. Conviene para muchas operaciones de I/O concurrentes como requests HTTP o queries. No sirve para trabajo CPU-bound y requiere que las librerías también sean async.',
    },
    {
      topic: 'async',
      question: '¿Qué pasa si llamás a una función bloqueante dentro de una corrutina?',
      answer:
        'Bloquea todo el event loop: ninguna otra corrutina avanza hasta que termine, y en FastAPI se frenan todas las requests. Hay que usar la versión async de la librería o mandar la llamada a un thread con `asyncio.to_thread` o `run_in_executor`. En FastAPI, un endpoint `def` (no `async def`) ya corre en un threadpool.',
    },
    {
      topic: 'python',
      question: '¿Qué es un decorador y cómo lo implementarías?',
      answer:
        'Es una función que recibe otra función y devuelve una nueva que la envuelve, para agregar comportamiento como logging, caché o autenticación. Se implementa con una función interna `wrapper(*args, **kwargs)` y se usa `functools.wraps` para conservar el nombre y docstring de la original.',
    },
    {
      topic: 'validación',
      question: '¿Para qué sirve Pydantic?',
      answer:
        'Valida y convierte datos usando type hints: definís un modelo y Pydantic verifica tipos, aplica coerciones y genera errores claros. Se usa para validar requests en FastAPI, parsear configuración con `pydantic-settings` y serializar respuestas. La v2 tiene un núcleo en Rust y es mucho más rápida.',
    },
    {
      topic: 'bases de datos',
      question: '¿Cómo evitás el problema N+1 en Django o SQLAlchemy?',
      answer:
        'En Django con `select_related` (join para foreign keys) y `prefetch_related` (query aparte para relaciones muchos a muchos o inversas). En SQLAlchemy con opciones de carga como `joinedload` o `selectinload`. Se detecta revisando las queries generadas, por ejemplo con django-debug-toolbar o logueando el SQL.',
    },
    {
      topic: 'bases de datos',
      question: '¿Cómo manejás migraciones de base de datos en Python?',
      answer:
        'Con `makemigrations` y `migrate` en Django o con Alembic en SQLAlchemy. Las migraciones se versionan en el repo, se revisan antes de aplicar y se corren en el deploy. Para tablas grandes hay que evitar operaciones que bloqueen, y separar cambios incompatibles en varios pasos.',
    },
    {
      topic: 'testing',
      question: '¿Qué son los fixtures de pytest y cómo mockeás dependencias?',
      answer:
        'Los fixtures son funciones decoradas con `@pytest.fixture` que preparan datos o recursos y se inyectan por nombre en los tests, con scopes (`function`, `module`, `session`) y teardown con `yield`. Para mockear se usa `unittest.mock` (`patch`, `MagicMock`) o el fixture `monkeypatch`, parcheando donde el objeto se usa, no donde se define.',
    },
    {
      topic: 'background',
      question: '¿Cuándo usarías Celery y cómo funciona?',
      answer:
        'Para ejecutar tareas fuera del ciclo de la request: envío de emails, procesamiento de archivos o tareas programadas. La app encola mensajes en un broker (Redis o RabbitMQ) y workers separados los procesan. Las tareas deben ser idempotentes y tener reintentos configurados.',
    },
    {
      topic: 'deploy',
      question: '¿Qué diferencia hay entre WSGI y ASGI?',
      answer:
        'WSGI es la interfaz síncrona clásica entre servidor y app (Gunicorn con Django o Flask): una request por worker a la vez. ASGI es su sucesor asíncrono, soporta `async`, WebSockets y conexiones largas, y se sirve con Uvicorn o Hypercorn. FastAPI y Django moderno pueden correr sobre ASGI.',
    },
    {
      topic: 'empaquetado',
      question: '¿Cómo gestionás dependencias de forma reproducible?',
      answer:
        'Declarando dependencias en `pyproject.toml` y fijando versiones exactas en un lockfile, con herramientas como uv, Poetry o pip-tools. El lockfile se commitea y en CI y producción se instala exactamente desde él. Así todos los entornos tienen las mismas versiones transitivas.',
    },
    {
      topic: 'performance',
      question: '¿Cómo encontrarías qué parte de tu código Python es lenta?',
      answer:
        'Midiendo con profilers: `cProfile` para ver tiempo por función, `py-spy` para perfilar un proceso en producción sin modificarlo y `line_profiler` para ir línea por línea. Muchas veces el cuello de botella está en queries o I/O, no en Python, así que también revisás tracing y logs de la base.',
    },
    {
      topic: 'python',
      question:
        '¿Qué diferencia hay entre `@staticmethod`, `@classmethod` y un método de instancia?',
      answer:
        'Un método de instancia recibe `self`. Un `@classmethod` recibe la clase (`cls`) y se usa para constructores alternativos como `from_dict`. Un `@staticmethod` no recibe ninguno de los dos: es una función agrupada en la clase por organización.',
    },
    {
      topic: 'python',
      question: '¿Para qué sirven las dataclasses?',
      answer:
        'El decorador `@dataclass` genera automáticamente `__init__`, `__repr__` y `__eq__` a partir de atributos con type hints. Con `frozen=True` las hace inmutables y con `slots=True` reduce memoria. Son ideales para objetos de datos simples sin validación; si necesitás validar input externo, Pydantic.',
    },
    {
      topic: 'api',
      question: '¿Cómo funciona la inyección de dependencias en FastAPI?',
      answer:
        'Declarás parámetros con `Depends(funcion)` y FastAPI ejecuta esa función por request y pasa su resultado al endpoint. Se usa para sesiones de base de datos, usuario autenticado o configuración. Las dependencias con `yield` permiten limpieza al final y en tests se reemplazan con `app.dependency_overrides`.',
    },
    {
      topic: 'seguridad',
      question: '¿Cómo implementarías autenticación en una API con FastAPI o Django?',
      answer:
        'Django trae sesiones y auth incorporados, y Django REST Framework suma tokens o JWT. En FastAPI se usan las utilidades de `fastapi.security` (por ejemplo OAuth2 con JWT) en una dependencia que valida el token y devuelve el usuario. Contraseñas siempre hasheadas con bcrypt o Argon2.',
    },
    {
      topic: 'logging',
      question: '¿Cómo configurarías el logging de una aplicación Python?',
      answer:
        'Con el módulo `logging`, un logger por módulo (`logging.getLogger(__name__)`) y niveles adecuados. En producción conviene logs estructurados en JSON con un request id para correlacionar, enviados a stdout para que los recolecte la plataforma. Nunca usar `print` ni loguear datos sensibles.',
    },
    {
      topic: 'python',
      question: '¿Qué son los iteradores y cómo funciona el protocolo de iteración?',
      answer:
        'Un iterable implementa `__iter__`, que devuelve un iterador; el iterador implementa `__next__` y lanza `StopIteration` al terminar. El `for` usa este protocolo por debajo. Los generadores son una forma simple de crear iteradores.',
    },
    {
      topic: 'concurrencia',
      question: '¿Cuándo usarías threads, procesos o asyncio?',
      answer:
        'asyncio para muchísimas operaciones de I/O concurrentes con librerías async. Threads para I/O con librerías bloqueantes o pocas tareas concurrentes. Procesos (`multiprocessing`, `ProcessPoolExecutor`) para trabajo CPU-bound, ya que esquivan el GIL a costa de más memoria y serialización entre procesos.',
    },
    {
      topic: 'bases de datos',
      question: '¿Cómo manejás transacciones con un ORM en Python?',
      answer:
        'En Django con `transaction.atomic()` como decorador o context manager: si hay una excepción se hace rollback. En SQLAlchemy con la `Session`, usando `with session.begin():` para commit o rollback automático. Hay que mantener las transacciones cortas y no hacer llamadas externas adentro.',
    },
  ],
  senior: [
    {
      topic: 'arquitectura',
      question: '¿Cómo estructurarías un proyecto backend grande en Python?',
      answer:
        'Por dominios o módulos con límites claros, separando la capa HTTP, la lógica de negocio y el acceso a datos (por ejemplo con repositorios o servicios). Configuración centralizada con `pydantic-settings`, tipado estricto chequeado en CI y reglas de dependencias entre módulos con herramientas como import-linter. Un monolito modular suele ser mejor punto de partida que microservicios.',
    },
    {
      topic: 'performance',
      question: '¿Cómo escalarías un servicio Python que tiene problemas de rendimiento?',
      answer:
        'Primero medir para encontrar el cuello de botella real. Luego: optimizar queries e índices, agregar caché con Redis, mover trabajo pesado a workers con colas, usar async donde haya mucho I/O, escalar horizontalmente con más workers o réplicas y, para cálculos intensivos, usar NumPy, extensiones en C/Rust o procesos.',
    },
    {
      topic: 'deploy',
      question: '¿Cómo configurarías Gunicorn o Uvicorn para producción?',
      answer:
        'Gunicorn como process manager con workers de Uvicorn para apps ASGI, o Uvicorn con `--workers`. El número de workers se ajusta según CPU y tipo de carga (un punto de partida común es `2 * núcleos + 1` para WSGI sync). Configurar timeouts, reciclado de workers con `max_requests` para mitigar fugas de memoria y graceful shutdown.',
    },
    {
      topic: 'async',
      question: '¿Qué problemas aparecen al mezclar código sync y async en un mismo servicio?',
      answer:
        'Llamadas bloqueantes que frenan el event loop, librerías sync (drivers de base, SDKs) que obligan a usar threads, y pools de conexiones separados para cada mundo. Django tiene utilidades como `sync_to_async` y `async_to_sync`, pero cada salto tiene costo. Conviene elegir un modelo dominante y aislar el otro en los bordes.',
    },
    {
      topic: 'memoria',
      question: '¿Cómo funciona la gestión de memoria en CPython y cómo investigarías una fuga?',
      answer:
        'CPython usa conteo de referencias y un recolector generacional para ciclos. Las fugas suelen venir de cachés sin límite, referencias globales o ciclos con objetos que retienen mucha memoria. Se investigan con `tracemalloc` para comparar snapshots, `objgraph` para ver qué retiene objetos y memray para perfilar asignaciones.',
    },
    {
      topic: 'sistemas distribuidos',
      question:
        '¿Cómo garantizás que una tarea de Celery no se procese dos veces con efectos duplicados?',
      answer:
        'Asumiendo entrega at-least-once y haciendo la tarea idempotente: claves de idempotencia, constraints únicas en la base o chequear el estado antes de actuar. Con `acks_late` la tarea se confirma recién al terminar, lo que evita perderla pero puede re-ejecutarla. Encolar la tarea después del commit (`transaction.on_commit` en Django) evita procesar datos que no existen.',
    },
    {
      topic: 'tipado',
      question: '¿Cómo aprovecharías el tipado estático en un código base grande de Python?',
      answer:
        'Chequeo estricto con mypy o pyright en CI, aplicado de forma incremental por módulo. Usar `Protocol` para interfaces estructurales, `TypedDict` y modelos de Pydantic para datos externos, genéricos y `Literal` para estados. Reduce bugs y hace refactors seguros, aunque requiere stubs para librerías sin tipos.',
    },
    {
      topic: 'bases de datos',
      question: '¿Cómo manejás el pool de conexiones a la base en un servicio con muchos workers?',
      answer:
        'Cada proceso tiene su propio pool, así que conexiones totales = workers × tamaño del pool × réplicas, y es fácil superar el límite de la base. Se dimensiona el pool, se usa un pooler externo como PgBouncer y se configuran timeouts y reciclado de conexiones. En Django se ajusta `CONN_MAX_AGE` o el pool nativo de versiones recientes.',
    },
    {
      topic: 'api',
      question: '¿Cómo versionarías y evolucionarías una API pública sin romper clientes?',
      answer:
        'Haciendo cambios aditivos compatibles siempre que se pueda (campos nuevos opcionales) y versionando por URL (`/v2`) o header cuando hay cambios incompatibles. Deprecación anunciada con plazos, headers de aviso y métricas de uso de versiones viejas. El esquema OpenAPI versionado y tests de contrato ayudan a detectar roturas.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué riesgos de seguridad específicos de Python tenés en cuenta?',
      answer:
        'Deserializar datos no confiables con `pickle` o `yaml.load` sin `SafeLoader` permite ejecutar código. También `eval`/`exec`, `subprocess` con `shell=True` e input del usuario, SQL armado con f-strings y SSRF en requests a URLs del usuario. Se suman auditoría de dependencias (pip-audit) y protección contra typosquatting en PyPI.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo instrumentarías un servicio Python para observabilidad?',
      answer:
        'OpenTelemetry con auto-instrumentación para el framework, el ORM y los clientes HTTP, generando trazas distribuidas. Métricas de latencia, errores y saturación (incluyendo workers ocupados y profundidad de colas), logs estructurados con trace id y alertas sobre SLOs. Para errores, una herramienta como Sentry.',
    },
    {
      topic: 'testing',
      question: '¿Cómo diseñarías la estrategia de testing de un backend Python grande?',
      answer:
        'Muchos tests unitarios rápidos de la lógica de negocio, tests de integración contra una base real (con Testcontainers o una base de test) y pocos e2e. Factories con factory_boy, tests paralelos con pytest-xdist, cobertura como señal y no como meta, y tests de contrato para APIs. Todo corriendo en CI en cada PR.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cuándo elegirías Django y cuándo FastAPI para un proyecto nuevo?',
      answer:
        'Django cuando necesitás mucho de lo que trae resuelto (admin, auth, ORM maduro, migraciones) y una app de producto con equipo grande y convenciones claras. FastAPI para APIs y microservicios con mucho I/O async, validación tipada y documentación automática, aceptando armar vos piezas como ORM, auth y migraciones.',
    },
    {
      topic: 'escalabilidad',
      question: '¿Qué estrategias de caché usarías en un backend Python?',
      answer:
        'Caché en memoria por proceso (`functools.lru_cache`) para datos inmutables, Redis compartido para datos entre workers, caché HTTP con headers y CDN para respuestas públicas. Invalidación por TTL o por eventos al escribir, y protección contra cache stampede con locks o jitter. Cuidado con cachés por proceso que quedan inconsistentes entre workers.',
    },
    {
      topic: 'python',
      question: '¿Qué son los descriptores y dónde se usan?',
      answer:
        'Objetos que definen `__get__`, `__set__` o `__delete__` y controlan el acceso a un atributo de clase. Son el mecanismo detrás de `property`, `classmethod`, `staticmethod` y de los campos de los ORMs como Django o SQLAlchemy. Útiles para validación o carga lazy reutilizable, pero agregan magia que hay que justificar.',
    },
    {
      topic: 'concurrencia',
      question: '¿Cómo procesarías millones de registros en Python de forma eficiente?',
      answer:
        'Procesando en lotes o streaming con generadores en vez de cargar todo en memoria, usando operaciones vectorizadas (pandas, Polars, NumPy) o SQL directamente en la base. Para paralelizar CPU, procesos o herramientas distribuidas; para I/O, asyncio. Inserciones con `COPY` o bulk inserts y checkpoints para poder reanudar.',
    },
    {
      topic: 'deploy',
      question: '¿Cómo armarías la imagen Docker de una app Python para producción?',
      answer:
        'Imagen base slim con versión de Python fija, multi-stage build para compilar dependencias y copiar solo lo necesario, dependencias instaladas desde el lockfile antes de copiar el código para aprovechar la caché de capas. Usuario sin privilegios, `PYTHONUNBUFFERED=1`, healthcheck y sin secretos en la imagen.',
    },
    {
      topic: 'sistemas distribuidos',
      question: '¿Cómo diseñarías la comunicación entre servicios Python?',
      answer:
        'Sincrónica (HTTP/REST o gRPC) cuando necesitás respuesta inmediata, con timeouts, reintentos con backoff y circuit breakers. Asincrónica con colas o eventos (RabbitMQ, Kafka, SQS) para desacoplar y absorber picos, con consumidores idempotentes y el patrón outbox para publicar eventos de forma consistente con la base.',
    },
    {
      topic: 'empaquetado',
      question: '¿Cómo compartirías código común entre varios servicios Python?',
      answer:
        'Como paquetes internos versionados publicados en un registry privado, o en un monorepo con workspaces (uv o Poetry). Hay que mantener las librerías compartidas chicas y estables, versionar con semver y evitar que se conviertan en un acoplamiento que obligue a desplegar todo junto.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo planificarías migrar un servicio de Python 3.8 a la última versión?',
      answer:
        'Primero tests con buena cobertura y CI corriendo en ambas versiones. Actualizar dependencias que no soporten la versión nueva, resolver deprecaciones con warnings activados y herramientas como pyupgrade o Ruff. Desplegar gradualmente (canary) midiendo errores y rendimiento, con forma de volver atrás.',
    },
  ],
};
