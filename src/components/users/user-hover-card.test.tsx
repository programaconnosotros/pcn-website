import { act, fireEvent, render, screen } from '@testing-library/react';
import { getUserSummary, type UserSummary } from '@/actions/users/get-user-summary';
import { UserHoverCard } from './user-hover-card';

jest.mock('@/actions/users/get-user-summary', () => ({ getUserSummary: jest.fn() }));

const summaryMock = getUserSummary as jest.Mock;

const summary = (overrides: Partial<UserSummary> = {}): UserSummary => ({
  id: 'u',
  name: 'Agustín Sánchez',
  image: null,
  slogan: 'Programá con nosotros',
  role: 'Senior SWE @ Acme',
  location: 'Córdoba, Argentina',
  memberSince: '2021-06-15T12:00:00.000Z',
  isCofounder: true,
  isAmbassador: true,
  languages: ['ts', 'go'],
  stats: {
    talks: 3,
    eventsAttended: 10,
    eventsOrganized: 0,
    advises: 2,
    projects: 1,
    photos: 4,
    commits: 120,
    contributorRank: 1,
  },
  achievements: { earned: 5, total: 10 },
  ...overrides,
});

// Each test uses its own user id: summaries are cached for the whole page visit
let nextId = 0;
const renderCard = (name = 'Agustín Sánchez') => {
  const user = { id: `user-${++nextId}`, name, image: null };
  render(
    <>
      <UserHoverCard user={user}>
        <a href={`/perfil/${user.id}`}>@{name}</a>
      </UserHoverCard>
      <p>afuera</p>
    </>,
  );
  return { user, trigger: screen.getByText(`@${name}`).parentElement! };
};

const advance = (ms: number) => act(async () => jest.advanceTimersByTime(ms));

// jsdom has no PointerEvent, so `pointerType` would be lost; a minimal one keeps it
class TestPointerEvent extends MouseEvent {
  readonly pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerType = init.pointerType ?? 'mouse';
  }
}

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('UserHoverCard', () => {
  const originalPointerEvent = window.PointerEvent;
  beforeAll(() => {
    window.PointerEvent = TestPointerEvent as unknown as typeof PointerEvent;
  });
  afterAll(() => {
    window.PointerEvent = originalPointerEvent;
  });
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('opens after hovering, fetches once and shows the summary', async () => {
    summaryMock.mockResolvedValue(summary());
    const { user, trigger } = renderCard();

    fireEvent.pointerEnter(trigger);
    await advance(300);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await advance(60);

    const card = screen.getByRole('dialog', { name: 'Resumen de Agustín Sánchez' });
    expect(summaryMock).toHaveBeenCalledWith(user.id);
    expect(card).toHaveTextContent('finger @agustin-sanchez');
    expect(card).toHaveTextContent('Senior SWE @ Acme');
    expect(card).toHaveTextContent('co-founder');
    expect(card).toHaveTextContent('ambassador');
    expect(card).toHaveTextContent('# Programá con nosotros');
    expect(card).toHaveTextContent('120 · #1 en el repo');
    expect(card).toHaveTextContent('ts go');
    expect(card).toHaveTextContent('Córdoba, Argentina');
    expect(card).toHaveTextContent('[#####-----]');
    expect(screen.getByRole('link', { name: /ver perfil completo/ })).toHaveAttribute(
      'href',
      `/perfil/${user.id}`,
    );
    expect(trigger).toHaveAttribute('aria-describedby', card.id);

    fireEvent.pointerLeave(trigger);
    fireEvent.pointerEnter(card);
    await advance(500);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.pointerLeave(card);
    await advance(200);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.pointerEnter(trigger);
    await advance(400);
    expect(summaryMock).toHaveBeenCalledTimes(1);
  });

  it('shows a skeleton while loading and a minimal card without optional data', async () => {
    let resolve: (_value: UserSummary) => void = () => {};
    summaryMock.mockReturnValue(new Promise((r) => (resolve = r)));
    const { trigger } = renderCard('!!!');

    fireEvent.pointerEnter(trigger);
    await advance(350);
    expect(screen.getByRole('dialog')).toHaveTextContent('fetching…');
    expect(screen.getByText('Cargando resumen…')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('@user');

    await act(async () =>
      resolve(
        summary({
          slogan: null,
          role: null,
          location: null,
          isCofounder: false,
          isAmbassador: false,
          languages: [],
          stats: { ...summary().stats, commits: 0 },
          achievements: { earned: 0, total: 0 },
        }),
      ),
    );
    const card = screen.getByRole('dialog');
    expect(card).toHaveTextContent('tty/pcn');
    expect(card).not.toHaveTextContent('co-founder');
    expect(card).not.toHaveTextContent('commits');
    expect(card).toHaveTextContent('[----------]');
  });

  it.each([
    [null, 'usuario no encontrado'],
    [new Error('down'), 'no se pudo cargar el resumen'],
  ])('reports a missing or failing summary', async (result, message) => {
    if (result instanceof Error) summaryMock.mockRejectedValue(result);
    else summaryMock.mockResolvedValue(result);
    const { trigger } = renderCard();

    fireEvent.pointerEnter(trigger);
    await advance(350);

    expect(screen.getByRole('dialog')).toHaveTextContent(message);
  });

  it('retries a failed summary on the next hover', async () => {
    summaryMock.mockRejectedValueOnce(new Error('down'));
    summaryMock.mockResolvedValueOnce(summary());
    const user = { id: 'retry-user', name: 'Ana', image: null };
    const { unmount } = render(
      <UserHoverCard user={user}>
        <span>@Ana</span>
      </UserHoverCard>,
    );
    fireEvent.pointerEnter(screen.getByText('@Ana').parentElement!);
    await advance(350);
    expect(screen.getByRole('dialog')).toHaveTextContent('no se pudo cargar');
    unmount();

    render(
      <UserHoverCard user={user}>
        <span>@Ana</span>
      </UserHoverCard>,
    );
    fireEvent.pointerEnter(screen.getByText('@Ana').parentElement!);
    await advance(350);
    expect(screen.getByRole('dialog')).toHaveTextContent('Senior SWE @ Acme');
    expect(summaryMock).toHaveBeenCalledTimes(2);
  });

  it('closes with Escape and with a click outside', async () => {
    summaryMock.mockResolvedValue(summary());
    const { trigger } = renderCard();

    fireEvent.pointerEnter(trigger);
    await advance(350);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.pointerEnter(trigger);
    await advance(350);
    fireEvent.pointerDown(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByText('afuera'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on a long press and swallows the click that follows', async () => {
    summaryMock.mockResolvedValue(summary());
    const { trigger } = renderCard();
    const link = screen.getByRole('link');
    // jsdom can't navigate; stop the link the way the router would
    const onClick = jest.fn((event: Event) => event.preventDefault());
    link.addEventListener('click', onClick);

    fireEvent.pointerEnter(trigger, { pointerType: 'touch' });
    fireEvent.pointerDown(link, { pointerType: 'touch' });
    await advance(200);
    fireEvent.pointerUp(link);
    await advance(500);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.pointerDown(link, { pointerType: 'touch' });
    await advance(450);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.pointerCancel(link);
    expect(fireEvent.contextMenu(link)).toBe(false);
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.pointerLeave(trigger, { pointerType: 'touch' });
    fireEvent.pointerLeave(screen.getByRole('dialog'), { pointerType: 'touch' });
    await advance(300);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('opens on keyboard focus and closes when focus leaves', async () => {
    summaryMock.mockResolvedValue(summary());
    const { trigger } = renderCard();
    const link = screen.getByRole('link');
    const matches = jest.spyOn(link, 'matches').mockReturnValue(true);

    fireEvent.focus(link);
    await advance(150);
    const card = screen.getByRole('dialog');
    const profile = screen.getByRole('link', { name: /ver perfil completo/ });

    fireEvent.blur(link, { relatedTarget: profile });
    await advance(200);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.blur(profile, { relatedTarget: link });
    await advance(200);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.blur(card, { relatedTarget: document.body });
    await advance(200);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    matches.mockReturnValue(false);
    fireEvent.focus(link);
    await advance(400);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.blur(link, { relatedTarget: null });
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });

  it('places the card above the mention when there is no room below', async () => {
    summaryMock.mockResolvedValue(summary());
    const { trigger } = renderCard();
    jest
      .spyOn(trigger, 'getClientRects')
      .mockReturnValue([{ top: 700, bottom: 720, left: 900 }] as unknown as DOMRectList);
    jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });

    fireEvent.pointerEnter(trigger);
    await advance(350);

    expect(screen.getByRole('dialog')).toHaveStyle({
      top: '494px',
      left: '696px',
      visibility: 'visible',
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    jest.restoreAllMocks();
  });
});
