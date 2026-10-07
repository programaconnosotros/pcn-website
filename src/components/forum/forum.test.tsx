import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { createForumComment, deleteForumComment } from '@/actions/forum/engagement';
import {
  createForumPost,
  deleteForumPost,
  moderateForumPost,
  updateForumPost,
} from '@/actions/forum/posts';
import type { ForumPostSummary } from '@/lib/forum';
import type { ForumCommentNode } from '@/lib/forum-utils';
import { FAMOUS_FORUMS, FamousForums } from './famous-forums';
import { ForumComments } from './forum-comments';
import { ForumPostForm } from './forum-post-form';
import { ForumPostList } from './forum-post-list';
import { ForumThreadActions } from './forum-thread-actions';

const push = jest.fn();
const refresh = jest.fn();
const back = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh, back }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/actions/forum/posts', () => ({
  createForumPost: jest.fn(async () => ({ id: 'new' })),
  updateForumPost: jest.fn(),
  deleteForumPost: jest.fn(),
  moderateForumPost: jest.fn(),
}));
jest.mock('@/actions/forum/engagement', () => ({
  createForumComment: jest.fn(async () => ({ id: 'c' })),
  deleteForumComment: jest.fn(),
}));

const author = { id: 'u1', name: 'Ana', image: null };
const summary = (overrides: Partial<ForumPostSummary>): ForumPostSummary => ({
  id: 'p1',
  title: 'Monorepos con pnpm',
  isPinned: false,
  isLocked: false,
  createdAt: new Date(),
  activeAt: new Date(),
  author,
  category: { slug: 'ayuda', name: 'Ayuda técnica' },
  _count: { comments: 3, likes: 2 },
  ...overrides,
});

describe('ForumPostList', () => {
  it('lists threads with their category, author, counts and flags', () => {
    render(
      <ForumPostList
        posts={[summary({ isPinned: true }), summary({ id: 'p2', isLocked: true })]}
      />,
    );
    const [first, second] = screen.getAllByRole('listitem');
    expect(within(first).getByRole('link')).toHaveAttribute('href', '/foro/tema/p1');
    expect(first).toHaveTextContent('#ayuda por @Ana');
    expect(within(first).getByLabelText('Fijado')).toBeInTheDocument();
    expect(within(first).getByText(/respuestas/).parentElement).toHaveTextContent('3');
    expect(within(second).getByLabelText('Cerrado')).toBeInTheDocument();
  });

  it('hides the category inside one and invites to open the first thread when empty', () => {
    const { rerender } = render(<ForumPostList posts={[summary({})]} showCategory={false} />);
    expect(screen.queryByText(/#ayuda/)).not.toBeInTheDocument();
    rerender(<ForumPostList posts={[]} />);
    expect(screen.getByText(/todavía no hay temas/)).toBeInTheDocument();
  });
});

describe('FamousForums', () => {
  it('links every forum in a new tab', () => {
    render(<FamousForums />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(FAMOUS_FORUMS.length);
    expect(screen.getByRole('link', { name: /Stack Overflow/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  });
});

describe('ForumPostForm', () => {
  const categories = [
    { id: 'cat-1', name: 'General' },
    { id: 'cat-2', name: 'Ayuda técnica' },
  ];

  it('publishes a thread and opens it, with a markdown preview', async () => {
    const user = userEvent.setup();
    render(<ForumPostForm categories={categories} defaultCategoryId="cat-2" />);

    await user.type(screen.getByPlaceholderText('¿Qué querés charlar?'), 'Mi primer tema');
    await user.type(
      screen.getByRole('textbox', { name: 'Contenido' }),
      'Hola **comunidad**, ¿cómo andan?',
    );
    await user.click(screen.getByRole('tab', { name: /vista-previa/ }));
    expect(screen.getByText('comunidad', { selector: 'strong' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'publicarTema();' }));
    await waitFor(() =>
      expect(createForumPost).toHaveBeenCalledWith({
        title: 'Mi primer tema',
        categoryId: 'cat-2',
        content: 'Hola **comunidad**, ¿cómo andan?',
      }),
    );
    expect(push).toHaveBeenCalledWith('/foro/tema/new');
  });

  it('validates before publishing', async () => {
    const user = userEvent.setup();
    render(<ForumPostForm categories={categories} />);
    await user.click(screen.getByRole('button', { name: 'publicarTema();' }));
    expect(await screen.findByText(/al menos 5 caracteres/)).toBeInTheDocument();
    expect(screen.getByText('Elegí una categoría')).toBeInTheDocument();
    expect(createForumPost).not.toHaveBeenCalled();
  });

  it('saves an edit and reports failures', async () => {
    const user = userEvent.setup();
    const post = {
      id: 'p1',
      title: 'Título viejo',
      categoryId: 'cat-1',
      content: 'Contenido de más de veinte caracteres',
    };
    render(<ForumPostForm categories={categories} post={post} />);

    jest.mocked(updateForumPost).mockRejectedValueOnce(new Error('x'));
    await user.click(screen.getByRole('button', { name: 'guardarCambios();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'guardarCambios();' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/foro/tema/p1'));
    expect(updateForumPost).toHaveBeenLastCalledWith('p1', {
      title: 'Título viejo',
      categoryId: 'cat-1',
      content: 'Contenido de más de veinte caracteres',
    });
  });
});

describe('ForumThreadActions', () => {
  it('lets the author edit and delete after confirming', async () => {
    const user = userEvent.setup();
    render(
      <ForumThreadActions postId="p1" canEdit isAdmin={false} isPinned={false} isLocked={false} />,
    );

    expect(screen.getByRole('link', { name: /editar/ })).toHaveAttribute(
      'href',
      '/foro/tema/p1/editar',
    );
    expect(screen.queryByRole('button', { name: /fijar/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /eliminar/ }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/foro'));
    expect(deleteForumPost).toHaveBeenCalledWith('p1');
  });

  it('lets admins pin and lock', async () => {
    const user = userEvent.setup();
    render(<ForumThreadActions postId="p1" canEdit={false} isAdmin isPinned isLocked={false} />);
    await user.click(screen.getByRole('button', { name: /desfijar/ }));
    expect(moderateForumPost).toHaveBeenCalledWith('p1', { isPinned: false });
    await user.click(screen.getByRole('button', { name: /cerrar/ }));
    await waitFor(() => expect(moderateForumPost).toHaveBeenCalledWith('p1', { isLocked: true }));
  });
});

describe('ForumComments', () => {
  const node = (id: string, authorId: string, replies: ForumCommentNode[] = []) =>
    ({
      id,
      content: `respuesta ${id}`,
      authorId,
      postId: 'p1',
      parentCommentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: authorId, name: `@${authorId}`, image: null },
      replies,
    }) as ForumCommentNode;

  it('shows nested replies and answers the thread or a comment', async () => {
    const user = userEvent.setup();
    render(
      <ForumComments
        postId="p1"
        comments={[node('c1', 'u2', [node('c2', 'u1')])]}
        total={2}
        viewer={{ id: 'u1', isAdmin: false }}
        isLocked={false}
      />,
    );

    expect(screen.getByText('2 respuestas', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('respuesta c2')).toBeInTheDocument();
    // Only the viewer's own comment can be deleted
    expect(screen.getAllByRole('button', { name: /borrar/ })).toHaveLength(1);

    await user.type(screen.getByRole('textbox', { name: 'Tu respuesta' }), 'Gracias!');
    await user.click(screen.getAllByRole('button', { name: 'responder();' }).at(-1)!);
    await waitFor(() =>
      expect(createForumComment).toHaveBeenCalledWith('p1', {
        content: 'Gracias!',
        parentCommentId: null,
      }),
    );
    expect(refresh).toHaveBeenCalled();

    await user.click(screen.getAllByRole('button', { name: /^responder$/ })[0]);
    await user.type(screen.getByRole('textbox', { name: 'Tu respuesta al comentario' }), 'Sí');
    await user.click(screen.getAllByRole('button', { name: 'responder();' })[0]);
    await waitFor(() =>
      expect(createForumComment).toHaveBeenLastCalledWith('p1', {
        content: 'Sí',
        parentCommentId: 'c1',
      }),
    );

    await user.click(screen.getByRole('button', { name: /borrar/ }));
    await waitFor(() => expect(deleteForumComment).toHaveBeenCalledWith('c2'));
  });

  it('closes replies on locked threads and asks visitors to sign in', () => {
    const { rerender } = render(
      <ForumComments
        postId="p1"
        comments={[node('c1', 'u2')]}
        total={1}
        viewer={{ id: 'u1', isAdmin: false }}
        isLocked
      />,
    );
    expect(screen.getByText(/está cerrado/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^responder$/ })).not.toBeInTheDocument();

    rerender(<ForumComments postId="p1" comments={[]} total={0} viewer={null} isLocked={false} />);
    expect(screen.getByRole('link', { name: 'Iniciá sesión' })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion?redirect=/foro/tema/p1',
    );
  });
});
