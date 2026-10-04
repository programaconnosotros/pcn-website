import { render, screen } from '@testing-library/react';
import { WhatsappSpeakerButton } from './whatsapp-speaker-button';

describe('WhatsappSpeakerButton', () => {
  it('opens a WhatsApp chat with a prefilled message', () => {
    render(
      <WhatsappSpeakerButton
        phone="5493510000000"
        speakerName="Ada"
        talkTitle="Rust & co"
        eventName="Meetup"
      />,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    const url = new URL(link.getAttribute('href')!);
    expect(url.origin + url.pathname).toBe('https://wa.me/5493510000000');
    expect(url.searchParams.get('text')).toBe(
      'Hola Ada, te escribimos desde PCN por tu propuesta de charla "Rust & co" para el evento Meetup.',
    );
  });
});
