import { createHighlighter, type BundledLanguage } from 'shiki';

// Labels in tech-notes.ts that are not shiki language ids.
const LANG_ALIASES: Record<string, BundledLanguage | 'text'> = { sh: 'bash', tree: 'text' };

const LANGS: BundledLanguage[] = [
  'bash',
  'dockerfile',
  'js',
  'json',
  'prisma',
  'sql',
  'ts',
  'tsx',
  'yaml',
];

const THEME = 'vitesse-dark';

// One highlighter for the whole server: loading grammars is the slow part.
let highlighter: ReturnType<typeof createHighlighter> | undefined;
const getHighlighter = () => (highlighter ??= createHighlighter({ themes: [THEME], langs: LANGS }));

/** Server-highlighted code; the block's own background shows through the theme's. */
export const HighlightedCode = async ({ code, lang }: { code: string; lang: string }) => {
  const resolved = LANG_ALIASES[lang] ?? lang;
  const language = (LANGS as string[]).includes(resolved) ? resolved : 'text';
  const html = (await getHighlighter()).codeToHtml(code, { lang: language, theme: THEME });

  return (
    <div
      className="overflow-x-auto p-3 font-mono text-[11px] leading-5 [tab-size:2] sm:text-xs sm:leading-5 [&_code]:font-mono [&_pre]:!bg-transparent"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
