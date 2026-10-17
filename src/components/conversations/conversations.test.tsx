import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import type { Conversation } from '@/data/whatsapp-conversations';
import { ActivityGraph } from './activity-graph';
import { ConversationDialog, linkLabel } from './conversation-dialog';
import { ConversationEventsContext } from './conversation-event';
import { ConversationRow } from './conversation-row';
import { formatShortDate, shortHash, toSentences } from './conversation-utils';
import { LinkedNames } from './linked-names';
import { ProfileLinksContext } from './participant-chip';

const profiles = {
  'Agustín Sánchez': { id: 'u1', name: 'Agustín Sánchez', image: null },
  'Facundo García Martoni': { id: 'u2', name: 'Facundo', image: null },
};

const Providers = ({ children }: { children: ReactNode }) => (
  <ProfileLinksContext.Provider value={profiles}>
    <ConversationEventsContext.Provider value={{ ev1: 'Meetup virtual' }}>
      {children}
    </ConversationEventsContext.Provider>
  </ProfileLinksContext.Provider>
);

const small: Conversation = {
  title: 'Testing en React',
  date: '2025-05-02',
  summary: 'Agustín Sánchez habló de tests. García Martoni sumó ejemplos. Ana preguntó.',
  participants: ['Agustín Sánchez', 'Facundo García Martoni', 'Ana', 'Bruno'],
  eventId: 'ev1',
};
const group: Conversation = {
  title: 'Charla grupal',
  date: '2025-06-10',
  summary: 'Muchos opinaron sobre IA.',
  participants: ['A', 'B', 'C', 'D', 'E', 'F'],
  links: ['https://www.github.com/vercel/ai?tab=readme', 'https://anthropic.com/'],
};
const solo: Conversation = {
  title: 'Solo',
  date: '2025-06-11',
  summary: 'Nadie.',
  participants: [],
  eventId: 'gone',
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('conversation utils', () => {
  it('splits sentences without breaking initials and formats dates', () => {
    expect(toSentences('Leímos a Robert C. Martin. Después charlamos.')).toEqual([
      'Leímos a Robert C. Martin.',
      'Después charlamos.',
    ]);
    expect(formatShortDate('2026-10-02')).toBe('02 oct');
    expect(shortHash(small)).toMatch(/^[0-9a-f]{7}$/);
  });
});

describe('LinkedNames', () => {
  it('links full names, aliases and unique first names of linked participants', () => {
    render(
      <Providers>
        <LinkedNames
          text="Agustín abrió. Agustínez no. García Martoni respondió a Ana."
          query="respondió"
          participants={small.participants}
        />
      </Providers>,
    );

    const links = screen.getAllByRole('link');
    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['Agustín', '/perfil/u1'],
      ['García Martoni', '/perfil/u2'],
    ]);
    expect(screen.getByText('respondió', { selector: 'mark' })).toBeInTheDocument();
  });

  it('does not link a first name shared by two participants', () => {
    render(
      <Providers>
        <LinkedNames
          text="Agustín y Agustín Sánchez"
          query=""
          participants={['Agustín Sánchez', 'Agustín Pérez']}
        />
      </Providers>,
    );

    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Agustín Sánchez',
    ]);
  });
});

describe('ConversationRow', () => {
  it('shows a conversation with its event, participants and the rest collapsed', async () => {
    const onOpen = jest.fn();
    const onParticipantClick = jest.fn();
    render(
      <Providers>
        <ConversationRow
          conversation={small}
          query="tests"
          activeParticipant="Ana"
          onParticipantClick={onParticipantClick}
          onOpen={onOpen}
        />
      </Providers>,
    );

    expect(screen.getAllByRole('link', { name: 'Meetup virtual' })[0]).toHaveAttribute(
      'href',
      '/eventos/ev1',
    );
    expect(screen.getByTitle('4 participantes')).toHaveTextContent('4 participantes');
    expect(screen.getByRole('button', { name: /^@ ?Ana$/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getAllByRole('link', { name: 'Ver el perfil de Agustín Sánchez' })).toHaveLength(
      1,
    );
    expect(screen.queryByRole('button', { name: /^@ ?Bruno$/ })).not.toBeInTheDocument();
    expect(screen.getByText('tests', { selector: 'mark' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^@ ?Agustín Sánchez$/ }));
    expect(onParticipantClick).toHaveBeenCalledWith('Agustín Sánchez');
    await userEvent.click(screen.getByRole('button', { name: '+1' }));
    await userEvent.click(screen.getByRole('button', { name: /abrir resumen/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Testing en React' }));
    expect(onOpen).toHaveBeenCalledTimes(3);
  });

  it('lists everyone in group threads and hides missing events', () => {
    render(
      <Providers>
        <ConversationRow
          conversation={group}
          query=""
          activeParticipant={null}
          onParticipantClick={jest.fn()}
          onOpen={jest.fn()}
        />
        <ConversationRow
          conversation={solo}
          query=""
          activeParticipant={null}
          onParticipantClick={jest.fn()}
          onOpen={jest.fn()}
        />
      </Providers>,
    );

    expect(screen.getByText('muchos participantes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^@ ?F$/ })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getAllByText('links compartidos', { exact: false })).toHaveLength(1);
    expect(screen.getByText('links compartidos', { exact: false }).parentElement).toHaveTextContent(
      '2',
    );
  });
});

describe('ConversationDialog', () => {
  const list = [small, group, solo];
  const renderDialog = (index: number | null, overrides = {}) => {
    const props = {
      onNavigate: jest.fn(),
      onClose: jest.fn(),
      onParticipantClick: jest.fn(),
      ...overrides,
    };
    render(
      <Providers>
        <ConversationDialog
          conversations={list}
          index={index}
          query=""
          activeParticipant={null}
          {...props}
        />
      </Providers>,
    );
    return props;
  };

  beforeAll(() => {
    Element.prototype.scrollTo = jest.fn() as unknown as typeof Element.prototype.scrollTo;
  });

  it('renders nothing without an open conversation', () => {
    renderDialog(null);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the summary as numbered lines with participants', async () => {
    const { onParticipantClick } = renderDialog(0);

    const dialog = screen.getByRole('dialog', { name: 'Testing en React' });
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(3);
    expect(within(dialog).getByText('2 de mayo de 2025', { exact: false })).toBeInTheDocument();
    expect(within(dialog).getByText('4 participantes')).toBeInTheDocument();
    expect(within(dialog).getByText((_, el) => el?.textContent === '[1/3]')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Anterior' })).toBeDisabled();

    await userEvent.click(within(dialog).getByRole('button', { name: /^@ ?Ana$/ }));
    expect(onParticipantClick).toHaveBeenCalledWith('Ana');
  });

  it('keeps the links shared in the conversation clickable', () => {
    renderDialog(1);

    const dialog = screen.getByRole('dialog', { name: 'Charla grupal' });
    expect(within(dialog).getByText('links compartidos', { exact: false })).toHaveTextContent(
      '2 links compartidos',
    );
    const link = within(dialog).getByRole('link', { name: /github\.com/ });
    expect(link).toHaveAttribute('href', 'https://www.github.com/vercel/ai?tab=readme');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveTextContent('github.com/vercel/ai?tab=readme');
    expect(within(dialog).getByRole('link', { name: 'anthropic.com' })).toBeInTheDocument();
  });

  it('labels links by host and path, falling back to the raw text', () => {
    expect(linkLabel('https://www.github.com/a/b?x=1')).toEqual({
      host: 'github.com',
      rest: '/a/b?x=1',
    });
    expect(linkLabel('https://anthropic.com/')).toEqual({ host: 'anthropic.com', rest: '' });
    expect(linkLabel('no es un link')).toEqual({ host: 'no es un link', rest: '' });
  });

  it('steps with the buttons and the arrow keys', async () => {
    const user = userEvent.setup();
    const { onNavigate } = renderDialog(1);

    expect(screen.getByText('muchos participantes')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onNavigate).toHaveBeenNthCalledWith(1, 0);
    expect(onNavigate).toHaveBeenNthCalledWith(2, 2);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight', metaKey: true });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'a' });
    expect(onNavigate).toHaveBeenCalledTimes(4);
  });

  it('closes and hides the roster when nobody is named', async () => {
    const { onClose } = renderDialog(2);

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    expect(screen.queryByText(/participante/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByTitle('Cerrar (Esc)'));
    expect(onClose).toHaveBeenCalled();
  });

  it('gives focus back to the row that opened it when closed with Esc', async () => {
    const user = userEvent.setup();
    // Like the page: a plain button (no Radix trigger) opens it and the dialog unmounts on close.
    const Harness = () => {
      const [index, setIndex] = useState<number | null>(null);
      return (
        <Providers>
          <button type="button" onClick={() => setIndex(0)}>
            abrir
          </button>
          <ConversationDialog
            conversations={list}
            index={index}
            query=""
            activeParticipant={null}
            onNavigate={setIndex}
            onClose={() => setIndex(null)}
            onParticipantClick={jest.fn()}
          />
        </Providers>
      );
    };
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'abrir' });
    opener.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('copies the deep link and reports clipboard failures', async () => {
    const user = userEvent.setup();
    renderDialog(0);

    await user.click(screen.getByTitle('Copiar link para compartir'));
    expect(await navigator.clipboard.readText()).toBe(
      `http://localhost/conversaciones?c=${shortHash(small)}`,
    );
    expect(screen.getByTitle('Link copiado')).toBeInTheDocument();
    await waitFor(
      () => expect(screen.getByTitle('Copiar link para compartir')).toBeInTheDocument(),
      {
        timeout: 3000,
      },
    );

    jest.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await user.click(screen.getByTitle('Copiar link para compartir'));
    expect(consoleError).toHaveBeenCalledWith('Error copying to clipboard:', expect.any(Error));
    consoleError.mockRestore();
  });
});

describe('ActivityGraph', () => {
  it('draws one bar per month linking only to months with matches', () => {
    render(
      <ActivityGraph
        months={[
          { key: '2024-12', total: 4, matches: 2 },
          { key: '2025-01', total: 2, matches: 0 },
          { key: '2025-02', total: 1, matches: 1 },
        ]}
      />,
    );

    expect(screen.getByTitle('2024-12: 2/4 conversaciones')).toHaveAttribute('href', '#m-2024-12');
    expect(screen.getByTitle('2025-01: 0/2 conversaciones')).not.toHaveAttribute('href');
    expect(screen.getByText('max 4/mes')).toBeInTheDocument();
    expect(screen.getAllByText('25')).toHaveLength(1);
    expect(screen.getByText('02')).toBeInTheDocument();
  });
});
