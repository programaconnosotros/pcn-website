import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteTestimonial } from '@/actions/testimonials/delete-testimonial';
import { toggleFeatured } from '@/actions/testimonials/toggle-featured';
import { updateTestimonial } from '@/actions/testimonials/update-testimonial';
import { mockRouter } from '@/test/dom';
import { buildTestimonial } from '@/test/platform';
import { TestimonialDetailActions } from './testimonial-detail-actions';

jest.mock('@/actions/testimonials/create-testimonial', () => ({ createTestimonial: jest.fn() }));
jest.mock('@/actions/testimonials/update-testimonial', () => ({ updateTestimonial: jest.fn() }));
jest.mock('@/actions/testimonials/delete-testimonial', () => ({ deleteTestimonial: jest.fn() }));
jest.mock('@/actions/testimonials/toggle-featured', () => ({ toggleFeatured: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const testimonial = buildTestimonial({ body: 'Un testimonio bien largo' });

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('TestimonialDetailActions', () => {
  it('renders nothing for other members', () => {
    const { container } = render(
      <TestimonialDetailActions testimonial={testimonial} canEdit={false} isAdmin={false} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    [false, 'destacar();', 'Testimonio agregado a la home page'],
    [true, 'quitarDestacado();', 'Testimonio removido de la home page'],
  ])('lets admins toggle featured (featured=%s)', async (featured, button, message) => {
    (toggleFeatured as jest.Mock).mockResolvedValue(undefined);
    render(
      <TestimonialDetailActions
        testimonial={{ ...testimonial, featured }}
        canEdit={false}
        isAdmin
      />,
    );

    expect(screen.queryByRole('button', { name: /editar/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: button }));

    expect(toggleFeatured).toHaveBeenCalledWith('t1');
    expect(toast.success).toHaveBeenCalledWith(message);
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it.each([
    [new Error('Sin permiso'), 'Sin permiso'],
    [{}, 'Error al actualizar el testimonio'],
  ])('reports a failed toggle', async (error, message) => {
    (toggleFeatured as jest.Mock).mockRejectedValue(error);
    render(<TestimonialDetailActions testimonial={testimonial} canEdit={false} isAdmin />);

    await userEvent.click(screen.getByRole('button', { name: 'destacar();' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    expect(screen.getByRole('button', { name: 'destacar();' })).toBeEnabled();
  });

  it('edits the testimonial and refreshes', async () => {
    (updateTestimonial as jest.Mock).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TestimonialDetailActions testimonial={testimonial} canEdit isAdmin={false} />);

    await user.click(screen.getByRole('button', { name: /editar\(\);/ }));
    const dialog = screen.getByRole('dialog', { name: 'Editar testimonio' });
    await user.click(within(dialog).getByRole('button', { name: /actualizar/ }));

    expect(updateTestimonial).toHaveBeenCalledWith('t1', { body: 'Un testimonio bien largo' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it('closes the editor on cancel', async () => {
    const user = userEvent.setup();
    render(<TestimonialDetailActions testimonial={testimonial} canEdit isAdmin={false} />);

    await user.click(screen.getByRole('button', { name: /editar\(\);/ }));
    await user.click(screen.getByRole('button', { name: /cancelar/ }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deletes and goes back to the list', async () => {
    (deleteTestimonial as jest.Mock).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<TestimonialDetailActions testimonial={testimonial} canEdit isAdmin={false} />);

    await user.click(screen.getByRole('button', { name: /eliminar/ }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'eliminar();' }),
    );

    expect(deleteTestimonial).toHaveBeenCalledWith('t1');
    expect(toast.success).toHaveBeenCalledWith('Testimonio eliminado exitosamente');
    expect(mockRouter.push).toHaveBeenCalledWith('/testimonios');
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it.each([
    [new Error('No autorizado'), 'No autorizado'],
    [{}, 'Error al eliminar el testimonio'],
  ])('reports a failed delete', async (error, message) => {
    (deleteTestimonial as jest.Mock).mockRejectedValue(error);
    const user = userEvent.setup();
    render(<TestimonialDetailActions testimonial={testimonial} canEdit isAdmin={false} />);

    await user.click(screen.getByRole('button', { name: /eliminar/ }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'eliminar();' }),
    );

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
