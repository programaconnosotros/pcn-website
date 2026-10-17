import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Course } from '@/app/(platform)/cursos/courses';
import type { Article } from '@/app/(platform)/lectura/articles';
import { jsonResponse, renderInPlatform } from '@/test/platform';
import { CoursePlayer } from './course-player';
import { CourseRow } from './course-row';
import { CoursesBrowser } from './courses-browser';
import { RelatedArticles } from './related-articles';

const course = (overrides: Partial<Course>): Course => ({
  id: 'c',
  name: 'Curso',
  description: 'Descripción',
  teachedBy: 'Alguien',
  acceptDonations: false,
  isMadeByCommunity: false,
  date: new Date('2024-01-01'),
  ...overrides,
});

const courses = [
  course({
    id: 'git',
    name: 'Git & GitHub',
    logo: '/software-logos/github.webp',
    youtubeUrls: ['https://youtube.com/embed/1', 'https://youtube.com/embed/2'],
    isMadeByCommunity: true,
    teachedBy: 'Agustín',
    hours: 3,
  }),
  course({
    id: 'latex',
    name: 'LaTeX',
    youtubeUrls: ['https://youtube.com/embed/3'],
    isMadeByCommunity: true,
  }),
  course({
    id: 'cs50',
    name: 'CS50',
    websiteUrl: 'https://www.cs50.harvard.edu/x',
    teachedBy: 'Harvard',
  }),
];

const sectionTitles = () =>
  Array.from(document.querySelectorAll('section h2'), (heading) => heading.textContent);
const courseNames = () =>
  Array.from(document.querySelectorAll('h3'), (h) => h.firstChild?.textContent);

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('CourseRow', () => {
  it('links community courses to their page with video stats', () => {
    render(<CourseRow course={courses[0]} index={0} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cursos/git');
    expect(link).toHaveTextContent('2 videos');
    expect(link).toHaveTextContent('· 3h');
    expect(link).toHaveTextContent('pcn');
    expect(screen.getByRole('img', { name: 'Logo de Git & GitHub' })).toBeInTheDocument();
  });

  it('opens external courses in a new tab', () => {
    render(<CourseRow course={courses[2]} index={9} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://www.cs50.harvard.edu/x');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveTextContent('cs50.harvard.edu');
    expect(link).toHaveTextContent('10');
  });

  it('counts a single video', () => {
    render(<CourseRow course={courses[1]} index={0} />);

    expect(screen.getByRole('link')).toHaveTextContent('1 video');
  });
});

describe('CoursesBrowser', () => {
  it('groups courses and shows totals', () => {
    renderInPlatform(<CoursesBrowser header={<h1>cursos</h1>} courses={courses} />);

    expect(sectionTitles().map((title) => title?.replace(/\s+/g, ' '))).toEqual([
      '#hechos en pcn(2)',
      '#recomendados(1)',
    ]);
    expect(screen.getByText('3h')).toBeInTheDocument();
    expect(courseNames()).toEqual(['Git & GitHub', 'LaTeX', 'CS50']);
  });

  it('filters by flag and searches without accents', async () => {
    const user = userEvent.setup();
    renderInPlatform(<CoursesBrowser header={null} courses={courses} />);

    await user.click(screen.getByRole('button', { name: /--web/ }));
    expect(courseNames()).toEqual(['CS50']);
    await user.click(screen.getByRole('button', { name: /--video/ }));
    expect(courseNames()).toEqual(['Git & GitHub', 'LaTeX']);
    await user.click(screen.getByRole('button', { name: /--pcn/ }));
    expect(courseNames()).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: /--all/ }));

    await user.type(screen.getByRole('textbox', { name: 'Buscar cursos' }), 'agustin');
    expect(courseNames()).toEqual(['Git & GitHub']);
  });

  it('clears the filters when nothing matches', async () => {
    const user = userEvent.setup();
    renderInPlatform(<CoursesBrowser header={null} courses={courses} />);

    await user.click(screen.getByRole('button', { name: /--web/ }));
    await user.type(screen.getByRole('textbox', { name: 'Buscar cursos' }), 'git');
    expect(screen.getByText(/grep: sin resultados para/)).toHaveTextContent('"git"');

    await user.click(screen.getByRole('button', { name: 'limpiar filtros' }));
    expect(courseNames()).toHaveLength(3);
    expect(screen.getByRole('button', { name: /--all/ })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('CoursePlayer', () => {
  it('plays a single video without a playlist', () => {
    render(
      <CoursePlayer videoUrls={['https://youtube.com/embed/1']}>
        <p>info</p>
      </CoursePlayer>,
    );

    expect(screen.getByTitle('YouTube video player')).toHaveAttribute(
      'src',
      'https://youtube.com/embed/1',
    );
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('switches between the classes of a playlist', async () => {
    render(
      <CoursePlayer videoUrls={['https://youtube.com/embed/1', 'https://youtube.com/embed/2']}>
        <p>info</p>
      </CoursePlayer>,
    );

    expect(screen.getByTitle('Clase 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /clase 02/ }));

    expect(screen.getByTitle('Clase 2')).toHaveAttribute('src', 'https://youtube.com/embed/2');
    expect(screen.getByRole('button', { name: /clase 02/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByText(/clases · 2\/2/)).toBeInTheDocument();
  });
});

describe('RelatedArticles', () => {
  const article: Article = {
    id: 'a1',
    title: 'Loop Engineering',
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'ia',
    description: 'Sobre loops',
    url: 'https://addyosmani.com/blog/loop',
    avatar: '/avatars/addy.png',
    date: '2025-03-05',
    language: 'en' as Article['language'],
  };

  it('lists articles with their date and opens them in the reader', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ embeddable: false }));
    const user = userEvent.setup();
    renderInPlatform(<RelatedArticles articles={[article]} showDate avatars={{ a1: '/me.png' }} />);

    expect(document.querySelector('time[datetime="2025-03-05"]')).toHaveTextContent(/5.*mar.*2025/);
    expect(screen.getByText('AD')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Loop Engineering/ }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Addy Osmani · addyosmani.com')).toBeInTheDocument();
    expect(await within(dialog).findByText(/no permite mostrarse embebido/)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/lectura/embed?url=${encodeURIComponent(article.url)}`,
    );

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hides the date by default', () => {
    renderInPlatform(<RelatedArticles articles={[article]} />);

    expect(document.querySelector('time')).toBeNull();
  });
});
