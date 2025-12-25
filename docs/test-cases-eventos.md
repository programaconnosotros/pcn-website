# Casos de Prueba - Sistema de Eventos

Documento completo de casos de prueba para realizar regresión del sistema de eventos.

## Tabla de Contenidos

1. [Gestión de Eventos (Admin)](#gestión-de-eventos-admin)
2. [Inscripción a Eventos](#inscripción-a-eventos)
3. [Cancelación de Inscripciones](#cancelación-de-inscripciones)
4. [Eliminación de Inscripciones (Admin)](#eliminación-de-inscripciones-admin)
5. [Sistema de Cupos](#sistema-de-cupos)
6. [Validaciones y Permisos](#validaciones-y-permisos)
7. [Casos Edge y Condiciones de Carrera](#casos-edge-y-condiciones-de-carrera)
8. [Visualización y UI](#visualización-y-ui)

---

## Gestión de Eventos (Admin)

### TC-EV-001: Crear evento exitosamente

**Precondiciones:**

- Usuario autenticado como administrador
- Navegar a `/eventos/nuevo`

**Pasos:**

1. Completar todos los campos obligatorios:
   - Nombre: "Dev Meetup Enero 2025"
   - Descripción: "Meetup mensual de desarrolladores"
   - Fecha: Fecha futura
   - Ciudad: "Buenos Aires"
   - Dirección: "Av. Corrientes 1234"
   - Nombre del lugar: "Coworking Space"
   - URL del flyer: "https://ejemplo.com/flyer.jpg"
2. Dejar campos opcionales vacíos (fecha fin, coordenadas, cupo, sponsors)
3. Hacer clic en "Guardar"

**Resultado Esperado:**

- ✅ Toast de éxito: "Evento creado exitosamente"
- ✅ Redirección a `/eventos/[id]` del evento creado
- ✅ El evento se muestra correctamente con todos los datos ingresados
- ✅ El evento aparece en la lista de eventos (`/eventos`)

---

### TC-EV-002: Crear evento con todos los campos opcionales

**Precondiciones:**

- Usuario autenticado como administrador
- Navegar a `/eventos/nuevo`

**Pasos:**

1. Completar todos los campos obligatorios
2. Completar campos opcionales:
   - Fecha de fin: Fecha posterior a la fecha de inicio
   - Latitud: "-34.6037"
   - Longitud: "-58.3816"
   - Cupo máximo: "50"
   - Agregar 2 sponsors:
     - Sponsor 1: Nombre "Tech Corp", Website "https://techcorp.com"
     - Sponsor 2: Nombre "Dev Academy", Website vacío
3. Hacer clic en "Guardar"

**Resultado Esperado:**

- ✅ Evento creado exitosamente
- ✅ Se muestra la fecha de fin en el detalle
- ✅ Se muestra el mapa con las coordenadas
- ✅ Se muestra información de cupo: "50 cupos disponibles"
- ✅ Se muestran los 2 sponsors en la columna lateral
- ✅ El sponsor con website es clickeable

---

### TC-EV-003: Validación de campos obligatorios

**Precondiciones:**

- Usuario autenticado como administrador
- Navegar a `/eventos/nuevo`

**Pasos:**

1. Intentar guardar sin completar campos obligatorios (uno a la vez):
   - Sin nombre
   - Sin descripción
   - Sin fecha
   - Sin ciudad
   - Sin dirección
   - Sin nombre del lugar
   - Sin URL del flyer
2. Verificar mensajes de error

**Resultado Esperado:**

- ✅ Se muestran mensajes de error específicos para cada campo
- ✅ El formulario no se envía
- ✅ Los mensajes de error son claros y descriptivos

---

### TC-EV-004: Validación de formato de URL del flyer

**Precondiciones:**

- Usuario autenticado como administrador
- Navegar a `/eventos/nuevo`

**Pasos:**

1. Completar todos los campos obligatorios
2. Ingresar URL inválida en "URL del flyer": "no-es-una-url"
3. Hacer clic en "Guardar"

**Resultado Esperado:**

- ✅ Se muestra mensaje de error: "Debe ser una URL válida"
- ✅ El formulario no se envía

---

### TC-EV-005: Validación de fecha de fin posterior a fecha de inicio

**Precondiciones:**

- Usuario autenticado como administrador
- Navegar a `/eventos/nuevo`

**Pasos:**

1. Completar todos los campos obligatorios
2. Fecha: "2025-02-01T18:00"
3. Fecha de fin: "2025-01-01T20:00" (anterior a fecha de inicio)
4. Hacer clic en "Guardar"

**Resultado Esperado:**

- ✅ Se muestra mensaje de error indicando que la fecha de fin debe ser posterior a la fecha de inicio
- ✅ El formulario no se envía

---

### TC-EV-006: Validación de cupo mayor a 0

**Precondiciones:**

- Usuario autenticado como administrador
- Navegar a `/eventos/nuevo`

**Pasos:**

1. Completar todos los campos obligatorios
2. Cupo máximo: "0" o "-5"
3. Hacer clic en "Guardar"

**Resultado Esperado:**

- ✅ Se muestra mensaje de error: "El cupo debe ser un número mayor a 0"
- ✅ El formulario no se envía

---

### TC-EV-007: Agregar múltiples sponsors

**Precondiciones:**

- Usuario autenticado como administrador
- Navegar a `/eventos/nuevo`

**Pasos:**

1. Completar todos los campos obligatorios
2. Hacer clic en "Agregar sponsor" 3 veces
3. Completar los sponsors:
   - Sponsor 1: Nombre "A", Website "https://a.com"
   - Sponsor 2: Nombre "B", Website vacío
   - Sponsor 3: Nombre "C", Website "https://c.com"
4. Eliminar el sponsor 2
5. Hacer clic en "Guardar"

**Resultado Esperado:**

- ✅ Se pueden agregar múltiples sponsors
- ✅ Se pueden eliminar sponsors antes de guardar
- ✅ Solo se guardan los sponsors con nombre (el 1 y 3)
- ✅ Los sponsors se muestran correctamente en el detalle

---

### TC-EV-008: Validación de URL de sponsor

**Precondiciones:**

- Usuario autenticado como administrador
- Navegar a `/eventos/nuevo`

**Pasos:**

1. Completar todos los campos obligatorios
2. Agregar sponsor con URL inválida: "not-a-url"
3. Hacer clic en "Guardar"

**Resultado Esperado:**

- ✅ Se muestra mensaje de error para el campo website del sponsor
- ✅ El formulario no se envía

---

### TC-EV-009: Editar evento exitosamente

**Precondiciones:**

- Usuario autenticado como administrador
- Evento existente creado
- Navegar a `/eventos/[id]/editar`

**Pasos:**

1. Verificar que los campos están pre-llenados con los datos actuales
2. Modificar algunos campos:
   - Cambiar nombre
   - Agregar fecha de fin
   - Modificar cupo
   - Agregar un sponsor
3. Hacer clic en "Guardar"

**Resultado Esperado:**

- ✅ Los campos están pre-llenados correctamente
- ✅ Toast de éxito: "Evento actualizado exitosamente"
- ✅ Redirección a `/eventos/[id]`
- ✅ Los cambios se reflejan en la página de detalle

---

### TC-EV-010: Eliminar evento (soft delete)

**Precondiciones:**

- Usuario autenticado como administrador
- Evento existente creado
- Navegar a `/eventos/[id]/editar`

**Pasos:**

1. Hacer clic en "Eliminar evento"
2. Confirmar en el diálogo de confirmación

**Resultado Esperado:**

- ✅ Se muestra diálogo de confirmación
- ✅ Toast de éxito: "Evento eliminado exitosamente"
- ✅ Redirección a `/eventos`
- ✅ El evento NO aparece en la lista de eventos
- ✅ El evento NO es accesible desde `/eventos/[id]` (redirige o 404)

---

### TC-EV-011: Acceso no autorizado a crear evento

**Precondiciones:**

- Usuario autenticado como usuario regular (no admin)
- O usuario no autenticado

**Pasos:**

1. Intentar navegar a `/eventos/nuevo` directamente

**Resultado Esperado:**

- ✅ Redirección automática (no se muestra el formulario)
- ✅ No se puede crear el evento

---

### TC-EV-012: Acceso no autorizado a editar evento

**Precondiciones:**

- Usuario autenticado como usuario regular (no admin)
- Evento existente

**Pasos:**

1. Intentar navegar a `/eventos/[id]/editar` directamente

**Resultado Esperado:**

- ✅ Redirección automática o error 403
- ✅ No se puede editar el evento

---

## Inscripción a Eventos

### TC-INS-001: Inscribirse a evento exitosamente (usuario no logueado)

**Precondiciones:**

- Usuario NO autenticado
- Evento existente con cupo disponible
- Navegar a `/eventos/[id]/inscripcion`

**Pasos:**

1. Completar formulario:
   - Nombre: "Juan"
   - Apellido: "Pérez"
   - Email: "juan@ejemplo.com"
   - Tipo: "Profesional"
   - Puesto de trabajo: "Desarrollador"
   - Lugar de trabajo: "Tech Corp"
2. Hacer clic en "Inscribirme"

**Resultado Esperado:**

- ✅ Toast de éxito: "¡Te has inscrito exitosamente al evento! 🎉"
- ✅ Redirección a `/eventos/[id]`
- ✅ En la página de detalle se muestra "Ya estás registrado"
- ✅ El cupo disponible disminuye en 1

---

### TC-INS-002: Inscribirse a evento exitosamente (usuario logueado)

**Precondiciones:**

- Usuario autenticado con datos completos en perfil
- Evento existente con cupo disponible
- Navegar a `/eventos/[id]/inscripcion`

**Pasos:**

1. Verificar que los campos están pre-llenados con datos del usuario
2. Seleccionar tipo: "Estudiante"
3. Completar campos de estudiante:
   - Campo de estudio: "Ingeniería en Sistemas"
   - Lugar de estudio: "Universidad X"
4. Hacer clic en "Inscribirme"

**Resultado Esperado:**

- ✅ Campos pre-llenados correctamente
- ✅ Inscripción exitosa
- ✅ Redirección a página de detalle
- ✅ Se muestra "Ya estás registrado"

---

### TC-INS-003: Validación de campos obligatorios en inscripción

**Precondiciones:**

- Evento existente
- Navegar a `/eventos/[id]/inscripcion`

**Pasos:**

1. Intentar enviar formulario sin completar campos (uno a la vez):
   - Sin nombre
   - Sin apellido
   - Sin email
   - Sin tipo
   - Sin campos condicionales (según tipo seleccionado)
2. Verificar mensajes de error

**Resultado Esperado:**

- ✅ Se muestran mensajes de error específicos para cada campo
- ✅ El formulario no se envía
- ✅ Los mensajes son claros

---

### TC-INS-004: Validación de email inválido

**Precondiciones:**

- Evento existente
- Navegar a `/eventos/[id]/inscripcion`

**Pasos:**

1. Completar formulario
2. Email: "email-invalido"
3. Hacer clic en "Inscribirme"

**Resultado Esperado:**

- ✅ Se muestra mensaje de error: "Debe ser un email válido"
- ✅ El formulario no se envía

---

### TC-INS-005: Validación de campos condicionales - Profesional

**Precondiciones:**

- Evento existente
- Navegar a `/eventos/[id]/inscripcion`

**Pasos:**

1. Completar nombre, apellido, email
2. Seleccionar tipo: "Profesional"
3. Dejar "Puesto de trabajo" vacío
4. Completar "Lugar de trabajo"
5. Hacer clic en "Inscribirme"

**Resultado Esperado:**

- ✅ Se muestra mensaje de error: "El puesto de trabajo es requerido para profesionales"
- ✅ El formulario no se envía

**Pasos (variante):**

1. Completar "Puesto de trabajo"
2. Dejar "Lugar de trabajo" vacío
3. Hacer clic en "Inscribirme"

**Resultado Esperado:**

- ✅ Se muestra mensaje de error: "El lugar de trabajo es requerido para profesionales"
- ✅ El formulario no se envía

---

### TC-INS-006: Validación de campos condicionales - Estudiante

**Precondiciones:**

- Evento existente
- Navegar a `/eventos/[id]/inscripcion`

**Pasos:**

1. Completar nombre, apellido, email
2. Seleccionar tipo: "Estudiante"
3. Dejar "Campo de estudio" vacío
4. Completar "Lugar de estudio"
5. Hacer clic en "Inscribirme"

**Resultado Esperado:**

- ✅ Se muestra mensaje de error: "El campo de estudio es requerido para estudiantes"
- ✅ El formulario no se envía

**Pasos (variante):**

1. Completar "Campo de estudio"
2. Dejar "Lugar de estudio" vacío
3. Hacer clic en "Inscribirme"

**Resultado Esperado:**

- ✅ Se muestra mensaje de error: "El lugar de estudio es requerido para estudiantes"
- ✅ El formulario no se envía

---

### TC-INS-007: Prevenir inscripción duplicada (mismo email)

**Precondiciones:**

- Evento existente
- Inscripción existente con email "test@ejemplo.com"

**Pasos:**

1. Navegar a `/eventos/[id]/inscripcion`
2. Completar formulario con email "test@ejemplo.com"
3. Hacer clic en "Inscribirme"

**Resultado Esperado:**

- ✅ Toast de error: "Ya estás registrado en este evento con este correo electrónico"
- ✅ No se crea una nueva inscripción
- ✅ El cupo no cambia

---

### TC-INS-008: Prevenir inscripción duplicada (usuario logueado)

**Precondiciones:**

- Usuario autenticado
- Usuario ya inscrito en el evento

**Pasos:**

1. Navegar a `/eventos/[id]/inscripcion`

**Resultado Esperado:**

- ✅ Se muestra mensaje: "Ya estás inscrito"
- ✅ NO se muestra el formulario
- ✅ Se muestra botón "Volver al evento"

---

### TC-INS-009: Re-inscripción después de cancelar

**Precondiciones:**

- Usuario con inscripción cancelada en el evento
- Evento con cupo disponible

**Pasos:**

1. Navegar a `/eventos/[id]/inscripcion`
2. Completar formulario con el mismo email de la inscripción cancelada
3. Hacer clic en "Inscribirme"

**Resultado Esperado:**

- ✅ Inscripción exitosa
- ✅ Se reactiva la inscripción anterior (no se crea una nueva)
- ✅ El cupo se actualiza correctamente

---

### TC-INS-010: Inscripción cuando el evento ya pasó

**Precondiciones:**

- Evento con fecha en el pasado
- Navegar a `/eventos/[id]`

**Resultado Esperado:**

- ✅ NO se muestra botón "Inscribirme al evento"
- ✅ No se puede acceder a `/eventos/[id]/inscripcion` (o muestra mensaje de que el evento ya pasó)

---

## Cancelación de Inscripciones

### TC-CAN-001: Cancelar inscripción (usuario logueado)

**Precondiciones:**

- Usuario autenticado
- Usuario inscrito en el evento
- Navegar a `/eventos/[id]`

**Pasos:**

1. Verificar que se muestra "Ya estás registrado"
2. Hacer clic en "Cancelar inscripción"
3. Confirmar la acción

**Resultado Esperado:**

- ✅ Toast de éxito: "Inscripción cancelada exitosamente"
- ✅ Se actualiza la página
- ✅ Se muestra botón "Inscribirme al evento" (ya no está registrado)
- ✅ El cupo disponible aumenta en 1
- ✅ La inscripción sigue existiendo en BD pero con `cancelledAt` establecido

---

### TC-CAN-002: Cancelar inscripción (usuario no logueado)

**Precondiciones:**

- Usuario NO autenticado
- Inscripción existente con email "test@ejemplo.com"
- Navegar a `/eventos/[id]`

**Pasos:**

1. Si está registrado, hacer clic en "Cancelar inscripción"
2. Se abre diálogo
3. Ingresar email: "test@ejemplo.com"
4. Hacer clic en "Cancelar inscripción"

**Resultado Esperado:**

- ✅ Diálogo se muestra correctamente
- ✅ Toast de éxito después de cancelar
- ✅ Se actualiza la página
- ✅ El cupo disponible aumenta en 1

---

### TC-CAN-003: Cancelar inscripción con email incorrecto

**Precondiciones:**

- Usuario NO autenticado
- Inscripción existente con email "test@ejemplo.com"
- Navegar a `/eventos/[id]`

**Pasos:**

1. Hacer clic en "Cancelar inscripción"
2. Ingresar email incorrecto: "otro@ejemplo.com"
3. Hacer clic en "Cancelar inscripción"

**Resultado Esperado:**

- ✅ Toast de error: "No se encontró una inscripción con ese correo electrónico para este evento"
- ✅ La inscripción NO se cancela
- ✅ El cupo NO cambia

---

### TC-CAN-004: Intentar cancelar inscripción ya cancelada

**Precondiciones:**

- Usuario con inscripción cancelada
- Navegar a `/eventos/[id]`

**Resultado Esperado:**

- ✅ NO se muestra botón "Cancelar inscripción" (porque no está registrado activamente)
- ✅ Se muestra botón "Inscribirme al evento"

---

### TC-CAN-005: Validación de email vacío en cancelación

**Precondiciones:**

- Usuario NO autenticado
- Navegar a `/eventos/[id]`

**Pasos:**

1. Hacer clic en "Cancelar inscripción"
2. Dejar email vacío
3. Hacer clic en "Cancelar inscripción"

**Resultado Esperado:**

- ✅ Toast de error: "Por favor ingresa tu correo electrónico"
- ✅ El botón está deshabilitado si el email está vacío

---

## Eliminación de Inscripciones (Admin)

### TC-DEL-001: Eliminar inscripción (admin)

**Precondiciones:**

- Usuario autenticado como administrador
- Evento con inscripciones
- Navegar a `/eventos/[id]`

**Pasos:**

1. Verificar lista de inscripciones (solo visible para admin)
2. Hacer clic en botón de eliminar (ícono de basura) de una inscripción activa
3. Confirmar en el diálogo

**Resultado Esperado:**

- ✅ Se muestra diálogo de confirmación con nombre del usuario
- ✅ Toast de éxito: "Inscripción eliminada exitosamente"
- ✅ La inscripción desaparece de la lista
- ✅ El cupo disponible aumenta en 1
- ✅ La inscripción se elimina físicamente de la BD

---

### TC-DEL-002: Cancelar eliminación de inscripción

**Precondiciones:**

- Usuario autenticado como administrador
- Evento con inscripciones
- Navegar a `/eventos/[id]`

**Pasos:**

1. Hacer clic en botón de eliminar
2. Hacer clic en "Cancelar" en el diálogo

**Resultado Esperado:**

- ✅ El diálogo se cierra
- ✅ La inscripción NO se elimina
- ✅ El cupo NO cambia

---

### TC-DEL-003: No mostrar botón eliminar en inscripciones canceladas

**Precondiciones:**

- Usuario autenticado como administrador
- Evento con inscripciones (algunas canceladas)
- Navegar a `/eventos/[id]`

**Resultado Esperado:**

- ✅ Las inscripciones canceladas se muestran con badge "Cancelada"
- ✅ Las inscripciones canceladas NO tienen botón de eliminar
- ✅ Solo las inscripciones activas tienen botón de eliminar

---

### TC-DEL-004: Acceso no autorizado a eliminar inscripción

**Precondiciones:**

- Usuario autenticado como usuario regular (no admin)
- Evento con inscripciones

**Resultado Esperado:**

- ✅ NO se muestra la lista de inscripciones
- ✅ No se puede eliminar inscripciones

---

## Sistema de Cupos

### TC-CUP-001: Inscribirse cuando hay cupo disponible

**Precondiciones:**

- Evento con cupo: 10
- Inscripciones actuales: 5
- Navegar a `/eventos/[id]/inscripcion`

**Pasos:**

1. Verificar que se muestra: "5 de 10 cupos disponibles"
2. Completar formulario de inscripción
3. Hacer clic en "Inscribirme"

**Resultado Esperado:**

- ✅ Inscripción exitosa
- ✅ Se actualiza a "6 de 10 cupos disponibles"
- ✅ El cupo disponible disminuye correctamente

---

### TC-CUP-002: Intentar inscribirse cuando el cupo está completo

**Precondiciones:**

- Evento con cupo: 5
- Inscripciones actuales: 5 (cupo completo)
- Navegar a `/eventos/[id]/inscripcion`

**Pasos:**

1. Verificar que se muestra mensaje: "Cupo completo"
2. Intentar acceder al formulario

**Resultado Esperado:**

- ✅ NO se muestra el formulario
- ✅ Se muestra mensaje: "El cupo del evento está completo. No se pueden aceptar más inscripciones."
- ✅ Se muestra información: "5 de 5 cupos ocupados"
- ✅ Botón "Volver al evento"

---

### TC-CUP-003: Validación de cupo al submitear (condición de carrera)

**Precondiciones:**

- Evento con cupo: 5
- Inscripciones actuales: 4
- Dos usuarios intentan inscribirse simultáneamente

**Pasos:**

1. Usuario A carga la página (ve 1 cupo disponible)
2. Usuario B carga la página (ve 1 cupo disponible)
3. Usuario A completa y envía formulario
4. Usuario B completa y envía formulario (después de que A se inscribió)

**Resultado Esperado:**

- ✅ Usuario A: Inscripción exitosa
- ✅ Usuario B: Toast de error: "El cupo del evento está completo. No se pueden aceptar más inscripciones."
- ✅ Solo 5 inscripciones activas en total
- ✅ El cupo se valida nuevamente antes de crear la inscripción

---

### TC-CUP-004: Cupo ilimitado

**Precondiciones:**

- Evento sin cupo definido (campo vacío)
- Navegar a `/eventos/[id]`

**Resultado Esperado:**

- ✅ NO se muestra información de cupo
- ✅ Se puede inscribir cualquier cantidad de personas
- ✅ No hay validación de cupo

---

### TC-CUP-005: Liberar cupo al cancelar inscripción

**Precondiciones:**

- Evento con cupo: 10
- Inscripciones actuales: 10 (cupo completo)
- Usuario inscrito

**Pasos:**

1. Usuario cancela su inscripción
2. Verificar cupo disponible

**Resultado Esperado:**

- ✅ Se actualiza a "9 de 10 cupos disponibles"
- ✅ Otros usuarios pueden inscribirse nuevamente
- ✅ Las inscripciones canceladas NO cuentan para el cupo

---

### TC-CUP-006: Liberar cupo al eliminar inscripción (admin)

**Precondiciones:**

- Evento con cupo: 10
- Inscripciones actuales: 10 (cupo completo)
- Admin en página de detalle

**Pasos:**

1. Admin elimina una inscripción
2. Verificar cupo disponible

**Resultado Esperado:**

- ✅ Se actualiza a "9 de 10 cupos disponibles"
- ✅ Otros usuarios pueden inscribirse nuevamente

---

### TC-CUP-007: Mostrar información de cupo en página de detalle

**Precondiciones:**

- Evento con cupo: 20
- Inscripciones actuales: 12
- Navegar a `/eventos/[id]`

**Pasos:**

1. Verificar información de cupo en la columna lateral

**Resultado Esperado:**

- ✅ Se muestra: "Quedan 8 lugares disponibles."
- ✅ El botón "Inscribirme al evento" está visible y habilitado

---

### TC-CUP-008: Botón de inscripción no aparece cuando cupo está completo

**Precondiciones:**

- Evento con cupo: 10
- Inscripciones actuales: 10 (cupo completo)
- Usuario NO registrado
- Navegar a `/eventos/[id]`

**Pasos:**

1. Verificar la columna lateral donde debería estar el botón de inscripción

**Resultado Esperado:**

- ✅ NO se muestra el botón "Inscribirme al evento"
- ✅ Se muestra mensaje: "Cupo completo"
- ✅ Se muestra: "Ya no quedan lugares disponibles."

---

### TC-CUP-009: Acceso directo a página de inscripción con cupo completo

**Precondiciones:**

- Evento con cupo: 5
- Inscripciones actuales: 5 (cupo completo)
- Usuario NO registrado en el evento

**Pasos:**

1. Navegar directamente a `/eventos/[id]/inscripcion` (sin pasar por la página de detalle)

**Resultado Esperado:**

- ✅ NO se muestra el formulario de inscripción
- ✅ Se muestra card con:
  - Icono de alerta (AlertCircle)
  - Título: "Cupo completo"
  - Mensaje: "Ya no quedan lugares disponibles."
  - Botón: "Volver al evento"
- ✅ El botón redirige a `/eventos/[id]`

---

### TC-CUP-010: Texto de cupo disponible en formulario de inscripción

**Precondiciones:**

- Evento con cupo: 15
- Inscripciones actuales: 8
- Navegar a `/eventos/[id]/inscripcion`

**Pasos:**

1. Verificar información de cupo arriba del formulario

**Resultado Esperado:**

- ✅ Se muestra: "Cupo disponible:"
- ✅ Se muestra: "Quedan 7 lugares disponibles."
- ✅ Si el cupo está completo, se muestra: "Ya no quedan lugares disponibles."

---

### TC-CUP-011: Editar evento y agregar cupo (validación de tipo)

**Precondiciones:**

- Usuario autenticado como administrador
- Evento existente sin cupo definido
- Navegar a `/eventos/[id]/editar`

**Pasos:**

1. Verificar que el campo "Cupo máximo" está vacío
2. Ingresar un número: "50"
3. Hacer clic en "Guardar"

**Resultado Esperado:**

- ✅ El campo acepta el valor correctamente
- ✅ No se muestra error de tipo (string vs number)
- ✅ El evento se actualiza exitosamente
- ✅ En la página de detalle se muestra: "Quedan 50 lugares disponibles."

---

## Validaciones y Permisos

### TC-PERM-001: Acceso a crear evento (solo admin)

**Precondiciones:**

- Usuario regular (no admin)

**Pasos:**

1. Intentar navegar a `/eventos/nuevo`

**Resultado Esperado:**

- ✅ Redirección automática
- ✅ No se puede acceder al formulario

---

### TC-PERM-002: Acceso a editar evento (solo admin)

**Precondiciones:**

- Usuario regular (no admin)
- Evento existente

**Pasos:**

1. Intentar navegar a `/eventos/[id]/editar`

**Resultado Esperado:**

- ✅ Redirección automática o error 403
- ✅ No se puede editar el evento

---

### TC-PERM-003: Ver lista de inscripciones (solo admin)

**Precondiciones:**

- Usuario regular (no admin)
- Evento con inscripciones
- Navegar a `/eventos/[id]`

**Resultado Esperado:**

- ✅ NO se muestra la sección de inscripciones
- ✅ Solo admin puede ver la lista

---

### TC-PERM-004: Botón editar evento (solo admin)

**Precondiciones:**

- Usuario regular (no admin)
- Evento existente
- Navegar a `/eventos/[id]`

**Resultado Esperado:**

- ✅ NO se muestra botón "Editar evento"
- ✅ Solo admin ve el botón

---

### TC-PERM-005: Acceso a página de inscripciones (solo admin)

**Precondiciones:**

- Usuario regular (no admin)
- Evento existente con inscripciones

**Pasos:**

1. Intentar navegar a `/eventos/[id]/inscripciones` directamente

**Resultado Esperado:**

- ✅ Redirección automática a `/eventos/[id]`
- ✅ No se puede acceder a la página de inscripciones

---

### TC-PERM-006: Card de inscripciones en página de detalle (solo admin)

**Precondiciones:**

- Usuario regular (no admin)
- Evento con inscripciones
- Navegar a `/eventos/[id]`

**Resultado Esperado:**

- ✅ NO se muestra el card de inscripciones
- ✅ Solo admin ve el card con resumen y botón "Ver todas"

---

## Página de Inscripciones (Admin)

### TC-INS-ADM-001: Acceder a página de inscripciones

**Precondiciones:**

- Usuario autenticado como administrador
- Evento existente con inscripciones
- Navegar a `/eventos/[id]`

**Pasos:**

1. Verificar que se muestra el card de inscripciones
2. Hacer clic en "Ver todas"

**Resultado Esperado:**

- ✅ Se muestra card con resumen: "X inscripciones activas" y "Y total (incluyendo canceladas)"
- ✅ Botón "Ver todas" visible
- ✅ Redirección a `/eventos/[id]/inscripciones`
- ✅ Se muestra la tabla con todas las inscripciones

---

### TC-INS-ADM-002: Visualizar tabla de inscripciones

**Precondiciones:**

- Usuario autenticado como administrador
- Evento con múltiples inscripciones (activas y canceladas)
- Navegar a `/eventos/[id]/inscripciones`

**Pasos:**

1. Verificar estructura de la tabla
2. Verificar columnas y datos mostrados

**Resultado Esperado:**

- ✅ Tabla con columnas: Nombre, Email, Tipo, Información, Estado, Fecha de inscripción, Acciones
- ✅ Todas las inscripciones se muestran ordenadas por fecha descendente (más recientes primero)
- ✅ Inscripciones canceladas se muestran con opacidad reducida
- ✅ Header muestra resumen: "X total - Y activas, Z canceladas"

---

### TC-INS-ADM-003: Ver información de inscripciones en tabla

**Precondiciones:**

- Usuario autenticado como administrador
- Evento con inscripciones de diferentes tipos
- Navegar a `/eventos/[id]/inscripciones`

**Pasos:**

1. Verificar información mostrada para cada tipo de inscripción

**Resultado Esperado:**

- ✅ Inscripciones de tipo "Profesional" muestran:
  - Badge "Profesional"
  - Información: "Trabaja: [puesto]" y "En: [lugar]"
- ✅ Inscripciones de tipo "Estudiante" muestran:
  - Badge "Estudiante"
  - Información: "Estudia: [campo]" y "En: [lugar]"
- ✅ Email y nombre completo visibles
- ✅ Fecha de inscripción formateada correctamente

---

### TC-INS-ADM-004: Estados de inscripciones en tabla

**Precondiciones:**

- Usuario autenticado como administrador
- Evento con inscripciones activas y canceladas
- Navegar a `/eventos/[id]/inscripciones`

**Pasos:**

1. Verificar cómo se muestran los diferentes estados

**Resultado Esperado:**

- ✅ Inscripciones activas muestran badge "Activa" (verde/default)
- ✅ Inscripciones canceladas muestran badge "Cancelada" (rojo/destructive)
- ✅ Inscripciones canceladas tienen opacidad reducida
- ✅ Solo inscripciones activas tienen botón de eliminar

---

### TC-INS-ADM-005: Eliminar inscripción desde tabla

**Precondiciones:**

- Usuario autenticado como administrador
- Evento con inscripciones activas
- Navegar a `/eventos/[id]/inscripciones`

**Pasos:**

1. Hacer clic en botón de eliminar (ícono de basura) de una inscripción activa
2. Confirmar en el diálogo

**Resultado Esperado:**

- ✅ Se muestra diálogo de confirmación con nombre del usuario
- ✅ Toast de éxito: "Inscripción eliminada exitosamente"
- ✅ La inscripción desaparece de la tabla
- ✅ El resumen en el header se actualiza
- ✅ El cupo disponible aumenta en 1

---

### TC-INS-ADM-006: No mostrar botón eliminar en inscripciones canceladas

**Precondiciones:**

- Usuario autenticado como administrador
- Evento con inscripciones canceladas
- Navegar a `/eventos/[id]/inscripciones`

**Resultado Esperado:**

- ✅ Las inscripciones canceladas NO tienen botón de eliminar en la columna "Acciones"
- ✅ Solo las inscripciones activas tienen botón de eliminar

---

### TC-INS-ADM-007: Evento sin inscripciones

**Precondiciones:**

- Usuario autenticado como administrador
- Evento sin inscripciones
- Navegar a `/eventos/[id]/inscripciones`

**Resultado Esperado:**

- ✅ Se muestra mensaje: "Aún no hay inscripciones para este evento."
- ✅ No se muestra la tabla
- ✅ El header muestra: "Inscripciones (0 total - 0 activas, 0 canceladas)"

---

### TC-INS-ADM-008: Navegación y breadcrumbs

**Precondiciones:**

- Usuario autenticado como administrador
- Evento existente
- Navegar a `/eventos/[id]/inscripciones`

**Pasos:**

1. Verificar breadcrumbs
2. Hacer clic en botón "Volver" (flecha hacia atrás)

**Resultado Esperado:**

- ✅ Breadcrumbs muestran: Inicio > Eventos > [Nombre del evento] > Inscripciones
- ✅ Botón "Volver" redirige a `/eventos/[id]`
- ✅ Navegación funciona correctamente

---

### TC-INS-ADM-009: Resumen en página de detalle

**Precondiciones:**

- Usuario autenticado como administrador
- Evento con inscripciones (activas y canceladas)
- Navegar a `/eventos/[id]`

**Pasos:**

1. Verificar card de inscripciones en la página de detalle

**Resultado Esperado:**

- ✅ Se muestra card con título "Inscripciones"
- ✅ Muestra cantidad de inscripciones activas
- ✅ Muestra total de inscripciones (incluyendo canceladas)
- ✅ Botón "Ver todas" visible y funcional
- ✅ Al hacer clic, redirige a `/eventos/[id]/inscripciones`

---

### TC-INS-ADM-010: Orden de inscripciones en tabla

**Precondiciones:**

- Usuario autenticado como administrador
- Evento con múltiples inscripciones creadas en diferentes fechas
- Navegar a `/eventos/[id]/inscripciones`

**Resultado Esperado:**

- ✅ Las inscripciones están ordenadas por fecha descendente
- ✅ Las inscripciones más recientes aparecen primero
- ✅ El orden se mantiene consistente

---

## Casos Edge y Condiciones de Carrera

### TC-EDGE-001: Inscripción simultánea con mismo email

**Precondiciones:**

- Evento con cupo disponible
- Dos usuarios intentan inscribirse con el mismo email simultáneamente

**Pasos:**

1. Usuario A completa formulario con email "test@ejemplo.com"
2. Usuario B completa formulario con email "test@ejemplo.com"
3. Ambos envían casi simultáneamente

**Resultado Esperado:**

- ✅ Solo una inscripción se crea exitosamente
- ✅ El otro usuario recibe error: "Ya estás registrado en este evento con este correo electrónico"
- ✅ El constraint único de BD previene duplicados

---

### TC-EDGE-002: Cupo completo entre carga y envío

**Precondiciones:**

- Evento con cupo: 5
- Inscripciones actuales: 4

**Pasos:**

1. Usuario A carga página de inscripción (ve 1 cupo disponible)
2. Otro usuario se inscribe (cupo completo)
3. Usuario A completa y envía formulario

**Resultado Esperado:**

- ✅ Validación en servidor detecta cupo completo
- ✅ Toast de error: "El cupo del evento está completo. No se pueden aceptar más inscripciones."
- ✅ No se crea la inscripción

---

### TC-EDGE-003: Evento eliminado mientras se completa formulario

**Precondiciones:**

- Evento existente
- Usuario en página de inscripción

**Pasos:**

1. Admin elimina el evento (soft delete)
2. Usuario completa y envía formulario

**Resultado Esperado:**

- ✅ Error: "Evento no encontrado"
- ✅ No se crea la inscripción

---

### TC-EDGE-004: Inscripción con email que tiene inscripción cancelada

**Precondiciones:**

- Evento con cupo disponible
- Inscripción cancelada con email "test@ejemplo.com"

**Pasos:**

1. Usuario intenta inscribirse con email "test@ejemplo.com"
2. Completar formulario
3. Enviar

**Resultado Esperado:**

- ✅ Inscripción exitosa
- ✅ Se reactiva la inscripción anterior (no se crea nueva)
- ✅ El cupo se actualiza correctamente

---

### TC-EDGE-005: Cancelar y re-inscribirse rápidamente

**Precondiciones:**

- Usuario inscrito en evento
- Evento con cupo disponible

**Pasos:**

1. Usuario cancela inscripción
2. Inmediatamente intenta inscribirse de nuevo

**Resultado Esperado:**

- ✅ Cancelación exitosa
- ✅ Re-inscripción exitosa
- ✅ El cupo se maneja correctamente en ambos casos

---

### TC-EDGE-006: Acceso directo a inscripción con cupo completo (URL directa)

**Precondiciones:**

- Evento con cupo: 10
- Inscripciones actuales: 10 (cupo completo)
- Usuario NO registrado
- URL directa: `/eventos/[id]/inscripcion`

**Pasos:**

1. Navegar directamente a la URL de inscripción (sin pasar por página de detalle)
2. Verificar que se muestra el mensaje correcto

**Resultado Esperado:**

- ✅ NO se muestra el formulario
- ✅ Se muestra card con mensaje de cupo completo
- ✅ Mensaje: "Ya no quedan lugares disponibles."
- ✅ Botón para volver al evento

---

### TC-EDGE-007: Cambio de cupo entre carga de página y envío de formulario

**Precondiciones:**

- Evento con cupo: 10
- Inscripciones actuales: 9
- Usuario en página de inscripción

**Pasos:**

1. Usuario carga página de inscripción (ve 1 lugar disponible)
2. Otro usuario se inscribe (cupo completo)
3. Usuario original completa y envía formulario

**Resultado Esperado:**

- ✅ Validación en servidor detecta cupo completo
- ✅ Toast de error: "El cupo del evento está completo. No se pueden aceptar más inscripciones."
- ✅ No se crea la inscripción
- ✅ El usuario puede ver el mensaje de cupo completo si recarga

---

## Visualización y UI

### TC-UI-001: Página de lista de eventos

**Precondiciones:**

- Varios eventos creados (algunos eliminados)
- Navegar a `/eventos`

**Resultado Esperado:**

- ✅ Se muestran solo eventos no eliminados
- ✅ Eventos ordenados por fecha descendente (más recientes primero)
- ✅ Cada evento muestra: imagen, nombre, fecha, descripción truncada

---

### TC-UI-002: Página de detalle del evento

**Precondiciones:**

- Evento con todos los datos
- Navegar a `/eventos/[id]`

**Resultado Esperado:**

- ✅ Se muestra toda la información del evento
- ✅ Fotos del evento (si hay)
- ✅ Mapa con ubicación (si hay coordenadas)
- ✅ Sponsors en columna lateral (si hay)
- ✅ Información de cupo (si está definido)
- ✅ Botones según estado y permisos

---

### TC-UI-003: Responsive - Sponsors en columna lateral

**Precondiciones:**

- Evento con sponsors
- Pantalla grande (xl breakpoint)

**Resultado Esperado:**

- ✅ Sponsors se muestran en la columna lateral (segunda columna)
- ✅ Debajo de la card de información
- ✅ En pantallas pequeñas, se muestran en la columna principal

---

### TC-UI-004: Descripción truncada en tarjetas

**Precondiciones:**

- Evento con descripción larga
- Navegar a `/eventos`

**Resultado Esperado:**

- ✅ La descripción se trunca con puntos suspensivos
- ✅ Máximo 3 líneas (`line-clamp-3`)

---

### TC-UI-005: Estado visual de inscripciones canceladas

**Precondiciones:**

- Admin en página de detalle
- Evento con inscripciones (algunas canceladas)

**Resultado Esperado:**

- ✅ Inscripciones canceladas se muestran con opacidad reducida
- ✅ Badge "Cancelada" visible
- ✅ NO tienen botón de eliminar

---

### TC-UI-006: Información de cupo en formulario de inscripción

**Precondiciones:**

- Evento con cupo definido
- Navegar a `/eventos/[id]/inscripcion`

**Resultado Esperado:**

- ✅ Se muestra información de cupo disponible arriba del formulario
- ✅ Formato: "Quedan X lugares disponibles." cuando hay cupo
- ✅ Formato: "Ya no quedan lugares disponibles." cuando el cupo está completo
- ✅ Icono de usuarios visible

---

### TC-UI-007: Pre-fill de datos en formulario de inscripción

**Precondiciones:**

- Usuario autenticado con perfil completo
- Navegar a `/eventos/[id]/inscripcion`

**Resultado Esperado:**

- ✅ Campos pre-llenados: nombre, apellido, email
- ✅ Campos de trabajo/estudio pre-llenados según perfil
- ✅ Usuario puede modificar los datos

---

### TC-UI-008: Redirección desde /meetup

**Precondiciones:**

- Evento futuro con nombre que contiene "meetup" (case-insensitive)
- Navegar a `/meetup`

**Resultado Esperado:**

- ✅ Redirección automática a `/eventos/[id]/inscripcion` del próximo meetup
- ✅ Si no hay meetup futuro, redirección a `/eventos`

---

### TC-UI-009: Mensajes de cupo en diferentes estados

**Precondiciones:**

- Evento con cupo: 20
- Varios estados de inscripciones

**Pasos:**

1. Verificar mensajes en diferentes escenarios:
   - Cupo disponible (15 inscripciones)
   - Cupo completo (20 inscripciones)
   - En página de detalle
   - En formulario de inscripción
   - En página de inscripción cuando cupo completo

**Resultado Esperado:**

- ✅ Cuando hay cupo: "Quedan X lugares disponibles." (con punto final)
- ✅ Cuando cupo completo: "Ya no quedan lugares disponibles." (con punto final)
- ✅ Los mensajes son consistentes en todas las páginas
- ✅ No se muestra información redundante (ej: "X de Y cupos")

---

## Checklist de Regresión

### Funcionalidades Críticas

- [ ] Crear evento con todos los campos
- [ ] Editar evento (incluyendo agregar/modificar cupo)
- [ ] Eliminar evento (soft delete)
- [ ] Inscribirse a evento (logueado y no logueado)
- [ ] Cancelar inscripción (logueado y no logueado)
- [ ] Eliminar inscripción (admin)
- [ ] Validación de cupo completo
- [ ] Prevenir duplicados de email
- [ ] Botón de inscripción no aparece cuando cupo completo
- [ ] Mensaje correcto al acceder directo a inscripción con cupo completo
- [ ] Acceder a página de inscripciones (solo admin)
- [ ] Visualizar tabla de inscripciones con todos los datos
- [ ] Eliminar inscripción desde la tabla

### Validaciones

- [ ] Campos obligatorios
- [ ] Formatos de URL y email
- [ ] Campos condicionales (estudiante/profesional)
- [ ] Fechas (fin posterior a inicio)
- [ ] Cupo mayor a 0

### Permisos

- [ ] Solo admin puede crear/editar/eliminar eventos
- [ ] Solo admin ve card de inscripciones en página de detalle
- [ ] Solo admin puede acceder a página de inscripciones
- [ ] Solo admin puede eliminar inscripciones

### Casos Edge

- [ ] Inscripción simultánea con mismo email
- [ ] Cupo completo entre carga y envío
- [ ] Re-inscripción después de cancelar
- [ ] Liberación de cupo al cancelar/eliminar

### UI/UX

- [ ] Responsive design
- [ ] Mensajes de error claros
- [ ] Toasts informativos
- [ ] Estados visuales correctos
- [ ] Texto de cupo: "Quedan X lugares disponibles."
- [ ] Texto cuando cupo completo: "Ya no quedan lugares disponibles."
- [ ] Consistencia de mensajes en todas las páginas
- [ ] Texto de cupo: "Quedan X lugares disponibles."
- [ ] Texto cuando cupo completo: "Ya no quedan lugares disponibles."
- [ ] Consistencia de mensajes en todas las páginas

---

**Notas para Testing:**

1. **Datos de prueba recomendados:**

   - Crear varios eventos con diferentes configuraciones
   - Crear usuarios de prueba (admin y regular)
   - Crear inscripciones de prueba (activas y canceladas)

2. **Herramientas útiles:**

   - DevTools del navegador para verificar requests
   - Consola de Prisma para verificar datos en BD
   - Network tab para verificar validaciones

3. **Casos a probar en diferentes navegadores:**

   - Chrome
   - Firefox
   - Safari
   - Edge

4. **Casos a probar en diferentes dispositivos:**
   - Desktop
   - Tablet
   - Mobile

---

**Última actualización**: Diciembre 2024
