import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageFilter, matchesLanguage } from './language-filter';

describe('matchesLanguage', () => {
  it('matches everything with todos and only the language otherwise', () => {
    expect(matchesLanguage('es', 'todos')).toBe(true);
    expect(matchesLanguage('en', 'en')).toBe(true);
    expect(matchesLanguage('es', 'en')).toBe(false);
  });
});

describe('LanguageFilter', () => {
  it('marks the selected option and reports clicks', async () => {
    const onChange = jest.fn();
    render(<LanguageFilter value="es" onChange={onChange} />);

    expect(screen.getByRole('group', { name: 'Filtrar por idioma' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'es' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'todos' })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(screen.getByRole('button', { name: 'en' }));
    expect(onChange).toHaveBeenCalledWith('en');
  });
});
