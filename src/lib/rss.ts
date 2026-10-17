export type FeedItem = {
  /** Stable id, used as the item's guid. */
  id: string;
  title: string;
  /** Absolute URL of the item's page. */
  link: string;
  description: string;
  date: Date;
  /** RSS category, e.g. `Anuncios` or `Eventos`. */
  category: string;
};

type FeedChannel = {
  title: string;
  description: string;
  /** Absolute URL of the site. */
  link: string;
  /** Absolute URL of the feed itself, for the atom:link self reference. */
  feedUrl: string;
  items: FeedItem[];
};

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Builds an RSS 2.0 document with the items sorted newest first. */
export function buildRssFeed({ title, description, link, feedUrl, items }: FeedChannel): string {
  const sorted = [...items].sort((a, b) => b.date.getTime() - a.date.getTime());
  const lastBuildDate = sorted[0]?.date ?? new Date(0);

  const itemsXml = sorted
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.id)}</guid>
      <pubDate>${item.date.toUTCString()}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <description>${escapeXml(item.description)}</description>
    </item>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <language>es</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>
`;
}
