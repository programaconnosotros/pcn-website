import { render } from '@testing-library/react';
import { toast } from 'sonner';
import { deleteEvent } from '@/actions/events/delete-event';
import { DeleteEventDialog } from './delete-event-dialog';

jest.mock('@/actions/events/delete-event', () => ({ deleteEvent: jest.fn() }));
jest.mock('@/actions/errors/log-error', () => ({ logError: jest.fn(), logClientError: jest.fn() }));
jest.mock('sonner', () => ({
  toast: { loading: jest.fn(() => 't'), success: jest.fn(), error: jest.fn() },
}));

let onAction: () => Promise<void>;
jest.mock('@/components/ui/alert-dialog', () => {
  const Pass = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  return {
    AlertDialog: Pass,
    AlertDialogContent: Pass,
    AlertDialogHeader: Pass,
    AlertDialogFooter: Pass,
    AlertDialogTitle: Pass,
    AlertDialogDescription: Pass,
    AlertDialogCancel: Pass,
    AlertDialogAction: ({ onClick }: { onClick: () => Promise<void> }) => {
      onAction = onClick;
      return null;
    },
  };
});

describe('DeleteEventDialog', () => {
  it('closes the dialog, toasts success and rethrows the redirect after deleting', async () => {
    const redirect = Object.assign(new Error('r'), { digest: 'NEXT_REDIRECT;push;/eventos;307;' });
    jest.mocked(deleteEvent).mockRejectedValue(redirect);
    const onOpenChange = jest.fn();
    render(
      <DeleteEventDialog eventId="e1" eventName="Meetup" isOpen onOpenChange={onOpenChange} />,
    );

    await expect(onAction()).rejects.toBe(redirect);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(toast.success).toHaveBeenCalledWith('Evento eliminado correctamente', { id: 't' });
  });
});
