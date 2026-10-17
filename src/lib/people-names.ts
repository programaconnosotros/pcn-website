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

/**
 * A member's name as the site shows it: every word longer than three letters starts with a
 * capital, so "juan pablo de la fuente" reads "Juan Pablo de la Fuente". Short words ("de", "la",
 * "del") and the rest of each word stay as typed ("McDonald" keeps its capital D). Only for
 * showing the name: the profile form edits what the member typed.
 */
export const displayName = (name: string) =>
  name.replace(/\p{L}[\p{L}\p{M}'’]*/gu, (word) =>
    word.replace(/\p{M}/gu, '').length > 3
      ? word.charAt(0).toLocaleUpperCase('es') + word.slice(1)
      : word,
  );
