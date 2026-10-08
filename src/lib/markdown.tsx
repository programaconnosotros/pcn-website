import type { ReactNode } from 'react';

// A small markdown renderer for what members write on the forum. It builds React elements, never
// HTML strings, so whatever someone types is rendered as text: no raw HTML, no scripts, and links
// only to http(s) addresses. Covers what people actually use in a thread: headings, paragraphs,
// lists, quotes, fenced code, rules, and inline code, bold, italics and links.

const SAFE_URL = /^https?:\/\/[^\s<>"']+$/i;

/** `[text](url)`, `**bold**`, `*italic*`/`_italic_`, `` `code` `` and bare http(s) URLs. */
const INLINE =
  /(`[^`\n]+`)|\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|(?:^|(?<=[\s(]))[*_]([^*_\n]+)[*_](?=$|[\s.,;:!?)])|(https?:\/\/[^\s<>"')\]]+[^\s<>"')\].,;:!?])/g;

const linkClassName =
  'text-pcnGreen underline decoration-dotted underline-offset-2 hover:decoration-solid';

const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc" className={linkClassName}>
    {children}
  </a>
);

export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const key = `${keyPrefix}-${index++}`;
    const [whole, code, linkText, linkUrl, bold, italic, bareUrl] = match;
    if (code) {
      nodes.push(
        <code key={key} className="bg-pcnGreen/10 px-1 py-0.5 font-mono text-[0.9em] text-pcnGreen">
          {code.slice(1, -1)}
        </code>,
      );
    } else if (linkText !== undefined) {
      nodes.push(
        SAFE_URL.test(linkUrl) ? (
          <ExternalLink key={key} href={linkUrl}>
            {renderInline(linkText, key)}
          </ExternalLink>
        ) : (
          whole
        ),
      );
    } else if (bold !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {renderInline(bold, key)}
        </strong>,
      );
    } else if (italic !== undefined) {
      nodes.push(<em key={key}>{renderInline(italic, key)}</em>);
    } else if (bareUrl) {
      nodes.push(
        <ExternalLink key={key} href={bareUrl}>
          {bareUrl}
        </ExternalLink>,
      );
    }
    last = start + whole.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Lines joined with <br />, each rendered inline. */
const inlineLines = (lines: string[], key: string) =>
  lines.flatMap((line, i) => [
    ...(i > 0 ? [<br key={`${key}-br-${i}`} />] : []),
    ...renderInline(line, `${key}-${i}`),
  ]);

const HEADING = /^(#{1,3})\s+(.*)$/;
const BULLET = /^\s*[-*+]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const FENCE = /^```\s*([\w+-]*)\s*$/;
const RULE = /^(-{3,}|\*{3,}|_{3,})\s*$/;

export function Markdown({ content, className }: { content: string; className?: string }) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${blocks.length}`;

    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = line.match(FENCE);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE.test(lines[i])) code.push(lines[i++]);
      i++; // closing fence (or the end)
      blocks.push(
        <pre
          key={key}
          data-language={fence[1] || undefined}
          className="overflow-x-auto border border-pcnGreen-200 bg-black/40 p-3 font-mono text-xs leading-relaxed text-foreground/90"
        >
          <code>{code.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      const level = heading[1].length;
      const Tag = (['h2', 'h3', 'h4'] as const)[level - 1];
      blocks.push(
        <Tag
          key={key}
          className={
            level === 1
              ? 'font-mono text-lg font-semibold text-foreground'
              : 'font-mono text-base font-semibold text-foreground'
          }
        >
          <span className="text-pcnGreen-600">{heading[1]} </span>
          {renderInline(heading[2], key)}
        </Tag>,
      );
      i++;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push(<hr key={key} className="border-dashed border-pcnGreen-200" />);
      i++;
      continue;
    }

    if (BULLET.test(line) || ORDERED.test(line)) {
      const ordered = !BULLET.test(line);
      const pattern = ordered ? ORDERED : BULLET;
      const items: string[] = [];
      while (i < lines.length && pattern.test(lines[i])) items.push(lines[i++].match(pattern)![1]);
      const List = ordered ? 'ol' : 'ul';
      blocks.push(
        <List
          key={key}
          className={`flex flex-col gap-1 pl-5 ${ordered ? 'list-decimal' : 'list-disc'} marker:text-pcnGreen-600`}
        >
          {items.map((item, n) => (
            <li key={n}>{renderInline(item, `${key}-${n}`)}</li>
          ))}
        </List>,
      );
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i])) quoted.push(lines[i++].match(QUOTE)![1]);
      blocks.push(
        <blockquote
          key={key}
          className="border-l-2 border-pcnGreen-600 pl-3 text-muted-foreground italic"
        >
          {inlineLines(quoted, key)}
        </blockquote>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      ![FENCE, HEADING, BULLET, ORDERED, QUOTE, RULE].some((p) => p.test(lines[i]))
    ) {
      paragraph.push(lines[i++]);
    }
    blocks.push(<p key={key}>{inlineLines(paragraph, key)}</p>);
  }

  return (
    <div className={className ?? 'flex flex-col gap-3 text-sm leading-relaxed text-foreground/90'}>
      {blocks}
    </div>
  );
}

/** The text without markdown syntax, for excerpts and metadata. */
export const plainText = (content: string) =>
  content
    .replace(/```[\s\S]*?(```|$)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
