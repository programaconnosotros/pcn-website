import { render, screen } from '@testing-library/react';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { ExtractedTestimonials } from './extracted-testimonials';

const source = {
  title: 'Meetup de fin de año',
  date: '2025-12-30',
  hash: 'abc1234',
  href: '/conversaciones?c=abc1234',
};
const linked = {
  id: 'auto-1',
  body: 'Agradeció al grupo.',
  user: { id: 'u1', name: 'Ana', image: null },
  source,
};
const unlinked = {
  id: 'auto-2',
  body: 'Contó que aprendió mucho.',
  user: { id: null, name: 'Juan WA', image: null },
  source,
};

describe('ExtractedTestimonials', () => {
  it('credits each one and links its conversation', () => {
    render(<ExtractedTestimonials testimonials={[linked, unlinked]} />);
    expect(screen.getByText(/de las conversaciones · 2/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '@Ana' })).toHaveAttribute('href', '/perfil/u1');
    expect(
      screen.getByTitle('Todavía no vinculado a un perfil de la plataforma'),
    ).toHaveTextContent('@Juan WA');
    expect(screen.getAllByRole('link', { name: '~/conversaciones/abc1234' })[0]).toHaveAttribute(
      'href',
      source.href,
    );
  });

  it('renders nothing without testimonials', () => {
    const { container } = render(<ExtractedTestimonials testimonials={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('TestimonialsSection with extracted testimonials', () => {
  it('marks the extracted ones as auto, linking their conversation', () => {
    render(
      <TestimonialsSection
        testimonials={[
          { id: 't1', body: 'Escrito en el sitio', user: { id: 'u2', name: 'Bea', image: null } },
          linked,
        ]}
      />,
    );
    const auto = screen.getAllByRole('link', { name: 'auto' });
    expect(auto).toHaveLength(1);
    expect(auto[0]).toHaveAttribute('href', source.href);
  });
});
