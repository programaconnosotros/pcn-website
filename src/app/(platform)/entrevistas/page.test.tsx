import { render } from '@testing-library/react';
import { InterviewSimulator } from '@/components/interviews/interview-simulator';
import { interviewGuides } from './guias/guides';
import Loading from './loading';
import EntrevistasPage, { metadata } from './page';

jest.mock('@/components/interviews/interview-simulator', () => ({
  InterviewSimulator: jest.fn(() => <div data-testid="simulator" />),
}));

const simulatorProps = () => jest.mocked(InterviewSimulator).mock.calls.at(-1)![0];

const renderPage = async (tipo?: string | string[]) =>
  render(await EntrevistasPage({ searchParams: Promise.resolve({ tipo }) }));

describe('EntrevistasPage', () => {
  it('passes a string ?tipo= to the simulator', async () => {
    const { getByTestId } = await renderPage('react');
    expect(getByTestId('simulator')).toBeInTheDocument();
    expect(simulatorProps().tipo).toBe('react');
  });

  it('ignores a missing or repeated ?tipo=', async () => {
    await renderPage();
    expect(simulatorProps().tipo).toBeUndefined();
    await renderPage(['react', 'node']);
    expect(simulatorProps().tipo).toBeUndefined();
  });

  it('sends only the section ids of every guide to the client', async () => {
    await renderPage();
    const { guideSections } = simulatorProps();
    expect(Object.keys(guideSections).sort()).toEqual(Object.keys(interviewGuides).sort());
    expect(guideSections.react).toEqual(interviewGuides.react.sections.map(({ id }) => id));
  });

  it('describes the page for search and social cards', () => {
    expect(metadata.description).toMatch(/Simulá entrevistas técnicas/);
    expect(metadata.openGraph).toMatchObject({
      title: 'Entrevistas | programaConNosotros',
      url: expect.stringMatching(/\/entrevistas$/),
    });
  });
});

describe('entrevistas route files', () => {
  it('renders a loading skeleton', () => {
    const { container } = render(<Loading />);
    expect(container.firstChild).not.toBeNull();
  });
});
