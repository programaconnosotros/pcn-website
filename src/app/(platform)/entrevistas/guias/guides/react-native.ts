import type { InterviewGuide } from './types';

export const reactNativeGuide: InterviewGuide = {
  track: 'react-native',
  summary:
    'Cómo prepararte para una entrevista de React Native: React y TypeScript, Expo, la New Architecture, navegación, estado, performance, testing, publicación y el día de la entrevista.',
  sections: [
    {
      id: 'como-es-la-entrevista',
      title: 'Cómo es la entrevista',
      body: [
        'Un proceso para React Native suele tener una charla con recruiting, una entrevista técnica sobre React y mobile, un ejercicio práctico (live coding o take-home) y una charla con el equipo. En empresas con producto mobile grande se suma diseño de sistemas y una ronda de comportamiento. Preguntá si usan Expo, qué versión de React Native y si el ejercicio corre en Expo Go o en simulador.',
        'Para junior se evalúa React (props, state, hooks), qué es React Native y en qué se diferencia de un WebView y de React web, estilos con Flexbox, `FlatList`, navegación básica, código por plataforma, `SafeAreaView`, el teclado en formularios y cómo debuggear. Para semi-senior: la New Architecture, Hermes, optimización de listas, Reanimated, estado global vs estado del servidor, development builds, OTA, deep links, push, testing y publicación.',
        'Para senior se espera criterio: cuándo elegir React Native frente a nativo, integración brownfield, threading, arranque, offline-first, compartir código con la web, seguridad, estrategia de releases con OTA, upgrades de versión, design systems, accesibilidad en ambas plataformas y organización del equipo. Las buenas respuestas reconocen los límites de la plataforma y cuándo hace falta código nativo.',
      ],
      checklist: [
        {
          text: 'Saber qué etapas tiene el proceso y si usan Expo',
          explanation:
            'En la charla con recruiting preguntá cuántas etapas hay, quién entrevista en cada una y qué formato tiene (conceptual, live coding, take-home, system design, comportamiento). Para mobile sumá preguntas específicas: si usan Expo o React Native sin framework, qué versión, si la app tiene mucho código nativo propio, y si el ejercicio corre en Expo Go, en un simulador o en un snack online. Eso define qué repasar: un equipo con Expo te va a preguntar por EAS, development builds y OTA; uno con mucho nativo, por módulos, Xcode y Gradle. Anotá todo en una tabla con etapa, fecha, formato y temas, y preparate para la etapa que define en vez de todo a la vez.',
        },
        {
          text: 'Tener una app propia que puedas explicar, idealmente publicada',
          explanation:
            'Construí una app chica con Expo y TypeScript que tenga lo que se pregunta: navegación con stack y tabs, una lista que consume una API con paginación, algo persistido localmente, un formulario con teclado bien manejado y, si podés, una notificación o un deep link. Publicarla, aunque sea en TestFlight o en un track de testing interno de Google Play, demuestra que conocés firma, builds y revisión, que es justo lo que diferencia mobile de web. Prepará un recorrido de cinco minutos: problema, decisiones de arquitectura, dónde vive el estado, qué fue distinto en iOS y Android, qué rompió y cómo lo resolviste, y qué cambiarías. Tené el repo con README y un video corto de la app por si no podés instalarla en la llamada.',
        },
        {
          text: 'Identificar los temas de tu seniority que te cuestan más',
          explanation:
            'Tomá los temas de esta guía para tu nivel y puntuá cada uno de 1 a 3: 1 si no podrías explicarlo, 2 si lo explicás con dudas, 3 si lo explicás con un ejemplo y sus trade-offs. Verificalo explicándolo en voz alta sin mirar nada. Priorizá lo que más se pregunta en tu nivel: para junior, React, Flexbox con los defaults de React Native y `FlatList`; para semi-senior, New Architecture, performance de listas, Reanimated y OTA; para senior, offline-first, releases, upgrades y nativo frente a React Native. En mobile también hay huecos prácticos: si nunca hiciste un build de release o publicaste en una tienda, hacelo una vez antes de la entrevista.',
        },
        {
          text: 'Poder contar en dos minutos tu experiencia y qué rol buscás',
          explanation:
            'Armá un pitch con cuatro partes: quién sos y cuánta experiencia tenés, qué apps hiciste recientemente (producto, usuarios, stack, tu rol), un logro concreto medible y qué rol buscás. Ejemplo: "Soy desarrollador mobile con dos años en React Native y Expo; en mi último trabajo mantuve una app de delivery con 50 mil usuarios, migré la lista principal a FlashList y bajamos los frames perdidos a la mitad; busco un equipo de producto donde pueda tocar también código nativo." Mencioná si publicaste en tiendas y si trabajaste en ambas plataformas, que es lo primero que quieren saber. Ensayalo en voz alta con timer hasta que salga natural.',
        },
      ],
    },
    {
      id: 'react-y-typescript',
      title: 'React y TypeScript para mobile',
      body: [
        'En React Native te van a evaluar React igual que en web: props vs state, inmutabilidad, `key` en listas, `useEffect` y su cleanup, stale closures, `useMemo` y `useCallback`, custom hooks y qué dispara un re-render. Repasalo como si fuera una entrevista de React, porque gran parte de los bugs y las preguntas de performance de React Native son en realidad de React.',
        'Las diferencias con la web: no hay DOM ni CSS, los componentes son `View`, `Text`, `Image`, `Pressable` y se traducen a vistas nativas; todo texto va dentro de `Text`; los estilos son objetos con `StyleSheet` y no hay cascada; y el layout usa Yoga, una implementación de Flexbox donde `flexDirection` es `column` por defecto. Sabé explicar por qué esto no es un WebView: la UI es nativa de verdad.',
        'TypeScript es estándar. Más allá de tipar props, te pueden pedir tipar la navegación (parámetros de cada ruta para que `navigate` y los params estén verificados), modelar estados con discriminated unions y tipar respuestas de API validándolas con Zod en el borde. Con React 19 y el React Compiler, que Expo soporta, la memoización manual pierde protagonismo.',
      ],
      checklist: [
        {
          text: 'Explicar qué dispara un re-render y cómo evitar los innecesarios',
          explanation:
            'Un componente se re-renderiza cuando cambia su state, cuando se re-renderiza su padre o cuando cambia un Context que consume; React compara el árbol nuevo con el anterior y solo aplica las diferencias a las vistas nativas. En mobile importa más porque el hilo de JavaScript es uno solo y un re-render grande se nota como lag al tocar o scrollear. Para evitar los innecesarios, primero arreglá la estructura: bajá el state al componente que lo usa, pasá contenido como `children` y dividí Context grandes. Después memoizá donde medís que hace falta: `React.memo` en items de lista, `useCallback` para `renderItem` y handlers que reciben esos items. Con el React Compiler activo (Expo lo soporta) gran parte de esa memoización es automática. Error común: crear objetos de estilo o funciones inline en cada item de una lista larga.',
        },
        {
          text: 'Explicar las diferencias entre React Native y React web',
          explanation:
            'El modelo de componentes, hooks y estado es el mismo; lo que cambia es el renderer y la plataforma. No hay DOM: usás `View`, `Text`, `Image`, `TextInput`, `Pressable`, `ScrollView` y `FlatList`, que se traducen a vistas nativas de iOS y Android. No hay CSS: los estilos son objetos JavaScript (`StyleSheet.create`), sin cascada ni selectores, sin herencia salvo dentro de `Text` anidados, con unidades sin `px` (puntos independientes de la densidad). Todo texto tiene que estar dentro de `Text` o falla. No hay `onClick` sino `onPress`, ni URLs nativas: la navegación es una librería. Además lidiás con cosas que la web no tiene: safe areas, teclado que tapa inputs, permisos, ciclo de vida de la app (foreground y background), tiendas y builds nativos.',
        },
        {
          text: 'Explicar por qué React Native no es un WebView',
          explanation:
            'Una app híbrida con WebView (Cordova, Ionic con Capacitor) renderiza HTML y CSS dentro de un navegador embebido, así que la UI es web aunque esté empaquetada como app. En React Native tu código JavaScript describe la UI con componentes, pero el renderer (Fabric) crea vistas nativas reales: un `View` es un `UIView` en iOS y un `ViewGroup` en Android, un `ScrollView` usa el scroll nativo con su física. Por eso los gestos, la accesibilidad, el scroll y las animaciones se sienten nativos y podés usar componentes nativos directamente. JavaScript corre en un motor (Hermes) y se comunica con el lado nativo por JSI, no hay HTML en ningún momento. El trade-off frente a nativo puro es la capa de JS y depender de librerías para APIs nuevas de la plataforma.',
        },
        {
          text: 'Maquetar una pantalla con Flexbox recordando los defaults de React Native',
          explanation:
            'Yoga implementa Flexbox con defaults distintos a la web: `flexDirection` es `column`, `alignContent` es `flex-start`, `flexShrink` es 0, y todo `View` ya es flex (no existe `display: block` ni `inline`). `flex: 1` en React Native significa ocupar el espacio disponible proporcionalmente, y es lo que usás para que una pantalla llene el alto: `container: { flex: 1 }`. Para una fila (avatar con nombre al lado), `flexDirection: "row"` y `alignItems: "center"`; para empujar un botón al fondo, un hijo con `flex: 1` arriba o `justifyContent: "space-between"`. Tenés `gap`, `rowGap` y `columnGap`, porcentajes y `position: "absolute"` relativo al padre. Error común: un `Text` largo en una fila que se sale de la pantalla porque falta `flexShrink: 1` o `flex: 1` en él.',
        },
        {
          text: 'Tipar los parámetros de las rutas de la navegación',
          explanation:
            'En React Navigation definís un mapa de rutas a parámetros: `type RootStackParamList = { Home: undefined; Profile: { userId: string } }`, se lo pasás a `createNativeStackNavigator<RootStackParamList>()` y tipás cada pantalla con `NativeStackScreenProps<RootStackParamList, "Profile">`. Así `navigation.navigate("Profile", { userId: "1" })` falla al compilar si falta el parámetro o la ruta no existe. Declarando `RootParamList` en el namespace global `ReactNavigation`, `useNavigation()` queda tipado sin genéricos en cada uso; la API estática de React Navigation 7 infiere todo sola. En Expo Router, activás typed routes y las rutas de `href` se verifican contra los archivos; los params se leen con `useLocalSearchParams<{ id: string }>()`. Recordá que los params llegan como string desde un deep link: validalos o convertilos antes de usarlos.',
        },
      ],
    },
    {
      id: 'expo-y-arquitectura',
      title: 'Expo y la New Architecture',
      body: [
        'Expo es el framework recomendado por el equipo de React Native: da SDK de módulos nativos mantenidos, Expo Router, config plugins para modificar el proyecto nativo sin tocarlo a mano (prebuild) y EAS para builds, envíos a las tiendas y updates. Expo Go sirve para empezar, pero en cuanto necesitás una librería nativa propia o configuración específica pasás a un development build, que es tu propia app de desarrollo con tus módulos.',
        'La New Architecture es la arquitectura por defecto y la única soportada en las versiones recientes. Reemplaza al bridge asíncrono que serializaba JSON por JSI, que permite que JavaScript llame directamente a C++; Turbo Modules para módulos nativos cargados bajo demanda; Fabric como nuevo renderer, con soporte para rendering concurrente de React y layout síncrono; y Codegen para generar tipos a partir de especificaciones en TypeScript.',
        'Sabé explicar el threading: el hilo de JavaScript corre tu código React, el hilo de UI (main) dibuja y responde a gestos, y hay hilos en background para layout y módulos. Si el hilo de JS está ocupado, la app deja de responder a la lógica aunque la UI nativa siga viva. Hermes es el motor de JavaScript por defecto, optimizado para mobile: compila a bytecode en build, lo que mejora arranque y memoria.',
      ],
      checklist: [
        {
          text: 'Explicar qué aporta Expo y cuándo pasar de Expo Go a un development build',
          explanation:
            'Expo es un framework sobre React Native: un SDK de módulos nativos mantenidos y versionados juntos (cámara, notificaciones, archivos, SQLite), Expo Router para navegación por archivos, prebuild y config plugins para generar los proyectos nativos, y EAS para builds en la nube, envíos a las tiendas y updates OTA. Expo Go es una app ya compilada con el SDK de Expo adentro: escaneás un QR y probás al instante, pero solo podés usar los módulos nativos que trae, solo soporta la última versión del SDK y no refleja tu configuración nativa (íconos, permisos, esquemas de deep link). Pasás a un development build, que es tu propia app con `expo-dev-client` y tus módulos, en cuanto agregás una librería con código nativo que no está en Expo Go, necesitás config propia o querés probar push y deep links reales. En equipos profesionales casi siempre se trabaja con development builds desde el principio.',
        },
        {
          text: 'Explicar qué son los config plugins y el prebuild',
          explanation:
            '`npx expo prebuild` genera las carpetas `ios` y `android` a partir de tu `app.json` o `app.config.ts` y de las librerías instaladas, en lugar de mantenerlas a mano (Continuous Native Generation). Un config plugin es una función que se ejecuta durante el prebuild y modifica esos proyectos nativos: agrega un permiso al `Info.plist` o al `AndroidManifest.xml`, cambia el `build.gradle`, registra un esquema de URL o inyecta código. Muchas librerías traen el suyo y vos lo configurás en `plugins` del `app.json`, por ejemplo `["expo-camera", { "cameraPermission": "..." }]`. La ventaja es que las carpetas nativas son reproducibles y se pueden ignorar en git, lo que simplifica mucho los upgrades. El error común es editar a mano `ios` o `android` en un proyecto con CNG: el próximo prebuild borra el cambio; si lo necesitás, escribí un config plugin local.',
        },
        {
          text: 'Explicar JSI, Turbo Modules, Fabric y Codegen en una frase cada uno',
          explanation:
            'JSI (JavaScript Interface) es una API en C++ que permite que JavaScript tenga referencias a objetos nativos y llame funciones de forma directa y, si hace falta, síncrona, sin serializar mensajes JSON por un bridge asíncrono. Turbo Modules son los módulos nativos de la nueva arquitectura, construidos sobre JSI y cargados de forma perezosa la primera vez que se usan, lo que mejora el arranque. Fabric es el nuevo renderer, con el árbol de vistas en C++ compartido entre plataformas, que soporta las features concurrentes de React (transiciones, Suspense) y permite medir layout de forma síncrona. Codegen lee las especificaciones tipadas en TypeScript de tus módulos y componentes y genera el código C++ y nativo que los conecta, con verificación de tipos entre JS y nativo. Juntos reemplazan al bridge, que desde React Native 0.82 ya no existe.',
        },
        {
          text: 'Explicar qué hilos existen y qué pasa si se bloquea el de JavaScript',
          explanation:
            'El hilo de UI (main thread) dibuja las vistas nativas y recibe los toques y gestos del sistema. El hilo de JavaScript ejecuta tu código React: renders, lógica, handlers, timers. Además hay hilos en background, por ejemplo para calcular layout con Yoga en Fabric y para trabajo de módulos nativos. Si bloqueás el hilo de JS con un cálculo pesado, un `JSON.parse` enorme o un render de miles de items, los `onPress` no responden, las animaciones de `Animated` sin native driver se congelan y la navegación tarda, aunque el scroll nativo pueda seguir moviéndose. Soluciones: partir el trabajo, mover cálculos pesados a nativo o a worklets, usar Reanimated para animaciones en el hilo de UI, y `useTransition` para renders no urgentes. El monitor de performance muestra FPS de JS y de UI por separado para diagnosticar cuál se cae.',
        },
        {
          text: 'Explicar qué es Hermes y por qué mejora el arranque',
          explanation:
            'Hermes es el motor de JavaScript que mantiene Meta para React Native y viene por defecto en iOS y Android. Su ventaja principal es la compilación ahead of time: en el build convierte tu bundle a bytecode, así que en el dispositivo no hay que parsear y compilar JavaScript al abrir la app, solo cargar y ejecutar; eso baja el tiempo de arranque (TTI) y el uso de memoria, sobre todo en Android de gama baja. También tiene un garbage collector pensado para mobile y se integra con React Native DevTools para debuggear y perfilar. El trade-off histórico era menor velocidad pico frente a motores con JIT y algunas features de JS más tarde, aunque la brecha se achicó mucho. Error común: decir que Hermes acelera todo; mejora sobre todo el arranque y la memoria, no un render mal hecho.',
        },
      ],
    },
    {
      id: 'navegacion-y-plataformas',
      title: 'Navegación y diferencias entre plataformas',
      body: [
        'La navegación se hace con React Navigation o con Expo Router, que la construye sobre React Navigation y define rutas por archivos, como Next.js. Conocé stacks, tabs y modales, cómo pasar parámetros, cómo funcionan los deep links y universal links o app links, y el patrón de autenticación: rutas protegidas que redirigen según el estado de sesión, sin que el usuario pueda volver atrás a una pantalla privada después de cerrar sesión.',
        'Para código por plataforma tenés `Platform.OS`, `Platform.select` y archivos con extensión `.ios.tsx` y `.android.tsx`. Las diferencias que conviene contemplar: botón atrás de Android, sombras (`shadow*` en iOS vs `elevation` en Android), safe areas y notch, comportamiento del teclado (`KeyboardAvoidingView` funciona distinto en cada plataforma), permisos, fuentes y gestos del sistema.',
        'Para push notifications, `expo-notifications` abstrae APNs y FCM: pedís permiso, obtenés el token, lo registrás en tu backend y manejás notificaciones en primer plano, en background y al tocarlas (navegando a la pantalla correcta con un deep link). En senior, sabé explicar por qué el token puede cambiar y cómo mantenerlo actualizado.',
      ],
      checklist: [
        {
          text: 'Armar un flujo con stack, tabs y un modal',
          explanation:
            'La estructura típica es un stack raíz que contiene un navegador de tabs como primera pantalla, más pantallas que se apilan encima de las tabs (detalle) y modales. En Expo Router se arma con carpetas: `app/_layout.tsx` exporta un `Stack`, `app/(tabs)/_layout.tsx` exporta `Tabs` con `index.tsx` y `profile.tsx`, `app/product/[id].tsx` es el detalle y `app/new-post.tsx` se registra en el stack raíz con `options={{ presentation: "modal" }}`. Con React Navigation es lo mismo en código: un `createNativeStackNavigator` cuyo primer `Screen` es el componente de `createBottomTabNavigator`. Poner el detalle en el stack raíz hace que tape la tab bar; ponerlo en un stack dentro de cada tab la mantiene visible, y es una decisión de UX que conviene explicitar. Usá el native stack para que transiciones y gestos de volver sean los nativos.',
        },
        {
          text: 'Implementar rutas protegidas por autenticación',
          explanation:
            'El estado de sesión vive en un provider (Context o Zustand) que al arrancar lee el token de `expo-secure-store` y expone `isLoading` y `session`. Mientras carga, mantenés la splash screen. Con Expo Router usás `Stack.Protected` con `guard={!!session}` para el grupo privado y otro con `guard={!session}` para login y registro: si el guard es falso, esas rutas no existen y Router redirige a la primera disponible. Con React Navigation el patrón es renderizar condicionalmente distintas pantallas según `session`; al cambiar, React Navigation reemplaza el árbol. En ambos casos, al cerrar sesión las pantallas privadas se desmontan y el usuario no puede volver con el botón atrás, a diferencia de hacer `navigate("Login")`, que deja la historia. Recordá que esto es UX: la autorización real la hace el backend con el token.',
        },
        {
          text: 'Configurar y probar un deep link que abra una pantalla con parámetros',
          explanation:
            'Primero definís un esquema propio en el `app.json` (`"scheme": "miapp"`), y con Expo Router cada archivo ya es una URL: `miapp://product/42` abre `app/product/[id].tsx` con `id = "42"`. Con React Navigation configurás `linking` con un mapa de rutas a paths como `Product: "product/:id"`. Para links `https` que abren la app (universal links en iOS, app links en Android) necesitás publicar en tu dominio los archivos `apple-app-site-association` y `assetlinks.json` y declarar los dominios asociados en la config. Para probar: `npx uri-scheme open miapp://product/42 --ios`, `xcrun simctl openurl booted <url>` o `adb shell am start -a android.intent.action.VIEW -d <url>`, con la app cerrada y abierta, porque son caminos distintos. Validá los params como input externo: cualquiera puede armar un link.',
        },
        {
          text: 'Escribir código distinto por plataforma de tres formas',
          explanation:
            'Primera, `Platform.OS` para una condición puntual: `if (Platform.OS === "android") { ... }` o `Platform.OS === "ios" ? 20 : 0`. Segunda, `Platform.select` para elegir un valor por plataforma, muy usado en estilos: `...Platform.select({ ios: { shadowOpacity: 0.2, shadowRadius: 4 }, android: { elevation: 4 } })`; también acepta `native`, `web` y `default`. Tercera, extensiones de archivo: creás `DatePicker.ios.tsx` y `DatePicker.android.tsx` e importás `./DatePicker`, y Metro elige el archivo correcto en el build; existen también `.native.tsx` y `.web.tsx` para compartir con web. Regla práctica: condiciones chicas con `Platform`, componentes o implementaciones muy distintas con archivos separados (que mantengan la misma interfaz y tipos). `Platform.Version` te da la versión del sistema para chequear APIs nuevas.',
        },
        {
          text: 'Enumerar diferencias de comportamiento entre iOS y Android',
          explanation:
            'Navegación: Android tiene botón y gesto atrás del sistema, que podés interceptar con `BackHandler` o `usePreventRemove`; iOS usa el swipe desde el borde. Estilos: sombras con `shadow*` en iOS y `elevation` en Android (las versiones recientes también soportan `boxShadow`), fuentes del sistema distintas y ripple con `android_ripple` en `Pressable`. Teclado: `KeyboardAvoidingView` suele necesitar `behavior="padding"` en iOS, mientras que Android ajusta solo según el modo de la ventana, y con edge-to-edge (obligatorio en Android reciente) conviene una librería como `react-native-keyboard-controller`. Permisos: iOS pregunta una vez y después hay que mandar a Ajustes; Android permite volver a pedir y tiene permisos en runtime por versión. Además: safe areas y notch, notificaciones (Android requiere canales y permiso desde Android 13), alerts y pickers nativos con otra UI, y comportamiento en background más restrictivo en iOS.',
        },
        {
          text: 'Explicar el flujo de una push notification de punta a punta',
          explanation:
            'En la app, con `expo-notifications`, pedís permiso (en Android 13 o más también es obligatorio, y antes creás un canal), y obtenés un token: el Expo push token con `getExpoPushTokenAsync` o el token nativo de APNs o FCM con `getDevicePushTokenAsync`. Mandás ese token a tu backend asociado al usuario y al dispositivo. Cuando hay que notificar, el backend llama al servicio de push de Expo, o directamente a APNs (iOS) y FCM (Android), con el token, el título, el cuerpo y un `data` con, por ejemplo, la URL a abrir. El sistema operativo entrega la notificación: con la app en primer plano decidís si mostrarla con `setNotificationHandler`; si el usuario la toca, un listener de respuesta lee `data.url` y navega a esa pantalla, incluido el caso en que la app estaba cerrada. El token puede cambiar al reinstalar, restaurar el dispositivo o por rotación del proveedor, así que lo reenviás en cada arranque y el backend borra los que el servicio reporta como inválidos.',
        },
      ],
    },
    {
      id: 'estado-y-datos',
      title: 'Estado, datos y offline',
      body: [
        'Separá estado del servidor y estado del cliente. Para datos remotos, TanStack Query resuelve caché, reintentos, revalidación al volver a la app, paginación infinita y mutaciones optimistas. Para estado global de cliente (sesión, preferencias, carrito) Zustand o Context bien acotado suelen alcanzar; Redux Toolkit sigue en muchas apps grandes. El error común es meter respuestas de API en un store global y reimplementar caché a mano.',
        'Para persistencia local: AsyncStorage o MMKV para clave-valor (MMKV es síncrono y mucho más rápido), `expo-secure-store` para tokens y secretos (Keychain y Keystore por debajo), y SQLite con `expo-sqlite`, Drizzle u otras capas para datos estructurados. Nunca guardes un token en AsyncStorage: no está cifrado.',
        'En senior, offline-first: la base local es la fuente de verdad, la UI lee de ahí, y la red sincroniza en segundo plano con una cola de mutaciones pendientes, reintentos e idempotencia. Hay que decidir cómo resolver conflictos (last write wins, merge por campo o resolución en el servidor) y cómo detectar conectividad sin confiar ciegamente en ella.',
      ],
      checklist: [
        {
          text: 'Clasificar el estado de una app en servidor y cliente y elegir herramientas',
          explanation:
            'Estado del servidor es todo lo que tiene su fuente de verdad en una API: el feed, el perfil, los pedidos. Puede quedar desactualizado, se comparte entre pantallas y necesita caché, reintentos y revalidación, así que va en TanStack Query. Estado del cliente es lo que solo existe en el dispositivo: la sesión, el tema, un carrito antes de pagar, el paso de un onboarding. Si es local a una pantalla, `useState`; si se comparte, Zustand o un Context acotado; si tiene que sobrevivir a cerrar la app, persistido en MMKV o SecureStore. El estado de navegación (pantalla actual y params) lo maneja el router. Ejemplo en una app de delivery: restaurantes y pedidos en TanStack Query, carrito en Zustand persistido en MMKV, token en SecureStore, filtro abierto en `useState`.',
        },
        {
          text: 'Explicar qué resuelve TanStack Query frente a un fetch en `useEffect`',
          explanation:
            'Un fetch en `useEffect` te obliga a manejar a mano loading, error, reintentos, cancelación y race conditions, no cachea (volver a una pantalla vuelve a cargar con spinner) y no deduplica requests iguales de dos componentes. TanStack Query cachea por query key, muestra datos en caché al instante y revalida en segundo plano (stale-while-revalidate), reintenta con backoff, deduplica, y trae `useInfiniteQuery` para paginación y `useMutation` con invalidación y updates optimistas. En React Native hay que conectarle dos cosas que en web vienen solas: `focusManager` con `AppState` para refetchear al volver la app a primer plano, y `onlineManager` con `@react-native-community/netinfo` para pausar y reanudar al recuperar conexión. También podés persistir la caché para arrancar con datos sin red.',
        },
        {
          text: 'Elegir dónde guardar preferencias, tokens y datos estructurados',
          explanation:
            'Preferencias y flags simples (tema, idioma, onboarding visto): un almacenamiento clave-valor. MMKV es síncrono, muy rápido y se puede leer en el primer render sin parpadeo; AsyncStorage es asíncrono, más lento y más simple, suficiente para poco volumen. Tokens, refresh tokens y cualquier secreto: `expo-secure-store`, que usa Keychain en iOS y Keystore en Android, con datos cifrados por el sistema; tiene límites de tamaño, así que guardá solo lo sensible. Datos estructurados, relacionales o voluminosos (mensajes, pedidos offline, catálogos): SQLite con `expo-sqlite`, idealmente con un ORM como Drizzle para tipos y migraciones, o una base reactiva como WatermelonDB. Error común: serializar listas grandes a JSON en AsyncStorage, que hay que leer y escribir completas cada vez.',
        },
        {
          text: 'Explicar por qué no guardar un token en AsyncStorage',
          explanation:
            'AsyncStorage guarda los datos sin cifrar: en Android en una base SQLite o archivos dentro del sandbox de la app, en iOS en archivos planos. En un dispositivo rooteado o con jailbreak, en un backup no cifrado o con una herramienta de debugging, cualquiera puede leerlos, y con el token tiene la sesión del usuario. `expo-secure-store` (o `react-native-keychain`) guarda en Keychain de iOS y en el Keystore de Android, cifrado con claves del hardware y aislado por app, e incluso permite exigir biometría para leer. MMKV tiene una opción de cifrado, pero la clave tiene que vivir en algún lado seguro, así que no reemplaza al Keychain. Además: tokens de acceso cortos con refresh token, y borrarlos al cerrar sesión.',
        },
        {
          text: 'Esbozar una arquitectura offline-first con cola de cambios',
          explanation:
            'La base local (SQLite) es la fuente de verdad: la UI lee siempre de ahí, de forma reactiva, así que funciona igual con o sin red. Cada acción del usuario escribe primero en la base local y encola una mutación en una tabla `outbox` con un id generado en el cliente (UUID), el tipo de operación, el payload y un estado. Un proceso de sincronización, disparado al recuperar conexión, al volver a primer plano o periódicamente, manda la cola en orden con reintentos y backoff, y el servidor usa el id para ser idempotente y no duplicar si un reintento llega dos veces. En el otro sentido, pide cambios desde el último cursor o timestamp y los aplica localmente. Para conflictos elegís una estrategia: last write wins (simple, puede perder datos), merge por campo, o que el servidor decida y la app muestre el resultado. No confíes en NetInfo para saber si hay internet real: tratá cada request como algo que puede fallar.',
        },
      ],
    },
    {
      id: 'performance',
      title: 'Performance y animaciones',
      body: [
        'Las listas son la fuente número uno de problemas. `FlatList` virtualiza, a diferencia de un `ScrollView` con `map`. Para optimizarla: `keyExtractor` estable, items memoizados, `getItemLayout` si el alto es fijo, ajustar `windowSize` e `initialNumToRender`, imágenes del tamaño correcto y nada de funciones inline costosas en `renderItem`. FlashList de Shopify recicla celdas y suele rendir mucho mejor en listas grandes.',
        'Para animaciones, Reanimated corre la lógica en el hilo de UI mediante worklets, así que la animación sigue fluida aunque el hilo de JS esté ocupado. Combinado con Gesture Handler, permite gestos que responden a 60 o 120 fps. La API `Animated` con `useNativeDriver` sirve para casos simples, pero solo anima propiedades no relacionadas con el layout.',
        'Para diagnosticar: React DevTools Profiler y React Native DevTools para re-renders, el monitor de performance para ver FPS del hilo de JS y de UI, y los profilers nativos (Instruments, Android Studio) cuando el problema está del lado nativo. Para el arranque: Hermes, menos trabajo antes del primer render, carga diferida de pantallas y módulos, splash screen bien manejada y menos dependencias pesadas.',
      ],
      checklist: [
        {
          text: 'Explicar por qué `FlatList` y no `ScrollView` con `map`',
          explanation:
            'Un `ScrollView` renderiza todos sus hijos de una vez: con `items.map` sobre 1.000 elementos monta 1.000 componentes y sus vistas nativas al abrir la pantalla, lo que dispara el tiempo de carga y la memoria, y cada re-render del padre los recorre todos. `FlatList` virtualiza: renderiza solo los items cercanos a la zona visible, en tandas, y desmonta los que quedan lejos, así el costo depende de lo que se ve y no del largo de la lista. Además trae `onEndReached` para paginar, `refreshControl` o `onRefresh` para pull to refresh, headers, separadores y estado vacío. `ScrollView` sigue siendo correcto para contenido corto y heterogéneo, como un formulario o una pantalla de detalle. Error común: anidar una `FlatList` vertical dentro de un `ScrollView` vertical, que anula la virtualización; usá `ListHeaderComponent` en su lugar.',
        },
        {
          text: 'Optimizar una `FlatList` que se traba con al menos cuatro técnicas',
          explanation:
            'Primero medí con el monitor de performance si cae el FPS de JS o de UI. Técnicas: items memoizados con `React.memo` y un `renderItem` estable con `useCallback`, sin objetos ni funciones inline que rompan la memo; `keyExtractor` con un id estable; `getItemLayout` si los items tienen alto fijo, para que no haya que medirlos y el scroll a un índice sea instantáneo; ajustar `initialNumToRender` a lo que entra en pantalla, `windowSize` (menos memoria a cambio de más blancos al scrollear rápido) y `maxToRenderPerBatch`; imágenes del tamaño mostrado y con caché, por ejemplo con `expo-image`; items livianos, sin lógica pesada ni Context que cambie seguido; y `removeClippedSubviews` en listas muy largas, con cuidado. Si sigue lento, FlashList recicla las vistas en vez de crearlas y destruirlas, y en su versión 2 ya no necesita estimar el tamaño de los items.',
        },
        {
          text: 'Explicar por qué Reanimated anima fluido aunque el hilo de JS esté ocupado',
          explanation:
            'Con `Animated` sin native driver, cada frame de la animación se calcula en el hilo de JavaScript y se envía al nativo; si JS está ocupado con un render o un fetch, se pierden frames. Reanimated define la animación como worklets: funciones marcadas que se ejecutan en un runtime de JavaScript separado en el hilo de UI. Los valores viven en shared values (`useSharedValue`), `useAnimatedStyle` calcula el estilo en el hilo de UI en cada frame, y `withTiming` o `withSpring` interpolan ahí mismo, sin pasar por el hilo de JS. Con Gesture Handler, los gestos también se procesan en el hilo de UI, así que un arrastre sigue el dedo a 60 o 120 fps aunque JS esté bloqueado. Para volver a JS (por ejemplo, actualizar state al terminar) usás `runOnJS` o `scheduleOnRN`. Error común: leer `sharedValue.value` durante el render de React, que no es reactivo.',
        },
        {
          text: 'Detectar re-renders innecesarios con el Profiler',
          explanation:
            'Abrí React Native DevTools (tecla `j` en la terminal de Metro o desde el menú de desarrollo), andá a la pestaña Profiler y activá en la configuración la opción para registrar por qué renderizó cada componente. Grabá, hacé la interacción lenta (scrollear, escribir, cambiar de tab) y pará. El flamegraph muestra cada commit con los componentes que renderizaron y cuánto tardaron; al seleccionar uno ves la causa: cambió su state, cambiaron props (cuáles), cambió un hook o un Context, o renderizó el padre. El caso típico es que todos los items de una lista renderizan al tocar uno porque `renderItem` o un estilo se recrea en cada render. "Highlight updates when components render" lo muestra en vivo. Perfilá en un build de release para medir tiempos reales; en desarrollo todo es más lento.',
        },
        {
          text: 'Explicar cómo mejorar el tiempo de arranque',
          explanation:
            'El arranque tiene una parte nativa (cargar la app y React Native) y otra de JavaScript (cargar el bundle, ejecutar imports, primer render). Para la parte de JS: Hermes con bytecode precompilado, menos código ejecutado al importar (evitá inicializar SDKs pesados en el top level), carga diferida de pantallas y módulos que no se ven al inicio, y eliminar dependencias grandes que no usás. Para el primer render: mostrar algo útil rápido con datos en caché (TanStack Query persistido o MMKV síncrono) en vez de esperar la red, y mantener la splash screen solo hasta que el primer contenido está listo, no más. En nativo: Turbo Modules ya cargan bajo demanda; revisá librerías que inicializan mucho en el arranque. Medí cold start en un dispositivo Android de gama baja con un build de release, con las herramientas de Android Studio y Xcode o con métricas de producción en Sentry.',
        },
      ],
    },
    {
      id: 'nativo-testing-y-calidad',
      title: 'Código nativo, testing y accesibilidad',
      body: [
        'Escribís un módulo nativo cuando no existe una librería que cubra la API de la plataforma, cuando la que existe está abandonada o cuando necesitás performance nativa. Con Expo, el Expo Modules API permite escribirlos en Swift y Kotlin con poco boilerplate; sin Expo, Turbo Modules con Codegen. En senior te pueden preguntar cómo elegir entre una librería de la comunidad y escribir la tuya: mantenimiento, soporte de la New Architecture, actividad del repo, licencia y costo de mantener código nativo propio.',
        'Para testing: Jest con React Native Testing Library para componentes y hooks (buscar por rol y texto, como en web), mocks de módulos nativos, y E2E con Maestro o Detox para flujos críticos en simulador o dispositivo. En CI, corré lint, tipos y tests en cada pull request y E2E sobre builds de EAS o de tu pipeline antes de publicar.',
        'Accesibilidad en ambas plataformas: `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, agrupar elementos con `accessible`, áreas táctiles suficientes, soporte de tamaños de fuente grandes y probar con VoiceOver y TalkBack, porque se comportan distinto. Un design system propio con componentes accesibles por defecto ayuda a que todo el equipo lo haga bien.',
      ],
      checklist: [
        {
          text: 'Decidir entre una librería de la comunidad y un módulo propio',
          explanation:
            'Antes de elegir una librería, revisá en React Native Directory y en su repo: si soporta la New Architecture (desde 0.82 es obligatorio), cuándo fue el último release, si los issues tienen respuesta, cuántos mantenedores hay, si funciona con Expo o trae config plugin, la licencia y cuánto código nativo agrega. Una librería mantenida por Expo, Software Mansion, Callstack o la empresa del servicio suele ser la opción segura. Escribís tu propio módulo cuando no existe nada, cuando lo que existe está abandonado o hace mucho más de lo que necesitás (envolver una sola API del sistema puede ser 50 líneas de Swift y Kotlin), o cuando integrás un SDK nativo privado. El costo de un módulo propio es mantenerlo en cada upgrade de React Native, iOS y Android, y que alguien del equipo sepa Swift y Kotlin. Una opción intermedia es hacer fork o un patch con `patch-package`.',
        },
        {
          text: 'Explicar cómo escribirías un módulo nativo con Expo Modules',
          explanation:
            'Creás el módulo con `npx create-expo-module --local`, que genera la carpeta en `modules/` con la parte de Swift, la de Kotlin y la de TypeScript. En cada plataforma definís el módulo con un DSL declarativo: en Swift, `public class BatteryModule: Module { public func definition() -> ModuleDefinition { Name("Battery"); Function("getLevel") { UIDevice.current.batteryLevel } } }`, y lo equivalente en Kotlin. Ahí declarás `Function` para llamadas síncronas, `AsyncFunction` para operaciones que tardan, `Events` para mandar eventos a JS, `Constants` y hasta `View` para componentes nativos. Del lado de JS lo cargás con `requireNativeModule("Battery")` y lo exponés con tipos de TypeScript. Expo Modules se apoya en JSI y en la New Architecture, convierte tipos automáticamente y se integra con prebuild, así que no tocás el registro de módulos a mano. Necesitás un development build para probarlo, no funciona en Expo Go.',
        },
        {
          text: 'Testear un componente con React Native Testing Library',
          explanation:
            'Con Jest y el preset `jest-expo` (o el de `react-native`), renderizás el componente y lo usás como un usuario: `const user = userEvent.setup(); render(<LoginForm onSubmit={onSubmit} />); await user.type(screen.getByLabelText("Email"), "ana@mail.com"); await user.press(screen.getByRole("button", { name: "Ingresar" })); expect(onSubmit).toHaveBeenCalledWith({ email: "ana@mail.com" });`. Buscá por rol, label o texto (que dependen de las props de accesibilidad), y usá `findBy` para lo que aparece tras una promesa. Los módulos nativos no existen en Jest, así que hay que mockearlos: muchas librerías traen su mock (Reanimated, AsyncStorage) y para los propios usás `jest.mock`. Para la red, MSW funciona en React Native. Envolvé con los providers que el componente necesita (QueryClient, navegación) en un helper de render.',
        },
        {
          text: 'Elegir entre Maestro y Detox para E2E y justificarlo',
          explanation:
            'Maestro es black-box: describís flujos en YAML (`- tapOn: "Ingresar"`, `- assertVisible: "Bienvenida"`), corre contra cualquier build en simulador, emulador o dispositivo, espera automáticamente a que la UI se estabilice y no requiere tocar el código de la app; se aprende en una tarde, lo puede escribir QA y se integra con EAS Workflows. Detox es gray-box: los tests son JavaScript con Jest, se instala en la app y se sincroniza con su estado interno (espera a que no haya requests ni animaciones pendientes), lo que da tests deterministas y control fino, a cambio de una configuración más compleja y más mantenimiento en upgrades. Para la mayoría de los equipos con Expo, Maestro es la opción pragmática; Detox conviene si ya lo tienen, si necesitan mockear a nivel de app o si los tests de Maestro se vuelven inestables por la asincronía. En ambos casos, usá `testID` o labels estables y limitate a flujos críticos.',
        },
        {
          text: 'Hacer accesible un botón personalizado en iOS y Android',
          explanation:
            'Usá `Pressable` en vez de un `View` con gestos, y agregale `accessibilityRole="button"` (o `role="button"`) para que VoiceOver y TalkBack lo anuncien como botón; `accessibilityLabel` si el contenido es un ícono o el texto no alcanza ("Agregar al carrito", no "más"); `accessibilityHint` para explicar el resultado si no es obvio; y `accessibilityState={{ disabled, busy, selected }}` para que se anuncie el estado. El área táctil tiene que ser de al menos 44 por 44 puntos en iOS y 48 por 48 dp en Android; si el visual es más chico, usá `hitSlop`. El texto debe escalar con el tamaño de fuente del sistema sin cortarse (no fijes alturas ni desactives `allowFontScaling`), y el contraste tiene que alcanzar. Probalo con VoiceOver y con TalkBack de verdad, porque anuncian y agrupan distinto.',
        },
      ],
    },
    {
      id: 'publicacion-y-releases',
      title: 'Seguridad, publicación y releases',
      body: [
        'Para publicar en las dos tiendas: firma (certificados en iOS, keystore en Android), builds con EAS Build o con Xcode y Gradle, envío con EAS Submit, TestFlight y los tracks de testing de Google Play, y versionado coherente entre `version` y build numbers. Sabé las diferencias de revisión entre App Store y Google Play y los requisitos de privacidad de cada una.',
        'Las actualizaciones OTA con EAS Update (o soluciones equivalentes) reemplazan el bundle de JavaScript y los assets sin pasar por la tienda. El límite es claro: no podés cambiar código nativo, y cada update tiene que ser compatible con el binario instalado, lo que se controla con el runtime version. Para hacerlo seguro: canales por entorno, rollout gradual, monitoreo de errores tras cada update, rollback rápido y respetar las políticas de las tiendas sobre cambios de funcionalidad.',
        'En seguridad: secretos fuera del bundle (todo lo que está en JavaScript se puede leer), tokens en `expo-secure-store`, HTTPS y pinning si el riesgo lo justifica, validar deep links, y no loguear datos sensibles. Para producción, Sentry o similar con source maps, crash reporting nativo y métricas de arranque. Upgrades de React Native de varias versiones: de a una, con el Upgrade Helper o actualizando el SDK de Expo, revisando librerías incompatibles primero.',
      ],
      checklist: [
        {
          text: 'Describir el proceso de build y publicación en ambas tiendas',
          explanation:
            'iOS: necesitás una cuenta de Apple Developer, un bundle identifier, un certificado de distribución y un provisioning profile (EAS los crea y guarda por vos). Generás un `.ipa` de release con `eas build --platform ios` o desde Xcode con Archive, lo subís a App Store Connect con `eas submit` o Transporter, lo probás en TestFlight y lo enviás a revisión con capturas, descripción y la ficha de privacidad; la revisión es humana y suele tardar uno o dos días. Android: firmás con un upload keystore (Google Play App Signing guarda la clave final), generás un `.aab`, lo subís a Play Console a un track (internal, closed, open, production) y completás la sección de seguridad de datos; las cuentas personales nuevas tienen que pasar por un testing cerrado con testers antes de producción. En ambos, cada build necesita un número de build mayor al anterior (`buildNumber` y `versionCode`, que EAS puede autoincrementar) y un `version` visible coherente.',
        },
        {
          text: 'Explicar qué puede y qué no puede cambiar una actualización OTA',
          explanation:
            'Una actualización OTA (con EAS Update u otra solución) descarga un nuevo bundle de JavaScript y assets que la app carga en lugar del que venía en el binario, normalmente en el próximo arranque. Puede cambiar todo lo que es JavaScript: lógica, pantallas, estilos, textos, imágenes y fixes de bugs en tu código. No puede cambiar nada nativo: agregar o actualizar una librería con código nativo, cambiar permisos, el ícono, la splash nativa, el `Info.plist` o el `AndroidManifest.xml`, ni la versión de React Native o del SDK de Expo; eso requiere un build nuevo y pasar por la tienda. Además, las tiendas permiten OTA para fixes y mejoras, no para cambiar el propósito de la app ni saltear la revisión. Error común: publicar un update que usa un módulo nativo que el binario instalado no tiene, lo que crashea al arrancar; eso es lo que previene el runtime version.',
        },
        {
          text: 'Explicar qué es el runtime version y por qué importa',
          explanation:
            'El runtime version es un identificador de la capa nativa de un binario: dos builds con el mismo runtime version tienen el mismo código nativo y, por lo tanto, pueden correr el mismo bundle de JavaScript. Cada update OTA se publica para un runtime version, y la app solo descarga updates de su mismo runtime, así un update que depende de un módulo nativo nuevo no llega a binarios viejos que no lo tienen. En Expo lo configurás con una política: `appVersion` (usa el `version` de la app, y tenés que acordarte de subirla cuando cambia lo nativo) o `fingerprint` (calcula un hash de todo lo nativo y cambia solo cuando hace falta, lo más seguro). Si te equivocás y dos binarios con nativo distinto comparten runtime, un update puede crashear la app; si lo cambiás de más, los usuarios con binarios viejos dejan de recibir fixes.',
        },
        {
          text: 'Diseñar una estrategia de releases con canales, rollout y rollback',
          explanation:
            'Separá entornos con canales: los builds de preview apuntan al canal `preview` y los de tienda a `production`, y en EAS Update cada canal sigue una rama de updates, así probás el mismo update en preview antes de promoverlo. Para binarios: TestFlight y el track interno de Play para QA, después rollout por etapas en las tiendas (phased release de 7 días en iOS, porcentaje en Google Play) que podés pausar. Para OTA: publicá con rollout gradual (por ejemplo 10%, luego 50% y 100%) mirando crash rate y errores en Sentry filtrados por id de update en cada paso. Rollback: en OTA, volvés a publicar el update anterior o hacés rollback al bundle embebido en el binario, que llega en el próximo arranque; en binarios no hay rollback real, solo pausar el rollout y subir una versión nueva con el fix, por eso es clave poder apagar features con feature flags. Definí de antemano qué métrica dispara un rollback.',
        },
        {
          text: 'Explicar por qué un secreto en el bundle no es un secreto',
          explanation:
            'El bundle de JavaScript viaja dentro del `.ipa` o el `.apk`, que cualquiera puede descargar y descomprimir; aunque Hermes lo compile a bytecode, los strings quedan legibles con herramientas como `strings` o un decompilador, y además se puede interceptar el tráfico con un proxy. Variables como `EXPO_PUBLIC_*` se insertan en el bundle a propósito: son configuración pública, no secretos. Por eso una API key de un servicio con costo, una clave de un proveedor de pagos o credenciales de base de datos nunca van en la app: la app llama a tu backend, que tiene el secreto y aplica autenticación, autorización y rate limiting. Las keys que sí van en el cliente (Maps, Firebase, Sentry DSN) se protegen restringiéndolas por bundle id o firma de la app y con límites de uso. Ofuscar solo retrasa al atacante.',
        },
        {
          text: 'Planificar un upgrade de varias versiones de React Native',
          explanation:
            'Primero el inventario: listá las dependencias nativas, revisá en React Native Directory si soportan la versión destino y la New Architecture, y anotá cuáles hay que actualizar o reemplazar. Subí de a una versión menor (0.80 a 0.81, después a 0.82), leyendo el changelog y los breaking changes de cada una, en una rama aparte. Con Expo, actualizás de a un SDK con `npx expo install expo@^XX --fix`, corrés `npx expo-doctor` y regenerás el nativo con prebuild, lo que evita la parte más dolorosa. Sin Expo, usás el React Native Upgrade Helper para ver el diff de los archivos nativos y aplicarlo a mano. En cada paso: compilá en iOS y Android, corré tests y E2E, probá los flujos críticos en dispositivos reales y revisá warnings. Publicá como un release normal con rollout gradual, y recordá que cambia el runtime version, así que es un binario nuevo. Para no volver a quedar atrás, actualizá cada pocos meses.',
        },
      ],
    },
    {
      id: 'ejercicios-practicos',
      title: 'Live coding, take-home y system design',
      body: [
        'El live coding típico es una pantalla con una lista que consume una API, con loading, error, pull to refresh y paginación infinita, y quizás una pantalla de detalle. Practicalo con un timer de 45 minutos sobre un proyecto de Expo ya creado. Prioridad: que funcione, después estados de error y vacío, después performance de la lista.',
        'En un take-home se evalúan estructura clara, TypeScript bien usado, separación entre UI y datos, manejo de errores, algunos tests, que funcione en iOS y Android, y un README con cómo correrlo, decisiones y mejoras pendientes. Mostrá que lo probaste en las dos plataformas.',
        'El diseño de sistemas (senior) puede ser una app offline-first, un chat, un feed o compartir código entre mobile y web en un monorepo. Cubrí requisitos, estructura de paquetes, estado y caché, sincronización, navegación y deep links, performance, releases con OTA y binarios, observabilidad y cuándo bajarías a código nativo. Mencioná los trade-offs de React Native frente a nativo para ese caso.',
      ],
      checklist: [
        {
          text: 'Resolver una lista con paginación infinita y pull to refresh en 45 minutos',
          explanation:
            'Con TanStack Query: `useInfiniteQuery({ queryKey: ["posts"], queryFn: ({ pageParam }) => fetchPosts(pageParam), initialPageParam: 1, getNextPageParam: (last) => last.nextPage ?? undefined })`, y aplanás con `data.pages.flatMap(p => p.items)`. En la `FlatList`: `onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}` con `onEndReachedThreshold={0.5}`, `refreshing={isRefetching}` y `onRefresh={refetch}` para el pull to refresh, `ListFooterComponent` con un `ActivityIndicator` mientras carga la siguiente página, y `ListEmptyComponent` para el estado vacío. Manejá el error inicial con un botón de reintentar y el error de página sin perder lo cargado. El chequeo de `isFetchingNextPage` evita pedir dos veces la misma página, porque `onEndReached` puede dispararse varias veces. Practicalo con una API pública sobre un proyecto de Expo ya creado.',
        },
        {
          text: 'Tener un take-home de ejemplo probado en iOS y Android',
          explanation:
            'Hacé uno antes de que te lo pidan: por ejemplo, un listado de una API pública con búsqueda, detalle, favoritos persistidos localmente y estados de loading, vacío y error, en 4 a 6 horas. Usá Expo con TypeScript estricto, Expo Router, TanStack Query, una estructura por features con la UI separada de los datos, y tres o cuatro tests con React Native Testing Library. Probalo en un simulador de iOS y un emulador de Android, y si podés en un dispositivo real: teclado, safe areas, botón atrás y sombras son los lugares donde aparecen las diferencias. El README tiene que tener cómo correrlo, decisiones y trade-offs, qué no hiciste y capturas o un video de ambas plataformas. Commits chicos y claros, porque los miran.',
        },
        {
          text: 'Diseñar un monorepo que comparta lógica entre mobile y web',
          explanation:
            'Con pnpm workspaces (o Bun, o Yarn) y Turborepo para orquestar tareas y caché, la estructura típica es `apps/mobile` (Expo), `apps/web` (Next.js) y paquetes compartidos: `packages/api` con el cliente HTTP, los tipos y los schemas de Zod; `packages/core` con lógica de negocio pura y hooks de datos como los de TanStack Query; y opcionalmente `packages/ui`. Compartir lógica, tipos y validaciones es casi gratis y da mucho valor. Compartir UI es más caro: se puede con React Native Web, Expo Router para web o librerías como Tamagui, pero mobile y web tienen patrones de interacción distintos, así que muchas veces conviene compartir solo tokens de diseño y lógica. Metro soporta monorepos sin configuración extra en versiones recientes de Expo; cuidá que haya una sola copia de `react` y `react-native` y que los paquetes no importen nada específico de una plataforma.',
        },
        {
          text: 'Argumentar React Native frente a nativo para un producto concreto',
          explanation:
            'Estructurá la respuesta por criterios, no por gusto: equipo (si ya saben React y TypeScript, React Native acelera; si hay equipos iOS y Android fuertes, nativo puede ser natural), alcance (una sola base para dos plataformas y quizás web), velocidad de iteración (OTA para fixes sin esperar a la tienda), y requisitos técnicos. React Native es una gran elección para apps de producto como e-commerce, fintech, delivery o redes sociales: Shopify, Discord y Microsoft lo usan en producción. Nativo tiene ventaja cuando la app depende de APIs muy nuevas o profundas de la plataforma desde el día uno, procesamiento intensivo de video, audio o gráficos, o widgets y extensiones que son la mayor parte del producto. Una postura senior es mencionar el camino intermedio: React Native con módulos nativos donde hace falta, o integración brownfield en una app nativa existente.',
        },
        {
          text: 'Hablar en voz alta mientras resolvés un ejercicio',
          explanation:
            'El entrevistador evalúa tu razonamiento, y solo lo ve si lo decís. Repetí el problema con tus palabras, contá el plan en una frase ("primero la lista con datos, después paginación, después pull to refresh") y mientras escribís explicá el por qué de cada decisión, no lo que tipeás ("uso `FlatList` y no `ScrollView` porque la lista puede crecer"). Si algo nativo no responde o Metro se cuelga, narrá cómo lo diagnosticás en vez de quedarte callado. Cuando no recordás una API, decilo y asumí algo razonable. Practicalo grabándote o con alguien que haga de entrevistador hasta que te salga natural; el error contrario es hablar sin parar de cosas irrelevantes.',
        },
      ],
    },
    {
      id: 'el-dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta y hacé preguntas antes de codear: si usan Expo, qué plataformas importan más, qué pasa con errores y sin conexión. Contá tu plan en una frase y después ejecutalo. Si no sabés algo, decilo, razoná a partir de lo que sabés y explicá cómo lo averiguarías; en React Native es normal no conocer cada detalle nativo, lo que importa es saber dónde buscar.',
        'Para preguntas de comportamiento usá STAR: situación, tarea, acción y resultado. Prepará historias reales sobre un bug que pasaba solo en una plataforma, un upgrade complicado, un desacuerdo técnico, una entrega que salió mal y alguien a quien ayudaste. Contalas en primera persona y con resultados concretos.',
        'Llevá preguntas para la empresa: si usan Expo y la New Architecture, cada cuánto actualizan React Native, cómo manejan OTA y releases, cuánto código nativo mantienen y cómo testean. Antes de entrar, tené un proyecto de Expo que arranque, simulador y emulador abiertos o un dispositivo con la app de desarrollo, y revisá cámara y conexión.',
      ],
      checklist: [
        {
          text: 'Hacer al menos dos preguntas de aclaración antes de codear',
          explanation:
            'Los enunciados son ambiguos a propósito: quieren ver si definís el alcance antes de escribir. Tené preguntas útiles para mobile: qué forma tienen los datos y si hay paginación, qué pasa sin conexión o si la API falla, si importan ambas plataformas o una más que la otra, si puedo usar librerías como TanStack Query o Expo Router, y qué es prioritario si no llego con todo. Ejemplo ante "hacé un listado de contactos": "¿son cientos o miles?" (cambia la estrategia de lista) y "¿se edita offline?". Después resumí lo acordado en una frase. Evitá preguntas que se responden leyendo el enunciado; dos o tres bien elegidas alcanzan.',
        },
        {
          text: 'Tener cuatro o cinco historias preparadas en formato STAR',
          explanation:
            'STAR es Situación (contexto breve), Tarea (qué te tocaba), Acción (qué hiciste vos, la parte más larga) y Resultado (qué pasó, con números si se puede, y qué aprendiste). Escribí cinco historias que cubran: un bug que pasaba solo en una plataforma o un dispositivo, un upgrade o una migración difícil, un desacuerdo técnico, un release que salió mal y cómo lo resolviste, y una vez que ayudaste a alguien. Ejemplo de resultado: "el crash en Android 14 bajó de 2% a 0,1% de sesiones después del hotfix por OTA". Contalas en primera persona, en unos dos minutos cada una. Si sos junior, valen historias de proyectos propios o de la facultad.',
        },
        {
          text: 'Saber cómo responder cuando no conocés un detalle nativo',
          explanation:
            'En React Native es normal no saber cada API de iOS y Android; lo que evalúan es cómo te movés. Decilo con honestidad y mostrá el camino: "No lo implementé, pero buscaría si hay un módulo en el SDK de Expo o en React Native Directory; si no, lo escribiría con Expo Modules envolviendo la API de cada plataforma, y miraría la documentación de Apple y Android para los permisos". Razoná desde lo que sabés: si te preguntan por algo en background, podés decir que iOS es más restrictivo y que habría que ver qué modos permite. Nunca inventes nombres de APIs con seguridad: el entrevistador lo nota y resta mucho más que un "no lo sé".',
        },
        {
          text: 'Tener tres preguntas propias para la empresa',
          explanation:
            'Preparalas según quién te entrevista. Para el equipo técnico, preguntas que muestran que conocés el ecosistema: "¿están en la New Architecture y en qué versión de React Native?", "¿cada cuánto actualizan y quién se encarga?", "¿cómo manejan releases y OTA, y cuánto código nativo propio mantienen?", "¿cómo testean, tienen E2E?". Para el tech lead: "¿qué esperarían de mí en los primeros tres meses?". Las respuestas te dicen mucho: una app que lleva años sin actualizar React Native implica trabajo de mantenimiento pesado. Evitá preguntas que están en la web o que corresponden a recruiting, y anotá las respuestas para comparar ofertas.',
        },
        {
          text: 'Dejar listo un proyecto que arranque en simulador y emulador',
          explanation:
            'El día anterior creá un proyecto con `npx create-expo-app@latest`, instalá las librerías que probablemente uses (TanStack Query, por ejemplo), corré `npx expo start` y verificá que abre en el simulador de iOS (requiere Mac con Xcode) y en un emulador de Android con Android Studio, o en tu teléfono con Expo Go o un development build. Dejá abiertos simulador y emulador antes de la llamada, porque arrancarlos tarda. Revisá que Metro no tenga caché vieja (`npx expo start -c`), que el editor tenga la fuente grande para compartir pantalla y que sepas recargar y abrir el menú de desarrollo. Probá cámara, micrófono, compartir pantalla y la conexión, y tené un plan B como un snack en Expo Snack si tu entorno falla.',
        },
      ],
    },
  ],
};
