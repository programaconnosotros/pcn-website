import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationSuccessDialog } from './registration-success-dialog';

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('RegistrationSuccessDialog', () => {
  it('confirms the registration and closes', async () => {
    const onClose = jest.fn();
    render(<RegistrationSuccessDialog open onClose={onClose} eventName="Meetup" />);

    expect(screen.getByRole('dialog')).toHaveTextContent('Ya estás registrado en Meetup');
    await userEvent.click(screen.getByRole('button', { name: 'entendido();' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('shows the waitlist position', () => {
    render(
      <RegistrationSuccessDialog
        open
        onClose={jest.fn()}
        eventName="Meetup"
        waitlistPosition={4}
      />,
    );

    expect(screen.getByRole('heading')).toHaveTextContent('Estás en la lista de espera');
    expect(screen.getByRole('dialog')).toHaveTextContent('tu lugar en la fila es el #4');
  });
});
