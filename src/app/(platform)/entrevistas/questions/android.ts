import type { InterviewQuestion, Seniority } from './types';

export const androidQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'kotlin',
      question: '¿Cuál es la diferencia entre `val` y `var` en Kotlin?',
      answer:
        '`val` declara una referencia de solo lectura: no se puede reasignar, aunque el objeto al que apunta puede ser mutable. `var` se puede reasignar. Se prefiere `val` por defecto porque hace el código más predecible.',
    },
    {
      topic: 'kotlin',
      question: '¿Cómo maneja Kotlin la nulabilidad?',
      answer:
        'Los tipos no aceptan `null` salvo que se marquen con `?` (`String?`). Para usarlos hay que chequear: safe call (`user?.name`), Elvis (`name ?: "Anónimo"`), `let` (`user?.let { ... }`) o smart cast tras un `if (x != null)`. El operador `!!` fuerza y tira `NullPointerException` si es null, así que se evita.',
    },
    {
      topic: 'kotlin',
      question: '¿Qué es una `data class`?',
      answer:
        'Una clase pensada para guardar datos: el compilador genera `equals`, `hashCode`, `toString`, `copy` y funciones `componentN` para desestructurar a partir de las propiedades del constructor. Es ideal para modelos y estados de UI inmutables, que se "modifican" con `copy(campo = nuevoValor)`.',
    },
    {
      topic: 'android',
      question: '¿Cuál es el ciclo de vida de una `Activity`?',
      answer:
        '`onCreate` (se crea, se infla la UI), `onStart` (visible), `onResume` (en primer plano e interactiva), `onPause` (pierde el foco), `onStop` (deja de ser visible) y `onDestroy`. Ojo: al rotar la pantalla o cambiar el idioma, por defecto la Activity se destruye y se vuelve a crear, por eso el estado no se guarda en la Activity.',
    },
    {
      topic: 'android',
      question: '¿Para qué sirve el `AndroidManifest.xml`?',
      answer:
        'Declara los componentes de la app (activities, services, broadcast receivers, content providers), los permisos que necesita, la activity de entrada con su intent filter, el ícono y otros metadatos. Si un componente no está en el manifest, el sistema no lo puede lanzar.',
    },
    {
      topic: 'compose',
      question: '¿Qué es Jetpack Compose?',
      answer:
        'El toolkit declarativo moderno de Android: la UI se escribe con funciones `@Composable` que describen cómo se ve según el estado, y Compose las vuelve a ejecutar (recomposición) cuando el estado cambia. Reemplaza a los layouts XML con Views, con menos código y sin `findViewById`.',
    },
    {
      topic: 'compose',
      question: '¿Para qué sirven `remember` y `mutableStateOf`?',
      answer:
        '`mutableStateOf` crea un estado observable: cuando cambia, Compose recompone a quienes lo leen. `remember` guarda un valor entre recomposiciones, si no se recrearía en cada una. Juntos: `var count by remember { mutableStateOf(0) }`. Para que sobreviva a la rotación se usa `rememberSaveable`.',
    },
    {
      topic: 'android',
      question: '¿Qué es un `Intent`?',
      answer:
        'Un mensaje para pedirle al sistema que haga algo. Los explícitos abren un componente concreto de tu app (`Intent(this, DetailActivity::class.java)`); los implícitos describen una acción (abrir un link, compartir, llamar) y el sistema elige qué app la resuelve. Se le pueden pasar datos con extras.',
    },
    {
      topic: 'arquitectura',
      question: '¿Para qué sirve un `ViewModel`?',
      answer:
        'Guarda y prepara el estado de la UI y sobrevive a los cambios de configuración como la rotación, a diferencia de la Activity. Se encarga de la lógica de presentación y de lanzar trabajo asíncrono con `viewModelScope`, que se cancela solo cuando el ViewModel se destruye. No debe tener referencias a Views ni a la Activity.',
    },
    {
      topic: 'concurrencia',
      question: '¿Por qué no se puede hacer una request de red en el main thread?',
      answer:
        'El main thread dibuja la UI y procesa los toques; si se bloquea, la app se congela y, después de unos segundos, Android muestra un ANR (Application Not Responding). Por eso Android tira `NetworkOnMainThreadException`. La red se hace en background, hoy con coroutines en `Dispatchers.IO`.',
    },
    {
      topic: 'red',
      question: '¿Cómo consumirías una API REST?',
      answer:
        'Con Retrofit: se define una interfaz con funciones `suspend` anotadas (`@GET("users/{id}")`), se configura con OkHttp y un converter (kotlinx.serialization o Moshi) y se llama desde una coroutine. Los errores de red y HTTP se manejan con try/catch o envolviendo el resultado en un tipo `Result`.',
    },
    {
      topic: 'persistencia',
      question: '¿Qué opciones hay para guardar datos localmente?',
      answer:
        'DataStore (reemplazo de SharedPreferences) para preferencias y pares clave-valor, Room para datos estructurados en SQLite con consultas verificadas en compilación, y archivos en el almacenamiento interno de la app. Los datos sensibles se cifran con el Android Keystore.',
    },
    {
      topic: 'android',
      question: '¿Cómo se piden permisos en tiempo de ejecución?',
      answer:
        'Los permisos peligrosos (cámara, ubicación, contactos) se declaran en el manifest y además se piden en runtime con `registerForActivityResult(RequestPermission())` o con `rememberLauncherForActivityResult` en Compose. Hay que manejar la negación, mostrar una explicación si `shouldShowRequestPermissionRationale` es true y pedirlo en contexto, cuando el usuario usa la función.',
    },
    {
      topic: 'compose',
      question: '¿Cómo se muestra una lista larga en Compose?',
      answer:
        'Con `LazyColumn` o `LazyRow`, que solo componen los elementos visibles (el equivalente a `RecyclerView`). Conviene pasar una `key` estable a cada item para que Compose conserve el estado y anime bien los cambios cuando la lista se reordena.',
    },
    {
      topic: 'gradle',
      question: '¿Qué es Gradle en un proyecto Android?',
      answer:
        'El sistema de build: compila el código, resuelve dependencias, genera variantes (debug/release, flavors) y empaqueta el APK o AAB. Se configura en `build.gradle.kts`; hoy las versiones de dependencias se suelen centralizar en un version catalog (`libs.versions.toml`).',
    },
  ],
  'semi-senior': [
    {
      topic: 'coroutines',
      question: '¿Qué es la structured concurrency en coroutines?',
      answer:
        'Toda coroutine vive dentro de un `CoroutineScope`, y el scope no termina hasta que terminan sus hijas. Si el scope se cancela, se cancelan todas; si una hija falla, se cancela el resto (salvo con `SupervisorJob`). Así no quedan tareas huérfanas: `viewModelScope` o `lifecycleScope` cancelan el trabajo cuando la pantalla se va.',
    },
    {
      topic: 'coroutines',
      question: '¿Qué diferencia hay entre `Flow`, `StateFlow` y `SharedFlow`?',
      answer:
        '`Flow` es un stream frío: empieza a emitir cuando alguien lo colecta, y cada colector tiene su ejecución. `StateFlow` es caliente, siempre tiene un valor actual y emite solo cambios: ideal para estado de UI. `SharedFlow` es caliente y sin valor actual obligatorio, configurable con replay: sirve para eventos. Con `stateIn` se convierte un `Flow` en `StateFlow`.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo organizarías las capas según la guía de arquitectura de Android?',
      answer:
        'Capa de UI (Composables + ViewModel que expone un `StateFlow` de UI state), capa de dominio opcional con use cases para lógica reutilizable, y capa de datos con repositorios que combinan fuentes remotas y locales. Flujo unidireccional: la UI manda eventos al ViewModel y observa el estado. Las dependencias se inyectan con Hilt.',
    },
    {
      topic: 'di',
      question: '¿Para qué sirve Hilt?',
      answer:
        'Es la librería de inyección de dependencias recomendada, construida sobre Dagger: genera el grafo en compilación con anotaciones (`@HiltAndroidApp`, `@AndroidEntryPoint`, `@HiltViewModel`, `@Module`/`@Provides`) y maneja los scopes según el ciclo de vida. Desacopla las clases de cómo se construyen sus dependencias y permite reemplazarlas por fakes en tests.',
    },
    {
      topic: 'compose',
      question: '¿Qué es el state hoisting en Compose?',
      answer:
        'Subir el estado de un composable a quien lo llama, dejando el composable stateless: recibe el valor y un callback (`value: String, onValueChange: (String) -> Unit`). Así es reutilizable, testeable y hay una única fuente de verdad. El estado se sube hasta el ancestro común más bajo que lo necesita, muchas veces el ViewModel.',
    },
    {
      topic: 'compose',
      question: '¿Para qué sirven los side effects como `LaunchedEffect` y `DisposableEffect`?',
      answer:
        'Para correr código que no es UI desde un composable de forma controlada. `LaunchedEffect(key)` lanza una coroutine al entrar en composición y la relanza si cambia la key. `DisposableEffect` registra algo (un listener) y lo limpia en `onDispose`. Llamar efectos directo en el cuerpo del composable es un bug, porque corre en cada recomposición.',
    },
    {
      topic: 'navegación',
      question: '¿Cómo manejarías la navegación en una app con Compose?',
      answer:
        'Con Navigation Compose: un `NavHost` con destinos, hoy con rutas type-safe definidas como clases serializables. Los argumentos se pasan en la ruta, y el ViewModel del destino los lee con `SavedStateHandle`. Se soportan deep links y back stack anidados para flujos como onboarding.',
    },
    {
      topic: 'persistencia',
      question: '¿Por qué usar Room en vez de SQLite directo?',
      answer:
        'Room verifica las queries SQL en tiempo de compilación, mapea filas a objetos, expone resultados como `Flow` que se actualizan solos cuando cambian los datos, soporta funciones `suspend` y facilita las migraciones de esquema. Evita mucho boilerplate y errores de cursor manual.',
    },
    {
      topic: 'background',
      question: '¿Cuándo usarías WorkManager?',
      answer:
        'Para trabajo diferible que tiene que ejecutarse aunque la app se cierre o el dispositivo se reinicie: sincronizar datos, subir archivos, limpiar caché. Permite constraints (con red, cargando), reintentos con backoff, trabajos periódicos y cadenas. Para trabajo inmediato mientras la app está abierta alcanza con coroutines.',
    },
    {
      topic: 'testing',
      question: '¿Cómo testearías un ViewModel con coroutines?',
      answer:
        'Con dependencias fake inyectadas, reemplazando el main dispatcher con `Dispatchers.setMain(StandardTestDispatcher())` y usando `runTest` para controlar el tiempo virtual. Para los `Flow` se usa Turbine o se colectan los valores y se verifica la secuencia de estados (cargando, éxito, error).',
    },
    {
      topic: 'performance',
      question: '¿Cómo encontrarías por qué una pantalla se siente lenta?',
      answer:
        'Con el profiler de Android Studio (CPU, memoria) y trazas de sistema con Perfetto para ver frames perdidos (jank). En Compose, el Layout Inspector muestra los conteos de recomposición: recomposiciones de más suelen venir de parámetros inestables, lambdas recreadas o leer estado demasiado arriba. Baseline Profiles mejoran el arranque y la fluidez inicial.',
    },
    {
      topic: 'android',
      question: '¿Cómo se maneja el cambio de configuración y la muerte del proceso?',
      answer:
        'El ViewModel sobrevive a la rotación, pero no a que el sistema mate el proceso en background. Para eso se guarda el estado mínimo (ids, inputs) en `SavedStateHandle` o `rememberSaveable`, y lo demás se vuelve a cargar del repositorio. Se prueba con "Don\'t keep activities" o matando el proceso desde adb.',
    },
    {
      topic: 'seguridad',
      question: '¿Dónde guardarías un token de sesión?',
      answer:
        'Cifrado con una clave del Android Keystore (que no se puede extraer del dispositivo), por ejemplo en DataStore cifrado. Nunca en texto plano ni en logs. Además: tráfico solo por HTTPS con Network Security Config, tokens de corta duración con refresh y R8 para ofuscar el código del release.',
    },
    {
      topic: 'gradle',
      question: '¿Qué son los build variants y para qué sirven?',
      answer:
        'Combinaciones de build types (debug, release) y product flavors (por ejemplo free/paid o dev/staging/prod). Cada variante puede tener su applicationId, recursos, URLs de API y dependencias propias. Permiten instalar en paralelo una app de staging y la de producción, o generar versiones distintas desde el mismo código.',
    },
    {
      topic: 'distribución',
      question: '¿Cómo es el proceso de publicar en Google Play?',
      answer:
        'Se genera un Android App Bundle (AAB) firmado (con Play App Signing, Google guarda la clave de firma), se sube a Play Console a un track (internal, closed, open testing o production) y se completa la ficha, la clasificación de contenido y la sección de seguridad de datos. Conviene usar staged rollouts para liberar a un porcentaje de usuarios y frenar si suben los crashes.',
    },
  ],
  senior: [
    {
      topic: 'arquitectura',
      question: '¿Cómo modularizarías una app Android grande?',
      answer:
        'Módulos Gradle por feature y por capa (`:core:network`, `:core:designsystem`, `:feature:checkout`), con features que no dependen entre sí y se comunican por interfaces o por navegación. Convention plugins en `build-logic` para no repetir configuración. Mejora los tiempos de build incremental, el ownership de equipos y la posibilidad de testear aislado.',
    },
    {
      topic: 'compose',
      question: '¿Cómo funciona la estabilidad en Compose y por qué afecta la performance?',
      answer:
        'Compose puede saltear (skip) la recomposición de un composable si sus parámetros no cambiaron, pero solo cuando son estables: tipos inmutables, primitivos o anotados con `@Stable`/`@Immutable`. Una `List` o una clase de otro módulo se infiere inestable y fuerza recomposiciones. Se mejora con colecciones inmutables, strong skipping mode y los reportes del compilador de Compose.',
    },
    {
      topic: 'offline',
      question: '¿Cómo diseñarías una app offline-first?',
      answer:
        'Room como única fuente de verdad que la UI observa con `Flow`; la red solo actualiza la base. Las escrituras se aplican local y se encolan para sincronizar con WorkManager con constraints de red y reintentos. Hay que definir la resolución de conflictos (timestamps, versiones o merge por campo) y la paginación local con Paging 3 + RemoteMediator.',
    },
    {
      topic: 'performance',
      question: '¿Cómo mejorarías el tiempo de arranque?',
      answer:
        'Midiendo cold start con Macrobenchmark y en producción con Android Vitals. Después: Baseline Profiles para que el código crítico venga precompilado, diferir la inicialización de SDKs con App Startup o lazy, sacar I/O del main thread, simplificar el primer frame y usar la Splash Screen API. R8 en modo full también ayuda al achicar el código.',
    },
    {
      topic: 'performance',
      question: '¿Cómo encontrarías y resolverías memory leaks?',
      answer:
        'Con LeakCanary en debug y el memory profiler con heap dumps. Las causas típicas: referencias a una Activity desde un singleton o un callback largo, listeners sin desregistrar, coroutines en `GlobalScope` que capturan contexto y bitmaps grandes sin liberar. Se resuelve con scopes atados al ciclo de vida, `applicationContext` cuando corresponde y desregistrando en el momento adecuado.',
    },
    {
      topic: 'coroutines',
      question: '¿Cómo se manejan las excepciones y la cancelación en coroutines?',
      answer:
        'La cancelación es cooperativa: las funciones suspend de kotlinx la chequean, pero un loop de CPU tiene que llamar `ensureActive()`. Nunca hay que tragarse `CancellationException` en un catch genérico. En `launch` las excepciones no capturadas se propagan al padre y al `CoroutineExceptionHandler`; en `async`, al `await()`. Con `supervisorScope` el fallo de una hija no cancela a las demás.',
    },
    {
      topic: 'testing',
      question: '¿Cómo armarías la estrategia de testing?',
      answer:
        'Muchos unit tests en JVM (ViewModels, repositorios, use cases) con fakes en vez de mocks donde se pueda; tests de Room con base en memoria; tests de UI de Compose con `createComposeRule` para pantallas; screenshot tests (Paparazzi o Roborazzi) para el design system; y pocos tests end-to-end en dispositivo para los flujos críticos. Todo en CI con Gradle Managed Devices.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué riesgos de seguridad tiene una app Android y cómo los mitigás?',
      answer:
        'El APK se puede descompilar: nada de secretos en el código, ofuscación con R8 y la lógica sensible en el backend. Componentes exportados sin querer (activities o receivers con `exported=true`) que otras apps pueden invocar; intents y deep links que hay que validar; WebViews con JavaScript expuesto; datos en almacenamiento externo. Play Integrity API para detectar dispositivos o apps adulterados.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo automatizarías builds y releases?',
      answer:
        'CI que corre lint, detekt/ktlint, unit tests y build en cada PR con caché de Gradle; en main genera el AAB firmado con la upload key guardada como secreto, versiona automáticamente y sube a un track de testing con fastlane o la API de Play Developer. Releases a producción con staged rollout y feature flags para separar deploy de lanzamiento.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo monitoreás la app en producción?',
      answer:
        'Crash reporting (Crashlytics, Sentry) con los mapping files de R8 subidos para desofuscar, Android Vitals para ANRs, crashes y arranque, logs estructurados sin datos personales y analytics de los funnels clave. Alertas por versión para frenar un staged rollout si cae el crash-free rate.',
    },
    {
      topic: 'android',
      question: '¿Cómo encararías la migración de una app de Views a Compose?',
      answer:
        'De forma incremental: pantallas nuevas en Compose, `ComposeView` para meter Compose dentro de layouts existentes y `AndroidView` para reutilizar Views en Compose. Primero se construye el design system en Compose con el mismo tema, se migran pantallas hoja y se deja la navegación para el final. Se mide performance y tamaño del APK durante la migración.',
    },
    {
      topic: 'kotlin multiplatform',
      question: '¿Cuándo usarías Kotlin Multiplatform?',
      answer:
        'Para compartir lógica entre Android, iOS y otros targets (red, persistencia, reglas de negocio) manteniendo UI nativa, o también la UI con Compose Multiplatform. Conviene cuando hay mucha lógica duplicada y el equipo maneja Kotlin. El costo: tooling de iOS menos maduro, interoperabilidad con Swift (aunque mejora con SKIE o la exportación a Swift) y que el equipo iOS tiene que adoptarlo.',
    },
    {
      topic: 'diseño de sistemas',
      question: '¿Cómo diseñarías un chat en tiempo real en Android?',
      answer:
        'Conexión WebSocket mientras la app está en primer plano y push notifications con FCM cuando no; mensajes persistidos en Room como fuente de verdad, con estado de envío (pendiente, enviado, leído) y una cola de salida que se reintenta con WorkManager. Paginación hacia atrás con Paging 3, ids generados en el cliente para deduplicar y orden por timestamp del servidor.',
    },
    {
      topic: 'compatibilidad',
      question: '¿Cómo manejás la fragmentación de dispositivos y versiones?',
      answer:
        'Definiendo un `minSdk` según los usuarios reales, usando AndroidX y Jetpack para comportamientos consistentes entre versiones, chequeando `Build.VERSION.SDK_INT` para APIs nuevas, diseñando layouts adaptativos para tamaños de pantalla y foldables (window size classes) y probando en una matriz de dispositivos (Firebase Test Lab) con foco en gama baja.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo definís estándares técnicos en un equipo Android?',
      answer:
        'Con decisiones de arquitectura escritas (ADRs), un proyecto de referencia o plantillas de módulo, lint y reglas de detekt que hagan cumplir las convenciones de forma automática, code reviews con foco en enseñar y un design system compartido. Los estándares se revisan cuando el equipo o la plataforma cambian, no se imponen para siempre.',
    },
  ],
};
