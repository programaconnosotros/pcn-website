import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContentMarks } from '@/hooks/use-content-marks';
import { ProfileArticles } from './profile-articles';

jest.mock('@/hooks/use-content-marks', () => ({ useContentMarks: jest.fn() }));
jest.mock('@/app/(platform)/lectura/articles-panel', () => ({
  ArticleRow: (props: {
    article: { id: string; title: string };
    read: boolean;
    saved: boolean;
    onOpen: () => void;
    onToggleRead: () => void;
    onToggleSaved: () => void;
  }) => (
    <div>
      <button type="button" onClick={props.onOpen}>
        abrir {props.article.title}
      </button>
      <button type="button" aria-pressed={props.read} onClick={props.onToggleRead}>
        leído {props.article.title}
      </button>
      <button type="button" aria-pressed={props.saved} onClick={props.onToggleSaved}>
        guardar {props.article.title}
      </button>
    </div>
  ),
}));
jest.mock('@/app/(platform)/lectura/article-reader-dialog', () => ({
  ArticleReaderDialog: ({
    article,
    onOpenChange,
  }: {
    article: { title: string } | null;
    onOpenChange: (_open: boolean) => void;
  }) =>
    article && (
      <div role="dialog" aria-label={article.title}>
        <button type="button" onClick={() => onOpenChange(true)}>
          seguir
        </button>
        <button type="button" onClick={() => onOpenChange(false)}>
          cerrar
        </button>
      </div>
    ),
}));

const set = jest.fn();
const toggle = jest.fn();
const articles = [
  { article: { id: 'a1', title: 'Rust' }, index: 0 },
  { article: { id: 'a2', title: 'Go' }, index: 1 },
] as never;

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('ProfileArticles', () => {
  beforeEach(() => {
    jest.mocked(useContentMarks).mockReturnValue({
      ids: (mark: string) => new Set(mark === 'read' ? ['a1'] : ['a2']),
      set,
      toggle,
    } as never);
  });

  it('marks articles read (taking them off "to read") and unread', async () => {
    const { rerender } = render(
      <ProfileArticles articles={articles} writer={{ name: 'Ada' } as never} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'leído Go' }));
    expect(set).toHaveBeenLastCalledWith([
      { contentId: 'a2', mark: 'read', value: true },
      { contentId: 'a2', mark: 'saved', value: false },
    ]);
    await userEvent.click(screen.getByRole('button', { name: 'leído Rust' }));
    expect(set).toHaveBeenLastCalledWith([{ contentId: 'a1', mark: 'read', value: false }]);

    jest.mocked(useContentMarks).mockReturnValue({ ids: () => new Set(), set, toggle } as never);
    rerender(<ProfileArticles articles={articles} writer={{ name: 'Ada' } as never} />);
    await userEvent.click(screen.getByRole('button', { name: 'guardar Rust' }));
    expect(toggle).toHaveBeenCalledWith('a1', 'saved');
    await userEvent.click(screen.getByRole('button', { name: 'leído Rust' }));
    expect(set).toHaveBeenLastCalledWith([{ contentId: 'a1', mark: 'read', value: true }]);
  });

  it('opens an article in the reader', async () => {
    render(<ProfileArticles articles={articles} writer={{ name: 'Ada' } as never} />);

    await userEvent.click(screen.getByRole('button', { name: 'abrir Go' }));
    expect(screen.getByRole('dialog', { name: 'Go' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'seguir' }));
    expect(screen.getByRole('dialog', { name: 'Go' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
