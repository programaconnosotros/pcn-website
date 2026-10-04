import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { shortHash } from '@/components/conversations/conversation-utils';
import { renderInPlatform } from '@/test/platform';
import { ConversationsClient } from './conversations-client';

jest.mock('@/data/whatsapp-conversations', () => ({
  conversations: [
    {
      title: 'Testing en React',
      date: '2025-05-02',
      summary: 'Ana habló de tests.',
      participants: ['Ana', 'Bruno'],
    },
    {
      title: 'Charla grupal de IA',
      date: '2025-06-10',
      summary: 'Muchos opinaron sobre agentes.',
      participants: ['Ana', 'Bruno', 'Carla', 'Diego', 'Eva'],
      eventId: 'ev1',
    },
    {
      title: 'Primer mensaje',
      date: '2025-04-20',
      summary: 'Bienvenida.',
      participants: [],
    },
  ],
}));

const conversation = {
  title: 'Testing en React',
  date: '2025-05-02',
  summary: 'Ana habló de tests.',
  participants: ['Ana', 'Bruno'],
};

const titles = () =>
  Array.from(document.querySelectorAll('article h3 button'), (button) => button.textContent);

const renderClient = (isAdmin = false) =>
  renderInPlatform(
    <ConversationsClient
      profiles={{ Ana: { id: 'u1', name: 'Ana López', image: null } }}
      events={{ ev1: 'Meetup virtual' }}
      isAdmin={isAdmin}
    />,
  );

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('ConversationsClient', () => {
  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn() as unknown as typeof Element.prototype.scrollTo;
  });
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('lists conversations by month, newest first, with stats', () => {
    renderClient(true);

    expect(titles()).toEqual(['Charla grupal de IA', 'Testing en React', 'Primer mensaje']);
    expect(document.getElementById('m-2025-06')).toHaveTextContent('junio');
    expect(document.getElementById('m-2025-06')).toHaveTextContent(
      '1 grupales con muchos participantes',
    );
    expect(screen.getByText('voces').nextSibling).toHaveTextContent('5');
    expect(screen.getByRole('link', { name: /vincular perfiles/ })).toHaveAttribute(
      'href',
      '/vinculos',
    );
    expect(screen.getAllByRole('link', { name: 'Meetup virtual' }).length).toBeGreaterThan(0);
  });

  it('filters by text, by group threads and by frequent voices', async () => {
    const user = userEvent.setup();
    renderClient();

    await user.type(screen.getByRole('textbox', { name: 'Buscar conversaciones' }), 'agentes');
    expect(titles()).toEqual(['Charla grupal de IA']);
    await user.clear(screen.getByRole('textbox', { name: 'Buscar conversaciones' }));

    await user.click(screen.getByRole('button', { name: /--muchos-participantes/ }));
    expect(titles()).toEqual(['Charla grupal de IA']);
    await user.click(screen.getByRole('button', { name: /--muchos-participantes/ }));

    const voices = screen.getByText('voces frecuentes:').parentElement!;
    await user.click(within(voices).getByRole('button', { name: /^@ ?Bruno/ }));
    expect(titles()).toEqual(['Charla grupal de IA', 'Testing en React']);
    expect(screen.getByRole('button', { name: /--author="Bruno"/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Quitar filtro de persona/ }));
    expect(titles()).toHaveLength(3);

    await user.type(screen.getByRole('textbox', { name: 'Buscar conversaciones' }), 'nada');
    expect(screen.getByText(/0 resultados/)).toHaveTextContent('0 resultados para "nada"');
  });

  it('combines the group and participant filters', async () => {
    const user = userEvent.setup();
    renderClient();

    await user.click(screen.getByRole('button', { name: /--muchos-participantes/ }));
    await user.click(screen.getByRole('button', { name: /^@ ?Eva$/ }));
    await user.click(screen.getByRole('button', { name: /--muchos-participantes/ }));
    expect(titles()).toEqual(['Charla grupal de IA']);
  });

  it('opens a conversation, steps through the list and filters from the dialog', async () => {
    const user = userEvent.setup();
    renderClient();

    await user.click(screen.getByRole('button', { name: 'Testing en React' }));
    const dialog = screen.getByRole('dialog', { name: 'Testing en React' });
    expect(within(dialog).getByRole('link', { name: 'Ana' })).toHaveAttribute('href', '/perfil/u1');

    await user.click(within(dialog).getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('dialog', { name: 'Primer mensaje' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: /^@ ?Bruno$/ }),
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(titles()).toEqual(['Charla grupal de IA', 'Testing en React']);

    await user.click(screen.getByRole('button', { name: 'Charla grupal de IA' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the conversation linked with ?c= and cleans the URL', () => {
    window.history.replaceState(null, '', `/conversaciones?c=${shortHash(conversation)}&x=1`);
    renderClient();

    expect(screen.getByRole('dialog', { name: 'Testing en React' })).toBeInTheDocument();
    expect(window.location.search).toBe('?x=1');
  });

  it('ignores an unknown ?c= hash', () => {
    window.history.replaceState(null, '', '/conversaciones?c=nope');
    act(() => {
      renderClient();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.location.search).toBe('');
  });
});
