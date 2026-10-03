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
        'Saber qué etapas tiene el proceso y si usan Expo',
        'Tener una app propia que puedas explicar, idealmente publicada',
        'Identificar los temas de tu seniority que te cuestan más',
        'Poder contar en dos minutos tu experiencia y qué rol buscás',
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
        'Explicar qué dispara un re-render y cómo evitar los innecesarios',
        'Explicar las diferencias entre React Native y React web',
        'Explicar por qué React Native no es un WebView',
        'Maquetar una pantalla con Flexbox recordando los defaults de React Native',
        'Tipar los parámetros de las rutas de la navegación',
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
        'Explicar qué aporta Expo y cuándo pasar de Expo Go a un development build',
        'Explicar qué son los config plugins y el prebuild',
        'Explicar JSI, Turbo Modules, Fabric y Codegen en una frase cada uno',
        'Explicar qué hilos existen y qué pasa si se bloquea el de JavaScript',
        'Explicar qué es Hermes y por qué mejora el arranque',
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
        'Armar un flujo con stack, tabs y un modal',
        'Implementar rutas protegidas por autenticación',
        'Configurar y probar un deep link que abra una pantalla con parámetros',
        'Escribir código distinto por plataforma de tres formas',
        'Enumerar diferencias de comportamiento entre iOS y Android',
        'Explicar el flujo de una push notification de punta a punta',
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
        'Clasificar el estado de una app en servidor y cliente y elegir herramientas',
        'Explicar qué resuelve TanStack Query frente a un fetch en `useEffect`',
        'Elegir dónde guardar preferencias, tokens y datos estructurados',
        'Explicar por qué no guardar un token en AsyncStorage',
        'Esbozar una arquitectura offline-first con cola de cambios',
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
        'Explicar por qué `FlatList` y no `ScrollView` con `map`',
        'Optimizar una `FlatList` que se traba con al menos cuatro técnicas',
        'Explicar por qué Reanimated anima fluido aunque el hilo de JS esté ocupado',
        'Detectar re-renders innecesarios con el Profiler',
        'Explicar cómo mejorar el tiempo de arranque',
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
        'Decidir entre una librería de la comunidad y un módulo propio',
        'Explicar cómo escribirías un módulo nativo con Expo Modules',
        'Testear un componente con React Native Testing Library',
        'Elegir entre Maestro y Detox para E2E y justificarlo',
        'Hacer accesible un botón personalizado en iOS y Android',
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
        'Describir el proceso de build y publicación en ambas tiendas',
        'Explicar qué puede y qué no puede cambiar una actualización OTA',
        'Explicar qué es el runtime version y por qué importa',
        'Diseñar una estrategia de releases con canales, rollout y rollback',
        'Explicar por qué un secreto en el bundle no es un secreto',
        'Planificar un upgrade de varias versiones de React Native',
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
        'Resolver una lista con paginación infinita y pull to refresh en 45 minutos',
        'Tener un take-home de ejemplo probado en iOS y Android',
        'Diseñar un monorepo que comparta lógica entre mobile y web',
        'Argumentar React Native frente a nativo para un producto concreto',
        'Hablar en voz alta mientras resolvés un ejercicio',
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
        'Hacer al menos dos preguntas de aclaración antes de codear',
        'Tener cuatro o cinco historias preparadas en formato STAR',
        'Saber cómo responder cuando no conocés un detalle nativo',
        'Tener tres preguntas propias para la empresa',
        'Dejar listo un proyecto que arranque en simulador y emulador',
      ],
    },
  ],
};
