import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderInPlatform } from '@/test/platform';
import { renderTerminalCard } from '@/lib/og/terminal-card';
import { CoursesBrowser } from '@/components/courses/courses-browser';
import { CoursePlayer } from '@/components/courses/course-player';
import { CourseRow } from '@/components/courses/course-row';
import { RelatedArticles } from '@/components/courses/related-articles';
import { communityCourses, externalCourses } from './courses';
import Courses, { metadata } from './page';
import Loading from './loading';
import Course, { generateMetadata } from './[courseId]/page';
import CourseLoading from './[courseId]/loading';
import CourseImage from './[courseId]/opengraph-image';

jest.mock('@/lib/og/terminal-card', () => ({
  OG_SIZE: { width: 1200, height: 630 },
  OG_CONTENT_TYPE: 'image/png',
  renderTerminalCard: jest.fn(() => 'terminal-card'),
}));
jest.mock('@/components/courses/courses-browser', () => ({
  CoursesBrowser: jest.fn(({ header }: { header: ReactNode }) => <div>{header}</div>),
}));
jest.mock('@/components/courses/course-player', () => ({
  CoursePlayer: jest.fn(({ children }: { children: ReactNode }) => (
    <div data-testid="player">{children}</div>
  )),
}));
jest.mock('@/components/courses/course-row', () => ({
  CourseRow: jest.fn(({ course }: { course: { name: string } }) => <p>row {course.name}</p>),
}));
jest.mock('@/components/courses/related-articles', () => ({
  RelatedArticles: jest.fn(() => null),
}));

const params = (courseId: string) => ({ params: Promise.resolve({ courseId }) });
const community = communityCourses.find((course) => course.youtubeUrls?.length)!;
const external = externalCourses.find((course) => course.youtubeUrls?.length)!;
const website = externalCourses.find((course) => course.websiteUrl)!;

describe('/cursos', () => {
  it('lists every community and external course', () => {
    renderInPlatform(<Courses />);
    expect(jest.mocked(CoursesBrowser).mock.calls[0][0].courses).toEqual([
      ...communityCourses,
      ...externalCourses,
    ]);
    expect(screen.getByText(/curados por la comunidad/)).toBeInTheDocument();
    expect(metadata.title).toBe('ls ~/cursos');
  });

  it('renders the loading skeletons', () => {
    expect(renderInPlatform(<Loading />).container.firstChild).not.toBeNull();
    expect(renderInPlatform(<CourseLoading />).container.firstChild).not.toBeNull();
  });
});

describe('/cursos/[courseId]', () => {
  it('titles a missing course as not found', async () => {
    expect(await generateMetadata(params('nope'))).toEqual({
      title: { absolute: '404: no such file or directory' },
      description: 'El curso que buscas no existe.',
    });
  });

  it('describes the course, truncating long descriptions', async () => {
    const meta = await generateMetadata(params(community.id));
    expect(meta.openGraph).toMatchObject({
      title: `${community.name} | programaConNosotros`,
      url: expect.stringMatching(new RegExp(`/cursos/${community.id}$`)),
    });
    expect(String(meta.title)).toMatch(/^cat ~\/cursos\//);
    const expected =
      community.description.length > 160
        ? community.description.slice(0, 157) + '…'
        : community.description;
    expect(meta.description).toBe(expected);

    const short = [...communityCourses, ...externalCourses].find(
      (course) => course.description.length <= 160,
    );
    if (short)
      expect((await generateMetadata(params(short.id))).description).toBe(short.description);
  });

  it('says when the course does not exist', async () => {
    renderInPlatform(await Course(params('nope')));
    expect(screen.getByText('El curso no existe.')).toBeInTheDocument();
  });

  it('plays a community course without the disclaimer', async () => {
    renderInPlatform(await Course(params(community.id)));

    expect(jest.mocked(CoursePlayer).mock.calls[0][0].videoUrls).toEqual(community.youtubeUrls);
    expect(screen.getByText('pcn')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${community.hours}h · hecho en pcn`))).toBeInTheDocument();
    expect(screen.queryByText(/no fue creado por un miembro/)).not.toBeInTheDocument();
  });

  it('credits the author of an external course', async () => {
    renderInPlatform(await Course(params(external.id)));
    expect(screen.getByText(/no fue creado por un miembro/)).toBeInTheDocument();
    expect(screen.queryByText('pcn')).not.toBeInTheDocument();
  });

  it('links to an interactive course on its website', async () => {
    renderInPlatform(await Course(params(website.id)));
    expect(CoursePlayer).not.toHaveBeenCalled();
    expect(screen.getByText('interactivo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /irAlCurso/ })).toHaveAttribute(
      'href',
      website.websiteUrl,
    );
  });

  it('suggests three other courses and three articles', async () => {
    renderInPlatform(await Course(params(community.id)));
    const related = jest.mocked(CourseRow).mock.calls.map(([props]) => props.course.id);
    expect(related).toHaveLength(3);
    expect(related).not.toContain(community.id);
    expect(jest.mocked(RelatedArticles).mock.calls[0][0].articles).toHaveLength(3);
  });

  describe('social card', () => {
    const card = () => jest.mocked(renderTerminalCard).mock.calls.at(-1)![0];

    it('shows the course, who made it and its hours', async () => {
      await CourseImage(params(community.id));
      expect(card()).toEqual({
        path: `cursos/${community.id}`,
        command: 'cat curso.md',
        title: community.name,
        description: community.description,
        meta: ['hecho por la comunidad', `por ${community.teachedBy}`, `${community.hours} horas`],
      });
    });

    it('marks external courses as recommended and skips missing hours', async () => {
      await CourseImage(params(website.id));
      expect(card().meta).toEqual(['recomendado', `por ${website.teachedBy}`]);
    });

    it('falls back for a missing course', async () => {
      await CourseImage(params('nope'));
      expect(card()).toMatchObject({ title: 'Cursos', description: undefined, meta: [] });
    });
  });
});
