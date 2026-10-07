/**
 * The people in a credit line like "Ana López (Acme), Beto y Caro & Dani": one name each,
 * without what's in parentheses.
 */
export const splitPeople = (text: string | null | undefined) =>
  (text ?? '')
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s*,\s*|\s+[ye]\s+|\s+&\s+|\s+and\s+/)
    .map((name) => name.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
