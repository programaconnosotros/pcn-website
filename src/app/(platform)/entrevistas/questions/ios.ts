import type { InterviewQuestion, Seniority } from './types';

export const iosQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'swift',
      question: '¿Cuál es la diferencia entre `let` y `var` en Swift?',
      answer:
        '`let` declara una constante: una vez asignada no se puede reasignar. `var` declara una variable que sí puede cambiar. Con structs, `let` además impide mutar sus propiedades, porque el valor entero es inmutable. Swift recomienda usar `let` por defecto y pasar a `var` solo cuando hace falta.',
    },
    {
      topic: 'swift',
      question: '¿Qué es un optional y cómo se desempaqueta de forma segura?',
      answer:
        'Un optional (`String?`) representa un valor que puede estar o ser `nil`. Se desempaqueta de forma segura con `if let` o `guard let`, con optional chaining (`user?.name`) o con el operador nil-coalescing (`name ?? "Anónimo"`). El force unwrap (`name!`) crashea la app si el valor es `nil`, así que se evita salvo que sea imposible que falte.',
    },
    {
      topic: 'swift',
      question: '¿Qué diferencia hay entre una `struct` y una `class`?',
      answer:
        'Las structs son tipos por valor: al asignarlas o pasarlas se copian, y no tienen herencia. Las clases son tipos por referencia: varias variables apuntan a la misma instancia, soportan herencia y se gestionan con ARC. En Swift se prefieren las structs para modelos de datos porque son más predecibles y seguras entre hilos.',
    },
    {
      topic: 'swift',
      question: '¿Para qué sirve `guard`?',
      answer:
        'Valida una condición al principio de una función y, si no se cumple, obliga a salir del scope con `return`, `throw`, `break` o `continue`. Con `guard let` las variables desempaquetadas quedan disponibles en el resto de la función, lo que evita el "pyramid of doom" de `if let` anidados.',
    },
    {
      topic: 'swiftui',
      question: '¿Qué es SwiftUI y en qué se diferencia de UIKit?',
      answer:
        'SwiftUI es el framework declarativo de Apple: describís cómo se ve la UI para un estado dado y el sistema la actualiza cuando el estado cambia. UIKit es imperativo: creás vistas, las agregás a la jerarquía y las modificás a mano, normalmente desde view controllers. Muchas apps conviven con ambos usando `UIHostingController` y `UIViewRepresentable`.',
    },
    {
      topic: 'swiftui',
      question: '¿Para qué sirve `@State` en SwiftUI?',
      answer:
        'Declara estado local y privado de una vista. SwiftUI guarda el valor fuera de la struct de la vista y, cuando cambia, vuelve a calcular el `body`. Se usa para cosas simples propias de la vista, como si un toggle está activo o el texto de un campo. Para pasarlo a una vista hija que lo modifique se usa `@Binding` con `$valor`.',
    },
    {
      topic: 'uikit',
      question: '¿Cuál es el ciclo de vida de un `UIViewController`?',
      answer:
        '`loadView` crea la vista, `viewDidLoad` corre una vez cuando se cargó (configuración inicial), `viewWillAppear` y `viewDidAppear` cada vez que aparece en pantalla, y `viewWillDisappear` y `viewDidDisappear` cuando se va. `viewWillLayoutSubviews`/`viewDidLayoutSubviews` corren cada vez que cambia el layout.',
    },
    {
      topic: 'uikit',
      question: '¿Qué es Auto Layout?',
      answer:
        'Es el sistema de UIKit para posicionar vistas con constraints: relaciones entre anclas (bordes, centros, tamaños) en vez de frames fijos. Así la interfaz se adapta a distintos tamaños de pantalla, orientaciones y Dynamic Type. Las constraints tienen que ser suficientes y no contradictorias, o el sistema las rompe y avisa en consola.',
    },
    {
      topic: 'concurrencia',
      question: '¿Por qué la UI se tiene que actualizar en el main thread?',
      answer:
        'UIKit y SwiftUI no son thread-safe: solo el main thread puede tocar la jerarquía de vistas. Si actualizás la UI desde un hilo de fondo podés tener glitches o crashes. Con async/await se marca el código de UI con `@MainActor`; con GCD se vuelve con `DispatchQueue.main.async`.',
    },
    {
      topic: 'red',
      question: '¿Cómo harías una request HTTP y decodificarías el JSON?',
      answer:
        'Con `URLSession`: `let (data, response) = try await URLSession.shared.data(from: url)`, se valida el status code del `HTTPURLResponse` y se decodifica con `JSONDecoder().decode(User.self, from: data)`, donde `User` conforma `Decodable`. Con `CodingKeys` o `keyDecodingStrategy = .convertFromSnakeCase` se mapean nombres distintos.',
    },
    {
      topic: 'swift',
      question: '¿Qué es un protocol en Swift?',
      answer:
        'Define un contrato de métodos y propiedades que un tipo se compromete a implementar. Cualquier struct, class o enum puede conformarlo. Con extensions se les puede dar implementaciones por defecto, y son la base de patrones como delegate, de la inyección de dependencias y de los mocks en tests.',
    },
    {
      topic: 'xcode',
      question: '¿Para qué sirve el `Info.plist`?',
      answer:
        'Es el archivo de configuración de la app: identificador, versión, nombre visible, orientaciones soportadas y, muy importante, los textos que explican por qué la app pide permisos (`NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`, etc.). Si falta uno de esos textos, la app crashea al pedir el permiso.',
    },
    {
      topic: 'persistencia',
      question: '¿Qué opciones hay para guardar datos localmente en iOS?',
      answer:
        '`UserDefaults` para preferencias simples, el Keychain para datos sensibles como tokens, archivos en el sandbox (`FileManager`) para documentos o caché, y Core Data o SwiftData para datos estructurados con relaciones y consultas. Guardar un token en `UserDefaults` es un error clásico porque no está cifrado.',
    },
    {
      topic: 'swiftui',
      question: '¿Cómo se muestra una lista de elementos en SwiftUI?',
      answer:
        'Con `List` o con `ForEach` dentro de un `ScrollView`/`LazyVStack`. Los elementos necesitan una identidad estable: o conforman `Identifiable` o se pasa `id: \\.algo`. La identidad le permite a SwiftUI animar inserciones y borrados y no confundir el estado de una fila con el de otra.',
    },
    {
      topic: 'swift',
      question: '¿Qué es un closure y qué significa que sea `@escaping`?',
      answer:
        'Un closure es un bloque de código que se puede pasar como valor y que captura variables de su contexto. Es `@escaping` cuando puede ejecutarse después de que la función que lo recibió retornó, por ejemplo un callback de red. En ese caso hay que cuidar las capturas de `self` para no generar retain cycles.',
    },
  ],
  'semi-senior': [
    {
      topic: 'memoria',
      question: '¿Cómo funciona ARC y qué es un retain cycle?',
      answer:
        'ARC (Automatic Reference Counting) cuenta las referencias fuertes a cada instancia de clase y la libera cuando llegan a cero. Un retain cycle pasa cuando dos objetos se referencian fuerte entre sí (o un closure guardado captura `self` fuerte), así ninguno llega a cero y se pierde memoria. Se rompe con `weak` (opcional, se vuelve `nil`) o `unowned` (asume que el otro vive más), y en closures con `[weak self]`.',
    },
    {
      topic: 'swiftui',
      question:
        '¿Qué diferencia hay entre `@State`, `@Binding`, `@StateObject`, `@ObservedObject` y `@EnvironmentObject`?',
      answer:
        '`@State` es estado de valor propio de la vista; `@Binding` es una referencia de lectura/escritura a estado de otro. `@StateObject` crea y es dueño de un `ObservableObject` (sobrevive a los re-renders); `@ObservedObject` observa uno que creó otro; `@EnvironmentObject` lo inyecta desde un ancestro. Con el macro `@Observable` (iOS 17) se simplifica: alcanza con `@State` para ser dueño y pasar la instancia directo.',
    },
    {
      topic: 'concurrencia',
      question: '¿Qué ventajas tiene async/await sobre los completion handlers?',
      answer:
        'El código asíncrono se lee de arriba hacia abajo como si fuera sincrónico, los errores se propagan con `throws` en vez de callbacks con `Result`, no te podés olvidar de llamar al completion y la cancelación es cooperativa vía `Task`. Además el compilador verifica el aislamiento con actors y `Sendable`, lo que previene data races.',
    },
    {
      topic: 'concurrencia',
      question: '¿Qué es un `actor` en Swift?',
      answer:
        'Es un tipo por referencia que protege su estado mutable: solo una tarea a la vez puede ejecutar su código, así se evitan data races. Desde afuera se accede con `await`. `@MainActor` es un actor global que garantiza que el código corra en el main thread, ideal para view models que actualizan la UI.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo estructurarías una app con MVVM?',
      answer:
        'Las vistas solo dibujan y mandan eventos; el view model expone el estado listo para mostrar y la lógica de presentación; los servicios o repositorios encapsulan red y persistencia, inyectados por protocolo para poder mockearlos. El view model no importa UIKit/SwiftUI de vistas concretas, así se testea con unit tests. Evita el "Massive View Controller".',
    },
    {
      topic: 'navegación',
      question: '¿Cómo se maneja la navegación en SwiftUI moderno?',
      answer:
        'Con `NavigationStack` y un `path` (array o `NavigationPath`) en el estado, más `.navigationDestination(for:)` para mapear tipos a pantallas. Al ser data-driven podés hacer deep links o volver a la raíz modificando el array. En apps grandes se suele centralizar en un router o coordinator.',
    },
    {
      topic: 'testing',
      question: '¿Cómo testearías un view model que llama a la red?',
      answer:
        'Inyectando el servicio de red por protocolo y pasando un mock o stub en el test que devuelva datos o errores controlados. Con XCTest (o Swift Testing con `@Test` y `#expect`) se llama al método async con `await` y se verifica el estado resultante. Así el test es rápido, determinista y no depende de internet.',
    },
    {
      topic: 'performance',
      question: '¿Cómo detectarías por qué un scroll se traba?',
      answer:
        'Con Instruments: Time Profiler para ver qué ocupa el main thread y el instrumento de Hangs/Animation Hitches para los frames perdidos. Causas típicas: decodificar imágenes grandes en el main thread, layouts complejos que se recalculan, trabajo pesado en `cellForRow` o en el `body`. Se resuelve moviendo trabajo a background, cacheando y achicando imágenes.',
    },
    {
      topic: 'red',
      question: '¿Cómo diseñarías una capa de red reutilizable?',
      answer:
        'Un cliente genérico que recibe un `Endpoint` (path, método, headers, body) y devuelve un tipo `Decodable` con async/await, con errores tipados (sin conexión, 401, decodificación). Interceptores para agregar el token y refrescarlo, reintentos con backoff para errores transitorios y un protocolo para mockearlo en tests.',
    },
    {
      topic: 'persistencia',
      question: '¿Qué tener en cuenta al usar Core Data o SwiftData con concurrencia?',
      answer:
        'Los contextos (o `ModelContext`) no son thread-safe: cada uno se usa en su propia cola o actor. Para trabajo pesado se usa un contexto de background (`performBackgroundTask` o un `@ModelActor`) y se pasan entre hilos los identificadores, no los objetos. Hay que planear migraciones del modelo cuando cambia el esquema.',
    },
    {
      topic: 'ciclo de vida',
      question: '¿Qué estados de la app existen y cómo reaccionás a ellos?',
      answer:
        'Active, inactive (por ejemplo con una llamada entrante o el control center), background y suspended. En SwiftUI se observa `scenePhase`; en UIKit, el `SceneDelegate`. Al ir a background se guarda el estado y se pausan tareas; el sistema puede matar la app suspendida sin aviso, así que no hay que depender de que vuelva.',
    },
    {
      topic: 'swift',
      question: '¿Qué son los generics y los associated types?',
      answer:
        'Los generics permiten escribir funciones y tipos que trabajan con cualquier tipo que cumpla ciertas restricciones (`func max<T: Comparable>`). Un associated type es un placeholder de tipo dentro de un protocol (`Collection.Element`) que define cada tipo que lo conforma. Con `some Protocol` y `any Protocol` se elige entre tipos opacos (más performantes) y existenciales.',
    },
    {
      topic: 'accesibilidad',
      question: '¿Qué hacés para que una app sea accesible?',
      answer:
        'Labels y hints de accesibilidad en los controles sin texto, soporte de Dynamic Type para que el texto escale, contraste suficiente, targets táctiles de al menos 44×44 pt, agrupar elementos relacionados para VoiceOver y respetar "reducir movimiento". Se prueba con VoiceOver y con el Accessibility Inspector.',
    },
    {
      topic: 'distribución',
      question: '¿Cómo es el proceso de publicar una app en el App Store?',
      answer:
        'Se configura el signing (certificado y provisioning profile, o signing automático), se hace un archive en Xcode o en CI, se sube a App Store Connect, se prueba con TestFlight y se envía a review con metadata, capturas y la información de privacidad. Apple revisa contra sus guidelines y puede rechazar por crashes, permisos sin justificar o pagos fuera de in-app purchase.',
    },
    {
      topic: 'notificaciones',
      question: '¿Cómo funcionan las push notifications en iOS?',
      answer:
        'La app pide permiso, se registra con APNs y recibe un device token que se manda al backend. El backend envía la notificación a APNs con ese token y Apple la entrega al dispositivo. Con `UNUserNotificationCenterDelegate` se maneja qué hacer al recibirla o tocarla, y con notification service extensions se puede modificar el contenido (por ejemplo agregar imágenes).',
    },
  ],
  senior: [
    {
      topic: 'arquitectura',
      question: '¿Cómo modularizarías una app iOS grande?',
      answer:
        'Separando en módulos con Swift Package Manager por feature y por capa (core de red, design system, features), con dependencias en un solo sentido y las features comunicándose por interfaces, no por implementaciones. Reduce tiempos de compilación, permite trabajar en paralelo y testear aislado. Se suele acompañar con una app "demo" por feature para iterar rápido.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cuándo elegirías TCA (The Composable Architecture) y cuándo no?',
      answer:
        'TCA da un flujo unidireccional estricto, estado y efectos testeables de forma exhaustiva y composición de features. Conviene en apps complejas con mucho estado compartido y equipos que valoran la testeabilidad. El costo: curva de aprendizaje, boilerplate, dependencia de una librería externa y a veces performance si no se escopean bien los stores. Para apps chicas, MVVM con `@Observable` suele alcanzar.',
    },
    {
      topic: 'concurrencia',
      question: '¿Qué cambia con el strict concurrency checking de Swift 6?',
      answer:
        'El compilador pasa a tratar los data races como errores: los valores que cruzan dominios de aislamiento tienen que ser `Sendable`, el estado global tiene que estar aislado a un actor y las clases no-`Sendable` no se pueden compartir entre tareas. Migrar implica marcar `@MainActor` donde corresponde, convertir clases compartidas en actors o structs y auditar los `@unchecked Sendable`.',
    },
    {
      topic: 'performance',
      question: '¿Cómo mejorarías el tiempo de arranque de una app?',
      answer:
        'Midiendo primero con el App Launch template de Instruments y las métricas de MetricKit. Después: reducir frameworks dinámicos (o hacerlos estáticos), sacar trabajo de `didFinishLaunching` y de inicializadores estáticos, diferir SDKs de terceros, cargar lo mínimo para el primer frame y evitar I/O sincrónico en el main thread.',
    },
    {
      topic: 'performance',
      question: '¿Cómo encontrarías y resolverías leaks y consumo excesivo de memoria?',
      answer:
        'Con el Memory Graph Debugger de Xcode para ver retain cycles y con Instruments (Leaks, Allocations) para el crecimiento de memoria. Las causas típicas son closures que capturan `self`, delegates fuertes, timers y observers sin invalidar, y cachés de imágenes sin límite. Se resuelve con `weak`, invalidando en `deinit` y usando `NSCache` con límites.',
    },
    {
      topic: 'swiftui',
      question: '¿Cómo funciona la identidad de las vistas en SwiftUI y por qué importa?',
      answer:
        'SwiftUI identifica cada vista por su posición estructural en el árbol o por un id explícito. Si la identidad cambia, la vista se destruye y se crea de nuevo, perdiendo su `@State` y sus animaciones. Usar `if/else` que cambian el tipo, `.id()` con valores inestables o `AnyView` innecesario rompe la identidad y causa bugs y renders de más.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué medidas de seguridad tomarías en una app que maneja datos sensibles?',
      answer:
        'Tokens y secretos en el Keychain con la accesibilidad adecuada, App Transport Security con HTTPS y certificate pinning si el riesgo lo justifica, no loguear datos personales, proteger capturas en pantallas sensibles, biometría con LocalAuthentication, Data Protection en archivos y no confiar en el cliente: toda validación importante va en el backend.',
    },
    {
      topic: 'offline',
      question: '¿Cómo diseñarías una app offline-first?',
      answer:
        'La base local es la fuente de verdad: la UI lee de ahí y la red sincroniza en segundo plano. Las escrituras se guardan localmente y van a una cola de operaciones pendientes que se reintenta con backoff. Hay que definir resolución de conflictos (last-write-wins, merge por campo o versión) y usar `BGTaskScheduler` para sincronizar cuando el sistema lo permite.',
    },
    {
      topic: 'testing',
      question: '¿Cómo armarías la estrategia de testing de una app iOS?',
      answer:
        'Base de unit tests rápidos sobre view models, reducers y lógica de dominio con dependencias mockeadas; snapshot tests para el design system y pantallas clave; pocos UI tests con XCUITest para los flujos críticos, porque son lentos y frágiles. Todo corriendo en CI en cada PR, con los flaky tests en cuarentena y medición de cobertura en las capas de lógica.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo automatizarías builds y releases?',
      answer:
        'Un pipeline (Xcode Cloud, GitHub Actions con fastlane, Bitrise) que corre tests y lint en cada PR, y en main genera builds firmados con certificados manejados de forma segura (match o App Store Connect API), incrementa el build number y sube a TestFlight. Los releases se hacen con phased release y feature flags para desacoplar el deploy del lanzamiento.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo monitoreás una app en producción?',
      answer:
        'Crash reporting (Crashlytics, Sentry) con dSYMs subidos para simbolizar, MetricKit para hangs, consumo de batería y tiempo de arranque, logs estructurados con `os.Logger` y analytics de producto para los funnels clave. Con alertas sobre la tasa de usuarios sin crashes por versión para frenar un phased release si algo sale mal.',
    },
    {
      topic: 'uikit',
      question: '¿Cómo integrarías SwiftUI en una app grande hecha en UIKit?',
      answer:
        'De a poco: pantallas nuevas en SwiftUI envueltas en `UIHostingController` dentro de la navegación existente, y componentes UIKit reutilizados en SwiftUI con `UIViewRepresentable`. Conviene compartir el design system, mantener la navegación en un coordinator común y migrar empezando por pantallas hoja con poca interacción con el resto.',
    },
    {
      topic: 'swift',
      question: '¿Qué son los result builders y los macros, y cuándo los usarías?',
      answer:
        'Los result builders transforman una secuencia de expresiones en un valor (así funciona el `body` de SwiftUI con `@ViewBuilder`) y sirven para DSLs declarativos. Los macros generan código en tiempo de compilación (`@Observable`, `#Preview`) y eliminan boilerplate con verificación de tipos. Se usan con cuidado porque agregan complejidad y tiempo de compilación.',
    },
    {
      topic: 'diseño de sistemas',
      question: '¿Cómo diseñarías un feed con imágenes, paginación y caché?',
      answer:
        'Paginación por cursor desde el backend, prefetch de la siguiente página al acercarse al final, celdas livianas con imágenes descargadas en background, redimensionadas al tamaño de pantalla (downsampling) y cacheadas en memoria (`NSCache`) y disco. Se cancelan las descargas de celdas que salen de pantalla y se persiste la primera página para mostrar algo al instante al abrir.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo manejarías la deuda técnica en una app con años de código legacy?',
      answer:
        'Haciéndola visible y priorizándola con el negocio según impacto (crashes, velocidad de desarrollo, riesgo). Aplicar la regla del boy scout en lo que se toca, crear límites (módulos, protocolos) para aislar lo viejo, migrar de forma incremental detrás de feature flags y medir el progreso. Evitar reescrituras completas salvo que el costo de mantener sea claramente mayor.',
    },
  ],
};
