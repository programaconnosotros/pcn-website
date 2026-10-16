import { fireEvent, render, screen } from '@testing-library/react';
import { trackSponsorClick } from '@/actions/sponsors/track-sponsor-click';
import { SponsorLink } from './sponsor-link';

jest.mock('@/actions/sponsors/track-sponsor-click', () => ({ trackSponsorClick: jest.fn() }));

describe('SponsorLink', () => {
  beforeEach(() => jest.mocked(trackSponsorClick).mockResolvedValue(undefined));

  it("opens the sponsor's site in a new tab and counts the click", () => {
    render(
      <SponsorLink
        href="https://acme.dev"
        sponsor={{ name: 'Acme', eventId: 'e1' }}
        source="evento"
      >
        Acme
      </SponsorLink>,
    );
    const link = screen.getByRole('link', { name: 'Acme' });

    expect(link).toHaveAttribute('href', 'https://acme.dev');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    fireEvent.click(link);
    expect(trackSponsorClick).toHaveBeenCalledWith({
      name: 'Acme',
      eventId: 'e1',
      source: 'evento',
    });
  });

  it('counts middle clicks but not right clicks', () => {
    render(
      <SponsorLink href="https://dizenz.com" sponsor={{ name: 'Dizenz' }} source="inicio">
        Dizenz
      </SponsorLink>,
    );
    const link = screen.getByRole('link', { name: 'Dizenz' });

    fireEvent(link, new MouseEvent('auxclick', { bubbles: true, button: 2 }));
    expect(trackSponsorClick).not.toHaveBeenCalled();
    fireEvent(link, new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(trackSponsorClick).toHaveBeenCalledWith({
      name: 'Dizenz',
      eventId: null,
      source: 'inicio',
    });
  });
});
