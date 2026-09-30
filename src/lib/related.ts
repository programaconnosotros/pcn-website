// Words too common in the site's copy to say anything about what a text is about.
const STOPWORDS = new Set(
  (
    'para como este esta estos estas desde hasta sobre entre cada todo todos todas tambien ' +
    'puedes podes permite manera forma mucho muchos donde cuando porque aqui curso cursos ' +
    'aprende aprender aprenda vamos nuestro nuestra with from that this your what about into ' +
    'more than the and for are how uno una unos unas del las los que con por sus mas muy'
  ).split(' '),
);

// Lowercase words without accents, long enough to carry meaning.
export const keywords = (text: string) =>
  new Set(
    text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .split(/[^a-z0-9+#]+/)
      .filter((word) => word.length >= 3 && !STOPWORDS.has(word)),
  );

/**
 * Ranks `items` by how many keywords they share with `source`, most related first. Ties keep
 * the original order, so callers can pre-sort by their own fallback (newest, curated, ...).
 */
export const rankRelated = <T>(source: string, items: T[], text: (item: T) => string): T[] => {
  const sourceWords = keywords(source);
  return items
    .map((item, index) => {
      let score = 0;
      for (const word of keywords(text(item))) if (sourceWords.has(word)) score++;
      return { item, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
};
