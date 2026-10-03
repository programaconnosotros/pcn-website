import type { InterviewGuide } from './types';

export const securityGuide: InterviewGuide = {
  track: 'security',
  summary:
    'Qué estudiar y cómo practicar para una entrevista de seguridad informática (AppSec, pentesting, SOC, cloud security y DevSecOps), de junior a senior.',
  sections: [
    {
      id: 'la-entrevista',
      title: 'Cómo es la entrevista y qué rol buscan',
      body: [
        'Seguridad informática no es un solo puesto sino una familia de roles con entrevistas bastante distintas. Un proceso típico tiene un screening con recruiting, una entrevista técnica conceptual (fundamentos, web, redes, cripto), un ejercicio práctico (revisar código, resolver un lab, analizar logs o modelar amenazas) y, para perfiles más altos, una charla de diseño o de casos reales y otra cultural. Antes de prepararte, averiguá qué rol es exactamente: no se estudia igual para AppSec que para un SOC.',
        'Los roles más comunes son: AppSec o product security (revisar código y diseños, acompañar a los equipos de desarrollo, manejar el programa de vulnerabilidades), pentester o red team (atacar sistemas con autorización y reportar hallazgos), SOC o blue team (monitorear, detectar y responder incidentes), cloud security (IAM, configuración segura de AWS, GCP o Azure, guardrails) y DevSecOps (meter seguridad en el pipeline: SAST, SCA, secretos, firmas, políticas). Muchas empresas chicas buscan una persona que cubra varios a la vez, así que conviene tener base en todos y profundidad en uno.',
        'Para junior se evalúa que entiendas los fundamentos y que tengas práctica real en entornos legales: CIA, autenticación contra autorización, OWASP Top 10, HTTP, redes básicas, Linux y algo de scripting. Para semi-senior esperan autonomía: encontrar vulnerabilidades en código o en una app, explicar impacto y mitigación con precisión, escribir un reporte útil y conocer las herramientas del rol. Para senior importan el criterio y el impacto en la organización: priorizar riesgos con recursos limitados, diseñar controles que los equipos adopten sin fricción, liderar incidentes, hablar con negocio y hacer crecer a otros.',
        'En todas las entrevistas de seguridad pesa mucho la ética. Te pueden preguntar qué harías si encontrás una vulnerabilidad en un sistema fuera de alcance, o cómo practicaste. La respuesta correcta siempre es la misma: solo se prueba con autorización explícita y dentro del alcance acordado, y practicás en labs y plataformas hechas para eso. Mencionar que probaste cosas en sistemas ajenos sin permiso te descarta, aunque haya sido con buena intención.',
      ],
      checklist: [
        {
          text: 'Distinguir los roles de seguridad y saber a cuál aplicás',
          explanation:
            'AppSec trabaja del lado del software: threat modeling de features, code review de seguridad, gestión de hallazgos de herramientas y formación de desarrolladores. El pentester o red team simula atacantes con autorización para encontrar fallas antes que un atacante real; el red team además prueba detección y respuesta con objetivos de más largo plazo. El SOC o blue team monitorea alertas, investiga y responde incidentes, y escribe detecciones. Cloud security y DevSecOps se enfocan en infraestructura como código, IAM, pipeline y supply chain. Leé la descripción del puesto buscando verbos: revisar código y acompañar equipos es AppSec, investigar alertas es SOC, y así preparás lo correcto.',
        },
        {
          text: 'Calibrar las respuestas al nivel junior, semi-senior o senior',
          explanation:
            'De un junior se espera que explique bien los conceptos, que haya practicado en labs y que reconozca vulnerabilidades típicas con ayuda. Un semi-senior encuentra y explota de forma controlada vulnerabilidades por su cuenta, explica impacto real y mitigación correcta, y escribe reportes que un desarrollador puede accionar. Un senior prioriza por riesgo de negocio, diseña programas y controles (por ejemplo un proceso de gestión de vulnerabilidades con SLAs), lidera incidentes y negocia con otros equipos. Si aplicás a senior y solo describís cómo funciona un XSS sin hablar de cómo evitar que vuelva a pasar en toda la organización, la respuesta queda corta.',
        },
        {
          text: 'Tener un portfolio de práctica legal que puedas mostrar',
          explanation:
            'Las empresas valoran evidencia concreta: labs completados en PortSwigger Web Security Academy, máquinas resueltas en Hack The Box o TryHackMe, CTFs como picoCTF, write-ups propios en un blog o repo, bugs reportados en programas de bug bounty con alcance público, o detecciones y herramientas que escribiste. Un write-up bien explicado (qué encontraste, por qué funcionaba, cómo se mitiga) dice más que una lista de certificaciones. No publiques write-ups de máquinas activas de plataformas que lo prohíben, porque eso también se lee como falta de ética. Elegí dos o tres trabajos y preparate para explicarlos en detalle.',
        },
        {
          text: 'Contar dos o tres casos reales con contexto, acción e impacto',
          explanation:
            'Prepará historias concretas: una vulnerabilidad que encontraste y cómo se corrigió, un incidente en el que participaste, un control que implementaste y cuánto redujo el riesgo, una herramienta que metiste en el pipeline y cómo manejaste los falsos positivos. Estructuralas con contexto, problema, qué hiciste vos, qué descartaste y resultado medible (por ejemplo, bajar de 300 a 20 hallazgos críticos abiertos en un trimestre). Cuidá la confidencialidad: no nombres clientes ni des detalles que permitan identificar sistemas vulnerables. El error común es quedarse en lo técnico sin explicar el impacto para el negocio.',
        },
        {
          text: 'Responder bien la pregunta de ética y alcance',
          explanation:
            'Es casi seguro que te pregunten algo como qué hacés si encontrás una falla en un sitio que no te contrató. La respuesta esperada: no seguís probando, no accedés a datos, documentás lo mínimo y lo reportás por el canal oficial (un `security.txt`, un programa de bug bounty o una política de divulgación) o no hacés nada si no hay forma segura de reportarlo. En un pentest, si algo queda fuera del alcance, frenás y consultás con el cliente antes de tocarlo. Mostrar que entendés que la autorización es lo que separa un pentest de un delito es requisito, no un extra.',
        },
      ],
    },
    {
      id: 'fundamentos',
      title: 'Fundamentos de seguridad',
      body: [
        'La base de todo es la tríada CIA: confidencialidad (solo quien debe puede ver la información), integridad (nadie puede modificarla sin autorización y sin que se note) y disponibilidad (el sistema funciona cuando se lo necesita). Cada vulnerabilidad o control se puede explicar en esos términos: un ransomware ataca disponibilidad e integridad, una fuga de datos ataca confidencialidad, un DDoS ataca disponibilidad. Muchas entrevistas arrancan pidiéndote que clasifiques un ataque o un control en la tríada.',
        'Separá bien los conceptos que se suelen mezclar. Identificación es decir quién sos, autenticación es probarlo y autorización es decidir qué podés hacer. Una amenaza es algo que podría causar daño (un actor o un evento), una vulnerabilidad es una debilidad que la amenaza puede aprovechar, un exploit es la técnica o el código concreto que la aprovecha, y el riesgo combina la probabilidad de que ocurra con el impacto si ocurre. Usar estos términos con precisión ya te diferencia en la entrevista.',
        'Los principios de diseño que más se preguntan son least privilege (cada usuario, servicio o proceso tiene solo los permisos que necesita), defense in depth (varias capas de control, para que si una falla otra frene el ataque), secure by default (la configuración inicial es la segura), fail securely (si algo falla, falla cerrado), separación de funciones y minimizar la superficie de ataque. Zero trust lleva esto a la red: no se confía en nada por estar adentro, cada request se autentica y autoriza.',
        'La gestión de riesgo es lo que conecta la técnica con el negocio. Frente a un riesgo se puede mitigar (aplicar controles), transferir (un seguro o un proveedor), aceptar (documentado y firmado por quien corresponde) o evitar (no hacer la actividad). En seguridad nunca hay riesgo cero, y en niveles semi-senior y senior te van a evaluar en cómo priorizás con recursos limitados.',
      ],
      checklist: [
        {
          text: 'Explicar la tríada CIA con ejemplos de ataques y controles',
          explanation:
            'Confidencialidad se protege con cifrado, control de acceso y clasificación de datos; la rompe una fuga de base de datos o un IDOR que deja ver datos ajenos. Integridad se protege con hashes, firmas digitales, controles de cambio y validación; la rompe alguien que modifica un precio en una request o altera logs. Disponibilidad se protege con redundancia, backups, rate limiting y protección DDoS; la rompe un ransomware o una saturación de recursos. Algunos modelos agregan autenticidad y no repudio (que alguien no pueda negar haber hecho algo, por ejemplo con firmas). En la entrevista, clasificar un ataque y proponer el control que corresponde a esa propiedad muestra pensamiento ordenado.',
        },
        {
          text: 'Diferenciar autenticación de autorización',
          explanation:
            'Autenticación (authn) responde quién sos: contraseña, MFA, certificado, passkey. Autorización (authz) responde qué podés hacer una vez autenticado: roles, permisos, ownership de recursos. Un login perfecto no sirve si después cualquier usuario autenticado puede ver el pedido de otro cambiando un id en la URL; eso es una falla de autorización. Los códigos HTTP lo reflejan: `401` significa no autenticado y `403` significa autenticado pero sin permiso. Modelos comunes de autorización son RBAC (por rol) y ABAC (por atributos como dueño, área u horario), y la regla de oro es validarla siempre en el servidor.',
        },
        {
          text: 'Distinguir amenaza, vulnerabilidad, exploit y riesgo',
          explanation:
            'La amenaza es el agente o evento que puede causar daño, por ejemplo un atacante externo buscando datos de tarjetas. La vulnerabilidad es la debilidad, por ejemplo una consulta SQL armada concatenando input. El exploit es la forma concreta de aprovecharla. El riesgo es la combinación de probabilidad e impacto: una vulnerabilidad grave en un sistema interno sin datos sensibles puede ser menor riesgo que una media en el checkout público. Por eso la severidad técnica (como CVSS) no alcanza para priorizar; hay que sumar contexto de negocio, exposición y si existe explotación activa.',
        },
        {
          text: 'Aplicar least privilege y defense in depth a un caso concreto',
          explanation:
            'Least privilege significa dar el mínimo permiso necesario y por el mínimo tiempo: el usuario de base de datos de la app no debería poder borrar tablas, un rol de IAM de un Lambda solo lee el bucket que usa, y los accesos de administrador son temporales y auditados. Defense in depth significa varias capas independientes: en una app web, validación de input, consultas parametrizadas, WAF, permisos mínimos en la base, cifrado de datos sensibles, monitoreo y backups. La idea es que una sola falla no alcance para comprometer todo. En la entrevista, cuando propongas un control, nombrá también la capa siguiente por si ese falla.',
        },
        {
          text: 'Explicar las opciones de tratamiento de riesgo',
          explanation:
            'Mitigar es reducir probabilidad o impacto con controles, como parchear o agregar MFA. Transferir es pasar parte del impacto a un tercero, como un ciberseguro o un proveedor con SLA. Aceptar es decidir conscientemente convivir con el riesgo, idealmente documentado, con un dueño de negocio que lo firma y una fecha de revisión. Evitar es dejar de hacer la actividad, por ejemplo no guardar números de tarjeta y usar un procesador de pagos. Un buen profesional de seguridad no bloquea todo: presenta el riesgo con claridad y deja que el negocio decida con información.',
        },
      ],
    },
    {
      id: 'criptografia',
      title: 'Criptografía para ingenieros',
      body: [
        'No te van a pedir que diseñes un algoritmo, pero sí que sepas usar la criptografía correctamente y reconocer errores. Lo primero es separar tres cosas que se confunden: encoding (Base64, URL encoding) solo cambia la representación y cualquiera lo revierte, no protege nada; hashing (SHA-256) es una función de un solo sentido que produce un resumen de tamaño fijo, útil para integridad; y encryption (AES, RSA) transforma datos para que solo quien tiene la clave pueda recuperarlos.',
        'La criptografía simétrica usa la misma clave para cifrar y descifrar: es rápida y se usa para datos en volumen (AES-GCM, ChaCha20-Poly1305). La asimétrica usa un par de claves pública y privada: sirve para intercambio de claves y firmas (RSA, curvas elípticas como ECDSA, Ed25519 y X25519), pero es lenta para muchos datos. En la práctica se combinan: TLS usa asimétrica para autenticar al servidor y acordar una clave, y simétrica para cifrar el tráfico.',
        'Las contraseñas no se cifran ni se hashean con un hash rápido: se guardan con un algoritmo lento y con salt diseñado para eso, como Argon2id, bcrypt o scrypt. Las firmas digitales prueban autenticidad e integridad (el firmante usa su clave privada y cualquiera verifica con la pública), y los MAC como HMAC hacen algo parecido con una clave compartida. Saber cuándo usar cada uno es lo que se evalúa.',
        'Los errores comunes son siempre los mismos: inventar criptografía propia, usar modos inseguros como AES-ECB, reutilizar un nonce o IV, usar MD5 o SHA-1 para seguridad, hardcodear claves en el código, generar valores aleatorios con un PRNG no criptográfico (`Math.random()` en vez de `crypto.randomBytes`), comparar tokens con una comparación que filtra tiempo y deshabilitar la validación de certificados para que algo funcione. La regla práctica es usar bibliotecas de alto nivel bien mantenidas y no tocar primitivas a mano.',
      ],
      checklist: [
        {
          text: 'Diferenciar encoding, hashing y encryption',
          explanation:
            'Encoding transforma datos a otro formato para transportarlos (Base64 para binario en texto, URL encoding para caracteres especiales) y es totalmente reversible sin secreto: un JWT está en Base64URL y cualquiera puede leer su contenido. Hashing aplica una función de un solo sentido: el mismo input da siempre el mismo output, no se puede revertir y un cambio mínimo cambia todo el resultado; sirve para verificar integridad o para indexar. Encryption es reversible solo con la clave correcta y protege confidencialidad. Si en una entrevista alguien dice que una contraseña está segura porque está en Base64, es la señal de alarma que esperan que detectes.',
        },
        {
          text: 'Explicar criptografía simétrica y asimétrica y cuándo usar cada una',
          explanation:
            'En la simétrica emisor y receptor comparten una clave; AES-256-GCM es el estándar actual y además de cifrar autentica (detecta modificaciones), por eso se llama AEAD. Su problema es cómo compartir la clave de forma segura. En la asimétrica cada parte tiene una clave pública que se distribuye y una privada que nunca sale; lo cifrado con la pública solo se descifra con la privada, y lo firmado con la privada se verifica con la pública. Como es más costosa, se usa para acordar claves (Diffie-Hellman, X25519) y firmar, y después se cifra el volumen con simétrica. Esto se llama esquema híbrido y es lo que hacen TLS, PGP y la mayoría de los protocolos.',
        },
        {
          text: 'Describir a alto nivel cómo funciona TLS',
          explanation:
            'TLS protege la comunicación con confidencialidad, integridad y autenticación del servidor. En el handshake de TLS 1.3 el cliente y el servidor acuerdan versión y algoritmos, hacen un intercambio de claves efímero (ECDHE) del que derivan claves simétricas, y el servidor presenta un certificado firmado por una autoridad certificante en la que el cliente confía, demostrando que tiene la clave privada correspondiente. El cliente valida la cadena de certificados, la vigencia y que el nombre coincida con el dominio. Las claves efímeras dan forward secrecy: aunque se filtre la clave privada del servidor más adelante, el tráfico pasado no se puede descifrar. HSTS obliga al navegador a usar siempre HTTPS, y TLS 1.0 y 1.1 deben estar deshabilitados.',
        },
        {
          text: 'Explicar cómo se guardan contraseñas correctamente',
          explanation:
            'Se guardan con una función de derivación lenta y con salt: Argon2id es la recomendación actual, bcrypt y scrypt siguen siendo aceptables. El salt es un valor aleatorio único por usuario que se guarda junto al hash e impide usar tablas precalculadas (rainbow tables) y que dos usuarios con la misma contraseña tengan el mismo hash. La lentitud configurable (factor de costo, memoria) hace que probar millones de contraseñas por fuerza bruta sea carísimo. SHA-256 solo, aunque tenga salt, es demasiado rápido y una GPU prueba miles de millones por segundo. Opcionalmente se agrega un pepper, un secreto guardado fuera de la base. Cifrar contraseñas es un error porque quien tenga la clave las recupera todas.',
        },
        {
          text: 'Explicar firmas digitales y HMAC',
          explanation:
            'Una firma digital se genera con la clave privada sobre el hash de un mensaje y se verifica con la clave pública; prueba que lo firmó quien tiene esa privada y que el contenido no cambió, y da no repudio. Se usa en certificados TLS, actualizaciones de software, commits firmados y JWT con `RS256` o `ES256`. Un HMAC usa una clave secreta compartida para producir un código que prueba integridad y autenticidad entre partes que comparten esa clave, por ejemplo para verificar webhooks o JWT con `HS256`. La diferencia clave es que con HMAC quien puede verificar también puede generar, y con firmas asimétricas no. Al verificar, la comparación debe ser de tiempo constante para no filtrar información por timing.',
        },
        {
          text: 'Reconocer errores criptográficos comunes en código',
          explanation:
            'En un code review buscá: algoritmos rotos o débiles (`MD5`, `SHA1`, `DES`, `RC4`) usados con fines de seguridad, AES en modo ECB (bloques iguales producen salida igual y se ven patrones), IV o nonce fijo o reutilizado (en GCM reutilizar un nonce con la misma clave rompe la confidencialidad y la autenticación), claves hardcodeadas o en el repo, `Math.random()` o `random` para tokens en vez de un CSPRNG, comparaciones de tokens con `==` en vez de una función de tiempo constante, y `verify=False` o `rejectUnauthorized: false` en clientes TLS. La recomendación general es usar bibliotecas de alto nivel como libsodium o las APIs recomendadas del lenguaje y gestionar claves en un KMS.',
        },
      ],
    },
    {
      id: 'owasp-top-10',
      title: 'Seguridad web y OWASP Top 10',
      body: [
        'El OWASP Top 10 es la lista de categorías de riesgo más relevantes en aplicaciones web y es el temario base de casi cualquier entrevista de AppSec o pentesting web. No alcanza con recitar los nombres: tenés que explicar qué es cada categoría, un ejemplo concreto, el impacto y cómo se previene en el código y en la arquitectura. La edición más reciente agrupa, entre otras, broken access control, fallas criptográficas, injection, diseño inseguro, misconfiguration, componentes vulnerables, fallas de autenticación, fallas de integridad de software y datos, fallas de logging y SSRF.',
        'Broken access control encabeza la lista hace años porque es fácil de introducir y difícil de detectar con herramientas automáticas: un IDOR (insecure direct object reference) aparece cuando la app usa un id del cliente para buscar un recurso y no verifica que pertenezca al usuario. Injection agrupa SQL injection, command injection y similares: el input termina interpretado como código. XSS (cross-site scripting) es una inyección en el navegador: un script del atacante se ejecuta en el contexto del sitio víctima.',
        'CSRF (cross-site request forgery) hace que el navegador de la víctima envíe una request autenticada que no quiso hacer, aprovechando que las cookies viajan solas. SSRF (server-side request forgery) hace que el servidor haga requests a donde el atacante quiere, típicamente a servicios internos o al endpoint de metadata de la nube. Misconfiguration incluye mensajes de error con stack traces, paneles de administración expuestos, buckets públicos, headers de seguridad faltantes y credenciales por defecto.',
        'Las fallas menos técnicas también pesan: componentes vulnerables (dependencias con CVEs conocidos), fallas de autenticación (sin rate limiting, contraseñas débiles, sesiones que no se invalidan) y fallas de logging y monitoreo (no registrar eventos de seguridad o no alertar sobre ellos, lo que hace que un ataque pase meses sin detectarse). Para practicar, PortSwigger Web Security Academy tiene teoría y labs gratuitos para cada una de estas categorías.',
      ],
      checklist: [
        {
          text: 'Explicar injection y cómo se previene',
          explanation:
            'Injection ocurre cuando datos no confiables se mezclan con código o comandos que un intérprete ejecuta: SQL, comandos de sistema, LDAP, consultas NoSQL o templates. El ejemplo clásico es armar `SELECT * FROM users WHERE email = ` concatenando lo que vino del formulario, lo que permite cambiar la lógica de la consulta y leer o modificar datos. La prevención principal es separar código de datos con consultas parametrizadas o prepared statements (los ORMs lo hacen por defecto, salvo cuando usás consultas crudas), evitar llamar a la shell con input del usuario y usar APIs que reciban argumentos como lista. Como capas extra: validación por allowlist, usuario de base con mínimos permisos y no mostrar errores de la base al usuario. Escapar a mano es frágil y no es la recomendación principal.',
        },
        {
          text: 'Explicar XSS, sus tipos y su prevención',
          explanation:
            'XSS permite ejecutar JavaScript del atacante en el navegador de la víctima dentro del origen del sitio, con lo que puede leer datos de la página, hacer acciones como el usuario o robar tokens accesibles desde JavaScript. Reflected viene en la request y se refleja en la respuesta, stored queda guardado (un comentario) y afecta a quien lo vea, y DOM-based ocurre en el cliente cuando el código pasa input a sinks peligrosos como `innerHTML` o `eval`. Se previene con output encoding según el contexto (HTML, atributo, JavaScript, URL), que los frameworks como React aplican por defecto salvo que uses `dangerouslySetInnerHTML`, sanitizando HTML con una librería como DOMPurify cuando hace falta permitirlo, y con una Content Security Policy estricta como defensa en profundidad. Las cookies de sesión con `HttpOnly` limitan el robo de sesión pero no evitan el XSS.',
        },
        {
          text: 'Explicar CSRF y por qué SameSite ayuda',
          explanation:
            'En un CSRF un sitio malicioso hace que el navegador de la víctima envíe una request a otro sitio donde está logueada, por ejemplo un formulario oculto que hace un `POST` para cambiar el email; como el navegador adjunta las cookies automáticamente, el servidor lo ve como una acción legítima. Se previene con tokens anti-CSRF (un valor impredecible por sesión que el sitio atacante no puede leer), con cookies `SameSite=Lax` o `Strict` que no se envían en requests cross-site, verificando los headers `Origin` o `Referer`, y no usando `GET` para acciones que cambian estado. Las APIs que se autentican con un header `Authorization` en vez de cookies no son vulnerables a CSRF clásico, aunque tienen otros riesgos como el almacenamiento del token.',
        },
        {
          text: 'Explicar SSRF y su impacto en la nube',
          explanation:
            'SSRF aparece cuando la app recibe una URL del usuario y la pide desde el servidor, por ejemplo para generar previews de links o importar una imagen. El atacante apunta esa URL a recursos internos que no están expuestos a internet: paneles internos, bases sin autenticación o el servicio de metadata de la instancia en la nube, que puede devolver credenciales temporales del rol. El impacto puede ser escalar de una función inocente a tomar control de la cuenta cloud. Se mitiga con allowlist de destinos permitidos, validando la IP resuelta y bloqueando rangos privados y link-local (cuidando los redirects y el DNS rebinding), aislando ese servicio en una red sin acceso interno, y en AWS exigiendo IMDSv2, que requiere un token y frena la mayoría de los SSRF simples.',
        },
        {
          text: 'Explicar broken access control e IDOR con un ejemplo',
          explanation:
            'Broken access control es cualquier caso en que un usuario puede hacer o ver algo que no debería: acceder a recursos de otro, a funciones de administrador o modificar campos que no le corresponden. Un IDOR típico es `GET /api/invoices/1043` devolviendo la factura aunque pertenezca a otro cliente, porque el backend busca por id y no verifica ownership. Variantes: escalar privilegios llamando endpoints de admin que solo están ocultos en la UI, o mass assignment enviando `role: admin` en el body. Se previene validando autorización en el servidor en cada request (filtrando por el usuario actual en la consulta), denegando por defecto, centralizando la lógica de permisos y testeando con dos usuarios distintos. Los ids aleatorios dificultan adivinar pero no reemplazan el chequeo.',
        },
        {
          text: 'Explicar misconfiguration, componentes vulnerables y fallas de logging',
          explanation:
            'Misconfiguration cubre todo lo que está mal configurado aunque el código sea correcto: debug activado en producción, stack traces en errores, listados de directorios, credenciales por defecto, CORS demasiado permisivo, buckets públicos y headers faltantes como `Content-Security-Policy` o `Strict-Transport-Security`; se previene con configuraciones endurecidas, infraestructura como código revisada y escaneos periódicos. Componentes vulnerables son dependencias con CVEs conocidos; se manejan con un inventario (SBOM), herramientas SCA, actualizaciones frecuentes y priorización por explotabilidad. Las fallas de logging y monitoreo hacen que no se detecten ataques: hay que registrar logins, fallos de autorización y cambios sensibles, sin datos sensibles en los logs, centralizarlos y alertar sobre patrones anómalos.',
        },
      ],
    },
    {
      id: 'autenticacion-y-sesiones',
      title: 'Autenticación, sesiones y tokens',
      body: [
        'Autenticación es una de las áreas donde más errores reales se cometen, por eso aparece en casi todas las entrevistas. Tenés que poder explicar el flujo completo: cómo se verifica la identidad, cómo se mantiene la sesión entre requests, cómo se cierra y qué controles evitan ataques de fuerza bruta, credential stuffing y robo de sesión.',
        'Las sesiones tradicionales guardan un id aleatorio en una cookie y el estado en el servidor. La cookie tiene que tener los flags correctos: `HttpOnly` (JavaScript no la lee), `Secure` (solo viaja por HTTPS), `SameSite` (controla el envío cross-site) y un alcance y expiración razonables. El id de sesión se regenera después del login para evitar session fixation, y el logout la invalida en el servidor, no solo en el navegador.',
        'Los JWT son tokens autocontenidos y firmados que el servidor verifica sin consultar estado. Son útiles entre servicios, pero traen problemas: no se pueden revocar fácilmente, su contenido es legible por cualquiera y hay errores clásicos de verificación. OAuth 2.0 es un framework de autorización delegada (una app accede a recursos en nombre del usuario) y OpenID Connect agrega autenticación encima con el ID token. Mezclar los dos conceptos es un error frecuente en entrevistas.',
        'MFA agrega un segundo factor: algo que sabés, algo que tenés o algo que sos. No todos los factores valen lo mismo: SMS es vulnerable a SIM swapping, TOTP es mejor pero phisheable, y las passkeys o llaves FIDO2 resisten phishing porque la firma está atada al dominio. Sumá rate limiting, bloqueo progresivo, chequeo de contraseñas filtradas y mensajes de error que no revelen si un usuario existe.',
      ],
      checklist: [
        {
          text: 'Explicar los flags de cookies y para qué sirve cada uno',
          explanation:
            '`HttpOnly` impide que JavaScript lea la cookie con `document.cookie`, lo que limita el robo de sesión vía XSS. `Secure` hace que solo se envíe por HTTPS, evitando que viaje en texto plano. `SameSite=Strict` no la envía en ninguna request iniciada desde otro sitio, `Lax` la envía solo en navegaciones de nivel superior con métodos seguros como `GET`, y `None` la envía siempre (requiere `Secure`); es una defensa importante contra CSRF. `Domain` y `Path` limitan su alcance, y `Max-Age` o `Expires` su duración. El prefijo `__Host-` obliga a que sea `Secure`, sin `Domain` y con `Path=/`, lo que evita que subdominios la sobrescriban.',
        },
        {
          text: 'Comparar sesiones con estado contra JWT',
          explanation:
            'Con sesiones con estado el servidor guarda la sesión (en memoria, Redis o base) y el cliente solo tiene un id opaco; revocar es borrar la sesión y es inmediato, a costa de consultar el store en cada request. Con JWT el estado viaja en el token firmado y el servidor solo verifica la firma, lo que escala bien entre servicios, pero revocar antes de la expiración requiere una denylist o tokens de vida corta con refresh tokens rotativos. Para una app web clásica, una cookie de sesión `HttpOnly` suele ser más simple y segura. Guardar JWT en `localStorage` los expone a cualquier XSS. Una buena respuesta elige según el contexto y no presenta a JWT como automáticamente mejor.',
        },
        {
          text: 'Identificar los errores típicos con JWT',
          explanation:
            'Los clásicos son: aceptar `alg: none` o no fijar el algoritmo esperado al verificar, lo que permite tokens sin firma; la confusión de algoritmos, donde un servidor que espera `RS256` acepta `HS256` y usa la clave pública como secreto HMAC; secretos HMAC débiles que se pueden romper por fuerza bruta offline; no validar `exp`, `iss` y `aud`; poner datos sensibles en el payload creyendo que está cifrado (solo está codificado en Base64URL); y confiar en headers como `kid` o `jku` sin restringirlos. La prevención es usar una librería mantenida, fijar el algoritmo y la clave esperados, validar todos los claims, usar expiraciones cortas y rotar claves.',
        },
        {
          text: 'Explicar OAuth 2.0 y OpenID Connect y su diferencia',
          explanation:
            'OAuth 2.0 resuelve autorización delegada: un usuario permite que una app acceda a ciertos recursos suyos en otro servicio sin darle la contraseña, y la app recibe un access token con scopes limitados. OpenID Connect es una capa encima que agrega autenticación: además entrega un ID token (un JWT) que dice quién es el usuario, que es lo que se usa para un login con Google. El flujo recomendado hoy para apps web, móviles y SPAs es authorization code con PKCE, que protege contra la intercepción del código; el flujo implicit está desaconsejado. Errores comunes: no validar el parámetro `state` (CSRF en el login), redirect URIs con comodines y usar un access token como prueba de identidad.',
        },
        {
          text: 'Comparar factores de MFA y su resistencia al phishing',
          explanation:
            'SMS es el más débil: se puede interceptar con SIM swapping y es phisheable. TOTP (apps como Google Authenticator) evita el SIM swapping pero un sitio falso puede pedir el código y usarlo en tiempo real. Las notificaciones push sufren MFA fatigue si el usuario aprueba por cansancio; el number matching lo mitiga. FIDO2, WebAuthn y passkeys son resistentes al phishing porque la autenticación es una firma criptográfica atada al dominio real, así que un sitio falso no puede usarla. En la entrevista mencioná también el proceso de recuperación de cuenta, porque un MFA fuerte con un reset débil por email anula todo.',
        },
        {
          text: 'Proteger el login contra fuerza bruta y credential stuffing',
          explanation:
            'La fuerza bruta prueba muchas contraseñas contra una cuenta; el credential stuffing prueba pares usuario y contraseña filtrados de otros sitios contra muchas cuentas, aprovechando la reutilización. Los controles son: rate limiting por cuenta y por IP, demoras progresivas o bloqueo temporal (cuidando no habilitar un DoS contra usuarios legítimos), CAPTCHA ante comportamiento sospechoso, chequear contraseñas contra listas de filtradas, MFA, y detección de anomalías como logins desde ubicaciones nuevas. Los mensajes de error deben ser genéricos (credenciales inválidas) para no permitir enumerar usuarios, y lo mismo aplica al recupero de contraseña. Todo intento fallido se loguea para detección.',
        },
      ],
    },
    {
      id: 'redes-y-sistemas',
      title: 'Redes y sistemas operativos',
      body: [
        'Aunque apliques a AppSec, te van a preguntar redes. Lo mínimo es el modelo TCP/IP: capa de enlace, IP (direccionamiento y ruteo), transporte (TCP orientado a conexión con handshake y retransmisiones, UDP sin conexión) y aplicación (HTTP, DNS, SSH, SMTP). Tenés que saber qué es un puerto, conocer los más comunes (22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 3389 RDP, 445 SMB, 5432 Postgres, 3306 MySQL) y explicar qué pasa cuando escribís una URL en el navegador.',
        'DNS es fuente de muchas preguntas: resolución recursiva, tipos de registros (A, AAAA, CNAME, MX, TXT, NS), TTL, y ataques como DNS spoofing, subdomain takeover (un CNAME apuntando a un recurso de la nube que ya no existe y que otro puede reclamar) o exfiltración por DNS. Firewalls filtran tráfico por reglas (stateless por paquete o stateful siguiendo conexiones), los WAF filtran a nivel HTTP, y la segmentación de red limita el movimiento lateral si un equipo es comprometido.',
        'nmap aparece casi siempre a nivel conceptual: es una herramienta para descubrir hosts, puertos abiertos, servicios y versiones en redes donde tenés autorización. Te pueden preguntar la diferencia entre un SYN scan y un connect scan, qué significa que un puerto esté open, closed o filtered, y por qué el escaneo de versiones ayuda a cruzar con vulnerabilidades conocidas. Escanear redes ajenas sin permiso puede ser ilegal, y en la entrevista conviene decirlo.',
        'En sistemas, Linux es obligatorio: permisos de lectura, escritura y ejecución para dueño, grupo y otros, el bit SUID, sudo y su configuración, procesos y servicios, y dónde están los logs. La escalada de privilegios es pasar de un usuario limitado a root o administrador, y conceptualmente siempre se apoya en una mala configuración o en software vulnerable; entender esas causas es lo que permite prevenirlas. En Windows conviene conocer lo básico de Active Directory, cuentas de servicio y por qué los admins locales compartidos son un riesgo.',
      ],
      checklist: [
        {
          text: 'Explicar qué pasa desde que escribís una URL hasta que ves la página',
          explanation:
            'El navegador parsea la URL, resuelve el dominio con DNS (cache local, resolver recursivo, servidores raíz, TLD y autoritativo) y obtiene una IP. Abre una conexión TCP con el handshake SYN, SYN-ACK, ACK al puerto 443, negocia TLS validando el certificado del servidor y envía la request HTTP con método, path, headers y cookies. El servidor, posiblemente detrás de un CDN, load balancer o WAF, procesa la request y responde con status, headers y body; el navegador renderiza, ejecuta JavaScript y pide recursos adicionales. En una entrevista de seguridad sumá en cada paso qué puede salir mal: DNS spoofing, certificados inválidos, headers de seguridad faltantes o contenido mixto.',
        },
        {
          text: 'Diferenciar TCP de UDP y conocer los puertos comunes',
          explanation:
            'TCP establece conexión con un three-way handshake, garantiza orden y entrega con retransmisiones y control de flujo; lo usan HTTP, SSH y bases de datos. UDP envía datagramas sin conexión ni garantías, con menos overhead; lo usan DNS, VoIP, streaming y QUIC (base de HTTP/3). Los puertos comunes que tenés que reconocer: 21 FTP, 22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS, 445 SMB, 3306 MySQL, 3389 RDP, 5432 Postgres, 6379 Redis y 27017 MongoDB. Encontrar una base de datos o un Redis expuesto a internet es un hallazgo grave habitual, porque muchas veces no tienen autenticación.',
        },
        {
          text: 'Explicar DNS, sus registros y los ataques más comunes',
          explanation:
            'DNS traduce nombres a IPs mediante una jerarquía de servidores, con caching según el TTL de cada registro. A y AAAA apuntan a IPv4 e IPv6, CNAME es un alias, MX indica servidores de correo, TXT guarda texto como registros SPF y DMARC para autenticar email, y NS delega una zona. Ataques: cache poisoning o spoofing (respuestas falsas que redirigen tráfico; DNSSEC agrega firmas), subdomain takeover cuando un CNAME apunta a un servicio dado de baja que un atacante puede registrar, y DNS tunneling para exfiltrar datos por consultas. Desde defensa, monitorear consultas DNS es una fuente muy útil para detectar malware.',
        },
        {
          text: 'Describir qué hace nmap y cómo interpretar sus resultados',
          explanation:
            'nmap descubre hosts activos, puertos abiertos, los servicios que corren y sus versiones, y a veces el sistema operativo. Un SYN scan envía el primer paquete del handshake sin completarlo y es rápido y menos ruidoso; un connect scan completa la conexión y no requiere privilegios. Un puerto open tiene un servicio escuchando, closed responde pero sin servicio, y filtered no responde porque un firewall descarta los paquetes. La detección de versiones permite cruzar con CVEs conocidos para priorizar. Se usa solo sobre activos propios o dentro de un alcance autorizado, y desde defensa sirve para auditar la superficie expuesta de tu propia organización.',
        },
        {
          text: 'Explicar permisos de Linux, SUID y sudo',
          explanation:
            'Cada archivo tiene dueño, grupo y permisos de lectura, escritura y ejecución para dueño, grupo y otros, que se ven con `ls -l` y se cambian con `chmod` y `chown`; en directorios, ejecutar significa poder entrar. El bit SUID hace que un ejecutable corra con los privilegios de su dueño en vez de los del usuario que lo lanza, por eso un binario SUID de root mal elegido es un riesgo. sudo permite ejecutar comandos como otro usuario según reglas en `/etc/sudoers`; reglas demasiado amplias o que permiten binarios capaces de abrir una shell equivalen a dar root. Las buenas prácticas son least privilege, auditar binarios SUID, no correr servicios como root y revisar sudoers.',
        },
        {
          text: 'Explicar conceptualmente la escalada de privilegios y cómo prevenirla',
          explanation:
            'La escalada de privilegios puede ser vertical (de usuario común a root o administrador) u horizontal (a otro usuario del mismo nivel). Sus causas típicas son configuraciones débiles: reglas de sudo amplias, binarios SUID innecesarios, tareas programadas que ejecutan scripts que cualquiera puede editar, servicios corriendo como root, credenciales en archivos o variables de entorno, permisos laxos en archivos sensibles y kernel o software sin parchear. Por eso la prevención es casi siempre higiene: parchear, minimizar privilegios, auditar permisos con herramientas de hardening como los benchmarks CIS, separar cuentas y monitorear cambios. En la entrevista explicá las causas y los controles, no una receta de explotación.',
        },
      ],
    },
    {
      id: 'metodologia-ofensiva',
      title: 'Metodología ofensiva y reporte',
      body: [
        'Un pentest es un ejercicio autorizado, con alcance, tiempos y reglas de enfrentamiento acordados por escrito. Antes de tocar nada se firma un contrato o carta de autorización que dice qué sistemas, qué técnicas están permitidas (por ejemplo si se puede hacer ingeniería social o pruebas de denegación de servicio), en qué horarios y a quién avisar si algo se rompe o si se encuentra evidencia de un compromiso previo. Sin esa autorización, las mismas acciones son un delito.',
        'La metodología sigue fases: reconocimiento (información pública sobre el objetivo: dominios, subdominios, tecnologías, empleados), enumeración (servicios, endpoints, parámetros, usuarios y versiones), explotación (demostrar de forma controlada que una vulnerabilidad es real y qué impacto tiene), post-explotación (qué se puede alcanzar desde ahí: datos, movimiento lateral, persistencia, siempre dentro del alcance) y reporte. Marcos como PTES, OWASP WSTG y MITRE ATT&CK ayudan a no olvidar nada y a hablar el mismo idioma que el cliente.',
        'Burp Suite es la herramienta central del pentesting web: un proxy que intercepta el tráfico entre navegador y servidor y permite ver, modificar y repetir requests. Sus módulos más usados son Proxy, Repeater (reenviar una request modificada), Intruder (variaciones automatizadas) y el scanner de la versión paga. OWASP ZAP es la alternativa libre. Lo que se evalúa no es saber los menús de memoria sino entender HTTP lo suficiente como para ver qué parámetro cambiar y por qué.',
        'El entregable es el reporte, y muchas veces es lo único que el cliente lee. Tiene un resumen ejecutivo para la gerencia y hallazgos técnicos con descripción, evidencia, pasos de reproducción, impacto, severidad (CVSS más contexto) y recomendaciones accionables. Fuera de un contrato, la divulgación responsable (coordinated disclosure) es el camino: reportar al dueño por un canal oficial, darle un plazo razonable para corregir y publicar solo después.',
      ],
      checklist: [
        {
          text: 'Describir las fases de un pentest y qué se hace en cada una',
          explanation:
            'Preparación: alcance, reglas de enfrentamiento, contactos y autorización firmada. Reconocimiento: recolectar información, primero pasiva (DNS, certificados públicos, repos, buscadores, redes profesionales) y después activa. Enumeración: identificar servicios, versiones, endpoints, roles y puntos de entrada. Explotación: confirmar vulnerabilidades de forma controlada, priorizando no dañar disponibilidad ni datos. Post-explotación: evaluar el impacto real, qué datos o sistemas se alcanzan, siempre dentro del alcance y documentando todo. Reporte y limpieza: entregar hallazgos, eliminar cuentas, archivos o cambios que se hayan hecho, y hacer el retest cuando el cliente corrige.',
        },
        {
          text: 'Explicar el rol del alcance, la autorización y la ética',
          explanation:
            'El alcance define qué activos (IPs, dominios, aplicaciones, entornos) y qué técnicas están permitidos, y las reglas de enfrentamiento definen horarios, contactos de emergencia y qué hacer ante hallazgos críticos. Todo eso tiene que estar por escrito y firmado por alguien con autoridad sobre los sistemas; un empleado sin autoridad no puede autorizar pruebas sobre un proveedor cloud o un tercero. Si encontrás algo fuera de alcance, frenás y consultás. Los datos a los que accedés durante la prueba se tratan como confidenciales y se borran al terminar. La diferencia entre un pentester y un atacante no es la técnica sino la autorización y el propósito.',
        },
        {
          text: 'Explicar para qué se usa Burp Suite',
          explanation:
            'Burp Suite actúa como proxy entre el navegador y la aplicación: interceptás cada request y respuesta, las inspeccionás y las modificás antes de que lleguen. Con Repeater reenviás una request cambiando parámetros, headers o cookies para ver cómo responde el servidor, por ejemplo probar si un endpoint valida ownership cambiando un id. Intruder automatiza variaciones de un parámetro y el historial del proxy te da un mapa de toda la aplicación. Extensiones como Autorize ayudan a probar control de acceso con dos usuarios. Desde el lado defensivo, entender estas herramientas ayuda a ver que cualquier validación hecha solo en el frontend se saltea trivialmente.',
        },
        {
          text: 'Calcular e interpretar CVSS sin depender solo del número',
          explanation:
            'CVSS (Common Vulnerability Scoring System) da un puntaje de 0 a 10 a partir de métricas: vector de ataque (red, adyacente, local, físico), complejidad, privilegios requeridos, interacción del usuario, alcance e impacto en confidencialidad, integridad y disponibilidad. La versión 4.0 refina estas métricas y separa mejor la severidad base de las métricas de amenaza y entorno. El puntaje base mide severidad técnica, no riesgo: hay que sumar contexto como exposición a internet, datos afectados, controles compensatorios y si hay explotación activa (por ejemplo, si figura en el catálogo KEV de CISA o tiene un puntaje EPSS alto). Una buena respuesta justifica la severidad final con ese contexto.',
        },
        {
          text: 'Escribir un hallazgo de reporte claro y accionable',
          explanation:
            'Cada hallazgo tiene título descriptivo (IDOR en `/api/invoices` permite ver facturas de otros clientes), severidad justificada, activos afectados, descripción de la causa, pasos para reproducirlo con evidencia (requests, respuestas y capturas con datos sensibles tapados), impacto concreto para el negocio y recomendación específica (verificar que la factura pertenezca al usuario autenticado en la consulta, no solo validar en el frontend), más referencias como CWE u OWASP. El resumen ejecutivo explica en lenguaje no técnico el riesgo general y las prioridades. Un buen hallazgo lo puede corregir un desarrollador sin preguntarte nada; uno malo dice vulnerabilidad de seguridad sin detalle.',
        },
        {
          text: 'Explicar la divulgación responsable',
          explanation:
            'La divulgación responsable o coordinada es reportar una vulnerabilidad al dueño del sistema de forma privada, darle un plazo razonable para corregirla (90 días es una referencia común) y recién después publicarla, idealmente de forma coordinada. Para reportar se busca un `security.txt` en el dominio, una política de divulgación o un programa de bug bounty, que además define qué pruebas están permitidas y da protección legal. Se reporta con la mínima evidencia necesaria, sin acceder a más datos de los imprescindibles, sin exigir pago y sin amenazas. Las empresas, del otro lado, deberían tener un canal claro y responder rápido; preguntar si la empresa tiene una política así es una buena pregunta para la entrevista.',
        },
      ],
    },
    {
      id: 'defensa-y-respuesta',
      title: 'Detección, SIEM y respuesta a incidentes',
      body: [
        'El lado defensivo parte de una premisa: tarde o temprano algo va a fallar, y lo que importa es detectarlo rápido y responder bien. Eso requiere visibilidad (logs de las fuentes correctas), detección (reglas y análisis que conviertan eventos en alertas útiles) y respuesta (un proceso practicado). Las métricas más mencionadas son MTTD y MTTR, el tiempo medio para detectar y para responder o recuperar.',
        'Las fuentes de logs típicas son autenticación e identidad, endpoints (EDR), red y firewall, DNS, proxies, cloud (por ejemplo CloudTrail en AWS) y logs de aplicación con eventos de seguridad. Un SIEM centraliza esos logs, los normaliza y permite correlacionarlos y escribir reglas de detección; un SOAR automatiza acciones de respuesta. El problema clásico es la fatiga de alertas: demasiados falsos positivos hacen que el equipo ignore las alertas reales, así que afinar detecciones es parte central del trabajo.',
        'MITRE ATT&CK es un catálogo de tácticas y técnicas usadas por atacantes reales, y se usa para mapear cobertura de detección y hablar un idioma común. Para escribir detecciones se suele usar el lenguaje del SIEM o formatos portables como Sigma. La caza de amenazas (threat hunting) es buscar proactivamente indicios de compromiso a partir de hipótesis, en vez de esperar alertas.',
        'La respuesta a incidentes sigue fases como las de NIST: preparación, detección y análisis, contención, erradicación y recuperación, y lecciones aprendidas. La forense digital básica consiste en preservar evidencia antes de que se pierda (orden de volatilidad, cadena de custodia, imágenes de disco y memoria) y reconstruir la línea de tiempo de lo ocurrido. En la entrevista suelen darte un escenario, como una cuenta que inicia sesión desde un país inusual y descarga muchos archivos, y evalúan cómo razonás.',
      ],
      checklist: [
        {
          text: 'Describir las fases de respuesta a incidentes',
          explanation:
            'Según NIST: preparación (playbooks, contactos, herramientas, logs habilitados y simulacros), detección y análisis (confirmar que es un incidente real, determinar alcance, severidad y sistemas afectados), contención (frenar el daño: aislar un host, deshabilitar una cuenta, bloquear una IP; primero corto plazo y después una solución más estable), erradicación (eliminar la causa: malware, accesos persistentes, la vulnerabilidad explotada), recuperación (restaurar servicios, monitorear que no vuelva) y lecciones aprendidas (un postmortem sin culpas con acciones concretas). Una buena respuesta menciona también la comunicación: a quién se avisa, cuándo intervienen legales y si hay obligación de notificar a usuarios o reguladores.',
        },
        {
          text: 'Explicar qué es un SIEM y cómo se escribe una buena detección',
          explanation:
            'Un SIEM recibe logs de muchas fuentes, los normaliza en campos comunes, los guarda para búsqueda e investigación y ejecuta reglas que generan alertas. Una buena detección parte de un comportamiento concreto del atacante (por ejemplo, muchos logins fallidos seguidos de uno exitoso desde la misma IP, o creación de claves de acceso fuera de horario), está mapeada a una técnica de ATT&CK, se prueba contra datos reales para medir falsos positivos, y viene con contexto y un playbook para quien la recibe. Detectar comportamientos es más robusto que detectar indicadores puntuales como una IP o un hash, que el atacante cambia fácil. Mantener las detecciones versionadas y testeadas como código es una práctica cada vez más común.',
        },
        {
          text: 'Analizar un escenario de alerta y decidir los próximos pasos',
          explanation:
            'Ante una alerta, primero validá que sea real: revisá contexto del usuario o host, si el comportamiento es habitual y si hay eventos relacionados. Después determiná alcance: qué cuentas, hosts y datos están involucrados y desde cuándo, armando una línea de tiempo. Con eso decidís contención proporcional, por ejemplo revocar sesiones y forzar cambio de credenciales de una cuenta comprometida, o aislar de la red un equipo con malware, preservando evidencia antes de borrar nada. Escalás según la severidad definida y documentás cada acción con hora. En la entrevista importa que razones en voz alta, hagas preguntas y no saltes a apagar todo sin entender el alcance.',
        },
        {
          text: 'Explicar conceptos básicos de forense digital',
          explanation:
            'El objetivo es preservar y analizar evidencia de forma que sea confiable. El orden de volatilidad dice qué recolectar primero: memoria RAM y conexiones activas se pierden al apagar, el disco persiste, los logs remotos duran más. Se trabaja sobre copias (imágenes forenses) verificadas con hashes, nunca sobre el original, y se mantiene una cadena de custodia que registra quién tuvo la evidencia y cuándo, por si termina en un proceso legal. El análisis reconstruye una línea de tiempo a partir de logs, artefactos del sistema y metadatos de archivos. Un error común es reiniciar o reinstalar un equipo comprometido antes de capturar evidencia.',
        },
        {
          text: 'Usar MITRE ATT&CK para hablar de cobertura de detección',
          explanation:
            'ATT&CK organiza el comportamiento de atacantes en tácticas (el objetivo, como acceso inicial, persistencia, escalada de privilegios, movimiento lateral, exfiltración) y técnicas (cómo lo logran, como phishing o abuso de cuentas válidas). Sirve para mapear qué técnicas cubren tus detecciones y dónde tenés huecos, para priorizar según las técnicas que usan los grupos que afectan a tu industria y para describir incidentes con un vocabulario común. En la entrevista podés usarlo para estructurar una respuesta: ante un escenario, ir táctica por táctica pensando qué logs verías y qué control lo frenaría. Conocer los nombres de memoria no hace falta; entender la estructura sí.',
        },
      ],
    },
    {
      id: 'cloud-y-devsecops',
      title: 'Cloud, contenedores y DevSecOps',
      body: [
        'En la nube rige el modelo de responsabilidad compartida: el proveedor asegura la infraestructura física y los servicios base, y vos sos responsable de cómo los configurás, de las identidades, los datos y tu código. La mayoría de los incidentes en cloud no vienen de fallas del proveedor sino de configuraciones propias: buckets públicos, credenciales filtradas, roles con permisos excesivos o servicios expuestos sin necesidad.',
        'IAM es el centro de la seguridad cloud. Se piensa en identidades (usuarios, roles, cuentas de servicio), políticas que dicen qué acciones sobre qué recursos están permitidas y condiciones. Las buenas prácticas son least privilege, credenciales temporales en vez de claves de larga duración, MFA para humanos, roles para workloads y federación para el CI (por ejemplo OIDC desde GitHub Actions en vez de guardar claves). Los secretos se guardan en un gestor como AWS Secrets Manager, Vault o el equivalente de cada nube, nunca en el repo ni en la imagen.',
        'DevSecOps es integrar seguridad en el ciclo de desarrollo sin frenarlo: threat modeling en el diseño, SAST (análisis estático del código), SCA (análisis de dependencias), detección de secretos, escaneo de infraestructura como código y de imágenes, y DAST (análisis dinámico contra la app corriendo). La clave es la experiencia del desarrollador: resultados en el pull request, pocos falsos positivos y bloqueos solo para lo realmente grave.',
        'La supply chain se volvió un tema central: dependencias maliciosas o comprometidas, typosquatting, pipelines de CI con permisos excesivos y artefactos alterados. Las respuestas incluyen SBOM (inventario de componentes), lockfiles y versiones fijadas, firma de artefactos e imágenes (Sigstore, cosign), provenance según SLSA y revisar permisos de los workflows. En contenedores se suma el hardening: imágenes mínimas, usuario no root, sin secretos en capas, filesystem de solo lectura y políticas en Kubernetes.',
      ],
      checklist: [
        {
          text: 'Explicar el modelo de responsabilidad compartida',
          explanation:
            'El proveedor cloud es responsable de la seguridad de la nube: centros de datos, hardware, red física, hipervisor y la operación de los servicios administrados. El cliente es responsable de la seguridad en la nube: identidades y permisos, configuración de recursos, datos y su cifrado, red virtual, sistema operativo en instancias propias y la aplicación. La línea se mueve según el servicio: en IaaS manejás más (parches del sistema operativo), en serverless o SaaS menos, pero IAM y datos siempre son tuyos. Ejemplos de incidentes del lado del cliente: un bucket público, una clave de acceso en un repo público o un security group abierto a todo internet.',
        },
        {
          text: 'Aplicar buenas prácticas de IAM y gestión de secretos',
          explanation:
            'Usá roles con credenciales temporales en vez de usuarios con claves de larga duración, MFA obligatorio para humanos y SSO centralizado. Escribí políticas con acciones y recursos específicos en vez de comodines como `*`, revisalas con herramientas de análisis de acceso y eliminá permisos no usados. Separá entornos en cuentas o proyectos distintos y protegé la cuenta raíz. Para el CI, usá federación OIDC para obtener credenciales temporales sin guardar claves. Los secretos van en un gestor con rotación, acceso auditado y permisos mínimos; si un secreto llega a un repo, se considera comprometido y se rota, porque borrarlo del historial no alcanza.',
        },
        {
          text: 'Diferenciar SAST, DAST, SCA e IAST y dónde va cada uno en el pipeline',
          explanation:
            'SAST analiza el código fuente sin ejecutarlo buscando patrones vulnerables (por ejemplo input que llega a una consulta SQL); corre temprano, en el PR, pero tiene falsos positivos y no ve problemas de configuración o de lógica de negocio. SCA analiza dependencias contra bases de vulnerabilidades conocidas y licencias; corre en cada build y con alertas continuas. DAST ataca la aplicación corriendo desde afuera, como un usuario, y encuentra problemas de runtime y configuración; corre contra un entorno de staging. IAST instrumenta la app durante tests y combina ambos enfoques. Ninguno reemplaza el code review manual ni el pentest, y el valor real está en triar y priorizar resultados, no en acumularlos.',
        },
        {
          text: 'Explicar riesgos de supply chain y qué es un SBOM',
          explanation:
            'Los riesgos de supply chain incluyen dependencias con vulnerabilidades, paquetes maliciosos publicados con nombres parecidos a otros (typosquatting) o confusión de dependencias entre registros internos y públicos, mantenedores comprometidos que publican versiones con malware y pipelines de CI comprometidos que alteran el artefacto. Un SBOM (Software Bill of Materials, en formatos como CycloneDX o SPDX) es el inventario de todos los componentes y versiones de un software, y permite responder rápido si estás afectado cuando sale un CVE crítico. Las mitigaciones son lockfiles, versiones fijadas, actualizaciones revisadas, registros con allowlist, firmar artefactos con Sigstore, verificar provenance según SLSA y dar permisos mínimos a los tokens del CI.',
        },
        {
          text: 'Endurecer contenedores e imágenes',
          explanation:
            'Usá imágenes base mínimas (distroless, Alpine o slim) para reducir superficie y vulnerabilidades, con builds multi-stage para no incluir compiladores ni herramientas en la imagen final. Corré el proceso como usuario no root, con filesystem de solo lectura, sin capabilities extra de Linux y sin modo privilegiado. Nunca copies secretos a la imagen: quedan en las capas aunque los borres después; se inyectan en runtime. Escaneá imágenes en el pipeline, fijá versiones por digest y firmalas. En Kubernetes sumá Pod Security Standards, network policies que restringen tráfico entre pods, RBAC mínimo y service accounts sin permisos innecesarios.',
        },
        {
          text: 'Integrar seguridad al pipeline sin frenar al equipo',
          explanation:
            'La idea es dar feedback temprano y accionable: resultados de SAST, SCA y secretos como comentarios en el PR, con explicación y sugerencia de fix. Bloqueá el merge solo ante hallazgos de alta confianza y severidad (un secreto expuesto, una dependencia crítica con exploit conocido), y para el resto definí SLAs de corrección según severidad. Medí y bajá los falsos positivos afinando reglas, porque si las herramientas hacen ruido los equipos aprenden a ignorarlas. Complementalo con guardrails (plantillas seguras, librerías aprobadas, políticas como código) que hacen que el camino fácil sea el seguro. Un senior habla de adopción y métricas, no solo de herramientas.',
        },
      ],
    },
    {
      id: 'ejercicios-practicos',
      title: 'Ejercicios prácticos y cómo practicar',
      body: [
        'Los ejercicios más comunes son cuatro. Code review de seguridad: te dan un fragmento de código o un PR (un endpoint, un login, un upload de archivos) y tenés que encontrar vulnerabilidades, explicar impacto y proponer fixes. Lab o mini CTF: una aplicación o máquina preparada donde tenés que encontrar una o varias fallas en un tiempo limitado, a veces compartiendo pantalla. Threat modeling: te describen una feature o arquitectura y tenés que identificar amenazas y controles. Reporte: escribir el hallazgo de algo que encontraste, a veces como take-home.',
        'En el code review, recorré el código siguiendo el flujo de datos: dónde entra input del usuario (sources) y dónde se usa de forma sensible (sinks como consultas, comandos, HTML, rutas de archivos, redirecciones, requests salientes). Revisá además autenticación y autorización en cada endpoint, manejo de errores, secretos, criptografía y lógica de negocio. Priorizá lo grave primero y proponé un fix concreto para cada hallazgo, no solo el nombre de la vulnerabilidad.',
        'En threat modeling se usa mucho STRIDE: Spoofing (suplantar identidad), Tampering (alterar datos), Repudiation (negar haber hecho algo), Information disclosure (exponer información), Denial of service (afectar disponibilidad) y Elevation of privilege (obtener más permisos). Se dibuja un diagrama de flujo de datos con actores, procesos, almacenes y límites de confianza, y en cada flujo que cruza un límite se recorren las categorías. Las cuatro preguntas guía son: qué estamos construyendo, qué puede salir mal, qué vamos a hacer al respecto y si lo hicimos bien.',
        'Para practicar usá solo plataformas legales: PortSwigger Web Security Academy (la mejor para seguridad web, gratuita y con labs por tema), OWASP Juice Shop (una app vulnerable a propósito que corrés localmente), TryHackMe (rutas guiadas, ideal para empezar), Hack The Box (máquinas y labs más desafiantes) y picoCTF (CTF educativo). Escribí write-ups de lo que resolvés explicando la causa y la mitigación, porque eso entrena justo lo que te van a pedir en la entrevista.',
      ],
      checklist: [
        {
          text: 'Hacer un code review de seguridad siguiendo el flujo de datos',
          explanation:
            'Empezá identificando los puntos de entrada: parámetros, body, headers, cookies, archivos subidos, webhooks, datos de terceros. Seguí cada dato hasta donde se usa: si llega a una consulta SQL sin parametrizar es injection, a HTML sin encoding es XSS, a una ruta de archivo es path traversal, a un comando es command injection, a una URL que pide el servidor es SSRF, a un redirect es open redirect. En paralelo revisá que cada endpoint verifique autenticación y autorización sobre el recurso, que no haya secretos hardcodeados, que la criptografía sea correcta y que los errores no filtren información. Para cada hallazgo decí línea, impacto, severidad y fix concreto.',
        },
        {
          text: 'Encarar un lab o mini CTF en la entrevista',
          explanation:
            'Empezá mapeando la aplicación antes de atacar: qué funciones tiene, qué roles, qué requests hace, qué tecnologías usa. Pensá en voz alta formulando hipótesis (este parámetro parece un id, voy a ver si valida ownership) y probalas de a una, priorizando las vulnerabilidades más probables según la funcionalidad. Tomá notas de lo que probaste para no repetir y para el reporte. Si te trabás, decilo y explicá qué probarías después; el entrevistador evalúa el método más que si llegás a la flag. Al terminar, explicá cómo se corrige cada cosa que encontraste, porque eso diferencia a alguien que entiende de alguien que siguió una receta.',
        },
        {
          text: 'Hacer threat modeling de una feature con STRIDE',
          explanation:
            'Tomemos un upload de foto de perfil. Primero el diagrama: usuario, frontend, API, storage de objetos, procesador de imágenes, y los límites de confianza entre internet y la API y entre la API y el storage. Después STRIDE por flujo: Spoofing, subir en nombre de otro usuario (control: autenticación y autorización sobre el perfil); Tampering, reemplazar archivos ajenos (rutas generadas por el servidor); Repudiation, sin registro de quién subió qué (logs de auditoría); Information disclosure, metadatos EXIF con ubicación o buckets públicos (limpiar metadatos, URLs firmadas); Denial of service, archivos enormes (límites de tamaño y rate limiting); Elevation of privilege, un archivo malicioso que explota el procesador (validar tipo real, procesar aislado). Cerrá priorizando qué implementar primero.',
        },
        {
          text: 'Escribir un reporte de hallazgo bajo tiempo limitado',
          explanation:
            'Usá una plantilla fija para no olvidar nada: título que describa vulnerabilidad, ubicación e impacto; severidad con justificación (CVSS más contexto); descripción de la causa raíz; pasos de reproducción numerados con requests de ejemplo; evidencia con datos sensibles ocultos; impacto en términos de negocio (qué datos, cuántos usuarios, qué podría hacer un atacante); recomendación concreta y, si podés, un ejemplo de código corregido; y referencias (CWE, OWASP). Escribilo para dos lectores: el gerente que lee el resumen y el desarrollador que lo corrige. Evitá el tono alarmista y las afirmaciones que no probaste.',
        },
        {
          text: 'Armar un plan de práctica con plataformas legales',
          explanation:
            'Si vas a AppSec o pentesting web, completá los temas de PortSwigger Web Security Academy en orden (SQL injection, autenticación, control de acceso, XSS, CSRF, SSRF) y practicá con OWASP Juice Shop corriendo en tu máquina con Docker. Para infraestructura y fundamentos, las rutas de TryHackMe son un buen arranque, y después Hack The Box para máquinas más realistas. picoCTF sirve para cripto, forense y reversing básicos. Para blue team, buscá labs de análisis de logs y de respuesta a incidentes en esas mismas plataformas. Dedicá tiempo fijo por semana, escribí un write-up de cada ejercicio con causa y mitigación, y publicalo solo donde las reglas de la plataforma lo permiten.',
        },
      ],
    },
    {
      id: 'dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta y estructurá: en seguridad se evalúa cómo razonás sobre el riesgo. Ante una pregunta abierta, aclarás el contexto (qué datos, quiénes son los usuarios, qué está expuesto), explicás la vulnerabilidad o el concepto, su impacto y la mitigación, y cerrás con la capa extra de defensa. Esa estructura de concepto, impacto y mitigación funciona para casi cualquier pregunta técnica.',
        'Para preguntas de comportamiento usá STAR: situación, tarea, acción y resultado. Prepará historias sobre una vulnerabilidad que encontraste y cómo lograste que se corrigiera, un desacuerdo con un equipo que no quería priorizar un fix, un incidente en el que participaste, un control que implementaste sin frenar a desarrollo y un error tuyo del que aprendiste. En seguridad la parte humana pesa mucho: convencer y acompañar a otros equipos es la mitad del trabajo.',
        'Preguntas para la empresa: cómo está organizado el equipo de seguridad y a quién reporta, qué relación tiene con desarrollo e infraestructura, qué herramientas usan y cuánto está automatizado, cómo gestionan vulnerabilidades y con qué SLAs, si tienen programa de bug bounty o política de divulgación, cómo fue el último incidente relevante y qué cambió después, y cuánto tiempo hay para formación y certificaciones.',
        'Checklist final: repasá OWASP Top 10 con ejemplo y mitigación de cada uno, los flags de cookies, los errores con JWT, cómo se guardan contraseñas, las fases de un pentest y de respuesta a incidentes, y STRIDE. Si hay ejercicio práctico, dejá listo tu entorno (Burp Suite o ZAP configurado con el navegador, un editor, una terminal) y probá compartir pantalla. Tené a mano dos write-ups propios para mostrar.',
      ],
      checklist: [
        {
          text: 'Responder con la estructura concepto, impacto y mitigación',
          explanation:
            'Ante una pregunta como qué es SSRF, no te quedes en la definición: explicá el concepto en una o dos frases, da un ejemplo concreto (una función de preview de links que el servidor pide), describí el impacto realista (acceso a servicios internos o credenciales de la nube) y cerrá con la mitigación principal y una capa extra (allowlist de destinos y, como defensa en profundidad, IMDSv2 y aislamiento de red). Si hay contexto ambiguo, preguntá antes: el impacto de una misma falla cambia mucho según los datos y la exposición. Esta estructura muestra que pensás como alguien que protege un sistema real y no como alguien que memorizó una lista.',
        },
        {
          text: 'Admitir lo que no sabés sin perder la respuesta',
          explanation:
            'Seguridad es un campo enorme y nadie sabe todo; los entrevistadores lo saben y muchas veces preguntan hasta encontrar tu límite. Cuando llegues a algo que no conocés, decilo en una frase, conectalo con lo que sí sabés (no trabajé con ese SIEM, pero escribí detecciones en otro y el razonamiento es el mismo) y explicá cómo lo resolverías o investigarías. Si es una pregunta de razonamiento, pensala en voz alta usando los fundamentos: CIA, least privilege, dónde hay un límite de confianza. Inventar una respuesta es especialmente grave en seguridad, porque se lee como alguien que podría dar falsas garantías sobre un riesgo real.',
        },
        {
          text: 'Tener cuatro historias STAR preparadas',
          explanation:
            'STAR es Situación (contexto breve), Tarea (tu responsabilidad), Acción (lo que hiciste vos, en primera persona) y Resultado (con números si podés). Para seguridad prepará: una vulnerabilidad importante que encontraste y cómo se corrigió, un conflicto con un equipo que no quería priorizar un fix y cómo lo resolviste con datos de riesgo, un incidente o alerta que investigaste, y una mejora de proceso o herramienta que adoptó la organización. Cuidá la confidencialidad: contá el tipo de sistema y el tipo de falla, no nombres ni detalles explotables. Practicalas en voz alta en dos minutos cada una y cerrá siempre con el resultado y lo que aprendiste.',
        },
        {
          text: 'Llevar preguntas sobre el equipo y la madurez de seguridad',
          explanation:
            'Preparate tres o cuatro preguntas que te ayuden a evaluar el puesto. Organización: cuántas personas hay en seguridad, a quién reportan y si el rol es más de construir o de auditar. Proceso: cómo se gestionan las vulnerabilidades, con qué SLAs y quién decide aceptar un riesgo. Herramientas y automatización: qué hay en el pipeline, qué SIEM o EDR usan, cuánto trabajo manual queda. Cultura: cómo reacciona desarrollo cuando seguridad reporta algo y qué pasó en el último incidente. Las respuestas te dicen si vas a ser un aliado de los equipos o un cuello de botella, y muestran que pensás en el programa de seguridad completo.',
        },
        {
          text: 'Preparar el entorno y el material para los ejercicios',
          explanation:
            'Si la entrevista incluye un lab o un code review, dejá instalado y probado Burp Suite Community u OWASP ZAP con el certificado del proxy cargado en el navegador, un editor cómodo y una terminal con las herramientas básicas. Probá antes compartir pantalla y subí el tamaño de fuente. Tené abierta una plantilla de reporte de hallazgo para no arrancar desde cero si te piden escribir uno. Llevá dos write-ups propios de plataformas legales que puedas explicar en detalle. Y antes de tocar cualquier sistema que te den, confirmá el alcance en voz alta: es un gesto chico que demuestra exactamente la ética que están evaluando.',
        },
      ],
    },
  ],
};
