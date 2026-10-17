import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { addEventOrganizer, removeEventOrganizer } from '@/actions/events/organizer-actions';
import { EventOrganizersManager } from './event-organizers-manager';

jest.mock('@/actions/events/organizer-actions', () => ({
  addEventOrganizer: jest.fn(),
  removeEventOrganizer: jest.fn(),
}));
jest.mock('@/actions/users/search-community-members', () => ({
  searchCommunityMembers: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/components/admin/user-combobox', () => ({
  UserCombobox: ({
    onSelect,
    excludeIds,
    disabled,
  }: {
    onSelect: (_u: { id: string; name: string; image: null }) => void;
    excludeIds: string[];
    disabled: boolean;
  }) => (
    <button
      type="button"
      disabled={disabled}
      data-exclude={excludeIds.join(',')}
      onClick={() => onSelect({ id: 'u2', name: 'Grace', image: null })}
    >
      sumar Grace
    </button>
  ),
}));

const ada = { id: 'u1', name: 'Ada', image: null };

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('EventOrganizersManager', () => {
  it('shows the empty state to visitors without management controls', () => {
    render(<EventOrganizersManager eventId="e1" organizers={[]} canManage={false} />);

    expect(screen.getByText('Este evento todavía no tiene organizadores.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('lists organizers linking to their profiles, read-only for non managers', () => {
    render(<EventOrganizersManager eventId="e1" organizers={[ada]} canManage={false} />);

    expect(screen.getByRole('link', { name: /Ada/ })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.queryByRole('button', { name: 'Quitar a Ada' })).not.toBeInTheDocument();
  });

  it('adds an organizer, excluding the current ones from the search', async () => {
    jest.mocked(addEventOrganizer).mockResolvedValue(undefined as never);
    render(<EventOrganizersManager eventId="e1" organizers={[ada]} canManage />);

    const add = screen.getByRole('button', { name: 'sumar Grace' });
    expect(add).toHaveAttribute('data-exclude', 'u1');
    await userEvent.click(add);

    expect(addEventOrganizer).toHaveBeenCalledWith('e1', 'u2');
    expect(await screen.findByRole('link', { name: /Grace/ })).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Grace ahora organiza el evento');
  });

  it('removes an organizer', async () => {
    jest.mocked(removeEventOrganizer).mockResolvedValue(undefined as never);
    render(<EventOrganizersManager eventId="e1" organizers={[ada]} canManage />);

    await userEvent.click(screen.getByRole('button', { name: 'Quitar a Ada' }));

    expect(removeEventOrganizer).toHaveBeenCalledWith('e1', 'u1');
    expect(
      await screen.findByText('Este evento todavía no tiene organizadores.'),
    ).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Ada ya no organiza el evento');
  });

  it('keeps the list and toasts when adding or removing fails', async () => {
    jest.mocked(addEventOrganizer).mockRejectedValue(new Error('Ya es organizador'));
    jest.mocked(removeEventOrganizer).mockRejectedValue('x');
    render(<EventOrganizersManager eventId="e1" organizers={[ada]} canManage />);

    await userEvent.click(screen.getByRole('button', { name: 'sumar Grace' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Ya es organizador'));
    await userEvent.click(screen.getByRole('button', { name: 'Quitar a Ada' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo quitar'));

    expect(screen.getByRole('link', { name: /Ada/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Grace/ })).not.toBeInTheDocument();
  });

  it('uses a generic message when adding fails without an Error', async () => {
    jest.mocked(addEventOrganizer).mockRejectedValue('x');
    render(<EventOrganizersManager eventId="e1" organizers={[]} canManage />);

    await userEvent.click(screen.getByRole('button', { name: 'sumar Grace' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo agregar'));
  });
});
