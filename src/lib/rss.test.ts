import { buildRssFeed, escapeXml } from './rss';

const channel = {
  title: 'programaConNosotros',
  description: 'Novedades',
  link: 'https://programaconnosotros.com',
  feedUrl: 'https://programaconnosotros.com/feed.xml',
};

describe('escapeXml', () => {
  it('escapes the five XML special characters', () => {
    expect(escapeXml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;',
    );
  });
});

describe('buildRssFeed', () => {
  it('lists items newest first with escaped text and RFC 822 dates', () => {
    const xml = buildRssFeed({
      ...channel,
      items: [
        {
          id: 'event-1',
          title: 'Meetup',
          link: 'https://programaconnosotros.com/eventos/1',
          description: 'Charlas & pizza',
          date: new Date('2026-09-01T12:00:00Z'),
          category: 'Eventos',
        },
        {
          id: 'announcement-1',
          title: 'Nuevo <curso>',
          link: 'https://programaconnosotros.com/anuncios',
          description: 'Ya está disponible',
          date: new Date('2026-09-20T12:00:00Z'),
          category: 'Anuncios',
        },
      ],
    });

    expect(xml.indexOf('announcement-1')).toBeLessThan(xml.indexOf('event-1'));
    expect(xml).toContain('<title>Nuevo &lt;curso&gt;</title>');
    expect(xml).toContain('<description>Charlas &amp; pizza</description>');
    expect(xml).toContain('<pubDate>Sun, 20 Sep 2026 12:00:00 GMT</pubDate>');
    expect(xml).toContain('<lastBuildDate>Sun, 20 Sep 2026 12:00:00 GMT</lastBuildDate>');
  });

  it('renders a valid channel with no items', () => {
    const xml = buildRssFeed({ ...channel, items: [] });

    expect(xml).toContain('<channel>');
    expect(xml).not.toContain('<item>');
  });
});
