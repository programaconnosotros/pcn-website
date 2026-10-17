import raw from './consejos.json';

// The consejos are shown as published by the member, so they speak in first person (or address
// the reader). Phrases that talk about the author in third person read as someone else's quote.
// Whole words: `\b` doesn't treat accented letters as part of a word.
const words = (pattern: string) => new RegExp(`(?<!\\p{L})(${pattern})(?!\\p{L})`, 'iu');

const THIRD_PERSON = [
  words('en su caso'),
  words('le (funcionó|resultó|permitió|sirvió|pasó|bloquearon|dio)'),
  words('se pasó|armó|probó|llegó|pasó de|cubre su'),
];

describe('extracted consejos', () => {
  it('are written in the member’s own voice, never in third person', () => {
    const offenders = raw
      .filter(({ content }) => THIRD_PERSON.some((pattern) => pattern.test(content)))
      .map(({ id }) => id);
    expect(offenders).toEqual([]);
  });
});
