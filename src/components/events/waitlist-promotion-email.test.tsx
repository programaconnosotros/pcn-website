import { render, screen } from '@testing-library/react';
import { WaitlistPromotionEmail } from './waitlist-promotion-email';

describe('WaitlistPromotionEmail', () => {
  it('confirms the spot and links to the event', () => {
    render(
      <WaitlistPromotionEmail
        userName="Ada"
        eventName="Meetup"
        eventDate="sáb 10 may, 19:00"
        eventId="e1"
      />,
    );

    expect(screen.getByText('¡Hola Ada!')).toBeInTheDocument();
    expect(screen.getByText('Meetup')).toBeInTheDocument();
    expect(screen.getByText('sáb 10 may, 19:00')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /verEvento/ }).getAttribute('href')).toMatch(
      /\/eventos\/e1$/,
    );
  });

  it('greets without a name', () => {
    render(<WaitlistPromotionEmail userName="" eventName="M" eventDate="d" eventId="e1" />);

    expect(screen.getByText('¡Hola !')).toBeInTheDocument();
  });
});
