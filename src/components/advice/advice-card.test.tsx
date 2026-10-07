import { render, screen } from '@testing-library/react';
import { buildConsejo, buildSession, extractedSource } from '@/test/platform';
import { AdviceCard } from './advice-card';
import { consejoHash } from './consejo-utils';

jest.mock('@/actions/advice/like-advice', () => ({ toggleLike: jest.fn() }));
jest.mock('@actions/advice/delete-advice', () => ({ deleteAdvice: jest.fn() }));
jest.mock('@/actions/advice/edit-advice', () => ({ editAdvice: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('AdviceCard', () => {
  it('shows a published consejo with its hash, date, author and likes', () => {
    render(
      <AdviceCard
        consejo={buildConsejo({ commentCount: 3, likes: [{ userId: 'x' }] })}
        session={null}
        query="tests"
      />,
    );

    expect(screen.getByText(`#${consejoHash('c1')}`)).toBeInTheDocument();
    expect(screen.getByText('2025-03-10')).toBeInTheDocument();
    expect(screen.getByTitle('3 comentarios')).toHaveTextContent('3');
    expect(screen.getByRole('button', { name: /Me gusta/ })).toHaveTextContent('1');
    expect(screen.getByRole('link', { name: /Escribí tests/ })).toHaveAttribute(
      'href',
      '/consejos/c1',
    );
    expect(screen.getByText('tests', { selector: 'mark' })).toBeInTheDocument();
    expect(screen.getByText('Bruno').closest('a')).toHaveAttribute('href', '/perfil/author-1');
    expect(screen.queryByRole('button', { name: 'Opciones' })).not.toBeInTheDocument();
  });

  it.each([
    ['the author', buildSession({ id: 'author-1' })],
    ['an admin', buildSession({ id: 'other', role: 'ADMIN' })],
  ])('lets %s edit or delete it', (_who, session) => {
    render(<AdviceCard consejo={buildConsejo()} session={session} />);

    expect(screen.getByRole('button', { name: 'Opciones' })).toBeInTheDocument();
  });

  it('hides the options from other members', () => {
    render(<AdviceCard consejo={buildConsejo()} session={buildSession({ id: 'other' })} />);

    expect(screen.queryByRole('button', { name: 'Opciones' })).not.toBeInTheDocument();
  });

  it('marks auto-extracted consejos and links their conversation', () => {
    render(
      <AdviceCard
        consejo={buildConsejo({
          source: extractedSource,
          likes: null,
          author: { id: null, name: 'Juan WA', image: null },
        })}
        session={buildSession({ role: 'ADMIN' })}
      />,
    );

    expect(screen.getByText('auto')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'una conversación #abc1234' })).toHaveAttribute(
      'href',
      extractedSource.href,
    );
    expect(
      screen.getByTitle('Todavía no vinculado a un perfil de la plataforma'),
    ).toHaveTextContent('@Juan WA');
    expect(screen.queryByRole('button', { name: /Me gusta/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Opciones' })).not.toBeInTheDocument();
  });

  it('hides the author when asked', () => {
    render(<AdviceCard consejo={buildConsejo()} session={null} showAuthor={false} />);

    expect(screen.queryByText('@')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('offers "ver más" only when the clamped text overflows', () => {
    const scrollHeight = jest
      .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
      .mockReturnValue(200);
    const clientHeight = jest
      .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
      .mockReturnValue(100);

    const { rerender } = render(<AdviceCard consejo={buildConsejo()} session={null} />);
    expect(screen.getByRole('link', { name: '[ver más →]' })).toHaveAttribute(
      'href',
      '/consejos/c1',
    );

    rerender(<AdviceCard consejo={buildConsejo()} session={null} clamped={false} />);
    expect(screen.queryByRole('link', { name: '[ver más →]' })).not.toBeInTheDocument();

    scrollHeight.mockRestore();
    clientHeight.mockRestore();
  });
});
