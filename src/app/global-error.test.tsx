import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FATAL_TAB_TITLE } from '@/lib/tab-title';
import GlobalError from './global-error';

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('GlobalError', () => {
  it('replaces the document with the kernel panic screen and reboots', async () => {
    const reset = jest.fn();
    render(<GlobalError error={new Error('root')} reset={reset} />, { container: document });

    expect(document.title).toBe(FATAL_TAB_TITLE);
    expect(document.documentElement).toHaveAttribute('lang', 'es');
    expect(
      screen.getByText('Kernel panic - not syncing: el sitio no pudo arrancar.'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /reiniciar/ }));
    expect(reset).toHaveBeenCalled();
  });
});
