import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { mockRouter } from '@/test/dom';
import { buildConsejo, buildSession, extractedSource } from '@/test/platform';
import { ConsejoModal } from './consejo-modal';
import { ConsejoPanel } from './consejo-panel';
import { CopyConsejoLink, ShareConsejo } from './consejo-share';
import { consejoHash, consejoUrl } from './consejo-utils';
import { ConsejosNavProvider, useConsejosNav } from './consejos-nav';

jest.mock('@/actions/advice/hide-extracted-consejo', () => ({
  hideExtractedConsejo: jest.fn(),
  restoreExtractedConsejo: jest.fn(),
}));
jest.mock('@/actions/advice/like-advice', () => ({ toggleLike: jest.fn() }));
jest.mock('@actions/advice/delete-advice', () => ({ deleteAdvice: jest.fn() }));
jest.mock('@/actions/advice/edit-advice', () => ({ editAdvice: jest.fn() }));
jest.mock('@/actions/comments/create-comment', () => ({ createComment: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const SetIds = ({ ids }: { ids: string[] }) => {
  const { setIds } = useConsejosNav();
  useEffect(() => setIds(ids), [ids, setIds]);
  return null;
};

const renderModal = (
  ids: string[],
  id = 'c2',
  session = null as ReturnType<typeof buildSession> | null,
) =>
  render(
    <ConsejosNavProvider>
      <SetIds ids={ids} />
      <ConsejoModal consejo={buildConsejo({ id })} comments={[]} session={session} />
    </ConsejosNavProvider>,
  );

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('ConsejoPanel', () => {
  it('renders a published consejo as numbered lines on its own page', () => {
    render(
      <ConsejoPanel
        consejo={buildConsejo({ tags: ['testing'], likes: [{ userId: 'x' }] })}
        comments={[]}
        session={buildSession({ id: 'author-1' })}
        variant="page"
      />,
    );

    expect(screen.getByText(consejoHash('c1'))).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Consejo de Bruno');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('#testing')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver todos los consejos' })).toHaveAttribute(
      'href',
      '/consejos',
    );
    expect(screen.getByRole('button', { name: 'Opciones' })).toBeInTheDocument();
    expect(screen.getByText('comentarios')).toBeInTheDocument();
  });

  it('explains auto-extracted consejos, which take likes and comments too', () => {
    render(
      <ConsejoPanel
        consejo={buildConsejo({ source: extractedSource, likes: [] })}
        comments={[]}
        session={buildSession({ role: 'ADMIN' })}
        variant="page"
      />,
    );

    expect(screen.getByText('auto-extraído')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '~/conversaciones/abc1234' })).toHaveAttribute(
      'href',
      extractedSource.href,
    );
    expect(screen.getByText(/Bruno no lo publicó manualmente/)).toBeInTheDocument();
    expect(screen.getByText('comentarios')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Me gusta/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Opciones' })).not.toBeInTheDocument();
  });
});

describe('ConsejoModal', () => {
  beforeEach(() => window.history.pushState(null, '', '/consejos/c2'));

  it('shows the position and steps with the buttons and arrow keys', async () => {
    const user = userEvent.setup();
    renderModal(['c1', 'c2', 'c3']);

    expect(screen.getByRole('dialog', { name: /Consejo de Bruno/ })).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.textContent === '[2/3]')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/consejos/c1', { scroll: false });

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(mockRouter.replace).toHaveBeenCalledWith('/consejos/c3', { scroll: false });

    mockRouter.replace.mockClear();
    await user.keyboard('{ArrowLeft}');
    expect(mockRouter.replace).toHaveBeenCalledWith('/consejos/c1', { scroll: false });
    await user.keyboard('{ArrowRight}');
    expect(mockRouter.replace).toHaveBeenCalledWith('/consejos/c3', { scroll: false });

    mockRouter.replace.mockClear();
    await user.keyboard('{Meta>}{ArrowLeft}{/Meta}');
    await user.keyboard('{ArrowUp}');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('disables the ends of the list and ignores arrows while typing', async () => {
    const user = userEvent.setup();
    renderModal(['c2'], 'c2', buildSession());

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();

    await user.click(screen.getByPlaceholderText('Escribí acá tu comentario'));
    await user.keyboard('{ArrowLeft}');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('goes back to the list when closing', async () => {
    const user = userEvent.setup();
    renderModal(['c1', 'c2']);

    await user.click(screen.getByTitle('Cerrar (Esc)'));

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('opens /consejos when it was opened directly', async () => {
    const user = userEvent.setup();
    renderModal([]);

    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');

    expect(mockRouter.push).toHaveBeenCalledWith('/consejos', { scroll: false });
  });
});

describe('consejo sharing', () => {
  afterEach(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  });

  it('copies the link and resets the icon after a while', async () => {
    const user = userEvent.setup();
    render(<CopyConsejoLink id="c9" />);

    await user.click(screen.getByRole('button', { name: 'Copiar link' }));

    expect(await navigator.clipboard.readText()).toBe(consejoUrl('c9'));
    expect(toast.success).toHaveBeenCalledWith('Link copiado', {
      description: 'http://localhost/consejos/c9',
    });
    expect(screen.getByTitle('Link copiado')).toBeInTheDocument();

    // The check mark goes back to the link icon after 2s
    expect(await screen.findByTitle('Copiar link', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('reports when the clipboard fails', async () => {
    const user = userEvent.setup();
    jest.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<CopyConsejoLink id="c9" />);

    await user.click(screen.getByRole('button', { name: 'Copiar link' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo copiar el link'));
    expect(screen.getByTitle('Copiar link')).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('uses the share sheet with a trimmed text', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    render(<ShareConsejo id="c9" author="Bruno" content={'x'.repeat(200)} />);

    await userEvent.click(screen.getByRole('button', { name: 'Compartir' }));

    expect(share).toHaveBeenCalledWith({
      title: 'Consejo de Bruno',
      text: `${'x'.repeat(139)}…`,
      url: 'http://localhost/consejos/c9',
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('does nothing when the share sheet is dismissed', async () => {
    const share = jest.fn().mockRejectedValue(new DOMException('cancel', 'AbortError'));
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    render(<ShareConsejo id="c9" author="Bruno" content="corto" />);

    await userEvent.click(screen.getByRole('button', { name: 'Compartir' }));

    expect(share).toHaveBeenCalledWith(expect.objectContaining({ text: 'corto' }));
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('copies the link when sharing fails or is unavailable', async () => {
    const user = userEvent.setup();
    const share = jest.fn().mockRejectedValue(new Error('nope'));
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    render(<ShareConsejo id="c9" author="Bruno" content="corto" />);

    await user.click(screen.getByRole('button', { name: 'Compartir' }));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Link copiado', expect.anything()),
    );

    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    await user.click(screen.getByRole('button', { name: 'Compartir' }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(2));
  });
});
