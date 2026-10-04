// Content of /desarrollo/diseno: how the site's look was found, the principles behind it and the
// foundations every component builds on. The live component examples live in
// src/components/desarrollo/diseno/component-gallery.tsx.

export type Milestone = {
  date: string;
  title: string;
  detail: string;
  /** Short SHAs of the commits that tell this part of the story. */
  commits: string[];
};

// Dates and commits come from `git log` on main; each milestone links to its commits on GitHub.
export const milestones: Milestone[] = [
  {
    date: '2024-06-22',
    title: 'Un Next.js más',
    detail:
      'El sitio arranca como cualquier proyecto: shadcn/ui con sus defaults y Geist en lugar de Inter. La única decisión estética que sobrevive hasta hoy es la tipografía.',
    commits: ['1c033fcf', '7cafdd4a'],
  },
  {
    date: '2024-08-21',
    title: 'La era de las cards',
    detail:
      'Toggle de tema claro/oscuro, una card por cada cosa (consejos, miembros activos, crecimiento, eventos, sponsors) y un hero con vortex y texto brillante de Aceternity. Ya aparece la primera pista: las frases motivacionales en fuente de código.',
    commits: ['fdc5f035', '0268ed51', '88e4d019', '328540f2', '8d9a3ab5'],
  },
  {
    date: '2024-09-13',
    title: 'Fondo negro',
    detail:
      'El tema oscuro pasa a fondo negro puro. Todavía convive con el tema claro, pero el sitio ya se siente mejor de noche.',
    commits: ['df2fa8ef'],
  },
  {
    date: '2025-06-03',
    title: 'Pico de efectos',
    detail:
      'Glass cards, gradientes en cada tarjeta y una flickering card. Mucho brillo y mucho espacio vacío entre cajas: lindo en una captura, lento para escanear.',
    commits: ['fe4385ca', 'fe6a09f7', '9222ed05'],
  },
  {
    date: '2026-04-14',
    title: 'Menos zoom, solo oscuro',
    detail:
      'Se van los zoom-in al pasar el mouse, se fuerza el modo oscuro y desaparece el selector de tema. El título del hero pasa a Geist Mono: la primera vez que la mono es protagonista.',
    commits: ['35c6e880', '5e3dff88', 'b47d7d9e', '2a66d422'],
  },
  {
    date: '2026-09-29',
    title: 'Rediseño de la home y el sidebar',
    detail:
      'Landing y sidebar nuevos, y los logos de los partners sin placas de fondo: el logo flota sobre la pantalla, como un sprite.',
    commits: ['351ee709', 'f6b05d59', '01e822b6'],
  },
  {
    date: '2026-09-30',
    title: 'El día de la terminal',
    detail:
      'El día con más commits de la historia del repo (174). Paleta de fósforo verde sobre negro, Geist Mono para todo lo que es chrome, bordes neutros reemplazados por hairlines verdes, las cards reemplazadas por grillas con líneas compartidas, el breadcrumb reemplazado por un título ~/ruta, tabs tipo HUD, menús que bootean como un CRT, toasts como notificaciones de PCN_OS, el buscador $ grep -i en cada página, 404 de terminal, ⌘K, atajos de vim y PCN OS en pantallas grandes.',
    commits: [
      '1bf9b5dd',
      '91101afa',
      'fc02c687',
      'a43ab3d8',
      '7b8f6fc2',
      'a135d1e3',
      'd29066de',
      '949a7749',
      '64d14b62',
      '1273244f',
      '3ecffeaa',
      '4dbfb29a',
    ],
  },
  {
    date: '2026-10-01',
    title: 'Los botones son funciones',
    detail:
      'Todo botón con relleno y borde nombra su acción como una llamada: crearEvento();, cancelar();. Los campos de formulario se vuelven prompts de terminal, con caret de bloque que deja ver la letra que tiene abajo.',
    commits: ['34c1cabf', 'e8a0365e', 'bb32263a', '7fdec300'],
  },
  {
    date: '2026-10-02',
    title: 'Formularios al milímetro',
    detail:
      'Campos que comparten fila alineados exactamente, labels que nunca se parten en dos líneas, botones de guardar pegados al borde inferior en formularios largos y emails transaccionales con la misma estética.',
    commits: ['fa6c82e8', '8d3a7763', 'a1d39d6f', '07dc2104'],
  },
  {
    date: '2026-10-03',
    title: 'Compacto y rápido',
    detail:
      'El buscador se achica, todos los controles de filtro de un header miden h-8, tabs + búsqueda + filtros entran en una sola fila, las pantallas de carga pasan a skeletons con la forma real de la página y PCN OS suma un modo liviano para computadoras con pocos recursos.',
    commits: ['49a752bb', '0b12366d', 'f762e614', 'b4ad1d71', '60ef61a'],
  },
];

export type Principle = {
  title: string;
  why: string;
  doThis: string;
  notThis: string;
};

export const principles: Principle[] = [
  {
    title: 'Hecho para nerds, no para todo el mundo',
    why: 'El público es gente apasionada por el software. No optimizamos para la persona que nunca abrió una terminal: optimizamos para la que se siente en casa en una. Si un detalle hace sonreír a un dev, vale más que uno que agrada a cualquiera.',
    doThis: '~/eventos como título, $ grep -i para buscar, atajos de vim, ⌘K.',
    notThis: 'Heroes de marketing genéricos, stock photos, copy de landing de SaaS.',
  },
  {
    title: 'La terminal es la metáfora',
    why: 'Cada pieza de UI tiene un equivalente en una terminal o un editor: prompts, rutas, comentarios, headers de markdown, procesos, notificaciones del sistema. Si no tiene un equivalente, probablemente no hace falta.',
    doThis: '## para títulos de sección, // para hints, > para labels, ERR para errores.',
    notThis: 'Íconos decorativos al lado de cada título o emojis como viñetas.',
  },
  {
    title: 'Densidad antes que aire',
    why: 'Una persona nerd escanea, no lee de punta a punta. Más información por pantalla, filas en lugar de cards y nada de espacios vacíos entre cajas.',
    doThis: 'RuledGrid con hairlines compartidas, logos de 36px, descripciones con line-clamp.',
    notThis: 'Grillas de cards con gap-6, sombras y bordes redondeados grandes.',
  },
  {
    title: 'Un solo acento',
    why: 'El verde fósforo #04f4be es el único color que llama la atención. Todo lo demás es negro, gris verdoso o una transparencia del mismo verde, así el acento siempre significa algo: interactivo, activo o importante.',
    doThis: 'pcnGreen y sus opacidades (pcnGreen-200 para líneas, pcnGreen-500 para prompts).',
    notThis: 'Un color por sección, gradientes multicolor, bordes grises neutros.',
  },
  {
    title: 'El teclado es ciudadano de primera',
    why: 'Quien vive en un editor espera poder moverse sin mouse. Cada página responde a / para buscar, Esc para limpiar, j/k/gg/G para moverse, [ y ] para saltar entre secciones y ⌘K para ir a cualquier lado.',
    doThis: 'Mostrar el atajo (<kbd>/</kbd>) dentro del control que lo usa.',
    notThis: 'Interacciones que solo existen con hover o con drag.',
  },
  {
    title: 'Microdetalles que se notan',
    why: 'La diferencia entre un sitio con estética hacker y un disfraz está en los detalles: el caret de bloque que deja leer la letra de abajo, los brackets que se abren al hacer hover, el beam que recorre el campo enfocado, el glitch de un error.',
    doThis: 'Animar estados reales (focus, error, carga) con transform y opacity.',
    notThis: 'Animaciones decorativas sin significado o que bloquean la lectura.',
  },
  {
    title: 'Alineado al píxel',
    why: 'Los nerds notan un desfase de 2px. Los controles que comparten fila miden lo mismo (h-8 en headers), los inputs lado a lado arrancan a la misma altura y ningún label se parte en dos líneas.',
    doThis: 'Labels idénticos en una fila; descripciones y errores siempre debajo del control.',
    notThis: 'Un hint extra arriba de un solo input que lo empuja unos píxeles hacia abajo.',
  },
  {
    title: 'Rápido y respetuoso con el hardware',
    why: 'Un dev abre el sitio con veinte pestañas y un IDE corriendo. Skeletons con la forma real de la página, nada de loaders a pantalla completa, prefers-reduced-motion respetado y un modo liviano de PCN OS para máquinas con pocos recursos.',
    doThis: 'Streaming por sección con su propio skeleton; animaciones solo de transform/opacity.',
    notThis: 'Spinners que tapan toda la pantalla o efectos que corren cada frame sin pausa.',
  },
];

export type Rule = { term: string; detail: string };

export const typeScale: { className: string; size: string; use: string; mono: boolean }[] = [
  { className: 'text-xl', size: '20px', use: 'PageTitle (~/ruta)', mono: true },
  {
    className: 'text-base',
    size: '16px',
    use: 'Título de un dialog, nombre de evento',
    mono: true,
  },
  {
    className: 'text-sm',
    size: '14px',
    use: 'Cuerpo de texto y títulos de sección (##)',
    mono: false,
  },
  { className: 'text-[13px]', size: '13px', use: 'Texto dentro de campos y menús', mono: true },
  {
    className: 'text-xs',
    size: '12px',
    use: 'Descripciones, meta, mensajes de error',
    mono: false,
  },
  { className: 'text-[11px]', size: '11px', use: 'Labels (UPPERCASE), badges, fechas', mono: true },
  { className: 'text-[10px]', size: '10px', use: 'Tabs HUD, marcas personales, kbd', mono: true },
];

export const spacingRules: Rule[] = [
  {
    term: 'h-8',
    detail:
      'Altura de todo control en una fila de header: SearchBar, segmentados, selects, tabs y botones size="sm". Si comparten fila, miden lo mismo.',
  },
  {
    term: 'h-9',
    detail: 'Altura por defecto de inputs, select triggers y botones dentro de formularios.',
  },
  {
    term: 'p-3 / p-4',
    detail:
      'Padding de una celda de RuledGrid (p-3 en listas densas, p-4 en secciones de documentación). Nunca gap entre celdas: la línea es el separador.',
  },
  {
    term: 'gap-2 / gap-3',
    detail: 'Separación entre ícono y texto y entre controles de una misma fila.',
  },
  {
    term: 'mb-4',
    detail: 'Separación entre el PageTitle y el contenido; el título no lleva barra fija de 64px.',
  },
];

export const borderRules: Rule[] = [
  {
    term: 'Hairline',
    detail:
      '1px border-pcnGreen-200 (#04f4be al 20%). Es el separador universal: entre celdas, alrededor de secciones y debajo de los headers.',
  },
  {
    term: 'Líneas compartidas',
    detail:
      'RuledGrid dibuja el borde superior e izquierdo y cada celda dibuja el inferior y el derecho, así dos celdas vecinas comparten una sola línea.',
  },
  {
    term: 'Radio',
    detail:
      '--radius es 0.25rem: rounded-sm (≈0px) para casi todo y nada más redondo que rounded-lg (4px). Las pantallas de terminal tienen esquinas rectas.',
  },
  {
    term: 'Brackets en las esquinas',
    detail:
      'Botones outline, menús, tabs y campos marcan dos o cuatro esquinas con un ángulo verde de 2px, como el visor de un HUD. Al hacer hover los brackets crecen.',
  },
  {
    term: 'Punteado',
    detail:
      'border-dashed significa "vacío o bloqueado": estados vacíos, campos deshabilitados y separadores internos de los dialogs.',
  },
  {
    term: 'Glow',
    detail:
      'Las sombras no son grises: son halos verdes (box-glow, text-glow) que solo aparecen en elementos activos o enfocados.',
  },
];

export const motionRules: Rule[] = [
  {
    term: 'cta-pulse / cta-shine',
    detail:
      'El botón primario late suavemente y un reflejo lo cruza cada 3.6s, para que se vea aún en reposo. Se detiene en hover.',
  },
  {
    term: 'field-beam',
    detail:
      'Un haz de luz recorre el borde inferior del campo enfocado, como un scanner. field-glitch sacude el campo una vez cuando entra en error.',
  },
  {
    term: 'Boot de CRT',
    detail:
      'Menús, selects y dialogs se abren como un monitor que se enciende: una línea horizontal que se expande y un barrido de arriba abajo.',
  },
  {
    term: 'Caret',
    detail:
      'El ~/ruta del título y los campos tienen un cursor de bloque que parpadea; en touch se usa el caret nativo.',
  },
  {
    term: 'Reglas',
    detail:
      'Duraciones de 150 a 300ms, solo transform/opacity/color, animate-pulse para skeletons y todo apagado con prefers-reduced-motion y en PCN OS liviano.',
  },
];

export const cursorRules: Rule[] = [
  {
    term: 'Reposo',
    detail:
      'Un cuadrado verde con brillo que sigue al mouse exacto y cuatro corchetes de 26px que lo persiguen con un poco de inercia.',
  },
  {
    term: 'Hover',
    detail:
      'Sobre algo clickeable los corchetes crecen a 42px, giran 90° y se iluminan, y al costado se tipea qué hace el click: cd (link interno), open ↗ (link externo), exec (botón) o lo que diga data-cursor.',
  },
  {
    term: 'Presionado',
    detail:
      'El cuadrado se achica al 60%, los corchetes al 80% y se ponen blancos. Al soltar sale una ráfaga de caracteres hex y un pulso.',
  },
  {
    term: 'Campos de texto',
    detail:
      'Inputs, textareas y contenteditable esconden el cursor hacker y muestran el I-beam nativo: para escribir hace falta ver dónde va el caret.',
  },
  {
    term: 'Sobre color',
    detail:
      'La capa usa mix-blend-mode: difference, así el verde sobre fondo negro sigue verde y sobre un botón verde se vuelve oscuro.',
  },
  {
    term: 'Apagado',
    detail:
      'En touch, lápiz, prefers-reduced-motion, PCN OS liviano y el layout clásico queda el cursor nativo.',
  },
];

export const iconRules: Rule[] = [
  {
    term: 'lucide-react',
    detail:
      'Una sola familia de íconos, con el stroke por defecto. size-3 en meta y badges, size-3.5/size-4 en botones y filas.',
  },
  {
    term: 'Color',
    detail:
      'Los íconos heredan el color del texto (text-current) o usan text-pcnGreen cuando marcan algo activo. Nunca íconos multicolor.',
  },
  {
    term: 'Glifos antes que íconos',
    detail:
      'Cuando un carácter alcanza, se usa el carácter: › en listas, → y ↗ en links, ~ y / en rutas, ## en títulos, [ ] en la tab activa.',
  },
  {
    term: 'Marcas',
    detail:
      'Redes sociales en monocromo; logos de partners sin placa de fondo y todos al mismo tamaño visual.',
  },
];

export const darkModeRules: Rule[] = [
  {
    term: 'Siempre oscuro',
    detail:
      'El ThemeProvider fuerza theme="dark" desde abril de 2026: no hay selector. Una terminal es oscura y elegir un tema claro no aporta nada al público.',
  },
  {
    term: 'Fondo',
    detail:
      'Negro con un tinte verde (--background: 160 30% 2.5%), no #000 puro: el fósforo se ve como una pantalla encendida y no como un vacío.',
  },
  {
    term: 'Scanlines',
    detail:
      'body::after pinta líneas horizontales verdes al 2.5% sobre toda la pantalla. Casi no se ven, pero se sienten.',
  },
  {
    term: 'Tokens claros',
    detail:
      'El :root mantiene los tokens claros de shadcn por compatibilidad; ninguna pantalla los usa, así que no hace falta diseñar para ellos.',
  },
  {
    term: 'Selección y scrollbars',
    detail:
      'El texto seleccionado se pinta en verde con letra negra y los scrollbars son finos, verdes y rectos.',
  },
];

export const voiceRules: Rule[] = [
  {
    term: 'Botones como funciones',
    detail:
      'Todo botón con relleno o borde se escribe como una llamada en camelCase: crearEvento();, subir();, cancelar();. Los estados de carga en minúscula: guardando...',
  },
  {
    term: 'Prompts y rutas',
    detail:
      '$ antes de un comando o un estado vacío, > antes de un label o un título de dialog, // antes de un hint, ~/ruta como título de página.',
  },
  {
    term: 'Minúsculas',
    detail:
      'Placeholders y labels cortos en minúscula (título, autor o descripción). La frase completa ("Buscar charlas") va en el aria-label.',
  },
  {
    term: 'Voseo rioplatense',
    detail:
      'Hablamos como en la comunidad: "sumate", "elegí", "mirá". Directo, sin marketing y sin signos de exclamación de más.',
  },
  {
    term: 'Sin fronteras',
    detail:
      'PCN nació en Tucumán pero es una comunidad abierta a todo el mundo: el copy no la ata a una ciudad.',
  },
];

export const designDebt: Rule[] = [
  {
    term: 'EmptyState',
    detail:
      'src/components/empty-state.tsx todavía usa círculos grises de la era de las cards en /herramientas y /software-recomendado. El patrón actual es la línea punteada con $ (EmptyLine).',
  },
  {
    term: 'Skeletons de cards',
    detail:
      'Algunos skeletons de page-skeletons.tsx (CardListSkeleton, DashboardSkeleton) dibujan cards redondeadas; los nuevos usan RuledGridSkeleton.',
  },
  {
    term: 'Variantes de premio',
    detail:
      'gold, silver y bronze del Button son de una landing de sponsors que ya no existe y ninguna pantalla las usa: candidatas a borrarse.',
  },
];

export const prChecklist: string[] = [
  '¿La página usa PageTitle con su ~/ruta y una sola línea de meta?',
  '¿Las listas usan RuledGrid (líneas compartidas) en lugar de cards con gap?',
  '¿Todos los controles del header miden h-8 y entran en una fila?',
  '¿La búsqueda es el SearchBar $ grep -i?',
  '¿Los botones con relleno o borde se leen como una función (accion();)?',
  '¿Los inputs que comparten fila arrancan a la misma altura y ningún label se parte?',
  '¿El estado de carga es un skeleton con la forma real (RuledGridSkeleton, PageTitleSkeleton)?',
  '¿El estado vacío es una línea con $ y no una ilustración?',
  '¿Solo se usa el verde como acento y las líneas son pcnGreen-200?',
  '¿Funciona con teclado y respeta prefers-reduced-motion?',
  '¿La PR incluye capturas (pnpm screenshot)?',
];
