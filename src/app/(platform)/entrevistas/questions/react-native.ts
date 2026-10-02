import type { InterviewQuestion, Seniority } from './types';

export const reactNativeQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'react native',
      question: '¿Qué es React Native y en qué se diferencia de una app web en un WebView?',
      answer:
        'Es un framework para hacer apps móviles nativas con React y JavaScript/TypeScript. Los componentes (`View`, `Text`, `Image`) se renderizan como vistas nativas reales de iOS y Android, no como HTML dentro de un WebView. Eso da mejor performance y look & feel nativo, compartiendo la mayor parte del código entre plataformas.',
    },
    {
      topic: 'react native',
      question: '¿Cuál es la diferencia entre React Native y React para web?',
      answer:
        'El modelo es el mismo (componentes, props, state, hooks), pero no hay DOM ni HTML: se usan componentes como `View` en vez de `div` y `Text` en vez de `span` (todo texto tiene que estar dentro de un `Text`). Los estilos se escriben en JavaScript con `StyleSheet` y no hay CSS en cascada, y la navegación no se basa en URLs sino en stacks de pantallas.',
    },
    {
      topic: 'estilos',
      question: '¿Cómo funcionan los estilos y el layout en React Native?',
      answer:
        'Con objetos JavaScript (normalmente vía `StyleSheet.create`) con propiedades parecidas a CSS en camelCase. El layout usa Flexbox con algunas diferencias respecto a la web: `flexDirection` es `column` por defecto y las dimensiones son en unidades independientes de la densidad, sin px. No hay herencia de estilos salvo dentro de `Text` anidados.',
    },
    {
      topic: 'expo',
      question: '¿Qué es Expo y por qué se recomienda?',
      answer:
        'Es un framework y conjunto de herramientas sobre React Native: SDK con módulos nativos listos (cámara, notificaciones, archivos), Expo Router para navegación basada en archivos, builds en la nube con EAS y actualizaciones OTA. Hoy es la forma recomendada por el equipo de React Native para empezar un proyecto nuevo, y con development builds se puede agregar cualquier código nativo.',
    },
    {
      topic: 'listas',
      question: '¿Por qué usar `FlatList` en vez de `ScrollView` con un `map` para listas largas?',
      answer:
        '`ScrollView` renderiza todos los hijos de una vez, lo que en listas largas consume mucha memoria y hace lento el arranque. `FlatList` virtualiza: solo renderiza lo que está cerca de la pantalla y recicla a medida que se scrollea. Necesita `keyExtractor` (o una `key` en cada item) para identificar los elementos.',
    },
    {
      topic: 'navegación',
      question: '¿Cómo se navega entre pantallas?',
      answer:
        'Con React Navigation (stack, tabs, drawer) o con Expo Router, que arma la navegación a partir de la estructura de archivos de `app/`. Un stack navigator apila pantallas: `navigation.navigate("Detail", { id })` agrega una y el botón atrás la saca. Los parámetros se leen en la pantalla destino.',
    },
    {
      topic: 'plataformas',
      question: '¿Cómo escribirías código distinto para iOS y Android?',
      answer:
        'Con `Platform.OS` para pequeñas diferencias (`Platform.OS === "ios" ? 20 : 0`), `Platform.select({ ios: ..., android: ... })` para valores, o archivos con extensión por plataforma (`Button.ios.tsx` y `Button.android.tsx`) que el bundler elige solo. Así se respetan las convenciones de cada sistema sin duplicar todo.',
    },
    {
      topic: 'componentes',
      question: '¿Qué componentes usarías para que un elemento responda a toques?',
      answer:
        '`Pressable` es el recomendado: da callbacks como `onPress` y `onLongPress` y estados `pressed` para cambiar el estilo. También existen `TouchableOpacity` y similares, más viejos. Para accesibilidad hay que agregar `accessibilityRole="button"` y un label cuando no hay texto visible.',
    },
    {
      topic: 'red',
      question: '¿Cómo harías una request a una API?',
      answer:
        'Con `fetch` (está disponible igual que en la web) o una librería como axios, dentro de un efecto o, mejor, con una librería de data fetching como TanStack Query que maneja caché, loading, errores y reintentos. Hay que contemplar que en mobile la conexión se cae seguido y mostrar estados de error y reintento.',
    },
    {
      topic: 'persistencia',
      question: '¿Cómo guardarías datos localmente?',
      answer:
        'AsyncStorage (o MMKV, mucho más rápido) para pares clave-valor no sensibles, SQLite (`expo-sqlite`) o una base como WatermelonDB para datos estructurados, y `expo-secure-store` o el Keychain/Keystore para tokens y datos sensibles. AsyncStorage no está cifrado, así que no se guardan secretos ahí.',
    },
    {
      topic: 'componentes',
      question: '¿Qué es `SafeAreaView` y por qué importa?',
      answer:
        'Las pantallas tienen zonas ocupadas por el notch, la isla dinámica, la barra de estado o el indicador de inicio. Las safe areas indican el espacio usable para no tapar contenido. Se usa `react-native-safe-area-context` (`SafeAreaView` o el hook `useSafeAreaInsets`) para agregar el padding correcto en cada dispositivo.',
    },
    {
      topic: 'react',
      question: '¿Qué diferencia hay entre props y state?',
      answer:
        'Las props vienen del componente padre y son de solo lectura; el state es propio del componente y al cambiar (con `useState` o `useReducer`) provoca un nuevo render. Es igual que en React web: si el dato viene de afuera es prop, si el componente lo controla es state.',
    },
    {
      topic: 'debugging',
      question: '¿Cómo debuggearías una app de React Native?',
      answer:
        'Con React Native DevTools (inspector de componentes, consola y breakpoints con Hermes), los logs de Metro, el menú de desarrollo del dispositivo y, para problemas nativos, Xcode y Android Studio (Logcat). Fast Refresh permite ver cambios sin perder el estado.',
    },
    {
      topic: 'imágenes',
      question: '¿Cómo se muestran imágenes locales y remotas?',
      answer:
        'Con `Image`: las locales con `require("./logo.png")`, y React Native elige la variante `@2x`/`@3x` según la densidad; las remotas con `source={{ uri }}` y tamaño explícito, porque no se conoce de antemano. Para caché y mejor performance se suele usar `expo-image`.',
    },
    {
      topic: 'formularios',
      question: '¿Qué tener en cuenta con el teclado en formularios?',
      answer:
        'Que no tape los inputs: `KeyboardAvoidingView` (con `behavior` distinto en iOS y Android) o librerías como `react-native-keyboard-controller`. Además, elegir el `keyboardType` y `textContentType`/`autoComplete` adecuados, `returnKeyType` para pasar al siguiente campo y cerrar el teclado al tocar fuera.',
    },
  ],
  'semi-senior': [
    {
      topic: 'arquitectura',
      question: '¿Cómo funciona la New Architecture de React Native?',
      answer:
        'Reemplaza el bridge asíncrono que serializaba todo a JSON por JSI, una interfaz que permite a JavaScript llamar código nativo directamente. Incluye Fabric (nuevo renderer, con soporte de features concurrentes de React y layout sincrónico), TurboModules (módulos nativos tipados y cargados lazy) y Codegen, que genera el código de unión a partir de specs tipadas. Es la arquitectura por defecto desde la versión 0.76.',
    },
    {
      topic: 'performance',
      question: '¿Cómo optimizarías una `FlatList` que se traba?',
      answer:
        'Items livianos y memoizados con `React.memo`, `keyExtractor` estable, `renderItem` y callbacks con `useCallback`, `getItemLayout` si la altura es fija, ajustar `windowSize` e `initialNumToRender`, e imágenes chicas cacheadas. Si sigue trabándose, FlashList de Shopify recicla vistas en lugar de crear nuevas y suele rendir mucho mejor.',
    },
    {
      topic: 'performance',
      question: '¿Qué es Hermes?',
      answer:
        'El motor de JavaScript optimizado para React Native y el que viene por defecto. Compila el JS a bytecode en el build, así la app arranca más rápido, usa menos memoria y el paquete es más chico. También habilita el debugging con React Native DevTools.',
    },
    {
      topic: 'animaciones',
      question: '¿Por qué usar Reanimated para animaciones?',
      answer:
        'Porque corre las animaciones en el UI thread con worklets, sin depender de que el hilo de JavaScript esté libre: si JS está ocupado, la animación sigue a 60/120 fps. La API `Animated` con `useNativeDriver` también delega a nativo, pero solo para algunas propiedades. Con react-native-gesture-handler se combinan gestos y animaciones fluidas.',
    },
    {
      topic: 'estado',
      question: '¿Cómo manejarías el estado global y el estado del servidor?',
      answer:
        'Separándolos: el estado del servidor (datos de la API) con TanStack Query, que se encarga de caché, revalidación, paginación y estados de carga; y el estado de cliente global (sesión, preferencias) con algo liviano como Zustand o Context. Así se evita meter respuestas de la API en un store global y sincronizarlas a mano.',
    },
    {
      topic: 'nativo',
      question: '¿Cuándo y cómo escribirías un módulo nativo?',
      answer:
        'Cuando hace falta una API de la plataforma o un SDK que no tiene librería, o por performance. Con Expo Modules API se escribe en Swift y Kotlin con una API declarativa; sin Expo, con TurboModules y Codegen a partir de una spec en TypeScript. Hay que exponer una interfaz chica, tipada y asíncrona cuando el trabajo es pesado.',
    },
    {
      topic: 'expo',
      question: '¿Qué son los development builds y cuándo dejarías de usar Expo Go?',
      answer:
        'Expo Go es una app con un conjunto fijo de módulos nativos: sirve para empezar, pero no permite código nativo propio ni librerías nativas que no incluya. Un development build es tu propia app con el dev client: incluye las dependencias nativas que necesites y se genera con EAS Build o localmente. Se pasa a development builds en cuanto el proyecto es serio.',
    },
    {
      topic: 'actualizaciones',
      question: '¿Qué son las actualizaciones OTA y qué límites tienen?',
      answer:
        'Permiten publicar cambios del bundle de JavaScript y los assets sin pasar por la review de las tiendas (EAS Update). No sirven para cambios nativos: nuevas librerías nativas o permisos requieren un build nuevo, y por eso se versiona con "runtime version". Las tiendas permiten OTA para fixes y mejoras, no para cambiar el propósito de la app.',
    },
    {
      topic: 'testing',
      question: '¿Cómo testearías una app de React Native?',
      answer:
        'Unit tests con Jest para lógica y hooks, React Native Testing Library para componentes (interactuando como el usuario: por texto o rol, no por implementación), mocks de los módulos nativos, y tests end-to-end en simulador o dispositivo con Maestro o Detox para los flujos críticos.',
    },
    {
      topic: 'navegación',
      question: '¿Cómo manejarías deep links y autenticación en la navegación?',
      answer:
        'Configurando el linking (scheme propio y universal/app links) para que cada URL mapee a una pantalla, algo que Expo Router da por defecto. Para auth se renderizan stacks distintos según haya sesión o no, en vez de redirigir a mano, y si llega un deep link a una pantalla protegida se guarda el destino para ir después del login.',
    },
    {
      topic: 'plataformas',
      question: '¿Qué diferencias de comportamiento entre iOS y Android tenés que contemplar?',
      answer:
        'El botón atrás físico de Android (y el gesto) que hay que manejar con `BackHandler`, sombras (`shadow*` en iOS vs `elevation` en Android, aunque ahora existe `boxShadow`), permisos y su flujo, teclado y `KeyboardAvoidingView`, fuentes, safe areas y convenciones de navegación (tabs abajo, modales). Se prueba en ambas plataformas siempre, no solo en una.',
    },
    {
      topic: 'notificaciones',
      question: '¿Cómo implementarías push notifications?',
      answer:
        'Pidiendo permiso en contexto, obteniendo el token (con `expo-notifications`, que simplifica APNs y FCM, o con Firebase Messaging), mandándolo al backend asociado al usuario y manejando los tres casos: app en primer plano, en background y cerrada (al tocarla, navegar a la pantalla correcta). Los tokens cambian, así que se actualizan en el backend.',
    },
    {
      topic: 'typescript',
      question: '¿Cómo tiparías la navegación con TypeScript?',
      answer:
        'Definiendo un tipo con los parámetros de cada pantalla (`type RootStackParamList = { Detail: { id: string } }`) y usándolo en el navigator y en los hooks/props de cada pantalla, o con las rutas tipadas de Expo Router. Así el compilador detecta navegar a una pantalla inexistente o con parámetros incorrectos.',
    },
    {
      topic: 'performance',
      question: '¿Qué causa re-renders innecesarios y cómo los detectás?',
      answer:
        'Objetos y funciones nuevos en cada render pasados como props, contextos que cambian demasiado seguido y estado guardado más arriba de lo necesario. Se detectan con el profiler de React DevTools. Se resuelve con `memo`, `useMemo`/`useCallback` donde mide, dividiendo contextos y bajando el estado; el React Compiler automatiza buena parte de esta memoización.',
    },
    {
      topic: 'distribución',
      question: '¿Cómo es el proceso de build y publicación?',
      answer:
        'Con EAS Build se generan los binarios firmados para iOS (IPA) y Android (AAB) en la nube, manejando credenciales; con EAS Submit se suben a App Store Connect y Google Play. Se usan perfiles (development, preview, production), canales de update y se incrementa el número de build automáticamente.',
    },
  ],
  senior: [
    {
      topic: 'arquitectura',
      question: '¿Cuándo elegirías React Native frente a desarrollo nativo?',
      answer:
        'React Native conviene cuando se quiere una sola base de código para iOS y Android (y a veces web), el equipo es fuerte en React y la app es mayormente UI de negocio. El nativo conviene para apps con uso intensivo de gráficos, procesamiento en tiempo real o APIs de plataforma muy nuevas. Muchas empresas combinan: RN para la mayor parte y módulos nativos donde hace falta.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo integrarías React Native en una app nativa existente (brownfield)?',
      answer:
        'Embebiendo una instancia de React Native en pantallas concretas: el equipo nativo monta una vista RN para un flujo nuevo y se comunican por módulos nativos o eventos. Hay que resolver el build (integrar el bundle, CocoaPods/Gradle), compartir la navegación y la sesión entre ambos mundos y el costo de inicializar el runtime. Se arranca por flujos aislados.',
    },
    {
      topic: 'performance',
      question: '¿Cómo mejorarías el tiempo de arranque de una app React Native?',
      answer:
        'Midiendo TTI (time to interactive) en dispositivos de gama baja. Usar Hermes con bytecode precompilado, cargar módulos de forma diferida (inline requires, TurboModules lazy), achicar el bundle sacando dependencias pesadas, evitar trabajo síncrono en el arranque, mostrar contenido cacheado en el primer render y diferir SDKs de analytics.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo funciona el threading en React Native?',
      answer:
        'Hay un hilo de JavaScript donde corre la lógica de React, el UI/main thread nativo que dibuja y procesa gestos, y hilos de background para layout (Yoga) y módulos nativos. Si el hilo de JS se bloquea, la app deja de responder a la lógica aunque la UI nativa siga viva. Por eso las animaciones y gestos se mueven al UI thread con Reanimated, y el trabajo pesado a nativo o workers.',
    },
    {
      topic: 'offline',
      question: '¿Cómo diseñarías una app offline-first en React Native?',
      answer:
        'Una base local (SQLite, WatermelonDB) como fuente de verdad que la UI observa; mutaciones aplicadas localmente y encoladas para sincronizar cuando haya red (NetInfo), con reintentos y resolución de conflictos definida. TanStack Query con persistencia y mutaciones pausadas puede alcanzar para casos simples; para sync complejo, motores de sync dedicados.',
    },
    {
      topic: 'monorepo',
      question: '¿Cómo compartirías código entre la app mobile y la web?',
      answer:
        'Con un monorepo (pnpm/yarn workspaces, Turborepo o Nx) con paquetes compartidos de lógica, tipos, validaciones y cliente de API. Para UI compartida, React Native Web o soluciones como Tamagui o NativeWind permiten escribir componentes una vez. Hay que cuidar la configuración de Metro para resolver paquetes del workspace y mantener versiones de React alineadas.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué consideraciones de seguridad tenés en una app React Native?',
      answer:
        'El bundle de JS se puede extraer y leer: nada de secretos en el código ni en variables de entorno embebidas. Tokens en SecureStore/Keychain/Keystore, HTTPS con pinning si el riesgo lo amerita, validar deep links, no loguear datos sensibles, detectar dispositivos comprometidos si el negocio lo requiere (Play Integrity, App Attest) y toda autorización real en el backend.',
    },
    {
      topic: 'actualizaciones',
      question: '¿Cómo manejarías releases con OTA de forma segura?',
      answer:
        'Con canales por entorno, runtime versions para no mandar JS incompatible con el binario, rollouts graduales de la actualización, monitoreo de crashes por update id y la posibilidad de hacer rollback a la versión anterior. Los cambios nativos siempre van por build de tienda; el OTA queda para fixes y features JS.',
    },
    {
      topic: 'testing',
      question: '¿Cómo armarías la estrategia de testing y CI?',
      answer:
        'Pirámide: muchos tests de lógica y hooks con Jest, tests de componentes con Testing Library, y pocos E2E con Maestro o Detox en CI sobre simuladores para flujos críticos (login, compra). Lint y typecheck en cada PR, builds de preview con EAS para QA y para el equipo de producto, y tests de los módulos nativos en sus plataformas.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo monitoreás una app React Native en producción?',
      answer:
        'Crash reporting que capture errores de JavaScript y nativos (Sentry, Crashlytics) con source maps y dSYMs/mappings subidos para cada build y update; error boundaries para mostrar fallbacks; métricas de performance (arranque, frames lentos, tiempos de pantalla); y analytics de producto. Todo etiquetado por versión de binario y de update OTA.',
    },
    {
      topic: 'upgrades',
      question: '¿Cómo encararías actualizar React Native varias versiones?',
      answer:
        'Usando el Upgrade Helper para ver los cambios en los archivos nativos de versión a versión, subiendo de a una versión mayor a la vez, actualizando primero las librerías nativas incompatibles y probando en ambas plataformas. Con Expo, el salto se hace por versión del SDK y `npx expo install --fix` alinea dependencias. Mantenerse cerca de la última reduce mucho el costo.',
    },
    {
      topic: 'diseño de sistemas',
      question: '¿Cómo diseñarías un design system para una app React Native?',
      answer:
        'Tokens (colores, tipografía, espaciado, radios) como fuente de verdad, soportando tema claro/oscuro y Dynamic Type; componentes base accesibles (botón, input, texto) que encapsulen las diferencias entre plataformas; documentación con Storybook y screenshot tests para detectar regresiones visuales. Publicado como paquete del monorepo para reutilizar en otras apps.',
    },
    {
      topic: 'nativo',
      question: '¿Cómo decidirías entre una librería de la comunidad y escribir la tuya?',
      answer:
        'Evaluando mantenimiento (releases recientes, issues atendidos), soporte de la New Architecture, compatibilidad con Expo, calidad de tipos y tamaño. Si la necesidad es chica y crítica, un módulo propio con Expo Modules puede ser más seguro que depender de una librería abandonada. Cada dependencia nativa es costo de upgrades futuros.',
    },
    {
      topic: 'accesibilidad',
      question: '¿Cómo asegurás que la app sea accesible en ambas plataformas?',
      answer:
        'Usando `accessibilityRole`, `accessibilityLabel` y `accessibilityState` en los componentes, respetando el tamaño de fuente del sistema, targets táctiles de al menos 44pt/48dp, contraste suficiente, orden de foco lógico y anunciando cambios importantes. Se prueba con VoiceOver y TalkBack, porque se comportan distinto.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo organizarías un equipo que mantiene una app React Native?',
      answer:
        'Equipos de producto que trabajan en features de punta a punta en TypeScript, con al menos una persona fuerte en iOS y otra en Android para la capa nativa, builds y releases. Convenciones claras (estructura, estado, navegación), ownership de módulos, un calendario de releases y una persona responsable de los upgrades de RN para que no se acumulen.',
    },
  ],
};
