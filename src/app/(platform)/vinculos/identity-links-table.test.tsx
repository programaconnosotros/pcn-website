import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { setIdentityLink } from '@/actions/identity-links/set-identity-link';
import { searchUsersForSpeaker } from '@/actions/users/search-users-for-speaker';
import { IdentityLinksTable, type IdentityRow } from './identity-links-table';

jest.mock('@/actions/identity-links/set-identity-link', () => ({ setIdentityLink: jest.fn() }));
jest.mock('@/actions/users/search-users-for-speaker', () => ({ searchUsersForSpeaker: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const setLinkMock = setIdentityLink as jest.Mock;

const rows: IdentityRow[] = [
  {
    externalName: 'agus-sanc',
    detail: '120 commits',
    weight: 120,
    avatarUrl: 'https://avatars.example.com/agus.png',
    user: { id: 'u1', name: 'Agustín', image: null },
  },
  { externalName: 'Juan WA', detail: '30 mensajes', weight: 30, user: null },
];

const renderTable = (overrides: Partial<Parameters<typeof IdentityLinksTable>[0]> = {}) =>
  render(
    <IdentityLinksTable
      source="github"
      title="github"
      command="git shortlog -sn"
      rows={rows}
      {...overrides}
    />,
  );

const names = () =>
  Array.from(
    document.querySelectorAll('tbody td:nth-child(2) span.truncate'),
    (s) => s.textContent,
  );

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('IdentityLinksTable', () => {
  it('lists linked and pending identities with progress', () => {
    renderTable();

    expect(screen.getByText('login')).toBeInTheDocument();
    expect(names()).toEqual(['agus-sanc', 'Juan WA']);
    expect(screen.getByRole('link', { name: 'Agustín' })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.getByRole('textbox', { name: 'vincular a…' })).toBeInTheDocument();
    expect(screen.getByText('█'.repeat(6))).toBeInTheDocument();
  });

  it('filters by status and by name', async () => {
    const user = userEvent.setup();
    renderTable({ source: 'whatsapp' });

    expect(screen.getByText('nombre')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '--vinculados' }));
    expect(names()).toEqual(['agus-sanc']);
    await user.click(screen.getByRole('button', { name: '--pendientes' }));
    expect(names()).toEqual(['Juan WA']);
    await user.click(screen.getByRole('button', { name: '--todos' }));

    await user.type(screen.getByRole('textbox', { name: 'Filtrar github' }), 'agustín');
    expect(names()).toEqual(['agus-sanc']);
    await user.type(screen.getByRole('textbox', { name: 'Filtrar github' }), 'zz');
    expect(screen.getByText('0 coincidencias')).toBeInTheDocument();
  });

  it('shows the empty message without rows', () => {
    renderTable({ rows: [], emptyMessage: 'nadie todavía' });

    expect(screen.getByText('nadie todavía')).toBeInTheDocument();
  });

  it('unlinks an identity', async () => {
    setLinkMock.mockResolvedValue(undefined);
    renderTable();

    await userEvent.click(screen.getByRole('button', { name: 'Desvincular agus-sanc' }));

    expect(setLinkMock).toHaveBeenCalledWith({
      source: 'github',
      externalName: 'agus-sanc',
      userId: null,
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('agus-sanc desvinculado'));
    expect(screen.queryByRole('link', { name: 'Agustín' })).not.toBeInTheDocument();
  });

  it('links an identity to a user picked from the search', async () => {
    jest.useFakeTimers();
    setLinkMock.mockResolvedValue(undefined);
    (searchUsersForSpeaker as jest.Mock).mockResolvedValue([
      { id: 'u2', name: 'Juan Pérez', image: null },
    ]);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderTable();

    await user.type(screen.getByRole('textbox', { name: 'vincular a…' }), 'juan');
    await act(async () => jest.advanceTimersByTime(200));
    await user.click(screen.getByText('Juan Pérez'));

    expect(setLinkMock).toHaveBeenCalledWith({
      source: 'github',
      externalName: 'Juan WA',
      userId: 'u2',
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Juan WA → Juan Pérez'));
    expect(screen.getByRole('link', { name: 'Juan Pérez' })).toHaveAttribute('href', '/perfil/u2');
    jest.useRealTimers();
  });

  it.each([
    [new Error('Ese usuario ya está vinculado'), 'Ese usuario ya está vinculado'],
    [{}, 'No se pudo guardar el vínculo'],
  ])('restores the row when saving fails', async (error, message) => {
    setLinkMock.mockRejectedValue(error);
    renderTable();

    await userEvent.click(screen.getByRole('button', { name: 'Desvincular agus-sanc' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    expect(screen.getByRole('link', { name: 'Agustín' })).toBeInTheDocument();
  });
});
