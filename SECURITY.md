# Política de Seguridad

Los mantenedores de **PCN** se toman en serio la seguridad del proyecto y de sus usuarios. Este documento indica qué recibe soporte de seguridad, cómo reportar una vulnerabilidad de forma responsable y qué esperar de nuestra parte una vez enviado el reporte.

## Versiones con soporte

PCN es un sitio web con despliegue continuo y no publica versiones numeradas. Solo recibe soporte de seguridad la versión desplegada actualmente en producción ([programaconnosotros.com](https://programaconnosotros.com)), que corresponde a la rama `main`.

| Entorno / rama              | Soporte                                                                  |
| --------------------------- | ------------------------------------------------------------------------ |
| Producción (`main`)         | :white_check_mark:                                                       |
| `testing` (preproducción)   | :x: (aceptamos reportes si el problema puede llegar a producción)        |
| Otras ramas y forks         | :x:                                                                      |

Al reportar, indicá el hash del commit o la fecha y hora en que observaste el problema.

## Cómo reportar una vulnerabilidad

**No reportes vulnerabilidades de seguridad a través de issues, pull requests, discusiones públicas de GitHub ni ningún otro canal público.**

Usá alguno de estos canales privados:

1. **GitHub Private Vulnerability Reporting (preferido):** ingresá a la pestaña **Security** del repositorio y hacé clic en **"Report a vulnerability"**.
2. **Correo electrónico:** [agus@dizenz.com](mailto:agus@dizenz.com)
   - Si querés cifrar el reporte, usá nuestra clave PGP: `<KEY_ID / FINGERPRINT>` (disponible en `<URL>`).

### Qué incluir en el reporte

Para que podamos analizar y corregir el problema rápidamente, incluí toda la información posible:

- Tipo de vulnerabilidad (por ejemplo: SQL injection, XSS, IDOR, RCE, bypass de autenticación).
- Componente afectado, ruta(s) de archivo(s), endpoint(s) o URL(s), y hash del commit o fecha en que lo observaste.
- Configuración necesaria para reproducir el problema, si corresponde.
- Pasos detallados para reproducirlo.
- Prueba de concepto (PoC) o código de explotación, si lo tenés.
- Impacto: qué podría lograr un atacante y bajo qué condiciones.
- Severidad estimada (vector CVSS v3.1 o v4.0, si lo tenés).
- Cualquier propuesta de corrección o mitigación.

Los reportes pueden redactarse en **español** o en **inglés**.

## Proceso de respuesta y plazos

| Etapa                                      | Plazo objetivo                                  |
| ------------------------------------------ | ----------------------------------------------- |
| Acuse de recibo                            | Dentro de los **3 días hábiles**                |
| Análisis inicial y evaluación de severidad | Dentro de los **7 días hábiles**                |
| Actualizaciones de estado al reportante    | Como mínimo cada **14 días**                    |
| Corrección en producción: Crítica          | Dentro de los **7 días** desde la confirmación  |
| Corrección en producción: Alta             | Dentro de los **30 días** desde la confirmación |
| Corrección en producción: Media            | Dentro de los **60 días** desde la confirmación |
| Corrección en producción: Baja             | Dentro de los **90 días** desde la confirmación |

La severidad se evalúa con [CVSS](https://www.first.org/cvss/), ajustada al contexto real de uso del proyecto.

### Si el reporte es aceptado

- Confirmaremos la vulnerabilidad y acordaremos la severidad con vos.
- Desarrollaremos y probaremos una corrección (pasando por `testing`), la desplegaremos en producción y es posible que te pidamos validarla.
- Solicitaremos un CVE (a través de GitHub Security Advisories) cuando corresponda.
- Publicaremos un aviso de seguridad (security advisory) con la descripción del problema, el período en que estuvo expuesto, el commit que lo corrige y, si aplica, las acciones que deben tomar los usuarios (por ejemplo, cambiar su contraseña).
- Te daremos crédito en el aviso, salvo que prefieras mantenerte en el anonimato.

### Si el reporte es rechazado

Te explicaremos el motivo (por ejemplo: no es reproducible, está fuera de alcance, es un comportamiento esperado o ya era conocido). Podés enviar información adicional para que lo reconsideremos.

## Política de divulgación coordinada

Seguimos un modelo de **divulgación coordinada**:

- Te pedimos que nos des un tiempo razonable para corregir el problema antes de hacerlo público. El período de embargo por defecto es de **90 días** desde el reporte inicial o hasta que la corrección esté desplegada en producción, lo que ocurra primero.
- Si la vulnerabilidad está siendo explotada activamente, podemos acortar este plazo y publicar mitigaciones antes.
- Coordinaremos con vos la fecha de divulgación pública.

## Alcance

### Dentro del alcance

- El código fuente de este repositorio (rama `main`).
- El sitio en producción: [programaconnosotros.com](https://programaconnosotros.com).
- La configuración de despliegue e infraestructura incluida en el repositorio (GitHub Actions, Docker, Kamal).

### Fuera del alcance

- Vulnerabilidades en dependencias de terceros que ya son públicas y están siendo tratadas por el proyecto original. Reportalas a ese proyecto (sí nos interesan los reportes que demuestren que la vulnerabilidad de una dependencia es **explotable** en PCN).
- Resultados de escáneres automáticos sin impacto demostrado.
- Falta de cabeceras de seguridad o de buenas prácticas sin un exploit demostrable.
- Self-XSS, clickjacking en páginas sin acciones sensibles, CSRF en el cierre de sesión.
- Ataques de denegación de servicio (DoS/DDoS) o pruebas de carga.
- Ingeniería social, phishing o ataques físicos contra mantenedores o usuarios.
- Problemas que requieran un dispositivo comprometido, acceso root/administrador, o que solo afecten a ramas o forks sin soporte.

## Puerto seguro (Safe Harbor)

Consideramos autorizada toda investigación de seguridad realizada de buena fe conforme a esta política. No iniciaremos ni apoyaremos acciones legales contra investigadores que:

- Hagan un esfuerzo de buena fe para evitar violaciones de privacidad, destrucción de datos e interrupciones del servicio.
- Solo interactúen con cuentas propias o con cuentas para las que tengan permiso explícito.
- No extraigan, conserven ni divulguen datos más allá de lo necesario para demostrar la vulnerabilidad.
- Reporten la vulnerabilidad a la brevedad y no la divulguen públicamente antes de la fecha acordada.
- No utilicen la vulnerabilidad con ningún otro fin que no sea demostrarla.

Si no estás seguro de que tu investigación cumpla con esta política, escribinos antes de continuar.

## Reconocimientos

Actualmente PCN no cuenta con un programa de recompensas (bug bounty) pago. Los reportes válidos serán reconocidos en el aviso de seguridad correspondiente y en nuestra sección de [Agradecimientos / Hall of Fame](<URL>), con el consentimiento del reportante.

## Actualizaciones de seguridad

Los avisos de seguridad se publican en la sección [Security Advisories](../../security/advisories) del repositorio. Para recibir notificaciones, seguí el repositorio con **Watch → Custom → Security alerts**.

