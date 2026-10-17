import type { InterviewQuestion, Seniority } from './types';

export const githubActionsQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'ci/cd',
      question:
        '¿Qué pasos tiene un pipeline de CI típico para un pull request y por qué en ese orden?',
      answer:
        'Primero hace checkout e instala dependencias con caché, después corre lo más rápido y barato (lint, formato y typecheck), luego los tests unitarios y, al final, el build y los tests de integración o E2E. El orden busca fallar rápido: si el lint falla en 30 segundos no tiene sentido esperar 10 minutos de E2E. En GitHub Actions eso se arma con un workflow disparado por `pull_request`, jobs que pueden correr en paralelo y `needs` para los que dependen de otros, y se marca como required check para que no se pueda mergear si falla.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo se estructura un workflow de GitHub Actions?',
      answer:
        'Es un archivo YAML en `.github/workflows/` con `on` (los eventos que lo disparan), y `jobs` que corren en paralelo por defecto, cada uno en su runner indicado con `runs-on`. Cada job tiene `steps` que se ejecutan en orden: comandos con `run` o actions reutilizables con `uses`, como `actions/checkout`. Los jobs se encadenan con `needs` y comparten archivos mediante artifacts.',
    },
    {
      topic: 'ci/cd',
      question: '¿Qué eventos pueden disparar un workflow?',
      answer:
        'Los más usados son `push` y `pull_request` (filtrables por ramas y paths), `workflow_dispatch` para correrlo a mano con inputs, `schedule` con sintaxis cron para tareas periódicas, y `release` o `push` de tags para publicar versiones. También `workflow_call` para workflows reutilizables y `workflow_run` para encadenar uno al terminar otro. Combinarlos bien evita correr pipelines caros cuando no hace falta.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo usás secretos en GitHub Actions?',
      answer:
        'Se cargan en la configuración del repo, la organización o un environment, y se leen como `${{ secrets.NOMBRE }}`, normalmente pasándolos como variables de entorno al step que los necesita. GitHub los enmascara en los logs, pero no hay que imprimirlos ni escribirlos en artifacts. Los workflows de forks no reciben secretos por defecto, justamente para que un PR externo no pueda robarlos.',
    },
    {
      topic: 'ci/cd',
      question: '¿Para qué sirve una matrix?',
      answer:
        'Una `strategy.matrix` corre el mismo job con combinaciones de variables, por ejemplo varias versiones de Node (`[20, 22, 24]`) y sistemas operativos, en paralelo. Con `include` y `exclude` ajustás combinaciones puntuales y con `fail-fast: false` evitás que una falla cancele las demás. Es ideal para librerías que tienen que funcionar en varios entornos.',
    },
    {
      topic: 'ci/cd',
      question: '¿Qué diferencia hay entre la caché y los artifacts?',
      answer:
        'La caché (`actions/cache` o la opción `cache` de `actions/setup-node`) guarda cosas reutilizables entre ejecuciones, como dependencias, indexadas por una key con el hash del lockfile; si no está, el pipeline igual funciona. Los artifacts (`actions/upload-artifact`) guardan resultados de una ejecución concreta, como un build, reportes de tests o screenshots, para pasarlos a otro job o descargarlos. Caché es para acelerar; artifacts es para conservar salidas.',
    },
  ],
  'semi-senior': [
    {
      topic: 'ci/cd',
      question: '¿Qué diferencia hay entre los runners hosteados por GitHub y los self-hosted?',
      answer:
        'Los hosteados son VMs efímeras y limpias que administra GitHub: cero mantenimiento, cobro por minuto y tamaños más grandes pagando. Los self-hosted corren en tu infraestructura: sirven para acceder a redes privadas, hardware especial o abaratar volumen, pero tenés que mantenerlos, escalarlos y aislarlos. Nunca deberían usarse en repos públicos, porque un PR podría ejecutar código en tu red; lo ideal es que sean efímeros, por ejemplo con Actions Runner Controller en Kubernetes.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo autenticás un workflow contra AWS, Azure o GCP sin guardar claves?',
      answer:
        'Con OIDC: el workflow pide un token firmado por GitHub (`permissions: id-token: write`) y lo intercambia por credenciales temporales de la nube, usando `aws-actions/configure-aws-credentials`, `azure/login` o `google-github-actions/auth`. Del lado de la nube se configura la confianza restringiendo el `sub` del token a un repo, rama o environment concreto. Así no hay claves de larga duración que rotar ni que se puedan filtrar.',
    },
    {
      topic: 'ci/cd',
      question: '¿Para qué sirven los environments y sus reglas de protección?',
      answer:
        'Un environment (como `staging` o `production`) agrupa secretos y variables propios y se referencia en el job con `environment:`. Se le pueden poner reviewers obligatorios, un tiempo de espera y restricción de qué ramas pueden desplegar, así un deploy a producción queda pausado hasta que alguien lo apruebe. Además queda un historial de deployments por entorno visible en el repo.',
    },
    {
      topic: 'ci/cd',
      question: '¿Qué diferencia hay entre un reusable workflow y una composite action?',
      answer:
        'Un reusable workflow (`on: workflow_call`) es un workflow entero con jobs que se invoca desde otro con `uses: org/repo/.github/workflows/x.yml@ref`; sirve para estandarizar pipelines completos entre repos. Una composite action agrupa steps en un `action.yml` y se usa como un step más dentro de un job, ideal para setup repetido. Los reusable workflows pueden elegir runners y environments; las composite actions no.',
    },
    {
      topic: 'ci/cd',
      question: '¿Para qué sirve `concurrency` y cómo lo usarías?',
      answer:
        'Agrupa ejecuciones bajo una clave y evita que corran en paralelo. Con `concurrency: { group: ${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: true }` cancelás builds viejos de un PR cuando llega un push nuevo, ahorrando minutos. Para deploys se usa sin cancelar, para que dos despliegues a producción nunca se pisen y queden en cola.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo acelerarías un pipeline de CI que tarda 25 minutos?',
      answer:
        'Primero mido qué step tarda más. Después: caché de dependencias y de builds (Turborepo, Gradle, capas de Docker con `cache-to: type=gha`), paralelizar jobs independientes y partir tests en shards, y correr solo lo afectado en monorepos con filtros de paths. También runners más grandes para los jobs pesados, cancelar ejecuciones obsoletas con `concurrency`, y dejar suites lentas (E2E completos) para el merge o nightly en vez de cada push.',
    },
  ],
  senior: [
    {
      topic: 'ci/cd',
      question: '¿Cómo endurecés la seguridad de los workflows de GitHub Actions?',
      answer:
        'Permisos mínimos para `GITHUB_TOKEN` declarando `permissions: contents: read` por defecto y ampliando por job. Fijar actions de terceros por SHA completo en vez de tag, porque un tag se puede mover (como pasó con `tj-actions/changed-files` en 2025), con Dependabot para actualizarlos. No interpolar inputs no confiables como títulos de PR directo en `run` (inyección de comandos), usar OIDC en vez de claves y revisar workflows con herramientas como zizmor o el escaneo de CodeQL para Actions.',
    },
    {
      topic: 'ci/cd',
      question: '¿Qué riesgo tiene `pull_request_target`?',
      answer:
        'A diferencia de `pull_request`, corre en el contexto de la rama base con acceso a secretos y a un token con escritura, incluso para PRs de forks. Si el workflow hace checkout del código del PR y lo ejecuta (instalar dependencias, correr scripts), un atacante puede robar secretos o modificar el repo: es el clásico "pwn request". Solo debe usarse para tareas que no ejecutan código del PR, como etiquetar, o separando en un `pull_request` sin privilegios más un `workflow_run` que procesa sus resultados.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo diseñás el pipeline de despliegue de un servicio a producción?',
      answer:
        'Se construye el artefacto una sola vez (imagen con tag del commit) y se promueve el mismo por los entornos: deploy a staging, tests de humo o E2E, aprobación y producción. En producción uso canary o blue-green con chequeos automáticos de métricas y rollback automático si empeoran. Las migraciones de base van separadas y compatibles hacia atrás (expand y contract), y todo queda trazable del commit al deploy.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo organizás CI/CD en un monorepo con muchos servicios?',
      answer:
        'Con detección de cambios para correr solo lo afectado: filtros `paths`, `dorny/paths-filter` o el grafo de dependencias de herramientas como Turborepo o Nx con caché remota. Un workflow dinámico genera la matrix de servicios a construir y desplegar, y los checks requeridos se resuelven con un job agregador para que los PRs no queden bloqueados por jobs saltados. Los pipelines comunes viven en reusable workflows para que cada servicio no copie YAML.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo manejás los tests flaky en el pipeline?',
      answer:
        'Primero los hago visibles: métricas de tasa de fallo por test y detección de tests que pasan al reintentar. Un test flaky se pone en cuarentena (sigue corriendo pero no bloquea) con un ticket y dueño, en vez de agregar reintentos a ciegas que esconden bugs reales como race conditions. Las causas típicas son esperas fijas, dependencia del orden, datos compartidos y servicios externos, y se arreglan aislando datos y mockeando lo externo.',
    },
    {
      topic: 'ci/cd',
      question: '¿Cómo garantizás la integridad de lo que se despliega desde CI (supply chain)?',
      answer:
        'Builds reproducibles en runners efímeros, dependencias con lockfile y versiones fijadas, y escaneo de vulnerabilidades y secretos en cada PR. Generar provenance y firmar los artefactos (artifact attestations de GitHub o Sigstore/Cosign), apuntando a niveles de SLSA, y verificar esa firma al desplegar. Protección de ramas con reviews obligatorios y checks requeridos, para que nadie pueda llegar a producción salteándose el pipeline.',
    },
  ],
};
