import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { VisibleChangelogEntry } from '@/lib/changelog';
import { renderInPlatform } from '@/test/platform';
import { ChangelogClient } from './changelog-client';

const entries: VisibleChangelogEntry[] = [
  {
    date: '2025-03-10',
    area: 'feed',
    title: 'Nuevo feed',
    description: 'Todo lo que pasa en la comunidad',
    href: '/feed',
    adminOnly: false,
    authors: [
      { login: 'agus-sanc', user: { id: 'u1', name: 'Agustín Sánchez', image: null } },
      { login: 'externo', user: null },
    ],
  },
  {
    date: '2025-03-10',
    area: 'admin',
    title: 'Monitoreo',
    description: 'Errores y logs',
    adminOnly: true,
    authors: [{ login: 'bruno', user: null }],
  },
  {
    date: '2025-02-01',
    area: 'eventos',
    title: 'Inscripciones',
    description: 'Lista de espera',
    adminOnly: false,
    authors: [],
  },
];

const titles = () => Array.from(document.querySelectorAll('article h3'), (h) => h.textContent);

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('ChangelogClient', () => {
  it('lists the changes by day with authors and links', () => {
    renderInPlatform(<ChangelogClient entries={entries} isAdmin={false} />);

    expect(Array.from(document.querySelectorAll('section time'), (t) => t.textContent)).toEqual([
      '2025-03-10',
      '2025-02-01',
    ]);
    expect(screen.getByRole('link', { name: 'Nuevo feed' })).toHaveAttribute('href', '/feed');
    expect(screen.getByTitle('Ver el perfil de Agustín Sánchez')).toHaveAttribute(
      'href',
      '/perfil/u1',
    );
    expect(screen.getAllByTitle('Sin perfil vinculado en PCN')).toHaveLength(2);
    expect(screen.getByText('solo admins')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /vincular perfiles/ })).not.toBeInTheDocument();
    expect(screen.getByText(/ cambios$/)).toHaveTextContent('3/3 cambios');
  });

  it('links admins to the identity links', () => {
    renderInPlatform(<ChangelogClient entries={entries} isAdmin />);

    expect(screen.getByRole('link', { name: /vincular perfiles/ })).toHaveAttribute(
      'href',
      '/vinculos',
    );
  });

  it('searches titles, areas and authors without accents', async () => {
    const user = userEvent.setup();
    renderInPlatform(<ChangelogClient entries={entries} isAdmin={false} />);
    const search = screen.getByRole('textbox', { name: 'Buscar cambios' });

    await user.type(search, 'agustin');
    expect(titles()).toEqual(['Nuevo feed']);

    await user.clear(search);
    await user.type(search, 'eventos');
    expect(titles()).toEqual(['Inscripciones']);

    await user.type(search, 'zzz');
    expect(screen.getByText(/0 resultados/)).toHaveTextContent('0 resultados para "eventoszzz"');
  });

  it('shows 0 results when there are no entries', () => {
    renderInPlatform(<ChangelogClient entries={[]} isAdmin={false} />);

    expect(screen.getByText(/0 resultados/)).toHaveTextContent(/^\$ 0 resultados$/);
  });
});
