import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

// Control de acceso (OWASP A01): una server action se puede llamar desde el navegador con
// cualquier argumento, la use un form o no. Este test recorre cada export de cada archivo
// 'use server' y exige que valide la sesión o los permisos (directo o a través de una función del
// mismo archivo), salvo que esté en PUBLIC_ACTIONS con el motivo. Una action nueva sin chequeo
// hace fallar el test hasta que alguien decida a conciencia que es pública.

const SRC = join(process.cwd(), 'src');

/** Funciones que validan sesión o permisos. Llamar a cualquiera cuenta como chequeo. */
const AUTH_HELPERS = new Set([
  'getCurrentSession',
  'findSession',
  'requireAdmin',
  'getAdminUser',
  'requireAdminPage',
  'requireSessionUser',
  'getSessionUser',
  'requireEventManager',
  'canManageSomeEvent',
  'canManageEventById',
  'canManageEventOrganizers',
  'getEventManager',
  'canCreateEvents',
  'canEditEvent',
  'canDeleteEvent',
]);

/**
 * Exports que cualquiera puede llamar, con el motivo. `archivo#función`, ruta desde src/.
 * Son lecturas de lo que ya es público o formularios de quien todavía no tiene sesión.
 */
const PUBLIC_ACTIONS: Record<string, string> = {
  'actions/advice/get-best-advice.ts#getBestAdvice': 'consejos publicados, en /consejos',
  'actions/announcements/get-announcements.ts#fetchAnnouncements': 'solo anuncios publicados',
  'actions/announcements/get-event-announcements.ts#getEventAnnouncements':
    'anuncios publicados de un evento',
  'actions/announcements/get-events-for-select.ts#getEventsForSelect':
    'nombre y fecha de eventos públicos',
  'actions/auth/complete-password-reset.ts#completePasswordReset':
    'sin sesión; exige el código enviado por email',
  'actions/auth/request-password-reset.ts#requestPasswordReset':
    'sin sesión; rate limit y no revela si el email existe',
  'actions/auth/send-verification-code.ts#sendVerificationCode':
    'sin sesión; rate limit por IP y por email',
  'actions/auth/sign-in.ts#signIn': 'es el login',
  'actions/auth/sign-out.ts#signOut': 'borra la sesión de la cookie, si hay',
  'actions/auth/sign-up.ts#signUp': 'es el registro',
  'actions/auth/verify-email-code.ts#verifyEmailCode': 'sin sesión; límite de intentos por código',
  'actions/auth/verify-reset-code.ts#verifyResetCode': 'sin sesión; límite de intentos por código',
  'actions/events/check-event-capacity.ts#checkEventCapacity':
    'cupo de un evento, visible en su página',
  'actions/events/fetch-event.ts#fetchEvent': 'página pública del evento, sin inscriptos',
  'actions/events/fetch-events.ts#fetchEvents': 'listado público de eventos',
  'actions/events/fetch-home-events.ts#fetchHomeEvents': 'eventos de la home',
  'actions/events/fetch-upcoming-events.ts#fetchUpcomingEvents': 'próximos eventos públicos',
  'actions/projects/fetch-public-projects.ts#fetchPublicProjects': 'listado de /proyectos',
  'actions/talks/fetch-events-for-select.ts#fetchEventsForSelect':
    'nombre, fecha y lugar de eventos públicos',
  'actions/talks/fetch-public-talks.ts#fetchPublicTalks': 'listado de /charlas, sin teléfonos',
  'actions/testimonials/fetch-featured-testimonials.ts#fetchFeaturedTestimonials':
    'testimonios de la home',
  'actions/testimonials/fetch-testimonial.ts#fetchTestimonial': 'testimonio público',
  'actions/testimonials/fetch-testimonials.ts#fetchTestimonials': 'testimonios públicos',
  'actions/upload/get-presigned-url-public.ts#getPresignedUrlPublic':
    'foto del registro: carpeta fija, rate limit, solo imágenes',
  'actions/users/fetch-community-members.ts#fetchCommunityMembers':
    'miembros en /miembros, sin emails',
  'actions/users/get-user-summary.ts#getUserSummary': 'lo mismo que muestra el perfil público',
};

const serverActionFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'generated' ? [] : serverActionFiles(path);
    if (!/\.tsx?$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
    const source = readFileSync(path, 'utf8');
    return /^\s*['"]use server['"]/.test(source) ? [path] : [];
  });

type ExportedAction = { key: string; checksAuth: boolean };

/** Cada función exportada del archivo y si llega a un AUTH_HELPER. */
const exportedActions = (path: string): ExportedAction[] => {
  const file = relative(SRC, path);
  const source = ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );

  // Funciones del archivo por nombre, para seguir llamadas a helpers locales
  const bodies = new Map<string, ts.Node>();
  const exported: string[] = [];
  const isExported = (node: ts.Node) =>
    ts.canHaveModifiers(node) &&
    !!ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

  for (const statement of source.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      bodies.set(statement.name.text, statement);
      if (isExported(statement)) exported.push(statement.name.text);
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
        bodies.set(declaration.name.text, declaration.initializer);
        if (isExported(statement)) exported.push(declaration.name.text);
      }
    }
  }

  const reachesAuth = (name: string, seen = new Set<string>()): boolean => {
    const body = bodies.get(name);
    if (!body || seen.has(name)) return false;
    seen.add(name);
    let found = false;
    const visit = (node: ts.Node) => {
      if (found) return;
      if (ts.isIdentifier(node)) {
        if (AUTH_HELPERS.has(node.text)) found = true;
        else if (node.text !== name && bodies.has(node.text) && reachesAuth(node.text, seen))
          found = true;
      }
      ts.forEachChild(node, visit);
    };
    visit(body);
    return found;
  };

  return exported.map((name) => ({ key: `${file}#${name}`, checksAuth: reachesAuth(name) }));
};

describe('server actions: access control', () => {
  const actions = serverActionFiles(SRC).flatMap(exportedActions);

  it('finds the server actions', () => {
    expect(actions.length).toBeGreaterThan(100);
  });

  it('checks the session or permissions in every action that is not explicitly public', () => {
    const unchecked = actions
      .filter(({ key, checksAuth }) => !checksAuth && !(key in PUBLIC_ACTIONS))
      .map(({ key }) => key);
    expect(unchecked).toEqual([]);
  });

  it('only lists public actions that still exist', () => {
    const keys = new Set(actions.map(({ key }) => key));
    expect(Object.keys(PUBLIC_ACTIONS).filter((key) => !keys.has(key))).toEqual([]);
  });
});
