import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const renderSheet = (side?: 'top' | 'bottom' | 'left' | 'right', defaultOpen = false) =>
  render(
    <Sheet defaultOpen={defaultOpen}>
      <SheetTrigger>menú</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Navegación</SheetTitle>
          <SheetDescription>Secciones del sitio</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>listo</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>,
  );

describe('Sheet', () => {
  it('opens from the trigger and closes with its close button', async () => {
    renderSheet();
    await userEvent.click(screen.getByRole('button', { name: 'menú' }));
    const dialog = screen.getByRole('dialog', { name: 'Navegación' });
    expect(dialog).toHaveAccessibleDescription('Secciones del sitio');
    expect(dialog.className).toContain('slide-in-from-right');

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each(['top', 'bottom', 'left'] as const)('slides in from the %s', (side) => {
    renderSheet(side, true);
    expect(screen.getByRole('dialog').className).toContain(`slide-in-from-${side}`);
  });
});
