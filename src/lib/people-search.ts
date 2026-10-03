// Búsqueda de personas tolerante: cada palabra escrita tiene que aparecer en alguna parte de los
// datos de la persona (nombre completo, email, slogan, trabajo, estudio…), en cualquier orden, sin
// importar mayúsculas ni acentos. "sanc agus" encuentra a "Agustín Sánchez", "globant" a quien
// trabaja ahí y "utn" a quien estudia en la UTN.

type Text = string | null | undefined;

export const normalizeSearchText = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const searchTokens = (query: string) =>
  normalizeSearchText(query).split(/\s+/).filter(Boolean);

const haystack = (fields: Text[]) => normalizeSearchText(fields.filter(Boolean).join(' \u0000 '));

export function matchesPeopleQuery(fields: Text[], query: string) {
  const tokens = searchTokens(query);
  if (tokens.length === 0) return true;
  const text = haystack(fields);
  return tokens.every((token) => text.includes(token));
}

// Menor es mejor: primero quien tiene el nombre empezando por lo escrito, después quien tiene
// cada palabra al inicio de alguna parte del nombre, después coincidencias dentro del nombre y
// al final las que solo coinciden por otros datos (email, trabajo, estudio…).
function rank(name: string, tokens: string[]) {
  const normalizedName = normalizeSearchText(name);
  if (normalizedName.startsWith(tokens.join(' '))) return 0;
  const words = normalizedName.split(/[\s.\-_]+/);
  if (tokens.every((token) => words.some((word) => word.startsWith(token)))) return 1;
  if (tokens.every((token) => normalizedName.includes(token))) return 2;
  return 3;
}

export function searchPeople<T>(
  people: T[],
  query: string,
  {
    name,
    fields,
    limit,
  }: {
    name: (_person: T) => string;
    /** Todo lo que se busca, nombre incluido. */
    fields: (_person: T) => Text[];
    limit?: number;
  },
): T[] {
  const tokens = searchTokens(query);
  if (tokens.length === 0) return limit === undefined ? people : people.slice(0, limit);

  const matches = people
    .filter((person) => {
      const text = haystack(fields(person));
      return tokens.every((token) => text.includes(token));
    })
    .map((person) => ({ person, rank: rank(name(person), tokens) }))
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        name(a.person).localeCompare(name(b.person), 'es', { sensitivity: 'base' }),
    )
    .map(({ person }) => person);

  return limit === undefined ? matches : matches.slice(0, limit);
}

// Filtro global para tablas de TanStack con una persona por fila: busca en todos los textos de la
// fila a la vez, así "juan globant" encuentra a Juan aunque nombre y empresa estén en columnas
// distintas.
export function personRowFilter(row: { original: unknown }, _columnId: string, query: string) {
  const values = Object.entries(row.original as Record<string, unknown>)
    .filter(([key]) => key !== 'id' && key !== 'image')
    .map(([, value]) => value)
    .filter((value): value is string => typeof value === 'string');
  return matchesPeopleQuery(values, query);
}
