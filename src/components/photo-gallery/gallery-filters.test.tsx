import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockRouter } from '@/test/dom';
import { GalleryFilters } from './gallery-filters';

const options = {
  events: [{ id: 'e1', name: 'Meetup', date: new Date('2030-05-10T22:00:00Z'), count: 12 }],
  people: [{ id: 'u1', name: 'Ada', count: 3 }],
};

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('GalleryFilters', () => {
  it('links each type keeping the other filters, and offers no reset when unfiltered', () => {
    render(<GalleryFilters filter={{ type: 'todo' }} options={options} />);

    expect(screen.getByRole('link', { name: 'todo' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'videos' })).toHaveAttribute(
      'href',
      '/galeria?tipo=videos',
    );
    expect(screen.getByRole('combobox', { name: 'Filtrar por evento' })).toHaveTextContent(
      'evento: todos',
    );
    expect(screen.queryByRole('link', { name: /limpiar filtros/ })).not.toBeInTheDocument();
  });

  it('navigates when picking an event or a person, and clears with "todos"', async () => {
    render(<GalleryFilters filter={{ type: 'fotos', userId: 'u1' }} options={options} />);

    expect(screen.getByRole('link', { name: 'todo' })).toHaveAttribute(
      'href',
      '/galeria?persona=u1',
    );
    expect(screen.getByRole('combobox', { name: 'Filtrar por persona' })).toHaveTextContent(
      'persona: Ada',
    );
    expect(screen.getByRole('link', { name: /limpiar filtros/ })).toHaveAttribute(
      'href',
      '/galeria',
    );

    await userEvent.click(screen.getByRole('combobox', { name: 'Filtrar por evento' }));
    await userEvent.click(await screen.findByRole('option', { name: /Meetup.*\(12\)/ }));
    expect(mockRouter.push).toHaveBeenLastCalledWith('/galeria?tipo=fotos&evento=e1&persona=u1', {
      scroll: false,
    });

    await userEvent.click(screen.getByRole('combobox', { name: 'Filtrar por persona' }));
    await userEvent.click(await screen.findByRole('option', { name: 'todos' }));
    expect(mockRouter.push).toHaveBeenLastCalledWith('/galeria?tipo=fotos', { scroll: false });
  });
});
