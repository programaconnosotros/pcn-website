import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';
import { Textarea } from './textarea';
import { FormSection } from './form-section';
import { formActionBarClassName, dialogFormActionBarClassName } from './form-action-bar';
import { checkboxClassName } from './field-surface';

const NameForm = ({ hint }: { hint?: string }) => {
  const form = useForm<{ name: string }>({ defaultValues: { name: '' } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="name"
          rules={{ required: 'El nombre es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Como te conocen</FormDescription>
              <FormMessage>{hint}</FormMessage>
            </FormItem>
          )}
        />
        <button type="submit">guardar</button>
      </form>
    </Form>
  );
};

describe('Form', () => {
  it('links the label, description and control', () => {
    render(<NameForm />);
    const input = screen.getByRole('textbox', { name: 'Nombre' });
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAccessibleDescription('Como te conocen');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a plain hint as the message when there is no error', () => {
    render(<NameForm hint="opcional" />);
    expect(screen.getByText('opcional')).toBeInTheDocument();
    expect(screen.queryByText('ERR')).toBeNull();
  });

  it('announces validation errors and marks the field invalid', async () => {
    render(<NameForm hint="opcional" />);
    await userEvent.click(screen.getByRole('button', { name: 'guardar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('ERREl nombre es obligatorio');
    const input = screen.getByRole('textbox', { name: /Nombre/ });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Como te conocen El nombre es obligatorio');
    expect(screen.getByText('Nombre')).toHaveClass('text-destructive');
  });
});

describe('Input and Textarea', () => {
  it('renders email inputs as text with the email keyboard', () => {
    render(<Input type="email" aria-label="correo" />);
    const input = screen.getByRole('textbox', { name: 'correo' });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toHaveAttribute('spellcheck', 'false');
    expect(input).toHaveClass('field-surface');
  });

  it('keeps other types as they are', () => {
    render(
      <>
        <Input type="number" aria-label="edad" />
        <Textarea aria-label="bio" className="h-40" />
      </>,
    );
    expect(screen.getByRole('spinbutton', { name: 'edad' })).not.toHaveAttribute('spellcheck');
    expect(screen.getByRole('textbox', { name: 'bio' })).toHaveClass('field-surface', 'h-40');
    expect(checkboxClassName).toBe('field-check');
  });
});

describe('FormSection', () => {
  it('shows its index, description and progress', () => {
    render(
      <FormSection id="datos" index={1} title="datos" description="lo básico" done={2} total={2}>
        <p>campos</p>
      </FormSection>,
    );
    expect(screen.getByRole('heading', { name: /\[01\] datos/ })).toHaveTextContent('// lo básico');
    expect(screen.getByText('2/2')).toHaveClass('text-pcnGreen');
    expect(screen.getByText('campos')).toBeInTheDocument();
  });

  it('marks optional sections and hides the counter without a total', () => {
    const { rerender } = render(
      <FormSection id="x" index={12} title="extra" done={0} total={3} optional>
        -
      </FormSection>,
    );
    expect(screen.getByText('opcional ·')).toBeInTheDocument();
    expect(screen.getByText(/0\/3/)).toHaveClass('text-muted-foreground');
    rerender(
      <FormSection id="x" index={12} title="extra">
        -
      </FormSection>,
    );
    expect(screen.queryByText(/\//)).toBeNull();
  });

  it('exports the sticky action bar styles', () => {
    expect(formActionBarClassName).toContain('sticky');
    expect(dialogFormActionBarClassName).toContain('sticky');
  });
});
