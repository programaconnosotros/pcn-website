import { NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import sanitizeHtml from 'sanitize-html';
import { articles } from '@/app/(platform)/lectura/articles';

export const runtime = 'nodejs';

const allowedUrls = new Set(articles.map((a) => a.url));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // SSRF guard: only allow URLs present in the articles data
  if (!allowedUrls.has(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream responded with ${response.status}` },
        { status: 502 },
      );
    }

    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const parsed = reader.parse();

    if (!parsed) {
      return NextResponse.json({ error: 'Could not extract article content' }, { status: 502 });
    }

    const cleanContent = sanitizeHtml(parsed.content, {
      allowedTags: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'a',
        'ul',
        'ol',
        'li',
        'blockquote',
        'pre',
        'code',
        'em',
        'strong',
        'b',
        'i',
        'u',
        'br',
        'hr',
        'img',
        'figure',
        'figcaption',
        'picture',
        'source',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'caption',
        'div',
        'span',
        'mark',
        'del',
        's',
        'sub',
        'sup',
      ],
      allowedAttributes: {
        a: ['href', 'title'],
        img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
        source: ['srcset', 'media', 'type'],
        code: ['class'],
        pre: ['class'],
        td: ['colspan', 'rowspan'],
        th: ['colspan', 'rowspan', 'scope'],
        '*': ['class'],
      },
      transformTags: {
        a: (tagName, attribs) => ({
          tagName,
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
      },
      allowedSchemes: ['http', 'https', 'data'],
    });

    return NextResponse.json(
      {
        title: parsed.title,
        byline: parsed.byline,
        siteName: parsed.siteName,
        content: cleanContent,
        length: parsed.length,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
