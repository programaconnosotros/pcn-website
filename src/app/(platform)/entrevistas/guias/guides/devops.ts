import type { InterviewGuide } from './types';

export const devopsGuide: InterviewGuide = {
  track: 'devops',
  summary:
    'Qué estudiar y cómo practicar para una entrevista de DevOps, SRE o platform engineering: Linux, redes, Docker, Kubernetes, Terraform, CI/CD, AWS, Azure, Google Cloud, Vercel y observabilidad, de junior a senior.',
  sections: [
    {
      id: 'la-entrevista',
      title: 'Cómo es la entrevista y qué rol buscan',
      body: [
        'Un proceso típico de DevOps tiene un screening con recruiting, una entrevista técnica conceptual (Linux, redes, contenedores, cloud, CI/CD), un ejercicio práctico y, para perfiles más altos, una entrevista de diseño de infraestructura y otra de comportamiento centrada en incidentes. El ejercicio práctico varía mucho: puede ser un take-home (dockerizar una app y desplegarla con Terraform y un pipeline), una sesión de troubleshooting en vivo sobre una máquina rota o un escenario conversado ("el sitio está lento, ¿qué mirás primero?").',
        'Detrás del mismo título hay roles distintos. DevOps engineer suele cubrir pipelines, infraestructura como código y despliegues para equipos de producto. SRE (site reliability engineering, la práctica que formalizó Google) pone el foco en la confiabilidad medible: SLOs, error budgets, on-call, postmortems y reducir toil con software. Platform engineering construye una plataforma interna (una internal developer platform con templates, golden paths y self-service) para que los equipos desplieguen sin pedirle nada a nadie. Leé la descripción del puesto para saber cuál pesa más y qué cloud y herramientas usan.',
        'Para junior se evalúa la base: moverte con soltura en la terminal de Linux, entender HTTP, DNS y TCP/IP, escribir un `Dockerfile` razonable, explicar qué hace un pipeline de CI y conocer los servicios básicos de una nube (cómputo, almacenamiento, redes, IAM). Para semi-senior esperan autonomía: diseñar y mantener pipelines, escribir módulos de Terraform, operar Kubernetes en producción, configurar monitoreo con alertas útiles y resolver incidentes sin ayuda. Para senior importa el criterio: diseñar arquitecturas confiables y con costos razonables, definir SLOs con producto, elegir entre opciones con trade-offs claros, liderar incidentes y migraciones, y mejorar la experiencia de los desarrolladores de toda la organización.',
        'Lo que más diferencia a un buen candidato es el método de troubleshooting y la experiencia operativa real. Cuando te planteen un problema, pensá en voz alta: qué hipótesis tenés, qué comando o métrica la confirma o descarta y en qué orden. Y prepará historias de producción: un incidente que resolviste, una migración que hiciste, una automatización que ahorró horas. Decir "no sé, pero lo verificaría así" es mucho mejor que inventar un flag que no existe.',
      ],
      checklist: [
        {
          text: 'Distinguir DevOps, SRE y platform engineering y saber a cuál aplicás',
          explanation:
            'DevOps es antes que nada una cultura (desarrollo y operaciones comparten responsabilidad por el software en producción) y, como rol, alguien que automatiza build, despliegue e infraestructura. SRE es una implementación concreta con ingeniería de software aplicada a operaciones: SLOs, error budgets, límites al trabajo manual (el libro de Google propone que el toil no supere el 50% del tiempo) y on-call sostenible. Platform engineering trata a la infraestructura como un producto interno con usuarios (los desarrolladores), con herramientas como Backstage, templates y APIs de self-service. Si la descripción habla de "on-call", "SLOs" y "confiabilidad", preparate como SRE; si habla de "developer experience" y "golden paths", como platform engineer.',
        },
        {
          text: 'Calibrar las respuestas al nivel junior, semi-senior o senior',
          explanation:
            'Un junior explica bien los conceptos y demuestra práctica: levantó una app en Docker, armó un workflow de GitHub Actions, desplegó algo en una nube. Un semi-senior cuenta qué operó en producción y cómo lo mejoró: por ejemplo, "bajé el tiempo del pipeline de 25 a 8 minutos con caché de dependencias y jobs en paralelo". Un senior habla de decisiones y su impacto: por qué eligió EKS sobre ECS, cómo definió los SLOs, cómo redujo un 30% la factura de cloud, cómo diseñó la estrategia de disaster recovery. Si aplicás a senior y solo describís comandos sin trade-offs ni impacto en el negocio, la respuesta queda corta.',
        },
        {
          text: 'Tener un método de troubleshooting que puedas narrar',
          explanation:
            'Un orden que funciona: primero entender el síntoma y el alcance (¿todos los usuarios o algunos?, ¿desde cuándo?, ¿qué cambió?, porque la mayoría de los incidentes vienen de un deploy o un cambio de configuración); después ir de afuera hacia adentro (DNS, balanceador, servicio, dependencias, base de datos) o usar el método USE para recursos (utilización, saturación, errores) y RED para servicios (rate, errors, duration). Para cada hipótesis, nombrá la evidencia concreta: `dig`, `curl -v`, `kubectl describe pod`, `kubectl logs --previous`, el dashboard de latencia p99. Primero mitigás (rollback, escalar, failover) y después buscás la causa raíz. El error común es saltar a una causa sin evidencia o arreglar en producción antes de estabilizar.',
        },
        {
          text: 'Preparar el take-home como si fuera producción',
          explanation:
            'Si te piden dockerizar y desplegar una app, lo que evalúan es el criterio, no que funcione en tu máquina. Incluí un `README` que explique cómo correrlo y qué decisiones tomaste, un `Dockerfile` multi-stage con usuario no root, infraestructura como código (Terraform) en vez de clics en la consola, un pipeline que haga lint, tests, build y deploy, secretos fuera del repo, health checks y algo de observabilidad. Agregá una sección de "qué haría con más tiempo" (alta disponibilidad, autoscaling, backups, alertas). No entregues credenciales hardcodeadas ni un `terraform.tfstate` commiteado: son de las cosas que más descartan candidatos.',
        },
        {
          text: 'Contar dos o tres historias de producción con contexto, acción e impacto',
          explanation:
            'Prepará un incidente que resolviste (qué falló, cómo lo detectaron, qué hiciste para mitigar, cuál fue la causa raíz y qué cambió después), una mejora de infraestructura (una migración a contenedores, a Kubernetes o a IaC) y una automatización que ahorró trabajo. Estructuralas con contexto, problema, qué hiciste vos, alternativas descartadas y resultado medible: minutos de downtime evitados, tiempo de deploy, costo mensual, cantidad de alertas falsas. En el incidente, dejá claro que el postmortem fue sin culpables. El error común es contar lo que hizo "el equipo" sin que se entienda tu aporte.',
        },
      ],
    },
    {
      id: 'cultura-y-sre',
      title: 'Cultura DevOps, métricas DORA y SRE',
      body: [
        'DevOps nació para romper el muro entre quienes escriben el código y quienes lo operan. Los pilares que se resumen como CALMS son cultura (responsabilidad compartida, "you build it, you run it"), automatización, lean (lotes chicos, flujo continuo), medición y compartir conocimiento. En la entrevista esperan que entiendas que no es un cargo ni una herramienta, sino una forma de trabajar que busca entregar cambios chicos, seguido y con seguridad.',
        'Las métricas DORA son la forma estándar de medir el desempeño de entrega: deployment frequency (cada cuánto se despliega a producción), lead time for changes (cuánto tarda un commit en llegar a producción), change failure rate (qué porcentaje de despliegues causa una falla) y time to restore service (cuánto se tarda en recuperarse de una falla, también llamado failed deployment recovery time en los reportes recientes). La investigación de DORA muestra que velocidad y estabilidad no compiten: los mejores equipos despliegan seguido y fallan poco.',
        'SRE convierte la confiabilidad en algo medible. Un SLI es un indicador (por ejemplo, porcentaje de requests exitosas en menos de 300 ms), un SLO es el objetivo sobre ese indicador en una ventana (99,9% en 30 días) y un SLA es el compromiso contractual con el cliente, con penalidades, que siempre tiene que ser más laxo que el SLO. El error budget es lo que sobra: con 99,9% mensual tenés unos 43 minutos de indisponibilidad para gastar en riesgo, como lanzar features. Si se agota, se prioriza estabilidad.',
        'El resto de la práctica SRE gira alrededor de incidentes y toil. Un incidente tiene roles claros (incident commander, comunicación, operaciones), una línea de tiempo y un postmortem sin culpables que busca causas sistémicas y acciones concretas. Toil es el trabajo manual, repetitivo, automatizable y sin valor duradero (reiniciar servicios a mano, rotar certificados uno por uno), y el objetivo es reducirlo con software. El on-call tiene que ser sostenible: pocas alertas, todas accionables y con runbook.',
      ],
      checklist: [
        {
          text: 'Explicar qué es DevOps sin reducirlo a herramientas',
          explanation:
            'DevOps es una cultura y un conjunto de prácticas para que desarrollo y operaciones compartan objetivos: entregar valor rápido y con estabilidad. Se apoya en automatización (CI/CD, infraestructura como código), lotes chicos (cambios pequeños y frecuentes son más fáciles de revisar y revertir), feedback rápido (tests, monitoreo) y responsabilidad compartida sobre producción. Un ejemplo concreto: en vez de que ops reciba un paquete cada tres meses para instalarlo, el equipo de producto despliega varias veces por día con un pipeline y mira sus propias métricas. El error común es decir "DevOps es Jenkins y Docker" o tratarlo como un equipo separado que recibe tickets, que recrea el mismo muro con otro nombre.',
        },
        {
          text: 'Nombrar y explicar las cuatro métricas DORA',
          explanation:
            'Deployment frequency y lead time for changes miden velocidad; change failure rate y time to restore miden estabilidad. Se obtienen de datos que ya existen: el sistema de CI/CD (cuándo se desplegó cada commit), el control de versiones (cuándo se commiteó) y el sistema de incidentes (qué deploys causaron fallas y cuánto tardó la recuperación). Sirven para ver tendencias de un equipo, no para comparar equipos ni como objetivo individual, porque al convertirlas en meta se distorsionan (ley de Goodhart). Si te preguntan cómo mejorar el lead time, hablá de lotes más chicos, tests más rápidos, menos aprobaciones manuales y trunk-based development.',
        },
        {
          text: 'Definir SLI, SLO, SLA y error budget con números',
          explanation:
            'Ejemplo para una API: SLI de disponibilidad = requests con status distinto de `5xx` sobre el total; SLI de latencia = requests respondidas en menos de 300 ms sobre el total. SLO = 99,9% de disponibilidad en una ventana móvil de 30 días. Error budget = 0,1%, o sea alrededor de 43 minutos al mes, o 1 de cada 1000 requests. SLA = 99,5% con créditos al cliente si no se cumple. Una política de error budget define qué pasa al agotarlo: congelar features y priorizar confiabilidad. Errores comunes: elegir 100% (imposible y paraliza los cambios), medir desde el servidor cuando el usuario ve otra cosa (mejor medir lo más cerca del usuario, por ejemplo en el balanceador) o tener SLOs que nadie usa para decidir.',
        },
        {
          text: 'Contar cómo se maneja un incidente y un postmortem sin culpables',
          explanation:
            'Durante el incidente: se declara con una severidad, alguien asume como incident commander (coordina, no necesariamente arregla), otro comunica a stakeholders y a la status page, y el foco es mitigar (rollback, feature flag, escalar, failover) antes de entender la causa. Se mantiene una línea de tiempo en un canal dedicado. Después, el postmortem documenta impacto, línea de tiempo, causas contribuyentes y acciones con dueño y fecha. Sin culpables significa que se asume que la gente actuó razonablemente con la información que tenía y se buscan fallas del sistema: "el pipeline permitió desplegar sin tests de migración", no "Juan rompió la base". Sin eso, la gente oculta errores y la organización no aprende.',
        },
        {
          text: 'Identificar toil y proponer cómo reducirlo',
          explanation:
            'Según el libro de SRE de Google, toil es trabajo manual, repetitivo, automatizable, táctico (reactivo), sin valor duradero y que crece linealmente con el servicio. Ejemplos: crear usuarios a mano, ampliar discos cuando se llenan, reiniciar un servicio que pierde memoria, aprobar deploys rutinarios. Para reducirlo: medir cuánto tiempo consume, priorizar por frecuencia y dolor, automatizar (un script, un operador de Kubernetes, autoscaling, rotación automática de certificados con cert-manager) o eliminar la causa (arreglar la fuga de memoria). No todo trabajo operativo es toil: investigar un incidente nuevo o diseñar una mejora es ingeniería.',
        },
      ],
    },
    {
      id: 'linux-y-redes',
      title: 'Linux y redes',
      body: [
        'Casi todo lo que vas a operar corre sobre Linux, así que la terminal es tu herramienta principal. Tenés que manejar sin pensar la navegación y los archivos (`ls`, `find`, `grep`, `less`, `tail -f`), permisos y usuarios (`chmod`, `chown`, `sudo`), procesos (`ps`, `top` o `htop`, `kill`, señales como `SIGTERM` y `SIGKILL`), servicios con systemd (`systemctl status`, `journalctl -u`), discos (`df -h`, `du -sh`) y paquetes. También pipes y redirecciones para encadenar comandos, y scripting en Bash para automatizar.',
        'Los conceptos que más se preguntan son el proceso de booteo, qué es un proceso y un hilo, file descriptors y el límite de archivos abiertos, inodes (un disco puede "llenarse" sin estar lleno de bytes), la diferencia entre memoria usada y cache, el load average, procesos zombie y el OOM killer. Para contenedores importan namespaces (aíslan lo que un proceso ve: PIDs, red, mounts) y cgroups (limitan lo que consume: CPU, memoria).',
        'En redes, la base es el modelo TCP/IP: IP para direccionar, TCP (orientado a conexión, confiable, con handshake de tres pasos) y UDP (sin conexión, más liviano), puertos, subredes con notación CIDR (`10.0.0.0/16`), NAT, y la diferencia entre IPs privadas y públicas. Arriba están DNS (cómo se resuelve un nombre, tipos de registro A, AAAA, CNAME, MX, TXT y el TTL), HTTP (métodos, códigos de estado, headers) y TLS (certificados y handshake).',
        'Para troubleshooting de red usá `ping` y `traceroute` (conectividad y ruta), `dig` o `nslookup` (DNS), `curl -v` (la request HTTP completa, con TLS y headers), `ss -tulpn` (qué está escuchando en qué puerto) y `tcpdump` para ver paquetes. La pregunta clásica "¿qué pasa cuando escribís una URL en el navegador?" es la excusa perfecta para mostrar todo esto en orden.',
      ],
      checklist: [
        {
          text: 'Responder qué pasa cuando escribís una URL en el navegador',
          explanation:
            'El navegador busca el dominio en su caché y en la del sistema; si no está, el resolver consulta DNS (servidores raíz, luego el TLD `.com`, luego el autoritativo del dominio) y obtiene una IP, cacheada según el TTL. Abre una conexión TCP con handshake SYN, SYN-ACK, ACK al puerto 443, y negocia TLS: el servidor presenta su certificado, el cliente lo valida contra las CAs en las que confía y acuerdan claves de sesión (con TLS 1.3 en un solo round trip). Con HTTP/3 todo esto va sobre QUIC, que usa UDP. Después envía la request HTTP, que en una arquitectura real pasa por un CDN, un balanceador, un reverse proxy y la aplicación, que puede consultar caché y base de datos. Finalmente el navegador renderiza y pide los recursos que faltan. Ir capa por capa y mencionar dónde podría fallar cada una es lo que impresiona.',
        },
        {
          text: 'Diagnosticar un servidor lento o un disco lleno desde la terminal',
          explanation:
            'Para lentitud: `uptime` o `top` para ver el load average comparado con la cantidad de CPUs, `top` o `htop` para encontrar el proceso que consume, `free -h` para memoria (recordá que la columna `available` importa más que `free`, porque Linux usa la memoria libre como cache), `vmstat 1` para ver si hay swap o espera de I/O (`wa`) e `iostat -x 1` para el disco. Para disco lleno: `df -h` para ver qué filesystem, `du -sh /* | sort -h` para encontrar qué directorio, y `df -i` si está lleno de inodes (muchos archivos chicos). Un caso trampa: borraste un log enorme pero el espacio no se liberó porque un proceso lo tiene abierto; `lsof +L1` lo muestra y se resuelve reiniciando el proceso o truncando el archivo con `> archivo.log` en vez de borrarlo.',
        },
        {
          text: 'Explicar procesos, señales, systemd y el OOM killer',
          explanation:
            'Un proceso es un programa en ejecución con su PID, memoria y file descriptors. `SIGTERM` (15) le pide terminar de forma ordenada y el proceso puede atraparla para cerrar conexiones; `SIGKILL` (9) lo mata sin chance de limpiar, así que se usa como último recurso. Un zombie es un proceso que terminó pero cuyo padre no leyó su estado de salida; no consume recursos más allá de su entrada en la tabla. systemd administra servicios: `systemctl status nginx`, `systemctl restart nginx`, `journalctl -u nginx --since "10 min ago"`. Cuando el sistema se queda sin memoria, el OOM killer del kernel elige un proceso y lo mata; lo ves con `dmesg` o `journalctl -k`. En Kubernetes, el mismo mecanismo aparece como un pod en estado `OOMKilled` por superar su límite de memoria.',
        },
        {
          text: 'Calcular subredes CIDR y diferenciar TCP de UDP',
          explanation:
            'En CIDR, el número después de la barra son los bits de red: `/24` deja 8 bits de host, o sea 256 direcciones; `/16` deja 65.536. En la nube se reservan algunas por subred (AWS reserva 5), así que una `/24` da 251 IPs usables. Diseñar una VPC es repartir un rango como `10.0.0.0/16` en subredes públicas y privadas por zona de disponibilidad sin solaparse con otras redes que vayas a conectar (VPN, peering). TCP garantiza entrega en orden con retransmisiones y control de congestión; lo usan HTTP/1.1, HTTP/2, SSH y las bases de datos. UDP no garantiza nada pero es más liviano; lo usan DNS, streaming, juegos y QUIC, que reimplementa la confiabilidad encima. El error común es superponer rangos de VPCs y descubrirlo recién al querer conectarlas.',
        },
        {
          text: 'Usar `dig`, `curl -v` y `ss` para encontrar un problema de red',
          explanation:
            '`dig api.ejemplo.com` muestra a qué IP resuelve y con qué TTL; `dig +trace` recorre la cadena desde los servidores raíz, útil cuando un cambio de DNS "no se propaga" (en realidad, cachés con TTL alto). `curl -v https://api.ejemplo.com/health` muestra la resolución, la conexión, el handshake TLS (con errores como certificado vencido o nombre que no coincide), los headers y el código de respuesta; con `-w "%{time_connect} %{time_starttransfer}\\n"` medís dónde se va el tiempo. `ss -tulpn` muestra qué proceso escucha en qué puerto e interfaz: si la app escucha en `127.0.0.1` en vez de `0.0.0.0`, no va a ser accesible desde afuera, un error típico en contenedores. Si la conexión no llega, sospechá de firewalls o security groups.',
        },
      ],
    },
    {
      id: 'docker',
      title: 'Docker y contenedores',
      body: [
        'Un contenedor es un proceso de Linux aislado con namespaces y limitado con cgroups, que comparte el kernel del host. Por eso arranca en milisegundos y pesa mucho menos que una máquina virtual, que virtualiza hardware y corre su propio kernel. Una imagen es un paquete inmutable de capas de solo lectura con el filesystem y la configuración; un contenedor es una instancia en ejecución de una imagen con una capa escribible encima que se pierde al borrarlo.',
        'El `Dockerfile` describe cómo construir la imagen, y cada instrucción genera una capa cacheada. El orden importa: copiá primero los archivos de dependencias (`package.json` y el lockfile), instalalas, y recién después copiá el código, así un cambio de código no invalida la capa de dependencias. Los builds multi-stage separan la etapa de compilación (con compiladores y herramientas) de la imagen final, que solo lleva lo necesario para correr. Las imágenes base chicas (`alpine`, `slim`, distroless) reducen tamaño y superficie de ataque.',
        'Los datos persistentes van en volúmenes, no dentro del contenedor. Las redes de Docker permiten que los contenedores se hablen por nombre (en una red definida por el usuario hay DNS interno). Docker Compose define una aplicación multi-contenedor (app, base de datos, cache) en un archivo `compose.yaml` y es ideal para desarrollo local y entornos simples; para producción con varios nodos se usa un orquestador como Kubernetes o un servicio administrado como ECS o Cloud Run.',
        'En la entrevista te van a pedir que critiques o escribas un `Dockerfile`. Los puntos que evalúan son caché de capas, multi-stage, usuario no root, no meter secretos en la imagen, `.dockerignore`, tags inmutables en vez de `latest`, un solo proceso por contenedor y manejo correcto de señales para apagarse limpio. Saber que Docker no es el único runtime (containerd, Podman, BuildKit) y que las imágenes siguen el estándar OCI suma.',
      ],
      checklist: [
        {
          text: 'Diferenciar contenedor, imagen y máquina virtual',
          explanation:
            'La máquina virtual corre un sistema operativo completo con su kernel sobre un hipervisor, con aislamiento fuerte pero más peso y arranque lento. El contenedor es un proceso del host aislado con namespaces (PID, red, mount, usuario) y limitado con cgroups (CPU, memoria), compartiendo el kernel: arranca rápido y es liviano, pero el aislamiento es más débil, por eso no se corre como root ni en modo `--privileged` sin necesidad. La imagen es la plantilla inmutable en capas; el contenedor es la instancia. Analogía útil: imagen es a contenedor lo que una clase es a un objeto. Matiz para sumar puntos: en Mac y Windows, Docker Desktop corre una VM Linux liviana por debajo, porque los contenedores Linux necesitan un kernel Linux.',
        },
        {
          text: 'Escribir un `Dockerfile` multi-stage optimizado y seguro',
          explanation:
            'Ejemplo para Node: una etapa `FROM node:22-slim AS build` con `WORKDIR /app`, `COPY package.json pnpm-lock.yaml ./`, instalación de dependencias, `COPY . .` y el build; y una etapa final `FROM node:22-slim` que copia solo `dist` y las dependencias de producción con `COPY --from=build`, define `USER node`, `EXPOSE 3000` y `CMD ["node", "dist/server.js"]`. Usá la forma exec (array) en `CMD` para que el proceso reciba `SIGTERM` directamente. Sumá un `.dockerignore` que excluya `node_modules`, `.git` y archivos `.env`. Errores comunes: `COPY . .` antes de instalar dependencias (rompe la caché en cada cambio), correr como root, usar `latest` como base y pasar secretos con `ARG` o `ENV`, que quedan en el historial de la imagen; para secretos de build existe `RUN --mount=type=secret`.',
        },
        {
          text: 'Explicar volúmenes, redes y Docker Compose',
          explanation:
            'Un volumen nombrado (`docker volume create datos`) lo administra Docker y sobrevive al contenedor; un bind mount (`-v ./src:/app/src`) monta una carpeta del host, útil en desarrollo para hot reload. En una red definida por el usuario, los contenedores se resuelven por nombre: la app se conecta a `postgres:5432` en vez de una IP. Compose declara servicios, volúmenes y redes en `compose.yaml`, y se levanta con `docker compose up -d`. Detalle que suelen preguntar: `depends_on` solo ordena el arranque, no espera a que la base esté lista; para eso se usa `depends_on` con `condition: service_healthy` y un `healthcheck`. Mapear un puerto con `ports: "5432:5432"` lo expone en el host; si solo lo usa otro contenedor, no hace falta.',
        },
        {
          text: 'Debuggear un contenedor que se reinicia o no responde',
          explanation:
            'Empezá por `docker ps -a` para ver el estado y el código de salida: `137` es `SIGKILL`, muchas veces por memoria (OOM), y `1` suele ser un error de la aplicación. Después `docker logs --tail 100 <contenedor>` para ver qué dijo antes de morir, `docker inspect` para revisar variables, mounts, health check y `OOMKilled`, y `docker exec -it <contenedor> sh` para entrar y probar desde adentro (si la imagen es distroless no hay shell, y ahí sirve `docker debug` o un contenedor auxiliar en la misma red). `docker stats` muestra consumo en vivo. Causas frecuentes: la app escucha en `localhost` en vez de `0.0.0.0`, falta una variable de entorno, el proceso termina porque `CMD` lanza algo en background, o el health check apunta a un puerto equivocado.',
        },
        {
          text: 'Reducir el tamaño y la superficie de ataque de una imagen',
          explanation:
            'Usá multi-stage para dejar fuera compiladores y dependencias de desarrollo, una base mínima (`-slim`, `alpine` sabiendo que usa musl y puede romper binarios nativos, o distroless de Google o Chainguard que ni siquiera tienen shell), y combiná comandos de instalación en un solo `RUN` limpiando la caché del gestor de paquetes. Escaneá la imagen con Trivy, Grype o Docker Scout para encontrar CVEs, firmala con cosign y fijá la base por digest (`@sha256:...`) para builds reproducibles. Herramientas como `dive` muestran qué capa pesa cuánto. Una imagen de Node puede pasar de 1 GB a menos de 200 MB con estos pasos, lo que acelera los deploys y reduce vulnerabilidades.',
        },
      ],
    },
    {
      id: 'kubernetes',
      title: 'Kubernetes',
      body: [
        'Kubernetes es un orquestador de contenedores: le declarás el estado deseado (quiero 3 réplicas de esta imagen, expuestas en este puerto) y sus controladores trabajan en un loop de reconciliación para que el estado real coincida. El control plane tiene el API server (la única puerta de entrada), etcd (la base de datos clave-valor con todo el estado), el scheduler (decide en qué nodo va cada pod) y el controller manager. En cada nodo corren el kubelet (levanta los pods), un container runtime como containerd y kube-proxy o el plugin de red.',
        'Los objetos básicos son el Pod (uno o más contenedores que comparten red y volúmenes, la unidad mínima), el Deployment (administra réplicas y rolling updates a través de ReplicaSets), el Service (una IP y un nombre DNS estables delante de pods efímeros, de tipo ClusterIP, NodePort o LoadBalancer), el Ingress o la más nueva Gateway API (ruteo HTTP desde afuera), ConfigMap y Secret (configuración), StatefulSet (para cargas con identidad y almacenamiento estable, como bases de datos), DaemonSet (un pod por nodo, para agentes de logs o monitoreo) y Job o CronJob.',
        'Para operar bien importan los requests y limits de recursos (el scheduler usa los requests para ubicar pods; superar el límite de memoria provoca `OOMKilled`, superar el de CPU provoca throttling), las probes (liveness reinicia el contenedor, readiness lo saca del Service, startup protege arranques lentos), el autoscaling (HPA para pods según métricas, Cluster Autoscaler o Karpenter para nodos), namespaces, RBAC y NetworkPolicies.',
        'En las entrevistas casi siempre aparece un escenario de troubleshooting: un pod en `CrashLoopBackOff`, `ImagePullBackOff`, `Pending` o un Service que no responde. También te pueden preguntar cómo empaquetar y desplegar aplicaciones (Helm, Kustomize, GitOps con Argo CD o Flux) y si conviene usar un servicio administrado (EKS, AKS, GKE) en vez de operar el control plane. Para muchos equipos chicos, la respuesta honesta es que Kubernetes es demasiado y alcanza con algo como Cloud Run, ECS o Vercel.',
      ],
      checklist: [
        {
          text: 'Explicar la arquitectura de Kubernetes y el loop de reconciliación',
          explanation:
            'Cuando aplicás un manifiesto con `kubectl apply -f deployment.yaml`, el API server lo valida, pasa por los admission controllers y lo guarda en etcd. El controlador de Deployments ve el objeto nuevo y crea un ReplicaSet, cuyo controlador crea los Pods. El scheduler asigna cada pod a un nodo según requests de recursos, afinidades, taints y tolerations. El kubelet de ese nodo ve el pod asignado, le pide al runtime que descargue la imagen y arranque los contenedores, y reporta el estado. Si un pod muere, el controlador del ReplicaSet nota que hay menos réplicas de las deseadas y crea otro. Esa idea de estado deseado más reconciliación continua es el concepto central; los operators extienden el mismo patrón con recursos propios (CRDs).',
        },
        {
          text: 'Diagnosticar `CrashLoopBackOff`, `ImagePullBackOff` y `Pending`',
          explanation:
            'El flujo es `kubectl get pods`, luego `kubectl describe pod <pod>` (mirá la sección Events al final) y `kubectl logs <pod> --previous` para ver los logs del contenedor que murió. `CrashLoopBackOff` significa que el contenedor arranca y termina una y otra vez: error de la app, configuración o variable faltante, una liveness probe mal configurada que lo mata, o `OOMKilled` (lo ves en `Last State`). `ImagePullBackOff` es que no puede descargar la imagen: nombre o tag equivocado, registry privado sin `imagePullSecrets` o sin permisos. `Pending` es que el scheduler no encuentra nodo: requests más grandes que los recursos libres, taints sin tolerations, node selectors que no matchean o un PersistentVolumeClaim sin volumen. `kubectl get events --sort-by=.lastTimestamp` da una vista general del namespace.',
        },
        {
          text: 'Configurar requests, limits y probes correctamente',
          explanation:
            'Los requests son lo que el pod tiene garantizado y lo que usa el scheduler; los limits son el máximo. Memoria es un recurso no comprimible: superar el límite mata el contenedor. CPU es comprimible: superar el límite produce throttling y latencia, por eso muchos equipos ponen request de CPU pero no limit. Para la clase de QoS Guaranteed, requests y limits tienen que ser iguales. Readiness probe controla si el pod recibe tráfico (por ejemplo `GET /ready` que verifica dependencias); liveness reinicia el contenedor si está colgado y tiene que ser simple (`GET /healthz` que no consulte la base, para no reiniciar todo cuando la base cae); startup probe da tiempo a aplicaciones que tardan en arrancar. El error clásico es una liveness agresiva que reinicia pods sanos bajo carga.',
        },
        {
          text: 'Explicar cómo se expone una app: Service, Ingress y Gateway API',
          explanation:
            'Los pods tienen IPs efímeras, así que un Service de tipo ClusterIP les da una IP virtual y un nombre DNS estable (`mi-api.mi-namespace.svc.cluster.local`) y balancea entre los pods que matchean su selector de labels; si el selector no matchea, el Service no tiene endpoints, que se verifica con `kubectl get endpointslices`. NodePort abre un puerto en cada nodo y LoadBalancer pide un balanceador al proveedor de nube. Para HTTP, un Ingress con un Ingress Controller (NGINX, Traefik, el del proveedor) rutea por host y path y termina TLS, normalmente con certificados de cert-manager. La Gateway API es su sucesora, más expresiva y con roles separados entre quien administra el gateway y quien define rutas. Tené en cuenta que el proyecto ingress-nginx de la comunidad fue retirado, así que en 2026 conviene conocer Gateway API.',
        },
        {
          text: 'Desplegar y actualizar sin downtime, con Helm o GitOps',
          explanation:
            'Un Deployment hace rolling update controlado por `maxSurge` y `maxUnavailable`; para que no haya cortes, los pods nuevos necesitan una readiness probe correcta y la app tiene que manejar `SIGTERM` terminando las requests en curso (con un `preStop` corto si el balanceador tarda en sacarlo). `kubectl rollout status` y `kubectl rollout undo` permiten seguir y revertir. Un PodDisruptionBudget evita que un mantenimiento de nodos baje demasiadas réplicas juntas. Helm empaqueta manifiestos con templates y valores por entorno; Kustomize aplica overlays sin templates. Con GitOps (Argo CD o Flux), el estado deseado vive en un repo y un controlador dentro del cluster lo sincroniza y corrige el drift, así cada cambio queda auditado en Git.',
        },
      ],
    },
    {
      id: 'terraform',
      title: 'Infraestructura como código y Terraform',
      body: [
        'Infraestructura como código (IaC) es describir servidores, redes, bases de datos y permisos en archivos versionados en vez de crearlos con clics en una consola. Eso da reproducibilidad (el mismo código crea staging y producción iguales), revisión por pull request, historial de cambios y la posibilidad de recrear todo ante un desastre. Hay herramientas declarativas (describís el estado final: Terraform, OpenTofu, CloudFormation, Bicep) e imperativas o con lenguajes de programación (Pulumi, AWS CDK).',
        'Terraform, de HashiCorp, es la herramienta más pedida. Usa HCL, un lenguaje declarativo, y providers para hablar con cada API (AWS, Azure, Google Cloud, Cloudflare, Kubernetes, GitHub). El flujo es `terraform init` (descarga providers y configura el backend), `terraform plan` (compara el código con el estado y muestra qué va a crear, cambiar o destruir) y `terraform apply`. Desde 2023 Terraform usa la licencia BSL, y la comunidad creó OpenTofu, un fork abierto bajo la Linux Foundation que es compatible en la práctica; conviene saber que existe y por qué.',
        'El state es el archivo donde Terraform guarda el mapeo entre tu código y los recursos reales. En equipo tiene que vivir en un backend remoto (S3, Azure Storage, Google Cloud Storage o HCP Terraform) con locking para que dos personas no apliquen a la vez, y nunca se commitea porque puede contener secretos. El drift es cuando alguien cambia algo a mano y el estado real se aparta del código; `plan` lo detecta.',
        'Para escalar se usan módulos (componentes reutilizables con variables y outputs), estados separados por entorno y por dominio para reducir el radio de impacto, versiones fijadas de providers y módulos, y un pipeline que corre `plan` en cada pull request y `apply` al mergear. Herramientas como tflint, Checkov o Trivy validan buenas prácticas y seguridad antes de aplicar.',
      ],
      checklist: [
        {
          text: 'Explicar por qué usar IaC y qué es declarativo',
          explanation:
            'Sin IaC, la infraestructura vive en la memoria de quien la configuró: nadie sabe por qué un security group tiene cierta regla, staging y producción difieren y reconstruir después de un desastre es adivinar. Con IaC el código es la documentación, los cambios pasan por code review con un plan visible, se pueden reproducir entornos y revertir. Declarativo significa que describís el qué ("quiero un bucket con versionado") y la herramienta calcula el cómo (crear, modificar o no hacer nada), por eso aplicar dos veces el mismo código no cambia nada (idempotencia). Comparalo con un script de Bash que crea un bucket: si lo corrés dos veces, falla o duplica.',
        },
        {
          text: 'Manejar el state: backend remoto, locking, drift e import',
          explanation:
            'Configurá un backend remoto, por ejemplo `backend "s3"` con un bucket versionado y cifrado; en versiones recientes de Terraform el locking se hace con `use_lockfile = true` en el mismo bucket, en vez de la tabla de DynamoDB que se usaba antes. Restringí el acceso al state porque puede tener contraseñas en texto plano. Para traer recursos creados a mano existe el bloque `import` (o `terraform import`), y para refactorizar sin destruir, el bloque `moved` o `terraform state mv`. Si `plan` muestra cambios que nadie hizo en el código, es drift: decidí si lo incorporás al código o dejás que `apply` lo revierta. Errores graves: commitear `terraform.tfstate`, editarlo a mano o borrar un lock sin saber si hay un apply corriendo.',
        },
        {
          text: 'Escribir módulos reutilizables y organizar entornos',
          explanation:
            'Un módulo es una carpeta con `variables.tf` (entradas con tipos, defaults y `validation`), `main.tf` (recursos) y `outputs.tf` (lo que expone, como el id de la VPC). Se consume con un bloque `module "vpc" { source = "./modules/vpc"; cidr = "10.0.0.0/16" }`, fijando versión si viene de un registry. Para entornos, lo más común es una carpeta por entorno (`envs/staging`, `envs/prod`) que llama a los mismos módulos con distintas variables y tiene su propio state; los workspaces sirven para variantes muy parecidas pero mezclan entornos en un mismo backend. Usá `for_each` en vez de `count` para colecciones, porque con `count` quitar un elemento del medio recrea los siguientes. Separar states por dominio (red, datos, apps) limita lo que un error puede romper.',
        },
        {
          text: 'Leer un `terraform plan` antes de aplicar',
          explanation:
            'El plan marca con `+` lo que se crea, `~` lo que se modifica en el lugar, `-` lo que se destruye y `-/+` lo que se reemplaza (destruir y crear), que es lo peligroso: cambiar el nombre de una base de datos o la zona de un disco puede recrearlo y perder datos. Antes de aprobar, buscá destrucciones inesperadas y preguntá por qué. Protecciones útiles: `lifecycle { prevent_destroy = true }` en recursos críticos, `create_before_destroy` para reemplazos sin corte y deletion protection en la nube. En CI, guardá el plan con `terraform plan -out=plan.tfplan` y aplicá exactamente ese archivo, para que no se aplique algo distinto de lo revisado.',
        },
        {
          text: 'Comparar Terraform, OpenTofu, Pulumi y las herramientas nativas',
          explanation:
            'Terraform es el estándar multi-nube con el ecosistema de providers más grande, bajo licencia BSL desde 2023. OpenTofu es el fork abierto con la misma sintaxis y suma funciones propias como el cifrado del state. Pulumi usa lenguajes de programación (TypeScript, Python, Go), útil si el equipo quiere loops, tests y abstracciones de un lenguaje general. CloudFormation y CDK (AWS), Bicep (Azure) y Infrastructure Manager (Google Cloud) son nativas: se integran mejor con su nube pero te atan a ella. Una buena respuesta elige según el contexto: multi-nube o mucha experiencia previa en HCL, Terraform u OpenTofu; un equipo de desarrollo 100% en AWS que prefiere TypeScript, CDK o Pulumi.',
        },
      ],
    },
    {
      id: 'ci-cd',
      title: 'CI/CD, GitHub Actions y estrategias de despliegue',
      body: [
        'Integración continua (CI) es integrar cambios a la rama principal seguido, con un pipeline automático que compila, corre linters y tests y avisa rápido si algo se rompió. Entrega continua (continuous delivery) es que cada cambio que pasa el pipeline quede listo para desplegar con un botón; despliegue continuo (continuous deployment) es que se despliegue a producción automáticamente. Un buen pipeline es rápido, confiable (sin tests flaky), reproducible y construye el artefacto una sola vez para promoverlo por los entornos.',
        'GitHub Actions es la plataforma de CI/CD más usada hoy. Un workflow es un archivo YAML en `.github/workflows/` que se dispara con eventos (`push`, `pull_request`, `workflow_dispatch`, `schedule`), tiene jobs que corren en runners (hospedados por GitHub o self-hosted) y cada job tiene steps que ejecutan comandos o actions reutilizables. Se combinan con matrices, caché de dependencias, artefactos, environments con aprobaciones y secretos, y workflows reutilizables. Otras herramientas comunes son GitLab CI, Jenkins, CircleCI, Azure Pipelines y Cloud Build.',
        'Las estrategias de despliegue determinan cuánto riesgo tomás en cada cambio. Recreate baja todo y sube lo nuevo (con downtime). Rolling reemplaza instancias de a poco. Blue-green mantiene dos entornos y cambia el tráfico de golpe, con rollback inmediato. Canary manda un porcentaje chico del tráfico a la versión nueva, mira métricas y avanza o revierte. Los feature flags separan el despliegue del lanzamiento: el código llega a producción apagado y se activa para un grupo de usuarios.',
        'GitOps lleva estas ideas al extremo: Git es la fuente de verdad del estado deseado y un agente (Argo CD, Flux) lo sincroniza, con auditoría y rollback como un `git revert`. Las migraciones de base de datos merecen cuidado aparte: tienen que ser compatibles hacia atrás (patrón expand and contract) porque durante un rolling conviven la versión vieja y la nueva.',
      ],
      checklist: [
        {
          text: 'Diferenciar continuous integration, delivery y deployment',
          explanation:
            'CI: cada push o pull request dispara build, lint y tests automáticos, y se integra a `main` al menos a diario; el objetivo es detectar problemas en minutos, no al final del sprint. Continuous delivery: el pipeline produce un artefacto listo para producción (por ejemplo una imagen con tag del commit) y desplegarlo es una decisión de negocio con un clic. Continuous deployment: no hay paso manual, todo lo que pasa el pipeline va a producción. Lo segundo requiere muy buena cobertura de tests, monitoreo y rollback automático. Un principio clave en las tres: construir una vez y promover el mismo artefacto de staging a producción, en vez de recompilar por entorno, que puede producir binarios distintos.',
        },
        {
          text: 'Escribir un workflow de GitHub Actions con caché, matriz y deploy',
          explanation:
            "Un workflow típico: `on: pull_request` y `push` a `main`; un job `test` con `runs-on: ubuntu-latest`, `actions/checkout`, `actions/setup-node` con `cache: pnpm`, instalación, lint y tests, opcionalmente con `strategy.matrix` para varias versiones; y un job `deploy` con `needs: test`, `if: github.ref == 'refs/heads/main'` y `environment: production`, que puede exigir aprobación manual. Usá `concurrency` para cancelar ejecuciones viejas de la misma rama y `permissions` mínimos (por defecto `contents: read`). Para autenticarte en la nube, `permissions: id-token: write` y OIDC en vez de claves guardadas. Errores comunes: secretos impresos en logs, fijar actions de terceros por tag mutable en vez de por SHA del commit y usar `pull_request_target` con código del fork, que le da secretos a código no confiable.",
        },
        {
          text: 'Elegir entre rolling, blue-green, canary y feature flags',
          explanation:
            'Rolling es el default de Kubernetes: barato, sin infraestructura extra, pero el rollback tarda y conviven versiones. Blue-green duplica el entorno: el cambio y el rollback son instantáneos (mover el balanceador), cuesta el doble mientras dura y la base de datos compartida sigue siendo el punto delicado. Canary expone a pocos usuarios primero (1%, 10%, 50%, 100%) y decide con métricas como tasa de errores y latencia; herramientas como Argo Rollouts o Flagger lo automatizan con análisis. Feature flags permiten lanzar a un segmento y apagar una feature sin redeployar, a costa de deuda si no se limpian. Para un cambio riesgoso en un checkout, una buena respuesta combina canary con un flag para apagarlo al instante.',
        },
        {
          text: 'Hacer migraciones de base de datos sin downtime',
          explanation:
            'Durante un despliegue gradual, la versión vieja y la nueva usan la misma base, así que cada migración tiene que funcionar con ambas. El patrón expand and contract lo resuelve en pasos: para renombrar una columna, primero agregás la nueva (expand), desplegás código que escribe en las dos y lee de la nueva, migrás los datos existentes en lotes, y en un deploy posterior borrás la vieja (contract). Evitá operaciones que bloquean tablas grandes, como agregar un índice sin `CONCURRENTLY` en Postgres. Corré las migraciones como un paso del pipeline o un Job antes del rollout, nunca al arrancar cada réplica, porque varias réplicas intentarían migrar a la vez. Y tené claro que un rollback de código no deshace una migración.',
        },
        {
          text: 'Explicar GitOps y cuándo conviene',
          explanation:
            'En GitOps el repo describe el estado deseado del cluster (manifiestos, charts de Helm, overlays de Kustomize) y un agente dentro del cluster, como Argo CD o Flux, hace pull y aplica los cambios, además de detectar y revertir cambios manuales (drift). El pipeline de CI ya no necesita credenciales del cluster: solo construye la imagen y actualiza el tag en el repo de configuración, muchas veces automáticamente con un pull request. Ventajas: auditoría completa en Git, rollback con `git revert`, y el mismo flujo de revisión para infraestructura y código. Cuesta más setup y separa los repos de app y configuración; para un equipo chico con una sola app puede alcanzar un deploy directo desde el pipeline.',
        },
      ],
    },
    {
      id: 'aws',
      title: 'AWS',
      body: [
        'AWS es la nube con más cuota de mercado y la que más aparece en búsquedas laborales. Su infraestructura global se organiza en regiones (por ejemplo `us-east-1` o `sa-east-1` en São Paulo), cada una con varias zonas de disponibilidad (AZs), que son datacenters independientes. Diseñar para alta disponibilidad significa repartir recursos en al menos dos AZs; diseñar para disaster recovery puede implicar otra región.',
        'Los servicios que tenés que conocer: IAM (usuarios, roles y políticas, el corazón de la seguridad), VPC (subredes públicas y privadas, route tables, internet gateway, NAT gateway, security groups y NACLs), EC2 (máquinas virtuales, con Auto Scaling Groups), ELB (Application Load Balancer para HTTP y Network Load Balancer para TCP), S3 (almacenamiento de objetos), RDS y Aurora (bases relacionales administradas), DynamoDB (NoSQL), Lambda (funciones serverless), ECS, Fargate y EKS (contenedores), ECR (registry), CloudFront (CDN), Route 53 (DNS), CloudWatch y CloudTrail (monitoreo y auditoría), SQS y SNS (colas y notificaciones) y Secrets Manager.',
        'IAM se evalúa siempre. Las políticas son documentos JSON con `Effect`, `Action`, `Resource` y `Condition`; por defecto todo está denegado y un `Deny` explícito gana siempre. La práctica correcta es usar roles con credenciales temporales (un rol para la instancia, para el Lambda, para el pod con EKS Pod Identity o IRSA, y para GitHub Actions con OIDC) en vez de access keys de larga duración, y el acceso humano centralizado con IAM Identity Center. En organizaciones grandes se usa AWS Organizations con varias cuentas y SCPs como guardrails.',
        'El Well-Architected Framework resume cómo diseñar bien en AWS con seis pilares: excelencia operativa, seguridad, confiabilidad, eficiencia de rendimiento, optimización de costos y sustentabilidad. Una pregunta de diseño típica es armar una aplicación web de tres capas: CloudFront y un ALB en subredes públicas, la aplicación en ECS Fargate o EC2 en subredes privadas en varias AZs, RDS Multi-AZ, y todo definido con Terraform o CDK.',
      ],
      checklist: [
        {
          text: 'Diseñar una VPC con subredes públicas y privadas',
          explanation:
            'Partís de un rango como `10.0.0.0/16` y creás, en al menos dos AZs, subredes públicas (su route table manda `0.0.0.0/0` a un internet gateway) y privadas (salen a internet a través de un NAT gateway ubicado en una subred pública, pero nadie puede entrar desde afuera). En las públicas van el balanceador y, si hace falta, un bastion (aunque hoy se prefiere Systems Manager Session Manager, que no requiere abrir SSH). En las privadas van la aplicación y la base de datos. Los security groups son stateful y se aplican a la instancia (permitís el puerto 5432 de la base solo desde el security group de la app); las NACLs son stateless y se aplican a la subred. Ojo con el costo: el NAT gateway cobra por hora y por GB procesado, y para tráfico a S3 o DynamoDB conviene un VPC endpoint.',
        },
        {
          text: 'Escribir y razonar políticas de IAM con least privilege',
          explanation:
            'Una política mínima para que una app lea un bucket: `"Effect": "Allow"`, `"Action": ["s3:GetObject"]`, `"Resource": "arn:aws:s3:::mi-bucket/*"`. Diferenciá políticas basadas en identidad (adjuntas a un rol o usuario) de las basadas en recursos (como una bucket policy), y recordá que el acceso entre cuentas necesita permiso de ambos lados. La evaluación es: deny por defecto, cualquier `Deny` explícito gana, después se necesita un `Allow`, y encima aplican SCPs y permission boundaries. Para credenciales, usá roles asumidos con STS, que dan credenciales temporales. Errores típicos: `"Action": "*"` por comodidad, access keys en el código o en variables de CI, y buckets públicos por una bucket policy mal escrita (S3 Block Public Access debería estar activado por defecto).',
        },
        {
          text: 'Elegir entre EC2, ECS, Fargate, EKS y Lambda',
          explanation:
            'EC2 da control total del sistema operativo, a cambio de parchear y escalar vos. ECS es el orquestador propio de AWS, más simple que Kubernetes; con Fargate no administrás servidores, pagás por la CPU y memoria de cada tarea. EKS es Kubernetes administrado: conviene si ya usás el ecosistema de Kubernetes o querés portabilidad, pero tiene más complejidad operativa (con EKS Auto Mode AWS administra también los nodos). Lambda ejecuta funciones por evento con escalado a cero y cobro por invocación y duración, ideal para cargas esporádicas o event-driven, con límites como 15 minutos de ejecución y cold starts. Una buena respuesta elige según el equipo y la carga: un equipo chico con una API HTTP probablemente esté mejor en ECS Fargate o App Runner que en EKS.',
        },
        {
          text: 'Explicar S3, RDS y cómo lograr alta disponibilidad y backups',
          explanation:
            'S3 guarda objetos con durabilidad de once nueves; se configura con versionado (protege contra borrados accidentales), cifrado (activado por defecto), lifecycle rules para mover datos viejos a clases más baratas como Glacier, y Block Public Access. Para servir archivos públicos, CloudFront con Origin Access Control en vez de abrir el bucket. RDS Multi-AZ mantiene una réplica sincrónica en otra AZ con failover automático (para disponibilidad), mientras que las read replicas son asincrónicas y sirven para escalar lecturas. Los backups automáticos con point-in-time recovery y los snapshots cubren errores humanos. Definí RPO (cuántos datos podés perder) y RTO (cuánto podés tardar en volver) y elegí la estrategia según eso: backup and restore, pilot light, warm standby o activo-activo multi-región.',
        },
        {
          text: 'Usar CloudWatch y CloudTrail para operar y auditar',
          explanation:
            'CloudWatch junta métricas de los servicios (CPU de EC2, latencia y errores `5xx` del ALB, conexiones de RDS), logs (CloudWatch Logs con Logs Insights para consultarlos), alarmas que disparan notificaciones por SNS o acciones de autoscaling, y dashboards. CloudTrail registra cada llamada a la API de AWS: quién hizo qué, cuándo y desde dónde, clave para investigar un cambio inesperado o un incidente de seguridad; conviene un trail de organización que guarde los logs en una cuenta separada. AWS Config registra cómo cambia la configuración de los recursos y evalúa reglas de compliance, y GuardDuty detecta amenazas. En la entrevista, si preguntan "alguien borró un recurso", la respuesta es CloudTrail.',
        },
      ],
    },
    {
      id: 'azure',
      title: 'Azure',
      body: [
        'Azure es la segunda nube más grande y domina en empresas que ya usan Microsoft (Windows Server, Active Directory, .NET, Microsoft 365). Su jerarquía organiza todo: management groups agrupan suscripciones, cada suscripción es una unidad de facturación y límites, y dentro hay resource groups, que son contenedores lógicos de recursos con el mismo ciclo de vida. Las políticas y los permisos se heredan de arriba hacia abajo.',
        'La identidad se maneja con Microsoft Entra ID (antes Azure Active Directory) y los permisos con Azure RBAC: asignás un rol (Owner, Contributor, Reader o uno específico como Storage Blob Data Reader) a un principal en un scope (management group, suscripción, resource group o recurso). Para que las aplicaciones se autentiquen sin secretos existen las managed identities, el equivalente de los roles de IAM de AWS. Azure Policy aplica reglas de gobierno, como permitir solo ciertas regiones o exigir tags.',
        'Los servicios principales son Virtual Machines y Virtual Machine Scale Sets, Virtual Network (VNet) con subnets y Network Security Groups, Azure Load Balancer (capa 4), Application Gateway (capa 7 con WAF) y Front Door (global, con CDN), App Service (PaaS para web apps), Azure Functions (serverless), Azure Container Apps (contenedores serverless sobre Kubernetes), AKS (Kubernetes administrado), Azure Container Registry, Storage Accounts (blobs, archivos, colas), Azure SQL y Cosmos DB, Key Vault para secretos y Azure Monitor con Log Analytics y Application Insights.',
        'Para infraestructura como código, Azure tiene ARM templates y Bicep, un lenguaje más legible que compila a ARM, además de Terraform con el provider `azurerm`. Para CI/CD están Azure DevOps (Repos, Pipelines, Boards) y GitHub Actions, que se integra con federated credentials para no guardar secretos. Si el puesto pide Azure, preparate para traducir lo que sabés de AWS a sus nombres.',
      ],
      checklist: [
        {
          text: 'Explicar la jerarquía de Azure y para qué sirven los resource groups',
          explanation:
            'De arriba hacia abajo: tenant de Entra ID, management groups, suscripciones, resource groups y recursos. Las asignaciones de RBAC y Azure Policy en un nivel se heredan hacia abajo, así que se gobierna a nivel de management group y se delega en los niveles inferiores. Un resource group agrupa recursos que comparten ciclo de vida (por ejemplo, todo lo de una app en un entorno): al borrarlo se borra todo lo que contiene, y permite asignar permisos y ver costos por grupo. Una práctica común es separar suscripciones por entorno (producción y no producción) para aislar permisos, límites y facturación. Error típico: mezclar recursos de distintos entornos en el mismo resource group y después no poder borrar ni dar permisos sin afectar al otro.',
        },
        {
          text: 'Usar Entra ID, RBAC y managed identities',
          explanation:
            'Entra ID es el servicio de identidad: usuarios, grupos, service principals (identidades de aplicaciones) y managed identities. Una managed identity es una identidad que Azure administra para un recurso (una VM, un App Service, un pod de AKS con workload identity), sin contraseñas ni secretos que rotar: la app pide un token y accede, por ejemplo, a Key Vault o a un Storage Account si tiene el rol asignado. Puede ser system-assigned (atada al ciclo de vida del recurso) o user-assigned (independiente y reutilizable). Con RBAC asignás el rol más específico en el scope más chico: Storage Blob Data Reader sobre una cuenta de storage, no Contributor sobre la suscripción. Privileged Identity Management permite acceso administrativo just-in-time.',
        },
        {
          text: 'Mapear los servicios de Azure a sus equivalentes en AWS y Google Cloud',
          explanation:
            'Virtual Machines equivale a EC2 y Compute Engine; VNet a VPC; Network Security Group a security group (aunque el NSG se puede aplicar a subnet o a interfaz); Blob Storage a S3 y Cloud Storage; Azure SQL a RDS y Cloud SQL; Cosmos DB a DynamoDB y Firestore; Azure Functions a Lambda y Cloud Run functions; AKS a EKS y GKE; Container Apps a Cloud Run y, en parte, a Fargate; Key Vault a Secrets Manager con KMS y a Secret Manager; Azure Monitor a CloudWatch y Cloud Monitoring; Entra ID a IAM Identity Center y Cloud Identity; Bicep a CloudFormation. Saber esta tabla te permite responder con experiencia de otra nube diciendo "en AWS lo resolví con X, que en Azure es Y".',
        },
        {
          text: 'Elegir entre App Service, Container Apps, AKS y Functions',
          explanation:
            'App Service es PaaS para aplicaciones web y APIs: subís código o un contenedor y Azure maneja servidores, escalado, slots de despliegue (para swap tipo blue-green entre staging y producción) y certificados. Azure Functions sirve para cargas por eventos con escalado a cero, con planes de consumo y Flex Consumption. Container Apps corre contenedores sobre Kubernetes administrado sin exponerte a Kubernetes, con autoscaling basado en KEDA y Dapr integrado; es la opción intermedia para microservicios. AKS es Kubernetes completo, para cuando necesitás control total o ya tenés el ecosistema; Azure no cobra el control plane en el tier gratuito pero sí el tier estándar con SLA. Como en AWS, la respuesta madura es empezar por lo más administrado que cubra los requisitos.',
        },
        {
          text: 'Desplegar con Bicep o Terraform y Azure Pipelines o GitHub Actions',
          explanation:
            'Bicep es declarativo, con mejor sintaxis que los JSON de ARM, módulos y soporte de día cero para servicios nuevos; se despliega con `az deployment group create --template-file main.bicep`, y `what-if` muestra los cambios antes, como un plan. Terraform con `azurerm` es la opción si querés una herramienta multi-nube, guardando el state en un Storage Account con locking por blob lease. Para el pipeline, en GitHub Actions usás `azure/login` con OIDC (una federated credential en una app registration o managed identity, sin client secret); en Azure Pipelines, una service connection con workload identity federation. El error común es usar un service principal con client secret de larga duración y rol Owner sobre toda la suscripción.',
        },
      ],
    },
    {
      id: 'google-cloud',
      title: 'Google Cloud Platform',
      body: [
        'Google Cloud es fuerte en datos (BigQuery), Kubernetes (GKE, porque Kubernetes nació en Google) y servicios serverless de contenedores como Cloud Run. Su jerarquía tiene organización, carpetas y proyectos: el proyecto es la unidad básica que agrupa recursos, APIs habilitadas, facturación y permisos, y cada recurso pertenece a uno. Una diferencia notable es que las redes VPC son globales: una sola VPC puede tener subredes en varias regiones.',
        'IAM en Google Cloud asigna roles a principals (usuarios, grupos, service accounts) sobre un recurso, y se hereda hacia abajo en la jerarquía. Los roles básicos (Owner, Editor, Viewer) son demasiado amplios para producción; lo correcto son roles predefinidos (como `roles/storage.objectViewer`) o custom. Las service accounts son identidades de cargas de trabajo; la buena práctica es no crear claves JSON y usar en su lugar la identidad adjunta al recurso, Workload Identity Federation para sistemas externos como GitHub Actions y Workload Identity Federation for GKE para pods.',
        'Los servicios clave: Compute Engine (VMs, con managed instance groups), Cloud Run (contenedores serverless con escalado a cero, muy usado para APIs), GKE (Standard o Autopilot, donde Google administra los nodos), Cloud Run functions (antes Cloud Functions), App Engine, Cloud Storage, Cloud SQL, AlloyDB, Spanner, Firestore, BigQuery, Pub/Sub (mensajería), Cloud Load Balancing (global, con una sola IP anycast), Cloud CDN, Artifact Registry, Cloud Build, Secret Manager y Cloud Logging y Cloud Monitoring (la suite de observabilidad).',
        'En las entrevistas que piden Google Cloud aparecen preguntas sobre cómo elegir entre Cloud Run, GKE y Compute Engine, cómo manejar IAM y service accounts sin claves, cómo diseñar la red con Shared VPC y cómo desplegar con Cloud Build o GitHub Actions. Como en las otras nubes, la infraestructura se define con Terraform (provider `google`), que es la opción más usada en este ecosistema.',
      ],
      checklist: [
        {
          text: 'Explicar la jerarquía de recursos y el rol de los proyectos',
          explanation:
            'Organización (atada a un dominio de Google Workspace o Cloud Identity), carpetas (por área o entorno) y proyectos. Las políticas de IAM y las Organization Policies (por ejemplo, prohibir IPs públicas en VMs o claves de service accounts) se definen arriba y se heredan. El proyecto aísla recursos, cuotas, APIs y facturación, así que es común un proyecto por aplicación y entorno (`app-staging`, `app-prod`). Cada proyecto tiene un nombre, un id único global e inmutable y un número. Un error típico es tener todo en un único proyecto con todos los desarrolladores como Editor: cualquiera puede romper producción y no se puede separar el costo.',
        },
        {
          text: 'Usar IAM y service accounts sin claves descargadas',
          explanation:
            'Asigná roles predefinidos mínimos a grupos, no a personas individuales, y nunca roles básicos en producción. Para que un servicio de Cloud Run lea un bucket, le asignás una service account dedicada con `roles/storage.objectViewer` sobre ese bucket; el código usa Application Default Credentials y obtiene tokens automáticamente. Para GitHub Actions, configurás un Workload Identity Pool con un provider OIDC que confía en `token.actions.githubusercontent.com`, restringido por condición a tu repo, y usás `google-github-actions/auth`; así no hay ninguna clave JSON guardada. En GKE, Workload Identity Federation for GKE vincula la service account de Kubernetes con permisos de IAM. Las claves JSON descargadas son la causa número uno de filtraciones en Google Cloud.',
        },
        {
          text: 'Elegir entre Cloud Run, GKE Autopilot, GKE Standard y Compute Engine',
          explanation:
            'Cloud Run corre cualquier contenedor que escuche HTTP, escala de cero a miles de instancias según requests, cobra por uso y no tiene servidores ni clusters que administrar; también tiene jobs para tareas batch. Es la opción por defecto para APIs y servicios web stateless. GKE Autopilot da Kubernetes completo con nodos administrados por Google y cobro por recursos de los pods, útil si necesitás el ecosistema de Kubernetes sin operar nodos. GKE Standard da control total de los node pools (GPUs, tipos de máquina, configuraciones especiales). Compute Engine es para software que no se contenedoriza fácil o necesita control del sistema operativo. Mencionar el cold start de Cloud Run y cómo mitigarlo con instancias mínimas muestra experiencia real.',
        },
        {
          text: 'Diseñar la red: VPC global, firewall rules y Shared VPC',
          explanation:
            'Una VPC de Google Cloud es global y sus subredes son regionales, así que dos VMs en regiones distintas de la misma VPC se comunican por IP privada sin peering. Las firewall rules se aplican a nivel de VPC con targets por network tags o service accounts; por defecto todo el ingreso está bloqueado (salvo reglas de la red default, que conviene no usar en producción). Cloud NAT da salida a internet a recursos sin IP pública, y Private Google Access deja llegar a APIs de Google sin internet. En organizaciones, Shared VPC permite que un proyecto host administre la red centralmente y otros proyectos de servicio la usen. El Cloud Load Balancing global entrega una única IP anycast para usuarios de todo el mundo.',
        },
        {
          text: 'Desplegar con Cloud Build o GitHub Actions y observar con Cloud Monitoring',
          explanation:
            'Cloud Build ejecuta pasos definidos en `cloudbuild.yaml` (cada paso es un contenedor), se dispara con triggers del repo y publica imágenes en Artifact Registry; Cloud Deploy agrega promoción entre entornos con aprobaciones y canary para GKE y Cloud Run. Con GitHub Actions, autenticás con Workload Identity Federation, construís la imagen, la subís a Artifact Registry y desplegás con `gcloud run deploy --image ...` o la action `deploy-cloudrun`. Cloud Run además permite repartir tráfico entre revisiones para hacer canary o rollback instantáneo con `gcloud run services update-traffic`. Cloud Logging y Cloud Monitoring traen métricas y logs de todos los servicios, con SLOs y alertas configurables, y Cloud Trace para trazas distribuidas.',
        },
      ],
    },
    {
      id: 'vercel',
      title: 'Vercel',
      body: [
        'Vercel es una plataforma de despliegue para frontends y aplicaciones full stack, creadora de Next.js, que abstrae casi toda la infraestructura: conectás un repo de Git y cada push genera un deploy. Es muy común en startups y equipos de producto, y en un rol DevOps te pueden preguntar cuándo conviene frente a montar todo en AWS, cómo configurar entornos y dominios y cómo controlar costos.',
        'El modelo es el de deploys inmutables: cada push a una rama crea un preview deployment con su propia URL, ideal para revisar pull requests con producto y QA, y el merge a la rama de producción crea un deploy de producción. Como cada deploy es inmutable y queda guardado, un rollback es simplemente volver a apuntar el dominio a un deploy anterior (Instant Rollback), sin rebuild. Las variables de entorno se definen por entorno: Production, Preview y Development.',
        'Por debajo, Vercel sirve el contenido estático desde su CDN global y ejecuta el código del servidor en Vercel Functions, que escalan automáticamente. Hoy las funciones usan Fluid compute, que reutiliza instancias para varias invocaciones concurrentes y reduce cold starts y costo, con runtime de Node.js como default; el runtime Edge sigue existiendo para casos puntuales. Next.js aprovecha la plataforma con renderizado estático, ISR y caché, y Vercel suma middleware, Cron Jobs, firewall con WAF y protección de deploys.',
        'Los límites también se preguntan: las funciones tienen un tiempo máximo de ejecución, no hay procesos de larga duración ni conexiones persistentes como un servidor tradicional, y el costo puede crecer con mucho tráfico o funciones lentas. Por eso las arquitecturas típicas combinan Vercel para el frontend y la capa BFF con una base de datos administrada (Neon, Supabase, PlanetScale) y servicios pesados o workers en otra nube.',
      ],
      checklist: [
        {
          text: 'Explicar el flujo de deploys: previews, producción y rollback',
          explanation:
            'Con la integración de Git, cada commit en una rama que no es de producción genera un preview deployment con URL única y un comentario en el pull request; el merge a `main` despliega a producción y asigna el dominio. Cada deploy es inmutable y tiene su propio build, así que podés comparar y volver atrás. Instant Rollback reapunta el dominio de producción a un deploy anterior en segundos, sin esperar un build. También se puede desactivar el auto-deploy y promover deploys manualmente (`vercel promote`), o desplegar desde un pipeline propio con la CLI (`vercel build` y `vercel deploy --prebuilt`) cuando necesitás que los tests corran antes. Error común: olvidar que el rollback no revierte migraciones de base de datos.',
        },
        {
          text: 'Configurar variables de entorno, dominios y protección de previews',
          explanation:
            'Las variables se definen por entorno (Production, Preview, Development, y entornos custom en planes pagos), y se pueden bajar a local con `vercel env pull`. Las que empiezan con `NEXT_PUBLIC_` en Next.js se incrustan en el bundle del cliente, así que jamás pongas un secreto con ese prefijo. Cambiar una variable no afecta deploys existentes: hace falta redeployar. Para no exponer previews con datos de staging, Deployment Protection permite exigir login de Vercel o una contraseña; para automatizar tests E2E contra un preview protegido existe un bypass secret. Los dominios se agregan al proyecto con un registro DNS (CNAME o A) y Vercel emite el certificado TLS automáticamente.',
        },
        {
          text: 'Explicar Vercel Functions, Fluid compute y el runtime Edge',
          explanation:
            'Las rutas de API y el renderizado dinámico se ejecutan como Vercel Functions, que escalan solas y se cobran por uso. Con Fluid compute, una instancia atiende varias invocaciones a la vez mientras alguna espera I/O (por ejemplo, la respuesta de un modelo de IA), en lugar de una instancia por request, y se cobra el tiempo de CPU activo, lo que baja costos en cargas con mucha espera. El runtime Node.js es el recomendado; el Edge es más limitado (sin todas las APIs de Node) y hoy se usa para casos puntuales como middleware. Conviene ubicar las funciones en la región de la base de datos, porque una función cerca del usuario pero lejos de los datos hace varias idas y vueltas lentas. Los procesos largos van a colas, Workflows o un servicio aparte.',
        },
        {
          text: 'Decidir entre Vercel y desplegar en AWS, Azure o Google Cloud',
          explanation:
            'Vercel conviene cuando el equipo es chico o centrado en producto, la app es Next.js u otro framework web, y valorás previews, CDN, TLS y escalado sin operar infraestructura: el costo de la plataforma se compensa con tiempo de ingeniería. Desplegar en una nube conviene con requisitos de compliance o residencia de datos estrictos, cargas pesadas o de larga duración, tráfico muy alto donde el costo por request importa, o cuando ya hay una plataforma interna con Kubernetes. Una respuesta madura menciona el término medio: Vercel para el frontend y el BFF, la base y los workers en la nube, conectados por red privada (Secure Compute) si hace falta, y el riesgo de lock-in medido según cuánto se usan features propietarias.',
        },
        {
          text: 'Controlar costos y observar una app en Vercel',
          explanation:
            'Los costos principales son tiempo de cómputo de funciones, transferencia de datos, optimización de imágenes, ejecuciones de middleware y builds. Para controlarlos: maximizar lo estático y cacheable (ISR, caché de datos y de CDN con headers `Cache-Control` correctos), revisar funciones lentas, configurar Spend Management con un tope y alertas, y evitar que bots consuman recursos usando el firewall. Para observar, el dashboard de Observability muestra invocaciones, duración y errores por ruta, Speed Insights mide Core Web Vitals reales y Web Analytics el tráfico; los logs de runtime se pueden enviar a Datadog u otra herramienta con Log Drains, y la integración con OpenTelemetry permite trazas. Un error común es no poner ningún límite de gasto y enterarse del pico por la factura.',
        },
      ],
    },
    {
      id: 'observabilidad',
      title: 'Observabilidad: Prometheus, Grafana y OpenTelemetry',
      body: [
        'Monitoreo es vigilar condiciones conocidas (¿la CPU supera el 90%?); observabilidad es poder responder preguntas nuevas sobre un sistema a partir de lo que emite, sin desplegar código nuevo. Los tres pilares son métricas (números agregados en el tiempo, baratos y buenos para alertar), logs (eventos detallados, idealmente estructurados en JSON) y trazas (el recorrido de una request por varios servicios con la duración de cada tramo). Se suman los perfiles continuos como cuarta señal.',
        'Prometheus es el estándar de métricas en el mundo cloud native. Funciona con modelo pull: cada cierto intervalo hace scrape del endpoint `/metrics` de cada target, descubierto automáticamente (por ejemplo, en Kubernetes). Guarda series temporales identificadas por nombre y labels, y se consultan con PromQL. Los tipos de métrica son counter (solo sube, como requests totales), gauge (sube y baja, como memoria en uso), histogram y summary (distribuciones, para latencias y percentiles). Alertmanager agrupa, silencia y enruta las alertas.',
        'Grafana es la capa de visualización: dashboards sobre Prometheus, Loki (logs), Tempo (trazas), CloudWatch y muchas otras fuentes, además de alertas propias. OpenTelemetry es el estándar abierto, del CNCF, para instrumentar aplicaciones una sola vez (SDKs y auto-instrumentación) y enviar métricas, logs y trazas a cualquier backend a través del OpenTelemetry Collector, sin atarte a un proveedor como Datadog, New Relic o Honeycomb.',
        'Lo que más se evalúa no es la herramienta sino qué medir y cuándo despertar a alguien. Los métodos RED (rate, errors, duration) para servicios y USE (utilization, saturation, errors) para recursos, y las cuatro señales doradas de Google (latencia, tráfico, errores, saturación), ordenan qué instrumentar. Las alertas buenas son sobre síntomas que afectan al usuario, idealmente basadas en el consumo del error budget, y cada una tiene un runbook.',
      ],
      checklist: [
        {
          text: 'Diferenciar métricas, logs y trazas y cuándo usar cada uno',
          explanation:
            'Las métricas responden "¿cuánto y qué tan seguido?": tasa de requests, porcentaje de errores, latencia p99; son baratas de guardar y perfectas para dashboards y alertas, pero pierden el detalle de cada evento. Los logs responden "¿qué pasó exactamente en este evento?": un stack trace, el payload que falló; conviene que sean estructurados (JSON con campos como `level`, `request_id`, `user_id`) para poder filtrarlos, y cuidar el volumen porque cuestan. Las trazas responden "¿dónde se fue el tiempo de esta request?" cruzando servicios, con spans propagados por headers como `traceparent` (W3C Trace Context). El flujo típico de investigación: una alerta de métrica avisa, la traza muestra qué servicio es lento y los logs de ese tramo explican por qué; correlacionarlos por `trace_id` es clave.',
        },
        {
          text: 'Escribir consultas PromQL básicas para tasas, errores y percentiles',
          explanation:
            'Los counters se consultan con `rate()`: `sum(rate(http_requests_total[5m])) by (service)` da requests por segundo por servicio. Porcentaje de errores: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))`. Latencia p99 desde un histogram: `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`. Errores comunes: hacer `sum` antes de `rate` (rompe el manejo de reinicios del counter), promediar percentiles entre instancias (no es matemáticamente válido, hay que agregar los buckets) y usar labels con alta cardinalidad, como `user_id` o la URL completa, que multiplican las series y pueden tirar abajo Prometheus.',
        },
        {
          text: 'Diseñar alertas accionables y basadas en SLOs',
          explanation:
            'Una alerta que despierta a alguien tiene que indicar un problema real para usuarios, ser urgente y requerir acción humana; lo demás va a un ticket o a un dashboard. Alertá sobre síntomas (errores y latencia que ve el usuario) más que sobre causas (CPU alta, que puede ser normal). Con SLOs, las alertas de burn rate miden qué tan rápido se consume el error budget: por ejemplo, una página si en la última hora se consume a 14,4 veces la tasa sostenible (gastaría el 2% del presupuesto mensual en una hora) y un ticket si se consume a una tasa menor pero sostenida durante días, combinando una ventana larga y una corta para evitar falsos positivos. Cada alerta enlaza un runbook y un dashboard. La fatiga de alertas es el problema más común: si el equipo ignora alertas, no hay monitoreo.',
        },
        {
          text: 'Explicar Prometheus en Kubernetes y sus límites de escala',
          explanation:
            'En Kubernetes lo habitual es instalar kube-prometheus-stack con Helm, que trae el Prometheus Operator, Alertmanager, Grafana, node-exporter (métricas de nodos) y kube-state-metrics (estado de objetos como deployments y pods). Los targets se declaran con recursos `ServiceMonitor` o `PodMonitor` en vez de editar la configuración a mano. Prometheus es un único binario con almacenamiento local, sin alta disponibilidad ni retención larga por diseño; para eso se usa remote write a sistemas como Thanos, Grafana Mimir o servicios administrados (Amazon Managed Service for Prometheus, Google Managed Prometheus, Grafana Cloud). Para jobs efímeros que no llegan a ser scrapeados existe Pushgateway, pero con cuidado porque rompe el modelo pull.',
        },
        {
          text: 'Instrumentar con OpenTelemetry y el Collector',
          explanation:
            'OpenTelemetry da APIs y SDKs por lenguaje, más auto-instrumentación que captura sin cambiar código las requests HTTP, queries a bases y llamadas entre servicios. La app envía datos por el protocolo OTLP a un OpenTelemetry Collector, que tiene receivers, processors (batching, filtrado, muestreo, agregar atributos como el entorno o el cluster) y exporters hacia los backends que elijas: Prometheus o Mimir para métricas, Tempo o Jaeger para trazas, Loki para logs, o un proveedor comercial. Así cambiar de proveedor es cambiar configuración del Collector, no reinstrumentar. Mencioná el muestreo: guardar todas las trazas de un sistema con mucho tráfico es carísimo, y el tail sampling en el Collector permite quedarte con las lentas o con error.',
        },
      ],
    },
    {
      id: 'seguridad-y-costos',
      title: 'Seguridad, secretos y costos',
      body: [
        'En DevOps la seguridad se integra al flujo de entrega en vez de ser una revisión al final (shift left, o DevSecOps). Eso incluye escanear código (SAST), dependencias (SCA) e imágenes de contenedores en el pipeline, validar la infraestructura como código antes de aplicarla, aplicar least privilege en cada identidad humana y de máquina, y cuidar la cadena de suministro de software: de dónde vienen las dependencias, las actions y las imágenes base.',
        'Los secretos (contraseñas, tokens, claves) nunca van en el código, en la imagen ni en variables de entorno impresas en logs. Se guardan en un gestor como AWS Secrets Manager, Azure Key Vault, Google Secret Manager o HashiCorp Vault, se rotan y se auditan. Mejor todavía es eliminarlos: OIDC y la federación de identidades permiten que GitHub Actions o un pod obtengan credenciales temporales de la nube sin ninguna clave guardada.',
        'La cadena de suministro se protege fijando versiones (lockfiles, actions por SHA, imágenes por digest), generando SBOMs, firmando artefactos (cosign y Sigstore) y verificando procedencia con el marco SLSA. Herramientas como Dependabot o Renovate mantienen dependencias actualizadas, y gitleaks o el secret scanning de GitHub detectan secretos commiteados.',
        'Los costos también son responsabilidad de ingeniería: FinOps es la práctica de hacer visibles los costos de la nube y que los equipos decidan con ellos. Lo básico es etiquetar recursos para atribuir costos a equipos y productos, poner presupuestos con alertas, dimensionar bien (rightsizing), apagar entornos que no se usan, usar autoscaling, comprometer uso estable con Savings Plans o reserved instances, usar instancias spot para cargas tolerantes a interrupciones y vigilar la transferencia de datos y los NAT gateways, que suelen ser sorpresas en la factura.',
      ],
      checklist: [
        {
          text: 'Manejar secretos correctamente y explicar por qué OIDC es mejor',
          explanation:
            'Un secreto guardado (una access key de AWS en los secrets de GitHub) es de larga duración: si se filtra en un log o por una action comprometida, sirve hasta que alguien lo rote. Con OIDC, el runner de GitHub Actions obtiene un token firmado que dice qué repo, rama y entorno lo pide, y la nube lo intercambia por credenciales temporales de un rol que solo confía en ese repo y esa rama (en AWS, con una condición sobre el claim `sub`, por ejemplo `repo:org/app:ref:refs/heads/main`). Para las apps, inyectá secretos en runtime desde el gestor (en Kubernetes con External Secrets Operator o el CSI driver) en vez de hornearlos en la imagen, y rotalos automáticamente. Si un secreto llega a Git, no alcanza con borrar el commit: hay que revocarlo, porque el historial y los forks lo conservan.',
        },
        {
          text: 'Integrar escaneos de seguridad en el pipeline sin frenar al equipo',
          explanation:
            'En cada pull request: SAST (CodeQL, Semgrep) sobre el código, SCA (Dependabot, Snyk, Trivy) sobre dependencias, detección de secretos (gitleaks) y escaneo de IaC (Checkov, Trivy). Al construir la imagen: escaneo de CVEs y generación de SBOM. La clave para que los equipos no lo odien: bloquear solo por hallazgos críticos y con fix disponible, mostrar resultados como comentarios en el pull request, mantener una lista de excepciones con vencimiento y medir falsos positivos. Un pipeline que falla por cualquier CVE de severidad media en una librería que no se usa termina con alguien desactivando el escaneo.',
        },
        {
          text: 'Proteger la cadena de suministro de software',
          explanation:
            'Los ataques recientes atacan dependencias y herramientas de build en vez de la app: paquetes de npm comprometidos, actions de GitHub modificadas para robar secretos (como el caso de `tj-actions/changed-files` en 2025), imágenes base con malware. Defensas: fijar actions de terceros por SHA completo del commit, usar lockfiles con instalaciones reproducibles (`pnpm install --frozen-lockfile`), restringir los `permissions` del `GITHUB_TOKEN`, usar registries privados o proxies de dependencias, firmar imágenes con cosign y verificar la firma al desplegar con una política de admisión en Kubernetes (Kyverno o Sigstore policy-controller), y generar attestations de procedencia (SLSA, que GitHub soporta con `actions/attest-build-provenance`).',
        },
        {
          text: 'Aplicar least privilege a personas, pipelines y workloads',
          explanation:
            'Personas: acceso por grupos desde un proveedor de identidad con SSO y MFA, roles de solo lectura por defecto y acceso de escritura a producción just-in-time y auditado; nadie usa el usuario root de la cuenta. Pipelines: un rol distinto por entorno, el de producción solo asumible desde la rama `main` y con aprobación, y el que corre `terraform plan` en pull requests con solo lectura. Workloads: una identidad por servicio (rol de IAM por pod, managed identity, service account dedicada) con permisos sobre los recursos exactos. En Kubernetes, RBAC por namespace, NetworkPolicies que niegan por defecto y Pod Security Standards en modo `restricted`. Revisá periódicamente permisos sin uso con herramientas como IAM Access Analyzer.',
        },
        {
          text: 'Proponer cómo bajar la factura de la nube',
          explanation:
            'Primero visibilidad: tags obligatorios (`team`, `env`, `service`) aplicados por política, Cost Explorer o los reportes de costos de cada nube, presupuestos con alertas por equipo y detección de anomalías. Después las palancas por orden de esfuerzo: borrar lo que no se usa (discos huérfanos, snapshots viejos, IPs sin asignar, entornos de prueba olvidados), apagar entornos no productivos fuera de horario, rightsizing según uso real, autoscaling, almacenamiento en clases más baratas con lifecycle, Savings Plans o committed use discounts para la base estable y spot o preemptible para batch y CI. Revisá la transferencia de datos: el tráfico entre zonas, el NAT gateway y la salida a internet suelen explicar gastos que nadie entiende. Presentalo como trade-off: a veces pagar más es correcto si compra confiabilidad o velocidad.',
        },
      ],
    },
    {
      id: 'ejercicios-practicos',
      title: 'Ejercicios prácticos y el día de la entrevista',
      body: [
        'La mejor preparación es haber roto y arreglado cosas. Armá un home lab barato: una VM o una Raspberry Pi con Linux, un cluster local con kind, k3d o minikube, y una cuenta de nube con presupuestos y alertas configurados desde el primer día (los free tiers y créditos alcanzan para practicar si apagás todo). Practicá con un proyecto de punta a punta: una app chica con base de datos, dockerizada, con infraestructura en Terraform, un pipeline de GitHub Actions, despliegue en Kubernetes o en un servicio administrado, métricas en Prometheus y un dashboard en Grafana. Ese repo es tu portfolio.',
        'Para troubleshooting hay recursos hechos para eso: SadServers propone servidores Linux rotos para arreglar contra reloj, y Killercoda tiene escenarios interactivos de Kubernetes y Linux. Las certificaciones (AWS Solutions Architect Associate, Azure Administrator, Google Associate Cloud Engineer, CKA y CKAD de Kubernetes, Terraform Associate) ordenan el estudio y ayudan a pasar filtros, pero en la entrevista pesa más poder explicar lo que hiciste.',
        'También preparate para diseño de infraestructura: te pueden pedir que diseñes la plataforma para una app con usuarios en varios países, una estrategia de disaster recovery, un pipeline para veinte microservicios o la migración de un monolito en VMs a contenedores. El método es el mismo que en system design: aclarar requisitos (tráfico, disponibilidad, RPO y RTO, presupuesto, tamaño del equipo, compliance), proponer una arquitectura simple, profundizar en las partes críticas y explicar trade-offs y cómo se opera.',
        'El día de la entrevista, en los ejercicios en vivo, pensá en voz alta, leé los mensajes de error completos antes de actuar y usá la documentación si te dejan, porque nadie espera que recuerdes cada flag. Si te trabás, decí qué verificarías después. Y llevá preguntas sobre cómo operan: cómo es el on-call, cuántos deploys por día hacen, cómo manejan los incidentes y los postmortems, y cuánto del trabajo es reactivo; las respuestas te dicen mucho sobre la calidad de vida del puesto.',
      ],
      checklist: [
        {
          text: 'Armar un proyecto de punta a punta para mostrar',
          explanation:
            'Elegí una app simple (una API con Postgres alcanza) y construí alrededor todo lo que piden los avisos: `Dockerfile` multi-stage, `compose.yaml` para desarrollo, Terraform que crea la red, el cluster o el servicio administrado y la base, un workflow de GitHub Actions que testea, construye, escanea, publica la imagen y despliega con OIDC, manifiestos de Kubernetes o Helm con probes y recursos, y Prometheus con Grafana mostrando las métricas RED. Documentá en el `README` el diagrama de arquitectura, las decisiones con sus trade-offs y cuánto cuesta por mes. Destruí todo con `terraform destroy` cuando no lo uses. En la entrevista, este proyecto te da ejemplos concretos para casi cualquier pregunta.',
        },
        {
          text: 'Practicar troubleshooting en escenarios rotos',
          explanation:
            'Hacé ejercicios de SadServers y Killercoda, y rompé tu propio lab a propósito: llená un disco, matá un proceso, poné una liveness probe que falla, un Service con selector equivocado, un security group que bloquea la base, un DNS mal configurado, un certificado vencido. Practicá narrar el diagnóstico en voz alta con el método: síntoma, alcance, qué cambió, hipótesis, comando que la verifica, mitigación y causa raíz. Cronometrate: en una entrevista en vivo suelen darte entre 20 y 45 minutos. Lo que más evalúan es el orden del razonamiento, no llegar a la respuesta en el primer intento.',
        },
        {
          text: 'Resolver una pregunta de diseño de infraestructura con método',
          explanation:
            'Ejemplo: "diseñá la infraestructura para una app web con 100.000 usuarios diarios". Primero preguntá: picos de tráfico, disponibilidad requerida, RPO y RTO, presupuesto, regiones, datos sensibles y tamaño del equipo. Después proponé lo simple: CDN, balanceador, la app en contenedores en un servicio administrado en dos zonas con autoscaling, base administrada con réplica en otra zona y backups, cache con Redis, colas para trabajo asincrónico, todo en Terraform con un pipeline y observabilidad con SLOs. Profundizá donde te lleven: cómo escalar la base, cómo desplegar sin downtime, qué pasa si se cae una zona o una región. Cerrá con costos aproximados y qué cambiarías al crecer. El error común es arrancar con Kubernetes multi-región para un problema que no lo necesita.',
        },
        {
          text: 'Comportarte bien en un ejercicio en vivo',
          explanation:
            'Antes de tocar nada, confirmá el objetivo y qué podés usar (documentación, buscadores, IA). Leé el error completo: muchas veces dice exactamente qué pasa (`permission denied`, `connection refused`, `no such host`), y cada uno apunta a una capa distinta. Hacé un cambio por vez y verificá el efecto. Si algo no lo sabés, decilo y explicá cómo lo averiguarías (`man`, `--help`, `kubectl explain`, la documentación del provider). Si te quedás sin tiempo, resumí qué hiciste, qué hipótesis quedaba y cuál sería el siguiente paso. Evitá "arreglos" destructivos como `chmod 777` o desactivar el firewall, porque el entrevistador los anota como señal de riesgo en producción.',
        },
        {
          text: 'Llevar preguntas para evaluar el puesto',
          explanation:
            'Preguntá cómo es el on-call (rotación, cantidad de páginas por semana, si se compensa), cuántas veces por día o semana despliegan y cuánto tarda un commit en llegar a producción, cómo manejan incidentes y si hacen postmortems sin culpables, qué porcentaje del trabajo es planificado contra interrupciones, cuánta infraestructura está en código y cuánta hecha a mano, qué nube y herramientas usan y qué quieren cambiar, y cómo se relaciona el equipo con los de producto (¿plataforma self-service o cola de tickets?). Las respuestas revelan si vas a construir y mejorar o a apagar incendios todo el día, y hacer estas preguntas también muestra seniority.',
        },
      ],
    },
  ],
};
