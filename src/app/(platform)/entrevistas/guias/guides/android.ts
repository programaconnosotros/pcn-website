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
        'Saber qué etapas tiene el proceso y si el ejercicio es con Compose o Views',
        'Tener una app propia que puedas explicar, idealmente publicada',
        'Identificar los temas de tu seniority que te cuestan más',
        'Poder contar en dos minutos tu experiencia y qué rol buscás',
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
        'Manejar nulabilidad sin `!!` y explicar cada operador',
        'Modelar un estado de pantalla con una `sealed interface`',
        'Explicar qué genera una `data class` y para qué sirve `copy`',
        'Elegir la scope function adecuada en un caso concreto',
        'Explicar `in` y `out` en generics con un ejemplo',
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
        'Explicar el ciclo de vida de una `Activity` y qué hacer en cada callback',
        'Diferenciar `Intent` explícito e implícito',
        'Pedir un permiso en runtime y manejar el rechazo',
        'Explicar cambio de configuración vs muerte del proceso y cómo sobrevivir a ambos',
        'Explicar cómo manejar pantallas grandes, edge-to-edge y distintas versiones',
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
        'Explicar la diferencia entre `remember` y `rememberSaveable`',
        'Aplicar state hoisting a un composable con estado propio',
        'Elegir entre `LaunchedEffect`, `DisposableEffect` y `rememberCoroutineScope`',
        'Explicar qué es la estabilidad y cómo afecta la recomposición',
        'Detectar recomposiciones innecesarias con el Layout Inspector',
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
        'Explicar qué dispatcher usar para cada tipo de trabajo',
        'Explicar structured concurrency y qué pasa al cancelar un scope',
        'Explicar cómo se propagan las excepciones y cuándo usar `SupervisorJob`',
        'Diferenciar `Flow`, `StateFlow` y `SharedFlow` con un caso para cada uno',
        'Convertir un `Flow` del repositorio en `StateFlow` con `stateIn`',
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
        'Explicar las capas de la arquitectura recomendada y el flujo unidireccional',
        'Explicar qué resuelve Hilt y cómo reemplazás una dependencia en un test',
        'Explicar por qué usar Room en vez de SQLite directo',
        'Elegir entre WorkManager y una coroutine para una tarea en background',
        'Esbozar una app offline-first con Room como fuente de verdad',
        'Armar navegación con rutas tipadas y pasaje de argumentos',
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
        'Usar el profiler y Perfetto para encontrar trabajo en el main thread',
        'Explicar qué son los Baseline Profiles y cómo mejoran el arranque',
        'Encontrar un memory leak con LeakCanary y explicar su causa',
        'Testear un `ViewModel` con `runTest` y un `TestDispatcher`',
        'Escribir un test de UI de Compose que busque por texto o semántica',
        'Proponer una estrategia de testing para una app mediana',
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
        'Explicar dónde y cómo guardar un token de sesión',
        'Enumerar riesgos de seguridad de una app Android y cómo mitigarlos',
        'Hacer accesible una pantalla de Compose y probarla con TalkBack',
        'Explicar build variants y product flavors',
        'Describir el proceso de publicación con tracks y rollout escalonado',
        'Esbozar un pipeline de CI/CD con monitoreo posterior',
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
        'Resolver una lista con datos remotos en Compose en 45 minutos',
        'Tener un proyecto base con red, serialización y Hilt listo',
        'Tener un take-home de ejemplo con README y tests',
        'Diseñar un chat en tiempo real con persistencia local y reintentos',
        'Hablar en voz alta mientras resolvés un ejercicio',
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
        'Hacer al menos dos preguntas de aclaración antes de codear',
        'Tener cuatro o cinco historias preparadas en formato STAR',
        'Saber cómo responder cuando no recordás una API',
        'Tener tres preguntas propias para la empresa',
        'Dejar listo Android Studio, un proyecto que compile y el emulador',
      ],
    },
  ],
};
