import type { InterviewGuide } from './types';

export const iosGuide: InterviewGuide = {
  track: 'ios',
  summary:
    'Cómo prepararte para una entrevista de iOS: Swift, SwiftUI y UIKit, concurrencia, arquitectura, performance, testing, seguridad, publicación y el día de la entrevista.',
  sections: [
    {
      id: 'como-es-la-entrevista',
      title: 'Cómo es la entrevista',
      body: [
        'Un proceso para iOS suele tener una charla con recruiting, una entrevista técnica sobre Swift y el SDK, un ejercicio práctico (live coding en Xcode o un take-home) y una charla con el equipo. En empresas con producto mobile grande se suma una ronda de diseño de sistemas mobile y otra de comportamiento. Preguntá si el ejercicio es en SwiftUI o UIKit y si podés usar tu propio Xcode.',
        'Para junior se evalúan los fundamentos de Swift (optionals, `struct` vs `class`, protocols, closures, `guard`), lo básico de SwiftUI (`@State`, listas, navegación) y de UIKit (ciclo de vida de un `UIViewController`, Auto Layout), por qué la UI se actualiza en el main thread y cómo hacer una request y decodificar JSON con `Codable`.',
        'Para semi-senior aparecen ARC y retain cycles, async/await y actors, MVVM, navegación moderna, testing de view models, persistencia con Core Data o SwiftData, accesibilidad y el proceso de publicación. Para senior: Swift 6 y strict concurrency, modularización, arranque y memoria, identidad de vistas en SwiftUI, offline-first, seguridad, CI/CD, convivencia de UIKit y SwiftUI y manejo de deuda técnica.',
      ],
      checklist: [
        'Saber qué etapas tiene el proceso y si el ejercicio es en SwiftUI o UIKit',
        'Tener una app propia que puedas explicar, idealmente publicada o en TestFlight',
        'Identificar los temas de tu seniority que te cuestan más',
        'Poder contar en dos minutos tu experiencia y qué rol buscás',
      ],
    },
    {
      id: 'swift',
      title: 'Swift: fundamentos del lenguaje',
      body: [
        'Los optionals son lo primero que te preguntan: qué representan, y las formas seguras de desempaquetarlos (`if let`, `guard let`, `??`, optional chaining). Sabé por qué el force unwrap con `!` es un riesgo y en qué casos raros es aceptable. `guard` sirve para salir temprano y dejar el camino feliz sin anidar.',
        '`struct` vs `class` es la otra pregunta segura: las structs son value types (se copian, son seguras entre hilos y la opción por defecto en Swift), las classes son reference types (identidad compartida, herencia, ARC). Conocé copy-on-write en las colecciones de la standard library y cuándo realmente necesitás una class. Sumale enums con associated values y `switch` exhaustivo, que son la forma idiomática de modelar estados.',
        'En semi-senior y senior entran protocols con extensions y default implementations, generics y associated types, `some` vs `any` (tipos opacos vs existenciales), closures y `@escaping`, manejo de errores con `throws` y typed throws, y en senior result builders y macros. Lo que buscan es que uses el sistema de tipos para hacer imposibles los estados inválidos.',
      ],
      checklist: [
        'Desempaquetar optionals de forma segura y justificar cada forma',
        'Elegir entre `struct` y `class` para un caso y explicar por qué',
        'Modelar un estado de pantalla con un enum con associated values',
        'Explicar qué significa que un closure sea `@escaping`',
        'Explicar la diferencia entre `some View` y `any Protocol`',
      ],
    },
    {
      id: 'swiftui-y-uikit',
      title: 'SwiftUI y UIKit',
      body: [
        'SwiftUI es declarativo: describís la UI en función del estado y el framework recalcula el `body` cuando el estado cambia. Sabé cuándo usar cada property wrapper: `@State` para estado local de la vista, `@Binding` para que un hijo modifique estado del padre, `@Observable` (Observation framework) para modelos con `@State` o `@Environment`, y `@Environment` para dependencias compartidas. Con `@Observable` solo se invalidan las vistas que leen la propiedad que cambió, a diferencia de `ObservableObject` con `@Published`.',
        'En senior te van a preguntar por la identidad de las vistas: identidad estructural (posición en el árbol) e identidad explícita (`id`). Cambiar la identidad destruye el estado y reinicia animaciones; un `if` mal puesto o un `id` inestable en una `List` explican muchos bugs. Para navegación, conocé `NavigationStack` con `navigationDestination` y path basado en datos, y `NavigationSplitView` para iPad.',
        'UIKit sigue en la mayoría de las apps grandes. Repasá el ciclo de vida de un `UIViewController` (`viewDidLoad`, `viewWillAppear`, `viewDidAppear`, etc.), Auto Layout con constraints, `UITableView` y `UICollectionView` con diffable data sources y compositional layout, y cómo integrar ambos mundos con `UIHostingController` y `UIViewRepresentable`. Una buena respuesta senior explica una migración incremental, pantalla por pantalla, y no un rewrite.',
      ],
      checklist: [
        'Elegir el property wrapper correcto para cada tipo de estado',
        'Explicar qué cambia entre `@Observable` y `ObservableObject`',
        'Explicar la identidad de vistas y un bug que causa cambiarla',
        'Armar navegación con `NavigationStack` basada en datos',
        'Explicar el ciclo de vida de un `UIViewController`',
        'Integrar una vista SwiftUI en UIKit y viceversa',
      ],
    },
    {
      id: 'concurrencia-y-memoria',
      title: 'Concurrencia y memoria',
      body: [
        'La UI se actualiza solo desde el main thread, y en Swift moderno eso se expresa con `@MainActor`. Sabé explicar por qué async/await mejora sobre los completion handlers (código lineal, errores con `throws`, cancelación), qué es una `Task`, cómo funciona la cancelación cooperativa y la structured concurrency con `async let` y task groups. En SwiftUI, el modificador `.task` ata el trabajo al ciclo de vida de la vista.',
        'Un `actor` protege su estado mutable serializando el acceso, lo que elimina data races. Conocé la reentrancy: dentro de un actor, después de un `await` el estado puede haber cambiado. Swift 6 activa el strict concurrency checking: el compilador detecta data races y exige que lo que cruza entre dominios de aislamiento sea `Sendable`. Desde Swift 6.2 los proyectos nuevos pueden aislar todo al `MainActor` por defecto y salir de él explícitamente, lo que simplifica mucho la migración.',
        'En memoria, ARC cuenta referencias fuertes y libera un objeto cuando llegan a cero. Un retain cycle aparece cuando dos objetos se retienen mutuamente, típicamente un view controller que guarda un closure que captura `self`. Se resuelve con `[weak self]` o `[unowned self]` y referencias `weak` en delegates. Para encontrarlos, usá el Memory Graph Debugger de Xcode e Instruments con Leaks y Allocations.',
      ],
      checklist: [
        'Explicar por qué la UI se actualiza en el main thread y cómo garantizarlo',
        'Convertir un completion handler a async/await',
        'Explicar qué protege un `actor` y qué es la reentrancy',
        'Explicar qué es `Sendable` y qué cambia con Swift 6',
        'Encontrar y romper un retain cycle con `[weak self]`',
      ],
    },
    {
      id: 'arquitectura-y-datos',
      title: 'Arquitectura, red y persistencia',
      body: [
        'MVVM es la arquitectura más pedida: la vista muestra estado y envía acciones, el view model transforma datos y maneja la lógica de presentación, y los servicios o repositorios hablan con la red y la base. La clave es la inyección de dependencias por protocolo o por inicializador, que es lo que permite testear. En senior te pueden preguntar por TCA: da estado predecible y testing exhaustivo a cambio de curva de aprendizaje y una dependencia fuerte; tené una opinión con matices.',
        'Para red, sabé diseñar una capa reutilizable: un cliente sobre `URLSession` con async/await, endpoints tipados, decodificación con `Codable`, manejo centralizado de errores y autenticación (refresh de token sin duplicar requests), reintentos y logging. Un error común es mezclar decodificación, red y lógica de UI en el mismo view model.',
        'En persistencia: `UserDefaults` para preferencias, Keychain para secretos, archivos para datos grandes, y Core Data o SwiftData para datos estructurados. Con SwiftData, el `ModelContext` del main actor es para la UI y el trabajo pesado va en un `@ModelActor`; los modelos no se pasan entre hilos, se pasan identificadores. En senior, offline-first: la base local es la fuente de verdad, la red sincroniza, y hay que resolver conflictos y colas de cambios pendientes.',
      ],
      checklist: [
        'Explicar MVVM con inyección de dependencias y cómo lo testeás',
        'Opinar con trade-offs sobre cuándo usar TCA',
        'Diseñar un cliente de red con endpoints tipados y refresh de token',
        'Elegir dónde guardar cada tipo de dato, incluidos los secretos',
        'Explicar cómo usar SwiftData o Core Data en segundo plano sin data races',
        'Esbozar una app offline-first con sincronización',
      ],
    },
    {
      id: 'performance',
      title: 'Performance',
      body: [
        'La herramienta es Instruments: Time Profiler para CPU, Allocations y Leaks para memoria, Hangs para bloqueos del main thread, y el instrumento de SwiftUI para ver qué vistas se actualizan y por qué. La respuesta que buscan siempre empieza por medir, idealmente en un dispositivo real y en build de release.',
        'Un scroll que se traba suele deberse a trabajo pesado en el main thread (decodificar imágenes, formatear fechas, cálculos en `body`), celdas con layouts caros o vistas que se invalidan de más. Las soluciones son mover trabajo a background, cachear y redimensionar imágenes, usar `LazyVStack` o `List`, y en SwiftUI achicar las dependencias de cada vista para que no se re-evalúe todo.',
        'El tiempo de arranque se mejora haciendo menos antes del primer frame: diferir inicializaciones de SDKs, reducir frameworks dinámicos, evitar trabajo síncrono en `init` y en el app delegate, y medir con la plantilla App Launch de Instruments y con MetricKit en producción. Para memoria, sabé distinguir un leak (algo que nunca se libera) de un pico (imágenes grandes sin downsampling).',
      ],
      checklist: [
        'Usar Time Profiler para encontrar trabajo pesado en el main thread',
        'Explicar causas y soluciones de un scroll que se traba',
        'Explicar cómo medir y reducir el tiempo de arranque',
        'Diferenciar un leak de un pico de memoria',
        'Explicar cómo detectar vistas de SwiftUI que se actualizan de más',
      ],
    },
    {
      id: 'testing',
      title: 'Testing',
      body: [
        'Para testear un view model que llama a la red, inyectá un protocolo y pasale un fake o un stub que devuelva datos controlados; así testeás estados de loading, éxito y error sin red real. Para async/await, los tests pueden ser `async` directamente. Un error común es testear contra servicios reales o depender del orden de ejecución.',
        'Swift Testing es el framework moderno: `@Test`, `#expect`, `#require`, tests parametrizados y ejecución en paralelo por defecto. XCTest sigue vigente, sobre todo para UI tests con `XCUITest` y para tests de performance. Sabé las diferencias y que pueden convivir en el mismo target.',
        'En senior, la estrategia: muchos unit tests rápidos en la lógica (view models, reducers, parsing), algunos tests de integración en la capa de datos, snapshot tests para componentes visuales críticos y pocos UI tests para los flujos de negocio más importantes. Todo corriendo en CI en cada pull request, con tests deterministas y sin depender de red ni de la hora del sistema.',
      ],
      checklist: [
        'Testear un view model con un servicio fake inyectado',
        'Escribir un test con Swift Testing usando `@Test` y `#expect`',
        'Explicar cuándo usar UI tests y snapshot tests',
        'Explicar cómo hacer tests deterministas con fechas y concurrencia',
        'Proponer una estrategia de testing para una app mediana',
      ],
    },
    {
      id: 'plataforma-y-publicacion',
      title: 'Plataforma, seguridad y publicación',
      body: [
        'Conocé el ciclo de vida de la app (activa, inactiva, en background, suspendida) y cómo reaccionar con `scenePhase` o los delegates, qué es el `Info.plist` y por qué cada permiso necesita su texto de justificación, cómo funcionan las push notifications (APNs, token del dispositivo, permiso del usuario, notificaciones silenciosas) y los deep links con universal links.',
        'En seguridad: secretos en Keychain y nunca en `UserDefaults` ni hardcodeados en el binario, App Transport Security, certificate pinning cuando el riesgo lo justifica (y su costo de mantenimiento), Face ID o Touch ID para acciones sensibles y no loguear datos personales. En accesibilidad: VoiceOver con labels y traits correctos, Dynamic Type, contraste y áreas táctiles suficientes.',
        'Para publicar: firma con certificados y provisioning profiles, builds en TestFlight, App Store Connect, metadata, Privacy Manifest y etiquetas de privacidad, y revisión de Apple. En senior se espera CI/CD: builds automáticas con Xcode Cloud, GitHub Actions o fastlane, versionado, rollout por fases y feature flags. Para observabilidad, crash reporting con Crashlytics o Sentry, MetricKit y métricas de producto.',
      ],
      checklist: [
        'Explicar los estados de la app y cómo reaccionar a cada uno',
        'Explicar el flujo completo de una push notification',
        'Enumerar las medidas de seguridad para una app con datos sensibles',
        'Hacer accesible una pantalla con VoiceOver y Dynamic Type',
        'Describir el proceso de publicación y los motivos comunes de rechazo',
        'Esbozar un pipeline de CI/CD para builds y releases',
      ],
    },
    {
      id: 'ejercicios-practicos',
      title: 'Live coding, take-home y system design',
      body: [
        'El live coding típico de iOS es una pantalla con lista que consume una API: traer datos, decodificarlos, mostrarlos con loading y error, y quizás detalle o búsqueda. Practicalo en SwiftUI y en UIKit con un timer de 45 minutos. Prioridad: que funcione, después estados de error, después prolijidad. También aparecen ejercicios de algoritmos simples en Swift, así que tené fluidez con colecciones y `Dictionary`.',
        'En un take-home se evalúan arquitectura clara (MVVM o similar), separación de capas, algunos tests de la lógica, manejo de errores y estados vacíos, accesibilidad básica y un README que explique decisiones y qué mejorarías. Evitá sobrediseñar o agregar dependencias que no justificás.',
        'El diseño de sistemas mobile (senior) pide cosas como un feed con imágenes, paginación y caché, un chat, o una app offline. Cubrí requisitos, capas y responsabilidades, modelo de datos, API y paginación (cursor vs offset), caché en memoria y disco, sincronización, manejo de errores y reintentos, performance, batería y datos móviles, y cómo lo observarías en producción.',
      ],
      checklist: [
        'Resolver una lista con datos remotos, loading y error en 45 minutos',
        'Tener un take-home de ejemplo con README y tests',
        'Diseñar un feed con paginación por cursor y caché de imágenes',
        'Explicar trade-offs de sincronización y batería en un diseño mobile',
        'Hablar en voz alta mientras resolvés un ejercicio',
      ],
    },
    {
      id: 'el-dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta y hacé preguntas antes de codear: si es SwiftUI o UIKit, qué versión mínima de iOS soportan, qué pasa con errores. Contá tu plan en una frase y después ejecutalo. Si no sabés algo, decilo, razoná a partir de lo que sabés y explicá cómo lo averiguarías: en iOS es normal no recordar cada API, lo que importa es el criterio.',
        'Para preguntas de comportamiento usá STAR: situación, tarea, acción y resultado. Prepará historias reales sobre un crash difícil en producción, un desacuerdo técnico, una entrega que salió mal, una mejora que propusiste y alguien a quien ayudaste. Contalas en primera persona y con resultados concretos.',
        'Llevá preguntas para la empresa: qué versión mínima de iOS soportan, cuánto es SwiftUI y cuánto UIKit, cómo es el proceso de release y cada cuánto publican, cómo testean y cómo es el code review. Antes de entrar, tené Xcode actualizado, un proyecto vacío que compile, simulador abierto, y revisá cámara y conexión.',
      ],
      checklist: [
        'Hacer al menos dos preguntas de aclaración antes de codear',
        'Tener cuatro o cinco historias preparadas en formato STAR',
        'Saber cómo responder cuando no recordás una API',
        'Tener tres preguntas propias para la empresa',
        'Dejar listo Xcode, un proyecto que compile y el simulador',
      ],
    },
  ],
};
