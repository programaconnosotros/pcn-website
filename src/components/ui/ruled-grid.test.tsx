import { render, screen } from '@testing-library/react';
import { FullRowsCell, RuledGrid } from './ruled-grid';

describe('FullRowsCell', () => {
  it('wraps only the cells it hides somewhere, and leaves the rest as direct grid items', () => {
    render(
      <RuledGrid>
        {['a', 'b', 'c'].map((id, index) => (
          <FullRowsCell key={id} index={index} count={3} columns={{ sm: 2, lg: 3 }}>
            <p>{id}</p>
          </FullRowsCell>
        ))}
      </RuledGrid>,
    );
    expect(screen.getByText('a').parentElement).toHaveClass('grid border-t');
    expect(screen.getByText('c').parentElement).toHaveClass(
      'grid sm:max-md:hidden md:max-lg:hidden',
    );
  });
});
