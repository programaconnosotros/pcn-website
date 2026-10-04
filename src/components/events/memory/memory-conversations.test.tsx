import { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Conversation } from '@/data/whatsapp-conversations';
import { ProfileLinksContext } from '@/components/conversations/participant-chip';
import { MemoryConversations } from './memory-conversations';

type RowProps = {
  conversation: Conversation;
  activeParticipant: string | null;
  onParticipantClick: (_name: string) => void;
  onOpen: () => void;
};

jest.mock('@/components/conversations/conversation-row', () => ({
  ConversationRow: ({ conversation, onParticipantClick, onOpen }: RowProps) => (
    <div>
      <button type="button" onClick={onOpen}>
        {conversation.title}
      </button>
      {conversation.participants.map((name) => (
        <button key={name} type="button" onClick={() => onParticipantClick(name)}>
          @{name} en {conversation.title}
        </button>
      ))}
    </div>
  ),
}));
jest.mock('@/components/conversations/conversation-dialog', () => ({
  ConversationDialog: ({
    conversations,
    index,
    onClose,
  }: {
    conversations: Conversation[];
    index: number | null;
    onClose: () => void;
  }) => {
    const profiles = useContext(ProfileLinksContext);
    return index === null ? null : (
      <div role="dialog" aria-label={conversations[index].title}>
        {Object.keys(profiles).join(',')}
        <button type="button" onClick={onClose}>
          cerrar
        </button>
      </div>
    );
  },
}));

const conversations: Conversation[] = [
  { title: 'IA', date: '2030-05-10', summary: '', participants: ['Ada', 'Bruno'] },
  { title: 'Rust', date: '2030-05-10', summary: '', participants: ['Bruno'] },
];
const profiles = { Ada: { id: 'u1', name: 'Ada', image: null } };

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('MemoryConversations', () => {
  it('opens a conversation in the reader with the profile links', async () => {
    render(<MemoryConversations conversations={conversations} profiles={profiles} />);

    await userEvent.click(screen.getByRole('button', { name: 'Rust' }));
    expect(screen.getByRole('dialog', { name: 'Rust' })).toHaveTextContent('Ada');

    await userEvent.click(screen.getByRole('button', { name: 'cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('narrows the list to a participant and clears the filter', async () => {
    render(<MemoryConversations conversations={conversations} profiles={profiles} />);

    await userEvent.click(screen.getByRole('button', { name: '@Ada en IA' }));
    expect(screen.queryByRole('button', { name: 'Rust' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /--author="Ada"/ })).toBeInTheDocument();

    // Clicking the same person again toggles the filter off
    await userEvent.click(screen.getByRole('button', { name: '@Ada en IA' }));
    expect(screen.getByRole('button', { name: 'Rust' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '@Bruno en Rust' }));
    expect(screen.getAllByRole('button', { name: /^(IA|Rust)$/ })).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: /Quitar filtro de persona/ }));
    expect(screen.queryByText(/--author/)).not.toBeInTheDocument();
  });
});
