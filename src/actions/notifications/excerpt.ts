/** The start of a text, on one line, for a notification's message. */
export const excerpt = (text: string, max = 80) => {
  const line = text.replace(/\s+/g, ' ').trim();
  return line.length <= max ? line : `${line.slice(0, max - 1).trimEnd()}…`;
};
