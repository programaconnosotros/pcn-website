import { render, screen } from '@testing-library/react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

describe('Avatar', () => {
  it('shows the fallback while the image has not loaded', () => {
    render(
      <Avatar className="size-8" data-testid="avatar">
        <AvatarImage src="/foto.png" alt="Ada" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByTestId('avatar')).toHaveClass('size-8');
    expect(screen.getByText('AL')).toBeInTheDocument();
    // jsdom never loads images, so Radix keeps the image out of the DOM.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
