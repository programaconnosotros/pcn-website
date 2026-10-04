import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './pagination';

const pageButtons = () =>
  screen
    .getAllByRole('button')
    .map((button) => button.textContent)
    .filter((text) => /^\d+$/.test(text ?? ''));

describe('Pagination', () => {
  it('renders nothing with a single page', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('lists every page when there are few', () => {
    render(<Pagination currentPage={2} totalPages={4} onPageChange={jest.fn()} />);
    expect(pageButtons()).toEqual(['1', '2', '3', '4']);
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('shows the first pages and the last near the start', () => {
    render(<Pagination currentPage={2} totalPages={10} onPageChange={jest.fn()} />);
    expect(pageButtons()).toEqual(['1', '2', '3', '4', '10']);
    expect(screen.getAllByText('...')).toHaveLength(1);
  });

  it('shows the first page and the last ones near the end', () => {
    render(<Pagination currentPage={9} totalPages={10} onPageChange={jest.fn()} />);
    expect(pageButtons()).toEqual(['1', '7', '8', '9', '10']);
  });

  it('shows the neighbours of a page in the middle', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={jest.fn()} />);
    expect(pageButtons()).toEqual(['1', '4', '5', '6', '10']);
    expect(screen.getAllByText('...')).toHaveLength(2);
  });

  it('moves with the arrows and page buttons, disabling arrows at the ends', async () => {
    const onPageChange = jest.fn();
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />,
    );
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);

    rerender(<Pagination currentPage={3} totalPages={3} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });
});
