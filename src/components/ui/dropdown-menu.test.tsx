import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';

describe('DropdownMenu', () => {
  it('opens from its trigger', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>abrir</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Perfil</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'abrir' }));
    expect(screen.getByRole('menuitem', { name: 'Perfil' })).toBeInTheDocument();
  });

  it('renders every kind of item and selects one', async () => {
    const onSelect = jest.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>abrir</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem inset onSelect={onSelect}>
              Perfil
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuCheckboxItem checked>Notificaciones</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="es">
            <DropdownMenuRadioItem value="es">Español</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger inset>Más</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Ayuda</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByText('Cuenta')).toHaveClass('pl-8');
    expect(screen.getByText('⌘P')).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Notificaciones' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitemradio', { name: 'Español' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitem', { name: 'Más' })).toHaveClass('pl-8');
    expect(screen.getByRole('menuitem', { name: 'Ayuda' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('menuitem', { name: /Perfil/ }));
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByText('Cuenta')).not.toBeInTheDocument();
  });
});
