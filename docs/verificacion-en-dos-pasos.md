# Verificación en dos pasos

Cómo funciona el 2FA opcional del sitio (códigos TOTP de una app de autenticación más códigos de
recuperación), por qué el secreto se guarda cifrado y qué hay que cuidar de la clave
`TWO_FACTOR_ENCRYPTION_KEY` en producción.

## Tabla de contenidos

1. [Cómo funciona](#cómo-funciona)
2. [Qué se guarda en la base](#qué-se-guarda-en-la-base)
3. [Por qué el secreto va cifrado](#por-qué-el-secreto-va-cifrado)
4. [El cifrado](#el-cifrado)
5. [La clave en producción](#la-clave-en-producción)
6. [Local, worktrees y tests](#local-worktrees-y-tests)
7. [Rotar la clave](#rotar-la-clave)
8. [Cómo lo verificamos](#cómo-lo-verificamos)
9. [Archivos](#archivos)

---

## Cómo funciona

- Cada usuario lo activa desde `/perfil`: el sitio genera un secreto, muestra el QR para escanearlo
  con la app (Google Authenticator, 1Password, Authy...) y lo activa recién cuando el usuario
  ingresa un primer código válido. En ese momento se muestran, una sola vez, 10 códigos de
  recuperación.
- Al iniciar sesión, con la contraseña correcta el login no crea la sesión: abre un intento de 10
  minutos (`TwoFactorChallenge`, en una cookie httpOnly y guardado como hash, igual que las
  sesiones) y pide el código. 5 códigos incorrectos cierran el intento y hay que volver a ingresar
  la contraseña.
- Sirve el código de la app o uno de recuperación. Un código de la app no se puede reusar
  (`twoFactorLastStep` guarda el último paso de 30 segundos usado) y cada código de recuperación
  sirve una sola vez.
- Desactivarlo o generar códigos de recuperación nuevos también pide un código.

Los códigos siguen el estándar RFC 6238 y se calculan con `node:crypto`, sin dependencias
(`src/lib/totp.ts`), verificados contra los vectores de prueba del RFC.

## Qué se guarda en la base

| Columna de `User`        | Contenido                                                       |
| ------------------------ | --------------------------------------------------------------- |
| `twoFactorSecret`        | El secreto TOTP, **cifrado** (ver abajo)                        |
| `twoFactorEnabledAt`     | Cuándo se activó; `null` si está desactivado                    |
| `twoFactorRecoveryCodes` | Los códigos de recuperación que quedan, como hash SHA-256       |
| `twoFactorLastStep`      | El último paso de tiempo usado, para que no se repita un código |

`twoFactorSecret` y `twoFactorRecoveryCodes` están en el `omit` global de Prisma
(`src/lib/prisma.ts`), como la contraseña: no viajan en ninguna consulta salvo que se pidan a
propósito, y nunca salen del servidor.

## Por qué el secreto va cifrado

La app del celular y el servidor comparten el secreto, y cada 30 segundos los dos calculan con él
el mismo código de 6 dígitos. El servidor necesita el secreto original para calcularlo, así que no
se puede guardar como hash como la contraseña.

Guardado tal cual, quien leyera la tabla `User` (un backup filtrado, un volcado de la base, acceso
indebido al servidor) podría generar los códigos de todos los que tienen 2FA. Le seguiría faltando
la contraseña, que sí está hasheada, pero el segundo factor perdería su valor. Cifrado con una clave
que vive fuera de la base, la base sola no alcanza.

## El cifrado

`src/lib/two-factor-crypto.ts`:

- **AES-256-GCM** con `node:crypto`, un IV aleatorio de 12 bytes por cada cifrado.
- Formato guardado: `v1:<iv>:<tag>:<texto cifrado>`, cada parte en base64url. El `v1` deja lugar
  para cambiar el esquema más adelante.
- **El id del usuario va como dato asociado** (AAD): copiar el valor cifrado a la fila de otro
  usuario no sirve, porque no abre.
- Si el valor está alterado, es de otro usuario, se cifró con otra clave o es texto plano,
  `decryptTwoFactorSecret` devuelve `null` y el código se rechaza.
- Si **falta la clave** en producción, tira un error explícito en vez de devolver `null`, así no
  se confunde con un código incorrecto.

Se cifra en `startTwoFactorSetup` y se descifra al verificar un código (`checkSecondFactor` en
`src/lib/two-factor.ts` y `confirmTwoFactorSetup` en `src/actions/auth/two-factor.ts`).

## La clave en producción

`TWO_FACTOR_ENCRYPTION_KEY`: 32 bytes aleatorios en base64.

```bash
openssl rand -base64 32
```

Recorrido hasta el contenedor:

1. Secret de GitHub Actions `TWO_FACTOR_ENCRYPTION_KEY` (Settings → Secrets and variables →
   Actions). **Ya está cargado.**
2. `.github/workflows/deployment.yml` lo pasa al entorno del deploy.
3. `.kamal/secrets` lo toma del entorno y `config/deploy.yml` lo inyecta al contenedor en
   `env.secret`.

**Si falta o es inválida, el sitio no se cae.** `src/instrumentation.ts` revisa la clave al
arrancar el servidor en producción; sin ella el server nuevo responde 500 en `/up`, el health check
de Kamal falla y sigue corriendo la versión anterior. El error en los logs dice qué falta:

```
TWO_FACTOR_ENCRYPTION_KEY is missing or isn't 32 bytes in base64 (openssl rand -base64 32)
```

La revisión no corre durante `next build` (la imagen se compila sin los secrets) ni fuera de
producción.

## Local, worktrees y tests

- Fuera de producción se usa una clave fija de desarrollo, así que `pnpm dev`, los worktrees,
  `pnpm test` y `pnpm test:db` funcionan sin configurar nada. Se puede definir
  `TWO_FACTOR_ENCRYPTION_KEY` en `.env` para usar otra (está en `.env.template`).
- Los e2e levantan un build de producción (`next start`), así que tienen su propia clave fija en
  `tests/e2e/support/env.ts`. Esa base es descartable, por eso no importa que la clave esté en el
  repo.
- Un secreto guardado antes del cifrado (texto plano, solo en bases locales) no abre: al confirmar
  la configuración pide empezarla de nuevo, y la nueva ya queda cifrada. En producción no hay datos
  viejos porque nadie había activado 2FA antes del cifrado.

## Rotar la clave

**No cambies la clave una vez que haya gente con 2FA activado.** Con otra clave sus secretos no
abren y la app de autenticación deja de servir para entrar (les quedarían solo los códigos de
recuperación).

Si hiciera falta rotarla (por ejemplo, si se filtró), habría que escribir un script que descifre
cada `twoFactorSecret` con la clave vieja y lo vuelva a cifrar con la nueva, correrlo y recién
después cambiar el secret de GitHub y deployar. Hoy el código acepta una sola clave.

## Cómo lo verificamos

- `src/lib/two-factor-crypto.test.ts`: ida y vuelta, IV distinto en cada cifrado, rechazo con otro
  usuario, valor alterado, otra clave o texto plano, solo claves de 32 bytes, y error en producción
  sin clave.
- `src/lib/two-factor.test.ts`: un código de la app no sirve si el secreto no abre para ese
  usuario.
- `src/actions/auth/two-factor.db.test.ts` (contra Postgres): el valor en la base empieza con `v1:`
  y no contiene el secreto, además de todo el flujo de activar, entrar, recuperar y desactivar.
- Build de producción levantado a mano: sin la clave `/up` responde 500 con el error de arriba; con
  la clave responde 200.

## Archivos

| Archivo                               | Qué hace                                                  |
| ------------------------------------- | --------------------------------------------------------- |
| `src/lib/totp.ts`                     | Códigos TOTP, QR y códigos de recuperación                |
| `src/lib/two-factor-crypto.ts`        | Cifrado y descifrado del secreto                          |
| `src/lib/two-factor.ts`               | Intento de login pendiente y verificación de códigos      |
| `src/actions/auth/two-factor.ts`      | Server actions: activar, verificar, desactivar, regenerar |
| `src/instrumentation.ts`              | Frena el arranque en producción si falta la clave         |
| `config/deploy.yml`, `.kamal/secrets` | Pasan la clave al contenedor                              |
| `.github/workflows/deployment.yml`    | Lee el secret de GitHub                                   |
| `docs/seguridad-owasp.md`             | El 2FA dentro del resumen de seguridad del sitio          |
