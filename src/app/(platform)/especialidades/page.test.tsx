import { render, screen } from '@testing-library/react';
import { SpecialtyCard } from '@/components/especialidades/specialty-card';
import { specialties, specialtyGroups } from '@/components/especialidades/specialties';
import { renderInPlatform } from '@/test/platform';
import Loading from './loading';
import SpecialtiesPage, { metadata } from './page';

jest.mock('@/components/especialidades/table-of-contents', () => ({
  TableOfContents: () => <nav aria-label="índice" />,
}));
jest.mock('@/components/especialidades/specialty-card', () => ({
  SpecialtyCard: jest.fn(({ specialty }) => <article>{specialty.id}</article>),
}));

describe('SpecialtiesPage', () => {
  beforeEach(() => renderInPlatform(<SpecialtiesPage />));

  it('counts the specialties and areas in the title', () => {
    expect(
      screen.getByText(`${specialties.length} especialidades · ${specialtyGroups.length} áreas`),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'índice' })).toBeInTheDocument();
  });

  it('renders a section per area with a card per specialty', () => {
    for (const group of specialtyGroups) {
      const heading = screen.getByRole('heading', { level: 2, name: new RegExp(group.title) });
      expect(heading).toHaveTextContent(`[${group.specialties.length}]`);
      expect(heading.closest('section')).toHaveAttribute('id', group.id);
    }
    expect(SpecialtyCard).toHaveBeenCalledTimes(specialties.length);
  });

  it('describes the page for social cards', () => {
    expect(metadata.openGraph).toMatchObject({
      title: 'Especialidades en ingeniería de software | programaConNosotros',
    });
  });
});

describe('especialidades route files', () => {
  it('renders a loading skeleton', () => {
    const { container } = render(<Loading />);
    expect(container.firstChild).not.toBeNull();
  });
});
