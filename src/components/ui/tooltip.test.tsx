import { render, screen } from '@testing-library/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

describe('Tooltip', () => {
  it('shows its content when open', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>ayuda</TooltipTrigger>
          <TooltipContent className="extra">Texto de ayuda</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Texto de ayuda');
    expect(screen.getByRole('button', { name: 'ayuda' })).toBeInTheDocument();
  });

  it('renders only the trigger when closed', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>ayuda</TooltipTrigger>
          <TooltipContent>Texto de ayuda</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
