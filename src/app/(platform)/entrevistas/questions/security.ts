import type { InterviewQuestion, Seniority } from './types';

export const securityQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'fundamentos',
      question: '¿Qué es la tríada CIA?',
      answer:
        'Son los tres objetivos básicos de la seguridad de la información: confidencialidad (solo accede quien debe), integridad (los datos no se alteran sin autorización y se detecta si pasa) y disponibilidad (el sistema y los datos están accesibles cuando se necesitan). Cada control o ataque se puede analizar según cuál de las tres afecta: un ransomware pega en disponibilidad, una filtración en confidencialidad.',
    },
    {
      topic: 'auth',
      question: '¿Qué diferencia hay entre autenticación y autorización?',
      answer:
        'La autenticación responde quién sos: verifica la identidad con contraseña, passkey, MFA o un token. La autorización responde qué podés hacer: decide si esa identidad tiene permiso sobre un recurso o acción. Se autentica una vez por sesión, pero la autorización se tiene que chequear en cada request y siempre del lado del servidor.',
    },
    {
      topic: 'criptografía',
      question: '¿Qué diferencia hay entre hashing, cifrado y encoding?',
      answer:
        'El encoding (Base64, URL encoding) solo cambia la representación de los datos y se revierte sin ninguna clave: no da seguridad. El cifrado transforma los datos de forma reversible con una clave, para proteger confidencialidad. El hashing es una función de un solo sentido que produce un resumen de tamaño fijo, útil para verificar integridad o guardar contraseñas, y no se puede "descifrar".',
    },
    {
      topic: 'criptografía',
      question: '¿Cómo guardarías las contraseñas de los usuarios en una base de datos?',
      answer:
        'Nunca en texto plano ni cifradas, sino con un algoritmo de hashing lento y diseñado para contraseñas: Argon2id (la recomendación actual), bcrypt o scrypt. Estos usan un salt único por usuario para que dos contraseñas iguales den hashes distintos y no sirvan las rainbow tables, y un costo configurable para encarecer la fuerza bruta. MD5 o SHA-256 a secas son demasiado rápidos para esto.',
    },
    {
      topic: 'criptografía',
      question: '¿Qué diferencia hay entre cifrado simétrico y asimétrico?',
      answer:
        'El simétrico usa la misma clave para cifrar y descifrar (AES, ChaCha20): es rápido, pero hay que compartir la clave de forma segura. El asimétrico usa un par de claves pública y privada (RSA, curvas elípticas): lo que se cifra con la pública solo lo abre la privada, y también permite firmas digitales. En la práctica se combinan: TLS usa asimétrico para acordar una clave y simétrico para el tráfico.',
    },
    {
      topic: 'redes',
      question: '¿Qué aporta HTTPS y cómo funciona TLS a grandes rasgos?',
      answer:
        'HTTPS es HTTP sobre TLS, que da confidencialidad, integridad y autenticación del servidor. En el handshake el cliente y el servidor negocian parámetros, el servidor presenta un certificado firmado por una CA en la que el cliente confía, y acuerdan claves de sesión con intercambio efímero (forward secrecy). Hoy lo esperable es TLS 1.2 como mínimo y TLS 1.3 por defecto.',
    },
    {
      topic: 'owasp',
      question: '¿Qué es el OWASP Top 10?',
      answer:
        'Es un documento de referencia de OWASP con las diez categorías de riesgo más críticas en aplicaciones web, armado con datos de la industria. Incluye cosas como broken access control (la primera hace años), fallas criptográficas, inyección, diseño inseguro, security misconfiguration, componentes vulnerables y fallas de autenticación. No es un estándar exhaustivo sino un punto de partida para concientizar y priorizar.',
    },
    {
      topic: 'owasp',
      question: '¿Qué es una SQL injection y cómo se previene?',
      answer:
        'Pasa cuando input del usuario se concatena en una consulta SQL y termina interpretado como código, lo que permite leer o modificar datos que no deberían. La defensa principal son las consultas parametrizadas o prepared statements (o un ORM usado correctamente), que separan datos de código. Se complementa con validación de input y con que el usuario de la base tenga los mínimos privilegios.',
    },
    {
      topic: 'owasp',
      question: '¿Qué es XSS y qué tipos hay?',
      answer:
        'Cross-Site Scripting es inyectar JavaScript que se ejecuta en el navegador de otro usuario, en el contexto del sitio vulnerable, para robar sesiones o actuar en su nombre. Hay reflejado (el payload viene en la request), almacenado (queda guardado y se muestra a otros) y DOM-based (lo produce el JavaScript del cliente). Se previene escapando el output según el contexto, evitando APIs como `innerHTML` con datos no confiables y sumando una Content Security Policy.',
    },
    {
      topic: 'owasp',
      question: '¿Qué es CSRF y cómo se mitiga?',
      answer:
        'Cross-Site Request Forgery es lograr que el navegador de un usuario autenticado envíe una request no deseada a un sitio, aprovechando que las cookies se mandan solas. Se mitiga con cookies `SameSite=Lax` o `Strict`, tokens anti-CSRF en formularios y verificando el header `Origin` en acciones que cambian estado. También ayuda no usar `GET` para operaciones con efectos.',
    },
    {
      topic: 'owasp',
      question: '¿Qué es un IDOR?',
      answer:
        'Insecure Direct Object Reference: la app expone un identificador (por ejemplo `/facturas/1234`) y no verifica que el usuario tenga permiso sobre ese objeto, así que cambiando el ID se accede a datos ajenos. Es un caso típico de broken access control. Se corrige chequeando la autorización en el servidor para cada objeto pedido; usar UUIDs dificulta adivinar IDs pero no reemplaza el chequeo.',
    },
    {
      topic: 'web',
      question: '¿Qué flags de seguridad tienen las cookies y para qué sirve cada una?',
      answer:
        '`HttpOnly` impide que JavaScript lea la cookie, lo que limita el robo de sesión por XSS. `Secure` hace que solo viaje por HTTPS. `SameSite` controla si se envía en requests cross-site y es una defensa clave contra CSRF. También conviene acotar `Domain` y `Path`, y usar el prefijo `__Host-` para cookies de sesión.',
    },
    {
      topic: 'web',
      question: '¿Qué es la same-origin policy y qué tiene que ver CORS?',
      answer:
        'La same-origin policy impide que un script de un origen (esquema, host y puerto) lea respuestas de otro origen. CORS es el mecanismo para relajarla de forma controlada: el servidor indica con headers como `Access-Control-Allow-Origin` qué orígenes pueden leer sus respuestas. Un error común es reflejar cualquier origen junto con `Access-Control-Allow-Credentials: true`, que habilita a cualquier sitio a leer datos del usuario.',
    },
    {
      topic: 'auth',
      question: '¿Por qué es importante el MFA y qué factores hay?',
      answer:
        'Porque las contraseñas se filtran, se reutilizan y se phishean, y un segundo factor frena la mayoría de esos ataques. Los factores son algo que sabés (contraseña), algo que tenés (app TOTP, llave física) y algo que sos (biometría). No todos valen lo mismo: SMS es el más débil, y passkeys o llaves FIDO2 son resistentes a phishing porque están atadas al dominio.',
    },
    {
      topic: 'redes',
      question: '¿Qué es un puerto y cuáles conocés de memoria?',
      answer:
        'Es un número que identifica un servicio dentro de un host para TCP o UDP. Algunos clásicos: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 25 SMTP, 3389 RDP, 3306 MySQL, 5432 PostgreSQL, 6379 Redis. En seguridad importa porque cada puerto abierto es superficie de ataque, y servicios como bases de datos o RDP no deberían estar expuestos a internet.',
    },
    {
      topic: 'redes',
      question: '¿Qué hace un firewall y qué diferencia hay entre uno stateful y un WAF?',
      answer:
        'Un firewall filtra tráfico según reglas; uno stateful recuerda las conexiones establecidas y permite las respuestas sin reglas extra, trabajando en capas 3 y 4 (IPs, puertos, protocolos). Un WAF trabaja en capa 7, entiende HTTP y bloquea patrones de ataques web como SQLi o XSS. El WAF es una capa adicional, no un reemplazo de escribir código seguro.',
    },
    {
      topic: 'pentesting',
      question: '¿Para qué sirve `nmap`?',
      answer:
        'Es la herramienta clásica para descubrir hosts en una red y escanear sus puertos, detectando qué servicios y versiones corren y, con scripts NSE, algunas configuraciones débiles. Se usa en la etapa de reconocimiento y enumeración de un pentest y también del lado defensivo, para auditar qué se expone. Siempre se usa sobre sistemas propios o con autorización explícita por escrito.',
    },
    {
      topic: 'fundamentos',
      question: '¿Qué es el principio de mínimo privilegio?',
      answer:
        'Que cada usuario, servicio o proceso tenga solo los permisos que necesita para su tarea, y nada más, idealmente por el menor tiempo posible. Así, si una cuenta o componente se compromete, el daño queda acotado. Aplica a usuarios de base de datos, roles de IAM en cloud, contenedores que no corren como root y accesos de empleados.',
    },
    {
      topic: 'fundamentos',
      question: '¿Qué diferencia hay entre vulnerabilidad, amenaza y riesgo?',
      answer:
        'Una vulnerabilidad es una debilidad (un software sin parchear, una mala configuración). Una amenaza es algo o alguien que podría explotarla (un atacante, un malware, un empleado descuidado). El riesgo combina la probabilidad de que la amenaza explote la vulnerabilidad con el impacto que tendría, y es lo que se usa para priorizar.',
    },
    {
      topic: 'appsec',
      question: '¿Por qué no hay que commitear secretos en el repositorio?',
      answer:
        'Porque el historial de git es permanente y se copia a cada clon, fork y CI, y hay bots que escanean repos públicos buscando claves en minutos. Los secretos van en variables de entorno o en un gestor de secretos, con `.env` en el `.gitignore` y escaneo automático (por ejemplo, push protection o gitleaks). Si uno se filtra, borrar el commit no alcanza: hay que rotarlo.',
    },
  ],
  'semi-senior': [
    {
      topic: 'owasp',
      question: '¿Qué es SSRF y por qué es tan peligroso en cloud?',
      answer:
        'Server-Side Request Forgery es lograr que el servidor haga requests a destinos que elige el atacante, típicamente a través de una feature que descarga una URL. En cloud es grave porque permite llegar a servicios internos o al endpoint de metadata de la instancia, de donde se pueden sacar credenciales temporales. Se mitiga con allowlists de destinos, bloqueando rangos internos después de resolver DNS, IMDSv2 y aislando el egreso de red.',
    },
    {
      topic: 'owasp',
      question: '¿Qué es la deserialización insegura?',
      answer:
        'Pasa cuando una app deserializa datos no confiables con un formato que puede instanciar objetos arbitrarios, como `pickle` en Python, la serialización nativa de Java o `BinaryFormatter` en .NET. Un atacante puede armar un payload que, al reconstruirse, ejecute código o altere la lógica. La defensa es no deserializar input no confiable con esos formatos, preferir JSON con esquemas validados y firmar los datos si tienen que viajar.',
    },
    {
      topic: 'owasp',
      question: '¿Qué entra en security misconfiguration? Dá ejemplos.',
      answer:
        'Todo lo que queda inseguro por configuración y no por código: credenciales por defecto, modo debug o stack traces en producción, paneles de administración expuestos, listado de directorios, headers de seguridad faltantes, buckets públicos o puertos abiertos de más. Se ataca con configuraciones base endurecidas, infraestructura como código revisada y escaneos periódicos que detecten desvíos.',
    },
    {
      topic: 'auth',
      question: '¿Cuáles son los errores comunes al usar JWT?',
      answer:
        'Aceptar `alg: none` o no fijar el algoritmo esperado (lo que habilita confusiones entre HS256 y RS256), usar secretos débiles, no validar `exp`, `aud` e `iss`, y guardar datos sensibles en el payload, que solo está en Base64. Además, un JWT no se puede revocar fácilmente, así que conviene que dure poco y usar refresh tokens rotativos. Guardarlo en `localStorage` lo expone a XSS.',
    },
    {
      topic: 'auth',
      question: '¿Qué diferencia hay entre OAuth 2.0 y OpenID Connect?',
      answer:
        'OAuth 2.0 es un framework de autorización delegada: permite que una app acceda a recursos en nombre del usuario con un access token, sin conocer su contraseña. OpenID Connect es una capa encima que agrega autenticación, con un ID token (JWT) que dice quién es el usuario. Para apps web y móviles el flujo recomendado hoy es Authorization Code con PKCE; el flujo implícito está deprecado.',
    },
    {
      topic: 'auth',
      question: '¿Cómo manejarías las sesiones de forma segura en una app web?',
      answer:
        'Con un identificador de sesión aleatorio y largo en una cookie `HttpOnly`, `Secure` y `SameSite`, regenerado después del login para evitar session fixation. Las sesiones tienen que expirar por inactividad y por tiempo absoluto, invalidarse del lado del servidor en el logout y al cambiar la contraseña. Para acciones sensibles conviene pedir reautenticación.',
    },
    {
      topic: 'appsec',
      question: '¿Cómo gestionarías los secretos de una aplicación en producción?',
      answer:
        'En un gestor dedicado (AWS Secrets Manager, GCP Secret Manager, Vault) con acceso por identidad de la carga de trabajo y no con claves estáticas, con permisos mínimos y auditoría de quién lee qué. Idealmente se rotan automáticamente o se usan credenciales dinámicas de corta vida. En CI se prefiere OIDC federado contra el proveedor cloud en lugar de guardar access keys de larga duración.',
    },
    {
      topic: 'pentesting',
      question: '¿Cuáles son las etapas de un pentest?',
      answer:
        'Primero se acuerda el alcance y las reglas de enfrentamiento por escrito. Después vienen el reconocimiento (pasivo y activo), la enumeración de servicios y superficie, la explotación de vulnerabilidades para validar su impacto real, la post-explotación (qué más se puede alcanzar, persistencia, movimiento lateral, siempre dentro del alcance) y el reporte. El reporte es el entregable: hallazgos priorizados, evidencia, impacto y cómo remediar.',
    },
    {
      topic: 'pentesting',
      question: '¿Para qué usás Burp Suite en una prueba de seguridad web?',
      answer:
        'Es un proxy de intercepción que se pone entre el navegador y la app para ver y modificar cada request y response. Lo uso para mapear la aplicación, repetir y alterar requests con Repeater (por ejemplo, cambiar IDs para probar control de acceso), automatizar variaciones con Intruder y, en la versión Pro, escanear vulnerabilidades. Es especialmente útil para encontrar fallas de lógica que los escáneres no ven.',
    },
    {
      topic: 'pentesting',
      question: '¿Qué diferencia hay entre un escaneo de vulnerabilidades y un pentest?',
      answer:
        'El escaneo es automatizado, amplio y frecuente: compara versiones y configuraciones contra vulnerabilidades conocidas y genera muchos hallazgos, con falsos positivos. El pentest lo hace una persona, es más profundo y acotado: valida qué es realmente explotable, encadena fallas y encuentra problemas de lógica de negocio. Se complementan: escaneo continuo y pentest periódico o antes de releases importantes.',
    },
    {
      topic: 'linux',
      question: '¿Qué mirarías primero para detectar vectores de escalada de privilegios en Linux?',
      answer:
        'Permisos de `sudo` mal configurados (`sudo -l`), binarios con SUID que permiten ejecutar comandos, cron jobs que corren como root y ejecutan archivos escribibles, credenciales en archivos de configuración o en el historial, servicios y kernel desactualizados, y capabilities o grupos peligrosos como `docker`. Del lado defensivo, eso mismo es la checklist de hardening, y herramientas como LinPEAS lo automatizan en entornos autorizados.',
    },
    {
      topic: 'vulnerabilidades',
      question: '¿Qué es CVSS y cuáles son sus limitaciones?',
      answer:
        'El Common Vulnerability Scoring System puntúa la severidad técnica de una vulnerabilidad de 0 a 10 según vector de ataque, complejidad, privilegios requeridos, interacción del usuario e impacto en la tríada CIA; la versión actual es la 4.0. Su limitación es que mide severidad, no riesgo en tu contexto. Para priorizar conviene combinarlo con la exposición real del activo, EPSS (probabilidad de explotación) y el catálogo KEV de CISA.',
    },
    {
      topic: 'devsecops',
      question: '¿Qué diferencia hay entre SAST, DAST y SCA?',
      answer:
        'SAST analiza el código fuente sin ejecutarlo y encuentra patrones inseguros temprano, con bastantes falsos positivos (Semgrep, CodeQL). DAST ataca la aplicación corriendo desde afuera, como un usuario, y encuentra problemas de runtime y configuración (ZAP, Burp). SCA inventaría las dependencias de terceros y avisa de vulnerabilidades y licencias conocidas (Dependabot, Snyk). Se combinan en el pipeline porque cada uno ve cosas distintas.',
    },
    {
      topic: 'devsecops',
      question: '¿Qué es un ataque a la cadena de suministro de software y cómo te protegés?',
      answer:
        'Es comprometer algo de lo que tu software depende en lugar de atacarte directo: un paquete de npm o PyPI malicioso, typosquatting, una cuenta de maintainer tomada o un pipeline de build alterado. Te protegés fijando versiones con lockfiles, revisando dependencias nuevas, generando un SBOM, verificando firmas y procedencia (Sigstore, SLSA) y limitando permisos y scripts de instalación en CI.',
    },
    {
      topic: 'cloud',
      question: '¿Cómo aplicarías mínimo privilegio en IAM de un proveedor cloud?',
      answer:
        'Roles por carga de trabajo en lugar de usuarios con access keys, políticas con acciones y recursos específicos en vez de comodines, y nada de usar la cuenta root en el día a día. Uso herramientas como IAM Access Analyzer para ajustar permisos según lo que realmente se usa, separo cuentas o proyectos por entorno y exijo MFA para accesos humanos. Los permisos se revisan periódicamente porque tienden a acumularse.',
    },
    {
      topic: 'cloud',
      question:
        '¿Por qué siguen pasando filtraciones por buckets mal configurados y cómo las evitás?',
      answer:
        'Porque es fácil abrir un bucket "temporalmente" o heredar una política demasiado amplia, y nadie lo revisa. Se evitan activando el bloqueo de acceso público a nivel cuenta, definiendo buckets en infraestructura como código con revisión, cifrado por defecto y monitoreo con herramientas de CSPM que alerten ante cambios. Para compartir archivos se usan URLs prefirmadas con expiración corta.',
    },
    {
      topic: 'contenedores',
      question: '¿Qué buenas prácticas de seguridad aplicás en contenedores?',
      answer:
        'Imágenes base mínimas o distroless y actualizadas, escaneadas en CI, sin secretos horneados en las capas. El contenedor corre como usuario no root, con filesystem de solo lectura, sin capabilities extra y nunca en modo `--privileged` ni montando el socket de Docker. En Kubernetes se suman Pod Security Standards, network policies y límites de recursos.',
    },
    {
      topic: 'detección',
      question:
        '¿Qué tiene que registrar una aplicación para que seguridad pueda investigar incidentes?',
      answer:
        'Eventos de autenticación (logins exitosos y fallidos, MFA, resets), cambios de permisos, accesos a datos sensibles, acciones administrativas, errores de validación y de autorización, con timestamp, usuario, IP y un request ID. No se loguean contraseñas, tokens ni datos personales innecesarios. Los logs tienen que centralizarse, protegerse contra alteración y retenerse el tiempo que pida el negocio o la regulación.',
    },
    {
      topic: 'web',
      question: '¿Qué headers de seguridad HTTP configurarías en una app web?',
      answer:
        '`Content-Security-Policy` para limitar de dónde se cargan scripts y mitigar XSS, `Strict-Transport-Security` para forzar HTTPS, `X-Content-Type-Options: nosniff`, `Referrer-Policy` para no filtrar URLs y `frame-ancestors` en la CSP (o `X-Frame-Options`) contra clickjacking. `Permissions-Policy` restringe APIs del navegador como cámara o geolocalización. La CSP conviene desplegarla primero en modo report-only.',
    },
    {
      topic: 'appsec',
      question: '¿Cómo validarías el input de una API de forma segura?',
      answer:
        'Con validación del lado del servidor basada en allowlist: esquemas estrictos (tipos, formatos, longitudes, rangos) que rechazan lo que no está esperado, por ejemplo con Zod, Pydantic o JSON Schema. Hay que evitar mass assignment mapeando solo los campos permitidos y no confiar en nada que venga del cliente, incluidos headers y IDs. La validación no reemplaza el escapado de output ni las consultas parametrizadas.',
    },
  ],
  senior: [
    {
      topic: 'appsec',
      question: '¿Cómo diseñarías un secure SDLC para una organización de producto?',
      answer:
        'Integrando seguridad en cada etapa sin frenar al equipo: requisitos de seguridad y threat modeling en el diseño de features riesgosas, guías y librerías seguras por defecto, SAST, SCA y escaneo de secretos en cada PR, DAST e IaC scanning en el pipeline, y pentests en hitos clave. Sumo security champions en los equipos y métricas como tiempo de remediación por severidad. Me apoyo en marcos como OWASP SAMM o NIST SSDF para medir madurez.',
    },
    {
      topic: 'threat modeling',
      question: '¿Cómo hacés threat modeling y qué es STRIDE?',
      answer:
        'Respondo cuatro preguntas: qué estamos construyendo (diagrama de flujo de datos con límites de confianza), qué puede salir mal, qué vamos a hacer al respecto y si lo hicimos bien. STRIDE ayuda con la segunda: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service y Elevation of privilege, cada uno opuesto a una propiedad de seguridad. Lo hago temprano, en diseño, y lo actualizo cuando cambia la arquitectura.',
    },
    {
      topic: 'arquitectura',
      question: '¿Qué es zero trust y cómo lo implementarías de forma gradual?',
      answer:
        'Es dejar de confiar en algo por estar dentro de la red: cada acceso se verifica según identidad, estado del dispositivo y contexto, con mínimo privilegio y asumiendo que ya hay una brecha. Lo implementaría empezando por identidad fuerte (SSO y MFA resistente a phishing), inventario de dispositivos, reemplazando la VPN por acceso por aplicación, microsegmentación y mTLS entre servicios. Es un camino incremental, no un producto que se compra.',
    },
    {
      topic: 'red team',
      question: '¿Qué diferencia hay entre red team, blue team y purple team?',
      answer:
        'El red team emula adversarios reales con objetivos concretos para probar la capacidad de detección y respuesta, no solo para encontrar vulnerabilidades. El blue team defiende: monitorea, detecta, responde y endurece. El purple team es la colaboración entre ambos, ejercicio por ejercicio, usando MITRE ATT&CK para validar qué técnicas se detectan y cerrar brechas rápido. Para muchas organizaciones el purple teaming da más valor que un red team aislado.',
    },
    {
      topic: 'incidentes',
      question: '¿Cuáles son las fases de respuesta a incidentes?',
      answer:
        'Según NIST: preparación (playbooks, herramientas, roles, ejercicios), detección y análisis, contención, erradicación y recuperación, y actividades post-incidente con lecciones aprendidas. La versión 2024 de la guía la alinea con las funciones del CSF 2.0, pero la lógica es la misma. En la práctica lo crítico es preparar antes: saber quién decide, cómo se comunica y tener logs suficientes para investigar.',
    },
    {
      topic: 'incidentes',
      question: '¿Cómo liderarías un incidente de seguridad grave en curso?',
      answer:
        'Asumo o asigno un incident commander, separo roles (investigación técnica, comunicación, enlace con legal y negocio) y abro un canal y un registro cronológico de decisiones. Priorizo contener el daño preservando evidencia, por ejemplo aislando hosts en lugar de apagarlos, y evalúo obligaciones de notificación a reguladores y clientes con legal. Después hago un postmortem sin culpables con acciones concretas y responsables.',
    },
    {
      topic: 'forense',
      question: '¿Qué cuidados tenés al recolectar evidencia durante un incidente?',
      answer:
        'Respeto el orden de volatilidad: primero memoria, conexiones y procesos, después disco y logs. Trabajo sobre copias, calculo hashes para probar integridad y mantengo la cadena de custodia documentando quién tocó qué y cuándo. Evito acciones que alteren la evidencia, como reiniciar o correr herramientas que escriben en el disco afectado, y si puede terminar en un proceso legal involucro a legal y forenses externos temprano.',
    },
    {
      topic: 'detección',
      question: '¿Cómo diseñarías una estrategia de detección con un SIEM?',
      answer:
        'Empiezo por las amenazas relevantes para el negocio y las mapeo a técnicas de MITRE ATT&CK, después aseguro las fuentes de logs necesarias (identidad, endpoints con EDR, cloud, aplicaciones). Escribo detecciones como código, versionadas y testeadas, con playbooks de respuesta asociados, y mido falsos positivos y cobertura. El mayor riesgo es la fatiga de alertas: pocas reglas de alta calidad valen más que cientos ruidosas.',
    },
    {
      topic: 'riesgos',
      question: '¿Cómo gestionás el riesgo de seguridad y cómo lo comunicás a la dirección?',
      answer:
        'Mantengo un registro de riesgos con probabilidad, impacto en términos de negocio, dueño y tratamiento elegido: mitigar, transferir (seguros, contratos), evitar o aceptar formalmente. A la dirección le hablo de escenarios y pérdida potencial, no de CVEs, y presento opciones con costo y reducción de riesgo esperada. La aceptación de riesgo tiene que firmarla quien tiene la autoridad, con fecha de revisión.',
    },
    {
      topic: 'compliance',
      question: '¿Qué diferencia hay entre ISO 27001 y SOC 2?',
      answer:
        'ISO 27001 es un estándar internacional certificable que exige un sistema de gestión de seguridad de la información (SGSI): análisis de riesgos, controles del Anexo A y mejora continua. SOC 2 es un informe de auditoría de origen estadounidense sobre los Trust Services Criteria (seguridad, disponibilidad, integridad de procesamiento, confidencialidad y privacidad); el Tipo II evalúa la efectividad de los controles durante un período. Muchos controles se solapan, y elegir depende de lo que piden los clientes.',
    },
    {
      topic: 'compliance',
      question: '¿Cómo evitás que compliance se convierta en un ejercicio de checklist?',
      answer:
        'Partiendo de los riesgos reales y usando el marco como estructura, no como objetivo: un control que pasa la auditoría pero no reduce riesgo es costo puro. Automatizo la recolección de evidencia con controles verificables en el pipeline y en la infraestructura, y hago que los equipos entiendan por qué existe cada control. Estar certificado no significa estar seguro, y eso lo digo explícitamente.',
    },
    {
      topic: 'vulnerabilidades',
      question: '¿Cómo diseñarías un programa de gestión de vulnerabilidades?',
      answer:
        'Inventario de activos actualizado, escaneo continuo de infraestructura, contenedores, dependencias y código, y priorización por contexto (exposición, criticidad del activo, EPSS, KEV) en vez de solo CVSS. Defino SLAs de remediación por severidad, asigno dueños automáticamente y mido cumplimiento y backlog. Para lo que no se puede parchear rápido, hay controles compensatorios y excepciones con vencimiento.',
    },
    {
      topic: 'cloud',
      question: '¿Cómo encararías la seguridad de una organización con muchas cuentas cloud?',
      answer:
        'Con una landing zone: organización con cuentas separadas por entorno y equipo, guardrails centrales (políticas de organización o SCPs que impidan desactivar logs o abrir recursos públicos), identidad federada con SSO y logs de auditoría centralizados en una cuenta aislada. Encima uso CSPM para detectar desvíos y detección de amenazas nativa. Todo definido como código para que los controles sean consistentes.',
    },
    {
      topic: 'devsecops',
      question:
        '¿Cómo meterías herramientas de seguridad en el pipeline sin que los equipos las odien?',
      answer:
        'Arrancando en modo informativo, ajustando reglas para bajar falsos positivos y bloqueando solo lo de alta confianza y severidad, como secretos expuestos o vulnerabilidades críticas explotables. Los hallazgos tienen que aparecer donde el desarrollador trabaja (comentarios en el PR) con una sugerencia de fix. Mido el tiempo que agregan al pipeline y doy un camino claro para excepciones justificadas.',
    },
    {
      topic: 'devsecops',
      question: '¿Cómo asegurarías la cadena de build y despliegue?',
      answer:
        'Protejo las ramas con revisión obligatoria, uso runners efímeros, fijo las acciones de terceros por hash de commit y le doy al token de CI permisos mínimos. Las credenciales hacia cloud salen de OIDC con roles acotados por repo y rama. Firmo artefactos e imágenes, genero SBOM y attestations de procedencia según SLSA, y verifico firmas antes de desplegar.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo diseñarías la autorización de una plataforma multi-tenant?',
      answer:
        'El aislamiento entre tenants es el requisito número uno: cada consulta filtra por tenant de forma centralizada (por ejemplo, row-level security en Postgres o un repositorio que lo impone) y no depende de que cada desarrollador se acuerde. Para permisos uso RBAC o ABAC/ReBAC según la complejidad, con un motor de políticas desacoplado del código (OPA, Cedar, OpenFGA). Pruebo el aislamiento con tests automatizados que intentan acceder a datos de otro tenant.',
    },
    {
      topic: 'ai',
      question: '¿Qué riesgos nuevos introducen las aplicaciones con LLMs y agentes?',
      answer:
        'El principal es prompt injection, sobre todo indirecta: contenido de un documento, mail o web que el modelo lee y que lo manipula para filtrar datos o usar herramientas. También fuga de información sensible, output inseguro que se renderiza o ejecuta sin validar y agentes con permisos excesivos. Se mitiga tratando el output del modelo como no confiable, limitando herramientas y permisos, pidiendo confirmación humana para acciones sensibles y siguiendo el OWASP Top 10 para LLMs.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo construirías una cultura de seguridad en los equipos de desarrollo?',
      answer:
        'Haciendo que lo seguro sea lo fácil: plantillas, librerías y defaults seguros, más que reglas. Armo un programa de security champions, capacitaciones prácticas basadas en vulnerabilidades reales del propio código y postmortems sin culpables. Seguridad tiene que ser un socio que ayuda a lanzar, no un gate que dice que no al final.',
    },
    {
      topic: 'liderazgo',
      question:
        '¿Cómo priorizarías el trabajo de un equipo de seguridad chico en una empresa que crece rápido?',
      answer:
        'Primero lo que tiene mayor reducción de riesgo por esfuerzo: identidad (SSO, MFA resistente a phishing, offboarding), backups probados, parches de lo expuesto a internet, logging centralizado y gestión de secretos. Después escalo con automatización y con los equipos de producto en lugar de revisar todo a mano. Uso un marco como NIST CSF para mostrar madurez y justificar inversiones.',
    },
    {
      topic: 'pentesting',
      question: '¿Cómo gestionarías un programa de pentests externos o bug bounty?',
      answer:
        'Defino el alcance, las reglas y un safe harbor claro, publico una política de divulgación responsable (y `security.txt`) y elijo entre pentests periódicos para cobertura y bug bounty para variedad de enfoques. Lo clave es el proceso interno: triage rápido, reproducción, priorización, dueños de remediación y verificación del fix. Un bug bounty sin capacidad de respuesta solo genera frustración y riesgo reputacional.',
    },
  ],
};
