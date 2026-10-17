import { render, screen } from '@testing-library/react';
import { setLocation } from '@/test/dom';
import { NotFoundScreen } from './not-found-screen';
import { TerminalErrorScreen } from './terminal-error-screen';

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('TerminalErrorScreen', () => {
  it('prints the command, output, code, action and suggestions', () => {
    render(
      <TerminalErrorScreen
        code="418"
        command="brew coffee"
        output={['soy una tetera', 'segunda línea']}
        action={<button type="button">acción</button>}
      />,
    );

    expect(screen.getByText('brew coffee')).toBeInTheDocument();
    expect(screen.getByText('soy una tetera')).toBeInTheDocument();
    expect(screen.getByText('segunda línea')).toBeInTheDocument();
    expect(screen.getByText('[exit 418]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'acción' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cd ~\/eventos/ })).toHaveAttribute('href', '/eventos');
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });
});

describe('NotFoundScreen', () => {
  it('shows the missing path as a failed cd', () => {
    setLocation('/no-existe');
    render(<NotFoundScreen />);

    expect(screen.getByText('cd /no-existe')).toBeInTheDocument();
    expect(screen.getByText('bash: cd: /no-existe: No such file or directory')).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
