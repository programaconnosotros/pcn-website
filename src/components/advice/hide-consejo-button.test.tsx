import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import {
  hideExtractedConsejo,
  restoreExtractedConsejo,
} from '@/actions/advice/hide-extracted-consejo';
import { HideConsejoButton } from './hide-consejo-button';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/actions/advice/hide-extracted-consejo', () => ({
  hideExtractedConsejo: jest.fn(),
  restoreExtractedConsejo: jest.fn(),
}));

describe('HideConsejoButton', () => {
  it('hides after confirming, goes back to the list and offers to undo', async () => {
    const user = userEvent.setup();
    render(<HideConsejoButton consejoId="auto-x" />);

    await user.click(screen.getByRole('button', { name: /ocultar/ }));
    await user.click(screen.getByRole('button', { name: 'Ocultar' }));

    expect(hideExtractedConsejo).toHaveBeenCalledWith('auto-x');
    await waitFor(() => expect(push).toHaveBeenCalledWith('/consejos'));
    const [, options] = jest.mocked(toast.success).mock.calls[0] as unknown as [
      string,
      { action: { onClick: () => Promise<void> } },
    ];
    await options.action.onClick();
    expect(restoreExtractedConsejo).toHaveBeenCalledWith('auto-x');
    expect(push).toHaveBeenLastCalledWith('/consejos/auto-x');
  });

  it('reports a failure and stays', async () => {
    jest.mocked(hideExtractedConsejo).mockRejectedValueOnce(new Error('x'));
    const user = userEvent.setup();
    render(<HideConsejoButton consejoId="auto-x" />);

    await user.click(screen.getByRole('button', { name: /ocultar/ }));
    await user.click(screen.getByRole('button', { name: 'Ocultar' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
  });
});
