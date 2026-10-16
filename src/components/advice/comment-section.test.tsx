import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'sonner';
import { createComment } from '@/actions/comments/create-comment';
import { deleteComment } from '@/actions/comments/delete-comment';
import { editComment } from '@/actions/comments/edit-comment';
import { toggleCommentLike } from '@/actions/comments/toggle-comment-like';
import { buildSession } from '@/test/platform';
import { CommentSection } from './comment-section';

jest.mock('@/actions/comments/create-comment', () => ({ createComment: jest.fn() }));
jest.mock('@/actions/comments/delete-comment', () => ({ deleteComment: jest.fn() }));
jest.mock('@/actions/comments/edit-comment', () => ({ editComment: jest.fn() }));
jest.mock('@/actions/comments/toggle-comment-like', () => ({ toggleCommentLike: jest.fn() }));
jest.mock('@/actions/advice/like-advice', () => ({ toggleLike: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

type Comments = Parameters<typeof CommentSection>[0]['comments'];

const comment = (id: string, content: string, name: string) => ({
  id,
  content,
  adviceId: 'a1',
  authorId: `u-${id}`,
  parentCommentId: null,
  createdAt: new Date('2025-03-01T12:00:00Z'),
  updatedAt: new Date('2025-03-01T12:00:00Z'),
  author: { id: `u-${id}`, name, image: null },
});

const comments = [
  { ...comment('c1', 'Muy bueno', 'Bruno'), replies: [comment('r1', 'Coincido', 'Carla')] },
] as unknown as Comments;

const createMock = createComment as jest.Mock;

const write = async (user: UserEvent, placeholder: string, text: string) => {
  await user.click(screen.getByPlaceholderText(placeholder));
  await user.paste(text);
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('CommentSection', () => {
  it('lists comments with replies and asks visitors to sign in', () => {
    render(<CommentSection adviceId="a1" comments={comments} session={null} />);

    expect(screen.getByText('Muy bueno')).toBeInTheDocument();
    expect(screen.getByText('Coincido')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'iniciar sesión' })).toHaveAttribute(
      'href',
      '/iniciar-sesion',
    );
    expect(screen.queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument();
  });

  it('likes a comment, showing who already liked each one', async () => {
    jest.mocked(toggleCommentLike).mockResolvedValue({ liked: true });
    const liked = [
      {
        ...comment('c1', 'Muy bueno', 'Bruno'),
        likes: [{ userId: 'u-x' }, { userId: 'u-y' }],
        replies: [{ ...comment('r1', 'Coincido', 'Carla'), likes: [] }],
      },
    ] as unknown as Comments;
    const user = userEvent.setup();
    render(<CommentSection adviceId="a1" comments={liked} session={buildSession({ id: 'me' })} />);

    const [onComment, onReply] = screen.getAllByRole('button', { name: /Me gusta/ });
    expect(onComment).toHaveTextContent('2');
    expect(onReply).toHaveTextContent('0');

    await user.click(onReply);

    expect(toggleCommentLike).toHaveBeenCalledWith('r1');
  });

  it('publishes a comment', async () => {
    createMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CommentSection adviceId="a1" comments={[]} session={buildSession()} />);

    await write(user, 'Escribí acá tu comentario', 'Gran consejo');
    await user.click(screen.getByRole('button', { name: 'enviarComentario();' }));

    expect(createMock).toHaveBeenCalledWith({
      content: 'Gran consejo',
      adviceId: 'a1',
      parentCommentId: null,
    });
    expect(toast.success).toHaveBeenCalledWith('Comentario creado');
    expect(screen.getByPlaceholderText('Escribí acá tu comentario')).toHaveValue('');
  });

  it('rejects an empty comment', async () => {
    const user = userEvent.setup();
    render(<CommentSection adviceId="a1" comments={[]} session={buildSession()} />);

    await user.click(screen.getByRole('button', { name: 'enviarComentario();' }));

    expect(await screen.findByText('El comentario no puede estar vacío')).toBeInTheDocument();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('reports a failed comment', async () => {
    createMock.mockRejectedValue(new Error('x'));
    const user = userEvent.setup();
    render(<CommentSection adviceId="a1" comments={[]} session={buildSession()} />);

    await write(user, 'Escribí acá tu comentario', 'Hola');
    await user.click(screen.getByRole('button', { name: 'enviarComentario();' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al crear el comentario'));
  });

  it('replies to a comment and cancels a reply', async () => {
    createMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CommentSection adviceId="a1" comments={comments} session={buildSession()} />);

    // The comment tree re-mounts on every render, so query the buttons again each time
    const replyToFirst = () => screen.getAllByRole('button', { name: 'Responder' })[0];
    await user.click(replyToFirst());
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByPlaceholderText('Escribe tu respuesta...')).not.toBeInTheDocument();

    await user.click(replyToFirst());
    await write(user, 'Escribe tu respuesta...', 'Yo también');
    await user.click(screen.getByRole('button', { name: 'enviarRespuesta();' }));

    expect(createMock).toHaveBeenCalledWith({
      content: 'Yo también',
      adviceId: 'a1',
      parentCommentId: 'c1',
    });
    await waitFor(() =>
      expect(screen.queryByPlaceholderText('Escribe tu respuesta...')).not.toBeInTheDocument(),
    );
  });

  it('adds a reply to a reply to the same thread, so it shows up', async () => {
    createMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CommentSection adviceId="a1" comments={comments} session={buildSession()} />);

    // El segundo "Responder" es el de la respuesta de Carla
    await user.click(screen.getAllByRole('button', { name: 'Responder' })[1]);
    await write(user, 'Escribe tu respuesta...', 'Y yo');
    await user.click(screen.getByRole('button', { name: 'enviarRespuesta();' }));

    expect(createMock).toHaveBeenCalledWith({
      content: 'Y yo',
      adviceId: 'a1',
      parentCommentId: 'c1',
    });
  });

  it('shows validation errors on the reply form', async () => {
    const user = userEvent.setup();
    render(<CommentSection adviceId="a1" comments={comments} session={buildSession()} />);

    await user.click(screen.getAllByRole('button', { name: 'Responder' })[1]);
    await user.click(screen.getByRole('button', { name: 'enviarRespuesta();' }));

    expect(await screen.findAllByText('El comentario no puede estar vacío')).not.toHaveLength(0);
  });

  it('offers to delete only your own comments, unless you are an admin', () => {
    const { unmount } = render(
      <CommentSection adviceId="a1" comments={comments} session={buildSession({ id: 'u-r1' })} />,
    );
    expect(screen.getAllByRole('button', { name: 'Eliminar' })).toHaveLength(1);
    unmount();

    render(
      <CommentSection
        adviceId="a1"
        comments={comments}
        session={buildSession({ role: 'ADMIN' })}
      />,
    );
    expect(screen.getAllByRole('button', { name: 'Eliminar' })).toHaveLength(2);
  });

  it('lets whoever published the consejo delete every comment on it', () => {
    render(
      <CommentSection
        adviceId="a1"
        comments={comments}
        session={buildSession({ id: 'consejo-author' })}
        consejoAuthorId="consejo-author"
      />,
    );
    expect(screen.getAllByRole('button', { name: 'Eliminar' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });

  it('deletes a comment after confirming, warning that its replies go too', async () => {
    (deleteComment as jest.Mock).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <CommentSection adviceId="a1" comments={comments} session={buildSession({ id: 'u-c1' })} />,
    );

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(
      screen.getByText(/Las respuestas al comentario también se eliminan/),
    ).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Eliminar' }),
    );

    expect(deleteComment).toHaveBeenCalledWith('c1');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('lets only the author edit a comment, and marks edited ones', () => {
    const edited = [
      {
        ...comment('c1', 'Muy bueno', 'Bruno'),
        updatedAt: new Date('2025-03-02T12:00:00Z'),
        replies: [comment('r1', 'Coincido', 'Carla')],
      },
    ] as unknown as Comments;
    render(
      <CommentSection adviceId="a1" comments={edited} session={buildSession({ role: 'ADMIN' })} />,
    );

    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.getAllByText(/\(editado\)/)).toHaveLength(1);
  });

  it('edits a comment in place', async () => {
    (editComment as jest.Mock).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <CommentSection adviceId="a1" comments={comments} session={buildSession({ id: 'u-r1' })} />,
    );

    await user.click(screen.getByRole('button', { name: 'Editar' }));
    const box = screen.getByRole('textbox', { name: 'Editar comentario' });
    expect(box).toHaveValue('Coincido');
    await user.clear(box);
    await user.paste('Coincido totalmente');
    await user.click(screen.getByRole('button', { name: 'guardar();' }));

    expect(editComment).toHaveBeenCalledWith({ commentId: 'r1', content: 'Coincido totalmente' });
    expect(toast.success).toHaveBeenCalledWith('Comentario editado');
    await waitFor(() =>
      expect(screen.queryByRole('textbox', { name: 'Editar comentario' })).not.toBeInTheDocument(),
    );
  });
});
