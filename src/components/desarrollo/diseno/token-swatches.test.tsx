import { render, screen } from '@testing-library/react';
import { GreenScale, SemanticSwatches } from './token-swatches';

describe('token swatches', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--background', '0 0% 0%');
    document.documentElement.style.setProperty('--pcnGreen', '#04f4be');
    document.documentElement.style.setProperty('--pcnGreen-200', 'rgb(4 244 190 / 0.2)');
  });
  afterEach(() => document.documentElement.removeAttribute('style'));

  it('paints every semantic token with its live value', () => {
    render(<SemanticSwatches />);

    expect(screen.getByText('--background')).toBeInTheDocument();
    expect(screen.getByText('hsl(0 0% 0%)')).toBeInTheDocument();
    expect(screen.getByText('--destructive')).toBeInTheDocument();
    // Tokens without a value yet show a placeholder
    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });

  it('paints the green scale with its CSS variables', () => {
    render(<GreenScale />);

    expect(screen.getByText('pcnGreen')).toBeInTheDocument();
    expect(screen.getByText('#04f4be')).toBeInTheDocument();
    expect(screen.getByText('pcnGreen-200')).toBeInTheDocument();
    expect(screen.getByText('rgb(4 244 190 / 0.2)')).toBeInTheDocument();
    expect(screen.getByText('acento puro #04f4be')).toBeInTheDocument();
  });
});
