import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible';

describe('Collapsible', () => {
  it('toggles its content', async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>más</CollapsibleTrigger>
        <CollapsibleContent>detalle</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'más' });
    expect(screen.queryByText('detalle')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('detalle')).toBeVisible();
  });
});
