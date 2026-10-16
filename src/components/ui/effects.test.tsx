import { act, render, screen } from '@testing-library/react';
import { PcnLoader } from './pcn-loader';

describe('PcnLoader', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('counts up a boot log that never reaches 100%', () => {
    render(<PcnLoader label="eventos" />);
    const status = screen.getByRole('status', { name: 'Cargando eventos' });
    expect(status).toHaveTextContent('$ open eventos');
    expect(status).toHaveTextContent('00%');
    expect(status).toHaveTextContent('resolviendo ruta');

    act(() => jest.advanceTimersByTime(70 * 300));
    expect(status).toHaveTextContent('99%');
    expect(status).toHaveTextContent('montando interfaz');
    expect(status.textContent).toMatch(/0x[0-9a-f]{8}/);
  });

  it('has a generic label', () => {
    render(<PcnLoader />);
    expect(screen.getByRole('status', { name: 'Cargando' })).toHaveTextContent('$ boot pcn');
  });
});
