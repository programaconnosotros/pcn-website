import type { InterviewQuestion, Seniority } from './types';

export const dockerQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'docker',
      question: '¿Qué diferencia hay entre un contenedor y una máquina virtual?',
      answer:
        'Una máquina virtual emula hardware completo y corre su propio kernel sobre un hipervisor, así que pesa gigas y tarda en arrancar. Un contenedor es un proceso aislado que comparte el kernel del host, con su propio filesystem, red y procesos gracias a namespaces y cgroups. Por eso arranca en milisegundos y ocupa mucho menos, a cambio de un aislamiento más débil que una VM.',
    },
    {
      topic: 'docker',
      question: '¿Qué diferencia hay entre una imagen y un contenedor?',
      answer:
        'La imagen es una plantilla inmutable: un conjunto de capas de solo lectura con el filesystem y la metadata (comando, variables, puertos). El contenedor es una instancia en ejecución de esa imagen, que suma una capa escribible encima. De una misma imagen podés levantar muchos contenedores, y lo que escribas en uno se pierde al borrarlo si no usás volúmenes.',
    },
    {
      topic: 'docker',
      question: '¿Qué diferencia hay entre `CMD` y `ENTRYPOINT` en un Dockerfile?',
      answer:
        '`ENTRYPOINT` define el ejecutable que siempre corre el contenedor y `CMD` define los argumentos por defecto, que se reemplazan con lo que pases en `docker run imagen <args>`. Si solo usás `CMD`, todo el comando se puede pisar. Conviene la forma exec (`["node", "server.js"]`) en vez de la forma shell, para que el proceso reciba las señales directamente.',
    },
    {
      topic: 'docker',
      question: '¿Qué diferencia hay entre un volumen y un bind mount?',
      answer:
        'Un volumen lo administra Docker (vive en su directorio interno, se crea con `docker volume create` o en compose) y es la opción recomendada para persistir datos como los de una base. Un bind mount monta una ruta concreta del host dentro del contenedor, ideal en desarrollo para ver los cambios del código al instante. Los dos sobreviven al contenedor, a diferencia de su capa escribible.',
    },
    {
      topic: 'docker',
      question: '¿Para qué sirve Docker Compose?',
      answer:
        'Define en un `compose.yaml` una aplicación de varios contenedores (app, base de datos, cache) con sus imágenes, puertos, variables, volúmenes y redes, y la levanta con `docker compose up`. Los servicios se resuelven entre sí por nombre en una red común, por ejemplo `postgres:5432`. Es muy útil para desarrollo local y tests de integración, pero no es un orquestador de producción como Kubernetes.',
    },
    {
      topic: 'docker',
      question: '¿Para qué sirve el archivo `.dockerignore`?',
      answer:
        'Excluye archivos del contexto de build que se manda al daemon, igual que un `.gitignore`. Evita copiar `node_modules`, `.git`, builds locales o archivos `.env` con secretos dentro de la imagen. Además acelera el build y evita invalidar la caché de `COPY . .` por cambios irrelevantes.',
    },
  ],
  'semi-senior': [
    {
      topic: 'docker',
      question:
        '¿Cómo funcionan las capas y la caché de build, y cómo ordenás un Dockerfile para aprovecharla?',
      answer:
        'Cada instrucción que modifica el filesystem genera una capa, y Docker reutiliza las capas cacheadas mientras la instrucción y sus archivos de entrada no cambien; en cuanto una se invalida, se reconstruyen todas las siguientes. Por eso se copia primero lo que cambia poco (por ejemplo `package.json` y el lockfile), se instalan dependencias y recién después se copia el código. Así un cambio en el código no reinstala todo.',
    },
    {
      topic: 'docker',
      question: '¿Qué es un multi-stage build y para qué sirve?',
      answer:
        'Es un Dockerfile con varios `FROM`: una etapa compila con todas las herramientas de build y la etapa final copia solo el resultado con `COPY --from=build`. La imagen final queda chica y sin compiladores, código fuente ni dependencias de desarrollo, lo que también reduce la superficie de ataque. Es el patrón estándar para Go, Java, Node con TypeScript o frontends estáticos.',
    },
    {
      topic: 'docker',
      question: '¿Por qué conviene no correr el contenedor como root y cómo lo hacés?',
      answer:
        'Por defecto el proceso corre como root dentro del contenedor, y si alguien explota la app o escapa del contenedor tiene más privilegios para hacer daño. Se crea un usuario sin privilegios y se usa la instrucción `USER` (muchas imágenes oficiales ya traen uno, como `node`). Se complementa con `--read-only`, eliminar capabilities con `--cap-drop` y no montar el socket de Docker.',
    },
    {
      topic: 'docker',
      question: '¿Qué diferencia hay entre `COPY` y `ADD`?',
      answer:
        'Los dos copian archivos al filesystem de la imagen, pero `ADD` además descomprime tarballs locales y puede bajar URLs. Esa magia lo hace menos predecible, así que la recomendación es usar `COPY` siempre y `ADD` solo cuando querés extraer un tar a propósito. Para bajar archivos es mejor `curl` en un `RUN` (o `ADD` con checksum) para controlar la verificación.',
    },
    {
      topic: 'docker',
      question: '¿Cómo funciona la red en Docker y cómo se comunican dos contenedores?',
      answer:
        'El driver por defecto es `bridge`: cada contenedor tiene su IP en una red virtual y se publican puertos al host con `-p 8080:80`. En una red bridge definida por el usuario (la que crea compose) hay DNS interno, así que los contenedores se hablan por nombre de servicio sin publicar puertos. Existen además `host` (comparte la red del host) y `none`, y overlay para varios hosts.',
    },
    {
      topic: 'docker',
      question:
        '¿Para qué sirve un `HEALTHCHECK` y en qué se diferencia de que el proceso esté vivo?',
      answer:
        'Un proceso puede estar corriendo pero colgado o sin poder atender requests. `HEALTHCHECK` define un comando (por ejemplo un `curl` a `/health`) que Docker ejecuta periódicamente para marcar el contenedor como `healthy` o `unhealthy`. Compose lo usa con `depends_on: condition: service_healthy` para esperar a una base; en Kubernetes se ignora y se usan las probes del pod.',
    },
  ],
  senior: [
    {
      topic: 'docker',
      question: '¿Qué son los namespaces y los cgroups y qué rol cumplen en un contenedor?',
      answer:
        'Son features del kernel Linux sobre los que se construyen los contenedores. Los namespaces aíslan lo que el proceso ve: PID, red, mount, UTS, IPC y usuarios. Los cgroups limitan y miden lo que puede consumir: CPU, memoria, I/O y cantidad de procesos. Entenderlo explica por qué un contenedor comparte kernel con el host y por qué un límite de memoria termina en un OOM kill.',
    },
    {
      topic: 'docker',
      question: '¿Qué problema hay con el PID 1 dentro de un contenedor y cómo lo resolvés?',
      answer:
        'El proceso principal corre como PID 1, que en Linux no tiene handlers de señales por defecto y además debe cosechar procesos zombie. Si arrancás con forma shell (`sh -c`), el shell no reenvía `SIGTERM` y el contenedor tarda el timeout y muere con `SIGKILL` sin cerrar conexiones. Se resuelve con forma exec en `ENTRYPOINT`, manejando `SIGTERM` en la app para un graceful shutdown y usando un init chico como `tini` (o `docker run --init`).',
    },
    {
      topic: 'docker',
      question: '¿Cómo reducís el tamaño y la superficie de ataque de una imagen?',
      answer:
        'Multi-stage builds para dejar fuera el toolchain, imágenes base mínimas como `-slim`, Alpine (ojo con musl) o distroless, que no traen shell ni gestor de paquetes. Instalar solo dependencias de producción, limpiar cachés de paquetes en el mismo `RUN` y usar `.dockerignore`. Menos paquetes significa menos CVEs para parchear; el costo de distroless es que debuggear exige contenedores efímeros o imágenes `:debug`.',
    },
    {
      topic: 'docker',
      question: '¿Cómo integrás el escaneo de imágenes y la supply chain en el pipeline?',
      answer:
        'Escaneás cada imagen en CI con Trivy, Grype o Docker Scout y fallás el build ante CVEs críticos con fix disponible, aceptando excepciones documentadas. Generás un SBOM (`docker buildx build --sbom=true` o Syft), firmás las imágenes con Cosign y verificás la firma al desplegar con una política de admisión. También rebuildeás periódicamente para tomar parches de la imagen base aunque tu código no cambie.',
    },
    {
      topic: 'docker',
      question: '¿Por qué usar digests en vez de tags y cómo manejás el versionado de imágenes?',
      answer:
        'Un tag como `latest` o incluso `1.4` es mutable: alguien puede empujar otra imagen con el mismo tag y tu deploy cambia sin que cambie tu configuración. Un digest (`imagen@sha256:...`) identifica el contenido exacto y es inmutable. En la práctica se taggea con el SHA del commit o semver para humanos, se despliega por digest y se configuran tags inmutables en el registry (ECR, Artifact Registry, GHCR).',
    },
    {
      topic: 'docker',
      question: '¿Qué aporta BuildKit y qué features usarías en un build de producción?',
      answer:
        'BuildKit es el motor de build por defecto: ejecuta etapas en paralelo, salta las que no se usan y tiene mejor caché. Permite cache mounts (`RUN --mount=type=cache,target=/root/.npm`) para no rebajar dependencias, secret mounts (`--mount=type=secret`) para usar tokens sin que queden en ninguna capa, y caché remota exportada a un registry para CI. Con `docker buildx` además construís imágenes multi-arquitectura, por ejemplo `linux/amd64` y `linux/arm64`.',
    },
  ],
};
