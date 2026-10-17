import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './search-bar';

const Harness = ({ initial = '' }: { initial?: string }) => {
  const [query, setQuery] = useState(initial);
  return (
    <>
      <SearchBar searchQuery={query} setSearchQuery={setQuery} label="Buscar eventos" />
      <output>{query}</output>
      <textarea aria-label="otro campo" />
    </>
  );
};

describe('SearchBar', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('filters as you type', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByRole('textbox', { name: 'Buscar eventos' }), 'react');

    expect(screen.getByRole('status')).toHaveTextContent('react');
  });

  it('clears the query with Escape and with the clear button', async () => {
    render(<Harness initial="next" />);
    const input = screen.getByRole('textbox', { name: 'Buscar eventos' });

    await userEvent.type(input, '{Escape}');
    expect(input).toHaveValue('');

    await userEvent.type(input, 'vue');
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });

  it('focuses the input when pressing / anywhere on the page', async () => {
    render(<Harness />);

    await userEvent.keyboard('/');

    expect(screen.getByRole('textbox', { name: 'Buscar eventos' })).toHaveFocus();
  });

  it('does not steal / while typing in another field', async () => {
    render(<Harness />);
    const other = screen.getByRole('textbox', { name: 'otro campo' });

    await userEvent.type(other, 'a/b');

    expect(other).toHaveValue('a/b');
    expect(other).toHaveFocus();
  });

  it('prefills the query from ?q= in the URL', () => {
    window.history.replaceState(null, '', '/eventos?q=meetup');

    render(<Harness />);

    expect(screen.getByRole('textbox', { name: 'Buscar eventos' })).toHaveValue('meetup');
  });
});
