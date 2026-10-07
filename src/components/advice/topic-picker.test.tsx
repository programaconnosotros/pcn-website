import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ConsejoTopicsProvider, TopicPicker } from './topic-picker';

const Picker = ({ initial = [] as string[] }) => {
  const [value, setValue] = useState(initial);
  return (
    <ConsejoTopicsProvider topics={['carrera', 'ia', 'rust']}>
      <TopicPicker value={value} onChange={setValue} />
    </ConsejoTopicsProvider>
  );
};

describe('TopicPicker', () => {
  it('toggles suggested categories and creates new ones as slugs', async () => {
    const user = userEvent.setup();
    render(<Picker />);

    await user.click(screen.getByRole('button', { name: '#rust' }));
    expect(screen.getByRole('button', { name: '#rust' })).toHaveAttribute('aria-pressed', 'true');
    await user.type(screen.getByRole('textbox', { name: 'Nueva categoría' }), 'Bases de Datos');
    await user.click(screen.getByRole('button', { name: /crear/ }));
    expect(screen.getByRole('button', { name: '#bases-de-datos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('2/3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '#rust' }));
    expect(screen.getByRole('button', { name: '#rust' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('stops at three categories and ignores names too short to be one', async () => {
    const user = userEvent.setup();
    render(<Picker initial={['carrera', 'ia']} />);

    const input = screen.getByRole('textbox', { name: 'Nueva categoría' });
    await user.type(input, '¡{Enter}');
    expect(screen.getByText('2/3')).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'go{Enter}');
    expect(screen.getByText('3/3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '#rust' })).toBeDisabled();
    expect(input).toBeDisabled();
  });
});
