import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTestimonial } from '@/actions/testimonials/create-testimonial';
import { updateTestimonial } from '@/actions/testimonials/update-testimonial';
import { buildTestimonial, renderInPlatform } from '@/test/platform';
import { TestimonialsClientWrapper } from './testimonials-client-wrapper';

jest.mock('@/actions/testimonials/create-testimonial', () => ({ createTestimonial: jest.fn() }));
jest.mock('@/actions/testimonials/update-testimonial', () => ({ updateTestimonial: jest.fn() }));
jest.mock('@/actions/testimonials/delete-testimonial', () => ({ deleteTestimonial: jest.fn() }));
jest.mock('@/actions/testimonials/toggle-featured', () => ({ toggleFeatured: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const testimonials = [
  buildTestimonial({
    id: 'plain',
    body: 'Uno común y largo',
    user: { id: 'u1', name: 'Uno', image: null },
  }),
  buildTestimonial({
    id: 'star',
    body: 'Uno destacado y largo',
    featured: true,
    user: { id: 'u2', name: 'Dos', image: null },
  }),
  buildTestimonial({
    id: 'mine',
    body: 'El mío propio y largo',
    user: { id: 'me', name: 'Yo', image: null },
  }),
];

const order = () =>
  screen.getAllByText(/y largo$/).map((paragraph) => paragraph.textContent?.replace('> ', ''));

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('TestimonialsClientWrapper', () => {
  it('shows an empty state to visitors', () => {
    renderInPlatform(<TestimonialsClientWrapper testimonials={[]} />);

    expect(screen.getByText(/Aún no hay testimonios/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Testimonio/ })).not.toBeInTheDocument();
  });

  it('lists featured testimonials first for visitors', () => {
    renderInPlatform(<TestimonialsClientWrapper testimonials={testimonials} />);

    expect(screen.getByText('3 testimonios de la comunidad')).toBeInTheDocument();
    expect(order()).toEqual([
      'Uno destacado y largo',
      'Uno común y largo',
      'El mío propio y largo',
    ]);
  });

  it('puts the user own testimonial first and edits it from the header', async () => {
    (updateTestimonial as jest.Mock).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderInPlatform(
      <TestimonialsClientWrapper
        testimonials={testimonials}
        currentUserId="me"
        hasUserTestimonial
      />,
    );

    expect(order()[0]).toBe('El mío propio y largo');

    await user.click(screen.getByRole('button', { name: /editarTestimonio/ }));
    const dialog = screen.getByRole('dialog', { name: 'Editar testimonio' });
    expect(within(dialog).getByLabelText('Testimonio')).toHaveValue('El mío propio y largo');

    await user.click(within(dialog).getByRole('button', { name: /actualizar/ }));
    expect(updateTestimonial).toHaveBeenCalledWith('mine', { body: 'El mío propio y largo' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('creates a new testimonial from the header', async () => {
    (createTestimonial as jest.Mock).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderInPlatform(
      <TestimonialsClientWrapper testimonials={testimonials.slice(0, 2)} currentUserId="me" />,
    );

    await user.click(screen.getByRole('button', { name: /agregarTestimonio/ }));
    const dialog = screen.getByRole('dialog', { name: 'Nuevo testimonio' });
    await user.click(within(dialog).getByLabelText('Testimonio'));
    await user.paste('Me encantó la comunidad');
    await user.click(within(dialog).getByRole('button', { name: /crear/ }));

    expect(createTestimonial).toHaveBeenCalledWith({ body: 'Me encantó la comunidad' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens the editor from a card menu and cancels', async () => {
    const user = userEvent.setup();
    renderInPlatform(
      <TestimonialsClientWrapper testimonials={testimonials} currentUserId="me" isAdmin />,
    );

    const menus = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-haspopup') === 'menu');
    await user.click(menus[1]);
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }));

    const dialog = screen.getByRole('dialog', { name: 'Editar testimonio' });
    expect(within(dialog).getByLabelText('Testimonio')).toHaveValue('Uno destacado y largo');
    await user.click(within(dialog).getByRole('button', { name: /cancelar/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
