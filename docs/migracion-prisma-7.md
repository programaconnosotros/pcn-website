# Migración a Prisma 7

Cómo pasamos de Prisma 6.2.1 a 7.10.0 (octubre de 2026): qué cambió en Prisma, qué tocamos en el
repo, las diferencias de comportamiento que hay que conocer, los bugs que salieron en el camino y
cómo verificamos que el sitio siguiera funcionando igual.

## Tabla de contenidos

1. [Por qué](#por-qué)
2. [Qué cambia en Prisma 7](#qué-cambia-en-prisma-7)
3. [Cambios en el repo](#cambios-en-el-repo)
4. [Conexión a la base: `pgAdapter`](#conexión-a-la-base-pgadapter)
5. [El datamodel para el cache y el diagrama](#el-datamodel-para-el-cache-y-el-diagrama)
6. [Diferencias de comportamiento](#diferencias-de-comportamiento)
7. [Bugs que aparecieron](#bugs-que-aparecieron)
8. [Cómo lo verificamos](#cómo-lo-verificamos)
9. [Si algo falla en producción](#si-algo-falla-en-producción)
10. [Archivos](#archivos)

---

## Por qué

La 6.2 había quedado casi dos años atrás y sin parches. La 7 trae un cliente sin el engine de
Rust: la imagen de Docker no carga el binario del query engine, no hay `binaryTargets` y el
arranque es más rápido. Fuimos a la última estable (7.10.0). En npm el tag `latest` apuntaba a una
release candidate de la 8, que no usamos.

## Qué cambia en Prisma 7

- **Sin engine de Rust.** El cliente arma el SQL en TypeScript (un compilador en WASM) y lo manda
  por un _driver adapter_. Para Postgres es `@prisma/adapter-pg`, que usa `pg`, el driver de Node.
  El adapter es obligatorio.
- **Generator nuevo.** `prisma-client` reemplaza a `prisma-client-js` y escribe el cliente como
  código TypeScript del proyecto, en la carpeta que diga `output`. Ya no se importa de
  `@prisma/client`.
- **`prisma.config.ts`.** La URL que usa el CLI (migraciones) y el comando del seed salen del
  schema y del bloque `"prisma"` del `package.json` para ir a este archivo.
- **El `.env` ya no se carga solo.** Ni el CLI ni el cliente lo leen: el config lo carga con
  `dotenv` y el seed también. Next sigue cargándolo por su cuenta.
- **`Prisma.dmmf` ya no existe**, y el modelo que el cliente trae en runtime es más chico (ver
  [abajo](#el-datamodel-para-el-cache-y-el-diagrama)).

## Cambios en el repo

| Qué                                  | Antes                                           | Ahora                                                                                     |
| ------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Generator                            | `prisma-client-js`                              | `prisma-client` con `output = "../src/generated/prisma"` (gitignoreado)                   |
| Imports de tipos y cliente           | `@prisma/client`                                | `@/generated/prisma/client` (server) o `@/generated/prisma/browser` (componentes cliente) |
| URLs de conexión                     | `url`/`directUrl` en `schema.prisma`            | App: `DATABASE_URL` con `pgAdapter()`. CLI: `DIRECT_URL ?? DATABASE_URL` en el config     |
| Seed                                 | `"prisma": { "seed" }` en `package.json`        | `migrations.seed` en `prisma.config.ts`                                                   |
| Datamodel (cache, diagrama)          | `Prisma.dmmf`                                   | `src/generated/datamodel/datamodel.json`, de un generator propio                          |
| Alias `@prisma/*` en `tsconfig.json` | Apuntaba a `./prisma/*` (con un parche en Jest) | Eliminado: hacía que Jest resolviera `@prisma/adapter-pg` a una carpeta local             |

El cliente se sigue regenerando solo en `postinstall` y `prebuild`. `src/generated` está en
`.gitignore`, `.prettierignore`, `.dockerignore` y en los `ignores` de ESLint.

## Conexión a la base: `pgAdapter`

`pg` lee la URL distinto que el engine de Rust de Prisma 6, y pasarle `DATABASE_URL` tal cual
cambiaba el comportamiento en silencio:

- con `sslmode=require`, pg **verifica** el certificado, y uno autofirmado (lo normal en un
  Postgres propio) hace fallar la conexión. Prisma 6 cifraba sin verificar;
- sin `sslmode`, pg se conecta **sin TLS**. Prisma 6 usaba `prefer`: TLS si el servidor lo
  acepta y, si no, sin TLS;
- `connection_limit`, `pool_timeout`, `pgbouncer` y `schema` son parámetros de Prisma que pg
  ignora.

`src/lib/database-url.ts` traduce la URL para que con la misma `DATABASE_URL` todo se comporte como
antes:

- `pgConfig(url)` arma las opciones del pool. `sslmode=require` usa TLS sin verificar el
  certificado (salvo `sslaccept=strict`) y `disable` lo apaga. `connection_limit` pasa a `max`
  (por defecto, CPUs × 2 + 1, como Prisma) y `pool_timeout` a `connectionTimeoutMillis` (10 s por
  defecto). Los parámetros de Prisma se sacan de la URL antes de dársela a pg.
- Con `prefer` o sin `sslmode`, `pgAdapter(url)` le pregunta al servidor si acepta TLS **antes de
  conectar**, con el mensaje `SSLRequest` del protocolo de Postgres (lo mismo que hace libpq), y
  usa TLS solo si contesta que sí. Así funciona igual con un Postgres con TLS y sin él, sin
  adivinar por el nombre del host.
- Sin URL (el build de Docker no tiene base) el cliente se importa igual y el error aparece recién
  en la primera query, como con Prisma 6.

El cliente (`src/lib/prisma.ts`) y el seed usan `pgAdapter(process.env.DATABASE_URL)`. El adapter
no cachea prepared statements, así que funciona detrás de un pooler en modo transacción sin
`pgbouncer=true`.

## El datamodel para el cache y el diagrama

El cache de datos (`src/lib/prisma-models.ts`) usa las relaciones del schema para saber qué tablas
toca cada escritura y qué se borra en cascada. El diagrama de `/desarrollo`
(`scripts/generate-db-schema.mjs`) también las usa. Las dos cosas leían `Prisma.dmmf`.

El modelo que trae el cliente de Prisma 7 en runtime solo tiene nombre, tipo y relación de cada
campo: no dice qué lado de la relación tiene la clave foránea (`relationFromFields`) ni si es una
lista (`isList`), que es justo lo que hace falta para calcular el borrado en cascada.

La solución es un generator propio y chico, `prisma/datamodel-generator.mjs`, declarado en el
schema junto al del cliente. En cada `prisma generate` escribe el datamodel completo en
`src/generated/datamodel/datamodel.json`, así nunca queda desactualizado respecto del schema.
Comparamos su salida con el `Prisma.dmmf` de la 6.2.1 (modelos, campos, relaciones y enums) y es
idéntica.

## Diferencias de comportamiento

- **Fechas como parámetro de `$queryRaw`.** Prisma 6 las mandaba como `timestamptz` y la 7 las
  manda sin tipo, como hora UTC (`'2026-10-04 05:00:00'`). Las columnas `timestamp(3)` guardan
  UTC, así que ahora el resultado es correcto con cualquier zona horaria de la sesión. Con la
  sesión en UTC (producción) los resultados son idénticos. En un Postgres local con otra zona, la
  6 corría `/metricas` y `/admin` unas horas. Ojo: un `${fecha}` sin contexto de tipo (por ejemplo
  `SELECT ${fecha}`) ahora falla con `42P18` y hay que castearlo (`${fecha}::timestamp`).
- **`omit` global en los tipos.** En la 7, lo que omite el cliente por defecto (`password`,
  `speakerPhone`) desaparece también de los tipos de los `include` anidados. En la 6 los tipos lo
  mostraban aunque en runtime no viniera. Así aparecieron los dos primeros bugs de abajo.
- **Pool de conexiones.** pg cierra las conexiones ociosas a los 10 s; el engine de Rust las
  mantenía abiertas. No cambia nada visible.

## Bugs que aparecieron

Los tres ya estaban en `main` y se arreglaron en commits aparte, antes de la migración:

1. **Crear charla desde una propuesta fallaba siempre.** La acción leía los oradores de la propuesta
   sin `speakerPhone` (lo omite el cliente) y lo pasaba a una columna obligatoria. Ahora lo pide con
   `omit: { speakerPhone: false }`.
2. **Editar una charla desde `/charlas` borraba los teléfonos de los oradores.** El form se llenaba
   con el listado público, que no trae teléfonos, y `updateTalk` reescribe todos los oradores.
   Ahora el form pide la charla con `fetchTalkForEdit`, que devuelve los teléfonos solo a quien
   gestiona su evento.
3. **Guardar una charla con evento fallaba con "Invalid input".** El form le pasaba a la acción los
   valores ya transformados por zod (la fecha como `Date`) y la acción los validaba de nuevo con el
   mismo schema, que espera texto. Ahora el form manda los valores sin transformar (`raw: true`).
   Este no tiene que ver con Prisma: lo encontró el recorrido de escrituras.

## Cómo lo verificamos

Todo contra bases de prueba locales, con la 6.2.1 y la 7 lado a lado:

- **Typecheck, lint y Jest** (871 tests, con tests nuevos para `pgConfig`, `serverAcceptsTls`,
  `fetchTalkForEdit` y la conversión de propuestas).
- **Recorrido del sitio:** 74 rutas como visitante y como admin (148 respuestas) contra un build de
  producción de cada versión, levantados a la vez sobre la misma base. Las únicas diferencias
  fueron datos aleatorios, el orden de eventos con la misma fecha y el contador de tests de
  `/desarrollo/calidad`. Con la sesión de la base en UTC, `/metricas`, `/admin`, `/visitas` y
  `/analiticas` dan idénticas.
- **Escrituras desde el navegador (Playwright),** verificando la base después de cada paso: login,
  like, comentario, consejo nuevo, inscripción a un evento (transacción con `SELECT … FOR UPDATE`),
  aceptar una propuesta y convertirla en charla, editar una charla y borrar un consejo con sus likes
  y comentarios en cascada. En todos los casos la página se actualizó al recargar, o sea que el
  cache se invalidó.
- **Tipos y transacciones:** arrays de texto con comas, comillas y emojis (ida y vuelta y filtro
  `has`), rollback de una transacción interactiva, `groupBy`, `aggregate` de fechas y el override de
  `omit`.
- **TLS:** contra el Postgres local sin SSL (sin `sslmode` y con `prefer` conecta sin TLS;
  `require` falla) y contra un Postgres descartable que **solo** aceptaba TLS, con certificado
  autofirmado (sin `sslmode`, con `prefer` y con `require` conecta cifrado; `sslaccept=strict`
  rechaza el certificado; `disable` lo rechaza el servidor). Las migraciones del CLI con
  `sslmode=require` también pasaron.
- **Base desde cero:** `migrate deploy`, seed y `migrate dev --create-only` sin cambios (no hay
  drift entre migraciones y schema). `pnpm db:diagram` genera el mismo diagrama.
- **Pasos de producción:** los de `Dockerfile.prod` sobre una copia limpia del repo, sin `.env`
  (`pnpm install` y `pnpm run build` sin base, como el build de Kamal), y después `pnpm start`
  con base: mismos resultados que el build local. También el hook `pre-deploy` de Kamal
  (`prisma migrate deploy` con `DIRECT_URL`). La imagen de Docker en sí no se llegó a construir
  porque la máquina no tenía espacio en disco para Docker.

## Si algo falla en producción

La base de producción es un Postgres propio en una instancia EC2 de AWS.

- **No conecta (TLS, certificado, "does not support SSL").** Mirar el `sslmode` de `DATABASE_URL`
  y `src/lib/database-url.ts`. Sin `sslmode`, la app usa TLS solo si el servidor lo acepta. Con
  `sslmode=require`, el servidor tiene que tener SSL activado.
- **Demasiadas conexiones o requests esperando conexión.** Fijar `connection_limit` (y si hace
  falta `pool_timeout`) en `DATABASE_URL`: `pgConfig` los pasa al pool de pg.
- **Fallan las migraciones del deploy.** El hook `.kamal/hooks/pre-deploy` corre en el runner de
  GitHub Actions y usa `DIRECT_URL` (o `DATABASE_URL`) a través de `prisma.config.ts`.
- **`42P18: could not determine data type of parameter`** en un SQL crudo nuevo: castear el
  parámetro (ver [Diferencias de comportamiento](#diferencias-de-comportamiento)).

## Archivos

| Archivo                          | Qué tiene                                                          |
| -------------------------------- | ------------------------------------------------------------------ |
| `prisma/schema.prisma`           | Generators `client` (Prisma 7) y `datamodel`; datasource sin URLs. |
| `prisma.config.ts`               | URL del CLI, ruta de migraciones, seed; carga `.env`.              |
| `prisma/datamodel-generator.mjs` | Generator que escribe el datamodel completo en JSON.               |
| `src/lib/database-url.ts`        | `pgConfig`, `serverAcceptsTls` y `pgAdapter`.                      |
| `src/lib/prisma.ts`              | Cliente con el adapter, `omit` global y la extensión del cache.    |
| `src/lib/prisma-models.ts`       | Grafo de relaciones del cache, ahora desde el datamodel generado.  |
| `scripts/generate-db-schema.mjs` | Diagrama de `/desarrollo`, ahora desde el datamodel generado.      |
| `prisma/seed.ts`                 | Seed con el adapter y `dotenv`.                                    |
| `src/lib/database-url.test.ts`   | Tests de la traducción de la URL y de la consulta de TLS.          |
