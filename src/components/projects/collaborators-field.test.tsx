import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import type { ProjectMemberFormData } from '@/schemas/project-schema';
import { CollaboratorsField } from './collaborators-field';

jest.mock('@/actions/users/search-community-members', () => ({
  searchCommunityMembers: jest.fn(),
}));

const searchMock = searchCommunityMembers as jest.Mock;

const Harness = ({
  initial = [],
  excluded = [],
  images = {},
}: {
  initial?: ProjectMemberFormData[];
  excluded?: string[];
  images?: Record<string, string | null>;
}) => {
  const [members, setMembers] = useState(initial);
  return (
    <div>
      <CollaboratorsField
        value={members}
        onChange={setMembers}
        excludedUserIds={excluded}
        initialImages={images}
      />
      <output aria-label="valor">{JSON.stringify(members)}</output>
      <p>afuera</p>
    </div>
  );
};

const value = () => JSON.parse(screen.getByLabelText('valor').textContent ?? '[]');
const searchBox = () => screen.getByPlaceholderText('Buscar compañeros por nombre...');

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('CollaboratorsField', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const setup = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  it('searches after a pause and adds a member with an account', async () => {
    searchMock.mockResolvedValue([
      { id: 'u1', name: 'Ana', image: 'https://cdn/ana.png' },
      { id: 'author', name: 'Autor', image: null },
    ]);
    const user = setup();
    render(<Harness excluded={['author']} />);

    await user.type(searchBox(), 'a');
    act(() => jest.advanceTimersByTime(300));
    expect(searchMock).not.toHaveBeenCalled();

    await user.type(searchBox(), 'n');
    expect(searchMock).not.toHaveBeenCalled();
    await act(async () => jest.advanceTimersByTime(250));

    expect(searchMock).toHaveBeenCalledWith('an');
    expect(screen.queryByRole('button', { name: 'Autor' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Ana/ }));

    expect(value()).toEqual([{ userId: 'u1', memberName: 'Ana' }]);
    expect(searchBox()).toHaveValue('');
    expect(screen.getByRole('img', { name: 'Ana' })).toBeInTheDocument();
  });

  it('adds someone without an account by name', async () => {
    searchMock.mockResolvedValue([]);
    const user = setup();
    render(<Harness />);

    await user.type(searchBox(), '  Pedro Gómez  ');
    await act(async () => jest.advanceTimersByTime(250));
    await user.click(screen.getByRole('button', { name: /Agregar "Pedro Gómez"/ }));

    expect(value()).toEqual([{ userId: null, memberName: 'Pedro Gómez' }]);
    expect(screen.getByText('(sin cuenta)')).toBeInTheDocument();
  });

  it('edits roles, removes members and ignores Enter', async () => {
    const user = setup();
    render(
      <Harness
        initial={[
          { userId: 'u1', memberName: 'Ana', role: '' },
          { userId: null, memberName: 'Pedro', role: 'QA' },
        ]}
        images={{ u1: null }}
      />,
    );

    await user.type(screen.getByLabelText('Rol de Ana'), 'Dev{Enter}');
    expect(value()[0]).toEqual({ userId: 'u1', memberName: 'Ana', role: 'Dev' });

    await user.click(screen.getByRole('button', { name: 'Quitar a Pedro' }));
    expect(value()).toEqual([{ userId: 'u1', memberName: 'Ana', role: 'Dev' }]);

    await user.type(searchBox(), '{Enter}');
    expect(value()).toHaveLength(1);
  });

  it('hides already added members from the results and closes on outside click', async () => {
    searchMock.mockResolvedValue([{ id: 'u1', name: 'Ana', image: null }]);
    const user = setup();
    render(<Harness initial={[{ userId: 'u1', memberName: 'Ana' }]} />);

    await user.type(searchBox(), 'an');
    await act(async () => jest.advanceTimersByTime(250));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Agregar "an"/ })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', { name: /^A Ana$/ })).not.toBeInTheDocument();

    await user.click(screen.getByText('afuera'));
    expect(screen.queryByRole('button', { name: /Agregar/ })).not.toBeInTheDocument();
  });
});
