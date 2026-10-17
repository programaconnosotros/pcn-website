# Cache de datos

Cómo el sitio sirve casi todas sus páginas sin consultar Postgres: qué se cachea, cómo cada
escritura vence lo cacheado sin que nadie tenga que acordarse, los índices que se sumaron y cómo
medimos el resultado. La misma información, resumida y con fragmentos del código, está en
`/desarrollo` (nota "Cache de datos").

## Tabla de contenidos

1. [El problema](#el-problema)
2. [Resultado](#resultado)
3. [Cómo funciona](#cómo-funciona)
4. [Invalidación automática](#invalidación-automática)
5. [Qué se cachea](#qué-se-cachea)
6. [Casos especiales](#casos-especiales)
7. [Índices](#índices)
8. [Cómo cachear una lectura nueva](#cómo-cachear-una-lectura-nueva)
9. [Cómo medimos y probamos](#cómo-medimos-y-probamos)
10. [Límites y pendientes](#límites-y-pendientes)
11. [Lecciones](#lecciones)
12. [Archivos](#archivos)

---

## El problema

Casi todo lo que muestra el sitio es igual para todos y cambia poco: eventos, charlas, galería,
consejos, proyectos, miembros, perfiles, logros. Sin embargo, cada página vista volvía a pedirlo
todo a la base:

- El layout de `(platform)` lee `cookies()`, así que **todas las páginas son dinámicas** y
  CloudFront no puede cachear su HTML.
- No había ningún cache entre requests: solo `cache()` de React, que deduplica dentro de un mismo
  request.
- El sidebar pedía los próximos eventos **en cada página**, para cualquier visitante, y `Event`
  no tenía índice en `date`.
- Varias páginas cargaban tablas enteras: `/consejos` traía todos los consejos con todas las filas
  de likes, `/logros` calculaba las métricas de todos los usuarios en cada visita, el perfil corría
  los 8 loaders de pestañas más unas 9 queries de logros, y el buscador hacía cuatro `ILIKE` por
  tecla.
- La galería firmaba con RSA cada URL de CloudFront en cada request.

## Resultado

Medido con builds de producción en local (`next start`), visitando cada ruta 10 veces sin sesión:

| Ruta           | Antes (queries / 10 visitas) | Después |
| -------------- | ---------------------------: | ------: |
| `/perfil/[id]` |                          341 |       0 |
| `/`            |                          190 |       0 |
| `/galeria`     |                           70 |       0 |
| `/consejos`    |                           67 |       0 |
| `/eventos`     |                           23 |       0 |

Con sesión iniciada queda solo la consulta de la sesión y lo propio de quien mira (su
inscripción, sus likes). En local la base responde en microsegundos, así que la latencia casi no
cambia; en producción cada query evitada es un viaje de red hasta la base (Postgres en una
instancia EC2 de AWS).

## Cómo funciona

`cached()` (`src/lib/cache.ts`) envuelve una función async con el data cache de Next
(`unstable_cache`):

```ts
export const listEventIndex = cached(
  'event-index',
  () =>
    prisma.event.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'asc' },
      select: { id: true, name: true, date: true, endDate: true },
    }),
  { models: ['Event'] },
);
```

- **Clave**: el nombre (`'event-index'`) más los argumentos, que tienen que ser serializables a
  JSON.
- **Tags**: cada entrada se etiqueta con las tablas que lee (`db:Event`).
- **Duración**: un día por defecto (`revalidate`). En la práctica una entrada se recalcula mucho
  antes, cuando alguien escribe en una de sus tablas.
- **Fechas**: el data cache guarda JSON, que convierte los `Date` en strings. `cached()` las marca
  al guardar y las reconstruye al leer, así la función cacheada devuelve exactamente lo mismo que
  la original.
- **Dentro del request** también deduplica, como `cache()` de React.
- **Dónde vive**: en la memoria del servidor y en `.next/cache` del contenedor.

## Invalidación automática

Lo difícil de un cache es saber cuándo lo guardado dejó de ser cierto. Acá nadie invalida a
mano: el cliente de Prisma (`src/lib/prisma.ts`) tiene una extensión que corre en cada operación.

```ts
}).$extends({
  name: 'data-cache',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!WRITES.has(operation)) {
          if (process.env.NODE_ENV !== 'production') checkCachedRead(modelsIn(model, args));
          return query(args);
        }
        const result = await query(args);
        expireModels(modelsIn(model, args, isDelete(operation)));
        return result;
      },
    },
  },
});
```

Después de cada escritura (`create`, `update`, `upsert`, `delete` y sus variantes `Many`):

1. `modelsIn` (`src/lib/prisma-models.ts`) recorre los argumentos con el grafo de relaciones del
   schema (el datamodel que escribe el generator `datamodel`) y junta todas las tablas que la
   escritura toca, incluidas las **escrituras anidadas** (`members: { create: [...] }` toca
   `ProjectMember`).
2. Si es un borrado, suma las tablas que dependen de la borrada, **transitivamente**: borrar un
   usuario borra sus consejos, que borran sus likes y comentarios.
3. `expireModels` llama a `revalidateTag('db:<Tabla>', { expire: 0 })` para cada una, y el
   siguiente request recalcula lo que leía esas tablas.

La invalidación es por tabla, no por fila: dar un like vence todas las lecturas que leen `Like`.
Es más grueso que invalidar fila por fila, pero no hay forma de olvidarse un caso, y las
escrituras son mucho menos frecuentes que las lecturas.

**Tablas que nunca se cachean**: `PageVisit`, `Session`, `AppLog`, `ErrorLog`, `Notification`,
`PasswordResetToken` y `EmailVerificationToken`. Escribir en ellas no vence nada, y eso importa:
vencer un tag desde una server action hace que el navegador vuelva a pedir la página, y cada página
vista se registra con una server action que escribe en `PageVisit`. `cached()` tira un error si
alguien intenta cachear una de estas tablas.

Las escrituras fuera de un request (el seed, scripts) no tienen cache que vencer y se ignoran.

## Qué se cachea

| Área                 | Lecturas cacheadas                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Layout (cada página) | Próximos eventos del sidebar (`listEventIndex`)                                                                                      |
| Home                 | Eventos de la cartelera, charlas, últimas fotos, fotos de las story cards, testimonios destacados, ambassadors, autores de artículos |
| Eventos              | Listado, detalle, anuncios, contadores (cupo, lista de espera, número de catálogo), memoria de eventos pasados, portada              |
| Galería              | Listado por filtro, opciones de filtros, ítem, vecinos, fotos al azar del escritorio de PCN OS                                       |
| Consejos             | Listado y detalle con comentarios                                                                                                    |
| Comunidad            | Proyectos, miembros, testimonios, setups, logros, feed, historia, conversaciones                                                     |
| Perfil               | Usuario (compartido con la metadata), cada pestaña, métricas de logros                                                               |
| Tarjetas de usuario  | Resumen que se muestra al pasar el mouse por una mención                                                                             |
| Búsqueda             | Corpus del buscador del sitio y lista de personas del buscador de miembros                                                           |
| Otros                | Vínculos de identidad, sitemap, feed RSS, `/metricas` (1 hora por rango)                                                             |

No se cachea lo que depende de quién mira (la sesión, tu inscripción, tus marcas de lectura) ni
las páginas de administración, que necesitan datos frescos y tienen poco tráfico.

## Casos especiales

**Lo que depende de la hora.** Qué eventos son "próximos" cambia con el reloj, no con una
escritura. Esas lecturas cachean la lista completa y filtran en cada request:

```ts
export const fetchUpcomingEvents = async (limit: number = 5) => {
  const now = new Date();
  const events = await listEventIndex();
  return events
    .filter(({ date, endDate }) => date >= now || (endDate !== null && endDate >= now))
    .slice(0, limit)
    .map(({ id, name, date }) => ({ id, name, date }));
};
```

Lo mismo para la cartelera de la home (sale del listado cacheado de `/eventos`) y las fotos al
azar (se cachea la lista de fotos y se sortea en cada request).

**Logros.** Asistir u organizar un evento cuenta recién cuando pasa su fecha, y eso no lo marca
ninguna escritura. Por eso las métricas de logros, `/logros` y las tarjetas de usuario también se
recalculan cada hora (`revalidate: 3600`). Las métricas se guardan como entradas, porque un `Map`
no sobrevive al JSON.

**URLs firmadas.** Las fotos de la galería se sirven con URLs firmadas de CloudFront que vencen.
Se cachean las filas sin firmar y se firman en cada request. Como cada firma es la misma durante
toda su hora, `signGallerySrc` la guarda en memoria y solo vuelve a firmar (RSA) cuando cambia la
hora.

**Búsqueda.** En vez de cuatro `ILIKE` por tecla, se cachean eventos, charlas, consejos y
proyectos (unos cientos de filas cortas) y se filtran en memoria con `toLocaleLowerCase('es')`.

**Lecturas anidadas.** `unstable_cache` no cachea una llamada cacheada que corre dentro de otra:
la de adentro se ejecuta siempre y la guarda la de afuera. Por eso la de afuera tiene que declarar
también las tablas que lee la de adentro (por ejemplo, `/logros` declara las de las métricas).

**`force-dynamic`.** El sitemap y el feed RSS usan `dynamic = 'force-dynamic'` para que el build no
necesite base. Eso no apaga el data cache: solo `fetchCache = 'force-no-store'` lo haría.

## Índices

Postgres no indexa las claves foráneas por su cuenta. La migración
`20261014120000_add_hot_path_indexes` suma índices para lo que las páginas filtran, ordenan y
cuentan:

| Índice                                                               | Para qué                                              |
| -------------------------------------------------------------------- | ----------------------------------------------------- |
| `Event(deletedAt, date)`                                             | Próximos eventos, listados y número de catálogo.      |
| `Notification(userId, read)`                                         | Contador de no leídas del admin (reemplaza `userId`). |
| `Session(userId)`                                                    | Limpieza de sesiones vencidas al iniciar sesión.      |
| `Advice(authorId)`, `Advice(createdAt)`                              | Consejos de un perfil y orden del listado.            |
| `Comment(adviceId)`, `Comment(authorId)`, `Comment(parentCommentId)` | Conteo de comentarios y respuestas.                   |
| `Like(adviceId)`                                                     | Likes de cada consejo.                                |
| `GalleryItem(uploadedById)`, `GalleryItem(createdAt)`                | Subidas por usuario y últimas fotos.                  |

Con el cache, estas queries corren una vez por cambio en lugar de una vez por visita, pero siguen
importando para el primer request después de cada escritura y para lo que no se cachea.

## Cómo cachear una lectura nueva

1. Envolver la consulta con `cached(nombre, fn, { models })`.
2. Declarar **todas** las tablas que lee, incluidas las de los `include`, los `select` anidados,
   los `_count` y los filtros por relación (`where: { tags: { some: … } }` lee `GalleryItemTag`).
3. No cachear nada filtrado por la hora actual: cachear la lista y filtrar afuera.
4. No cachear URLs firmadas ni nada que dependa de la sesión.
5. Si hace falta, ajustar `revalidate` (por ejemplo, una hora para lo que depende de fechas que
   pasan).

En desarrollo, si una lectura cacheada toca una tabla que no declaró, la consola avisa:

```
[cache] gallery-tiles reads GalleryItemTag but isn't tagged with it
```

Ese aviso significa que una escritura en esa tabla no vencería la entrada y la página mostraría
datos viejos. Las server actions no tienen que hacer nada: la extensión de Prisma ya vence lo que
corresponde. Los `revalidatePath` que ya existían siguen sirviendo para refrescar el router del
cliente.

## Cómo medimos y probamos

**Queries por página.** Se cuenta `xact_commit` de `pg_stat_database` antes y después de N
requests contra un build de producción (`pnpm build && PORT=3311 pnpm start`). Cada query de Prisma
fuera de una transacción es un commit. Los backends de Postgres publican sus estadísticas recién
cuando están idle (cada ~10 segundos), así que hay que esperar ese flush antes de cada lectura;
sin la espera los números dan cerca de 0 y parecen una mejora falsa:

```sh
DB="postgresql://…/pcn_website"
q() { psql "$DB" -Atc "select xact_commit from pg_stat_database where datname = current_database()"; }
curl -s -o /dev/null http://localhost:3311/eventos   # calentar
sleep 11; a=$(q)
for i in $(seq 10); do curl -s -o /dev/null http://localhost:3311/eventos; done
sleep 11; b=$(q)
echo $((b - a - 1))   # -1 por la consulta de q
```

La versión anterior se midió igual, buildeada en un worktree aparte desde el commit previo.

**Invalidación.** Se renombró un evento con `prisma.event.update` desde una ruta temporal y se
comprobó que `/eventos`, el detalle del evento y la home mostraban el nombre nuevo en el request
siguiente, y el viejo después de volver a renombrarlo.

**Tests.** `src/lib/prisma-models.test.ts` cubre el grafo de relaciones (includes, `_count`,
filtros por relación, escrituras anidadas, borrados en cascada transitivos) y
`src/lib/cache.test.ts` el ida y vuelta de las fechas, el rechazo de tablas no cacheables y la
invalidación. En Jest `unstable_cache` está mockeado como una función que no cachea
(`jest.setup.ts`).

## Límites y pendientes

- **Un solo contenedor.** El cache vive en cada contenedor. Hoy hay uno (Kamal en un EC2), así que
  alcanza. Con varios, cada uno guardaría su copia y una escritura solo vencería la del contenedor
  que la recibió: haría falta un `cacheHandler` compartido (Redis, por ejemplo). Después de cada
  deploy el cache arranca vacío y se llena con las primeras visitas.
- **Entradas de más de 2 MB.** Next no guarda entradas de más de 2 MB, y esa lectura volvería a ir
  a la base en cada request. `cached()` lo avisa con el nombre:
  `[cache] <nombre> is N bytes: Next doesn't cache entries over 2MB`. Los candidatos a crecer son
  el listado de la galería y el de consejos con sus likes.
- **`/galeria` sin paginar.** Ya no le cuesta nada a la base, pero manda todos los ítems al
  navegador.
- **Pool de conexiones.** Conviene fijar `connection_limit` en el `DATABASE_URL` de producción (es
  configuración del deploy, no del código).
- **Siguiente paso posible.** Activar `cacheComponents` de Next 16 (`'use cache'`, `cacheLife`,
  `cacheTag`) permitiría servir la página cacheada y completar solo las partes que dependen del
  usuario. Es lo más prolijo, pero requiere migrar todas las páginas, porque hoy el layout lee
  `cookies()`.

## Lecciones

1. **Invalidar donde se escribe, no donde se lee.** Engancharse al cliente de Prisma cubre todas
   las escrituras, también las que se agreguen mañana.
2. **Invalidar por tabla alcanza.** Con muchas más lecturas que escrituras, la granularidad fina
   no paga su complejidad.
3. **Cachear datos, no resultados que dependen del momento.** Lo que depende de la hora o de una
   firma que vence se calcula sobre lo cacheado.
4. **Medir con un método confiable.** El primer intento de medición daba 0 queries también en la
   versión vieja: las estadísticas de Postgres llegan con demora.
5. **Validar el cache contra el contenido, no solo contra contadores.** La prueba que cambia un
   nombre y lo busca en el HTML es la que demuestra que la invalidación funciona.

## Archivos

| Archivo                                                  | Qué tiene                                                 |
| -------------------------------------------------------- | --------------------------------------------------------- |
| `src/lib/cache.ts`                                       | `cached()`, `expireModels`, tablas no cacheables, avisos. |
| `src/lib/prisma-models.ts`                               | Grafo de relaciones y `modelsIn`.                         |
| `src/lib/prisma.ts`                                      | Extensión que vence el cache en cada escritura.           |
| `src/lib/event-index.ts`                                 | Índice de eventos y contadores cacheados.                 |
| `src/lib/gallery.ts`, `src/lib/gallery-signing.ts`       | Galería cacheada sin firmar y firmas guardadas por hora.  |
| `src/lib/achievement-metrics.ts`                         | Métricas de logros cacheadas por hora.                    |
| `src/app/(platform)/perfil/[id]/profile-data.ts`         | Loaders cacheados de cada pestaña del perfil.             |
| `src/app/api/search/route.ts`                            | Corpus del buscador filtrado en memoria.                  |
| `prisma/migrations/20261014120000_add_hot_path_indexes/` | Índices nuevos.                                           |
| `src/lib/cache.test.ts`, `src/lib/prisma-models.test.ts` | Tests.                                                    |
| `jest.setup.ts`                                          | Mock de `unstable_cache`.                                 |
