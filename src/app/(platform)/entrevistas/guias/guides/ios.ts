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
        {
          text: 'Saber qué etapas tiene el proceso y si el ejercicio es en SwiftUI o UIKit',
          explanation:
            'Preguntáselo al recruiter en la primera charla y pedí que te lo confirme por escrito: cuántas rondas hay, quién entrevista en cada una, cuánto dura y qué evalúa. Del ejercicio averiguá si es live coding o take-home, si es SwiftUI o UIKit, si podés usar tu Xcode y tu setup, si hay red para consumir una API real y si podés consultar documentación. Con eso armás el plan de práctica: si es UIKit, una lista con `UITableView` y diffable data source; si es SwiftUI, `List` con `.task` y un view model. Preguntar no resta puntos: muestra que te importa el contexto antes de ponerte a trabajar.',
        },
        {
          text: 'Tener una app propia que puedas explicar, idealmente publicada o en TestFlight',
          explanation:
            'Elegí una app chica pero completa: consume una API, tiene lista y detalle, persiste algo, maneja errores y estados vacíos, tiene tests del view model y accesibilidad básica. Subila a TestFlight (necesitás la cuenta de Apple Developer, USD 99 por año) o al menos a un repo público con README, capturas y un diagrama simple de capas. Ensayá un recorrido de cinco minutos: qué problema resuelve, cómo está armada, una decisión difícil con su trade-off y qué harías distinto hoy. Esperá repreguntas como por qué usaste ese property wrapper o qué pasa si falla la red; si no podés justificar algo del código, simplificalo antes de la entrevista.',
        },
        {
          text: 'Identificar los temas de tu seniority que te cuestan más',
          explanation:
            'Tomá los checklists de esta guía para tu nivel y el inmediato superior, y clasificá cada ítem en tres: lo explico con un ejemplo, lo explico a medias, no lo sé. La prueba es explicarlo en voz alta, sin mirar, en un minuto y con un ejemplo de código; si no te sale, todavía no lo sabés. Priorizá lo que más se pregunta (optionals, `struct` vs `class`, ARC y retain cycles, async/await, MVVM) y lo que piden las ofertas de esa empresa. Dedicale bloques cortos diarios con código real en un playground o un proyecto de prueba, y volvé a evaluarte al final de la semana.',
        },
        {
          text: 'Poder contar en dos minutos tu experiencia y qué rol buscás',
          explanation:
            'Armá un guion de unos dos minutos: quién sos y cuántos años de experiencia tenés, dos o tres proyectos con impacto concreto (por ejemplo, bajé el crash rate de 2% a 0,3% o migré el onboarding a SwiftUI), el stack que dominás, y qué rol buscás y por qué esa empresa. Escribilo, decilo en voz alta con cronómetro y recortá hasta que suene natural y no leído. El error común es recorrer cronológicamente toda la carrera o repetir el CV; elegí lo que conecta con el puesto. Adaptá el cierre a cada empresa con algo que hayas visto de su producto.',
        },
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
        {
          text: 'Desempaquetar optionals de forma segura y justificar cada forma',
          explanation:
            'Un optional `T?` es un enum con dos casos, `.some(T)` y `.none`, y obliga a manejar la posible ausencia de valor. `if let user { ... }` desempaqueta solo dentro del bloque; `guard let user else { return }` sale temprano y deja `user` disponible en el resto de la función, ideal para precondiciones; `??` da un valor por defecto (`name ?? "Anónimo"`); y el optional chaining `user?.address?.city` devuelve `nil` si falta cualquier eslabón. También podés transformar sin desempaquetar con `map`: `url.map { URLRequest(url: $0) }`. El force unwrap `!` crashea si el valor es `nil`: solo es razonable cuando un `nil` sería un bug de programación imposible, como una URL literal, y aun así muchos equipos prefieren `guard` con un `fatalError` que explique el motivo.',
        },
        {
          text: 'Elegir entre `struct` y `class` para un caso y explicar por qué',
          explanation:
            'Una `struct` es value type: al asignarla o pasarla se copia (las colecciones usan copy-on-write para que la copia sea barata hasta que alguien muta), no hay estado compartido accidental y es la opción por defecto para modelos y estado. Una `class` es reference type: varias variables apuntan a la misma instancia, tiene identidad (`===`), herencia, `deinit` y la gestiona ARC. Usá class cuando necesitás identidad compartida (un modelo `@Observable` que varias vistas observan, un servicio, un cache) o heredar de UIKit como `UIViewController`. Ejemplo: el `User` decodificado de la API es struct; el `ImageCache` compartido es class o actor. El error común es usar class por costumbre y terminar con mutaciones inesperadas desde otro lugar de la app.',
        },
        {
          text: 'Modelar un estado de pantalla con un enum con associated values',
          explanation:
            'En vez de tener `isLoading: Bool`, `items: [Item]` y `error: Error?` sueltos, que permiten combinaciones imposibles como cargando y con error a la vez, modelás `enum ViewState { case loading, loaded([Item]), empty, failed(String) }`. Los associated values llevan los datos solo en el caso donde existen. La vista hace `switch state` y el compilador obliga a cubrir todos los casos: si mañana agregás uno, te marca cada lugar a actualizar. Por eso conviene evitar `default` en esos `switch`. Si necesitás mostrar datos mientras refrescás, modelalo explícito, por ejemplo `case loaded([Item], isRefreshing: Bool)`.',
        },
        {
          text: 'Explicar qué significa que un closure sea `@escaping`',
          explanation:
            'Un closure pasado como parámetro es non-escaping por defecto: se ejecuta antes de que la función retorne y el compilador sabe que no queda guardado. `@escaping` indica que puede ejecutarse después de que la función retornó, porque se guarda en una propiedad o se llama de forma asíncrona, como el completion handler de `func load(completion: @escaping (Result<Data, Error>) -> Void)`. Como consecuencia, en una class tenés que escribir `self` explícito dentro del closure, y ahí es donde aparecen los retain cycles si el objeto guarda el closure y el closure captura `self` fuerte; se evita con `[weak self]`. Con async/await muchos de estos callbacks desaparecen, pero el concepto sigue apareciendo en APIs de UIKit y en código existente.',
        },
        {
          text: 'Explicar la diferencia entre `some View` y `any Protocol`',
          explanation:
            '`some Protocol` es un tipo opaco: hay un único tipo concreto, fijado por la implementación y conocido por el compilador, pero oculto para quien llama. Por eso `var body: some View` permite que SwiftUI conozca el tipo exacto del árbol y lo optimice sin que escribas algo como `VStack<TupleView<(Text, Image)>>`. `any Protocol` es un existencial: una caja que puede contener cualquier tipo que conforme y cambiar en runtime, con costo de indirección y dynamic dispatch; sirve para colecciones heterogéneas como `[any Shape]` o una dependencia intercambiable. Una función `-> some View` sin `@ViewBuilder` no puede devolver tipos distintos en ramas distintas, porque el tipo opaco es uno solo. Regla práctica: preferí `some` o generics y usá `any` cuando realmente necesitás heterogeneidad.',
        },
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
        {
          text: 'Elegir el property wrapper correcto para cada tipo de estado',
          explanation:
            '`@State` para valores que la vista posee y nadie más necesita (un toggle, el texto de un campo), siempre `private` y con valor inicial. `@Binding` para que un hijo lea y escriba estado del padre sin poseerlo: `Toggle("Activo", isOn: $isOn)`. Para un modelo `@Observable`, la vista que lo crea lo guarda en `@State` para que sobreviva a las re-evaluaciones del `body`, los hijos lo reciben como propiedad común, y si necesitan bindings a sus propiedades usan `@Bindable`. `@Environment` es para dependencias compartidas por un subárbol, como `@Environment(\\.dismiss)` o un modelo inyectado con `.environment(model)` y leído con `@Environment(Model.self)`. Error común: crear el modelo como propiedad común en la vista, que se recrea cada vez que el padre recalcula su `body`.',
        },
        {
          text: 'Explicar qué cambia entre `@Observable` y `ObservableObject`',
          explanation:
            'Con `ObservableObject` (Combine), cada cambio en cualquier propiedad `@Published` dispara `objectWillChange` y re-evalúa toda vista que observe el objeto, aunque no use esa propiedad. El macro `@Observable` (Observation, iOS 17+) registra qué propiedades lee cada `body` y solo invalida las vistas que leyeron la propiedad que cambió, lo que reduce actualizaciones en pantallas grandes. También simplifica la API: no hace falta `@Published`, se usa `@State` en vez de `@StateObject`, `@Environment(Model.self)` en vez de `@EnvironmentObject` y `@Bindable` para crear bindings. Además funciona con propiedades opcionales, arrays de objetos observables y fuera de SwiftUI. El trade-off es el mínimo de iOS 17: si todavía soportás iOS 16, seguís con `ObservableObject`.',
        },
        {
          text: 'Explicar la identidad de vistas y un bug que causa cambiarla',
          explanation:
            'SwiftUI asigna identidad a cada vista para decidir si en la siguiente actualización es la misma, y conserva su estado (`@State`, foco, animaciones en curso), o si es una nueva. La identidad estructural es la posición en el árbol: las dos ramas de un `if` son vistas distintas, así que alternar entre ellas destruye una y crea la otra. La identidad explícita viene de `.id(_:)` o del `id` de los elementos en `ForEach` y `List`. Bug típico: usar `UUID()` generado al construir el modelo de la vista o `id: \\.self` sobre valores que cambian hace que las celdas se recreen, pierdan estado y animen raro; la solución es un id estable del dominio. Otro: `if isSelected { Text(x).bold() } else { Text(x) }` rompe la transición, mientras que `.fontWeight(isSelected ? .bold : .regular)` mantiene una sola vista.',
        },
        {
          text: 'Armar navegación con `NavigationStack` basada en datos',
          explanation:
            'Declarás `NavigationStack(path: $path)` con `path` como un array tipado (`[Route]`) o un `NavigationPath`, guardado en estado, por ejemplo en un router `@Observable`. Registrás destinos por tipo con `.navigationDestination(for: Route.self) { route in ... }` y navegás con `NavigationLink(value: route)` o con `path.append(.detail(id))` desde código. Como la navegación es dato, un deep link es armar el path, volver a la raíz es `path.removeAll()`, y podés restaurar la navegación serializando el path (`NavigationPath.codableRepresentation`). Pasá ids en las rutas, no objetos pesados. Error común: poner `navigationDestination` dentro de un contenedor lazy como las filas de una `List`; va en una vista fuera del contenido lazy.',
        },
        {
          text: 'Explicar el ciclo de vida de un `UIViewController`',
          explanation:
            '`loadView` crea la vista raíz (solo lo sobrescribís si armás la jerarquía a mano). `viewDidLoad` se llama una sola vez cuando la vista está en memoria: agregás subviews, constraints y bindings. `viewWillAppear` y `viewDidAppear` se llaman en cada aparición (refrescar datos, arrancar animaciones, analytics) y `viewWillDisappear` y `viewDidDisappear` al irse (pausar, guardar). `viewWillLayoutSubviews` y `viewDidLayoutSubviews` pueden llamarse muchas veces, cada vez que cambian los bounds, y ahí van ajustes que dependen del tamaño final. Desde iOS 17 existe `viewIsAppearing`, que corre con la geometría y el trait collection ya definidos, buen lugar para configurar UI que depende de eso. Errores comunes: asumir que el frame es definitivo en `viewDidLoad` o hacer trabajo pesado ahí; y si `deinit` nunca se llama al cerrar la pantalla, tenés un leak.',
        },
        {
          text: 'Integrar una vista SwiftUI en UIKit y viceversa',
          explanation:
            'Para SwiftUI dentro de UIKit, envolvés la vista en `UIHostingController(rootView: ProfileView(model: model))` y la presentás, la pusheás o la agregás como child (`addChild`, agregar su `view` con constraints, `didMove(toParent:)`). En celdas, desde iOS 16 usás `cell.contentConfiguration = UIHostingConfiguration { Row(item: item) }`. Para UIKit dentro de SwiftUI implementás `UIViewRepresentable` (o `UIViewControllerRepresentable`): `makeUIView` crea la vista una sola vez, `updateUIView` la sincroniza con el estado de SwiftUI cada vez que cambia, y un `Coordinator` hace de delegate y devuelve eventos a SwiftUI vía bindings. Error común: recrear la vista UIKit en `updateUIView` o no actualizarla ahí, y que no refleje el estado. Estas dos piezas son las que permiten migrar pantalla por pantalla.',
        },
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
        {
          text: 'Explicar por qué la UI se actualiza en el main thread y cómo garantizarlo',
          explanation:
            'UIKit y SwiftUI no son thread-safe: el layout y el render se coordinan desde el run loop del main thread, y tocar la UI desde otro hilo produce crashes intermitentes, glitches y avisos del Main Thread Checker. En Swift moderno lo garantizás con `@MainActor`: marcás así los view models y todo lo que toque UI (las vistas y los view controllers ya lo son), y el compilador exige `await` para entrar desde otro contexto y asegura dónde corre ese código. La versión con GCD era `DispatchQueue.main.async { }`. La otra mitad es no bloquear el main thread con trabajo pesado (decodificar JSON grande, procesar imágenes, I/O síncrono), porque genera hangs. Ojo: marcar una función `async` no la manda a otro hilo; con approachable concurrency (default en proyectos nuevos de Xcode 26) una función `nonisolated async` corre en el actor de quien la llama, y para sacarla explícitamente del main actor se marca `@concurrent`.',
        },
        {
          text: 'Convertir un completion handler a async/await',
          explanation:
            'Si el código es tuyo, reescribís la firma: `func fetchUser(id: String) async throws -> User`, usando `let (data, _) = try await URLSession.shared.data(from: url)` y `try JSONDecoder().decode(User.self, from: data)`. Si es una API ajena con callback, la envolvés con una continuation: `try await withCheckedThrowingContinuation { continuation in api.fetch { result in continuation.resume(with: result) } }`. La regla es reanudar la continuation exactamente una vez: si nunca la reanudás, la tarea queda colgada para siempre, y reanudarla dos veces es un error que la versión checked detecta. Lo que ganás: código lineal, errores con `throws` en vez de `Result` anidados, imposible olvidarse de llamar al completion en algún camino, y cancelación propagada. Desde SwiftUI se llama en `.task { }` y desde UIKit en un `Task { }` que guardás para cancelar.',
        },
        {
          text: 'Explicar qué protege un `actor` y qué es la reentrancy',
          explanation:
            'Un `actor` es un tipo de referencia cuyo estado mutable solo se accede de a una tarea por vez: desde afuera se llama con `await` y el runtime serializa los accesos, así que no hay data races sin locks manuales. La reentrancy significa que cuando un método del actor hace `await`, el actor queda libre y puede ejecutar otras llamadas mientras espera; al volver, su estado puede haber cambiado. Ejemplo: un cache que chequea `cache[url]`, no lo encuentra, hace `await download(url)` y guarda; dos llamadas simultáneas descargan dos veces. La solución es guardar la `Task` en curso (`inFlight[url] = task`) para que la segunda llamada espere la misma, y volver a validar invariantes después de cada `await`. Resumen para la entrevista: los actors eliminan data races, no las race conditions lógicas.',
        },
        {
          text: 'Explicar qué es `Sendable` y qué cambia con Swift 6',
          explanation:
            '`Sendable` marca los tipos que se pueden pasar de forma segura entre dominios de aislamiento (actors, tasks). Las structs y enums con propiedades Sendable lo son implícitamente, los actors siempre lo son, y una class solo si es `final` con propiedades `let` Sendable, o si protege su estado internamente con un lock (`@unchecked Sendable`, bajo tu responsabilidad). En el modo de lenguaje Swift 6 el strict concurrency checking pasa de warnings a errores: el compilador rechaza código con posibles data races, como mutar una variable capturada desde una `Task` concurrente o pasar una class no Sendable a otro actor. Swift 6.2 agregó approachable concurrency: con el aislamiento por defecto en `MainActor`, todo el código de la app corre en el main actor salvo lo que marques `nonisolated` o `@concurrent`, lo que elimina la mayoría de los errores en apps comunes. Migración razonable: módulo por módulo, primero con warnings, y sin usar `@unchecked Sendable` o `nonisolated(unsafe)` como atajo para silenciar el compilador.',
        },
        {
          text: 'Encontrar y romper un retain cycle con `[weak self]`',
          explanation:
            'Caso clásico: un view controller hace `viewModel.onUpdate = { self.tableView.reloadData() }`. El VC retiene al view model, el view model retiene el closure y el closure retiene al VC: el contador nunca llega a cero y `deinit` no se llama. Se rompe capturando débil: `viewModel.onUpdate = { [weak self] in self?.tableView.reloadData() }`, o con `guard let self else { return }` al inicio. `weak` es optional y pasa a `nil` cuando el objeto se libera; `unowned` no es optional y crashea si el objeto ya no existe, así que solo sirve cuando el closure nunca puede vivir más que `self`. Para detectarlo, poné un `print` en `deinit`, abrí y cerrá la pantalla, y si no se imprime abrí el Memory Graph Debugger, que dibuja el ciclo. Ojo también con una `Task` que hace `for await` sobre una secuencia infinita capturando `self`: retiene hasta que la cancelás.',
        },
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
        {
          text: 'Explicar MVVM con inyección de dependencias y cómo lo testeás',
          explanation:
            'La vista solo renderiza estado y llama métodos; el view model (`@Observable` y `@MainActor`) tiene el estado de pantalla y la lógica de presentación; servicios y repositorios hablan con red y persistencia. El view model recibe sus dependencias por inicializador tipadas como protocolo, `init(service: ProductsServicing)`, y un composition root (la `App` o un container) arma el grafo real. En tests le pasás un fake que devuelve datos o errores controlados y verificás estado: `await vm.load()` y después `#expect(vm.state == .loaded(items))`. Errores comunes: crear las dependencias adentro (`let service = APIService()`), depender de singletons globales, o meter tipos de SwiftUI y formateo de vista en el view model, lo que lo vuelve difícil de testear.',
        },
        {
          text: 'Opinar con trade-offs sobre cuándo usar TCA',
          explanation:
            'The Composable Architecture (Point-Free) modela cada feature con `State`, `Action`, un reducer que muta el estado y devuelve efectos, y un `Store`; las dependencias se controlan con su sistema `@Dependency`. A favor: flujo unidireccional, estado predecible, composición de features y `TestStore`, que obliga a afirmar cada cambio de estado y cada acción recibida, lo que da tests exhaustivos. En contra: curva de aprendizaje, bastante código para pantallas simples, una dependencia de terceros en el centro de la app con cambios grandes entre versiones mayores, y más carga para el compilador. Una opinión con matices: tiene sentido si todo el equipo lo adopta y valora ese testing, y es excesivo para una app chica o un equipo sin experiencia, donde MVVM con `@Observable` alcanza. Nombrá qué problema concreto te resolvería en vez de opinar en abstracto.',
        },
        {
          text: 'Diseñar un cliente de red con endpoints tipados y refresh de token',
          explanation:
            'Un `APIClient` con `func send<Response: Decodable>(_ endpoint: Endpoint<Response>) async throws -> Response`, donde `Endpoint` describe path, método, query, body y el tipo de respuesta, así cada llamada queda tipada: `try await client.send(.products(page: 2))`. El cliente arma el `URLRequest`, agrega headers y token, valida el status code, mapea fallas a un error propio (`.unauthorized`, `.server(status)`, `.decoding`, `.offline`) y decodifica con un `JSONDecoder` configurado una sola vez. Para el refresh, un `actor TokenStore` guarda la `Task` de refresh en curso: ante un 401, todas las requests que fallan juntas esperan esa misma task en vez de disparar varios refresh, y después reintentan una sola vez; si el refresh falla, cerrás sesión. Sumá reintentos con backoff solo para errores transitorios y métodos idempotentes. Para testearlo, inyectá la capa de transporte o usá un `URLProtocol` mock.',
        },
        {
          text: 'Elegir dónde guardar cada tipo de dato, incluidos los secretos',
          explanation:
            '`UserDefaults` para preferencias chicas y no sensibles (tema, onboarding visto): no está cifrado y se carga entero en memoria, así que nada grande ni secreto. Keychain para tokens, contraseñas y claves: cifrado por el sistema, con niveles como `kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`, que además evita que migre a otro dispositivo en un backup; ojo que sobrevive a desinstalar la app, así que limpiá en el primer launch si no querés eso. Archivos: `Application Support` para datos que genera la app, `Caches` para lo regenerable (el sistema puede borrarlo) y `Documents` para contenido del usuario. SwiftData o Core Data para datos estructurados con relaciones y queries. Para archivos sensibles, Data Protection con `.completeFileProtection`. Error clásico: el token en `UserDefaults` o una API key secreta hardcodeada en el binario.',
        },
        {
          text: 'Explicar cómo usar SwiftData o Core Data en segundo plano sin data races',
          explanation:
            'Los objetos `@Model` y los `NSManagedObject` no son Sendable y están atados al contexto que los creó: usarlos desde otro hilo produce crashes o datos corruptos. En SwiftData, el `mainContext` del `ModelContainer` es para la UI; para importar o procesar mucho, creás un `@ModelActor actor Importer`, que tiene su propio `ModelContext` y ejecuta serializado, insertás ahí y hacés `try modelContext.save()`. Entre actores pasás `PersistentIdentifier` (que sí es Sendable) o structs DTO, y del otro lado recuperás el objeto con `modelContext.model(for: id)`; las vistas con `@Query` se actualizan cuando el contexto de fondo guarda. En Core Data el equivalente es `newBackgroundContext()` o `performBackgroundTask`, trabajando siempre dentro de `context.perform { }` y pasando `NSManagedObjectID`. Error típico: capturar un modelo en una `Task.detached`.',
        },
        {
          text: 'Esbozar una app offline-first con sincronización',
          explanation:
            'La UI lee siempre de la base local, por ejemplo con `@Query` sobre SwiftData, y nunca directo de la respuesta de red: así funciona sin conexión y hay una sola fuente de verdad. Una capa de sync baja cambios del servidor, idealmente incrementales con un cursor o `updatedAt`, y los escribe en la base. Las escrituras del usuario se aplican localmente al instante y se encolan en una tabla de operaciones pendientes con un id idempotente; un proceso las envía cuando hay red (al volver a foreground, al detectar conexión con `NWPathMonitor` o con `BGTaskScheduler`), con reintentos y backoff. Conflictos: last-write-wins por timestamp es simple pero pierde datos; las alternativas son versionado con rechazo del servidor, merge por campo o CRDTs si hay colaboración. Definí también qué ve el usuario cuando un cambio está pendiente o falló.',
        },
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
        {
          text: 'Usar Time Profiler para encontrar trabajo pesado en el main thread',
          explanation:
            'Hacé Product > Profile (build de release) en un dispositivo real, elegí Time Profiler y reproducí la acción lenta. Seleccioná en el timeline el tramo donde se notó el problema y en el call tree activá Separate by Thread, Invert Call Tree y Hide System Libraries: arriba aparecen las funciones tuyas que más tiempo consumen en el main thread. Combinalo con el instrumento Hangs, que marca cuándo el main thread dejó de responder más de 250 ms. Lo que suele aparecer: decodificar JSON, crear `DateFormatter` en un loop, procesar imágenes o leer de disco en el main thread. La solución es mover ese trabajo fuera del main actor (una función `@concurrent`, otro actor o una tarea de fondo) y volver al main solo para asignar el resultado; después medí otra vez para confirmar la mejora.',
        },
        {
          text: 'Explicar causas y soluciones de un scroll que se traba',
          explanation:
            'Un frame dura unos 16 ms a 60 Hz y 8 ms a 120 Hz en pantallas ProMotion; si el main thread tarda más, se pierden frames (hitches). Causas típicas: decodificar o redimensionar imágenes en el main thread, crear formatters o hacer cálculos en `cellForRowAt` o en `body`, jerarquías de Auto Layout muy anidadas, sombras sin `shadowPath`, vistas de SwiftUI que dependen de un modelo grande y se re-evalúan todas, o un `VStack` no lazy con cientos de filas. Soluciones: downsampling de imágenes en background con caché (`preparingThumbnail(of:)` o ImageIO), prefetching con `UITableViewDataSourcePrefetching`, precalcular lo que muestran las celdas en el view model, `List` o `LazyVStack` con ids estables, y subvistas chicas que lean solo lo que necesitan. Medilo con el instrumento Animation Hitches antes y después.',
        },
        {
          text: 'Explicar cómo medir y reducir el tiempo de arranque',
          explanation:
            'Distinguí cold launch (proceso nuevo) de warm launch; Apple recomienda mostrar el primer frame en menos de 400 ms. Medí con la plantilla App Launch de Instruments, con `XCTApplicationLaunchMetric` en un test de performance para detectar regresiones, y en producción con MetricKit y el panel Launch Time del Organizer de Xcode. Para reducirlo: menos frameworks dinámicos (más trabajo de dyld; considerá linkeo estático o mergeable libraries), nada de trabajo en inicializadores estáticos, diferir la inicialización de SDKs de analytics o ads a después del primer frame, nada de I/O ni red síncronos en `didFinishLaunchingWithOptions` o en el `init` de la `App`, y mostrar UI con datos cacheados mientras carga el resto. El error es optimizar a ciegas: primero trazá y mirá qué ocupa el tiempo.',
        },
        {
          text: 'Diferenciar un leak de un pico de memoria',
          explanation:
            'Un leak es memoria que ya no se usa pero nunca se libera, casi siempre por un retain cycle: crece cada vez que repetís un flujo (abrir y cerrar una pantalla diez veces) y no baja. Se detecta con el Memory Graph Debugger, el instrumento Leaks, o viendo que `deinit` no se llama; en Allocations, Mark Generation entre repeticiones muestra lo que queda vivo. Un pico es memoria que sí se libera pero llega muy alto en un momento: una foto de 4000x3000 decodificada ocupa unos 48 MB (ancho por alto por 4 bytes) aunque el archivo pese 2 MB. Se resuelve con downsampling al tamaño en pantalla, procesando en lotes con `autoreleasepool` y con cachés con límite como `NSCache`. Ambos pueden hacer que el sistema mate la app por memoria (jetsam), que no aparece como un crash común: buscalo en MetricKit.',
        },
        {
          text: 'Explicar cómo detectar vistas de SwiftUI que se actualizan de más',
          explanation:
            'En código, `let _ = Self._printChanges()` dentro del `body` imprime qué propiedad disparó cada re-evaluación (solo para debug, nunca en producción). En Instruments, la plantilla de SwiftUI (renovada en Xcode 26) muestra cuántas veces se evaluó el `body` de cada vista, cuánto tardó, y con el grafo de causa y efecto qué cambio de estado lo provocó. Un truco rápido es ponerle un fondo de color aleatorio a una vista para ver si se redibuja. Causas típicas: observar un `ObservableObject` grande donde cualquier `@Published` invalida todo, pasar un modelo entero cuando la vista usa un campo, crear valores nuevos en cada render, o un `body` enorme que conviene partir en subvistas. Con `@Observable` la invalidación es por propiedad leída, así que cada subvista debería leer solo lo que muestra.',
        },
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
        {
          text: 'Testear un view model con un servicio fake inyectado',
          explanation:
            'Definí `protocol ProductsServicing { func fetchProducts() async throws -> [Product] }`, inyectalo en el init del view model y creá en el target de tests un `struct FakeProductsService: ProductsServicing` con un `result` configurable. El test: `let vm = ProductsViewModel(service: FakeProductsService(result: .success([.sample])))`, `await vm.load()` y `#expect(vm.state == .loaded([.sample]))`; otro test con `.failure(URLError(.notConnectedToInternet))` verifica el estado de error. Si necesitás verificar llamadas (cuántas veces o con qué parámetros), usá un spy que las registre. Como el view model es `@MainActor`, marcá el test o la suite con `@MainActor`. Error común: mocks tan detallados que el test se rompe con cualquier refactor; afirmá sobre el estado observable, no sobre la implementación.',
        },
        {
          text: 'Escribir un test con Swift Testing usando `@Test` y `#expect`',
          explanation:
            'Importás `Testing` y escribís funciones con `@Test`, que pueden ser `async throws`, sin heredar de `XCTestCase`: `@Test func totalSumaLosItems() { let cart = Cart(items: [.init(price: 10), .init(price: 5)]); #expect(cart.total == 15) }`. `#expect` registra el fallo con los valores de ambos lados y sigue; `#require` corta el test si falla y sirve para desempaquetar: `let first = try #require(users.first)`. Los tests parametrizados evitan duplicar: `@Test(arguments: ["", " "]) func rechazaVacios(input: String) { #expect(!Validator.isValid(input)) }`. Se agrupan en un `struct` cuyo `init` funciona como setup, cada test recibe una instancia nueva y corren en paralelo por defecto, lo que expone estado compartido. Para errores, `#expect(throws: APIError.self) { try parse(data) }`.',
        },
        {
          text: 'Explicar cuándo usar UI tests y snapshot tests',
          explanation:
            'Los UI tests (`XCUITest`) manejan la app real desde otro proceso, encontrando elementos por accessibility identifier: validan flujos completos como login o checkout, pero son lentos, frágiles ante cambios de UI y difíciles de hacer deterministas. Por eso conviene tener pocos, sobre los flujos críticos, con la app arrancada con un launch argument que use datos fake. Los snapshot tests (por ejemplo swift-snapshot-testing de Point-Free) renderizan una vista y la comparan contra una imagen de referencia: atrapan regresiones visuales en componentes y en variantes de Dynamic Type, dark mode o idioma, y son rápidos. Su costo es que las imágenes dependen del simulador y la versión de iOS, así que fijá ambos en CI y revisá los diffs en cada PR. La lógica no se prueba así: va en unit tests.',
        },
        {
          text: 'Explicar cómo hacer tests deterministas con fechas y concurrencia',
          explanation:
            'Un test determinista da el mismo resultado siempre, en cualquier máquina y orden. Fechas: no llames `Date()` dentro de la lógica; inyectá un reloj (`let now: () -> Date` o un protocolo) y en el test pasá una fecha fija, y fijá `TimeZone`, `Locale` y `Calendar` en los formatters. Concurrencia: nada de `sleep` ni esperas arbitrarias; hacé `await` de la función que hace el trabajo, inyectá un `Clock` para poder avanzar el tiempo de un debounce manualmente en el test, y usá `confirmation` de Swift Testing para esperar eventos. Evitá red real y estado global compartido (singletons, `UserDefaults.standard`); usá instancias aisladas, más todavía porque Swift Testing corre en paralelo. Un test flaky se arregla o se borra, no se reintenta hasta que pase.',
        },
        {
          text: 'Proponer una estrategia de testing para una app mediana',
          explanation:
            'Una pirámide: abajo, muchos unit tests rápidos sobre view models, lógica de dominio, parsing y validaciones con Swift Testing, que corren en segundos. En el medio, tests de integración de la capa de datos: el cliente de red contra un `URLProtocol` mock y la persistencia con un `ModelContainer` en memoria. Snapshot tests para el design system y pantallas clave, y unos pocos UI tests para los flujos que si se rompen cuestan plata (login, compra). Todo corre en CI en cada PR, con test plans de Xcode para separar suites rápidas y lentas. La cobertura es una guía, no una meta: importa más cubrir bien la lógica crítica que un número global; y cada bug arreglado suma un test de regresión.',
        },
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
        {
          text: 'Explicar los estados de la app y cómo reaccionar a cada uno',
          explanation:
            'Los estados son: not running; inactive (en foreground pero sin recibir eventos, por ejemplo con una llamada entrante o el Control Center abierto); active (en foreground recibiendo eventos); background (ejecuta código por poco tiempo); y suspended (en memoria sin ejecutar, y el sistema puede terminarla sin aviso). En SwiftUI observás `@Environment(\\.scenePhase)` con `.onChange(of: scenePhase)`; en UIKit, `sceneWillResignActive`, `sceneDidEnterBackground` y `sceneDidBecomeActive` del `SceneDelegate`. Al pasar a inactive pausás (video, juego) y podés ocultar datos sensibles del snapshot del app switcher; al ir a background guardás estado y liberás recursos; al volver a active refrescás datos. Para trabajo que debe seguir, `beginBackgroundTask` para terminar algo corto o `BGTaskScheduler` para tareas programadas. Error común: confiar en que se va a ejecutar código cuando la app termina.',
        },
        {
          text: 'Explicar el flujo completo de una push notification',
          explanation:
            'Primero la app pide permiso con `UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])`, idealmente en contexto y no apenas abre. Llama a `registerForRemoteNotifications()` y recibe un device token de APNs en el delegate; lo manda a tu backend asociado al usuario, y lo reenvía en cada launch porque puede cambiar. El backend firma una request HTTP/2 a APNs (con una clave `.p8`) con un payload JSON que tiene el diccionario `aps` (alert, badge, sound) y datos propios. APNs la entrega: si la app está en foreground recibís `willPresent` y decidís si mostrarla, y el tap llega a `didReceive`, donde navegás. Las silenciosas (`content-available: 1`) despiertan la app brevemente en background para sincronizar, pero el sistema las limita y no llegan si el usuario forzó el cierre. Una Notification Service Extension permite modificar el contenido antes de mostrarlo, por ejemplo agregar una imagen o descifrar el texto.',
        },
        {
          text: 'Enumerar las medidas de seguridad para una app con datos sensibles',
          explanation:
            'Tokens y credenciales en Keychain con accesibilidad `ThisDeviceOnly`, y ningún secreto en el binario: una API key en el bundle se extrae fácil, así que lo sensible vive en el backend. Todo el tráfico por HTTPS con App Transport Security sin excepciones globales, y certificate o public key pinning si el riesgo de MITM lo justifica, con pines de respaldo y plan de rotación, porque un pin vencido rompe la app en producción. Biometría ligada a un ítem de Keychain protegido con `SecAccessControl` (`.biometryCurrentSet`), no solo un `if` sobre el resultado de `LocalAuthentication`, que se puede saltear. Data Protection en archivos, ocultar contenido en el app switcher, no loguear datos personales ni tokens, y validar deep links y toda entrada externa. La detección de jailbreak es solo una señal, y la autorización real se decide siempre en el servidor.',
        },
        {
          text: 'Hacer accesible una pantalla con VoiceOver y Dynamic Type',
          explanation:
            'VoiceOver lee los elementos en orden: dale a cada control un label con sentido (`.accessibilityLabel("Agregar al carrito")` en un botón que solo tiene ícono), traits correctos (`.accessibilityAddTraits(.isHeader)` en títulos), agrupá lo relacionado con `.accessibilityElement(children: .combine)` para que una celda se lea como una unidad, ocultá lo decorativo con `.accessibilityHidden(true)` y exponé acciones secundarias con `.accessibilityAction`. Para Dynamic Type usá estilos de texto (`.font(.body)`, o `UIFont.preferredFont` con `adjustsFontForContentSizeCategory`), escalá fuentes custom con `relativeTo:` y medidas con `@ScaledMetric`, y probá los tamaños de accesibilidad más grandes, donde un `HStack` suele tener que pasar a vertical (`ViewThatFits` o leyendo `dynamicTypeSize`). Sumá áreas táctiles de al menos 44x44 pt, contraste suficiente y no comunicar información solo con color. Probalo con VoiceOver activado de verdad y con el Accessibility Inspector.',
        },
        {
          text: 'Describir el proceso de publicación y los motivos comunes de rechazo',
          explanation:
            'Firmás con un certificado de distribución y un provisioning profile (o firma automática), archivás con Product > Archive y subís a App Store Connect, donde la build se procesa. La distribuís por TestFlight (testers internos sin review, externos con una revisión beta) y después creás la versión con metadata, capturas, las etiquetas de privacidad y el Privacy Manifest (`PrivacyInfo.xcprivacy`), que declara datos recolectados y el motivo de uso de ciertas APIs. La enviás a revisión y elegís publicarla manual, automática o con phased release de siete días. Rechazos comunes: crashes o funciones rotas, metadata engañosa o con placeholders, no darle al reviewer una cuenta demo, textos de permisos genéricos, compras de contenido digital fuera de In-App Purchase donde las reglas de esa región no lo permiten, no ofrecer borrar la cuenta si la app permite crearla, y login con terceros sin una alternativa que respete la privacidad. Leé las App Review Guidelines vigentes antes de enviar.',
        },
        {
          text: 'Esbozar un pipeline de CI/CD para builds y releases',
          explanation:
            'En cada PR: checkout, resolución de paquetes SPM con caché, SwiftLint, `xcodebuild test` (o `fastlane scan`) en un simulador fijo y publicación de resultados; si falla, no se mergea. En cada merge a main o tag de release: incrementar el build number desde el CI, firmar con certificados guardados como secretos (fastlane `match` los centraliza cifrados, o firma con una API key de App Store Connect), archivar y subir a TestFlight, y avisar al equipo. El release promueve una build ya probada a revisión con phased release, y los feature flags remotos permiten apagar algo sin publicar de nuevo. Opciones de plataforma: Xcode Cloud (integrado y simple), GitHub Actions con runners macOS o Bitrise. Después monitoreás el crash-free rate en Crashlytics o Sentry y pausás el phased release si empeora.',
        },
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
        {
          text: 'Resolver una lista con datos remotos, loading y error en 45 minutos',
          explanation:
            'Repartí el tiempo: 5 minutos de aclaraciones y estructura, 25 de camino feliz, 10 de errores y pulido, 5 de margen. Lo mínimo: `struct Item: Decodable, Identifiable`, un servicio con `func fetch() async throws -> [Item]` usando `URLSession.shared.data(from:)` y `JSONDecoder`, un view model `@Observable @MainActor` con `enum State { case loading, loaded([Item]), failed(String) }`, y una vista con `switch` sobre el estado, `List`, `.task { await model.load() }`, `ProgressView` y un botón de reintento. En UIKit, lo mismo con `UITableView`, diffable data source y un `Task` lanzado en `viewDidLoad`. Practicalo tres o cuatro veces desde cero con un timer contra una API pública como JSONPlaceholder, hasta que la base te salga en 15 minutos. El error típico es arrancar por la arquitectura perfecta y no tener nada andando al minuto 30.',
        },
        {
          text: 'Tener un take-home de ejemplo con README y tests',
          explanation:
            'Hacé uno propio como práctica, con un enunciado típico: lista y detalle de una API pública, búsqueda y favoritos persistidos, en 6 a 8 horas y en un repo público. Incluí MVVM con dependencias inyectadas, estados de loading, error y vacío, tests del view model y del parsing, accesibilidad básica y ninguna dependencia que no puedas justificar. El README cuenta cómo correrlo, las decisiones y por qué, los trade-offs que aceptaste por el tiempo, qué harías con más tiempo y cuánto te llevó. Te sirve de plantilla para el próximo y de muestra si una empresa te pide código. Cuidá el historial de git: commits chicos con mensajes claros también se leen.',
        },
        {
          text: 'Diseñar un feed con paginación por cursor y caché de imágenes',
          explanation:
            'Arrancá por requisitos: scroll infinito, imágenes, pull to refresh y ver lo último cargado sin conexión. Paginación por cursor: el servidor devuelve `items` y un `nextCursor` opaco, y pedís `?after=<cursor>&limit=20`; a diferencia del offset (`?page=3`), no duplica ni saltea ítems cuando entran posts nuevos mientras scrolleás, y escala mejor en la base. Pedís la página siguiente cuando faltan pocas celdas, evitando requests duplicadas con la task en curso. Imágenes: caché en memoria (`NSCache` con límite de costo) y en disco, downsampling al tamaño de la celda en background, cancelación de descargas de celdas que salieron de pantalla y deduplicación de requests a la misma URL. Persistí la primera página para mostrar algo al abrir, y cerrá con métricas: tiempo hasta el primer contenido, hitches y tasa de error.',
        },
        {
          text: 'Explicar trade-offs de sincronización y batería en un diseño mobile',
          explanation:
            'La radio celular gasta mucho al encenderse y queda en alto consumo unos segundos después de cada request, así que muchas requests chicas espaciadas gastan más que pocas agrupadas: conviene batchear y sincronizar en momentos oportunos. Un WebSocket abierto da tiempo real pero cuesta batería, el polling frecuente es lo peor, y sincronizar al volver a foreground más `BGAppRefreshTask` (que el sistema agenda según el uso) suele alcanzar; para cambios importantes, una push. Respetá Low Power Mode (`ProcessInfo.processInfo.isLowPowerModeEnabled`) y las redes caras o restringidas (`allowsExpensiveNetworkAccess` y `allowsConstrainedNetworkAccess` en `URLSessionConfiguration`) para diferir descargas grandes. El trade-off central es frescura de datos contra batería y datos móviles, y se decide por producto: un chat necesita tiempo real, un catálogo no.',
        },
        {
          text: 'Hablar en voz alta mientras resolvés un ejercicio',
          explanation:
            'Se entrena: resolvé ejercicios narrando como si alguien escuchara, o grabate y miralo después. La estructura: repetí el problema con tus palabras, decí el plan en una frase (primero modelo y servicio, después la vista, al final errores), y mientras codeás contá decisiones, no cada tecla: uso `@MainActor` en el view model porque actualiza la UI. Cuando te trabás, decí qué estás pensando y qué opciones ves; el entrevistador solo puede ayudarte si sabe dónde estás. Al terminar, decí qué mejorarías y qué testearías. Lo ideal es hacer dos o tres mock interviews con alguien de la comunidad antes de la real.',
        },
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
        {
          text: 'Hacer al menos dos preguntas de aclaración antes de codear',
          explanation:
            'Elegí preguntas que cambian la solución: SwiftUI o UIKit, versión mínima de iOS (define si podés usar `@Observable` o `NavigationStack`), si podés usar librerías, el formato de la API y si pagina, qué hacer con errores o sin conexión, y qué priorizan si no llegás a todo. Después resumí lo acordado en una frase antes de empezar. Esto muestra que trabajás con requisitos reales y te evita resolver el problema equivocado. El error opuesto es preguntar veinte cosas para ganar tiempo: quedate con las que cambian el diseño.',
        },
        {
          text: 'Tener cuatro o cinco historias preparadas en formato STAR',
          explanation:
            'STAR es Situación (contexto breve), Tarea (cuál era tu responsabilidad), Acción (qué hiciste vos, en primera persona y con detalle técnico) y Resultado (medible: crash rate, tiempos, usuarios afectados, y qué aprendiste). Escribí cuatro o cinco historias reales que cubran un crash difícil en producción, un desacuerdo técnico y cómo se resolvió, algo que salió mal y qué cambiaste, una mejora que propusiste e impulsaste, y una vez que ayudaste o mentoreaste a alguien. Cada una debería durar unos dos minutos, con el peso en la acción. Una misma historia puede responder varias preguntas (conflicto, liderazgo, error), así que practicá adaptarla. Errores comunes: hablar en nosotros todo el tiempo o terminar sin un resultado concreto.',
        },
        {
          text: 'Saber cómo responder cuando no recordás una API',
          explanation:
            'Decilo directo y mostrá razonamiento: no recuerdo la firma exacta, pero `JSONDecoder` tiene una estrategia para snake_case, algo como `keyDecodingStrategy = .convertFromSnakeCase`, y lo confirmaría con el autocompletado o la documentación. Describí qué tiene que hacer lo que buscás y cómo lo encontrarías (Quick Help con Option-click, la documentación de Apple, el header del framework). Si te bloquea, seguí con un placeholder o una abstracción y volvé después. Lo que evalúan es criterio y forma de trabajar: inventar una API con seguridad es peor que admitir la duda.',
        },
        {
          text: 'Tener tres preguntas propias para la empresa',
          explanation:
            'Llevá preguntas que te ayuden a decidir y muestren criterio: versión mínima de iOS y cuánto es SwiftUI frente a UIKit, si ya migraron a Swift 6 y strict concurrency, cada cuánto publican y si usan phased release y feature flags, qué corre en CI, cómo es el code review, cuál es su crash-free rate y quién atiende incidentes, y qué se esperaría de vos en los primeros tres meses. Elegí tres según quién entrevista: a un dev preguntale de stack y prácticas, a un manager de expectativas y equipo. Evitá preguntar algo que está en su web.',
        },
        {
          text: 'Dejar listo Xcode, un proyecto que compile y el simulador',
          explanation:
            'El día anterior: dejá Xcode en la versión que vas a usar (no lo actualices la mañana de la entrevista, puede tardar horas) y descargá el runtime del simulador. Creá un proyecto SwiftUI vacío, y uno UIKit si aplica, compilalos y corrélos en el simulador para tener todo cacheado. Antes de entrar: desactivá notificaciones, cerrá apps con datos privados, agrandá la fuente del editor para que se lea al compartir pantalla y probá compartir la ventana de Xcode en la plataforma de la llamada. Revisá cámara, micrófono y conexión, y tené un plan B como el hotspot del celular.',
        },
      ],
    },
  ],
};
