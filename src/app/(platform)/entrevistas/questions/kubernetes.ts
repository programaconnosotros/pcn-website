import type { InterviewQuestion, Seniority } from './types';

export const kubernetesQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'kubernetes',
      question: '¿Qué es Kubernetes y qué problema resuelve?',
      answer:
        'Es un orquestador de contenedores: le declarás el estado deseado (qué imágenes, cuántas réplicas, cómo se exponen) y él se encarga de llevar el cluster a ese estado y mantenerlo. Resuelve scheduling en varios nodos, reinicio ante fallas, escalado, service discovery, balanceo de carga y despliegues sin downtime. Funciona con control loops que comparan constantemente el estado actual con el deseado.',
    },
    {
      topic: 'kubernetes',
      question: '¿Qué es un pod y por qué no se crean pods sueltos?',
      answer:
        'Un pod es la unidad mínima de Kubernetes: uno o más contenedores que comparten red (misma IP y `localhost`) y volúmenes, y se programan juntos en un nodo. Los pods son efímeros: si el nodo muere o el pod se borra, nadie lo recrea. Por eso se gestionan con un controlador como un Deployment, que mantiene la cantidad de réplicas deseada.',
    },
    {
      topic: 'kubernetes',
      question: '¿Qué relación hay entre un Deployment, un ReplicaSet y los pods?',
      answer:
        'El Deployment declara la plantilla del pod y la cantidad de réplicas, y crea un ReplicaSet que se asegura de que esa cantidad de pods exista. Cuando cambiás la plantilla (por ejemplo la imagen), el Deployment crea un ReplicaSet nuevo y va pasando réplicas del viejo al nuevo en un rolling update. Guardar los ReplicaSets viejos es lo que permite `kubectl rollout undo`.',
    },
    {
      topic: 'kubernetes',
      question: '¿Qué es un Service y qué tipos hay?',
      answer:
        'Un Service da una IP y un nombre DNS estables delante de un grupo de pods elegidos por labels, porque las IPs de los pods cambian. `ClusterIP` (default) lo expone solo dentro del cluster, `NodePort` abre un puerto en cada nodo y `LoadBalancer` le pide al proveedor cloud un balanceador externo. También existe `ExternalName`, que es un alias DNS a un servicio afuera del cluster.',
    },
    {
      topic: 'kubernetes',
      question: '¿Para qué sirven los ConfigMaps y los Secrets?',
      answer:
        'Separan la configuración de la imagen: un ConfigMap guarda configuración no sensible y un Secret guarda credenciales, y los dos se inyectan como variables de entorno o archivos montados. Ojo que un Secret solo está en Base64, no cifrado: hay que habilitar encryption at rest en etcd y restringir el acceso con RBAC. Muchos equipos los sincronizan desde un gestor externo con External Secrets Operator.',
    },
    {
      topic: 'kubernetes',
      question: '¿Qué comandos usás primero para investigar un pod que no funciona?',
      answer:
        '`kubectl get pods` para ver el estado y los reinicios, `kubectl describe pod <nombre>` para ver los eventos (errores de imagen, scheduling, probes que fallan) y `kubectl logs <pod>` para los logs, con `--previous` si el contenedor se reinició. Si hace falta mirar adentro, `kubectl exec -it <pod> -- sh` o `kubectl debug` con un contenedor efímero. `kubectl get events --sort-by=.lastTimestamp` da el panorama del namespace.',
    },
  ],
  'semi-senior': [
    {
      topic: 'kubernetes',
      question: '¿Qué diferencia hay entre las liveness, readiness y startup probes?',
      answer:
        'La readiness indica si el pod puede recibir tráfico: si falla, se lo saca de los endpoints del Service pero no se reinicia. La liveness indica si el contenedor está colgado: si falla, kubelet lo reinicia. La startup protege a las apps que tardan en arrancar, desactivando las otras dos hasta que pasa. Un error común es una liveness que chequea dependencias externas, que ante una caída de la base reinicia todos los pods en cascada.',
    },
    {
      topic: 'kubernetes',
      question: '¿Qué son los requests y limits y cómo afectan al pod?',
      answer:
        'Los requests son lo que el scheduler reserva para ubicar el pod en un nodo; los limits son el máximo que puede usar. Pasarse del limit de CPU produce throttling, pero pasarse del de memoria hace que el kernel lo mate con OOMKilled. Según cómo los definas el pod queda en una clase de QoS (`Guaranteed`, `Burstable` o `BestEffort`), que decide quién se desaloja primero cuando el nodo se queda sin memoria.',
    },
    {
      topic: 'kubernetes',
      question: '¿Cuándo usarías un StatefulSet, un DaemonSet o un Job en vez de un Deployment?',
      answer:
        'StatefulSet para apps con estado que necesitan identidad estable y almacenamiento propio por réplica, como una base o Kafka: pods `db-0`, `db-1` con su PVC y arranque ordenado. DaemonSet para correr un pod en cada nodo, típico de agentes de logs, métricas o CNI. Job para tareas que terminan, como una migración, y CronJob para las programadas.',
    },
    {
      topic: 'kubernetes',
      question: '¿Cómo se expone una aplicación HTTP hacia afuera del cluster?',
      answer:
        'Lo habitual es un Ingress (o su sucesor, la Gateway API con `Gateway` y `HTTPRoute`) delante de Services `ClusterIP`, con un controller como NGINX, Traefik o el del proveedor cloud. Ese controller hace routing por host y path y termina TLS, normalmente con certificados de cert-manager. Así compartís un solo balanceador externo entre muchos servicios en vez de un `LoadBalancer` por cada uno.',
    },
    {
      topic: 'kubernetes',
      question: '¿Cómo funciona un rolling update y cómo lo configurás para no tener downtime?',
      answer:
        'El Deployment reemplaza pods de a poco según `maxSurge` (cuántos extra puede crear) y `maxUnavailable` (cuántos pueden faltar). Para que no haya cortes hacen falta readiness probes reales, para que el tráfico vaya solo a pods listos, y graceful shutdown: la app maneja `SIGTERM` y un `preStop` corto da tiempo a que el pod salga de los endpoints. Se sigue con `kubectl rollout status` y se vuelve atrás con `kubectl rollout undo`.',
    },
    {
      topic: 'kubernetes',
      question: '¿Qué diferencia hay entre Helm y Kustomize?',
      answer:
        'Helm es un gestor de paquetes: un chart son templates con valores (`values.yaml`) que se instalan como releases versionados con rollback, ideal para distribuir software de terceros. Kustomize no usa templates: parte de YAML base y aplica overlays y patches por entorno, y viene integrado en `kubectl apply -k`. Muchos equipos usan Helm para dependencias y Kustomize para sus propias apps, o ambos combinados.',
    },
  ],
  senior: [
    {
      topic: 'kubernetes',
      question: '¿Cuáles son los componentes del control plane y qué hace cada uno?',
      answer:
        'El `kube-apiserver` es la puerta de entrada: valida y persiste todos los objetos. `etcd` es la base clave-valor consistente donde vive el estado del cluster, y hay que respaldarla. El `kube-scheduler` asigna pods a nodos según recursos, afinidades y taints, y el `kube-controller-manager` corre los control loops (Deployments, nodos, endpoints). En cada nodo, `kubelet` levanta los contenedores vía el runtime y `kube-proxy` (o el CNI con eBPF) implementa los Services.',
    },
    {
      topic: 'kubernetes',
      question: '¿Cómo diagnosticás pods en `CrashLoopBackOff`, `Pending` y `OOMKilled`?',
      answer:
        '`CrashLoopBackOff` es un contenedor que arranca y muere: miro `kubectl logs --previous`, el exit code en `describe` y config faltante o liveness probes mal calibradas. `Pending` es que no se pudo programar: los eventos dicen si faltan recursos para los requests, hay taints, afinidades imposibles o un PVC sin bindear. `OOMKilled` (exit code 137) es superar el limit de memoria: comparo el uso real con las métricas y ajusto el limit o arreglo el leak.',
    },
    {
      topic: 'kubernetes',
      question: '¿Cómo diseñás el autoscaling de una aplicación en Kubernetes?',
      answer:
        'A nivel pods, el HPA escala réplicas por CPU, memoria o métricas custom (con KEDA se escala por largo de colas o eventos, incluso a cero); el VPA ajusta requests y sirve más para recomendar. A nivel nodos, el Cluster Autoscaler o Karpenter agregan nodos cuando hay pods `Pending` y los consolidan cuando sobran. Todo depende de requests bien calibrados, y conviene sumar PodDisruptionBudgets para que la consolidación no tire la app.',
    },
    {
      topic: 'kubernetes',
      question: '¿Cómo asegurás un cluster multi-equipo?',
      answer:
        'Namespaces por equipo o app, RBAC con roles mínimos (nada de `cluster-admin` para humanos) e identidad federada al proveedor de identidad. NetworkPolicies con deny por defecto, Pod Security Standards en `restricted` (no root, sin privilegios), ResourceQuotas y LimitRanges para que un equipo no consuma todo. Políticas de admisión con Kyverno u OPA Gatekeeper para exigir imágenes firmadas de registries aprobados, más Workload Identity para que los pods accedan a la cloud sin claves.',
    },
    {
      topic: 'kubernetes',
      question: '¿Qué es GitOps y cómo lo implementarías con Argo CD?',
      answer:
        'GitOps usa un repo Git como fuente de verdad del estado deseado del cluster: los cambios se hacen por pull request y un agente dentro del cluster los aplica en modo pull. Argo CD compara continuamente Git con el cluster, muestra el drift, sincroniza (manual o automático con `selfHeal`) y permite rollback revirtiendo un commit. CI construye y publica la imagen y actualiza el tag en el repo de manifiestos; nadie hace `kubectl apply` a mano en producción.',
    },
    {
      topic: 'kubernetes',
      question: '¿Qué son los CRDs y los operators y cuándo conviene usarlos?',
      answer:
        'Un CustomResourceDefinition extiende la API de Kubernetes con tipos propios, como `PostgresCluster` o `Certificate`. Un operator es un controlador que observa esos recursos y codifica el conocimiento operativo: crear réplicas, hacer backups, failover y upgrades. Conviene usar operators maduros para software con estado complejo (CloudNativePG, cert-manager, Strimzi); escribir uno propio solo se justifica si la operación es repetitiva y no existe algo confiable.',
    },
  ],
};
