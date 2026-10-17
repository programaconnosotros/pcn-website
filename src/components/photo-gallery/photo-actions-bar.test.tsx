import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoActionsBar } from './photo-actions-bar';
import { VideoBadge } from './video-badge';

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('PhotoActionsBar', () => {
  it('downloads and shares the photo', async () => {
    render(
      <PhotoActionsBar
        photo={{
          id: 'p1',
          src: 's',
          takenAt: new Date(),
          description: null,
          event: { name: 'Meetup' },
        }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Descargar' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Compartir' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('"Meetup"');
    expect(screen.getByRole('textbox')).toHaveValue(`${window.location.origin}/galeria/p1`);

    await userEvent.click(screen.getByRole('button', { name: 'cerrar();' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('VideoBadge', () => {
  it('marks a video thumbnail', () => {
    render(<VideoBadge className="x" />);

    expect(screen.getByText('Video')).toHaveClass('sr-only');
  });
});
