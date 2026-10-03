import { defineManualCases } from './define';

export const authCases = defineManualCases('auth', [
  {
    title: 'Iniciar sesión con credenciales válidas',
    priority: 'alta',
    pre: ['Usuario con email verificado y contraseña conocida', 'Sesión cerrada'],
    steps: [
      'Ir a /autenticacion/iniciar-sesion',
      'Completar "Correo electrónico" y "Contraseña"',
      'Tocar ingresar();',
    ],
    expected:
      'El botón muestra "ingresando...", aparece el toast "Hola! 👋" y redirige a /. La cookie sessionId es httpOnly y dura 30 días.',
  },
  {
    title: 'Credenciales incorrectas no revelan si el email existe',
    priority: 'alta',
    pre: ['Sesión cerrada'],
    steps: [
      'Intentar ingresar con un email que no existe',
      'Intentar ingresar con un email existente y una contraseña incorrecta',
    ],
    expected:
      'En ambos casos el toast dice exactamente "Credenciales incorrectas." — el mensaje no permite enumerar cuentas.',
  },
  {
    title: 'Validación del formulario de login',
    priority: 'media',
    steps: ['Escribir "agus@" en el email', 'Dejar la contraseña vacía', 'Tocar ingresar();'],
    expected:
      'Se muestran "Correo electrónico inválido" e "Ingresá tu contraseña" y no se envía nada al servidor.',
  },
  {
    title: 'Login con email sin verificar redirige a verificación',
    priority: 'alta',
    pre: ['Cuenta registrada que todavía no verificó el email'],
    steps: ['Ingresar con la contraseña correcta de esa cuenta'],
    expected:
      'Toast "Detectamos que tu email no está verificado…" y redirección a /autenticacion/verificar-email?email=… conservando el redirect.',
  },
  {
    title: 'El redirect después del login solo acepta rutas del sitio',
    priority: 'alta',
    pre: ['Sesión cerrada'],
    steps: [
      'Abrir /autenticacion/iniciar-sesion?redirect=https://evil.com y loguearse',
      'Repetir con ?redirect=//evil.com y ?redirect=/\\evil',
      'Repetir con ?redirect=/eventos',
    ],
    expected:
      'Los tres primeros terminan en / (protección de open redirect); el último lleva a /eventos.',
  },
  {
    title: 'Rate limit de intentos de login',
    priority: 'alta',
    pre: [
      'Sesión cerrada, sin ser admin',
      'Servidor recién reiniciado (los contadores viven en memoria)',
    ],
    steps: ['Fallar el login 20 veces seguidas desde la misma IP', 'Intentar una vez más'],
    expected:
      'El intento 21 muestra "Hubo demasiados intentos de inicio de sesión seguidos…" con el tiempo de espera ("9 minutos", "1 hora"…), incluso en producción donde los errores se ocultan.',
  },
  {
    title: 'Registro con datos válidos',
    priority: 'alta',
    pre: ['Email que no tenga cuenta', 'MailHog corriendo en localhost:18025'],
    steps: [
      'Ir a /autenticacion/registro',
      'Completar nombre, email, contraseña y confirmación, País = Argentina y Provincia',
      'Tocar crearCuenta();',
    ],
    expected:
      'Toast "Usuario creado exitosamente! 🥳", redirección a /autenticacion/verificar-email?email=… y llega a MailHog el email "Verificá tu correo electrónico - Programa Con Nosotros".',
  },
  {
    title: 'Validaciones del registro',
    priority: 'media',
    steps: [
      'Nombre "A" y luego "Agus 2"',
      'Contraseña de 7 caracteres, luego de 73',
      'Confirmación distinta de la contraseña',
      'País = Argentina sin provincia',
    ],
    expected:
      'Mensajes: "El nombre debe tener al menos 2 caracteres", "…solo puede contener letras…", "La contraseña debe tener al menos 8 caracteres", "…no puede tener más de 72 caracteres", "Las contraseñas no coinciden", "La provincia es requerida si el país es Argentina".',
  },
  {
    title: 'Registro con email ya usado',
    priority: 'media',
    pre: ['Email que ya tiene cuenta'],
    steps: ['Registrarse con ese email'],
    expected: 'Error "Ya hay un usuario con ese correo electrónico." y no se crea otra cuenta.',
  },
  {
    title: 'Verificar email con el código correcto',
    priority: 'alta',
    pre: ['Cuenta recién registrada'],
    steps: [
      'Abrir /autenticacion/verificar-email?email=<email>',
      'Copiar el código de 6 dígitos de MailHog',
      'Tocar verificarEmail();',
    ],
    expected:
      'El código se envía solo al cargar la página. Título "¡Email verificado!", toast "¡Email verificado! Redirigiendo..." y a los 1,5 s redirige con la sesión ya iniciada.',
  },
  {
    title: 'El código se invalida después de 5 intentos fallidos',
    priority: 'alta',
    pre: ['Código de verificación vigente'],
    steps: ['Ingresar 5 códigos incorrectos', 'Ingresar el código correcto'],
    expected:
      'Todos fallan con "Código inválido o expirado. Intentá de nuevo." — incluso el correcto. Hay que pedir uno nuevo.',
  },
  {
    title: 'Reenvío del código con cuenta regresiva',
    priority: 'baja',
    steps: ['En verificar-email tocar "Reenviar código"', 'Probar el código anterior'],
    expected:
      'El botón pasa a "Enviando..." y luego "Reenviar en {N}s" (60 s). El código anterior deja de funcionar.',
  },
  {
    title: 'Verificar email sin parámetro',
    priority: 'baja',
    steps: ['Abrir /autenticacion/verificar-email sin ?email='],
    expected: 'Muestra "No se especificó un email para verificar." y el link irAIniciarSesion();.',
  },
  {
    title: 'Recuperar contraseña de punta a punta',
    priority: 'alta',
    pre: ['Usuario logueado en otro navegador'],
    steps: [
      'Ir a /autenticacion/recuperar-clave y pedir el código (enviarCodigo();)',
      'Ingresar el código de MailHog (verificarCodigo();)',
      'Elegir una contraseña nueva de 8+ caracteres (actualizarClave();)',
      'Recargar el otro navegador',
    ],
    expected:
      'Pasa por los pasos email → código → clave hasta "¡Contraseña actualizada!". Se puede entrar con la clave nueva y el otro navegador quedó deslogueado (se borran todas las sesiones).',
  },
  {
    title: 'Recuperar contraseña de un email inexistente',
    priority: 'media',
    steps: ['Pedir el código para un email sin cuenta'],
    expected:
      'Se muestra igual "Código enviado. Revisá tu correo electrónico." y no llega ningún email (no se revela qué cuentas existen).',
  },
  {
    title: 'Cerrar sesión',
    priority: 'media',
    pre: ['Usuario logueado'],
    steps: ['Cerrar sesión desde el menú de usuario', 'Volver atrás con el navegador'],
    expected:
      'Redirige a /autenticacion/iniciar-sesion, la sesión se borra en la base y las páginas privadas ya no muestran datos del usuario.',
  },
]);

export const eventCases = defineManualCases('eventos', [
  {
    title: 'Inscribirse a un evento con cupo',
    priority: 'alta',
    pre: ['Usuario logueado', 'Evento futuro con cupo libre e inscripción interna'],
    steps: ['Abrir /eventos/[id]', 'Tocar inscribirme();', 'Cerrar el diálogo con entendido();'],
    expected:
      'Diálogo "¡Te has inscrito exitosamente! 🎉", la página pasa a "Ya estás registrado" con cancelarInscripcion(); y el contador "Quedan {N} lugares disponibles." baja en uno.',
  },
  {
    title: 'Inscripción automática después del login',
    priority: 'alta',
    pre: ['Sesión cerrada', 'Evento futuro con cupo'],
    steps: ['Tocar inscribirme(); en el evento', 'Iniciar sesión en la pantalla a la que redirige'],
    expected:
      'Redirige a /autenticacion/iniciar-sesion?redirect=/eventos/{id}&autoRegister=true y al volver al evento ya queda inscripto, con el diálogo de éxito.',
  },
  {
    title: 'Evento lleno: sumarse a la lista de espera',
    priority: 'alta',
    pre: ['Evento con el cupo completo', 'Usuario logueado no inscripto'],
    steps: ['Abrir el evento', 'Tocar unirmeAListaDeEspera();'],
    expected:
      'Se ve "Cupo completo". Toast "Te sumaste a la lista de espera (#N)" y la página muestra "Estás en la lista de espera · lugar #N" con salirDeLaListaDeEspera();.',
  },
  {
    title: 'Al cancelar una inscripción sube el primero de la lista de espera',
    priority: 'alta',
    pre: ['Evento lleno con al menos 2 personas en lista de espera', 'MailHog corriendo'],
    steps: [
      'Con un usuario inscripto, tocar cancelarInscripcion();',
      'Revisar el evento con el #1 de la lista',
    ],
    expected:
      'Toast "Inscripción cancelada exitosamente". El #1 queda inscripto (FIFO), recibe el email "Conseguiste un lugar en {evento}" y el resto de la lista avanza un lugar.',
  },
  {
    title: 'Subir el cupo promueve a la lista de espera',
    priority: 'alta',
    pre: ['Evento lleno con 3 personas esperando', 'Usuario organizador'],
    steps: ['Editar el evento y subir "Cupo máximo" en 2', 'Guardar'],
    expected:
      'Las dos primeras personas de la lista quedan inscriptas y reciben el email; la tercera sigue esperando como #1.',
  },
  {
    title: 'Doble clic en inscribirme no duplica la inscripción',
    priority: 'media',
    pre: ['Usuario logueado, evento con cupo'],
    steps: ['Hacer doble clic rápido en inscribirme();'],
    expected:
      'Queda una sola inscripción (restricción única en la base); si el segundo request llega, el error es "Ya estás inscripto en este evento o en su lista de espera".',
  },
  {
    title: 'Evento con inscripción externa',
    priority: 'media',
    pre: ['Evento con URL de inscripción externa'],
    steps: ['Tocar el botón de inscripción', 'Abrir /eventos/[id]/inscripcion'],
    expected:
      'El botón abre la URL externa en otra pestaña y la ruta /inscripcion redirige a ella; no se crea inscripción interna.',
  },
  {
    title: 'Evento terminado se muestra como recuerdo',
    priority: 'baja',
    pre: ['Evento con fecha pasada'],
    steps: ['Abrir el evento'],
    expected:
      'La página cambia a la vista de recuerdo, sin botón de inscripción ni lista de espera.',
  },
  {
    title: 'Crear un evento presencial',
    priority: 'alta',
    pre: ['Usuario admin o embajador'],
    steps: [
      'En /eventos tocar crearEvento();',
      'Completar nombre, descripción, inicio, ciudad, lugar, dirección y cupo',
      'Guardar',
    ],
    expected:
      'Muestra "guardando...", redirige a /eventos/{id} y el creador figura como organizador.',
  },
  {
    title: 'Validaciones del formulario de evento',
    priority: 'media',
    pre: ['Usuario admin'],
    steps: [
      'Nombre de 2 caracteres, descripción de 9',
      'Fin anterior al inicio',
      'Presencial sin dirección',
      'Cupo 0',
      'URL corta "Mi Evento"',
    ],
    expected:
      'Bloquea el envío con "La fecha de finalización debe ser posterior a la fecha de inicio", "El cupo debe ser un número mayor a 0", "Solo minúsculas, números y guiones (sin espacios)", etc.',
  },
  {
    title: 'Solo admins y embajadores pueden crear eventos',
    priority: 'alta',
    pre: ['Usuario común logueado'],
    steps: ['Abrir /eventos', 'Navegar directo a /eventos/nuevo'],
    expected:
      'No ve crearEvento(); sino el link de WhatsApp "quiero organizar algo"; /eventos/nuevo redirige a /eventos.',
  },
  {
    title: 'Un organizador puede editar pero no borrar',
    priority: 'alta',
    pre: ['Usuario agregado como organizador de un evento que no creó'],
    steps: ['Abrir /eventos/[id]/editar'],
    expected:
      'Puede guardar cambios, pero no ve el botón de eliminar. Llamar la acción igual devuelve "Solo puedes eliminar los eventos que creaste".',
  },
  {
    title: 'Rutas de gestión protegidas',
    priority: 'alta',
    pre: ['Usuario común logueado'],
    steps: [
      'Abrir /eventos/[id]/editar',
      'Abrir /eventos/[id]/inscripciones',
      'Abrir /eventos/[id]/propuestas-de-charlas',
    ],
    expected: 'Todas redirigen a /eventos/[id] sin mostrar datos de inscriptos.',
  },
  {
    title: 'Sumar y quitar organizadores',
    priority: 'media',
    pre: ['Admin o embajador creador del evento'],
    steps: [
      'Ir a /eventos/[id]/organizadores',
      'Buscar una persona por nombre y sumarla',
      'Quitarla con "Quitar a {nombre}"',
    ],
    expected: 'Toasts "{nombre} ahora organiza el evento" y "{nombre} ya no organiza el evento".',
  },
  {
    title: 'Gestionar inscripciones como organizador',
    priority: 'media',
    pre: ['Organizador de un evento con inscriptos y lista de espera'],
    steps: [
      'Abrir /eventos/[id]/inscripciones',
      'Revisar las estadísticas y la tabla "lista de espera"',
      'Eliminar una inscripción y confirmar',
    ],
    expected:
      'Estadísticas activas / estudiantes / profesionales / en espera. Diálogo "¿Eliminar inscripción?", toast "Inscripción eliminada exitosamente" y el primero de la lista de espera queda inscripto.',
  },
  {
    title: 'Eliminar un evento',
    priority: 'media',
    pre: ['Admin'],
    steps: ['En /eventos/[id]/editar eliminar y confirmar en el diálogo'],
    expected:
      'Diálogo "¿Estás seguro de eliminar este evento?", toasts "Eliminando evento..." y "Evento eliminado correctamente", redirige a /eventos y el evento ya no aparece (soft delete).',
  },
  {
    title: 'Descargar el evento en el calendario',
    priority: 'baja',
    steps: ['Abrir /eventos/[id]/calendario.ics', 'Abrir /eventos/no-existe/calendario.ics'],
    expected:
      'Descarga pcn-evento-{id}.ics (text/calendar) que se importa bien en Google Calendar y Apple Calendar; el id inexistente devuelve 404.',
  },
  {
    title: 'Anuncios de un evento',
    priority: 'media',
    pre: ['Admin'],
    steps: [
      'En /anuncios tocar nuevoAnuncio(); y asociarlo a un evento, fijado',
      'Crear otro sin publicar',
      'Abrir el evento',
    ],
    expected:
      'Toast "Anuncio creado exitosamente". En el evento aparece solo el publicado, fijado primero; un usuario común no ve nuevoAnuncio();.',
  },
]);

export const talkCases = defineManualCases('charlas', [
  {
    title: 'Proponer una charla',
    priority: 'alta',
    pre: ['Usuario logueado', 'Evento con call for speakers habilitado'],
    steps: [
      'En el evento tocar "proponer →"',
      'Revisar que el orador 1 viene precargado del perfil',
      'Completar título y descripción y tocar enviarPropuesta();',
    ],
    expected:
      'Toast "¡Propuesta enviada! Nos pondremos en contacto pronto.", redirige al evento y los admins reciben la notificación "Nueva propuesta de charla".',
  },
  {
    title: 'Validaciones de oradores en la propuesta',
    priority: 'media',
    steps: [
      'Teléfono "+54 381 123"',
      'No marcar profesional ni estudiante',
      'Marcar profesional sin empresa',
      'Agregar un segundo orador con agregarOrador(); y quitarlo',
    ],
    expected:
      'Muestra "El teléfono debe contener solo dígitos…", "Debés seleccionar al menos una opción: profesional o estudiante" y "La empresa es requerida para profesionales". El botón de quitar solo aparece con 2+ oradores.',
  },
  {
    title: 'Call for speakers cerrado',
    priority: 'media',
    pre: ['Evento sin call for speakers'],
    steps: ['Abrir /eventos/[id]/proponer-charla directo'],
    expected: 'Redirige a la página del evento; no se puede proponer.',
  },
  {
    title: 'Aceptar una propuesta y crear la charla',
    priority: 'alta',
    pre: ['Organizador del evento con una propuesta pendiente'],
    steps: [
      'Abrir /eventos/[id]/propuestas-de-charlas',
      'Tocar aceptar(); y luego crearCharla();',
      'Intentar crearla otra vez',
    ],
    expected:
      'Toasts "Propuesta aceptada" y "Charla creada a partir de la propuesta"; el botón queda como "// charla creada" deshabilitado y la charla aparece en /charlas.',
  },
  {
    title: 'Un organizador de otro evento no puede revisar propuestas ajenas',
    priority: 'alta',
    pre: ['Organizador del evento A', 'Propuesta del evento B'],
    steps: ['Intentar aceptar o borrar la propuesta del evento B'],
    expected: 'Error "No tenés permisos para realizar esta acción".',
  },
  {
    title: 'Buscar y filtrar charlas',
    priority: 'baja',
    steps: [
      'Abrir /charlas',
      'Buscar por el nombre de un speaker',
      'Filtrar "con video" y luego "con slides"',
      'Abrir /charlas?tab=externas',
    ],
    expected:
      'Las charlas se agrupan por año, el filtro y la búsqueda se combinan, y ?tab=externas abre la pestaña Externas.',
  },
  {
    title: 'Solo admins gestionan charlas desde /charlas',
    priority: 'media',
    pre: ['Usuario común logueado'],
    steps: ['Abrir /charlas'],
    expected: 'No ve nuevaCharla(); ni los controles de editar y eliminar.',
  },
]);
