// Pure helpers behind ForcedStateStyles (forced-state-styles.tsx), kept apart so they can be
// unit tested without a DOM.

export type ForcedState = 'hover' | 'focus' | 'active';

// Interaction pseudo-classes and the forced state each one stands for. Longest names first so
// `:focus` never swallows the start of `:focus-visible`.
const PSEUDO_TO_STATE: [string, ForcedState][] = [
  ['focus-visible', 'focus'],
  ['focus-within', 'focus'],
  ['focus', 'focus'],
  ['hover', 'hover'],
  ['active', 'active'],
];

// An unescaped `:hover`, `:focus-visible`… (Tailwind escapes the colon in class names, e.g.
// `.hover\:text-pcnGreen:hover`, so `\:` must not count).
const PSEUDO_RE = /(?<!\\):(focus-visible|focus-within|focus|hover|active)(?![\w-])/g;
export const HAS_PSEUDO_RE = /(?<!\\):(focus-visible|focus-within|focus|hover|active)(?![\w-])/;

/** Splits a selector list on top-level commas (not the ones inside `:not(…)` or `:is(…)`). */
export const splitSelectorList = (selectorText: string) => {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selectorText.length; i++) {
    const char = selectorText[i];
    if (char === '\\') i++;
    else if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    else if (char === ',' && depth === 0) {
      parts.push(selectorText.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(selectorText.slice(start).trim());
  return parts;
};

/**
 * `.btn:hover .icon` → `[data-force-state="hover"] .btn .icon`: the same declarations, applied
 * to everything inside a wrapper that forces that state. Selectors that mix states or test one
 * inside `:not(…)` are left alone.
 */
export const forceSelector = (selector: string): string | null => {
  const states = new Set<ForcedState>();
  for (const match of Array.from(selector.matchAll(PSEUDO_RE))) {
    states.add(PSEUDO_TO_STATE.find(([pseudo]) => pseudo === match[1])![1]);
  }
  if (states.size !== 1) return null;
  if (/\([^)]*(?<!\\):(focus|hover|active)/.test(selector)) return null;
  const [state] = Array.from(states);
  return `[data-force-state="${state}"] ${selector.replace(PSEUDO_RE, '')}`;
};
