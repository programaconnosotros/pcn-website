import { screen } from '@testing-library/react';
import { LiveCodingPractice } from '@/components/interviews/live-coding-practice';
import { renderInPlatform } from '@/test/platform';
import { reactPractice } from './exercises/react';
import LiveCodingPage, { metadata } from './page';

jest.mock('@/components/interviews/live-coding-practice', () => ({
  LiveCodingPractice: jest.fn(() => <div data-testid="practice" />),
}));

const renderPage = async (searchParams: { tecnologia?: string; seniority?: string } = {}) =>
  renderInPlatform(await LiveCodingPage({ searchParams: Promise.resolve(searchParams) }));

const option = (name: string) => screen.getByRole('link', { name: new RegExp(`^\\[.\\] ${name}`) });

describe('LiveCodingPage', () => {
  it('asks for both choices when nothing is selected', async () => {
    await renderPage();
    expect(screen.getByText(/elegí la tecnología y la seniority/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'leé la guía' })).toHaveAttribute(
      'href',
      '/entrevistas/guias/live-coding',
    );
    expect(option('Junior')).toHaveAttribute('href', '/entrevistas/live-coding?seniority=junior');
    expect(LiveCodingPractice).not.toHaveBeenCalled();
  });

  it('offers only technologies that have live coding practice', async () => {
    await renderPage();
    expect(screen.queryByRole('link', { name: /Project management/i })).not.toBeInTheDocument();
  });

  it('asks for the seniority once a technology is chosen and keeps it in the links', async () => {
    await renderPage({ tecnologia: 'react' });
    expect(screen.getByText(/elegí la seniority/)).toBeInTheDocument();
    expect(option('Senior')).toHaveAttribute(
      'href',
      '/entrevistas/live-coding?tecnologia=react&seniority=senior',
    );
    expect(screen.getAllByRole('link', { current: true })).toHaveLength(1);
  });

  it('asks for the technology once a seniority is chosen', async () => {
    await renderPage({ seniority: 'senior' });
    expect(screen.getByText(/elegí la tecnología para/)).toBeInTheDocument();
    expect(option('Senior')).toHaveAttribute('aria-current', 'true');
  });

  it('ignores unknown choices', async () => {
    await renderPage({ tecnologia: 'cobol', seniority: 'guru' });
    expect(screen.getByText(/elegí la tecnología y la seniority/)).toBeInTheDocument();
    expect(screen.queryAllByRole('link', { current: true })).toHaveLength(0);
  });

  it('shows the exercises for the chosen technology and seniority', async () => {
    await renderPage({ tecnologia: 'react', seniority: 'junior' });
    expect(screen.getByTestId('practice')).toBeInTheDocument();
    expect(jest.mocked(LiveCodingPractice).mock.calls[0][0]).toMatchObject({
      track: 'react',
      seniorityLabel: 'Junior',
      exercises: reactPractice.exercises.junior,
      leetcode: reactPractice.leetcode.junior,
    });
  });

  it('describes the page for social cards', () => {
    expect(metadata.openGraph).toMatchObject({ title: 'Live coding | programaConNosotros' });
  });
});
