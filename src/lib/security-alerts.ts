import { notifyAdmins } from '@/actions/notifications/notify-admins';

// Avisos a los admins (campanita de notificaciones) de lo que pide mirar a alguien: un error nuevo
// en el servidor o alguien probando contraseñas o códigos. Sin esto los logs existen pero nadie
// se entera (OWASP A09). Cada aviso se manda una vez por `key` y por ventana, así un error que se
// repite mil veces o un ataque sostenido no llenan las notificaciones.

const WINDOW_MS = 60 * 60 * 1000;
const lastSent = new Map<string, number>();

type Alert = { type: string; title: string; message: string; metadata?: Record<string, unknown> };

/** Avisa a los admins salvo que ya se haya avisado `key` en la última hora. Nunca lanza. */
export const alertAdmins = async (key: string, alert: Alert) => {
  const now = Date.now();
  const previous = lastSent.get(key);
  if (previous !== undefined && now - previous < WINDOW_MS) return false;
  lastSent.set(key, now);

  try {
    await notifyAdmins(alert);
    return true;
  } catch (error) {
    console.error('Failed to alert admins:', error instanceof Error ? error.message : error);
    return false;
  }
};

export const resetSecurityAlerts = () => lastSent.clear();

/** Formularios donde llegar al límite indica que alguien está probando credenciales o códigos. */
const BRUTE_FORCE_LIMITS = new Set(['signIn', 'verifyCode', 'sendCode']);

const LIMIT_LABELS: Record<string, string> = {
  signIn: 'inicio de sesión',
  verifyCode: 'códigos de verificación',
  sendCode: 'envío de códigos',
};

/** Avisa cuando una IP o usuario llega al límite de un formulario sensible. */
export const alertRateLimitHit = (limit: string, identity: string) =>
  BRUTE_FORCE_LIMITS.has(limit)
    ? alertAdmins(`rate-limit:${limit}:${identity}`, {
        type: 'security_rate_limit',
        title: 'Posible ataque de fuerza bruta',
        message: `${identity} llegó al límite de ${LIMIT_LABELS[limit]}. Los intentos quedan bloqueados mientras dure la ventana.`,
        metadata: { limit, identity },
      })
    : Promise.resolve(false);

/** Avisa de un error del servidor, una vez por hora por mensaje. */
export const alertServerError = (message: string, path?: string | null) =>
  alertAdmins(`error:${message.slice(0, 200)}`, {
    type: 'server_error',
    title: 'Error en el servidor',
    message: `${message.slice(0, 300)}${path ? ` (en ${path})` : ''}. Detalle en /monitoreo.`,
    metadata: { path: path ?? null },
  });
