import type { InterviewQuestion, Seniority } from './types';

export const devopsQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'cultura',
      question: '¿Qué es DevOps? ¿Es un rol, una herramienta o una cultura?',
      answer:
        'DevOps es ante todo una cultura y un conjunto de prácticas para que desarrollo y operaciones trabajen juntos y entreguen software de forma frecuente y confiable. Se apoya en automatización (CI/CD, infraestructura como código), medición y feedback rápido. Aunque existe el puesto "DevOps engineer", la idea original es romper el silo entre "el que escribe el código" y "el que lo opera", no crear un tercer silo.',
    },
    {
      topic: 'ci/cd',
      question:
        '¿Qué diferencia hay entre integración continua, entrega continua y despliegue continuo?',
      answer:
        'Integración continua (CI) es integrar cambios a la rama principal varias veces por día, con un pipeline que compila y corre los tests en cada push. Entrega continua (continuous delivery) es que cada cambio que pasa el pipeline quede listo para producción, pero el deploy lo dispara una persona. Despliegue continuo (continuous deployment) va un paso más: todo lo que pasa el pipeline se despliega a producción automáticamente, sin intervención manual.',
    },
    {
      topic: 'ci/cd',
      question: '¿Qué etapas tiene un pipeline de CI/CD típico?',
      answer:
        'Suele arrancar con checkout e instalación de dependencias (con caché), después lint y chequeo de tipos, tests unitarios y de integración, build del artefacto (por ejemplo una imagen Docker etiquetada con el SHA del commit), escaneo de seguridad, y publicación en un registry. Luego viene el deploy a staging, tests de humo o E2E, y la promoción a producción, automática o con aprobación. La regla es fallar rápido: lo barato y rápido va primero.',
    },
    {
      topic: 'iac',
      question: '¿Qué es infraestructura como código y qué ventajas tiene?',
      answer:
        'Es definir servidores, redes, bases de datos y permisos en archivos versionados (Terraform, Pulumi, CloudFormation) en vez de crearlos a mano desde una consola. Las ventajas son reproducibilidad (podés recrear un entorno idéntico), revisión por pull request, historial de cambios, menos drift entre entornos y la posibilidad de automatizarlo en un pipeline. El "click-ops" no deja registro y es imposible de auditar o repetir con exactitud.',
    },
    {
      topic: 'cloud',
      question: '¿Qué diferencia hay entre IaaS, PaaS, SaaS y serverless?',
      answer:
        'En IaaS alquilás infraestructura básica (máquinas virtuales, discos, redes, como EC2) y vos gestionás el sistema operativo para arriba. En PaaS el proveedor gestiona el runtime y vos solo subís tu app (Heroku, App Service, Cloud Run). SaaS es software terminado que consumís (Gmail, Slack). Serverless (Lambda, Cloud Functions) es ejecutar funciones o contenedores que escalan a cero y se cobran por invocación, sin pensar en servidores.',
    },
    {
      topic: 'despliegues',
      question: '¿Qué es un rollback y por qué es importante poder hacerlo rápido?',
      answer:
        'Es volver a la versión anterior que funcionaba cuando un deploy rompe algo. Poder hacerlo en minutos reduce el impacto de un error y da confianza para desplegar seguido. Se facilita con artefactos inmutables versionados (re-desplegar la imagen anterior), migraciones de base de datos compatibles hacia atrás y deploys automatizados; si el rollback requiere pasos manuales improvisados, en un incidente va a salir mal.',
    },
    {
      topic: 'ci/cd',
      question: '¿Qué es un artefacto de build y por qué se construye una sola vez?',
      answer:
        'Es el resultado empaquetado del build: una imagen Docker, un `.jar`, un bundle o un binario. La buena práctica es construirlo una vez, etiquetarlo (por ejemplo con el SHA del commit) y promover ese mismo artefacto por staging y producción, cambiando solo la configuración. Si recompilás para cada entorno, lo que probaste en staging no es exactamente lo que llega a producción.',
    },
    {
      topic: 'arquitectura',
      question: '¿Qué es la metodología twelve-factor y qué factores te parecen más importantes?',
      answer:
        'Son doce principios para construir aplicaciones fáciles de desplegar y escalar en la nube. Los más citados son: configuración en variables de entorno (no en el código), procesos stateless que guardan estado en servicios externos, dependencias declaradas explícitamente, logs como flujo a stdout, paridad entre desarrollo y producción, y servicios externos como recursos intercambiables. Muchos de esos principios son la base de cómo funcionan los contenedores y Kubernetes.',
    },
    {
      topic: 'seguridad',
      question: '¿Dónde no deberías guardar secretos como contraseñas o API keys, y dónde sí?',
      answer:
        'Nunca en el repositorio (ni en un `.env` commiteado), en imágenes Docker ni en logs. Lo correcto es un gestor de secretos (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager, HashiCorp Vault) o los secretos cifrados del sistema de CI, inyectados en runtime como variables de entorno o archivos montados. Si un secreto se filtró en git, hay que rotarlo: borrarlo del historial no alcanza porque ya pudo ser copiado.',
    },
    {
      topic: 'confiabilidad',
      question: '¿Qué diferencia hay entre escalar vertical y horizontalmente?',
      answer:
        'Escalar verticalmente es darle más CPU o memoria a la misma máquina: es simple, pero tiene un techo y suele requerir reinicio. Escalar horizontalmente es agregar más instancias detrás de un balanceador: no tiene techo práctico y da tolerancia a fallas, pero exige que la app sea stateless (sesiones y archivos fuera de la instancia). En la nube se combina con autoscaling según CPU, requests o largo de colas.',
    },
    {
      topic: 'sre',
      question: '¿Qué es un SLA, un SLO y un SLI?',
      answer:
        'Un SLI (indicador) es una métrica medida del servicio, como el porcentaje de requests exitosas o la latencia p99. Un SLO (objetivo) es la meta interna sobre ese SLI, por ejemplo "99.9% de requests exitosas en 30 días". Un SLA (acuerdo) es un compromiso contractual con clientes que tiene consecuencias, como créditos si no se cumple; por eso el SLA suele ser más laxo que el SLO interno.',
    },
    {
      topic: 'incidentes',
      question: '¿Qué hacés si un deploy que hiciste rompe producción?',
      answer:
        'Primero mitigar, no investigar: avisar en el canal del equipo y hacer rollback o apagar el feature flag para frenar el impacto. Después confirmar con métricas que el servicio se recuperó. Recién ahí buscar la causa raíz con calma, y al final participar del postmortem para que no se repita (un test que faltaba, un canary, una alerta). Esconderlo o intentar un fix rápido directo en producción suele empeorar las cosas.',
    },
    {
      topic: 'ci/cd',
      question: '¿Qué es una estrategia de branching como trunk-based development?',
      answer:
        'En trunk-based development todos integran cambios chicos a la rama principal (`main`) con mucha frecuencia, usando ramas de vida corta (horas o un par de días) y feature flags para esconder lo que no está terminado. Se opone a GitFlow, con ramas `develop`, `release` y `hotfix` de larga vida que generan merges grandes y conflictivos. Trunk-based es la que mejor se asocia a buen desempeño en las métricas DORA.',
    },
    {
      topic: 'cultura',
      question: '¿Qué significa "you build it, you run it"?',
      answer:
        'Es el principio, popularizado por Amazon, de que el equipo que desarrolla un servicio también lo opera en producción, incluida la guardia. Así los desarrolladores sienten el costo de un código difícil de operar y priorizan logs, métricas, alertas y estabilidad. Requiere que la organización les dé herramientas de plataforma y autonomía para desplegar, no solo la responsabilidad.',
    },
    {
      topic: 'iac',
      question: '¿Qué es la idempotencia y por qué importa en automatización?',
      answer:
        'Una operación idempotente produce el mismo resultado si la ejecutás una o varias veces. En infraestructura como código y configuración (Terraform, Ansible) es clave: aplicar dos veces la misma definición no debe crear dos servidores, sino detectar que ya existe y no hacer nada. Eso permite reintentar pipelines fallidos y correr la automatización periódicamente sin miedo.',
    },
  ],
  'semi-senior': [
    {
      topic: 'despliegues',
      question: '¿Qué diferencia hay entre un deploy rolling, blue/green y canary?',
      answer:
        'Rolling reemplaza las instancias de a poco: es barato, pero conviven dos versiones y el rollback es otro rolling. Blue/green levanta un entorno completo nuevo (green) junto al actual (blue) y cambia todo el tráfico de golpe, con rollback instantáneo volviendo al blue, a costa de duplicar recursos. Canary manda un porcentaje chico del tráfico (1%, 5%) a la versión nueva, compara métricas contra la estable y avanza o aborta según el resultado, idealmente de forma automática.',
    },
    {
      topic: 'despliegues',
      question: '¿Para qué sirven los feature flags y qué riesgos tienen?',
      answer:
        'Separan el deploy del release: el código llega a producción apagado y se activa cuando quieras, para un porcentaje de usuarios, un segmento o un cliente puntual, y se apaga en segundos si falla. Permiten trunk-based development, pruebas A/B y kill switches. El riesgo es la deuda: flags viejos que nadie borra multiplican caminos de código y combinaciones sin probar, así que conviene darles dueño y fecha de vencimiento.',
    },
    {
      topic: 'cultura',
      question: '¿Qué son las métricas DORA y cómo las medirías?',
      answer:
        'Son las métricas del programa DevOps Research and Assessment para medir el desempeño de entrega: frecuencia de deploy, lead time de cambios (del commit a producción), tasa de fallas de cambios y tiempo de recuperación de un deploy fallido; las versiones recientes suman la tasa de rework. Se miden con datos del sistema de CI/CD, git y la herramienta de incidentes. Sirven para ver tendencias del equipo, no para comparar personas ni como objetivo en sí mismo.',
    },
    {
      topic: 'cultura',
      question: '¿Qué es el modelo CALMS?',
      answer:
        'Es un marco para evaluar la adopción de DevOps: Culture (colaboración y responsabilidad compartida), Automation (CI/CD, IaC, tests), Lean (lotes chicos, eliminar desperdicio, flujo), Measurement (medir todo, desde DORA hasta métricas de negocio) y Sharing (compartir conocimiento, herramientas y postmortems entre equipos). Sirve para mostrar que comprar herramientas sin cambiar cultura ni medir no es hacer DevOps.',
    },
    {
      topic: 'iac',
      question: '¿Qué es GitOps y en qué se diferencia de un pipeline push tradicional?',
      answer:
        'En GitOps, un repositorio git es la fuente de verdad del estado deseado del sistema, y un agente dentro del cluster (Argo CD, Flux) compara continuamente ese estado con el real y lo reconcilia (modelo pull). En un pipeline push tradicional, el CI tiene credenciales del cluster y ejecuta `kubectl apply`. GitOps da auditoría por git, rollback con `git revert`, detección de drift y evita darle credenciales de producción al CI.',
    },
    {
      topic: 'iac',
      question: '¿Qué es la infraestructura inmutable?',
      answer:
        'Es no modificar servidores en ejecución: para cambiar algo, construís una imagen nueva (AMI, imagen Docker) y reemplazás las instancias, en vez de entrar por SSH a parchear. Elimina el drift de configuración y los "snowflake servers" que nadie sabe reproducir, y hace el rollback trivial. Exige que el estado (datos, sesiones, archivos) viva fuera de las instancias.',
    },
    {
      topic: 'sre',
      question: '¿Qué es un error budget y cómo se usa?',
      answer:
        'Es el margen de falla que permite el SLO: con un SLO de 99.9% mensual tenés 0.1%, unos 43 minutos de indisponibilidad al mes. Mientras quede presupuesto, el equipo puede desplegar y experimentar; si se agota, se acuerda priorizar confiabilidad (frenar features riesgosas, invertir en estabilidad) hasta recuperarlo. Convierte la discusión "velocidad contra estabilidad" en una decisión basada en datos acordada de antemano.',
    },
    {
      topic: 'sre',
      question: '¿Qué es el toil y cómo lo reducís?',
      answer:
        'Según Google SRE, toil es trabajo operativo manual, repetitivo, automatizable, reactivo y sin valor duradero, que crece linealmente con el servicio: reiniciar un proceso a mano, rotar certificados manualmente, dar accesos por ticket. Se reduce midiéndolo, automatizando primero lo más frecuente, haciendo self-service y arreglando las causas de fondo. La guía de SRE es mantenerlo por debajo de la mitad del tiempo del equipo.',
    },
    {
      topic: 'incidentes',
      question: '¿Cómo se gestiona un incidente y qué roles hay?',
      answer:
        'Se declara el incidente con una severidad, se abre un canal dedicado y se asignan roles: incident commander (coordina y decide, no debuggea), responsables técnicos de la mitigación, y alguien de comunicación que actualiza a stakeholders y la status page. La prioridad es mitigar (rollback, failover, escalar) antes que encontrar la causa raíz. Todo se registra en un timeline que después alimenta el postmortem.',
    },
    {
      topic: 'incidentes',
      question: '¿Qué es un postmortem blameless y qué debería incluir?',
      answer:
        'Es un análisis después de un incidente que se enfoca en el sistema y los procesos, no en culpar personas: si alguien pudo romper producción con un comando, el problema es que el sistema lo permitió. Incluye resumen, impacto (usuarios, duración, dinero), timeline, causas raíz y factores contribuyentes, qué funcionó y qué no, y acciones con dueño y fecha. Sin culpa, la gente cuenta lo que pasó de verdad y la organización aprende.',
    },
    {
      topic: 'confiabilidad',
      question:
        '¿Qué son RPO y RTO y cómo influyen en la estrategia de recuperación ante desastres?',
      answer:
        'RPO (recovery point objective) es cuántos datos podés permitirte perder, medido en tiempo: un RPO de 1 hora exige backups o replicación al menos cada hora. RTO (recovery time objective) es cuánto podés tardar en volver a estar operativo. Cuanto más chicos, más cara la estrategia: de backup y restore (horas), a pilot light y warm standby, hasta multi-región activo-activo (casi cero). Y los backups no probados con restores reales no cuentan.',
    },
    {
      topic: 'seguridad',
      question: '¿Qué es DevSecOps y qué controles de seguridad pondrías en un pipeline?',
      answer:
        'Es integrar la seguridad en todo el ciclo en vez de dejarla para el final ("shift left"). En el pipeline: detección de secretos (gitleaks), SAST sobre el código, análisis de dependencias (SCA, Dependabot o Renovate), escaneo de imágenes de contenedor (Trivy, Grype), análisis de la IaC (Checkov, tfsec) y DAST sobre staging. Clave: que los hallazgos críticos bloqueen el merge y que no haya tanto ruido que el equipo los ignore.',
    },
    {
      topic: 'seguridad',
      question: '¿Cómo autenticarías un pipeline de CI contra la nube sin guardar access keys?',
      answer:
        'Con federación OIDC: el proveedor de CI (GitHub Actions, GitLab) emite un token firmado de corta vida que identifica al repo, rama o entorno, y el proveedor cloud lo intercambia por credenciales temporales de un rol con permisos mínimos (en AWS con `AssumeRoleWithWebIdentity`, en GCP con Workload Identity Federation, en Azure con federated credentials). Así no hay claves de larga vida que filtrar ni rotar, y podés restringir el rol a la rama `main`.',
    },
    {
      topic: 'costos',
      question: '¿Qué harías para bajar la factura de la nube?',
      answer:
        'Primero visibilidad: etiquetas por equipo y servicio, y reportes de costos para saber qué gasta. Después lo de mayor impacto: apagar recursos ociosos (entornos de desarrollo de noche, discos y IPs huérfanas), right-sizing de instancias según uso real, autoscaling, reservas o savings plans para la carga estable y instancias spot para lo tolerante a interrupciones. También revisar transferencia de datos y retención de logs, que suelen ser costos ocultos.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo manejás migraciones de base de datos sin downtime?',
      answer:
        'Con el patrón expand and contract: primero un cambio compatible hacia atrás (agregar la columna nueva, nullable), después desplegar código que escribe en ambas y lee de la nueva, migrar los datos existentes en lotes, y recién cuando nada usa la vieja, borrarla en un deploy posterior. Así la versión anterior del código sigue funcionando durante el rolling y el rollback es seguro. Renombrar o borrar columnas en un solo paso rompe a las instancias viejas.',
    },
  ],
  senior: [
    {
      topic: 'plataforma',
      question: '¿Qué es platform engineering y cómo armarías una plataforma interna?',
      answer:
        'Es construir una plataforma interna de desarrollo (IDP) tratada como producto, con los desarrolladores como clientes: "golden paths" con templates de servicio, CI/CD, observabilidad, secretos y entornos listos por self-service, para reducir la carga cognitiva. Arrancaría entrevistando equipos para encontrar los mayores dolores, construyendo la plataforma mínima viable sobre eso y midiendo adopción y DORA. El error típico es construir una plataforma que nadie pidió y obligar a usarla.',
    },
    {
      topic: 'confiabilidad',
      question: '¿Cómo diseñarías una arquitectura multi-región y cuándo vale la pena?',
      answer:
        'Vale la pena cuando el RTO/RPO o requisitos de latencia o regulación lo justifican, porque multiplica costo y complejidad. Las opciones son activo-pasivo (una región sirve, la otra replica y toma el control con failover de DNS) o activo-activo (ambas sirven, con desafíos de consistencia de datos y conflictos de escritura). Hay que resolver replicación de bases, estado de sesiones, despliegues coordinados y, sobre todo, probar el failover de verdad con game days.',
    },
    {
      topic: 'sre',
      question: '¿Cómo definirías SLOs para un servicio nuevo?',
      answer:
        'Partiría del recorrido del usuario: qué le importa (que el checkout funcione y sea rápido), y de ahí SLIs medidos lo más cerca posible del usuario, como porcentaje de requests exitosas y latencia p99 en el balanceador. Fijaría el objetivo según datos históricos y expectativas del negocio, no un "cinco nueves" aspiracional, y acordaría con producto la política de error budget. Revisaría los SLOs periódicamente: si nunca se tocan o siempre se rompen, están mal calibrados.',
    },
    {
      topic: 'incidentes',
      question: '¿Cómo diseñarías una guardia (on-call) sostenible?',
      answer:
        'Rotaciones con suficientes personas (idealmente seis u ocho por rotación), escalamiento secundario, compensación y traspasos claros. Solo debería despertar a alguien lo accionable y urgente que afecta usuarios, con runbooks enlazados en cada alerta. Mediría páginas por guardia y por la noche, y si una alerta salta sin acción requerida se arregla o se borra. El objetivo es que la guardia no queme gente: el burnout termina en errores y rotación.',
    },
    {
      topic: 'seguridad',
      question: '¿Cómo protegerías la cadena de suministro de software?',
      answer:
        'Fijando dependencias con lockfiles y versiones por digest, usando registries internos o proxies, y escaneando vulnerabilidades. Generando SBOMs (CycloneDX, SPDX) de cada artefacto, firmando imágenes con Sigstore/cosign y verificando la firma al desplegar con un admission controller. Builds reproducibles y aislados con provenance según SLSA, runners efímeros y acciones de CI fijadas por SHA. Ataques como SolarWinds o xz-utils mostraron que el pipeline mismo es superficie de ataque.',
    },
    {
      topic: 'cloud',
      question: '¿Recomendarías una estrategia multi-cloud? ¿Por qué?',
      answer:
        'Depende del motivo. Multi-cloud por evitar lock-in suele ser caro: obliga a usar el mínimo común denominador, duplica conocimiento y herramientas y complica redes y seguridad. Tiene sentido por razones concretas: regulación, adquisiciones, un servicio específico mejor en otra nube (por ejemplo IA) o exigencias de clientes. Para resiliencia, multi-región en una sola nube suele dar mejor relación costo-beneficio; lo que sí conviene es mantener portabilidad razonable con contenedores y Terraform.',
    },
    {
      topic: 'costos',
      question: '¿Qué es FinOps y cómo lo implementarías en una organización?',
      answer:
        'Es la práctica de gestionar el costo cloud de forma colaborativa entre ingeniería, finanzas y negocio, con las fases informar, optimizar y operar. Implementaría tagging obligatorio (validado en IaC), showback o chargeback por equipo, dashboards de costo unitario (por cliente, por transacción), alertas de anomalías y presupuestos, y revisiones periódicas. El cambio clave es que el costo sea una métrica de ingeniería más, visible para quienes toman las decisiones de arquitectura.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cómo encararías migrar una aplicación monolítica on-premise a la nube?',
      answer:
        'Primero inventario y evaluación: dependencias, datos, requisitos de negocio y las "7 R" (rehost, replatform, refactor, retain, retire, etc.) por componente. Empezaría con algo de bajo riesgo para aprender, construiría la base (landing zone con cuentas, redes, identidad y seguridad), y migraría en olas, con replicación de datos y un plan de corte y vuelta atrás. Refactorizar todo a microservicios en el mismo movimiento es una receta para fracasar; mejor mover primero y modernizar con strangler fig.',
    },
    {
      topic: 'confiabilidad',
      question: '¿Qué es chaos engineering y cómo lo introducirías?',
      answer:
        'Es experimentar de forma controlada inyectando fallas (matar instancias, agregar latencia, cortar una dependencia) para verificar que el sistema resiste como se espera. Se define una hipótesis sobre el estado estable, se limita el radio de impacto y se tiene un botón de aborto. Lo introduciría con game days en staging, después en producción con alcance mínimo, y con herramientas como AWS Fault Injection Service, Chaos Mesh o Gremlin. Sin buena observabilidad primero, no tiene sentido.',
    },
    {
      topic: 'confiabilidad',
      question: '¿Cómo evitás fallas en cascada entre servicios?',
      answer:
        'Con timeouts en todas las llamadas, reintentos acotados con backoff exponencial y jitter (y solo en operaciones idempotentes), circuit breakers que cortan llamadas a una dependencia caída, bulkheads que aíslan recursos por dependencia, rate limiting y load shedding para descartar carga antes de colapsar. También degradación elegante: devolver algo útil sin la dependencia. Los reintentos sin control son una causa clásica de "retry storms" que tumban un servicio que se estaba recuperando.',
    },
    {
      topic: 'plataforma',
      question: '¿Cómo medís si un equipo de plataforma o DevOps está aportando valor?',
      answer:
        'Con métricas de resultado, no de actividad: DORA de los equipos que usan la plataforma, tiempo hasta el primer deploy de un servicio nuevo, adopción voluntaria de los golden paths, satisfacción de desarrolladores (encuestas tipo SPACE o DX), toil y páginas de guardia, y costo cloud por unidad de negocio. Cantidad de tickets cerrados o de pipelines creados no dice nada. Lo combinaría con conversaciones regulares con los equipos clientes.',
    },
    {
      topic: 'iac',
      question: '¿Cómo organizarías la infraestructura como código para muchos equipos y entornos?',
      answer:
        'Con módulos reutilizables versionados mantenidos por plataforma, y configuración por entorno separada (directorios o stacks por entorno y región, con state separado para limitar el radio de impacto). Cambios por pull request con `plan` visible en la revisión, policy as code (OPA, Sentinel, Checkov) para reglas como tagging o cifrado, y apply solo desde el pipeline. Detección periódica de drift y nada de cambios manuales en consola sin reflejarlos en código.',
    },
    {
      topic: 'incidentes',
      question: 'Un incidente de alto impacto se repite cada pocas semanas. ¿Qué hacés?',
      answer:
        'Primero reviso los postmortems anteriores: si las acciones no se completaron, el problema es de priorización y lo escalo con datos de impacto (horas caídas, dinero, error budget consumido). Busco causas sistémicas en vez de la causa inmediata de cada vez, por ejemplo falta de capacidad, dependencias frágiles o deploys sin canary. Propongo congelar features en esa área hasta resolverlo, con dueño claro y seguimiento. Que se repita significa que la organización no está aprendiendo de los incidentes.',
    },
    {
      topic: 'cultura',
      question:
        '¿Cómo llevarías prácticas DevOps a una organización con silos fuertes entre dev y ops?',
      answer:
        'Sin imponerlo de golpe: elegiría un equipo piloto con un problema visible (deploys lentos o riesgosos), mediría DORA de base, y lo resolvería junto a ellos con CI/CD, observabilidad y responsabilidad compartida. Con los resultados se convence al resto. En paralelo, sumar a ops en el diseño, a dev en la guardia, postmortems blameless compartidos y apoyo explícito del liderazgo. Renombrar al equipo de ops como "equipo DevOps" no cambia nada.',
    },
    {
      topic: 'arquitectura',
      question: '¿Cuándo elegirías serverless frente a contenedores en Kubernetes?',
      answer:
        'Serverless (Lambda, Cloud Run, Azure Functions) conviene para cargas variables o eventuales, equipos chicos y cuando querés cero operación de infraestructura, pagando por uso y escalando a cero. Kubernetes conviene con carga estable y alta (donde es más barato), procesos de larga duración, necesidades de red o hardware específicas, portabilidad y muchos servicios que justifican el costo de operar el cluster. Hay que ponderar cold starts, límites de duración, lock-in y la capacidad del equipo.',
    },
  ],
};
