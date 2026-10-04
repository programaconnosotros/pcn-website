import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FeedItem } from '@/lib/feed';
import { renderInPlatform } from '@/test/platform';
import { FeedClient } from './feed-client';

const items: FeedItem[] = [
  {
    id: '1',
    kind: 'evento',
    day: '2025-03-10',
    sortKey: '2025-03-10T20:00',
    title: 'Meetup de marzo',
    description: 'Charlas y pizza',
    href: '/eventos/1',
    meta: 'Córdoba',
  },
  {
    id: '2',
    kind: 'fotos',
    day: '2025-03-10',
    sortKey: '2025-03-10T10:00',
    title: '12 fotos nuevas',
    href: '/galeria',
    thumbs: [
      { id: 't1', src: '/f1.jpg' },
      { id: 't2', src: '/f2.jpg' },
    ],
  },
  {
    id: '3',
    kind: 'conversacion',
    day: '2025-03-09',
    sortKey: '2025-03-09',
    title: 'Hablamos de IA',
    href: '/conversaciones',
    tag: 'evento',
  },
  {
    id: '4',
    kind: 'changelog',
    day: '2025-03-01',
    sortKey: '2025-03-01',
    title: 'Nuevo feed',
    href: '/changelog',
  },
];

const days = () => Array.from(document.querySelectorAll('section time'), (t) => t.textContent);

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('FeedClient', () => {
  it('groups items by day with friendly labels', () => {
    renderInPlatform(<FeedClient items={items} today="2025-03-10" />);

    expect(days()).toEqual(['hoy', 'ayer', expect.stringMatching(/sábado.*1.*marzo/)]);
    const meetup = screen.getByRole('link', { name: /Meetup de marzo/ });
    expect(meetup).toHaveAttribute('href', '/eventos/1');
    expect(meetup).toHaveTextContent('eventoCórdoba');
    expect(meetup).toHaveTextContent('Charlas y pizza');
    expect(
      within(screen.getByRole('link', { name: /12 fotos/ })).getAllByRole('presentation'),
    ).toHaveLength(2);
    expect(screen.getByRole('link', { name: /Hablamos de IA/ })).toHaveTextContent(/^evento/);
    expect(screen.getByRole('link', { name: /Nuevo feed/ })).toHaveTextContent('changelog');
  });

  it('only offers filters for kinds with items and filters by them', async () => {
    const user = userEvent.setup();
    renderInPlatform(<FeedClient items={items} today="2025-03-10" />);

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      '[todo]',
      '[eventos]',
      '[fotos]',
      '[conversaciones]',
      '[plataforma]',
    ]);
    await user.click(screen.getByRole('tab', { name: /fotos/ }));

    expect(screen.getByRole('tab', { name: /fotos/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('link').filter((link) => link.closest('section'))).toHaveLength(1);
    expect(days()).toEqual(['hoy']);
  });

  it('shows an empty feed', () => {
    renderInPlatform(<FeedClient items={[]} today="2025-03-10" />);

    expect(screen.getByText('nada nuevo por acá todavía')).toBeInTheDocument();
  });
});
