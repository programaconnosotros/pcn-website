import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { awardBadge, createBadge, listBadges } from '@/actions/badges/badge-actions';
import { mockRouter } from '@/test/dom';
import { AwardBadgeDialog } from './award-badge-dialog';

jest.mock('@/actions/badges/badge-actions', () => ({
  awardBadge: jest.fn(),
  createBadge: jest.fn(),
  listBadges: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const catalog = [
  {
    id: 'b1',
    name: 'Bug Hunter',
    description: 'Encontró bugs',
    icon: 'star',
    tone: 'red',
    _count: { awards: 3 },
  },
  {
    id: 'b2',
    name: 'Raro',
    description: 'Ícono viejo',
    icon: 'nope',
    tone: 'nope',
    _count: { awards: 0 },
  },
];

const renderDialog = (props: Partial<React.ComponentProps<typeof AwardBadgeDialog>> = {}) => {
  const onOpenChange = jest.fn();
  render(
    <AwardBadgeDialog
      open
      onOpenChange={onOpenChange}
      userId="u1"
      userName="Ada Lovelace"
      ownedBadgeIds={['b2']}
      {...props}
    />,
  );
  return { onOpenChange };
};

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('AwardBadgeDialog', () => {
  it('awards an existing badge the member does not have yet', async () => {
    jest.mocked(listBadges).mockResolvedValue(catalog as never);
    jest.mocked(awardBadge).mockResolvedValue(undefined as never);
    const { onOpenChange } = renderDialog();

    expect(screen.getByRole('heading')).toHaveTextContent('otorgarBadge(Ada)');
    const owned = await screen.findByRole('button', { name: /Raro/ });
    expect(owned).toBeDisabled();
    expect(owned).toHaveTextContent('ya lo tiene');
    await userEvent.click(screen.getByRole('button', { name: /Bug Hunter.*3 lo tienen/ }));

    expect(awardBadge).toHaveBeenCalledWith('u1', 'b1');
    await waitFor(() => expect(mockRouter.refresh).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Ada Lovelace ganó "Bug Hunter"');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('toasts when awarding fails', async () => {
    jest.mocked(listBadges).mockResolvedValue(catalog as never);
    jest.mocked(awardBadge).mockRejectedValueOnce(new Error('Ya lo tiene'));
    jest.mocked(awardBadge).mockRejectedValueOnce('x');
    renderDialog({ ownedBadgeIds: [] });

    await userEvent.click(await screen.findByRole('button', { name: /Bug Hunter/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Ya lo tiene'));
    await waitFor(() => expect(screen.getByRole('button', { name: /Bug Hunter/ })).toBeEnabled(), {
      timeout: 5000,
    });
    await userEvent.click(screen.getByRole('button', { name: /Bug Hunter/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo otorgar'));
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it('designs and awards a new badge once name and description are long enough', async () => {
    jest.mocked(listBadges).mockResolvedValue([]);
    jest.mocked(createBadge).mockResolvedValue(undefined as never);
    renderDialog();

    expect(await screen.findByText('Todavía no hay badges. Creá el primero.')).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: 'crearYOtorgar();' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('Nombre (ej: Bug Hunter)'), {
      target: { value: 'Mentor' },
    });
    expect(screen.getByText('Mentor')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Por qué se lo ganan/), {
      target: { value: 'Ayudó a muchos' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'crown' }));
    expect(screen.getByRole('button', { name: 'crown' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'oro' }));
    expect(screen.getByRole('button', { name: 'oro' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(submit);

    expect(createBadge).toHaveBeenCalledWith(
      { name: 'Mentor', description: 'Ayudó a muchos', icon: 'crown', tone: 'gold' },
      'u1',
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Ada Lovelace ganó "Mentor"'));
    expect(screen.getByPlaceholderText('Nombre (ej: Bug Hunter)')).toHaveValue('');
  });

  it('toasts when creating fails and treats a failing catalog as empty', async () => {
    jest.mocked(listBadges).mockRejectedValue(new Error('x'));
    jest.mocked(createBadge).mockRejectedValueOnce(new Error('Nombre repetido'));
    jest.mocked(createBadge).mockRejectedValueOnce('x');
    renderDialog();

    expect(await screen.findByText(/Todavía no hay badges/)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Nombre (ej: Bug Hunter)'), {
      target: { value: 'Mentor' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Por qué se lo ganan/), {
      target: { value: 'Ayudó a muchos' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'crearYOtorgar();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Nombre repetido'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'crearYOtorgar();' })).toBeEnabled(),
    );
    await userEvent.click(screen.getByRole('button', { name: 'crearYOtorgar();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo crear el badge'));
  });

  it('does not load the catalog while closed', () => {
    renderDialog({ open: false });

    expect(listBadges).not.toHaveBeenCalled();
  });
});
