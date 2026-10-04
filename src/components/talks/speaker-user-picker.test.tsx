import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getUserForSpeaker,
  searchUsersForSpeaker,
  type SpeakerUserOption,
} from '@/actions/users/search-users-for-speaker';
import { SpeakerUserPicker } from './speaker-user-picker';

jest.mock('@/actions/users/search-users-for-speaker', () => ({
  getUserForSpeaker: jest.fn(),
  searchUsersForSpeaker: jest.fn(),
}));

const user = (id: string, name: string, image: string | null = null): SpeakerUserOption => ({
  id,
  name,
  email: `${id}@x.dev`,
  image,
  phoneNumber: null,
  jobTitle: null,
  enterprise: null,
  career: null,
  studyPlace: null,
});

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('SpeakerUserPicker', () => {
  it('searches as you type (debounced) and selects a user', async () => {
    jest
      .mocked(searchUsersForSpeaker)
      .mockResolvedValue([user('u1', 'Ada'), user('u2', 'Grace', 'https://cdn.dev/g.png')]);
    const onSelect = jest.fn();
    render(<SpeakerUserPicker value={null} onSelect={onSelect} />);

    await userEvent.type(screen.getByPlaceholderText('Buscar por nombre o email...'), 'a');

    await waitFor(() => expect(searchUsersForSpeaker).toHaveBeenLastCalledWith('a'));
    expect(screen.getByRole('img', { name: 'Grace' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ada/ }));

    expect(onSelect).toHaveBeenCalledWith(user('u1', 'Ada'));
    expect(screen.getByText('u1@x.dev')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Buscar por nombre o email...')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenLastCalledWith(null);
    expect(screen.getByPlaceholderText('Buscar por nombre o email...')).toHaveValue('');
  });

  it('says when nothing matches and closes on outside clicks', async () => {
    jest.mocked(searchUsersForSpeaker).mockResolvedValue([]);
    render(
      <>
        <SpeakerUserPicker value={null} onSelect={jest.fn()} />
        <p>afuera</p>
      </>,
    );

    await userEvent.type(screen.getByPlaceholderText('Buscar por nombre o email...'), 'zz');

    expect(await screen.findByText('Sin resultados para "zz"')).toBeInTheDocument();
    await userEvent.click(screen.getByText('afuera'));
    expect(screen.queryByText(/Sin resultados/)).not.toBeInTheDocument();
  });

  it('resolves the selected user in edit mode', async () => {
    jest.mocked(getUserForSpeaker).mockResolvedValue(user('u2', 'Grace', 'https://cdn.dev/g.png'));
    render(<SpeakerUserPicker value="u2" onSelect={jest.fn()} />);

    expect(await screen.findByText('Grace')).toBeInTheDocument();
    expect(getUserForSpeaker).toHaveBeenCalledWith('u2');
  });

  it('keeps the search when the stored user no longer exists', async () => {
    jest.mocked(getUserForSpeaker).mockResolvedValue(null);
    render(<SpeakerUserPicker value="gone" onSelect={jest.fn()} />);

    await waitFor(() => expect(getUserForSpeaker).toHaveBeenCalled());
    expect(screen.getByPlaceholderText('Buscar por nombre o email...')).toBeInTheDocument();
  });
});
