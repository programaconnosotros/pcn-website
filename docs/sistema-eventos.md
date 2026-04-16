# Sistema de Eventos

Documentación completa del sistema de gestión de eventos de la plataforma PCN.

## Tabla de Contenidos

1. [Modelo de Datos](#modelo-de-datos)
2. [Funcionalidades Principales](#funcionalidades-principales)
3. [Rutas y Páginas](#rutas-y-páginas)
4. [Server Actions](#server-actions)
5. [Componentes](#componentes)
6. [Validaciones y Reglas de Negocio](#validaciones-y-reglas-de-negocio)
7. [Flujos de Usuario](#flujos-de-usuario)

---

## Modelo de Datos

### Event

Modelo principal que representa un evento en la plataforma.

```prisma
model Event {
  id          String    @id @default(cuid())
  date        DateTime
  endDate     DateTime?
  name        String
  description String
  city        String
  address     String
  placeName   String
  flyerSrc    String
  latitude    Float?
  longitude   Float?
  capacity    Int?      // Cupo máximo (opcional)
  deletedAt   DateTime? // Eliminación lógica
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  images      Image[]
  registrations EventRegistration[]
  sponsors    Sponsor[]
}
```

**Campos importantes:**

- `capacity`: Cupo máximo del evento. Si es `null`, el evento tiene cupo ilimitado.
- `deletedAt`: Campo para eliminación lógica. Los eventos eliminados no se muestran en listados públicos.
- `endDate`: Fecha de finalización opcional. Si no se especifica, se usa `date` como referencia.

### EventRegistration

Representa la inscripción de un usuario a un evento.

```prisma
model EventRegistration {
  id          String    @id @default(cuid())
  eventId     String
  userId      String    // Usuario registrado (requerido)
  cancelledAt DateTime? // Fecha de cancelación (si fue cancelada)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  event       Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
  @@index([eventId])
  @@index([userId])
  @@index([cancelledAt])
}
```

**Campos importantes:**

- `cancelledAt`: Si tiene valor, la inscripción está cancelada (no se cuenta para cupos)
- `@@unique([eventId, userId])`: Un usuario solo puede tener una inscripción por evento. Las inscripciones canceladas se reactivan en lugar de crear duplicados.

### WaitlistEntry

Representa la entrada de un usuario a la lista de espera de un evento.

```prisma
model WaitlistEntry {
  id        String   @id @default(cuid())
  eventId   String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
  @@index([eventId])
  @@index([userId])
  @@index([createdAt])
}
```

**Campos importantes:**

- `createdAt`: Determina el orden FIFO de la lista de espera
- `@@unique([eventId, userId])`: Un usuario solo puede tener una entrada por evento
- Las entradas se eliminan físicamente cuando el usuario es promovido o sale voluntariamente (no hay soft delete)

### Sponsor

Representa un patrocinador de un evento.

```prisma
model Sponsor {
  id        String   @id @default(cuid())
  eventId   String
  name      String
  website   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
}
```

---

## Funcionalidades Principales

### 1. Gestión de Eventos (Admin)

- **Crear eventos**: Formulario completo con validación
- **Editar eventos**: Modificación de todos los campos
- **Eliminar eventos**: Eliminación lógica (soft delete)
- **Gestionar sponsors**: Agregar múltiples sponsors con nombre y website opcional

### 2. Inscripción a Eventos

- **Inscripción pública**: Cualquier usuario puede inscribirse
- **Pre-fill de datos**: Si el usuario está logueado, se pre-llenan sus datos
- **Validación de cupo**: Verificación al cargar la página y al submitear
- **Prevención de duplicados**: No se permite inscribirse dos veces con el mismo email

### 3. Gestión de Inscripciones

- **Cancelación de inscripción**: Los usuarios pueden cancelar su inscripción
  - Si está logueado: Cancelación directa
  - Si no está logueado: Debe ingresar su email
- **Eliminación de inscripción (Admin)**: Los administradores pueden eliminar inscripciones físicamente
- **Re-inscripción**: Si un usuario canceló, puede volver a inscribirse (se reactiva la inscripción)

### 4. Sistema de Cupos

- **Cupo opcional**: Los eventos pueden tener cupo definido o ser ilimitados
- **Validación doble**: Se valida al cargar la página y al submitear el formulario
- **Exclusión de cancelados**: Las inscripciones canceladas no cuentan para el cupo
- **Liberación de cupo**: Al eliminar o cancelar una inscripción, se libera el cupo

### 5. Visualización

- **Página de detalle**: Muestra toda la información del evento
- **Lista de inscripciones (Admin)**: Los administradores pueden ver todas las inscripciones y la lista de espera
- **Información de cupo**: Se muestra cuántos cupos quedan disponibles
- **Mapa**: Si hay coordenadas, se muestra un mapa con la ubicación

### 6. Lista de Espera

- **Unirse a la lista**: Cuando el cupo está completo, los usuarios pueden unirse a la lista de espera
- **Orden FIFO**: La lista de espera es ordenada por fecha de ingreso (el primero en entrar es el primero en ser promovido)
- **Promoción automática**: Cuando se cancela una inscripción, el primer usuario de la lista de espera es inscrito automáticamente
- **Notificación por email**: El usuario promovido recibe un email informando que tiene un lugar confirmado
- **Notificación a admins**: Los admins son notificados tanto de la cancelación como de la promoción
- **Salir de la lista**: Los usuarios pueden abandonar la lista de espera en cualquier momento
- **Protección ante condiciones de carrera**: Todas las operaciones utilizan transacciones con bloqueo de fila (`SELECT ... FOR UPDATE`) para evitar promociones duplicadas o inscripciones incorrectas cuando múltiples usuarios operan simultáneamente

---

## Rutas y Páginas

### Páginas Públicas

#### `/eventos`

- **Componente**: `src/app/(platform)/eventos/page.tsx`
- **Descripción**: Lista todos los eventos (excluye eliminados)
- **Acceso**: Público

#### `/eventos/[id]`

- **Componente**: `src/app/(platform)/eventos/[id]/page.tsx`
- **Descripción**: Página de detalle del evento
- **Características**:
  - Muestra toda la información del evento
  - Botón de inscripción (si el evento no ha pasado)
  - Botón de cancelación (si el usuario está registrado)
  - Lista de sponsors en la columna lateral
  - Lista de inscripciones (solo para admins)
  - Mapa con la ubicación (si hay coordenadas)
- **Acceso**: Público

#### `/eventos/[id]/inscripcion`

- **Componente**: `src/app/(platform)/eventos/[id]/inscripcion/page.tsx`
- **Descripción**: Página de inscripción al evento
- **Características**:
  - Formulario de inscripción
  - Pre-fill de datos si el usuario está logueado
  - Validación de cupo disponible
  - Mensaje si ya está inscrito
  - Mensaje si el cupo está completo
- **Acceso**: Público

#### `/meetup`

- **Componente**: `src/app/meetup/page.tsx`
- **Descripción**: Redirige automáticamente a la página de inscripción del próximo "dev meetup"
- **Lógica**: Busca el próximo evento cuyo nombre contenga "meetup" (case-insensitive)
- **Acceso**: Público

### Páginas de Administración

#### `/eventos/nuevo`

- **Componente**: `src/app/(platform)/eventos/nuevo/page.tsx`
- **Descripción**: Formulario para crear un nuevo evento
- **Acceso**: Solo administradores (redirige si no es admin)

#### `/eventos/[id]/editar`

- **Componente**: `src/app/(platform)/eventos/[id]/editar/page.tsx`
- **Descripción**: Formulario para editar un evento existente
- **Características**:
  - Carga los datos actuales del evento
  - Permite editar todos los campos
  - Botón para eliminar el evento (soft delete)
- **Acceso**: Solo administradores

---

## Server Actions

### Eventos

#### `create-event.ts`

- **Ruta**: `src/actions/events/create-event.ts`
- **Función**: `createEvent(data: EventFormData)`
- **Descripción**: Crea un nuevo evento en la base de datos
- **Validaciones**:
  - Verifica que el usuario sea administrador
  - Valida los datos con el schema de Zod
  - Convierte fechas de string a Date
- **Retorno**: Redirige a la página de detalle del evento creado

#### `update-event.ts`

- **Ruta**: `src/actions/events/update-event.ts`
- **Función**: `updateEvent(id: string, data: EventFormData)`
- **Descripción**: Actualiza un evento existente
- **Validaciones**:
  - Verifica que el usuario sea administrador
  - Verifica que el evento exista
  - Valida los datos con el schema de Zod
- **Características**:
  - Actualiza sponsors en una transacción (elimina los antiguos y crea los nuevos)
- **Retorno**: Redirige a la página de detalle del evento

#### `delete-event.ts`

- **Ruta**: `src/actions/events/delete-event.ts`
- **Función**: `deleteEvent(id: string)`
- **Descripción**: Elimina lógicamente un evento (soft delete)
- **Validaciones**:
  - Verifica que el usuario sea administrador
  - Verifica que el evento exista
- **Retorno**: Redirige a la lista de eventos

#### `fetch-events.ts`

- **Ruta**: `src/actions/events/fetch-events.ts`
- **Función**: `fetchEvents()`
- **Descripción**: Obtiene todos los eventos no eliminados
- **Orden**: Por fecha descendente (más recientes primero)

#### `fetch-event.ts`

- **Ruta**: `src/actions/events/fetch-event.ts`
- **Función**: `fetchEvent(id: string)`
- **Descripción**: Obtiene un evento específico para visualización pública
- **Filtros**: Excluye eventos eliminados
- **Includes**: `images`, `sponsors`

#### `fetch-event-for-edit.ts`

- **Ruta**: `src/actions/events/fetch-event-for-edit.ts`
- **Función**: `fetchEventForEdit(id: string)`
- **Descripción**: Obtiene un evento específico para edición (incluye eliminados)
- **Includes**: `images`, `sponsors`

### Inscripciones

#### `register-event.ts`

- **Ruta**: `src/actions/events/register-event.ts`
- **Función**: `registerEvent(eventId: string, options?: { skipRedirect?: boolean })`
- **Descripción**: Registra un usuario a un evento. Si el cupo está completo, lo agrega a la lista de espera.
- **Validaciones** (dentro de una transacción con `FOR UPDATE`):
  - Verifica que el evento exista y no esté eliminado
  - Verifica que no haya una inscripción activa para el usuario
  - Verifica que el usuario no esté ya en la lista de espera activa
  - Valida el cupo disponible (excluyendo cancelados)
- **Lógica especial**:
  - Si existe una inscripción o entrada de lista de espera cancelada, la reactiva en lugar de crear una nueva
  - Si hay cupo: inscribe directamente → devuelve `{ status: 'registered' }`
  - Si no hay cupo: agrega a lista de espera → devuelve `{ status: 'waitlisted' }`
- **Retorno**: `{ success: true, registrationId?, status: 'registered' | 'waitlisted' }` o redirige

#### `cancel-registration.ts`

- **Ruta**: `src/actions/events/cancel-registration.ts`
- **Función**: `cancelRegistration(params: CancelRegistrationParams)`
- **Descripción**: Cancela una inscripción y, si hay lista de espera, promueve automáticamente al primer usuario
- **Parámetros**:
  - `registrationId`: ID de la inscripción (opcional)
  - `eventId`: ID del evento
- **Efecto** (dentro de una transacción con `FOR UPDATE`):
  1. Marca la inscripción con `cancelledAt = now()`
  2. Si el evento tiene capacidad definida, busca el primer usuario en la lista de espera
  3. Si lo encuentra: marca la entrada de lista de espera como cancelada y crea/reactiva su inscripción
  4. Envía email al usuario promovido notificándole que tiene lugar confirmado

#### `delete-registration.ts`

- **Ruta**: `src/actions/events/delete-registration.ts`
- **Función**: `deleteRegistration(registrationId: string)`
- **Descripción**: Elimina físicamente una inscripción activa (solo admins) y promueve al primer usuario de la lista de espera
- **Validaciones**:
  - Verifica que el usuario sea administrador
  - Verifica que la inscripción exista
- **Efecto** (dentro de una transacción con `FOR UPDATE`):
  1. Elimina el registro de la base de datos
  2. Si la inscripción era activa y el evento tiene capacidad, promueve al primer usuario de la lista de espera
  3. Envía email al usuario promovido

#### `cancel-waitlist.ts`

- **Ruta**: `src/actions/events/cancel-waitlist.ts`
- **Función**: `cancelWaitlist(params: CancelWaitlistParams)`
- **Descripción**: Permite a un usuario salir voluntariamente de la lista de espera
- **Parámetros**:
  - `eventId`: ID del evento
- **Efecto** (dentro de una transacción con `FOR UPDATE`):
  - Marca la entrada de lista de espera con `cancelledAt = now()`
  - Notifica a los admins

### Cupos

#### `check-event-capacity.ts`

- **Ruta**: `src/actions/events/check-event-capacity.ts`
- **Función**: `checkEventCapacity(eventId: string)`
- **Descripción**: Verifica el cupo disponible de un evento
- **Retorno**:
  ```typescript
  {
    available: boolean;
    current: number;
    capacity: number | null;
    message?: string;
  }
  ```
- **Lógica**: Cuenta solo inscripciones activas (`cancelledAt: null`)

---

## Componentes

### Formularios

#### `EventForm`

- **Ruta**: `src/components/events/event-form.tsx`
- **Descripción**: Formulario reutilizable para crear/editar eventos
- **Características**:
  - Usa React Hook Form con validación Zod
  - Maneja sponsors dinámicamente con `useFieldArray`
  - Todos los inputs en filas separadas
  - Validación en tiempo real
- **Props**:
  - `defaultValues`: Valores iniciales (para edición)
  - `onSubmit`: Función a ejecutar al submitear
  - `onCancel`: Función a ejecutar al cancelar

#### `EventRegistrationForm`

- **Ruta**: `src/components/events/event-registration-form.tsx`
- **Descripción**: Formulario de inscripción a eventos
- **Características**:
  - Campos condicionales según el tipo (STUDENT/PROFESSIONAL)
  - Pre-fill de datos si el usuario está logueado
  - Muestra información de cupo disponible
  - Validación de cupo antes de submitear
- **Props**:
  - `eventId`: ID del evento
  - `userData`: Datos del usuario (opcional)
  - `capacityInfo`: Información del cupo

### Botones y Acciones

#### `CancelRegistrationButton`

- **Ruta**: `src/components/events/cancel-registration-button.tsx`
- **Descripción**: Botón para cancelar una inscripción
- **Características**:
  - Si el usuario está logueado: Cancelación directa
  - Si no está logueado: Muestra un diálogo para ingresar email
- **Props**:
  - `eventId`: ID del evento
  - `registrationId`: ID de la inscripción (si está logueado)
  - `isLoggedIn`: Si el usuario está logueado

#### `DeleteRegistrationButton`

- **Ruta**: `src/components/events/delete-registration-button.tsx`
- **Descripción**: Botón para eliminar una inscripción (solo admins)
- **Características**:
  - Diálogo de confirmación antes de eliminar
  - Muestra el nombre del usuario en la confirmación
- **Props**:
  - `registrationId`: ID de la inscripción
  - `userName`: Nombre del usuario (para mostrar en confirmación)

#### `CancelWaitlistButton`

- **Ruta**: `src/components/events/cancel-waitlist-button.tsx`
- **Descripción**: Botón para salir de la lista de espera
- **Características**:
  - Llama a `cancelWaitlist()` con feedback de toast
  - Refresca la página después de salir

#### `WaitlistSuccessDialog`

- **Ruta**: `src/components/events/waitlist-success-dialog.tsx`
- **Descripción**: Diálogo de confirmación al unirse a la lista de espera
- **Características**:
  - Informa al usuario que será inscrito automáticamente cuando se libere un lugar
  - Se muestra al unirse exitosamente a la lista

#### `DeleteEventButton`

- **Ruta**: `src/components/events/delete-event-button.tsx`
- **Descripción**: Botón para eliminar un evento (soft delete)
- **Características**:
  - Diálogo de confirmación
  - Solo visible para administradores

### Visualización

#### `EventCard`

- **Ruta**: `src/components/events/event-card.tsx`
- **Descripción**: Tarjeta para mostrar un evento en una lista
- **Características**:
  - Muestra imagen, nombre, fecha y descripción
  - Descripción truncada con `line-clamp-3`

#### `EventPhotos`

- **Ruta**: `src/components/events/event-photos.tsx`
- **Descripción**: Galería de fotos del evento

---

## Validaciones y Reglas de Negocio

### Validación de Eventos

#### Schema: `event-schema.ts`

- **Nombre**: Requerido, string
- **Descripción**: Requerido, string
- **Fecha**: Requerido, formato `datetime-local`
- **Fecha de fin**: Opcional, debe ser posterior a la fecha de inicio
- **Ciudad**: Requerido, string
- **Dirección**: Requerido, string
- **Nombre del lugar**: Requerido, string
- **URL del flyer**: Requerido, debe ser una URL válida
- **Latitud/Longitud**: Opcionales, números
- **Cupo**: Opcional, número entero mayor a 0
- **Sponsors**: Array opcional, cada sponsor debe tener:
  - `name`: Requerido
  - `website`: Opcional, debe ser una URL válida

### Validación de Inscripciones

#### Schema: `event-registration-schema.ts`

- **Nombre**: Requerido
- **Apellido**: Requerido
- **Email**: Requerido, formato de email válido
- **Tipo**: Requerido, `STUDENT` o `PROFESSIONAL`
- **Campos condicionales**:
  - Si `type === 'PROFESSIONAL'`:
    - `workTitle`: Requerido
    - `workPlace`: Requerido
  - Si `type === 'STUDENT'`:
    - `studyField`: Requerido
    - `studyPlace`: Requerido

### Reglas de Negocio

#### Cupos

1. Si un evento tiene `capacity === null`, tiene cupo ilimitado
2. Las inscripciones canceladas (`cancelledAt !== null`) no cuentan para el cupo
3. La validación de cupo se hace:
   - Al cargar la página de inscripción
   - Antes de crear la inscripción en el servidor
4. Si el cupo está completo, no se permite inscribirse

#### Inscripciones

1. No se puede inscribir dos veces (por usuario, inscripciones activas)
2. Si un usuario canceló, puede volver a inscribirse (se reactiva la inscripción)
3. Las inscripciones canceladas no se eliminan, solo se marcan con `cancelledAt`
4. Solo los administradores pueden eliminar inscripciones físicamente

#### Lista de Espera

1. Solo disponible para eventos con `capacity` definido (no `null`)
2. Un usuario no puede estar en la lista de espera y en inscripciones activas al mismo tiempo
3. La lista sigue orden FIFO por `createdAt`
4. Cuando se libera un cupo (cancelación o eliminación de inscripción activa), el primer usuario de la lista es promovido automáticamente
5. La promoción es atómica: usa `prisma.$transaction` con `SELECT ... FOR UPDATE` para evitar condiciones de carrera
6. El usuario promovido recibe un email de notificación
7. Al salir de la lista de espera voluntariamente no se libera ningún cupo (no activa promociones)
8. Las entradas de `WaitlistEntry` se eliminan físicamente al ser promovidas o al salir el usuario (no hay soft delete)

#### Eventos

1. Los eventos eliminados (`deletedAt !== null`) no se muestran en listados públicos
2. Los administradores pueden ver eventos eliminados en la página de edición
3. La eliminación es lógica (soft delete), no física

#### Permisos

1. Solo administradores pueden:
   - Crear eventos (`/eventos/nuevo`)
   - Editar eventos (`/eventos/[id]/editar`)
   - Eliminar eventos
   - Eliminar inscripciones
   - Ver lista de inscripciones
2. Cualquier usuario puede:
   - Ver eventos
   - Inscribirse a eventos
   - Cancelar su propia inscripción

---

## Flujos de Usuario

### Flujo: Crear un Evento (Admin)

1. Admin navega a `/eventos/nuevo`
2. Sistema verifica que el usuario sea admin (redirige si no lo es)
3. Admin completa el formulario:
   - Información básica (nombre, descripción, fechas)
   - Ubicación (ciudad, dirección, lugar)
   - Coordenadas (opcional, para mapa)
   - URL del flyer
   - Cupo máximo (opcional)
   - Sponsors (opcional, múltiples)
4. Al submitear:
   - Validación del formulario
   - Creación del evento en BD
   - Creación de sponsors asociados
   - Redirección a `/eventos/[id]`

### Flujo: Inscribirse a un Evento

1. Usuario navega a `/eventos/[id]`
2. Si el evento no ha pasado y hay cupo disponible, ve botón "Inscribirme al evento"
3. Usuario hace clic y va a `/eventos/[id]/inscripcion`
4. Sistema verifica:
   - Si el usuario ya está inscrito → Muestra mensaje
   - Si el cupo está completo → Muestra mensaje
5. Si puede inscribirse:
   - Si está logueado: Se pre-llenan sus datos
   - Completa el formulario (tipo: estudiante o profesional)
   - Campos condicionales según el tipo
6. Al submitear:
   - Validación del formulario
   - Verificación de cupo (nuevamente)
   - Creación de la inscripción
   - Redirección a `/eventos/[id]`

### Flujo: Cancelar una Inscripción

#### Usuario Logueado

1. Usuario navega a `/eventos/[id]`
2. Si está registrado, ve botón "Cancelar inscripción"
3. Usuario hace clic
4. Sistema marca la inscripción con `cancelledAt = now()`
5. Se libera el cupo
6. Usuario puede volver a inscribirse más tarde

#### Usuario No Logueado

1. Usuario navega a `/eventos/[id]`
2. Si está registrado, ve botón "Cancelar inscripción"
3. Usuario hace clic → Se abre diálogo
4. Usuario ingresa su email
5. Sistema busca la inscripción por email
6. Si la encuentra, la marca como cancelada
7. Se libera el cupo

### Flujo: Eliminar una Inscripción (Admin)

1. Admin navega a `/eventos/[id]`
2. Ve la lista de inscripciones
3. Hace clic en el botón de eliminar (ícono de basura)
4. Se muestra diálogo de confirmación
5. Al confirmar:
   - Se elimina físicamente la inscripción
   - Se libera el cupo
   - Se actualiza la lista

### Flujo: Unirse a la Lista de Espera

1. Usuario navega a `/eventos/[id]`
2. El evento tiene cupo completo → Ve botón "Unirme a la lista de espera" y cantidad de personas en espera
3. Si no está autenticado: redirige al login con `autoRegister=true`; al volver, la acción lo coloca automáticamente en la lista de espera
4. Si está autenticado: llama a `registerEvent()` → el servidor detecta cupo completo y crea `WaitlistEntry`
5. Se muestra diálogo de confirmación: "Te inscribiremos automáticamente cuando se libere un lugar"
6. La página muestra ahora el estado "En lista de espera" con la posición del usuario y botón "Salir de la lista de espera"

### Flujo: Promoción Automática desde Lista de Espera

1. Un usuario cancela su inscripción (o un admin la elimina)
2. El servidor, dentro de una transacción atómica:
   a. Cancela/elimina la inscripción
   b. Busca la primera entrada activa en `WaitlistEntry` ordenada por `createdAt`
   c. Marca esa entrada como cancelada (consumida)
   d. Crea o reactiva una `EventRegistration` para el usuario promovido
3. Fuera de la transacción:
   a. Notifica a los admins sobre la cancelación y la promoción
   b. Envía email al usuario promovido: "¡Conseguiste un lugar! Tu inscripción está confirmada."
4. El usuario promovido, al recargar la página del evento, verá que ya está inscrito

### Flujo: Editar un Evento (Admin)

1. Admin navega a `/eventos/[id]`
2. Hace clic en "Editar evento"
3. Va a `/eventos/[id]/editar`
4. Sistema carga los datos actuales del evento
5. Admin modifica los campos necesarios
6. Al submitear:
   - Validación del formulario
   - Actualización del evento
   - Actualización de sponsors (transacción: elimina antiguos, crea nuevos)
   - Redirección a `/eventos/[id]`

### Flujo: Eliminar un Evento (Admin)

1. Admin navega a `/eventos/[id]/editar`
2. Hace clic en "Eliminar evento"
3. Se muestra diálogo de confirmación
4. Al confirmar:
   - Se marca `deletedAt = now()`
   - El evento desaparece de los listados públicos
   - Redirección a `/eventos`

---

## Consideraciones Técnicas

### Manejo de Fechas

- Las fechas se almacenan como `DateTime` en Prisma
- En los formularios se usan inputs `datetime-local` (string)
- Conversión: `new Date(dateString)` al guardar
- Formateo: Funciones `formatDate()` y `formatTime()` para mostrar

### Transacciones

- La actualización de sponsors se hace en una transacción para garantizar consistencia:
  1. Eliminar todos los sponsors existentes del evento
  2. Crear los nuevos sponsors

### Revalidación de Caché

- Se usa `revalidatePath()` después de:
  - Crear/editar/eliminar eventos
  - Registrar/cancelar/eliminar inscripciones
- Esto asegura que los datos mostrados estén actualizados

### Validación de Cupo

- **Doble validación**:
  1. Al cargar la página (server-side)
  2. Antes de crear la inscripción (server-side)
- Esto previene condiciones de carrera cuando múltiples usuarios se inscriben simultáneamente

### Soft Delete vs Hard Delete

- **Eventos**: Soft delete (`deletedAt`)
  - Permite recuperar eventos eliminados
  - No se muestran en listados públicos
- **Inscripciones**:
  - Cancelación: Soft delete (`cancelledAt`)
  - Eliminación (admin): Hard delete (eliminación física)

---

## Mejoras Futuras Sugeridas

1. **Notificaciones por email**:

   - Confirmación de inscripción
   - Recordatorio antes del evento
   - Notificación de cancelación

2. **Exportación de datos**:

   - Exportar lista de inscripciones a CSV/Excel
   - Filtros y búsqueda en la lista de inscripciones

4. **Estadísticas**:

   - Dashboard con métricas de eventos
   - Gráficos de asistencia

5. **QR Codes**:

   - Generar QR para check-in en el evento
   - Validación de asistencia

6. **Comentarios y valoraciones**:
   - Permitir a usuarios dejar comentarios sobre eventos pasados
   - Sistema de valoraciones

---

## Notas de Desarrollo

- Todos los formularios usan **React Hook Form** con validación **Zod**
- Los toasts se manejan con **Sonner** usando `toast.promise`
- Las validaciones de permisos se hacen en server components/actions
- Los componentes de UI usan **shadcn/ui**
- El estilo sigue el sistema de diseño de la plataforma (pcnPurple/pcnGreen)

---

**Última actualización**: Abril 2026
