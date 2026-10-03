import type { InterviewGuide } from './types';

export const androidGuide: InterviewGuide = {
  track: 'android',
  summary:
    'Cómo prepararte para una entrevista de Android: Kotlin, Jetpack Compose, coroutines y Flow, arquitectura, performance, testing, seguridad, publicación y el día de la entrevista.',
  sections: [
    {
      id: 'como-es-la-entrevista',
      title: 'Cómo es la entrevista',
      body: [
        'Un proceso para Android suele tener una charla con recruiting, una entrevista técnica sobre Kotlin y el framework, un ejercicio práctico (live coding o take-home) y una charla con el equipo. En empresas con producto mobile grande se suma una ronda de diseño de sistemas mobile y otra de comportamiento. Preguntá si el ejercicio es con Compose o con Views y si podés usar Android Studio.',
        'Para junior se evalúan los fundamentos de Kotlin (`val` vs `var`, nulabilidad, `data class`), los componentes de Android (`Activity` y su ciclo de vida, `Intent`, `AndroidManifest.xml`, permisos en runtime), Compose básico (`remember`, `mutableStateOf`, `LazyColumn`), para qué sirve un `ViewModel` y por qué la red no va en el main thread.',
        'Para semi-senior aparecen structured concurrency, `Flow`, `StateFlow` y `SharedFlow`, la guía de arquitectura oficial, Hilt, state hoisting y side effects en Compose, Room, WorkManager, cambios de configuración y muerte del proceso, testing de ViewModels y publicación en Google Play. Para senior: modularización, estabilidad en Compose, offline-first, arranque y memoria, seguridad, CI/CD, migración de Views a Compose, Kotlin Multiplatform y fragmentación de dispositivos.',
      ],
      checklist: [
        {
          text: 'Saber qué etapas tiene el proceso y si el ejercicio es con Compose o Views',
          explanation:
            'Preguntáselo al recruiter en la primera charla y pedí que te lo confirme por escrito: cuántas rondas hay, quién entrevista en cada una, cuánto dura y qué evalúa. Del ejercicio averiguá si es live coding o take-home, si es Compose o Views, si podés usar Android Studio con tu setup, si hay red para bajar dependencias de Gradle y si podés consultar documentación. Con eso armás el plan: si es Compose, practicá `LazyColumn` con un `ViewModel` y `StateFlow`; si es Views, `RecyclerView` con `ListAdapter` y `DiffUtil`; si es un editor online sin Gradle, Kotlin puro y colecciones. Preguntar no resta puntos: muestra que te importa el contexto.',
        },
        {
          text: 'Tener una app propia que puedas explicar, idealmente publicada',
          explanation:
            'Elegí una app chica pero completa: consume una API, tiene lista y detalle, guarda datos en Room, maneja errores y estados vacíos, tiene tests del `ViewModel` y accesibilidad básica. Publicala en Google Play (la cuenta de desarrollador cuesta USD 25 una sola vez; las cuentas personales nuevas tienen que pasar un closed testing con al menos 12 testers durante 14 días antes de ir a producción) o al menos dejala en un repo público con README, capturas y un APK descargable. Ensayá un recorrido de cinco minutos: qué problema resuelve, cómo está armada, una decisión difícil con su trade-off y qué harías distinto. Esperá repreguntas como por qué ese dispatcher o qué pasa si muere el proceso; si no podés justificar algo, simplificalo antes.',
        },
        {
          text: 'Identificar los temas de tu seniority que te cuestan más',
          explanation:
            'Tomá los checklists de esta guía para tu nivel y el inmediato superior, y clasificá cada ítem en tres: lo explico con un ejemplo, lo explico a medias, no lo sé. La prueba es explicarlo en voz alta, sin mirar, en un minuto y con un ejemplo de código; si no te sale, todavía no lo sabés. Priorizá lo que más se pregunta (nulabilidad, ciclo de vida y muerte del proceso, coroutines y `StateFlow`, estado en Compose, `ViewModel`) y lo que piden las ofertas de esa empresa. Dedicale bloques cortos diarios con código real en un proyecto de prueba, y volvé a evaluarte al final de la semana.',
        },
        {
          text: 'Poder contar en dos minutos tu experiencia y qué rol buscás',
          explanation:
            'Armá un guion de unos dos minutos: quién sos y cuántos años de experiencia tenés, dos o tres proyectos con impacto concreto (por ejemplo, bajé la tasa de ANR a la mitad o migré el checkout de Views a Compose), el stack que dominás, y qué rol buscás y por qué esa empresa. Escribilo, decilo en voz alta con cronómetro y recortá hasta que suene natural y no leído. El error común es recorrer cronológicamente toda la carrera o repetir el CV; elegí lo que conecta con el puesto. Adaptá el cierre a cada empresa con algo que hayas visto de su app.',
        },
      ],
    },
    {
      id: 'kotlin',
      title: 'Kotlin: fundamentos del lenguaje',
      body: [
        'La nulabilidad es lo primero: tipos nullables con `?`, safe call `?.`, Elvis `?:`, `let` para trabajar con valores no nulos y por qué `!!` es casi siempre una mala señal. Sumale `val` vs `var` (y que `val` no hace inmutable al objeto), `data class` con `equals`, `hashCode` y `copy` generados, y la diferencia entre `List` y `MutableList`.',
        'Para modelar estados, las `sealed class` o `sealed interface` con `when` exhaustivo son la forma idiomática: un estado de pantalla como `Loading`, `Success(data)` y `Error(message)` hace imposibles las combinaciones inválidas. Conocé también extension functions, scope functions (`let`, `apply`, `also`, `run`, `with`) y cuándo cada una aporta legibilidad y cuándo la quita.',
        'En semi-senior y senior entran lambdas y funciones de orden superior, `inline` y `reified`, generics con varianza (`in`, `out`), delegación (`by lazy`, delegated properties) y colecciones vs `Sequence`. Desde Kotlin 2.0 el compilador K2 es el default y el compilador de Compose vive en el repo de Kotlin como plugin de Gradle; conviene saberlo porque cambia cómo se configuran los proyectos.',
      ],
      checklist: [
        {
          text: 'Manejar nulabilidad sin `!!` y explicar cada operador',
          explanation:
            'En Kotlin `String?` admite `null` y `String` no, y el compilador no te deja usar un nullable sin manejarlo. El safe call `user?.address?.city` devuelve `null` si algún eslabón es nulo; Elvis `?:` da un valor por defecto (`name ?: "Anónimo"`) y también sirve para salir temprano: `val id = arguments?.getString("id") ?: return`. `user?.let { render(it) }` ejecuta solo si no es nulo, y dentro de `if (user != null)` hay smart cast a no nulo (con variables locales o `val` estables, no con un `var` de clase que podría cambiar). `!!` lanza `NullPointerException` si es nulo; si un nulo es realmente un bug, preferí `requireNotNull(x) { "falta x" }` o `checkNotNull`, que fallan con un mensaje útil. Ojo con los tipos de plataforma que vienen de Java (`String!`): ahí Kotlin no conoce la nulabilidad y la responsabilidad es tuya.',
        },
        {
          text: 'Modelar un estado de pantalla con una `sealed interface`',
          explanation:
            'Declarás `sealed interface UiState { data object Loading : UiState; data class Success(val items: List<Item>) : UiState; data class Error(val message: String) : UiState }`. Como todas las implementaciones viven en el mismo módulo y paquete, `when (state)` es exhaustivo sin `else`: si mañana agregás `Empty`, el compilador te marca cada `when` a actualizar. Reemplaza tener `isLoading`, `items` y `error` sueltos, que permiten estados contradictorios como cargando y con error a la vez. Frente a una `sealed class`, la interface no impone constructor y un tipo puede implementar varias; la class sirve si necesitás propiedades compartidas con estado. Error común: agregar `else ->` y perder la exhaustividad.',
        },
        {
          text: 'Explicar qué genera una `data class` y para qué sirve `copy`',
          explanation:
            'Una `data class` genera `equals` y `hashCode` basados en las propiedades del constructor primario, un `toString` legible, funciones `componentN` para desestructurar (`val (id, name) = user`) y `copy`. La igualdad por valor importa en Android: `StateFlow` no emite si el nuevo valor es igual al anterior, y `DiffUtil` o Compose comparan elementos. `copy` crea una nueva instancia cambiando solo algunos campos, que es la forma idiomática de actualizar estado inmutable: `_uiState.update { it.copy(isLoading = false, items = result) }`. Ojo: la copia es superficial; si una propiedad es una `MutableList`, ambas instancias comparten la misma lista, así que usá colecciones de solo lectura. Las propiedades declaradas en el cuerpo de la clase no entran en `equals`.',
        },
        {
          text: 'Elegir la scope function adecuada en un caso concreto',
          explanation:
            'Se diferencian por cómo referencian al objeto (`this` en `apply`, `run` y `with`; `it` en `let` y `also`) y qué devuelven (el objeto mismo en `apply` y `also`; el resultado de la lambda en `let`, `run` y `with`). `apply` para configurar un objeto recién creado: `Intent(context, DetailActivity::class.java).apply { putExtra("id", id) }`. `also` para un efecto secundario sin cortar la cadena: `repository.save(item).also { log("guardado $it") }`. `let` para trabajar con un nullable o transformar: `user?.let { render(it) }`. `run` para calcular un resultado usando el objeto como receptor, y `with(binding) { title.text = a; subtitle.text = b }` para varias llamadas sobre algo no nulo. Error común: anidarlas o encadenar varias con `it` sombreado; si un `if` es más claro, usá el `if`.',
        },
        {
          text: 'Explicar `in` y `out` en generics con un ejemplo',
          explanation:
            'Por defecto los generics son invariantes: `MutableList<String>` no es una `MutableList<Any>`, porque podrías meterle un `Int`. `out T` (covarianza) declara que el tipo solo produce `T` y nunca lo recibe, y entonces `List<String>` sí es subtipo de `List<Any>`: leer un `Any` de una lista de strings es seguro. `in T` (contravarianza) declara que solo consume `T`: un `Comparator<Any>` sirve donde se espera un `Comparator<String>`, porque si compara cualquier cosa, compara strings. La regla es productor `out`, consumidor `in`; ejemplo propio: `interface Source<out T> { fun next(): T }` y `interface Sink<in T> { fun put(value: T) }`. También se aplica en el uso, como `fun copy(from: Array<out Any>, to: Array<Any>)`. `Flow<out T>` es covariante por eso mismo.',
        },
      ],
    },
    {
      id: 'componentes-de-android',
      title: 'Componentes y ciclo de vida de Android',
      body: [
        'Repasá el ciclo de vida de una `Activity` (`onCreate`, `onStart`, `onResume`, `onPause`, `onStop`, `onDestroy`) y qué conviene hacer en cada etapa. Sabé qué es un `Intent` explícito e implícito, qué se declara en el `AndroidManifest.xml` (componentes, permisos, intent filters para deep links) y cómo pedir permisos en runtime con el Activity Result API, incluido qué hacer si el usuario los niega.',
        'Una pregunta clásica de semi-senior es cambio de configuración vs muerte del proceso. Al rotar o cambiar el tema, la `Activity` se recrea pero el `ViewModel` sobrevive. Si el sistema mata el proceso en background, el `ViewModel` se pierde: lo que el usuario espera recuperar va en `SavedStateHandle` o `rememberSaveable`, y los datos en persistencia. Muchos bugs aparecen solo con la opción "No conservar actividades", así que sabé cómo probarlo.',
        'En senior, la fragmentación: distintas versiones de Android, fabricantes con restricciones de background agresivas, pantallas grandes y plegables. Hablá de `minSdk` y `targetSdk`, de chequear capacidades en vez de modelos, de edge-to-edge (obligatorio al apuntar a Android 15 o superior) y de layouts adaptativos, ya que desde Android 16 en pantallas grandes se ignoran las restricciones de orientación y tamaño.',
      ],
      checklist: [
        {
          text: 'Explicar el ciclo de vida de una `Activity` y qué hacer en cada callback',
          explanation:
            '`onCreate` se llama una vez por instancia: llamás a `setContent { }` o inflás el layout, obtenés el `ViewModel` y leés el estado guardado. `onStart` cuando pasa a ser visible: ahí empieza la colección de flows de UI con `repeatOnLifecycle(Lifecycle.State.STARTED)`. `onResume` cuando está en primer plano e interactiva: cámara, sensores, animaciones. `onPause` cuando pierde el foco (un diálogo del sistema, multi-ventana): soltá recursos exclusivos y que sea rápido. `onStop` cuando ya no se ve: frenás actualizaciones y guardás borradores. `onDestroy` cuando termina o se recrea por un cambio de configuración (`isChangingConfigurations`). Clave: después de `onStop` el proceso puede morir sin que se llame `onDestroy`, así que no dejes guardados importantes para ahí. En código moderno casi todo esto lo resuelven componentes lifecycle-aware, como `collectAsStateWithLifecycle`, en vez de sobrescribir callbacks.',
        },
        {
          text: 'Diferenciar `Intent` explícito e implícito',
          explanation:
            'Un `Intent` explícito nombra el componente destino, `Intent(this, DetailActivity::class.java)`: se usa para abrir pantallas o servicios de tu propia app. Uno implícito declara una acción y datos, y el sistema busca qué app lo puede resolver según los intent filters del manifest: `Intent(Intent.ACTION_VIEW, "https://ejemplo.com".toUri())` o `ACTION_SEND` para compartir. Si ninguna app lo resuelve, `startActivity` lanza `ActivityNotFoundException`, así que atrapala o usá `Intent.createChooser`. Desde Android 11 la visibilidad de paquetes limita consultar otras apps: para usar `resolveActivity` necesitás declarar `<queries>` en el manifest. Por seguridad, los servicios se inician con intents explícitos y los `PendingIntent` llevan `FLAG_IMMUTABLE` salvo que tengan que ser mutables.',
        },
        {
          text: 'Pedir un permiso en runtime y manejar el rechazo',
          explanation:
            'Los permisos peligrosos (cámara, ubicación, `POST_NOTIFICATIONS` desde Android 13) se declaran en el manifest y además se piden en runtime. Con la Activity Result API registrás `val launcher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted -> ... }`, y en Compose usás `rememberLauncherForActivityResult`. El flujo: chequeás con `ContextCompat.checkSelfPermission`; si `shouldShowRequestPermissionRationale` devuelve true, explicás por qué lo necesitás; después `launcher.launch(Manifest.permission.CAMERA)`. Si lo niega, la feature tiene que degradar con gracia; tras dos rechazos el sistema ya no muestra el diálogo y solo queda llevar al usuario a la configuración con `Settings.ACTION_APPLICATION_DETAILS_SETTINGS`. Pedí en contexto, cuando el usuario toca la feature, no al abrir la app; y para elegir fotos usá el Photo Picker, que no requiere permiso.',
        },
        {
          text: 'Explicar cambio de configuración vs muerte del proceso y cómo sobrevivir a ambos',
          explanation:
            'En un cambio de configuración (rotar, tema oscuro, idioma, redimensionar la ventana) el sistema destruye y recrea la `Activity`: el `ViewModel` sobrevive porque vive en un `ViewModelStore` retenido, `remember` se pierde y `rememberSaveable` no. En la muerte del proceso, con la app en background el sistema mata el proceso para liberar memoria; al volver, Android recrea la `Activity` y el back stack, pero el `ViewModel` es nuevo y vacío. Lo único que sobrevive es el estado guardado en el `Bundle`: `SavedStateHandle` en el `ViewModel` y `rememberSaveable` en Compose, para cosas chicas como ids, filtros o el texto de un campo; los datos grandes van en Room y se recargan con ese id. Probalo con No conservar actividades en las opciones de desarrollador, o mandando la app a background y ejecutando `adb shell am kill <paquete>`. Error típico: meter listas grandes en el `Bundle`, que tiene un límite cercano a 1 MB y termina en `TransactionTooLargeException`.',
        },
        {
          text: 'Explicar cómo manejar pantallas grandes, edge-to-edge y distintas versiones',
          explanation:
            'Versiones: `minSdk` es la mínima donde se instala, `targetSdk` indica contra qué comportamientos del sistema probaste (Google Play exige uno reciente) y `compileSdk` qué APIs podés compilar; las APIs nuevas se usan detrás de `if (Build.VERSION.SDK_INT >= ...)` o a través de AndroidX, que hace backport. Edge-to-edge: al apuntar a Android 15 la app dibuja detrás de las barras del sistema, así que llamás `enableEdgeToEdge()` y aplicás insets con `Modifier.safeDrawingPadding()`, `windowInsetsPadding` o el `contentWindowInsets` de `Scaffold` para que nada quede tapado. Pantallas grandes: decidís el layout con window size classes (`currentWindowAdaptiveInfo()`), con lista y detalle lado a lado (`ListDetailPaneScaffold`) y navegación adaptativa (`NavigationSuiteScaffold`); al apuntar a Android 16, en pantallas de 600dp o más se ignoran `screenOrientation` y `resizeableActivity=false`, así que la app tiene que funcionar en cualquier tamaño. Decidí por tamaño de ventana y capacidades, nunca por modelo de dispositivo.',
        },
      ],
    },
    {
      id: 'jetpack-compose',
      title: 'Jetpack Compose',
      body: [
        'Compose es declarativo: las funciones `@Composable` describen la UI a partir del estado y se recomponen cuando ese estado cambia. `mutableStateOf` crea estado observable y `remember` lo conserva entre recomposiciones; `rememberSaveable` además sobrevive a la recreación. Para listas largas, `LazyColumn` con `key` estable compone solo lo visible.',
        'State hoisting es el patrón central: los composables reciben el estado y callbacks por parámetro, lo que los hace reutilizables, testeables y previsualizables. El estado de la pantalla vive en el `ViewModel` expuesto como `StateFlow` y se lee con `collectAsStateWithLifecycle`. Para side effects: `LaunchedEffect` para lanzar coroutines atadas a una key, `DisposableEffect` para registrar y limpiar, `rememberCoroutineScope` para eventos del usuario y `derivedStateOf` para derivar estado que cambia menos que su fuente.',
        'En senior te van a preguntar por estabilidad y recomposición. Compose saltea un composable si sus parámetros no cambiaron, y para eso necesita saber que son estables. Con strong skipping (activo por defecto) eso mejoró mucho, pero leer estado demasiado arriba, crear lambdas o colecciones nuevas en cada recomposición o usar tipos inestables sigue causando trabajo de más. Las herramientas son el Layout Inspector con contador de recomposiciones y los compiler reports.',
      ],
      checklist: [
        {
          text: 'Explicar la diferencia entre `remember` y `rememberSaveable`',
          explanation:
            '`remember { mutableStateOf(0) }` guarda el valor en la composición: sobrevive a las recomposiciones, pero se pierde si el composable sale de la composición, si la `Activity` se recrea por una rotación o si muere el proceso. `rememberSaveable` además lo guarda en el `Bundle` de estado, así que sobrevive a cambios de configuración y a la muerte del proceso; funciona con tipos que entran en un `Bundle` (primitivos, `String`, `Parcelable`) o con un `Saver` propio. Usá `rememberSaveable` para estado de UI que el usuario espera recuperar (el texto que escribió, la tab elegida, un panel expandido) y `remember` para objetos derivados o caros que se pueden recrear. Datos de negocio y listas grandes no van en ninguno de los dos: van en el `ViewModel` y en persistencia.',
        },
        {
          text: 'Aplicar state hoisting a un composable con estado propio',
          explanation:
            'Convertís un composable stateful en stateless moviendo el estado a quien lo llama: en vez de `var query by remember { mutableStateOf("") }` adentro, recibe `query: String` y `onQueryChange: (String) -> Unit`. Así queda `@Composable fun SearchBar(query: String, onQueryChange: (String) -> Unit)` y el padre, o el `ViewModel`, es dueño del valor. Ganás una única fuente de verdad, el padre puede reaccionar o resetear, y el componente se testea y previsualiza con cualquier valor. La regla es subir el estado al ancestro común más bajo que lo lee o lo modifica, no más arriba. Es común ofrecer una versión stateful de conveniencia que envuelve a la stateless. Error frecuente: pasar el `ViewModel` entero a los hijos en vez de solo estado y lambdas.',
        },
        {
          text: 'Elegir entre `LaunchedEffect`, `DisposableEffect` y `rememberCoroutineScope`',
          explanation:
            '`LaunchedEffect(key)` lanza una coroutine cuando el composable entra en la composición y la cancela y relanza cuando cambia la key: sirve para trabajo disparado por estado, como `LaunchedEffect(errorMessage) { snackbarHostState.showSnackbar(errorMessage) }`. `DisposableEffect(key)` es para registrar algo que hay que limpiar, con un `onDispose { }` obligatorio: un listener, un `LifecycleObserver`, un callback de sensor. `rememberCoroutineScope()` te da un scope atado a la composición para lanzar coroutines desde eventos del usuario, como `onClick = { scope.launch { drawerState.open() } }`, donde no podés usar `LaunchedEffect` porque un callback no es composable. Errores comunes: `LaunchedEffect(Unit)` cuando el efecto depende de un valor que cambia, o lanzar coroutines directo en el cuerpo del composable, que se relanzarían en cada recomposición. Si el efecto necesita la última versión de una lambda sin reiniciarse, usá `rememberUpdatedState`.',
        },
        {
          text: 'Explicar qué es la estabilidad y cómo afecta la recomposición',
          explanation:
            'Compose puede saltear un composable en una recomposición si todos sus parámetros son iguales a los de la vez anterior, y para confiar en esa comparación necesita que sean estables. Son estables los primitivos, `String`, las lambdas, las data classes con `val` de tipos estables y los tipos marcados `@Stable` o `@Immutable`; son inestables las clases con `var`, las `List` y `Map` de Kotlin (son interfaces que podrían ser mutables) y las clases de módulos compilados sin el plugin de Compose. Con strong skipping, activo por defecto desde Kotlin 2.0.20, los composables con parámetros inestables también se pueden saltear comparando por identidad de instancia, y las lambdas se recuerdan solas. Lo que sigue generando trabajo de más: crear listas nuevas en cada recomposición (`items.filter { }` en el cuerpo), o leer estado que cambia mucho, como el scroll, demasiado arriba en vez de en lambdas como `Modifier.offset { }`. Herramientas: `remember` y `derivedStateOf`, kotlinx.collections.immutable, `@Immutable` y un archivo de configuración de estabilidad para tipos externos.',
        },
        {
          text: 'Detectar recomposiciones innecesarias con el Layout Inspector',
          explanation:
            'Corré la app en debug, abrí el Layout Inspector de Android Studio y activá los contadores de recomposición: muestra, por cada composable, cuántas veces se recompuso y cuántas se salteó. Interactuá con la pantalla (scrollear, tipear) y buscá contadores que suben sin motivo, por ejemplo una lista entera que se recompone con cada letra del buscador. Después buscá la causa: un parámetro inestable (los compiler reports de Compose muestran qué funciones son skippable y qué clases son estables), una lectura de estado demasiado arriba en el árbol, o un objeto nuevo creado en cada recomposición. Antes de optimizar, confirmá el impacto real en un build release con Macrobenchmark o una traza de Perfetto, porque no toda recomposición extra es un problema perceptible.',
        },
      ],
    },
    {
      id: 'coroutines-y-flow',
      title: 'Coroutines y Flow',
      body: [
        'Las coroutines permiten escribir código asíncrono de forma secuencial con funciones `suspend`. Sabé explicar los dispatchers (`Main`, `IO`, `Default`), que una función `suspend` bien escrita es main-safe (cambia de dispatcher adentro con `withContext`), y por qué nunca hay que bloquear el main thread: causa jank y, si dura lo suficiente, un ANR.',
        'Structured concurrency significa que cada coroutine vive dentro de un scope (`viewModelScope`, `lifecycleScope`) y se cancela con él, y que un padre espera a sus hijos. En senior te preguntan por excepciones y cancelación: una excepción en un hijo cancela al padre y a sus hermanos salvo que uses `SupervisorJob` o `supervisorScope`; la cancelación es cooperativa; y nunca hay que tragarse una `CancellationException` en un `catch` genérico.',
        '`Flow` es un stream frío que emite cuando alguien colecta. `StateFlow` es caliente, siempre tiene un valor y es ideal para estado de UI. `SharedFlow` es caliente sin valor inicial obligatorio y sirve para eventos (aunque muchos equipos prefieren modelar eventos como estado). Conocé `stateIn` con `SharingStarted.WhileSubscribed`, operadores como `map`, `combine`, `flatMapLatest` y `debounce`, y colectar respetando el ciclo de vida.',
      ],
      checklist: [
        {
          text: 'Explicar qué dispatcher usar para cada tipo de trabajo',
          explanation:
            '`Dispatchers.Main` es para tocar la UI y trabajo liviano; `viewModelScope` y `lifecycleScope` usan `Main.immediate` por defecto. `Dispatchers.IO` es para operaciones bloqueantes de entrada y salida (disco, APIs de red o base que bloquean); tiene un pool grande, de 64 hilos o la cantidad de núcleos si es mayor, porque esos hilos pasan el tiempo esperando. `Dispatchers.Default` es para trabajo de CPU, como parsear un JSON enorme, ordenar o procesar imágenes, y tiene tantos hilos como núcleos. Una función `suspend` bien escrita es main-safe: `suspend fun load() = withContext(ioDispatcher) { file.readText() }`, así quien la llama no necesita saber nada. Las funciones `suspend` de Room y Retrofit ya son main-safe y no hace falta envolverlas. Inyectá el dispatcher en vez de hardcodearlo, para poder reemplazarlo en tests.',
        },
        {
          text: 'Explicar structured concurrency y qué pasa al cancelar un scope',
          explanation:
            'Cada coroutine se lanza dentro de un `CoroutineScope` y forma una jerarquía: el `Job` de un `launch` es hijo del scope. Eso implica que un padre no termina hasta que terminan sus hijos (`coroutineScope { launch { a() }; launch { b() } }` espera a ambos), que cancelar el scope cancela a todos los hijos y que los errores no se pierden. `viewModelScope` se cancela en `onCleared` y `lifecycleScope` cuando se destruye el lifecycle, así el trabajo no sigue vivo ni retiene la pantalla cuando el usuario se va. La cancelación es cooperativa: las funciones suspend de kotlinx chequean y lanzan `CancellationException`, pero un loop de CPU tiene que llamar a `ensureActive()` o `yield()`. Para limpiar al cancelar usás `try/finally`, y si en el `finally` necesitás suspender, `withContext(NonCancellable)`. `GlobalScope` rompe todo esto y se evita.',
        },
        {
          text: 'Explicar cómo se propagan las excepciones y cuándo usar `SupervisorJob`',
          explanation:
            'Con un `Job` común, si un hijo lanza una excepción, cancela a su padre, el padre cancela a los demás hijos y la excepción sigue subiendo. `launch` la propaga en el momento (si nadie la maneja llega al `CoroutineExceptionHandler` o crashea la app), mientras que `async` la guarda y la relanza en `await()`. Con `SupervisorJob` o `supervisorScope`, la falla de un hijo no afecta a sus hermanos ni al padre: sirve cuando las tareas son independientes, como cargar tres widgets de un dashboard; `viewModelScope` ya usa `SupervisorJob`. Ojo: el supervisor solo aplica a sus hijos directos. Atrapá errores con `try/catch` dentro de la coroutine, pero si atrapás `Exception` genérica (o usás `runCatching`), relanzá la `CancellationException`: tragarla rompe la cancelación y la coroutine sigue corriendo cuando debería parar.',
        },
        {
          text: 'Diferenciar `Flow`, `StateFlow` y `SharedFlow` con un caso para cada uno',
          explanation:
            '`Flow` es frío: el bloque productor corre de nuevo para cada colector y solo mientras alguien colecta; es lo que expone un repositorio, como `dao.observeItems(): Flow<List<Item>>`. `StateFlow` es caliente, siempre tiene un valor actual (`.value`), se lo da a cada colector nuevo y solo emite cuando el valor cambia según `equals`: es el estado de UI del `ViewModel`, `val uiState: StateFlow<UiState>`. `SharedFlow` es caliente, puede no tener valor, tiene `replay` y buffer configurables y emite todos los valores aunque se repitan: sirve para difundir eventos a varios suscriptores, como cambios de sesión en toda la app. Para eventos de UI de un solo uso (navegar, mostrar un snackbar) un `SharedFlow` sin replay pierde lo emitido si no hay colector, por eso la guía oficial sugiere modelarlos como estado que la UI consume, o usar un `Channel` con `receiveAsFlow()` si hay un solo consumidor.',
        },
        {
          text: 'Convertir un `Flow` del repositorio en `StateFlow` con `stateIn`',
          explanation:
            'En el `ViewModel`: `val uiState: StateFlow<UiState> = repository.observeItems().map<List<Item>, UiState> { UiState.Success(it) }.catch { emit(UiState.Error(it.message.orEmpty())) }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), UiState.Loading)`. `stateIn` convierte el flow frío en uno caliente compartido: una sola colección hacia arriba para todos los colectores, con un valor inicial. `WhileSubscribed(5_000)` mantiene el upstream activo mientras haya colectores y cinco segundos después del último, así sobrevive a una rotación sin reiniciar la query pero se detiene si la app pasa a background; `Eagerly` arranca enseguida y nunca para, `Lazily` arranca con el primer colector y nunca para. La UI lo lee con `collectAsStateWithLifecycle()`. Error común: crear el `stateIn` dentro de una función, que genera un flow nuevo en cada llamada, en vez de declararlo como propiedad.',
        },
      ],
    },
    {
      id: 'arquitectura-y-datos',
      title: 'Arquitectura, inyección de dependencias y datos',
      body: [
        'La guía oficial de arquitectura propone capas: UI (composables y `ViewModel`), una capa de dominio opcional (use cases) y la capa de datos (repositorios que coordinan fuentes remotas y locales). El flujo es unidireccional: el estado baja como `StateFlow` y los eventos suben como llamadas al `ViewModel`. Sabé justificar cuándo agregar use cases y cuándo son burocracia.',
        'Hilt es el estándar para inyección de dependencias: anotás la `Application`, los puntos de entrada y los módulos que proveen implementaciones, y te da scopes y `ViewModel` inyectados. Lo importante es poder explicar qué problema resuelve (construir y reemplazar dependencias, sobre todo en tests) y no solo las anotaciones. Koin es una alternativa común, más simple y basada en un service locator.',
        'Para datos: Retrofit u OkHttp (o Ktor) para red con kotlinx.serialization o Moshi, Room para datos estructurados (queries verificadas en compilación, `Flow` reactivos, migraciones) y DataStore para preferencias. Para trabajo que tiene que completarse aunque la app se cierre, WorkManager con constraints y reintentos. En senior, offline-first: Room como fuente de verdad, la red sincroniza, cola de cambios pendientes y resolución de conflictos. La navegación se arma con Navigation Compose o Navigation 3 y rutas tipadas.',
      ],
      checklist: [
        {
          text: 'Explicar las capas de la arquitectura recomendada y el flujo unidireccional',
          explanation:
            'La capa de UI tiene composables que renderizan un `UiState` inmutable y un `ViewModel` que lo produce y lo expone como `StateFlow`, recibiendo eventos como llamadas (`onRefresh()`, `onQueryChange(q)`). La capa de datos tiene repositorios que exponen `Flow` y funciones `suspend` y coordinan fuentes como Retrofit, Room y DataStore; cada repositorio es la fuente de verdad de su tipo de dato. La capa de dominio es opcional: use cases como `GetFeedUseCase` que encapsulan lógica que combina varios repositorios o se repite entre `ViewModel`s; si solo delegan a un repositorio, son burocracia. El flujo unidireccional significa que el estado baja, los eventos suben y solo el `ViewModel` modifica el estado, lo que lo hace predecible y fácil de testear. Las dependencias apuntan en un sentido: la UI depende de los datos, nunca al revés.',
        },
        {
          text: 'Explicar qué resuelve Hilt y cómo reemplazás una dependencia en un test',
          explanation:
            'Hilt, construido sobre Dagger y con generación de código en compilación (KSP), arma tus objetos y sus dependencias por vos: cada clase declara lo que necesita en su constructor con `@Inject` y nadie escribe `Repository(Api(OkHttpClient()))` a mano. Anotás la `Application` con `@HiltAndroidApp`, las Activities con `@AndroidEntryPoint`, los `ViewModel`s con `@HiltViewModel`, y los módulos con `@Module @InstallIn(SingletonComponent::class)` usando `@Provides` o `@Binds` para interfaces; scopes como `@Singleton` definen cuánto vive una instancia. En unit tests no necesitás Hilt: le pasás el fake al constructor. En tests instrumentados usás `@HiltAndroidTest` y reemplazás un módulo entero con `@TestInstallIn(components = [SingletonComponent::class], replaces = [NetworkModule::class])`, o una dependencia puntual con `@BindValue`. Koin es más simple de configurar, pero resuelve en runtime: un error en el grafo aparece al ejecutar, no al compilar.',
        },
        {
          text: 'Explicar por qué usar Room en vez de SQLite directo',
          explanation:
            'Room es una capa sobre SQLite: definís entidades con `@Entity`, DAOs con queries SQL (`@Query("SELECT * FROM item WHERE id = :id")`) y una clase `@Database`. Frente a SQLite directo, las queries se validan en compilación contra el esquema (una columna mal escrita no compila), el mapeo a objetos es automático sin manejar cursores, los DAOs `suspend` son main-safe, y las queries que devuelven `Flow` re-emiten cuando cambian las tablas involucradas, ideal para usar la base como fuente de verdad. Suma transacciones con `@Transaction`, relaciones, migraciones versionadas con auto-migrations y `MigrationTestHelper` para probarlas, y hoy también soporta Kotlin Multiplatform. Error grave: subir la versión del esquema sin migración y usar `fallbackToDestructiveMigration()` en producción, que borra los datos del usuario.',
        },
        {
          text: 'Elegir entre WorkManager y una coroutine para una tarea en background',
          explanation:
            'Una coroutine en `viewModelScope` vive lo que vive la pantalla: es lo correcto para trabajo que solo tiene sentido mientras el usuario mira (cargar una lista, buscar), y se cancela si se va o si muere el proceso. WorkManager es para trabajo diferible que tiene que completarse aunque la app se cierre o el dispositivo se reinicie: subir fotos, enviar cambios pendientes, sincronizar. Persiste el trabajo, respeta constraints como `setRequiredNetworkType(NetworkType.CONNECTED)` o batería no baja, reintenta con backoff si devolvés `Result.retry()`, encadena trabajos, permite periódicos (mínimo cada 15 minutos) y evita duplicados con `enqueueUniqueWork`. Con un `CoroutineWorker`, `doWork()` es `suspend`. WorkManager no garantiza un horario exacto; si el trabajo es inmediato, largo y visible para el usuario (reproducir audio, navegación), corresponde un foreground service con notificación.',
        },
        {
          text: 'Esbozar una app offline-first con Room como fuente de verdad',
          explanation:
            'La UI observa `dao.observeItems()` como `Flow` a través del repositorio y nunca muestra directo lo que devuelve la red. Al refrescar, el repositorio pide a la API y escribe en Room; Room re-emite y la UI se actualiza sola, así funciona sin conexión y hay una sola fuente de verdad. Las escrituras del usuario se aplican en Room al instante con un estado pendiente y se encolan en una tabla de operaciones con un id idempotente; un `CoroutineWorker` con constraint de red las envía, reintenta con backoff y las marca como sincronizadas. Bajá cambios de forma incremental con un cursor o `updatedAt` en vez de todo cada vez. Para conflictos, last-write-wins es simple pero pierde cambios; las alternativas son versionado optimista con rechazo del servidor o merge por campo. Mostrale al usuario qué está pendiente o falló.',
        },
        {
          text: 'Armar navegación con rutas tipadas y pasaje de argumentos',
          explanation:
            'Con Navigation Compose 2.8 o superior, las rutas son tipos `@Serializable`: `@Serializable object Home` y `@Serializable data class ProductDetail(val id: String)`. El grafo queda `NavHost(navController, startDestination = Home) { composable<Home> { HomeScreen(onOpen = { id -> navController.navigate(ProductDetail(id)) }) }; composable<ProductDetail> { ProductDetailScreen() } }`. El argumento se lee tipado con `backStackEntry.toRoute<ProductDetail>()` o, mejor, en el `ViewModel` con `savedStateHandle.toRoute<ProductDetail>()`, que además sobrevive a la muerte del proceso. Pasá ids y no objetos completos: el detalle se carga desde el repositorio. Navigation 3, estable desde fines de 2025, cambia el modelo: el back stack es una lista de keys que manejás vos como estado y `NavDisplay` la renderiza, lo que simplifica layouts adaptativos. En ambos casos, pasá callbacks de navegación a las pantallas en vez del `NavController`.',
        },
      ],
    },
    {
      id: 'performance-y-testing',
      title: 'Performance y testing',
      body: [
        'Para encontrar por qué una pantalla se siente lenta, medí: Android Studio Profiler para CPU y memoria, Perfetto para trazas del sistema, el Layout Inspector para recomposiciones y Macrobenchmark para medir arranque y scroll de forma reproducible. Siempre en build de release, porque las builds debug con Compose son mucho más lentas.',
        'El arranque se mejora con Baseline Profiles (precompilan el código crítico), menos trabajo en `Application.onCreate`, inicialización diferida de SDKs y R8 activado. Para memory leaks, LeakCanary en debug y el heap dump del profiler: las causas típicas son referencias a una `Activity` o `Context` desde objetos que viven más (singletons, listeners sin desregistrar, coroutines en `GlobalScope`).',
        'Para testear un `ViewModel` con coroutines, usá `runTest`, reemplazá el dispatcher `Main` con un `TestDispatcher` e inyectá repositorios fake. Turbine simplifica testear `Flow`. La estrategia senior: muchos unit tests en lógica, tests de Room y del repositorio, tests de UI de Compose con `createComposeRule` y semántica, screenshot tests para componentes visuales y pocos tests end-to-end de flujos críticos, todo en CI.',
      ],
      checklist: [
        {
          text: 'Usar el profiler y Perfetto para encontrar trabajo en el main thread',
          explanation:
            'Con un build release o marcado `profileable`, abrí el Profiler de Android Studio y grabá una traza de CPU (system trace) mientras reproducís el problema. En el hilo `main` buscá bloques largos: frames que superan unos 16 ms a 60 Hz, lectura de disco, parsing o inflado de layouts síncronos. Perfetto (ui.perfetto.dev) muestra la traza completa del sistema: hilos, uso de CPU, frames del `RenderThread` y las secciones que agregues con `trace("cargarFeed") { }` de androidx.tracing para ubicar tu código. En desarrollo, StrictMode detecta I/O en el main thread apenas ocurre. La solución típica es mover ese trabajo con `withContext(Dispatchers.IO)` o `Default`, precalcular o cachear, y volver a medir.',
        },
        {
          text: 'Explicar qué son los Baseline Profiles y cómo mejoran el arranque',
          explanation:
            'ART empieza ejecutando con interpretación y JIT y compila AOT con el tiempo según el uso, así que justo después de instalar o actualizar, el código del arranque corre más lento. Un Baseline Profile es la lista de clases y métodos que se usan en el arranque y en flujos críticos; viaja dentro del AAB y se compila AOT al instalar, lo que suele mejorar el arranque y el scroll en torno a un 20 o 30%. Se genera con un módulo de Macrobenchmark y `BaselineProfileRule`, que recorre esos flujos, y el plugin de Gradle de Baseline Profile lo incorpora al build. Compose y muchas librerías AndroidX traen los suyos, pero el de tu código lo tenés que generar vos, y conviene complementarlo con un Startup Profile que optimiza el orden del dex. Medí antes y después con Macrobenchmark y `StartupTimingMetric`, comparando `CompilationMode.None()` contra `CompilationMode.Partial()`.',
        },
        {
          text: 'Encontrar un memory leak con LeakCanary y explicar su causa',
          explanation:
            'Agregás `debugImplementation("com.squareup.leakcanary:leakcanary-android:<versión>")` y no hace falta código: vigila objetos que deberían liberarse (Activities y Fragments destruidos, `ViewModel`s limpiados, views) y, si siguen retenidos tras unos segundos y un GC, hace un heap dump y te muestra la leak trace, la cadena de referencias desde un GC root hasta el objeto. Leés esa cadena buscando el eslabón sospechoso, que LeakCanary resalta. Causas típicas: un singleton o campo estático que guarda una `Activity` o una `View`, un listener registrado en un manager global que nunca se desregistra, una inner class o lambda que captura la `Activity` y vive en un callback largo, o una coroutine en `GlobalScope` que referencia la pantalla. El arreglo es desregistrar en el callback simétrico, usar `applicationContext` en objetos de vida larga y scopes atados al lifecycle.',
        },
        {
          text: 'Testear un `ViewModel` con `runTest` y un `TestDispatcher`',
          explanation:
            '`viewModelScope` usa `Dispatchers.Main`, que no existe en un unit test de JVM, así que lo reemplazás: `Dispatchers.setMain(StandardTestDispatcher())` en el setup y `Dispatchers.resetMain()` al final, normalmente encapsulado en una JUnit rule `MainDispatcherRule`. El test: `@Test fun loadsItems() = runTest { val vm = FeedViewModel(FakeRepository(items)); advanceUntilIdle(); assertEquals(UiState.Success(items), vm.uiState.value) }`. `runTest` usa tiempo virtual, así que los `delay` se resuelven al instante; con `StandardTestDispatcher` las coroutines se encolan y avanzan con `advanceUntilIdle()` o `runCurrent()`, mientras que `UnconfinedTestDispatcher` las ejecuta enseguida, más simple pero menos fiel al orden real. Si inyectás dispatchers, que compartan el mismo scheduler para tener un solo reloj virtual. Si el estado usa `stateIn(WhileSubscribed)`, necesitás un colector activo (con Turbine o `backgroundScope.launch { vm.uiState.collect {} }`) para que emita.',
        },
        {
          text: 'Escribir un test de UI de Compose que busque por texto o semántica',
          explanation:
            'Declarás `@get:Rule val composeRule = createComposeRule()` y en el test hacés `composeRule.setContent { LoginScreen(state = LoginUiState(), onLogin = {}) }`. Después buscás nodos en el árbol de semántica: `composeRule.onNodeWithText("Ingresar").performClick()`, `onNodeWithContentDescription("Cerrar")` o `onNodeWithTag("email")` si agregaste `Modifier.testTag("email")`, y afirmás con `assertIsDisplayed()`, `assertIsEnabled()` o `assertTextEquals()`. Buscar por texto o semántica garantiza que el test encuentra lo mismo que ve el usuario y que lee TalkBack; `testTag` queda como último recurso. Probar la pantalla stateless con un estado fijo hace el test rápido y determinista, y puede correr en la JVM con Robolectric además de en un dispositivo. Compose espera solo a que la UI esté ociosa; para algo asíncrono externo, usá `waitUntil`.',
        },
        {
          text: 'Proponer una estrategia de testing para una app mediana',
          explanation:
            'Una pirámide: abajo, muchos unit tests de JUnit con `runTest` sobre `ViewModel`s, use cases y mapeos, con fakes y Turbine para los flows. En el medio, tests de Room con una base en memoria y del repositorio contra MockWebServer, más tests de UI de Compose sobre pantallas stateless, en la JVM con Robolectric para que sean rápidos. Screenshot tests (Compose Preview Screenshot Testing, Paparazzi o Roborazzi) para el design system en tema oscuro, fuente grande y RTL. Arriba, pocos end-to-end instrumentados o con Maestro para los flujos que si se rompen cuestan plata. Todo corre en CI en cada PR, con los instrumentados en Gradle Managed Devices o Firebase Test Lab; y cada bug arreglado suma un test de regresión.',
        },
      ],
    },
    {
      id: 'plataforma-y-publicacion',
      title: 'Seguridad, accesibilidad y publicación',
      body: [
        'En seguridad: tokens cifrados con claves del Android Keystore (no en `SharedPreferences` en texto plano), HTTPS siempre con Network Security Config, no exportar componentes sin necesidad, validar los datos de los intents y deep links, R8 para ofuscar, no loguear datos sensibles, y Play Integrity API cuando necesitás verificar que la app y el dispositivo son legítimos. Recordá que todo lo que viaja en el APK se puede extraer.',
        'Accesibilidad: `contentDescription` en imágenes e íconos con significado, semántica correcta en Compose (`Modifier.semantics`, roles, `mergeDescendants`), áreas táctiles de al menos 48dp, contraste y soporte de tamaños de fuente grandes. Probalo con TalkBack y con el Accessibility Scanner.',
        'Para publicar: build variants y product flavors para entornos, firma con Play App Signing, Android App Bundle, tracks de testing interno, cerrado y abierto, rollout escalonado y el requisito de `targetSdk` reciente que Google Play actualiza cada año. En senior se espera CI/CD con GitHub Actions o similar y fastlane o Gradle Play Publisher, más observabilidad con Crashlytics o Sentry y Android vitals (crashes, ANRs, arranque lento).',
      ],
      checklist: [
        {
          text: 'Explicar dónde y cómo guardar un token de sesión',
          explanation:
            'Nunca en `SharedPreferences` o DataStore en texto plano: en un dispositivo rooteado o desde un backup se lee directo. Lo estándar es generar una clave AES en el Android Keystore con `KeyGenParameterSpec` (no exportable y respaldada por hardware cuando el dispositivo lo soporta), cifrar el token con AES-GCM y guardar el resultado cifrado en DataStore. `EncryptedSharedPreferences` de androidx.security-crypto resolvía esto, pero fue deprecada en 2025, así que en código nuevo usá el Keystore directamente o una librería mantenida. Excluí esos datos del backup con `dataExtractionRules`, porque la clave no viaja con el backup y el dato restaurado no se podría descifrar. Combiná un access token de vida corta con un refresh token, exigí biometría con `setUserAuthenticationRequired` si la app lo amerita, y nunca loguees el token.',
        },
        {
          text: 'Enumerar riesgos de seguridad de una app Android y cómo mitigarlos',
          explanation:
            'Riesgos: secretos dentro del APK (se decompila con jadx en minutos), datos locales sin cifrar, tráfico interceptable, componentes exportados sin protección (una `Activity` o `ContentProvider` con `exported="true"` que cualquier app puede invocar), intents y deep links con datos sin validar (intent redirection, cargar URLs arbitrarias en un `WebView` con JavaScript habilitado), `PendingIntent` mutables, logs con datos personales y apps reempaquetadas o dispositivos comprometidos. Mitigaciones: secretos en el backend, cifrado con claves del Keystore, Network Security Config que prohíba cleartext y pinning con pines de respaldo si el riesgo lo justifica, `exported="false"` por defecto y permisos de firma para lo que compartís con tus apps, validar todo input externo, `FLAG_IMMUTABLE`, R8 para ofuscar, sacar logs en release, y Play Integrity API verificada en el servidor para acciones sensibles. La autorización siempre la decide el backend.',
        },
        {
          text: 'Hacer accesible una pantalla de Compose y probarla con TalkBack',
          explanation:
            '`Image` e `Icon` con significado llevan `contentDescription` (Agregar a favoritos), y los decorativos `contentDescription = null` para que TalkBack los saltee. Usá componentes de Material, que ya traen semántica (`Button`, `Checkbox`), y en elementos clickeables custom `Modifier.clickable(onClickLabel = "Abrir detalle", role = Role.Button)`. Agrupá una fila con `Modifier.semantics(mergeDescendants = true) { }` para que se lea como una unidad, marcá títulos con `semantics { heading() }` y exponé estados con `stateDescription`. Áreas táctiles de 48dp (Material lo asegura con `minimumInteractiveComponentSize`), textos en `sp` y layouts que no se corten con la fuente al 200%. Probalo activando TalkBack: navegá con gestos, revisá el orden y lo que anuncia; sumá Accessibility Scanner y los checks automáticos en tests de Compose con `enableAccessibilityChecks()`. Error común: descripciones redundantes como botón de imagen de cerrar.',
        },
        {
          text: 'Explicar build variants y product flavors',
          explanation:
            'Una build variant es la combinación de un build type y uno o más product flavors. Los build types (`debug`, `release`, o uno propio como `staging`) definen cómo se compila: si es debuggable, si corre R8, con qué firma. Los product flavors definen versiones distintas de la app agrupadas en dimensiones, por ejemplo `environment` con `dev` y `prod` (otra URL base con `buildConfigField`, `applicationIdSuffix = ".dev"` para instalar ambas a la vez, otro ícono) o `tier` con `free` y `paid`. El resultado son variantes como `devDebug` o `prodRelease`, y cada una puede tener su source set (`src/dev/`) con código o recursos propios. En AGP moderno `BuildConfig` está apagado por defecto y se activa con `buildFeatures { buildConfig = true }`. Error común: multiplicar flavors hasta tener decenas de variantes que nadie prueba; muchas diferencias se resuelven mejor con configuración remota.',
        },
        {
          text: 'Describir el proceso de publicación con tracks y rollout escalonado',
          explanation:
            'Generás un Android App Bundle (`.aab`) de release y Google Play produce APKs optimizados para cada dispositivo. Con Play App Signing, Google guarda la clave de firma de la app y vos firmás con una upload key, que se puede resetear si la perdés. Los tracks son internal testing (hasta 100 testers, disponible en minutos), closed testing (grupos invitados), open testing (cualquiera se suma) y production; cada build nueva necesita un `versionCode` mayor, y completás la ficha, el formulario de Data safety y la clasificación de contenido. En producción hacés staged rollout (por ejemplo 1%, 5%, 20%, 50%, 100%) mirando crashes y ANRs en Android vitals y Crashlytics, y pausás si algo empeora; quien ya actualizó no vuelve atrás, así que se sale con una versión nueva que corrige. Google Play exige cada año un `targetSdk` reciente para apps nuevas y actualizaciones (la versión de Android del año anterior); revisá el requisito vigente en la Play Console.',
        },
        {
          text: 'Esbozar un pipeline de CI/CD con monitoreo posterior',
          explanation:
            'En cada PR: Gradle con build cache y configuration cache, `./gradlew lint detekt testDebugUnitTest` y el build, con los tests instrumentados críticos en Gradle Managed Devices o Firebase Test Lab; si falla, no se mergea. En merge a main o en un tag: `versionCode` derivado del número de build del CI, `bundleRelease` firmado con la upload key guardada como secreto, subida al track interno con fastlane `supply` o Gradle Play Publisher, y promoción a producción con staged rollout. Feature flags remotos (Firebase Remote Config u otro) permiten apagar algo sin publicar. Después: Crashlytics o Sentry con el mapping de R8 subido para tener stack traces legibles, y Android vitals, donde superar los umbrales de mal comportamiento (1,09% de crash rate y 0,47% de ANR rate percibidos por usuarios) reduce la visibilidad en Play; con alertas que frenen el rollout si esas métricas suben.',
        },
      ],
    },
    {
      id: 'ejercicios-practicos',
      title: 'Live coding, take-home y system design',
      body: [
        'El live coding típico es una pantalla en Compose con lista que consume una API: `ViewModel` con `StateFlow`, repositorio, estados de loading, error y vacío, y quizás búsqueda o detalle. Practicalo con un timer de 45 minutos y un proyecto base con Retrofit, serialización y Hilt ya configurados, porque Gradle te puede comer el tiempo. También aparecen algoritmos simples en Kotlin, así que tené fluidez con colecciones.',
        'En un take-home se evalúan arquitectura clara, separación de capas, manejo de errores y estados vacíos, algunos tests del `ViewModel` y del repositorio, accesibilidad básica y un README con decisiones y mejoras pendientes. No sumes módulos ni librerías que no puedas justificar.',
        'El diseño de sistemas mobile (senior) pide cosas como un chat en tiempo real, un feed con imágenes o una app offline. Cubrí requisitos, capas, modelo de datos local, protocolo (WebSocket, polling o push con FCM), sincronización y orden de mensajes, reintentos, paginación, qué pasa cuando el proceso muere, batería y datos móviles, y cómo lo monitorearías.',
      ],
      checklist: [
        {
          text: 'Resolver una lista con datos remotos en Compose en 45 minutos',
          explanation:
            'Repartí el tiempo: 5 minutos de aclaraciones, 25 de camino feliz, 10 de errores y pulido, 5 de margen. Lo mínimo: `@Serializable data class Item`, una interfaz Retrofit con `suspend fun getItems(): List<Item>`, un repositorio, y un `ViewModel` con `MutableStateFlow<UiState>` donde `UiState` es una `sealed interface` (`Loading`, `Success`, `Error`), cargando en `init` con `viewModelScope.launch` y `try/catch`. La pantalla lee el estado con `collectAsStateWithLifecycle()`, hace `when` y muestra `CircularProgressIndicator`, una `LazyColumn` con `items(list, key = { it.id })` o el error con un botón de reintento. Si no hay tiempo para Hilt, creá el `ViewModel` con `viewModel { FeedViewModel(repository) }`. No te olvides del permiso `INTERNET` en el manifest, el olvido clásico. Practicalo tres o cuatro veces con timer contra una API pública hasta que la base te salga en 15 minutos.',
        },
        {
          text: 'Tener un proyecto base con red, serialización y Hilt listo',
          explanation:
            'Tené un repo template probado: version catalog (`libs.versions.toml`) con Kotlin, Compose, KSP y AGP en versiones compatibles, Retrofit con kotlinx.serialization y su converter (u OkHttp o Ktor), Hilt con KSP, Coil para imágenes, Navigation Compose, una pantalla de ejemplo con `ViewModel` y `StateFlow`, un test con `MainDispatcherRule` y el permiso `INTERNET` en el manifest. Compilalo días antes para tener las dependencias descargadas y otra vez el día anterior. En el live coding preguntá si podés usarlo; si no, al menos copiá el bloque de dependencias. El motivo: configurar Gradle y KSP en vivo puede llevarte 15 de los 45 minutos, y un desfase de versiones entre Kotlin, KSP y Compose te deja sin compilar.',
        },
        {
          text: 'Tener un take-home de ejemplo con README y tests',
          explanation:
            'Hacé uno propio como práctica, con un enunciado típico: lista y detalle de una API pública, búsqueda y favoritos guardados en Room, en 6 a 8 horas y en un repo público. Incluí capas claras con `ViewModel`, repositorio e inyección de dependencias, estados de loading, error y vacío, tests del `ViewModel` y del repositorio, accesibilidad básica y ninguna librería ni módulo que no puedas justificar. El README cuenta cómo correrlo, las decisiones y por qué, los trade-offs que aceptaste por el tiempo, qué harías con más tiempo y cuánto te llevó. Te sirve de plantilla para el próximo y de muestra si te piden código. Cuidá el historial de git: commits chicos con mensajes claros también se leen.',
        },
        {
          text: 'Diseñar un chat en tiempo real con persistencia local y reintentos',
          explanation:
            'Requisitos: mensajes uno a uno y en grupo, tiempo real, historial sin conexión y estados enviado, entregado y leído. Room es la fuente de verdad con tablas de conversaciones y mensajes, y la UI observa un `Flow` de Room, con Paging 3 para historiales largos. Al enviar, insertás el mensaje local con un `clientId` (UUID) y estado pendiente, la UI lo muestra al instante y lo mandás por WebSocket; el servidor responde con su id y timestamp y lo marcás como enviado. Si falla o no hay red, un worker de WorkManager reintenta con backoff, y el `clientId` hace el envío idempotente para no duplicar. Recepción: WebSocket solo en foreground y, en background, mensajes de alta prioridad de FCM que muestran la notificación y disparan la sincronización. El orden lo define un número de secuencia del servidor por conversación, no el reloj del dispositivo, y al reconectar pedís todo lo posterior al último id conocido. Cerrá con batería, cifrado y métricas.',
        },
        {
          text: 'Hablar en voz alta mientras resolvés un ejercicio',
          explanation:
            'Se entrena: resolvé ejercicios narrando como si alguien escuchara, o grabate y miralo después. La estructura: repetí el problema con tus palabras, decí el plan en una frase (primero el modelo y el repositorio, después el `ViewModel`, la pantalla y al final los errores), y mientras codeás contá decisiones, no cada tecla: expongo un `StateFlow` porque la UI necesita siempre un valor actual. Cuando te trabás, decí qué estás pensando y qué opciones ves; el entrevistador solo puede ayudarte si sabe dónde estás. Al terminar, decí qué mejorarías y qué testearías. Lo ideal es hacer dos o tres mock interviews con alguien de la comunidad antes de la real.',
        },
      ],
    },
    {
      id: 'el-dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta y hacé preguntas antes de codear: si es Compose o Views, qué `minSdk` soportan, qué pasa con errores y sin conexión. Contá tu plan en una frase y después ejecutalo. Si no sabés algo, decilo, razoná a partir de lo que sabés y explicá cómo lo averiguarías: lo que evalúan es el criterio, no la memoria.',
        'Para preguntas de comportamiento usá STAR: situación, tarea, acción y resultado. Prepará historias reales sobre un crash o ANR difícil, un desacuerdo técnico, una entrega que salió mal, una mejora que propusiste y alguien a quien ayudaste. Contalas en primera persona y con resultados concretos.',
        'Llevá preguntas para la empresa: cuánto es Compose y cuánto Views, si usan Kotlin Multiplatform, cómo es el proceso de release, cómo testean y cómo es el code review. Antes de entrar, tené Android Studio actualizado, un proyecto que compile, un emulador abierto y revisá cámara y conexión.',
      ],
      checklist: [
        {
          text: 'Hacer al menos dos preguntas de aclaración antes de codear',
          explanation:
            'Elegí preguntas que cambian la solución: Compose o Views, qué `minSdk` soportan (define qué APIs podés usar), si podés usar librerías como Retrofit o Hilt, el formato de la API y si pagina, qué hacer con errores o sin conexión, y qué priorizan si no llegás a todo. Después resumí lo acordado en una frase antes de empezar. Esto muestra que trabajás con requisitos reales y te evita resolver el problema equivocado. El error opuesto es preguntar veinte cosas para ganar tiempo: quedate con las que cambian el diseño.',
        },
        {
          text: 'Tener cuatro o cinco historias preparadas en formato STAR',
          explanation:
            'STAR es Situación (contexto breve), Tarea (cuál era tu responsabilidad), Acción (qué hiciste vos, en primera persona y con detalle técnico) y Resultado (medible: crash rate, tasa de ANR, tiempos, usuarios afectados, y qué aprendiste). Escribí cuatro o cinco historias reales que cubran un crash o ANR difícil en producción, un desacuerdo técnico y cómo se resolvió, algo que salió mal y qué cambiaste, una mejora que propusiste e impulsaste, y una vez que ayudaste o mentoreaste a alguien. Cada una debería durar unos dos minutos, con el peso en la acción. Una misma historia puede responder varias preguntas, así que practicá adaptarla. Errores comunes: hablar en nosotros todo el tiempo o terminar sin un resultado concreto.',
        },
        {
          text: 'Saber cómo responder cuando no recordás una API',
          explanation:
            'Decilo directo y mostrá razonamiento: no recuerdo la firma exacta, pero para colectar respetando el lifecycle hay una función en lifecycle-runtime-compose, algo como `collectAsStateWithLifecycle()`, y lo confirmaría con el autocompletado o la documentación. Describí qué tiene que hacer lo que buscás y cómo lo encontrarías (la documentación de Android Developers, Quick Documentation en Android Studio, el código fuente de la librería). Si te bloquea, seguí con un placeholder o una abstracción y volvé después. Lo que evalúan es criterio y forma de trabajar: inventar una API con seguridad es peor que admitir la duda.',
        },
        {
          text: 'Tener tres preguntas propias para la empresa',
          explanation:
            'Llevá preguntas que te ayuden a decidir y muestren criterio: cuánto es Compose y cuánto Views, qué `minSdk` soportan, si usan Kotlin Multiplatform, cada cuánto publican y si usan staged rollout y feature flags, qué corre en CI, cómo es el code review, cómo están sus crash rate y ANR rate en Android vitals y quién atiende incidentes, y qué se esperaría de vos en los primeros tres meses. Elegí tres según quién entrevista: a un dev preguntale de stack y prácticas, a un manager de expectativas y equipo. Evitá preguntar algo que está en su web.',
        },
        {
          text: 'Dejar listo Android Studio, un proyecto que compile y el emulador',
          explanation:
            'El día anterior: dejá Android Studio en una versión estable (no lo actualices la mañana de la entrevista), descargá la imagen del emulador que vas a usar y compilá tu proyecto base para tener las dependencias de Gradle en caché. Antes de entrar, abrí el proyecto, hacé un build para tener el daemon de Gradle caliente y arrancá el emulador, que en frío tarda; si tu máquina es lenta, conectá un teléfono físico con depuración por USB o inalámbrica. Desactivá notificaciones, cerrá apps con datos privados, agrandá la fuente del editor para compartir pantalla y probá compartir la ventana en la plataforma de la llamada. Revisá cámara, micrófono y conexión, y tené un plan B como el hotspot del celular.',
        },
      ],
    },
  ],
};
