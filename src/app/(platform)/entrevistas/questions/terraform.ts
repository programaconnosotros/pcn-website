import type { InterviewQuestion, Seniority } from './types';

export const terraformQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'terraform',
      question:
        '¿Qué es infraestructura como código y qué significa que Terraform sea declarativo?',
      answer:
        'Infraestructura como código es definir servidores, redes, bases y permisos en archivos versionados, en vez de crearlos a mano en una consola. Que Terraform sea declarativo significa que describís el estado final que querés y él calcula los pasos para llegar, en lugar de escribir la secuencia de comandos. Así la infraestructura es reproducible, revisable en pull requests y auditable.',
    },
    {
      topic: 'terraform',
      question: '¿Qué hacen `terraform init`, `plan` y `apply`?',
      answer:
        '`init` prepara el directorio: baja los providers y módulos y configura el backend del state. `plan` compara la configuración con el state y la infraestructura real y muestra qué va a crear, modificar o destruir, sin tocar nada. `apply` ejecuta esos cambios; lo correcto es revisar el plan antes y, en CI, aplicar exactamente el plan guardado con `terraform plan -out`.',
    },
    {
      topic: 'terraform',
      question: '¿Qué es un provider?',
      answer:
        'Es el plugin que traduce los recursos de Terraform a llamadas a la API de una plataforma: AWS, Azure, Google Cloud, Kubernetes, Cloudflare, GitHub y cientos más. Se declara en el bloque `required_providers` con una versión acotada (`~> 5.0`) y el lockfile `.terraform.lock.hcl` fija la versión exacta. Ese lockfile se commitea para que todos usen lo mismo.',
    },
    {
      topic: 'terraform',
      question: '¿Qué diferencia hay entre un `resource` y un `data` source?',
      answer:
        'Un `resource` es algo que Terraform crea y administra: si lo borrás de la configuración, lo destruye. Un `data` source solo lee información de algo que ya existe y que gestiona otro equipo, otro stack o la consola, como una AMI, una VPC o una zona DNS. Sirve para referenciar infraestructura sin tomar su control.',
    },
    {
      topic: 'terraform',
      question: '¿Qué es el state de Terraform y para qué sirve?',
      answer:
        'Es un archivo (`terraform.tfstate`) que mapea cada recurso de la configuración con el objeto real en la nube, con sus IDs y atributos. Terraform lo usa para saber qué existe, calcular diferencias y resolver dependencias. Puede contener datos sensibles en texto plano, así que nunca se commitea a Git: va en un backend remoto con acceso restringido.',
    },
    {
      topic: 'terraform',
      question: '¿Qué son las variables, los outputs y los locals?',
      answer:
        'Las `variable` son los parámetros de entrada de una configuración o módulo, con tipo, default y validaciones, y se pasan por `.tfvars`, `-var` o variables de entorno `TF_VAR_`. Los `output` exponen valores hacia afuera, como la URL de un balanceador, para usarlos en otro módulo o en CI. Los `locals` son valores calculados internos para no repetir expresiones, como un mapa de tags comunes.',
    },
  ],
  'semi-senior': [
    {
      topic: 'terraform',
      question: '¿Cómo configurás un backend remoto y por qué importa el locking?',
      answer:
        'Se guarda el state en un storage compartido: S3 (con `use_lockfile = true` o DynamoDB en versiones viejas), Azure Storage, GCS o HCP Terraform, con cifrado y versionado activados. El locking evita que dos personas o pipelines apliquen a la vez y corrompan el state o pisen cambios. El versionado del bucket permite recuperar un state anterior si algo sale mal.',
    },
    {
      topic: 'terraform',
      question: '¿Qué diferencia hay entre `count` y `for_each`?',
      answer:
        '`count` crea N copias indexadas por posición (`aws_instance.web[0]`), así que si sacás un elemento del medio de una lista, Terraform recrea los siguientes porque se corren los índices. `for_each` itera un mapa o set y direcciona por clave (`aws_s3_bucket.this["logs"]`), por lo que agregar o quitar elementos no afecta a los demás. `count` queda para recursos opcionales (`count = var.enabled ? 1 : 0`) y `for_each` para colecciones.',
    },
    {
      topic: 'terraform',
      question: '¿Cómo diseñás un módulo reutilizable?',
      answer:
        'Un módulo agrupa recursos detrás de una interfaz chica: variables con tipos y validaciones, defaults seguros y outputs útiles, sin hardcodear región, nombres ni providers. Se versiona (tag de Git o registry privado) y los consumidores fijan la versión. Conviene que represente un concepto, como "servicio web con su balanceador", y no envolver un solo recurso sin agregar valor.',
    },
    {
      topic: 'terraform',
      question: '¿Cómo separás los entornos: workspaces o directorios?',
      answer:
        'Los workspaces de la CLI reutilizan el mismo código con un state por workspace, pero comparten backend y credenciales y es fácil aplicar en el equivocado. Lo más usado para dev, staging y producción son directorios o stacks separados que llaman a los mismos módulos, con su propio state, variables y permisos. Así un plan de dev no puede tocar producción y cada entorno puede ir con distinta versión de módulo.',
    },
    {
      topic: 'terraform',
      question:
        '¿Cómo traés a Terraform un recurso que ya existe y cómo renombrás uno sin destruirlo?',
      answer:
        'Para recursos creados a mano se usa un bloque `import` con el `to` y el `id`, y `terraform plan -generate-config-out` puede generar la configuración inicial; reemplaza al viejo `terraform import`. Para renombrar o mover un recurso a un módulo se usa un bloque `moved` con `from` y `to`, que actualiza el state en vez de destruir y recrear. Las dos opciones quedan en el código y se revisan en PR, a diferencia de los comandos `terraform state`.',
    },
    {
      topic: 'terraform',
      question: '¿Para qué sirven los argumentos de `lifecycle`?',
      answer:
        '`prevent_destroy` hace fallar cualquier plan que destruya el recurso, útil para bases y buckets con datos. `create_before_destroy` crea el reemplazo antes de borrar el viejo para evitar cortes, por ejemplo en certificados o launch templates. `ignore_changes` hace que Terraform ignore atributos que cambian afuera, como el `desired_count` que maneja un autoscaler; y `replace_triggered_by` fuerza el reemplazo cuando cambia otro recurso.',
    },
  ],
  senior: [
    {
      topic: 'terraform',
      question: '¿Qué es el drift y cómo lo detectás y manejás?',
      answer:
        'El drift es la diferencia entre la infraestructura real y lo que dice el código, típicamente por cambios manuales en la consola o por otros procesos. Se detecta corriendo `terraform plan -detailed-exitcode` programado en CI (exit code 2 si hay diferencias) o con la detección de HCP Terraform, y alertando. Se resuelve revirtiendo el cambio con un apply o incorporándolo al código, y se previene quitando permisos de escritura manual en producción.',
    },
    {
      topic: 'terraform',
      question: '¿Cómo armás un pipeline de CI/CD para Terraform?',
      answer:
        'En cada pull request corren `terraform fmt -check`, `validate`, tflint, un escaneo de seguridad (Checkov o Trivy) y un `plan` cuyo resultado se comenta en el PR. Al mergear se aplica exactamente el plan revisado, con aprobación manual para producción y un lock por stack para no aplicar en paralelo. Las credenciales llegan por OIDC con roles distintos para plan (lectura) y apply (escritura); herramientas como Atlantis, Spacelift o HCP Terraform resuelven este flujo.',
    },
    {
      topic: 'terraform',
      question: '¿Cómo manejás secretos en Terraform?',
      answer:
        'Los valores secretos no van en el código ni en `.tfvars` commiteados: se leen de un gestor (Secrets Manager, Key Vault, Vault) con un data source o se generan y se guardan directo ahí. Marcar variables y outputs como `sensitive` oculta el valor en la salida pero sigue quedando en el state, por eso el state se cifra y se restringe. Los recursos y atributos efímeros (`ephemeral`) de versiones recientes permiten usar secretos sin persistirlos en el state.',
    },
    {
      topic: 'terraform',
      question: '¿Cómo estructurás el state en una organización grande?',
      answer:
        'Un state gigante hace los plans lentos, aumenta el blast radius y genera contención por el lock. Se divide por dominio, entorno y ritmo de cambio: red y cuentas base por un lado, cada servicio por otro. Los stacks se conectan con outputs leídos por `terraform_remote_state` o, mejor, con data sources o parámetros publicados, para que el acoplamiento sea explícito. Terragrunt o los Stacks de HCP Terraform ayudan a orquestar muchos states y no repetir configuración de backend.',
    },
    {
      topic: 'terraform',
      question: '¿Qué es policy as code y cómo la aplicarías sobre Terraform?',
      answer:
        'Es expresar reglas de la organización como código que se evalúa automáticamente sobre el plan: no hay buckets públicos, todo recurso tiene tags de costo, solo regiones aprobadas, instancias de tamaños permitidos. Se implementa con OPA y Conftest sobre el JSON de `terraform show -json`, con Sentinel en HCP Terraform o con Checkov. Las políticas tienen niveles (advertencia o bloqueo) y se versionan y testean como cualquier código.',
    },
    {
      topic: 'terraform',
      question: '¿Qué es OpenTofu y qué tendrías en cuenta para elegir entre él y Terraform?',
      answer:
        'OpenTofu es el fork open source de Terraform bajo la Linux Foundation, creado cuando HashiCorp pasó Terraform a la licencia BSL en 2023. Es compatible con los mismos providers y la mayoría del código, y agregó features propias como cifrado del state. La elección depende de la licencia y la política de la empresa, de si usan HCP Terraform y de las features que cada uno fue agregando por separado; migrar entre versiones compatibles suele ser cambiar el binario y probar el plan.',
    },
  ],
};
