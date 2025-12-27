# Sistema de Testimonios

## Descripción General

El sistema de testimonios permite a los usuarios autenticados compartir sus experiencias con la comunidad de programaConNosotros. Los administradores pueden seleccionar testimonios destacados que aparecerán en la página de inicio.

## Características Principales

- **Creación de testimonios**: Los usuarios autenticados pueden crear un testimonio (máximo uno por usuario)
- **Edición de testimonios**: Los usuarios pueden editar su propio testimonio
- **Eliminación de testimonios**: Los usuarios pueden eliminar su propio testimonio
- **Testimonios destacados**: Los administradores pueden marcar testimonios para que aparezcan en la home page
- **Notificaciones**: Los administradores reciben notificaciones cuando se crean, editan o eliminan testimonios
- **Autorización**: Control de acceso basado en roles (usuario regular vs administrador)

## Modelo de Datos

### Modelo `Testimonial` (Prisma)

```prisma
model Testimonial {
  id        String   @id @default(cuid())
  body      String   // Contenido del testimonio
  userId    String   // Usuario que creó el testimonio (requerido)
  featured  Boolean  @default(false) // Si aparece en la home page
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@index([featured])
}
```

### Campos

- **`id`**: Identificador único del testimonio (CUID)
- **`body`**: Contenido del testimonio (texto libre, mínimo 10 caracteres)
- **`userId`**: ID del usuario que creó el testimonio (requerido, relación con `User`)
- **`featured`**: Indica si el testimonio debe aparecer en la home page (por defecto `false`)
- **`createdAt`**: Fecha de creación
- **`updatedAt`**: Fecha de última actualización

### Relaciones

- **`user`**: Relación con el modelo `User`. El testimonio pertenece a un usuario. Si se elimina el usuario, se eliminan sus testimonios (Cascade).

## Validación de Datos

### Schema Zod (`testimonial-schema.ts`)

```typescript
export const testimonialSchema = z.object({
  body: z.string().min(10, {
    message: 'El testimonio debe tener al menos 10 caracteres',
  }),
});
```

**Reglas de validación:**

- `body`: Debe ser una cadena de texto con al menos 10 caracteres

## Funcionalidades

### 1. Crear Testimonio

**Ruta**: `/testimonios`

**Acción del servidor**: `createTestimonial`

**Permisos requeridos**: Usuario autenticado

**Restricciones**:

- Solo se permite un testimonio por usuario
- El usuario debe estar autenticado
- El testimonio debe tener al menos 10 caracteres

**Flujo**:

1. El usuario hace clic en "Agregar testimonio" (solo visible si no tiene testimonio)
2. Se abre un modal con el formulario
3. El usuario ingresa el contenido del testimonio
4. Al enviar, se valida el formulario
5. Se crea el testimonio en la base de datos asociado al `userId` de la sesión
6. Se envía una notificación a todos los administradores
7. Se revalida la ruta `/testimonios`

**Notificación a admins**:

- Tipo: `testimonial_created`
- Título: "Nuevo testimonio creado"
- Mensaje: "{nombre del usuario} ha creado un nuevo testimonio"
- Metadata: `testimonialId`, `userId`, `userName`

### 2. Editar Testimonio

**Acción del servidor**: `updateTestimonial`

**Permisos requeridos**:

- El autor del testimonio O
- Administrador

**Flujo**:

1. El usuario hace clic en "Editar testimonio" (si ya tiene uno) o en el botón de editar en una tarjeta de testimonio
2. Se abre un modal con el formulario prellenado
3. El usuario modifica el contenido
4. Al enviar, se valida que el usuario tenga permisos
5. Se actualiza el testimonio en la base de datos
6. Si el usuario no es admin, se envía una notificación a los administradores
7. Se revalida la ruta `/testimonios`

**Notificación a admins** (solo si no es admin quien edita):

- Tipo: `testimonial_updated`
- Título: "Testimonio actualizado"
- Mensaje: "{nombre del usuario} ha actualizado su testimonio"
- Metadata: `testimonialId`, `userId`, `userName`

### 3. Eliminar Testimonio

**Acción del servidor**: `deleteTestimonial`

**Permisos requeridos**:

- El autor del testimonio O
- Administrador

**Flujo**:

1. El usuario hace clic en el botón de eliminar (ícono de basura) en una tarjeta de testimonio
2. Se muestra un diálogo de confirmación
3. Al confirmar, se valida que el usuario tenga permisos
4. Se elimina el testimonio de la base de datos
5. Si el usuario no es admin, se envía una notificación a los administradores
6. Se revalida la ruta `/testimonios`

**Notificación a admins** (solo si no es admin quien elimina):

- Tipo: `testimonial_deleted`
- Título: "Testimonio eliminado"
- Mensaje: "{nombre del usuario} ha eliminado su testimonio"
- Metadata: `testimonialId`, `userId`, `userName`

**Nota**: También se puede eliminar desde el modal de edición usando el botón "Eliminar" en la parte inferior izquierda.

### 4. Marcar como Destacado

**Acción del servidor**: `toggleFeatured`

**Permisos requeridos**: Solo administradores

**Flujo**:

1. Un administrador hace clic en el ícono de estrella en una tarjeta de testimonio
2. Se cambia el estado `featured` del testimonio (true/false)
3. Se revalidan las rutas `/testimonios` y `/home`

**Comportamiento**:

- Si `featured = true`: El testimonio aparece en la home page (máximo 3 más recientes)
- Si `featured = false`: El testimonio no aparece en la home page
- Los testimonios destacados muestran un ícono de estrella amarilla en la tarjeta

### 5. Visualizar Testimonios

**Ruta**: `/testimonios`

**Acción del servidor**: `fetchTestimonials`

**Permisos**: Público (cualquier usuario puede ver los testimonios)

**Flujo**:

1. Se obtienen todos los testimonios de la base de datos
2. Se incluye la información del usuario (nombre, email)
3. Se ordenan por fecha de creación descendente
4. Se muestran en una grilla de tarjetas

### 6. Testimonios Destacados en Home

**Ruta**: `/home`

**Acción del servidor**: `fetchFeaturedTestimonials`

**Permisos**: Público

**Flujo**:

1. Se obtienen los testimonios con `featured = true`
2. Se ordenan por fecha de creación descendente
3. Se limita a los 3 más recientes
4. Se muestran en la sección "Lo que dicen nuestros miembros"
5. Si no hay testimonios destacados, la sección se oculta completamente

## Componentes

### 1. `TestimonialsClient` (`testimonials-client.tsx`)

Componente cliente principal que maneja la visualización y el estado del modal de formulario.

**Props**:

- `testimonials`: Array de testimonios con información del usuario
- `currentUserId`: ID del usuario actual (opcional)
- `isAdmin`: Si el usuario actual es administrador (opcional)
- `hasUserTestimonial`: Si el usuario actual ya tiene un testimonio (opcional)

**Funcionalidades**:

- Renderiza la grilla de testimonios
- Maneja el estado del modal de formulario
- Expone la función `openForm` mediante `forwardRef` y `useImperativeHandle`

### 2. `TestimonialsClientWrapper` (`testimonials-client-wrapper.tsx`)

Componente wrapper que maneja el layout del título y el botón de acción.

**Funcionalidades**:

- Renderiza el título "Testimonios" y el botón de acción alineados horizontalmente
- Determina qué botón mostrar ("Agregar testimonio" o "Editar testimonio")
- Maneja la comunicación entre el botón y el componente `TestimonialsClient`

### 3. `TestimonialCard` (`testimonial-card.tsx`)

Componente que muestra una tarjeta individual de testimonio.

**Props**:

- `testimonial`: Testimonio con información del usuario
- `currentUserId`: ID del usuario actual (opcional)
- `isAdmin`: Si el usuario actual es administrador (opcional)
- `onEdit`: Función callback para editar el testimonio

**Funcionalidades**:

- Muestra el nombre del autor y el contenido del testimonio
- Muestra un ícono de estrella si el testimonio está destacado
- Botones de acción según permisos:
  - **Estrella** (solo admin): Marcar/desmarcar como destacado
  - **Editar** (autor o admin): Abrir modal de edición
  - **Eliminar** (autor o admin): Eliminar con confirmación

### 4. `TestimonialForm` (`testimonial-form.tsx`)

Componente de formulario para crear/editar testimonios.

**Props**:

- `defaultValues`: Valores por defecto (para edición)
- `testimonialId`: ID del testimonio a editar (opcional)
- `onCancel`: Función callback al cancelar
- `onSuccess`: Función callback al guardar exitosamente

**Funcionalidades**:

- Formulario con validación usando React Hook Form y Zod
- Campo de texto para el contenido del testimonio
- Botón "Eliminar" (solo visible al editar)
- Botones "Cancelar" y "Guardar/Actualizar"
- Manejo de estados de carga y errores con toasts

### 5. `TestimonialActionButton` (`testimonial-action-button.tsx`)

Componente del botón de acción principal.

**Props**:

- `hasUserTestimonial`: Si el usuario ya tiene un testimonio
- `onClick`: Función callback al hacer clic

**Funcionalidades**:

- Muestra "Agregar testimonio" si el usuario no tiene testimonio
- Muestra "Editar testimonio" si el usuario ya tiene uno

## Acciones del Servidor

### `createTestimonial`

**Ubicación**: `src/actions/testimonials/create-testimonial.ts`

**Parámetros**:

- `data: TestimonialFormData` - Datos del formulario validados

**Retorna**: `Promise<void>`

**Validaciones**:

- Usuario debe estar autenticado
- Datos deben pasar la validación del schema Zod

**Efectos secundarios**:

- Crea el testimonio en la base de datos
- Envía notificación a administradores
- Revalida la ruta `/testimonios`

### `updateTestimonial`

**Ubicación**: `src/actions/testimonials/update-testimonial.ts`

**Parámetros**:

- `id: string` - ID del testimonio a actualizar
- `data: TestimonialFormData` - Datos del formulario validados

**Retorna**: `Promise<void>`

**Validaciones**:

- Usuario debe estar autenticado
- Testimonio debe existir
- Usuario debe ser el autor o administrador
- Datos deben pasar la validación del schema Zod

**Efectos secundarios**:

- Actualiza el testimonio en la base de datos
- Envía notificación a administradores (si no es admin quien edita)
- Revalida la ruta `/testimonios`

### `deleteTestimonial`

**Ubicación**: `src/actions/testimonials/delete-testimonial.ts`

**Parámetros**:

- `id: string` - ID del testimonio a eliminar

**Retorna**: `Promise<void>`

**Validaciones**:

- Usuario debe estar autenticado
- Testimonio debe existir
- Usuario debe ser el autor o administrador

**Efectos secundarios**:

- Elimina el testimonio de la base de datos
- Envía notificación a administradores (si no es admin quien elimina)
- Revalida la ruta `/testimonios`

### `toggleFeatured`

**Ubicación**: `src/actions/testimonials/toggle-featured.ts`

**Parámetros**:

- `id: string` - ID del testimonio a marcar/desmarcar

**Retorna**: `Promise<void>`

**Validaciones**:

- Usuario debe estar autenticado
- Usuario debe ser administrador
- Testimonio debe existir

**Efectos secundarios**:

- Actualiza el campo `featured` del testimonio
- Revalida las rutas `/testimonios` y `/home`

### `fetchTestimonials`

**Ubicación**: `src/actions/testimonials/fetch-testimonials.ts`

**Parámetros**: Ninguno

**Retorna**: `Promise<TestimonialWithUser[]>`

**Funcionalidad**:

- Obtiene todos los testimonios de la base de datos
- Incluye información del usuario (id, name, email)
- Ordena por fecha de creación descendente

### `fetchFeaturedTestimonials`

**Ubicación**: `src/actions/testimonials/fetch-featured-testimonials.ts`

**Parámetros**: Ninguno

**Retorna**: `Promise<TestimonialWithUser[]>`

**Funcionalidad**:

- Obtiene solo los testimonios con `featured = true`
- Incluye información del usuario (id, name, email)
- Ordena por fecha de creación descendente
- Limita a los 3 más recientes

## Flujos de Usuario

### Flujo: Crear Testimonio

1. Usuario navega a `/testimonios`
2. Si el usuario no tiene testimonio, ve el botón "Agregar testimonio"
3. Usuario hace clic en el botón
4. Se abre un modal con el formulario
5. Usuario ingresa el contenido (mínimo 10 caracteres)
6. Usuario hace clic en "Crear"
7. Se valida el formulario
8. Se crea el testimonio
9. Se muestra un toast de éxito
10. Se cierra el modal
11. Se actualiza la lista de testimonios
12. El botón cambia a "Editar testimonio"
13. Los administradores reciben una notificación

### Flujo: Editar Testimonio

1. Usuario navega a `/testimonios`
2. Si el usuario tiene testimonio, ve el botón "Editar testimonio"
3. Usuario hace clic en el botón (o en el ícono de editar en una tarjeta)
4. Se abre un modal con el formulario prellenado
5. Usuario modifica el contenido
6. Usuario hace clic en "Actualizar"
7. Se valida el formulario y los permisos
8. Se actualiza el testimonio
9. Se muestra un toast de éxito
10. Se cierra el modal
11. Se actualiza la lista de testimonios
12. Los administradores reciben una notificación (si no es admin)

### Flujo: Eliminar Testimonio

1. Usuario navega a `/testimonios`
2. Usuario hace clic en el ícono de basura en una tarjeta de testimonio (o en el botón "Eliminar" del modal de edición)
3. Se muestra un diálogo de confirmación
4. Usuario confirma la eliminación
5. Se valida que el usuario tenga permisos
6. Se elimina el testimonio
7. Se muestra un toast de éxito
8. Se actualiza la lista de testimonios
9. Si el usuario eliminó su propio testimonio, el botón cambia a "Agregar testimonio"
10. Los administradores reciben una notificación (si no es admin)

### Flujo: Marcar como Destacado (Admin)

1. Administrador navega a `/testimonios`
2. Administrador hace clic en el ícono de estrella en una tarjeta de testimonio
3. Se cambia el estado `featured` del testimonio
4. Se muestra un toast de éxito
5. Si el testimonio fue marcado como destacado, aparece en la home page (si está entre los 3 más recientes)
6. El ícono de estrella se muestra en amarillo si está destacado

### Flujo: Visualizar Testimonios Destacados en Home

1. Usuario navega a `/home`
2. El sistema obtiene los testimonios destacados
3. Si hay testimonios destacados:
   - Se muestra la sección "Lo que dicen nuestros miembros"
   - Se muestran hasta 3 testimonios destacados más recientes
   - Cada testimonio muestra el nombre del autor y el contenido
4. Si no hay testimonios destacados:
   - La sección se oculta completamente

## Permisos y Autorización

### Usuario Regular (REGULAR)

**Puede**:

- Crear un testimonio (máximo uno)
- Editar su propio testimonio
- Eliminar su propio testimonio
- Ver todos los testimonios

**No puede**:

- Editar testimonios de otros usuarios
- Eliminar testimonios de otros usuarios
- Marcar testimonios como destacados
- Ver testimonios destacados en la home (a menos que estén marcados como destacados)

### Administrador (ADMIN)

**Puede**:

- Crear un testimonio (máximo uno)
- Editar cualquier testimonio
- Eliminar cualquier testimonio
- Marcar/desmarcar testimonios como destacados
- Ver todos los testimonios
- Recibir notificaciones cuando se crean, editan o eliminan testimonios

**No puede**:

- Recibir notificaciones de sus propias acciones (crear, editar, eliminar)

### Usuario Anónimo

**Puede**:

- Ver todos los testimonios

**No puede**:

- Crear testimonios
- Editar testimonios
- Eliminar testimonios
- Marcar testimonios como destacados

## Notificaciones

El sistema envía notificaciones a todos los administradores cuando:

1. **Se crea un testimonio**: Tipo `testimonial_created`
2. **Se actualiza un testimonio**: Tipo `testimonial_updated` (solo si no es admin quien actualiza)
3. **Se elimina un testimonio**: Tipo `testimonial_deleted` (solo si no es admin quien elimina)

Las notificaciones incluyen:

- **Tipo**: Identificador del tipo de notificación
- **Título**: Título descriptivo
- **Mensaje**: Mensaje con el nombre del usuario que realizó la acción
- **Metadata**: Información adicional en formato JSON (testimonialId, userId, userName)

## Integración con Home Page

Los testimonios destacados se muestran en la home page (`/home`) en la sección "Lo que dicen nuestros miembros".

**Comportamiento**:

- Solo se muestran testimonios con `featured = true`
- Se muestran los 3 más recientes (ordenados por `createdAt` descendente)
- Si no hay testimonios destacados, la sección se oculta completamente
- Cada testimonio muestra el nombre del autor (derivado de `userId`) y el contenido (`body`)

**Componente**: `HomeClientSide` recibe `featuredTestimonials` como prop y renderiza condicionalmente la sección.

## Consideraciones Técnicas

### Límite de Testimonios por Usuario

- Cada usuario puede tener **máximo un testimonio**
- Si un usuario intenta crear un segundo testimonio, no verá el botón "Agregar testimonio"
- El botón cambia a "Editar testimonio" una vez que el usuario tiene un testimonio

### Eliminación en Cascada

- Si se elimina un usuario, se eliminan automáticamente todos sus testimonios (Cascade)
- Esto está configurado en la relación Prisma: `onDelete: Cascade`

### Revalidación de Rutas

Después de crear, actualizar o eliminar un testimonio, se revalida la ruta `/testimonios` para actualizar la UI.

Después de marcar/desmarcar como destacado, se revalidan las rutas `/testimonios` y `/home` para reflejar los cambios en ambas páginas.

### Validación del Formulario

- El formulario usa React Hook Form con validación Zod
- El campo `body` debe tener al menos 10 caracteres
- Los errores de validación se muestran debajo del campo

### Manejo de Errores

- Todas las acciones del servidor lanzan errores que se capturan en el cliente
- Los errores se muestran mediante toasts usando `sonner`
- Los mensajes de error son descriptivos y en español

## Archivos Relacionados

### Acciones del Servidor

- `src/actions/testimonials/create-testimonial.ts`
- `src/actions/testimonials/update-testimonial.ts`
- `src/actions/testimonials/delete-testimonial.ts`
- `src/actions/testimonials/toggle-featured.ts`
- `src/actions/testimonials/fetch-testimonials.ts`
- `src/actions/testimonials/fetch-featured-testimonials.ts`

### Componentes

- `src/components/testimonials/testimonial-card.tsx`
- `src/components/testimonials/testimonial-form.tsx`
- `src/components/testimonials/testimonial-action-button.tsx`

### Páginas

- `src/app/(platform)/testimonios/page.tsx`
- `src/app/(platform)/testimonios/testimonials-client.tsx`
- `src/app/(platform)/testimonios/testimonials-client-wrapper.tsx`
- `src/app/(platform)/home/page.tsx`
- `src/app/(platform)/home-client-side.tsx`

### Schemas

- `src/schemas/testimonial-schema.ts`

### Base de Datos

- `prisma/schema.prisma` (modelo `Testimonial`)
