import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlyerDesignersField } from './flyer-designers-field';

jest.mock('@/actions/users/search-users-for-speaker', () => ({
  searchUsersForSpeaker: jest.fn().mockResolvedValue([]),
}));

describe('FlyerDesignersField', () => {
  it('asks for a flyer before crediting anyone', () => {
    render(<FlyerDesignersField flyers={[]} value={[]} onChange={jest.fn()} />);
    expect(screen.getByText(/Subí un flyer/)).toBeInTheDocument();
  });

  it('adds a designer without an account, once', async () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <FlyerDesignersField flyers={['/a.png', '/b.png']} value={[]} onChange={onChange} />,
    );
    const input = screen.getByLabelText('Agregar un diseñador sin cuenta');
    await userEvent.type(input, 'Beto{Enter}');
    expect(onChange).toHaveBeenCalledWith([{ name: 'Beto', userId: null }]);

    onChange.mockClear();
    rerender(
      <FlyerDesignersField
        flyers={['/a.png', '/b.png']}
        value={[{ name: 'Beto', userId: null }]}
        onChange={onChange}
      />,
    );
    await userEvent.type(input, 'beto{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a credited designer', async () => {
    const onChange = jest.fn();
    const beto = { name: 'Beto', userId: null };
    render(<FlyerDesignersField flyers={['/a.png']} value={[beto]} onChange={onChange} />);
    expect(screen.getByText(/1 diseñador/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Quitar a Beto' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
