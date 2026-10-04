// Lo que siembra tests/e2e/support/seed-e2e.ts y usan los specs. Todo con ids y emails fijos para
// que los tests no dependan del orden ni de datos al azar.

export const PASSWORD = 'contraseña-e2e-segura';

export const USERS = {
  admin: { email: 'admin@e2e.pcn', name: 'Admin E2E' },
  member: { email: 'miembro@e2e.pcn', name: 'Miembro E2E' },
  organizer: { email: 'organizadora@e2e.pcn', name: 'Organizadora E2E' },
  /** Registrada pero sin verificar el email. */
  unverified: { email: 'sin-verificar@e2e.pcn', name: 'Sin Verificar E2E' },
  /** Para tests que cambian el perfil o la contraseña, así no afectan al resto. */
  scratch: { email: 'descartable@e2e.pcn', name: 'Descartable E2E' },
} as const;

export type Role = keyof typeof USERS;

/** Roles con sesión guardada por auth.setup.ts (storage state). */
export const SIGNED_IN_ROLES = ['admin', 'member', 'organizer'] as const;
export type SignedInRole = (typeof SIGNED_IN_ROLES)[number];

export const storageStatePath = (role: SignedInRole) => `tests/e2e/.auth/${role}.json`;

export const EVENTS = {
  /** Próximo, presencial, con cupo de 2 y la organizadora a cargo. */
  upcoming: { id: 'e2e-event-upcoming', name: 'Meetup E2E de Testing' },
  /** Próximo, online, sin cupo. */
  online: { id: 'e2e-event-online', name: 'Charla Online E2E' },
  /** Ya pasó, con charlas. */
  past: { id: 'e2e-event-past', name: 'Workshop E2E Pasado' },
  /** Próximo, lleno: cupo 1 ocupado por la organizadora. */
  full: { id: 'e2e-event-full', name: 'Evento Lleno E2E' },
} as const;

export const ADVISE = {
  id: 'e2e-advise',
  content: 'Escribí tests antes de refactorizar: te van a avisar cuando algo se rompa.',
};

export const PROJECT = { id: 'e2e-project', title: 'Proyecto E2E Open Source' };

export const ANNOUNCEMENTS = {
  published: { id: 'e2e-announcement', title: 'Anuncio E2E publicado' },
  draft: { id: 'e2e-announcement-draft', title: 'Anuncio E2E borrador' },
};

export const TESTIMONIAL = {
  id: 'e2e-testimonial',
  body: 'La comunidad E2E me ayudó a conseguir mi primer trabajo.',
};
