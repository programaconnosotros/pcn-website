import type { InterviewQuestion, Seniority } from './types';

export const linuxQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'linux y redes',
      question: '¿Cómo funcionan los permisos de archivos en Linux y qué significa `chmod 750`?',
      answer:
        'Cada archivo tiene dueño, grupo y permisos de lectura (4), escritura (2) y ejecución (1) para el dueño, el grupo y el resto. `chmod 750` da `rwx` al dueño (7), `r-x` al grupo (5) y nada al resto (0). Se ven con `ls -l` y el dueño se cambia con `chown usuario:grupo archivo`. En un directorio, el permiso de ejecución significa poder entrar en él.',
    },
    {
      topic: 'linux y redes',
      question: '¿Cómo ves qué procesos están corriendo y cómo terminás uno?',
      answer:
        'Con `ps aux` (o `ps -ef`) listás procesos, y con `top` o `htop` los ves en vivo ordenados por CPU o memoria; `pgrep nombre` te da el PID. Para terminarlo usás `kill PID`, que manda `SIGTERM` y le permite cerrar ordenadamente. Si no responde, `kill -9 PID` manda `SIGKILL`, que el proceso no puede atrapar, pero no le da chance de liberar recursos ni guardar estado.',
    },
    {
      topic: 'linux y redes',
      question: '¿Qué es systemd y cómo manejás un servicio con él?',
      answer:
        'Es el sistema de init y gestor de servicios de la mayoría de las distribuciones modernas; arranca como PID 1. Los servicios se definen en unit files y se manejan con `systemctl start|stop|restart|status nginx`, y `systemctl enable nginx` hace que arranque con el sistema. Sus logs se consultan con `journalctl -u nginx`, y con `-f` los seguís en vivo.',
    },
    {
      topic: 'linux y redes',
      question: '¿Qué es DNS y qué diferencia hay entre un registro A, AAAA y CNAME?',
      answer:
        'DNS traduce nombres de dominio a direcciones IP. Un registro A apunta un nombre a una IPv4, un AAAA a una IPv6 y un CNAME es un alias que apunta a otro nombre (por ejemplo `www` a `app.proveedor.com`), que a su vez se resuelve. Un CNAME no puede convivir con otros registros en el mismo nombre, por eso no se usa en el apex del dominio. Se consulta con `dig ejemplo.com A` o `nslookup`.',
    },
    {
      topic: 'linux y redes',
      question: '¿Qué diferencia hay entre TCP y UDP?',
      answer:
        'TCP es orientado a conexión: hace el handshake de tres pasos (SYN, SYN-ACK, ACK), garantiza entrega ordenada, retransmite lo perdido y controla congestión; lo usan HTTP/1.1 y HTTP/2, SSH y bases de datos. UDP manda datagramas sin conexión ni garantías, con menos overhead y latencia; lo usan DNS, streaming, juegos y QUIC, sobre el que corre HTTP/3, que implementa su propia confiabilidad.',
    },
    {
      topic: 'linux y redes',
      question: '¿Cómo verías qué proceso está escuchando en el puerto 8080?',
      answer:
        'Con `ss -tlnp | grep 8080` (o el viejo `netstat -tlnp`): `-t` es TCP, `-l` solo los que escuchan, `-n` muestra números en vez de nombres y `-p` el proceso, que requiere `sudo` para procesos de otros usuarios. También sirve `lsof -i :8080`. Es lo primero que se mira cuando un servicio no arranca por "address already in use".',
    },
  ],
  'semi-senior': [
    {
      topic: 'linux y redes',
      question: '¿Qué pasa desde que escribís una URL en el navegador hasta que ves la página?',
      answer:
        'El navegador resuelve el dominio por DNS (caché local, resolver recursivo, servidores raíz, TLD y autoritativos), abre una conexión TCP (o QUIC en HTTP/3) con la IP, y hace el handshake TLS validando el certificado. Envía la request HTTP, que pasa por CDN o balanceador hasta el servidor de aplicación, que puede consultar bases o cachés y responder. Finalmente el navegador parsea el HTML, pide CSS, JS e imágenes y renderiza.',
    },
    {
      topic: 'linux y redes',
      question: 'Un servidor tiene load average alto. ¿Cómo lo investigás?',
      answer:
        'Primero comparo el load con la cantidad de CPUs (`nproc`): un load de 8 en 8 cores es uso pleno. Con `top` o `htop` veo si es CPU de usuario, de sistema o `iowait`, porque en Linux el load también cuenta procesos bloqueados en disco (estado `D`). Si es CPU, busco el proceso culpable; si es I/O, uso `iostat -x` o `iotop`; y con `vmstat 1` veo si hay swapping. Sumo `dmesg` y los logs del servicio para buscar la causa.',
    },
    {
      topic: 'linux y redes',
      question:
        'El disco dice que hay espacio libre pero no se pueden crear archivos. ¿Qué puede pasar?',
      answer:
        'Lo más probable es que se agotaron los inodos: cada archivo usa uno y un filesystem con millones de archivos chicos (cachés, sesiones, colas de mail) los agota con espacio libre; se ve con `df -i`. Otra causa clásica es lo contrario: `df` dice lleno pero `du` no encuentra los archivos, porque un proceso mantiene abierto un archivo borrado (típico con logs); se detecta con `lsof +L1` y se libera reiniciando el proceso.',
    },
    {
      topic: 'linux y redes',
      question: '¿Qué es el OOM killer y cómo sabés si mató a tu proceso?',
      answer:
        'Cuando el sistema se queda sin memoria, el kernel elige un proceso según su `oom_score` (en general el que más memoria usa) y lo mata con `SIGKILL` para sobrevivir. Se ve en `dmesg -T | grep -i oom` o `journalctl -k`. En contenedores pasa al superar el límite de memoria del cgroup, y Kubernetes lo reporta como `OOMKilled` con exit code 137. La solución es entender el consumo real (fuga o límite mal dimensionado), no solo subir el límite.',
    },
    {
      topic: 'linux y redes',
      question: '¿Qué diferencia hay entre un balanceador de carga de capa 4 y uno de capa 7?',
      answer:
        'El de capa 4 trabaja con TCP/UDP: reparte conexiones por IP y puerto sin mirar el contenido, es muy rápido y sirve para cualquier protocolo (AWS NLB). El de capa 7 entiende HTTP: puede rutear por host, path o headers, terminar TLS, hacer redirecciones, sticky sessions por cookie y health checks HTTP (AWS ALB, NGINX, Envoy). Para apps web casi siempre querés L7; para protocolos no HTTP o latencia mínima, L4.',
    },
    {
      topic: 'linux y redes',
      question: '¿Qué significa una subred `10.0.1.0/24` y qué es NAT?',
      answer:
        'El `/24` indica que los primeros 24 bits son la red, así que quedan 8 bits para hosts: 256 direcciones, de `10.0.1.0` a `10.0.1.255` (en AWS se reservan 5 por subred). `10.0.0.0/8`, `172.16.0.0/12` y `192.168.0.0/16` son rangos privados no ruteables en internet. NAT traduce direcciones privadas a una pública para salir a internet; un NAT gateway permite que instancias en subredes privadas descarguen actualizaciones sin ser accesibles desde afuera.',
    },
  ],
  senior: [
    {
      topic: 'linux y redes',
      question: 'Un servicio da "too many open files". ¿Qué está pasando y cómo lo resolvés?',
      answer:
        'El proceso llegó a su límite de file descriptors, que incluyen archivos, sockets y pipes. Miro el límite con `cat /proc/PID/limits` y el uso con `ls /proc/PID/fd | wc -l` o `lsof -p PID`. Si el uso crece sin parar es una fuga (conexiones o archivos sin cerrar) y hay que arreglar el código; si es carga legítima, subo el límite con `LimitNOFILE` en la unit de systemd o `ulimit -n`, y reviso el límite global `fs.file-max`.',
    },
    {
      topic: 'linux y redes',
      question:
        'Las requests entre dos servicios a veces tardan exactamente 5 segundos. ¿Qué sospechás?',
      answer:
        'Un número tan redondo suele ser un timeout con reintento, y el clásico es DNS: el timeout por defecto del resolver es 5 segundos, así que un paquete UDP perdido (por ejemplo por una race condition de conntrack con consultas A y AAAA en paralelo) se ve así. Lo confirmaría con `dig` repetido, `tcpdump -i any port 53` y midiendo cada fase con `curl -w`. Mitigaciones: caché DNS local (NodeLocal DNSCache en Kubernetes), `single-request-reopen` o reducir `ndots`.',
    },
    {
      topic: 'linux y redes',
      question: '¿Cómo usarías `tcpdump` o `curl` para depurar un problema de conectividad?',
      answer:
        'Con `curl -v` veo resolución, conexión, handshake TLS y headers, y con `curl -w "%{time_namelookup} %{time_connect} %{time_appconnect} %{time_starttransfer}"` mido cada fase para ubicar la demora. Con `tcpdump -i any -nn host 10.0.1.5 and port 443 -w captura.pcap` capturo el tráfico real y lo analizo en Wireshark: si salen SYN sin SYN-ACK es un firewall o security group; si hay RST, el puerto está cerrado; si hay retransmisiones, pérdida de paquetes.',
    },
    {
      topic: 'linux y redes',
      question:
        '¿Cómo funciona el handshake de TLS 1.3 y qué problemas típicos de certificados encontraste?',
      answer:
        'En TLS 1.3 el cliente manda en el ClientHello los cifrados y su parte del intercambio de claves efímero (ECDHE), y el servidor responde con la suya, el certificado y la firma, completando en un solo round trip (o cero con 0-RTT en reconexiones). Problemas típicos: certificado vencido, cadena incompleta (falta el intermedio), nombre que no coincide con el SNI o los SAN, y relojes desfasados. Se diagnostican con `openssl s_client -connect host:443 -servername host` y se previenen automatizando la renovación (ACME, cert-manager).',
    },
    {
      topic: 'linux y redes',
      question:
        '¿Qué son los namespaces y cgroups de Linux y qué tienen que ver con los contenedores?',
      answer:
        'Los namespaces aíslan lo que un proceso ve: PIDs, red, puntos de montaje, hostname, usuarios e IPC, así que el contenedor cree que es su propio sistema. Los cgroups limitan y contabilizan lo que puede usar: CPU, memoria, I/O y cantidad de procesos. Un contenedor no es una máquina virtual sino un proceso del host con namespaces, cgroups, capabilities y seccomp; por eso comparte kernel y arranca en milisegundos, y por eso un escape de contenedor es grave.',
    },
    {
      topic: 'linux y redes',
      question:
        'Un proceso consume cada vez más memoria hasta caerse. ¿Cómo lo investigás en producción?',
      answer:
        'Primero confirmo la tendencia con métricas de memoria del proceso a lo largo del tiempo (RSS, no solo memoria total del host, que incluye page cache). Con `ps`, `pmap -x PID` o `/proc/PID/smaps` veo si crece el heap o mapeos nativos. Después uso las herramientas del runtime: heap dumps en la JVM o Node, `pprof` en Go, `tracemalloc` en Python, comparando dos snapshots para ver qué objetos crecen. Mientras tanto, mitigo con límites y reinicios controlados.',
    },
  ],
};
