// Who counts as a member: neither suspended by an admin nor deactivated by themselves. Every
// list, count, picker or broadcast of users filters with this, so a deactivated account never
// shows up again or gets mailed.
export const ACTIVE_USER = { suspendedAt: null, deactivatedAt: null } as const;

/** Name shown wherever a deactivated account's past content still appears. */
export const DEACTIVATED_NAME = 'Cuenta desactivada';

/** Domain of the placeholder emails deactivated accounts get, which can't receive mail. */
export const DEACTIVATED_EMAIL_DOMAIN = 'cuentas-desactivadas.invalid';

export const isDeactivatedEmail = (email: string) =>
  email.toLowerCase().endsWith(`@${DEACTIVATED_EMAIL_DOMAIN}`);

/** What the person types to confirm the deactivation, besides their password. */
export const DEACTIVATION_PHRASE = 'desactivar';
