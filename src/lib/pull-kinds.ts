/** The title without its conventional prefix: `feat(eventos): sponsor logos` → `sponsor logos`. */
export const pullSummary = (title: string) =>
  title.replace(/^\s*[a-z]+(\([^)]*\))?!?:\s*/i, '').replace(/^./, (c) => c.toUpperCase());
