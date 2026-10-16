import { createHash } from 'node:crypto';
import { createChallenge, randomInt } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { CappedMap } from 'altcha-lib/frameworks/nextjs';
import { verify } from 'altcha-lib/frameworks/shared';
import { TWO_FACTOR_KEY_ENV } from '@/lib/two-factor-crypto';

// Captcha de los formularios de autenticación (OWASP A07): ALTCHA, una prueba de trabajo que
// resuelve el navegador sin que la persona tenga que hacer nada (ni elegir semáforos) y sin
// terceros ni cookies de rastreo. Para un humano cuesta un segundo; para un bot que prueba miles
// de contraseñas o crea cuentas en masa, cada intento le cuesta CPU. Se suma al rate limit.
//
// Los desafíos van firmados con HMAC, así nadie puede inventarse uno fácil; la clave sale de
// TWO_FACTOR_ENCRYPTION_KEY (que ya está en los secrets del deploy), separada por dominio para que
// nunca sea la misma clave que cifra los secretos de 2FA.

const ALGORITHM = 'PBKDF2/SHA-256';
const COST = 5_000;
const EXPIRES_MINUTES = 10;

/** Outside production, a fixed key so dev, worktrees and tests work with no setup. */
const DEV_SECRET = 'pcn-dev-captcha-key';

const secrets = () => {
  const master = process.env[TWO_FACTOR_KEY_ENV];
  if (!master && process.env.NODE_ENV === 'production') {
    throw new Error(`${TWO_FACTOR_KEY_ENV} is missing: the captcha can't sign its challenges`);
  }
  const derive = (purpose: string) =>
    createHash('sha256')
      .update(`pcn-captcha:${purpose}:${master ?? DEV_SECRET}`)
      .digest('hex');
  return { signature: derive('signature'), keySignature: derive('key-signature') };
};

/**
 * Challenges already solved, so a solved payload can't be reused for another sign-in. In memory:
 * the site runs as a single server, and a challenge expires in minutes anyway.
 */
const usedChallenges = new CappedMap<string, boolean>({ maxSize: 50_000 });

/** A new signed challenge for the widget (GET /api/captcha). */
export const createCaptchaChallenge = async () => {
  const { signature, keySignature } = secrets();
  return createChallenge({
    algorithm: ALGORITHM,
    cost: COST,
    counter: randomInt(5_000, 10_000),
    deriveKey,
    expiresAt: new Date(Date.now() + EXPIRES_MINUTES * 60_000),
    hmacSignatureSecret: signature,
    hmacKeySignatureSecret: keySignature,
  });
};

/** Whether `payload` (what the widget submits) solves a challenge we issued, once. */
export const verifyCaptcha = async (payload: string | null | undefined) => {
  if (!payload || payload.length > 10_000) return false;
  const { signature, keySignature } = secrets();
  const { error } = await verify(payload, deriveKey, signature, keySignature, usedChallenges);
  return !error;
};

export const CAPTCHA_ERROR =
  'No pudimos verificar que no sos un bot. Recargá la página y probá de nuevo.';
