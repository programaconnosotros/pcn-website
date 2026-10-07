import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'sonner';
import { createComment } from '@/actions/comments/create-comment';
import { buildSession } from '@/test/platform';
import { CommentSection } from './comment-section';

jest.mock('@/actions/comments/create-comment', () => ({ createComment: jest.fn() }));
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
      '/autenticacion/iniciar-sesion',
    );
    expect(screen.queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument();
  });

  it('publishes a comment', async () => {
    createMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CommentSection adviceId="a1" comments={[]} session={buildSession()} />);

    await write(user, 'Escribe tu comentario...', 'Gran consejo');
    await user.click(screen.getByRole('button', { name: 'enviarComentario();' }));

    expect(createMock).toHaveBeenCalledWith({
      content: 'Gran consejo',
      adviceId: 'a1',
      parentCommentId: null,
    });
    expect(toast.success).toHaveBeenCalledWith('Comentario creado');
    expect(screen.getByPlaceholderText('Escribe tu comentario...')).toHaveValue('');
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

    await write(user, 'Escribe tu comentario...', 'Hola');
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
});
