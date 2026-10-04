import { render } from '@testing-library/react';
import { AppSplash } from './app-splash';

describe('AppSplash', () => {
  it('renders the hidden launch screen with its CSS', () => {
    const { container } = render(<AppSplash />);
    const splash = container.querySelector('#pcn-splash');
    expect(splash).toHaveAttribute('aria-hidden', 'true');
    expect(splash).toHaveTextContent('~/pcn $ iniciando_');
    expect(container.querySelector('img')).toHaveAttribute('src', '/pwa-icon-192.png');
    expect(container.querySelector('style')?.innerHTML).toContain('display-mode:standalone');
  });
});
