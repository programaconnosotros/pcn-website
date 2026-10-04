import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'sonner';
import { createTestimonial } from '@/actions/testimonials/create-testimonial';
import { deleteTestimonial } from '@/actions/testimonials/delete-testimonial';
import { toggleFeatured } from '@/actions/testimonials/toggle-featured';
import { updateTestimonial } from '@/actions/testimonials/update-testimonial';
import { rateLimitDigest } from '@/lib/rate-limit-messages';
import { buildTestimonial } from '@/test/platform';
import { TestimonialActionButton } from './testimonial-action-button';
import { TestimonialCard } from './testimonial-card';
import { TestimonialForm } from './testimonial-form';

jest.mock('@/actions/testimonials/create-testimonial', () => ({ createTestimonial: jest.fn() }));
jest.mock('@/actions/testimonials/update-testimonial', () => ({ updateTestimonial: jest.fn() }));
jest.mock('@/actions/testimonials/delete-testimonial', () => ({ deleteTestimonial: jest.fn() }));
jest.mock('@/actions/testimonials/toggle-featured', () => ({ toggleFeatured: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const openMenu = async (user: UserEvent) => {
  const trigger = screen
    .getAllByRole('button')
    .find((button) => button.getAttribute('aria-haspopup') === 'menu')!;
  await user.click(trigger);
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('TestimonialActionButton', () => {
  it('adds or edits depending on whether the user has one', async () => {
    const onClick = jest.fn();
    const { rerender } = render(
      <TestimonialActionButton hasUserTestimonial={false} onClick={onClick} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /agregarTestimonio/ }));
    expect(onClick).toHaveBeenCalled();

    rerender(<TestimonialActionButton hasUserTestimonial onClick={onClick} />);
    expect(screen.getByRole('button', { name: /editarTestimonio/ })).toBeInTheDocument();
  });
});

describe('TestimonialCard', () => {
  it('shows a testimonial to visitors without actions', () => {
    render(<TestimonialCard testimonial={buildTestimonial()} onEdit={jest.fn()} />);

    expect(screen.getByText('La comunidad me ayudó muchísimo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ana López' })).toHaveAttribute(
      'href',
      '/perfil/user-1',
    );
    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.queryByText('(vos)')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('lets the author edit and delete their own', async () => {
    (deleteTestimonial as jest.Mock).mockResolvedValue(undefined);
    const onEdit = jest.fn();
    const testimonial = buildTestimonial();
    const user = userEvent.setup();
    render(<TestimonialCard testimonial={testimonial} currentUserId="user-1" onEdit={onEdit} />);

    expect(screen.getByText('(vos)')).toBeInTheDocument();
    await openMenu(user);
    expect(screen.queryByRole('menuitem', { name: /home page/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }));
    expect(onEdit).toHaveBeenCalledWith(testimonial);

    await openMenu(user);
    await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }));
    await user.click(screen.getByRole('button', { name: 'eliminar();' }));

    expect(deleteTestimonial).toHaveBeenCalledWith('t1');
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Testimonio eliminado exitosamente'),
    );
  });

  it.each([
    [new Error('No autorizado'), 'No autorizado'],
    [{}, 'Error al eliminar el testimonio'],
  ])('reports a failed delete', async (error, message) => {
    (deleteTestimonial as jest.Mock).mockRejectedValue(error);
    const user = userEvent.setup();
    render(
      <TestimonialCard
        testimonial={buildTestimonial()}
        currentUserId="user-1"
        onEdit={jest.fn()}
      />,
    );

    await openMenu(user);
    await user.click(screen.getByRole('menuitem', { name: 'Eliminar' }));
    await user.click(screen.getByRole('button', { name: 'eliminar();' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
  });

  it.each([
    [false, 'Mostrar en home page', 'Testimonio agregado a la home page'],
    [true, 'Remover de home page', 'Testimonio removido de la home page'],
  ])('lets admins toggle featured (featured=%s)', async (featured, item, message) => {
    (toggleFeatured as jest.Mock).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <TestimonialCard
        testimonial={buildTestimonial({ featured })}
        currentUserId="admin"
        isAdmin
        onEdit={jest.fn()}
      />,
    );

    await openMenu(user);
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: item }));

    expect(toggleFeatured).toHaveBeenCalledWith('t1');
    expect(toast.success).toHaveBeenCalledWith(message);
  });

  it.each([
    [new Error('Sin permiso'), 'Sin permiso'],
    [{}, 'Error al actualizar el testimonio'],
  ])('reports a failed featured toggle', async (error, message) => {
    (toggleFeatured as jest.Mock).mockRejectedValue(error);
    const user = userEvent.setup();
    render(<TestimonialCard testimonial={buildTestimonial()} isAdmin onEdit={jest.fn()} />);

    await openMenu(user);
    await user.click(screen.getByRole('menuitem', { name: 'Mostrar en home page' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
  });
});

describe('TestimonialForm', () => {
  const write = async (user: UserEvent, text: string) => {
    const textarea = screen.getByLabelText('Testimonio');
    await user.clear(textarea);
    await user.click(textarea);
    await user.paste(text);
  };

  it('validates the minimum length', async () => {
    const user = userEvent.setup();
    render(<TestimonialForm onCancel={jest.fn()} onSuccess={jest.fn()} />);

    await write(user, 'corto');
    await user.click(screen.getByRole('button', { name: /crear\(\);/ }));

    expect(
      await screen.findByText('El testimonio debe tener al menos 10 caracteres'),
    ).toBeInTheDocument();
    expect(createTestimonial).not.toHaveBeenCalled();
  });

  it('creates a testimonial', async () => {
    (createTestimonial as jest.Mock).mockResolvedValue(undefined);
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<TestimonialForm onCancel={jest.fn()} onSuccess={onSuccess} />);

    expect(screen.queryByRole('button', { name: /eliminar/ })).not.toBeInTheDocument();
    await write(user, 'Una experiencia genial');
    await user.click(screen.getByRole('button', { name: /crear\(\);/ }));

    expect(createTestimonial).toHaveBeenCalledWith({ body: 'Una experiencia genial' });
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Testimonio creado exitosamente');
  });

  it('updates an existing testimonial and cancels', async () => {
    (updateTestimonial as jest.Mock).mockResolvedValue(undefined);
    const onSuccess = jest.fn();
    const onCancel = jest.fn();
    const user = userEvent.setup();
    render(
      <TestimonialForm
        testimonialId="t1"
        defaultValues={{ body: 'Texto anterior largo' }}
        onCancel={onCancel}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByLabelText('Testimonio')).toHaveValue('Texto anterior largo');
    await write(user, 'Texto nuevo y largo');
    await user.click(screen.getByRole('button', { name: /actualizar\(\);/ }));

    expect(updateTestimonial).toHaveBeenCalledWith('t1', { body: 'Texto nuevo y largo' });
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Testimonio actualizado exitosamente');

    await user.click(screen.getByRole('button', { name: /cancelar/ }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('deletes after confirming', async () => {
    (deleteTestimonial as jest.Mock).mockResolvedValue(undefined);
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(
      <TestimonialForm
        testimonialId="t1"
        defaultValues={{ body: 'Texto anterior largo' }}
        onCancel={jest.fn()}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole('button', { name: /eliminar/ }));
    expect(screen.getByRole('alertdialog', { name: '¿Estás seguro?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'eliminar();' }));

    expect(deleteTestimonial).toHaveBeenCalledWith('t1');
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Testimonio eliminado exitosamente');
  });

  it('reports a failed delete and stays', async () => {
    (deleteTestimonial as jest.Mock).mockRejectedValue(
      Object.assign(new Error('x'), { digest: rateLimitDigest('createContent', 60) }),
    );
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(
      <TestimonialForm
        testimonialId="t1"
        defaultValues={{ body: 'Texto anterior largo' }}
        onCancel={jest.fn()}
        onSuccess={onSuccess}
      />,
    );

    await user.click(screen.getByRole('button', { name: /eliminar/ }));
    await user.click(screen.getByRole('button', { name: 'eliminar();' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('1 minuto')),
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('handles a failed save without an unhandled rejection', async () => {
    (createTestimonial as jest.Mock).mockRejectedValue(new Error('falló'));
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<TestimonialForm onCancel={jest.fn()} onSuccess={onSuccess} />);

    await write(user, 'Una experiencia genial');
    await user.click(screen.getByRole('button', { name: /crear\(\);/ }));

    await waitFor(() => expect(screen.getByRole('button', { name: /crear\(\);/ })).toBeEnabled());
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
