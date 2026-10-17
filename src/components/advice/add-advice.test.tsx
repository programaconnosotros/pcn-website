import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'sonner';
import { createAdvice } from '@actions/advice/create-advice';
import { rateLimitDigest } from '@/lib/rate-limit-messages';
import { AddAdvice } from './add-advice';

jest.mock('@actions/advice/create-advice', () => ({ createAdvice: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const createMock = createAdvice as jest.Mock;

const open = async (user: UserEvent) => {
  await user.click(screen.getByRole('button', { name: /publicarConsejo/ }));
  return screen.getByRole('dialog', { name: 'Publicar un consejo' });
};

const write = async (user: UserEvent, text: string) => {
  await user.click(screen.getByPlaceholderText('Escribí acá tu consejo...'));
  await user.paste(text);
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('AddAdvice', () => {
  it('validates the length of the consejo', async () => {
    const user = userEvent.setup();
    render(<AddAdvice />);
    await open(user);

    await write(user, 'corto');
    await user.click(screen.getByRole('button', { name: 'publicar();' }));

    expect(
      await screen.findByText('Tenés que escribir al menos 10 caracteres'),
    ).toBeInTheDocument();
    expect(createMock).not.toHaveBeenCalled();
  });

  it('publishes the consejo and closes the dialog', async () => {
    createMock.mockResolvedValue({ id: 'a1' });
    const user = userEvent.setup();
    render(<AddAdvice />);
    await open(user);

    await write(user, 'Leé la documentación oficial');
    await user.click(screen.getByRole('button', { name: 'publicar();' }));

    expect(createMock).toHaveBeenCalledWith('Leé la documentación oficial', []);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Consejo publicado! 👏'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // The form was reset for the next one
    await open(user);
    expect(screen.getByPlaceholderText('Escribí acá tu consejo...')).toHaveValue('');
  });

  it('shows the rate-limit message when publishing too much', async () => {
    createMock.mockRejectedValue(
      Object.assign(new Error('x'), { digest: rateLimitDigest('createContent', 600) }),
    );
    const user = userEvent.setup();
    render(<AddAdvice />);
    await open(user);

    await write(user, 'Un consejo bastante largo');
    await user.click(screen.getByRole('button', { name: 'publicar();' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('10 minutos')),
    );
  });

  it('keeps the dialog open when publishing fails', async () => {
    createMock.mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    render(<AddAdvice />);
    await open(user);

    await write(user, 'Un consejo bastante largo');
    await user.click(screen.getByRole('button', { name: 'publicar();' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Ocurrió un error al publicar el consejo'),
    );
    expect(screen.getByRole('dialog', { name: 'Publicar un consejo' })).toBeInTheDocument();
  });
});
