import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { getMyRecommendations } from '@/actions/recommendations/get-my-recommendations';
import { submitRecommendation } from '@/actions/recommendations/submit-recommendation';
import { renderWithQuery } from '@/test/platform';
import { RecommendButton, myRecommendationsKey } from './recommend-button';

jest.mock('@/actions/recommendations/get-my-recommendations', () => ({
  getMyRecommendations: jest.fn(),
}));
jest.mock('@/actions/recommendations/submit-recommendation', () => ({
  submitRecommendation: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const push = jest.fn();
const refresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => '/videos',
}));

const member = (items: Awaited<ReturnType<typeof getMyRecommendations>>['items'] = []) =>
  jest.mocked(getMyRecommendations).mockResolvedValue({
    isAuthenticated: true,
    isAdmin: false,
    items,
  });

const open = async (name = /recomendar video/) => {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(getMyRecommendations).toHaveBeenCalled());
  await userEvent.click(button);
  return screen.findByRole('dialog');
};

describe('RecommendButton', () => {
  it('sends visitors without a session to the login, back to this page', async () => {
    jest.mocked(getMyRecommendations).mockResolvedValue({
      isAuthenticated: false,
      isAdmin: false,
      items: [],
    });
    const { client } = renderWithQuery(<RecommendButton kind="VIDEO" />);
    await waitFor(() => expect(client.getQueryData(myRecommendationsKey('VIDEO'))).toBeDefined());

    await userEvent.click(screen.getByRole('button', { name: /recomendar video/ }));

    expect(push).toHaveBeenCalledWith('/autenticacion/iniciar-sesion?redirect=%2Fvideos');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows how many of yours wait for review, and each one’s status', async () => {
    member([
      { id: 'r1', title: 'Mi charla', status: 'PENDING', createdAt: new Date() },
      { id: 'r2', title: 'Otra', status: 'REJECTED', createdAt: new Date() },
    ]);
    renderWithQuery(<RecommendButton kind="VIDEO" />);

    expect(await screen.findByTitle('1 pendiente de revisión')).toHaveTextContent('1');
    await open();
    expect(screen.getByText('Mi charla')).toBeInTheDocument();
    expect(screen.getByText('pendiente de revisión')).toBeInTheDocument();
    expect(screen.getByText('no se sumó')).toBeInTheDocument();
  });

  it('sends the member’s form and thanks them, pending review', async () => {
    member();
    jest.mocked(submitRecommendation).mockResolvedValue({ success: true, status: 'PENDING' });
    renderWithQuery(
      <RecommendButton kind="VIDEO" defaults={{ isTalk: true }} label="recomendar charla" />,
    );

    await open(/recomendar charla/);
    // Members only see what they fill: no duration or date.
    expect(screen.queryByLabelText('duración')).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/link de youtube/), 'https://youtu.be/HqB3t7046QE');
    await userEvent.type(screen.getByLabelText(/título/), 'Una charla');
    expect(screen.getByRole('checkbox', { name: /charla de una conferencia/ })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: /enviar/ }));

    await waitFor(() =>
      expect(submitRecommendation).toHaveBeenCalledWith(
        'VIDEO',
        expect.objectContaining({
          url: 'https://youtu.be/HqB3t7046QE',
          title: 'Una charla',
          isTalk: true,
        }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith(
      '¡Gracias! Un admin lo va a revisar antes de sumarlo a la lista',
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(refresh).not.toHaveBeenCalled();
  });

  it('keeps the form open with the error when it can’t be saved', async () => {
    member();
    jest
      .mocked(submitRecommendation)
      .mockResolvedValueOnce({ success: false, error: 'Ya está en la lista' })
      .mockRejectedValueOnce(
        Object.assign(new Error('x'), { digest: 'RATE_LIMIT:recommendation:120' }),
      );
    renderWithQuery(<RecommendButton kind="BOOK" />);

    await open(/recomendar libro/);
    await userEvent.click(screen.getByRole('button', { name: /enviar/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya está en la lista');

    await userEvent.click(screen.getByRole('button', { name: /enviar/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/recomendar de nuevo en 2 minutos/);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('lets admins fill everything and publish it right away', async () => {
    jest.mocked(getMyRecommendations).mockResolvedValue({
      isAuthenticated: true,
      isAdmin: true,
      items: [],
    });
    jest.mocked(submitRecommendation).mockResolvedValue({ success: true, status: 'APPROVED' });
    renderWithQuery(<RecommendButton kind="VIDEO" />);

    const dialog = await open();
    expect(dialog).toHaveTextContent(/se publica directo/);
    expect(screen.getByLabelText('duración')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /publicar/ }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Publicaste un video nuevo');
  });
});
