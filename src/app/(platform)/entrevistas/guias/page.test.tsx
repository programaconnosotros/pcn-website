import { screen } from '@testing-library/react';
import { InterviewGuidesList } from '@/components/interviews/interview-guides-list';
import { endpointCourses } from '@/data/recommended-courses';
import { renderInPlatform } from '@/test/platform';
import { TRACKS } from '../questions/types';
import { crossTrackGuides } from './guides';
import GuiasPage, { metadata } from './page';

jest.mock('@/components/interviews/interview-guides-list', () => ({
  InterviewGuidesList: jest.fn(() => <div data-testid="guides" />),
}));

const listProps = () => jest.mocked(InterviewGuidesList).mock.calls.at(-1)![0];

describe('GuiasPage', () => {
  beforeEach(() => renderInPlatform(<GuiasPage />));

  it('lists the cross-track guides first, pointing at live coding practice', () => {
    const [first] = listProps().groups;
    expect(first.label).toBe('Para cualquier entrevista');
    expect(first.guides.map(({ track }) => track)).toEqual(crossTrackGuides.map(({ id }) => id));
    expect(first.cta?.href).toBe('/entrevistas/live-coding');
  });

  it('groups every track guide exactly once, areas with several technologies apart', () => {
    const { groups, courses } = listProps();
    const trackGroups = groups.slice(1);
    const tracks = trackGroups.flatMap((group) => group.guides.map(({ track }) => track));
    expect(tracks.sort()).toEqual(TRACKS.map(({ id }) => id).sort());
    expect(trackGroups.at(-1)!.label).toBe('Más áreas');
    // Multi-technology areas (e.g. Frontend) get their own group with more than one guide.
    const frontend = trackGroups.find((group) => group.label === 'Frontend');
    expect(frontend!.guides.length).toBeGreaterThan(1);
    expect(frontend!.cta?.href).toBe('/entrevistas');
    expect(courses).toBe(endpointCourses);
  });

  it('counts guides and sections in the title', () => {
    const { groups } = listProps();
    const guides = groups.flatMap((group) => group.guides);
    const sections = guides.reduce((count, guide) => count + guide.sectionIds.length, 0);
    expect(screen.getByText(`${guides.length} guías · ${sections} secciones`)).toBeInTheDocument();
    expect(screen.getByTestId('guides')).toBeInTheDocument();
  });

  it('describes the page for social cards', () => {
    expect(metadata.openGraph).toMatchObject({
      title: 'Guías de preparación para entrevistas | programaConNosotros',
      url: expect.stringMatching(/\/entrevistas\/guias$/),
    });
  });
});
