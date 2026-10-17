import type { InterviewQuestion, Seniority } from './types';

export const observabilityQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'observabilidad',
      question: '¿Qué diferencia hay entre logs, métricas y trazas?',
      answer:
        'Los logs son eventos discretos con detalle, ideales para ver qué pasó en un caso puntual. Las métricas son valores numéricos agregados en el tiempo (requests por segundo, latencia, uso de CPU), baratas de guardar y buenas para dashboards y alertas. Las trazas siguen una request a través de varios servicios, con un span por operación, y muestran dónde se va el tiempo. Juntas son los tres pilares de la observabilidad, y se potencian si comparten un trace ID.',
    },
    {
      topic: 'observabilidad',
      question: '¿Qué es Prometheus y cómo obtiene las métricas?',
      answer:
        'Es un sistema de monitoreo y base de datos de series temporales, proyecto graduado de la CNCF. Usa un modelo pull: cada cierto intervalo hace scraping de un endpoint HTTP (normalmente `/metrics`) de cada objetivo, que expone las métricas en formato de texto. Los objetivos se descubren de forma estática o dinámica (Kubernetes, EC2, Consul). Para jobs cortos que no llegan a ser scrapeados existe el Pushgateway.',
    },
    {
      topic: 'observabilidad',
      question: '¿Qué tipos de métricas tiene Prometheus?',
      answer:
        'Counter: solo sube (o vuelve a cero al reiniciar), como `http_requests_total`; se usa con `rate()`. Gauge: sube y baja, como memoria en uso o tamaño de una cola. Histogram: cuenta observaciones en buckets configurables (por ejemplo latencias), y permite calcular percentiles agregando entre instancias. Summary: calcula cuantiles del lado del cliente, pero esos cuantiles no se pueden agregar entre instancias, por eso hoy se prefiere histogram.',
    },
    {
      topic: 'observabilidad',
      question: '¿Para qué se usa Grafana?',
      answer:
        'Es una herramienta de visualización que se conecta a muchas fuentes de datos (Prometheus, Loki, Tempo, Elasticsearch, CloudWatch, bases SQL) para armar dashboards con gráficos, tablas y paneles de estado. También permite definir alertas, usar variables para filtrar por entorno o servicio y explorar logs y trazas. Un buen dashboard responde una pregunta concreta, como "¿está sano el servicio?", y no amontona cien gráficos.',
    },
    {
      topic: 'observabilidad',
      question: '¿Qué son las cuatro señales doradas?',
      answer:
        'Son las métricas que el libro de SRE de Google recomienda monitorear en cualquier servicio de cara al usuario: latencia (cuánto tarda, separando requests exitosas de errores), tráfico (cuánta demanda, como requests por segundo), errores (tasa de requests que fallan) y saturación (qué tan lleno está el recurso más limitado, como CPU, memoria o conexiones). Si solo podés medir cuatro cosas, medí esas.',
    },
    {
      topic: 'observabilidad',
      question: '¿Por qué conviene escribir logs estructurados?',
      answer:
        'Porque un log en JSON con campos como `level`, `service`, `trace_id`, `user_id` y `duration_ms` se puede filtrar, agregar y correlacionar en la herramienta de logs sin regex frágiles. Un texto libre como "error al procesar pedido 123" es difícil de buscar a escala. También conviene usar niveles de forma consistente, no loguear datos sensibles (contraseñas, tokens, datos personales) y escribir a stdout para que la plataforma los recolecte.',
    },
  ],
  'semi-senior': [
    {
      topic: 'observabilidad',
      question: '¿Qué hace `rate()` en PromQL y por qué no se grafica un counter directamente?',
      answer:
        'Un counter crece siempre, así que su valor crudo no dice mucho; lo que importa es su velocidad. `rate(http_requests_total[5m])` calcula el aumento por segundo promedio en la ventana de 5 minutos y maneja automáticamente los reinicios del counter. `irate()` usa solo los dos últimos puntos (más ruidoso) e `increase()` da el aumento total en la ventana. La ventana debería abarcar al menos cuatro intervalos de scraping.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo calculás el percentil 99 de latencia con un histogram de Prometheus?',
      answer:
        'Con `histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))`. Primero `rate` sobre los buckets, después `sum by (le)` para agregar las instancias manteniendo el label del bucket, y finalmente el cuantil. El resultado es una estimación interpolada dentro del bucket, así que los límites de los buckets deben estar cerca de los umbrales que te importan. Los histogramas nativos de Prometheus mejoran esa precisión.',
    },
    {
      topic: 'observabilidad',
      question: '¿Qué es la cardinalidad en Prometheus y por qué puede ser un problema?',
      answer:
        'Cada combinación única de nombre de métrica y valores de labels es una serie temporal distinta. Si ponés en un label algo con valores ilimitados, como `user_id`, URL con IDs o email, creás millones de series que consumen memoria y hacen caer a Prometheus. Los labels deben tener valores acotados (método, código de estado, ruta normalizada como `/users/:id`). Para analizar por usuario están los logs o las trazas, no las métricas.',
    },
    {
      topic: 'observabilidad',
      question: '¿Qué hace Alertmanager?',
      answer:
        'Recibe las alertas que disparan las reglas de Prometheus y se encarga de entregarlas: las agrupa (cincuenta pods caídos generan una notificación, no cincuenta), las deduplica, aplica silencios durante mantenimientos e inhibiciones (si se cayó todo el cluster, no avisa de cada servicio) y las rutea según labels a Slack, PagerDuty, Opsgenie o email. Separar la evaluación de la notificación permite reglas simples y políticas de entrega centralizadas.',
    },
    {
      topic: 'observabilidad',
      question: '¿Por qué conviene alertar sobre síntomas y no sobre causas?',
      answer:
        'Porque al usuario le importa que el servicio responda bien, no que un servidor esté al 90% de CPU. Alertas sobre síntomas (tasa de errores alta, latencia por encima del SLO) son accionables y no fallan si aparece una causa nueva; alertas sobre causas generan ruido cuando la causa no afecta a nadie y dejan huecos. Las métricas de causa van en dashboards para diagnosticar, y solo deberían despertar a alguien si predicen un problema inminente, como un disco que se llena en horas.',
    },
    {
      topic: 'observabilidad',
      question: '¿Qué diferencia hay entre los métodos RED y USE?',
      answer:
        'RED se aplica a servicios que atienden requests: Rate (requests por segundo), Errors (requests fallidas) y Duration (latencia, como distribución). USE, de Brendan Gregg, se aplica a recursos como CPU, memoria, disco o red: Utilization (porcentaje de tiempo ocupado), Saturation (trabajo encolado esperando) y Errors. RED te dice si el servicio anda bien para el usuario; USE te ayuda a encontrar qué recurso es el cuello de botella.',
    },
  ],
  senior: [
    {
      topic: 'observabilidad',
      question:
        '¿Qué son las alertas por burn rate de un SLO y por qué son mejores que un umbral fijo?',
      answer:
        'El burn rate es la velocidad a la que se consume el error budget: 1 significa agotarlo justo al final de la ventana. Se alerta con ventanas múltiples, por ejemplo burn rate 14.4 en 1 hora (y confirmado en 5 minutos) para páginas urgentes, y burn rate 6 en 6 horas o 1 en 3 días para tickets. Así una falla grave avisa rápido, una degradación lenta también se detecta, y los picos breves que no ponen en riesgo el SLO no despiertan a nadie.',
    },
    {
      topic: 'observabilidad',
      question: '¿Qué es OpenTelemetry y por qué adoptarlo?',
      answer:
        'Es el estándar abierto de la CNCF para instrumentar aplicaciones y generar trazas, métricas y logs con APIs, SDKs y un protocolo común (OTLP), más el Collector, que recibe, procesa (sampling, filtrado, enriquecimiento) y exporta la telemetría a cualquier backend. Evita el lock-in con un proveedor de APM, ofrece auto-instrumentación para muchos frameworks y propaga el contexto de trazas entre servicios con el estándar W3C Trace Context.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo escalarías Prometheus para muchos clusters y retención larga?',
      answer:
        'Un Prometheus solo es un nodo con almacenamiento local y retención limitada. Para vista global y retención larga se usa Thanos (sidecar que sube bloques a object storage y una capa de query global), o Grafana Mimir, Cortex o VictoriaMetrics recibiendo datos por `remote_write`. Además conviene usar recording rules para precalcular consultas pesadas, controlar la cardinalidad y, si hace falta, separar Prometheus por dominio en vez de uno gigante.',
    },
    {
      topic: 'observabilidad',
      question: '¿Para qué sirven las recording rules?',
      answer:
        'Precalculan expresiones PromQL costosas a intervalos regulares y guardan el resultado como una serie nueva, por ejemplo `job:http_requests:rate5m` con la suma de `rate` por job. Hacen que dashboards y alertas sean rápidos, reducen carga en las consultas y permiten agregar antes de mandar datos a un almacenamiento global. Se nombran con la convención `nivel:métrica:operaciones` y son la base de las reglas de burn rate de SLOs.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo armarías una estrategia de logs y trazas sin que el costo se dispare?',
      answer:
        'Con sampling de trazas: head sampling a un porcentaje bajo y tail sampling en el OpenTelemetry Collector para quedarte con todas las trazas con errores o lentas. En logs: niveles bien usados, sin loguear cada request exitosa en detalle, retención distinta por tipo (corta para debug, larga para auditoría) y almacenamiento barato como Loki, que indexa solo labels y no el texto. Además, métricas derivadas de logs y correlación por trace ID para no duplicar datos.',
    },
    {
      topic: 'observabilidad',
      question: 'Las alertas de tu equipo generan mucho ruido y la gente las ignora. ¿Qué hacés?',
      answer:
        'Hago un inventario de las alertas del último mes: cuántas veces sonó cada una y cuántas requirieron acción. Borro o bajo a ticket lo que no es accionable, convierto alertas de causa en alertas de síntoma basadas en SLOs, ajusto umbrales y duraciones (`for:` en Prometheus) para ignorar picos breves, y agrupo e inhibo en Alertmanager. Cada alerta que queda tiene dueño, severidad y runbook. La fatiga de alertas es peligrosa porque esconde la alerta que sí importa.',
    },
  ],
};
