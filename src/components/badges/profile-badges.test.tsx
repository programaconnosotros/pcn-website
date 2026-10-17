import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { listBadges, revokeBadge } from '@/actions/badges/badge-actions';
import { TooltipProvider } from '@/components/ui/tooltip';
import { COFOUNDER_BADGE } from '@/lib/badges';
import { mockRouter } from '@/test/dom';
import { ProfileBadges } from './profile-badges';

jest.mock('@/actions/badges/badge-actions', () => ({
  awardBadge: jest.fn(),
  createBadge: jest.fn(),
  listBadges: jest.fn(),
  revokeBadge: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const custom = {
  id: 'b1',
  name: 'Mentor',
  description: 'Ayudó a muchos',
  icon: 'star' as const,
  tone: 'cyan' as const,
  awardedAt: new Date('2030-03-15T12:00:00Z'),
  custom: true,
};

const renderBadges = (props: Partial<React.ComponentProps<typeof ProfileBadges>> = {}) =>
  render(
    <ProfileBadges
      userId="u1"
      userName="Ada"
      badges={[COFOUNDER_BADGE, custom]}
      isAdmin={false}
      {...props}
    />,
    { wrapper: TooltipProvider },
  );

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('ProfileBadges', () => {
  it('renders nothing for a member without badges when not admin', () => {
    const { container } = renderBadges({ badges: [] });

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the badges with the month they were awarded and their description on hover', async () => {
    renderBadges();

    expect(screen.getByRole('heading')).toHaveTextContent('## badges[2]');
    expect(screen.getByText('Co-founder')).toBeInTheDocument();
    expect(screen.getByText(/mar.*2030/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    await userEvent.hover(screen.getByText('Mentor'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Ayudó a muchos');
  });

  it('lets admins open the award dialog, even with no badges yet', async () => {
    jest.mocked(listBadges).mockResolvedValue([]);
    renderBadges({ badges: [], isAdmin: true });

    expect(screen.getByText('Todavía no tiene badges.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'otorgar' }));

    expect(await screen.findByRole('dialog')).toHaveTextContent('otorgarBadge(Ada)');
  });

  it('lets admins take back custom badges only', async () => {
    jest.mocked(revokeBadge).mockResolvedValueOnce(undefined as never);
    jest.mocked(revokeBadge).mockRejectedValueOnce(new Error('No autorizado'));
    jest.mocked(revokeBadge).mockRejectedValueOnce('x');
    renderBadges({ isAdmin: true });

    expect(
      screen.queryByRole('button', { name: 'Quitar el badge Co-founder' }),
    ).not.toBeInTheDocument();
    const revoke = screen.getByRole('button', { name: 'Quitar el badge Mentor' });
    await userEvent.click(revoke);

    expect(revokeBadge).toHaveBeenCalledWith('u1', 'b1');
    await waitFor(() => expect(mockRouter.refresh).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Badge "Mentor" quitado');

    await waitFor(() => expect(revoke).toBeEnabled());
    await userEvent.click(revoke);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado'));
    await waitFor(() => expect(revoke).toBeEnabled());
    await userEvent.click(revoke);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo quitar el badge'));
  });
});
