import { Fragment } from 'react';

// Lowercase without accents, one UTF-16 unit at a time so indices line up with the original text.
export const normalize = (text: string) =>
  text
    .split('')
    .map(
      (char) =>
        char
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .charAt(0) || char,
    )
    .join('');

// Wraps every accent-insensitive match of `query` in a lit <mark>.
export function Highlight({ text, query }: { text: string; query: string }) {
  const needle = normalize(query.trim());
  if (!needle) return <>{text}</>;

  const haystack = normalize(text);
  const parts: { text: string; match: boolean }[] = [];
  let cursor = 0;
  for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, cursor)) {
    if (at > cursor) parts.push({ text: text.slice(cursor, at), match: false });
    parts.push({ text: text.slice(at, at + needle.length), match: true });
    cursor = at + needle.length;
  }
  parts.push({ text: text.slice(cursor), match: false });

  return (
    <>
      {parts.map((part, i) =>
        part.match ? (
          <mark key={i} className="bg-pcnGreen/20 text-pcnGreen">
            {part.text}
          </mark>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}
