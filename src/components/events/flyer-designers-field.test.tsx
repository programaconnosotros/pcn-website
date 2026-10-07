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

  it('adds a designer without an account to a flyer, once', async () => {
    const onChange = jest.fn();
    render(<FlyerDesignersField flyers={['/a.png']} value={[]} onChange={onChange} />);
    await userEvent.type(
      screen.getByLabelText('Agregar un diseñador sin cuenta al flyer 1'),
      'Beto{Enter}',
    );
    expect(onChange).toHaveBeenCalledWith([{ flyerSrc: '/a.png', name: 'Beto', userId: null }]);
  });

  it('removes a credited designer', async () => {
    const onChange = jest.fn();
    const beto = { flyerSrc: '/a.png', name: 'Beto', userId: null };
    render(<FlyerDesignersField flyers={['/a.png']} value={[beto]} onChange={onChange} />);
    expect(screen.getByText(/1 diseñador/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Quitar a Beto' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
