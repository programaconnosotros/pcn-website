import { defineManualCases } from './define';

export const galleryCases = defineManualCases('galeria', [
  {
    title: 'Subir fotos y un video a un evento',
    priority: 'alta',
    pre: [
      'Admin logueado',
      'Un evento existente',
      'Fotos JPG con EXIF y un MP4 de menos de 500 MB',
    ],
    steps: [
      'Ir a /galeria?evento=<id> y tocar subir();',
      'Arrastrar los archivos a "arrastrá fotos y videos o hacé click para elegirlos"',
      'Revisar fecha y evento detectados en cada archivo y subir',
    ],
    expected:
      'El evento viene preseleccionado, la fecha sale del EXIF, se ve el aviso "Subiendo: no bloquees la pantalla…" y termina con "N archivos subidos". Las fotos quedan en WebP (máx. 2560 px) con miniatura.',
  },
  {
    title: 'Formatos no soportados al subir',
    priority: 'media',
    pre: ['Admin en /galeria/subir'],
    steps: ['Elegir un video .avi', 'Elegir un video de más de 500 MB'],
    expected:
      'Rechazos: "Formato de video no soportado: subí MP4, WebM o MOV." y "El video pesa más de 500 MB.".',
  },
  {
    title: 'Fotos HEIC de iPhone',
    priority: 'media',
    pre: [
      'Admin en /galeria/subir',
      'Una foto .heic en la computadora (de un iPhone, por AirDrop)',
    ],
    steps: ['Elegir la foto .heic desde Chrome', 'Subirla'],
    expected:
      'Se ve la vista previa con la fecha en que se sacó, se sube y queda en WebP como cualquier otra foto.',
  },
  {
    title: 'La foto se ve derecha y sin datos de ubicación',
    priority: 'alta',
    pre: ['Foto tomada con el celular en vertical, con GPS'],
    steps: ['Subirla', 'Abrirla en /galeria/[id] y descargarla'],
    expected:
      'Se ve con la orientación correcta (se aplica la rotación EXIF) y el archivo descargado no tiene coordenadas GPS ni metadata.',
  },
  {
    title: 'Solo admins pueden subir',
    priority: 'alta',
    pre: ['Usuario común logueado'],
    steps: ['Abrir /galeria', 'Navegar directo a /galeria/subir'],
    expected: 'No ve subir(); ni "seleccionar"; /galeria/subir lo redirige.',
  },
  {
    title: 'Filtros de la galería en la URL',
    priority: 'media',
    steps: [
      'En /galeria elegir la pestaña fotos, un evento y una persona',
      'Copiar la URL y abrirla en otra pestaña',
      'Abrir una foto y moverse con ← y →',
    ],
    expected:
      'La URL queda como ?tipo=fotos&evento=<id>&persona=<id>, se restaura igual en la otra pestaña y las flechas recorren solo los resultados filtrados.',
  },
  {
    title: 'Etiquetarse en una foto',
    priority: 'media',
    pre: ['Usuario logueado que no está etiquetado en la foto'],
    steps: ['Abrir /galeria/[id]', 'Tocar "aparezco en esta foto"', 'Quitarse de la foto'],
    expected:
      'Toast "¡Listo! Ya aparecés en la foto", la foto aparece en la pestaña galería de su perfil; al quitarse, "Te quitaste de la foto". No puede quitar a otras personas.',
  },
  {
    title: 'Visitante anónimo en una foto',
    priority: 'baja',
    pre: ['Sesión cerrada'],
    steps: ['Abrir /galeria/[id]'],
    expected:
      'Ve "¿Aparecés en la foto?" con un link a /autenticacion/iniciar-sesion?redirect=/galeria/<id>.',
  },
  {
    title: 'Edición masiva',
    priority: 'media',
    pre: ['Admin con varias fotos de prueba'],
    steps: [
      'Tocar "seleccionar" y elegir 3 fotos',
      'Moverlas a otro evento',
      'Etiquetar a una persona en las 3',
      'Eliminarlas confirmando el diálogo',
    ],
    expected:
      'Toasts "3 archivos movidos a <evento>", "Etiquetaste a X en 3 archivos" y, tras "¿Eliminar 3 archivos?", "3 archivos eliminados". Los archivos también se borran de S3.',
  },
  {
    title: 'Descargar una foto',
    priority: 'media',
    steps: [
      'En /galeria/[id] tocar Descargar',
      'Repetir más de 30 veces en una hora (sin ser admin)',
    ],
    expected:
      'Descarga pcn-<fecha>-<id>.webp por un link firmado. Pasado el límite, el endpoint responde 429 con Retry-After y el toast "Descargaste muchas fotos en poco tiempo…".',
  },
  {
    title: 'Usar una foto como portada del evento',
    priority: 'baja',
    pre: ['Admin', 'Foto asociada a un evento'],
    steps: [
      'Tocar "Usar como portada del evento"',
      'Abrir el evento',
      'Tocar "Quitar como portada del evento"',
    ],
    expected:
      'Toast "Es la portada del evento" y el evento la muestra; al quitarla, "La portada vuelve a ser aleatoria".',
  },
]);

export const profileCases = defineManualCases('perfil', [
  {
    title: 'Editar el perfil y guardar con el teclado',
    priority: 'alta',
    pre: ['Usuario logueado'],
    steps: ['Ir a /perfil', 'Cambiar slogan y país', 'Presionar Cmd/Ctrl+S'],
    expected:
      'Toasts "Actualizando perfil..." y "Perfil actualizado correctamente"; el cambio se ve en /perfil/[id] y el porcentaje de perfil completo se actualiza.',
  },
  {
    title: 'Validaciones del perfil',
    priority: 'media',
    steps: ['Nombre de 2 caracteres', 'LinkedIn "linkedin"', 'Cargar 6 puestos de trabajo'],
    expected:
      '"El nombre debe tener al menos 3 caracteres", "La URL debe ser válida" y "Podés cargar hasta 5 puestos".',
  },
  {
    title: 'Foto de perfil',
    priority: 'media',
    steps: ['Subir un PNG de 2 MB', 'Subir un PDF', 'Subir una imagen de 12 MB'],
    expected:
      'El PNG se guarda; los otros fallan con "Tipo de archivo no permitido…" y "El archivo es demasiado grande. Máximo 10MB".',
  },
  {
    title: '/perfil sin sesión',
    priority: 'alta',
    pre: ['Sesión cerrada'],
    steps: ['Abrir /perfil'],
    expected: 'Redirige a / sin mostrar ningún formulario.',
  },
  {
    title: 'Perfil público y sus pestañas',
    priority: 'media',
    steps: [
      'Abrir /perfil/[id] de otra persona',
      'Recorrer ?tab=proyectos, consejos, charlas, eventos, fotos y contribuciones',
      'Abrir /perfil/no-existe',
    ],
    expected:
      'Cada pestaña carga su contenido y queda en la URL; no aparece "editar perfil" en perfiles ajenos; el id inexistente da 404 con título "Perfil no encontrado".',
  },
  {
    title: 'Badges personalizados',
    priority: 'baja',
    pre: ['Admin'],
    steps: [
      'Crear un badge con nombre de 1 carácter',
      'Crearlo bien y otorgarlo a alguien',
      'Revocarlo',
    ],
    expected:
      'Error "El nombre es muy corto"; con datos válidos el badge aparece en el perfil de la persona y desaparece al revocarlo.',
  },
  {
    title: 'Publicar un setup y darle like',
    priority: 'baja',
    pre: ['Usuario logueado'],
    steps: [
      'En /setups publicar uno con foto WebP',
      'Con otra cuenta darle like y quitarlo',
      'Intentar editarlo con la otra cuenta',
    ],
    expected:
      'El setup se publica, el like suma y resta, y la otra cuenta no puede editarlo ("No tenés permisos para editar este setup").',
  },
  {
    title: 'Logros calculados',
    priority: 'baja',
    pre: ['Usuario con 10+ eventos asistidos y una charla dada'],
    steps: ['Abrir su perfil', 'Abrir /logros logueado con ese usuario'],
    expected:
      'El perfil muestra Habitué y Speaker y ningún logro que no cumple; /logros lo lista entre quienes ya los consiguieron y muestra cuánto le falta para el resto.',
  },
]);

export const adviceCases = defineManualCases('consejos', [
  {
    title: 'Publicar un consejo',
    priority: 'alta',
    pre: ['Usuario logueado'],
    steps: ['En /consejos tocar publicarConsejo();', 'Escribir 20 caracteres y publicar'],
    expected:
      'Toasts "Publicando consejo..." y "Consejo publicado! 👏"; aparece primero en la lista.',
  },
  {
    title: 'Largo del consejo',
    priority: 'media',
    steps: ['Publicar con 9 caracteres', 'Publicar con 1001 caracteres'],
    expected:
      '"Tenés que escribir al menos 10 caracteres" y "Podés escribir 1000 caracteres como máximo".',
  },
  {
    title: 'Editar y borrar solo lo propio',
    priority: 'alta',
    pre: ['Dos usuarios comunes, A con un consejo publicado'],
    steps: ['Con B abrir el menú del consejo de A', 'Con A editarlo y después eliminarlo'],
    expected:
      'B no ve Editar ni Eliminar. A ve "Tu consejo fue editado exitosamente." y, tras confirmar "¿Estás seguro de eliminar este consejo?", el consejo desaparece.',
  },
  {
    title: 'Like optimista',
    priority: 'media',
    pre: ['Usuario logueado'],
    steps: ['Dar like a un consejo', 'Cortar la red y dar like a otro'],
    expected: 'El corazón cambia al instante; si el servidor falla, vuelve al estado anterior.',
  },
  {
    title: 'Comentar y responder',
    priority: 'media',
    pre: ['Usuario logueado'],
    steps: [
      'Abrir /consejos/[id]',
      'Enviar un comentario',
      'Tocar Responder y enviar una respuesta',
    ],
    expected:
      'Toast "Comentario creado"; la respuesta queda anidada un solo nivel. Sin sesión se ve "Debes iniciar sesión para poder comentar.".',
  },
  {
    title: 'Rate limit de publicaciones',
    priority: 'media',
    pre: ['Usuario común'],
    steps: ['Publicar 11 consejos en menos de una hora'],
    expected:
      'El 11.º muestra "Publicaste mucho contenido en poco tiempo…" con el tiempo de espera.',
  },
]);

export const forumCases = defineManualCases('foro', [
  {
    title: 'Abrir un tema con markdown',
    priority: 'alta',
    pre: ['Usuario logueado'],
    steps: [
      'En /foro tocar nuevoTema();',
      'Elegir una categoría, escribir un título y un contenido con **negrita**, una lista y un bloque ```',
      'Ver la pestaña vista-previa y publicar',
    ],
    expected:
      'La vista previa muestra el formato; al publicar abre /foro/tema/[id] con el mismo formato y el tema queda primero en /foro y en su categoría.',
  },
  {
    title: 'Contenido peligroso se muestra como texto',
    priority: 'alta',
    pre: ['Usuario logueado'],
    steps: ['Publicar un tema con <script>alert(1)</script> y [x](javascript:alert(1))'],
    expected: 'No se ejecuta nada: ambos se ven como texto y no hay ningún link.',
  },
  {
    title: 'Responder y anidar respuestas',
    priority: 'media',
    pre: ['Usuario logueado', 'Un tema abierto'],
    steps: ['Enviar una respuesta', 'Tocar responder en ella y contestar'],
    expected:
      'Las respuestas aparecen anidadas, el contador sube y el tema pasa arriba de la lista por actividad.',
  },
  {
    title: 'Editar, borrar y moderar',
    priority: 'alta',
    pre: ['Usuarios A (autor), B (común) y un admin'],
    steps: [
      'Con B abrir el tema de A',
      'Con A editarlo y eliminarlo tras confirmar',
      'Con el admin fijar y cerrar otro tema, y tratar de responderlo',
    ],
    expected:
      'B no ve editar ni eliminar. El tema fijado queda primero; el cerrado muestra "Este tema está cerrado" y no deja responder.',
  },
  {
    title: 'Visitantes sin sesión',
    priority: 'media',
    steps: ['Sin sesión, abrir /foro, un tema y tocar nuevoTema();'],
    expected:
      'Se puede leer todo; nuevoTema(); y "Iniciá sesión para responder" llevan al login y vuelven al foro.',
  },
]);

export const testimonialCases = defineManualCases('testimonios', [
  {
    title: 'Dejar un testimonio',
    priority: 'media',
    pre: ['Usuario logueado sin testimonio'],
    steps: ['En /testimonios crear uno de 9 caracteres', 'Crearlo con 50 caracteres'],
    expected:
      'Primero "El testimonio debe tener al menos 10 caracteres"; después "Testimonio creado exitosamente", aparece primero en la lista y los admins reciben "Nuevo testimonio creado".',
  },
  {
    title: 'Un testimonio por persona',
    priority: 'baja',
    pre: ['Usuario con testimonio'],
    steps: ['Tocar el botón de acción en /testimonios'],
    expected: 'Abre el testimonio propio para editarlo en lugar de crear otro.',
  },
  {
    title: 'Destacar en la home',
    priority: 'media',
    pre: ['Admin'],
    steps: ['Elegir "Mostrar en home page" en un testimonio', 'Abrir /'],
    expected:
      'Toast "Testimonio agregado a la home page" y aparece en la home; un usuario común no ve esa opción.',
  },
]);

export const projectCases = defineManualCases('proyectos', [
  {
    title: 'Publicar un proyecto open-source',
    priority: 'media',
    pre: ['Usuario logueado'],
    steps: [
      'En /proyectos tocar publicarProyecto();',
      'Activar "Es open-source" y poner un repo de GitHub',
      'Agregar stack, años y un compañero',
    ],
    expected: 'Toast "Proyecto publicado" y aparece con el filtro open-source.',
  },
  {
    title: 'Validaciones del proyecto',
    priority: 'media',
    steps: ['Repo "https://gitlab.com/a/b"', 'Año de cierre anterior al de inicio', 'Año 1960'],
    expected:
      '"Ingresá la URL de un repositorio de GitHub…", "El año de cierre no puede ser anterior al de inicio" e "Ingresá un año entre 1970 y …".',
  },
  {
    title: 'Permisos de colaboradores',
    priority: 'alta',
    pre: ['Usuario B agregado como compañero del proyecto de A'],
    steps: [
      'Con B editar la descripción',
      'Con B intentar cambiar el equipo',
      'Con B tocar "Salir del proyecto"',
    ],
    expected:
      'La descripción se guarda, los cambios de equipo se ignoran y al salir aparece "Saliste del proyecto".',
  },
  {
    title: 'Reordenar proyectos con el teclado',
    priority: 'baja',
    pre: ['Admin'],
    steps: [
      'Tocar ordenar();',
      'Mover un proyecto con las flechas',
      'Tocar terminar(); y recargar',
    ],
    expected: 'Toast "Orden guardado" y el orden se mantiene al recargar.',
  },
]);

export const readingCases = defineManualCases('lectura', [
  {
    title: 'Marcar artículos como leídos y para leer',
    priority: 'media',
    pre: ['Usuario logueado'],
    steps: [
      'En /lectura marcar un artículo como leído y guardar otro para leer',
      'Filtrar "para leer"',
      'Recargar la página',
    ],
    expected:
      'La URL pasa a ?lista=para-leer, solo aparece el guardado y las marcas persisten al recargar y en otros dispositivos.',
  },
  {
    title: 'Marcas sin sesión',
    priority: 'baja',
    pre: ['Sesión cerrada'],
    steps: ['Tocar "Marcar como leído"'],
    expected: 'Toast "Iniciá sesión para guardar tu progreso" con la acción "Iniciar sesión".',
  },
  {
    title: 'Leer un artículo embebido',
    priority: 'media',
    steps: [
      'Abrir un artículo de un sitio que permite iframes',
      'Abrir uno de un sitio que lo prohíbe',
    ],
    expected:
      'El primero se lee dentro del sitio en el marco de navegador; el segundo muestra "<host> no permite mostrarse embebido" con abrir(\'<host>\');.',
  },
  {
    title: 'El endpoint de embed no es un proxy abierto',
    priority: 'alta',
    steps: [
      'Pedir /api/lectura/embed sin url',
      'Pedir /api/lectura/embed?url=http://169.254.169.254/',
    ],
    expected:
      '400 "Missing url parameter" y 400 "URL not allowed": solo se aceptan artículos listados.',
  },
  {
    title: 'Feed RSS',
    priority: 'baja',
    steps: ['Abrir /feed.xml', 'Suscribirse desde un lector RSS'],
    expected:
      'Responde application/rss+xml con anuncios, eventos ("Evento: …") y charlas; el lector lo valida sin errores.',
  },
]);

export const notificationCases = defineManualCases('notificaciones', [
  {
    title: 'Notificación de nueva inscripción',
    priority: 'media',
    pre: ['Admin en un navegador, usuario común en otro'],
    steps: ['Con el usuario inscribirse a un evento', 'Con el admin abrir /notificaciones'],
    expected:
      'Aparece "Nueva inscripción a evento" en "sin leer" con "ver inscripciones"; el badge del sidebar suma uno.',
  },
  {
    title: 'Marcar como leídas',
    priority: 'baja',
    pre: ['Admin con notificaciones sin leer'],
    steps: ['Marcar una con "Marcar como leída"', 'Tocar "marcar todas"'],
    expected:
      'Toasts "Notificación marcada como leída" y "Todas las notificaciones marcadas como leídas"; el badge vuelve a cero.',
  },
  {
    title: 'Notificaciones solo para admins',
    priority: 'media',
    pre: ['Usuario común logueado'],
    steps: ['Revisar el sidebar', 'Abrir /notificaciones'],
    expected: 'No hay ítem de Notificaciones; la página muestra "No tienes notificaciones".',
  },
]);
