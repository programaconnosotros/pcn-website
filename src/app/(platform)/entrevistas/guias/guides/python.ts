import type { InterviewGuide } from './types';

export const pythonGuide: InterviewGuide = {
  track: 'python',
  summary:
    'Qué estudiar y cómo practicar para una entrevista de backend con Python, Django y FastAPI, de junior a senior.',
  sections: [
    {
      id: 'la-entrevista',
      title: 'Cómo es la entrevista',
      body: [
        'Un proceso de backend Python suele tener una charla con recruiting, una entrevista técnica sobre el lenguaje y el framework, un ejercicio práctico (live coding o take-home) y, para perfiles altos, system design y una charla de cultura o liderazgo. Python también se usa mucho en datos e IA, así que preguntá si el rol es de APIs, de pipelines o mixto: cambia bastante lo que te van a preguntar.',
        'Para junior se evalúa Python sólido: tipos mutables e inmutables, colecciones, funciones, excepciones, comprehensions, entornos virtuales y un framework básico. Esperan que escribas código claro y pythónico, que sepas armar un endpoint simple y un test con pytest. Un proyecto propio con Django o FastAPI, base de datos y tests es tu mejor carta.',
        'Para semi-senior el foco está en entender cómo funcionan las cosas por debajo: el GIL, `asyncio`, decoradores, Pydantic, el ORM sin N+1, migraciones, Celery, fixtures y mocks, logging y dependencias reproducibles. Te van a pedir ejemplos de decisiones que tomaste y problemas que resolviste.',
        'Para senior se evalúan los trade-offs: estructura de proyectos grandes, rendimiento y escalado, mezcla de sync y async, pools de conexiones con muchos workers, observabilidad, seguridad, evolución de APIs públicas y migraciones de versión. También cómo guiás técnicamente al equipo y cómo manejás la deuda técnica.',
      ],
      checklist: [
        {
          text: 'Saber qué etapas tiene el proceso y si el rol es de APIs, datos o mixto',
          explanation:
            'Un proceso típico de backend Python tiene screening con recruiter, una técnica conceptual (lenguaje, frameworks, bases de datos), un ejercicio práctico (live coding o take-home), a veces system design y una charla cultural. Python se usa en roles muy distintos: backend de APIs (Django, FastAPI, Postgres, colas), datos (pipelines, pandas o Polars, SQL pesado, Airflow) o mixtos, como un backend que sirve modelos de ML. Preguntá en la primera llamada qué hace el equipo día a día, qué stack usan y cuántas etapas hay, porque cambia mucho qué estudiar: para APIs pesan HTTP, ORMs y concurrencia; para datos, SQL avanzado, procesamiento en lotes y manejo de memoria. El error común es prepararse solo para Django cuando el rol era de datos, o al revés.',
        },
        {
          text: 'Tener un proyecto propio con Django o FastAPI que puedas explicar completo',
          explanation:
            'Elegí un proyecto y prepará el recorrido completo: qué resuelve, cómo está organizado (apps de Django o routers de FastAPI, capa de servicios, modelos), cómo fluye una request desde el servidor ASGI o WSGI hasta la base, cómo se manejan auth, migraciones, tareas en background, tests y deploy. Para cada decisión tené el por qué y la alternativa descartada: por qué FastAPI y no Django REST Framework, por qué SQLAlchemy y no el ORM de Django, por qué Celery y no una cola más simple. Practicá contarlo en 2 minutos y luego profundizar en cualquier parte, y prepará qué cambiarías hoy. Si no tenés uno laboral explicable, armá uno chico pero completo, con tests y Docker, antes de las entrevistas.',
        },
        {
          text: 'Contar dos o tres problemas reales que resolviste con contexto y resultado',
          explanation:
            'Elegí problemas técnicos concretos y con números: un endpoint de Django que hacía 300 queries y dejaste en 3 con `prefetch_related`, una tarea de Celery que se duplicaba y volviste idempotente, un proceso que consumía 8 GB y bajaste procesando en chunks. Estructuralos con contexto, problema, qué investigaste, qué hiciste vos y el resultado medible. Escribilos y practicalos en voz alta hasta contarlos en 2 o 3 minutos. El error común es quedarse en lo vago, sin métricas ni el detalle de cómo diagnosticaste, que es justamente lo que el entrevistador quiere escuchar.',
        },
        {
          text: 'Distinguir qué se espera de un junior, un semi-senior y un senior',
          explanation:
            'De un junior se espera dominio del lenguaje (tipos, mutabilidad, comprehensions, excepciones), bases de HTTP y SQL, y resolver tareas acotadas con guía. Un semi-senior entrega features completas solo, conoce bien su framework (ORM, migraciones, auth), escribe tests con pytest sin que se lo pidan y entiende problemas comunes como N+1 o código bloqueante en async. Un senior diseña sistemas, anticipa problemas de escala, concurrencia y operación, elige herramientas con trade-offs explícitos, revisa código de otros y mejora al equipo. Calibrá tus respuestas al nivel: para senior no alcanza con el cómo, tenés que explicar el por qué y cuándo no.',
        },
        {
          text: 'Explicar por qué Python es una buena o mala opción para un caso dado',
          explanation:
            'Python es buena opción cuando importa la velocidad de desarrollo y el ecosistema: APIs y backoffices con Django o FastAPI, pipelines de datos, integración con ML (PyTorch, scikit-learn) y scripting. Rinde bien en servicios I/O-bound, porque la espera de red y base no depende de la velocidad del intérprete y asyncio o varios workers dan concurrencia suficiente. Es peor opción para trabajo CPU-bound en Python puro con baja latencia (el intérprete es lento y el GIL limita threads), para binarios chicos de arranque rápido, o donde se necesita un sistema de tipos estricto en compilación. Los matices que suman: lo numérico pesado corre en C vía NumPy, el build free-threaded de 3.13 y 3.14 empieza a quitar el GIL, y se puede mover un cuello de botella a Rust con PyO3.',
        },
      ],
    },
    {
      id: 'fundamentos',
      title: 'Python y su runtime',
      body: [
        'El lenguaje se evalúa en detalle. Sabé qué tipos son mutables (listas, dicts, sets) e inmutables (tuplas, strings, números), por qué una lista como valor por defecto de un parámetro es un bug clásico, la diferencia entre `==` e `is`, y entre copia superficial y profunda. Practicá comprehensions, `*args` y `**kwargs`, desempaquetado, generadores con `yield`, context managers con `with` y el manejo de excepciones con `try`, `except`, `else` y `finally`.',
        'En orientación a objetos conocé métodos de instancia, `@classmethod` y `@staticmethod`, propiedades, herencia y los métodos especiales (`__init__`, `__repr__`, `__eq__`, `__iter__`). Las dataclasses y los decoradores son preguntas de semi-senior: sabé escribir un decorador con `functools.wraps` y explicar qué hace. Para senior pueden aparecer descriptores, el protocolo de iteración en detalle o metaclases.',
        'Los type hints no se validan en runtime: son para herramientas como mypy o Pyright y para el editor. En código base grande se usan de forma progresiva con `Protocol`, generics y `TypedDict`, y bibliotecas como Pydantic sí los usan para validar en runtime. Seguí PEP 8 y usá un formatter y linter como Ruff.',
        'Del runtime: CPython compila a bytecode y lo interpreta, gestiona memoria con conteo de referencias más un recolector de ciclos, y tiene el GIL. Conocé entornos virtuales y dependencias reproducibles: en 2026 muchos equipos usan `uv` con `pyproject.toml` y lockfile, aunque Poetry y `pip-tools` siguen presentes. Sabé en qué versión de Python estás y qué trajo de nuevo.',
      ],
      checklist: [
        {
          text: 'Explicar mutabilidad y el bug del argumento por defecto mutable',
          explanation:
            'Los objetos mutables (`list`, `dict`, `set`, instancias de clases comunes) se pueden modificar en el lugar, mientras los inmutables (`int`, `str`, `tuple`, `frozenset`) no: cualquier operación crea un objeto nuevo. Las variables son nombres que apuntan a objetos, así que dos nombres pueden compartir la misma lista y ver los cambios del otro. El bug clásico: `def add(item, items=[])`, donde el valor por defecto se evalúa una sola vez al definir la función y todas las llamadas comparten la misma lista, que crece entre llamadas. La corrección es `def add(item, items=None):` y adentro `if items is None: items = []`. Ojo también con las tuplas: son inmutables, pero si contienen una lista, esa lista sí se puede modificar.',
        },
        {
          text: 'Diferenciar `==` de `is` y copia superficial de profunda',
          explanation:
            '`==` compara igualdad de valor llamando a `__eq__`, mientras `is` compara identidad, es decir si ambos nombres apuntan al mismo objeto en memoria. Por eso `[1, 2] == [1, 2]` es `True` pero `[1, 2] is [1, 2]` es `False`. Usá `is` solo para singletons como `None`, `True` o sentinelas propios (`if x is None`), y nunca para comparar strings o números, porque el resultado depende de optimizaciones del intérprete como el cache de enteros chicos. Una copia superficial (`copy.copy(x)`, `list(x)`, `x[:]`, `dict.copy()`) crea un contenedor nuevo pero comparte los objetos internos; una profunda (`copy.deepcopy(x)`) copia recursivamente todo. Con una lista de listas, modificar una sublista de la copia superficial también cambia la original.',
        },
        {
          text: 'Escribir un generador, un context manager y un decorador',
          explanation:
            'Un generador es una función con `yield` que produce valores de a uno y bajo demanda, sin cargar todo en memoria: `def read_lines(path): with open(path) as f: for line in f: yield line.rstrip()`. Un context manager garantiza setup y cleanup con `with`; lo más corto es `@contextlib.contextmanager` sobre un generador: código antes del `yield` es el setup, y el `finally` alrededor del `yield` es el cleanup que corre aunque haya excepción. Un decorador es una función que recibe otra y devuelve una envoltura: `def timed(fn): @functools.wraps(fn) def wrapper(*args, **kwargs): start = time.perf_counter(); try: return fn(*args, **kwargs) finally: print(time.perf_counter() - start); return wrapper`. Usá siempre `functools.wraps` para conservar nombre y docstring. Practicá escribir los tres de memoria, porque es un pedido frecuente de live coding.',
        },
        {
          text: 'Explicar `@classmethod`, `@staticmethod` y dataclasses',
          explanation:
            'Un método común recibe la instancia como `self`; un `@classmethod` recibe la clase como `cls` y se usa sobre todo para constructores alternativos, como `User.from_dict(data)`, que además funcionan bien con herencia porque `cls` es la subclase real. Un `@staticmethod` no recibe ni instancia ni clase: es una función común agrupada en la clase por organización, y muchas veces conviene más una función de módulo. Las dataclasses (`@dataclass`) generan automáticamente `__init__`, `__repr__` y `__eq__` a partir de los atributos anotados, ideales para objetos de datos. Opciones útiles: `frozen=True` para inmutabilidad, `slots=True` para menos memoria, y `field(default_factory=list)` para defaults mutables, porque `items: list = []` da error justamente para evitar el bug del default compartido. Las dataclasses no validan tipos; para eso está Pydantic.',
        },
        {
          text: 'Explicar qué validan y qué no validan los type hints',
          explanation:
            'Los type hints (`def get(id: int) -> User | None`) no se verifican en runtime: Python los guarda como anotaciones y ejecuta igual si pasás un string donde va un `int`. Los chequea un type checker estático como mypy, Pyright o los más nuevos basados en Rust, en el editor y en CI, detectando errores antes de ejecutar. Sí tienen efecto en runtime cuando una librería los lee a propósito: Pydantic valida y convierte datos según las anotaciones, y FastAPI las usa para validar parámetros y generar OpenAPI. Por eso los datos externos (requests, archivos, APIs de terceros) se validan con Pydantic, y los hints internos se cuidan con el type checker. El error común es creer que anotar `data: dict[str, int]` protege contra datos mal formados.',
        },
        {
          text: 'Armar un entorno reproducible con `pyproject.toml` y lockfile',
          explanation:
            '`pyproject.toml` es el archivo estándar del proyecto: metadatos, versión de Python requerida, dependencias en `[project] dependencies` con rangos, grupos de desarrollo y configuración de herramientas como Ruff, pytest y mypy. El lockfile fija versiones exactas y hashes de todo el árbol, incluidas las transitivas, para que local, CI y producción instalen lo mismo. Hoy la herramienta más usada es uv: `uv init`, `uv add fastapi`, `uv lock` genera `uv.lock`, y `uv sync --frozen` instala exactamente eso en CI y Docker; Poetry es la alternativa clásica con `poetry.lock`. Siempre en un entorno virtual aislado (uv lo crea en `.venv`), nunca instalando en el Python del sistema. El error común es un `requirements.txt` sin versiones fijas, que se rompe cuando sale una versión nueva de una dependencia.',
        },
      ],
    },
    {
      id: 'django-fastapi-apis',
      title: 'Django, FastAPI y diseño de APIs',
      body: [
        'Django es baterías incluidas: ORM, migraciones, admin, auth, formularios y un ecosistema maduro, con Django REST Framework para APIs. FastAPI es más liviano, async nativo, con validación y documentación OpenAPI automáticas a partir de type hints y Pydantic. Flask queda como micro framework. Sabé argumentar cuándo elegirías cada uno: Django para productos con mucho CRUD, admin y equipo grande; FastAPI para APIs y servicios con mucha I/O o que sirven modelos.',
        'En Django conocé el ciclo de una request (URLconf, middleware, view, template o serializer), los serializers y viewsets de DRF, permisos y las señales con sus riesgos. En FastAPI, el sistema de inyección de dependencias con `Depends`, los modelos de Pydantic para request y response, los status codes y cuándo una ruta debe ser `def` o `async def`. Pydantic v2 es el estándar: conocé `model_validate` y los validadores.',
        'El diseño de APIs se evalúa igual que en cualquier backend: recursos, verbos HTTP, idempotencia, códigos de estado correctos (201, 204, 400, 401, 403, 404, 409, 422), paginación por offset y por cursor, filtros por query params, y un formato de error consistente. Para senior, versionado y cómo evolucionar una API pública sin romper clientes: cambios aditivos, deprecaciones con fecha y un contrato OpenAPI como fuente de verdad.',
        'Conocé WSGI contra ASGI: WSGI es sincrónico (Gunicorn), ASGI soporta async, websockets y conexiones largas (Uvicorn, Hypercorn, Daphne). Django soporta vistas async sobre ASGI, pero gran parte del ORM sigue siendo sincrónico por dentro, un detalle que suma mencionar.',
      ],
      checklist: [
        {
          text: 'Comparar Django, Flask y FastAPI y elegir uno para un caso concreto',
          explanation:
            'Django es batteries included: ORM, migraciones, admin, auth, formularios y seguridad por defecto; con Django REST Framework o Django Ninja arma APIs. Conviene para productos con mucho CRUD, backoffice y un equipo que quiere convenciones, a cambio de más acople y un modelo históricamente síncrono (el soporte async existe pero el ORM sigue siendo mayormente síncrono por dentro). Flask es minimalista y síncrono: elegís cada pieza (SQLAlchemy, Marshmallow), flexible pero con más decisiones a mantener. FastAPI es async nativo sobre Starlette, usa type hints y Pydantic para validar y generar OpenAPI automático, ideal para APIs y microservicios I/O-bound, pero sin ORM, admin ni migraciones propias (se combina con SQLAlchemy y Alembic). Ejemplo de respuesta: un marketplace con panel interno, Django; un servicio de inferencia o un gateway con muchas llamadas externas, FastAPI.',
        },
        {
          text: 'Explicar el ciclo de una request en Django y en FastAPI',
          explanation:
            'En Django el servidor WSGI o ASGI (Gunicorn, Uvicorn) entrega la request al handler, que la pasa por la cadena de middlewares en el orden de `MIDDLEWARE` (sesiones, CSRF, auth); el URL resolver busca la vista en `urls.py`, la vista (función, clase o `APIView` de DRF con autenticación, permisos, serializer y throttling) arma la respuesta, y vuelve atravesando los middlewares en orden inverso. En FastAPI, Uvicorn recibe la request ASGI, pasan los middlewares de Starlette, el router encuentra la operación, se resuelven las dependencias de `Depends` (sesión de base, usuario actual), se validan path, query y body con Pydantic (si falla, 422 automático), corre tu función y la respuesta se serializa con el `response_model`. Las excepciones se convierten en respuestas con exception handlers en FastAPI o el manejo de errores del middleware en Django.',
        },
        {
          text: 'Usar `Depends` para inyectar una sesión de base o el usuario actual',
          explanation:
            '`Depends` es el sistema de inyección de dependencias de FastAPI: declarás un parámetro como `db: Session = Depends(get_db)` (o con `Annotated[Session, Depends(get_db)]`, la forma recomendada) y el framework llama a `get_db` antes de tu endpoint. Una dependencia con `yield` sirve para recursos con cleanup: `def get_db(): db = SessionLocal(); try: yield db; finally: db.close()`, así la sesión se cierra siempre. Las dependencias se componen: `get_current_user(token = Depends(oauth2_scheme), db = Depends(get_db))` decodifica el token y busca el usuario, y lanza `HTTPException(401)` si falla; arriba de eso podés tener `require_admin`. Dentro de una misma request cada dependencia se ejecuta una sola vez y se cachea. La ventaja grande aparece en tests, donde se reemplazan con `app.dependency_overrides`.',
        },
        {
          text: 'Definir modelos de Pydantic para validar entrada y salida',
          explanation:
            "Con Pydantic v2 definís clases que heredan de `BaseModel` con atributos tipados, y al construirlas se valida y convierte el dato, lanzando `ValidationError` con el detalle de cada campo. Separá modelos de entrada y de salida: `UserCreate` con `email: EmailStr` y `password: str = Field(min_length=8)`, y `UserOut` sin la contraseña, usado como `response_model` para que FastAPI filtre los campos que no deben salir. Para leer desde objetos del ORM se usa `model_config = ConfigDict(from_attributes=True)`, y para reglas propias `@field_validator` o `@model_validator`. Con `extra='forbid'` rechazás campos desconocidos, lo que evita mass assignment. El error común es usar el mismo modelo para todo y terminar devolviendo el hash de la contraseña.",
        },
        {
          text: 'Elegir el código de estado correcto en cada caso',
          explanation:
            '200 para lecturas y actualizaciones exitosas con body, 201 al crear un recurso (con `Location` si podés), 204 cuando no hay contenido, como en un DELETE. 400 para requests mal formadas y 422 para errores de validación, que es lo que FastAPI devuelve por defecto. 401 es no autenticado y 403 es autenticado sin permiso; confundirlos es el error más típico. 404 para recurso inexistente (o ajeno, si no querés revelar que existe), 409 para conflictos como un email duplicado o una versión vieja, y 429 para rate limit. Los 5xx son fallas tuyas: si el cliente mandó algo inválido, nunca respondas 500. En FastAPI se setea con `status_code=201` en el decorador y se lanza `HTTPException(status_code=404)`.',
        },
        {
          text: 'Explicar la diferencia entre WSGI y ASGI',
          explanation:
            'WSGI es la interfaz síncrona clásica entre servidor y aplicación Python: una función que recibe la request y devuelve la respuesta, ocupando un worker (proceso o thread) durante toda la request, incluida la espera de I/O. La concurrencia se logra con más workers, por ejemplo Gunicorn con varios procesos. ASGI es su sucesor asíncrono: la app es una corrutina, un worker atiende muchas requests concurrentes mientras esperan I/O, y además soporta WebSockets, streaming y conexiones largas. Servidores WSGI: Gunicorn, uWSGI; ASGI: Uvicorn, Hypercorn, Granian. Django soporta ambos, Flask es WSGI y FastAPI es ASGI. ASGI solo rinde si el código es realmente async: una vista async que hace I/O bloqueante es peor que WSGI.',
        },
      ],
    },
    {
      id: 'bases-de-datos',
      title: 'Bases de datos, ORMs y transacciones',
      body: [
        'Practicá SQL a mano: `JOIN`, agregaciones, subqueries, índices y cómo leer un `EXPLAIN ANALYZE`. En Python vas a trabajar con el ORM de Django o con SQLAlchemy 2.0 (a veces vía SQLModel), y saber qué SQL genera cada llamada es lo que separa a un semi-senior de un junior. Un índice acelera lecturas y encarece escrituras; un índice compuesto se aprovecha según el orden de las columnas.',
        'El N+1 es la pregunta más frecuente: en Django se resuelve con `select_related` (joins para relaciones a uno) y `prefetch_related` (query aparte para relaciones a muchos); en SQLAlchemy con `joinedload` o `selectinload`. Sabé detectarlo con Django Debug Toolbar, logs de SQL o un test que cuente queries. Conocé también `only`, `values` y `bulk_create` para no traer ni escribir de más.',
        'Transacciones: en Django `transaction.atomic` como decorador o context manager, y `ATOMIC_REQUESTS`; en SQLAlchemy el manejo explícito de la sesión con `commit` y `rollback`. Para senior, niveles de aislamiento, `select_for_update` para locking pesimista y una columna de versión para locking optimista, y `transaction.on_commit` para disparar tareas de Celery solo cuando los datos ya están confirmados.',
        'Migraciones con las de Django o con Alembic: versionadas, revisadas en el PR y compatibles hacia atrás durante el deploy. Para servicios con muchos workers, el connection pool es crítico: cada proceso de Gunicorn o Uvicorn abre su pool, y la suma puede superar el límite de Postgres; ahí entra PgBouncer o ajustar el tamaño por worker.',
      ],
      checklist: [
        {
          text: 'Escribir una query con `JOIN` y `GROUP BY` sin el ORM',
          explanation:
            "`JOIN` combina filas de dos tablas según una condición: `INNER JOIN` deja solo las coincidencias y `LEFT JOIN` conserva todas las filas de la izquierda con `NULL` donde no hay match. `GROUP BY` agrupa para calcular agregaciones (`COUNT`, `SUM`, `AVG`) y `HAVING` filtra sobre esos agregados, mientras `WHERE` filtra antes de agrupar. Ejemplo: `SELECT c.id, c.name, SUM(o.total) AS spent FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'paid' GROUP BY c.id, c.name HAVING SUM(o.total) > 1000 ORDER BY spent DESC LIMIT 10`. Desde Python ejecutala parametrizada: con un cursor de psycopg, `cur.execute(sql, (status,))`, o con SQLAlchemy `session.execute(text(sql), {'status': 'paid'})`. Error común: seleccionar columnas que no están en el `GROUP BY` ni agregadas.",
        },
        {
          text: 'Resolver un N+1 con `select_related` o `prefetch_related`',
          explanation:
            "El N+1 pasa cuando iterás un queryset y accedés a una relación en cada elemento: `for book in Book.objects.all(): book.author.name` hace una query por libros y una más por cada autor. `select_related('author')` lo resuelve con un `JOIN` en la misma query y sirve para relaciones a uno (`ForeignKey`, `OneToOneField`). `prefetch_related('tags')` hace una segunda query con `WHERE id IN (...)` y une en Python, y sirve para relaciones a muchos (`ManyToManyField`, foreign keys inversas); con `Prefetch` podés filtrar u ordenar lo que se precarga. Se detecta con django-debug-toolbar, `assertNumQueries` en tests o logueando queries. En SQLAlchemy el equivalente es `joinedload` y `selectinload`, y con `lazy='raise'` el ORM falla en vez de hacer lazy loading silencioso.",
        },
        {
          text: 'Usar transacciones en Django y en SQLAlchemy',
          explanation:
            'En Django, por defecto cada query se confirma sola (autocommit); para agrupar operaciones usás `with transaction.atomic():` o el decorador `@transaction.atomic`, y si sale una excepción del bloque se hace rollback de todo. Los `atomic` anidados crean savepoints, y `transaction.on_commit(fn)` posterga efectos externos (encolar una tarea de Celery, mandar un email) hasta que la transacción se confirme, evitando que el worker busque un dato que todavía no existe. En SQLAlchemy 2.0 la sesión abre la transacción sola, y el patrón es `with Session(engine) as session, session.begin():`, que hace commit al salir o rollback si hay excepción; en async, lo mismo con `AsyncSession`. Error común: hacer llamadas HTTP lentas dentro de la transacción, que mantiene conexiones y locks tomados.',
        },
        {
          text: 'Explicar `select_for_update` y locking optimista',
          explanation:
            "`select_for_update()` en Django genera `SELECT ... FOR UPDATE`, que bloquea las filas leídas hasta el fin de la transacción, así que tiene que ir dentro de `transaction.atomic()`. Es locking pesimista: otra transacción que quiera las mismas filas espera, lo que es seguro con alta contención (descontar stock, saldo de una cuenta), pero reduce concurrencia y puede generar deadlocks; `nowait=True` o `skip_locked=True` cambian el comportamiento al encontrar filas bloqueadas, y `skip_locked` es útil para colas de trabajo en la base. El locking optimista no bloquea: guardás un campo `version` y actualizás con `Model.objects.filter(id=pk, version=v).update(..., version=F('version') + 1)`; si devuelve 0 filas, alguien lo cambió antes y reintentás o devolvés 409. Optimista cuando los conflictos son raros, pesimista cuando son frecuentes.",
        },
        {
          text: 'Crear y revisar una migración segura para producción',
          explanation:
            'En Django generás con `makemigrations` y revisás el SQL real con `sqlmigrate`; en SQLAlchemy usás Alembic con `alembic revision --autogenerate` y revisás el archivo, porque el autogenerate no detecta todo (renombres, por ejemplo). Una migración es segura si el código viejo y el nuevo funcionan con el schema durante el deploy, siguiendo expand and contract: agregar columnas nullable o con default, migrar datos en lotes y borrar lo viejo en un deploy posterior. Peligros: renombrar o borrar columnas en uso, agregar `NOT NULL` en tablas grandes sin pasos intermedios, y crear índices bloqueantes (en Postgres usá `CREATE INDEX CONCURRENTLY`, en Django con `AddIndexConcurrently` y `atomic = False`). Probala contra una copia con volumen realista y tené claro cómo se revierte.',
        },
        {
          text: 'Calcular cuántas conexiones abren tus workers y cómo limitarlas',
          explanation:
            'Cada proceso tiene su propio pool, así que el total es réplicas por workers por proceso por tamaño de pool. Ejemplo: 4 réplicas con Gunicorn de 4 workers y un pool de SQLAlchemy de `pool_size=5` más `max_overflow=10` pueden abrir hasta 4 x 4 x 15 = 240 conexiones, y Postgres trae `max_connections=100` por defecto; sumá además los workers de Celery. En Django, cada thread mantiene su conexión y `CONN_MAX_AGE` define si se reutiliza entre requests (Django 5.1 sumó pooling nativo para psycopg). Para limitarlas: pools chicos por proceso, menos procesos con más concurrencia async, y un pooler como PgBouncer en modo transaction delante de la base. Síntoma de exceso: errores de `too many connections` en picos o deploys, cuando conviven las instancias viejas y nuevas.',
        },
      ],
    },
    {
      id: 'concurrencia-async',
      title: 'GIL, asyncio y concurrencia',
      body: [
        'El GIL hace que en CPython un solo hilo ejecute bytecode a la vez dentro de un proceso. Por eso los threads sirven para I/O (el GIL se libera mientras esperás la red o el disco) pero no aceleran trabajo de CPU, que necesita `multiprocessing`, `ProcessPoolExecutor` o código nativo. Desde Python 3.13 existe un build free-threaded sin GIL, todavía opcional y con impacto en bibliotecas con extensiones en C; mencionarlo con esa salvedad muestra que estás al día.',
        '`asyncio` usa un event loop de un hilo con corrutinas que ceden el control en cada `await`. Es ideal para muchas operaciones de I/O concurrentes, siempre que todo el camino sea async: un driver o cliente HTTP sincrónico (como `requests`) dentro de una corrutina bloquea el loop entero. La solución es usar bibliotecas async (`httpx`, `asyncpg`) o mandar lo bloqueante a un thread con `asyncio.to_thread` o `run_in_executor`.',
        'Sabé elegir: threads para I/O con bibliotecas sincrónicas, asyncio para mucha I/O concurrente con bibliotecas async, procesos para CPU. Conocé `asyncio.gather`, `TaskGroup` y los timeouts con `asyncio.timeout`, y cómo limitar concurrencia con un `Semaphore`.',
        'Para trabajo en segundo plano se usan colas de tareas como Celery (con Redis o RabbitMQ), RQ, Dramatiq o arq. A nivel senior te preguntan por la entrega at-least-once y cómo evitar efectos duplicados: tareas idempotentes, claves de idempotencia, `acks_late` con cuidado y reintentos con backoff.',
      ],
      checklist: [
        {
          text: 'Explicar qué es el GIL y qué implica para threads y procesos',
          explanation:
            'El GIL (Global Interpreter Lock) es un lock de CPython que permite que un solo thread ejecute bytecode Python a la vez dentro de un proceso. Por eso los threads no aceleran trabajo CPU-bound en Python puro, pero sí sirven para I/O-bound, porque el GIL se libera al esperar red, disco o en muchas extensiones en C como NumPy. Para paralelismo real de CPU se usan procesos (`multiprocessing`, `ProcessPoolExecutor`), cada uno con su intérprete y su GIL, a costo de más memoria y de serializar datos entre ellos. Matiz actual: desde Python 3.13 existe un build free-threaded sin GIL, que en 3.14 pasó a estar soportado oficialmente aunque sigue siendo opcional y no es el default, y no todas las extensiones son compatibles. En una entrevista mencionalo, pero respondé con el modelo por defecto.',
        },
        {
          text: 'Explicar cómo funciona el event loop de `asyncio`',
          explanation:
            'El event loop es un loop de un solo thread que ejecuta corrutinas de forma cooperativa: corre una hasta que llega a un `await` sobre algo que no está listo (una respuesta de red, un timer), la suspende, registra el interés con el sistema operativo (epoll o kqueue) y pasa a otra que esté lista. Cuando la I/O termina, el loop retoma la corrutina donde quedó. Llamar a una función `async` no la ejecuta: devuelve un objeto corrutina que corre cuando la awaiteás o la convertís en `Task` (`asyncio.create_task`) para que corra concurrente. El punto de entrada es `asyncio.run(main())`, y para correr varias juntas se usa `asyncio.gather` o, mejor desde 3.11, `asyncio.TaskGroup`, que cancela las demás si una falla. Como es cooperativo, una corrutina que nunca hace `await` frena a todas.',
        },
        {
          text: 'Detectar código bloqueante dentro de una corrutina y corregirlo',
          explanation:
            'Es bloqueante todo lo que espera sin ceder el control al loop: `requests.get`, `time.sleep`, drivers síncronos de base (psycopg2, el ORM de Django en modo síncrono), lectura de archivos grandes y cómputo pesado. Dentro de un `async def` congela todas las requests de ese worker a la vez, así que la latencia sube en general aunque cada endpoint parezca correcto. Para detectarlo, activá el debug mode de asyncio (`PYTHONASYNCIODEBUG=1`), que avisa cuando un callback tarda más de 100 ms, o mirá trazas con mucho tiempo sin spans de I/O. Se corrige usando librerías async (`httpx.AsyncClient`, `asyncpg` o psycopg 3 async, `asyncio.sleep`) o mandando lo bloqueante a un thread con `await asyncio.to_thread(fn, arg)`. En FastAPI, si el endpoint usa librerías síncronas, declaralo con `def` común: el framework lo corre en un threadpool.',
        },
        {
          text: 'Elegir entre threads, procesos y asyncio para un caso dado',
          explanation:
            'Para muchas operaciones de I/O concurrentes con librerías async disponibles (miles de llamadas HTTP, websockets, un gateway), asyncio es lo más eficiente: un thread maneja miles de esperas con muy poca memoria. Para I/O con librerías síncronas, o pocas tareas concurrentes, threads con `ThreadPoolExecutor` es lo más simple y el GIL no molesta porque se libera al esperar. Para trabajo CPU-bound (procesar imágenes, parsear archivos enormes, cálculos en Python puro) usá procesos con `ProcessPoolExecutor`, que esquivan el GIL a costo de memoria y de serializar datos con pickle. Para trabajo largo que no debe bloquear una request, ninguno de los tres en el proceso web: va a una cola de tareas como Celery. Ejemplo: descargar 10000 URLs, asyncio con `httpx`; redimensionar 10000 imágenes, procesos.',
        },
        {
          text: 'Limitar concurrencia con `Semaphore` y poner timeouts',
          explanation:
            'Lanzar 10000 corrutinas a la vez con `gather` puede saturar el servicio remoto, agotar sockets o disparar rate limits, así que se limita con `asyncio.Semaphore`: `sem = asyncio.Semaphore(20)` y en cada tarea `async with sem: return await client.get(url)`, con lo que nunca hay más de 20 en vuelo. Para timeouts, desde Python 3.11 se usa `async with asyncio.timeout(5):` alrededor del bloque, que cancela lo que esté adentro y lanza `TimeoutError`; antes se usaba `asyncio.wait_for`. Además configurá timeouts en el cliente HTTP (`httpx.Timeout`) y en el driver de base, porque sin timeout una dependencia colgada deja tus corrutinas esperando para siempre. Error común: atrapar `CancelledError` y no relanzarlo, lo que rompe la cancelación.',
        },
        {
          text: 'Diseñar una tarea de Celery idempotente con reintentos',
          explanation:
            'Celery entrega tareas at-least-once, sobre todo con `acks_late=True` (confirma al terminar, así una tarea no se pierde si el worker muere), por lo que la misma tarea puede correr dos veces y tiene que ser idempotente. Pasale ids y no objetos (`send_invoice.delay(invoice_id)`), y al empezar chequeá el estado: si la factura ya figura como enviada, terminá sin hacer nada; para efectos externos usá una idempotency key con el proveedor o una tabla de ejecuciones con unique constraint. Reintentos: `@app.task(bind=True, autoretry_for=(httpx.TransportError,), retry_backoff=True, retry_jitter=True, max_retries=5)`, solo para errores transitorios. Encolá la tarea con `transaction.on_commit` para que no corra antes de que exista el dato, y poné `time_limit` para que una tarea colgada no ocupe el worker para siempre.',
        },
      ],
    },
    {
      id: 'seguridad',
      title: 'Seguridad y autenticación',
      body: [
        'Separá autenticación (quién sos) de autorización (qué podés hacer). Las contraseñas se guardan con un hash lento y con salt: Django ya lo hace con PBKDF2 o Argon2, y en FastAPI usás bibliotecas como `pwdlib` o `passlib` con Argon2 o bcrypt. Los secretos van en variables de entorno o en un secret manager, y en Django nunca con `DEBUG = True` en producción.',
        'En Django lo habitual es autenticación por sesión con cookies y protección CSRF incluida, o tokens con DRF. En FastAPI se arma con dependencias: un esquema OAuth2 que extrae el token, valida el JWT y devuelve el usuario, más dependencias de permisos por ruta. Sabé comparar sesiones con JWT, explicar access y refresh tokens y por qué revocar un JWT es difícil.',
        'Riesgos específicos de Python que suman puntos: `pickle` con datos no confiables permite ejecutar código, igual que `eval` o `yaml.load` sin `SafeLoader`; `subprocess` con `shell=True` y strings armados con input del usuario es inyección de comandos; y el SQL armado con f-strings es SQL injection aunque uses un ORM para el resto. Mencioná también auditar dependencias con `pip-audit` y fijar versiones.',
        'A nivel senior, diseñá la seguridad de una API pública: OAuth 2.0 y OpenID Connect con un proveedor de identidad, scopes, rate limiting, CORS restrictivo, validación estricta con Pydantic, HTTPS y logs sin datos sensibles.',
      ],
      checklist: [
        {
          text: 'Diferenciar autenticación de autorización con un ejemplo',
          explanation:
            'Autenticación es verificar quién sos (contraseña, token, passkey, SSO); autorización es decidir qué podés hacer una vez identificado. Ejemplo: loguearte en un sistema de facturación es autenticación; que puedas ver tus facturas pero no las de otra empresa es autorización. En HTTP, falla de autenticación es 401 y falla de autorización es 403. En Django, `request.user` y `@login_required` cubren la autenticación y los permisos (`has_perm`, `permission_classes` en DRF) la autorización; en FastAPI ambas son dependencias. El error más común es filtrar por id sin filtrar por dueño: `Invoice.objects.get(id=pk)` en vez de `Invoice.objects.get(id=pk, company=request.user.company)`.',
        },
        {
          text: 'Explicar cómo guarda contraseñas Django y qué usarías en FastAPI',
          explanation:
            'Django nunca guarda la contraseña: guarda un string con el formato `algoritmo$iteraciones$salt$hash`, por defecto PBKDF2 con SHA-256 y cientos de miles de iteraciones, y soporta Argon2 (recomendado, agregando `Argon2PasswordHasher` primero en `PASSWORD_HASHERS`) o bcrypt. Cuando un usuario se loguea con un hash de un algoritmo o costo viejo, Django lo re-hashea automáticamente con el actual. FastAPI no trae nada propio, así que usás una librería: hoy se recomienda `pwdlib` con Argon2 o `argon2-cffi` directamente, porque passlib quedó sin mantenimiento. Usá siempre `hash` y `verify` de la librería, que manejan el salt y comparan en tiempo constante. Nunca uses un hash rápido como SHA-256 solo: una GPU prueba miles de millones por segundo.',
        },
        {
          text: 'Implementar autenticación JWT con dependencias de FastAPI',
          explanation:
            "El flujo: un endpoint de login verifica usuario y contraseña y devuelve un access token firmado con PyJWT (`jwt.encode({'sub': str(user.id), 'exp': expira}, SECRET, algorithm='HS256')`). Para proteger rutas definís `oauth2_scheme = OAuth2PasswordBearer(tokenUrl='login')`, que extrae el token del header `Authorization: Bearer`, y una dependencia `get_current_user(token = Depends(oauth2_scheme), db = Depends(get_db))` que lo decodifica con `jwt.decode(token, SECRET, algorithms=['HS256'])`, busca el usuario y lanza `HTTPException(401)` si el token es inválido, expiró o el usuario no existe. Los endpoints lo piden con `user: User = Depends(get_current_user)`, y la autorización se agrega con otra dependencia como `require_role('admin')`. Errores comunes: no fijar `algorithms` al decodificar, tokens de vida larga sin refresh, y meter datos sensibles en el payload, que se lee sin la clave.",
        },
        {
          text: 'Nombrar riesgos propios de Python como `pickle` y `shell=True`',
          explanation:
            "`pickle.loads` sobre datos no confiables permite ejecutar código arbitrario, porque deserializar puede invocar cualquier callable; nunca lo uses con input externo, preferí JSON o Pydantic (y ojo con modelos de ML en formato pickle descargados de terceros). `subprocess.run(f'convert {filename}', shell=True)` con input del usuario permite command injection con algo como `; rm -rf /`; pasá una lista de argumentos sin shell: `subprocess.run(['convert', filename])`. Similares: `eval` y `exec` sobre input, `yaml.load` sin `SafeLoader` (usá `yaml.safe_load`), SQL armado con f-strings en vez de parámetros, y en Django `mark_safe` o `|safe` sobre contenido del usuario, que abre XSS. Bandit o las reglas de seguridad de Ruff detectan estos patrones en CI.",
        },
        {
          text: 'Explicar CSRF y cuándo aplica',
          explanation:
            'CSRF (Cross-Site Request Forgery) ocurre cuando un sitio malicioso hace que el navegador de la víctima mande una request a tu app, y el navegador adjunta solo las cookies de sesión, así que la acción se ejecuta como si la hubiera hecho el usuario (por ejemplo un formulario oculto que hace POST a `/transfer`). Aplica cuando la autenticación viaja automáticamente, es decir con cookies; si la API usa un token en el header `Authorization` que el JavaScript agrega explícitamente, otro sitio no puede adjuntarlo y CSRF no aplica. Defensas: cookies `SameSite=Lax` o `Strict`, tokens CSRF (Django lo trae con `CsrfViewMiddleware` y `{% csrf_token %}`) y no hacer cambios de estado con GET. Error común: desactivar CSRF con `@csrf_exempt` para que funcione un frontend que usa sesiones de Django.',
        },
        {
          text: 'Comparar sesiones y JWT incluyendo revocación',
          explanation:
            'Con sesiones, el servidor guarda el estado (en la base, Redis o la cache de Django) y el cliente tiene solo un id opaco en una cookie `HttpOnly`, `Secure` y `SameSite`; revocar es borrar la sesión y tiene efecto inmediato, por ejemplo en logout o al cambiar la contraseña. Con JWT, el token firmado contiene los claims y se valida sin consultar al servidor, lo que escala bien entre servicios, pero no se puede invalidar antes de su `exp` salvo con una denylist, que vuelve a necesitar estado. Por eso se usan access tokens cortos (5 a 15 minutos) con refresh tokens revocables y rotados. Para un frontend web con backend Django, las sesiones son lo más simple y seguro; JWT tiene sentido para APIs consumidas por apps móviles, terceros o varios servicios.',
        },
      ],
    },
    {
      id: 'testing',
      title: 'Testing con pytest',
      body: [
        'pytest es el estándar: tests como funciones con `assert` simples, fixtures para preparar datos y dependencias, `parametrize` para cubrir muchos casos y `conftest.py` para compartir fixtures. Practicá escribir un test unitario, uno de un endpoint con el `TestClient` de FastAPI o el cliente de Django, y uno con base de datos real.',
        'Los mocks se hacen con `unittest.mock` o `pytest-mock`; el error típico es parchear el lugar equivocado: se parchea donde el objeto se usa, no donde se define. En FastAPI conviene reemplazar dependencias con `app.dependency_overrides` en vez de parchear. No mockees lo que es tuyo y barato de usar: mockeá servicios externos, no tu propia base.',
        'Para integración, una base Postgres real en Docker o con Testcontainers da más confianza que SQLite si en producción usás Postgres. Cuidá el aislamiento con transacciones que se revierten al final de cada test, y mantené la suite rápida corriéndola en paralelo con `pytest-xdist`.',
        'Para senior, la estrategia: qué proporción de unitarios e integración, contract tests entre servicios, factories en lugar de fixtures gigantes (factory_boy), cobertura como señal y no como objetivo, y type checking con mypy o Pyright en CI como otra capa de verificación.',
      ],
      checklist: [
        {
          text: 'Escribir tests con fixtures y `parametrize`',
          explanation:
            "Una fixture de pytest es una función decorada con `@pytest.fixture` que prepara algo y se inyecta por nombre en los tests que la piden: `def test_total(cart): assert cart.total() == 0`. Con `yield` hacés setup y teardown (`db = connect(); yield db; db.close()`), con `scope` controlás cuánto vive (`function` por defecto, `module`, `session` para algo caro como un contenedor de base) y las fixtures compartidas van en `conftest.py`. `@pytest.mark.parametrize` corre el mismo test con distintos datos: `@pytest.mark.parametrize('email, valid', [('a@b.com', True), ('sin-arroba', False)])` genera un caso por tupla, y cada uno se reporta por separado. Error común: fixtures con scope amplio que comparten estado mutable, que hacen que los tests dependan del orden.",
        },
        {
          text: 'Testear un endpoint con el cliente de prueba del framework',
          explanation:
            "En FastAPI usás `TestClient` (basado en httpx): `client = TestClient(app); res = client.post('/users', json={'email': 'a@b.com', 'password': 'secreta123'}); assert res.status_code == 201; assert 'password' not in res.json()`. Para tests async o una app que comparte loop con una base async, se usa `httpx.AsyncClient` con `ASGITransport(app=app)` y pytest-asyncio o anyio. En Django está `django.test.Client` y en DRF `APIClient`, con `client.force_authenticate(user)` para saltear el login; con pytest-django se piden como fixtures `client` y `db`. Probá el camino feliz y los errores: validación (422 o 400), sin auth (401), recurso ajeno (403 o 404) y duplicados (409), y verificá el efecto en la base, no solo la respuesta.",
        },
        {
          text: 'Mockear una dependencia externa en el lugar correcto',
          explanation:
            '`unittest.mock.patch` reemplaza un nombre donde se busca, no donde se define. Si `services/payments.py` hace `from stripe_client import charge`, tenés que parchear `services.payments.charge`, no `stripe_client.charge`, porque el módulo ya tiene su propia referencia; es el error más común con mocks en Python. Con pytest es cómodo `mocker.patch` de pytest-mock o `monkeypatch.setattr`, que se deshacen solos al terminar el test. Para HTTP, en vez de parchear funciones, conviene interceptar a nivel transporte con `respx` (httpx) o `responses` (requests), así probás también la serialización. Usá `autospec=True` para que el mock respete la firma real, y no mockees tu propia base: ahí conviene una real.',
        },
        {
          text: 'Reemplazar dependencias de FastAPI en tests',
          explanation:
            "FastAPI permite reemplazar cualquier dependencia con `app.dependency_overrides`, un dict de función original a función nueva: `app.dependency_overrides[get_current_user] = lambda: User(id=1, role='admin')` hace que todos los endpoints que dependen de `get_current_user` reciban ese usuario sin token. Lo mismo con `get_db` para inyectar una sesión de tests ligada a una transacción que se revierte, o con un cliente externo para pasar un fake. La clave es que el override va sobre la misma función que usás en `Depends`, no sobre una copia. Limpiá los overrides al terminar, idealmente en una fixture con `yield` que haga `app.dependency_overrides.clear()`, para que no se filtren a otros tests.",
        },
        {
          text: 'Aislar tests que usan una base real',
          explanation:
            "Levantá Postgres real, igual a producción, con Testcontainers (`testcontainers.postgres`) en una fixture de scope `session`, o con un servicio en Docker Compose o en el CI, y corré las migraciones una vez. Para aislar cada test, el patrón más rápido es envolverlo en una transacción que se revierte al final: pytest-django lo hace solo con la marca `django_db`, y en SQLAlchemy abrís una conexión, empezás una transacción, ligás la sesión con `join_transaction_mode='create_savepoint'` y hacés rollback en el teardown. Si el código bajo test hace commits reales o usa varias conexiones, truncá las tablas entre tests. Con pytest-xdist en paralelo, usá una base por worker. No uses SQLite en lugar de Postgres: difieren en tipos, constraints y SQL.",
        },
        {
          text: 'Proponer una estrategia de testing para un backend grande',
          explanation:
            'Repartí el esfuerzo según el riesgo: unitarios para la lógica de dominio con reglas complejas (precios, permisos, cálculos), que corren en milisegundos y sin I/O; integración como base principal, con endpoints probados vía cliente de prueba contra Postgres real, porque ahí aparecen los bugs de queries, migraciones y serialización; y pocos end-to-end para los flujos críticos de negocio. Sumá tests de contrato si hay servicios que se consumen entre sí, y chequeo de tipos con mypy o Pyright más lint con Ruff en CI como primera barrera. Mantené la suite rápida con pytest-xdist, factories con factory_boy en vez de fixtures gigantes, y tolerancia cero a tests flaky. Medí cobertura para encontrar huecos en código crítico, no como objetivo numérico.',
        },
      ],
    },
    {
      id: 'arquitectura-produccion',
      title: 'Arquitectura, escala y producción',
      body: [
        'Para proyectos grandes sabé proponer una estructura: separar dominio, servicios y acceso a datos, organizar por módulo de negocio y no solo por capa técnica, y mantener los frameworks en los bordes. Monolito modular por defecto y servicios separados cuando hay razones de escala, deploy o equipos. Para comunicar servicios, HTTP o gRPC sincrónico para consultas y eventos por una cola o un broker para desacoplar, con el patrón outbox para no perder eventos.',
        'Rendimiento: medí antes de optimizar con `cProfile`, py-spy o un APM. Las palancas habituales son queries e índices, cache con Redis (cache-aside, TTL, invalidación), mover trabajo a tareas en segundo plano, procesar en lotes con generadores para no cargar millones de registros en memoria, y escalar horizontalmente. Para fugas de memoria, `tracemalloc` y comparar snapshots.',
        'En producción, Gunicorn con workers de Uvicorn o Uvicorn solo, con la cantidad de workers según CPU y tipo de carga, timeouts y reinicio periódico de workers para contener fugas. La imagen Docker conviene multi-stage, slim, con usuario no root, dependencias instaladas desde el lockfile y capas ordenadas para aprovechar la cache.',
        'Observabilidad: logging estructurado en JSON con `logging` o structlog e IDs de correlación, métricas de latencia y errores, y trazas con OpenTelemetry, que instrumenta Django, FastAPI, SQLAlchemy y los clientes HTTP. Para deploys, migraciones compatibles hacia atrás, rolling o canary, y health checks reales.',
      ],
      checklist: [
        {
          text: 'Proponer la estructura de un backend Python grande',
          explanation:
            'Organizá por dominio, no por tipo de archivo: en vez de carpetas globales `models`, `views` y `services`, módulos como `billing`, `users` y `orders`, cada uno con su API interna, modelos, servicios y tests (en Django, una app por dominio). Dentro de cada módulo separá capas: la capa HTTP (routers o vistas) solo traduce requests y respuestas, la de servicios tiene la lógica de negocio sin depender del framework, y la de acceso a datos encapsula el ORM. Los módulos se comunican por funciones de servicio o eventos, nunca leyendo las tablas del otro, lo que permite extraer uno a servicio aparte más adelante; herramientas como import-linter hacen cumplir esos límites en CI. Configuración desde el entorno con pydantic-settings y un `pyproject.toml` único con uv.',
        },
        {
          text: 'Perfilar un servicio y explicar qué optimizarías primero',
          explanation:
            'Primero medí dónde se va el tiempo antes de tocar código: las trazas de producción muestran si una request lenta pasa su tiempo en la base, en otros servicios o en Python. En backend casi siempre gana la base: N+1, índices faltantes o queries que traen de más, que se ven con django-debug-toolbar, el log de queries y `EXPLAIN ANALYZE`. Si el problema es CPU propio, usá un profiler: `cProfile` para desarrollo, y py-spy en producción, que se engancha a un proceso corriendo sin reiniciarlo y genera flame graphs; para memoria, `tracemalloc` o memray. El orden de ataque: queries y llamadas de red, después cache de lo caro y repetido, después algoritmos y estructuras de datos, y recién al final micro-optimizaciones o reescribir partes en C o Rust.',
        },
        {
          text: 'Configurar Gunicorn o Uvicorn para producción',
          explanation:
            'Para Django síncrono, Gunicorn con workers sync o gthread: un punto de partida es `(2 x cores) + 1` workers, ajustado según memoria y si es más I/O o CPU. Para ASGI (FastAPI, Django async), Uvicorn; en contenedores lo habitual hoy es un proceso de Uvicorn por contenedor y escalar con réplicas, o Gunicorn con `-k uvicorn.workers.UvicornWorker` (o `uvicorn --workers N`, que ya maneja procesos) si querés varios por máquina. Configurá `timeout` y `graceful_timeout` para cortar requests colgadas y apagar ordenadamente con `SIGTERM`, `max_requests` con `max_requests_jitter` para reciclar workers y contener memory leaks, y `--forwarded-allow-ips` o `--proxy-headers` detrás de un load balancer para respetar `X-Forwarded-For` y el esquema. Nunca uses `runserver` ni `--reload` en producción.',
        },
        {
          text: 'Armar un Dockerfile multi-stage para una app Python',
          explanation:
            'Un multi-stage separa la construcción del runtime para que la imagen final sea chica y sin herramientas de build. Etapa builder: desde `python:3.13-slim`, copiás `pyproject.toml` y `uv.lock` primero (para aprovechar la cache de capas cuando solo cambia el código), corrés `uv sync --frozen --no-dev` que crea el `.venv`, y si hay extensiones a compilar instalás ahí los compiladores. Etapa final: otra `python:3.13-slim`, copiás solo el `.venv` y el código con `COPY --from=builder`, agregás el venv al `PATH`, creás un usuario sin privilegios con `USER`, y arrancás con `CMD` en forma exec como `["uvicorn", "app.main:app", "--host", "0.0.0.0"]` para que reciba bien `SIGTERM`. Sumá un `.dockerignore` para no copiar `.venv`, `.git` ni `.env`, y fijá la versión de la imagen base.',
        },
        {
          text: 'Instrumentar logs, métricas y trazas con OpenTelemetry',
          explanation:
            'OpenTelemetry es el estándar abierto para las tres señales: instalás el SDK y las instrumentaciones (`opentelemetry-instrumentation-fastapi`, `-django`, `-sqlalchemy`, `-httpx`, `-celery`) o usás `opentelemetry-instrument` como wrapper para auto-instrumentar sin tocar código. Cada request genera una traza con spans para el handler, cada query y cada llamada saliente, y el contexto se propaga por headers (`traceparent`) entre servicios y hasta las tareas de Celery. Los datos salen por OTLP a un collector y de ahí a tu backend de observabilidad, sin acoplarte a un proveedor. Para logs, usá JSON estructurado (structlog o logging con un formatter JSON) e incluí el `trace_id` para saltar del log a la traza. Métricas mínimas: rate, errores y latencia en percentiles por endpoint, más largo de colas y conexiones del pool.',
        },
        {
          text: 'Explicar el patrón outbox y la comunicación entre servicios',
          explanation:
            'Los servicios se comunican de forma síncrona (HTTP o gRPC, simple pero acopla disponibilidad y suma latencia, y requiere timeouts y reintentos) o asíncrona con eventos en un broker como RabbitMQ, Kafka o SQS (desacopla, pero introduce consistencia eventual). El problema típico es el dual write: guardar una orden y publicar `order_created` son dos sistemas, y si falla uno quedan inconsistentes. El outbox lo resuelve guardando el evento en una tabla `outbox` en la misma transacción de base que el cambio; un proceso aparte la lee (polling o CDC con Debezium), publica en el broker y marca lo enviado. La garantía resultante es at-least-once, así que los consumidores tienen que ser idempotentes. Error común: publicar dentro de la transacción antes del commit, con lo que el evento sale aunque después haya rollback.',
        },
      ],
    },
    {
      id: 'ejercicios',
      title: 'Live coding, take-home y system design',
      body: [
        'El live coding en Python suele mezclar estructuras de datos y lógica: procesar un archivo o una lista de registros, agrupar con `dict` y `collections` (`Counter`, `defaultdict`), un endpoint con validación, o un problema de algoritmos de dificultad media. Aprovechá la biblioteca estándar: saber usar `itertools`, `heapq` o `bisect` en el momento justo luce mucho. Repetí el problema con tus palabras y acordá casos borde antes de escribir.',
        'En el take-home importa la calidad: estructura clara, modelos de Pydantic o serializers, manejo de errores, tests con pytest, Ruff y type hints, un `README` con cómo levantarlo (idealmente con `docker compose up`) y las decisiones que tomaste. Si usaste IA, entendé cada línea: la entrevista siguiente suele ser revisar ese código con vos.',
        'En system design (semi-senior alto y senior) seguí un orden: requisitos, estimación de volumen, API, modelo de datos, diseño de alto nivel y profundizar en el cuello de botella. En Python suman detalles propios: dónde usar tareas en segundo plano, cómo dimensionar workers y conexiones, y cuándo un componente crítico de CPU conviene en otro lenguaje o en una biblioteca nativa.',
      ],
      checklist: [
        {
          text: 'Resolver un ejercicio de procesamiento de datos con la biblioteca estándar',
          explanation:
            "Muchos live coding de Python piden leer un CSV o un log, agrupar, filtrar y devolver un ranking, y se espera que lo resuelvas sin pandas. Las piezas clave: `csv.DictReader` para leer filas como dicts, `collections.Counter` para contar (`Counter(row['country'] for row in rows).most_common(3)`), `defaultdict(list)` para agrupar, `itertools` (`groupby` sobre datos ordenados, `islice`, `chain`), `sorted` con `key=` y `heapq.nlargest` para top-k, `json` y `datetime` para parsear. Procesá con generadores para no cargar archivos enormes en memoria, y considerá filas mal formadas o vacías. Practicá escribiendo estas soluciones a mano hasta usar `Counter` y `defaultdict` sin pensar, porque son lo que más tiempo ahorra.",
        },
        {
          text: 'Armar un CRUD con validación y tests en menos de una hora',
          explanation:
            'Llegá con un esqueleto practicado, por ejemplo en FastAPI: modelos Pydantic de entrada y salida, un router con las cinco operaciones, una capa de almacenamiento (SQLAlchemy con SQLite si piden persistencia, o un dict en memoria si alcanza), manejo de 404 y 409, y tests con `TestClient`. Repartí el tiempo: 5 minutos de preguntas y alcance, 30 para el camino feliz completo, y el resto para errores, tests y prolijidad. Mostrá que funciona lo antes posible, aunque sea mínimo, y después iterá. Para practicar, cronometrate armando el mismo CRUD varias veces con recursos distintos, y una vez con Django y DRF, hasta que salga sin mirar documentación.',
        },
        {
          text: 'Entregar un take-home con `README`, tests y decisiones documentadas',
          explanation:
            'El `README` tiene que permitir correr todo en uno o dos comandos (`uv sync && uv run pytest`, o `docker compose up`), explicar la estructura, las decisiones tomadas y su por qué, los supuestos ante ambigüedades, y qué harías con más tiempo. Los tests cubren los casos importantes y los errores, y tienen que pasar en una máquina limpia: probalo clonando el repo en otra carpeta. Cuidá lo que siempre se revisa: dependencias fijadas con lockfile, type hints, formato y lint con Ruff, validación de input, nada de secretos en el repo y commits con mensajes claros. No agregues complejidad que el problema no pide y respetá el tiempo sugerido, aclarando en el `README` si te pasaste.',
        },
        {
          text: 'Seguir un orden fijo para un ejercicio de system design',
          explanation:
            'Un orden confiable: primero requisitos funcionales y no funcionales (latencia, disponibilidad, consistencia, volumen), preguntando en vez de suponer; después estimaciones de carga y almacenamiento; después la API y el modelo de datos; después el diagrama de alto nivel (clientes, load balancer, servicios, base, cache, colas, workers); y al final profundizar en cuellos de botella, fallas y monitoreo. En perfiles Python suelen aparecer procesamiento en background con Celery o colas, pipelines de datos y servir modelos de ML, así que tené claro cuándo algo va síncrono en la request y cuándo a un worker. Narrá los trade-offs de cada componente y gestioná el tiempo: no pases 20 minutos en requisitos ni metas Kafka sin justificarlo.',
        },
        {
          text: 'Estimar volumen de requests y almacenamiento en órdenes de magnitud',
          explanation:
            'Trabajá con números redondos: un día tiene unos 86400 segundos, aproximalo a 100000. Con 1 millón de usuarios diarios que hacen 50 requests cada uno son 50 millones por día, unas 500 por segundo de promedio y 1000 a 1500 en pico. Almacenamiento: 1 millón de eventos diarios de 500 bytes son 500 MB por día, unos 180 GB por año antes de índices y réplicas. Después sacá conclusiones: 1000 rps se atienden con unas pocas réplicas de un servicio Python y una base bien indexada; si cada request tarda 200 ms en un worker síncrono, cada worker hace 5 rps, así que necesitás unos 200 workers o pasar a async. Lo que se evalúa es el razonamiento, no la precisión.',
        },
      ],
    },
    {
      id: 'dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta y hacé preguntas antes de resolver: el entrevistador evalúa cómo razonás. Si no sabés algo, decilo y contá cómo lo averiguarías o qué sabés de un tema relacionado. Inventar una respuesta se nota y resta más que admitir un límite.',
        'Para preguntas de comportamiento usá STAR: situación, tarea, acción y resultado, contando lo que hiciste vos y con un resultado concreto. Tené preparadas historias sobre un incidente, un desacuerdo técnico, un error propio y una mejora que impulsaste. Mantenelas en un minuto y medio.',
        'Llevá preguntas para la empresa: cómo despliegan y cada cuánto, cómo manejan guardias e incidentes, en qué versión de Python están y cómo actualizan, cómo se toman las decisiones técnicas y cómo es el onboarding.',
        'Checklist final: probá cámara, micrófono, conexión y el editor compartido; tené tu proyecto listo para mostrar; repasá el stack que pide la búsqueda. Después de la entrevista anotá lo que no supiste y estudialo.',
      ],
      checklist: [
        {
          text: 'Pensar en voz alta y aclarar el alcance antes de resolver',
          explanation:
            'El entrevistador evalúa tu razonamiento, y si programás en silencio solo ve el resultado. Antes de escribir, reformulá el problema con tus palabras y preguntá lo que cambia la solución: tamaño del input, formato, casos borde (vacío, duplicados, datos inválidos), si importa la performance y qué devolver ante errores. Contá tu plan en dos o tres frases y confirmá antes de arrancar. Mientras escribís, narrá decisiones (uso un `Counter` porque necesito frecuencias) y avisá si te trabás. Practicalo en voz alta resolviendo ejercicios con timer, idealmente con alguien que haga de entrevistador.',
        },
        {
          text: 'Admitir lo que no sabés y explicar cómo lo averiguarías',
          explanation:
            'Decir no lo sé está bien; inventar se nota y hace dudar del resto de tus respuestas. Lo que suma es seguir con lo que sí sabés y cómo lo averiguarías: no usé SQLAlchemy async, pero entiendo cómo funciona asyncio y buscaría en la documentación cómo se maneja la sesión. Si es conceptual, razonalo desde principios en voz alta y aclará que estás deduciendo. Practicalo con alguien que te pregunte fuera de tu zona de confort, respondiendo con esa estructura. Anotá esos temas después para estudiarlos.',
        },
        {
          text: 'Tener tres o cuatro historias preparadas con formato STAR',
          explanation:
            'STAR es Situación (contexto breve), Tarea (tu responsabilidad), Acción (lo que hiciste vos, con detalle técnico) y Resultado (medible y qué aprendiste). Prepará historias que cubran lo que siempre preguntan: un problema técnico difícil, un desacuerdo con un compañero o con producto, un error tuyo que llegó a producción y cómo lo manejaste, y una vez que tomaste la iniciativa o mejoraste algo del equipo. Escribilas en viñetas, practicalas en voz alta hasta contarlas en 2 o 3 minutos, y adaptá una misma historia a distintas preguntas. Error común: contar todo en plural, que no deja ver qué hiciste vos.',
        },
        {
          text: 'Llevar al menos tres preguntas para la empresa',
          explanation:
            'Las preguntas muestran interés y te dan información para decidir. Buenas para un rol de backend o datos: cómo es el proceso de deploy y cada cuánto deployan, cómo manejan guardias e incidentes, qué versión de Python y qué stack usan y cómo encaran las actualizaciones, cómo se prioriza la deuda técnica, y qué se espera de vos en los primeros tres meses. Adaptalas al interlocutor: con ingenieros, el día a día; con managers, el equipo y el crecimiento. Evitá lo que está en la web de la empresa, y dejá salario y beneficios para el recruiter.',
        },
        {
          text: 'Probar el entorno técnico antes de empezar',
          explanation:
            'Unos 15 minutos antes, probá cámara, micrófono y conexión en la plataforma exacta de la entrevista. Si el ejercicio es en tu máquina, tené listo un proyecto vacío con un entorno virtual creado, pytest instalado y el editor con el intérprete correcto configurado, y verificá que corre un test trivial; si es en una plataforma online, abrila y ejecutá algo para conocer la versión de Python. Cerrá notificaciones y pestañas que puedan aparecer al compartir pantalla, agrandá la fuente del editor, y tené una conexión alternativa por si se cae la principal.',
        },
      ],
    },
  ],
};
