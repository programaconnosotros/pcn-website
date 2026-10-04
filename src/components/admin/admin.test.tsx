import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { searchUsersForSpeaker } from '@/actions/users/search-users-for-speaker';
import { DailyBars } from './daily-bars';
import { UserCombobox } from './user-combobox';

jest.mock('@/actions/users/search-users-for-speaker', () => ({ searchUsersForSpeaker: jest.fn() }));

const users = [
  { id: 'u1', name: 'Ana', image: null, email: 'ana@x.com' },
  { id: 'u2', name: 'Bruno', image: null, email: 'bruno@x.com' },
  { id: 'u3', name: 'Carla', image: null },
];

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('DailyBars', () => {
  it('summarises the days with total, peak and today', () => {
    const days = [
      { day: new Date('2025-03-01T15:00:00Z'), count: 0 },
      { day: new Date('2025-03-02T15:00:00Z'), count: 4 },
      { day: new Date('2025-03-03T15:00:00Z'), count: 2 },
    ];
    render(<DailyBars days={days} label="Registros" unit="altas" />);

    expect(
      screen.getByRole('img', { name: 'Registros: 6 altas en 3 días, máximo 4 en un día' }),
    ).toBeInTheDocument();
    expect(document.querySelector('figcaption')).toHaveTextContent('total 6 · pico 4 · hoy 2');
  });

  it('handles an empty range', () => {
    render(<DailyBars days={[]} label="Registros" unit="altas" />);

    expect(
      screen.getByRole('img', { name: 'Registros: 0 altas en 0 días, máximo 0 en un día' }),
    ).toBeInTheDocument();
  });
});

describe('UserCombobox', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const setup = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const flush = () => act(async () => jest.advanceTimersByTime(200));

  it('searches speakers by default and picks one with the keyboard', async () => {
    (searchUsersForSpeaker as jest.Mock).mockResolvedValue(users);
    const onSelect = jest.fn();
    const user = setup();
    render(<UserCombobox onSelect={onSelect} excludeIds={['u3']} />);
    const input = screen.getByRole('textbox', { name: 'buscar usuario' });

    await user.type(input, 'a');
    await flush();

    expect(searchUsersForSpeaker).toHaveBeenCalledWith('a', 8);
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowDown}{Enter}');

    expect(onSelect).toHaveBeenCalledWith(users[1]);
    expect(input).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('uses a custom search, picks with the mouse and closes with Escape or outside', async () => {
    const search = jest.fn().mockResolvedValue(users);
    const onSelect = jest.fn();
    const user = setup();
    render(
      <div>
        <UserCombobox onSelect={onSelect} search={search} placeholder="miembro" />
        <p>afuera</p>
      </div>,
    );
    const input = screen.getByRole('textbox', { name: 'miembro' });

    await user.click(input);
    await flush();
    expect(search).toHaveBeenCalledWith('');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.type(input, 'c');
    await flush();
    fireEvent.pointerDown(screen.getByText('afuera'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.type(input, 'a');
    await flush();
    await user.hover(screen.getByText('Carla'));
    expect(screen.getAllByRole('option')[2]).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByText('Carla'));
    expect(onSelect).toHaveBeenCalledWith(users[2]);
  });

  it('opens the list above the input when there is no room below', async () => {
    const search = jest.fn().mockResolvedValue(users);
    const user = setup();
    const rect = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ top: 700, bottom: 720 } as DOMRect);
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 760 });

    render(<UserCombobox onSelect={jest.fn()} search={search} />);
    await user.type(screen.getByRole('textbox'), 'x');
    await flush();

    const list = screen.getByRole('listbox');
    expect(list).toHaveClass('bottom-full');
    expect(list).toHaveStyle({ maxHeight: '256px' });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    rect.mockRestore();
  });

  it('does nothing on Enter without results', async () => {
    const search = jest.fn().mockResolvedValue([]);
    const onSelect = jest.fn();
    const user = setup();
    render(<UserCombobox onSelect={onSelect} search={search} disabled={false} />);

    await user.type(screen.getByRole('textbox'), 'zz');
    await flush();
    await user.keyboard('{Enter}');

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
