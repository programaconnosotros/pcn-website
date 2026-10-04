import { defineManualCases } from './define';

export const conversationCases = defineManualCases('conversaciones', [
  {
    title: 'Buscar conversaciones sin importar acentos',
    priority: 'media',
    steps: ['Abrir /conversaciones', 'Buscar "programacion" (sin tilde)'],
    expected:
      'Aparecen las conversaciones que dicen "programación" en el título, el resumen o los participantes, y el contador "N/Total resultados" se actualiza.',
  },
  {
    title: 'Filtrar por una voz y por muchos participantes',
    priority: 'baja',
    steps: [
      'Tocar uno de los nombres destacados',
      'Activar --muchos-participantes',
      'Quitar el chip --author="Nombre"',
    ],
    expected:
      'Los filtros se combinan (solo conversaciones de esa persona con 5+ participantes) y al quitar el chip vuelve a la lista completa.',
  },
  {
    title: 'Link directo a una conversación',
    priority: 'media',
    steps: [
      'Abrir una conversación y tocar "Copiar link para compartir"',
      'Pegar el link en otra pestaña',
      'Abrir /conversaciones?c=no-existe',
    ],
    expected:
      'El botón cambia a "Link copiado"; el link abre ese diálogo sobre la lista completa y saca ?c= de la URL. Un hash inexistente solo limpia el parámetro.',
  },
  {
    title: 'Navegar el diálogo con el teclado',
    priority: 'baja',
    steps: ['Abrir una conversación', 'Usar ← y →', 'Presionar Esc'],
    expected: 'Pasa a la anterior y la siguiente de la lista filtrada y Esc cierra el diálogo.',
  },
]);

export const interviewCases = defineManualCases('entrevistas', [
  {
    title: 'Simular una entrevista con el teclado',
    priority: 'media',
    steps: [
      'Abrir /entrevistas y elegir Backend, una tecnología y Semi-senior',
      'Revelar cada respuesta con espacio y calificar con 1 (la sabía) o 2 (a repasar)',
    ],
    expected:
      'Al final aparece "entrevista terminada" con el desglose por tema (el más flojo primero) y "repasar N pregunta(s)" con las marcadas con 2.',
  },
  {
    title: 'Configuración incompleta del simulador',
    priority: 'baja',
    steps: ['Elegir Frontend sin tecnología ni seniority', 'Abrir /entrevistas?tipo=backend'],
    expected:
      'Se ve la pista con lo que falta (p. ej. "elegí el tipo, la tecnología y la seniority"); ?tipo=backend preselecciona el área.',
  },
  {
    title: 'Quality engineering exige herramientas si incluye automatización',
    priority: 'baja',
    steps: ['Elegir Quality engineering → "Incluye automatizado"', 'No marcar ninguna herramienta'],
    expected: 'No deja empezar hasta elegir al menos una de Cypress, Playwright o k6.',
  },
  {
    title: 'Progreso de lectura en las guías',
    priority: 'media',
    pre: ['Usuario logueado'],
    steps: [
      'Abrir una guía en /entrevistas/guias',
      'Tocar "marcar como leída y seguir" en dos secciones',
      'Volver al listado de guías',
    ],
    expected:
      'El panel pasa de "empezar la guía" a "seguir leyendo" y el progreso se mantiene al recargar. /entrevistas/guias/no-existe da 404.',
  },
  {
    title: 'Ejercicios de live coding sin sesión',
    priority: 'baja',
    pre: ['Sesión cerrada'],
    steps: ['En /entrevistas/live-coding tocar "Marcar como resuelto"'],
    expected: 'Toast "Iniciá sesión para guardar tu progreso" con link al login; no cambia nada.',
  },
]);

export const searchCases = defineManualCases('busqueda', [
  {
    title: 'Búsqueda global con ⌘K / Ctrl+K',
    priority: 'alta',
    steps: [
      'Presionar ⌘K (Mac) o Ctrl+K desde cualquier página',
      'Escribir el nombre de un evento',
      'Moverse con ↑ ↓ y abrir con ↵',
    ],
    expected:
      'Se abre el buscador con el placeholder "eventos, cursos, charlas, conversaciones…", los resultados se agrupan (secciones, eventos, cursos…) y ↵ navega al elegido.',
  },
  {
    title: 'Búsqueda sin resultados y secciones de admin',
    priority: 'media',
    pre: ['Usuario común'],
    steps: ['Buscar "zzzqqq"', 'Borrar todo y mirar las secciones listadas'],
    expected:
      'Muestra "find: ‘zzzqqq’: sin resultados"; con el campo vacío lista secciones y nunca las de administración.',
  },
  {
    title: 'Buscar miembros de forma tolerante',
    priority: 'media',
    steps: ['Abrir /miembros', 'Buscar "sanc agus" y luego el nombre de una empresa'],
    expected:
      'Encuentra a la persona aunque las palabras estén en otro orden o sin acentos, y también por cargo o empresa.',
  },
  {
    title: 'Barra de búsqueda de las páginas',
    priority: 'baja',
    steps: ['En /changelog presionar /', 'Escribir algo y presionar Esc'],
    expected: '/ enfoca el "$ grep -i" y Esc lo limpia.',
  },
]);

export const osCases = defineManualCases('pcn-os', [
  {
    title: 'El escritorio aparece solo en pantallas grandes',
    priority: 'alta',
    steps: [
      'Abrir / en una ventana de 1280 px',
      'Achicarla a menos de 1024 px',
      'Abrir el sitio en un celular',
    ],
    expected:
      'A 1280 px se ve PCN OS con barra de menú y dock; por debajo de 1024 px pasa al layout clásico (sidebar + página) mostrando la misma URL; en el celular nunca carga el escritorio.',
  },
  {
    title: 'Ventanas: maximizar, minimizar, mover y cerrar',
    priority: 'alta',
    steps: [
      'Abrir Eventos desde el dock',
      'Hacer doble clic en la barra de título',
      'Arrastrar la ventana maximizada',
      'Minimizar, restaurar desde el dock y cerrar',
    ],
    expected:
      'El doble clic maximiza y restaura, arrastrar una ventana maximizada la restaura bajo el puntero, ninguna ventana queda debajo de la barra de menú o el dock, y la URL y el título siguen a la ventana enfocada.',
  },
  {
    title: 'Links que abren ventanas nuevas',
    priority: 'media',
    steps: [
      'En la ventana de inicio tocar un evento',
      'Dentro de una ventana tocar el link a un perfil',
      'Tocar un breadcrumb',
    ],
    expected:
      'El evento y el perfil se abren en ventanas nuevas; el breadcrumb navega dentro de la misma ventana.',
  },
  {
    title: 'Cambiar el modo de PCN OS',
    priority: 'alta',
    steps: [
      'Menú PCN_OS → Modo de PCN OS → Liviano',
      'Abrir una segunda pestaña del sitio',
      'Elegir Clásico y luego tocar "Volver a PCN OS" en el sidebar',
    ],
    expected:
      'Liviano saca blur, widgets, animaciones y cursor hacker; la otra pestaña cambia sola (sincronizado por localStorage). Clásico muestra el sidebar y "Volver a PCN OS" regresa al escritorio.',
  },
  {
    title: 'Modo liviano automático en compus con pocos recursos',
    priority: 'media',
    pre: [
      'Sin modo elegido (borrar pcn-os-mode y pcn-os-auto-mode del localStorage)',
      'DevTools: CPU throttling 6x o una máquina con 4 núcleos o menos',
    ],
    steps: ['Cargar /'],
    expected:
      'Arranca en liviano con el aviso "PCN OS liviano — Detectamos que tu compu tiene pocos recursos…" y los botones entendido, experiencia completa y versión clásica.',
  },
  {
    title: 'Programas de admin ocultos',
    priority: 'alta',
    pre: ['Usuario común logueado'],
    steps: ['Revisar el dock', 'Abrir el launcher de Programas y buscar "monitoreo"'],
    expected:
      'No aparecen Panel, Usuarios, Analíticas, Métricas, Visitas, Notificaciones, Monitoreo ni Vínculos.',
  },
  {
    title: 'Launcher y búsqueda desde una ventana',
    priority: 'baja',
    steps: [
      'Abrir Programas y escribir "lec" + Enter',
      'Con el foco dentro de una ventana presionar ⌘K',
    ],
    expected:
      'Enter abre Lectura (el primer resultado); ⌘K abre la búsqueda global del escritorio, no la de la ventana.',
  },
]);

export const pwaCases = defineManualCases('pwa', [
  {
    title: 'Instalar la app en Android (Chrome)',
    priority: 'alta',
    pre: ['Build de producción servida por HTTPS'],
    steps: [
      'Abrir el sitio en Chrome para Android',
      'Tocar instalarApp(); en la home',
      'Abrir la app instalada',
    ],
    expected:
      'Aparece el prompt nativo; la app abre standalone con el splash "~/pcn $ iniciando_" y el botón de instalar desaparece.',
  },
  {
    title: 'Instrucciones de instalación en iPhone',
    priority: 'media',
    steps: ['Abrir el sitio en Safari para iOS', 'Tocar instalarApp();'],
    expected: 'Abre el diálogo "Instalar PCN" con los pasos de Compartir → Agregar a inicio.',
  },
  {
    title: 'Navegar sin conexión',
    priority: 'alta',
    pre: ['Service worker registrado (producción o ?sw=true)'],
    steps: [
      'Visitar /eventos con red',
      'Pasar a offline en DevTools',
      'Volver a /eventos y luego abrir una página nunca visitada',
    ],
    expected:
      'Toast "Sin conexión"; lo ya visitado sigue disponible y la página nueva muestra /offline en esa URL, con ping y ./reintentar.',
  },
  {
    title: 'La página offline vuelve sola',
    priority: 'media',
    steps: ['Estando en /offline, jugar la trivia', 'Reconectar la red'],
    expected:
      'La trivia marca en rojo la respuesta errónea y en verde la correcta y da el nivel al final; al volver la red la página se recarga sola y aparece "Conexión restablecida".',
  },
  {
    title: 'No se cachea nada privado',
    priority: 'alta',
    pre: ['Usuario logueado con el service worker activo'],
    steps: ['Visitar /perfil y /autenticacion/iniciar-sesion', 'Revisar Cache Storage en DevTools'],
    expected:
      'No hay entradas de /api, /autenticacion, /up ni respuestas con Set-Cookie o no-store: los datos de una sesión no quedan para otra persona en el mismo dispositivo.',
  },
  {
    title: 'Pull to refresh en la app instalada',
    priority: 'baja',
    pre: ['App instalada en un celular'],
    steps: [
      'En /eventos tirar hacia abajo desde arriba',
      'Repetir en /cursos',
      'Repetir con un diálogo abierto',
    ],
    expected:
      'Recarga en /eventos; no se activa en /cursos (ruta estática) ni con un diálogo abierto.',
  },
]);

export const adminCases = defineManualCases('admin', [
  {
    title: 'Las páginas de administración están protegidas',
    priority: 'alta',
    pre: ['Usuario común logueado y, aparte, sesión cerrada'],
    steps: ['Abrir /admin, /monitoreo, /analiticas, /visitas, /vinculos y /usuarios'],
    expected:
      'Ninguna muestra datos: todas redirigen fuera del panel (/usuarios a /miembros) y no aparecen en el sidebar.',
  },
  {
    title: 'Dar y quitar roles',
    priority: 'alta',
    pre: ['Admin', 'Usuario de prueba'],
    steps: [
      'En /usuarios hacer admin al usuario',
      'Darle y quitarle ambassador y co-founder',
      'Intentar quitarse el admin a uno mismo',
    ],
    expected:
      'Toasts "<nombre> ahora es admin", "ahora es ambassador", "ya no figura como co-founder"…; el cambio se ve al instante y quitarse el propio rol falla con "No podés quitarte el rol de admin a vos mismo".',
  },
  {
    title: 'Un error del sitio llega a monitoreo',
    priority: 'alta',
    pre: ['Admin'],
    steps: [
      'Provocar un error de render (p. ej. cortar la base en local y abrir /eventos)',
      'Ver la pantalla "Segmentation fault (core dumped)" con su digest',
      'Abrir /monitoreo y marcar el error como resuelto',
    ],
    expected:
      'El error aparece en "sin-resolver" con mensaje y stack; tras "Marcar como resuelto" muestra "resuelto por <nombre>".',
  },
  {
    title: 'Filtrar logs por nivel',
    priority: 'baja',
    pre: ['Admin'],
    steps: ['En /monitoreo abrir la pestaña logs', 'Ir a la página 2 y elegir nivel warn'],
    expected:
      'La URL lleva logLevel=warn, vuelve a la página 1 y si no hay muestra "no hay logs de nivel warn".',
  },
  {
    title: 'Rango de métricas',
    priority: 'baja',
    pre: ['Sesión cerrada'],
    steps: ['En /metricas elegir 90d', 'Cargar ?desde=2026-01-01&hasta=2026-02-01'],
    expected:
      'Los gráficos se recalculan y el encabezado muestra "$ metrics --from … --to …" con el rango.',
  },
  {
    title: 'Vincular identidades',
    priority: 'media',
    pre: ['Admin'],
    steps: [
      'En /vinculos vincular un login de GitHub a un usuario',
      'Abrir /changelog',
      'Desvincularlo',
    ],
    expected:
      'Toast "<login> → <usuario>"; en el changelog el autor pasa a linkear al perfil; al desvincular, "<login> desvinculado".',
  },
]);

export const platformCases = defineManualCases('plataforma', [
  {
    title: 'Página inexistente',
    priority: 'media',
    steps: ['Abrir /eventos/x/y/z'],
    expected:
      'Pantalla de terminal "bash: cd: …: No such file or directory" con título "Página no encontrada", noindex y sugerencias cd ~, cd ~/eventos.',
  },
  {
    title: 'Atajos estilo vim',
    priority: 'baja',
    steps: [
      'En /desarrollo presionar j, k, G y gg',
      'Presionar yy',
      'Presionar ?',
      'Escribir j dentro de un input',
    ],
    expected:
      'Scroll abajo/arriba, al final y al principio; yy copia la URL ("Link copiado"); ? abre "atajos de teclado"; dentro del input la j se escribe normal.',
  },
  {
    title: 'Navegación completa con teclado',
    priority: 'alta',
    steps: ['Recorrer la home, /eventos y un formulario solo con Tab, Shift+Tab, Enter y Esc'],
    expected:
      'Todo control es alcanzable, el foco siempre se ve, los diálogos atrapan el foco y Esc los cierra devolviendo el foco al botón que los abrió.',
  },
  {
    title: 'Lector de pantalla en controles con solo ícono',
    priority: 'media',
    steps: ['Con VoiceOver o NVDA recorrer el sidebar, la galería y el buscador'],
    expected:
      'Cada botón de ícono anuncia su nombre (p. ej. "Limpiar búsqueda", "Ocultar aviso") y los filtros anuncian si están activos (aria-pressed).',
  },
  {
    title: 'Responsive sin scroll horizontal',
    priority: 'alta',
    steps: ['Recorrer las secciones principales a 360 px, 768 px y 1440 px de ancho'],
    expected:
      'No hay scroll horizontal de página; las barras de filtros se desplazan de costado en el celular y el sidebar pasa a menú móvil por debajo de 768 px.',
  },
  {
    title: 'Atajo de evento',
    priority: 'media',
    pre: ['Evento futuro con URL corta "cowork"'],
    steps: ['Abrir /cowork', 'Abrir /COWORK', 'Abrir /no-existe-atajo'],
    expected:
      'Las dos primeras llevan a /eventos/<id> del próximo evento con ese atajo (sin importar mayúsculas); un atajo sin evento lleva a /eventos.',
  },
  {
    title: 'Health check, robots y sitemap',
    priority: 'media',
    steps: ['Pedir /up', 'Abrir /robots.txt', 'Abrir /sitemap.xml'],
    expected:
      '/up responde 200 {"status":"OK"} (lo usa Kamal en cada deploy); robots bloquea /api/, /autenticacion/ y las páginas privadas; el sitemap lista las rutas públicas y los eventos.',
  },
  {
    title: 'Mensajes de rate limit visibles en producción',
    priority: 'alta',
    pre: ['Build de producción (pnpm build && pnpm start)', 'Usuario común'],
    steps: ['Superar el límite de comentarios (20 en 10 minutos)'],
    expected:
      'Se ve "Estás comentando muy seguido…" con la espera, no un error genérico: el mensaje viaja en el digest porque producción oculta los mensajes de error.',
  },
  {
    title: 'Emails en desarrollo',
    priority: 'baja',
    pre: ['docker-compose up -d'],
    steps: ['Registrarse y pedir recuperación de clave', 'Abrir localhost:18025'],
    expected:
      'Los dos emails llegan a MailHog con el formato correcto y no sale ninguno a internet.',
  },
]);
