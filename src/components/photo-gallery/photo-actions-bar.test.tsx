import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoActionsBar } from './photo-actions-bar';
import { SortSelector } from './sort-selector';
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

describe('SortSelector', () => {
  it.each([
    ['default', "ordenar('predeterminado');"],
    ['date-asc', "ordenar('antiguas');"],
    ['date-desc', "ordenar('recientes');"],
  ] as const)('shows the %s order and changes it', async (order, label) => {
    const onSortChange = jest.fn();
    render(<SortSelector sortOrder={order} onSortChange={onSortChange} />);

    await userEvent.click(screen.getByRole('button', { name: label }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Más antiguas primero' }));
    expect(onSortChange).toHaveBeenCalledWith('date-asc');
  });

  it('offers every order', async () => {
    const onSortChange = jest.fn();
    render(<SortSelector sortOrder="default" onSortChange={onSortChange} />);

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Más recientes primero' }));
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Orden predeterminado' }));
    expect(onSortChange.mock.calls).toEqual([['date-desc'], ['default']]);
  });
});

describe('VideoBadge', () => {
  it('marks a video thumbnail', () => {
    render(<VideoBadge className="x" />);

    expect(screen.getByText('Video')).toHaveClass('sr-only');
  });
});
