import { render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { ThemeProvider } from './theme-provider';

const CurrentTheme = () => <p>{useTheme().forcedTheme ?? 'none'}</p>;

describe('ThemeProvider', () => {
  it('passes its props to next-themes and renders its children', () => {
    render(
      <ThemeProvider attribute="class" forcedTheme="dark">
        <CurrentTheme />
      </ThemeProvider>,
    );
    expect(screen.getByText('dark')).toBeInTheDocument();
  });
});
