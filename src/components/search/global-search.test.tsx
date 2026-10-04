import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { isEmbedded, postToOsHost } from '@/components/os/os-env';
import { mockRouter } from '@/test/dom';
import { jsonResponse } from '@/test/platform';
import { ClassicGlobalSearch } from './classic-global-search';
import { GlobalSearch, isSearchShortcut, openGlobalSearch } from './global-search';
import { SearchTrigger } from './search-trigger';

jest.mock('@/components/os/os-env', () => ({
  ...jest.requireActual('@/components/os/os-env'),
  isEmbedded: jest.fn(() => false),
  postToOsHost: jest.fn(),
}));

const fetchMock = jest.fn();
const results = [
  { type: 'evento', title: 'Meetup React', subtitle: '10 de mayo', href: '/eventos/1' },
  { type: 'curso', title: 'Curso de React', href: '/cursos/react' },
  { type: 'proyecto', title: 'React Kit', href: 'https://kit.example.com' },
];

const input = () => screen.getByRole('combobox', { name: 'Buscar en todo el sitio' });
const options = () => screen.getAllByRole('option');

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('GlobalSearch', () => {
  let user: UserEvent;

  beforeEach(() => {
    jest.useFakeTimers();
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    global.fetch = fetchMock;
    fetchMock.mockResolvedValue(jsonResponse({ query: 'react', results }));
  });
  afterEach(() => jest.useRealTimers());

  const search = async (text: string) => {
    await user.type(input(), text);
    await act(async () => jest.advanceTimersByTime(150));
  };

  it('opens with the shortcut and lists the sections first', async () => {
    render(<GlobalSearch onNavigate={jest.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('{Control>}k{/Control}');

    expect(screen.getByRole('dialog', { name: 'Buscar en todo el sitio' })).toBeInTheDocument();
    expect(screen.getAllByText('ir a').length).toBeGreaterThan(0);
    expect(screen.getByText(/secciones$/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('debounces the search and groups the results', async () => {
    render(<GlobalSearch onNavigate={jest.fn()} />);
    act(() => openGlobalSearch());

    await user.type(input(), 'rea');
    expect(fetchMock).not.toHaveBeenCalled();
    await user.type(input(), 'ct ');
    await act(async () => jest.advanceTimersByTime(150));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/search?q=react', expect.anything());
    expect(screen.getByText('eventos')).toBeInTheDocument();
    expect(screen.getByText('cursos')).toBeInTheDocument();
    expect(screen.getByText('10 de mayo')).toBeInTheDocument();
    expect(screen.getByLabelText('se abre en otra pestaña')).toBeInTheDocument();
    expect(screen.getByText('3 resultados')).toBeInTheDocument();
  });

  it('navigates with the arrows and Enter', async () => {
    const onNavigate = jest.fn();
    render(<GlobalSearch onNavigate={onNavigate} />);
    act(() => openGlobalSearch());
    await search('react');

    expect(options()[0]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowUp}');
    expect(options()[1]).toHaveAttribute('aria-selected', 'true');
    expect(input()).toHaveAttribute('aria-activedescendant', 'global-search-1');
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowDown}{Enter}');

    expect(onNavigate).toHaveBeenCalledWith('/cursos/react');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens external results in a new tab and hovers to select', async () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    const onNavigate = jest.fn();
    render(<GlobalSearch onNavigate={onNavigate} />);
    act(() => openGlobalSearch());
    await search('react');

    fireEvent.mouseMove(options()[2]);
    expect(options()[2]).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByText('React Kit'));

    expect(open).toHaveBeenCalledWith('https://kit.example.com', '_blank', 'noopener,noreferrer');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('says when nothing matches and recovers from a failed request', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ query: 'zzz', results: [] }));
    render(<GlobalSearch onNavigate={jest.fn()} />);
    act(() => openGlobalSearch('zzz'));
    await act(async () => jest.advanceTimersByTime(150));

    expect(input()).toHaveValue('zzz');
    expect(screen.getByText('find: ‘zzz’: sin resultados')).toBeInTheDocument();

    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await search('x');
    expect(screen.getByText('find: ‘zzzx’: sin resultados')).toBeInTheDocument();
  });

  it('closes with the esc button and does nothing on Enter without results', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ query: 'zzz', results: [] }));
    const onNavigate = jest.fn();
    render(<GlobalSearch onNavigate={onNavigate} />);
    act(() => openGlobalSearch());
    await search('zzz');
    await user.keyboard('{Enter}{Shift}');
    expect(onNavigate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'esc' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hands the search to the desktop inside a PCN OS window', async () => {
    (isEmbedded as jest.Mock).mockReturnValue(true);
    render(<GlobalSearch onNavigate={jest.fn()} />);

    await user.keyboard('{Control>}k{/Control}');
    act(() => {
      window.dispatchEvent(new CustomEvent('pcn:open-search', { detail: { query: 'x' } }));
    });
    openGlobalSearch('react');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(postToOsHost).toHaveBeenCalledWith({ type: 'search', query: '' });
    expect(postToOsHost).toHaveBeenCalledWith({ type: 'search', query: 'react' });
    (isEmbedded as jest.Mock).mockReturnValue(false);
  });

  it('ignores other shortcuts', () => {
    const event = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);
    expect(isSearchShortcut(event({ key: 'K', metaKey: true }))).toBe(true);
    expect(isSearchShortcut(event({ key: 'k', ctrlKey: true, altKey: true }))).toBe(false);
    expect(isSearchShortcut(event({ key: 'k' }))).toBe(false);
  });
});

describe('SearchTrigger and ClassicGlobalSearch', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ query: '', results: [] }));
  });

  it('opens the search from the fake prompt and navigates with the router', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchTrigger />
        <ClassicGlobalSearch />
      </>,
    );

    expect(screen.getByText('Ctrl K')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /buscar en el sitio/ }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    await user.keyboard('{Enter}');
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringMatching(/^\//));
  });

  it('shows ⌘K on Apple devices', () => {
    const platform = jest.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    render(<SearchTrigger />);

    expect(screen.getByText('⌘K')).toBeInTheDocument();
    platform.mockRestore();
  });
});
