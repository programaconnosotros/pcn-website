# PCN OS y rendimiento

Cómo está diseñado PCN OS (el escritorio que ve el sitio en pantallas grandes), cómo carga, sus
tres modos de visualización y las optimizaciones de rendimiento del primer paint de la home. La
misma información, resumida y con fragmentos del código, está en `/desarrollo` (notas
"PCN OS", "Rendimiento · primer paint" y "PWA · pull to refresh").

## Tabla de contenidos

1. [Qué es PCN OS](#qué-es-pcn-os)
2. [Arquitectura](#arquitectura)
3. [Cómo decide qué mostrar sin parpadeos](#cómo-decide-qué-mostrar-sin-parpadeos)
4. [Carga diferida del escritorio](#carga-diferida-del-escritorio)
5. [Modos: completo, liviano y clásico](#modos-completo-liviano-y-clásico)
6. [Rendimiento de la home](#rendimiento-de-la-home)
7. [Pull to refresh en la PWA](#pull-to-refresh-en-la-pwa)
8. [Cómo medimos y probamos](#cómo-medimos-y-probamos)
9. [Lecciones](#lecciones)
10. [Archivos](#archivos)

---

## Qué es PCN OS

En pantallas de 1024px o más, el sitio no se muestra como una web con sidebar sino como un
sistema operativo: una barra de menú arriba, un dock abajo, widgets en el fondo de pantalla y
ventanas que se mueven, se redimensionan, se minimizan y se maximizan. Cada sección del sitio es
un "programa" del dock.

En pantallas más chicas (tablets y celulares) el sitio es el layout clásico: sidebar (o la barra
inferior en mobile) más la página.

## Arquitectura

### Cada ventana es un iframe de una página real

La decisión central: una ventana no renderiza componentes de la página, sino un `<iframe>` que
carga la URL real (`/eventos`, `/perfil/abc`…). Eso da gratis:

- Scroll, diálogos y estado propios por ventana.
- Diseño responsive al tamaño de la ventana: una ventana angosta ve el diseño de una pantalla
  angosta.
- Cero código duplicado: la página es la misma que en mobile o en el layout clásico.

El costo: **cada ventana es una copia entera de la app** (React, Next.js, layout, providers).
Es lo más caro de PCN OS y la razón de ser del modo liviano.

### Host y ventanas

El mismo layout (`src/app/(platform)/layout.tsx`) corre en dos roles:

- **Host** (el documento de arriba): renderiza el escritorio (`PcnOs`) y esconde el layout
  clásico.
- **Ventana** (un documento dentro de un iframe): renderiza solo el layout clásico, sin sidebar
  ni barra inferior, y nunca un escritorio anidado.

Un script inline en el `<head>` marca `data-embedded` en `<html>` cuando el documento está dentro
de un iframe. Corre antes del primer paint, así que el CSS ya sabe qué rol tiene la página.

### Comunicación por `postMessage`

Host y ventanas son del mismo origen y se hablan con mensajes tipados (`OsMessage` en
`os-env.ts`), todos con `source: 'pcn-os'`:

| Mensaje     | De → a         | Para qué                                                   |
| ----------- | -------------- | ---------------------------------------------------------- |
| `location`  | ventana → host | La ventana navegó: actualizar título y ruta en la barra.   |
| `focus`     | ventana → host | Se tocó la ventana: traerla al frente.                     |
| `open`      | ventana → host | "Abrir en nueva ventana" desde el menú del click derecho.  |
| `search`    | ventana → host | ⌘K dentro de una ventana abre el buscador del escritorio.  |
| `playMusic` | ventana → host | La música sigue sonando aunque se cierre la ventana.       |
| `cursor`    | ventana → host | El cursor hacker se dibuja una sola vez, en el escritorio. |

`OsBridge` corre en cada ventana y manda esos mensajes. Los links navegan la ventana en la que se
hace click, como una pestaña del navegador. El click derecho sobre un link del sitio reemplaza el
menú del navegador por uno propio: abrir en una ventana nueva del escritorio, en una pestaña nueva
o copiar el enlace (con Shift + click derecho sigue apareciendo el del navegador).

### Estado del escritorio

`PcnOs` guarda las ventanas en un `useReducer` (`open`, `focus`, `close`, `minimize`,
`toggleMaximize`, `rect`, `location`, `fit`…). El orden de apilado es un array de ids de atrás
hacia adelante. Cada ventana guarda dos URLs: `src` (con la que se creó el iframe, que nunca
cambia para no recargarlo) y `path` (dónde está ahora, según `location`).

Las ventanas se mueven arrastrando la barra de título (doble clic maximiza o restaura) y se
redimensionan desde los cuatro bordes y las cuatro esquinas, con un tamaño mínimo y siempre
dentro del escritorio. Mientras dura el arrastre, `OsWindow` escribe la posición directo en el
DOM una vez por frame (`requestAnimationFrame`; al mover usa `translate`, sin layout) y un
escudo transparente tapa los iframes para que no se traguen el puntero. Recién al soltar manda
el rect final al reducer, así ni el escritorio ni las otras ventanas se re-renderizan en cada
movimiento.

**Dividir el escritorio:** al arrastrar una ventana contra el borde izquierdo o derecho de la
pantalla aparece un recuadro con la mitad que va a ocupar, y al soltarla se acomoda ahí (contra la
barra de menú, se maximiza). Si del otro lado ya hay una ventana acoplada, la nueva ocupa lo que
esa deja libre. Dos ventanas acopladas una al lado de la otra comparten una línea vertical que se
arrastra (o se mueve con las flechas) para redimensionar las dos a la vez. La geometría está en
`os-snap.ts`; mover o redimensionar una ventana a mano la desacopla.

La sesión del escritorio se guarda en `sessionStorage` (`os-session.ts`) cada vez que cambia el
estado: qué ventanas hay, en qué página está cada una, su rect, si está minimizada o maximizada y
el orden de apilado. Al recargar la pestaña vuelven todas donde estaban (escaladas y ajustadas si
la pantalla cambió de tamaño), y la que muestra la URL de la barra de direcciones queda al frente;
si ninguna la muestra, se abre una ventana nueva para esa URL encima del resto. Las entradas
inválidas se descartan (solo rutas del propio sitio, como mucho 12 ventanas). Una pestaña nueva o
un link compartido arrancan con el escritorio de siempre. En liviano, las ventanas restauradas
que no están entre las 3 más recientes vuelven en pausa, sin cargar su página.

## Cómo decide qué mostrar sin parpadeos

El servidor no sabe el tamaño de la pantalla, y decidir en JavaScript después de hidratar
mostraría primero un layout y después el otro. Por eso la decisión es CSS:

- Variant de Tailwind `os:` = `@media (min-width: 1024px)` + `html` sin `data-embedded` ni
  `data-os-mode="classic"`.
- El escritorio se renderiza con `hidden os:block` y el layout clásico con `os:hidden`.

El servidor manda los dos y el CSS muestra el que corresponde desde el primer frame. Después de
hidratar, `useOsMode()` (un `useSyncExternalStore` sobre el media query y el modo) desmonta del
todo el árbol que no se ve (`OsGate`), para no correr sus efectos dos veces.

## Carga diferida del escritorio

Antes, `PcnOs` y todo lo que usa (dock, ventanas, widgets, launcher, reproductor de música y
framer-motion) estaban en el bundle de todas las páginas, también en celulares que nunca lo
muestran, y en cada ventana del escritorio.

Ahora se parte en dos:

- **Lo que se ve en el primer paint** queda en `pcn-os.tsx` y se renderiza en el servidor: el
  fondo de pantalla, la barra de menú y el estado. Nunca se desmonta.
- **El resto** vive en `os-desktop-parts.ts` y se importa con `import()` solo cuando la página es
  el host de un escritorio. En celulares, tablets y ventanas no se pide nunca.

```ts
let desktopParts: Promise<OsDesktopParts> | null = null;
const loadDesktopParts = () => (desktopParts ??= import('./os-desktop-parts'));

// En un escritorio, la descarga arranca apenas corre el módulo, antes de hidratar.
if (typeof window !== 'undefined' && isOsHost()) void loadDesktopParts();
```

**Por qué no hay flicker:** el primer paint (fondo y barra) es el mismo de antes y no se
reemplaza. Lo que espera al chunk es exactamente lo que antes esperaba a la hidratación (dock,
widgets, ventanas), así que la secuencia que ve la persona es igual. Lo verificamos grabando la
carga cuadro a cuadro con CPU ×4 y red lenta, antes y después: la barra aparece en el primer
cuadro y no desaparece nunca, y el dock aparece al mismo tiempo o antes.

`dockReservedHeight` se movió a `os-dock-geometry.ts` porque el escritorio lo necesita para
calcular el tamaño de las ventanas antes de que el dock haya cargado.

Resultado medido en producción (JS comprimido de la página principal): `/` en mobile 539 → 526
KB y `/eventos` en mobile 328 → 310 KB. Es poco porque framer-motion sigue llegando a mobile por
otros componentes (el botón flotante de scroll); el próximo paso sería pasarlos a CSS.

## Modos: completo, liviano y clásico

Para computadoras con pocos recursos, las pantallas grandes tienen tres modos
(`os-display-mode.ts`):

| Modo      | Qué es                                                                    |
| --------- | ------------------------------------------------------------------------- |
| `full`    | PCN OS con todos los efectos.                                             |
| `lite`    | PCN OS liviano: sin lo caro (ver abajo).                                  |
| `classic` | Sin escritorio: el layout de sidebar + página. Una sola app, sin iframes. |

### Qué apaga el modo liviano

Ordenado por lo que más cuesta en una compu débil:

- **Ventanas vivas limitadas:** solo las 3 ventanas visibles más recientes tienen su página
  cargada. Las demás quedan "en pausa" (se desmonta el iframe) y se recargan donde estaban
  (`path`, no `src`) cuando vuelven al frente. Al entrar a `/` se abre solo el inicio, sin el
  feed al lado.
- **Desenfoques:** `backdrop-filter` apagado en el escritorio y en las ventanas (se recalcula
  cada vez que algo se mueve detrás), y sin el brillo de 900px con `blur(180px)` del fondo.
- **Trabajo continuo:** sin widgets del escritorio (procesos, fotos) y sin cursor hacker, que
  corre en cada frame y hace que cada ventana mande un mensaje por cada movimiento del mouse.
- **Animaciones:** el dock sin magnificación ni spotlight, y las ventanas sin animaciones de
  abrir/cerrar/minimizar ni sombras grandes.

### Cómo se elige el modo

1. **Antes del primer paint**, un script inline (`OS_MODE_SCRIPT`, junto al de `data-embedded`)
   decide y marca `data-os-mode` en `<html>`:
   - Si la persona eligió un modo (`localStorage['pcn-os-mode']`), se usa ese.
   - Si no, si una medición anterior dio lento (`pcn-os-auto-mode`), liviano.
   - Si no, liviano con 4 núcleos o menos, 4 GB de memoria o menos, o ahorro de datos; completo
     en otro caso. En este caso también marca `data-os-mode-auto`.
2. **Medición en vivo** (`OsPerformanceNotice`): si nadie eligió un modo, unos segundos después
   de cargar el escritorio se miden los frames con `requestAnimationFrame` durante 5 segundos.
   Si más del 20% tarda más de 50 ms (menos de 20 fps), un escritorio completo pasa a liviano, y
   uno liviano sugiere el clásico. Contar frames largos en vez de fps evita falsos positivos en
   pantallas o modos de ahorro que limitan a 30 fps. Si la pestaña se oculta, la medición se
   descarta.
3. **Elección manual:** menú PCN_OS → "Modo de PCN OS", el aviso, y en el clásico el botón
   "Volver a PCN OS" del sidebar. La elección se guarda y desde ahí no se mide ni se sugiere
   nada más.

Cuando el modo liviano se eligió automáticamente, un aviso le dice a la persona que **no está
viendo la experiencia completa de PCN OS por los recursos de su compu**, con botones para pasar a
la completa o a la clásica.

### Detalles de implementación

- **Variants:** `lite:` para estilos del modo liviano y `os:` excluye `classic`, así el CSS
  muestra el layout correcto desde el primer frame también en modo clásico.
- **Ventanas sincronizadas:** las ventanas son del mismo origen, así que un cambio de modo en el
  host les llega por el evento `storage` y re-aplican el atributo.
- **Script y hooks en archivos separados:** el layout raíz (server component) importa
  `OS_MODE_SCRIPT` de `os-display-mode-script.ts`, que no es `'use client'`. Una constante
  exportada desde un archivo `'use client'` llega a un server component como referencia de
  cliente, no como el string.
- **Sidebar en clásico:** quien viene de PCN OS nunca abrió el sidebar, así que su cookie dice
  "cerrado". Al pasar a clásico se deja un pedido en `sessionStorage` y el sidebar se abre al
  montar.

## Rendimiento de la home

La home es la primera página que ve la gente. Antes, varias cosas retrasaban el primer paint
útil:

| Problema                                                                                      | Arreglo                                                                                                         |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| El hero y cada sección arrancaban en `opacity: 0` hasta que framer-motion hidrataba.          | Animaciones CSS (`tailwindcss-animate`) que corren en el primer paint. El título no hace fade, solo se desliza. |
| Los números del hero (500+, 50+…) se renderizaban vacíos en el servidor.                      | Contador solo con CSS (ver abajo): el número está en el HTML.                                                   |
| `home-client-side.tsx` era `'use client'`: todas las secciones estáticas se mandaban como JS. | Pasó a server component (`home-sections.tsx`). Solo hidratan las hojas interactivas.                            |
| Todas las secciones se maquetaban y pintaban al cargar, aunque estén muy abajo.               | `content-visibility: auto` con `contain-intrinsic-size`.                                                        |
| La foto del hero es de 3024px y 2.7 MB.                                                       | Se sirve con `quality={40}` (se ve al 22% de opacidad bajo dos gradientes).                                     |

### Apariciones al scrollear sin JavaScript

`Reveal` era un `motion.div` con `whileInView`. Ahora es un `div` con una animación CSS ligada
al scroll (`animation-timeline: view()`). Donde no está soportado, el contenido simplemente está:

```css
.reveal {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: reveal-in linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
}
```

### Contador que sube, solo con CSS

Una custom property registrada con `@property` como `<integer>` se puede animar; un contador de
CSS la imprime en un `::after`. El valor real va además en un `sr-only` para lectores de pantalla.
Sin soporte de `@property`, se ve el número final.

```css
@property --count {
  syntax: '<integer>';
  initial-value: 0;
  inherits: false;
}
.count-up {
  --count: var(--count-to);
  counter-reset: count var(--count);
  animation: count-up 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
}
.count-up::after {
  content: counter(count);
}
@keyframes count-up {
  from {
    --count: 0;
  }
}
```

### Trampas que encontramos

- **Constantes de archivos `'use client'`:** `WHATSAPP_GROUP_URL` vivía en `home-hero.tsx`
  (cliente) y se importaba desde server components. Se movió a `src/data/whatsapp-group.ts`.
- **`images.qualities` en Next 16:** solo se aceptan las calidades declaradas en
  `next.config.mjs` (por defecto `[75]`). `quality={40}` sin declararlo terminaba en un error
  de React en la home ("Cannot update a component (Router) while rendering…"). Se agregó
  `qualities: [40, 75]`. Lo encontramos bisecando qué cambio lo causaba.

## Pull to refresh en la PWA

Instalada, la app no tiene el gesto de recargar del navegador. `PullToRefresh` (montado en el
layout de `(platform)`) lo agrega solo en modo standalone y con puntero táctil:

- Se activa si el toque empieza arriba de todo (`scrollY === 0`), no hay un diálogo abierto y no
  está dentro de algo que scrollea por su cuenta.
- Solo toma arrastres claramente verticales hacia abajo, con resistencia (el indicador se mueve
  la mitad que el dedo) y `preventDefault` para que iOS no haga rebote.
- Al soltar pasado el umbral, `router.refresh()` vuelve a renderizar los server components de la
  página sin perder el scroll ni el estado del cliente, y `invalidateQueries()` refresca React
  Query. Todo dentro de `startTransition` para que `isPending` sostenga el spinner hasta que
  llegan los datos.
- Las páginas con contenido que vive en el repo (`/cursos`, `/videos`, `/podcast`…) quedan
  afuera en una lista explícita. Las páginas nuevas tienen pull to refresh por defecto.

## Cómo medimos y probamos

- **Bytes de JS:** build de producción y Playwright sumando `encodedDataLength` de las respuestas
  de tipo `Script` por CDP, antes y después de cada cambio. En dev los números no sirven (sin
  minificar, con source maps).
- **Flicker:** `Page.startScreencast` por CDP con CPU ×4 y red lenta, guardando cada cuadro con
  su tiempo, y un script en Python que verifica que la barra de menú, una vez visible, no
  desaparezca nunca, y en qué momento aparece el dock.
- **Modos:** Playwright con `navigator.hardwareConcurrency` sobrescrito por `addInitScript`
  (corre antes que el script del `<head>`), recorriendo completo → liviano automático → aviso →
  ventanas en pausa → reanudar → cambio de modo con ventanas abiertas → clásico → volver, en dev
  y en producción.
- **Medición en vivo:** se simuló una compu que traba con 70 ms de trabajo bloqueante en cada
  frame. Una compu fluida nunca disparó el aviso.

## Lecciones

1. **Decidir el layout en CSS antes del primer paint**, con atributos que pone un script inline
   en el `<head>`. Decidir en JavaScript después de hidratar siempre parpadea.
2. **Al cargar algo diferido, no reemplazar lo que ya se pintó.** Dejar montado lo del primer
   paint y sumar lo nuevo al lado.
3. **No esconder contenido hasta que hidrate.** Una animación de entrada con `opacity: 0` en JS
   retrasa el LCP todo lo que tarde el bundle.
4. **Medir en producción y comparar contra la versión anterior.** La optimización del OS dio
   menos de lo esperado; mejor saberlo con números.
5. **Bisecar ante errores raros.** El warning del Router venía de un `quality` de imagen.

## Archivos

| Archivo                                       | Qué tiene                                        |
| --------------------------------------------- | ------------------------------------------------ |
| `src/components/os/pcn-os.tsx`                | Escritorio: estado, ventanas, carga diferida.    |
| `src/components/os/os-desktop-parts.ts`       | Lo que se carga diferido.                        |
| `src/components/os/os-env.ts`                 | Mensajes, `isOsHost`, script de `data-embedded`. |
| `src/components/os/os-bridge.tsx`             | Lado ventana de la comunicación.                 |
| `src/components/os/os-gate.tsx`               | Desmonta el layout clásico en el escritorio.     |
| `src/components/os/os-display-mode.ts`        | Modos: lectura, cambio y hooks.                  |
| `src/components/os/os-display-mode-script.ts` | Script inline que elige el modo antes del paint. |
| `src/components/os/os-performance-notice.tsx` | Aviso del modo liviano y medición de frames.     |
| `src/components/os/os-classic-return.tsx`     | "Volver a PCN OS" en el layout clásico.          |
| `src/components/os/os-window.tsx`             | Ventana: drag, resize, iframe, pausa.            |
| `src/components/os/os-dock.tsx`               | Dock con magnificación.                          |
| `src/app/globals.css`                         | Variants `os:`, `embedded:` y `lite:`.           |
| `src/app/(platform)/home-sections.tsx`        | Home como server component.                      |
| `src/components/home/home-hero.tsx`           | Hero con animaciones CSS y `CountUp`.            |
| `src/components/home/reveal.tsx`              | Apariciones al scrollear en CSS.                 |
| `src/components/pull-to-refresh.tsx`          | Pull to refresh de la PWA.                       |
